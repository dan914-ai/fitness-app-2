import AsyncStorage from '@react-native-async-storage/async-storage';

export async function clearProgramCache() {
  
  try {
    // Clear all program-related keys
    const keysToRemove = [
      '@workout_programs',
      '@active_program',
      '@custom_programs',
      '@program_state'
    ];
    
    await AsyncStorage.multiRemove(keysToRemove);
    
    // Force a small delay to ensure cache is cleared
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return true;
  } catch (error) {
    console.error('❌ Error clearing program cache:', error);
    return false;
  }
}