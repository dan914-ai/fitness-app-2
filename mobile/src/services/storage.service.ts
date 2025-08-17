import AsyncStorage from '@react-native-async-storage/async-storage';
import { Routine } from './routines.service';
import { WorkoutHistoryItem } from '../utils/workoutHistory';
import { InBodyRecord } from '../utils/inbodyHistory';

// Storage keys centralized
export const STORAGE_KEYS = {
  USER_ROUTINES: '@user_routines',
  WORKOUT_HISTORY: '@workout_history',
  INBODY_HISTORY: '@inbody_history',
  FAVORITE_EXERCISES: '@favorite_exercises',
  USER_SETTINGS: '@user_settings',
  AUTH_TOKEN: '@auth_token',
  USER_PROFILE: '@user_profile',
  ANALYTICS_CACHE: '@analytics_cache',
} as const;

// Type definitions for stored data
export interface UserSettings {
  units: 'metric' | 'imperial';
  language: 'ko' | 'en';
  notifications: {
    workoutReminders: boolean;
    achievementAlerts: boolean;
    socialUpdates: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    workoutDataSharing: boolean;
  };
}

export interface UserProfile {
  userId: string;
  username: string;
  email?: string;
  height?: number;
  weight?: number;
  birthDate?: string;
  gender?: 'male' | 'female';
  fitnessGoals?: string[];
  profileImageUrl?: string;
}

