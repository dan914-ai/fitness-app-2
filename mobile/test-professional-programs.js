// Test script for professional workout programs integration
const { convertAllPrograms } = require('./src/utils/programConverter');
const { PROFESSIONAL_PROGRAMS } = require('./src/data/programsData');

console.log('🏋️ Testing Professional Programs Integration\n');
console.log('=====================================\n');

try {
  // Test 1: Check if programs data loads
  console.log('Test 1: Loading professional programs data...');
  console.log(`✅ Loaded ${PROFESSIONAL_PROGRAMS.length} professional programs:`);
  PROFESSIONAL_PROGRAMS.forEach(p => {
    console.log(`   - ${p.program_name} (${p.discipline}, ${p.experience_level})`);
  });

  // Test 2: Convert programs
  console.log('\nTest 2: Converting programs to app format...');
  const converted = convertAllPrograms();
  console.log(`✅ Converted ${converted.length} programs successfully`);
  
  // Test 3: Check converted program details
  console.log('\nTest 3: Checking converted program details...');
  converted.forEach(program => {
    const totalExercises = program.workoutDays.reduce((sum, day) => sum + day.exercises.length, 0);
    const exercisesWithIds = program.workoutDays.reduce((sum, day) => 
      sum + day.exercises.filter(ex => ex.exerciseId).length, 0);
    
    console.log(`\n📋 ${program.name}`);
    console.log(`   - Difficulty: ${program.difficulty}`);
    console.log(`   - Duration: ${program.duration} weeks`);
    console.log(`   - Category: ${program.category}`);
    console.log(`   - Workout days: ${program.workoutDays.length}`);
    console.log(`   - Total exercises: ${totalExercises}`);
    console.log(`   - Exercises with IDs: ${exercisesWithIds}/${totalExercises}`);
    
    if (exercisesWithIds < totalExercises) {
      console.log('   ⚠️  Missing exercise IDs:');
      program.workoutDays.forEach(day => {
        day.exercises.forEach(ex => {
          if (!ex.exerciseId) {
            console.log(`      - ${ex.exerciseName}`);
          }
        });
      });
    }
  });
  
  console.log('\n=====================================');
  console.log('✅ Professional programs integration successful!');
  
} catch (error) {
  console.error('\n❌ Test failed:', error.message);
  console.error(error.stack);
}