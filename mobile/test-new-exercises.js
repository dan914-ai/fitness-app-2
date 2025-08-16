// Test that new exercises are properly integrated
const db = require('./src/data/exerciseDatabase.ts');
const { convertAllPrograms } = require('./src/utils/programConverter.ts');

console.log('🧪 Testing New Exercise Integration\n');
console.log('==================================\n');

// Test 1: Check if new exercises are in database
console.log('Test 1: Checking new exercises in database...');
const exercises = db.default;
const newExerciseIds = [348, 349, 350, 351, 352, 353, 354, 355, 356, 357, 358, 359, 360, 361, 362, 363, 364, 365, 366, 367];

let foundCount = 0;
newExerciseIds.forEach(id => {
  const exercise = exercises.find(ex => ex.id === id);
  if (exercise) {
    console.log(`✅ ID ${id}: ${exercise.name} (${exercise.englishName})`);
    foundCount++;
  } else {
    console.log(`❌ ID ${id}: Not found`);
  }
});

console.log(`\nFound ${foundCount}/${newExerciseIds.length} new exercises in database\n`);

// Test 2: Check if important exercise mappings work
console.log('Test 2: Testing key exercise mappings...');
const keyExercises = ['Push-ups', 'Plank', 'Hanging Leg Raise', 'Ab Wheel Rollout'];

const { exerciseDatabaseService } = require('./src/services/exerciseDatabase.service.ts');

keyExercises.forEach(exerciseName => {
  try {
    const exercise = exerciseDatabaseService.getExerciseByName(exerciseName);
    if (exercise) {
      console.log(`✅ "${exerciseName}" -> Found: ${exercise.exerciseName}`);
    } else {
      console.log(`❌ "${exerciseName}" -> Not found`);
    }
  } catch (err) {
    console.log(`❌ "${exerciseName}" -> Error: ${err.message}`);
  }
});

console.log('\nTest 3: Testing program conversion...');
try {
  const convertedPrograms = convertAllPrograms();
  console.log(`✅ Successfully converted ${convertedPrograms.length} programs`);
  
  // Count exercises with valid IDs
  let totalExercises = 0;
  let validExercises = 0;
  
  convertedPrograms.forEach(program => {
    program.workoutDays.forEach(day => {
      day.exercises.forEach(ex => {
        totalExercises++;
        if (ex.exerciseId) {
          validExercises++;
        }
      });
    });
  });
  
  console.log(`✅ ${validExercises}/${totalExercises} exercises have valid IDs`);
  
} catch (err) {
  console.log(`❌ Program conversion failed: ${err.message}`);
}

console.log('\n==================================');
console.log('✅ New exercise integration test completed!');