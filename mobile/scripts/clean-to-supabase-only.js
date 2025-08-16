#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

console.log('=== CLEANING DATABASE TO ONLY USE SUPABASE GIFs ===\n');

const exerciseDatabase = require('../src/data/exerciseDatabase.ts').default;

// Function to check if Supabase URL works
function checkSupabaseUrl(url) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'HEAD',
      timeout: 5000
    };
    
    const req = https.request(options, (res) => {
      resolve(res.statusCode === 200);
    });
    
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Check all exercises
async function cleanDatabase() {
  const keepExercises = [];
  const removeExercises = [];
  
  console.log(`Checking ${exerciseDatabase.length} exercises...\n`);
  
  // Process in batches for speed
  const batchSize = 10;
  for (let i = 0; i < exerciseDatabase.length; i += batchSize) {
    const batch = exerciseDatabase.slice(i, Math.min(i + batchSize, exerciseDatabase.length));
    process.stdout.write(`\rChecking: ${Math.min(i + batchSize, exerciseDatabase.length)}/${exerciseDatabase.length}`);
    
    const results = await Promise.all(
      batch.map(async (ex) => {
        const hasSupabase = await checkSupabaseUrl(ex.imageUrl);
        return { exercise: ex, hasSupabase };
      })
    );
    
    results.forEach(({ exercise, hasSupabase }) => {
      if (hasSupabase) {
        keepExercises.push(exercise);
      } else {
        removeExercises.push(exercise);
      }
    });
  }
  
  console.log('\n\n=== RESULTS ===');
  console.log(`✅ Keep (have Supabase): ${keepExercises.length}`);
  console.log(`❌ Remove (no Supabase): ${removeExercises.length}`);
  
  if (removeExercises.length > 0) {
    console.log('\n=== EXERCISES TO REMOVE (No Supabase) ===');
    removeExercises.forEach(ex => {
      console.log(`  ID ${ex.id}: ${ex.name} (${ex.englishName})`);
    });
  }
  
  // Update database file
  console.log('\n=== UPDATING DATABASE ===');
  const dbPath = path.join(__dirname, '..', 'src', 'data', 'exerciseDatabase.ts');
  
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

const EXERCISE_DATABASE: ExerciseData[] = ${JSON.stringify(keepExercises, null, 2)};

export default EXERCISE_DATABASE;
`;
  
  fs.writeFileSync(dbPath, newContent);
  console.log(`✅ Database updated: ${exerciseDatabase.length} → ${keepExercises.length} exercises`);
  
  // Update staticThumbnails
  console.log('\n=== UPDATING THUMBNAILS ===');
  const thumbPath = path.join(__dirname, '..', 'src', 'constants', 'staticThumbnails.ts');
  const thumbContent = fs.readFileSync(thumbPath, 'utf8');
  
  // Parse existing mappings
  const mappingMatches = thumbContent.matchAll(/'(\d+)':\s*require\('([^']+)'\)[^,]*(,?)\s*\/\/\s*([^\n]+)/g);
  const newMappings = [];
  
  for (const match of mappingMatches) {
    const id = parseInt(match[1]);
    const path = match[2];
    const comment = match[4];
    
    // Only keep mappings for exercises we're keeping
    if (keepExercises.find(ex => ex.id === id)) {
      newMappings.push({ id, path, comment });
    }
  }
  
  // Rebuild staticThumbnails
  const newThumbContent = `// Static thumbnail mappings for exercise list performance
// Maps exercise ID to local thumbnail asset

export const staticThumbnails: { [key: string]: any } = {
${newMappings.map(m => `  '${m.id}': require('${m.path}'), // ${m.comment}`).join('\n')}
};

export default staticThumbnails;
`;
  
  fs.writeFileSync(thumbPath, newThumbContent);
  console.log(`✅ Thumbnails updated: ${newMappings.length} mappings`);
  
  console.log('\n✅ CLEANUP COMPLETE!');
  console.log(`Database now only contains exercises with working Supabase GIFs`);
  console.log(`Removed ${removeExercises.length} exercises that only had local GIFs`);
  
  return { keep: keepExercises.length, remove: removeExercises.length };
}

cleanDatabase().catch(console.error);