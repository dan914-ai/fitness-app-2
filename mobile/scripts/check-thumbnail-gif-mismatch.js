#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const exerciseDatabase = require('../src/data/exerciseDatabase.ts');

console.log('=== Checking Thumbnail-GIF Mismatches ===\n');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const GIF_DIR = path.join(ASSETS_DIR, 'exercise-gifs');
const THUMB_DIR = path.join(ASSETS_DIR, 'exercise-thumbnails');

// Parse staticThumbnails.ts to get IDs
const staticThumbnailsContent = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'constants', 'staticThumbnails.ts'), 
  'utf8'
);

// Extract IDs from the file
const thumbnailIds = [];
const idMatches = staticThumbnailsContent.matchAll(/'(\d+)':/g);
for (const match of idMatches) {
  thumbnailIds.push(match[1]);
}

console.log(`Static thumbnail mappings: ${thumbnailIds.length}`);

// Get all exercise IDs from database
const databaseIds = exerciseDatabase.default.map(ex => ex.id.toString());
console.log(`Database exercises: ${databaseIds.length}`);

// Find mismatches
const inThumbnailsNotInDb = thumbnailIds.filter(id => !databaseIds.includes(id));
const inDbNotInThumbnails = databaseIds.filter(id => !thumbnailIds.includes(id));

console.log(`\n=== IDs in staticThumbnails but NOT in database: ${inThumbnailsNotInDb.length} ===`);
if (inThumbnailsNotInDb.length > 0) {
  console.log('These might be deleted exercises that still have thumbnail mappings:');
  inThumbnailsNotInDb.forEach(id => {
    // Try to find the exercise name from the comment in staticThumbnails
    const regex = new RegExp(`'${id}':[^,]+,\\s*//\\s*([^,]+),?`);
    const match = staticThumbnailsContent.match(regex);
    const name = match ? match[1] : 'Unknown';
    console.log(`  ID ${id}: ${name}`);
  });
}

console.log(`\n=== IDs in database but NOT in staticThumbnails: ${inDbNotInThumbnails.length} ===`);
if (inDbNotInThumbnails.length > 0) {
  inDbNotInThumbnails.forEach(id => {
    const exercise = exerciseDatabase.default.find(ex => ex.id.toString() === id);
    console.log(`  ID ${id}: ${exercise.name} (${exercise.englishName})`);
  });
}

// Check for exercises with local thumbnails but no GIFs
console.log('\n=== Checking for exercises with thumbnails but no GIFs ===');

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

let mismatchCount = 0;
const mismatches = [];

exerciseDatabase.default.forEach(exercise => {
  const muscleDir = muscleGroupToDir[exercise.muscleGroup];
  if (!muscleDir) return;
  
  // Check multiple possible GIF names
  const possibleNames = [
    exercise.englishName.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '').replace(/'/g, ''),
    exercise.englishName.toLowerCase().replace(/\s+/g, '_').replace(/[()]/g, '').replace(/'/g, ''),
    exercise.name.toLowerCase().replace(/\s+/g, '-'),
  ];
  
  let hasGif = false;
  let hasThumb = false;
  let gifName = null;
  
  for (const name of possibleNames) {
    const testGifPath = path.join(GIF_DIR, muscleDir, name + '.gif');
    const testThumbPath = path.join(THUMB_DIR, muscleDir, name + '.jpg');
    
    if (fs.existsSync(testGifPath)) {
      hasGif = true;
      gifName = name + '.gif';
    }
    if (fs.existsSync(testThumbPath)) {
      hasThumb = true;
    }
    
    if (hasGif) break;
  }
  
  // Check if in staticThumbnails
  const inStaticThumbnails = thumbnailIds.includes(exercise.id.toString());
  
  if (inStaticThumbnails && !hasGif) {
    console.log(`  ID ${exercise.id}: ${exercise.name} (${exercise.englishName})`);
    console.log(`    Has thumbnail mapping but NO GIF found`);
    console.log(`    Expected in: ${muscleDir}/`);
    mismatches.push(exercise);
    mismatchCount++;
  }
});

if (mismatchCount === 0) {
  console.log('  None found - all exercises with thumbnails have GIFs');
}

// Check for potentially deleted exercises
console.log('\n=== Checking for potentially deleted exercises that reappeared ===');
const deletedIds = ['364']; // We know we deleted ID 364 (푸시업)
deletedIds.forEach(id => {
  if (databaseIds.includes(id)) {
    const exercise = exerciseDatabase.default.find(ex => ex.id.toString() === id);
    console.log(`  WARNING: ID ${id} (${exercise.name}) was previously deleted but is in database!`);
  }
  if (thumbnailIds.includes(id)) {
    console.log(`  WARNING: ID ${id} was previously deleted but still in staticThumbnails!`);
  }
});

console.log('\n=== Summary ===');
console.log(`Database exercises: ${exerciseDatabase.default.length}`);
console.log(`Thumbnail mappings: ${thumbnailIds.length}`);
console.log(`Orphaned thumbnails: ${inThumbnailsNotInDb.length}`);
console.log(`Missing thumbnail mappings: ${inDbNotInThumbnails.length}`);
console.log(`Exercises with thumbnails but no GIF: ${mismatchCount}`);