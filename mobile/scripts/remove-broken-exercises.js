#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// IDs of exercises with broken Supabase URLs to remove
const idsToRemove = [
  56, 57, 58, 59, 96, 97, 98, 99, 100, 102, 103, 104, 105, 109, 110,
  111, 112, 113, 168, 231, 252, 300, 308, 310, 311, 312, 313, 314,
  315, 316, 317, 318, 319, 320, 332
];

console.log(`Removing ${idsToRemove.length} exercises with broken GIF URLs...\n`);

// 1. Update exerciseDatabase.ts
const dbPath = path.join(__dirname, '..', 'src', 'data', 'exerciseDatabase.ts');
let dbContent = fs.readFileSync(dbPath, 'utf8');

// Count exercises before
const beforeCount = (dbContent.match(/\{\s*id:/g) || []).length;

// Remove each exercise
idsToRemove.forEach(id => {
  // Match the entire exercise object
  const regex = new RegExp(`\\s*\\{[^{}]*id:\\s*${id}[^}]*\\}(,)?`, 'g');
  const match = dbContent.match(regex);
  
  if (match) {
    console.log(`Removing ID ${id} from database...`);
    dbContent = dbContent.replace(regex, (match, comma) => {
      // If there's a comma, check if we need to keep it
      return '';
    });
  }
});

// Clean up any double commas or trailing commas
dbContent = dbContent.replace(/,\s*,/g, ',');
dbContent = dbContent.replace(/,\s*]/g, ']');

// Count exercises after
const afterCount = (dbContent.match(/\{\s*id:/g) || []).length;

// Write updated database
fs.writeFileSync(dbPath, dbContent);
console.log(`\nDatabase updated: ${beforeCount} → ${afterCount} exercises`);

// 2. Update staticThumbnails.ts
const thumbPath = path.join(__dirname, '..', 'src', 'constants', 'staticThumbnails.ts');
let thumbContent = fs.readFileSync(thumbPath, 'utf8');

// Count mappings before
const beforeThumbCount = (thumbContent.match(/'(\d+)':/g) || []).length;

// Remove each thumbnail mapping
idsToRemove.forEach(id => {
  const regex = new RegExp(`\\s*'${id}':[^,]+,[^\\n]*\\n?`, 'g');
  const match = thumbContent.match(regex);
  
  if (match) {
    console.log(`Removing ID ${id} from staticThumbnails...`);
    thumbContent = thumbContent.replace(regex, '');
  }
});

// Clean up any double commas
thumbContent = thumbContent.replace(/,\s*,/g, ',');
thumbContent = thumbContent.replace(/,\s*}/g, '\n}');

// Count mappings after
const afterThumbCount = (thumbContent.match(/'(\d+)':/g) || []).length;

// Write updated thumbnails
fs.writeFileSync(thumbPath, thumbContent);
console.log(`\nStaticThumbnails updated: ${beforeThumbCount} → ${afterThumbCount} mappings`);

console.log('\n✅ Cleanup complete!');
console.log(`Removed ${idsToRemove.length} exercises with broken GIF URLs`);