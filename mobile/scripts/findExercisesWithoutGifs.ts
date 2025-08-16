const fs = require('fs');
const path = require('path');

const databasePath = path.join(__dirname, '../src/data/exerciseDatabase.ts');
const databaseContent = fs.readFileSync(databasePath, 'utf-8');

// Parse exercises
const exerciseMatches = databaseContent.matchAll(/{\s*id:\s*['"]([^'"]+)['"][^}]*?media:\s*{([^}]*)}/gs);

const exercisesWithoutGifs = [];
const exercisesWithPlaceholder = [];
const exercisesWithGifs = [];

for (const match of exerciseMatches) {
  const id = match[1];
  const mediaContent = match[2];
  
  // Check if it has a real GIF URL or placeholder
  if (!mediaContent.includes('gifUrl:') || mediaContent.includes('placeholder.gif')) {
    exercisesWithoutGifs.push(id);
  } else if (mediaContent.includes('./assets/exercise-gifs/placeholder.gif')) {
    exercisesWithPlaceholder.push(id);
  } else {
    exercisesWithGifs.push(id);
  }
}

console.log(`Total exercises analyzed: ${exercisesWithoutGifs.length + exercisesWithPlaceholder.length + exercisesWithGifs.length}`);
console.log(`Exercises with GIFs: ${exercisesWithGifs.length}`);
console.log(`Exercises without GIFs: ${exercisesWithoutGifs.length}`);
console.log(`Exercises with placeholder: ${exercisesWithPlaceholder.length}`);

// Map of existing GIF files we have
const gifMapping = {
  // Chest exercises that exist in database but need GIFs
  'barbell_bench_press': 'chest/바벨 벤치프레스.gif',
  'dips': 'chest/딥스.gif',
  'decline_cable_fly': 'chest/디클라인 케이블 플라이.gif',
  
  // Back exercises
  'deadlift': 'back/데드리프트.gif',
  'back_extension': 'back/백 익스텐션.gif',
  
  // Common exercises that might be missing GIFs
  'push_ups': 'all/push-ups.gif',
  'pull_ups': 'all/pull-ups.gif',
  'lat_pulldown': 'back/lat-pulldown-standard.gif',
  'seated_cable_row': 'back/cable-seated-row.gif',
  'barbell_row': 'all/barbell-row.gif',
  't_bar_row': 'all/t-bar-row.gif',
  
  // Shoulder exercises
  'shoulder_press': 'shoulders/barbell-shoulder-press.gif',
  'lateral_raise': 'shoulders/dumbbell-lateral-raise.gif',
  'front_raise': 'shoulders/barbell-front-raise.gif',
  'face_pull': 'all/face-pull.gif',
  
  // Arm exercises
  'bicep_curl': 'all/dumbbell-bicep-curl.gif',
  'hammer_curl': 'all/hammer-curls.gif',
  'tricep_extension': 'all/tricep-overhead-extension.gif',
  'tricep_pushdown': 'all/triceps-pushdown.gif',
  
  // Leg exercises
  'squat': 'all/barbell_squat.gif',
  'front_squat': 'all/front-squat.gif',
  'leg_press': 'all/leg-press.gif',
  'leg_extension': 'all/leg-extension.gif',
  'bulgarian_split_squat': 'all/bulgarian-split-squat.gif',
  'goblet_squat': 'all/goblet-squat.gif',
  'hack_squat': 'all/hack_squat.gif',
  
  // Core exercises
  'plank': 'all/plank.gif',
  'side_plank': 'all/side-plank.gif',
  'dead_bug': 'all/dead-bug.gif',
  'bird_dog': 'all/bird-dog.gif'
};

// Generate update script
const updates = [];
for (const [exerciseId, gifPath] of Object.entries(gifMapping)) {
  if (exercisesWithoutGifs.includes(exerciseId) || exercisesWithPlaceholder.includes(exerciseId)) {
    updates.push({
      id: exerciseId,
      gifPath: gifPath,
      supabaseUrl: `https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/${exerciseId}.gif`
    });
  }
}

console.log(`\nFound ${updates.length} exercises that can be updated with GIFs`);

// Save the mapping
fs.writeFileSync(
  path.join(__dirname, 'exerciseGifUpdates.json'),
  JSON.stringify({ updates, exercisesWithoutGifs, exercisesWithPlaceholder }, null, 2)
);

console.log('\nCreated exerciseGifUpdates.json with update information');