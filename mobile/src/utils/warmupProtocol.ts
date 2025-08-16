// Warm-up protocol utilities for safe exercise progression

export interface WarmupSet {
  weight: number;
  reps: number;
  intensity: 'light' | 'moderate' | 'heavy';
  restSeconds: number;
}

export interface WarmupProtocol {
  sets: WarmupSet[];
  totalDuration: number; // in seconds
  notes: string;
}

// Generate warm-up sets based on working weight
export function generateWarmupSets(workingWeight: number): WarmupSet[] {
  if (workingWeight <= 0) return [];
  
  const warmupSets: WarmupSet[] = [];
  
  // For very light weights (< 20kg), minimal warm-up
  if (workingWeight < 20) {
    warmupSets.push({
      weight: 0,
      reps: 10,
      intensity: 'light',
      restSeconds: 30,
    });
    warmupSets.push({
      weight: Math.round(workingWeight * 0.5),
      reps: 5,
      intensity: 'moderate',
      restSeconds: 45,
    });
    return warmupSets;
  }
  
  // Standard warm-up protocol
  // Set 1: Empty bar or bodyweight (if applicable)
  const emptyBarWeight = workingWeight >= 60 ? 20 : 0; // Standard bar is 20kg
  warmupSets.push({
    weight: emptyBarWeight,
    reps: 10,
    intensity: 'light',
    restSeconds: 30,
  });
  
  // Set 2: 40% of working weight
  warmupSets.push({
    weight: Math.round(workingWeight * 0.4),
    reps: 8,
    intensity: 'light',
    restSeconds: 45,
  });
  
  // Set 3: 60% of working weight
  warmupSets.push({
    weight: Math.round(workingWeight * 0.6),
    reps: 5,
    intensity: 'moderate',
    restSeconds: 60,
  });
  
  // Set 4: 80% of working weight (for heavy lifts)
  if (workingWeight >= 60) {
    warmupSets.push({
      weight: Math.round(workingWeight * 0.8),
      reps: 3,
      intensity: 'moderate',
      restSeconds: 90,
    });
  }
  
  // Set 5: 90% of working weight (for very heavy lifts)
  if (workingWeight >= 100) {
    warmupSets.push({
      weight: Math.round(workingWeight * 0.9),
      reps: 1,
      intensity: 'heavy',
      restSeconds: 120,
    });
  }
  
  return warmupSets;
}

// Get warm-up protocol for specific exercise types
export function getWarmupProtocol(
  exerciseType: 'compound' | 'isolation' | 'bodyweight',
  workingWeight: number
): WarmupProtocol {
  let sets: WarmupSet[] = [];
  let notes = '';
  
  switch (exerciseType) {
    case 'compound':
      // Compound movements need thorough warm-up
      sets = generateWarmupSets(workingWeight);
      notes = '복합 운동: 충분한 워밍업이 필요합니다. 각 세트 사이 충분한 휴식을 취하세요.';
      break;
      
    case 'isolation':
      // Isolation exercises need less warm-up
      if (workingWeight > 10) {
        sets = [
          {
            weight: Math.round(workingWeight * 0.5),
            reps: 12,
            intensity: 'light',
            restSeconds: 30,
          },
          {
            weight: Math.round(workingWeight * 0.75),
            reps: 8,
            intensity: 'moderate',
            restSeconds: 45,
          },
        ];
      }
      notes = '고립 운동: 가벼운 워밍업으로 충분합니다.';
      break;
      
    case 'bodyweight':
      // Bodyweight exercises use mobility and activation
      sets = [
        {
          weight: 0,
          reps: 10,
          intensity: 'light',
          restSeconds: 30,
        },
        {
          weight: 0,
          reps: 5,
          intensity: 'moderate',
          restSeconds: 30,
        },
      ];
      notes = '맨몸 운동: 동적 스트레칭과 활성화 동작을 수행하세요.';
      break;
  }
  
  const totalDuration = sets.reduce((total, set) => total + set.restSeconds + 30, 0); // 30s per set execution
  
  return {
    sets,
    totalDuration,
    notes,
  };
}

// Check if exercise is compound movement
export function isCompoundExercise(exerciseName: string): boolean {
  const compoundExercises = [
    'squat', '스쿼트',
    'deadlift', '데드리프트',
    'bench', '벤치',
    'press', '프레스',
    'row', '로우',
    'pull', '풀',
    'clean', '클린',
    'snatch', '스내치',
    'thruster',
    'lunge', '런지',
  ];
  
  const lowerName = exerciseName.toLowerCase();
  return compoundExercises.some(compound => lowerName.includes(compound));
}

// Check if exercise is isolation movement
export function isIsolationExercise(exerciseName: string): boolean {
  const isolationExercises = [
    'curl', '컬',
    'extension', '익스텐션',
    'fly', '플라이',
    'raise', '레이즈',
    'shrug', '슈러그',
    'kickback', '킥백',
    'calf', '카프',
    'crunch', '크런치',
    'plank', '플랭크',
  ];
  
  const lowerName = exerciseName.toLowerCase();
  return isolationExercises.some(isolation => lowerName.includes(isolation));
}

// Determine exercise type from name
export function getExerciseType(exerciseName: string): 'compound' | 'isolation' | 'bodyweight' {
  if (exerciseName.toLowerCase().includes('bodyweight') || 
      exerciseName.toLowerCase().includes('맨몸')) {
    return 'bodyweight';
  }
  
  if (isCompoundExercise(exerciseName)) {
    return 'compound';
  }
  
  if (isIsolationExercise(exerciseName)) {
    return 'isolation';
  }
  
  // Default to compound for safety (more warm-up)
  return 'compound';
}

// Check if user should warm up based on conditions
export function shouldPerformWarmup(
  workingWeight: number,
  exerciseType: 'compound' | 'isolation' | 'bodyweight',
  isFirstExercise: boolean,
  lastWorkoutDate?: Date
): boolean {
  // Always warm up for first exercise
  if (isFirstExercise) return true;
  
  // Always warm up for compound movements
  if (exerciseType === 'compound') return true;
  
  // Always warm up for heavy weights
  if (workingWeight >= 60) return true;
  
  // Warm up if it's been more than 2 hours since last workout
  if (lastWorkoutDate) {
    const hoursSinceLastWorkout = (Date.now() - lastWorkoutDate.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastWorkout > 2) return true;
  }
  
  return false;
}

// Format warm-up set for display
export function formatWarmupSet(set: WarmupSet): string {
  if (set.weight === 0) {
    return `맨몸 ${set.reps}회`;
  }
  return `${set.weight}kg × ${set.reps}회`;
}

// Get warm-up recommendation message
export function getWarmupRecommendation(
  exerciseName: string,
  workingWeight: number,
  isFirstExercise: boolean
): string {
  const exerciseType = getExerciseType(exerciseName);
  const shouldWarmup = shouldPerformWarmup(workingWeight, exerciseType, isFirstExercise);
  
  if (!shouldWarmup) {
    return '워밍업이 필요하지 않습니다.';
  }
  
  const protocol = getWarmupProtocol(exerciseType, workingWeight);
  const setDescriptions = protocol.sets.map(formatWarmupSet).join(', ');
  
  return `권장 워밍업: ${setDescriptions}\n${protocol.notes}`;
}