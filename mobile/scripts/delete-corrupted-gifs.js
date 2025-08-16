#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const SUPABASE_URL = 'https://ayttqsgttuvdhvbvbnsk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5dHRxc2d0dHV2ZGh2YnZibnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNzI0NzgsImV4cCI6MjA2ODc0ODQ3OH0.qUu0TNp2Q3cGBZjWJQHAype9gBN303G5yGo13CayMDA';

console.log('=== SCANNING FOR CORRUPTED GIFs IN SUPABASE ===\n');

// Get all exercises from database
const exerciseDatabase = require('../src/data/exerciseDatabase.ts').default;

// Function to check if a GIF is corrupted
async function checkGif(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = Buffer.alloc(0);
      let sizeBytes = 0;
      
      res.on('data', chunk => {
        data = Buffer.concat([data, chunk]);
        sizeBytes += chunk.length;
        
        // Check first few bytes for GIF header
        if (data.length >= 6 && sizeBytes === chunk.length) {
          const header = data.slice(0, 6).toString('ascii');
          if (header !== 'GIF87a' && header !== 'GIF89a') {
            res.destroy();
            resolve({ 
              corrupted: true, 
              reason: 'Invalid GIF header',
              status: res.statusCode,
              size: sizeBytes
            });
            return;
          }
        }
        
        // If file is too small to be a valid GIF (less than 100 bytes)
        if (res.headers['content-length'] && parseInt(res.headers['content-length']) < 100) {
          res.destroy();
          resolve({ 
            corrupted: true, 
            reason: 'File too small',
            status: res.statusCode,
            size: parseInt(res.headers['content-length'])
          });
          return;
        }
      });
      
      res.on('end', () => {
        // Check if we got a valid response
        if (res.statusCode !== 200) {
          resolve({ 
            corrupted: true, 
            reason: `HTTP ${res.statusCode}`,
            status: res.statusCode,
            size: sizeBytes
          });
          return;
        }
        
        // Check final size
        if (sizeBytes < 100) {
          resolve({ 
            corrupted: true, 
            reason: 'File too small',
            status: res.statusCode,
            size: sizeBytes
          });
          return;
        }
        
        // Check GIF trailer (should end with 0x3B)
        if (data.length > 0 && data[data.length - 1] !== 0x3B) {
          resolve({ 
            corrupted: true, 
            reason: 'Missing GIF trailer',
            status: res.statusCode,
            size: sizeBytes
          });
          return;
        }
        
        resolve({ 
          corrupted: false, 
          status: res.statusCode,
          size: sizeBytes
        });
      });
      
      res.on('error', () => {
        resolve({ 
          corrupted: true, 
          reason: 'Network error',
          status: 0,
          size: 0
        });
      });
    }).on('error', () => {
      resolve({ 
        corrupted: true, 
        reason: 'Request failed',
        status: 0,
        size: 0
      });
    });
  });
}

// Function to delete a file from Supabase
async function deleteFromSupabase(filepath) {
  return new Promise((resolve) => {
    const urlPath = filepath.replace('https://ayttqsgttuvdhvbvbnsk.supabase.co/storage/v1/object/public/', '');
    
    const options = {
      hostname: 'ayttqsgttuvdhvbvbnsk.supabase.co',
      path: `/storage/v1/object/${urlPath}`,
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve(res.statusCode === 200 || res.statusCode === 204);
      });
    });

    req.on('error', () => resolve(false));
    req.end();
  });
}

// Main scanning function
async function scanAndDelete() {
  const corruptedGifs = [];
  const workingGifs = [];
  
  console.log(`Checking ${exerciseDatabase.length} exercise GIFs...\n`);
  
  for (let i = 0; i < exerciseDatabase.length; i++) {
    const exercise = exerciseDatabase[i];
    process.stdout.write(`\rChecking: ${i + 1}/${exerciseDatabase.length}`);
    
    const result = await checkGif(exercise.imageUrl);
    
    if (result.corrupted) {
      corruptedGifs.push({
        id: exercise.id,
        name: exercise.name,
        englishName: exercise.englishName,
        url: exercise.imageUrl,
        reason: result.reason,
        size: result.size
      });
    } else {
      workingGifs.push({
        id: exercise.id,
        size: result.size
      });
    }
  }
  
  console.log('\n\n=== SCAN RESULTS ===\n');
  console.log(`✅ Working GIFs: ${workingGifs.length}`);
  console.log(`❌ Corrupted GIFs: ${corruptedGifs.length}`);
  
  if (corruptedGifs.length === 0) {
    console.log('\n✨ All GIFs are healthy! No corrupted files found.');
    return;
  }
  
  // Show corrupted GIFs
  console.log('\n=== CORRUPTED GIFs FOUND ===\n');
  corruptedGifs.forEach(gif => {
    console.log(`ID ${gif.id}: ${gif.name} (${gif.englishName})`);
    console.log(`  Reason: ${gif.reason}`);
    console.log(`  Size: ${gif.size} bytes`);
    console.log(`  URL: ${gif.url}`);
  });
  
  // Save list for reference
  const outputPath = path.join(__dirname, 'corrupted-gifs.json');
  fs.writeFileSync(outputPath, JSON.stringify(corruptedGifs, null, 2));
  console.log(`\n📁 List saved to: corrupted-gifs.json`);
  
  // Delete corrupted GIFs
  console.log('\n=== DELETING CORRUPTED GIFs ===\n');
  
  let deleted = 0;
  let failed = 0;
  
  for (const gif of corruptedGifs) {
    process.stdout.write(`\rDeleting: ${deleted + failed + 1}/${corruptedGifs.length}`);
    
    const success = await deleteFromSupabase(gif.url);
    if (success) {
      deleted++;
      console.log(`\n✅ Deleted: ${gif.name}`);
    } else {
      failed++;
      console.log(`\n❌ Failed to delete: ${gif.name}`);
    }
  }
  
  console.log('\n\n=== DELETION COMPLETE ===');
  console.log(`✅ Successfully deleted: ${deleted} corrupted GIFs`);
  if (failed > 0) {
    console.log(`❌ Failed to delete: ${failed} GIFs`);
  }
  
  // Update database to remove corrupted exercises
  if (deleted > 0) {
    console.log('\n=== UPDATING DATABASE ===\n');
    
    const idsToRemove = corruptedGifs.map(g => g.id);
    const dbPath = path.join(__dirname, '..', 'src', 'data', 'exerciseDatabase.ts');
    const filteredExercises = exerciseDatabase.filter(ex => !idsToRemove.includes(ex.id));
    
    const newContent = `// Auto-generated from Supabase storage on 2025-08-03T04:44:57.129Z
// DO NOT EDIT MANUALLY - Run rebuildDatabaseFromSupabase.js to update

export interface ExerciseData {
  id: number;
  name: string;
  englishName: string;
  category: string;
  muscleGroup: string;
  equipment: string;
  difficulty: string;
  instructions: string[];
  imageUrl: string;
  videoUrl: string;
  thumbnailUrl: string;
}

const EXERCISE_DATABASE: ExerciseData[] = ${JSON.stringify(filteredExercises, null, 2)};

export default EXERCISE_DATABASE;
`;
    
    fs.writeFileSync(dbPath, newContent);
    console.log(`✅ Database updated: ${exerciseDatabase.length} → ${filteredExercises.length} exercises`);
  }
}

// Run the scan
scanAndDelete().catch(console.error);