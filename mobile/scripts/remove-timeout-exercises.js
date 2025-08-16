#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

// IDs of exercises with timeout issues
const idsToRemove = [37, 133, 206, 237, 357];

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5dHRxc2d0dHV2ZGh2YnZibnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNzI0NzgsImV4cCI6MjA2ODc0ODQ3OH0.qUu0TNp2Q3cGBZjWJQHAype9gBN303G5yGo13CayMDA';

console.log('=== REMOVING TIMEOUT EXERCISES ===\n');

// Load database
const exerciseDatabase = require('../src/data/exerciseDatabase.ts').default;

// Find the exercises to remove
const exercisesToRemove = exerciseDatabase.filter(ex => idsToRemove.includes(ex.id));

console.log('Exercises to remove:');
exercisesToRemove.forEach(ex => {
  console.log(`- ID ${ex.id}: ${ex.name} (${ex.englishName})`);
});

// Function to delete from Supabase
async function deleteFromSupabase(url) {
  return new Promise((resolve) => {
    const pathMatch = url.match(/\/exercise-gifs\/(.+)$/);
    if (!pathMatch) {
      resolve(false);
      return;
    }
    
    const filePath = pathMatch[1];
    
    const options = {
      hostname: 'ayttqsgttuvdhvbvbnsk.supabase.co',
      path: `/storage/v1/object/public/exercise-gifs/${filePath}`,
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 204);
    });

    req.on('error', () => resolve(false));
    req.end();
  });
}

// Delete from Supabase
async function deleteGifs() {
  console.log('\n=== DELETING FROM SUPABASE ===\n');
  
  for (const ex of exercisesToRemove) {
    console.log(`Deleting: ${ex.englishName}...`);
    const success = await deleteFromSupabase(ex.imageUrl);
    console.log(success ? '  ✅ Deleted' : '  ⚠️  May already be deleted or inaccessible');
  }
}

// Update database
function updateDatabase() {
  console.log('\n=== UPDATING DATABASE ===\n');
  
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

// Update staticThumbnails
function updateThumbnails() {
  console.log('\n=== UPDATING THUMBNAILS ===\n');
  
  const thumbPath = path.join(__dirname, '..', 'src', 'constants', 'staticThumbnails.ts');
  const thumbContent = fs.readFileSync(thumbPath, 'utf8');
  
  // Parse existing mappings
  const mappingMatches = thumbContent.matchAll(/'(\d+)':\s*require\('([^']+)'\)[^,]*(,?)\s*\/\/\s*([^\n]+)/g);
  const newMappings = [];
  
  for (const match of mappingMatches) {
    const id = parseInt(match[1]);
    const path = match[2];
    const comment = match[4];
    
    if (!idsToRemove.includes(id)) {
      newMappings.push({ id, path, comment });
    } else {
      console.log(`Removing thumbnail mapping for ID ${id}`);
    }
  }
  
  // Rebuild file
  const newThumbContent = `// Static thumbnail mappings for exercise list performance
// Maps exercise ID to local thumbnail asset

export const staticThumbnails: { [key: string]: any } = {
${newMappings.map(m => `  '${m.id}': require('${m.path}'), // ${m.comment}`).join('\n')}
};

export default staticThumbnails;
`;
  
  fs.writeFileSync(thumbPath, newThumbContent);
  console.log(`✅ Thumbnails updated: ${newMappings.length} mappings remaining`);
}

// Main execution
async function main() {
  await deleteGifs();
  updateDatabase();
  updateThumbnails();
  
  console.log('\n✅ Complete! Removed 5 exercises with timeout issues.');
}

main().catch(console.error);