// Sample of properly formatted chest exercises
// These match the exact structure required by the database

const chestExercisesToAdd = [
  {
    id: 'dumbbell_bench_press',
    name: {
      english: '덤벨 벤치프레스',
      korean: '덤벨 벤치프레스',
      romanization: '덤벨 벤치프레스'
    },
    description: {
      english: 'A compound chest exercise',
      korean: '가슴을 대상으로 하는 복합 운동'
    },
    targetMuscles: {
      primary: ["가슴근"],
      secondary: ["삼두근","전삼각근"],
      stabilizers: ['코어']
    },
    equipment: ["덤벨","플랫 벤치"],
    category: 'compound',
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
    tips: {
      english: [
        'Keep core engaged throughout',
        'Control the negative portion',
        'Focus on mind-muscle connection'
      ],
      korean: [
        '전체 동작 중 코어를 단단히 유지하세요',
        '내리는 동작을 제어하세요',
        '근육과 정신의 연결에 집중하세요'
      ]
    },
    commonMistakes: {
      english: [
        'Moving too fast',
        'Using momentum instead of muscle',
        'Incorrect breathing pattern'
      ],
      korean: [
        '너무 빠른 동작',
        '근육 대신 반동 사용',
        '잘못된 호흡 패턴'
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
    media: {
      gifUrl: './assets/exercise-gifs/chest/덤벨 벤치프레스.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/dumbbell_bench_press.gif'
    }
  },
  {
    id: 'cable_crossover',
    name: {
      english: '케이블 크로스오버',
      korean: '케이블 크로스오버',
      romanization: '케이블 크로스오버'
    },
    description: {
      english: 'A isolation chest exercise',
      korean: '가슴을 대상으로 하는 고립 운동'
    },
    targetMuscles: {
      primary: ["가슴근"],
      secondary: ["전삼각근"],
      stabilizers: ['코어']
    },
    equipment: ["케이블 머신","케이블 핸들"],
    category: 'isolation',
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
    tips: {
      english: [
        'Keep core engaged throughout',
        'Control the negative portion',
        'Focus on mind-muscle connection'
      ],
      korean: [
        '전체 동작 중 코어를 단단히 유지하세요',
        '내리는 동작을 제어하세요',
        '근육과 정신의 연결에 집중하세요'
      ]
    },
    commonMistakes: {
      english: [
        'Moving too fast',
        'Using momentum instead of muscle',
        'Incorrect breathing pattern'
      ],
      korean: [
        '너무 빠른 동작',
        '근육 대신 반동 사용',
        '잘못된 호흡 패턴'
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
    media: {
      gifUrl: './assets/exercise-gifs/chest/케이블 크로스오버.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/cable_crossover.gif'
    }
  },
  {
    id: 'machine_chest_press',
    name: {
      english: '머신 체스트 프레스',
      korean: '머신 체스트 프레스',
      romanization: '머신 체스트 프레스'
    },
    description: {
      english: 'A compound chest exercise',
      korean: '가슴을 대상으로 하는 복합 운동'
    },
    targetMuscles: {
      primary: ["가슴근"],
      secondary: ["삼두근","전삼각근"],
      stabilizers: ['코어']
    },
    equipment: ["체스트 프레스 머신"],
    category: 'compound',
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
    tips: {
      english: [
        'Keep core engaged throughout',
        'Control the negative portion',
        'Focus on mind-muscle connection'
      ],
      korean: [
        '전체 동작 중 코어를 단단히 유지하세요',
        '내리는 동작을 제어하세요',
        '근육과 정신의 연결에 집중하세요'
      ]
    },
    commonMistakes: {
      english: [
        'Moving too fast',
        'Using momentum instead of muscle',
        'Incorrect breathing pattern'
      ],
      korean: [
        '너무 빠른 동작',
        '근육 대신 반동 사용',
        '잘못된 호흡 패턴'
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
    media: {
      gifUrl: './assets/exercise-gifs/chest/머신 체스트 프레스.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/machine_chest_press.gif'
    }
  }
];

// IMPORTANT: All exercises must have:
// 1. media object (not direct gifUrl/supabaseGifUrl)
// 2. tips and commonMistakes objects (both languages)
// 3. Proper structure matching ExerciseData interface
