const fs = require('fs');
const path = require('path');

// Calf exercises with proper format matching existing database structure
const calfExercises = [
  {
    filename: '레그 프레스 카프 레이즈.gif',
    id: 'leg_press_calf_raise',
    koreanName: '레그 프레스 카프 레이즈',
    category: 'legs',
    equipment: ['레그 프레스 머신']
  },
  {
    filename: '스탠딩 카프 레이즈.gif',
    id: 'standing_calf_raise',
    koreanName: '스탠딩 카프 레이즈',
    category: 'legs',
    equipment: ['카프 레이즈 머신']
  },
  {
    filename: '시티드 카프 레이즈.gif',
    id: 'seated_calf_raise',
    koreanName: '시티드 카프 레이즈',
    category: 'legs',
    equipment: ['시티드 카프 레이즈 머신']
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
const newExercises = calfExercises.filter(ex => !existingIds.has(ex.id));
const existingToUpdate = calfExercises.filter(ex => existingIds.has(ex.id));

console.log(`Total calf exercises: ${calfExercises.length}`);
console.log(`New exercises to add: ${newExercises.length}`);
console.log(`Existing exercises to update: ${existingToUpdate.length}`);

// Generate properly formatted exercises
const generateCalfExercise = (exercise) => {
  return `  {
    id: '${exercise.id}',
    name: {
      korean: '${exercise.koreanName}',
      english: '${exercise.koreanName}',
      romanization: '${exercise.koreanName}'
    },
    description: {
      korean: '종아리 근육을 대상으로 하는 운동',
      english: 'Exercise targeting the calf muscles'
    },
    targetMuscles: {
      primary: ['종아리'],
      secondary: [],
      stabilizers: ['코어']
    },
    equipment: ${JSON.stringify(exercise.equipment)},
    category: 'isolation',
    bodyParts: ['다리'],
    difficulty: 'beginner',
    instructions: {
      korean: [
        '시작 자세를 취합니다',
        '발끝으로 체중을 밀어 올립니다',
        '종아리 근육을 최대한 수축합니다',
        '천천히 시작 자세로 돌아갑니다'
      ],
      english: [
        'Get into starting position',
        'Push up onto your toes',
        'Fully contract calf muscles',
        'Slowly return to starting position'
      ]
    },
    tips: {
      korean: [
        '전체 가동범위를 사용하세요',
        '정점에서 잠시 멈추세요',
        '천천히 내려가며 스트레칭을 느끼세요'
      ],
      english: [
        'Use full range of motion',
        'Pause at the top',
        'Feel the stretch on the way down'
      ]
    },
    commonMistakes: {
      korean: [
        '너무 빠른 동작',
        '부분적인 가동범위',
        '반동 사용'
      ],
      english: [
        'Moving too quickly',
        'Partial range of motion',
        'Using momentum'
      ]
    },
    sets: {
      recommended: '3-4',
      beginner: '3',
      intermediate: '4',
      advanced: '4-5'
    },
    reps: {
      recommended: '15-20',
      beginner: '15-20',
      intermediate: '12-15',
      advanced: '10-15'
    },
    media: {
      gifUrl: './assets/exercise-gifs/legs/${exercise.filename}',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/${exercise.id}.gif'
    }
  }`;
};

// Generate exercises to add
const exercisesToAdd = newExercises.map(ex => generateCalfExercise(ex)).join(',\n');

// Create output files
fs.writeFileSync(
  path.join(__dirname, 'newCalfExercises.ts'),
  `// New calf exercises to add to database
export const newCalfExercises = [
${exercisesToAdd}
];

// Existing exercises to update with GIFs:
export const calfExercisesToUpdate = ${JSON.stringify(existingToUpdate.map(ex => ({
  id: ex.id,
  gifFile: ex.filename
})), null, 2)};
`
);

// Create Supabase upload summary
const supabaseUploadSummary = `# Calf Exercises - Supabase Upload Summary

## Total: ${calfExercises.length} GIFs

| Local Filename | Supabase Filename | Exercise ID |
|----------------|-------------------|-------------|
${calfExercises.map(ex => `| ${ex.filename} | ${ex.id}.gif | ${ex.id} |`).join('\n')}

## Upload Instructions:
1. Upload each GIF with the English ID as filename
2. Example: Upload '스탠딩 카프 레이즈.gif' as 'standing_calf_raise.gif'
3. Ensure all files are in the 'exercise-gifs' bucket

## Exercise Details:
- **Leg Press Calf Raise**: Using leg press machine for calf raises
- **Standing Calf Raise**: Traditional standing calf raise machine
- **Seated Calf Raise**: Seated variation targeting soleus muscle
`;

fs.writeFileSync(
  path.join(__dirname, 'calf-supabase-upload-summary.md'),
  supabaseUploadSummary
);

// Create implementation script
const implementScript = `const fs = require('fs');
const path = require('path');

function implementCalfExercises() {
  // Create backup
  const databasePath = path.join(__dirname, '../src/data/exerciseDatabase.ts');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(__dirname, \`../src/data/exerciseDatabase.backup-calf-\${timestamp}.ts\`);
  
  try {
    fs.copyFileSync(databasePath, backupPath);
    console.log('✅ Backup created:', backupPath);
  } catch (error) {
    console.error('❌ Failed to create backup:', error.message);
    return;
  }

  // Copy GIF files
  const sourceDir = '/mnt/c/Users/danny/Downloads/calf exercises';
  const destDir = path.join(__dirname, '../assets/exercise-gifs/legs');
  
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  const exercises = ${JSON.stringify(calfExercises, null, 2)};
  
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
  
  console.log(\`\\n✅ Copied \${copiedCount} calf exercise GIFs\`);
  console.log('\\nNext: Add exercises to database using newCalfExercises.ts');
}

implementCalfExercises();
`;

fs.writeFileSync(
  path.join(__dirname, 'implementCalfGifs.js'),
  implementScript
);

console.log('\nCreated files:');
console.log('1. newCalfExercises.ts - Exercises to add to database');
console.log('2. calf-supabase-upload-summary.md - Supabase upload guide');
console.log('3. implementCalfGifs.js - Implementation script');