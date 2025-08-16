import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './storage.service';
import { exerciseDatabaseService } from './exerciseDatabase.service';
import { safeJsonParse, safeJsonStringify } from '../utils/safeJsonParse';

export interface RoutineExercise {
  id: string;
  name: string;
  targetMuscles: string[];
  sets: number;
  reps: string;
  weight?: string;
  restTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  gifUrl?: string;
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  targetMuscles: string[];
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exercises: RoutineExercise[];
  isCustom?: boolean;
  createdAt?: string;
  lastUsed?: string;
  programId?: string; // Link to workout program
  dayNumber?: number; // Day number in the program
}

// Default starter routines for new users - Empty array, no default routines
const DEFAULT_ROUTINES: Routine[] = [];

class RoutinesService {
  private readonly ROUTINES_KEY = STORAGE_KEYS.USER_ROUTINES;
  private readonly INITIALIZED_KEY = '@routines_initialized';

  async initializeDefaultRoutines(): Promise<void> {
    try {
      // Check if routines have been initialized
      const initialized = await AsyncStorage.getItem(this.INITIALIZED_KEY);
      if (initialized) {
        console.log('Routines already initialized');
        return;
      }

      // No default routines - just mark as initialized
      await AsyncStorage.setItem(this.INITIALIZED_KEY, 'true');
      await this.saveRoutines([]);
      console.log('Routines initialized (no defaults)');
    } catch (error) {
      console.error('Error initializing routines:', error);
    }
  }

  async getAllRoutines(): Promise<Routine[]> {
    try {
      const routinesJson = await AsyncStorage.getItem(this.ROUTINES_KEY);
      if (!routinesJson) {
        console.log('No routines found in storage');
        return [];
      }
      
      const routines = safeJsonParse(routinesJson, []);
      console.log(`Loaded ${routines.length} routines from storage`);
      return Array.isArray(routines) ? routines : [];
    } catch (error) {
      console.error('Error loading routines:', error);
      return [];
    }
  }

  async getRoutineById(id: string): Promise<Routine | null> {
    try {
      const routines = await this.getAllRoutines();
      return routines.find(r => r.id === id) || null;
    } catch (error) {
      console.error('Error getting routine by ID:', error);
      return null;
    }
  }

  async saveRoutine(routine: Routine): Promise<void> {
    try {
      const routines = await this.getAllRoutines();
      const existingIndex = routines.findIndex(r => r.id === routine.id);

      if (existingIndex >= 0) {
        // Update existing routine
        routines[existingIndex] = {
          ...routine,
          lastUsed: new Date().toISOString(),
        };
      } else {
        // Add new routine
        routines.push({
          ...routine,
          createdAt: routine.createdAt || new Date().toISOString(),
          isCustom: true,
        });
      }

      await this.saveRoutines(routines);
    } catch (error) {
      console.error('Error saving routine:', error);
      throw error;
    }
  }

  async deleteRoutine(id: string): Promise<void> {
    try {
      console.log('🔴 FORCE DELETE ROUTINE:', id);
      
      // Get routines directly from storage, not from getAllRoutines
      const routinesJson = await AsyncStorage.getItem(this.ROUTINES_KEY);
      const routines = routinesJson ? safeJsonParse(routinesJson, []) : [];
      
      console.log('🔴 Current routines in storage:', routines.length);
      
      const filtered = routines.filter((r: any) => r.id !== id);
      
      console.log('🔴 After filtering:', filtered.length);
      
      // Save the filtered routines
      await AsyncStorage.setItem(this.ROUTINES_KEY, JSON.stringify(filtered));
      
      console.log('🔴 ROUTINE DELETED SUCCESSFULLY');
    } catch (error) {
      console.error('Error deleting routine:', error);
      throw error;
    }
  }

  async updateRoutineLastUsed(id: string): Promise<void> {
    try {
      const routines = await this.getAllRoutines();
      const routine = routines.find(r => r.id === id);
      if (routine) {
        routine.lastUsed = new Date().toISOString();
        await this.saveRoutines(routines);
      }
    } catch (error) {
      console.error('Error updating routine last used:', error);
    }
  }

  async duplicateRoutine(id: string, newName: string): Promise<Routine | null> {
    try {
      const routine = await this.getRoutineById(id);
      if (!routine) return null;

      const newRoutine: Routine = {
        ...routine,
        id: `routine-${Date.now()}`,
        name: newName,
        isCustom: true,
        createdAt: new Date().toISOString(),
        lastUsed: undefined,
      };

      await this.saveRoutine(newRoutine);
      return newRoutine;
    } catch (error) {
      console.error('Error duplicating routine:', error);
      return null;
    }
  }

  private async saveRoutines(routines: Routine[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.ROUTINES_KEY, JSON.stringify(routines));
    } catch (error) {
      console.error('Error saving routines to storage:', error);
      throw error;
    }
  }

  // Migration method to convert old format to new format
  async migrateFromOldFormat(): Promise<void> {
    try {
      const oldRoutinesJson = await AsyncStorage.getItem(this.ROUTINES_KEY);
      if (!oldRoutinesJson) return;

      const oldRoutines = safeJsonParse(oldRoutinesJson, {});
      
      // Check if migration is needed (old format has routines as object instead of array)
      if (!Array.isArray(oldRoutines) && typeof oldRoutines === 'object') {
        const migratedRoutines: Routine[] = Object.values(oldRoutines).map((routine: any) => ({
          ...routine,
          isCustom: routine.isCustom ?? false,
          createdAt: routine.createdAt || new Date().toISOString(),
        }));

        await this.saveRoutines(migratedRoutines);
        console.log('Successfully migrated routines to new format');
      }
    } catch (error) {
      console.error('Error migrating routines:', error);
    }
  }

  // Force reset to default routines with updated exercise IDs
  async resetToDefaults(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.INITIALIZED_KEY);
      await AsyncStorage.removeItem(this.ROUTINES_KEY);
      await this.initializeDefaultRoutines();
      console.log('Routines reset to defaults with updated exercise IDs');
    } catch (error) {
      console.error('Error resetting routines:', error);
    }
  }

  // Clear all routines
  async clearAllRoutines(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.INITIALIZED_KEY);
      await AsyncStorage.removeItem(this.ROUTINES_KEY);
      console.log('All routines cleared');
    } catch (error) {
      console.error('Error clearing routines:', error);
    }
  }
}

export const routinesService = new RoutinesService();