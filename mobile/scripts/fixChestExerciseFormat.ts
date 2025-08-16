const fs = require('fs');
const path = require('path');

// Template for a properly formatted chest exercise
const createProperChestExercise = (data) => {
  return `  {
    id: '${data.id}',
    name: {
      english: '${data.korean}',
      korean: '${data.korean}',
      romanization: '${data.korean}'
    },
    description: {
      english: 'A ${data.isCompound ? 'compound' : 'isolation'} chest exercise',
      korean: '가슴을 대상으로 하는 ${data.isCompound ? '복합' : '고립'} 운동'
    },
    targetMuscles: {
      primary: ${JSON.stringify(data.primary || ['가슴근'])},
      secondary: ${JSON.stringify(data.secondary || (data.isCompound ? ['삼두근', '전삼각근'] : ['전삼각근']))},
      stabilizers: ['코어']
    },
    equipment: ${JSON.stringify(data.equipment)},
    category: '${data.isCompound ? 'compound' : 'isolation'}',
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
      gifUrl: './assets/exercise-gifs/chest/${data.filename}',
      supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/${data.id}.gif'
    }
  }`;
};

// Sample of 3 exercises to show the proper format
const sampleExercises = [
  {
    id: 'dumbbell_bench_press',
    korean: '덤벨 벤치프레스',
    filename: '덤벨 벤치프레스.gif',
    equipment: ['덤벨', '플랫 벤치'],
    isCompound: true
  },
  {
    id: 'cable_crossover',
    korean: '케이블 크로스오버',
    filename: '케이블 크로스오버.gif',
    equipment: ['케이블 머신', '케이블 핸들'],
    isCompound: false
  },
  {
    id: 'machine_chest_press',
    korean: '머신 체스트 프레스',
    filename: '머신 체스트 프레스.gif',
    equipment: ['체스트 프레스 머신'],
    isCompound: true
  }
];

// Generate sample exercises
const output = `// Sample of properly formatted chest exercises
// These match the exact structure required by the database

const chestExercisesToAdd = [
${sampleExercises.map(ex => createProperChestExercise(ex)).join(',\n')}
];

// IMPORTANT: All exercises must have:
// 1. media object (not direct gifUrl/supabaseGifUrl)
// 2. tips and commonMistakes objects (both languages)
// 3. Proper structure matching ExerciseData interface
`;

fs.writeFileSync(path.join(__dirname, 'properChestExerciseFormat.ts'), output);
console.log('Created properChestExerciseFormat.ts with correct structure');

// Also create a summary of what needs to be fixed
const fixSummary = `
# Exercise Format Issues to Fix

## Current Problems:
1. Used direct 'gifUrl' and 'supabaseGifUrl' instead of 'media' object
2. Missing 'tips' field (optional but used by service)
3. Missing 'commonMistakes' field (optional but used by service)

## Required Structure:
- media: {
    gifUrl: string,
    supabaseGifUrl: string
  }
- tips: {
    english: string[],
    korean: string[]
  }
- commonMistakes: {
    english: string[],
    korean: string[]
  }

## Exercises Added That Need Fixing:
- All 25 chest exercises
- All 28 back exercises  
- All 25 shoulder exercises
- All 135 temp folder exercises

Total: 213 exercises need their format corrected
`;

fs.writeFileSync(path.join(__dirname, 'exerciseFormatIssues.md'), fixSummary);
console.log('Created exerciseFormatIssues.md with issue summary');