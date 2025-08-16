import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutSet } from '../contexts/WorkoutContext';
import { API_CONFIG } from '../config/api';
import authService from './authApi';

const API_BASE_URL = API_CONFIG.BASE_URL;

// Helper function to get auth headers
async function getAuthHeaders() {
  return authService.getAuthHeaders();
}

interface StartWorkoutSessionParams {
  routineId: string;
  routineName: string;
}

interface WorkoutSessionResponse {
  workout: {
    workoutId: string;
    userId: string;
    routineId: string;
    startTime: string;
    routineName: string;
  };
}

interface EndWorkoutSessionResponse {
  workout: {
    workoutId: string;
    userId: string;
    routineId: string;
    totalSets: number;
    totalDuration: number;
    totalCalories: number;
    endTime: string;
  };
}

interface ActiveSessionResponse {
  activeSession: {
    workoutId: string;
    userId: string;
    routineId: string;
    startTime: string;
    workoutExercises: Array<{
      workoutExerciseId: string;
      exerciseId: string;
      exercise: {
        exerciseId: string;
        exerciseName: string;
        muscleGroup: string;
      };
      exerciseSets: Array<{
        setId: string;
        setNumber: number;
        reps: number | null;
        weight: number | null;
        isWarmup: boolean;
        restTime: number | null;
      }>;
    }>;
  } | null;
}

export const workoutApi = {
  // Start a new workout session
  async startWorkoutSession(params: StartWorkoutSessionParams): Promise<WorkoutSessionResponse> {
    try {
      
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/workouts/session/start`, {
        method: 'POST',
        headers,
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start workout session');
      }

      return response.json();
    } catch (error) {
      console.error('Error starting workout session:', error);
      throw error;
    }
  },

  // End an active workout session
  async endWorkoutSession(workoutId: string): Promise<EndWorkoutSessionResponse> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/workouts/session/${workoutId}/end`, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to end workout session');
    }

    return response.json();
  },

  // Get active workout session
  async getActiveSession(): Promise<ActiveSessionResponse> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/workouts/session/active`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get active session');
    }

    return response.json();
  },

  // Add exercise to workout session
  async addExerciseToSession(workoutId: string, exerciseId: string, exerciseName: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/workouts/session/${workoutId}/exercise`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ exerciseId, exerciseName }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add exercise to session');
    }

    return response.json();
  },

  // Remove exercise from workout session
  async removeExerciseFromSession(workoutId: string, workoutExerciseId: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/workouts/session/${workoutId}/exercise/${workoutExerciseId}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to remove exercise from session');
    }

    return response.json();
  },

  // Update exercise sets in workout session
  async updateSessionExerciseSets(workoutExerciseId: string, sets: WorkoutSet[]) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/workouts/session/exercise/${workoutExerciseId}/sets`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ sets }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update exercise sets');
    }

    return response.json();
  },

  // Get exercise by ID
  async getExerciseById(exerciseId: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/exercises/${exerciseId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get exercise');
    }

    return response.json();
  },

  // Search exercises
  async searchExercises(query: string, muscleGroup?: string) {
    const headers = await getAuthHeaders();
    const params = new URLSearchParams();
    if (query) params.append('search', query);
    if (muscleGroup) params.append('muscleGroup', muscleGroup);

    const response = await fetch(`${API_BASE_URL}/exercises?${params.toString()}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to search exercises');
    }

    return response.json();
  },
};