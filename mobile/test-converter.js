// Test the program converter
const { exerciseDatabaseService } = require('./src/services/exerciseDatabase.service');

// Test getExerciseByName
console.log('\n=== Testing getExerciseByName ===');
const names = ['바벨 스쿼트', '바디웨이트 스쿼트', 'Barbell Squat'];

names.forEach(name => {
  const exercise = exerciseDatabaseService.getExerciseByName(name);
  if (exercise) {
    console.log(`"${name}" -> ID: ${exercise.exerciseId}, Name: ${exercise.exerciseName}`);
  } else {
    console.log(`"${name}" -> NOT FOUND`);
  }
});

// Check all exercises
console.log('\n=== Checking all squat exercises ===');
const allExercises = exerciseDatabaseService.getAllExercisesWithDetails();
const squatExercises = allExercises.filter(ex => 
  ex && (ex.koreanName?.includes('스쿼트') || ex.englishName?.includes('Squat'))
);

squatExercises.forEach(ex => {
  console.log(`ID: ${ex.exerciseId}, Korean: ${ex.koreanName}, English: ${ex.englishName}, Equipment: ${ex.equipment}`);
});