// Debug utility to check workout storage
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function debugCheckWorkoutStorage() {
  console.log('🔍 === DEBUGGING WORKOUT STORAGE ===');
  
  try {
    // Check raw storage
    const workoutHistory = await AsyncStorage.getItem('@workout_history');
    console.log('📦 Raw @workout_history:', workoutHistory ? `Found (${workoutHistory.length} chars)` : 'EMPTY');
    
    if (workoutHistory) {
      const parsed = JSON.parse(workoutHistory);
      console.log('📊 Parsed workout history:');
      console.log('  - Type:', Array.isArray(parsed) ? 'Array' : typeof parsed);
      console.log('  - Count:', Array.isArray(parsed) ? parsed.length : 'N/A');
      
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log('  - First workout:', {
          id: parsed[0].id,
          routineName: parsed[0].routineName,
          date: parsed[0].date,
          totalVolume: parsed[0].totalVolume
        });
        console.log('  - Last workout:', {
          id: parsed[parsed.length - 1].id,
          routineName: parsed[parsed.length - 1].routineName,
          date: parsed[parsed.length - 1].date,
          totalVolume: parsed[parsed.length - 1].totalVolume
        });
      }
    }
    
    // Check current workout state
    const workoutState = await AsyncStorage.getItem('@workout_state');
    console.log('💪 Current workout state:', workoutState ? 'Active' : 'None');
    
    if (workoutState) {
      const state = JSON.parse(workoutState);
      console.log('  - Active:', state.isWorkoutActive);
      console.log('  - Routine:', state.routineName);
      console.log('  - Start time:', state.startTime);
      console.log('  - Exercises:', Object.keys(state.exercises || {}).length);
    }
    
    // List all storage keys
    const allKeys = await AsyncStorage.getAllKeys();
    console.log('🔑 All AsyncStorage keys:', allKeys.filter(k => k.includes('workout') || k.includes('WORKOUT')));
    
  } catch (error) {
    console.error('❌ Error checking workout storage:', error);
  }
  
  console.log('🔍 === END DEBUG ===');
}

// Export for use in console
if (typeof window !== 'undefined') {
  (window as any).debugCheckWorkoutStorage = debugCheckWorkoutStorage;
}