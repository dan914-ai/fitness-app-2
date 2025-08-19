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
      
      // Special logging for workout history
      if (key === STORAGE_KEYS.WORKOUT_HISTORY) {
        const workouts = value as any[];
        if (workouts.length > 0) {
        }
      }
      
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      throw error;
    }
  }

  private async getItem<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      
      if (jsonValue) {
        try {
          const parsedValue = JSON.parse(jsonValue);
          
          // Special logging for workout history
          if (key === STORAGE_KEYS.WORKOUT_HISTORY) {
            if (Array.isArray(parsedValue)) {
              if (parsedValue.length > 0) {
              }
            } else {
              console.error(`[Storage.getItem] WARNING: Workout history is not an array!`, typeof parsedValue);
            }
          }
          
          return parsedValue;
        } catch (parseError) {
          console.error(`[Storage.getItem] JSON parse error for ${key}:`, parseError);
          console.error(`[Storage.getItem] Raw value (first 200 chars):`, jsonValue.substring(0, 200));
          return defaultValue;
        }
      } else {
        return defaultValue;
      }
    } catch (error) {
      console.error(`[Storage.getItem] Error loading ${key}:`, error);
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
    try {
      // DEBUG: Log all localStorage keys
      if (typeof window !== 'undefined' && window.localStorage) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.includes('WORKOUT')) {
          }
        }
      }
      
      const history = await this.getItem(STORAGE_KEYS.WORKOUT_HISTORY, []);
      
      // Validate that we have an array
      if (!Array.isArray(history)) {
        console.warn('[Storage] Retrieved history is not an array, returning empty array');
        return [];
      }
      
        count: history.length,
        firstWorkout: history[0]?.routineName || 'none',
        firstWorkoutDate: history[0]?.date || 'none',
        lastWorkout: history[history.length - 1]?.routineName || 'none',
        lastWorkoutDate: history[history.length - 1]?.date || 'none',
      });
      
      // Additional validation - filter out any invalid entries
      const validHistory = history.filter(workout => 
        workout && 
        typeof workout === 'object' && 
        workout.id && 
        workout.routineName
      );
      
      if (validHistory.length !== history.length) {
        console.warn(`[Storage] Filtered out ${history.length - validHistory.length} invalid workout entries`);
      }
      
      return validHistory;
    } catch (error) {
      console.error('[Storage] Error getting workout history:', error);
      return [];
    }
  }

  async saveWorkoutHistory(history: WorkoutHistoryItem[]): Promise<void> {
    if (history.length > 0) {
    }
    
    await this.setItem(STORAGE_KEYS.WORKOUT_HISTORY, history);
    
    // DEBUG: Immediately verify what was saved
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedData = localStorage.getItem(STORAGE_KEYS.WORKOUT_HISTORY);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
        } catch (e) {
          console.error('[Storage DEBUG] Failed to parse saved data:', e);
        }
      }
    }
  }

  async addWorkoutToHistory(workout: WorkoutHistoryItem): Promise<void> {
    try {
      // Get existing history with extra validation
      let existingHistory = await this.getWorkoutHistory();
      
      // Ensure we have a valid array
      if (!Array.isArray(existingHistory)) {
        console.warn('[Storage] Existing history is not an array, initializing as empty array');
        existingHistory = [];
      }
      
        newWorkoutId: workout.id,
        existingCount: existingHistory.length,
        newWorkoutName: workout.routineName,
      });
      
      // Check for duplicate ID (shouldn't happen but let's be safe)
      const duplicateIndex = existingHistory.findIndex(w => w.id === workout.id);
      if (duplicateIndex !== -1) {
        console.warn('[Storage] Duplicate workout ID found, replacing existing:', workout.id);
        existingHistory[duplicateIndex] = workout;
      } else {
        // Add to beginning for most recent first
        existingHistory.unshift(workout);
      }
      
      
      // Save with validation
      await this.saveWorkoutHistory(existingHistory);
      
      // Add a small delay to ensure AsyncStorage has persisted (web environment issue)
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify the save was successful
      const verifyHistory = await this.getWorkoutHistory();
        expectedCount: existingHistory.length,
        actualCount: verifyHistory.length,
        workoutFound: verifyHistory.some(w => w.id === workout.id)
      });
      
    } catch (error) {
      console.error('[Storage] Error in addWorkoutToHistory:', error);
      throw error;
    }
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
      const history = await this.getWorkoutHistory();
      
      const workoutIndex = history.findIndex(w => w.id === workoutId);
      
      if (workoutIndex !== -1) {
        history[workoutIndex].memo = memo;
        await this.setItem(STORAGE_KEYS.WORKOUT_HISTORY, history);
        
        // Verify save
        const verifyHistory = await this.getWorkoutHistory();
        const verifyWorkout = verifyHistory[workoutIndex];
      } else {
        console.error('[Storage] ERROR: Workout not found with ID:', workoutId);
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