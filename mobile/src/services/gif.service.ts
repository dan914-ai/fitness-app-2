import { supabase, getExerciseGifUrl, uploadExerciseGif, deleteExerciseGif, EXERCISE_GIFS_BUCKET } from '../config/supabase';
import { networkService } from './network.service';

export interface GifDownloadOptions {
  exerciseId: string;
  sourceUrl: string;
  fileName?: string;
  forceRedownload?: boolean;
  retryOptions?: RetryOptions;
}

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryOnNetworkError?: boolean;
}

export interface GifStorageInfo {
  exerciseId: string;
  fileName: string;
  publicUrl: string;
  localPath?: string;
  fileSize?: number;
  uploadedAt: string;
}

export interface GifLoadResult {
  success: boolean;
  url?: string;
  error?: string;
  isFromCache?: boolean;
  retryCount?: number;
  fallbackUsed?: boolean;
}

export interface NetworkAwareImageState {
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  retryCount: number;
  isFromFallback: boolean;
  networkStatus: 'online' | 'offline' | 'poor';
}

class GifService {
  private downloadQueue: Map<string, Promise<any>> = new Map();
  private failedUrls: Set<string> = new Set(); // Track failed URLs to avoid repeated attempts
  private urlCache: Map<string, GifLoadResult> = new Map(); // Cache successful loads
  private defaultRetryOptions: RetryOptions = {
    maxRetries: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 30000, // 30 seconds
    backoffMultiplier: 2,
    retryOnNetworkError: true,
  };

  /**
   * Network-aware GIF loading with comprehensive error handling and retry logic
   */
  async loadGifWithRetry(url: string, options?: RetryOptions): Promise<GifLoadResult> {
    const retryOptions = { ...this.defaultRetryOptions, ...options };
    
    // Check cache first
    const cached = this.urlCache.get(url);
    if (cached && cached.success) {
      return { ...cached, isFromCache: true };
    }

    // Check if URL has failed before and we shouldn't retry
    if (this.failedUrls.has(url) && !retryOptions.retryOnNetworkError) {
      return {
        success: false,
        error: 'URL previously failed and retry disabled',
        fallbackUsed: false,
      };
    }

    // Check network status
    const networkStatus = this.getNetworkStatus();
    if (networkStatus === 'offline') {
      return {
        success: false,
        error: 'No network connection',
        fallbackUsed: false,
      };
    }

    let lastError: string = '';
    let retryCount = 0;

    for (let attempt = 0; attempt <= retryOptions.maxRetries!; attempt++) {
      try {
        retryCount = attempt;
        
        // Check network before each attempt
        if (!networkService.isOnline() && retryOptions.retryOnNetworkError) {
          throw new Error('Network offline');
        }

        const result = await this.attemptGifLoad(url);
        
        // Success! Cache the result and return
        const successResult: GifLoadResult = {
          success: true,
          url,
          retryCount,
          isFromCache: false,
          fallbackUsed: false,
        };
        
        this.urlCache.set(url, successResult);
        this.failedUrls.delete(url); // Remove from failed URLs if it succeeded
        
        return successResult;
        
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`GIF load attempt ${attempt + 1} failed for ${url}:`, lastError);
        
        // Don't retry on the last attempt
        if (attempt < retryOptions.maxRetries!) {
          const delay = this.calculateRetryDelay(attempt, retryOptions);
          await this.delay(delay);
          
          // Check if we should continue retrying based on error type
          if (!this.shouldRetryOnError(lastError, retryOptions)) {
            break;
          }
        }
      }
    }

    // All attempts failed
    this.failedUrls.add(url);
    
