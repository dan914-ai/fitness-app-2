import { ExerciseData, EXERCISE_DATABASE, EXERCISE_CATEGORIES } from '../data/exerciseDatabase';
import storageService from './storage.service';

export interface ExerciseFilter {
  bodyParts?: string[];
  equipment?: string[];
  difficulty?: string[];
  type?: string[];
  searchQuery?: string;
}

export interface ExerciseSearchResult {
  exercises: ExerciseData[];
  totalCount: number;
  filteredCount: number;
}

class ExerciseService {
  private exercises: ExerciseData[] = EXERCISE_DATABASE;
  private favoriteExercises: string[] = [];

  async initialize(): Promise<void> {
    try {
      // Load favorite exercises from storage
      this.favoriteExercises = await storageService.getFavoriteExercises();
      console.log('Exercise service initialized with', this.exercises.length, 'exercises');
    } catch (error) {
      console.error('Failed to initialize exercise service:', error);
    }
  }

  // Get all exercises
  getAllExercises(): ExerciseData[] {
    return this.exercises;
  }

  // Get exercise by ID
  getExerciseById(id: string): ExerciseData | undefined {
    return this.exercises.find(exercise => exercise.id === id);
  }

  // Search and filter exercises
  searchExercises(filter: ExerciseFilter = {}): ExerciseSearchResult {
    let filtered = [...this.exercises];

    // Apply body parts filter
    if (filter.bodyParts && filter.bodyParts.length > 0) {
      filtered = filtered.filter(exercise => 
        filter.bodyParts!.some(bodyPart => 
          exercise.bodyParts.includes(bodyPart)
        )
      );
    }

    // Apply equipment filter
    if (filter.equipment && filter.equipment.length > 0) {
      filtered = filtered.filter(exercise =>
        filter.equipment!.some(equipment =>
          exercise.equipment.includes(equipment)
        )
      );
    }

    // Apply difficulty filter
    if (filter.difficulty && filter.difficulty.length > 0) {
      filtered = filtered.filter(exercise =>
        filter.difficulty!.includes(exercise.difficulty)
      );
    }

    // Apply type filter (compound/isolation)
    if (filter.type && filter.type.length > 0) {
      filtered = filtered.filter(exercise =>
        filter.type!.includes(exercise.category)
      );
    }

    // Apply search query
    if (filter.searchQuery && filter.searchQuery.trim()) {
      const query = filter.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(exercise =>
        exercise.name.english.toLowerCase().includes(query) ||
        exercise.name.korean.includes(query) ||
        exercise.name.romanization.toLowerCase().includes(query) ||
        exercise.description.english.toLowerCase().includes(query) ||
        exercise.description.korean.includes(query) ||
        exercise.targetMuscles.primary.some(muscle => muscle.includes(query)) ||
        exercise.targetMuscles.secondary.some(muscle => muscle.includes(query)) ||
        exercise.tags.some(tag => tag.includes(query))
      );
    }

    return {
      exercises: filtered,
      totalCount: this.exercises.length,
      filteredCount: filtered.length
    };
  }

  // Get exercises by body part
  getExercisesByBodyPart(bodyPart: string): ExerciseData[] {
    return this.exercises.filter(exercise => 
      exercise.bodyParts.includes(bodyPart)
    );
  }

  // Get exercises by equipment
  getExercisesByEquipment(equipment: string): ExerciseData[] {
    return this.exercises.filter(exercise => 
      exercise.equipment.includes(equipment)
    );
  }

  // Get exercises by difficulty
  getExercisesByDifficulty(difficulty: string): ExerciseData[] {
    return this.exercises.filter(exercise => 
      exercise.difficulty === difficulty
    );
  }

  // Get compound exercises
  getCompoundExercises(): ExerciseData[] {
    return this.exercises.filter(exercise => exercise.category === 'compound');
  }

  // Get isolation exercises
  getIsolationExercises(): ExerciseData[] {
    return this.exercises.filter(exercise => exercise.category === 'isolation');
  }

  // Get alternative exercises
  getAlternativeExercises(exerciseId: string): ExerciseData[] {
    const exercise = this.getExerciseById(exerciseId);
    if (!exercise || !exercise.alternatives) return [];

    return exercise.alternatives
      .map(altId => this.getExerciseById(altId))
      .filter(alt => alt !== undefined) as ExerciseData[];
  }

  // Get recommended exercises based on target muscles
  getRecommendedExercises(targetMuscles: string[], limit: number = 5): ExerciseData[] {
    const recommended = this.exercises
      .filter(exercise => 
        exercise.targetMuscles.primary.some(muscle => 
          targetMuscles.includes(muscle)
        )
      )
      .slice(0, limit);

    return recommended;
  }

