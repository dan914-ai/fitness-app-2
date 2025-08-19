/**
 * Utility functions for workout calculations
 * Handles proper volume calculation considering equipment type and exercise characteristics
 */

/**
 * Determines if an exercise is unilateral (single-limb movement)
 * @param exerciseName - The name of the exercise
 * @param englishName - The English name of the exercise
 * @returns true if the exercise is unilateral
 */
export function isUnilateralExercise(exerciseName: string, englishName?: string): boolean {
  const unilateralKeywords = [
    // Korean keywords
    '싱글', '원암', '원레그', '얼터네이트', '런지', '불가리안', '피스톨', '스텝',
    '한쪽', '한손', '한발', '한다리', '한팔', '교대', '스플릿',
    // English keywords
    'single', 'one arm', 'one-arm', 'one leg', 'one-leg', 'unilateral',
    'alternate', 'alternating', 'lunge', 'bulgarian', 'pistol', 'step-up',
    'split', 'staggered', 'b-stance', 'single-arm', 'single-leg'
  ];
  
  const nameToCheck = exerciseName.toLowerCase();
  const englishToCheck = englishName?.toLowerCase() || '';
  
  return unilateralKeywords.some(keyword => 
    nameToCheck.includes(keyword) || englishToCheck.includes(keyword)
  );
}

/**
 * Determines if an exercise uses dumbbells
 * @param equipment - The equipment type from exercise data
 * @returns true if the exercise uses dumbbells
 */
export function isDumbbellExercise(equipment: string): boolean {
  // Handle null/undefined equipment
  if (!equipment) {
    return false;
  }
  
  const dumbbellKeywords = ['덤벨', 'dumbbell', 'db'];
  
  return dumbbellKeywords.some(keyword => 
    equipment.toLowerCase().includes(keyword)
  );
}

/**
 * Calculates the volume multiplier for an exercise
 * Dumbbells and unilateral exercises get 2x multiplier
 * @param exerciseName - The name of the exercise
 * @param equipment - The equipment type
 * @param englishName - The English name of the exercise
 * @returns The multiplier to apply to the volume (1 or 2)
 */
export function getVolumeMultiplier(
  exerciseName: string, 
  equipment: string, 
  englishName?: string
): number {
  // Check if it's a dumbbell exercise
  const isDumbbell = isDumbbellExercise(equipment);
  
  // Check if it's a unilateral exercise
  const isUnilateral = isUnilateralExercise(exerciseName, englishName);
  
  // If either condition is true, double the volume
  // We don't double twice if it's both dumbbell AND unilateral
  if (isDumbbell || isUnilateral) {
    return 2;
  }
  
  return 1;
}

/**
 * Calculates the adjusted volume for a set
 * @param weight - The weight in kg
 * @param reps - The number of reps
 * @param exerciseName - The name of the exercise
 * @param equipment - The equipment type
 * @param englishName - The English name of the exercise
 * @returns The adjusted volume
 */
export function calculateAdjustedVolume(
  weight: number,
  reps: number,
  exerciseName: string,
  equipment: string,
  englishName?: string
): number {
  const baseVolume = weight * reps;
  const multiplier = getVolumeMultiplier(exerciseName, equipment, englishName);
  return baseVolume * multiplier;
}

/**
 * Provides a description of why the volume was adjusted
 * @param exerciseName - The name of the exercise
 * @param equipment - The equipment type
 * @param englishName - The English name of the exercise
 * @returns A string describing the adjustment reason, or null if no adjustment
 */
export function getVolumeAdjustmentReason(
  exerciseName: string,
  equipment: string,
  englishName?: string
): string | null {
  const isDumbbell = isDumbbellExercise(equipment);
  const isUnilateral = isUnilateralExercise(exerciseName, englishName);
  
  if (isDumbbell && isUnilateral) {
    return '덤벨 & 편측 운동 (2x 볼륨)';
  } else if (isDumbbell) {
    return '덤벨 운동 (2x 볼륨)';
  } else if (isUnilateral) {
    return '편측 운동 (2x 볼륨)';
  }
  
  return null;
}