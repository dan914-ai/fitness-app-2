import * as fs from 'fs';
import * as path from 'path';

// Complete mapping for remaining back exercises
const remainingBackExercises = [
  {
    filename: '머신 와이드 풀다운.gif',
    id: 'machine-wide-pulldown',
    korean: '머신 와이드 풀다운',
    english: 'Machine Wide Pulldown',
    category: 'compound' as const,
    equipment: ['머신'],
    primaryMuscles: ['광배근', '등'],
    difficulty: 'beginner' as const
  },
  {
    filename: '머신 티 바 로우.gif',
    id: 'machine-t-bar-row',
    korean: '머신 티바 로우',
    english: 'Machine T-Bar Row',
    category: 'compound' as const,
    equipment: ['머신'],
    primaryMuscles: ['광배근', '능형근'],
    difficulty: 'beginner' as const
  },
  {
    filename: '머신 풀오버.gif',
    id: 'machine-pullover',
    korean: '머신 풀오버',
    english: 'Machine Pullover',
    category: 'isolation' as const,
    equipment: ['머신'],
    primaryMuscles: ['광배근', '대흉근'],
    difficulty: 'intermediate' as const
  },
  {
    filename: '머신 하이 로우.gif',
    id: 'machine-high-row',
    korean: '머신 하이 로우',
    english: 'Machine High Row',
    category: 'compound' as const,
    equipment: ['머신'],
    primaryMuscles: ['광배근', '능형근'],
    difficulty: 'beginner' as const
  },
  {
    filename: '비하인드 넥 풀다운.gif',
    id: 'behind-neck-pulldown',
    korean: '비하인드 넥 풀다운',
    english: 'Behind Neck Pulldown',
    category: 'compound' as const,
    equipment: ['케이블머신'],
    primaryMuscles: ['광배근', '등'],
    difficulty: 'advanced' as const
  },
  {
    filename: '스미스 바벨 로우.gif',
    id: 'smith-barbell-row',
    korean: '스미스 바벨 로우',
    english: 'Smith Barbell Row',
    category: 'compound' as const,
    equipment: ['스미스머신'],
    primaryMuscles: ['광배근', '능형근'],
    difficulty: 'intermediate' as const
  },
  {
    filename: '어시스트 풀업.gif',
    id: 'assisted-pull-ups',
    korean: '어시스트 풀업',
    english: 'Assisted Pull Ups',
    category: 'compound' as const,
    equipment: ['어시스트머신'],
    primaryMuscles: ['광배근', '등'],
    difficulty: 'beginner' as const
  },
  {
    filename: '언더그립 바벨 로우.gif',
    id: 'underhand-barbell-row',
    korean: '언더그립 바벨 로우',
    english: 'Underhand Barbell Row',
    category: 'compound' as const,
    equipment: ['바벨'],
    primaryMuscles: ['광배근', '이두근'],
    difficulty: 'intermediate' as const
  },
  {
    filename: '원 암 랫 풀 다운.gif',
    id: 'single-arm-lat-pulldown',
    korean: '원암 랫 풀다운',
    english: 'Single Arm Lat Pulldown',
    category: 'compound' as const,
    equipment: ['케이블머신'],
    primaryMuscles: ['광배근', '등'],
    difficulty: 'intermediate' as const
  },
  {
    filename: '체스트 서포티드 덤벨 로우.gif',
    id: 'chest-supported-dumbbell-row',
    korean: '체스트 서포티드 덤벨 로우',
    english: 'Chest Supported Dumbbell Row',
    category: 'compound' as const,
    equipment: ['덤벨', '인클라인벤치'],
    primaryMuscles: ['광배근', '능형근'],
    difficulty: 'beginner' as const
  },
  {
    filename: '체스트 서포티드 바벨로우.gif',
    id: 'chest-supported-barbell-row',
    korean: '체스트 서포티드 바벨 로우',
    english: 'Chest Supported Barbell Row',
    category: 'compound' as const,
    equipment: ['바벨', '인클라인벤치'],
    primaryMuscles: ['광배근', '능형근'],
    difficulty: 'intermediate' as const
  },
  {
    filename: '체스트 서포티드 티바 로우 머신.gif',
    id: 'chest-supported-t-bar-row-machine',
    korean: '체스트 서포티드 티바 로우 머신',
    english: 'Chest Supported T-Bar Row Machine',
    category: 'compound' as const,
    equipment: ['머신'],
    primaryMuscles: ['광배근', '능형근'],
    difficulty: 'beginner' as const
  },
  {
    filename: '케이블 로프 암 풀 다운.gif',
    id: 'cable-rope-arm-pulldown',
    korean: '케이블 로프 암 풀다운',
    english: 'Cable Rope Arm Pulldown',
    category: 'isolation' as const,
    equipment: ['케이블', '로프'],
    primaryMuscles: ['광배근', '후면삼각근'],
    difficulty: 'intermediate' as const
  },
  {
    filename: '케이블 시티드 로우.gif',
    id: 'cable-seated-row',
    korean: '케이블 시티드 로우',
    english: 'Cable Seated Row',
    category: 'compound' as const,
    equipment: ['케이블머신'],
    primaryMuscles: ['광배근', '능형근'],
    difficulty: 'beginner' as const
  },
  {
    filename: '케이블 풀오버.gif',
    id: 'cable-pullover',
    korean: '케이블 풀오버',
    english: 'Cable Pullover',
    category: 'isolation' as const,
    equipment: ['케이블머신'],
    primaryMuscles: ['광배근', '대흉근'],
    difficulty: 'intermediate' as const
  },
  {
    filename: '플레이트 로우 로우.gif',
    id: 'plate-row',
    korean: '플레이트 로우',
    english: 'Plate Row',
    category: 'compound' as const,
    equipment: ['플레이트'],
    primaryMuscles: ['광배근', '능형근'],
    difficulty: 'beginner' as const
  }
];