  // Favorite exercises management
  async toggleFavoriteExercise(exerciseId: string): Promise<boolean> {
    try {
      const index = this.favoriteExercises.indexOf(exerciseId);
      
      if (index > -1) {
        // Remove from favorites
        this.favoriteExercises.splice(index, 1);
      } else {
        // Add to favorites
        this.favoriteExercises.push(exerciseId);
      }

      await storageService.saveFavoriteExercises(this.favoriteExercises);
      return this.favoriteExercises.includes(exerciseId);
    } catch (error) {
      console.error('Failed to toggle favorite exercise:', error);
      return false;
    }
  }

  isFavoriteExercise(exerciseId: string): boolean {
    return this.favoriteExercises.includes(exerciseId);
  }

  getFavoriteExercises(): ExerciseData[] {
    return this.favoriteExercises
      .map(id => this.getExerciseById(id))
      .filter(exercise => exercise !== undefined) as ExerciseData[];
  }

  // Get popular exercises (based on favorites and usage)
  getPopularExercises(limit: number = 10): ExerciseData[] {
    // For now, return compound exercises as they're generally more popular
    return this.getCompoundExercises().slice(0, limit);
  }

  // Get exercises for beginners
  getBeginnerExercises(limit: number = 8): ExerciseData[] {
    return this.exercises
      .filter(exercise => exercise.difficulty === 'beginner')
      .slice(0, limit);
  }

  // Get random exercise
  getRandomExercise(): ExerciseData {
    const randomIndex = Math.floor(Math.random() * this.exercises.length);
    return this.exercises[randomIndex];
  }

  // Get exercises that work similar muscles
  getSimilarExercises(exerciseId: string, limit: number = 4): ExerciseData[] {
    const exercise = this.getExerciseById(exerciseId);
    if (!exercise) return [];

    return this.exercises
      .filter(ex => 
        ex.id !== exerciseId && // Exclude the current exercise
        ex.targetMuscles.primary.some(muscle => 
          exercise.targetMuscles.primary.includes(muscle)
        )
      )
      .slice(0, limit);
  }

  // Get exercise categories for filtering UI
  getCategories() {
    return EXERCISE_CATEGORIES;
  }

  // Get unique body parts from database
  getUniqueBodyParts(): string[] {
    const bodyParts = new Set<string>();
    this.exercises.forEach(exercise => {
      exercise.bodyParts.forEach(part => bodyParts.add(part));
    });
    return Array.from(bodyParts).sort();
  }

  // Get unique equipment from database
  getUniqueEquipment(): string[] {
    const equipment = new Set<string>();
    this.exercises.forEach(exercise => {
      exercise.equipment.forEach(eq => equipment.add(eq));
    });
    return Array.from(equipment).sort();
  }

  // Get exercise statistics
  getStatistics() {
    const stats = {
      total: this.exercises.length,
      compound: this.getCompoundExercises().length,
      isolation: this.getIsolationExercises().length,
      beginner: this.getExercisesByDifficulty('beginner').length,
      intermediate: this.getExercisesByDifficulty('intermediate').length,
      advanced: this.getExercisesByDifficulty('advanced').length,
      favorites: this.favoriteExercises.length,
      bodyParts: this.getUniqueBodyParts().length,
      equipment: this.getUniqueEquipment().length
    };

    return stats;
  }

  // Format exercise for display
  formatExerciseForDisplay(exercise: ExerciseData) {
    return {
      id: exercise.id,
      name: exercise.name.korean,
      englishName: exercise.name.english,
      romanization: exercise.name.romanization,
      description: exercise.description.korean,
      primaryMuscles: exercise.targetMuscles.primary,
      secondaryMuscles: exercise.targetMuscles.secondary,
      equipment: exercise.equipment,
      difficulty: exercise.difficulty,
      bodyParts: exercise.bodyParts,
      category: exercise.category,
      sets: exercise.sets.recommended,
      reps: exercise.reps.recommended,
      thumbnailUrl: exercise.media.thumbnailUrl || exercise.media.gifUrl,
      gifUrl: exercise.media.supabaseGifUrl || exercise.media.gifUrl,
      isFavorite: this.isFavoriteExercise(exercise.id),
      tips: exercise.tips.korean,
      instructions: exercise.instructions.korean,
      tags: exercise.tags
    };
  }
}

export const exerciseService = new ExerciseService();
export default exerciseService;