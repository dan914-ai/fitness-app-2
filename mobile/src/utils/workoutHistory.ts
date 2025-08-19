import { WorkoutState, ExerciseData } from '../contexts/WorkoutContext';
import storageService from '../services/storage.service';
import { calculateAdjustedVolume } from './workoutCalculations';
import { exerciseDatabaseService } from '../services/exerciseDatabase.service';

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
  memo?: string; // Added memo field
}

export async function saveWorkoutToHistory(workoutState: WorkoutState): Promise<WorkoutHistoryItem | null> {
  try {
    console.log('[SaveWorkout] === FULL STATE DUMP ===');
    console.log('[SaveWorkout] isWorkoutActive:', workoutState.isWorkoutActive);
    console.log('[SaveWorkout] startTime:', workoutState.startTime);
    console.log('[SaveWorkout] startTime type:', typeof workoutState.startTime);
    console.log('[SaveWorkout] startTime value:', workoutState.startTime ? workoutState.startTime.toString() : 'NULL');
    console.log('[SaveWorkout] routineName:', workoutState.routineName);
    console.log('[SaveWorkout] routineId:', workoutState.routineId);
    console.log('[SaveWorkout] exercises count:', Object.keys(workoutState.exercises).length);
    console.log('[SaveWorkout] === END STATE DUMP ===');

    // TEMPORARY: Allow saving even without isWorkoutActive flag if we have exercises and start time
    const hasExercises = Object.keys(workoutState.exercises).length > 0;
    const hasCompletedSets = Object.values(workoutState.exercises).some(ex => 
      ex.sets.some(set => set.completed)
    );
    
    if (!workoutState.startTime) {
      console.log('[SaveWorkout] WARNING: No start time, using current time as fallback');
      workoutState.startTime = new Date();
    }
    
    if (!hasCompletedSets) {
      console.log('[SaveWorkout] CRITICAL: No completed sets to save');
      return null;
    }

    const endTime = new Date();
    const startTimeDate = workoutState.startTime instanceof Date 
      ? workoutState.startTime 
      : new Date(workoutState.startTime);
    
    const duration = Math.floor((endTime.getTime() - startTimeDate.getTime()) / 1000);
    console.log('[SaveWorkout] Duration calculated:', {
      endTime: endTime.toISOString(),
      startTime: startTimeDate.toISOString(),
      duration: duration,
      durationMinutes: Math.floor(duration / 60),
    });

    // Calculate workout statistics
    let totalVolume = 0;
    let totalSets = 0;
    const completedExercises = Object.values(workoutState.exercises).filter(ex => ex.isCompleted).length;

    const exercises = Object.values(workoutState.exercises).map(exercise => {
      // Get exercise data to check equipment type
      const exerciseData = exerciseDatabaseService.getExerciseById(exercise.exerciseId) || 
                          exerciseDatabaseService.getExerciseByName(exercise.exerciseName);
      
      const equipment = exerciseData?.equipment || '기타';
      const englishName = exerciseData?.englishName || '';
      
      const exerciseVolume = exercise.sets.reduce((total, set) => {
        if (set.completed && set.weight && set.reps) {
          // Use the adjusted volume calculation
          const adjustedVolume = calculateAdjustedVolume(
            parseFloat(set.weight),
            parseInt(set.reps),
            exercise.exerciseName,
            equipment,
            englishName
          );
          totalVolume += adjustedVolume;
          totalSets++;
          return total + adjustedVolume;
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
      startTime: startTimeDate.toISOString(),
      endTime: endTime.toISOString(),
      duration,
      exercises,
      totalVolume,
      totalSets,
      completedExercises,
    };
    
    console.log('[SaveWorkout] Created workout history item:', {
      id: workoutHistoryItem.id,
      routineName: workoutHistoryItem.routineName,
      date: workoutHistoryItem.date,
      duration: workoutHistoryItem.duration,
      totalSets: workoutHistoryItem.totalSets,
    });

    // Save to history using storage service
    console.log('[SaveWorkout] Saving to storage...');
    await storageService.addWorkoutToHistory(workoutHistoryItem);
    
    // Verify the save was successful
    const savedWorkout = await getWorkoutById(workoutHistoryItem.id);
    if (!savedWorkout) {
      console.error('[SaveWorkout] Verification failed - workout not found after save!');
      throw new Error('Failed to verify workout save');
    }
    console.log('[SaveWorkout] Verification successful - workout saved with ID:', workoutHistoryItem.id);

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
    console.log('[getWorkoutById] Looking for workout with ID:', workoutId);
    const history = await getWorkoutHistory();
    console.log('[getWorkoutById] Total workouts in history:', history.length);
    console.log('[getWorkoutById] Available workout IDs:', history.map(w => w.id));
    
    const found = history.find(workout => workout.id === workoutId);
    console.log('[getWorkoutById] Found workout:', found ? 'YES' : 'NO');
    
    return found || null;
  } catch (error) {
    console.error('[getWorkoutById] Error loading workout:', error);
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

// Get the actual weights from the last workout (not just max)
export async function getLastExerciseWeights(exerciseId: string): Promise<{ warmup: number; normal: number[] }> {
  try {
    const history = await getWorkoutHistory();
    
    // Sort workouts by date (most recent first)  
    const sortedHistory = history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Find the most recent workout that contains this exercise
    for (const workout of sortedHistory) {
      const exercise = workout.exercises.find(ex => {
        // Try different matching strategies
        const exId = ex.exerciseId?.toLowerCase() || '';
        const searchId = exerciseId.toLowerCase();
        
        // Direct match
        if (exId === searchId) return true;
        
        // Try with/without hyphens and underscores
        const normalizedExId = exId.replace(/[-_]/g, '');
        const normalizedSearchId = searchId.replace(/[-_]/g, '');
        if (normalizedExId === normalizedSearchId) return true;
        
        // Partial match for compound exercises
        const match = normalizedExId.includes(normalizedSearchId) || normalizedSearchId.includes(normalizedExId);
        return match;
      });
      
      if (exercise && exercise.sets.length > 0) {
        // Get warmup weight (first warmup set found)
        const warmupSet = exercise.sets.find(set => set.type === 'Warmup' || set.type === 'warmup');
        const warmupWeight = warmupSet ? (parseFloat(warmupSet.weight) || 0) : 0;
        
        // Get normal weights (all non-warmup sets)
        const normalWeights = exercise.sets
          .filter(set => set.type !== 'Warmup' && set.type !== 'warmup')
          .map(set => parseFloat(set.weight) || 0);
        
        return {
          warmup: warmupWeight,
          normal: normalWeights
        };
      }
    }
    
    return { warmup: 0, normal: [] };
  } catch (error) {
    console.error('Error getting last exercise weights:', error);
    return { warmup: 0, normal: [] };
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