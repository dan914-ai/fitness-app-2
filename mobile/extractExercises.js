const fs = require('fs');
const path = require('path');

// Read the exercise database
const dbPath = path.join(__dirname, 'src/data/exerciseDatabase.ts');
const content = fs.readFileSync(dbPath, 'utf8');

// Extract the JavaScript array portion
const arrayMatch = content.match(/const EXERCISE_DATABASE.*?=\s*(\[[\s\S]*?\]);/);
if (!arrayMatch) {
  console.error('Could not find EXERCISE_DATABASE array');
  process.exit(1);
}

// Parse the array
const exerciseData = eval(arrayMatch[1]);

// Generate static thumbnail mappings
const mappings = {};
exerciseData.forEach(exercise => {
  // Extract the path from the GIF URL
  const gifUrl = exercise.imageUrl;
  if (gifUrl && gifUrl.includes('exercise-gifs/')) {
    // Convert GIF URL to static JPEG URL
    const staticUrl = gifUrl.replace('.gif', '-static.jpg');
    mappings[exercise.id.toString()] = staticUrl;
  }
});

// Output as TypeScript code
console.log('// STATIC THUMBNAIL URLS - These are REAL JPEG files, NOT GIFs');
console.log('const STATIC_THUMBNAILS: Record<string, string> = {');

Object.entries(mappings).forEach(([id, url], index, array) => {
  const comma = index < array.length - 1 ? ',' : '';
  console.log(`  '${id}': '${url}'${comma}`);
});

console.log('};');
console.log(`\n// Total exercises: ${Object.keys(mappings).length}`);