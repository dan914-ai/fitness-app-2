const fs = require('fs');
const path = require('path');

// Mapping of existing exercise IDs to new Korean GIF files
const gifMappings = {
  // Chest exercises
  'barbell_bench_press': {
    oldGif: './assets/exercise-gifs/all/barbell_bench_press.gif',
    newGif: './assets/exercise-gifs/chest/바벨 벤치프레스.gif',
    downloadPath: '/mnt/c/Users/danny/Downloads/chest exercises/바벨 벤치프레스.gif'
  },
  'dips': {
    oldGif: './assets/exercise-gifs/all/dips.gif',
    newGif: './assets/exercise-gifs/chest/딥스.gif',
    downloadPath: '/mnt/c/Users/danny/Downloads/chest exercises/딥스.gif'
  },
  'decline_cable_fly': {
    oldGif: null,
    newGif: './assets/exercise-gifs/chest/디클라인 케이블 플라이.gif',
    downloadPath: '/mnt/c/Users/danny/Downloads/chest exercises/디클라인 케이블 플라이.gif'
  },
  
  // Back exercises - map English IDs to Korean GIFs
  'lat_pulldown': {
    oldGif: './assets/exercise-gifs/back/lat-pulldown-standard.gif',
    newGif: './assets/exercise-gifs/back/랫 풀다운.gif',
    downloadPath: '/mnt/c/Users/danny/Downloads/back exercises/랫 풀다운.gif'
  },
  'seated_cable_row': {
    oldGif: './assets/exercise-gifs/back/cable-seated-row.gif',
    newGif: './assets/exercise-gifs/back/시티드 케이블 로우.gif',
    downloadPath: '/mnt/c/Users/danny/Downloads/back exercises/시티드 케이블 로우.gif'
  },
  'barbell_row': {
    oldGif: './assets/exercise-gifs/all/barbell-row.gif',
    newGif: './assets/exercise-gifs/back/바벨 로우.gif',
    downloadPath: '/mnt/c/Users/danny/Downloads/back exercises/바벨 로우.gif'
  },
  'dumbbell_row': {
    oldGif: './assets/exercise-gifs/matched/bent-over-dumbbell-row.gif',
    newGif: './assets/exercise-gifs/back/덤벨 로우.gif',
    downloadPath: '/mnt/c/Users/danny/Downloads/back exercises/덤벨 로우.gif'
  },
  't_bar_row': {
    oldGif: './assets/exercise-gifs/all/t-bar-row.gif',
    newGif: './assets/exercise-gifs/back/티바 로우.gif',
    downloadPath: '/mnt/c/Users/danny/Downloads/back exercises/티바 로우.gif'
  },
  'deadlift': {
    oldGif: null,
    newGif: './assets/exercise-gifs/back/데드리프트.gif',
    downloadPath: '/mnt/c/Users/danny/Downloads/back exercises/데드리프트.gif'
  },
  
  // Shoulder exercises
  'shoulder_press': {
    oldGif: './assets/exercise-gifs/shoulders/barbell-shoulder-press.gif',
    newGif: './assets/exercise-gifs/shoulders/바벨 숄더프레스.gif',
    downloadPath: '/mnt/c/Users/danny/Downloads/shoulder exercises/바벨 숄더프레스.gif'
  },
  'dumbbell_shoulder_press': {
    oldGif: null,
    newGif: './assets/exercise-gifs/shoulders/시티드 덤벨 숄더 프레스.gif',
    downloadPath: '/mnt/c/Users/danny/Downloads/shoulder exercises/시티드 덤벨 숄더 프레스.gif'
  },
  'lateral_raise': {
    oldGif: './assets/exercise-gifs/shoulders/dumbbell-lateral-raise.gif',
    newGif: './assets/exercise-gifs/shoulders/덤벨 레터럴 레이즈.gif',
    downloadPath: '/mnt/c/Users/danny/Downloads/shoulder exercises/덤벨 레터럴 레이즈.gif'
  },
  'front_raise': {
    oldGif: './assets/exercise-gifs/shoulders/barbell-front-raise.gif',
    newGif: './assets/exercise-gifs/shoulders/바벨 프론트 레이즈.gif',
    downloadPath: '/mnt/c/Users/danny/Downloads/shoulder exercises/바벨 프론트 레이즈.gif'
  },
  'arnold_press': {
    oldGif: './assets/exercise-gifs/all/arnold-press.gif',
    newGif: './assets/exercise-gifs/shoulders/아놀드 프레스.gif',
    downloadPath: '/mnt/c/Users/danny/Downloads/shoulder exercises/아놀드 프레스.gif'
  },
  'face_pull': {
    oldGif: './assets/exercise-gifs/all/face-pull.gif',
    newGif: './assets/exercise-gifs/shoulders/케이블 페이스 풀.gif',
    downloadPath: '/mnt/c/Users/danny/Downloads/shoulder exercises/케이블 페이스 풀.gif'
  }
};

