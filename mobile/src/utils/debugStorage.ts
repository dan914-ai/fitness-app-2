import AsyncStorage from '@react-native-async-storage/async-storage';

export async function debugStorage() {
  console.error('🔍🔍🔍 DEBUGGING ASYNC STORAGE 🔍🔍🔍');
  
  try {
    // Get ALL keys
    const allKeys = await AsyncStorage.getAllKeys();
    console.error(`📦 Total keys in storage: ${allKeys.length}`);
    console.error('🔑 All keys:', allKeys);
    
    // Check specific routine-related keys
    const routineKeys = [
      '@user_routines',
      'STORAGE_USER_ROUTINES',
      '@routines_initialized',
    ];
    
    for (const key of routineKeys) {
      try {
        const value = await AsyncStorage.getItem(key);
        console.error(`\n📝 Key "${key}":`);
        if (value) {
          console.error('Value:', value);
          try {
            const parsed = JSON.parse(value);
            console.error('Parsed:', parsed);
            if (typeof parsed === 'object' && parsed !== null) {
              const keys = Object.keys(parsed);
              console.error(`Object has ${keys.length} keys:`, keys);
              if (keys.length > 0) {
                console.error('First item:', parsed[keys[0]]);
              }
            }
          } catch (e) {
            console.error('Could not parse as JSON');
          }
        } else {
          console.error('Value: null/undefined');
        }
      } catch (e) {
        console.error(`Error reading ${key}:`, e);
      }
    }
    
    // Check for any key with 'routine' in it
    const foundRoutineKeys = allKeys.filter(key => 
      key.toLowerCase().includes('routine') || 
      key.includes('루틴')
    );
    
    console.error('\n🔍 Keys containing "routine":', foundRoutineKeys);
    
    for (const key of foundRoutineKeys) {
      if (!routineKeys.includes(key)) {
        const value = await AsyncStorage.getItem(key);
        console.error(`\n📝 Additional routine key "${key}":`, value?.substring(0, 200));
      }
    }
    
  } catch (error) {
    console.error('❌ Error debugging storage:', error);
  }
  
  console.error('🔍🔍🔍 END STORAGE DEBUG 🔍🔍🔍');
}