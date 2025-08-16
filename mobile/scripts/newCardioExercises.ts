// New cardio exercises to add to database
export const newCardioExercises = [
  {
    id: 'step_mill',
    name: {
      korean: '스텝 밀',
      english: '스텝 밀',
      romanization: '스텝 밀'
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
    equipment: ["스텝 밀 머신"],
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
      gifUrl: './assets/exercise-gifs/cardio/스텝 밀.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/step_mill.gif'
    }
  },
  {
    id: 'stationary_bike',
    name: {
      korean: '싸이클',
      english: '싸이클',
      romanization: '싸이클'
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
    equipment: ["실내 자전거"],
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
      gifUrl: './assets/exercise-gifs/cardio/싸이클.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/stationary_bike.gif'
    }
  },
  {
    id: 'elliptical_machine',
    name: {
      korean: '일립티컬 머신',
      english: '일립티컬 머신',
      romanization: '일립티컬 머신'
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
    equipment: ["일립티컬 머신"],
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
      gifUrl: './assets/exercise-gifs/cardio/일립티컬 머신.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/elliptical_machine.gif'
    }
  },
  {
    id: 'treadmill',
    name: {
      korean: '트레드밀',
      english: '트레드밀',
      romanization: '트레드밀'
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
    equipment: ["트레드밀"],
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
      gifUrl: './assets/exercise-gifs/cardio/트레드밀 (런닝머신).gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/treadmill.gif'
    }
  }
];

// Existing exercises to update with GIFs:
export const cardioExercisesToUpdate = [];
