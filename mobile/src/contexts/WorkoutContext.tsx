import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { safeJsonParse, safeJsonStringify } from '../utils/safeJsonParse';
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
  | { type: 'LOAD_WORKOUT_STATE'; payload: WorkoutState };

const WORKOUT_STATE_KEY = '@workout_state';

const initialState: WorkoutState = {
  routineId: null,
  routineName: null,
  exercises: {},
  exerciseOrder: [],
  currentExerciseId: null,
  isWorkoutActive: false,
  startTime: null,
  endTime: null,
};

// Helper function to save state to AsyncStorage
async function saveStateToStorage(state: WorkoutState) {
  try {
    await AsyncStorage.setItem(WORKOUT_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving workout state:', error);
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
          console.log('Workout saved to history:', savedWorkout.id);
        }
      });
      
      newState = {
        ...state,
        isWorkoutActive: false,
        endTime: new Date(),
        currentExerciseId: null,
      };
      // Clear storage after workout ends
      AsyncStorage.removeItem(WORKOUT_STATE_KEY);
      return newState;

    case 'RESET_WORKOUT':
      AsyncStorage.removeItem(WORKOUT_STATE_KEY);
      return initialState;

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
      newState = {
        ...state,
        exercises: {
          ...state.exercises,
          [action.payload.exerciseId]: {
            exerciseId: action.payload.exerciseId,
            exerciseName: action.payload.exerciseName,
            sets: [],
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

  // Save state to AsyncStorage after each change (except END_WORKOUT and RESET)
  if (action.type !== 'END_WORKOUT' && action.type !== 'RESET_WORKOUT') {
    saveStateToStorage(newState);
  }
  
  return newState;
}

interface WorkoutContextType {
  state: WorkoutState;
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
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workoutReducer, initialState);
  const [isLoading, setIsLoading] = React.useState(true);

  // Load saved workout state on mount
  useEffect(() => {
    const loadWorkoutState = async () => {
      try {
        console.log('WorkoutProvider: Starting to load workout state');
        
        // TEMPORARILY DISABLE AsyncStorage loading for debugging
        console.log('WorkoutProvider: DEBUGGING - AsyncStorage loading DISABLED');
        setIsLoading(false);
        return;
        
        const savedState = await AsyncStorage.getItem(WORKOUT_STATE_KEY);
        if (savedState) {
          console.log('WorkoutProvider: Found saved state, parsing...');
          const parsedState = safeJsonParse(savedState, null);
          if (!parsedState) return;
          
          // Check if current state has an active workout that's newer
          const currentHasActiveWorkout = state.isWorkoutActive && state.startTime;
          const savedIsOlderOrEmpty = !parsedState.isWorkoutActive || 
            (currentHasActiveWorkout && state.startTime && parsedState.startTime && 
             new Date(state.startTime).getTime() > new Date(parsedState.startTime).getTime());
          
          if (currentHasActiveWorkout && savedIsOlderOrEmpty) {
            console.log('WorkoutProvider: Skipping AsyncStorage load - current workout is newer/active');
            console.log('  - Current workout active:', state.isWorkoutActive, 'exercises:', Object.keys(state.exercises));
            console.log('  - Saved workout active:', parsedState.isWorkoutActive, 'exercises:', Object.keys(parsedState.exercises || {}));
          } else {
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
            });
            console.log('WorkoutProvider: Loading saved state - exercises:', Object.keys(parsedState.exercises || {}));
            dispatch({ type: 'LOAD_WORKOUT_STATE', payload: parsedState });
            console.log('WorkoutProvider: State loaded successfully');
          }
        } else {
          console.log('WorkoutProvider: No saved state found');
        }
      } catch (error) {
        console.error('WorkoutProvider: Error loading workout state:', error);
      } finally {
        setIsLoading(false);
        console.log('WorkoutProvider: Loading complete');
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