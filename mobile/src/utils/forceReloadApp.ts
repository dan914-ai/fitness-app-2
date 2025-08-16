import { Platform } from 'react-native';

export async function forceReloadApp() {
  console.log('Forcing app reload...');
  
  if (Platform.OS === 'web') {
    // For web, reload the page
    window.location.reload();
  } else {
    // For mobile, we can't reload programmatically without expo-updates
    // Just log a message asking user to restart
    console.log('Please restart the app manually to apply changes');
    console.log('You can shake the device and select "Reload" from the developer menu');
  }
}