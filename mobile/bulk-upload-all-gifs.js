#!/usr/bin/env node

// Bulk upload ALL exercise GIFs from the database to Supabase
// Run this AFTER creating the exercise-gifs bucket in Supabase

import('node-fetch').then(async ({ default: fetch }) => {
  global.fetch = fetch;
  
  console.log('Loading exercise database and GIF service...\n');
  
  // We need to read the exercise database file directly since it's TypeScript
  const fs = await import('fs');
  const path = await import('path');
  const { fileURLToPath } = await import('url');
  
  // Read the exercise database file
  const dbPath = './src/data/exerciseDatabase.ts';
  const dbContent = fs.readFileSync(dbPath, 'utf-8');
  
  // Extract the EXERCISE_DATABASE array from the TypeScript file
  // This is a bit hacky but works for our needs
  const startMarker = 'export const EXERCISE_DATABASE: ExerciseData[] = [';
  const endMarker = '];';
  
  const startIndex = dbContent.indexOf(startMarker);
  const endIndex = dbContent.lastIndexOf(endMarker);
  
  if (startIndex === -1 || endIndex === -1) {
    console.error('Could not find EXERCISE_DATABASE in file');
    process.exit(1);
  }
  
  // Extract the array content and evaluate it
  const arrayContent = dbContent.substring(startIndex + startMarker.length - 1, endIndex + 1);
  
  // Remove TypeScript type annotations and make it valid JavaScript
  const cleanedContent = arrayContent
    .replace(/: string\[\]/g, '')
    .replace(/: string/g, '')
    .replace(/: number/g, '')
    .replace(/: boolean/g, '')
    .replace(/\?\:/g, ':');
  
  // Evaluate the array
  let EXERCISE_DATABASE;
  try {
    EXERCISE_DATABASE = eval(`(${cleanedContent})`);
  } catch (error) {
    console.error('Error parsing exercise database:', error);
    console.log('Trying alternative method...');
    
    // Alternative: Use regex to extract exercises
    const exercises = [];
    const exerciseRegex = /\{[\s\S]*?id:\s*['"]([^'"]+)['"][\s\S]*?gifUrl:\s*['"]([^'"]+)['"][\s\S]*?\}/g;
    let match;
    
    while ((match = exerciseRegex.exec(dbContent)) !== null) {
      if (!dbContent.substring(match.index, match.index + match[0].length).includes('gifUnavailable: true')) {
        exercises.push({
          id: match[1],
          gifUrl: match[2]
        });
      }
    }
    
    EXERCISE_DATABASE = exercises;
  }
  
  // Filter exercises with valid GIF URLs
  const exercisesWithGifs = EXERCISE_DATABASE
    .filter(e => e.media?.gifUrl && !e.media?.gifUnavailable)
    .map(e => ({ 
      id: e.id, 
      gifUrl: e.media.gifUrl 
    }));
  
  console.log(`Found ${exercisesWithGifs.length} exercises with GIFs\n`);
  
  // Supabase configuration
  const SUPABASE_URL = 'https://nwpyliujuimufkfjolsj.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHlsaXVqdWltdWZrZmpvbHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NjIzNjgsImV4cCI6MjA2OTIzODM2OH0.dWYh2ROhXN6n4scKc-gKMMPUjVXBXD2xv5l-UGqyTZA';
  
  // Bulk upload implementation
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
        console.log(`❌ ${exerciseId} upload failed: ${uploadResponse.status}`);
        return false;
      }
      
    } catch (error) {
      console.log(`❌ ${exerciseId} error: ${error.message}`);
      return false;
    }
  }
  
  async function bulkUpload() {
    console.log('Starting bulk upload...\n');
    console.log('⚠️  Make sure you have created the exercise-gifs bucket in Supabase first!');
    console.log('Go to: https://supabase.com/dashboard/project/nwpyliujuimufkfjolsj/storage/buckets\n');
    
    const BATCH_SIZE = 5; // Upload 5 at a time
    const results = {
      success: 0,
      failed: 0
    };
    
    for (let i = 0; i < exercisesWithGifs.length; i += BATCH_SIZE) {
      const batch = exercisesWithGifs.slice(i, i + BATCH_SIZE);
      console.log(`\nProcessing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(exercisesWithGifs.length / BATCH_SIZE)}`);
      
      const batchPromises = batch.map(exercise => uploadGif(exercise.id, exercise.gifUrl));
      
      const batchResults = await Promise.allSettled(batchPromises);
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          results.success++;
        } else {
          results.failed++;
        }
      });
      
      // Small delay between batches
      if (i + BATCH_SIZE < exercisesWithGifs.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Upload complete!`);
    console.log(`✅ Success: ${results.success}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`${'='.repeat(50)}\n`);
    
    if (results.success > 0) {
      console.log(`The GIFs are now available in your app!`);
      console.log(`Example URL: ${SUPABASE_URL}/storage/v1/object/public/exercise-gifs/barbell-bench-press.gif`);
    }
  }
  
  // Run the upload
  bulkUpload().catch(console.error);
  
}).catch(err => {
  console.error('Failed to load dependencies:', err);
  console.log('\nPlease install node-fetch if not already installed:');
  console.log('npm install node-fetch');
});