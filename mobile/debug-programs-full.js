#!/usr/bin/env node

// Full debug of program loading process
console.log('🔍 FULL PROGRAM LOADING DEBUG');
console.log('='.repeat(60));

try {
  // Step 1: Test data loading
  console.log('\n1️⃣ Testing raw program data...');
  const { PROFESSIONAL_PROGRAMS } = require('./src/data/programsData.ts');
  console.log(`✅ Loaded ${PROFESSIONAL_PROGRAMS.length} professional programs from data file`);
  
  PROFESSIONAL_PROGRAMS.forEach((p, i) => {
    console.log(`   ${i+1}. ${p.program_name} (${p.discipline}, ${p.experience_level})`);
    console.log(`      Workouts: ${p.weekly_workout_plan.length} days`);
  });

  // Step 2: Test program conversion
  console.log('\n2️⃣ Testing program conversion...');
  const { convertAllPrograms } = require('./src/utils/programConverter.ts');
  const converted = convertAllPrograms();
  console.log(`✅ Converted ${converted.length} programs successfully`);
  
  converted.forEach((p, i) => {
    const totalExercises = p.workoutDays.reduce((sum, day) => sum + day.exercises.length, 0);
    console.log(`   ${i+1}. ${p.name} - ${p.workoutDays.length} days, ${totalExercises} exercises`);
  });

  // Step 3: Check if there are conversion failures
  console.log('\n3️⃣ Checking for conversion issues...');
  const failed = PROFESSIONAL_PROGRAMS.length - converted.length;
  if (failed > 0) {
    console.log(`❌ ${failed} programs failed to convert!`);
  } else {
    console.log('✅ All programs converted successfully');
  }

  // Step 4: Check exercise mapping
  console.log('\n4️⃣ Checking exercise mappings...');
  let totalMissingExercises = 0;
  converted.forEach(program => {
    program.workoutDays.forEach(day => {
      const missingExercises = day.exercises.filter(ex => !ex.exerciseId).length;
      totalMissingExercises += missingExercises;
      if (missingExercises > 0) {
        console.log(`⚠️  ${program.name} - ${day.name}: ${missingExercises} exercises not found in database`);
      }
    });
  });
  
  if (totalMissingExercises === 0) {
    console.log('✅ All exercises successfully mapped to database');
  } else {
    console.log(`❌ ${totalMissingExercises} exercises could not be mapped`);
  }

  // Step 5: Generate final program list
  console.log('\n5️⃣ Final converted program list:');
  converted.forEach((p, i) => {
    console.log(`   ${i+1}. "${p.name}"`);
    console.log(`       Category: ${p.category}`);
    console.log(`       Difficulty: ${p.difficulty}`);
    console.log(`       Duration: ${p.duration} weeks`);
    console.log(`       Days: ${p.workoutDays.length}`);
    console.log();
  });

} catch (error) {
  console.error('❌ Error during testing:', error.message);
  console.log('\n🔧 Possible issues:');
  console.log('1. Import/require issues with TypeScript files');
  console.log('2. Missing dependencies in conversion process'); 
  console.log('3. Exercise database not properly loaded');
  console.log('4. AsyncStorage cache containing old data');
}

console.log('\n💡 If programs are still not showing:');
console.log('1. Clear app data/cache completely');
console.log('2. Restart the React Native app');
console.log('3. Check console logs for conversion errors');
console.log('4. Verify exerciseDatabase.service is working properly');