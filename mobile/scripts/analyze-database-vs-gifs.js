#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const exerciseDatabase = require('../src/data/exerciseDatabase.ts').default;

console.log('=== DATABASE vs LOCAL GIFs ANALYSIS ===\n');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const GIF_DIR = path.join(ASSETS_DIR, 'exercise-gifs');

// Get all local GIF files
function getAllGifs() {
  const gifs = {};
  const muscleGroups = fs.readdirSync(GIF_DIR).filter(f => 
    fs.statSync(path.join(GIF_DIR, f)).isDirectory()
  );
  
  muscleGroups.forEach(group => {
    const groupPath = path.join(GIF_DIR, group);
    const files = fs.readdirSync(groupPath).filter(f => f.endsWith('.gif'));
    gifs[group] = files.map(f => f.replace('.gif', ''));
  });
  
  return gifs;
}

// Map Korean muscle groups to English folders
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

const localGifs = getAllGifs();
const totalLocalGifs = Object.values(localGifs).reduce((sum, arr) => sum + arr.length, 0);

console.log(`📁 Local GIF Files: ${totalLocalGifs}`);
console.log(`📊 Database Exercises: ${exerciseDatabase.length}\n`);

// Analyze each muscle group
console.log('=== BY MUSCLE GROUP ===\n');
Object.entries(localGifs).forEach(([group, gifs]) => {
  // Find database exercises for this group
  const koreanGroup = Object.entries(muscleGroupToDir).find(([k, v]) => v === group)?.[0];
  const dbExercises = exerciseDatabase.filter(ex => 
    muscleGroupToDir[ex.muscleGroup] === group
  );
  
  console.log(`${group.toUpperCase()}:`);
  console.log(`  Local GIFs: ${gifs.length}`);
  console.log(`  Database: ${dbExercises.length}`);
  
  if (gifs.length !== dbExercises.length) {
    console.log(`  ⚠️  Mismatch: ${Math.abs(gifs.length - dbExercises.length)} difference`);
  }
});

// Find GIFs without database entries
console.log('\n=== GIFs WITHOUT DATABASE ENTRIES ===\n');
let orphanedGifs = 0;

Object.entries(localGifs).forEach(([group, gifs]) => {
  gifs.forEach(gifName => {
    // Try to find matching exercise in database
    const found = exerciseDatabase.find(ex => {
      const url = ex.imageUrl || '';
      return url.includes(`${group}/${gifName}.gif`);
    });
    
    if (!found) {
      console.log(`  ${group}/${gifName}.gif`);
      orphanedGifs++;
    }
  });
});

console.log(`\nTotal orphaned GIFs: ${orphanedGifs}`);

// Find database entries without local GIFs
console.log('\n=== DATABASE ENTRIES WITHOUT LOCAL GIFs ===\n');
let missingGifs = 0;

exerciseDatabase.forEach(ex => {
  if (!ex.imageUrl) return;
  
  const urlParts = ex.imageUrl.split('exercise-gifs/')[1];
  if (!urlParts) return;
  
  const [group, filename] = urlParts.split('/');
  const gifName = filename?.replace('.gif', '');
  
  if (localGifs[group] && !localGifs[group].includes(gifName)) {
    console.log(`  ID ${ex.id}: ${ex.name} -> ${group}/${filename}`);
    missingGifs++;
  }
});

console.log(`\nTotal missing GIFs: ${missingGifs}`);

// Summary
console.log('\n=== SUMMARY ===');
console.log(`Local GIF files: ${totalLocalGifs}`);
console.log(`Database exercises: ${exerciseDatabase.length}`);
console.log(`Orphaned GIFs (no DB entry): ${orphanedGifs}`);
console.log(`Missing GIFs (DB but no file): ${missingGifs}`);
console.log(`\nRecommendation: ${orphanedGifs > 0 ? 'Add missing exercises to database' : 'Database is complete'}`);

// Export list of orphaned GIFs for potential addition
if (orphanedGifs > 0) {
  const orphanList = [];
  Object.entries(localGifs).forEach(([group, gifs]) => {
    gifs.forEach(gifName => {
      const found = exerciseDatabase.find(ex => {
        const url = ex.imageUrl || '';
        return url.includes(`${group}/${gifName}.gif`);
      });
      
      if (!found) {
        orphanList.push({
          group,
          filename: `${gifName}.gif`,
          path: `${group}/${gifName}.gif`
        });
      }
    });
  });
  
  fs.writeFileSync(
    path.join(__dirname, 'orphaned-gifs.json'),
    JSON.stringify(orphanList, null, 2)
  );
  console.log(`\nOrphaned GIFs list exported to: orphaned-gifs.json`);
}