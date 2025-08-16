const fs = require('fs');
const path = require('path');

// Generate properly formatted chest exercises
const generateChestExercise = (id, korean, filename, equipment, isCompound = true) => {
  const primaryMuscles = ['가슴근'];
  const secondaryMuscles = isCompound ? ['삼두근', '전삼각근'] : ['전삼각근'];
  
  return `  {
    id: '${id}',
    name: {
      english: '${korean}',
      korean: '${korean}',
      romanization: '${korean}'
    },
    description: {
      english: 'A ${isCompound ? 'compound' : 'isolation'} chest exercise',
      korean: '가슴을 대상으로 하는 ${isCompound ? '복합' : '고립'} 운동'
    },
    targetMuscles: {
      primary: ${JSON.stringify(primaryMuscles)},
      secondary: ${JSON.stringify(secondaryMuscles)},
      stabilizers: ['코어']
    },
    equipment: ${JSON.stringify(equipment)},
    category: '${isCompound ? 'compound' : 'isolation'}',
    bodyParts: ['가슴', '팔', '어깨'],
    difficulty: 'intermediate',
    instructions: {
      english: [
        'Set up in the starting position',
        'Perform the movement with control',
        'Focus on chest contraction',
        'Return to starting position'
      ],
      korean: [
        '시작 자세를 취합니다',
        '제어하며 동작을 수행합니다',
        '가슴 수축에 집중합니다',
        '시작 자세로 돌아갑니다'
      ]
    },
    sets: {
      recommended: '3-4',
      beginner: '3',
      intermediate: '4',
      advanced: '4-5'
    },
    reps: {
      recommended: '8-12',
      beginner: '10-12',
      intermediate: '8-10',
      advanced: '6-8'
    },
    gifUrl: './assets/exercise-gifs/chest/${filename}',
    supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/${id}.gif'
  }`;
};

