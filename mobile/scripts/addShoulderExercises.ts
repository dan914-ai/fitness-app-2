import * as fs from 'fs';
import * as path from 'path';

// Existing shoulder exercises in database (to avoid duplicates)
const existingExercises = new Set([
  'arnold-press',
  'face-pull',
  'dumbbell-face-pull',
  'banded-face-pull',
  'shoulder-push-up',
  'single-arm-cable-lateral-raises'
]);

// Mapping Korean file names to English exercise data
const shoulderExerciseMapping = [
  {
    filename: '덤벨 레터럴 레이즈.gif',
    id: 'dumbbell-lateral-raise',
    english: 'Dumbbell Lateral Raise',
    korean: '덤벨 레터럴 레이즈',
    romanization: 'deombel reteoreal reijeu',
    category: 'isolation' as const,
    equipment: ['덤벨'],
    primaryMuscles: ['측면삼각근', '어깨'],
    secondaryMuscles: ['승모근'],
    bodyParts: ['어깨'],
    difficulty: 'beginner' as const
  },
  {
    filename: '덤벨 벤트오버 레터럴 레이즈.gif',
    id: 'dumbbell-bent-over-lateral-raise',
    english: 'Dumbbell Bent Over Lateral Raise',
    korean: '덤벨 벤트오버 레터럴 레이즈',
    romanization: 'deombel bentobeo reteoreal reijeu',
    category: 'isolation' as const,
    equipment: ['덤벨'],
    primaryMuscles: ['후면삼각근', '어깨'],
    secondaryMuscles: ['승모근', '능형근'],
    bodyParts: ['어깨'],
    difficulty: 'intermediate' as const
  },
  {
    filename: '리닝 원암 덤벨 레터럴 레이즈.gif',
    id: 'leaning-single-arm-dumbbell-lateral-raise',
    english: 'Leaning Single Arm Dumbbell Lateral Raise',
    korean: '리닝 원암 덤벨 레터럴 레이즈',
    romanization: 'rining wonam deombel reteoreal reijeu',
    category: 'isolation' as const,
    equipment: ['덤벨'],
    primaryMuscles: ['측면삼각근', '어깨'],
    secondaryMuscles: ['코어'],
    bodyParts: ['어깨'],
    difficulty: 'intermediate' as const
  },
  {
    filename: '머신 레터럴 레이즈.gif',
    id: 'machine-lateral-raise',
    english: 'Machine Lateral Raise',
    korean: '머신 레터럴 레이즈',
    romanization: 'meosin reteoreal reijeu',
    category: 'isolation' as const,
    equipment: ['머신'],
    primaryMuscles: ['측면삼각근', '어깨'],
    secondaryMuscles: [],
    bodyParts: ['어깨'],
    difficulty: 'beginner' as const
  },
  {
    filename: '머신 레터럴 레이즈 2.gif',
    id: 'machine-lateral-raise-2',
    english: 'Machine Lateral Raise (Variation 2)',
    korean: '머신 레터럴 레이즈 2',
    romanization: 'meosin reteoreal reijeu i',
    category: 'isolation' as const,
    equipment: ['머신'],
    primaryMuscles: ['측면삼각근', '어깨'],
    secondaryMuscles: [],
    bodyParts: ['어깨'],
    difficulty: 'beginner' as const
  },
  {
    filename: '머신 리어 델트 플라이.gif',
    id: 'machine-rear-delt-fly',
    english: 'Machine Rear Delt Fly',
    korean: '머신 리어 델트 플라이',
    romanization: 'meosin rieo delteu peullai',
    category: 'isolation' as const,
    equipment: ['머신'],
    primaryMuscles: ['후면삼각근'],
    secondaryMuscles: ['능형근', '승모근'],
    bodyParts: ['어깨'],
    difficulty: 'beginner' as const
  },
  {
    filename: '머신 숄더 프레스.gif',
    id: 'machine-shoulder-press',
    english: 'Machine Shoulder Press',
    korean: '머신 숄더 프레스',
    romanization: 'meosin syoldeo peuleseu',
    category: 'compound' as const,
    equipment: ['머신'],
    primaryMuscles: ['전면삼각근', '어깨'],
    secondaryMuscles: ['삼두근', '승모근'],
    bodyParts: ['어깨', '팔'],
    difficulty: 'beginner' as const
  },
  {
    filename: '머신 숄더 프레스 2.gif',
    id: 'machine-shoulder-press-2',
    english: 'Machine Shoulder Press (Variation 2)',
    korean: '머신 숄더 프레스 2',
    romanization: 'meosin syoldeo peuleseu i',
    category: 'compound' as const,
    equipment: ['머신'],
    primaryMuscles: ['전면삼각근', '어깨'],
    secondaryMuscles: ['삼두근', '승모근'],
    bodyParts: ['어깨', '팔'],
    difficulty: 'beginner' as const
  },
  {
    filename: '바벨 숄더프레스.gif',
    id: 'barbell-shoulder-press',
    english: 'Barbell Shoulder Press',
    korean: '바벨 숄더프레스',
    romanization: 'babel syoldeopeuleseu',
    category: 'compound' as const,
    equipment: ['바벨'],
    primaryMuscles: ['전면삼각근', '어깨'],
    secondaryMuscles: ['삼두근', '승모근', '코어'],
    bodyParts: ['어깨', '팔'],
    difficulty: 'intermediate' as const
  },
  {
    filename: '바벨 프론트 레이즈.gif',
    id: 'barbell-front-raise',
    english: 'Barbell Front Raise',
    korean: '바벨 프론트 레이즈',
    romanization: 'babel peuronteu reijeu',
    category: 'isolation' as const,
    equipment: ['바벨'],
    primaryMuscles: ['전면삼각근'],
    secondaryMuscles: ['코어'],
    bodyParts: ['어깨'],
    difficulty: 'intermediate' as const
  },
  {
    filename: '스미스 비하인드 넥 숄더 프레스.gif',
    id: 'smith-behind-neck-shoulder-press',
    english: 'Smith Behind Neck Shoulder Press',
    korean: '스미스 비하인드 넥 숄더 프레스',
    romanization: 'seumssi bihaindeu nek syoldeo peuleseu',
    category: 'compound' as const,
    equipment: ['스미스머신'],
    primaryMuscles: ['전면삼각근', '어깨'],
    secondaryMuscles: ['삼두근', '승모근'],
    bodyParts: ['어깨', '팔'],
    difficulty: 'advanced' as const
  },
  {
    filename: '스탠딩 스미스 숄더 프레스.gif',
    id: 'standing-smith-shoulder-press',
    english: 'Standing Smith Shoulder Press',
    korean: '스탠딩 스미스 숄더 프레스',
    romanization: 'seutaending seumssi syoldeo peuleseu',
    category: 'compound' as const,
    equipment: ['스미스머신'],
    primaryMuscles: ['전면삼각근', '어깨'],
    secondaryMuscles: ['삼두근', '승모근', '코어'],
    bodyParts: ['어깨', '팔'],
    difficulty: 'intermediate' as const
  },
  {
    filename: '시티드 덤벨 레터럴 레이즈.gif',
    id: 'seated-dumbbell-lateral-raise',
    english: 'Seated Dumbbell Lateral Raise',
    korean: '시티드 덤벨 레터럴 레이즈',
    romanization: 'sitideu deombel reteoreal reijeu',
    category: 'isolation' as const,
    equipment: ['덤벨', '벤치'],
    primaryMuscles: ['측면삼각근', '어깨'],
    secondaryMuscles: [],
    bodyParts: ['어깨'],
    difficulty: 'beginner' as const
  },
  {
    filename: '시티드 덤벨 숄더 프레스.gif',
    id: 'seated-dumbbell-shoulder-press',
    english: 'Seated Dumbbell Shoulder Press',
    korean: '시티드 덤벨 숄더 프레스',
    romanization: 'sitideu deombel syoldeo peuleseu',
    category: 'compound' as const,
    equipment: ['덤벨', '벤치'],
    primaryMuscles: ['전면삼각근', '어깨'],
    secondaryMuscles: ['삼두근', '승모근'],
    bodyParts: ['어깨', '팔'],
    difficulty: 'beginner' as const
  },
  {
    filename: '시티드 덤벨 프론트 레이즈.gif',
    id: 'seated-dumbbell-front-raise',
    english: 'Seated Dumbbell Front Raise',
    korean: '시티드 덤벨 프론트 레이즈',
    romanization: 'sitideu deombel peuronteu reijeu',
    category: 'isolation' as const,
    equipment: ['덤벨', '벤치'],
    primaryMuscles: ['전면삼각근'],
    secondaryMuscles: [],
    bodyParts: ['어깨'],
    difficulty: 'beginner' as const
  },
  {
    filename: '시티드 바벨 숄더 프레스.gif',
    id: 'seated-barbell-shoulder-press',
    english: 'Seated Barbell Shoulder Press',
    korean: '시티드 바벨 숄더 프레스',
    romanization: 'sitideu babel syoldeo peuleseu',
    category: 'compound' as const,
    equipment: ['바벨', '벤치'],
    primaryMuscles: ['전면삼각근', '어깨'],
    secondaryMuscles: ['삼두근', '승모근'],
    bodyParts: ['어깨', '팔'],
    difficulty: 'intermediate' as const
  },
  {
    filename: '시티드 스미스 숄더 프레스.gif',
    id: 'seated-smith-shoulder-press',
    english: 'Seated Smith Shoulder Press',
    korean: '시티드 스미스 숄더 프레스',
    romanization: 'sitideu seumssi syoldeo peuleseu',
    category: 'compound' as const,
    equipment: ['스미스머신', '벤치'],
    primaryMuscles: ['전면삼각근', '어깨'],
    secondaryMuscles: ['삼두근', '승모근'],
    bodyParts: ['어깨', '팔'],
    difficulty: 'beginner' as const
  },
  {
    filename: '시티드 이지 바 프론트레이즈.gif',
    id: 'seated-ez-bar-front-raise',
    english: 'Seated EZ Bar Front Raise',
    korean: '시티드 이지바 프론트 레이즈',
    romanization: 'sitideu ijiba peuronteu reijeu',
    category: 'isolation' as const,
    equipment: ['EZ바', '벤치'],
    primaryMuscles: ['전면삼각근'],
    secondaryMuscles: [],
    bodyParts: ['어깨'],
    difficulty: 'intermediate' as const
  },
  {
    filename: '아놀드 프레스.gif',
    id: 'arnold-press-new',
    english: 'Arnold Press',
    korean: '아놀드 프레스',
    romanization: 'anoldeu peuleseu',
    category: 'compound' as const,
    equipment: ['덤벨'],
    primaryMuscles: ['전면삼각근', '측면삼각근', '어깨'],
    secondaryMuscles: ['삼두근'],
    bodyParts: ['어깨', '팔'],
    difficulty: 'intermediate' as const,
    skipDuplicate: true // This is already in database
  },
  {
    filename: '원 암 덤벨 숄더 프레스.gif',
    id: 'single-arm-dumbbell-shoulder-press',
    english: 'Single Arm Dumbbell Shoulder Press',
    korean: '원암 덤벨 숄더 프레스',
    romanization: 'wonam deombel syoldeo peuleseu',
    category: 'compound' as const,
    equipment: ['덤벨'],
    primaryMuscles: ['전면삼각근', '어깨'],
    secondaryMuscles: ['삼두근', '코어'],
    bodyParts: ['어깨', '팔'],
    difficulty: 'intermediate' as const
  },
  {
    filename: '원 암 덤벨 프레스.gif',
    id: 'single-arm-dumbbell-press',
    english: 'Single Arm Dumbbell Press',
    korean: '원암 덤벨 프레스',
    romanization: 'wonam deombel peuleseu',
    category: 'compound' as const,
    equipment: ['덤벨'],
    primaryMuscles: ['전면삼각근', '어깨'],
    secondaryMuscles: ['삼두근', '코어'],
    bodyParts: ['어깨', '팔'],
    difficulty: 'intermediate' as const
  },
  {
    filename: '원 암 케이블 레터럴 레이즈.gif',
    id: 'single-arm-cable-lateral-raise',
    english: 'Single Arm Cable Lateral Raise',
    korean: '원암 케이블 레터럴 레이즈',
    romanization: 'wonam keibeul reteoreal reijeu',
    category: 'isolation' as const,
    equipment: ['케이블'],
    primaryMuscles: ['측면삼각근', '어깨'],
    secondaryMuscles: ['코어'],
    bodyParts: ['어깨'],
    difficulty: 'intermediate' as const
  },
  {
    filename: '인클라인 리닝 덤벨 레터럴 레이즈.gif',
    id: 'incline-leaning-dumbbell-lateral-raise',
    english: 'Incline Leaning Dumbbell Lateral Raise',
    korean: '인클라인 리닝 덤벨 레터럴 레이즈',
    romanization: 'inkullain rining deombel reteoreal reijeu',
    category: 'isolation' as const,
    equipment: ['덤벨', '인클라인벤치'],
    primaryMuscles: ['측면삼각근', '어깨'],
    secondaryMuscles: [],
    bodyParts: ['어깨'],
    difficulty: 'intermediate' as const
  },
  {
    filename: '케이블 닐링 숄더 프레스.gif',
    id: 'cable-kneeling-shoulder-press',
    english: 'Cable Kneeling Shoulder Press',
    korean: '케이블 닐링 숄더 프레스',
    romanization: 'keibeul nilling syoldeo peuleseu',
    category: 'compound' as const,
    equipment: ['케이블'],
    primaryMuscles: ['전면삼각근', '어깨'],
    secondaryMuscles: ['삼두근', '코어'],
    bodyParts: ['어깨', '팔'],
    difficulty: 'intermediate' as const
  },
  {
    filename: '케이블 페이스 풀.gif',
    id: 'cable-face-pull-new',
    english: 'Cable Face Pull',
    korean: '케이블 페이스 풀',
    romanization: 'keibeul peiseu pul',
    category: 'isolation' as const,
    equipment: ['케이블'],
    primaryMuscles: ['후면삼각근'],
    secondaryMuscles: ['능형근', '승모근'],
    bodyParts: ['어깨'],
    difficulty: 'beginner' as const,
    skipDuplicate: true // This is already in database
  },
  {
    filename: '케이블 프론트 레이즈.gif',
    id: 'cable-front-raise',
    english: 'Cable Front Raise',
    korean: '케이블 프론트 레이즈',
    romanization: 'keibeul peuronteu reijeu',
    category: 'isolation' as const,
    equipment: ['케이블'],
    primaryMuscles: ['전면삼각근'],
    secondaryMuscles: ['코어'],
    bodyParts: ['어깨'],
    difficulty: 'beginner' as const
  },
  {
    filename: '플레이트 프론트 레이즈.gif',
    id: 'plate-front-raise',
    english: 'Plate Front Raise',
    korean: '플레이트 프론트 레이즈',
    romanization: 'peulleiteu peuronteu reijeu',
    category: 'isolation' as const,
    equipment: ['플레이트'],
    primaryMuscles: ['전면삼각근'],
    secondaryMuscles: ['코어'],
    bodyParts: ['어깨'],
    difficulty: 'beginner' as const
  }
];

