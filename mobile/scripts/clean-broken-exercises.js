#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// IDs of exercises with broken Supabase URLs to remove
const idsToRemove = [
  56, 57, 58, 59, 96, 97, 98, 99, 100, 102, 103, 104, 105, 109, 110,
  111, 112, 113, 168, 231, 252, 300, 308, 310, 311, 312, 313, 314,
  315, 316, 317, 318, 319, 320, 332
];

console.log(`Removing ${idsToRemove.length} exercises with broken GIF URLs...\n`);

// 1. Update exerciseDatabase.ts
const dbPath = path.join(__dirname, '..', 'src', 'data', 'exerciseDatabase.ts');
const exerciseDatabase = require(dbPath);

// Filter out exercises with broken IDs
const filteredExercises = exerciseDatabase.default.filter(exercise => {
  const shouldRemove = idsToRemove.includes(exercise.id);
  if (shouldRemove) {
    console.log(`Removing: ID ${exercise.id} - ${exercise.name} (${exercise.englishName})`);
  }
  return !shouldRemove;
});

console.log(`\nFiltered from ${exerciseDatabase.default.length} to ${filteredExercises.length} exercises`);

// Rebuild the file content
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

// Write the updated database
fs.writeFileSync(dbPath, newContent);
console.log(`✅ Database updated: ${exerciseDatabase.default.length} → ${filteredExercises.length} exercises`);

// 2. Update staticThumbnails.ts
const thumbPath = path.join(__dirname, '..', 'src', 'constants', 'staticThumbnails.ts');
let thumbContent = fs.readFileSync(thumbPath, 'utf8');

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
    console.log(`Removing thumbnail mapping: ID ${id}`);
  }
}

// Rebuild staticThumbnails.ts
const newThumbContent = `// Static thumbnail mappings for exercise list performance
// Maps exercise ID to local thumbnail asset

export const staticThumbnails: { [key: string]: any } = {
${newMappings.map(m => `  '${m.id}': require('${m.path}'), // ${m.comment}`).join('\n')}
};

export default staticThumbnails;
`;

fs.writeFileSync(thumbPath, newThumbContent);
console.log(`✅ StaticThumbnails updated: ${newMappings.length} mappings remaining`);

console.log('\n✅ Cleanup complete!');
console.log(`Successfully removed ${idsToRemove.length} exercises with broken GIF URLs`);