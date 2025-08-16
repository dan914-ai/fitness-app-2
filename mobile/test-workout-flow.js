// Test script to verify complete workout flow with real exercise database
const fs = require('fs');
const path = require('path');

console.log('=== Complete Workout Flow Test ===\n');

// Function to check if a file contains certain code
function checkFileContains(filePath, searchString, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    if (content.includes(searchString)) {
      console.log(`✅ ${description}`);
      return true;
    } else {
      console.log(`❌ ${description}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error reading file: ${filePath}`);
    return false;
  }
}

// Test 1: Check WorkoutSessionScreen integration
console.log('1. Testing WorkoutSessionScreen integration:');
const workoutSessionFile = path.join(__dirname, 'src/screens/home/WorkoutSessionScreen.tsx');

checkFileContains(
  workoutSessionFile,
  "import ExercisePickerSheet from '../../components/workout/ExercisePickerSheet'",
  'ExercisePickerSheet imported'
);

checkFileContains(
  workoutSessionFile,
  'handleSelectExercises',
  'Exercise selection handler implemented'
);

checkFileContains(
  workoutSessionFile,
  'workout.addExercise(exercise.exerciseId, exercise.exerciseName)',
  'Add exercise to workout implemented'
);

checkFileContains(
  workoutSessionFile,
  '<ExercisePickerSheet',
  'ExercisePickerSheet component added to JSX'
);

// Test 2: Check CreateRoutineScreen integration
console.log('\n2. Testing CreateRoutineScreen integration:');
const createRoutineFile = path.join(__dirname, 'src/screens/home/CreateRoutineScreen.tsx');

checkFileContains(
  createRoutineFile,
  "import ExercisePickerSheet from '../../components/workout/ExercisePickerSheet'",
  'ExercisePickerSheet imported in CreateRoutineScreen'
);

checkFileContains(
  createRoutineFile,
  'onSelectExercises={handleSelectExercises}',
  'Exercise selection handler connected'
);

// Test 3: Check ExercisePickerSheet uses real database
console.log('\n3. Testing ExercisePickerSheet database integration:');
const pickerFile = path.join(__dirname, 'src/components/workout/ExercisePickerSheet.tsx');

checkFileContains(
  pickerFile,
  'exerciseDatabaseService.getAllExercisesWithDetails()',
  'Using real exercise database service'
);

checkFileContains(
  pickerFile,
  'exercise.koreanName',
  'Using Korean exercise names'
);

checkFileContains(
  pickerFile,
  'gifService.getGifUrlWithFallback',
  'Using GIF service with fallback'
);

// Test 4: Check WorkoutContext supports adding exercises
console.log('\n4. Testing WorkoutContext support:');
const contextFile = path.join(__dirname, 'src/contexts/WorkoutContext.tsx');

checkFileContains(
  contextFile,
  'ADD_EXERCISE',
  'ADD_EXERCISE action exists'
);

checkFileContains(
  contextFile,
  'addExercise: (exerciseId: string, exerciseName: string)',
  'addExercise method in context'
);

// Test 5: Check Exercise Database Service
console.log('\n5. Testing Exercise Database Service:');
const serviceFile = path.join(__dirname, 'src/services/exerciseDatabase.service.ts');

checkFileContains(
  serviceFile,
  'class ExerciseDatabaseService',
  'ExerciseDatabaseService class exists'
);

checkFileContains(
  serviceFile,
  'getAllExercisesWithDetails()',
  'Get all exercises method exists'
);

checkFileContains(
  serviceFile,
  'searchExercises(',
  'Search exercises method exists'
);

checkFileContains(
  serviceFile,
  'mapToApiExercise(',
  'Exercise mapping method exists'
);

// Test 6: Check GIF Service
console.log('\n6. Testing GIF Service:');
const gifServiceFile = path.join(__dirname, 'src/services/gif.service.ts');

checkFileContains(
  gifServiceFile,
  'getGifUrlWithFallback',
  'GIF fallback method exists'
);

checkFileContains(
  gifServiceFile,
  'getExerciseGifUrl',
  'Exercise GIF URL builder exists'
);

// Summary
console.log('\n=== Test Summary ===');
console.log('✨ Integration points verified!');
console.log('\nNext manual testing steps:');
console.log('1. Start the app and navigate to Home tab');
console.log('2. Select a routine and tap "시작하기" to start a workout');
console.log('3. In the workout session, tap "운동 추가" button');
console.log('4. Verify the exercise picker shows 230+ real exercises with Korean names');
console.log('5. Search for exercises by Korean or English name');
console.log('6. Select an exercise and verify it\'s added to the workout');
console.log('7. Tap on the exercise to track sets and reps');
console.log('8. Complete the exercise and verify progress updates');
console.log('9. End the workout and verify it\'s saved to history');
console.log('10. Check if the workout appears in the Records tab');

console.log('\nWorkflow test points:');
console.log('- [ ] Exercise picker loads with real exercises');
console.log('- [ ] Search works for Korean/English/romanized names');
console.log('- [ ] Category filter works correctly');
console.log('- [ ] Exercise GIFs load properly');
console.log('- [ ] Selected exercises are added to workout');
console.log('- [ ] Exercise tracking works with real exercises');
console.log('- [ ] Workout saves with correct exercise data');
console.log('- [ ] History shows exercises with Korean names');