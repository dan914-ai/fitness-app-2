// Test what staticThumbnails actually returns
const staticThumbnails = require('./src/constants/staticThumbnails').default;

console.log('Testing staticThumbnails...');
console.log('Type of staticThumbnails:', typeof staticThumbnails);
console.log('Keys:', Object.keys(staticThumbnails).slice(0, 5));

// Check what exercise ID 1 returns
const exercise1 = staticThumbnails['1'];
console.log('\nExercise 1 thumbnail:');
console.log('Type:', typeof exercise1);
console.log('Value:', exercise1);

// Check if it's a require() result or something else
if (typeof exercise1 === 'object') {
  console.log('Object keys:', Object.keys(exercise1));
}

// Try to import and test the service
const { exerciseDatabaseService } = require('./src/services/exerciseDatabase.service');

console.log('\nTesting exerciseDatabaseService...');
const exercises = exerciseDatabaseService.getExercisesPaginated({ limit: 1 });
console.log('First exercise:', exercises.exercises[0]);
console.log('ImageUrl type:', typeof exercises.exercises[0]?.imageUrl);
console.log('ImageUrl value:', exercises.exercises[0]?.imageUrl);