// First, let's check which of these exercises exist in the database
const databasePath = path.join(__dirname, '../src/data/exerciseDatabase.ts');
const databaseContent = fs.readFileSync(databasePath, 'utf-8');

const updates = [];
const notFound = [];

for (const [exerciseId, mapping] of Object.entries(gifMappings)) {
  // Check if exercise exists in database
  const exercisePattern = new RegExp(`id:\\s*['"]${exerciseId}['"]`, 'g');
  if (databaseContent.match(exercisePattern)) {
    // Check if the Korean GIF file exists
    if (fs.existsSync(mapping.downloadPath)) {
      updates.push({
        exerciseId,
        ...mapping
      });
    } else {
      notFound.push({
        exerciseId,
        expectedFile: mapping.downloadPath
      });
    }
  }
}

console.log(`Found ${updates.length} exercises that can be updated with Korean GIFs`);
console.log(`Could not find GIF files for ${notFound.length} exercises`);

// Generate update script
const updateScript = `const fs = require('fs');
const path = require('path');

// Copy GIF files from Downloads to assets folder
const copyGifs = ${JSON.stringify(updates, null, 2)};

// First, copy the GIF files
copyGifs.forEach(update => {
  if (fs.existsSync(update.downloadPath)) {
    const destPath = path.join(__dirname, '..', update.newGif);
    const destDir = path.dirname(destPath);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    // Copy the file
    fs.copyFileSync(update.downloadPath, destPath);
    console.log(\`Copied \${path.basename(update.downloadPath)} to \${update.newGif}\`);
  }
});

// Now update the database
const databasePath = path.join(__dirname, '../src/data/exerciseDatabase.ts');
let databaseContent = fs.readFileSync(databasePath, 'utf-8');

let updatedCount = 0;

copyGifs.forEach(update => {
  // Find and update the exercise
  const pattern = new RegExp(
    \`(id:\\\\s*['\\"]\${update.exerciseId}['\\""][\\\\s\\\\S]*?media:\\\\s*{[\\\\s\\\\S]*?gifUrl:\\\\s*)['\\""][^'\\"]*['\\"]\`,
    'g'
  );
  
  databaseContent = databaseContent.replace(pattern, (match, prefix) => {
    updatedCount++;
    return prefix + \`'\${update.newGif}'\`;
  });
});

fs.writeFileSync(databasePath, databaseContent);
console.log(\`\\nUpdated \${updatedCount} exercises with Korean GIF paths\`);
`;

fs.writeFileSync(path.join(__dirname, 'updateWithKoreanGifs.js'), updateScript);

// Create a report
const report = {
  totalMappings: Object.keys(gifMappings).length,
  canBeUpdated: updates.length,
  missingGifFiles: notFound,
  updates: updates.map(u => ({
    id: u.exerciseId,
    koreanGif: path.basename(u.downloadPath)
  }))
};

fs.writeFileSync(
  path.join(__dirname, 'koreanGifUpdateReport.json'),
  JSON.stringify(report, null, 2)
);

console.log('\nCreated:');
console.log('- updateWithKoreanGifs.js: Script to copy GIFs and update database');
console.log('- koreanGifUpdateReport.json: Report of what will be updated');

if (updates.length > 0) {
  console.log('\nExercises that will be updated:');
  updates.forEach(u => {
    console.log(`  ${u.exerciseId} -> ${path.basename(u.downloadPath)}`);
  });
}

if (notFound.length > 0) {
  console.log('\nMissing GIF files:');
  notFound.forEach(nf => {
    console.log(`  ${nf.exerciseId}: ${path.basename(nf.expectedFile)}`);
  });
}