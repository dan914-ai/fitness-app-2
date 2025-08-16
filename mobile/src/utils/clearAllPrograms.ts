import AsyncStorage from '@react-native-async-storage/async-storage';

export async function clearAllPrograms() {
  console.error('🧹 CLEARING ALL PROGRAM DATA...');
  
  const keysToRemove = [
    '@workout_programs',
    '@active_program',
    '@program_progress',
    '@program_history',
    'PROGRAMS_STORAGE_KEY',
    'ACTIVE_PROGRAM_KEY',
  ];
  
  for (const key of keysToRemove) {
    try {
      await AsyncStorage.removeItem(key);
      console.error(`✅ Removed: ${key}`);
    } catch (e) {
      console.error(`⚠️ Could not remove ${key}:`, e);
    }
  }
  
  // Also scan for any key containing 'program'
  const allKeys = await AsyncStorage.getAllKeys();
  const programKeys = allKeys.filter(key => 
    key.toLowerCase().includes('program')
  );
  
  for (const key of programKeys) {
    try {
      await AsyncStorage.removeItem(key);
      console.error(`✅ Removed program key: ${key}`);
    } catch (e) {
      console.error(`⚠️ Could not remove ${key}:`, e);
    }
  }
  
  console.error('🎉 ALL PROGRAM DATA CLEARED!');
}