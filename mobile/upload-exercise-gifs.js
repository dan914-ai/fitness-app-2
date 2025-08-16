#!/usr/bin/env node

// Bulk upload exercise GIFs to Supabase
// Run this AFTER creating the exercise-gifs bucket in Supabase

const SUPABASE_URL = 'https://nwpyliujuimufkfjolsj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHlsaXVqdWltdWZrZmpvbHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NjIzNjgsImV4cCI6MjA2OTIzODM2OH0.dWYh2ROhXN6n4scKc-gKMMPUjVXBXD2xv5l-UGqyTZA';

// Sample exercises to test with
const TEST_EXERCISES = [
  {
    id: 'barbell-bench-press',
    gifUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/09/barbell-bench-press.gif'
  },
  {
    id: 'squat',
    gifUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2021/10/bodyweight-squat.gif'
  },
  {
    id: 'deadlift',
    gifUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/06/barbell-deadlift.gif'
  },
  {
    id: 'pull-up',
    gifUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/02/pull-up.gif'
  },
  {
    id: 'dumbbell-row',
    gifUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/11/bent-over-one-arm-row.gif'
  }
];

async function uploadGif(exerciseId, gifUrl) {
  try {
    console.log(`Downloading ${exerciseId}...`);
    
    // Download the GIF
    const response = await fetch(gifUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.status}`);
    }
    
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log(`Uploading ${exerciseId} (${(buffer.length / 1024).toFixed(1)} KB)...`);
    
    // Upload to Supabase
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/exercise-gifs/${exerciseId}.gif`;
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'image/gif'
      },
      body: buffer
    });
    
    if (uploadResponse.ok) {
      console.log(`✅ ${exerciseId} uploaded successfully!`);
      return true;
    } else {
      const error = await uploadResponse.text();
      console.log(`❌ ${exerciseId} upload failed: ${uploadResponse.status} - ${error}`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ ${exerciseId} error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('Starting exercise GIF upload...\n');
  console.log('⚠️  Make sure you have created the exercise-gifs bucket in Supabase first!');
  console.log('Go to: https://supabase.com/dashboard/project/nwpyliujuimufkfjolsj/storage/buckets\n');
  
  const results = {
    success: 0,
    failed: 0
  };
  
  for (const exercise of TEST_EXERCISES) {
    const success = await uploadGif(exercise.id, exercise.gifUrl);
    if (success) {
      results.success++;
    } else {
      results.failed++;
    }
    
    // Small delay between uploads
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\nUpload complete!`);
  console.log(`✅ Success: ${results.success}`);
  console.log(`❌ Failed: ${results.failed}`);
  
  if (results.success > 0) {
    console.log(`\nYou can now test the GIFs in your app!`);
    console.log(`Example URL: ${SUPABASE_URL}/storage/v1/object/public/exercise-gifs/barbell-bench-press.gif`);
  }
}

// Import fetch for Node.js
import('node-fetch').then(({ default: f }) => {
  global.fetch = f;
  main().catch(console.error);
}).catch(err => {
  console.error('Failed to load dependencies:', err);
  console.log('\nPlease install node-fetch: npm install node-fetch');
});