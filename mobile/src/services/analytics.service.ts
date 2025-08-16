import api from './api.service';
import { apiCall } from '../utils/apiWrapper';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TypeScript interfaces for analytics data
export interface OverallStats {
  user: {
    userId: string;
    username: string;
    userTier: string;
    totalPoints: number;
    profileImageUrl: string | null;
  };
  stats: {
    workouts: {
      total: number;
      thisWeek: number;
      totalDuration: number;
      totalCalories: number;
      avgDuration: number;
      avgCalories: number;
    };
    strength: {
      totalSets: number;
      totalVolume: number;
      avgVolumePerWorkout: number;
    };
    consistency: {
      currentStreak: number;
      workoutsThisWeek: number;
      workoutFrequency: string;
    };
    social: {
      followersCount: number;
      followingCount: number;
      challengesParticipated: number;
    };
    achievements: {
      totalEarned: number;
      totalPoints: number;
    };
    body: {
      latestWeight: number | null;
      totalPhotos: number;
      latestPhotoDate: string | null;
    };
  };
  recentActivity: {
    workoutsThisWeek: number;
    lastWorkoutDate: string | null;
    photosThisMonth: number;
    measurementsThisMonth: number;
  };
}

export interface WorkoutAnalytics {
  summary: {
    totalWorkouts: number;
    totalDuration: number;
    totalCalories: number;
    avgDuration: number;
    avgCalories: number;
    avgRating: number;
    currentStreak: number;
    maxStreak: number;
    workoutFrequency: string;
  };
  charts: {
    dailyData: DailyWorkoutData[];
    weeklyFrequency: number[];
    muscleGroupData: MuscleGroupData[];
  };
}

export interface DailyWorkoutData {
  date: string;
  workouts: number;
  duration: number;
  calories: number;
}

export interface MuscleGroupData {
  name: string;
  count: number;
}

export interface ExerciseProgress {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  data: ProgressDataPoint[];
  improvements: {
    weight: number;
    volume: number;
  };
}

export interface ProgressDataPoint {
  date: string;
  maxWeight: number;
  totalVolume: number;
  totalReps: number;
  sets: number;
}

export interface BodyMeasurement {
  measurementId?: string;
  measurementDate: string;
  weight: number | null;
  bodyFatPercentage: number | null;
  muscleMass: number | null;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  thigh: number | null;
  bicep: number | null;
}

export interface ProgressPhoto {
  photoId: string;
  photoUrl: string;
  takenDate: string;
  weight: number | null;
  notes: string | null;
}

export interface Achievement {
  achievementId: string;
  achievementName: string;
  description: string;
  category: string;
  requiredValue: number;
  points: number;
  badgeImageUrl: string | null;
  isEarned: boolean;
  earnedAt: string | null;
  currentProgress: number;
  progressPercentage: number;
}

export interface PersonalRecord {
  exerciseName: string;
  exerciseId: string;
  recordType: 'weight' | 'volume' | 'reps';
  value: number;
  date: string;
  improvement: number;
}

export interface WorkoutTrend {
  metric: string;
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
  recommendation: string;
}

// Default/offline data
const DEFAULT_OVERALL_STATS: OverallStats = {
  user: {
    userId: '',
    username: 'User',
    userTier: 'Bronze',
    totalPoints: 0,
    profileImageUrl: null,
  },
  stats: {
    workouts: {
      total: 0,
      thisWeek: 0,
      totalDuration: 0,
      totalCalories: 0,
      avgDuration: 0,
      avgCalories: 0,
    },
    strength: {
      totalSets: 0,
      totalVolume: 0,
      avgVolumePerWorkout: 0,
    },
    consistency: {
      currentStreak: 0,
      workoutsThisWeek: 0,
      workoutFrequency: '0',
    },
    social: {
      followersCount: 0,
      followingCount: 0,
      challengesParticipated: 0,
    },
    achievements: {
      totalEarned: 0,
      totalPoints: 0,
    },
    body: {
      latestWeight: null,
      totalPhotos: 0,
      latestPhotoDate: null,
    },
  },
  recentActivity: {
    workoutsThisWeek: 0,
    lastWorkoutDate: null,
    photosThisMonth: 0,
    measurementsThisMonth: 0,
  },
};

