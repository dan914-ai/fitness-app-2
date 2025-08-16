import { Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { safeJsonParse, safeJsonStringify } from '../utils/safeJsonParse';

class ImageCacheService {
  private memoryCache: Map<string, boolean> = new Map();
  private preloadQueue: Set<string> = new Set();
  private isPreloading = false;
  private CACHE_KEY = 'IMAGE_CACHE_STATUS';
  private MAX_CONCURRENT_LOADS = 3;

  constructor() {
    this.loadCacheStatus();
  }

  /**
   * Load cache status from AsyncStorage
   */
  private async loadCacheStatus() {
    try {
      const cached = await AsyncStorage.getItem(this.CACHE_KEY);
      if (cached) {
        const data = safeJsonParse(cached, {});
        Object.entries(data).forEach(([url, status]) => {
          this.memoryCache.set(url, status as boolean);
        });
      }
    } catch (error) {
      console.log('Failed to load cache status:', error);
    }
  }

  /**
   * Save cache status to AsyncStorage
   */
  private async saveCacheStatus() {
    try {
      const data: Record<string, boolean> = {};
      this.memoryCache.forEach((value, key) => {
        data[key] = value;
      });
      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.log('Failed to save cache status:', error);
    }
  }

  /**
   * Preload a single image
   */
  async preloadImage(url: string): Promise<boolean> {
    // Check if already cached
    if (this.memoryCache.get(url)) {
      return true;
    }

    try {
      await Image.prefetch(url);
      this.memoryCache.set(url, true);
      return true;
    } catch (error) {
      this.memoryCache.set(url, false);
      return false;
    }
  }

  /**
   * Batch preload multiple images with concurrency control
   */
  async batchPreload(urls: string[]): Promise<void> {
    // Filter out already cached URLs
    const urlsToLoad = urls.filter(url => !this.memoryCache.has(url));
    
    if (urlsToLoad.length === 0) return;

    // Process in batches
    const results: Promise<boolean>[] = [];
    for (let i = 0; i < urlsToLoad.length; i += this.MAX_CONCURRENT_LOADS) {
      const batch = urlsToLoad.slice(i, i + this.MAX_CONCURRENT_LOADS);
      const batchPromises = batch.map(url => this.preloadImage(url));
      results.push(...batchPromises);
      
      // Wait for batch to complete before starting next
      if (i + this.MAX_CONCURRENT_LOADS < urlsToLoad.length) {
        await Promise.all(batchPromises);
      }
    }

    await Promise.all(results);
    this.saveCacheStatus();
  }

  /**
   * Check if image is cached
   */
  isCached(url: string): boolean {
    return this.memoryCache.get(url) === true;
  }

  /**
   * Clear cache
   */
  async clearCache() {
    this.memoryCache.clear();
    await AsyncStorage.removeItem(this.CACHE_KEY);
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    let cached = 0;
    let failed = 0;
    
    this.memoryCache.forEach(status => {
      if (status) cached++;
      else failed++;
    });

    return {
      total: this.memoryCache.size,
      cached,
      failed,
      percentage: this.memoryCache.size > 0 ? (cached / this.memoryCache.size) * 100 : 0
    };
  }
}

export const imageCacheService = new ImageCacheService();