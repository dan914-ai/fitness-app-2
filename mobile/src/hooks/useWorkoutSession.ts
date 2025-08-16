import { useEffect, useState } from 'react';
import { useWorkout } from '../contexts/WorkoutContext';
import { workoutApi } from '../services/workoutApi';
import { WorkoutSet } from '../contexts/WorkoutContext';
import authService from '../services/authApi';

export function useWorkoutSession() {
  const workout = useWorkout();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentWorkoutId, setCurrentWorkoutId] = useState<string | null>(null);

  // Start workout session and sync with backend
  const startWorkoutWithSync = async (routineId: string, routineName: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if we're authenticated first
      const isAuth = await authService.isAuthenticated();
      
      if (isAuth) {
        try {
          // Try to start session on backend
          const response = await workoutApi.startWorkoutSession({ routineId, routineName });
          setCurrentWorkoutId(response.workout.workoutId);
        } catch (backendError) {
          console.warn('Backend connection failed, continuing with local session:', backendError);
          // Generate a local workout ID
          setCurrentWorkoutId(`local-${Date.now()}`);
        }
      } else {
        console.log('Not authenticated, using local session');
        // Generate a local workout ID
        setCurrentWorkoutId(`local-${Date.now()}`);
      }
      
      // Always start session in context (works offline)
      workout.startWorkout(routineId, routineName);
      
      return { workoutId: currentWorkoutId, routineId, routineName };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start workout');
      console.error('Error in startWorkoutWithSync:', err);
      // Even if there's an error, try to start local session
      workout.startWorkout(routineId, routineName);
      setCurrentWorkoutId(`local-${Date.now()}`);
    } finally {
      setIsLoading(false);
    }
  };

  // End workout session and sync with backend
  const endWorkoutWithSync = async () => {
    if (!currentWorkoutId) {
      throw new Error('No active workout session');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if this is a local session or backend session
      if (!currentWorkoutId.startsWith('local-')) {
        try {
          // Try to end session on backend
          const response = await workoutApi.endWorkoutSession(currentWorkoutId);
        } catch (backendError) {
          console.warn('Backend connection failed, ending local session:', backendError);
        }
      }
      
      // Always end session in context
      workout.endWorkout();
      setCurrentWorkoutId(null);
      
      return { workoutId: currentWorkoutId };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end workout');
      // Even if there's an error, try to end local session
      workout.endWorkout();
      setCurrentWorkoutId(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Add exercise to session
  const addExerciseWithSync = async (exerciseId: string, exerciseName: string) => {
    if (!currentWorkoutId) {
      throw new Error('No active workout session');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Add to backend
      const response = await workoutApi.addExerciseToSession(
        currentWorkoutId,
        exerciseId,
        exerciseName
      );
      
      // Add to context
      workout.addExercise(exerciseId, exerciseName);
      
      return response.workoutExercise;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add exercise');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove exercise from session
  const removeExerciseWithSync = async (exerciseId: string, workoutExerciseId?: string) => {
    if (!currentWorkoutId || !workoutExerciseId) {
      throw new Error('No active workout session or invalid exercise');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Remove from backend
      await workoutApi.removeExerciseFromSession(currentWorkoutId, workoutExerciseId);
      
      // Remove from context
      workout.removeExercise(exerciseId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove exercise');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update exercise sets
  const updateExerciseSetsWithSync = async (
    exerciseId: string,
    sets: WorkoutSet[],
    workoutExerciseId?: string
  ) => {
    if (!workoutExerciseId) {
      // If no backend ID yet, just update locally
      workout.updateExerciseSets(exerciseId, sets);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Update on backend
      await workoutApi.updateSessionExerciseSets(workoutExerciseId, sets);
      
      // Update in context
      workout.updateExerciseSets(exerciseId, sets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update exercise sets');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Load active session on mount
  useEffect(() => {
    const loadActiveSession = async () => {
      try {
        // Skip loading active session if not authenticated
        const isAuth = await authService.isAuthenticated();
        if (!isAuth) {
          console.log('Not authenticated, skipping active session check');
          return;
        }

        const response = await workoutApi.getActiveSession();
        if (response.activeSession) {
          setCurrentWorkoutId(response.activeSession.workoutId);
          
          // Sync with context if needed
          if (!workout.state.isWorkoutActive) {
            // TODO: Load session data into context
            // This would require mapping backend data to context format
          }
        }
      } catch (err) {
        console.error('Failed to load active session:', err);
        // Don't throw error, just log it
      }
    };

    loadActiveSession();
  }, []);

  return {
    ...workout,
    startWorkout: startWorkoutWithSync,
    endWorkout: endWorkoutWithSync,
    addExercise: addExerciseWithSync,
    removeExercise: removeExerciseWithSync,
    updateExerciseSets: updateExerciseSetsWithSync,
    isLoading,
    error,
    currentWorkoutId,
  };
}