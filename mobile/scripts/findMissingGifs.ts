const fs = require('fs');
const path = require('path');

const databasePath = path.join(__dirname, '../src/data/exerciseDatabase.ts');
const databaseContent = fs.readFileSync(databasePath, 'utf-8');

// First, let's check what GIF files we actually have
const gifDirectories = [
  '/mnt/c/Users/danny/.vscode/new finess app/mobile/assets/exercise-gifs/all',
  '/mnt/c/Users/danny/.vscode/new finess app/mobile/assets/exercise-gifs/back',
  '/mnt/c/Users/danny/.vscode/new finess app/mobile/assets/exercise-gifs/chest',
  '/mnt/c/Users/danny/.vscode/new finess app/mobile/assets/exercise-gifs/shoulders',
  '/mnt/c/Users/danny/.vscode/new finess app/mobile/assets/exercise-gifs/matched',
  '/mnt/c/Users/danny/Downloads/chest exercises',
  '/mnt/c/Users/danny/Downloads/back exercises',
  '/mnt/c/Users/danny/Downloads/shoulder exercises'
];

const availableGifs = new Map();

// Collect all available GIFs
for (const dir of gifDirectories) {
  try {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        if (file.endsWith('.gif')) {
          // Store both the filename and full path
          availableGifs.set(file.toLowerCase(), path.join(dir, file));
        }
      });
    }
  } catch (e) {
    console.log(`Could not read directory: ${dir}`);
  }
}

console.log(`Found ${availableGifs.size} GIF files available`);

// Find exercises in database
const exercisePattern = /{\s*id:\s*['"]([^'"]+)['"][\s\S]*?media:\s*{([^}]*)}/g;
let match;
const exercisesNeedingGifs = [];

while ((match = exercisePattern.exec(databaseContent)) !== null) {
  const id = match[1];
  const mediaContent = match[2];
  
  // Check if it's using placeholder or missing real GIF
  if (mediaContent.includes('placeholder.gif') || 
      !mediaContent.includes('gifUrl:') ||
      mediaContent.includes("gifUrl: './assets/exercise-gifs/placeholder.gif'")) {
    exercisesNeedingGifs.push(id);
  }
}

console.log(`\nFound ${exercisesNeedingGifs.length} exercises needing GIFs`);

// Try to match exercises with available GIFs
const matches = [];
const noMatches = [];

for (const exerciseId of exercisesNeedingGifs) {
  let found = false;
  
  // Try different naming patterns
  const possibleNames = [
    `${exerciseId}.gif`,
    `${exerciseId.replace(/_/g, '-')}.gif`,
    `${exerciseId.replace(/_/g, ' ')}.gif`,
    // Convert to Korean names for some common exercises
    exerciseId === 'barbell_bench_press' ? '바벨 벤치프레스.gif' : null,
    exerciseId === 'dips' ? '딥스.gif' : null,
    exerciseId === 'deadlift' ? '데드리프트.gif' : null,
    exerciseId === 'pull_ups' ? '풀업.gif' : null,
    exerciseId === 'push_ups' ? '푸시업.gif' : null,
  ].filter(Boolean);
  
  for (const possibleName of possibleNames) {
    if (availableGifs.has(possibleName.toLowerCase())) {
      matches.push({
        exerciseId,
        gifPath: availableGifs.get(possibleName.toLowerCase()),
        gifFilename: possibleName
      });
      found = true;
      break;
    }
  }
  
  if (!found) {
    noMatches.push(exerciseId);
  }
}

console.log(`\nMatched ${matches.length} exercises with available GIFs`);
console.log(`Could not find GIFs for ${noMatches.length} exercises`);

// Create update script
const updateScript = `const fs = require('fs');
const path = require('path');

// Exercises that can be updated with GIFs
const updates = ${JSON.stringify(matches, null, 2)};

// Function to update the database
function updateExerciseGifs() {
  const databasePath = path.join(__dirname, '../src/data/exerciseDatabase.ts');
  let databaseContent = fs.readFileSync(databasePath, 'utf-8');
  
  let updatedCount = 0;
  
  for (const update of updates) {
    const exercisePattern = new RegExp(
      \`(id:\\\\s*['\\"]\${update.exerciseId}['\\""][\\\\s\\\\S]*?media:\\\\s*{)([^}]*)(})\`,
      'g'
    );
    
    databaseContent = databaseContent.replace(exercisePattern, (match, before, mediaContent, after) => {
      // Extract the local path relative to assets folder
      const relativePath = update.gifPath.includes('Downloads') 
        ? \`./assets/exercise-gifs/\${path.basename(update.gifPath)}\`
        : update.gifPath.replace(/.*assets\\/exercise-gifs\\//, './assets/exercise-gifs/');
      
      const newMediaContent = \`
      gifUrl: '\${relativePath}',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/\${update.exerciseId}.gif'\`;
      
      updatedCount++;
      return before + newMediaContent + '\\n    ' + after;
    });
  }
  
  fs.writeFileSync(databasePath, databaseContent);
  console.log(\`Updated \${updatedCount} exercises with GIF URLs\`);
}

updateExerciseGifs();
`;

fs.writeFileSync(path.join(__dirname, 'updateMissingGifs.js'), updateScript);

// Save results
const results = {
  totalGifsAvailable: availableGifs.size,
  exercisesNeedingGifs: exercisesNeedingGifs.length,
  matched: matches,
  unmatched: noMatches,
  sampleGifFiles: Array.from(availableGifs.keys()).slice(0, 20)
};

fs.writeFileSync(
  path.join(__dirname, 'missingGifsReport.json'),
  JSON.stringify(results, null, 2)
);

console.log('\nCreated:');
console.log('- updateMissingGifs.js: Script to update the database');
console.log('- missingGifsReport.json: Detailed report of findings');

if (matches.length > 0) {
  console.log('\nSample matches:');
  matches.slice(0, 5).forEach(m => {
    console.log(`  ${m.exerciseId} -> ${path.basename(m.gifPath)}`);
  });
}