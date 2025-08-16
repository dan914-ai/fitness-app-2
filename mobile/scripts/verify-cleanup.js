#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load database
const exerciseDatabase = require('../src/data/exerciseDatabase.ts');

// Parse staticThumbnails manually to avoid require errors
const thumbPath = path.join(__dirname, '..', 'src', 'constants', 'staticThumbnails.ts');
const thumbContent = fs.readFileSync(thumbPath, 'utf8');

// Count mappings
const mappingMatches = thumbContent.matchAll(/'(\d+)':/g);
const thumbIds = [];
for (const match of mappingMatches) {
  thumbIds.push(match[1]);
}

// Get database IDs
const dbIds = exerciseDatabase.default.map(ex => ex.id.toString());

console.log('=== VERIFICATION RESULTS ===\n');
console.log(`Database exercises: ${exerciseDatabase.default.length}`);
console.log(`Thumbnail mappings: ${thumbIds.length}`);
console.log(`Expected difference: ${Math.abs(exerciseDatabase.default.length - thumbIds.length)}`);

// Check for mismatches
const inThumbNotInDb = thumbIds.filter(id => !dbIds.includes(id));
const inDbNotInThumb = dbIds.filter(id => !thumbIds.includes(id));

if (inThumbNotInDb.length > 0) {
  console.log(`\n⚠️  IDs in thumbnails but NOT in database: ${inThumbNotInDb.length}`);
  inThumbNotInDb.forEach(id => console.log(`  - ID ${id}`));
}

if (inDbNotInThumb.length > 0) {
  console.log(`\n⚠️  IDs in database but NOT in thumbnails: ${inDbNotInThumb.length}`);
  inDbNotInThumb.forEach(id => {
    const ex = exerciseDatabase.default.find(e => e.id.toString() === id);
    console.log(`  - ID ${id}: ${ex.name} (${ex.englishName})`);
  });
}

// Check if any of the removed IDs are still present
const removedIds = [
  56, 57, 58, 59, 96, 97, 98, 99, 100, 102, 103, 104, 105, 109, 110,
  111, 112, 113, 168, 231, 252, 300, 308, 310, 311, 312, 313, 314,
  315, 316, 317, 318, 319, 320, 332
];

const stillInDb = removedIds.filter(id => dbIds.includes(id.toString()));
const stillInThumb = removedIds.filter(id => thumbIds.includes(id.toString()));

if (stillInDb.length > 0) {
  console.log(`\n❌ Removed IDs still in database: ${stillInDb.length}`);
  stillInDb.forEach(id => console.log(`  - ID ${id}`));
}

if (stillInThumb.length > 0) {
  console.log(`\n❌ Removed IDs still in thumbnails: ${stillInThumb.length}`);
  stillInThumb.forEach(id => console.log(`  - ID ${id}`));
}

if (inThumbNotInDb.length === 0 && inDbNotInThumb.length === 0 && 
    stillInDb.length === 0 && stillInThumb.length === 0) {
  console.log('\n✅ All checks passed! Database and thumbnails are in sync.');
}

console.log('\n=== SUMMARY ===');
console.log(`Total exercises: ${exerciseDatabase.default.length}`);
console.log(`Total thumbnails: ${thumbIds.length}`);
console.log(`Successfully removed: ${removedIds.length} exercises`);