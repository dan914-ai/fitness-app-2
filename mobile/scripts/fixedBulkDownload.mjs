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

async function checkIfExists(fileName) {
  try {
    const { data, error } = await supabase.storage
      .from('exercise-gifs')
      .list('', { search: fileName, limit: 1 });
    
    return data && data.length > 0;
  } catch {
    return false;
  }
}

async function downloadGif(exerciseId, sourceUrl) {
  try {
    const fileName = `${exerciseId}.gif`;
    
    // Check if already exists - skip if it does
    const exists = await checkIfExists(fileName);
    if (exists) {
      console.log(`✓ ${exerciseId} (already exists)`);
      return { success: true, exerciseId, skipped: true };
    }
    
    console.log(`⬇️  ${exerciseId}`);
    
    // Download from source
    const response = await fetch(sourceUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 30000
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const buffer = await response.arrayBuffer();
    
    // Validate it's actually a GIF
    const uint8Array = new Uint8Array(buffer);
    const isGif = uint8Array[0] === 0x47 && uint8Array[1] === 0x49 && uint8Array[2] === 0x46;
    
    if (!isGif) {
      throw new Error('Not a valid GIF file');
    }
    
    // Upload to Supabase with upsert: true to overwrite if exists
    const { data, error } = await supabase.storage
      .from('exercise-gifs')
      .upload(fileName, buffer, {
        contentType: 'image/gif',
        cacheControl: '86400',
        upsert: true  // This will overwrite existing files
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
  console.log('🚀 Starting FIXED bulk GIF download...');
  
  const exercises = extractExerciseData();
  console.log(`📊 Found ${exercises.length} exercises with GIF URLs`);
  
  // First, get existing files to avoid conflicts
  console.log('🔍 Checking existing files...');
  const { data: existingFiles } = await supabase.storage
    .from('exercise-gifs')
    .list('', { limit: 1000 });
  
  console.log(`📁 Found ${existingFiles?.length || 0} existing files`);
  
  const BATCH_SIZE = 2; // Very conservative to avoid overwhelming
  const results = { success: 0, failed: 0, skipped: 0, errors: [] };
  
  for (let i = 0; i < exercises.length; i += BATCH_SIZE) {
    const batch = exercises.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(exercises.length / BATCH_SIZE);
    
    console.log(`\n📦 Batch ${batchNum}/${totalBatches}`);
    
    for (const exercise of batch) {
      const result = await downloadGif(exercise.id, exercise.gifUrl);
      
      if (result.success) {
        if (result.skipped) {
          results.skipped++;
        } else {
          results.success++;
        }
      } else {
        results.failed++;
        results.errors.push(result);
      }
      
      // Small delay between each download
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Progress update
    const processed = Math.min(i + BATCH_SIZE, exercises.length);
    console.log(`📈 Progress: ${processed}/${exercises.length} (${((processed/exercises.length)*100).toFixed(1)}%)`);
    
    // Longer delay between batches
    if (i + BATCH_SIZE < exercises.length) {
      console.log('⏱️  Waiting 3 seconds...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log('\n🏁 FIXED bulk download complete!');
  console.log(`✅ Success: ${results.success}`);
  console.log(`⏭️  Skipped (already exists): ${results.skipped}`);
  console.log(`❌ Failed: ${results.failed}`);
  
  if (results.errors.length > 0 && results.errors.length < 20) {
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
      console.log(`🎯 Success rate: ${((results.success / exercises.length) * 100).toFixed(1)}%`);
    }
  } catch (e) {
    console.log('Could not get storage stats');
  }
}

bulkDownload().catch(console.error);