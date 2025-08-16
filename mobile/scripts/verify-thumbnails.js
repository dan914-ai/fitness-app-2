#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read exercise database
const dbPath = path.join(__dirname, '../src/data/exerciseDatabase.ts');
const dbContent = fs.readFileSync(dbPath, 'utf-8');

// Parse exercises
const exercisesMatch = dbContent.match(/const EXERCISE_DATABASE: ExerciseData\[\] = (\[[\s\S]*?\]);/);
const exercises = JSON.parse(exercisesMatch[1]);

// Read staticThumbnails
const thumbPath = path.join(__dirname, '../src/constants/staticThumbnails.ts');
const thumbContent = fs.readFileSync(thumbPath, 'utf-8');

// Extract thumbnail IDs
const thumbIds = new Set();
const thumbMatches = thumbContent.matchAll(/'(\d+)':/g);
for (const match of thumbMatches) {
  thumbIds.add(match[1]);
}

console.log(`📊 Exercise Database: ${exercises.length} exercises`);
console.log(`🖼️  Static Thumbnails: ${thumbIds.size} thumbnails`);
console.log('');

// Check coverage
const missing = [];
const covered = [];

exercises.forEach(exercise => {
  if (thumbIds.has(exercise.id.toString())) {
    covered.push(exercise.id);
  } else {
    missing.push({
      id: exercise.id,
      name: exercise.name,
      englishName: exercise.englishName,
      muscleGroup: exercise.muscleGroup
    });
  }
});

console.log(`✅ Covered: ${covered.length} exercises have thumbnails`);
console.log(`❌ Missing: ${missing.length} exercises need thumbnails`);

if (missing.length > 0) {
  console.log('\n⚠️  Missing thumbnails for:');
  missing.forEach(ex => {
    console.log(`  ${ex.id}: ${ex.name} (${ex.englishName}) - ${ex.muscleGroup}`);
  });
}