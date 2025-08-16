import EXERCISE_DATABASE from '../data/exerciseDatabase';
import { supabase, EXERCISE_GIFS_BUCKET } from '../config/supabase';
import { urlCache } from './urlCache';

// Map muscle groups to Supabase folder names
const MUSCLE_TO_FOLDER: Record<string, string> = {
  '가슴': 'pectorals',
  '등': 'back',
  '어깨': 'shoulders',
  '삼각근': 'shoulders',
  '이두': 'biceps',
  '이두근': 'biceps',
  '삼두': 'triceps',
  '삼두근': 'triceps',
  '복근': 'abs',
  '복부': 'abs',
  '대퇴사두': 'quadriceps',
  '대퇴사두근': 'quadriceps',
  '햄스트링': 'hamstrings',
  '둔근': 'glutes',
  '종아리': 'calves',
  '전완': 'forearms',
  '승모근': 'traps',
  '광배근': 'back',
  '대흉근': 'pectorals',
};

// Get Supabase URL for GIFs - GIFs are stored in the new project
const getSupabaseStorageUrl = () => {
  // GIFs have been migrated to the new project
  return 'https://ayttqsgttuvdhvbvbnsk.supabase.co/storage/v1/object/public/exercise-gifs';
};

/**
 * Get the Supabase folder name for a muscle group
 */
function getSupabaseFolder(primaryMuscle: string): string {
  // Check if primaryMuscle is valid
  if (!primaryMuscle || typeof primaryMuscle !== 'string') {
    console.warn('getSupabaseFolder received invalid input:', primaryMuscle);
    return 'unknown';
  }
  
  // Check direct mapping
  if (MUSCLE_TO_FOLDER[primaryMuscle]) {
    return MUSCLE_TO_FOLDER[primaryMuscle];
  }
  
  // Check if muscle name contains any mapped keyword
  for (const [key, folder] of Object.entries(MUSCLE_TO_FOLDER)) {
    if (primaryMuscle.includes(key)) {
      return folder;
    }
  }
  
  // Default fallback - use lowercase muscle name
  return primaryMuscle.toLowerCase();
}

/**
 * Clean exercise ID for use in URL
 */
function cleanExerciseId(exerciseId: string): string {
  // Check if exerciseId is valid
  if (!exerciseId || typeof exerciseId !== 'string') {
    console.warn('cleanExerciseId received invalid input:', exerciseId);
    return 'unknown-exercise';
  }
  
  // Remove special characters and normalize
  return exerciseId
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special chars except hyphen and underscore
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Replace multiple hyphens with single
    .trim();
}

/**
 * Generate all possible GIF URLs for an exercise
 */
export function getExerciseGifUrls(exerciseId: string): string[] {
  // Check cache first
  const cached = urlCache.get(exerciseId);
  if (cached) {
    return cached;
  }
  
  const urls: string[] = [];
  
  // Validate exerciseId
  if (!exerciseId || typeof exerciseId !== 'string') {
    console.warn('getExerciseGifUrls received invalid exerciseId:', exerciseId);
    return urls;
  }
  
  // Look up exercise in database - ensure type compatibility
  const exercise = EXERCISE_DATABASE.find(ex => {
    // Handle both string and number IDs
    return ex && (ex.id === exerciseId || String(ex.id) === exerciseId);
  });
  
  if (exercise) {
    // Strategy 1: Use imageUrl if it exists and is a Supabase URL
    if (exercise.imageUrl) {
      if (exercise.imageUrl.includes('supabase')) {
        urls.push(exercise.imageUrl);
      } else if (exercise.imageUrl.includes('exercise-gifs')) {
        // If it's a relative path, convert to full Supabase URL
        const fileName = exercise.imageUrl.split('/').pop();
        if (fileName) {
          // Use muscleGroup since primaryMuscle doesn't exist in ExerciseData
          const folder = getSupabaseFolder(exercise.muscleGroup || 'unknown');
          const SUPABASE_URL = getSupabaseStorageUrl();
          urls.push(`${SUPABASE_URL}/${folder}/${fileName}`);
        }
      }
    }
    
    // Strategy 2: Try with muscle folder structure
    // Note: ExerciseData only has muscleGroup, not primaryMuscle
    const muscleGroup = exercise.muscleGroup || 'unknown';
    const folder = getSupabaseFolder(muscleGroup);
    const cleanId = cleanExerciseId(exerciseId);
    const SUPABASE_URL = getSupabaseStorageUrl();
    
    // Try different naming conventions
    urls.push(`${SUPABASE_URL}/${folder}/${cleanId}.gif`);
    urls.push(`${SUPABASE_URL}/${folder}/${cleanId.replace(/-/g, '_')}.gif`);
    urls.push(`${SUPABASE_URL}/${folder}/${cleanId.replace(/-/g, '')}.gif`);
    
    // Strategy 3: Try without folder (root level)
    urls.push(`${SUPABASE_URL}/${cleanId}.gif`);
    urls.push(`${SUPABASE_URL}/${cleanId.replace(/-/g, '_')}.gif`);
  } else {
    // If exercise not found in database, try generic patterns
    const cleanId = cleanExerciseId(exerciseId);
    const SUPABASE_URL = getSupabaseStorageUrl();
    
    // Try common muscle folders
    const commonFolders = ['pectorals', 'back', 'shoulders', 'biceps', 'triceps', 'abs', 'quadriceps', 'hamstrings', 'glutes'];
    for (const folder of commonFolders) {
      urls.push(`${SUPABASE_URL}/${folder}/${cleanId}.gif`);
    }
    
    // Try root level
    urls.push(`${SUPABASE_URL}/${cleanId}.gif`);
  }
  
  // Remove duplicates
  const uniqueUrls = [...new Set(urls)];
  
  // Cache the result
  urlCache.set(exerciseId, uniqueUrls);
  
  return uniqueUrls;
}

/**
 * Get a placeholder image URL for an exercise
 */
export function getPlaceholderUrl(exerciseName: string = 'Exercise'): string {
  return `https://via.placeholder.com/400x300/4ECDC4/ffffff?text=${encodeURIComponent(exerciseName)}`;
}

/**
 * Test if an image URL is accessible
 */
export async function testImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok && response.headers.get('content-type')?.includes('image');
  } catch {
    return false;
  }
}