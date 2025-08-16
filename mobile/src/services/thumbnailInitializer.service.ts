import { thumbnailGeneratorService } from './thumbnailGenerator.service';
import { exerciseDatabaseService } from './exerciseDatabase.service';

export class ThumbnailInitializerService {
  private isInitializing = false;
  private initializationProgress = 0;
  
  /**
   * Initialize thumbnail generation in the background
   * This runs once when the app starts and generates all thumbnails
   */
  async initializeThumbnails(): Promise<void> {
    if (this.isInitializing) {
      return;
    }

    this.isInitializing = true;
    this.initializationProgress = 0;
    
    try {
      
      // Check how many thumbnails we already have
      const stats = await thumbnailGeneratorService.getCacheStats();
      const allExercises = exerciseDatabaseService.getAllExercisesWithDetails();
      const totalExercises = allExercises.length;
      
      
      if (stats.totalThumbnails >= totalExercises * 0.8) {
        this.isInitializing = false;
        return;
      }
      
      // Generate all thumbnails with progress tracking
      await thumbnailGeneratorService.generateAllThumbnails((current, total, exerciseId) => {
        this.initializationProgress = (current / total) * 100;
        
        // Log progress every 10 thumbnails
        if (current % 10 === 0 || current === total) {
        }
      });
      
      
      // Show final stats
      const finalStats = await thumbnailGeneratorService.getCacheStats();
      const sizeMB = (finalStats.totalSize / (1024 * 1024)).toFixed(2);
      
    } catch (error) {
      console.error('❌ Thumbnail initialization failed:', error);
    } finally {
      this.isInitializing = false;
    }
  }
  
  /**
   * Get initialization progress (0-100)
   */
  getProgress(): number {
    return this.initializationProgress;
  }
  
  /**
   * Check if initialization is in progress
   */
  isInProgress(): boolean {
    return this.isInitializing;
  }
  
  /**
   * Initialize thumbnails for specific exercises (high priority)
   * Use this for exercises that are being viewed right now
   */
  async prioritizeExercises(exerciseIds: string[]): Promise<void> {
    if (exerciseIds.length === 0) return;
    
    
    try {
      await thumbnailGeneratorService.batchGenerateThumbnails(
        exerciseIds,
        (current, total, exerciseId) => {
        }
      );
    } catch (error) {
      console.error('❌ Failed to prioritize exercise thumbnails:', error);
    }
  }
  
  /**
   * Clear old thumbnails and reinitialize if needed
   */
  async cleanupAndReinitialize(): Promise<void> {
    
    try {
      const clearedCount = await thumbnailGeneratorService.clearOldThumbnails();
      
      if (clearedCount > 0) {
        await this.initializeThumbnails();
      }
    } catch (error) {
      console.error('❌ Cleanup and reinitialization failed:', error);
    }
  }
}

export const thumbnailInitializerService = new ThumbnailInitializerService();