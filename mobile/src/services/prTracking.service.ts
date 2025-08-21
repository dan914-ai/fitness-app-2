import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PRRecord {
  date: string;
  weight: number;
  reps: number;
  oneRM: number; // Calculated 1RM using Epley formula
  volume: number;
  exerciseId: string;
  exerciseName: string;
}

export interface ExercisePRHistory {
  exerciseId: string;
  exerciseName: string;
  records: PRRecord[];
  maxWeight: number;
  max1RM: number;
  maxVolume: number;
  lastUpdated: string;
}

class PRTrackingService {
  private readonly PR_STORAGE_KEY = 'exercise_pr_history';

  // Calculate 1RM using Epley formula: weight × (1 + reps/30)
  calculate1RM(weight: number, reps: number): number {
    if (reps === 1) return weight;
    return Math.round(weight * (1 + reps / 30) * 10) / 10;
  }

  // Save or update PR record for an exercise
  async savePRRecord(
    exerciseId: string,
    exerciseName: string,
    weight: number,
    reps: number,
    date: string = new Date().toISOString()
  ): Promise<void> {
    try {
      const allPRs = await this.getAllPRHistory();
      
      let exercisePR = allPRs.find(pr => pr.exerciseId === exerciseId);
      
      if (!exercisePR) {
        exercisePR = {
          exerciseId,
          exerciseName,
          records: [],
          maxWeight: 0,
          max1RM: 0,
          maxVolume: 0,
          lastUpdated: date,
        };
        allPRs.push(exercisePR);
      }

      const oneRM = this.calculate1RM(weight, reps);
      const volume = weight * reps;

      // Add new record
      const newRecord: PRRecord = {
        date,
        weight,
        reps,
        oneRM,
        volume,
        exerciseId,
        exerciseName,
      };

      exercisePR.records.push(newRecord);

      // Update max values
      exercisePR.maxWeight = Math.max(exercisePR.maxWeight, weight);
      exercisePR.max1RM = Math.max(exercisePR.max1RM, oneRM);
      exercisePR.maxVolume = Math.max(exercisePR.maxVolume, volume);
      exercisePR.lastUpdated = date;

      // Sort records by date
      exercisePR.records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      await AsyncStorage.setItem(this.PR_STORAGE_KEY, JSON.stringify(allPRs));
    } catch (error) {
      console.error('Error saving PR record:', error);
      throw error;
    }
  }

  // Get PR history for a specific exercise
  async getExercisePRHistory(exerciseId: string): Promise<ExercisePRHistory | null> {
    try {
      const allPRs = await this.getAllPRHistory();
      return allPRs.find(pr => pr.exerciseId === exerciseId) || null;
    } catch (error) {
      console.error('Error getting exercise PR history:', error);
      return null;
    }
  }

  // Get all PR history
  async getAllPRHistory(): Promise<ExercisePRHistory[]> {
    try {
      const data = await AsyncStorage.getItem(this.PR_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting all PR history:', error);
      return [];
    }
  }

  // Get PR records for a specific time period
  async getPRRecordsForPeriod(
    exerciseId: string,
    days: number | 'all'
  ): Promise<PRRecord[]> {
    try {
      const exercisePR = await this.getExercisePRHistory(exerciseId);
      if (!exercisePR) return [];

      if (days === 'all') {
        return exercisePR.records;
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      return exercisePR.records.filter(
        record => new Date(record.date) >= cutoffDate
      );
    } catch (error) {
      console.error('Error getting PR records for period:', error);
      return [];
    }
  }

  // Process workout data to extract and save PRs
  async processWorkoutForPRs(workout: any): Promise<void> {
    try {
      for (const exercise of workout.exercises) {
        // Find the best set (highest weight or 1RM)
        let bestSet = { weight: 0, reps: 0 };
        let best1RM = 0;

        for (const set of exercise.sets) {
          const weight = parseFloat(set.weight) || 0;
          const reps = parseInt(set.reps) || 0;
          
          if (weight > 0 && reps > 0) {
            const oneRM = this.calculate1RM(weight, reps);
            if (oneRM > best1RM) {
              best1RM = oneRM;
              bestSet = { weight, reps };
            }
          }
        }

        if (bestSet.weight > 0) {
          await this.savePRRecord(
            exercise.exerciseId,
            exercise.exerciseName,
            bestSet.weight,
            bestSet.reps,
            workout.date
          );
        }
      }
    } catch (error) {
      console.error('Error processing workout for PRs:', error);
    }
  }

  // Generate mock PR data for testing
  async generateMockPRData(exerciseId: string, exerciseName: string): Promise<void> {
    const baseWeight = 60;
    const today = new Date();
    
    // Generate 3 months of mock data
    for (let i = 90; i >= 0; i -= 3) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Simulate progressive overload with some variation
      const progress = i === 90 ? 0 : (90 - i) * 0.3;
      const variation = Math.random() * 10 - 5; // ±5kg variation
      const weight = Math.max(40, baseWeight + progress + variation);
      const reps = Math.floor(Math.random() * 8) + 5; // 5-12 reps
      
      await this.savePRRecord(
        exerciseId,
        exerciseName,
        Math.round(weight),
        reps,
        date.toISOString()
      );
    }
  }

  // Clear all PR data
  async clearAllPRData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.PR_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing PR data:', error);
    }
  }
}

export default new PRTrackingService();