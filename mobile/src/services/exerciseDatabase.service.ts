// Import all dependencies statically for proper bundling
import EXERCISE_DATABASE_MODULE from '../data/exerciseDatabase';
import { ExerciseData } from '../data/exerciseDatabase';
import { Exercise } from '../types';
import staticThumbnailsData from '../constants/staticThumbnails';

// Handle both default export and module.default cases
const EXERCISE_DATABASE = (EXERCISE_DATABASE_MODULE as any).default || EXERCISE_DATABASE_MODULE || [];

// Get thumbnail safely
function safeGetThumbnail(exerciseId: number | string): any {
  try {
    const id = exerciseId.toString();
    return staticThumbnailsData[id] || null;
  } catch (e) {
    return null;
  }
}

export interface ExerciseWithDetails extends Exercise {
  koreanName: string;
  romanization: string;
  englishName: string;
  targetMuscles: {
    primary: string[];
    secondary: string[];
    stabilizers?: string[];
  };
  bodyParts: string[];
  gifUrl?: string;
  description: {
    korean: string;
    english: string;
  };
  instructions: {
    korean: string[];
    english: string[];
  };
  tips?: {
    korean: string[];
    english: string[];
  };
  commonMistakes?: {
    korean: string[];
    english: string[];
  };
  sets: {
    recommended: string;
    beginner: string;
    intermediate: string;
    advanced: string;
  };
  reps: {
    recommended: string;
    beginner: string;
    intermediate: string;
    advanced: string;
  };
}

class ExerciseDatabaseService {
  private exercises: ExerciseData[];
  private exerciseMap: Map<string, ExerciseData>;

  constructor() {
    // Ensure we get the array properly with fallback
    if (Array.isArray(EXERCISE_DATABASE)) {
      this.exercises = EXERCISE_DATABASE;
    } else if (EXERCISE_DATABASE && typeof EXERCISE_DATABASE === 'object') {
      // Try to extract array from object
      this.exercises = (EXERCISE_DATABASE as any).default || (EXERCISE_DATABASE as any).data || [];
    } else {
      this.exercises = [];
    }
    
    console.log('🔧 ExerciseDatabaseService constructor');
    console.log('🔧 EXERCISE_DATABASE type:', typeof EXERCISE_DATABASE, 'isArray:', Array.isArray(EXERCISE_DATABASE));
    console.log('🔧 this.exercises length:', this.exercises.length);
    
    // Log first exercise for debugging
    if (this.exercises.length > 0) {
      console.log('🔧 First exercise:', this.exercises[0]);
    }
    
    if (this.exercises.length === 0) {
      console.error('❌ WARNING: No exercises loaded! EXERCISE_DATABASE might be empty or not properly imported');
      // Try one more time with a direct import
      try {
        const directImport = require('../data/exerciseDatabase');
        if (directImport && directImport.default && Array.isArray(directImport.default)) {
          this.exercises = directImport.default;
          console.log('🔧 Recovered exercises via direct import:', this.exercises.length);
        }
      } catch (e) {
        console.error('❌ Could not recover exercises:', e);
      }
    }
    
    this.exerciseMap = new Map(
      this.exercises.map(exercise => [exercise.id.toString(), exercise])
    );
    console.log('🔧 exerciseMap size:', this.exerciseMap.size);
  }

  /**
   * Get thumbnail for list views (ALWAYS local asset, NEVER GIF)
   */
  private getListThumbnail(exerciseId: number): any {
    const thumbnail = safeGetThumbnail(exerciseId);
    console.log(`🖼️ getListThumbnail(${exerciseId}): ${thumbnail ? 'Found' : 'Not found'}`);
    return thumbnail;
  }

  /**
   * Maps ExerciseData to Exercise type
   */
  private mapToApiExercise(exercise: ExerciseData): Exercise {
    return {
      exerciseId: exercise.id.toString(),
      exerciseName: exercise.name,
      category: exercise.category,
      muscleGroup: exercise.muscleGroup,
      equipment: exercise.equipment,
      difficulty: exercise.difficulty,
      thumbnail: this.getListThumbnail(exercise.id), // Always local require()
      gifUrl: exercise.imageUrl || undefined,         // Remote GIF URL
    };
  }

  /**
   * Maps ExerciseData to ExerciseWithDetails type
   */
  private mapToExerciseWithDetails(exercise: ExerciseData): ExerciseWithDetails {
    const apiExercise = this.mapToApiExercise(exercise);
    
    return {
      ...apiExercise,
      koreanName: exercise.name || '운동',
      romanization: exercise.englishName || '',
      englishName: exercise.englishName || '',
      targetMuscles: {
        primary: exercise.muscleGroup ? [exercise.muscleGroup] : [],
        secondary: []
      },
      bodyParts: exercise.muscleGroup ? [exercise.muscleGroup] : [],
      gifUrl: exercise.imageUrl,
      description: {
        korean: '',
        english: ''
      },
      instructions: {
        korean: exercise.instructions || [],
        english: []
      },
      tips: {
        korean: [],
        english: []
      },
      commonMistakes: {
        korean: [],
        english: []
      },
      sets: {
        recommended: '3',
        beginner: '2',
        intermediate: '3',
        advanced: '4'
      },
      reps: {
        recommended: '12',
        beginner: '8-10',
        intermediate: '10-12',
        advanced: '12-15'
      }
    };
  }

  /**
   * Get all exercises (with static thumbnails for lists)
   */
  getAllExercises(forListView = true): Exercise[] {
    console.log('📊 getAllExercises called, exercises:', this.exercises.length);
    return this.exercises.map(exercise => this.mapToApiExercise(exercise));
  }

