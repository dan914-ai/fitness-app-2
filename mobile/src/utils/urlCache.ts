/**
 * Simple in-memory cache for exercise GIF URLs
 * Prevents recalculating URLs for the same exercises
 */
class URLCache {
  private cache: Map<string, string[]> = new Map();
  private maxSize = 500; // Maximum cache entries

  /**
   * Get cached URLs for an exercise
   */
  get(exerciseId: string): string[] | null {
    return this.cache.get(exerciseId) || null;
  }

  /**
   * Set cached URLs for an exercise
   */
  set(exerciseId: string, urls: string[]): void {
    // Implement simple LRU - remove oldest entries if cache is too large
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(exerciseId, urls);
  }

  /**
   * Clear the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0, // Could track this with additional counters
    };
  }
}

export const urlCache = new URLCache();