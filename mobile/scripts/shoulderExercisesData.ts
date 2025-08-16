// Example shoulder exercises with improved naming conventions
export const improvedShoulderExercises = [
  {
    id: 'barbell-shoulder-press',
    name: {
      korean: '바벨 숄더프레스',
      english: 'Barbell Shoulder Press',
      romanization: 'babel syoldeo-peuleseu'
    },
    equipment: {
      primary: 'barbell',
      alternatives: []
    },
    bodyPart: ['어깨', '삼두'],
    category: 'compound',
    media: {
      gifUrl: './assets/exercise-gifs/shoulders/barbell-shoulder-press.gif',
      supabaseGifUrl: ''
    }
  },
  {
    id: 'dumbbell-shoulder-press',
    name: {
      korean: '덤벨 숄더프레스',
      english: 'Dumbbell Shoulder Press',
      romanization: 'deombel syoldeo-peuleseu'
    },
    equipment: {
      primary: 'dumbbell',
      alternatives: []
    },
    bodyPart: ['어깨', '삼두'],
    category: 'compound',
    media: {
      gifUrl: './assets/exercise-gifs/shoulders/dumbbell-shoulder-press.gif',
      supabaseGifUrl: ''
    }
  },
  {
    id: 'seated-dumbbell-shoulder-press',
    name: {
      korean: '시티드 덤벨 숄더프레스',
      english: 'Seated Dumbbell Shoulder Press',
      romanization: 'sitideu deombel syoldeo-peuleseu'
    },
    equipment: {
      primary: 'dumbbell',
      alternatives: []
    },
    bodyPart: ['어깨', '삼두'],
    category: 'compound',
    media: {
      gifUrl: './assets/exercise-gifs/shoulders/seated-dumbbell-shoulder-press.gif',
      supabaseGifUrl: ''
    }
  },
  {
    id: 'standing-barbell-shoulder-press',
    name: {
      korean: '스탠딩 바벨 숄더프레스',
      english: 'Standing Barbell Shoulder Press',
      romanization: 'seutaending babel syoldeo-peuleseu'
    },
    equipment: {
      primary: 'barbell',
      alternatives: []
    },
    bodyPart: ['어깨', '코어', '삼두'],
    category: 'compound',
    media: {
      gifUrl: './assets/exercise-gifs/shoulders/standing-barbell-shoulder-press.gif',
      supabaseGifUrl: ''
    }
  },
  {
    id: 'dumbbell-lateral-raise',
    name: {
      korean: '덤벨 레터럴 레이즈',
      english: 'Dumbbell Lateral Raise',
      romanization: 'deombel reteoreol reijeu'
    },
    equipment: {
      primary: 'dumbbell',
      alternatives: []
    },
    bodyPart: ['어깨'],
    category: 'isolation',
    media: {
      gifUrl: './assets/exercise-gifs/shoulders/dumbbell-lateral-raise.gif',
      supabaseGifUrl: ''
    }
  },
  {
    id: 'cable-lateral-raise',
    name: {
      korean: '케이블 레터럴 레이즈',
      english: 'Cable Lateral Raise',
      romanization: 'keibeul reteoreol reijeu'
    },
    equipment: {
      primary: 'cable',
      alternatives: []
    },
    bodyPart: ['어깨'],
    category: 'isolation',
    media: {
      gifUrl: './assets/exercise-gifs/shoulders/cable-lateral-raise.gif',
      supabaseGifUrl: ''
    }
  },
  {
    id: 'barbell-upright-row',
    name: {
      korean: '바벨 업라이트 로우',
      english: 'Barbell Upright Row',
      romanization: 'babel eobeuraiteu rou'
    },
    equipment: {
      primary: 'barbell',
      alternatives: ['ez-bar']
    },
    bodyPart: ['어깨', '승모근'],
    category: 'compound',
    media: {
      gifUrl: './assets/exercise-gifs/shoulders/barbell-upright-row.gif',
      supabaseGifUrl: ''
    }
  },
  {
    id: 'dumbbell-upright-row',
    name: {
      korean: '덤벨 업라이트 로우',
      english: 'Dumbbell Upright Row',
      romanization: 'deombel eobeuraiteu rou'
    },
    equipment: {
      primary: 'dumbbell',
      alternatives: []
    },
    bodyPart: ['어깨', '승모근'],
    category: 'compound',
    media: {
      gifUrl: './assets/exercise-gifs/shoulders/dumbbell-upright-row.gif',
      supabaseGifUrl: ''
    }
  },
  {
    id: 'cable-upright-row',
    name: {
      korean: '케이블 업라이트 로우',
      english: 'Cable Upright Row',
      romanization: 'keibeul eobeuraiteu rou'
    },
    equipment: {
      primary: 'cable',
      alternatives: []
    },
    bodyPart: ['어깨', '승모근'],
    category: 'compound',
    media: {
      gifUrl: './assets/exercise-gifs/shoulders/cable-upright-row.gif',
      supabaseGifUrl: ''
    }
  },
  {
    id: 'dumbbell-arnold-press',
    name: {
      korean: '덤벨 아놀드 프레스',
      english: 'Dumbbell Arnold Press',
      romanization: 'deombel anoldeu peuleseu'
    },
    equipment: {
      primary: 'dumbbell',
      alternatives: []
    },
    bodyPart: ['어깨', '삼두'],
    category: 'compound',
    media: {
      gifUrl: './assets/exercise-gifs/shoulders/dumbbell-arnold-press.gif',
      supabaseGifUrl: ''
    }
  }
];

// Example of how to update existing exercises in the database
export const exerciseNamingUpdates = {
  // Current ID -> New ID and name
  'shoulder-press': {
    splitInto: [
      {
        id: 'barbell-shoulder-press',
        name: { korean: '바벨 숄더프레스', english: 'Barbell Shoulder Press' }
      },
      {
        id: 'dumbbell-shoulder-press',
        name: { korean: '덤벨 숄더프레스', english: 'Dumbbell Shoulder Press' }
      }
    ]
  },
  'upright-row': {
    splitInto: [
      {
        id: 'barbell-upright-row',
        name: { korean: '바벨 업라이트 로우', english: 'Barbell Upright Row' }
      },
      {
        id: 'dumbbell-upright-row',
        name: { korean: '덤벨 업라이트 로우', english: 'Dumbbell Upright Row' }
      },
      {
        id: 'cable-upright-row',
        name: { korean: '케이블 업라이트 로우', english: 'Cable Upright Row' }
      }
    ]
  },
  'military-press': {
    renameTo: {
      id: 'standing-barbell-shoulder-press',
      name: { korean: '스탠딩 바벨 숄더프레스', english: 'Standing Barbell Shoulder Press' }
    }
  }
};