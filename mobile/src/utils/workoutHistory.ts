import { WorkoutState, ExerciseData } from '../contexts/WorkoutContext';
import storageService from '../services/storage.service';

export interface WorkoutHistoryItem {
  id: string;
  routineId: string;
  routineName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in seconds
  exercises: {
    exerciseId: string;
    exerciseName: string;
    bodyParts?: string[]; // Added for muscle group tracking
    sets: {
      weight: string;
      reps: string;
      type: string;
    }[];
    totalVolume: number;
  }[];
  totalVolume: number;
  totalSets: number;
  completedExercises: number;
  rating?: number; // 1-5 stars rating
}

export async function saveWorkoutToHistory(workoutState: WorkoutState): Promise<WorkoutHistoryItem | null> {
  try {
      isActive: workoutState.isWorkoutActive,
      startTime: workoutState.startTime,
      exerciseCount: Object.keys(workoutState.exercises).length
    });

    if (!workoutState.isWorkoutActive || !workoutState.startTime) {
      console.warn('❌ Cannot save incomplete workout - isActive:', workoutState.isWorkoutActive, 'startTime:', workoutState.startTime);
      return null;
    }

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - new Date(workoutState.startTime).getTime()) / 1000);

    // Calculate workout statistics
    let totalVolume = 0;
    let totalSets = 0;
    const completedExercises = Object.values(workoutState.exercises).filter(ex => ex.isCompleted).length;

    const exercises = Object.values(workoutState.exercises).map(exercise => {
      const exerciseVolume = exercise.sets.reduce((total, set) => {
        if (set.completed && set.weight && set.reps) {
          const volume = parseFloat(set.weight) * parseInt(set.reps);
          totalVolume += volume;
          totalSets++;
          return total + volume;
        }
        return total;
      }, 0);

      return {
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.exerciseName,
        sets: exercise.sets
          .filter(set => set.completed)
          .map(set => ({
            weight: set.weight,
            reps: set.reps,
            type: set.type,
          })),
        totalVolume: exerciseVolume,
      };
    }).filter(ex => ex.sets.length > 0); // Only include exercises with completed sets

    const workoutHistoryItem: WorkoutHistoryItem = {
      id: `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      routineId: workoutState.routineId || '',
      routineName: workoutState.routineName || '',
      date: endTime.toISOString().split('T')[0],
      startTime: workoutState.startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration,
      exercises,
      totalVolume,
      totalSets,
      completedExercises,
    };

    // Save to history using storage service
      id: workoutHistoryItem.id,
      routineName: workoutHistoryItem.routineName,
      exerciseCount: workoutHistoryItem.exercises.length,
      totalVolume: workoutHistoryItem.totalVolume,
      totalSets: workoutHistoryItem.totalSets
    });
    
    await storageService.addWorkoutToHistory(workoutHistoryItem);

    return workoutHistoryItem;
  } catch (error) {
    console.error('💥 Error saving workout to history:', error);
    throw error; // Re-throw so the calling function can handle it
  }
}

export async function getWorkoutHistory(): Promise<WorkoutHistoryItem[]> {
  try {
    return await storageService.getWorkoutHistory();
  } catch (error) {
    console.error('Error loading workout history:', error);
    return [];
  }
}

export async function getWorkoutById(workoutId: string): Promise<WorkoutHistoryItem | null> {
  try {
    const history = await getWorkoutHistory();
    return history.find(workout => workout.id === workoutId) || null;
  } catch (error) {
    console.error('Error loading workout:', error);
    return null;
  }
}

export async function deleteWorkout(workoutId: string): Promise<boolean> {
  try {
    await storageService.deleteWorkoutFromHistory(workoutId);
    return true;
  } catch (error) {
    console.error('Error deleting workout:', error);
    return false;
  }
}

export async function getWorkoutsByDateRange(startDate: Date, endDate: Date): Promise<WorkoutHistoryItem[]> {
  try {
    const history = await getWorkoutHistory();
    return history.filter(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= startDate && workoutDate <= endDate;
    });
  } catch (error) {
    console.error('Error filtering workouts by date:', error);
    return [];
  }
}

// Get the last recorded weight for a specific exercise
export async function getLastExerciseWeight(exerciseId: string): Promise<number> {
  
  try {
    const history = await getWorkoutHistory();
    
    // Sort workouts by date (most recent first)
    const sortedHistory = history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Find the most recent workout that included this exercise
    for (const workout of sortedHistory) {
      
      const exercise = workout.exercises.find(ex => {
        const match = ex.exerciseId === exerciseId || ex.exerciseId === exerciseId.toString();
        return match;
      });
      
      if (exercise && exercise.sets.length > 0) {
        
        // Get the heaviest weight from the sets (don't require completed=true for history data)
        const weights = exercise.sets
          .map(set => parseFloat(set.weight) || 0)
          .filter(weight => weight > 0);
        
        
        if (weights.length > 0) {
          const maxWeight = Math.max(...weights);
          return maxWeight;
        } else {
        }
      } else {
      }
    }
    
    return 0;
  } catch (error) {
    console.error('Error getting last exercise weight:', error);
    return 0;
  }
}

// Get exercise history records
export interface ExerciseHistoryRecord {
  date: string;
  workoutName: string;
  sets: {
    weight: string;
    reps: string;
    type: string;
  }[];
  totalVolume: number;
  maxWeight: number;
}

export async function getExerciseHistory(exerciseId: string, limit: number = 10): Promise<ExerciseHistoryRecord[]> {
  try {
    const history = await getWorkoutHistory();
    
    // Sort workouts by date (most recent first)
    const sortedHistory = history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const exerciseHistory: ExerciseHistoryRecord[] = [];
    
    for (const workout of sortedHistory) {
      const exercise = workout.exercises.find(ex => ex.exerciseId === exerciseId);
      if (exercise && exercise.sets.length > 0) {
        const weights = exercise.sets
          .map(set => parseFloat(set.weight) || 0)
          .filter(weight => weight > 0);
        
        exerciseHistory.push({
          date: workout.date,
          workoutName: workout.routineName,
          sets: exercise.sets,
          totalVolume: exercise.totalVolume,
          maxWeight: weights.length > 0 ? Math.max(...weights) : 0
        });
        
        if (exerciseHistory.length >= limit) break;
      }
    }
    
    return exerciseHistory;
  } catch (error) {
    console.error('Error getting exercise history:', error);
    return [];
  }
}