import { exerciseDatabaseService } from '../services/exerciseDatabase.service';
import { getThumbnail } from '../constants/thumbnailMapping';

interface SafeExerciseData {
  id: string;
  name: string;
  gifUrl?: string;
  imageUrl?: string;
  thumbnail?: string;
  instructions?: string[];
  muscleGroup?: string;
  equipment?: string;
  difficulty?: string;
  isValid: boolean;
}

/**
 * Safely get exercise data with fallbacks for missing data
 */
export function getSafeExerciseData(exerciseId: string, exerciseName?: string): SafeExerciseData {
  // Try to get exercise from database
  let exerciseData = exerciseDatabaseService.getExerciseById(exerciseId);
  
  // If not found, try alternative ID formats
  if (!exerciseData) {
    // Try with underscores replaced by hyphens
    const altId1 = exerciseId.replace(/_/g, '-');
    exerciseData = exerciseDatabaseService.getExerciseById(altId1);
    
    if (!exerciseData) {
      // Try with hyphens replaced by underscores
      const altId2 = exerciseId.replace(/-/g, '_');
      exerciseData = exerciseDatabaseService.getExerciseById(altId2);
    }
  }

  // If still not found, create a minimal fallback
  if (!exerciseData) {
    return {
      id: exerciseId,
      name: exerciseName || 'Unknown Exercise',
      isValid: false,
      thumbnail: getThumbnail(exerciseId),
    };
  }

  // Return safe data with all fields
  return {
    id: exerciseData.exerciseId || exerciseId,
    name: exerciseData.exerciseName || exerciseName || 'Unknown Exercise',
    gifUrl: exerciseData.gifUrl,
    imageUrl: exerciseData.imageUrl,
    thumbnail: exerciseData.thumbnail || getThumbnail(exerciseData.exerciseId),
    instructions: exerciseData.instructions || [],
    muscleGroup: exerciseData.targetMuscle || exerciseData.muscleGroup,
    equipment: exerciseData.equipment,
    difficulty: exerciseData.difficulty,
    isValid: true,
  };
}

/**
 * Get a default set configuration for an exercise
 */
export function getDefaultSetsForExercise(exerciseId: string): any[] {
  const defaultSets = [
    { id: '1', type: 'normal', weight: '', reps: '', completed: false },
    { id: '2', type: 'normal', weight: '', reps: '', completed: false },
    { id: '3', type: 'normal', weight: '', reps: '', completed: false },
  ];

  // You could customize this based on exercise type
  const exerciseData = getSafeExerciseData(exerciseId);
  
  if (exerciseData.muscleGroup?.toLowerCase().includes('cardio')) {
    // For cardio exercises, might want time-based sets
    return [
      { id: '1', type: 'cardio', duration: '', distance: '', completed: false },
      { id: '2', type: 'cardio', duration: '', distance: '', completed: false },
    ];
  }
  
  return defaultSets;
}

/**
 * Validate exercise data before saving
 */
export function validateExerciseData(exerciseData: any): boolean {
  if (!exerciseData) return false;
  
  // Must have ID and name
  if (!exerciseData.id && !exerciseData.exerciseId) return false;
  if (!exerciseData.name && !exerciseData.exerciseName) return false;
  
  // Check if sets are valid (if present)
  if (exerciseData.sets && Array.isArray(exerciseData.sets)) {
    for (const set of exerciseData.sets) {
      if (set.completed && (!set.weight || !set.reps)) {
        return false; // Completed sets must have weight and reps
      }
    }
  }
  
  return true;
}

/**
 * Merge exercise data from multiple sources safely
 */
export function mergeExerciseData(
  primary: any,
  secondary: any,
  fallback?: any
): SafeExerciseData {
  const id = primary?.id || primary?.exerciseId || 
             secondary?.id || secondary?.exerciseId || 
             fallback?.id || 'unknown';
             
  const name = primary?.name || primary?.exerciseName || 
               secondary?.name || secondary?.exerciseName || 
               fallback?.name || 'Unknown Exercise';

  return {
    id,
    name,
    gifUrl: primary?.gifUrl || secondary?.gifUrl || fallback?.gifUrl,
    imageUrl: primary?.imageUrl || secondary?.imageUrl || fallback?.imageUrl,
    thumbnail: primary?.thumbnail || secondary?.thumbnail || getThumbnail(id),
    instructions: primary?.instructions || secondary?.instructions || [],
    muscleGroup: primary?.muscleGroup || secondary?.muscleGroup || fallback?.muscleGroup,
    equipment: primary?.equipment || secondary?.equipment || fallback?.equipment,
    difficulty: primary?.difficulty || secondary?.difficulty || fallback?.difficulty,
    isValid: !!(primary || secondary),
  };
}