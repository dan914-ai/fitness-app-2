const fs = require('fs');
const path = require('path');

// Bicep exercises with proper format matching existing database structure
const bicepExercises = [
  {
    filename: '덤벨 바이셉 컬.gif',
    id: 'dumbbell_bicep_curl',
    koreanName: '덤벨 바이셉 컬',
    category: 'arms',
    equipment: ['덤벨']
  },
  {
    filename: '덤벨 컨센트레이션 컬.gif',
    id: 'dumbbell_concentration_curl',
    koreanName: '덤벨 컨센트레이션 컬',
    category: 'arms',
    equipment: ['덤벨', '벤치']
  },
  {
    filename: '덤벨 해머 컬.gif',
    id: 'dumbbell_hammer_curl',
    koreanName: '덤벨 해머 컬',
    category: 'arms',
    equipment: ['덤벨']
  },
  {
    filename: '바벨 바이셉 컬.gif',
    id: 'barbell_bicep_curl',
    koreanName: '바벨 바이셉 컬',
    category: 'arms',
    equipment: ['바벨']
  },
  {
    filename: '바벨 프리처 컬.gif',
    id: 'barbell_preacher_curl',
    koreanName: '바벨 프리처 컬',
    category: 'arms',
    equipment: ['바벨', '프리처 벤치']
  },
  {
    filename: '스파이더 바이셉 컬.gif',
    id: 'spider_bicep_curl',
    koreanName: '스파이더 바이셉 컬',
    category: 'arms',
    equipment: ['바벨', '인클라인 벤치']
  },
  {
    filename: '원 암 덤벨 프리처 컬.gif',
    id: 'one_arm_dumbbell_preacher_curl',
    koreanName: '원 암 덤벨 프리처 컬',
    category: 'arms',
    equipment: ['덤벨', '프리처 벤치']
  },
  {
    filename: '원 암 케이블 바이셉 컬.gif',
    id: 'one_arm_cable_bicep_curl',
    koreanName: '원 암 케이블 바이셉 컬',
    category: 'arms',
    equipment: ['케이블 머신', '싱글 핸들']
  },
  {
    filename: '이지 바 바이셉 컬.gif',
    id: 'ez_bar_bicep_curl',
    koreanName: '이지 바 바이셉 컬',
    category: 'arms',
    equipment: ['이지 바']
  },
  {
    filename: '이지바 리버스 바이셉 컬.gif',
    id: 'ez_bar_reverse_bicep_curl',
    koreanName: '이지바 리버스 바이셉 컬',
    category: 'arms',
    equipment: ['이지 바']
  },
  {
    filename: '케이블 더블 바이셉 컬.gif',
    id: 'cable_double_bicep_curl',
    koreanName: '케이블 더블 바이셉 컬',
    category: 'arms',
    equipment: ['케이블 머신', '더블 핸들']
  },
  {
    filename: '케이블 로프 바이셉 컬.gif',
    id: 'cable_rope_bicep_curl',
    koreanName: '케이블 로프 바이셉 컬',
    category: 'arms',
    equipment: ['케이블 머신', '로프 핸들']
  },
  {
    filename: '케이블 바이셉 컬.gif',
    id: 'cable_bicep_curl',
    koreanName: '케이블 바이셉 컬',
    category: 'arms',
    equipment: ['케이블 머신', '스트레이트 바']
  },
  {
    filename: '클로즈 그립 랫 풀다운.gif',
    id: 'close_grip_lat_pulldown_bicep',
    koreanName: '클로즈 그립 랫 풀다운',
    category: 'arms',
    equipment: ['랫 풀다운 머신', '클로즈 그립 바']
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
const newExercises = bicepExercises.filter(ex => !existingIds.has(ex.id));
const existingToUpdate = bicepExercises.filter(ex => existingIds.has(ex.id));

console.log(`Total bicep exercises: ${bicepExercises.length}`);
console.log(`New exercises to add: ${newExercises.length}`);
console.log(`Existing exercises to update: ${existingToUpdate.length}`);

// Generate properly formatted exercises
const generateBicepExercise = (exercise) => {
  return `  {
    id: '${exercise.id}',
    name: {
      korean: '${exercise.koreanName}',
      english: '${exercise.koreanName}',
      romanization: '${exercise.koreanName}'
    },
    description: {
      korean: '이두근을 대상으로 하는 운동',
      english: 'Exercise targeting the biceps'
    },
    targetMuscles: {
      primary: ['이두근'],
      secondary: ['전완근'],
      stabilizers: ['코어']
    },
    equipment: ${JSON.stringify(exercise.equipment)},
    category: 'isolation',
    bodyParts: ['팔'],
    difficulty: 'beginner',
    instructions: {
      korean: [
        '시작 자세를 취합니다',
        '팔꿈치를 고정하고 이두근에 집중합니다',
        '천천히 웨이트를 들어올립니다',
        '정점에서 잠시 멈춘 후 천천히 내립니다'
      ],
      english: [
        'Get into starting position',
        'Keep elbows stationary and focus on biceps',
        'Curl the weight up slowly',
        'Pause at the top then lower slowly'
      ]
    },
    tips: {
      korean: [
        '팔꿈치를 몸통에 고정하세요',
        '반동을 사용하지 마세요',
        '전체 가동범위를 사용하세요'
      ],
      english: [
        'Keep elbows locked to your sides',
        'Avoid using momentum',
        'Use full range of motion'
      ]
    },
    commonMistakes: {
      korean: [
        '팔꿈치가 앞으로 나가는 것',
        '너무 무거운 중량 사용',
        '반동 사용'
      ],
      english: [
        'Elbows moving forward',
        'Using too much weight',
        'Swinging the weight'
      ]
    },
    sets: {
      recommended: '3-4',
      beginner: '3',
      intermediate: '3-4',
      advanced: '4-5'
    },
    reps: {
      recommended: '10-12',
      beginner: '12-15',
      intermediate: '10-12',
      advanced: '8-10'
    },
    media: {
      gifUrl: './assets/exercise-gifs/arms/${exercise.filename}',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/${exercise.id}.gif'
    }
  }`;
};

// Generate exercises to add
const exercisesToAdd = newExercises.map(ex => generateBicepExercise(ex)).join(',\n');

// Create output files
fs.writeFileSync(
  path.join(__dirname, 'newBicepExercises.ts'),
  `// New bicep exercises to add to database
export const newBicepExercises = [
${exercisesToAdd}
];

// Existing exercises to update with GIFs:
export const bicepExercisesToUpdate = ${JSON.stringify(existingToUpdate.map(ex => ({
  id: ex.id,
  gifFile: ex.filename
})), null, 2)};
`
);

// Create Supabase upload summary
const supabaseUploadSummary = `# Bicep Exercises - Supabase Upload Summary

## Total: ${bicepExercises.length} GIFs

| Local Filename | Supabase Filename | Exercise ID |
|----------------|-------------------|-------------|
${bicepExercises.map(ex => `| ${ex.filename} | ${ex.id}.gif | ${ex.id} |`).join('\n')}

## Upload Instructions:
1. Upload each GIF with the English ID as filename
2. Example: Upload '덤벨 바이셉 컬.gif' as 'dumbbell_bicep_curl.gif'
3. Ensure all files are in the 'exercise-gifs' bucket

## Exercise Details:
- **Dumbbell Variations**: Basic curl, concentration curl, hammer curl
- **Barbell Variations**: Standard curl, preacher curl, spider curl
- **Cable Variations**: Single arm, double arm, rope attachment
- **EZ Bar Variations**: Standard and reverse grip
`;

fs.writeFileSync(
  path.join(__dirname, 'bicep-supabase-upload-summary.md'),
  supabaseUploadSummary
);

// Create implementation script
const implementScript = `const fs = require('fs');
const path = require('path');

function implementBicepExercises() {
  // Create backup
  const databasePath = path.join(__dirname, '../src/data/exerciseDatabase.ts');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(__dirname, \`../src/data/exerciseDatabase.backup-bicep-\${timestamp}.ts\`);
  
  try {
    fs.copyFileSync(databasePath, backupPath);
    console.log('✅ Backup created:', backupPath);
  } catch (error) {
    console.error('❌ Failed to create backup:', error.message);
    return;
  }

  // Copy GIF files
  const sourceDir = '/mnt/c/Users/danny/Downloads/bicep exercises';
  const destDir = path.join(__dirname, '../assets/exercise-gifs/arms');
  
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  const exercises = ${JSON.stringify(bicepExercises, null, 2)};
  
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
  
  console.log(\`\\n✅ Copied \${copiedCount} bicep exercise GIFs\`);
  console.log('\\nNext: Add exercises to database using newBicepExercises.ts');
}

implementBicepExercises();
`;

fs.writeFileSync(
  path.join(__dirname, 'implementBicepGifs.js'),
  implementScript
);

console.log('\nCreated files:');
console.log('1. newBicepExercises.ts - Exercises to add to database');
console.log('2. bicep-supabase-upload-summary.md - Supabase upload guide');
console.log('3. implementBicepGifs.js - Implementation script');