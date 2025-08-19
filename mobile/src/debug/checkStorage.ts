import AsyncStorage from '@react-native-async-storage/async-storage';

export async function debugStorage() {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    
    const workoutHistoryKey = '@workout_history';
    const workoutHistory = await AsyncStorage.getItem(workoutHistoryKey);
    
    if (workoutHistory) {
      const parsed = JSON.parse(workoutHistory);
      
      if (parsed.length > 0) {
        // Process workout data silently
      }
      
      // Check for duplicates
      const ids = parsed.map((w: any) => w.id);
      const uniqueIds = new Set(ids);
      if (ids.length !== uniqueIds.size) {
        console.warn('DUPLICATE IDs found!');
      }
    }
    
    // Check storage quota (web only)
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      await navigator.storage.estimate();
    }
    
  } catch (error) {
    console.error('Error debugging storage:', error);
  }
}

export async function clearWorkoutHistory() {
  await AsyncStorage.removeItem('@workout_history');
}

export async function getStorageSize() {
  const allKeys = await AsyncStorage.getAllKeys();
  let totalSize = 0;
  
  for (const key of allKeys) {
    const value = await AsyncStorage.getItem(key);
    if (value) {
      totalSize += value.length;
    }
  }
  
  return totalSize;
}