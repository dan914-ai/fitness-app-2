// New traps and rear delts exercises to add to database
export const newTrapsRearDeltsExercises = [
  {
    id: 'dumbbell_rear_delt_raise',
    name: {
      korean: '덤벨 리어 델트 레이즈',
      english: '덤벨 리어 델트 레이즈',
      romanization: '덤벨 리어 델트 레이즈'
    },
    description: {
      korean: '후면 삼각근, 승모근을 대상으로 하는 운동',
      english: 'Exercise targeting the rear deltoids'
    },
    targetMuscles: {
      primary: ["후면 삼각근","승모근"],
      secondary: ["이두근"],
      stabilizers: ['코어']
    },
    equipment: ["덤벨"],
    category: 'compound',
    bodyParts: ['어깨', '등'],
    difficulty: 'intermediate',
    instructions: {
      korean: [
        '시작 자세를 취합니다',
        '후면 삼각근에 집중하며 팔을 들어올립니다',
        '정점에서 잠시 멈춥니다',
        '천천히 시작 자세로 돌아갑니다'
      ],
      english: [
        'Get into starting position',
        'Raise arms focusing on rear delts',
        'Pause at the top',
        'Slowly return to starting position'
      ]
    },
    tips: {
      korean: [
        '팔꿈치를 손목보다 높게 유지하세요',
        '전체 가동범위를 사용하세요',
        '목표 근육에 집중하세요'
      ],
      english: [
        'Keep elbows higher than wrists',
        'Use full range of motion',
        'Focus on target muscles'
      ]
    },
    commonMistakes: {
      korean: [
        '너무 무거운 중량 사용',
        '반동 사용',
        '팔꿈치가 너무 낮음'
      ],
      english: [
        'Using too much weight',
        'Using momentum',
        'Elbows too low'
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
      gifUrl: './assets/exercise-gifs/shoulders/덤벨 리어 델트 레이즈.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/dumbbell_rear_delt_raise.gif'
    }
  },
  {
    id: 'dumbbell_shrug',
    name: {
      korean: '덤벨 슈러그',
      english: '덤벨 슈러그',
      romanization: '덤벨 슈러그'
    },
    description: {
      korean: '승모근을 대상으로 하는 운동',
      english: 'Exercise targeting the trapezius'
    },
    targetMuscles: {
      primary: ["승모근"],
      secondary: [],
      stabilizers: ['코어']
    },
    equipment: ["덤벨"],
    category: 'isolation',
    bodyParts: ['어깨', '등'],
    difficulty: 'intermediate',
    instructions: {
      korean: [
        '시작 자세를 취합니다',
        '어깨를 귀 쪽으로 들어올립니다',
        '정점에서 잠시 멈춥니다',
        '천천히 시작 자세로 돌아갑니다'
      ],
      english: [
        'Get into starting position',
        'Lift shoulders toward ears',
        'Pause at the top',
        'Slowly return to starting position'
      ]
    },
    tips: {
      korean: [
        '어깨를 뒤로 돌리지 마세요',
        '전체 가동범위를 사용하세요',
        '목표 근육에 집중하세요'
      ],
      english: [
        'Don\'t roll shoulders backward',
        'Use full range of motion',
        'Focus on target muscles'
      ]
    },
    commonMistakes: {
      korean: [
        '너무 무거운 중량 사용',
        '반동 사용',
        '어깨 회전'
      ],
      english: [
        'Using too much weight',
        'Using momentum',
        'Rolling shoulders'
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
      intermediate: '10-15',
      advanced: '8-12'
    },
    media: {
      gifUrl: './assets/exercise-gifs/shoulders/덤벨 슈러그.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/dumbbell_shrug.gif'
    }
  },
  {
    id: 'dumbbell_upright_row',
    name: {
      korean: '덤벨 업라이트 로우',
      english: '덤벨 업라이트 로우',
      romanization: '덤벨 업라이트 로우'
    },
    description: {
      korean: '승모근, 삼각근을 대상으로 하는 운동',
      english: 'Exercise targeting the traps and deltoids'
    },
    targetMuscles: {
      primary: ["승모근","삼각근"],
      secondary: ["이두근"],
      stabilizers: ['코어']
    },
    equipment: ["덤벨"],
    category: 'compound',
    bodyParts: ['어깨', '등'],
    difficulty: 'intermediate',
    instructions: {
      korean: [
        '시작 자세를 취합니다',
        '팔꿈치를 높게 들어올리며 바를 당깁니다',
        '정점에서 잠시 멈춥니다',
        '천천히 시작 자세로 돌아갑니다'
      ],
      english: [
        'Get into starting position',
        'Pull the bar up with high elbows',
        'Pause at the top',
        'Slowly return to starting position'
      ]
    },
    tips: {
      korean: [
        '팔꿈치를 손목보다 높게 유지하세요',
        '전체 가동범위를 사용하세요',
        '목표 근육에 집중하세요'
      ],
      english: [
        'Keep elbows higher than wrists',
        'Use full range of motion',
        'Focus on target muscles'
      ]
    },
    commonMistakes: {
      korean: [
        '너무 무거운 중량 사용',
        '반동 사용',
        '팔꿈치가 너무 낮음'
      ],
      english: [
        'Using too much weight',
        'Using momentum',
        'Elbows too low'
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
      gifUrl: './assets/exercise-gifs/shoulders/덤벨 업라이트 로우.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/dumbbell_upright_row.gif'
    }
  },
  {
    id: 'barbell_shrug',
    name: {
      korean: '바벨 슈러그',
      english: '바벨 슈러그',
      romanization: '바벨 슈러그'
    },
    description: {
      korean: '승모근을 대상으로 하는 운동',
      english: 'Exercise targeting the trapezius'
    },
    targetMuscles: {
      primary: ["승모근"],
      secondary: [],
      stabilizers: ['코어']
    },
    equipment: ["바벨"],
    category: 'isolation',
    bodyParts: ['어깨', '등'],
    difficulty: 'intermediate',
    instructions: {
      korean: [
        '시작 자세를 취합니다',
        '어깨를 귀 쪽으로 들어올립니다',
        '정점에서 잠시 멈춥니다',
        '천천히 시작 자세로 돌아갑니다'
      ],
      english: [
        'Get into starting position',
        'Lift shoulders toward ears',
        'Pause at the top',
        'Slowly return to starting position'
      ]
    },
    tips: {
      korean: [
        '어깨를 뒤로 돌리지 마세요',
        '전체 가동범위를 사용하세요',
        '목표 근육에 집중하세요'
      ],
      english: [
        'Don\'t roll shoulders backward',
        'Use full range of motion',
        'Focus on target muscles'
      ]
    },
    commonMistakes: {
      korean: [
        '너무 무거운 중량 사용',
        '반동 사용',
        '어깨 회전'
      ],
      english: [
        'Using too much weight',
        'Using momentum',
        'Rolling shoulders'
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
      intermediate: '10-15',
      advanced: '8-12'
    },
    media: {
      gifUrl: './assets/exercise-gifs/shoulders/바벨 슈러그.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/barbell_shrug.gif'
    }
  },
  {
    id: 'barbell_upright_row',
    name: {
      korean: '바벨 업라이트 로우',
      english: '바벨 업라이트 로우',
      romanization: '바벨 업라이트 로우'
    },
    description: {
      korean: '승모근, 삼각근을 대상으로 하는 운동',
      english: 'Exercise targeting the traps and deltoids'
    },
    targetMuscles: {
      primary: ["승모근","삼각근"],
      secondary: ["이두근"],
      stabilizers: ['코어']
    },
    equipment: ["바벨"],
    category: 'compound',
    bodyParts: ['어깨', '등'],
    difficulty: 'intermediate',
    instructions: {
      korean: [
        '시작 자세를 취합니다',
        '팔꿈치를 높게 들어올리며 바를 당깁니다',
        '정점에서 잠시 멈춥니다',
        '천천히 시작 자세로 돌아갑니다'
      ],
      english: [
        'Get into starting position',
        'Pull the bar up with high elbows',
        'Pause at the top',
        'Slowly return to starting position'
      ]
    },
    tips: {
      korean: [
        '팔꿈치를 손목보다 높게 유지하세요',
        '전체 가동범위를 사용하세요',
        '목표 근육에 집중하세요'
      ],
      english: [
        'Keep elbows higher than wrists',
        'Use full range of motion',
        'Focus on target muscles'
      ]
    },
    commonMistakes: {
      korean: [
        '너무 무거운 중량 사용',
        '반동 사용',
        '팔꿈치가 너무 낮음'
      ],
      english: [
        'Using too much weight',
        'Using momentum',
        'Elbows too low'
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
      gifUrl: './assets/exercise-gifs/shoulders/바벨 업라이트 로우.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/barbell_upright_row.gif'
    }
  },
  {
    id: 'smith_machine_shrug',
    name: {
      korean: '스미스 머신 슈러그',
      english: '스미스 머신 슈러그',
      romanization: '스미스 머신 슈러그'
    },
    description: {
      korean: '승모근을 대상으로 하는 운동',
      english: 'Exercise targeting the trapezius'
    },
    targetMuscles: {
      primary: ["승모근"],
      secondary: [],
      stabilizers: ['코어']
    },
    equipment: ["스미스 머신"],
    category: 'isolation',
    bodyParts: ['어깨', '등'],
    difficulty: 'intermediate',
    instructions: {
      korean: [
        '시작 자세를 취합니다',
        '어깨를 귀 쪽으로 들어올립니다',
        '정점에서 잠시 멈춥니다',
        '천천히 시작 자세로 돌아갑니다'
      ],
      english: [
        'Get into starting position',
        'Lift shoulders toward ears',
        'Pause at the top',
        'Slowly return to starting position'
      ]
    },
    tips: {
      korean: [
        '어깨를 뒤로 돌리지 마세요',
        '전체 가동범위를 사용하세요',
        '목표 근육에 집중하세요'
      ],
      english: [
        'Don\'t roll shoulders backward',
        'Use full range of motion',
        'Focus on target muscles'
      ]
    },
    commonMistakes: {
      korean: [
        '너무 무거운 중량 사용',
        '반동 사용',
        '어깨 회전'
      ],
      english: [
        'Using too much weight',
        'Using momentum',
        'Rolling shoulders'
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
      intermediate: '10-15',
      advanced: '8-12'
    },
    media: {
      gifUrl: './assets/exercise-gifs/shoulders/스미스 머신 슈러그.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/smith_machine_shrug.gif'
    }
  },
  {
    id: 'one_arm_dumbbell_upright_row',
    name: {
      korean: '원 암 덤벨 업라이트 로우',
      english: '원 암 덤벨 업라이트 로우',
      romanization: '원 암 덤벨 업라이트 로우'
    },
    description: {
      korean: '승모근, 삼각근을 대상으로 하는 운동',
      english: 'Exercise targeting the traps and deltoids'
    },
    targetMuscles: {
      primary: ["승모근","삼각근"],
      secondary: ["이두근"],
      stabilizers: ['코어']
    },
    equipment: ["덤벨"],
    category: 'compound',
    bodyParts: ['어깨', '등'],
    difficulty: 'intermediate',
    instructions: {
      korean: [
        '시작 자세를 취합니다',
        '팔꿈치를 높게 들어올리며 바를 당깁니다',
        '정점에서 잠시 멈춥니다',
        '천천히 시작 자세로 돌아갑니다'
      ],
      english: [
        'Get into starting position',
        'Pull the bar up with high elbows',
        'Pause at the top',
        'Slowly return to starting position'
      ]
    },
    tips: {
      korean: [
        '팔꿈치를 손목보다 높게 유지하세요',
        '전체 가동범위를 사용하세요',
        '목표 근육에 집중하세요'
      ],
      english: [
        'Keep elbows higher than wrists',
        'Use full range of motion',
        'Focus on target muscles'
      ]
    },
    commonMistakes: {
      korean: [
        '너무 무거운 중량 사용',
        '반동 사용',
        '팔꿈치가 너무 낮음'
      ],
      english: [
        'Using too much weight',
        'Using momentum',
        'Elbows too low'
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
      gifUrl: './assets/exercise-gifs/shoulders/원 암 덤벨 업라이트 로우.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/one_arm_dumbbell_upright_row.gif'
    }
  },
  {
    id: 'ez_bar_upright_row',
    name: {
      korean: '이지바 업라이트 로우',
      english: '이지바 업라이트 로우',
      romanization: '이지바 업라이트 로우'
    },
    description: {
      korean: '승모근, 삼각근을 대상으로 하는 운동',
      english: 'Exercise targeting the traps and deltoids'
    },
    targetMuscles: {
      primary: ["승모근","삼각근"],
      secondary: ["이두근"],
      stabilizers: ['코어']
    },
    equipment: ["이지 바"],
    category: 'compound',
    bodyParts: ['어깨', '등'],
    difficulty: 'intermediate',
    instructions: {
      korean: [
        '시작 자세를 취합니다',
        '팔꿈치를 높게 들어올리며 바를 당깁니다',
        '정점에서 잠시 멈춥니다',
        '천천히 시작 자세로 돌아갑니다'
      ],
      english: [
        'Get into starting position',
        'Pull the bar up with high elbows',
        'Pause at the top',
        'Slowly return to starting position'
      ]
    },
    tips: {
      korean: [
        '팔꿈치를 손목보다 높게 유지하세요',
        '전체 가동범위를 사용하세요',
        '목표 근육에 집중하세요'
      ],
      english: [
        'Keep elbows higher than wrists',
        'Use full range of motion',
        'Focus on target muscles'
      ]
    },
    commonMistakes: {
      korean: [
        '너무 무거운 중량 사용',
        '반동 사용',
        '팔꿈치가 너무 낮음'
      ],
      english: [
        'Using too much weight',
        'Using momentum',
        'Elbows too low'
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
      gifUrl: './assets/exercise-gifs/shoulders/이지바 업라이트 로우.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/ez_bar_upright_row.gif'
    }
  },
  {
    id: 'chest_supported_dumbbell_shrug',
    name: {
      korean: '체스트 서포티드 덤벨 슈러그',
      english: '체스트 서포티드 덤벨 슈러그',
      romanization: '체스트 서포티드 덤벨 슈러그'
    },
    description: {
      korean: '승모근을 대상으로 하는 운동',
      english: 'Exercise targeting the trapezius'
    },
    targetMuscles: {
      primary: ["승모근"],
      secondary: [],
      stabilizers: ['코어']
    },
    equipment: ["덤벨","인클라인 벤치"],
    category: 'isolation',
    bodyParts: ['어깨', '등'],
    difficulty: 'intermediate',
    instructions: {
      korean: [
        '시작 자세를 취합니다',
        '어깨를 귀 쪽으로 들어올립니다',
        '정점에서 잠시 멈춥니다',
        '천천히 시작 자세로 돌아갑니다'
      ],
      english: [
        'Get into starting position',
        'Lift shoulders toward ears',
        'Pause at the top',
        'Slowly return to starting position'
      ]
    },
    tips: {
      korean: [
        '어깨를 뒤로 돌리지 마세요',
        '전체 가동범위를 사용하세요',
        '목표 근육에 집중하세요'
      ],
      english: [
        'Don\'t roll shoulders backward',
        'Use full range of motion',
        'Focus on target muscles'
      ]
    },
    commonMistakes: {
      korean: [
        '너무 무거운 중량 사용',
        '반동 사용',
        '어깨 회전'
      ],
      english: [
        'Using too much weight',
        'Using momentum',
        'Rolling shoulders'
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
      intermediate: '10-15',
      advanced: '8-12'
    },
    media: {
      gifUrl: './assets/exercise-gifs/shoulders/체스트 서포티드 덤벨 슈러그.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/chest_supported_dumbbell_shrug.gif'
    }
  },
  {
    id: 'cable_shrug',
    name: {
      korean: '케이블 슈러그',
      english: '케이블 슈러그',
      romanization: '케이블 슈러그'
    },
    description: {
      korean: '승모근을 대상으로 하는 운동',
      english: 'Exercise targeting the trapezius'
    },
    targetMuscles: {
      primary: ["승모근"],
      secondary: [],
      stabilizers: ['코어']
    },
    equipment: ["케이블 머신"],
    category: 'isolation',
    bodyParts: ['어깨', '등'],
    difficulty: 'intermediate',
    instructions: {
      korean: [
        '시작 자세를 취합니다',
        '어깨를 귀 쪽으로 들어올립니다',
        '정점에서 잠시 멈춥니다',
        '천천히 시작 자세로 돌아갑니다'
      ],
      english: [
        'Get into starting position',
        'Lift shoulders toward ears',
        'Pause at the top',
        'Slowly return to starting position'
      ]
    },
    tips: {
      korean: [
        '어깨를 뒤로 돌리지 마세요',
        '전체 가동범위를 사용하세요',
        '목표 근육에 집중하세요'
      ],
      english: [
        'Don\'t roll shoulders backward',
        'Use full range of motion',
        'Focus on target muscles'
      ]
    },
    commonMistakes: {
      korean: [
        '너무 무거운 중량 사용',
        '반동 사용',
        '어깨 회전'
      ],
      english: [
        'Using too much weight',
        'Using momentum',
        'Rolling shoulders'
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
      intermediate: '10-15',
      advanced: '8-12'
    },
    media: {
      gifUrl: './assets/exercise-gifs/shoulders/케이블 슈러그.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/cable_shrug.gif'
    }
  },
  {
    id: 'cable_upright_row',
    name: {
      korean: '케이블 업라이트 로우',
      english: '케이블 업라이트 로우',
      romanization: '케이블 업라이트 로우'
    },
    description: {
      korean: '승모근, 삼각근을 대상으로 하는 운동',
      english: 'Exercise targeting the traps and deltoids'
    },
    targetMuscles: {
      primary: ["승모근","삼각근"],
      secondary: ["이두근"],
      stabilizers: ['코어']
    },
    equipment: ["케이블 머신","스트레이트 바"],
    category: 'compound',
    bodyParts: ['어깨', '등'],
    difficulty: 'intermediate',
    instructions: {
      korean: [
        '시작 자세를 취합니다',
        '팔꿈치를 높게 들어올리며 바를 당깁니다',
        '정점에서 잠시 멈춥니다',
        '천천히 시작 자세로 돌아갑니다'
      ],
      english: [
        'Get into starting position',
        'Pull the bar up with high elbows',
        'Pause at the top',
        'Slowly return to starting position'
      ]
    },
    tips: {
      korean: [
        '팔꿈치를 손목보다 높게 유지하세요',
        '전체 가동범위를 사용하세요',
        '목표 근육에 집중하세요'
      ],
      english: [
        'Keep elbows higher than wrists',
        'Use full range of motion',
        'Focus on target muscles'
      ]
    },
    commonMistakes: {
      korean: [
        '너무 무거운 중량 사용',
        '반동 사용',
        '팔꿈치가 너무 낮음'
      ],
      english: [
        'Using too much weight',
        'Using momentum',
        'Elbows too low'
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
      gifUrl: './assets/exercise-gifs/shoulders/케이블 업라이트 로우.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/cable_upright_row.gif'
    }
  }
];

// Existing exercises to update with GIFs:
export const trapsRearDeltsExercisesToUpdate = [];
