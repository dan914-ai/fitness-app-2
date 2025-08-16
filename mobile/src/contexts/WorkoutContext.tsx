import React, { createContext, useContext, useReducer, ReactNode, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { safeJsonParseWithDates, safeJsonStringifyWithDates, deepCloneWithDates } from '../utils/safeJsonParse';
import { saveWorkoutToHistory } from '../utils/workoutHistory';

export type SetType = 'Normal' | 'Warmup' | 'Compound' | 'Super' | 'Tri' | 'Drop' | 'Failure' | 'Assisted';

export interface WorkoutSet {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
  restTime?: number;
  type: SetType;
  rpe?: number; // Rate of Perceived Exertion (1-10)
  notes?: string; // Set-specific notes
  completedAt?: Date; // When the set was completed
  isPersonalRecord?: boolean; // Is this a PR?
  targetReps?: string; // Target reps for this set
  targetWeight?: string; // Target weight for this set
}

export interface ProgressionSuggestion {
  originalWeight: number;
  suggestedWeight: number;
  reason: string;
  readiness: number;
}

export interface ExerciseData {
  exerciseId: string;
  exerciseName: string;
  sets: WorkoutSet[];
  isCompleted: boolean;
  completedAt?: Date;
  order?: number; // Add order for reordering
  progressionSuggestion?: ProgressionSuggestion; // Add progression data
}

export interface WorkoutState {
  routineId: string | null;
  routineName: string | null;
  exercises: Record<string, ExerciseData>;
  exerciseOrder: string[]; // Track exercise order
  currentExerciseId: string | null;
  isWorkoutActive: boolean;
  startTime: Date | null;
  endTime: Date | null;
  lastSaved: Date | null; // Track when state was last saved
  version: number; // Version for migration support
}

export interface WorkoutContextState {
  workoutState: WorkoutState;
  isLoading: boolean;
  isHydrated: boolean; // Has loaded from storage
  isSaving: boolean;
  lastError: string | null;
}

type WorkoutAction =
  | { type: 'START_WORKOUT'; payload: { routineId: string; routineName: string } }
  | { type: 'END_WORKOUT' }
  | { type: 'SET_CURRENT_EXERCISE'; payload: string }
  | { type: 'INITIALIZE_EXERCISE'; payload: { exerciseId: string; exerciseName: string; defaultSets: WorkoutSet[]; progressionSuggestion?: ProgressionSuggestion } }
  | { type: 'UPDATE_EXERCISE_SETS'; payload: { exerciseId: string; sets: WorkoutSet[] } }
  | { type: 'COMPLETE_EXERCISE'; payload: string }
  | { type: 'UNCOMPLETE_EXERCISE'; payload: string }
  | { type: 'FILL_ALL_SETS'; payload: { exerciseId: string; weight: string; reps: string } }
  | { type: 'RESET_WORKOUT' }
  | { type: 'REORDER_EXERCISES'; payload: string[] }
  | { type: 'ADD_EXERCISE'; payload: { exerciseId: string; exerciseName: string } }
  | { type: 'REMOVE_EXERCISE'; payload: string }
  | { type: 'LOAD_WORKOUT_STATE'; payload: WorkoutState }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_HYDRATED'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'HYDRATE_FROM_STORAGE'; payload: WorkoutState | null };

const WORKOUT_STATE_KEY = '@workout_state';
const WORKOUT_BACKUP_KEY = '@workout_state_backup';
const CURRENT_VERSION = 1;

const initialWorkoutState: WorkoutState = {
  routineId: null,
  routineName: null,
  exercises: {},
  exerciseOrder: [],
  currentExerciseId: null,
  isWorkoutActive: false,
  startTime: null,
  endTime: null,
  lastSaved: null,
  version: CURRENT_VERSION,
};

const initialContextState: WorkoutContextState = {
  workoutState: initialWorkoutState,
  isLoading: true,
  isHydrated: false,
  isSaving: false,
  lastError: null,
};

// Enhanced storage functions with backup and error recovery
async function saveStateToStorage(state: WorkoutState): Promise<boolean> {
  try {
    console.log('💾 WorkoutContext: Saving state to storage', { 
      isActive: state.isWorkoutActive, 
      exerciseCount: Object.keys(state.exercises).length 
    });
    
    // Create backup first
    try {
      const currentState = await AsyncStorage.getItem(WORKOUT_STATE_KEY);
      if (currentState) {
        await AsyncStorage.setItem(WORKOUT_BACKUP_KEY, currentState);
      }
    } catch (backupError) {
      console.warn('💾 WorkoutContext: Backup creation failed, continuing...', backupError);
    }
    
    // Update state with save metadata
    const stateToSave = {
      ...state,
      lastSaved: new Date(),
      version: CURRENT_VERSION,
    };
    
    // Save primary state
    await AsyncStorage.setItem(WORKOUT_STATE_KEY, safeJsonStringifyWithDates(stateToSave));
    console.log('✅ WorkoutContext: State saved successfully');
    return true;
    
  } catch (error) {
    console.error('💥 WorkoutContext: Error saving workout state:', error);
    return false;
  }
}

async function loadStateFromStorage(): Promise<WorkoutState | null> {
  try {
    console.log('📖 WorkoutContext: Loading state from storage');
    
    const savedState = await AsyncStorage.getItem(WORKOUT_STATE_KEY);
    if (!savedState) {
      console.log('📖 WorkoutContext: No saved state found');
      return null;
    }
    
    const parsedState = safeJsonParseWithDates<WorkoutState>(savedState, null);
    if (!parsedState) {
      console.warn('📖 WorkoutContext: Failed to parse saved state, trying backup');
      return await loadBackupState();
    }
    
    // Validate the loaded state
    if (!isValidWorkoutState(parsedState)) {
      console.warn('📖 WorkoutContext: Invalid state structure, trying backup');
      return await loadBackupState();
    }
    
    // Migrate if needed
    const migratedState = migrateWorkoutState(parsedState);
    
    console.log('✅ WorkoutContext: State loaded successfully', { 
      isActive: migratedState.isWorkoutActive,
      exerciseCount: Object.keys(migratedState.exercises).length,
      lastSaved: migratedState.lastSaved 
    });
    
    return migratedState;
    
  } catch (error) {
    console.error('💥 WorkoutContext: Error loading workout state:', error);
    return await loadBackupState();
  }
}

async function loadBackupState(): Promise<WorkoutState | null> {
  try {
    console.log('🔄 WorkoutContext: Loading backup state');
    
    const backupState = await AsyncStorage.getItem(WORKOUT_BACKUP_KEY);
    if (!backupState) {
      console.log('🔄 WorkoutContext: No backup state found');
      return null;
    }
    
    const parsedBackup = safeJsonParseWithDates<WorkoutState>(backupState, null);
    if (!parsedBackup || !isValidWorkoutState(parsedBackup)) {
      console.warn('🔄 WorkoutContext: Backup state invalid');
      return null;
    }
    
    const migratedBackup = migrateWorkoutState(parsedBackup);
    console.log('✅ WorkoutContext: Backup state loaded successfully');
    
    return migratedBackup;
    
  } catch (error) {
    console.error('💥 WorkoutContext: Error loading backup state:', error);
    return null;
  }
}

function isValidWorkoutState(state: any): state is WorkoutState {
  return (
    state &&
    typeof state === 'object' &&
    typeof state.isWorkoutActive === 'boolean' &&
    typeof state.exercises === 'object' &&
    Array.isArray(state.exerciseOrder)
  );
}

function migrateWorkoutState(state: WorkoutState): WorkoutState {
  // Handle version migrations here
  let migratedState = deepCloneWithDates(state);
  
  // Ensure required fields exist
  if (!migratedState.version) migratedState.version = 1;
  if (!migratedState.lastSaved) migratedState.lastSaved = null;
  
  // Convert date strings to Date objects if needed
  if (migratedState.startTime && typeof migratedState.startTime === 'string') {
    migratedState.startTime = new Date(migratedState.startTime);
  }
  if (migratedState.endTime && typeof migratedState.endTime === 'string') {
    migratedState.endTime = new Date(migratedState.endTime);
  }
  if (migratedState.lastSaved && typeof migratedState.lastSaved === 'string') {
    migratedState.lastSaved = new Date(migratedState.lastSaved);
  }
  
  // Convert exercise dates
  Object.values(migratedState.exercises).forEach((exercise: any) => {
    if (exercise.completedAt && typeof exercise.completedAt === 'string') {
      exercise.completedAt = new Date(exercise.completedAt);
    }
    // Convert set completion dates
    if (exercise.sets) {
      exercise.sets.forEach((set: any) => {
        if (set.completedAt && typeof set.completedAt === 'string') {
          set.completedAt = new Date(set.completedAt);
        }
      });
    }
  });
  
  return migratedState;
}

async function clearStorageState(): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.removeItem(WORKOUT_STATE_KEY),
      AsyncStorage.removeItem(WORKOUT_BACKUP_KEY)
    ]);
    console.log('🗑️ WorkoutContext: Storage cleared');
  } catch (error) {
    console.error('💥 WorkoutContext: Error clearing storage:', error);
  }
}

