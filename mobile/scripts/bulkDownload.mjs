import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Read exercise database
const exerciseDbPath = './src/data/exerciseDatabase.ts';
const exerciseDbContent = fs.readFileSync(exerciseDbPath, 'utf8');

// Extract GIF URLs using regex
const gifUrlRegex = /gifUrl:\s*'([^']+)'/g;
const exerciseIdRegex = /id:\s*'([^']+)'/g;

function extractExerciseData() {
  const exercises = [];
  const lines = exerciseDbContent.split('\n');
  
  let currentExercise = null;
  
  for (const line of lines) {
    const idMatch = line.match(/id:\s*'([^']+)'/);
    if (idMatch) {
      if (currentExercise) {
        exercises.push(currentExercise);
      }
      currentExercise = { id: idMatch[1], gifUrl: null };
    }
    
    const gifMatch = line.match(/gifUrl:\s*'([^']+)'/);
    if (gifMatch && currentExercise) {
      currentExercise.gifUrl = gifMatch[1];
    }
  }
  
  if (currentExercise) {
    exercises.push(currentExercise);
  }
  
  return exercises.filter(ex => ex.gifUrl && ex.gifUrl.startsWith('http'));
}

async function downloadGif(exerciseId, sourceUrl) {
  try {
    console.log(`⬇️  ${exerciseId}`);
    
    // Download from source
    const response = await fetch(sourceUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const buffer = await response.arrayBuffer();
    const fileName = `${exerciseId}.gif`;
    
    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from('exercise-gifs')
      .upload(fileName, buffer, {
        contentType: 'image/gif',
        cacheControl: '86400',
        upsert: true
      });
    
    if (error) {
      throw new Error(`Upload: ${error.message}`);
    }
    
    console.log(`✅ ${exerciseId}`);
    return { success: true, exerciseId };
    
  } catch (error) {
    console.log(`❌ ${exerciseId}: ${error.message}`);
    return { success: false, exerciseId, error: error.message };
  }
}

async function bulkDownload() {
  console.log('🚀 Starting bulk GIF download...');
  
  const exercises = extractExerciseData();
  console.log(`📊 Found ${exercises.length} exercises with GIF URLs`);
  
  const BATCH_SIZE = 3; // Conservative batch size
  const results = { success: 0, failed: 0, errors: [] };
  
  for (let i = 0; i < exercises.length; i += BATCH_SIZE) {
    const batch = exercises.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(exercises.length / BATCH_SIZE);
    
    console.log(`\n📦 Batch ${batchNum}/${totalBatches} (${batch.length} files)`);
    
    const batchPromises = batch.map(ex => downloadGif(ex.id, ex.gifUrl));
    const batchResults = await Promise.allSettled(batchPromises);
    
    batchResults.forEach(result => {
      if (result.status === 'fulfilled') {
        if (result.value.success) {
          results.success++;
        } else {
          results.failed++;
          results.errors.push(result.value);
        }
      } else {
        results.failed++;
        results.errors.push({ exerciseId: 'unknown', error: result.reason });
      }
    });
    
    // Progress update
    const processed = Math.min(i + BATCH_SIZE, exercises.length);
    console.log(`📈 Progress: ${processed}/${exercises.length} (${((processed/exercises.length)*100).toFixed(1)}%)`);
    
    // Delay between batches
    if (i + BATCH_SIZE < exercises.length) {
      console.log('⏱️  Waiting 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n🏁 Bulk download complete!');
  console.log(`✅ Success: ${results.success}`);
  console.log(`❌ Failed: ${results.failed}`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ Failed exercises:');
    results.errors.forEach(err => {
      console.log(`   - ${err.exerciseId}: ${err.error}`);
    });
  }
  
  // Get final storage stats
  try {
    const { data: files } = await supabase.storage
      .from('exercise-gifs')
      .list('', { limit: 1000 });
    
    if (files) {
      const totalSize = files.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);
      console.log(`\n📊 Final stats: ${files.length} files, ${(totalSize / 1024 / 1024).toFixed(1)} MB`);
    }
  } catch (e) {
    console.log('Could not get storage stats');
  }
}

bulkDownload().catch(console.error);