import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@app_settings';

export interface AppSettings {
  // Workout settings
  workoutTimerEnabled: boolean;
  restTimerEnabled: boolean;
  autoStartRestTimer: boolean;
  defaultRestTime: number;
  
  // Unit settings
  weightUnit: 'kg' | 'lbs';
  distanceUnit: 'km' | 'miles';
  
  // Notification settings
  workoutReminders: boolean;
  socialNotifications: boolean;
  
  // Display settings
  language: 'ko' | 'en';
  theme: 'light' | 'dark' | 'system';
}

const DEFAULT_SETTINGS: AppSettings = {
  // Workout settings
  workoutTimerEnabled: true,
  restTimerEnabled: true,
  autoStartRestTimer: true,
  defaultRestTime: 60,
  
  // Unit settings
  weightUnit: 'kg',
  distanceUnit: 'km',
  
  // Notification settings
  workoutReminders: true,
  socialNotifications: true,
  
  // Display settings
  language: 'ko',
  theme: 'system',
};

class SettingsService {
  private settings: AppSettings = DEFAULT_SETTINGS;
  private listeners: Set<(settings: AppSettings) => void> = new Set();

  async loadSettings(): Promise<AppSettings> {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    return this.settings;
  }

  async saveSettings(updates: Partial<AppSettings>): Promise<void> {
    try {
      this.settings = { ...this.settings, ...updates };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }

  getSettings(): AppSettings {
    return this.settings;
  }

  async getSetting<K extends keyof AppSettings>(key: K): Promise<AppSettings[K]> {
    if (!this.settings) {
      await this.loadSettings();
    }
    return this.settings[key];
  }

  async setSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<void> {
    await this.saveSettings({ [key]: value });
  }

  subscribe(listener: (settings: AppSettings) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.settings));
  }

  async resetSettings(): Promise<void> {
    this.settings = DEFAULT_SETTINGS;
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    this.notifyListeners();
  }
}

export const settingsService = new SettingsService();