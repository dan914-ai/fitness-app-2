import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Native implementation of secure storage
 * Uses expo-secure-store for iOS/Android
 */
class SecureStorageNative {
  private readonly isSecureAvailable = true;

  async setItem(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  }

  async getItem(key: string): Promise<string | null> {
    return await SecureStore.getItemAsync(key);
  }

  async removeItem(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  }

  isSecure(): boolean {
    return true;
  }

  async migrateTokens(): Promise<void> {
    try {
      // List of sensitive keys to migrate
      const sensitiveKeys = [
        'authToken',
        'refreshToken',
        'supabase.auth.token',
        'userToken',
        'apiKey'
      ];

      for (const key of sensitiveKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          // Move to secure storage
          await this.setItem(key, value);
          // Remove from AsyncStorage
          await AsyncStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Failed to migrate tokens to secure storage:', error);
    }
  }
}

export default new SecureStorageNative();