function workoutContextReducer(state: WorkoutContextState, action: WorkoutAction): WorkoutContextState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_HYDRATED':
      return { ...state, isHydrated: action.payload };
    
    case 'SET_SAVING':
      return { ...state, isSaving: action.payload };
    
    case 'SET_ERROR':
      return { ...state, lastError: action.payload };
    
    case 'HYDRATE_FROM_STORAGE':
      if (action.payload) {
        return {
          ...state,
          workoutState: action.payload,
          isLoading: false,
          isHydrated: true,
          lastError: null,
        };
      } else {
        return {
          ...state,
          workoutState: initialWorkoutState,
          isLoading: false,
          isHydrated: true,
          lastError: null,
        };
      }
    
    default:
      // Handle workout state changes
      const newWorkoutState = workoutReducer(state.workoutState, action);
      if (newWorkoutState === state.workoutState) {
        return state; // No change
      }
      return {
        ...state,
        workoutState: newWorkoutState,
        lastError: null, // Clear errors on successful state change
      };
  }
}

function workoutReducer(state: WorkoutState, action: WorkoutAction): WorkoutState {
  let newState: WorkoutState;
  
  switch (action.type) {
    case 'START_WORKOUT':
      newState = {
        ...state,
        routineId: action.payload.routineId,
        routineName: action.payload.routineName,
        isWorkoutActive: true,
        startTime: new Date(),
        endTime: null,
        exercises: {}, // Reset exercises for new workout
        exerciseOrder: [],
      };
      break;

    case 'END_WORKOUT':
      // Save workout to history before ending
      saveWorkoutToHistory(state).then(savedWorkout => {
        if (savedWorkout) {
          console.log('✅ WorkoutContext: Workout saved to history');
        }
      }).catch(error => {
        console.error('💥 WorkoutContext: Error saving workout to history:', error);
      });
      
      newState = {
        ...state,
        isWorkoutActive: false,
        endTime: new Date(),
        currentExerciseId: null,
      };
      // Clear storage after workout ends
      AsyncStorage.removeItem(WORKOUT_STATE_KEY).catch(error => {
        console.error('Error clearing workout state:', error);
      });
      break;

    case 'RESET_WORKOUT':
      // Clear storage and return to initial state
      AsyncStorage.removeItem(WORKOUT_STATE_KEY).catch(error => {
        console.error('Error clearing workout state:', error);
      });
      return initialWorkoutState;

    case 'SET_CURRENT_EXERCISE':
      newState = {
        ...state,
        currentExerciseId: action.payload,
      };
      break;

    case 'INITIALIZE_EXERCISE':
      const { exerciseId, exerciseName, defaultSets, progressionSuggestion } = action.payload;
      if (state.exercises[exerciseId]) {
        // Exercise already exists, don't overwrite
        return state;
      }
      newState = {
        ...state,
        exercises: {
          ...state.exercises,
          [exerciseId]: {
            exerciseId,
            exerciseName,
            sets: defaultSets,
            isCompleted: false,
            order: state.exerciseOrder.length,
            progressionSuggestion,
          },
        },
        exerciseOrder: [...state.exerciseOrder, exerciseId],
      };
      break;

    case 'UPDATE_EXERCISE_SETS':
      const exerciseData = state.exercises[action.payload.exerciseId];
      if (!exerciseData) return state;

      newState = {
        ...state,
        exercises: {
          ...state.exercises,
          [action.payload.exerciseId]: {
            ...exerciseData,
            sets: action.payload.sets,
          },
        },
      };
      break;

    case 'COMPLETE_EXERCISE':
      const exercise = state.exercises[action.payload];
      if (!exercise) return state;

      newState = {
        ...state,
        exercises: {
          ...state.exercises,
          [action.payload]: {
            ...exercise,
            isCompleted: true,
            completedAt: new Date(),
          },
        },
      };
      break;

    case 'UNCOMPLETE_EXERCISE':
      const uncompletedExercise = state.exercises[action.payload];
      if (!uncompletedExercise) return state;

      newState = {
        ...state,
        exercises: {
          ...state.exercises,
          [action.payload]: {
            ...uncompletedExercise,
            isCompleted: false,
            completedAt: undefined,
          },
        },
      };
      break;

    case 'FILL_ALL_SETS':
      const targetExercise = state.exercises[action.payload.exerciseId];
      if (!targetExercise) return state;

      const filledSets = targetExercise.sets.map(set => ({
        ...set,
        weight: action.payload.weight,
        reps: action.payload.reps,
        completed: true,
      }));

      newState = {
        ...state,
        exercises: {
          ...state.exercises,
          [action.payload.exerciseId]: {
            ...targetExercise,
            sets: filledSets,
          },
        },
      };
      break;

    case 'REORDER_EXERCISES':
      newState = {
        ...state,
        exerciseOrder: action.payload,
      };
      break;

    case 'ADD_EXERCISE':
      // Create default sets for the new exercise
      const defaultSetsForNew: WorkoutSet[] = [
        { id: '1', weight: '', reps: '12', completed: false, type: 'Warmup' },
        { id: '2', weight: '', reps: '10', completed: false, type: 'Normal' },
        { id: '3', weight: '', reps: '8', completed: false, type: 'Normal' },
      ];
      
      newState = {
        ...state,
        exercises: {
          ...state.exercises,
          [action.payload.exerciseId]: {
            exerciseId: action.payload.exerciseId,
            exerciseName: action.payload.exerciseName,
            sets: defaultSetsForNew,
            isCompleted: false,
            order: state.exerciseOrder.length,
          },
        },
        exerciseOrder: [...state.exerciseOrder, action.payload.exerciseId],
      };
      break;

    case 'REMOVE_EXERCISE':
      const { [action.payload]: removed, ...remainingExercises } = state.exercises;
      newState = {
        ...state,
        exercises: remainingExercises,
        exerciseOrder: state.exerciseOrder.filter(id => id !== action.payload),
      };
      break;

    case 'LOAD_WORKOUT_STATE':
      return action.payload;

    default:
      return state;
  }
  
  // Save state to AsyncStorage after each change (except END_WORKOUT and RESET_WORKOUT)
  if (action.type !== 'END_WORKOUT' && action.type !== 'RESET_WORKOUT' && action.type !== 'LOAD_WORKOUT_STATE') {
    saveStateToStorage(newState);
  }
  
  return newState;
}

