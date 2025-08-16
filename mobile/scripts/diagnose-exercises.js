#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

console.log('=== EXERCISE LOADING DIAGNOSTIC ===\n');

// Step 1: Check database file
console.log('1️⃣ CHECKING DATABASE FILE');
const dbPath = path.join(__dirname, '..', 'src', 'data', 'exerciseDatabase.ts');
if (fs.existsSync(dbPath)) {
  const dbContent = fs.readFileSync(dbPath, 'utf8');
  
  // Check structure
  const hasExport = dbContent.includes('export default EXERCISE_DATABASE');
  const hasArray = dbContent.includes('const EXERCISE_DATABASE: ExerciseData[] = [');
  const exerciseCount = (dbContent.match(/"id":\s*\d+/g) || []).length;
  
  console.log(`  ✓ File exists: ${dbPath}`);
  console.log(`  ✓ Has export: ${hasExport}`);
  console.log(`  ✓ Has array declaration: ${hasArray}`);
  console.log(`  ✓ Exercise count: ${exerciseCount}`);
  
  // Try to actually load it
  try {
    const db = require('../src/data/exerciseDatabase.ts');
    console.log(`  ✓ Module loads: ${typeof db}`);
    console.log(`  ✓ Has default: ${!!db.default}`);
    console.log(`  ✓ Default is array: ${Array.isArray(db.default)}`);
    if (db.default && Array.isArray(db.default)) {
      console.log(`  ✓ Array length: ${db.default.length}`);
      if (db.default.length > 0) {
        console.log(`  ✓ First exercise:`, {
          id: db.default[0].id,
          name: db.default[0].name,
          muscleGroup: db.default[0].muscleGroup
        });
      }
    }
  } catch (e) {
    console.log(`  ❌ Failed to load module:`, e.message);
  }
} else {
  console.log(`  ❌ Database file not found!`);
}

// Step 2: Check service
console.log('\n2️⃣ CHECKING SERVICE');
const servicePath = path.join(__dirname, '..', 'src', 'services', 'exerciseDatabase.service.ts');
if (fs.existsSync(servicePath)) {
  const serviceContent = fs.readFileSync(servicePath, 'utf8');
  
  // Check imports
  const hasDbImport = serviceContent.includes('import EXERCISE_DATABASE');
  const hasExercisesProperty = serviceContent.includes('private exercises');
  const hasGetPaginatedMethod = serviceContent.includes('getExercisesPaginated');
  
  console.log(`  ✓ File exists: ${servicePath}`);
  console.log(`  ✓ Imports database: ${hasDbImport}`);
  console.log(`  ✓ Has exercises property: ${hasExercisesProperty}`);
  console.log(`  ✓ Has getPaginated method: ${hasGetPaginatedMethod}`);
  
  // Check for console.logs
  const consoleLogs = serviceContent.match(/console\.log.*exercises/gi) || [];
  console.log(`  ✓ Debug logs present: ${consoleLogs.length}`);
} else {
  console.log(`  ❌ Service file not found!`);
}

// Step 3: Check thumbnails
console.log('\n3️⃣ CHECKING THUMBNAILS');
const thumbPath = path.join(__dirname, '..', 'src', 'constants', 'staticThumbnails.ts');
if (fs.existsSync(thumbPath)) {
  const thumbContent = fs.readFileSync(thumbPath, 'utf8');
  
  const hasStaticThumbnails = thumbContent.includes('export const staticThumbnails');
  const hasGetFunction = thumbContent.includes('export function getStaticThumbnail');
  const thumbCount = (thumbContent.match(/'\d+':/g) || []).length;
  
  console.log(`  ✓ File exists: ${thumbPath}`);
  console.log(`  ✓ Has staticThumbnails: ${hasStaticThumbnails}`);
  console.log(`  ✓ Has getStaticThumbnail: ${hasGetFunction}`);
  console.log(`  ✓ Thumbnail mappings: ${thumbCount}`);
} else {
  console.log(`  ❌ Thumbnails file not found!`);
}

// Step 4: Check screen
console.log('\n4️⃣ CHECKING EXERCISE SELECTION SCREEN');
const screenPath = path.join(__dirname, '..', 'src', 'screens', 'record', 'ExerciseSelectionScreen.tsx');
if (fs.existsSync(screenPath)) {
  const screenContent = fs.readFileSync(screenPath, 'utf8');
  
  const hasServiceImport = screenContent.includes('exerciseDatabaseService');
  const hasGetPaginatedCall = screenContent.includes('getExercisesPaginated');
  const hasConsoleLogs = screenContent.includes('console.log');
  
  console.log(`  ✓ File exists: ${screenPath}`);
  console.log(`  ✓ Imports service: ${hasServiceImport}`);
  console.log(`  ✓ Calls getPaginated: ${hasGetPaginatedCall}`);
  console.log(`  ✓ Has debug logs: ${hasConsoleLogs}`);
  
  // Check the actual call
  const callMatch = screenContent.match(/exerciseDatabaseService\.getExercisesPaginated\([^)]+\)/);
  if (callMatch) {
    console.log(`  ✓ getPaginated call:`, callMatch[0].substring(0, 100) + '...');
  }
} else {
  console.log(`  ❌ Screen file not found!`);
}

// Step 5: Test actual loading
console.log('\n5️⃣ TESTING ACTUAL DATA LOADING');
try {
  // Try to load the service and get exercises
  delete require.cache[require.resolve('../src/services/exerciseDatabase.service.ts')];
  delete require.cache[require.resolve('../src/data/exerciseDatabase.ts')];
  
  console.log('  ⏳ Loading fresh modules...');
  
  const mockExerciseDatabase = require('../src/data/exerciseDatabase.ts');
  console.log(`  ✓ Database module loaded:`, typeof mockExerciseDatabase.default);
  
  if (Array.isArray(mockExerciseDatabase.default)) {
    console.log(`  ✓ Database has ${mockExerciseDatabase.default.length} exercises`);
    
    // Simulate what the service does
    const exercises = mockExerciseDatabase.default;
    const filtered = exercises.slice(0, 20);
    console.log(`  ✓ First 20 exercises available`);
    console.log(`  ✓ Sample exercises:`);
    filtered.slice(0, 3).forEach(ex => {
      console.log(`    - ${ex.id}: ${ex.name} (${ex.muscleGroup})`);
    });
  } else {
    console.log(`  ❌ Database is not an array!`);
  }
  
} catch (e) {
  console.log(`  ❌ Failed to test loading:`, e.message);
  console.log(`     Stack:`, e.stack);
}

console.log('\n' + '='.repeat(50));
console.log('📊 DIAGNOSIS SUMMARY');
console.log('='.repeat(50));

// Final recommendations
console.log('\n🔧 RECOMMENDATIONS:');
console.log('1. Check browser console for actual runtime errors');
console.log('2. Look for "this.exercises length" in console logs');
console.log('3. Check if getExercisesPaginated is returning data');
console.log('4. Verify the service is being instantiated correctly');
console.log('5. Check for any webpack/bundling issues');

console.log('\n✅ Diagnostic complete!');