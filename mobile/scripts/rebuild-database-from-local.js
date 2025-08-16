#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('=== REBUILDING DATABASE FROM LOCAL FILES ===\n');

// Get current database
const currentDb = require('../src/data/exerciseDatabase.ts').default;

// Map of English names to Korean names from existing database
const nameMap = {};
currentDb.forEach(ex => {
  const key = ex.imageUrl.split('/').pop().replace('.gif', '');
  nameMap[key] = {
    korean: ex.name,
    english: ex.englishName,
    id: ex.id,
    category: ex.category,
    equipment: ex.equipment,
    difficulty: ex.difficulty,
    instructions: ex.instructions
  };
});

// Muscle group translations
const muscleGroupMap = {
  'abdominals': '복근',
  'arms': '팔',
  'back': '등',
  'biceps': '이두근',
  'calves': '종아리',
  'cardio': '유산소',
  'compound': '복합',
  'deltoids': '어깨',
  'forearms': '전완근',
  'glutes': '둔근',
  'hamstrings': '햄스트링',
  'legs': '다리',
  'matched': '매치드',
  'pectorals': '가슴',
  'quadriceps': '대퇴사두근',
  'traps': '승모근',
  'triceps': '삼두근'
};

// Category mapping
const categoryMap = {
  '복근': '코어',
  '팔': '상체',
  '등': '상체',
  '이두근': '상체',
  '종아리': '하체',
  '유산소': '유산소',
  '복합': '전신',
  '어깨': '상체',
  '전완근': '상체',
  '둔근': '하체',
  '햄스트링': '하체',
  '다리': '하체',
  '가슴': '상체',
  '대퇴사두근': '하체',
  '승모근': '상체',
  '삼두근': '상체'
};

function getAllLocalGifs() {
  const gifsDir = path.join(__dirname, '..', 'assets', 'exercise-gifs');
  const exercises = [];
  let nextId = 1;
  
  const muscleGroups = fs.readdirSync(gifsDir)
    .filter(f => fs.statSync(path.join(gifsDir, f)).isDirectory())
    .filter(f => f !== 'matched'); // Skip matched folder (duplicates)
  
  for (const muscleGroupEng of muscleGroups) {
    const muscleGroup = muscleGroupMap[muscleGroupEng] || muscleGroupEng;
    const groupDir = path.join(gifsDir, muscleGroupEng);
    const gifs = fs.readdirSync(groupDir).filter(f => f.endsWith('.gif')).sort();
    
    for (const gif of gifs) {
      const fileKey = gif.replace('.gif', '');
      const existing = nameMap[fileKey];
      
      // Generate Korean name from English if not in existing database
      const englishName = fileKey
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      const exercise = {
        id: existing?.id || nextId++,
        name: existing?.korean || englishName, // Use existing Korean name or fallback to English
        englishName: existing?.english || englishName,
        category: categoryMap[muscleGroup] || '상체',
        muscleGroup: muscleGroup,
        equipment: existing?.equipment || '기타',
        difficulty: existing?.difficulty || '중급',
        instructions: existing?.instructions || [],
        imageUrl: `https://ayttqsgttuvdhvbvbnsk.supabase.co/storage/v1/object/public/exercise-gifs/${muscleGroupEng}/${gif}`,
        videoUrl: '',
        thumbnailUrl: `https://ayttqsgttuvdhvbvbnsk.supabase.co/storage/v1/object/public/exercise-gifs/${muscleGroupEng}/${gif}`
      };
      
      exercises.push(exercise);
      
      // Update nextId if we used an existing ID
      if (existing?.id >= nextId) {
        nextId = existing.id + 1;
      }
    }
  }
  
  return exercises.sort((a, b) => a.id - b.id);
}

// Generate new database
const newExercises = getAllLocalGifs();

console.log(`Generated ${newExercises.length} exercises from local files\n`);

// Show changes
const oldCount = currentDb.length;
const newCount = newExercises.length;

console.log('=== CHANGES ===');
console.log(`Previous database: ${oldCount} exercises`);
console.log(`New database: ${newCount} exercises`);
console.log(`Difference: ${newCount > oldCount ? '+' : ''}${newCount - oldCount}\n`);

// Find added exercises
const oldUrls = new Set(currentDb.map(ex => ex.imageUrl));
const added = newExercises.filter(ex => !oldUrls.has(ex.imageUrl));

if (added.length > 0) {
  console.log(`📥 Added ${added.length} exercises:`);
  added.forEach(ex => {
    console.log(`  - ${ex.name} (${ex.englishName})`);
  });
  console.log('');
}

// Find removed exercises  
const newUrls = new Set(newExercises.map(ex => ex.imageUrl));
const removed = currentDb.filter(ex => !newUrls.has(ex.imageUrl));

if (removed.length > 0) {
  console.log(`📤 Removed ${removed.length} exercises:`);
  removed.forEach(ex => {
    console.log(`  - ${ex.name} (${ex.englishName})`);
  });
  console.log('');
}

// Write new database
const dbContent = `// Auto-generated from local files on ${new Date().toISOString()}
// DO NOT EDIT MANUALLY - Run rebuild-database-from-local.js to update

export interface ExerciseData {
  id: number;
  name: string;
  englishName: string;
  category: string;
  muscleGroup: string;
  equipment: string;
  difficulty: string;
  instructions: string[];
  imageUrl: string;
  videoUrl: string;
  thumbnailUrl: string;
}

const EXERCISE_DATABASE: ExerciseData[] = ${JSON.stringify(newExercises, null, 2)};

export default EXERCISE_DATABASE;
`;

const dbPath = path.join(__dirname, '..', 'src', 'data', 'exerciseDatabase.ts');

// Backup current database
const backupPath = dbPath + '.backup-' + Date.now();
fs.copyFileSync(dbPath, backupPath);
console.log(`✅ Backed up current database to: ${path.basename(backupPath)}`);

// Write new database
fs.writeFileSync(dbPath, dbContent);
console.log(`✅ Updated database with ${newExercises.length} exercises\n`);

// Update static thumbnails
console.log('=== UPDATING STATIC THUMBNAILS ===');

const thumbnailMappings = [];
for (const exercise of newExercises) {
  const urlParts = exercise.imageUrl.split('/');
  const muscleGroup = urlParts[urlParts.length - 2];
  const filename = urlParts[urlParts.length - 1].replace('.gif', '.jpg');
  
  const thumbPath = path.join(__dirname, '..', 'assets', 'exercise-thumbnails', muscleGroup, filename);
  
  if (fs.existsSync(thumbPath)) {
    thumbnailMappings.push({
      id: exercise.id,
      path: `../../assets/exercise-thumbnails/${muscleGroup}/${filename}`,
      comment: exercise.name
    });
  }
}

const thumbContent = `// Static thumbnail mappings for exercise list performance
// Maps exercise ID to local thumbnail asset

export const staticThumbnails: { [key: string]: any } = {
${thumbnailMappings.map(m => `  '${m.id}': require('${m.path}'), // ${m.comment}`).join(',\n')}
};

export default staticThumbnails;
`;

const thumbPath = path.join(__dirname, '..', 'src', 'constants', 'staticThumbnails.ts');
fs.writeFileSync(thumbPath, thumbContent);
console.log(`✅ Updated static thumbnails with ${thumbnailMappings.length} mappings\n`);

console.log('=== REBUILD COMPLETE ===');
console.log(`Database now has ${newExercises.length} exercises based on local files`);
console.log('\nNext steps:');
console.log('1. Run sync-to-supabase.js to upload any missing GIFs to Supabase');
console.log('2. Restart the app to see the changes');