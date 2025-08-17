// Test script to check PPL program conversion
const { exerciseDatabaseService } = require('./src/services/exerciseDatabase.service');
const { convertAllPrograms } = require('./src/utils/programConverter');

console.log('Testing PPL Program Conversion\n');
console.log('================================\n');

// Test finding specific exercises
console.log('1. Testing Exercise Lookup:');
console.log('----------------------------');

const testExercises = [
  'Barbell Squat',
  '바벨 스쿼트',
  'Walking Lunge',
  '바벨 런지',
  'Bodyweight Squat',
  '바디웨이트 스쿼트'
];

testExercises.forEach(name => {
  const exercise = exerciseDatabaseService.getExerciseByName(name);
  if (exercise) {
    console.log(`✓ "${name}" → ID: ${exercise.exerciseId}, Name: ${exercise.exerciseName}`);
  } else {
    console.log(`✗ "${name}" → NOT FOUND`);
  }
});

console.log('\n2. Converting PPL Program:');
console.log('----------------------------');

// Convert all programs and find PPL
const allConverted = convertAllPrograms();
const pplProgram = allConverted.find(p => p.name.includes('PPL'));

if (pplProgram) {
  console.log(`Found: ${pplProgram.name}\n`);
  
  // Check Legs A day
  const legsA = pplProgram.workoutDays.find(d => d.name.includes('Legs A'));
  if (legsA) {
    console.log('Legs A exercises:');
    legsA.exercises.forEach((ex, i) => {
      console.log(`  ${i+1}. ID: ${ex.exerciseId}, Name: ${ex.exerciseName}`);
      
      // Check if it's a bodyweight exercise
      if (ex.exerciseName.includes('바디웨이트') || ex.exerciseName.includes('Bodyweight')) {
        console.log(`     ⚠️ WARNING: This is a bodyweight exercise!`);
      }
      if (ex.exerciseName.includes('바벨') || ex.exerciseName.includes('Barbell')) {
        console.log(`     ✓ This is a barbell exercise`);
      }
    });
  }
  
  // Check Legs B day
  const legsB = pplProgram.workoutDays.find(d => d.name.includes('Legs B'));
  if (legsB) {
    console.log('\nLegs B exercises:');
    legsB.exercises.forEach((ex, i) => {
      console.log(`  ${i+1}. ID: ${ex.exerciseId}, Name: ${ex.exerciseName}`);
      
      // Check if it's a bodyweight exercise
      if (ex.exerciseName.includes('바디웨이트') || ex.exerciseName.includes('Bodyweight')) {
        console.log(`     ⚠️ WARNING: This is a bodyweight exercise!`);
      }
      if (ex.exerciseName.includes('바벨') || ex.exerciseName.includes('Barbell')) {
        console.log(`     ✓ This is a barbell exercise`);
      }
    });
  }
} else {
  console.log('PPL program not found!');
}

console.log('\n3. Summary:');
console.log('----------------------------');
console.log('The PPL program should use:');
console.log('  - Barbell Squat (바벨 스쿼트) - NOT Bodyweight Squat');
console.log('  - Walking Lunge should map to 바벨 런지 (Barbell Lunge)');
console.log('  - Bulgarian Split Squat (usually done with dumbbells)');