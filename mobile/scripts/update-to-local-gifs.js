#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'src', 'data', 'exerciseDatabase.ts');

// Read the database file
let dbContent = fs.readFileSync(dbPath, 'utf8');

// Map muscle groups to directories
const muscleGroupToDir = {
  '가슴': 'pectorals',
  '등': 'back',
  '어깨': 'deltoids',
  '이두근': 'biceps',
  '삼두근': 'triceps',
  '대퇴사두근': 'quadriceps',
  '햄스트링': 'hamstrings',
  '둔근': 'glutes',
  '복근': 'abdominals',
  '종아리': 'calves',
  '전완근': 'forearms',
  '승모근': 'traps',
  '복합운동': 'compound',
  '유산소': 'cardio',
  '팔': 'arms',
  '다리': 'legs'
};

console.log('=== Updating GIF URLs to Local Paths ===\n');

// Parse exercises
const exerciseMatch = dbContent.match(/const EXERCISE_DATABASE: ExerciseData\[\] = \[([\s\S]*?)\];/);
if (!exerciseMatch) {
  console.error('Could not parse exercise database');
  process.exit(1);
}

// Count replacements
let replacements = 0;
let failures = 0;

// Replace Supabase URLs with local paths
// Pattern: https://ayttqsgttuvdhvbvbnsk.supabase.co/storage/v1/object/public/exercise-gifs/MUSCLE_GROUP/EXERCISE_NAME.gif
const urlPattern = /https:\/\/ayttqsgttuvdhvbvbnsk\.supabase\.co\/storage\/v1\/object\/public\/exercise-gifs\/([^\/]+)\/([^"]+)/g;

dbContent = dbContent.replace(urlPattern, (match, muscleDir, fileName) => {
  replacements++;
  
  // Convert URL path to local path
  // The URL already has the correct muscle directory and filename
  const localPath = `assets/exercise-gifs/${muscleDir}/${fileName}`;
  
  console.log(`  Replacing: ${muscleDir}/${fileName}`);
  
  return localPath;
});

// Also update thumbnailUrl fields to match imageUrl
// Since we're using static thumbnails via staticThumbnails.ts, we can remove thumbnailUrl
// But for now, let's keep them consistent
dbContent = dbContent.replace(/"thumbnailUrl": "([^"]+)"/g, (match, url) => {
  if (url.includes('supabase.co')) {
    // Extract path from URL
    const pathMatch = url.match(/exercise-gifs\/(.+)$/);
    if (pathMatch) {
      return `"thumbnailUrl": "assets/${pathMatch[0]}"`;
    }
  }
  return match;
});

// Write the updated file
fs.writeFileSync(dbPath, dbContent, 'utf8');

console.log(`\n=== Update Complete ===`);
console.log(`Total replacements: ${replacements}`);
console.log(`\nAll Supabase URLs have been replaced with local paths.`);
console.log(`\nNOTE: The app will now use local GIF files from assets/exercise-gifs/`);
console.log(`Thumbnails are handled separately via staticThumbnails.ts`);