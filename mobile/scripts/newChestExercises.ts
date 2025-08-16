// New chest exercises to add to exerciseDatabase.ts

export const newChestExercises = [
  {
    id: 'dumbbell_bench_press',
    name: {
      korean: '덤벨 벤치프레스',
      english: '덤벨 벤치프레스',
      romanization: '덤벨 벤치프레스'
    },
    category: 'chest',
    equipment: 'dumbbell',
    targetMuscles: ['chest'],
    synergistMuscles: ['triceps', 'shoulders'],
    images: {
      primary: `${EXERCISE_IMAGE_BASE}/chest/${encodeURIComponent('덤벨 벤치프레스.gif')}`,
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
    gifUrl: './assets/exercise-gifs/chest/덤벨 벤치프레스.gif',
    supabaseGifUrl: `https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/dumbbell_bench_press.gif`
  },
  {
    id: 'dumbbell_incline_bench_press',
    name: {
      korean: '덤벨 인클라인 벤치 프레스',
      english: '덤벨 인클라인 벤치 프레스',
      romanization: '덤벨 인클라인 벤치 프레스'
    },
    category: 'chest',
    equipment: 'dumbbell',
    targetMuscles: ['chest'],
    synergistMuscles: ['triceps', 'shoulders'],
    images: {
      primary: `${EXERCISE_IMAGE_BASE}/chest/${encodeURIComponent('덤벨 인클라인 벤치 프레스.gif')}`,
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
    gifUrl: './assets/exercise-gifs/chest/덤벨 인클라인 벤치 프레스.gif',
    supabaseGifUrl: `https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/dumbbell_incline_bench_press.gif`
  },
  {
    id: 'dumbbell_chest_fly',
    name: {
      korean: '덤벨 체스트 플라이',
      english: '덤벨 체스트 플라이',
      romanization: '덤벨 체스트 플라이'
    },
    category: 'chest',
    equipment: 'dumbbell',
    targetMuscles: ['chest'],
    synergistMuscles: ['triceps', 'shoulders'],
    images: {
      primary: `${EXERCISE_IMAGE_BASE}/chest/${encodeURIComponent('덤벨 체스트 플라이.gif')}`,
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
    gifUrl: './assets/exercise-gifs/chest/덤벨 체스트 플라이.gif',
    supabaseGifUrl: `https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/dumbbell_chest_fly.gif`
  },
  {
    id: 'decline_dumbbell_fly',
    name: {
      korean: '디클라인 덤벨 플라이',
      english: '디클라인 덤벨 플라이',
      romanization: '디클라인 덤벨 플라이'
    },
    category: 'chest',
    equipment: 'dumbbell',
    targetMuscles: ['chest'],
    synergistMuscles: ['triceps', 'shoulders'],
    images: {
      primary: `${EXERCISE_IMAGE_BASE}/chest/${encodeURIComponent('디클라인 덤벨 플라이.gif')}`,
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
    gifUrl: './assets/exercise-gifs/chest/디클라인 덤벨 플라이.gif',
    supabaseGifUrl: `https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/decline_dumbbell_fly.gif`
  },
  {
    id: 'decline_barbell_bench_press',
    name: {
      korean: '디클라인 바벨 벤치프레스',
      english: '디클라인 바벨 벤치프레스',
      romanization: '디클라인 바벨 벤치프레스'
    },
    category: 'chest',
    equipment: 'barbell',
    targetMuscles: ['chest'],
    synergistMuscles: ['triceps', 'shoulders'],
    images: {
      primary: `${EXERCISE_IMAGE_BASE}/chest/${encodeURIComponent('디클라인 바벨 벤치프레스.gif')}`,
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
    gifUrl: './assets/exercise-gifs/chest/디클라인 바벨 벤치프레스.gif',
    supabaseGifUrl: `https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/decline_barbell_bench_press.gif`
  },
  {
    id: 'decline_plate_chest_press',
    name: {
      korean: '디클라인 플레이트 체스트 프레스',
      english: '디클라인 플레이트 체스트 프레스',
      romanization: '디클라인 플레이트 체스트 프레스'
    },
    category: 'chest',
    equipment: 'plate',
    targetMuscles: ['chest'],
    synergistMuscles: ['triceps', 'shoulders'],
    images: {
      primary: `${EXERCISE_IMAGE_BASE}/chest/${encodeURIComponent('디클라인 플레이트 체스트 프레스.gif')}`,
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
    gifUrl: './assets/exercise-gifs/chest/디클라인 플레이트 체스트 프레스.gif',
    supabaseGifUrl: `https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/decline_plate_chest_press.gif`
  },
  {
    id: 'machine_decline_chest_press',
    name: {
      korean: '머신 디클라인 체스트 프레스',
      english: '머신 디클라인 체스트 프레스',
      romanization: '머신 디클라인 체스트 프레스'
    },
    category: 'chest',
    equipment: 'machine',
    targetMuscles: ['chest'],
    synergistMuscles: ['triceps', 'shoulders'],
    images: {
      primary: `${EXERCISE_IMAGE_BASE}/chest/${encodeURIComponent('머신 디클라인 체스트 프레스.gif')}`,
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
    gifUrl: './assets/exercise-gifs/chest/머신 디클라인 체스트 프레스.gif',
    supabaseGifUrl: `https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/machine_decline_chest_press.gif`
  },
  {
    id: 'machine_chest_press',
    name: {
      korean: '머신 체스트 프레스',
      english: '머신 체스트 프레스',
      romanization: '머신 체스트 프레스'
    },
    category: 'chest',
    equipment: 'machine',
    targetMuscles: ['chest'],
    synergistMuscles: ['triceps', 'shoulders'],
    images: {
      primary: `${EXERCISE_IMAGE_BASE}/chest/${encodeURIComponent('머신 체스트 프레스.gif')}`,
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
    gifUrl: './assets/exercise-gifs/chest/머신 체스트 프레스.gif',
    supabaseGifUrl: `https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/machine_chest_press.gif`
  },
  {
    id: 'machine_chest_fly',
    name: {
      korean: '머신 체스트 플라이',
      english: '머신 체스트 플라이',
      romanization: '머신 체스트 플라이'
    },
    category: 'chest',
    equipment: 'machine',
    targetMuscles: ['chest'],
    synergistMuscles: ['triceps', 'shoulders'],
    images: {
      primary: `${EXERCISE_IMAGE_BASE}/chest/${encodeURIComponent('머신 체스트 플라이.gif')}`,
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
    gifUrl: './assets/exercise-gifs/chest/머신 체스트 플라이.gif',
    supabaseGifUrl: `https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/machine_chest_fly.gif`
  },
  {
    id: 'barbell_incline_bench_press',
    name: {
      korean: '바벨 인클라인 벤치 프레스',
      english: '바벨 인클라인 벤치 프레스',
      romanization: '바벨 인클라인 벤치 프레스'
    },
    category: 'chest',
    equipment: 'barbell',
    targetMuscles: ['chest'],
    synergistMuscles: ['triceps', 'shoulders'],
    images: {
      primary: `${EXERCISE_IMAGE_BASE}/chest/${encodeURIComponent('바벨 인클라인 벤치 프레스.gif')}`,
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
    gifUrl: './assets/exercise-gifs/chest/바벨 인클라인 벤치 프레스.gif',
    supabaseGifUrl: `https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/barbell_incline_bench_press.gif`
  },
  {
    id: 'smith_decline_bench_press',
    name: {
      korean: '스미스 디클라인 벤치 프레스',
      english: '스미스 디클라인 벤치 프레스',
      romanization: '스미스 디클라인 벤치 프레스'
    },
    category: 'chest',
    equipment: 'smith_machine',
    targetMuscles: ['chest'],
    synergistMuscles: ['triceps', 'shoulders'],
    images: {
      primary: `${EXERCISE_IMAGE_BASE}/chest/${encodeURIComponent('스미스 디클라인 벤치 프레스.gif')}`,
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
    gifUrl: './assets/exercise-gifs/chest/스미스 디클라인 벤치 프레스.gif',
    supabaseGifUrl: `https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/smith_decline_bench_press.gif`
  },
  {
    id: 'smith_bench_press',
    name: {
      korean: '스미스 벤치 프레스',
      english: '스미스 벤치 프레스',
      romanization: '스미스 벤치 프레스'
    },
    category: 'chest',
    equipment: 'smith_machine',
    targetMuscles: ['chest'],
    synergistMuscles: ['triceps', 'shoulders'],
    images: {
      primary: `${EXERCISE_IMAGE_BASE}/chest/${encodeURIComponent('스미스 벤치 프레스.gif')}`,
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
    gifUrl: './assets/exercise-gifs/chest/스미스 벤치 프레스.gif',
    supabaseGifUrl: `https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/smith_bench_press.gif`
  },
  {
    id: 'smith_incline_bench_press',
    name: {
      korean: '스미스 인클라인 벤치프레스',
      english: '스미스 인클라인 벤치프레스',
      romanization: '스미스 인클라인 벤치프레스'
    },
    category: 'chest',
    equipment: 'smith_machine',
    targetMuscles: ['chest'],
    synergistMuscles: ['triceps', 'shoulders'],
    images: {
      primary: `${EXERCISE_IMAGE_BASE}/chest/${encodeURIComponent('스미스 인클라인 벤치프레스.gif')}`,
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
    gifUrl: './assets/exercise-gifs/chest/스미스 인클라인 벤치프레스.gif',
    supabaseGifUrl: `https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/smith_incline_bench_press.gif`
  },
  {
    id: 'assisted_dips',
    name: {
      korean: '어시스트 딥스',
      english: '어시스트 딥스',
      romanization: '어시스트 딥스'
    },
    category: 'chest',
    equipment: 'machine',
    targetMuscles: ['chest'],
    synergistMuscles: ['triceps', 'shoulders'],
    images: {
      primary: `${EXERCISE_IMAGE_BASE}/chest/${encodeURIComponent('어시스트 딥스.gif')}`,
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
    gifUrl: './assets/exercise-gifs/chest/어시스트 딥스.gif',
    supabaseGifUrl: `https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/assisted_dips.gif`
  },
  {
    id: 'one_arm_cable_fly',
    name: {
      korean: '원 암 케이블 플라이',
      english: '원 암 케이블 플라이',
      romanization: '원 암 케이블 플라이'
    },
    category: 'chest',
    equipment: 'cable',
    targetMuscles: ['chest'],
    synergistMuscles: ['triceps', 'shoulders'],
    images: {
      primary: `${EXERCISE_IMAGE_BASE}/chest/${encodeURIComponent('원 암 케이블 플라이.gif')}`,
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
    gifUrl: './assets/exercise-gifs/chest/원 암 케이블 플라이.gif',
    supabaseGifUrl: `https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/one_arm_cable_fly.gif`
  },
  {
    id: 'one_arm_plate_chest_press',
    name: {
      korean: '원 암 플레이트 체스트 프레스',
      english: '원 암 플레이트 체스트 프레스',
      romanization: '원 암 플레이트 체스트 프레스'
    },
    category: 'chest',
    equipment: 'plate',
    targetMuscles: ['chest'],
    synergistMuscles: ['triceps', 'shoulders'],
    images: {
      primary: `${EXERCISE_IMAGE_BASE}/chest/${encodeURIComponent('원 암 플레이트 체스트 프레스.gif')}`,
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
    gifUrl: './assets/exercise-gifs/chest/원 암 플레이트 체스트 프레스.gif',
    supabaseGifUrl: `https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/one_arm_plate_chest_press.gif`
  },
  {
    id: 'incline_dumbbell_fly',
    name: {
      korean: '인클라인 덤벨 플라이',
      english: '인클라인 덤벨 플라이',
      romanization: '인클라인 덤벨 플라이'
    },
    category: 'chest',
    equipment: 'dumbbell',
    targetMuscles: ['chest'],
    synergistMuscles: ['triceps', 'shoulders'],
    images: {
      primary: `${EXERCISE_IMAGE_BASE}/chest/${encodeURIComponent('인클라인 덤벨 플라이.gif')}`,
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
    gifUrl: './assets/exercise-gifs/chest/인클라인 덤벨 플라이.gif',
    supabaseGifUrl: `https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/incline_dumbbell_fly.gif`
  },
  {
    id: 'incline_cable_fly',
    name: {
      korean: '인클라인 케이블 플라이',
      english: '인클라인 케이블 플라이',
      romanization: '인클라인 케이블 플라이'
    },
    category: 'chest',
    equipment: 'cable',
    targetMuscles: ['chest'],
    synergistMuscles: ['triceps', 'shoulders'],
    images: {
      primary: `${EXERCISE_IMAGE_BASE}/chest/${encodeURIComponent('인클라인 케이블 플라이.gif')}`,
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
    gifUrl: './assets/exercise-gifs/chest/인클라인 케이블 플라이.gif',
    supabaseGifUrl: `https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/incline_cable_fly.gif`
  },
  {
    id: 'cable_incline_chest_press',
    name: {
      korean: '케이블 인클라인 체스트 프레스',
      english: '케이블 인클라인 체스트 프레스',
      romanization: '케이블 인클라인 체스트 프레스'
    },
    category: 'chest',
    equipment: 'cable',
    targetMuscles: ['chest'],
    synergistMuscles: ['triceps', 'shoulders'],
    images: {
      primary: `${EXERCISE_IMAGE_BASE}/chest/${encodeURIComponent('케이블 인클라인 체스트 프레스.gif')}`,
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
    gifUrl: './assets/exercise-gifs/chest/케이블 인클라인 체스트 프레스.gif',
    supabaseGifUrl: `https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/cable_incline_chest_press.gif`
  },
  {
    id: 'cable_chest_press',
    name: {
      korean: '케이블 체스트 프레스',
      english: '케이블 체스트 프레스',
      romanization: '케이블 체스트 프레스'
    },
    category: 'chest',
    equipment: 'cable',
    targetMuscles: ['chest'],
    synergistMuscles: ['triceps', 'shoulders'],
    images: {
      primary: `${EXERCISE_IMAGE_BASE}/chest/${encodeURIComponent('케이블 체스트 프레스.gif')}`,
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
    gifUrl: './assets/exercise-gifs/chest/케이블 체스트 프레스.gif',
    supabaseGifUrl: `https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/cable_chest_press.gif`
  },
  {
    id: 'cable_crossover',
    name: {
      korean: '케이블 크로스오버',
      english: '케이블 크로스오버',
      romanization: '케이블 크로스오버'
    },
    category: 'chest',
    equipment: 'cable',
    targetMuscles: ['chest'],
    synergistMuscles: ['triceps', 'shoulders'],
    images: {
      primary: `${EXERCISE_IMAGE_BASE}/chest/${encodeURIComponent('케이블 크로스오버.gif')}`,
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
    gifUrl: './assets/exercise-gifs/chest/케이블 크로스오버.gif',
    supabaseGifUrl: `https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/cable_crossover.gif`
  },
  {
    id: 'plate_decline_chest_press',
    name: {
      korean: '플레이트 디클라인 체스트 프레스',
      english: '플레이트 디클라인 체스트 프레스',
      romanization: '플레이트 디클라인 체스트 프레스'
    },
    category: 'chest',
    equipment: 'plate',
    targetMuscles: ['chest'],
    synergistMuscles: ['triceps', 'shoulders'],
    images: {
      primary: `${EXERCISE_IMAGE_BASE}/chest/${encodeURIComponent('플레이트 디클라인 체스트 프레스.gif')}`,
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
    gifUrl: './assets/exercise-gifs/chest/플레이트 디클라인 체스트 프레스.gif',
    supabaseGifUrl: `https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/plate_decline_chest_press.gif`
  },
  {
    id: 'plate_incline_chest_press',
    name: {
      korean: '플레이트 인클라인 체스트 프레스',
      english: '플레이트 인클라인 체스트 프레스',
      romanization: '플레이트 인클라인 체스트 프레스'
    },
    category: 'chest',
    equipment: 'plate',
    targetMuscles: ['chest'],
    synergistMuscles: ['triceps', 'shoulders'],
    images: {
      primary: `${EXERCISE_IMAGE_BASE}/chest/${encodeURIComponent('플레이트 인클라인 체스트 프레스.gif')}`,
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
    gifUrl: './assets/exercise-gifs/chest/플레이트 인클라인 체스트 프레스.gif',
    supabaseGifUrl: `https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/plate_incline_chest_press.gif`
  },
  {
    id: 'plate_chest_press',
    name: {
      korean: '플레이트 체스트 프레스',
      english: '플레이트 체스트 프레스',
      romanization: '플레이트 체스트 프레스'
    },
    category: 'chest',
    equipment: 'plate',
    targetMuscles: ['chest'],
    synergistMuscles: ['triceps', 'shoulders'],
    images: {
      primary: `${EXERCISE_IMAGE_BASE}/chest/${encodeURIComponent('플레이트 체스트 프레스.gif')}`,
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
    gifUrl: './assets/exercise-gifs/chest/플레이트 체스트 프레스.gif',
    supabaseGifUrl: `https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/plate_chest_press.gif`
  },
  {
    id: 'plate_chest_fly',
    name: {
      korean: '플레이트 체스트 플라이',
      english: '플레이트 체스트 플라이',
      romanization: '플레이트 체스트 플라이'
    },
    category: 'chest',
    equipment: 'plate',
    targetMuscles: ['chest'],
    synergistMuscles: ['triceps', 'shoulders'],
    images: {
      primary: `${EXERCISE_IMAGE_BASE}/chest/${encodeURIComponent('플레이트 체스트 플라이.gif')}`,
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
    gifUrl: './assets/exercise-gifs/chest/플레이트 체스트 플라이.gif',
    supabaseGifUrl: `https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/plate_chest_fly.gif`
  }
];

// Existing exercises to update with GIF URLs:
export const exercisesToUpdate = [
  { id: 'decline_cable_fly', gifFile: '디클라인 케이블 플라이.gif' },
  { id: 'dips', gifFile: '딥스.gif' },
  { id: 'barbell_bench_press', gifFile: '바벨 벤치프레스.gif' }
];
