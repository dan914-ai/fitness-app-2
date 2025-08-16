const fs = require('fs');
const path = require('path');

// Cardio exercises with proper format matching existing database structure
const cardioExercises = [
  {
    filename: '스텝 밀.gif',
    id: 'step_mill',
    koreanName: '스텝 밀',
    category: 'cardio',
    equipment: ['스텝 밀 머신']
  },
  {
    filename: '싸이클.gif',
    id: 'stationary_bike',
    koreanName: '싸이클',
    category: 'cardio',
    equipment: ['실내 자전거']
  },
  {
    filename: '일립티컬 머신.gif',
    id: 'elliptical_machine',
    koreanName: '일립티컬 머신',
    category: 'cardio',
    equipment: ['일립티컬 머신']
  },
  {
    filename: '트레드밀 (런닝머신).gif',
    id: 'treadmill',
    koreanName: '트레드밀',
    category: 'cardio',
    equipment: ['트레드밀']
  }
];

// Check existing database
const databasePath = path.join(__dirname, '../src/data/exerciseDatabase.ts');
const databaseContent = fs.readFileSync(databasePath, 'utf-8');

// Extract existing IDs
const existingIds = new Set();
const idMatches = databaseContent.matchAll(/id:\s*['"]([^'"]+)['"]/g);
for (const match of idMatches) {
  existingIds.add(match[1]);
}

// Find new exercises
const newExercises = cardioExercises.filter(ex => !existingIds.has(ex.id));
const existingToUpdate = cardioExercises.filter(ex => existingIds.has(ex.id));

console.log(`Total cardio exercises: ${cardioExercises.length}`);
console.log(`New exercises to add: ${newExercises.length}`);
console.log(`Existing exercises to update: ${existingToUpdate.length}`);

// Generate properly formatted exercises
const generateCardioExercise = (exercise) => {
  return `  {
    id: '${exercise.id}',
    name: {
      korean: '${exercise.koreanName}',
      english: '${exercise.koreanName}',
      romanization: '${exercise.koreanName}'
    },
    description: {
      korean: '심혈관 지구력을 향상시키는 유산소 운동',
      english: 'Cardiovascular exercise for endurance'
    },
    targetMuscles: {
      primary: ['심장', '폐'],
      secondary: ['다리', '코어'],
      stabilizers: []
    },
    equipment: ${JSON.stringify(exercise.equipment)},
    category: 'cardio',
    bodyParts: ['전신'],
    difficulty: 'beginner',
    instructions: {
      korean: [
        '기계에 올라가 안전하게 자세를 잡습니다',
        '편안한 속도로 시작합니다',
        '점진적으로 강도를 높입니다',
        '일정한 페이스를 유지합니다'
      ],
      english: [
        'Get on the machine safely',
        'Start at a comfortable pace',
        'Gradually increase intensity',
        'Maintain steady pace'
      ]
    },
    tips: {
      korean: [
        '올바른 자세를 유지하세요',
        '호흡을 규칙적으로 하세요',
        '수분을 충분히 섭취하세요'
      ],
      english: [
        'Maintain proper posture',
        'Breathe regularly',
        'Stay hydrated'
      ]
    },
    commonMistakes: {
      korean: [
        '너무 빠르게 시작하기',
        '잘못된 자세',
        '워밍업 없이 시작하기'
      ],
      english: [
        'Starting too fast',
        'Poor posture',
        'Skipping warm-up'
      ]
    },
    sets: {
      recommended: '1',
      beginner: '1',
      intermediate: '1',
      advanced: '1'
    },
    reps: {
      recommended: '20-30분',
      beginner: '15-20분',
      intermediate: '20-30분',
      advanced: '30-45분'
    },
    media: {
      gifUrl: './assets/exercise-gifs/cardio/${exercise.filename}',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/${exercise.id}.gif'
    }
  }`;
};

// Generate exercises to add
const exercisesToAdd = newExercises.map(ex => generateCardioExercise(ex)).join(',\n');

// Create output files
fs.writeFileSync(
  path.join(__dirname, 'newCardioExercises.ts'),
  `// New cardio exercises to add to database
export const newCardioExercises = [
${exercisesToAdd}
];

// Existing exercises to update with GIFs:
export const cardioExercisesToUpdate = ${JSON.stringify(existingToUpdate.map(ex => ({
  id: ex.id,
  gifFile: ex.filename
})), null, 2)};
`
);

// Create Supabase upload summary
const supabaseUploadSummary = `# Cardio Exercises - Supabase Upload Summary

## Total: ${cardioExercises.length} GIFs

| Local Filename | Supabase Filename | Exercise ID |
|----------------|-------------------|-------------|
${cardioExercises.map(ex => `| ${ex.filename} | ${ex.id}.gif | ${ex.id} |`).join('\n')}

## Upload Instructions:
1. Upload each GIF with the English ID as filename
2. Example: Upload '트레드밀 (런닝머신).gif' as 'treadmill.gif'
3. Ensure all files are in the 'exercise-gifs' bucket

## Exercise Details:
- **Step Mill**: Stair climbing machine for intense cardio
- **Stationary Bike**: Indoor cycling for low-impact cardio
- **Elliptical Machine**: Full-body low-impact cardio machine
- **Treadmill**: Running/walking machine for cardio training
`;

fs.writeFileSync(
  path.join(__dirname, 'cardio-supabase-upload-summary.md'),
  supabaseUploadSummary
);

// Create implementation script
const implementScript = `const fs = require('fs');
const path = require('path');

function implementCardioExercises() {
  // Create backup
  const databasePath = path.join(__dirname, '../src/data/exerciseDatabase.ts');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(__dirname, \`../src/data/exerciseDatabase.backup-cardio-\${timestamp}.ts\`);
  
  try {
    fs.copyFileSync(databasePath, backupPath);
    console.log('✅ Backup created:', backupPath);
  } catch (error) {
    console.error('❌ Failed to create backup:', error.message);
    return;
  }

  // Copy GIF files
  const sourceDir = '/mnt/c/Users/danny/Downloads/cardio';
  const destDir = path.join(__dirname, '../assets/exercise-gifs/cardio');
  
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  const exercises = ${JSON.stringify(cardioExercises, null, 2)};
  
  let copiedCount = 0;
  for (const exercise of exercises) {
    const sourcePath = path.join(sourceDir, exercise.filename);
    const destPath = path.join(destDir, exercise.filename);
    
    try {
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        copiedCount++;
        console.log(\`✅ Copied: \${exercise.filename}\`);
      }
    } catch (error) {
      console.log(\`❌ Failed to copy \${exercise.filename}: \${error.message}\`);
    }
  }
  
  console.log(\`\\n✅ Copied \${copiedCount} cardio exercise GIFs\`);
  console.log('\\nNext: Add exercises to database using newCardioExercises.ts');
}

implementCardioExercises();
`;

fs.writeFileSync(
  path.join(__dirname, 'implementCardioGifs.js'),
  implementScript
);

console.log('\nCreated files:');
console.log('1. newCardioExercises.ts - Exercises to add to database');
console.log('2. cardio-supabase-upload-summary.md - Supabase upload guide');
console.log('3. implementCardioGifs.js - Implementation script');