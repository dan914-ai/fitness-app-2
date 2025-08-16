import AsyncStorage from '@react-native-async-storage/async-storage';

// This function will be called IMMEDIATELY when the app starts
export async function forceClearAllRoutinesOnStartup() {
  console.error('🚨🚨🚨 FORCE CLEAR ON STARTUP 🚨🚨🚨');
  
  try {
    // Clear EVERYTHING related to routines
    const allKeys = await AsyncStorage.getAllKeys();
    console.error(`Found ${allKeys.length} keys in storage`);
    
    // Log all keys for debugging
    console.error('ALL KEYS:', allKeys);
    
    // Remove any key that could possibly contain routine data
    const keysToRemove = allKeys.filter(key => {
      const lower = key.toLowerCase();
      return (
        lower.includes('routine') ||
        lower.includes('루틴') ||
        key === '@user_routines' ||
        key === 'STORAGE_USER_ROUTINES' ||
        key === '1' ||
        key === '2' ||
        key === 'routine-1' ||
        key === 'routine-2'
      );
    });
    
    console.error(`Removing ${keysToRemove.length} routine keys:`, keysToRemove);
    
    // Remove all routine keys
    await AsyncStorage.multiRemove(keysToRemove);
    
    // Force set empty objects
    await AsyncStorage.setItem('@user_routines', '{}');
    await AsyncStorage.setItem('STORAGE_USER_ROUTINES', '{}');
    
    // Also try removing by direct IDs in case they're stored differently
    await AsyncStorage.removeItem('1');
    await AsyncStorage.removeItem('2');
    await AsyncStorage.removeItem('routine-1');
    await AsyncStorage.removeItem('routine-2');
    
    console.error('✅✅✅ FORCE CLEAR COMPLETE');
    
    // Log what's left
    const remainingKeys = await AsyncStorage.getAllKeys();
    const remainingRoutineKeys = remainingKeys.filter(k => 
      k.toLowerCase().includes('routine') || k.includes('루틴')
    );
    
    if (remainingRoutineKeys.length > 0) {
      console.error('⚠️ STILL FOUND:', remainingRoutineKeys);
      
      // Try to read and log their content
      for (const key of remainingRoutineKeys) {
        const value = await AsyncStorage.getItem(key);
        console.error(`Content of ${key}:`, value);
      }
    } else {
      console.error('✅ NO ROUTINE KEYS REMAIN');
    }
    
  } catch (error) {
    console.error('❌ FORCE CLEAR ERROR:', error);
  }
}

// Don't call immediately - will be called from App.tsx