    return {
      success: false,
      error: lastError,
      retryCount,
      fallbackUsed: false,
    };
  }

  /**
   * Test if an image URL is accessible without downloading
   */
  async testGifUrl(url: string, timeout: number = 5000): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, { 
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Mobile; rv:40.0) Gecko/40.0 Firefox/40.0',
        },
      });
      
      clearTimeout(timeoutId);
      
      return response.ok && 
             (response.headers.get('content-type')?.includes('image') ?? false);
    } catch {
      return false;
    }
  }

  /**
   * Get multiple GIF URLs with fallback options
   */
  async loadGifWithFallbacks(urls: string[], options?: RetryOptions): Promise<GifLoadResult> {
    if (urls.length === 0) {
      return {
        success: false,
        error: 'No URLs provided',
        fallbackUsed: false,
      };
    }

    let lastError = '';
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const result = await this.loadGifWithRetry(url, {
        ...options,
        maxRetries: i === 0 ? (options?.maxRetries ?? 3) : 1, // Fewer retries for fallback URLs
      });
      
      if (result.success) {
        return {
          ...result,
          fallbackUsed: i > 0,
        };
      }
      
      lastError = result.error || 'Unknown error';
    }

    return {
      success: false,
      error: `All URLs failed. Last error: ${lastError}`,
      fallbackUsed: true,
    };
  }

  /**
   * Clear failed URLs cache (useful when network is restored)
   */
  clearFailedUrlsCache(): void {
    this.failedUrls.clear();
  }

  /**
   * Get network status for GIF loading decisions
   */
  private getNetworkStatus(): 'online' | 'offline' | 'poor' {
    if (!networkService.isOnline()) {
      return 'offline';
    }
    
    const quality = networkService.getConnectionQuality();
    return quality === 'poor' ? 'poor' : 'online';
  }

  /**
   * Attempt to load a single GIF URL
   */
  private async attemptGifLoad(url: string): Promise<void> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Mobile; rv:40.0) Gecko/40.0 Firefox/40.0',
      },
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 seconds timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('image')) {
      throw new Error(`Invalid content type: ${contentType}`);
    }

    // We don't need to fully download for testing, just verify it's accessible
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(attempt: number, options: RetryOptions): number {
    const baseDelay = options.baseDelay || 1000;
    const multiplier = options.backoffMultiplier || 2;
    const maxDelay = options.maxDelay || 30000;
    
    const delay = baseDelay * Math.pow(multiplier, attempt);
    return Math.min(delay, maxDelay);
  }

  /**
   * Determine if we should retry based on the error
   */
  private shouldRetryOnError(error: string, options: RetryOptions): boolean {
    const errorLower = error.toLowerCase();
    
    // Always retry on network errors if enabled
    if (options.retryOnNetworkError) {
      const networkErrors = ['network', 'timeout', 'fetch', 'connection', 'offline'];
      if (networkErrors.some(err => errorLower.includes(err))) {
        return networkService.isOnline(); // Only retry if network is back
      }
    }
    
    // Retry on temporary server errors
    const retryableErrors = ['503', '502', '504', 'timeout', 'temporary'];
    return retryableErrors.some(err => errorLower.includes(err));
  }

  /**
   * Simple delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

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
          return existing;
        }
      }

      // Avoid duplicate downloads
      const queueKey = `${exerciseId}-${sourceUrl}`;
      if (this.downloadQueue.has(queueKey)) {
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
   * Initialize network listeners for automatic cache clearing
   */
  initializeNetworkListeners(): void {
    networkService.addNetworkListener((networkState) => {
      if (networkState.isConnected && networkState.isInternetReachable) {
        // Network restored - clear failed URLs cache
        this.clearFailedUrlsCache();
      }
    });
  }

  /**
   * Get fallback thumbnail URL for exercise
   */
  getFallbackThumbnailUrl(exerciseId: string): string | null {
    // Import staticThumbnails to get local fallback
    const { staticThumbnails } = require('../constants/staticThumbnails');
    return staticThumbnails[exerciseId] || null;
  }

  /**
   * Enhanced GIF loading with comprehensive fallback strategy
   */
  async loadGifWithComprehensiveFallback(
    exerciseId: string, 
    primaryUrls: string[], 
    exerciseName?: string,
    options?: RetryOptions
  ): Promise<GifLoadResult & { fallbackType?: 'gif' | 'thumbnail' | 'placeholder' }> {
    
    // Try primary GIF URLs first
    if (primaryUrls.length > 0) {
      const result = await this.loadGifWithFallbacks(primaryUrls, options);
      if (result.success) {
        return { ...result, fallbackType: result.fallbackUsed ? 'gif' : undefined };
      }
    }

    // If all GIF URLs failed, try thumbnail fallback
    const thumbnailUrl = this.getFallbackThumbnailUrl(exerciseId);
    if (thumbnailUrl) {
      return {
        success: true,
        url: thumbnailUrl,
        fallbackUsed: true,
        fallbackType: 'thumbnail',
        error: 'Using static thumbnail as fallback',
      };
    }

    // Final fallback to placeholder
    return {
      success: false,
      fallbackUsed: true,
      fallbackType: 'placeholder',
      error: 'No GIF or thumbnail available - using placeholder',
    };
  }

  /**
   * Performs the actual GIF download and upload with retry logic
   */
  private async performGifDownload(exerciseId: string, sourceUrl: string, fileName: string): Promise<GifStorageInfo | null> {
    try {
      // Use new retry logic for downloading
      const downloadResult = await this.loadGifWithRetry(sourceUrl, {
        maxRetries: 3,
        retryOnNetworkError: true,
      });

      if (!downloadResult.success) {
        throw new Error(`Failed to download GIF: ${downloadResult.error}`);
      }
      
      // Download GIF with retry logic
      const response = await fetch(sourceUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        signal: AbortSignal.timeout(30000), // 30 seconds timeout for actual download
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
    
    const BATCH_SIZE = 5; // Download 5 at a time to avoid overwhelming the server
    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
    };

    for (let i = 0; i < exercises.length; i += BATCH_SIZE) {
      const batch = exercises.slice(i, i + BATCH_SIZE);

      const batchPromises = batch.map(async (exercise) => {
        try {
          const result = await this.downloadAndStoreGif({
            exerciseId: exercise.id,
            sourceUrl: exercise.gifUrl,
          });

          if (result) {
            results.success++;
          } else {
            results.failed++;
          }
        } catch (error) {
          results.failed++;
        }
      });

      // Wait for batch to complete
      await Promise.allSettled(batchPromises);
      
      // Small delay between batches
      if (i + BATCH_SIZE < exercises.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

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