  /**
   * Get all exercises with full details (includes GIF URLs)
   */
  getAllExercisesWithDetails(): ExerciseWithDetails[] {
    console.log('📊 getAllExercisesWithDetails called, exercises:', this.exercises.length);
    return this.exercises.map(exercise => this.mapToExerciseWithDetails(exercise));
  }

  /**
   * Get exercise by ID (with option for list view vs detail view)
   */
  getExerciseById(id: string | number, forListView = true): Exercise | undefined {
    const stringId = id.toString();
    const exercise = this.exerciseMap.get(stringId);
    
    console.log(`🔍 getExerciseById(${id}): found=${!!exercise}, map size=${this.exerciseMap.size}`);
    
    if (!exercise) {
      console.warn(`⚠️ Exercise with ID ${id} not found in database`);
      return undefined;
    }
    
    const mapped = this.mapToApiExercise(exercise);
    console.log(`📦 Mapped exercise ${id}: thumbnail=${!!mapped.thumbnail}`);
    return mapped;
  }

  /**
   * Get exercise with full details by ID (includes GIF URL)
   */
  getExerciseWithDetailsById(id: string): ExerciseWithDetails | undefined {
    const exercise = this.exerciseMap.get(id);
    return exercise ? this.mapToExerciseWithDetails(exercise) : undefined;
  }

  /**
   * Search exercises by name or muscle group (for lists - uses static thumbnails)
   */
  searchExercises(query: string, forListView = true): Exercise[] {
    const lowerQuery = query.toLowerCase();
    const results = this.exercises.filter(exercise => 
      exercise.name.includes(query) ||
      exercise.englishName.toLowerCase().includes(lowerQuery) ||
      exercise.muscleGroup.includes(query) ||
      exercise.category.includes(query)
    );
    
    return results.map(exercise => this.mapToApiExercise(exercise));
  }

  /**
   * Get exercises by muscle group (for lists - uses static thumbnails)
   */
  getExercisesByMuscleGroup(muscleGroup: string, forListView = true): Exercise[] {
    const filtered = this.exercises.filter(exercise => 
      exercise.muscleGroup === muscleGroup
    );
    
    return filtered.map(exercise => this.mapToApiExercise(exercise));
  }

  /**
   * Get exercises by category (for lists - uses static thumbnails)
   */
  getExercisesByCategory(category: string, forListView = true): Exercise[] {
    const filtered = this.exercises.filter(exercise => 
      exercise.category === category
    );
    
    return filtered.map(exercise => this.mapToApiExercise(exercise));
  }

  /**
   * Get exercises with pagination (for lists - uses static thumbnails)
   */
  getExercisesPaginated(options: {
    page?: number;
    limit?: number;
    muscleGroup?: string;
    category?: string;
    equipment?: string;
    difficulty?: string;
    searchQuery?: string;
    forListView?: boolean;
  }) {
    const {
      page = 1,
      limit = 20,
      muscleGroup,
      category,
      equipment,
      difficulty,
      searchQuery,
      forListView = true,
    } = options;

    console.log('📊 getExercisesPaginated called with:', options);
    console.log('📊 this.exercises length:', this.exercises?.length);
    let filteredExercises = this.exercises;

    // Apply filters
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filteredExercises = filteredExercises.filter(exercise =>
        exercise.name.includes(searchQuery) ||
        exercise.englishName.toLowerCase().includes(lowerQuery) ||
        exercise.muscleGroup.includes(searchQuery)
      );
    }

    if (muscleGroup) {
      filteredExercises = filteredExercises.filter(exercise => 
        exercise.muscleGroup === muscleGroup
      );
    }

    if (category) {
      filteredExercises = filteredExercises.filter(exercise => exercise.category === category);
    }

    if (equipment) {
      filteredExercises = filteredExercises.filter(exercise => 
        exercise.equipment === equipment
      );
    }

    if (difficulty) {
      filteredExercises = filteredExercises.filter(exercise => 
        exercise.difficulty === difficulty
      );
    }

    // Calculate pagination
    const total = filteredExercises.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    // Get paginated results
    const paginatedExercises = filteredExercises
      .slice(startIndex, endIndex)
      .map(exercise => this.mapToApiExercise(exercise));

    console.log('📊 Returning exercises:', paginatedExercises.length, 'out of', total, 'total');

    return {
      exercises: paginatedExercises,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Get unique muscle groups for filtering
   */
  getMuscleGroups(): string[] {
    const muscleGroups = new Set<string>();
    
    this.exercises.forEach(exercise => {
      if (exercise.muscleGroup && typeof exercise.muscleGroup === 'string') {
        muscleGroups.add(exercise.muscleGroup);
      }
    });

    return Array.from(muscleGroups).filter(Boolean).sort();
  }

  /**
   * Get unique categories for filtering
   */
  getCategories(): string[] {
    const categories = new Set<string>();
    
    this.exercises.forEach(exercise => {
      if (exercise.category) {
        categories.add(exercise.category);
      }
    });

    return Array.from(categories).filter(Boolean).sort();
  }

  /**
   * Get unique equipment types for filtering
   */
  getEquipmentTypes(): string[] {
    const equipment = new Set<string>();
    
    this.exercises.forEach(exercise => {
      if (exercise.equipment) {
        equipment.add(exercise.equipment);
      }
    });

    return Array.from(equipment).filter(Boolean).sort();
  }

  /**
   * Get exercise by name (for compatibility)
   */
  getExerciseByName(name: string, forListView = true): Exercise | undefined {
    const exercise = this.exercises.find(ex => 
      ex.name === name || ex.englishName === name
    );
    
    return exercise ? this.mapToApiExercise(exercise) : undefined;
  }
}

export const exerciseDatabaseService = new ExerciseDatabaseService();// Rebuild trigger 1755169424
