const fs = require('fs');
const path = require('path');

const databasePath = path.join(__dirname, '../src/data/exerciseDatabase.ts');

// Read the database file
let databaseContent = fs.readFileSync(databasePath, 'utf-8');

// Fix malformed media objects
// Pattern: media: {\n      gifUrl: '...'\n    ,
// Should be: media: {\n      gifUrl: '...',
databaseContent = databaseContent.replace(/gifUrl:\s*(['"`][^'"`]+['"`])\s*\n\s*,/g, "gifUrl: $1,");

// Fix closing bracket issues
databaseContent = databaseContent.replace(/supabaseGifUrl:\s*(['"`][^'"`]+['"`])}/g, "supabaseGifUrl: $1\n    }");

// Count how many exercises have proper media objects now
const mediaMatches = databaseContent.match(/media:\s*{[^}]*}/g);
console.log(`Found ${mediaMatches ? mediaMatches.length : 0} media objects`);

// Write the fixed content
fs.writeFileSync(databasePath, databaseContent);

console.log('Fixed media object formatting issues');

// Verify a sample
const sampleCheck = databaseContent.match(/media:\s*{\s*\n\s*gifUrl:[^}]+}/);
if (sampleCheck) {
  console.log('\nSample of fixed media object:');
  console.log(sampleCheck[0]);
}