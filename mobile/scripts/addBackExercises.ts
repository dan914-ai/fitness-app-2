import * as fs from 'fs';
import * as path from 'path';

// Existing back exercises to avoid duplicates
const existingBackExercises = new Set([
  'barbell-row', 'bent-over-dumbbell-row', 'cable-row', 't-bar-row',
  'yates-row', 'single-arm-landmine-row', 'inverted-row', 'upright-row',
  'close-grip-lat-pulldown', 'wide-grip-lat-pulldown', 'neutral-grip-lat-pulldown',
  'pull-ups', 'chin-ups', 'weighted-pull-up', 'negative-pull-up',
  'barbell-pullover', 'standing-straight-arm-lat-pulldown'
]);

// Korean filename to exercise mapping
const backExerciseMapping = [
  {
    filename: '덤벨 로우.gif',
    id: 'dumbbell-row-seated',
    korean: '덤벨 로우',
    english: 'Dumbbell Row',
    category: 'compound' as const,
    equipment: ['덤벨'],
    primaryMuscles: ['광배근', '등'],
    difficulty: 'intermediate' as const
  },
  {
    filename: '랫 풀 다운.gif',
    id: 'lat-pulldown-standard',
    korean: '랫 풀 다운',
    english: 'Lat Pulldown',
    category: 'compound' as const,
    equipment: ['케이블머신'],
    primaryMuscles: ['광배근', '등'],
    difficulty: 'beginner' as const
  },
  {
    filename: '로잉 머신.gif',
    id: 'rowing-machine',
    korean: '로잉 머신',
    english: 'Rowing Machine',
    category: 'compound' as const,
    equipment: ['로잉머신'],
    primaryMuscles: ['등', '광배근'],
    difficulty: 'beginner' as const
  },
  {
    filename: '머신 시티드 로우.gif',
    id: 'machine-seated-row',
    korean: '머신 시티드 로우',
    english: 'Machine Seated Row',
    category: 'compound' as const,
    equipment: ['머신'],
    primaryMuscles: ['광배근', '능형근'],
    difficulty: 'beginner' as const
  },
  {
    filename: '바벨 로우.gif',
    id: 'barbell-row-bent-over',
    korean: '바벨 로우',
    english: 'Barbell Row',
    category: 'compound' as const,
    equipment: ['바벨'],
    primaryMuscles: ['광배근', '등'],
    difficulty: 'intermediate' as const,
    skipDuplicate: true
  },
  {
    filename: '풀업.gif',
    id: 'pull-ups-standard',
    korean: '풀업',
    english: 'Pull Ups',
    category: 'compound' as const,
    equipment: ['풀업바'],
    primaryMuscles: ['광배근', '등'],
    difficulty: 'intermediate' as const,
    skipDuplicate: true
  }
];

// Add more exercises here - keeping it simple for now
async function processBackExercises() {
  const backDir = '/mnt/c/Users/danny/Downloads/back exercises';
  const targetDir = path.join(__dirname, '../assets/exercise-gifs/back');
  
  fs.mkdirSync(targetDir, { recursive: true });
  
  const newExercises = backExerciseMapping.filter(ex => !ex.skipDuplicate);
  console.log(`Processing ${newExercises.length} back exercises`);
  
  // Copy files and create simple entries
  for (const exercise of newExercises) {
    const sourcePath = path.join(backDir, exercise.filename);
    const targetPath = path.join(targetDir, `${exercise.id}.gif`);
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✅ ${exercise.korean}`);
    }
  }
  
  console.log('✅ Back exercises processed');
}

processBackExercises().catch(console.error);