const DEFAULT_WORKOUT_ANALYTICS: WorkoutAnalytics = {
  summary: {
    totalWorkouts: 0,
    totalDuration: 0,
    totalCalories: 0,
    avgDuration: 0,
    avgCalories: 0,
    avgRating: 0,
    currentStreak: 0,
    maxStreak: 0,
    workoutFrequency: '0',
  },
  charts: {
    dailyData: [],
    weeklyFrequency: [0, 0, 0, 0, 0, 0, 0],
    muscleGroupData: [],
  },
};

class AnalyticsService {
  // Cache keys
  private readonly CACHE_KEYS = {
    OVERALL_STATS: 'analytics_overall_stats',
    WORKOUT_ANALYTICS: 'analytics_workout_',
    MUSCLE_DISTRIBUTION: 'analytics_muscle_distribution',
    EXERCISE_PROGRESS: 'analytics_exercise_progress_',
    PERSONAL_RECORDS: 'analytics_personal_records',
    WORKOUT_TRENDS: 'analytics_workout_trends',
  };

  // 1. Get overall statistics
  async getOverallStats(): Promise<OverallStats> {
    return apiCall(
      async () => {
        const response = await api.get('/analytics/overall-stats');
        return response.data;
      },
      DEFAULT_OVERALL_STATS,
      {
        cacheKey: this.CACHE_KEYS.OVERALL_STATS,
        showError: true,
        operation: 'Get Overall Stats',
        screen: 'Analytics',
      }
    );
  }

  // 2. Get workout frequency for specified period
  async getWorkoutFrequency(period: number = 30): Promise<WorkoutAnalytics> {
    return apiCall(
      async () => {
        const response = await api.get('/analytics/workout-analytics', {
          params: { period },
        });
        return response.data;
      },
      DEFAULT_WORKOUT_ANALYTICS,
      {
        cacheKey: `${this.CACHE_KEYS.WORKOUT_ANALYTICS}${period}`,
        showError: true,
        operation: 'Get Workout Frequency',
        screen: 'Analytics',
      }
    );
  }

  // 3. Get muscle group distribution data
  async getMuscleGroupDistribution(): Promise<MuscleGroupData[]> {
    return apiCall(
      async () => {
        const response = await api.get('/analytics/workout-analytics', {
          params: { period: 30 },
        });
        return response.data.charts.muscleGroupData || [];
      },
      [],
      {
        cacheKey: this.CACHE_KEYS.MUSCLE_DISTRIBUTION,
        showError: false,
        operation: 'Get Muscle Group Distribution',
        screen: 'Analytics',
      }
    );
  }

  // 4. Get progress for specific exercise
  async getExerciseProgress(exerciseId: number, period: number = 90): Promise<ExerciseProgress[]> {
    return apiCall(
      async () => {
        const response = await api.get('/analytics/strength-progress', {
          params: { exerciseId, period },
        });
        return response.data.exercises || [];
      },
      [],
      {
        cacheKey: `${this.CACHE_KEYS.EXERCISE_PROGRESS}${exerciseId}_${period}`,
        showError: true,
        operation: 'Get Exercise Progress',
        screen: 'Analytics',
      }
    );
  }

  // 5. Get all personal records
  async getPersonalRecords(): Promise<PersonalRecord[]> {
    return apiCall(
      async () => {
        // Get strength progress data and extract personal records
        const response = await api.get('/analytics/strength-progress', {
          params: { period: 365 },
        });
        
        const personalRecords: PersonalRecord[] = [];
        const exercises = response.data.exercises || [];
        
        exercises.forEach((exercise: ExerciseProgress) => {
          if (exercise.data.length > 0) {
            // Find max weight record
            const maxWeightData = exercise.data.reduce((max, current) => 
              current.maxWeight > max.maxWeight ? current : max
            );
            
            // Find max volume record
            const maxVolumeData = exercise.data.reduce((max, current) => 
              current.totalVolume > max.totalVolume ? current : max
            );
            
            // Find max reps record
            const maxRepsData = exercise.data.reduce((max, current) => 
              current.totalReps > max.totalReps ? current : max
            );
            
            personalRecords.push({
              exerciseName: exercise.exerciseName,
              exerciseId: exercise.exerciseId,
              recordType: 'weight',
              value: maxWeightData.maxWeight,
              date: maxWeightData.date,
              improvement: exercise.improvements.weight,
            });
            
            personalRecords.push({
              exerciseName: exercise.exerciseName,
              exerciseId: exercise.exerciseId,
              recordType: 'volume',
              value: maxVolumeData.totalVolume,
              date: maxVolumeData.date,
              improvement: exercise.improvements.volume,
            });
            
            personalRecords.push({
              exerciseName: exercise.exerciseName,
              exerciseId: exercise.exerciseId,
              recordType: 'reps',
              value: maxRepsData.totalReps,
              date: maxRepsData.date,
              improvement: 0, // Calculate if needed
            });
          }
        });
        
        return personalRecords;
      },
      [],
      {
        cacheKey: this.CACHE_KEYS.PERSONAL_RECORDS,
        showError: false,
        operation: 'Get Personal Records',
        screen: 'Analytics',
      }
    );
  }

