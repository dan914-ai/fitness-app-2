const fs = require('fs');
const path = require('path');

// Tricep exercises with proper format matching existing database structure
const tricepExercises = [
  {
    filename: '닐링 케이블 오버헤드 트라이셉 익스텐션.gif',
    id: 'kneeling_cable_overhead_tricep_extension',
    koreanName: '닐링 케이블 오버헤드 트라이셉 익스텐션',
    category: 'arms',
    equipment: ['케이블 머신', '로프 핸들']
  },
  {
    filename: '덤벨 트라이센 익스텐션.gif',
    id: 'dumbbell_tricep_extension_seated',
    koreanName: '덤벨 트라이센 익스텐션',
    category: 'arms',
    equipment: ['덤벨']
  },
  {
    filename: '덤벨 트라이셉 익스텐션.gif',
    id: 'dumbbell_tricep_extension',
    koreanName: '덤벨 트라이셉 익스텐션',
    category: 'arms',
    equipment: ['덤벨']
  },
  {
    filename: '덤벨 트라이셉 킥백.gif',
    id: 'dumbbell_tricep_kickback',
    koreanName: '덤벨 트라이셉 킥백',
    category: 'arms',
    equipment: ['덤벨', '벤치']
  },
  {
    filename: '머신 딥스.gif',
    id: 'machine_dips',
    koreanName: '머신 딥스',
    category: 'arms',
    equipment: ['딥스 머신']
  },
  {
    filename: '머신 트라이셉 익스텐션 2.gif',
    id: 'machine_tricep_extension_2',
    koreanName: '머신 트라이셉 익스텐션 2',
    category: 'arms',
    equipment: ['트라이셉 머신']
  },
  {
    filename: '머신 트라이셉 익스텐션.gif',
    id: 'machine_tricep_extension',
    koreanName: '머신 트라이셉 익스텐션',
    category: 'arms',
    equipment: ['트라이셉 머신']
  },
  {
    filename: '바벨 라잉 트라이셉 익스텐션.gif',
    id: 'barbell_lying_tricep_extension',
    koreanName: '바벨 라잉 트라이셉 익스텐션',
    category: 'arms',
    equipment: ['바벨', '플랫 벤치']
  },
  {
    filename: '바벨 인클라인 트라이셉 익스텐션.gif',
    id: 'barbell_incline_tricep_extension',
    koreanName: '바벨 인클라인 트라이셉 익스텐션',
    category: 'arms',
    equipment: ['바벨', '인클라인 벤치']
  },
  {
    filename: '바벨 트라이셉 익스텐션.gif',
    id: 'barbell_tricep_extension',
    koreanName: '바벨 트라이셉 익스텐션',
    category: 'arms',
    equipment: ['바벨']
  },
  {
    filename: '벤치 딥스.gif',
    id: 'bench_dips',
    koreanName: '벤치 딥스',
    category: 'arms',
    equipment: ['벤치']
  },
  {
    filename: '어시스트 딥스.gif',
    id: 'assisted_tricep_dips',
    koreanName: '어시스트 딥스',
    category: 'arms',
    equipment: ['어시스트 딥스 머신']
  },
  {
    filename: '원 암 덤벨 트라이셉 익스텐션.gif',
    id: 'one_arm_dumbbell_tricep_extension',
    koreanName: '원 암 덤벨 트라이셉 익스텐션',
    category: 'arms',
    equipment: ['덤벨']
  },
  {
    filename: '원 암 케이블 트라이셉 익스텐션.gif',
    id: 'one_arm_cable_tricep_extension',
    koreanName: '원 암 케이블 트라이셉 익스텐션',
    category: 'arms',
    equipment: ['케이블 머신', '싱글 핸들']
  },
  {
    filename: '케이블 v-bar 트라이셉 푸시다운.gif',
    id: 'cable_v_bar_tricep_pushdown',
    koreanName: '케이블 V-바 트라이셉 푸시다운',
    category: 'arms',
    equipment: ['케이블 머신', 'V-바']
  },
  {
    filename: '케이블 로프 트라이셉 익스텐션.gif',
    id: 'cable_rope_tricep_extension',
    koreanName: '케이블 로프 트라이셉 익스텐션',
    category: 'arms',
    equipment: ['케이블 머신', '로프 핸들']
  },
  {
    filename: '케이블 리버스 그립 트라이셉 푸시다운.gif',
    id: 'cable_reverse_grip_tricep_pushdown',
    koreanName: '케이블 리버스 그립 트라이셉 푸시다운',
    category: 'arms',
    equipment: ['케이블 머신', '스트레이트 바']
  },
  {
    filename: '케이블 오버헤드 트라이셉 익스텐션.gif',
    id: 'cable_overhead_tricep_extension',
    koreanName: '케이블 오버헤드 트라이셉 익스텐션',
    category: 'arms',
    equipment: ['케이블 머신', '로프 핸들']
  },
  {
    filename: '케이블 원 암 리버스 그립 트라이셉 푸시다운.gif',
    id: 'cable_one_arm_reverse_grip_tricep_pushdown',
    koreanName: '케이블 원 암 리버스 그립 트라이셉 푸시다운',
    category: 'arms',
    equipment: ['케이블 머신', '싱글 핸들']
  },
  {
    filename: '케이블 인클라인 트라이셉 익스텐션.gif',
    id: 'cable_incline_tricep_extension',
    koreanName: '케이블 인클라인 트라이셉 익스텐션',
    category: 'arms',
    equipment: ['케이블 머신', '로프 핸들', '인클라인 벤치']
  },
  {
    filename: '케이블 트라이셉 킥백.gif',
    id: 'cable_tricep_kickback',
    koreanName: '케이블 트라이셉 킥백',
    category: 'arms',
    equipment: ['케이블 머신', '싱글 핸들']
  },
  {
    filename: '클로즈 그립 벤치 프레스.gif',
    id: 'close_grip_bench_press',
    koreanName: '클로즈 그립 벤치 프레스',
    category: 'arms',
    equipment: ['바벨', '플랫 벤치']
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
const newExercises = tricepExercises.filter(ex => !existingIds.has(ex.id));
const existingToUpdate = tricepExercises.filter(ex => existingIds.has(ex.id));

console.log(`Total tricep exercises: ${tricepExercises.length}`);
console.log(`New exercises to add: ${newExercises.length}`);
console.log(`Existing exercises to update: ${existingToUpdate.length}`);

// Generate properly formatted exercises
const generateTricepExercise = (exercise) => {
  return `  {
    id: '${exercise.id}',
    name: {
      korean: '${exercise.koreanName}',
      english: '${exercise.koreanName}',
      romanization: '${exercise.koreanName}'
    },
    description: {
      korean: '삼두근을 대상으로 하는 운동',
      english: 'Exercise targeting the triceps'
    },
    targetMuscles: {
      primary: ['삼두근'],
      secondary: ['가슴근', '어깨'],
      stabilizers: ['코어']
    },
    equipment: ${JSON.stringify(exercise.equipment)},
    category: 'isolation',
    bodyParts: ['팔'],
    difficulty: 'intermediate',
    instructions: {
      korean: [
        '시작 자세를 취합니다',
        '삼두근에 집중하며 동작을 수행합니다',
        '팔꿈치를 고정하고 전완만 움직입니다',
        '천천히 시작 자세로 돌아갑니다'
      ],
      english: [
        'Get into starting position',
        'Focus on tricep contraction',
        'Keep elbows stationary',
        'Return to starting position'
      ]
    },
    tips: {
      korean: [
        '팔꿈치를 몸통에 가깝게 유지하세요',
        '전체 가동범위를 사용하세요',
        '삼두근 수축에 집중하세요'
      ],
      english: [
        'Keep elbows close to body',
        'Use full range of motion',
        'Focus on tricep squeeze'
      ]
    },
    commonMistakes: {
      korean: [
        '팔꿈치가 벌어지는 것',
        '반동을 사용하는 것',
        '너무 빠른 동작'
      ],
      english: [
        'Elbows flaring out',
        'Using momentum',
        'Moving too quickly'
      ]
    },
    sets: {
      recommended: '3-4',
      beginner: '3',
      intermediate: '3-4',
      advanced: '4-5'
    },
    reps: {
      recommended: '10-15',
      beginner: '12-15',
      intermediate: '10-12',
      advanced: '8-12'
    },
    media: {
      gifUrl: './assets/exercise-gifs/arms/${exercise.filename}',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/${exercise.id}.gif'
    }
  }`;
};

// Generate exercises to add
const exercisesToAdd = newExercises.map(ex => generateTricepExercise(ex)).join(',\n');

// Create output files
fs.writeFileSync(
  path.join(__dirname, 'newTricepExercises.ts'),
  `// New tricep exercises to add to database
export const newTricepExercises = [
${exercisesToAdd}
];

// Existing exercises to update with GIFs:
export const tricepExercisesToUpdate = ${JSON.stringify(existingToUpdate.map(ex => ({
  id: ex.id,
  gifFile: ex.filename
})), null, 2)};
`
);

// Create Supabase upload summary
const supabaseUploadSummary = `# Tricep Exercises - Supabase Upload Summary

## Total: ${tricepExercises.length} GIFs

| Local Filename | Supabase Filename | Exercise ID |
|----------------|-------------------|-------------|
${tricepExercises.map(ex => `| ${ex.filename} | ${ex.id}.gif | ${ex.id} |`).join('\n')}

## Upload Instructions:
1. Upload each GIF with the English ID as filename
2. Example: Upload '덤벨 트라이셉 킥백.gif' as 'dumbbell_tricep_kickback.gif'
3. Ensure all files are in the 'exercise-gifs' bucket
`;

fs.writeFileSync(
  path.join(__dirname, 'tricep-supabase-upload-summary.md'),
  supabaseUploadSummary
);

console.log('\nCreated files:');
console.log('1. newTricepExercises.ts - Exercises to add to database');
console.log('2. tricep-supabase-upload-summary.md - Supabase upload guide');