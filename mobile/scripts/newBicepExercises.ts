// New bicep exercises to add to database
export const newBicepExercises = [
  {
    id: 'dumbbell_bicep_curl',
    name: {
      korean: '덤벨 바이셉 컬',
      english: '덤벨 바이셉 컬',
      romanization: '덤벨 바이셉 컬'
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
    equipment: ["덤벨"],
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
      gifUrl: './assets/exercise-gifs/arms/덤벨 바이셉 컬.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/dumbbell_bicep_curl.gif'
    }
  },
  {
    id: 'dumbbell_concentration_curl',
    name: {
      korean: '덤벨 컨센트레이션 컬',
      english: '덤벨 컨센트레이션 컬',
      romanization: '덤벨 컨센트레이션 컬'
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
    equipment: ["덤벨","벤치"],
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
      gifUrl: './assets/exercise-gifs/arms/덤벨 컨센트레이션 컬.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/dumbbell_concentration_curl.gif'
    }
  },
  {
    id: 'dumbbell_hammer_curl',
    name: {
      korean: '덤벨 해머 컬',
      english: '덤벨 해머 컬',
      romanization: '덤벨 해머 컬'
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
    equipment: ["덤벨"],
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
      gifUrl: './assets/exercise-gifs/arms/덤벨 해머 컬.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/dumbbell_hammer_curl.gif'
    }
  },
  {
    id: 'barbell_bicep_curl',
    name: {
      korean: '바벨 바이셉 컬',
      english: '바벨 바이셉 컬',
      romanization: '바벨 바이셉 컬'
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
    equipment: ["바벨"],
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
      gifUrl: './assets/exercise-gifs/arms/바벨 바이셉 컬.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/barbell_bicep_curl.gif'
    }
  },
  {
    id: 'barbell_preacher_curl',
    name: {
      korean: '바벨 프리처 컬',
      english: '바벨 프리처 컬',
      romanization: '바벨 프리처 컬'
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
    equipment: ["바벨","프리처 벤치"],
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
      gifUrl: './assets/exercise-gifs/arms/바벨 프리처 컬.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/barbell_preacher_curl.gif'
    }
  },
  {
    id: 'spider_bicep_curl',
    name: {
      korean: '스파이더 바이셉 컬',
      english: '스파이더 바이셉 컬',
      romanization: '스파이더 바이셉 컬'
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
    equipment: ["바벨","인클라인 벤치"],
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
      gifUrl: './assets/exercise-gifs/arms/스파이더 바이셉 컬.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/spider_bicep_curl.gif'
    }
  },
  {
    id: 'one_arm_dumbbell_preacher_curl',
    name: {
      korean: '원 암 덤벨 프리처 컬',
      english: '원 암 덤벨 프리처 컬',
      romanization: '원 암 덤벨 프리처 컬'
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
    equipment: ["덤벨","프리처 벤치"],
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
      gifUrl: './assets/exercise-gifs/arms/원 암 덤벨 프리처 컬.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/one_arm_dumbbell_preacher_curl.gif'
    }
  },
  {
    id: 'one_arm_cable_bicep_curl',
    name: {
      korean: '원 암 케이블 바이셉 컬',
      english: '원 암 케이블 바이셉 컬',
      romanization: '원 암 케이블 바이셉 컬'
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
    equipment: ["케이블 머신","싱글 핸들"],
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
      gifUrl: './assets/exercise-gifs/arms/원 암 케이블 바이셉 컬.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/one_arm_cable_bicep_curl.gif'
    }
  },
  {
    id: 'ez_bar_bicep_curl',
    name: {
      korean: '이지 바 바이셉 컬',
      english: '이지 바 바이셉 컬',
      romanization: '이지 바 바이셉 컬'
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
    equipment: ["이지 바"],
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
      gifUrl: './assets/exercise-gifs/arms/이지 바 바이셉 컬.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/ez_bar_bicep_curl.gif'
    }
  },
  {
    id: 'ez_bar_reverse_bicep_curl',
    name: {
      korean: '이지바 리버스 바이셉 컬',
      english: '이지바 리버스 바이셉 컬',
      romanization: '이지바 리버스 바이셉 컬'
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
    equipment: ["이지 바"],
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
      gifUrl: './assets/exercise-gifs/arms/이지바 리버스 바이셉 컬.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/ez_bar_reverse_bicep_curl.gif'
    }
  },
  {
    id: 'cable_double_bicep_curl',
    name: {
      korean: '케이블 더블 바이셉 컬',
      english: '케이블 더블 바이셉 컬',
      romanization: '케이블 더블 바이셉 컬'
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
    equipment: ["케이블 머신","더블 핸들"],
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
      gifUrl: './assets/exercise-gifs/arms/케이블 더블 바이셉 컬.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/cable_double_bicep_curl.gif'
    }
  },
  {
    id: 'cable_rope_bicep_curl',
    name: {
      korean: '케이블 로프 바이셉 컬',
      english: '케이블 로프 바이셉 컬',
      romanization: '케이블 로프 바이셉 컬'
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
    equipment: ["케이블 머신","로프 핸들"],
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
      gifUrl: './assets/exercise-gifs/arms/케이블 로프 바이셉 컬.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/cable_rope_bicep_curl.gif'
    }
  },
  {
    id: 'cable_bicep_curl',
    name: {
      korean: '케이블 바이셉 컬',
      english: '케이블 바이셉 컬',
      romanization: '케이블 바이셉 컬'
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
    equipment: ["케이블 머신","스트레이트 바"],
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
      gifUrl: './assets/exercise-gifs/arms/케이블 바이셉 컬.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/cable_bicep_curl.gif'
    }
  },
  {
    id: 'close_grip_lat_pulldown_bicep',
    name: {
      korean: '클로즈 그립 랫 풀다운',
      english: '클로즈 그립 랫 풀다운',
      romanization: '클로즈 그립 랫 풀다운'
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
    equipment: ["랫 풀다운 머신","클로즈 그립 바"],
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
      gifUrl: './assets/exercise-gifs/arms/클로즈 그립 랫 풀다운.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/close_grip_lat_pulldown_bicep.gif'
    }
  }
];

// Existing exercises to update with GIFs:
export const bicepExercisesToUpdate = [];
