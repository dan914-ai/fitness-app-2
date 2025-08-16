const fs = require('fs');
const path = require('path');

// Simple approach - just append the new exercises
const newChestExercises = `  {
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
    gifUrl: './assets/exercise-gifs/chest/덤벨 벤치프레스.gif',
    supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/dumbbell_bench_press.gif'
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
    gifUrl: './assets/exercise-gifs/chest/덤벨 인클라인 벤치 프레스.gif',
    supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/dumbbell_incline_bench_press.gif'
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
    gifUrl: './assets/exercise-gifs/chest/덤벨 체스트 플라이.gif',
    supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/dumbbell_chest_fly.gif'
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
    gifUrl: './assets/exercise-gifs/chest/디클라인 덤벨 플라이.gif',
    supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/decline_dumbbell_fly.gif'
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
    gifUrl: './assets/exercise-gifs/chest/디클라인 바벨 벤치프레스.gif',
    supabaseGifUrl: 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/decline_barbell_bench_press.gif'
  }`;

const databasePath = path.join(__dirname, '../src/data/exerciseDatabase.ts');

// Read the file
let content = fs.readFileSync(databasePath, 'utf-8');

// Find the last exercise entry (look for the pattern "}," before the closing "]")
const lastExerciseIndex = content.lastIndexOf('},');
if (lastExerciseIndex === -1) {
  console.error('Could not find last exercise in database');
  process.exit(1);
}

// Insert new exercises after the last exercise
const beforeLastExercise = content.substring(0, lastExerciseIndex + 2);
const afterLastExercise = content.substring(lastExerciseIndex + 2);

const newContent = beforeLastExercise + '\n' + newChestExercises + afterLastExercise;

// Write back
fs.writeFileSync(databasePath, newContent);

console.log('Successfully added 5 chest exercises to database');