import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutHistoryItem } from '../utils/workoutHistory';
import storageService from '../services/storage.service';

export async function testStoragePersistence() {
  console.log('=== STORAGE PERSISTENCE TEST ===');
  
  try {
    // Step 1: Clear and initialize
    console.log('\n1. Clearing existing history...');
    await AsyncStorage.removeItem('@workout_history');
    
    // Step 2: Verify it's empty
    const emptyCheck = await storageService.getWorkoutHistory();
    console.log('2. After clear, workouts count:', emptyCheck.length);
    
    // Step 3: Add first workout
    console.log('\n3. Adding first workout...');
    const workout1: WorkoutHistoryItem = {
      id: `test_${Date.now()}_1`,
      routineId: 'routine_1',
      routineName: 'Test Workout 1',
      date: new Date().toISOString().split('T')[0],
      startTime: new Date(Date.now() - 3600000).toISOString(),
      endTime: new Date().toISOString(),
      duration: 3600,
      exercises: [{
        exerciseId: 'ex1',
        exerciseName: 'Test Exercise 1',
        sets: [
          { weight: '50', reps: '10', type: 'Normal' }
        ],
        totalVolume: 500
      }],
      totalVolume: 500,
      totalSets: 1,
      completedExercises: 1,
      memo: 'First test workout'
    };
    
    await storageService.addWorkoutToHistory(workout1);
    
    // Step 4: Verify first workout was saved
    const afterFirst = await storageService.getWorkoutHistory();
    console.log('4. After adding first, workouts count:', afterFirst.length);
    console.log('   First workout ID:', afterFirst[0]?.id);
    
    // Step 5: Add second workout (wait to ensure different timestamp)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('\n5. Adding second workout...');
    const workout2: WorkoutHistoryItem = {
      id: `test_${Date.now()}_2`,
      routineId: 'routine_2',
      routineName: 'Test Workout 2',
      date: new Date().toISOString().split('T')[0],
      startTime: new Date(Date.now() - 7200000).toISOString(),
      endTime: new Date(Date.now() - 3600000).toISOString(),
      duration: 3600,
      exercises: [{
        exerciseId: 'ex2',
        exerciseName: 'Test Exercise 2',
        sets: [
          { weight: '60', reps: '12', type: 'Normal' }
        ],
        totalVolume: 720
      }],
      totalVolume: 720,
      totalSets: 1,
      completedExercises: 1,
      memo: 'Second test workout'
    };
    
    await storageService.addWorkoutToHistory(workout2);
    
    // Step 6: Verify both workouts are saved
    const afterSecond = await storageService.getWorkoutHistory();
    console.log('6. After adding second, workouts count:', afterSecond.length);
    console.log('   Workout IDs:', afterSecond.map(w => w.id));
    console.log('   Workout names:', afterSecond.map(w => w.routineName));
    
    // Step 7: Add third workout
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('\n7. Adding third workout...');
    const workout3: WorkoutHistoryItem = {
      id: `test_${Date.now()}_3`,
      routineId: 'routine_3',
      routineName: 'Test Workout 3',
      date: new Date().toISOString().split('T')[0],
      startTime: new Date(Date.now() - 10800000).toISOString(),
      endTime: new Date(Date.now() - 7200000).toISOString(),
      duration: 3600,
      exercises: [{
        exerciseId: 'ex3',
        exerciseName: 'Test Exercise 3',
        sets: [
          { weight: '70', reps: '8', type: 'Normal' }
        ],
        totalVolume: 560
      }],
      totalVolume: 560,
      totalSets: 1,
      completedExercises: 1,
      memo: 'Third test workout'
    };
    
    await storageService.addWorkoutToHistory(workout3);
    
    // Step 8: Final verification
    const finalCheck = await storageService.getWorkoutHistory();
    console.log('\n8. FINAL RESULTS:');
    console.log('   Total workouts:', finalCheck.length);
    console.log('   All workout IDs:', finalCheck.map(w => w.id));
    console.log('   All workout names:', finalCheck.map(w => w.routineName));
    console.log('   All workout memos:', finalCheck.map(w => w.memo));
    
    // Step 9: Direct AsyncStorage check
    console.log('\n9. Direct AsyncStorage verification:');
    const directJson = await AsyncStorage.getItem('@workout_history');
    if (directJson) {
      const directData = JSON.parse(directJson);
      console.log('   Direct storage count:', directData.length);
      console.log('   Direct storage IDs:', directData.map((w: any) => w.id));
    } else {
      console.log('   Direct storage: EMPTY');
    }
    
    // Step 10: Test persistence after reload
    console.log('\n10. Testing persistence (simulating app restart)...');
    // Clear any in-memory cache by creating new service instance would be here
    const reloadedHistory = await storageService.getWorkoutHistory();
    console.log('   After reload, workouts count:', reloadedHistory.length);
    
    // Return test results
    const success = finalCheck.length === 3;
    console.log('\n=== TEST RESULT:', success ? '✅ SUCCESS' : '❌ FAILURE', '===');
    
    if (!success) {
      console.error('Expected 3 workouts, but found', finalCheck.length);
      console.error('This indicates a storage persistence issue!');
    }
    
    return {
      success,
      expectedCount: 3,
      actualCount: finalCheck.length,
      workouts: finalCheck
    };
    
  } catch (error) {
    console.error('Test failed with error:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

// Function to diagnose the specific issue
export async function diagnoseStorageIssue() {
  console.log('=== DIAGNOSING STORAGE ISSUE ===');
  
  try {
    // Check 1: Raw AsyncStorage
    console.log('\n1. Checking raw AsyncStorage...');
    const raw = await AsyncStorage.getItem('@workout_history');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        console.log('   Raw data is valid JSON');
        console.log('   Array length:', parsed.length);
        console.log('   Is Array:', Array.isArray(parsed));
        if (parsed.length > 0) {
          console.log('   First item keys:', Object.keys(parsed[0]));
          console.log('   First item ID:', parsed[0].id);
        }
      } catch (parseError) {
        console.error('   JSON parse error:', parseError);
        console.log('   Raw data (first 200 chars):', raw.substring(0, 200));
      }
    } else {
      console.log('   No data in AsyncStorage');
    }
    
    // Check 2: Storage service flow
    console.log('\n2. Testing storage service flow...');
    const beforeAdd = await storageService.getWorkoutHistory();
    console.log('   Before add:', beforeAdd.length, 'workouts');
    
    // Create a unique test workout
    const testWorkout: WorkoutHistoryItem = {
      id: `diagnostic_${Date.now()}`,
      routineId: 'diag_routine',
      routineName: `Diagnostic Test ${new Date().toLocaleTimeString()}`,
      date: new Date().toISOString().split('T')[0],
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      duration: 60,
      exercises: [],
      totalVolume: 0,
      totalSets: 0,
      completedExercises: 0,
      memo: 'Diagnostic test workout'
    };
    
    console.log('   Adding diagnostic workout with ID:', testWorkout.id);
    await storageService.addWorkoutToHistory(testWorkout);
    
    const afterAdd = await storageService.getWorkoutHistory();
    console.log('   After add:', afterAdd.length, 'workouts');
    
    const found = afterAdd.find(w => w.id === testWorkout.id);
    console.log('   Diagnostic workout found:', found ? 'YES' : 'NO');
    
    if (afterAdd.length === beforeAdd.length) {
      console.error('   ❌ PROBLEM: Workout count did not increase!');
    } else if (afterAdd.length === 1 && beforeAdd.length > 0) {
      console.error('   ❌ PROBLEM: History was overwritten instead of appended!');
    } else {
      console.log('   ✅ Workout was properly added');
    }
    
    // Check 3: Multiple rapid adds
    console.log('\n3. Testing rapid sequential adds...');
    const rapidTest1: WorkoutHistoryItem = { ...testWorkout, id: `rapid_1_${Date.now()}`, routineName: 'Rapid 1' };
    const rapidTest2: WorkoutHistoryItem = { ...testWorkout, id: `rapid_2_${Date.now()}`, routineName: 'Rapid 2' };
    
    await storageService.addWorkoutToHistory(rapidTest1);
    await storageService.addWorkoutToHistory(rapidTest2);
    
    const afterRapid = await storageService.getWorkoutHistory();
    console.log('   After rapid adds:', afterRapid.length, 'workouts');
    
    const hasRapid1 = afterRapid.some(w => w.id.startsWith('rapid_1'));
    const hasRapid2 = afterRapid.some(w => w.id.startsWith('rapid_2'));
    console.log('   Has Rapid 1:', hasRapid1 ? 'YES' : 'NO');
    console.log('   Has Rapid 2:', hasRapid2 ? 'YES' : 'NO');
    
    // Final diagnosis
    console.log('\n=== DIAGNOSIS COMPLETE ===');
    console.log('Current workout count:', afterRapid.length);
    console.log('All workout IDs:', afterRapid.map(w => `${w.id} (${w.routineName})`).join('\n  '));
    
  } catch (error) {
    console.error('Diagnosis failed:', error);
  }
}