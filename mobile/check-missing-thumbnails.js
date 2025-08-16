const fs = require('fs');
const path = require('path');

// Read the exercise database
const dbContent = fs.readFileSync('./src/data/exerciseDatabase.ts', 'utf8');
const exerciseMatches = dbContent.match(/"id":\s*(\d+),[\s\S]*?"englishName":\s*"([^"]+)"/g);

const exercises = [];
if (exerciseMatches) {
  exerciseMatches.forEach(match => {
    const idMatch = match.match(/"id":\s*(\d+)/);
    const nameMatch = match.match(/"englishName":\s*"([^"]+)"/);
    if (idMatch && nameMatch) {
      exercises.push({
        id: idMatch[1],
        englishName: nameMatch[1]
      });
    }
  });
}

console.log(`Found ${exercises.length} exercises in database`);

// Read staticThumbnails mapping
const thumbContent = fs.readFileSync('./src/constants/staticThumbnails.ts', 'utf8');
const thumbMatches = thumbContent.match(/'(\d+)':\s*require\('([^']+)'\)/g);

const thumbnailPaths = {};
if (thumbMatches) {
  thumbMatches.forEach(match => {
    const idMatch = match.match(/'(\d+)'/);
    const pathMatch = match.match(/require\('([^']+)'\)/);
    if (idMatch && pathMatch) {
      thumbnailPaths[idMatch[1]] = pathMatch[1].replace('../../', './');
    }
  });
}

console.log(`Found ${Object.keys(thumbnailPaths).length} thumbnail mappings`);

// Check which files actually exist
const missingFiles = [];
const existingFiles = [];

for (const [id, filePath] of Object.entries(thumbnailPaths)) {
  const fullPath = path.join('./', filePath);
  if (fs.existsSync(fullPath)) {
    existingFiles.push(id);
  } else {
    const exercise = exercises.find(e => e.id === id);
    missingFiles.push({
      id,
      name: exercise ? exercise.englishName : 'Unknown',
      expectedPath: filePath
    });
  }
}

console.log(`\n✅ ${existingFiles.length} thumbnails exist`);
console.log(`❌ ${missingFiles.length} thumbnails missing`);

if (missingFiles.length > 0) {
  console.log('\nMissing thumbnails:');
  missingFiles.forEach(({ id, name, expectedPath }) => {
    console.log(`  ID ${id}: ${name}`);
    console.log(`    Expected: ${expectedPath}`);
  });
}

// Check for orphaned thumbnails (files without mappings)
const thumbnailDir = './assets/exercise-thumbnails';
const allThumbnailFiles = [];

function scanDir(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  items.forEach(item => {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      scanDir(fullPath);
    } else if (item.name.endsWith('.jpg')) {
      allThumbnailFiles.push(fullPath);
    }
  });
}

scanDir(thumbnailDir);

const mappedFiles = new Set(Object.values(thumbnailPaths));
const orphanedFiles = allThumbnailFiles.filter(file => !mappedFiles.has(file));

console.log(`\n📁 Total thumbnail files: ${allThumbnailFiles.length}`);
console.log(`🔗 Mapped files: ${mappedFiles.size}`);
console.log(`❓ Orphaned files: ${orphanedFiles.length}`);

if (orphanedFiles.length > 0) {
  console.log('\nOrphaned thumbnail files (not mapped to any exercise):');
  orphanedFiles.slice(0, 10).forEach(file => {
    console.log(`  ${file}`);
  });
  if (orphanedFiles.length > 10) {
    console.log(`  ... and ${orphanedFiles.length - 10} more`);
  }
}