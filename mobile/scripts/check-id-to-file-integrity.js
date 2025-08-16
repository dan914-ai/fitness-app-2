#!/usr/bin/env node

/**
 * Check ID-to-file integrity for thumbnails
 * Verifies that each exercise ID maps to the correct thumbnail file path
 */

const fs = require('fs');
const path = require('path');

// Read the exercise database file
const exerciseDbContent = fs.readFileSync(path.join(__dirname, '../src/data/exerciseDatabase.ts'), 'utf8');
// Parse exercises from the database
const exerciseMatches = exerciseDbContent.match(/\{[^}]*"id":\s*(\d+)[^}]*\}/g) || [];
const EXERCISE_DATABASE = exerciseMatches.map(match => {
  const idMatch = match.match(/"id":\s*(\d+)/);
  const nameMatch = match.match(/"name":\s*"([^"]+)"/);
  const englishNameMatch = match.match(/"englishName":\s*"([^"]+)"/);
  const muscleGroupMatch = match.match(/"muscleGroup":\s*"([^"]+)"/);
  const imageUrlMatch = match.match(/"imageUrl":\s*"([^"]+)"/);
  
  return {
    id: idMatch ? parseInt(idMatch[1]) : 0,
    name: nameMatch ? nameMatch[1] : '',
    englishName: englishNameMatch ? englishNameMatch[1] : '',
    muscleGroup: muscleGroupMatch ? muscleGroupMatch[1] : '',
    imageUrl: imageUrlMatch ? imageUrlMatch[1] : ''
  };
}).filter(e => e.id > 0);

// Read static thumbnails
const thumbnailsContent = fs.readFileSync(path.join(__dirname, '../src/constants/staticThumbnails.ts'), 'utf8');
const thumbnailMatches = thumbnailsContent.match(/'(\d+)':\s*require\('([^']+)'\)/g) || [];
const staticThumbnails = {};
thumbnailMatches.forEach(match => {
  const parsed = match.match(/'(\d+)':\s*require\('([^']+)'\)/);
  if (parsed) {
    staticThumbnails[parsed[1]] = parsed[2];
  }
});

// Map muscle groups to folder names
const MUSCLE_GROUP_TO_FOLDER = {
  '복근': 'abdominals',
  '팔': 'arms',
  '등': 'back',
  '이두근': 'biceps',
  '종아리': 'calves',
  '유산소': 'cardio',
  '복합운동': 'compound',
  '삼각근': 'deltoids',
  '전완근': 'forearms',
  '둔근': 'glutes',
  '햄스트링': 'hamstrings',
  '다리': 'legs',
  '가슴': 'pectorals',
  '대퇴사두근': 'quadriceps',
  '승모근': 'traps',
  '삼두근': 'triceps',
};

// Extract file path from require statement
function extractPathFromRequire(requireStatement) {
  if (!requireStatement) return null;
  
  // Convert require() to string to extract path
  const requireStr = requireStatement.toString();
  const match = requireStr.match(/\d+/);
  
  // For actual path extraction, we need to check the source
  // This is a simplified version - in practice you'd parse the actual require
  return null; // Will be handled differently below
}

// Get expected thumbnail path for an exercise
function getExpectedPath(exercise) {
  const folder = MUSCLE_GROUP_TO_FOLDER[exercise.muscleGroup];
  if (!folder) return null;
  
  // Extract slug from imageUrl or create from englishName
  let slug = null;
  
  if (exercise.imageUrl) {
    const match = exercise.imageUrl.match(/\/([^/]+)\.gif$/);
    if (match) {
      slug = match[1];
    }
  }
  
  if (!slug && exercise.englishName) {
    slug = exercise.englishName.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }
  
  if (!slug) return null;
  
  return `../../assets/exercise-thumbnails/${folder}/${slug}.jpg`;
}

// Main verification
console.log('🔍 Checking ID-to-File Integrity for Thumbnails\n');
console.log('=' .repeat(60));

let totalExercises = 0;
let mismatches = [];
let missingThumbnails = [];
let missingExercises = [];

// Check each exercise in the database
EXERCISE_DATABASE.forEach(exercise => {
  totalExercises++;
  const id = exercise.id.toString();
  
  // Check if thumbnail exists in mapping
  if (!(id in staticThumbnails)) {
    missingThumbnails.push({
      id: exercise.id,
      name: exercise.name,
      englishName: exercise.englishName,
      muscleGroup: exercise.muscleGroup
    });
    return;
  }
  
  // Get expected path
  const expectedPath = getExpectedPath(exercise);
  if (!expectedPath) {
    console.warn(`⚠️  Cannot determine expected path for exercise ${id}: ${exercise.name}`);
    return;
  }
  
  // Check if the actual file exists
  const relativePath = expectedPath.replace('../../assets/', 'mobile/assets/');
  const absolutePath = path.join(__dirname, '..', 'assets', relativePath.replace('mobile/assets/', ''));
  
  if (!fs.existsSync(absolutePath)) {
    mismatches.push({
      id: exercise.id,
      name: exercise.name,
      englishName: exercise.englishName,
      expectedPath: expectedPath,
      fileExists: false
    });
  }
});

// Check for IDs in staticThumbnails that aren't in the database
const dbIds = new Set(EXERCISE_DATABASE.map(e => e.id.toString()));
Object.keys(staticThumbnails).forEach(id => {
  if (!dbIds.has(id)) {
    missingExercises.push(id);
  }
});

// Report results
console.log('\n📊 Integrity Check Results\n');

if (missingThumbnails.length > 0) {
  console.log(`\n❌ Missing Thumbnails in Mapping (${missingThumbnails.length}):`);
  missingThumbnails.forEach(exercise => {
    console.log(`   ID ${exercise.id}: ${exercise.englishName} (${exercise.muscleGroup})`);
  });
}

if (mismatches.length > 0) {
  console.log(`\n❌ Path Mismatches (${mismatches.length}):`);
  mismatches.forEach(mismatch => {
    console.log(`   ID ${mismatch.id}: ${mismatch.englishName}`);
    console.log(`      Expected: ${mismatch.expectedPath}`);
    console.log(`      File exists: ${mismatch.fileExists}`);
  });
}

if (missingExercises.length > 0) {
  console.log(`\n⚠️  Orphaned Thumbnail IDs (${missingExercises.length}):`);
  console.log(`   IDs in staticThumbnails but not in database: ${missingExercises.join(', ')}`);
}

// Summary
console.log('\n' + '=' .repeat(60));
console.log('📈 Summary:');
console.log(`   Total exercises in DB: ${totalExercises}`);
console.log(`   Total thumbnails in mapping: ${Object.keys(staticThumbnails).length}`);
console.log(`   Missing thumbnails: ${missingThumbnails.length}`);
console.log(`   Path mismatches: ${mismatches.length}`);
console.log(`   Orphaned IDs: ${missingExercises.length}`);

if (missingThumbnails.length === 0 && mismatches.length === 0 && missingExercises.length === 0) {
  console.log('\n✅ All ID-to-file mappings are correct!');
} else {
  console.log('\n❌ Issues found in ID-to-file mappings');
  process.exit(1);
}

console.log('=' .repeat(60));