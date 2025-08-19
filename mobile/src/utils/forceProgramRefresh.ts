// Force refresh of workout programs to fix bodyweight exercise issue
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROGRAMS_STORAGE_KEY = '@workout_programs';
const PROGRAMS_VERSION_KEY = '@programs_version';
const ACTIVE_PROGRAM_KEY = '@active_program';

export async function forceProgramRefresh() {
  console.log('🔄 Forcing complete program and routine refresh...');
  
  try {
    // Clear all program-related cache
    await AsyncStorage.removeItem(PROGRAMS_STORAGE_KEY);
    await AsyncStorage.removeItem(PROGRAMS_VERSION_KEY);
    await AsyncStorage.removeItem(ACTIVE_PROGRAM_KEY);
    
    // IMPORTANT: Clear ALL routines to force recreation with proper exercise names
    await AsyncStorage.removeItem('@user_routines');
    console.log('🧹 Cleared all routines to recreate with proper exercise names');
    
    console.log('✅ Program cache cleared successfully');
    console.log('✨ Programs will be re-converted with stable IDs on next load');
    
    // Also clear any other related cache
    const allKeys = await AsyncStorage.getAllKeys();
    const relatedKeys = allKeys.filter(key => 
      key.includes('routine') || 
      key.includes('workout') || 
      key.includes('program') ||
      key.includes('exercise')
    );
    
    if (relatedKeys.length > 0) {
      await AsyncStorage.multiRemove(relatedKeys);
      console.log(`🧹 Cleared ${relatedKeys.length} related cache entries`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error clearing program cache:', error);
    return false;
  }
}

// Removed auto-run to prevent clearing on every import
// Now only runs when explicitly called by version change