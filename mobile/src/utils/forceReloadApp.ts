import { Platform } from 'react-native';

export async function forceReloadApp() {
  
  if (Platform.OS === 'web') {
    // For web, reload the page
    window.location.reload();
  } else {
    // For mobile, we can't reload programmatically without expo-updates
    // Just log a message asking user to restart
  }
}