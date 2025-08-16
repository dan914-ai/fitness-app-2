import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Failed exercises from previous run - only the ones worth retrying
const failedExercises = [
  'goblet-squat',
  'tricep-overhead-extension', 
  'leg-extension',
  'smith-machine-squat',
  'pause-deadlift',
  'close-grip-pull-up',
  'forearm-push-up',
  'assisted-push-up',
  'scapular-pull-up',
  'barbell-power-clean',
  'clapping-push-up',
  't-bar-row',
  'donkey-calf-raise',
  'dumbbell-sumo-deadlift',
  'seated-calf-raise',
  'dumbbell-hip-thrust',
  'leg-press-calf-raise',
  'hang-clean',
  'negative-push-up',
  'reverse-curl',
  'kettlebell-clean-and-jerk',
  'hang-clean-and-jerk',
  'sissy_squat',
  'hercules_hold',
  'decline_cable_fly',
  'atg_split_squat',
  'pin_squat',
  'suicide_grip_bench',
  'hack_squat',
  'heel_elevated_squat',
  'battle_ropes',
  'drag_curl',
  'concentration_curl',
  'bear_crawl',
  'kettlebell_single_arm_swing',
  'diamond_pushup'
];

// Extract exercise data from database
function extractExerciseData() {
  const exerciseDbPath = './src/data/exerciseDatabase.ts';
  const exerciseDbContent = fs.readFileSync(exerciseDbPath, 'utf8');
  
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
  
  // Filter to only failed exercises that have URLs
  return exercises.filter(ex => 
    failedExercises.includes(ex.id) && 
    ex.gifUrl && 
    ex.gifUrl.startsWith('http')
  );
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

async function downloadWithRetry(exerciseId, sourceUrl, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const fileName = `${exerciseId}.gif`;
      
      // Check if already exists
      const exists = await checkIfExists(fileName);
      if (exists) {
        console.log(`✓ ${exerciseId} (already exists)`);
        return { success: true, exerciseId, skipped: true };
      }
      
      console.log(`⬇️  ${exerciseId} (attempt ${attempt}/${maxRetries})`);
      
      // Try different User-Agent strings
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0'
      ];
      
      const response = await fetch(sourceUrl, {
        headers: {
          'User-Agent': userAgents[attempt - 1] || userAgents[0],
          'Accept': 'image/gif,image/*,*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        timeout: 45000, // Longer timeout
        follow: 10 // Follow redirects
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const buffer = await response.arrayBuffer();
      
      // Validate content
      if (buffer.byteLength < 100) {
        throw new Error('File too small, likely not a valid GIF');
      }
      
      // Check if it's actually a GIF
      const uint8Array = new Uint8Array(buffer);
      const isGif = uint8Array[0] === 0x47 && uint8Array[1] === 0x49 && uint8Array[2] === 0x46;
      
      if (!isGif) {
        // Check if it's HTML error page
        const text = new TextDecoder().decode(uint8Array.slice(0, 100));
        if (text.includes('<html') || text.includes('<!DOCTYPE')) {
          throw new Error('Received HTML instead of GIF (likely 404 page)');
        }
        throw new Error('Not a valid GIF file');
      }
      
      console.log(`📤 Uploading ${exerciseId} (${(buffer.byteLength / 1024).toFixed(1)}KB)`);
      
      // Upload to Supabase
      const { data, error } = await supabase.storage
        .from('exercise-gifs')
        .upload(fileName, buffer, {
          contentType: 'image/gif',
          cacheControl: '86400',
          upsert: true
        });
      
      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }
      
      console.log(`✅ ${exerciseId} - SUCCESS!`);
      return { success: true, exerciseId };
      
    } catch (error) {
      console.log(`❌ ${exerciseId} (attempt ${attempt}): ${error.message}`);
      
      if (attempt < maxRetries) {
        console.log(`⏳ Waiting before retry...`);
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Increasing delay
      }
    }
  }
  
  return { success: false, exerciseId, error: 'All retry attempts failed' };
}

async function retryFailedGifs() {
  console.log('🔄 Retrying failed GIF downloads...');
  
  const exercises = extractExerciseData();
  console.log(`🎯 Found ${exercises.length} failed exercises to retry`);
  
  if (exercises.length === 0) {
    console.log('🎉 No failed exercises found to retry!');
    return;
  }
  
  console.log('📋 Exercises to retry:');
  exercises.forEach(ex => console.log(`   - ${ex.id}`));
  console.log('');
  
  const results = { success: 0, failed: 0, skipped: 0, errors: [] };
  
  for (let i = 0; i < exercises.length; i++) {
    const exercise = exercises[i];
    
    console.log(`\n📦 Processing ${i + 1}/${exercises.length}: ${exercise.id}`);
    
    const result = await downloadWithRetry(exercise.id, exercise.gifUrl);
    
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
    
    // Delay between exercises
    if (i < exercises.length - 1) {
      console.log('⏱️  Waiting 3 seconds...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log('\n🏁 Retry operation complete!');
  console.log(`✅ New successes: ${results.success}`);
  console.log(`⏭️  Already existed: ${results.skipped}`);
  console.log(`❌ Still failed: ${results.failed}`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ Still failing:');
    results.errors.forEach(err => {
      console.log(`   - ${err.exerciseId}: ${err.error}`);
    });
  }
  
  // Get updated storage stats
  try {
    const { data: files } = await supabase.storage
      .from('exercise-gifs')
      .list('', { limit: 1000 });
    
    if (files) {
      const totalSize = files.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);
      console.log(`\n📊 Updated stats: ${files.length} files, ${(totalSize / 1024 / 1024).toFixed(1)} MB`);
      console.log(`🎯 New success rate: ${((files.length / 213) * 100).toFixed(1)}%`);
    }
  } catch (e) {
    console.log('Could not get storage stats');
  }
}

retryFailedGifs().catch(console.error);