  // 6. Get workout trends and patterns
  async getWorkoutTrends(): Promise<WorkoutTrend[]> {
    return apiCall(
      async () => {
        const analytics = await this.getWorkoutFrequency(30);
        const trends: WorkoutTrend[] = [];
        
        // Analyze workout frequency trend
        const recentFrequency = parseFloat(analytics.summary.workoutFrequency);
        const previousPeriodResponse = await api.get('/analytics/workout-analytics', {
          params: { period: 60 },
        });
        const longerPeriodFrequency = parseFloat(previousPeriodResponse.data.summary.workoutFrequency);
        
        const frequencyChange = recentFrequency - longerPeriodFrequency;
        const frequencyChangePercent = longerPeriodFrequency > 0 
          ? (frequencyChange / longerPeriodFrequency) * 100 
          : 0;
        
        trends.push({
          metric: 'Workout Frequency',
          trend: frequencyChange > 0.5 ? 'up' : frequencyChange < -0.5 ? 'down' : 'stable',
          changePercentage: Math.round(frequencyChangePercent),
          recommendation: frequencyChange < 0 
            ? 'Try to maintain consistency in your workout schedule'
            : 'Great job maintaining workout consistency!',
        });
        
        // Analyze volume trend
        const recentVolume = analytics.summary.totalCalories;
        const volumeChange = recentVolume > 0 ? 10 : -5; // Simplified for now
        
        trends.push({
          metric: 'Training Volume',
          trend: volumeChange > 5 ? 'up' : volumeChange < -5 ? 'down' : 'stable',
          changePercentage: volumeChange,
          recommendation: volumeChange < 0 
            ? 'Consider progressive overload to continue making gains'
            : 'Your training volume is progressing well',
        });
        
        // Analyze streak trend
        const currentStreak = analytics.summary.currentStreak;
        trends.push({
          metric: 'Workout Streak',
          trend: currentStreak > 7 ? 'up' : currentStreak < 3 ? 'down' : 'stable',
          changePercentage: 0,
          recommendation: currentStreak < 3 
            ? 'Build consistency with regular workouts'
            : `Keep up the ${currentStreak}-day streak!`,
        });
        
        return trends;
      },
      [],
      {
        cacheKey: this.CACHE_KEYS.WORKOUT_TRENDS,
        showError: false,
        operation: 'Get Workout Trends',
        screen: 'Analytics',
      }
    );
  }

  // Chart data processing utilities
  processWorkoutChartData(dailyData: DailyWorkoutData[]): any[] {
    return dailyData.map(day => ({
      date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      workouts: day.workouts,
      duration: day.duration,
      calories: day.calories,
    }));
  }

  processWeeklyFrequencyData(weeklyFrequency: number[]): any[] {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return weeklyFrequency.map((count, index) => ({
      day: days[index],
      count,
      percentage: Math.max(...weeklyFrequency) > 0 
        ? (count / Math.max(...weeklyFrequency)) * 100 
        : 0,
    }));
  }

  processMuscleGroupData(muscleGroupData: MuscleGroupData[]): any[] {
    const totalCount = muscleGroupData.reduce((sum, group) => sum + group.count, 0);
    return muscleGroupData
      .sort((a, b) => b.count - a.count)
      .map(group => ({
        name: group.name,
        count: group.count,
        percentage: totalCount > 0 ? (group.count / totalCount) * 100 : 0,
        color: this.getMuscleGroupColor(group.name),
      }));
  }

  // Utility methods
  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  formatCalories(calories: number): string {
    if (calories >= 1000) {
      return `${(calories / 1000).toFixed(1)}k`;
    }
    return calories.toString();
  }