interface WorkoutContextType {
  // Workout state
  state: WorkoutState;
  
  // Loading and hydration states
  isLoading: boolean;
  isHydrated: boolean;
  isSaving: boolean;
  lastError: string | null;
  
  // Workout actions
  startWorkout: (routineId: string, routineName: string) => void;
  endWorkout: () => void;
  resetWorkout: () => void;
  setCurrentExercise: (exerciseId: string) => void;
  initializeExercise: (exerciseId: string, exerciseName: string, defaultSets: WorkoutSet[], progressionSuggestion?: ProgressionSuggestion) => void;
  updateExerciseSets: (exerciseId: string, sets: WorkoutSet[]) => void;
  completeExercise: (exerciseId: string) => void;
  uncompleteExercise: (exerciseId: string) => void;
  fillAllSets: (exerciseId: string, weight: string, reps: string) => void;
  getExerciseData: (exerciseId: string) => ExerciseData | undefined;
  isExerciseCompleted: (exerciseId: string) => boolean;
  reorderExercises: (newOrder: string[]) => void;
  addExercise: (exerciseId: string, exerciseName: string) => void;
  removeExercise: (exerciseId: string) => void;
  getOrderedExercises: () => ExerciseData[];
  
  // Storage actions
  forceSync: () => Promise<void>;
  clearError: () => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workoutReducer, initialWorkoutState);
  const [isLoading, setIsLoading] = React.useState(true);

  // Load saved workout state on mount
  useEffect(() => {
    const loadWorkoutState = async () => {
      try {
        const savedState = await AsyncStorage.getItem(WORKOUT_STATE_KEY);
        if (savedState) {
          const parsedState = safeJsonParseWithDates(savedState, null);
          if (!parsedState) {
            setIsLoading(false);
            return;
          }
          
          // Check if saved workout is still valid (not older than 24 hours)
          if (parsedState.startTime) {
            const startTime = new Date(parsedState.startTime);
            const now = new Date();
            const hoursSinceStart = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
            
            // If workout is older than 24 hours and not active, clear it
            if (hoursSinceStart > 24 && !parsedState.isWorkoutActive) {
              await AsyncStorage.removeItem(WORKOUT_STATE_KEY);
              setIsLoading(false);
              return;
            }
          }
          
          // Convert date strings back to Date objects
          if (parsedState.startTime) {
            parsedState.startTime = new Date(parsedState.startTime);
          }
          if (parsedState.endTime) {
            parsedState.endTime = new Date(parsedState.endTime);
          }
          // Convert completedAt dates
          Object.values(parsedState.exercises).forEach((exercise: any) => {
            if (exercise.completedAt) {
              exercise.completedAt = new Date(exercise.completedAt);
            }
            // Convert set completedAt dates
            if (exercise.sets) {
              exercise.sets.forEach((set: any) => {
                if (set.completedAt) {
                  set.completedAt = new Date(set.completedAt);
                }
              });
            }
          });
          dispatch({ type: 'LOAD_WORKOUT_STATE', payload: parsedState });
        }
      } catch (error) {
        console.error('WorkoutProvider: Error loading workout state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkoutState();
  }, []); // Only run on mount

  const contextValue: WorkoutContextType = {
    state,
    startWorkout: (routineId: string, routineName: string) => {
      dispatch({ type: 'START_WORKOUT', payload: { routineId, routineName } });
    },
    endWorkout: () => {
      dispatch({ type: 'END_WORKOUT' });
    },
    resetWorkout: () => {
      dispatch({ type: 'RESET_WORKOUT' });
    },
    setCurrentExercise: (exerciseId: string) => {
      dispatch({ type: 'SET_CURRENT_EXERCISE', payload: exerciseId });
    },
    initializeExercise: (exerciseId: string, exerciseName: string, defaultSets: WorkoutSet[], progressionSuggestion?: ProgressionSuggestion) => {
      dispatch({ type: 'INITIALIZE_EXERCISE', payload: { exerciseId, exerciseName, defaultSets, progressionSuggestion } });
    },
    updateExerciseSets: (exerciseId: string, sets: WorkoutSet[]) => {
      dispatch({ type: 'UPDATE_EXERCISE_SETS', payload: { exerciseId, sets } });
    },
    completeExercise: (exerciseId: string) => {
      dispatch({ type: 'COMPLETE_EXERCISE', payload: exerciseId });
    },
    uncompleteExercise: (exerciseId: string) => {
      dispatch({ type: 'UNCOMPLETE_EXERCISE', payload: exerciseId });
    },
    fillAllSets: (exerciseId: string, weight: string, reps: string) => {
      dispatch({ type: 'FILL_ALL_SETS', payload: { exerciseId, weight, reps } });
    },
    getExerciseData: (exerciseId: string) => {
      return state.exercises[exerciseId];
    },
    isExerciseCompleted: (exerciseId: string) => {
      return state.exercises[exerciseId]?.isCompleted || false;
    },
    reorderExercises: (newOrder: string[]) => {
      dispatch({ type: 'REORDER_EXERCISES', payload: newOrder });
    },
    addExercise: (exerciseId: string, exerciseName: string) => {
      dispatch({ type: 'ADD_EXERCISE', payload: { exerciseId, exerciseName } });
    },
    removeExercise: (exerciseId: string) => {
      dispatch({ type: 'REMOVE_EXERCISE', payload: exerciseId });
    },
    getOrderedExercises: () => {
      return state.exerciseOrder
        .map(id => state.exercises[id])
        .filter(Boolean);
    },
  };

  // Don't block rendering while loading - just use initial state
  // This prevents the white screen issue

  return (
    <WorkoutContext.Provider value={contextValue}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
}