// Storage service class
class StorageService {
  // Generic storage methods with type safety
  private async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      throw error;
    }
  }

  private async getItem<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : defaultValue;
    } catch (error) {
      console.error(`Error loading ${key}:`, error);
      return defaultValue;
    }
  }

  private async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      throw error;
    }
  }

  // User Routines
  async getUserRoutines(): Promise<Record<string, Routine>> {
    // FORCE RETURN EMPTY - No routines
    return {};
  }

  async saveUserRoutines(routines: Record<string, Routine>): Promise<void> {
    return this.setItem(STORAGE_KEYS.USER_ROUTINES, routines);
  }

  async addUserRoutine(routine: Routine): Promise<void> {
    const existingRoutines = await this.getUserRoutines();
    existingRoutines[routine.id] = routine;
    return this.saveUserRoutines(existingRoutines);
  }

  async deleteUserRoutine(routineId: string): Promise<void> {
    const existingRoutines = await this.getUserRoutines();
    delete existingRoutines[routineId];
    return this.saveUserRoutines(existingRoutines);
  }

  async updateUserRoutine(routine: Routine): Promise<void> {
    const existingRoutines = await this.getUserRoutines();
    existingRoutines[routine.id] = routine;
    return this.saveUserRoutines(existingRoutines);
  }

  // Workout History
  async getWorkoutHistory(): Promise<WorkoutHistoryItem[]> {
    return this.getItem(STORAGE_KEYS.WORKOUT_HISTORY, []);
  }

  async saveWorkoutHistory(history: WorkoutHistoryItem[]): Promise<void> {
    return this.setItem(STORAGE_KEYS.WORKOUT_HISTORY, history);
  }

  async addWorkoutToHistory(workout: WorkoutHistoryItem): Promise<void> {
    const existingHistory = await this.getWorkoutHistory();
    existingHistory.unshift(workout); // Add to beginning for most recent first
    return this.saveWorkoutHistory(existingHistory);
  }

  async deleteWorkoutFromHistory(workoutId: string): Promise<void> {
    const existingHistory = await this.getWorkoutHistory();
    const updatedHistory = existingHistory.filter(w => w.id !== workoutId);
    return this.saveWorkoutHistory(updatedHistory);
  }

  // InBody History
  async getInBodyHistory(): Promise<InBodyRecord[]> {
    return this.getItem(STORAGE_KEYS.INBODY_HISTORY, []);
  }

  async saveInBodyHistory(history: InBodyRecord[]): Promise<void> {
    return this.setItem(STORAGE_KEYS.INBODY_HISTORY, history);
  }

  async addInBodyRecord(record: InBodyRecord): Promise<void> {
    const existingHistory = await this.getInBodyHistory();
    // Add new record to the beginning of the array (most recent first)
    existingHistory.unshift(record);
    return this.saveInBodyHistory(existingHistory);
  }

  async updateInBodyRecord(record: InBodyRecord): Promise<void> {
    const existingHistory = await this.getInBodyHistory();
    const recordIndex = existingHistory.findIndex(r => r.id === record.id);
    if (recordIndex !== -1) {
      existingHistory[recordIndex] = record;
      return this.saveInBodyHistory(existingHistory);
    }
  }

  async deleteInBodyRecord(recordId: string): Promise<void> {
    const existingHistory = await this.getInBodyHistory();
    const updatedHistory = existingHistory.filter(r => r.id !== recordId);
    return this.saveInBodyHistory(updatedHistory);
  }

  // Favorite Exercises
  async getFavoriteExercises(): Promise<string[]> {
    return this.getItem(STORAGE_KEYS.FAVORITE_EXERCISES, []);
  }

  async saveFavoriteExercises(exerciseIds: string[]): Promise<void> {
    return this.setItem(STORAGE_KEYS.FAVORITE_EXERCISES, exerciseIds);
  }

  async addFavoriteExercise(exerciseId: string): Promise<void> {
    const favorites = await this.getFavoriteExercises();
    if (!favorites.includes(exerciseId)) {
      favorites.push(exerciseId);
      return this.saveFavoriteExercises(favorites);
    }
  }

  async removeFavoriteExercise(exerciseId: string): Promise<void> {
    const favorites = await this.getFavoriteExercises();
    const updatedFavorites = favorites.filter(id => id !== exerciseId);
    return this.saveFavoriteExercises(updatedFavorites);
  }

  // User Settings
  async getUserSettings(): Promise<UserSettings> {
    const defaultSettings: UserSettings = {
      units: 'metric',
      language: 'ko',
      notifications: {
        workoutReminders: true,
        achievementAlerts: true,
        socialUpdates: true,
      },
      privacy: {
        profileVisibility: 'public',
        workoutDataSharing: true,
      },
    };
    return this.getItem(STORAGE_KEYS.USER_SETTINGS, defaultSettings);
  }

  async saveUserSettings(settings: UserSettings): Promise<void> {
    return this.setItem(STORAGE_KEYS.USER_SETTINGS, settings);
  }

  async updateUserSetting<K extends keyof UserSettings>(
    key: K, 
    value: UserSettings[K]
  ): Promise<void> {
    const settings = await this.getUserSettings();
    settings[key] = value;
    return this.saveUserSettings(settings);
  }

  // User Profile
  async getUserProfile(): Promise<UserProfile | null> {
    return this.getItem(STORAGE_KEYS.USER_PROFILE, null);
  }

  async saveUserProfile(profile: UserProfile): Promise<void> {
    return this.setItem(STORAGE_KEYS.USER_PROFILE, profile);
  }

  async updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
    const existingProfile = await this.getUserProfile();
    if (existingProfile) {
      const updatedProfile = { ...existingProfile, ...updates };
      return this.saveUserProfile(updatedProfile);
    }
  }

  // Authentication
  async getAuthToken(): Promise<string | null> {
    return this.getItem(STORAGE_KEYS.AUTH_TOKEN, null);
  }

  async saveAuthToken(token: string): Promise<void> {
    return this.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  async removeAuthToken(): Promise<void> {
    return this.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  // Analytics Cache
  async getAnalyticsCache(cacheKey: string): Promise<any> {
    const cache = await this.getItem(STORAGE_KEYS.ANALYTICS_CACHE, {});
    return cache[cacheKey] || null;
  }

  async saveAnalyticsCache(cacheKey: string, data: any): Promise<void> {
    const cache = await this.getItem(STORAGE_KEYS.ANALYTICS_CACHE, {});
    cache[cacheKey] = {
      data,
      timestamp: Date.now(),
    };
    return this.setItem(STORAGE_KEYS.ANALYTICS_CACHE, cache);
  }

  async clearAnalyticsCache(): Promise<void> {
    return this.removeItem(STORAGE_KEYS.ANALYTICS_CACHE);
  }

  // Workout Rating
  async saveWorkoutRating(workoutId: string, rating: number): Promise<void> {
    try {
      const history = await this.getWorkoutHistory();
      const workoutIndex = history.findIndex(w => w.id === workoutId);
      if (workoutIndex !== -1) {
        history[workoutIndex].rating = rating;
        await this.setItem(STORAGE_KEYS.WORKOUT_HISTORY, history);
      }
    } catch (error) {
      console.error('Error saving workout rating:', error);
    }
  }

  // Workout Memo
  async saveWorkoutMemo(workoutId: string, memo: string): Promise<void> {
    try {
      console.log('[Storage] Attempting to save memo for workout:', workoutId);
      const history = await this.getWorkoutHistory();
      console.log('[Storage] Total workouts in history:', history.length);
      
      const workoutIndex = history.findIndex(w => w.id === workoutId);
      console.log('[Storage] Workout index found:', workoutIndex);
      
      if (workoutIndex !== -1) {
        history[workoutIndex].memo = memo;
        await this.setItem(STORAGE_KEYS.WORKOUT_HISTORY, history);
        console.log('[Storage] Memo saved successfully for workout:', workoutId);
        
        // Verify save
        const verifyHistory = await this.getWorkoutHistory();
        const verifyWorkout = verifyHistory[workoutIndex];
        console.log('[Storage] Verification - Memo saved:', verifyWorkout.memo);
      } else {
        console.error('[Storage] ERROR: Workout not found with ID:', workoutId);
        console.log('[Storage] Available workout IDs:', history.map(w => w.id));
      }
    } catch (error) {
      console.error('[Storage] Error saving workout memo:', error);
    }
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    const keys = Object.values(STORAGE_KEYS);
    await Promise.all(keys.map(key => this.removeItem(key)));
  }

  // Public method for generic key-value storage
  async setGenericItem(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      throw error;
    }
  }

  // Public method for generic key-value retrieval
  async getGenericItem(key: string, defaultValue: any = null): Promise<any> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : defaultValue;
    } catch (error) {
      console.error(`Error loading ${key}:`, error);
      return defaultValue;
    }
  }

  async getStorageInfo(): Promise<{ [key: string]: number }> {
    const info: { [key: string]: number } = {};
    const keys = Object.values(STORAGE_KEYS);
    
    for (const key of keys) {
      try {
        const value = await AsyncStorage.getItem(key);
        info[key] = value ? JSON.stringify(value).length : 0;
      } catch (error) {
        info[key] = 0;
      }
    }
    
    return info;
  }
}

// Export singleton instance
export const storageService = new StorageService();
export default storageService;