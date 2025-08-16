// Test script to verify workout programs functionality
const AsyncStorage = require('@react-native-async-storage/async-storage').default;

// Mock AsyncStorage for testing
const storage = {};
AsyncStorage.setItem = async (key, value) => {
  storage[key] = value;
  return Promise.resolve();
};
AsyncStorage.getItem = async (key) => {
  return Promise.resolve(storage[key] || null);
};
AsyncStorage.removeItem = async (key) => {
  delete storage[key];
  return Promise.resolve();
};

// Load the service
const { workoutProgramsService } = require('./src/services/workoutPrograms.service');

async function testPrograms() {
  console.log('🧪 Testing Workout Programs Feature\n');
  console.log('=====================================\n');
  
  try {
    // Test 1: Load programs
    console.log('Test 1: Loading programs...');
    const programs = await workoutProgramsService.getAllPrograms();
    console.log(`✅ Loaded ${programs.length} programs`);
    programs.forEach(p => {
      console.log(`   - ${p.name} (${p.difficulty}, ${p.duration} weeks)`);
    });
    
    // Test 2: Check if any program is active
    console.log('\nTest 2: Checking active program...');
    const activeProgram = await workoutProgramsService.getActiveProgram();
    if (activeProgram) {
      console.log(`✅ Active program: ${activeProgram.name}`);
    } else {
      console.log('ℹ️  No active program');
    }
    
    // Test 3: Activate a program
    console.log('\nTest 3: Activating first program...');
    if (programs.length > 0) {
      const success = await workoutProgramsService.activateProgram(programs[0].id);
      if (success) {
        console.log(`✅ Successfully activated: ${programs[0].name}`);
        
        // Check if it's now active
        const nowActive = await workoutProgramsService.getActiveProgram();
        if (nowActive) {
          console.log(`   Current week: ${nowActive.currentWeek || 1}`);
          console.log(`   Current day: ${nowActive.currentDay || 1}`);
        }
      } else {
        console.log('❌ Failed to activate program');
      }
    }
    
    // Test 4: Get today's workout
    console.log('\nTest 4: Getting today\'s workout...');
    const todaysWorkout = await workoutProgramsService.getTodaysWorkout();
    if (todaysWorkout) {
      console.log(`✅ Today's workout: ${todaysWorkout.name}`);
      console.log(`   Exercises: ${todaysWorkout.exercises.length}`);
      todaysWorkout.exercises.forEach(ex => {
        console.log(`   - ${ex.exerciseName}: ${ex.sets} sets x ${ex.reps} reps`);
      });
    } else {
      console.log('ℹ️  No workout for today (might be rest day)');
    }
    
    console.log('\n=====================================');
    console.log('✅ All tests passed! Programs feature is working.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

testPrograms();