// List of exercises to add (excluding existing ones)
const exercisesToAdd = [
  { id: 'dumbbell_bench_press', korean: '덤벨 벤치프레스', filename: '덤벨 벤치프레스.gif', equipment: ['덤벨', '플랫 벤치'], compound: true },
  { id: 'dumbbell_incline_bench_press', korean: '덤벨 인클라인 벤치 프레스', filename: '덤벨 인클라인 벤치 프레스.gif', equipment: ['덤벨', '인클라인 벤치'], compound: true },
  { id: 'dumbbell_chest_fly', korean: '덤벨 체스트 플라이', filename: '덤벨 체스트 플라이.gif', equipment: ['덤벨', '플랫 벤치'], compound: false },
  { id: 'decline_dumbbell_fly', korean: '디클라인 덤벨 플라이', filename: '디클라인 덤벨 플라이.gif', equipment: ['덤벨', '디클라인 벤치'], compound: false },
  { id: 'decline_barbell_bench_press', korean: '디클라인 바벨 벤치프레스', filename: '디클라인 바벨 벤치프레스.gif', equipment: ['바벨', '디클라인 벤치', '중량 플레이트'], compound: true },
  { id: 'decline_plate_chest_press', korean: '디클라인 플레이트 체스트 프레스', filename: '디클라인 플레이트 체스트 프레스.gif', equipment: ['중량 플레이트', '디클라인 벤치'], compound: true },
  { id: 'machine_decline_chest_press', korean: '머신 디클라인 체스트 프레스', filename: '머신 디클라인 체스트 프레스.gif', equipment: ['체스트 프레스 머신'], compound: true },
  { id: 'machine_chest_press', korean: '머신 체스트 프레스', filename: '머신 체스트 프레스.gif', equipment: ['체스트 프레스 머신'], compound: true },
  { id: 'machine_chest_fly', korean: '머신 체스트 플라이', filename: '머신 체스트 플라이.gif', equipment: ['펙덱 머신'], compound: false },
  { id: 'barbell_incline_bench_press', korean: '바벨 인클라인 벤치 프레스', filename: '바벨 인클라인 벤치 프레스.gif', equipment: ['바벨', '인클라인 벤치', '중량 플레이트'], compound: true },
  { id: 'smith_decline_bench_press', korean: '스미스 디클라인 벤치 프레스', filename: '스미스 디클라인 벤치 프레스.gif', equipment: ['스미스 머신', '디클라인 벤치'], compound: true },
  { id: 'smith_bench_press', korean: '스미스 벤치 프레스', filename: '스미스 벤치 프레스.gif', equipment: ['스미스 머신', '플랫 벤치'], compound: true },
  { id: 'smith_incline_bench_press', korean: '스미스 인클라인 벤치프레스', filename: '스미스 인클라인 벤치프레스.gif', equipment: ['스미스 머신', '인클라인 벤치'], compound: true },
  { id: 'assisted_dips', korean: '어시스트 딥스', filename: '어시스트 딥스.gif', equipment: ['어시스트 딥스 머신'], compound: true },
  { id: 'one_arm_cable_fly', korean: '원 암 케이블 플라이', filename: '원 암 케이블 플라이.gif', equipment: ['케이블 머신', '싱글 핸들'], compound: false },
  { id: 'one_arm_plate_chest_press', korean: '원 암 플레이트 체스트 프레스', filename: '원 암 플레이트 체스트 프레스.gif', equipment: ['중량 플레이트', '벤치'], compound: true },
  { id: 'incline_dumbbell_fly', korean: '인클라인 덤벨 플라이', filename: '인클라인 덤벨 플라이.gif', equipment: ['덤벨', '인클라인 벤치'], compound: false },
  { id: 'incline_cable_fly', korean: '인클라인 케이블 플라이', filename: '인클라인 케이블 플라이.gif', equipment: ['케이블 머신', '케이블 핸들', '인클라인 벤치'], compound: false },
  { id: 'cable_incline_chest_press', korean: '케이블 인클라인 체스트 프레스', filename: '케이블 인클라인 체스트 프레스.gif', equipment: ['케이블 머신', '케이블 핸들', '인클라인 벤치'], compound: true },
  { id: 'cable_chest_press', korean: '케이블 체스트 프레스', filename: '케이블 체스트 프레스.gif', equipment: ['케이블 머신', '케이블 핸들'], compound: true },
  { id: 'cable_crossover', korean: '케이블 크로스오버', filename: '케이블 크로스오버.gif', equipment: ['케이블 머신', '케이블 핸들'], compound: false },
  { id: 'plate_decline_chest_press', korean: '플레이트 디클라인 체스트 프레스', filename: '플레이트 디클라인 체스트 프레스.gif', equipment: ['중량 플레이트', '디클라인 벤치'], compound: true },
  { id: 'plate_incline_chest_press', korean: '플레이트 인클라인 체스트 프레스', filename: '플레이트 인클라인 체스트 프레스.gif', equipment: ['중량 플레이트', '인클라인 벤치'], compound: true },
  { id: 'plate_chest_press', korean: '플레이트 체스트 프레스', filename: '플레이트 체스트 프레스.gif', equipment: ['중량 플레이트', '플랫 벤치'], compound: true },
  { id: 'plate_chest_fly', korean: '플레이트 체스트 플라이', filename: '플레이트 체스트 플라이.gif', equipment: ['중량 플레이트', '플랫 벤치'], compound: false }
];

// Generate the exercises
const formattedExercises = exercisesToAdd.map(ex => 
  generateChestExercise(ex.id, ex.korean, ex.filename, ex.equipment, ex.compound)
);

// Create output file
const output = `// Chest exercises to add to database
const newChestExercises = [
${formattedExercises.join(',\n')}
];

// To add these to the database, insert them before the closing bracket of EXERCISE_DATABASE array
`;

fs.writeFileSync(path.join(__dirname, 'formattedChestExercises.txt'), output);
console.log('Created formattedChestExercises.txt with 25 new chest exercises');

// Also create update script for existing exercises
const updates = `
// Existing exercises to update with chest GIFs:
// 1. barbell_bench_press - add gifUrl: './assets/exercise-gifs/chest/바벨 벤치프레스.gif'
// 2. dips - add gifUrl: './assets/exercise-gifs/chest/딥스.gif'  
// 3. decline_cable_fly - add gifUrl: './assets/exercise-gifs/chest/디클라인 케이블 플라이.gif'
`;

fs.writeFileSync(path.join(__dirname, 'chestExerciseUpdates.txt'), updates);
console.log('Created chestExerciseUpdates.txt with update instructions');