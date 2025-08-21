import { Platform } from 'react-native';

/**
 * Platform-specific secure storage
 * Automatically uses the correct implementation based on platform
 * 
 * - Native (iOS/Android): Uses expo-secure-store (Keychain/Keystore)
 * - Web: Falls back to AsyncStorage with prefixed keys
 */

// Dynamically import the correct implementation based on platform
const secureStorage = Platform.select({
  web: () => require('./secureStorage.web').default,
  default: () => require('./secureStorage.native').default,
})!();

export default secureStorage;