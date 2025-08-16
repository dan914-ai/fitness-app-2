import AsyncStorage from '@react-native-async-storage/async-storage';
import { safeJsonParse, safeJsonStringify } from '../utils/safeJsonParse';

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  date: string;
  totalVolume: number;
  oneRM: number; // Estimated 1RM using Brzycki formula
}

export interface PRUpdate {
  exerciseId: string;
  exerciseName: string;
  newRecord: {
    weight: number;
    reps: number;
    totalVolume: number;
    oneRM: number;
  };
  previousRecord?: {
    weight: number;
    reps: number;
    totalVolume: number;
    oneRM: number;
  };
  improvement?: {
    weight: number;
    percentage: number;
  };
}

class PersonalRecordsService {
  private readonly STORAGE_KEY = '@personal_records';
  private records: Map<string, PersonalRecord> = new Map();
  private initialized = false;

  async initialize() {
    if (this.initialized) return;
    
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const recordsArray = safeJsonParse(stored, {}) as PersonalRecord[];
        recordsArray.forEach(record => {
          this.records.set(record.exerciseId, record);
        });
      }
      this.initialized = true;
    } catch (error) {
      console.error('Error loading personal records:', error);
    }
  }

  // Calculate 1RM using Brzycki formula
  calculateOneRM(weight: number, reps: number): number {
    if (reps === 1) return weight;
    if (reps >= 37) return weight; // Formula breaks down at high reps
    return weight * (36 / (37 - reps));
  }

  // Check if a new set is a personal record
  async checkForPR(
    exerciseId: string,
    exerciseName: string,
    weight: number,
    reps: number
  ): Promise<PRUpdate | null> {
    await this.initialize();

    const totalVolume = weight * reps;
    const oneRM = this.calculateOneRM(weight, reps);
    const currentRecord = this.records.get(exerciseId);

    // Check if this is a new PR
    let isNewPR = false;
    let improvement = { weight: 0, percentage: 0 };

    if (!currentRecord) {
      // First time doing this exercise
      isNewPR = true;
    } else {
      // Check if we beat the previous 1RM
      if (oneRM > currentRecord.oneRM) {
        isNewPR = true;
        improvement.weight = oneRM - currentRecord.oneRM;
        improvement.percentage = ((oneRM - currentRecord.oneRM) / currentRecord.oneRM) * 100;
      }
      // Also check for direct weight PR at same or higher reps
      else if (weight > currentRecord.weight && reps >= currentRecord.reps) {
        isNewPR = true;
        improvement.weight = weight - currentRecord.weight;
        improvement.percentage = ((weight - currentRecord.weight) / currentRecord.weight) * 100;
      }
    }

    if (isNewPR) {
      // Save the new record
      const newRecord: PersonalRecord = {
        exerciseId,
        exerciseName,
        weight,
        reps,
        date: new Date().toISOString(),
        totalVolume,
        oneRM,
      };

      this.records.set(exerciseId, newRecord);
      await this.saveRecords();

      return {
        exerciseId,
        exerciseName,
        newRecord: {
          weight,
          reps,
          totalVolume,
          oneRM,
        },
        previousRecord: currentRecord ? {
          weight: currentRecord.weight,
          reps: currentRecord.reps,
          totalVolume: currentRecord.totalVolume,
          oneRM: currentRecord.oneRM,
        } : undefined,
        improvement: currentRecord ? improvement : undefined,
      };
    }

    return null;
  }

  // Get PR for a specific exercise
  async getExercisePR(exerciseId: string): Promise<PersonalRecord | null> {
    await this.initialize();
    return this.records.get(exerciseId) || null;
  }

  // Get all PRs
  async getAllPRs(): Promise<PersonalRecord[]> {
    await this.initialize();
    return Array.from(this.records.values());
  }

  // Get recent PRs (last 30 days)
  async getRecentPRs(days: number = 30): Promise<PersonalRecord[]> {
    await this.initialize();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return Array.from(this.records.values()).filter(
      record => new Date(record.date) >= cutoffDate
    );
  }

  // Delete a PR (for testing or reset)
  async deletePR(exerciseId: string): Promise<void> {
    await this.initialize();
    this.records.delete(exerciseId);
    await this.saveRecords();
  }

  // Clear all PRs
  async clearAllPRs(): Promise<void> {
    this.records.clear();
    await AsyncStorage.removeItem(this.STORAGE_KEY);
  }

  // Save records to storage
  private async saveRecords(): Promise<void> {
    try {
      const recordsArray = Array.from(this.records.values());
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(recordsArray));
    } catch (error) {
      console.error('Error saving personal records:', error);
    }
  }

  // Get motivation message based on proximity to PR
  getMotivationMessage(currentWeight: number, exerciseId: string): string | null {
    const pr = this.records.get(exerciseId);
    if (!pr) return null;

    const difference = pr.weight - currentWeight;
    
    if (difference <= 0) {
      return '🔥 새로운 개인 기록 도전!';
    } else if (difference <= 2.5) {
      return `💪 PR까지 ${difference}kg! 할 수 있어요!`;
    } else if (difference <= 5) {
      return `📈 PR까지 ${difference}kg 남았습니다`;
    }
    
    return null;
  }

  // Get PR statistics
  async getPRStats() {
    await this.initialize();
    
    const allPRs = Array.from(this.records.values());
    const recentPRs = await this.getRecentPRs(30);
    const thisWeekPRs = await this.getRecentPRs(7);
    
    return {
      totalPRs: allPRs.length,
      recentPRs: recentPRs.length,
      thisWeekPRs: thisWeekPRs.length,
      strongestLift: allPRs.reduce((max, pr) => 
        pr.oneRM > (max?.oneRM || 0) ? pr : max, 
        allPRs[0]
      ),
      mostImprovedThisMonth: this.getMostImproved(30),
    };
  }

  // Get most improved exercise in a time period
  private getMostImproved(days: number) {
    // This would require storing PR history, not just current PRs
    // For now, return null
    return null;
  }
}

export default new PersonalRecordsService();