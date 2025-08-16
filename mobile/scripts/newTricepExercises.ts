// New tricep exercises to add to database
export const newTricepExercises = [
  {
    id: 'kneeling_cable_overhead_tricep_extension',
    name: {
      korean: '닐링 케이블 오버헤드 트라이셉 익스텐션',
      english: '닐링 케이블 오버헤드 트라이셉 익스텐션',
      romanization: '닐링 케이블 오버헤드 트라이셉 익스텐션'
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
    equipment: ["케이블 머신","로프 핸들"],
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
      gifUrl: './assets/exercise-gifs/arms/닐링 케이블 오버헤드 트라이셉 익스텐션.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/kneeling_cable_overhead_tricep_extension.gif'
    }
  },
  {
    id: 'dumbbell_tricep_extension_seated',
    name: {
      korean: '덤벨 트라이센 익스텐션',
      english: '덤벨 트라이센 익스텐션',
      romanization: '덤벨 트라이센 익스텐션'
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
    equipment: ["덤벨"],
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
      gifUrl: './assets/exercise-gifs/arms/덤벨 트라이센 익스텐션.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/dumbbell_tricep_extension_seated.gif'
    }
  },
  {
    id: 'dumbbell_tricep_extension',
    name: {
      korean: '덤벨 트라이셉 익스텐션',
      english: '덤벨 트라이셉 익스텐션',
      romanization: '덤벨 트라이셉 익스텐션'
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
    equipment: ["덤벨"],
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
      gifUrl: './assets/exercise-gifs/arms/덤벨 트라이셉 익스텐션.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/dumbbell_tricep_extension.gif'
    }
  },
  {
    id: 'dumbbell_tricep_kickback',
    name: {
      korean: '덤벨 트라이셉 킥백',
      english: '덤벨 트라이셉 킥백',
      romanization: '덤벨 트라이셉 킥백'
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
    equipment: ["덤벨","벤치"],
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
      gifUrl: './assets/exercise-gifs/arms/덤벨 트라이셉 킥백.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/dumbbell_tricep_kickback.gif'
    }
  },
  {
    id: 'machine_dips',
    name: {
      korean: '머신 딥스',
      english: '머신 딥스',
      romanization: '머신 딥스'
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
    equipment: ["딥스 머신"],
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
      gifUrl: './assets/exercise-gifs/arms/머신 딥스.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/machine_dips.gif'
    }
  },
  {
    id: 'machine_tricep_extension_2',
    name: {
      korean: '머신 트라이셉 익스텐션 2',
      english: '머신 트라이셉 익스텐션 2',
      romanization: '머신 트라이셉 익스텐션 2'
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
    equipment: ["트라이셉 머신"],
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
      gifUrl: './assets/exercise-gifs/arms/머신 트라이셉 익스텐션 2.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/machine_tricep_extension_2.gif'
    }
  },
  {
    id: 'machine_tricep_extension',
    name: {
      korean: '머신 트라이셉 익스텐션',
      english: '머신 트라이셉 익스텐션',
      romanization: '머신 트라이셉 익스텐션'
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
    equipment: ["트라이셉 머신"],
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
      gifUrl: './assets/exercise-gifs/arms/머신 트라이셉 익스텐션.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/machine_tricep_extension.gif'
    }
  },
  {
    id: 'barbell_lying_tricep_extension',
    name: {
      korean: '바벨 라잉 트라이셉 익스텐션',
      english: '바벨 라잉 트라이셉 익스텐션',
      romanization: '바벨 라잉 트라이셉 익스텐션'
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
    equipment: ["바벨","플랫 벤치"],
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
      gifUrl: './assets/exercise-gifs/arms/바벨 라잉 트라이셉 익스텐션.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/barbell_lying_tricep_extension.gif'
    }
  },
  {
    id: 'barbell_incline_tricep_extension',
    name: {
      korean: '바벨 인클라인 트라이셉 익스텐션',
      english: '바벨 인클라인 트라이셉 익스텐션',
      romanization: '바벨 인클라인 트라이셉 익스텐션'
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
    equipment: ["바벨","인클라인 벤치"],
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
      gifUrl: './assets/exercise-gifs/arms/바벨 인클라인 트라이셉 익스텐션.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/barbell_incline_tricep_extension.gif'
    }
  },
  {
    id: 'barbell_tricep_extension',
    name: {
      korean: '바벨 트라이셉 익스텐션',
      english: '바벨 트라이셉 익스텐션',
      romanization: '바벨 트라이셉 익스텐션'
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
    equipment: ["바벨"],
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
      gifUrl: './assets/exercise-gifs/arms/바벨 트라이셉 익스텐션.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/barbell_tricep_extension.gif'
    }
  },
  {
    id: 'bench_dips',
    name: {
      korean: '벤치 딥스',
      english: '벤치 딥스',
      romanization: '벤치 딥스'
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
    equipment: ["벤치"],
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
      gifUrl: './assets/exercise-gifs/arms/벤치 딥스.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/bench_dips.gif'
    }
  },
  {
    id: 'assisted_tricep_dips',
    name: {
      korean: '어시스트 딥스',
      english: '어시스트 딥스',
      romanization: '어시스트 딥스'
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
    equipment: ["어시스트 딥스 머신"],
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
      gifUrl: './assets/exercise-gifs/arms/어시스트 딥스.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/assisted_tricep_dips.gif'
    }
  },
  {
    id: 'one_arm_dumbbell_tricep_extension',
    name: {
      korean: '원 암 덤벨 트라이셉 익스텐션',
      english: '원 암 덤벨 트라이셉 익스텐션',
      romanization: '원 암 덤벨 트라이셉 익스텐션'
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
    equipment: ["덤벨"],
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
      gifUrl: './assets/exercise-gifs/arms/원 암 덤벨 트라이셉 익스텐션.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/one_arm_dumbbell_tricep_extension.gif'
    }
  },
  {
    id: 'one_arm_cable_tricep_extension',
    name: {
      korean: '원 암 케이블 트라이셉 익스텐션',
      english: '원 암 케이블 트라이셉 익스텐션',
      romanization: '원 암 케이블 트라이셉 익스텐션'
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
    equipment: ["케이블 머신","싱글 핸들"],
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
      gifUrl: './assets/exercise-gifs/arms/원 암 케이블 트라이셉 익스텐션.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/one_arm_cable_tricep_extension.gif'
    }
  },
  {
    id: 'cable_v_bar_tricep_pushdown',
    name: {
      korean: '케이블 V-바 트라이셉 푸시다운',
      english: '케이블 V-바 트라이셉 푸시다운',
      romanization: '케이블 V-바 트라이셉 푸시다운'
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
    equipment: ["케이블 머신","V-바"],
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
      gifUrl: './assets/exercise-gifs/arms/케이블 v-bar 트라이셉 푸시다운.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/cable_v_bar_tricep_pushdown.gif'
    }
  },
  {
    id: 'cable_rope_tricep_extension',
    name: {
      korean: '케이블 로프 트라이셉 익스텐션',
      english: '케이블 로프 트라이셉 익스텐션',
      romanization: '케이블 로프 트라이셉 익스텐션'
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
    equipment: ["케이블 머신","로프 핸들"],
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
      gifUrl: './assets/exercise-gifs/arms/케이블 로프 트라이셉 익스텐션.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/cable_rope_tricep_extension.gif'
    }
  },
  {
    id: 'cable_reverse_grip_tricep_pushdown',
    name: {
      korean: '케이블 리버스 그립 트라이셉 푸시다운',
      english: '케이블 리버스 그립 트라이셉 푸시다운',
      romanization: '케이블 리버스 그립 트라이셉 푸시다운'
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
    equipment: ["케이블 머신","스트레이트 바"],
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
      gifUrl: './assets/exercise-gifs/arms/케이블 리버스 그립 트라이셉 푸시다운.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/cable_reverse_grip_tricep_pushdown.gif'
    }
  },
  {
    id: 'cable_overhead_tricep_extension',
    name: {
      korean: '케이블 오버헤드 트라이셉 익스텐션',
      english: '케이블 오버헤드 트라이셉 익스텐션',
      romanization: '케이블 오버헤드 트라이셉 익스텐션'
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
    equipment: ["케이블 머신","로프 핸들"],
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
      gifUrl: './assets/exercise-gifs/arms/케이블 오버헤드 트라이셉 익스텐션.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/cable_overhead_tricep_extension.gif'
    }
  },
  {
    id: 'cable_one_arm_reverse_grip_tricep_pushdown',
    name: {
      korean: '케이블 원 암 리버스 그립 트라이셉 푸시다운',
      english: '케이블 원 암 리버스 그립 트라이셉 푸시다운',
      romanization: '케이블 원 암 리버스 그립 트라이셉 푸시다운'
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
    equipment: ["케이블 머신","싱글 핸들"],
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
      gifUrl: './assets/exercise-gifs/arms/케이블 원 암 리버스 그립 트라이셉 푸시다운.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/cable_one_arm_reverse_grip_tricep_pushdown.gif'
    }
  },
  {
    id: 'cable_incline_tricep_extension',
    name: {
      korean: '케이블 인클라인 트라이셉 익스텐션',
      english: '케이블 인클라인 트라이셉 익스텐션',
      romanization: '케이블 인클라인 트라이셉 익스텐션'
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
    equipment: ["케이블 머신","로프 핸들","인클라인 벤치"],
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
      gifUrl: './assets/exercise-gifs/arms/케이블 인클라인 트라이셉 익스텐션.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/cable_incline_tricep_extension.gif'
    }
  },
  {
    id: 'cable_tricep_kickback',
    name: {
      korean: '케이블 트라이셉 킥백',
      english: '케이블 트라이셉 킥백',
      romanization: '케이블 트라이셉 킥백'
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
    equipment: ["케이블 머신","싱글 핸들"],
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
      gifUrl: './assets/exercise-gifs/arms/케이블 트라이셉 킥백.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/cable_tricep_kickback.gif'
    }
  },
  {
    id: 'close_grip_bench_press',
    name: {
      korean: '클로즈 그립 벤치 프레스',
      english: '클로즈 그립 벤치 프레스',
      romanization: '클로즈 그립 벤치 프레스'
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
    equipment: ["바벨","플랫 벤치"],
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
      gifUrl: './assets/exercise-gifs/arms/클로즈 그립 벤치 프레스.gif',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/close_grip_bench_press.gif'
    }
  }
];

// Existing exercises to update with GIFs:
export const tricepExercisesToUpdate = [];
