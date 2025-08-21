import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Web implementation of secure storage
 * Uses AsyncStorage with prefixed keys (not truly secure on web)
 */
class SecureStorageWeb {
  private readonly isSecureAvailable = false;

  async setItem(key: string, value: string): Promise<void> {
    if (__DEV__) {
    }
    await AsyncStorage.setItem(`secure_${key}`, value);
  }

  async getItem(key: string): Promise<string | null> {
    return await AsyncStorage.getItem(`secure_${key}`);
  }

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(`secure_${key}`);
  }

  isSecure(): boolean {
    return false;
  }

  async migrateTokens(): Promise<void> {
    // No migration needed on web
    return;
  }
}

export default new SecureStorageWeb();