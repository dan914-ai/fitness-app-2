import api from './api';
import { Workout, Exercise, ExerciseSet } from '../types';

export interface CreateWorkoutRequest {
  exercises: {
    exerciseId: string;
    targetSets?: number;
    targetReps?: number;
    targetWeight?: number;
    targetDuration?: number;
    notes?: string;
  }[];
  notes?: string;
}

export interface UpdateWorkoutRequest {
  endTime?: string;
  totalCalories?: number;
  workoutRating?: number;
  notes?: string;
}

export interface CreateExerciseSetRequest {
  reps?: number;
  weight?: number;
  duration?: number;
  distance?: number;
  restTime?: number;
  isWarmup?: boolean;
}

export interface UpdateExerciseSetRequest {
  reps?: number;
  weight?: number;
  duration?: number;
  distance?: number;
  restTime?: number;
  isWarmup?: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface WorkoutListResponse {
  workouts: Workout[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ExerciseListResponse {
  exercises: Exercise[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class WorkoutService {
  // Workout CRUD operations
  async createWorkout(data: CreateWorkoutRequest): Promise<Workout> {
    const response = await api.post('/workouts', data);
    return response.data.workout;
  }

  async getWorkouts(params?: PaginationParams): Promise<WorkoutListResponse> {
    const response = await api.get('/workouts', { params });
    return response.data;
  }

  async getWorkoutById(workoutId: string): Promise<Workout> {
    const response = await api.get(`/workouts/${workoutId}`);
    return response.data.workout;
  }

  async updateWorkout(workoutId: string, data: UpdateWorkoutRequest): Promise<Workout> {
    const response = await api.put(`/workouts/${workoutId}`, data);
    return response.data.workout;
  }

  async deleteWorkout(workoutId: string): Promise<void> {
    await api.delete(`/workouts/${workoutId}`);
  }

  // Exercise set operations
  async addExerciseSet(workoutExerciseId: string, data: CreateExerciseSetRequest): Promise<ExerciseSet> {
    const response = await api.post(`/workouts/exercise/${workoutExerciseId}/sets`, data);
    return response.data.exerciseSet;
  }

  async updateExerciseSet(setId: string, data: UpdateExerciseSetRequest): Promise<ExerciseSet> {
    const response = await api.put(`/workouts/sets/${setId}`, data);
    return response.data.exerciseSet;
  }

  async deleteExerciseSet(setId: string): Promise<void> {
    await api.delete(`/workouts/sets/${setId}`);
  }

  // Exercise operations (from existing exercise service)
  async getExercises(params?: {
    category?: string;
    muscleGroup?: string;
    equipment?: string;
    page?: number;
    limit?: number;
  }): Promise<ExerciseListResponse> {
    const response = await api.get('/exercises', { params });
    return response.data;
  }

  async searchExercises(query: string): Promise<Exercise[]> {
    const response = await api.get('/exercises/search', { params: { q: query } });
    return response.data.exercises;
  }

  async getExerciseById(exerciseId: string): Promise<Exercise> {
    const response = await api.get(`/exercises/${exerciseId}`);
    return response.data;
  }

  // Utility methods
  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    } else if (minutes > 0) {
      return `${minutes}분 ${remainingSeconds}초`;
    } else {
      return `${remainingSeconds}초`;
    }
  }

  calculateWorkoutDuration(startTime: string, endTime?: string): number {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    return Math.floor((end.getTime() - start.getTime()) / 1000);
  }

  getTotalVolume(sets: ExerciseSet[]): number {
    return sets.reduce((total, set) => {
      if (set.weight && set.reps) {
        return total + (set.weight * set.reps);
      }
      return total;
    }, 0);
  }

  getTotalReps(sets: ExerciseSet[]): number {
    return sets.reduce((total, set) => total + (set.reps || 0), 0);
  }

  getMaxWeight(sets: ExerciseSet[]): number {
    return sets.reduce((max, set) => Math.max(max, set.weight || 0), 0);
  }
}

export const workoutService = new WorkoutService();