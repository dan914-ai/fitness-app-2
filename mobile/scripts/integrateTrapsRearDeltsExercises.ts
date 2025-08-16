const fs = require('fs');
const path = require('path');

// Traps and rear delts exercises with proper format matching existing database structure
const trapsRearDeltsExercises = [
  {
    filename: '덤벨 리어 델트 레이즈.gif',
    id: 'dumbbell_rear_delt_raise',
    koreanName: '덤벨 리어 델트 레이즈',
    category: 'shoulders',
    equipment: ['덤벨'],
    targetMuscles: ['후면 삼각근', '승모근']
  },
  {
    filename: '덤벨 슈러그.gif',
    id: 'dumbbell_shrug',
    koreanName: '덤벨 슈러그',
    category: 'shoulders',
    equipment: ['덤벨'],
    targetMuscles: ['승모근']
  },
  {
    filename: '덤벨 업라이트 로우.gif',
    id: 'dumbbell_upright_row',
    koreanName: '덤벨 업라이트 로우',
    category: 'shoulders',
    equipment: ['덤벨'],
    targetMuscles: ['승모근', '삼각근']
  },
  {
    filename: '바벨 슈러그.gif',
    id: 'barbell_shrug',
    koreanName: '바벨 슈러그',
    category: 'shoulders',
    equipment: ['바벨'],
    targetMuscles: ['승모근']
  },
  {
    filename: '바벨 업라이트 로우.gif',
    id: 'barbell_upright_row',
    koreanName: '바벨 업라이트 로우',
    category: 'shoulders',
    equipment: ['바벨'],
    targetMuscles: ['승모근', '삼각근']
  },
  {
    filename: '스미스 머신 슈러그.gif',
    id: 'smith_machine_shrug',
    koreanName: '스미스 머신 슈러그',
    category: 'shoulders',
    equipment: ['스미스 머신'],
    targetMuscles: ['승모근']
  },
  {
    filename: '원 암 덤벨 업라이트 로우.gif',
    id: 'one_arm_dumbbell_upright_row',
    koreanName: '원 암 덤벨 업라이트 로우',
    category: 'shoulders',
    equipment: ['덤벨'],
    targetMuscles: ['승모근', '삼각근']
  },
  {
    filename: '이지바 업라이트 로우.gif',
    id: 'ez_bar_upright_row',
    koreanName: '이지바 업라이트 로우',
    category: 'shoulders',
    equipment: ['이지 바'],
    targetMuscles: ['승모근', '삼각근']
  },
  {
    filename: '체스트 서포티드 덤벨 슈러그.gif',
    id: 'chest_supported_dumbbell_shrug',
    koreanName: '체스트 서포티드 덤벨 슈러그',
    category: 'shoulders',
    equipment: ['덤벨', '인클라인 벤치'],
    targetMuscles: ['승모근']
  },
  {
    filename: '케이블 슈러그.gif',
    id: 'cable_shrug',
    koreanName: '케이블 슈러그',
    category: 'shoulders',
    equipment: ['케이블 머신'],
    targetMuscles: ['승모근']
  },
  {
    filename: '케이블 업라이트 로우.gif',
    id: 'cable_upright_row',
    koreanName: '케이블 업라이트 로우',
    category: 'shoulders',
    equipment: ['케이블 머신', '스트레이트 바'],
    targetMuscles: ['승모근', '삼각근']
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
const newExercises = trapsRearDeltsExercises.filter(ex => !existingIds.has(ex.id));
const existingToUpdate = trapsRearDeltsExercises.filter(ex => existingIds.has(ex.id));

console.log(`Total traps/rear delts exercises: ${trapsRearDeltsExercises.length}`);
console.log(`New exercises to add: ${newExercises.length}`);
console.log(`Existing exercises to update: ${existingToUpdate.length}`);

// Generate properly formatted exercises
const generateTrapsRearDeltsExercise = (exercise) => {
  const isShrug = exercise.id.includes('shrug');
  const isRearDelt = exercise.id.includes('rear_delt');
  
  return `  {
    id: '${exercise.id}',
    name: {
      korean: '${exercise.koreanName}',
      english: '${exercise.koreanName}',
      romanization: '${exercise.koreanName}'
    },
    description: {
      korean: '${exercise.targetMuscles.join(', ')}을 대상으로 하는 운동',
      english: 'Exercise targeting the ${isShrug ? 'trapezius' : isRearDelt ? 'rear deltoids' : 'traps and deltoids'}'
    },
    targetMuscles: {
      primary: ${JSON.stringify(exercise.targetMuscles)},
      secondary: ${isShrug ? '[]' : '["이두근"]'},
      stabilizers: ['코어']
    },
    equipment: ${JSON.stringify(exercise.equipment)},
    category: ${isShrug ? "'isolation'" : "'compound'"},
    bodyParts: ['어깨', '등'],
    difficulty: 'intermediate',
    instructions: {
      korean: [
        '시작 자세를 취합니다',
        ${isShrug ? "'어깨를 귀 쪽으로 들어올립니다'" : isRearDelt ? "'후면 삼각근에 집중하며 팔을 들어올립니다'" : "'팔꿈치를 높게 들어올리며 바를 당깁니다'"},
        '정점에서 잠시 멈춥니다',
        '천천히 시작 자세로 돌아갑니다'
      ],
      english: [
        'Get into starting position',
        ${isShrug ? "'Lift shoulders toward ears'" : isRearDelt ? "'Raise arms focusing on rear delts'" : "'Pull the bar up with high elbows'"},
        'Pause at the top',
        'Slowly return to starting position'
      ]
    },
    tips: {
      korean: [
        ${isShrug ? "'어깨를 뒤로 돌리지 마세요'" : "'팔꿈치를 손목보다 높게 유지하세요'"},
        '전체 가동범위를 사용하세요',
        '목표 근육에 집중하세요'
      ],
      english: [
        ${isShrug ? "'Don\\'t roll shoulders backward'" : "'Keep elbows higher than wrists'"},
        'Use full range of motion',
        'Focus on target muscles'
      ]
    },
    commonMistakes: {
      korean: [
        '너무 무거운 중량 사용',
        '반동 사용',
        ${isShrug ? "'어깨 회전'" : "'팔꿈치가 너무 낮음'"}
      ],
      english: [
        'Using too much weight',
        'Using momentum',
        ${isShrug ? "'Rolling shoulders'" : "'Elbows too low'"}
      ]
    },
    sets: {
      recommended: '3-4',
      beginner: '3',
      intermediate: '3-4',
      advanced: '4-5'
    },
    reps: {
      recommended: ${isShrug ? "'12-15'" : "'10-12'"},
      beginner: '12-15',
      intermediate: ${isShrug ? "'10-15'" : "'10-12'"},
      advanced: ${isShrug ? "'8-12'" : "'8-10'"}
    },
    media: {
      gifUrl: './assets/exercise-gifs/shoulders/${exercise.filename}',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/${exercise.id}.gif'
    }
  }`;
};

// Generate exercises to add
const exercisesToAdd = newExercises.map(ex => generateTrapsRearDeltsExercise(ex)).join(',\n');

// Create output files
fs.writeFileSync(
  path.join(__dirname, 'newTrapsRearDeltsExercises.ts'),
  `// New traps and rear delts exercises to add to database
export const newTrapsRearDeltsExercises = [
${exercisesToAdd}
];

// Existing exercises to update with GIFs:
export const trapsRearDeltsExercisesToUpdate = ${JSON.stringify(existingToUpdate.map(ex => ({
  id: ex.id,
  gifFile: ex.filename
})), null, 2)};
`
);

// Create Supabase upload summary
const supabaseUploadSummary = `# Traps & Rear Delts Exercises - Supabase Upload Summary

## Total: ${trapsRearDeltsExercises.length} GIFs

| Local Filename | Supabase Filename | Exercise ID |
|----------------|-------------------|-------------|
${trapsRearDeltsExercises.map(ex => `| ${ex.filename} | ${ex.id}.gif | ${ex.id} |`).join('\n')}

## Upload Instructions:
1. Upload each GIF with the English ID as filename
2. Example: Upload '덤벨 슈러그.gif' as 'dumbbell_shrug.gif'
3. Ensure all files are in the 'exercise-gifs' bucket

## Exercise Categories:
- **Shrugs**: Dumbbell, barbell, smith machine, cable variations
- **Upright Rows**: Dumbbell, barbell, EZ bar, cable variations  
- **Rear Delt Work**: Rear delt raises
`;

fs.writeFileSync(
  path.join(__dirname, 'traps-rear-delts-supabase-upload-summary.md'),
  supabaseUploadSummary
);

// Create implementation script
const implementScript = `const fs = require('fs');
const path = require('path');

function implementTrapsRearDeltsExercises() {
  // Create backup
  const databasePath = path.join(__dirname, '../src/data/exerciseDatabase.ts');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(__dirname, \`../src/data/exerciseDatabase.backup-traps-rear-delts-\${timestamp}.ts\`);
  
  try {
    fs.copyFileSync(databasePath, backupPath);
    console.log('✅ Backup created:', backupPath);
  } catch (error) {
    console.error('❌ Failed to create backup:', error.message);
    return;
  }

  // Copy GIF files
  const sourceDir = '/mnt/c/Users/danny/Downloads/traps, rear delts';
  const destDir = path.join(__dirname, '../assets/exercise-gifs/shoulders');
  
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  const exercises = ${JSON.stringify(trapsRearDeltsExercises, null, 2)};
  
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
  
  console.log(\`\\n✅ Copied \${copiedCount} traps/rear delts exercise GIFs\`);
  console.log('\\nNext: Add exercises to database using newTrapsRearDeltsExercises.ts');
}

implementTrapsRearDeltsExercises();
`;

fs.writeFileSync(
  path.join(__dirname, 'implementTrapsRearDeltsGifs.js'),
  implementScript
);

console.log('\nCreated files:');
console.log('1. newTrapsRearDeltsExercises.ts - Exercises to add to database');
console.log('2. traps-rear-delts-supabase-upload-summary.md - Supabase upload guide');
console.log('3. implementTrapsRearDeltsGifs.js - Implementation script');