import AsyncStorage from '@react-native-async-storage/async-storage';

interface WorkoutState {
  isWorkoutActive: boolean;
  startTime: string | null;
  routineId: string | null;
  routineName: string | null;
  currentExerciseId: string | null;
  exercises: Record<string, any>;
  exerciseOrder: string[];
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  repaired: boolean;
  state: WorkoutState;
}

/**
 * Validates and repairs workout state
 */
export function validateWorkoutState(state: any): ValidationResult {
  const errors: string[] = [];
  let repaired = false;
  
  // Create a default valid state
  const defaultState: WorkoutState = {
    isWorkoutActive: false,
    startTime: null,
    routineId: null,
    routineName: null,
    currentExerciseId: null,
    exercises: {},
    exerciseOrder: [],
  };

  // If state is null or undefined, return default
  if (!state) {
    return {
      isValid: false,
      errors: ['State is null or undefined'],
      repaired: true,
      state: defaultState,
    };
  }

  // Validate and repair each field
  let repairedState: WorkoutState = { ...state };

  // Check isWorkoutActive
  if (typeof state.isWorkoutActive !== 'boolean') {
    errors.push('isWorkoutActive is not a boolean');
    repairedState.isWorkoutActive = false;
    repaired = true;
  }

  // Check startTime
  if (state.startTime !== null && typeof state.startTime !== 'string') {
    errors.push('startTime is not a string or null');
    repairedState.startTime = null;
    repaired = true;
  }

  // If workout is active but no start time, fix it
  if (repairedState.isWorkoutActive && !repairedState.startTime) {
    errors.push('Active workout has no start time');
    repairedState.startTime = new Date().toISOString();
    repaired = true;
  }

  // Check routineId
  if (state.routineId !== null && typeof state.routineId !== 'string') {
    errors.push('routineId is not a string or null');
    repairedState.routineId = null;
    repaired = true;
  }

  // Check routineName
  if (state.routineName !== null && typeof state.routineName !== 'string') {
    errors.push('routineName is not a string or null');
    repairedState.routineName = null;
    repaired = true;
  }

  // Check currentExerciseId
  if (state.currentExerciseId !== null && typeof state.currentExerciseId !== 'string') {
    errors.push('currentExerciseId is not a string or null');
    repairedState.currentExerciseId = null;
    repaired = true;
  }

  // Check exercises object
  if (!state.exercises || typeof state.exercises !== 'object') {
    errors.push('exercises is not an object');
    repairedState.exercises = {};
    repaired = true;
  } else {
    // Validate each exercise
    const validatedExercises: Record<string, any> = {};
    for (const [exerciseId, exerciseData] of Object.entries(state.exercises)) {
      if (exerciseData && typeof exerciseData === 'object') {
        // Ensure required fields exist
        validatedExercises[exerciseId] = {
          exerciseId: exerciseData.exerciseId || exerciseId,
          exerciseName: exerciseData.exerciseName || 'Unknown Exercise',
          sets: Array.isArray(exerciseData.sets) ? exerciseData.sets : [],
          isCompleted: exerciseData.isCompleted === true,
          ...exerciseData,
        };
      } else {
        errors.push(`Invalid exercise data for ${exerciseId}`);
        repaired = true;
      }
    }
    repairedState.exercises = validatedExercises;
  }

  // Check exerciseOrder array
  if (!Array.isArray(state.exerciseOrder)) {
    errors.push('exerciseOrder is not an array');
    // Try to reconstruct from exercises
    repairedState.exerciseOrder = Object.keys(repairedState.exercises);
    repaired = true;
  } else {
    // Remove invalid entries
    repairedState.exerciseOrder = state.exerciseOrder.filter(
      (id: any) => typeof id === 'string' && repairedState.exercises[id]
    );
    if (repairedState.exerciseOrder.length !== state.exerciseOrder.length) {
      errors.push('Removed invalid entries from exerciseOrder');
      repaired = true;
    }
  }

  // Additional consistency checks
  if (repairedState.currentExerciseId && 
      !repairedState.exercises[repairedState.currentExerciseId]) {
    errors.push('currentExerciseId references non-existent exercise');
    repairedState.currentExerciseId = repairedState.exerciseOrder[0] || null;
    repaired = true;
  }

  // If workout is not active, clear workout-specific data
  if (!repairedState.isWorkoutActive) {
    if (repairedState.startTime || 
        Object.keys(repairedState.exercises).length > 0 ||
        repairedState.currentExerciseId) {
      errors.push('Inactive workout has active data');
      repairedState.startTime = null;
      repairedState.exercises = {};
      repairedState.exerciseOrder = [];
      repairedState.currentExerciseId = null;
      repaired = true;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    repaired,
    state: repairedState,
  };
}

/**
 * Clears corrupt workout state from storage
 */
export async function clearCorruptWorkoutState(): Promise<void> {
  try {
    await AsyncStorage.removeItem('workout_state');
    await AsyncStorage.removeItem('workout_backup');
    await AsyncStorage.removeItem('temp_workout_state');
  } catch (error) {
    console.error('Error clearing workout state:', error);
  }
}

/**
 * Attempts to recover workout state from backup
 */
export async function recoverWorkoutState(): Promise<WorkoutState | null> {
  try {
    // Try to get backup state first
    const backupStateStr = await AsyncStorage.getItem('workout_backup');
    if (backupStateStr) {
      const backupState = JSON.parse(backupStateStr);
      const validation = validateWorkoutState(backupState);
      
      if (validation.isValid || validation.repaired) {
        // Restore from backup
        await AsyncStorage.setItem('workout_state', JSON.stringify(validation.state));
        return validation.state;
      }
    }

    // Try temp state
    const tempStateStr = await AsyncStorage.getItem('temp_workout_state');
    if (tempStateStr) {
      const tempState = JSON.parse(tempStateStr);
      const validation = validateWorkoutState(tempState);
      
      if (validation.isValid || validation.repaired) {
        // Restore from temp
        await AsyncStorage.setItem('workout_state', JSON.stringify(validation.state));
        return validation.state;
      }
    }

    return null;
  } catch (error) {
    console.error('Error recovering workout state:', error);
    return null;
  }
}

/**
 * Creates a backup of the current workout state
 */
export async function backupWorkoutState(state: WorkoutState): Promise<void> {
  try {
    const validation = validateWorkoutState(state);
    if (validation.isValid) {
      await AsyncStorage.setItem('workout_backup', JSON.stringify(state));
    }
  } catch (error) {
    console.error('Error backing up workout state:', error);
  }
}