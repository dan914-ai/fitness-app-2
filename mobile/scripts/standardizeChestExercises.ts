const fs = require('fs');
const path = require('path');

// Chest exercises with proper format matching existing database structure
const properlyFormattedChestExercises = [
  {
    id: 'dumbbell_bench_press',
    name: {
      english: 'Dumbbell Bench Press',
      korean: '덤벨 벤치프레스',
      romanization: '덤벨 벤치프레스'
    },
    description: {
      english: 'A compound chest exercise using dumbbells for increased range of motion',
      korean: '더 넓은 가동범위를 위해 덤벨을 사용하는 가슴 복합 운동'
    },
    targetMuscles: {
      primary: ['가슴근', '삼두근'],
      secondary: ['전삼각근'],
      stabilizers: ['코어']
    },
    equipment: ['덤벨', '플랫 벤치'],
    category: 'compound',
    bodyParts: ['가슴', '팔', '어깨'],
    difficulty: 'intermediate',
    instructions: {
      english: [
        'Lie on a flat bench with dumbbells in each hand',
        'Press the dumbbells up until arms are extended',
        'Lower dumbbells to chest level',
        'Press back to starting position'
      ],
      korean: [
        '플랫 벤치에 누워 양손에 덤벨을 듭니다',
        '팔이 완전히 펴질 때까지 덤벨을 밀어 올립니다',
        '덤벨을 가슴 높이까지 내립니다',
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
    gifUrl: './assets/exercise-gifs/chest/덤벨 벤치프레스.gif',
    supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/dumbbell_bench_press.gif'
  },
  {
    id: 'dumbbell_incline_bench_press',
    name: {
      english: 'Dumbbell Incline Bench Press',
      korean: '덤벨 인클라인 벤치 프레스',
      romanization: '덤벨 인클라인 벤치 프레스'
    },
    description: {
      english: 'An upper chest focused exercise performed on an inclined bench',
      korean: '인클라인 벤치에서 수행하는 상부 가슴 집중 운동'
    },
    targetMuscles: {
      primary: ['상부 가슴근', '삼두근'],
      secondary: ['전삼각근'],
      stabilizers: ['코어']
    },
    equipment: ['덤벨', '인클라인 벤치'],
    category: 'compound',
    bodyParts: ['가슴', '팔', '어깨'],
    difficulty: 'intermediate',
    instructions: {
      english: [
        'Set bench to 30-45 degree incline',
        'Lie back with dumbbells at shoulder level',
        'Press dumbbells up and slightly back',
        'Lower with control to starting position'
      ],
      korean: [
        '벤치를 30-45도 각도로 설정합니다',
        '덤벨을 어깨 높이에 두고 눕습니다',
        '덤벨을 위로 약간 뒤쪽으로 밀어 올립니다',
        '제어하며 시작 자세로 내립니다'
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
    gifUrl: './assets/exercise-gifs/chest/덤벨 인클라인 벤치 프레스.gif',
    supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/dumbbell_incline_bench_press.gif'
  },
  {
    id: 'cable_crossover',
    name: {
      english: 'Cable Crossover',
      korean: '케이블 크로스오버',
      romanization: '케이블 크로스오버'
    },
    description: {
      english: 'An isolation exercise for chest using cable machine',
      korean: '케이블 머신을 사용한 가슴 고립 운동'
    },
    targetMuscles: {
      primary: ['가슴근'],
      secondary: ['전삼각근'],
      stabilizers: ['코어']
    },
    equipment: ['케이블머신'],
    category: 'isolation',
    bodyParts: ['가슴', '어깨'],
    difficulty: 'intermediate',
    instructions: {
      english: [
        'Stand between cable pulleys set above head height',
        'Grab handles and step forward with slight lean',
        'Bring hands together in front of chest',
        'Return to starting position with control'
      ],
      korean: [
        '머리 위 높이로 설정된 케이블 풀리 사이에 섭니다',
        '핸들을 잡고 약간 앞으로 기울여 한 발 앞으로 나갑니다',
        '가슴 앞에서 손을 모읍니다',
        '제어하며 시작 자세로 돌아갑니다'
      ]
    },
    sets: {
      recommended: '3-4',
      beginner: '3',
      intermediate: '3-4',
      advanced: '4-5'
    },
    reps: {
      recommended: '12-15',
      beginner: '12-15',
      intermediate: '10-12',
      advanced: '8-12'
    },
    gifUrl: './assets/exercise-gifs/chest/케이블 크로스오버.gif',
    supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/cable_crossover.gif'
  }
];

console.log('Chest exercises formatted to match existing database structure');
console.log('Total exercises to add:', properlyFormattedChestExercises.length);

// Export for use in other scripts
module.exports = properlyFormattedChestExercises;