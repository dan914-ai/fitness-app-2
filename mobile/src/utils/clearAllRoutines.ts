import AsyncStorage from '@react-native-async-storage/async-storage';

export async function clearAllRoutines() {
  console.log('🧹 CLEARING ALL ROUTINE DATA...');
  console.error('🚨🚨🚨 FORCE CLEARING ALL ROUTINES - THIS MUST WORK!');
  
  // FIRST: Clear the initialization flag to prevent any re-initialization
  try {
    await AsyncStorage.removeItem('@routines_initialized');
    console.log('✅ Removed initialization flag FIRST');
  } catch (e) {
    console.error('Failed to remove init flag:', e);
  }
  
  const keysToRemove = [
    '@user_routines',
    '@routines_initialized',
    '@routines_cleared_v2',
    '@routines_cleared',
    'routine-1',
    'routine-2',
    'routine-upper',
    'routine-lower',
    'default-upper-body',
    'default-lower-body',
    '상체 루틴',
    '하체 루틴',
    'STORAGE_USER_ROUTINES',
  ];
  
  for (const key of keysToRemove) {
    try {
      await AsyncStorage.removeItem(key);
      console.log(`✅ Removed: ${key}`);
    } catch (e) {
      console.log(`⚠️ Could not remove ${key}:`, e);
    }
  }
  
  // Scan ALL keys and remove anything with 'routine' in it
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    console.log(`📦 Total keys in storage: ${allKeys.length}`);
    
    const routineKeys = allKeys.filter(key => 
      key.toLowerCase().includes('routine') || 
      key.includes('루틴') ||
      key === 'STORAGE_USER_ROUTINES'
    );
    
    console.log(`🔍 Found ${routineKeys.length} routine-related keys:`, routineKeys);
    
    for (const key of routineKeys) {
      try {
        const value = await AsyncStorage.getItem(key);
        console.log(`📝 Key "${key}" contains:`, value?.substring(0, 100));
        await AsyncStorage.removeItem(key);
        console.log(`✅ Removed routine key: ${key}`);
      } catch (e) {
        console.log(`⚠️ Could not remove ${key}:`, e);
      }
    }
  } catch (e) {
    console.error('Error scanning all keys:', e);
  }
  
  // FORCE SET the user routines to empty
  try {
    await AsyncStorage.setItem('@user_routines', JSON.stringify({}));
    await AsyncStorage.setItem('STORAGE_USER_ROUTINES', JSON.stringify({}));
    console.log('✅ FORCED @user_routines and STORAGE_USER_ROUTINES to empty object');
  } catch (e) {
    console.error('Error forcing empty routines:', e);
  }
  
  // Final verification
  try {
    const verification = await AsyncStorage.getItem('@user_routines');
    const verification2 = await AsyncStorage.getItem('STORAGE_USER_ROUTINES');
    console.log('🔍 Final verification @user_routines:', verification);
    console.log('🔍 Final verification STORAGE_USER_ROUTINES:', verification2);
  } catch (e) {
    console.error('Verification failed:', e);
  }
  
  console.log('🎉 ALL ROUTINE DATA CLEARED!');
  console.error('✅✅✅ ROUTINES FORCEFULLY REMOVED FROM SYSTEM!');
}