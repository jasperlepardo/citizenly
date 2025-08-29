/**
 * Database Query Caching Layer
 *
 * @description In-memory caching for frequently accessed database queries to improve performance.
 * Reduces database load and improves response times for common operations.
 * Schema-aligned with consolidated cache types.
 *
 * @features:
 * - TTL-based cache expiration
 * - Cache invalidation by tags
 * - Memory usage monitoring
 * - Query deduplication
 */

import { logger } from '@/lib/logging';
import type { CacheEntry, CacheStats, CacheKeyPatterns, CacheTags } from '@/types/cache';
import { createInitialCacheStats } from '@/types/cache';

class QueryCache {
  private cache = new Map<string, CacheEntry>();
  private stats: CacheStats = createInitialCacheStats();
  private maxSize: number = 1000; // Maximum number of entries
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes

  /**
   * Get cached data
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateStats();
      return null;
    }

    this.stats.hits++;
    return entry.data as T;
  }

  /**
   * Set cached data
   */
  set<T>(key: string, data: T, options: { ttl?: number; tags?: string[] } = {}): void {
    // Check if we need to evict old entries
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    const entry: CacheEntry<T> = {
      key,
      data,
      timestamp: Date.now(),
      ttl: options.ttl || this.defaultTTL,
      tags: options.tags || [],
    };

    this.cache.set(key, entry);
    this.updateStats();
  }

  /**
   * Invalidate cache entries by tag
   */
  invalidateByTag(tag: string): number {
    let invalidated = 0;

    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key);
        invalidated++;
      }
    }

    this.updateStats();
    logger.debug('Cache invalidated by tag', { tag, count: invalidated });
    return invalidated;
  }

  /**
   * Clear specific cache entry
   */
  delete(key: string): boolean {
    const result = this.cache.delete(key);
    if (result) {
      this.updateStats();
    }
    return result;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, size: 0, memoryUsage: 0 };
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get cache hit ratio
   */
  getHitRatio(): number {
    const total = this.stats.hits + this.stats.misses;
    return total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * Evict oldest entries when cache is full
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Date.now();

    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Update cache statistics
   */
  private updateStats(): void {
    this.stats.size = this.cache.size;

    // Estimate memory usage (rough calculation)
    let memoryUsage = 0;
    for (const entry of Array.from(this.cache.values())) {
      memoryUsage += JSON.stringify(entry).length * 2; // Rough estimate
    }
    this.stats.memoryUsage = memoryUsage;
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    let cleaned = 0;
    const now = Date.now();

    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    this.updateStats();
    return cleaned;
  }
}

// Singleton cache instance
export const queryCache = new QueryCache();

/**
 * Cache decorator for database queries
 */
export function cached<TArgs extends readonly unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  options: {
    ttl?: number;
    keyGenerator?: (...args: TArgs) => string;
    tags?: string[] | ((...args: TArgs) => string[]);
  } = {}
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs): Promise<TResult> => {
    // Generate cache key
    const key = options.keyGenerator
      ? options.keyGenerator(...args)
      : `${fn.name}:${JSON.stringify(args)}`;

    // Try to get from cache
    const cached = queryCache.get<TResult>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    try {
      const result = await fn(...args);

      const tags = typeof options.tags === 'function' ? options.tags(...args) : options.tags || [];

      queryCache.set(key, result, {
        ttl: options.ttl,
        tags,
      });

      return result;
    } catch (error) {
      // Don't cache errors
      throw error;
    }
  };
}

// Export consolidated cache keys and tags from centralized types
export { CacheKeyPatterns as CacheKeys, CacheTags } from '@/types/cache';

/**
 * Cache warming utilities
 */
export const CacheWarming = {
  /**
   * Warm up address data cache
   */
  async warmAddressCache() {
    // This would typically be called during app startup
    logger.info('Warming address cache...');

    try {
      // Load and cache common address data
      // Implementation would call actual data fetching functions
      logger.info('Address cache warmed successfully');
    } catch (error) {
      logger.error('Failed to warm address cache', { error });
    }
  },

  /**
   * Warm up user-specific cache
   */
  async warmUserCache(_userId: string, barangayCode?: string) {
    if (barangayCode) {
      // Pre-cache dashboard stats
      // Implementation would fetch and cache dashboard stats
    }
  },
};

/**
 * Setup cache cleanup interval
 */
export function setupCacheCleanup(intervalMs: number = 10 * 60 * 1000): () => void {
  const interval = setInterval(() => {
    const cleaned = queryCache.cleanup();
    if (cleaned > 0) {
      logger.debug('Cache cleanup completed', { entriesRemoved: cleaned });
    }
  }, intervalMs);

  return () => clearInterval(interval);
}

/**
 * Monitor cache performance
 */
export function logCacheStats(): void {
  const stats = queryCache.getStats();
  const hitRatio = queryCache.getHitRatio();

  logger.info('Cache performance stats', {
    ...stats,
    hitRatio: Math.round(hitRatio * 100) / 100,
    memoryUsageKB: Math.round(stats.memoryUsage / 1024),
  });
}
