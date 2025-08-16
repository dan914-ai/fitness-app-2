#!/usr/bin/env node

/**
 * Fix thumbnail URLs to use local static JPEGs instead of Supabase GIFs
 * This ensures fast list loading without downloading hundreds of GIFs
 */

const fs = require('fs');
const path = require('path');

// Read the current database
const dbPath = path.join(__dirname, '../src/data/exerciseDatabase.ts');
const dbContent = fs.readFileSync(dbPath, 'utf-8');

// Parse the exercises array
const exercisesMatch = dbContent.match(/const EXERCISE_DATABASE: ExerciseData\[\] = (\[[\s\S]*?\]);/);
if (!exercisesMatch) {
  console.error('Could not find EXERCISE_DATABASE in file');
  process.exit(1);
}

// Parse the JSON
const exercisesJson = exercisesMatch[1]
  .replace(/,\s*}/g, '}') // Remove trailing commas
  .replace(/,\s*\]/g, ']'); // Remove trailing commas in arrays

let exercises;
try {
  exercises = eval(exercisesJson); // Using eval because it's not pure JSON (has empty values)
} catch (e) {
  console.error('Failed to parse exercises:', e);
  process.exit(1);
}

console.log(`Found ${exercises.length} exercises to update`);

// Count fixes
let fixed = 0;
let alreadyCorrect = 0;

// Update each exercise
exercises.forEach(exercise => {
  // Check if thumbnailUrl is pointing to a GIF
  if (exercise.thumbnailUrl && exercise.thumbnailUrl.includes('.gif')) {
    // For now, just remove the thumbnailUrl field
    // The service will use staticThumbnails mapping instead
    delete exercise.thumbnailUrl;
    fixed++;
  } else if (!exercise.thumbnailUrl) {
    alreadyCorrect++;
  }
});

console.log(`✅ Fixed ${fixed} exercises with GIF thumbnails`);
console.log(`✅ ${alreadyCorrect} exercises already correct`);

// Rebuild the TypeScript file
const newContent = `// Auto-generated from local files on ${new Date().toISOString()}
// DO NOT EDIT MANUALLY - Run fix-thumbnail-urls.js to update

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
}

const EXERCISE_DATABASE: ExerciseData[] = ${JSON.stringify(exercises, null, 2)};

export default EXERCISE_DATABASE;
`;

// Write the updated file
fs.writeFileSync(dbPath, newContent);

console.log('✅ Updated exerciseDatabase.ts');
console.log('');
console.log('Summary:');
console.log(`- Removed thumbnailUrl from ${fixed} exercises`);
console.log('- Service will now use local static thumbnails from staticThumbnails.ts');
console.log('- GIFs are still available via imageUrl for detail views');