async function processRemainingBackExercises() {
  const backDir = '/mnt/c/Users/danny/Downloads/back exercises';
  const targetDir = path.join(__dirname, '../assets/exercise-gifs/back');
  
  fs.mkdirSync(targetDir, { recursive: true });
  
  console.log(`📋 Processing ${remainingBackExercises.length} remaining back exercises\n`);
  
  const exerciseEntries = [];
  let successCount = 0;
  
  for (const exercise of remainingBackExercises) {
    const sourcePath = path.join(backDir, exercise.filename);
    const targetPath = path.join(targetDir, `${exercise.id}.gif`);
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✅ ${exercise.korean}`);
      successCount++;
      
      // Create database entry
      const entry = {
        id: exercise.id,
        name: {
          english: exercise.english,
          korean: exercise.korean,
          romanization: exercise.korean // Will need proper romanization
        },
        description: {
          english: `A ${exercise.category} back exercise targeting ${exercise.primaryMuscles.join(', ').toLowerCase()}`,
          korean: `${exercise.primaryMuscles.join(', ')}을 대상으로 하는 등 ${exercise.category === 'compound' ? '복합' : '고립'} 운동`
        },
        targetMuscles: {
          primary: exercise.primaryMuscles,
          secondary: [],
          stabilizers: ['코어']
        },
        equipment: exercise.equipment,
        category: exercise.category,
        bodyParts: ['등'],
        difficulty: exercise.difficulty,
        instructions: {
          english: [
            'Set up in proper starting position',
            'Perform the movement with controlled form',
            'Focus on back muscle engagement',
            'Return to starting position with control'
          ],
          korean: [
            '적절한 시작 자세로 준비',
            '통제된 동작으로 운동 수행',
            '등 근육 참여에 집중',
            '통제하며 시작 자세로 돌아가기'
          ]
        },
        sets: {
          recommended: '3-4세트',
          beginner: '2-3세트',
          intermediate: '3-4세트',
          advanced: '4-5세트'
        },
        reps: {
          recommended: exercise.category === 'isolation' ? '12-15회' : '8-12회',
          beginner: '10-15회',
          intermediate: '8-12회',
          advanced: '6-10회'
        },
        media: {
          gifUrl: `./assets/exercise-gifs/back/${exercise.id}.gif`,
          supabaseGifUrl: `https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/${exercise.id}.gif`
        },
        tags: ['등', exercise.category === 'compound' ? '복합운동' : '고립운동', ...exercise.equipment],
        tips: {
          english: [
            'Maintain proper back alignment',
            'Control the negative portion',
            'Squeeze at peak contraction'
          ],
          korean: [
            '올바른 등 정렬 유지',
            '네거티브 동작 통제',
            '최대 수축 시 조이기'
          ]
        },
        commonMistakes: {
          english: [
            'Using momentum',
            'Not engaging lats properly',
            'Rounding the back'
          ],
          korean: [
            '반동 사용',
            '광배근 참여 부족',
            '등 둥글게 하기'
          ]
        },
        alternatives: []
      };
      
      exerciseEntries.push(entry);
    } else {
      console.log(`❌ Not found: ${exercise.filename}`);
    }
  }
  
  // Save to file
  const outputPath = path.join(__dirname, '../src/data/newBackExercises.ts');
  const content = `// Auto-generated back exercise database entries
import { ExerciseData } from './exerciseDatabase';

export const newBackExercises: ExerciseData[] = ${JSON.stringify(exerciseEntries, null, 2)};
`;
  
  fs.writeFileSync(outputPath, content);
  
  console.log(`\n📊 Summary:`);
  console.log(`✅ Processed: ${successCount}/${remainingBackExercises.length} exercises`);
  console.log(`📁 GIFs saved to: ${targetDir}`);
  console.log(`📄 Data saved to: ${outputPath}`);
}

processRemainingBackExercises().catch(console.error);