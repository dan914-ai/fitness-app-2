import AsyncStorage from '@react-native-async-storage/async-storage';

export async function debugStorage() {
  // Debug function for development - remove in production
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    
    const routineKeys = [
      '@user_routines',
      'STORAGE_USER_ROUTINES',
      '@routines_initialized',
    ];
    
    for (const key of routineKeys) {
      try {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          try {
            const parsed = JSON.parse(value);
            // Process parsed data silently
          } catch (e) {
            // JSON parse error - continue silently
          }
        }
      } catch (e) {
        console.error(`Error reading ${key}:`, e);
      }
    }
    
    const foundRoutineKeys = allKeys.filter(key => 
      key.toLowerCase().includes('routine') || 
      key.includes('루틴')
    );
    
    for (const key of foundRoutineKeys) {
      if (!routineKeys.includes(key)) {
        await AsyncStorage.getItem(key);
      }
    }
    
  } catch (error) {
    console.error('Error debugging storage:', error);
  }
}