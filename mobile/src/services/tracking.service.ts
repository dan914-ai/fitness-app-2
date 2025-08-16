import AsyncStorage from '@react-native-async-storage/async-storage';
import { safeJsonParse, safeJsonStringify } from '../utils/safeJsonParse';

export interface WaterLogData {
  amount: number;
  logDate: string;
}

export interface SleepLogData {
  logDate: string;
  bedTime: string;
  wakeTime: string;
  duration: number;
  quality: number;
  notes?: string;
}

export interface NutritionLogData {
  logDate: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface HabitLogData {
  logDate: string;
  habitName: string;
  completed: boolean;
  notes?: string;
}

export interface RecoveryLogData {
  logDate: string;
  recoveryType: 'doms' | 'soreness' | 'fatigue' | 'stress';
  intensity: number; // 1-10
  location?: string;
  notes?: string;
}

export interface CardioLogData {
  logDate: string;
  exerciseType: string;
  duration: number; // minutes
  distance?: number;
  calories?: number;
  heartRate?: number;
}

class TrackingService {
  private async getUserId(): Promise<string> {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = safeJsonParse(userData, { id: 'local-user' });
        return user.id || 'local-user';
      }
    } catch (error) {
      console.error('Error getting user ID:', error);
    }
    return 'local-user';
  }

  // Water tracking - using local storage
  async logWater(data: WaterLogData) {
    console.log('Logging water intake locally:', data);
    const key = `@water_log_${data.logDate}`;
    const existing = await AsyncStorage.getItem(key);
    let logs = safeJsonParse(existing, []);
    logs.push(data);
    await AsyncStorage.setItem(key, safeJsonStringify(logs));
    return data;
  }

  async getWaterLogs(startDate?: string, endDate?: string) {
    console.log('Getting water logs locally for:', startDate, 'to', endDate);
    const logs = [];
    try {
      const today = new Date().toISOString().split('T')[0];
      const key = `@water_log_${today}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        const parsedData = safeJsonParse(data, []);
        if (Array.isArray(parsedData)) {
          logs.push(...parsedData);
        }
      }
    } catch (error) {
      console.error('Error getting water logs:', error);
    }
    return logs;
  }

  // Sleep tracking - using local storage
  async logSleep(data: SleepLogData) {
    console.log('Logging sleep locally:', data);
    const key = `@sleep_log_${data.logDate}`;
    await AsyncStorage.setItem(key, safeJsonStringify(data));
    return data;
  }

  async getSleepLogs(startDate?: string, endDate?: string) {
    console.log('Getting sleep logs locally for:', startDate, 'to', endDate);
    const logs = [];
    try {
      const today = new Date().toISOString().split('T')[0];
      const key = `@sleep_log_${today}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        const parsedData = safeJsonParse(data, null);
        if (parsedData) {
          logs.push(parsedData);
        }
      }
    } catch (error) {
      console.error('Error getting sleep logs:', error);
    }
    return logs;
  }

  // Habit tracking - using local storage
  async logHabit(data: HabitLogData) {
    console.log('Logging habit locally:', data);
    const key = `@habit_log_${data.logDate}`;
    const existing = await AsyncStorage.getItem(key);
    let logs = safeJsonParse(existing, []);
    logs.push(data);
    await AsyncStorage.setItem(key, safeJsonStringify(logs));
    return data;
  }

  async getHabitLogs(startDate?: string, endDate?: string, habitName?: string) {
    console.log('Getting habit logs locally for:', startDate, 'to', endDate, habitName);
    const logs = [];
    try {
      const today = new Date().toISOString().split('T')[0];
      const key = `@habit_log_${today}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        const parsedData = safeJsonParse(data, []);
        if (Array.isArray(parsedData)) {
          logs.push(...parsedData);
        }
      }
    } catch (error) {
      console.error('Error getting habit logs:', error);
    }
    return logs;
  }

  // Nutrition tracking - using local storage
  async logNutrition(data: NutritionLogData) {
    console.log('Logging nutrition locally:', data);
    const key = `@nutrition_log_${data.logDate}`;
    const existing = await AsyncStorage.getItem(key);
    let logs = safeJsonParse(existing, []);
    logs.push(data);
    await AsyncStorage.setItem(key, safeJsonStringify(logs));
    return data;
  }

  async getNutritionLogs(startDate?: string, endDate?: string, mealType?: string) {
    console.log('Getting nutrition logs locally for:', startDate, 'to', endDate, mealType);
    const logs = [];
    try {
      const today = new Date().toISOString().split('T')[0];
      const key = `@nutrition_log_${today}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        const parsedData = safeJsonParse(data, []);
        if (Array.isArray(parsedData)) {
          logs.push(...parsedData);
        }
      }
    } catch (error) {
      console.error('Error getting nutrition logs:', error);
    }
    return logs;
  }

  // Recovery tracking - using local storage
  async logRecovery(data: RecoveryLogData) {
    console.log('Logging recovery locally:', data);
    const key = `@recovery_log_${data.logDate}`;
    const existing = await AsyncStorage.getItem(key);
    let logs = safeJsonParse(existing, []);
    logs.push(data);
    await AsyncStorage.setItem(key, safeJsonStringify(logs));
    return data;
  }

  async getRecoveryLogs(startDate?: string, endDate?: string, recoveryType?: string) {
    console.log('Getting recovery logs locally for:', startDate, 'to', endDate, recoveryType);
    const logs = [];
    try {
      const today = new Date().toISOString().split('T')[0];
      const key = `@recovery_log_${today}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        const parsedData = safeJsonParse(data, []);
        if (Array.isArray(parsedData)) {
          logs.push(...parsedData);
        }
      }
    } catch (error) {
      console.error('Error getting recovery logs:', error);
    }
    return logs;
  }

  // Cardio tracking - using local storage
  async logCardio(data: CardioLogData) {
    console.log('Logging cardio locally:', data);
    const key = `@cardio_log_${data.logDate}`;
    const existing = await AsyncStorage.getItem(key);
    let logs = safeJsonParse(existing, []);
    logs.push(data);
    await AsyncStorage.setItem(key, safeJsonStringify(logs));
    return data;
  }

  async getCardioLogs(startDate?: string, endDate?: string, exerciseType?: string) {
    console.log('Getting cardio logs locally for:', startDate, 'to', endDate, exerciseType);
    const logs = [];
    try {
      const today = new Date().toISOString().split('T')[0];
      const key = `@cardio_log_${today}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        const parsedData = safeJsonParse(data, []);
        if (Array.isArray(parsedData)) {
          logs.push(...parsedData);
        }
      }
    } catch (error) {
      console.error('Error getting cardio logs:', error);
    }
    return logs;
  }
}

const trackingService = new TrackingService();
export default trackingService;