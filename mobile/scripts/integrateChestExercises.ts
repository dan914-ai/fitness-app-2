const fs = require('fs');
const path = require('path');

const chestExercisesPath = '/mnt/c/Users/danny/Downloads/chest exercises';
const databasePath = path.join(__dirname, '../src/data/exerciseDatabase.ts');

// Read existing database
const databaseContent = fs.readFileSync(databasePath, 'utf-8');

// Extract existing exercise IDs
const existingIds = new Set<string>();
const idMatches = databaseContent.matchAll(/id:\s*['"]([^'"]+)['"]/g);
for (const match of idMatches) {
  existingIds.add(match[1]);
}

// Map Korean names to exercise data
const chestExercises = [
  {
    filename: '덤벨 벤치프레스.gif',
    id: 'dumbbell_bench_press',
    koreanName: '덤벨 벤치프레스',
    category: 'chest',
    equipment: 'dumbbell'
  },
  {
    filename: '덤벨 인클라인 벤치 프레스.gif',
    id: 'dumbbell_incline_bench_press',
    koreanName: '덤벨 인클라인 벤치 프레스',
    category: 'chest',
    equipment: 'dumbbell'
  },
  {
    filename: '덤벨 체스트 플라이.gif',
    id: 'dumbbell_chest_fly',
    koreanName: '덤벨 체스트 플라이',
    category: 'chest',
    equipment: 'dumbbell'
  },
  {
    filename: '디클라인 덤벨 플라이.gif',
    id: 'decline_dumbbell_fly',
    koreanName: '디클라인 덤벨 플라이',
    category: 'chest',
    equipment: 'dumbbell'
  },
  {
    filename: '디클라인 바벨 벤치프레스.gif',
    id: 'decline_barbell_bench_press',
    koreanName: '디클라인 바벨 벤치프레스',
    category: 'chest',
    equipment: 'barbell'
  },
  {
    filename: '디클라인 케이블 플라이.gif',
    id: 'decline_cable_fly',
    koreanName: '디클라인 케이블 플라이',
    category: 'chest',
    equipment: 'cable'
  },
  {
    filename: '디클라인 플레이트 체스트 프레스.gif',
    id: 'decline_plate_chest_press',
    koreanName: '디클라인 플레이트 체스트 프레스',
    category: 'chest',
    equipment: 'plate'
  },
  {
    filename: '딥스.gif',
    id: 'dips',
    koreanName: '딥스',
    category: 'chest',
    equipment: 'bodyweight'
  },
  {
    filename: '머신 디클라인 체스트 프레스.gif',
    id: 'machine_decline_chest_press',
    koreanName: '머신 디클라인 체스트 프레스',
    category: 'chest',
    equipment: 'machine'
  },
  {
    filename: '머신 체스트 프레스.gif',
    id: 'machine_chest_press',
    koreanName: '머신 체스트 프레스',
    category: 'chest',
    equipment: 'machine'
  },
  {
    filename: '머신 체스트 플라이.gif',
    id: 'machine_chest_fly',
    koreanName: '머신 체스트 플라이',
    category: 'chest',
    equipment: 'machine'
  },
  {
    filename: '바벨 벤치프레스.gif',
    id: 'barbell_bench_press',
    koreanName: '바벨 벤치프레스',
    category: 'chest',
    equipment: 'barbell'
  },
  {
    filename: '바벨 인클라인 벤치 프레스.gif',
    id: 'barbell_incline_bench_press',
    koreanName: '바벨 인클라인 벤치 프레스',
    category: 'chest',
    equipment: 'barbell'
  },
  {
    filename: '스미스 디클라인 벤치 프레스.gif',
    id: 'smith_decline_bench_press',
    koreanName: '스미스 디클라인 벤치 프레스',
    category: 'chest',
    equipment: 'smith_machine'
  },
  {
    filename: '스미스 벤치 프레스.gif',
    id: 'smith_bench_press',
    koreanName: '스미스 벤치 프레스',
    category: 'chest',
    equipment: 'smith_machine'
  },
  {
    filename: '스미스 인클라인 벤치프레스.gif',
    id: 'smith_incline_bench_press',
    koreanName: '스미스 인클라인 벤치프레스',
    category: 'chest',
    equipment: 'smith_machine'
  },
  {
    filename: '어시스트 딥스.gif',
    id: 'assisted_dips',
    koreanName: '어시스트 딥스',
    category: 'chest',
    equipment: 'machine'
  },
  {
    filename: '원 암 케이블 플라이.gif',
    id: 'one_arm_cable_fly',
    koreanName: '원 암 케이블 플라이',
    category: 'chest',
    equipment: 'cable'
  },
  {
    filename: '원 암 플레이트 체스트 프레스.gif',
    id: 'one_arm_plate_chest_press',
    koreanName: '원 암 플레이트 체스트 프레스',
    category: 'chest',
    equipment: 'plate'
  },
  {
    filename: '인클라인 덤벨 플라이.gif',
    id: 'incline_dumbbell_fly',
    koreanName: '인클라인 덤벨 플라이',
    category: 'chest',
    equipment: 'dumbbell'
  },
  {
    filename: '인클라인 케이블 플라이.gif',
    id: 'incline_cable_fly',
    koreanName: '인클라인 케이블 플라이',
    category: 'chest',
    equipment: 'cable'
  },
  {
    filename: '케이블 인클라인 체스트 프레스.gif',
    id: 'cable_incline_chest_press',
    koreanName: '케이블 인클라인 체스트 프레스',
    category: 'chest',
    equipment: 'cable'
  },
  {
    filename: '케이블 체스트 프레스.gif',
    id: 'cable_chest_press',
    koreanName: '케이블 체스트 프레스',
    category: 'chest',
    equipment: 'cable'
  },
  {
    filename: '케이블 크로스오버.gif',
    id: 'cable_crossover',
    koreanName: '케이블 크로스오버',
    category: 'chest',
    equipment: 'cable'
  },
  {
    filename: '플레이트 디클라인 체스트 프레스.gif',
    id: 'plate_decline_chest_press',
    koreanName: '플레이트 디클라인 체스트 프레스',
    category: 'chest',
    equipment: 'plate'
  },
  {
    filename: '플레이트 인클라인 체스트 프레스.gif',
    id: 'plate_incline_chest_press',
    koreanName: '플레이트 인클라인 체스트 프레스',
    category: 'chest',
    equipment: 'plate'
  },
  {
    filename: '플레이트 체스트 프레스.gif',
    id: 'plate_chest_press',
    koreanName: '플레이트 체스트 프레스',
    category: 'chest',
    equipment: 'plate'
  },
  {
    filename: '플레이트 체스트 플라이.gif',
    id: 'plate_chest_fly',
    koreanName: '플레이트 체스트 플라이',
    category: 'chest',
    equipment: 'plate'
  }
];