  formatDate(dateString: string, format: 'short' | 'long' = 'short'): string {
    const date = new Date(dateString);
    if (format === 'long') {
      return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    return date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' });
  }

  formatVolume(volume: number): string {
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}t`;
    }
    return `${volume}kg`;
  }

  // Add the missing getWorkoutAnalytics method
  async getWorkoutAnalytics(period: number = 30): Promise<WorkoutAnalytics> {
    return this.getWorkoutFrequency(period);
  }

  // Add the missing getStrengthProgress method
  async getStrengthProgress(exerciseId?: number, period: number = 90): Promise<any> {
    return apiCall(
      async () => {
        const response = await api.get('/analytics/strength-progress', {
          params: { exerciseId, period },
        });
        return response.data;
      },
      {
        summary: {
          exercisesTracked: 0,
          avgWeightImprovement: 0,
          avgVolumeImprovement: 0,
        },
        exercises: [],
      },
      {
        cacheKey: `analytics_strength_progress_${exerciseId || 'all'}_${period}`,
        showError: false,
        operation: 'Get Strength Progress',
        screen: 'Analytics',
      }
    );
  }

  private getMuscleGroupColor(muscleGroup: string): string {
    const colors: { [key: string]: string } = {
      'Chest': '#FF6B6B',
      'Back': '#4ECDC4',
      'Shoulders': '#45B7D1',
      'Arms': '#96CEB4',
      'Legs': '#FECA57',
      'Core': '#9c88ff',
      'Cardio': '#FD79A8',
      'Full Body': '#A29BFE',
    };
    return colors[muscleGroup] || '#95A5A6';
  }

  // Additional methods for body measurements and progress photos
  async getBodyMeasurements(period: number = 365): Promise<any> {
    return apiCall(
      async () => {
        const response = await api.get('/analytics/body-measurements', {
          params: { period },
        });
        return response.data;
      },
      { measurements: [], trends: {}, summary: {} },
      {
        cacheKey: `analytics_body_measurements_${period}`,
        showError: false,
        operation: 'Get Body Measurements',
        screen: 'Analytics',
      }
    );
  }

  async addBodyMeasurement(measurement: Omit<BodyMeasurement, 'measurementId'>): Promise<any> {
    return apiCall(
      async () => {
        const response = await api.post('/analytics/body-measurements', measurement);
        // Clear cache after adding new measurement
        await AsyncStorage.removeItem('analytics_body_measurements_365');
        return response.data;
      },
      null,
      {
        showError: true,
        operation: 'Add Body Measurement',
        screen: 'Analytics',
      }
    );
  }

  async getProgressPhotos(period: number = 365): Promise<any> {
    return apiCall(
      async () => {
        const response = await api.get('/analytics/progress-photos', {
          params: { period },
        });
        return response.data;
      },
      { photos: [], photosByMonth: {}, summary: {} },
      {
        cacheKey: `analytics_progress_photos_${period}`,
        showError: false,
        operation: 'Get Progress Photos',
        screen: 'Analytics',
      }
    );
  }

  async addProgressPhoto(photo: Omit<ProgressPhoto, 'photoId'>): Promise<any> {
    return apiCall(
      async () => {
        const response = await api.post('/analytics/progress-photos', photo);
        // Clear cache after adding new photo
        await AsyncStorage.removeItem('analytics_progress_photos_365');
        return response.data;
      },
      null,
      {
        showError: true,
        operation: 'Add Progress Photo',
        screen: 'Analytics',
      }
    );
  }

  async getUserAchievements(): Promise<any> {
    return apiCall(
      async () => {
        const response = await api.get('/analytics/achievements');
        return response.data;
      },
      { achievements: [], achievementsByCategory: {}, summary: {} },
      {
        cacheKey: 'analytics_achievements',
        showError: false,
        operation: 'Get User Achievements',
        screen: 'Analytics',
      }
    );
  }

  // Export data in various formats
  async exportData(type: 'workout' | 'body' | 'all', format: 'csv' | 'json'): Promise<any> {
    return apiCall(
      async () => {
        const response = await api.get('/analytics/export', {
          params: { type, format },
        });
        return response.data;
      },
      null,
      {
        showError: true,
        operation: 'Export Data',
        screen: 'Analytics',
      }
    );
  }
}

export default new AnalyticsService();