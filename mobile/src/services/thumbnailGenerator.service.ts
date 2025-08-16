import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { exerciseDatabaseService } from './exerciseDatabase.service';
import { getExerciseGifUrls } from '../utils/gifUrlHelper';

interface ThumbnailCache {
  [exerciseId: string]: {
    localPath: string;
    timestamp: number;
    size: number;
  };
}

class ThumbnailGeneratorService {
  private thumbnailDir = `${FileSystem.documentDirectory}thumbnails/`;
  private cacheKey = 'THUMBNAIL_CACHE_V2';
  private thumbnailSize = 120; // 120x120 for good quality
  private maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

  constructor() {
    this.initializeThumbnailDirectory();
  }

  /**
   * Initialize thumbnail directory
   */
  private async initializeThumbnailDirectory(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.thumbnailDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.thumbnailDir, { intermediates: true });
        console.log('📁 Created thumbnail directory');
      }
    } catch (error) {
      console.error('Failed to create thumbnail directory:', error);
    }
  }

  /**
   * Load thumbnail cache from AsyncStorage
   */
  private async loadCache(): Promise<ThumbnailCache> {
    try {
      const cacheData = await AsyncStorage.getItem(this.cacheKey);
      return cacheData ? JSON.parse(cacheData) : {};
    } catch (error) {
      console.error('Failed to load thumbnail cache:', error);
      return {};
    }
  }

  /**
   * Save thumbnail cache to AsyncStorage
   */
  private async saveCache(cache: ThumbnailCache): Promise<void> {
    try {
      await AsyncStorage.setItem(this.cacheKey, JSON.stringify(cache));
    } catch (error) {
      console.error('Failed to save thumbnail cache:', error);
    }
  }

  /**
   * Generate thumbnail from GIF URL
   */
  private async generateThumbnailFromUrl(
    gifUrl: string, 
    exerciseId: string
  ): Promise<string | null> {
    try {
      console.log(`🖼️ Generating thumbnail for exercise ${exerciseId}...`);
      
      // Use expo-image-manipulator to resize and convert to JPEG
      const result = await manipulateAsync(
        gifUrl,
        [
          {
            resize: {
              width: this.thumbnailSize,
              height: this.thumbnailSize,
            },
          },
        ],
        {
          compress: 0.8, // 80% quality for good balance
          format: SaveFormat.JPEG,
          base64: false,
        }
      );

      // Move to our thumbnail directory
      const thumbnailPath = `${this.thumbnailDir}${exerciseId}.jpg`;
      await FileSystem.moveAsync({
        from: result.uri,
        to: thumbnailPath,
      });

      console.log(`✅ Generated thumbnail: ${thumbnailPath}`);
      return thumbnailPath;
    } catch (error) {
      console.error(`❌ Failed to generate thumbnail for ${exerciseId}:`, error);
      return null;
    }
  }

  /**
   * Get local thumbnail path for an exercise
   */
  async getThumbnailPath(exerciseId: string): Promise<string | null> {
    const cache = await this.loadCache();
    const cachedThumbnail = cache[exerciseId];

    // Check if we have a valid cached thumbnail
    if (cachedThumbnail) {
      const fileInfo = await FileSystem.getInfoAsync(cachedThumbnail.localPath);
      
      // Check if file exists and is not too old
      if (fileInfo.exists && (Date.now() - cachedThumbnail.timestamp) < this.maxAge) {
        return cachedThumbnail.localPath;
      }
    }

    // Generate new thumbnail
    return this.generateThumbnail(exerciseId);
  }

  /**
   * Generate thumbnail for a specific exercise
   */
  async generateThumbnail(exerciseId: string): Promise<string | null> {
    try {
      // Get GIF URLs for this exercise
      const gifUrls = getExerciseGifUrls(exerciseId);
      if (gifUrls.length === 0) {
        console.log(`No GIF URLs found for exercise ${exerciseId}`);
        return null;
      }

      // Try each URL until one works
      for (const gifUrl of gifUrls) {
        const thumbnailPath = await this.generateThumbnailFromUrl(gifUrl, exerciseId);
        
        if (thumbnailPath) {
          // Update cache
          const cache = await this.loadCache();
          const fileInfo = await FileSystem.getInfoAsync(thumbnailPath);
          
          cache[exerciseId] = {
            localPath: thumbnailPath,
            timestamp: Date.now(),
            size: fileInfo.size || 0,
          };
          
          await this.saveCache(cache);
          return thumbnailPath;
        }
      }

      return null;
    } catch (error) {
      console.error(`Failed to generate thumbnail for ${exerciseId}:`, error);
      return null;
    }
  }

  /**
   * Batch generate thumbnails for multiple exercises
   */
  async batchGenerateThumbnails(
    exerciseIds: string[],
    onProgress?: (current: number, total: number, exerciseId: string) => void
  ): Promise<void> {
    console.log(`🚀 Starting batch thumbnail generation for ${exerciseIds.length} exercises...`);
    
    const concurrency = 3; // Process 3 at a time to avoid overwhelming
    const batches: string[][] = [];
    
    // Split into batches
    for (let i = 0; i < exerciseIds.length; i += concurrency) {
      batches.push(exerciseIds.slice(i, i + concurrency));
    }

    let completed = 0;
    
    for (const batch of batches) {
      // Process batch concurrently
      const promises = batch.map(async (exerciseId) => {
        try {
          await this.generateThumbnail(exerciseId);
          completed++;
          onProgress?.(completed, exerciseIds.length, exerciseId);
        } catch (error) {
          console.error(`Failed to process ${exerciseId}:`, error);
          completed++;
          onProgress?.(completed, exerciseIds.length, exerciseId);
        }
      });
      
      await Promise.all(promises);
      
      // Small delay between batches to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`✅ Batch thumbnail generation complete! Generated ${completed} thumbnails.`);
  }

  /**
   * Generate thumbnails for all exercises
   */
  async generateAllThumbnails(
    onProgress?: (current: number, total: number, exerciseId: string) => void
  ): Promise<void> {
    const allExercises = exerciseDatabaseService.getAllExercisesWithDetails();
    const exerciseIds = allExercises.map(ex => ex.exerciseId);
    
    await this.batchGenerateThumbnails(exerciseIds, onProgress);
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    totalThumbnails: number;
    totalSize: number;
    oldestTimestamp: number;
    newestTimestamp: number;
  }> {
    const cache = await this.loadCache();
    const entries = Object.values(cache);
    
    if (entries.length === 0) {
      return {
        totalThumbnails: 0,
        totalSize: 0,
        oldestTimestamp: 0,
        newestTimestamp: 0,
      };
    }
    
    return {
      totalThumbnails: entries.length,
      totalSize: entries.reduce((sum, entry) => sum + entry.size, 0),
      oldestTimestamp: Math.min(...entries.map(e => e.timestamp)),
      newestTimestamp: Math.max(...entries.map(e => e.timestamp)),
    };
  }

  /**
   * Clear old thumbnails
   */
  async clearOldThumbnails(): Promise<number> {
    const cache = await this.loadCache();
    let clearedCount = 0;
    
    for (const [exerciseId, thumbnail] of Object.entries(cache)) {
      if (Date.now() - thumbnail.timestamp > this.maxAge) {
        try {
          await FileSystem.deleteAsync(thumbnail.localPath, { idempotent: true });
          delete cache[exerciseId];
          clearedCount++;
        } catch (error) {
          console.error(`Failed to delete old thumbnail ${thumbnail.localPath}:`, error);
        }
      }
    }
    
    if (clearedCount > 0) {
      await this.saveCache(cache);
      console.log(`🧹 Cleared ${clearedCount} old thumbnails`);
    }
    
    return clearedCount;
  }

  /**
   * Clear all thumbnails
   */
  async clearAllThumbnails(): Promise<void> {
    try {
      await FileSystem.deleteAsync(this.thumbnailDir, { idempotent: true });
      await AsyncStorage.removeItem(this.cacheKey);
      await this.initializeThumbnailDirectory();
      console.log('🧹 Cleared all thumbnails');
    } catch (error) {
      console.error('Failed to clear thumbnails:', error);
    }
  }
}

export const thumbnailGeneratorService = new ThumbnailGeneratorService();