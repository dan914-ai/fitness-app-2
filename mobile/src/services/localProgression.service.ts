import { getWorkoutHistory } from '../utils/workoutHistory';
import storageService from './storage.service';

interface ProgressionSuggestion {
  originalWeight: number;
  suggestedWeight: number;
  reason: string;
  readiness: number;
}

class LocalProgressionService {
  /**
   * Get the last weight used for a specific exercise
   */
  async getLastExerciseWeight(exerciseId: string): Promise<number> {
    try {
      const history = await getWorkoutHistory();
      
      // Sort by date to get most recent first
      const sortedHistory = history.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      // Find the most recent workout with this exercise
      for (const workout of sortedHistory) {
        const exercise = workout.exercises.find(ex => 
          ex.exerciseId === exerciseId || ex.exerciseName === exerciseId
        );
        
        if (exercise && exercise.sets.length > 0) {
          // Get the max weight from normal sets (not warmup)
          const normalSets = exercise.sets.filter(set => 
            set.type !== 'Warmup' && parseFloat(set.weight) > 0
          );
          
          if (normalSets.length > 0) {
            const weights = normalSets.map(set => parseFloat(set.weight));
            return Math.max(...weights);
          }
        }
      }
      
      return 0;
    } catch (error) {
      console.error('[LocalProgression] Error getting last weight:', error);
      return 0;
    }
  }

  /**
   * Calculate workout frequency for recovery estimation
   */
  async getWorkoutFrequency(days: number = 7): Promise<number> {
    try {
      const history = await getWorkoutHistory();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const recentWorkouts = history.filter(workout => 
        new Date(workout.date) >= cutoffDate
      );
      
      return recentWorkouts.length;
    } catch (error) {
      console.error('[LocalProgression] Error getting workout frequency:', error);
      return 0;
    }
  }

  /**
   * Calculate average volume trend
   */
  async getVolumeTrend(exerciseId: string, workouts: number = 3): Promise<'increasing' | 'decreasing' | 'stable'> {
    try {
      const history = await getWorkoutHistory();
      
      // Get last N workouts with this exercise
      const workoutsWithExercise = history
        .filter(workout => 
          workout.exercises.some(ex => ex.exerciseId === exerciseId || ex.exerciseName === exerciseId)
        )
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, workouts);
      
      if (workoutsWithExercise.length < 2) return 'stable';
      
      // Calculate volumes
      const volumes = workoutsWithExercise.map(workout => {
        const exercise = workout.exercises.find(ex => 
          ex.exerciseId === exerciseId || ex.exerciseName === exerciseId
        );
        return exercise?.totalVolume || 0;
      });
      
      // Check trend
      const recentVolume = volumes[0];
      const previousAverage = volumes.slice(1).reduce((a, b) => a + b, 0) / (volumes.length - 1);
      
      if (recentVolume > previousAverage * 1.1) return 'increasing';
      if (recentVolume < previousAverage * 0.9) return 'decreasing';
      return 'stable';
    } catch (error) {
      console.error('[LocalProgression] Error getting volume trend:', error);
      return 'stable';
    }
  }

  /**
   * Get progression suggestion based on workout history
   */
  async getProgressionSuggestion(
    exerciseId: string, 
    exerciseName: string,
    exerciseType: 'compound' | 'isolation' = 'compound'
  ): Promise<ProgressionSuggestion> {
    try {
      const lastWeight = await this.getLastExerciseWeight(exerciseId);
      const workoutFrequency = await this.getWorkoutFrequency(7);
      const volumeTrend = await this.getVolumeTrend(exerciseId);
      
      // Estimate readiness based on workout frequency
      let readiness = 0.7; // Default moderate readiness
      let reason = '';
      let suggestedWeight = lastWeight;
      
      // No previous weight - suggest starting weight
      if (lastWeight === 0) {
        suggestedWeight = exerciseType === 'compound' ? 20 : 10;
        reason = '📝 시작 중량 제안';
        readiness = 0.5;
      }
      // High frequency (4+ workouts/week) - might need recovery
      else if (workoutFrequency >= 4) {
        if (volumeTrend === 'decreasing') {
          // Showing fatigue - reduce weight
          suggestedWeight = Math.round(lastWeight * 0.95);
          reason = '😴 높은 빈도 + 볼륨 감소 → 5% 감량';
          readiness = 0.4;
        } else {
          // Maintaining well - small increase
          suggestedWeight = Math.round(lastWeight * 1.025);
          reason = '💪 높은 빈도 유지 중 → 2.5% 증량';
          readiness = 0.6;
        }
      }
      // Moderate frequency (2-3 workouts/week)
      else if (workoutFrequency >= 2) {
        if (volumeTrend === 'increasing') {
          // Good progress - increase
          suggestedWeight = Math.round(lastWeight * 1.05);
          reason = '🚀 볼륨 증가 추세 → 5% 증량';
          readiness = 0.8;
        } else if (volumeTrend === 'decreasing') {
          // Maintain weight
          suggestedWeight = lastWeight;
          reason = '→ 볼륨 감소 추세 → 중량 유지';
          readiness = 0.6;
        } else {
          // Stable - small increase
          suggestedWeight = Math.round(lastWeight * 1.025);
          reason = '→ 안정적 진행 → 2.5% 증량';
          readiness = 0.7;
        }
      }
      // Low frequency (0-1 workouts/week) - well rested
      else {
        if (workoutFrequency === 0) {
          // Long rest - maintain or slight decrease
          suggestedWeight = Math.round(lastWeight * 0.95);
          reason = '🔄 1주 이상 휴식 → 5% 감량 후 시작';
          readiness = 0.5;
        } else {
          // Well rested - can increase
          suggestedWeight = Math.round(lastWeight * 1.05);
          reason = '✨ 충분한 휴식 → 5% 증량';
          readiness = 0.9;
        }
      }
      
      // Ensure minimum weight
      if (suggestedWeight < 2.5) suggestedWeight = 2.5;
      
      // Round to nearest 2.5kg
      suggestedWeight = Math.round(suggestedWeight / 2.5) * 2.5;
      
      return {
        originalWeight: lastWeight,
        suggestedWeight,
        reason,
        readiness
      };
    } catch (error) {
      console.error('[LocalProgression] Error calculating progression:', error);
      return {
        originalWeight: 0,
        suggestedWeight: exerciseType === 'compound' ? 20 : 10,
        reason: '📝 기본 시작 중량',
        readiness: 0.5
      };
    }
  }

  /**
   * Save recovery data locally (for future use)
   */
  async saveRecoveryData(data: {
    sleep: number;
    energy: number;
    soreness: number;
    motivation: number;
  }): Promise<void> {
    try {
      const key = '@recovery_data';
      const recoveryHistory = await storageService.getGenericItem(key, []);
      
      recoveryHistory.unshift({
        ...data,
        date: new Date().toISOString(),
        id: `recovery_${Date.now()}`
      });
      
      // Keep only last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const filtered = recoveryHistory.filter((item: any) => 
        new Date(item.date) > thirtyDaysAgo
      );
      
      await storageService.setGenericItem(key, filtered);
    } catch (error) {
      console.error('[LocalProgression] Error saving recovery data:', error);
    }
  }

  /**
   * Get latest recovery data
   */
  async getLatestRecoveryData(): Promise<any> {
    try {
      const key = '@recovery_data';
      const recoveryHistory = await storageService.getGenericItem(key, []);
      return recoveryHistory[0] || null;
    } catch (error) {
      console.error('[LocalProgression] Error getting recovery data:', error);
      return null;
    }
  }
}

export const localProgressionService = new LocalProgressionService();
export default localProgressionService;