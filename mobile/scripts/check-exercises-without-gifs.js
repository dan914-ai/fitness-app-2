#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Import exercise database
const exerciseDatabase = require('../src/data/exerciseDatabase.ts');

const GIF_DIR = path.join(__dirname, '..', 'assets', 'exercise-gifs');

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

console.log('=== Checking for Exercises Without GIFs ===\n');

const exercisesWithoutGifs = [];
const exercisesWithGifs = [];

// Check each exercise
exerciseDatabase.default.forEach(exercise => {
  // Convert exercise name to potential GIF filename
  const englishName = exercise.englishName || '';
  const gifName = englishName.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[()]/g, '')
    .replace(/'/g, '') + '.gif';
  
  const muscleDir = muscleGroupToDir[exercise.muscleGroup];
  
  if (!muscleDir) {
    console.log(`WARNING: No directory mapping for muscle group: ${exercise.muscleGroup}`);
    exercisesWithoutGifs.push({
      id: exercise.id,
      name: exercise.name,
      englishName: exercise.englishName,
      muscleGroup: exercise.muscleGroup,
      reason: 'No muscle group directory'
    });
    return;
  }
  
  const gifPath = path.join(GIF_DIR, muscleDir, gifName);
  
  if (!fs.existsSync(gifPath)) {
    // Try alternative names
    const alternatives = [
      gifName.replace(/-/g, '_'),
      gifName.replace(/-/g, ''),
      exercise.name.toLowerCase().replace(/\s+/g, '-') + '.gif'
    ];
    
    let found = false;
    for (const alt of alternatives) {
      const altPath = path.join(GIF_DIR, muscleDir, alt);
      if (fs.existsSync(altPath)) {
        found = true;
        break;
      }
    }
    
    if (!found) {
      exercisesWithoutGifs.push({
        id: exercise.id,
        name: exercise.name,
        englishName: exercise.englishName,
        muscleGroup: exercise.muscleGroup,
        expectedGif: `${muscleDir}/${gifName}`
      });
    } else {
      exercisesWithGifs.push(exercise.id);
    }
  } else {
    exercisesWithGifs.push(exercise.id);
  }
});

console.log(`Total exercises: ${exerciseDatabase.default.length}`);
console.log(`Exercises with GIFs: ${exercisesWithGifs.length}`);
console.log(`Exercises WITHOUT GIFs: ${exercisesWithoutGifs.length}\n`);

if (exercisesWithoutGifs.length > 0) {
  console.log('Exercises without GIF files:');
  console.log('============================\n');
  
  // Group by muscle group
  const grouped = {};
  exercisesWithoutGifs.forEach(ex => {
    if (!grouped[ex.muscleGroup]) {
      grouped[ex.muscleGroup] = [];
    }
    grouped[ex.muscleGroup].push(ex);
  });
  
  Object.keys(grouped).forEach(muscle => {
    console.log(`\n${muscle} (${grouped[muscle].length}):`);
    grouped[muscle].forEach(ex => {
      console.log(`  ID ${ex.id}: ${ex.name} (${ex.englishName})`);
      if (ex.expectedGif) {
        console.log(`    Expected: ${ex.expectedGif}`);
      }
    });
  });
  
  // Export IDs to remove
  const idsToRemove = exercisesWithoutGifs.map(ex => ex.id);
  const outputFile = path.join(__dirname, 'exercises-to-remove.json');
  fs.writeFileSync(outputFile, JSON.stringify({
    count: idsToRemove.length,
    ids: idsToRemove,
    exercises: exercisesWithoutGifs
  }, null, 2));
  
  console.log(`\n\nIDs to remove exported to: ${outputFile}`);
}