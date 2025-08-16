import AsyncStorage from '@react-native-async-storage/async-storage';

export async function nukeAllRoutines() {
  console.error('☢️☢️☢️ NUCLEAR ROUTINE REMOVAL ☢️☢️☢️');
  
  try {
    // Get ALL keys in AsyncStorage
    const allKeys = await AsyncStorage.getAllKeys();
    console.error(`Found ${allKeys.length} total keys in storage`);
    
    // Remove ANYTHING that could possibly be a routine
    const keysToNuke = allKeys.filter(key => {
      const lowerKey = key.toLowerCase();
      return (
        lowerKey.includes('routine') ||
        lowerKey.includes('루틴') ||
        key === '@user_routines' ||
        key === 'STORAGE_USER_ROUTINES' ||
        key === '@routines_initialized' ||
        key.startsWith('routine-') ||
        key.includes('default-')
      );
    });
    
    console.error(`☢️ NUKING ${keysToNuke.length} routine-related keys:`, keysToNuke);
    
    // Remove all routine keys
    for (const key of keysToNuke) {
      await AsyncStorage.removeItem(key);
      console.error(`💥 NUKED: ${key}`);
    }
    
    // Force set empty data to prevent any loading
    const emptyData = JSON.stringify({});
    await AsyncStorage.setItem('@user_routines', emptyData);
    await AsyncStorage.setItem('STORAGE_USER_ROUTINES', emptyData);
    
    // Also try array format in case that's expected
    const emptyArray = JSON.stringify([]);
    await AsyncStorage.setItem('@user_routines_array', emptyArray);
    
    console.error('☢️ NUCLEAR REMOVAL COMPLETE - ALL ROUTINES DESTROYED');
    
    // Verify destruction
    const verification1 = await AsyncStorage.getItem('@user_routines');
    const verification2 = await AsyncStorage.getItem('STORAGE_USER_ROUTINES');
    console.error('Verification @user_routines:', verification1);
    console.error('Verification STORAGE_USER_ROUTINES:', verification2);
    
    // Final check
    const remainingKeys = await AsyncStorage.getAllKeys();
    const remainingRoutineKeys = remainingKeys.filter(k => 
      k.toLowerCase().includes('routine') || k.includes('루틴')
    );
    
    if (remainingRoutineKeys.length > 0) {
      console.error('⚠️ WARNING: Some routine keys still exist:', remainingRoutineKeys);
    } else {
      console.error('✅ SUCCESS: No routine keys remain in storage');
    }
    
  } catch (error) {
    console.error('💀 NUCLEAR FAILURE:', error);
  }
}

// Also export a function that returns absolutely empty routines
export function getEmptyRoutines() {
  console.error('🚫 RETURNING EMPTY ROUTINES - FORCED');
  return [];
}