async function processShoulderExercises() {
  const shoulderDir = '/mnt/c/Users/danny/Downloads/shoulder exercises';
  const tempDir = path.join(__dirname, '../temp-shoulders');
  const targetDir = path.join(__dirname, '../assets/exercise-gifs/shoulders');
  
  // Create directories
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // Filter out exercises that are already in database or marked to skip
  const newExercises = shoulderExerciseMapping.filter(exercise => {
    if (exercise.skipDuplicate) {
      console.log(`⏭️  Skipping ${exercise.korean} - already in database`);
      return false;
    }
    if (existingExercises.has(exercise.id)) {
      console.log(`⏭️  Skipping ${exercise.korean} - already exists as ${exercise.id}`);
      return false;
    }
    return true;
  });
  
  console.log(`📋 Processing ${newExercises.length} new shoulder exercises (${shoulderExerciseMapping.length - newExercises.length} skipped)`);
  
  // Copy GIF files and generate exercise entries
  const exerciseEntries = [];
  
  for (const exercise of newExercises) {
    const sourcePath = path.join(shoulderDir, exercise.filename);
    const targetPath = path.join(targetDir, `${exercise.id}.gif`);
    
    try {
      // Copy GIF file
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`✅ Copied: ${exercise.korean}`);
      } else {
        console.log(`❌ File not found: ${exercise.filename}`);
        continue;
      }
      
      // Generate exercise entry
      const exerciseEntry = {
        id: exercise.id,
        name: {
          english: exercise.english,
          korean: exercise.korean,
          romanization: exercise.romanization
        },
        description: {
          english: `A ${exercise.category} shoulder exercise targeting ${exercise.primaryMuscles.join(', ').toLowerCase()}`,
          korean: `${exercise.primaryMuscles.join(', ')}을 대상으로 하는 어깨 ${exercise.category === 'compound' ? '복합' : '고립'} 운동`
        },
        targetMuscles: {
          primary: exercise.primaryMuscles,
          secondary: exercise.secondaryMuscles,
          stabilizers: ['코어']
        },
        equipment: exercise.equipment,
        category: exercise.category,
        bodyParts: exercise.bodyParts,
        difficulty: exercise.difficulty,
        instructions: {
          english: [
            'Set up in proper starting position',
            'Perform the movement with controlled form',
            'Focus on shoulder muscle engagement',
            'Return to starting position with control'
          ],
          korean: [
            '적절한 시작 자세로 준비',
            '통제된 동작으로 운동 수행',
            '어깨 근육 참여에 집중',
            '통제하며 시작 자세로 돌아가기'
          ]
        },
        sets: {
          recommended: exercise.difficulty === 'beginner' ? '3세트' : exercise.difficulty === 'intermediate' ? '3-4세트' : '4세트',
          beginner: '2-3세트',
          intermediate: '3-4세트',
          advanced: '4-5세트'
        },
        reps: {
          recommended: exercise.category === 'isolation' ? '12-15회' : '8-12회',
          beginner: exercise.category === 'isolation' ? '12-15회' : '10-12회',
          intermediate: exercise.category === 'isolation' ? '10-12회' : '8-10회',
          advanced: exercise.category === 'isolation' ? '8-10회' : '6-8회'
        },
        media: {
          gifUrl: `./assets/exercise-gifs/shoulders/${exercise.id}.gif`,
          supabaseGifUrl: `https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/${exercise.id}.gif`
        },
        tags: [
          ...exercise.bodyParts,
          exercise.category === 'compound' ? '복합운동' : '고립운동',
          exercise.difficulty === 'beginner' ? '초급' : exercise.difficulty === 'intermediate' ? '중급' : '고급',
          ...exercise.equipment
        ],
        tips: {
          english: [
            'Maintain proper shoulder alignment',
            'Avoid using momentum',
            'Focus on controlled movement',
            'Keep core engaged throughout'
          ],
          korean: [
            '올바른 어깨 정렬 유지',
            '반동 사용 금지',
            '통제된 움직임에 집중',
            '전체 동작에서 코어 참여'
          ]
        },
        commonMistakes: {
          english: [
            'Using too much weight',
            'Poor shoulder posture',
            'Rushing through the movement',
            'Neglecting warm-up'
          ],
          korean: [
            '너무 무거운 중량 사용',
            '잘못된 어깨 자세',
            '동작을 서두르기',
            '워밍업 소홀'
          ]
        },
        alternatives: []
      };
      
      exerciseEntries.push(exerciseEntry);
    } catch (error) {
      console.error(`❌ Error processing ${exercise.korean}:`, error);
    }
  }
  
  // Save new exercises to file
  const outputPath = path.join(__dirname, '../src/data/newShoulderExercises.ts');
  const content = `// Auto-generated shoulder exercise database entries
import { ExerciseData } from './exerciseDatabase';

export const newShoulderExercises: ExerciseData[] = ${JSON.stringify(exerciseEntries, null, 2)};
`;
  
  fs.writeFileSync(outputPath, content);
  
  console.log(`\n📊 Summary:`);
  console.log(`✅ Successfully processed: ${exerciseEntries.length} exercises`);
  console.log(`⏭️  Skipped duplicates: ${shoulderExerciseMapping.length - newExercises.length}`);
  console.log(`📁 GIFs copied to: ${targetDir}`);
  console.log(`📄 Data saved to: ${outputPath}`);
  
  return exerciseEntries;
}

// Run the script
processShoulderExercises().catch(console.error);