// Find new exercises
const newExercises = chestExercises.filter(ex => !existingIds.has(ex.id));
const existingExercisesToUpdate = chestExercises.filter(ex => existingIds.has(ex.id));

console.log(`Found ${newExercises.length} new chest exercises to add`);
console.log(`Found ${existingExercisesToUpdate.length} existing exercises to update with GIFs`);

// Generate new exercises
const newExerciseEntries = newExercises.map(ex => `  {
    id: '${ex.id}',
    name: {
      korean: '${ex.koreanName}',
      english: '${ex.koreanName}',
      romanization: '${ex.koreanName}'
    },
    category: '${ex.category}',
    equipment: '${ex.equipment}',
    targetMuscles: ['chest'],
    synergistMuscles: ['triceps', 'shoulders'],
    images: {
      primary: \`\${EXERCISE_IMAGE_BASE}/chest/\${encodeURIComponent('${ex.filename}')}\`,
      alternatives: []
    },
    instructions: {
      korean: [
        '시작 자세를 취합니다',
        '천천히 동작을 수행합니다',
        '시작 자세로 돌아옵니다'
      ],
      english: [
        'Get into starting position',
        'Perform the movement slowly',
        'Return to starting position'
      ]
    },
    difficulty: 'intermediate',
    mechanics: 'compound',
    forceType: 'push',
    gifUrl: './assets/exercise-gifs/chest/${ex.filename}',
    supabaseGifUrl: \`https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/${ex.id}.gif\`
  }`);

// Write to new file
const outputContent = `// New chest exercises to add to exerciseDatabase.ts

export const newChestExercises = [
${newExerciseEntries.join(',\n')}
];

// Existing exercises to update with GIF URLs:
export const exercisesToUpdate = [
${existingExercisesToUpdate.map(ex => `  { id: '${ex.id}', gifFile: '${ex.filename}' }`).join(',\n')}
];
`;

fs.writeFileSync(path.join(__dirname, 'newChestExercises.ts'), outputContent);
console.log('Created newChestExercises.ts with exercise data');