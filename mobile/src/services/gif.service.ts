import { supabase, getExerciseGifUrl, uploadExerciseGif, deleteExerciseGif, EXERCISE_GIFS_BUCKET } from '../config/supabase';

export interface GifDownloadOptions {
  exerciseId: string;
  sourceUrl: string;
  fileName?: string;
  forceRedownload?: boolean;
}

export interface GifStorageInfo {
  exerciseId: string;
  fileName: string;
  publicUrl: string;
  localPath?: string;
  fileSize?: number;
  uploadedAt: string;
}

class GifService {
  private downloadQueue: Map<string, Promise<any>> = new Map();

  /**
   * Downloads GIF from source URL and uploads to Supabase storage
   */
  async downloadAndStoreGif(options: GifDownloadOptions): Promise<GifStorageInfo | null> {
    const { exerciseId, sourceUrl, fileName, forceRedownload = false } = options;
    
    try {
      // Generate filename if not provided
      const gifFileName = fileName || `${exerciseId}.gif`;
      
      // Check if already exists (unless force redownload)
      if (!forceRedownload) {
        const existing = await this.checkGifExists(gifFileName);
        if (existing) {
          console.log(`GIF already exists for ${exerciseId}: ${existing.publicUrl}`);
          return existing;
        }
      }

      // Avoid duplicate downloads
      const queueKey = `${exerciseId}-${sourceUrl}`;
      if (this.downloadQueue.has(queueKey)) {
        console.log(`Download already in progress for ${exerciseId}`);
        return await this.downloadQueue.get(queueKey);
      }

      // Start download process
      const downloadPromise = this.performGifDownload(exerciseId, sourceUrl, gifFileName);
      this.downloadQueue.set(queueKey, downloadPromise);

      try {
        const result = await downloadPromise;
        return result;
      } finally {
        this.downloadQueue.delete(queueKey);
      }

    } catch (error) {
      console.error(`Error downloading GIF for ${exerciseId}:`, error);
      return null;
    }
  }

  /**
   * Performs the actual GIF download and upload
   */
  private async performGifDownload(exerciseId: string, sourceUrl: string, fileName: string): Promise<GifStorageInfo | null> {
    try {
      console.log(`Downloading GIF for ${exerciseId} from: ${sourceUrl}`);
      
      // Download GIF from source URL
      const response = await fetch(sourceUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to download GIF: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      
      // Validate it's actually a GIF
      if (!blob.type.includes('image/gif') && !sourceUrl.toLowerCase().includes('.gif')) {
        console.warn(`Warning: Downloaded file for ${exerciseId} may not be a GIF. Type: ${blob.type}`);
      }

      // Upload to Supabase storage
      const uploadResult = await uploadExerciseGif(fileName, blob, {
        contentType: 'image/gif',
        cacheControl: '86400', // Cache for 24 hours
        upsert: true, // Overwrite if exists
      });

      if (uploadResult.error) {
        throw new Error(`Failed to upload GIF: ${uploadResult.error.message}`);
      }

      console.log(`Successfully uploaded GIF for ${exerciseId}: ${uploadResult.publicUrl}`);

      return {
        exerciseId,
        fileName,
        publicUrl: uploadResult.publicUrl!,
        fileSize: blob.size,
        uploadedAt: new Date().toISOString(),
      };

    } catch (error) {
      console.error(`Error in performGifDownload for ${exerciseId}:`, error);
      throw error;
    }
  }

  /**
   * Checks if a GIF already exists in storage
   */
  async checkGifExists(fileName: string): Promise<GifStorageInfo | null> {
    try {
      // Try to get file info
      const { data, error } = await supabase.storage
        .from(EXERCISE_GIFS_BUCKET)
        .list('', {
          search: fileName,
          limit: 1,
        });

      if (error || !data || data.length === 0) {
        return null;
      }

      const file = data[0];
      const publicUrl = getExerciseGifUrl(fileName);

      return {
        exerciseId: fileName.replace('.gif', ''),
        fileName,
        publicUrl,
        fileSize: file.metadata?.size,
        uploadedAt: file.created_at || file.updated_at || new Date().toISOString(),
      };

    } catch (error) {
      console.error('Error checking if GIF exists:', error);
      return null;
    }
  }

  /**
   * Gets the public URL for an exercise GIF
   */
  getGifUrl(exerciseId: string): string {
    // Try with original ID first (some use hyphens, some use underscores)
    return getExerciseGifUrl(`${exerciseId}.gif`);
  }
  
  /**
   * Gets the public URL for an exercise GIF with fallback
   */
  getGifUrlWithFallback(exerciseId: string): string[] {
    // Return both possible URLs (with hyphens and underscores)
    return [
      getExerciseGifUrl(`${exerciseId}.gif`),
      getExerciseGifUrl(`${exerciseId.replace(/-/g, '_')}.gif`)
    ];
  }

  /**
   * Bulk download GIFs for multiple exercises
   */
  async bulkDownloadGifs(exercises: Array<{ id: string; gifUrl: string }>): Promise<void> {
    console.log(`Starting bulk download of ${exercises.length} GIFs...`);
    
    const BATCH_SIZE = 5; // Download 5 at a time to avoid overwhelming the server
    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
    };

    for (let i = 0; i < exercises.length; i += BATCH_SIZE) {
      const batch = exercises.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(exercises.length / BATCH_SIZE)}`);

      const batchPromises = batch.map(async (exercise) => {
        try {
          const result = await this.downloadAndStoreGif({
            exerciseId: exercise.id,
            sourceUrl: exercise.gifUrl,
          });

          if (result) {
            results.success++;
            console.log(`✓ Downloaded: ${exercise.id}`);
          } else {
            results.failed++;
            console.log(`✗ Failed: ${exercise.id}`);
          }
        } catch (error) {
          results.failed++;
          console.log(`✗ Error downloading ${exercise.id}:`, error);
        }
      });

      // Wait for batch to complete
      await Promise.allSettled(batchPromises);
      
      // Small delay between batches
      if (i + BATCH_SIZE < exercises.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`Bulk download complete:`, results);
  }

  /**
   * Deletes a GIF from storage
   */
  async deleteGif(exerciseId: string): Promise<boolean> {
    try {
      const fileName = `${exerciseId}.gif`;
      const result = await deleteExerciseGif(fileName);
      
      if (result.error) {
        console.error(`Error deleting GIF for ${exerciseId}:`, result.error);
        return false;
      }

      console.log(`Successfully deleted GIF for ${exerciseId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting GIF for ${exerciseId}:`, error);
      return false;
    }
  }

  /**
   * Gets storage statistics
   */
  async getStorageStats(): Promise<{ totalFiles: number; totalSize: number } | null> {
    try {
      const { data, error } = await supabase.storage
        .from(EXERCISE_GIFS_BUCKET)
        .list('', {
          limit: 1000,
        });

      if (error || !data) {
        return null;
      }

      const totalFiles = data.length;
      const totalSize = data.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);

      return { totalFiles, totalSize };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return null;
    }
  }
}

export const gifService = new GifService();
export default gifService;