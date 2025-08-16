// Exercise categorization system for Korean fitness app
export type ExerciseCategory = 
  | 'compound'     // 복합운동
  | 'isolation';   // 고립운동

export type BodyPart = 
  | '가슴'     // Chest/Pectorals
  | '등'       // Back  
  | '어깨'     // Shoulders/Deltoids
  | '이두근'   // Biceps
  | '삼두근'   // Triceps
  | '전완근'   // Forearms
  | '허벅지'   // Quadriceps
  | '햄스트링' // Hamstrings
  | '둔근'     // Glutes
  | '종아리'   // Calves
  | '승모근'   // Traps
  | '복근'     // Abs/Core
  | '복합운동' // Compound
  | '유산소';  // Cardio

export type Equipment = 
  | '바벨'         // Barbell
  | '덤벨'         // Dumbbell
  | '케이블'       // Cable
  | '머신'         // Machine
  | '케틀벨'       // Kettlebell
  | '맨몸'         // Bodyweight
  | '밴드'         // Resistance Band
  | '기타';        // Other

export type DifficultyLevel = 
  | 'beginner'      // 초급자
  | 'intermediate'  // 중급자
  | 'advanced';     // 고급자

export interface ExerciseFilter {
  bodyParts?: BodyPart[];
  equipment?: Equipment[];
  category?: ExerciseCategory[];
  difficulty?: DifficultyLevel[];
  searchTerm?: string;
}

// Korean translations for UI
export const bodyPartTranslations = {
  '가슴': { english: 'Chest', korean: '가슴' },
  '등': { english: 'Back', korean: '등' },
  '어깨': { english: 'Shoulders', korean: '어깨' },
  '이두근': { english: 'Biceps', korean: '이두근' },
  '삼두근': { english: 'Triceps', korean: '삼두근' },
  '전완근': { english: 'Forearms', korean: '전완근' },
  '허벅지': { english: 'Quadriceps', korean: '허벅지' },
  '햄스트링': { english: 'Hamstrings', korean: '햄스트링' },
  '둔근': { english: 'Glutes', korean: '둔근' },
  '종아리': { english: 'Calves', korean: '종아리' },
  '승모근': { english: 'Traps', korean: '승모근' },
  '복근': { english: 'Core', korean: '복근' },
  '복합운동': { english: 'Compound', korean: '복합운동' },
  '유산소': { english: 'Cardio', korean: '유산소' }
} as const;

export const equipmentTranslations = {
  '바벨': { english: 'Barbell', korean: '바벨' },
  '덤벨': { english: 'Dumbbell', korean: '덤벨' },
  '케이블': { english: 'Cable', korean: '케이블' },
  '머신': { english: 'Machine', korean: '머신' },
  '케틀벨': { english: 'Kettlebell', korean: '케틀벨' },
  '맨몸': { english: 'Bodyweight', korean: '맨몸' },
  '밴드': { english: 'Resistance Band', korean: '밴드' },
  '기타': { english: 'Other', korean: '기타' }
} as const;

export const categoryTranslations = {
  compound: { english: 'Compound', korean: '복합운동' },
  isolation: { english: 'Isolation', korean: '고립운동' }
} as const;

export const difficultyTranslations = {
  beginner: { english: 'Beginner', korean: '초급자' },
  intermediate: { english: 'Intermediate', korean: '중급자' },
  advanced: { english: 'Advanced', korean: '고급자' }
} as const;

// Exercise filtering utility
export function filterExercises(exercises: any[], filter: ExerciseFilter) {
  return exercises.filter(exercise => {
    // Body part filter
    if (filter.bodyParts && filter.bodyParts.length > 0) {
      const hasMatchingBodyPart = exercise.bodyParts?.some((part: string) => 
        filter.bodyParts!.includes(part as BodyPart)
      );
      if (!hasMatchingBodyPart) return false;
    }

    // Equipment filter
    if (filter.equipment && filter.equipment.length > 0) {
      const hasMatchingEquipment = exercise.equipment?.some((eq: string) => 
        filter.equipment!.some(filterEq => eq.includes(filterEq))
      );
      if (!hasMatchingEquipment) return false;
    }

    // Category filter
    if (filter.category && filter.category.length > 0) {
      if (!filter.category.includes(exercise.category)) return false;
    }

    // Difficulty filter
    if (filter.difficulty && filter.difficulty.length > 0) {
      if (!filter.difficulty.includes(exercise.difficulty)) return false;
    }

    // Search term filter
    if (filter.searchTerm) {
      const searchLower = filter.searchTerm.toLowerCase();
      const matchesName = exercise.name?.korean?.toLowerCase().includes(searchLower) ||
                         exercise.name?.english?.toLowerCase().includes(searchLower) ||
                         exercise.name?.romanization?.toLowerCase().includes(searchLower);
      
      const matchesTags = exercise.tags?.some((tag: string) => 
        tag.toLowerCase().includes(searchLower)
      );
      
      const matchesDescription = exercise.description?.korean?.toLowerCase().includes(searchLower) ||
                                exercise.description?.english?.toLowerCase().includes(searchLower);

      if (!matchesName && !matchesTags && !matchesDescription) return false;
    }

    return true;
  });
}

// Popular exercise combinations
export const popularCombinations = {
  pushDay: ['가슴', '어깨', '삼두근'],           // Push Day
  pullDay: ['등', '이두근'],                    // Pull Day  
  legDay: ['허벅지', '햄스트링', '둔근', '종아리'], // Leg Day
  upperBody: ['가슴', '등', '어깨', '이두근', '삼두근'], // Upper Body
  lowerBody: ['허벅지', '햄스트링', '둔근', '복근'],     // Lower Body
  fullBody: ['복합운동']                        // Full Body
} as const;

// Exercise recommendations by goal
export const exercisesByGoal = {
  strength: {
    korean: '근력향상',
    english: 'Strength',
    filters: { category: ['compound' as ExerciseCategory], difficulty: ['intermediate' as DifficultyLevel, 'advanced' as DifficultyLevel] }
  },
  muscle: {
    korean: '근육발달', 
    english: 'Muscle Building',
    filters: { category: ['compound' as ExerciseCategory, 'isolation' as ExerciseCategory] }
  },
  endurance: {
    korean: '지구력',
    english: 'Endurance', 
    filters: { equipment: ['맨몸' as Equipment, '밴드' as Equipment] }
  },
  beginner: {
    korean: '초급자',
    english: 'Beginner Friendly',
    filters: { difficulty: ['beginner' as DifficultyLevel] }
  }
} as const;