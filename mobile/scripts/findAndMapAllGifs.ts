const fs = require('fs');
const path = require('path');

// Check all available GIFs
const gifFolders = {
  chest: '/mnt/c/Users/danny/Downloads/chest exercises',
  back: '/mnt/c/Users/danny/Downloads/back exercises',
  shoulder: '/mnt/c/Users/danny/Downloads/shoulder exercises'
};

const availableGifs = {};

// Scan all GIF files
for (const [category, folder] of Object.entries(gifFolders)) {
  try {
    if (fs.existsSync(folder)) {
      const files = fs.readdirSync(folder).filter(f => f.endsWith('.gif'));
      availableGifs[category] = files;
      console.log(`\n${category.toUpperCase()} GIFs (${files.length}):`);
      files.forEach(f => console.log(`  - ${f}`));
    }
  } catch (e) {
    console.log(`Cannot read ${category} folder`);
  }
}

// Read database to find matching exercises
const databasePath = path.join(__dirname, '../src/data/exerciseDatabase.ts');
const databaseContent = fs.readFileSync(databasePath, 'utf-8');

// Extract all exercise IDs
const exerciseIds = [];
const idMatches = databaseContent.matchAll(/id:\s*['"]([^'"]+)['"]/g);
for (const match of idMatches) {
  exerciseIds.push(match[1]);
}

// Create mappings based on pattern matching
const mappings = [];

// Common Korean to English mappings
const koreanToEnglish = {
  // Chest
  '바벨 벤치프레스': ['barbell_bench_press', 'barbell-bench-press'],
  '덤벨 벤치프레스': ['dumbbell_bench_press', 'dumbbell-bench-press'],
  '덤벨 인클라인 벤치 프레스': ['dumbbell_incline_bench_press', 'dumbbell-incline-bench-press', 'incline-dumbbell-bench-press'],
  '바벨 인클라인 벤치 프레스': ['barbell_incline_bench_press', 'barbell-incline-bench-press', 'incline-barbell-bench-press'],
  '디클라인 바벨 벤치프레스': ['decline_barbell_bench_press', 'decline-barbell-bench-press', 'barbell-decline-bench-press'],
  '딥스': ['dips', 'chest-dips', 'parallel-dips'],
  '머신 체스트 프레스': ['machine_chest_press', 'machine-chest-press', 'chest-press-machine'],
  '케이블 크로스오버': ['cable_crossover', 'cable-crossover', 'cable-cross-over'],
  
  // Back
  '데드리프트': ['deadlift', 'barbell_deadlift', 'barbell-deadlift'],
  '랫 풀다운': ['lat_pulldown', 'lat-pulldown', 'latpulldown'],
  '바벨 로우': ['barbell_row', 'barbell-row', 'bent-over-barbell-row'],
  '덤벨 로우': ['dumbbell_row', 'dumbbell-row', 'bent-over-dumbbell-row', 'one-arm-dumbbell-row'],
  '시티드 케이블 로우': ['seated_cable_row', 'seated-cable-row', 'cable-seated-row'],
  '케이블 로우': ['cable_row', 'cable-row'],
  '티바 로우': ['t_bar_row', 't-bar-row', 'tbar-row'],
  
  // Shoulders
  '바벨 숄더프레스': ['shoulder_press', 'barbell-shoulder-press', 'military-press', 'overhead-press'],
  '덤벨 숄더 프레스': ['dumbbell_shoulder_press', 'dumbbell-shoulder-press', 'seated-dumbbell-shoulder-press'],
  '덤벨 레터럴 레이즈': ['lateral_raise', 'dumbbell-lateral-raise', 'side-lateral-raise'],
  '아놀드 프레스': ['arnold_press', 'arnold-press'],
  '시티드 덤벨 숄더 프레스': ['seated_dumbbell_shoulder_press', 'seated-dumbbell-shoulder-press'],
  '바벨 프론트 레이즈': ['front_raise', 'barbell-front-raise', 'front-barbell-raise']
};

// Find matches
for (const [category, gifs] of Object.entries(availableGifs)) {
  for (const gif of gifs) {
    const gifName = gif.replace('.gif', '');
    const possibleIds = koreanToEnglish[gifName] || [];
    
    // Check each possible ID
    for (const possibleId of possibleIds) {
      if (exerciseIds.includes(possibleId)) {
        mappings.push({
          exerciseId: possibleId,
          gif: gif,
          category: category
        });
        break; // Found a match, stop checking
      }
    }
  }
}

console.log(`\n\nFound ${mappings.length} matching exercises`);

// Generate the final implementation script
const implementScript = `const path = require('path');
const { SafeGifImplementation } = require('./safeGifImplementation.ts');

// Verified mappings
const gifMappings = ${JSON.stringify(mappings, null, 2)};

async function implementAllGifs() {
  const safe = new SafeGifImplementation();
  
  console.log(\`Starting implementation of \${gifMappings.length} GIFs...\`);
  
  // Create backup
  if (!safe.createBackup()) {
    console.error('Failed to create backup. Aborting.');
    return;
  }

  const successful = [];
  const failed = [];

  for (const mapping of gifMappings) {
    const sourcePath = \`/mnt/c/Users/danny/Downloads/\${mapping.category} exercises/\${mapping.gif}\`;
    const destPath = \`./assets/exercise-gifs/\${mapping.category}/\${mapping.gif}\`;
    
    console.log(\`\\nProcessing: \${mapping.exerciseId} -> \${mapping.gif}\`);
    
    // Check if already processed
    const dbContent = require('fs').readFileSync(safe.databasePath, 'utf-8');
    if (dbContent.includes(\`'\${destPath}'\`)) {
      console.log('  ⏭️  Already updated, skipping');
      continue;
    }
    
    // Verify source
    if (!safe.verifyGifExists(sourcePath)) {
      console.log(\`  ❌ Source not found\`);
      failed.push(mapping);
      continue;
    }

    // Copy file
    const absoluteDestPath = path.join(__dirname, '..', destPath);
    if (safe.copyGifFile(sourcePath, absoluteDestPath)) {
      console.log(\`  ✅ Copied GIF\`);
      
      // Update database
      if (safe.updateExerciseGif(mapping.exerciseId, destPath)) {
        console.log(\`  ✅ Updated database\`);
        successful.push(mapping);
      } else {
        console.log(\`  ❌ Failed to update database\`);
        failed.push(mapping);
      }
    } else {
      console.log(\`  ❌ Failed to copy\`);
      failed.push(mapping);
    }
  }

  // Summary
  console.log(\`\\n=== Final Summary ===\`);
  console.log(\`✅ Successful: \${successful.length}\`);
  console.log(\`❌ Failed: \${failed.length}\`);
  
  if (successful.length > 0) {
    console.log(\`\\nSuccessfully implemented:\`);
    successful.forEach(s => console.log(\`  - \${s.exerciseId} -> \${s.gif}\`));
  }
  
  if (failed.length > 0) {
    console.log(\`\\nFailed:\`);
    failed.forEach(f => console.log(\`  - \${f.exerciseId} -> \${f.gif}\`));
  }
}

implementAllGifs();
`;

fs.writeFileSync(path.join(__dirname, 'implementAllGifs.js'), implementScript);
console.log('\nCreated implementAllGifs.js with', mappings.length, 'mappings');