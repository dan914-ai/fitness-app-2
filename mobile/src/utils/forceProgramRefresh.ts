// Force refresh of workout programs to fix bodyweight exercise issue
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROGRAMS_STORAGE_KEY = '@workout_programs';
const PROGRAMS_VERSION_KEY = '@programs_version';
const ACTIVE_PROGRAM_KEY = '@active_program';

export async function forceProgramRefresh() {
  console.log('🔄 Forcing program refresh to fix PPL exercises...');
  
  try {
    // Clear all program-related cache
    await AsyncStorage.removeItem(PROGRAMS_STORAGE_KEY);
    await AsyncStorage.removeItem(PROGRAMS_VERSION_KEY);
    await AsyncStorage.removeItem(ACTIVE_PROGRAM_KEY);
    
    console.log('✅ Program cache cleared successfully');
    console.log('✨ Programs will be re-converted on next load with proper barbell exercises');
    
    // Also clear any routine-related cache that might have the old exercises
    const allKeys = await AsyncStorage.getAllKeys();
    const routineKeys = allKeys.filter(key => 
      key.includes('routine') || 
      key.includes('workout') || 
      key.includes('program')
    );
    
    if (routineKeys.length > 0) {
      await AsyncStorage.multiRemove(routineKeys);
      console.log(`🧹 Cleared ${routineKeys.length} related cache entries`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error clearing program cache:', error);
    return false;
  }
}

// Auto-run on import for immediate effect
if (typeof window !== 'undefined') {
  forceProgramRefresh().then(() => {
    console.log('🎯 PPL program will now use:');
    console.log('  - Barbell Squat (바벨 스쿼트) instead of Bodyweight Squat');
    console.log('  - Barbell Lunge (바벨 런지) instead of Bodyweight Lunge');
  });
}