import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutHistoryItem } from '../utils/workoutHistory';

export async function testWorkoutStorage() {
  console.log('=== TEST WORKOUT STORAGE ===');
  
  try {
    // First, get existing workouts
    const existingJson = await AsyncStorage.getItem('@workout_history');
    const existing = existingJson ? JSON.parse(existingJson) : [];
    console.log('Existing workouts:', existing.length);
    
    // Create a test workout
    const testWorkout: WorkoutHistoryItem = {
      id: `test_workout_${Date.now()}`,
      routineId: 'test_routine_001',
      routineName: 'Test Routine ' + new Date().toLocaleTimeString(),
      date: new Date().toISOString().split('T')[0],
      startTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      endTime: new Date().toISOString(),
      duration: 3600,
      exercises: [
        {
          exerciseId: 'test_ex_1',
          exerciseName: 'Test Exercise 1',
          sets: [
            { weight: '50', reps: '10', type: 'Normal' },
            { weight: '50', reps: '10', type: 'Normal' },
          ],
          totalVolume: 1000,
        }
      ],
      totalVolume: 1000,
      totalSets: 2,
      completedExercises: 1,
    };
    
    // Add to existing
    const updated = [testWorkout, ...existing];
    console.log('After adding test workout:', updated.length);
    
    // Save back
    await AsyncStorage.setItem('@workout_history', JSON.stringify(updated));
    console.log('Saved updated workout history');
    
    // Verify it was saved
    const verifyJson = await AsyncStorage.getItem('@workout_history');
    const verified = verifyJson ? JSON.parse(verifyJson) : [];
    console.log('Verification - workouts in storage:', verified.length);
    
    if (verified.length === updated.length) {
      console.log('✅ Test workout saved successfully!');
    } else {
      console.error('❌ Test workout NOT saved properly!');
      console.log('Expected:', updated.length, 'Got:', verified.length);
    }
    
    return verified;
    
  } catch (error) {
    console.error('Error in test:', error);
    return [];
  }
}

export async function clearAllWorkouts() {
  console.log('Clearing all workouts...');
  await AsyncStorage.removeItem('@workout_history');
  console.log('All workouts cleared');
}

export async function addMultipleTestWorkouts(count: number = 5) {
  console.log(`Adding ${count} test workouts...`);
  
  const testWorkouts: WorkoutHistoryItem[] = [];
  
  for (let i = 0; i < count; i++) {
    const daysAgo = i;
    const workoutDate = new Date();
    workoutDate.setDate(workoutDate.getDate() - daysAgo);
    
    testWorkouts.push({
      id: `test_workout_${Date.now()}_${i}`,
      routineId: `test_routine_00${i}`,
      routineName: `Test Routine ${i + 1}`,
      date: workoutDate.toISOString().split('T')[0],
      startTime: new Date(workoutDate.getTime() - 3600000).toISOString(),
      endTime: workoutDate.toISOString(),
      duration: 3600 + (i * 300), // Different durations
      exercises: [
        {
          exerciseId: `test_ex_${i}`,
          exerciseName: `Test Exercise ${i + 1}`,
          sets: Array(3).fill(null).map(() => ({
            weight: String(40 + i * 5),
            reps: String(10 + i),
            type: 'Normal',
          })),
          totalVolume: (40 + i * 5) * (10 + i) * 3,
        }
      ],
      totalVolume: (40 + i * 5) * (10 + i) * 3,
      totalSets: 3,
      completedExercises: 1,
    });
  }
  
  // Get existing and add new ones
  const existingJson = await AsyncStorage.getItem('@workout_history');
  const existing = existingJson ? JSON.parse(existingJson) : [];
  
  const updated = [...testWorkouts, ...existing];
  
  await AsyncStorage.setItem('@workout_history', JSON.stringify(updated));
  
  console.log(`Added ${count} test workouts. Total now: ${updated.length}`);
  return updated;
}