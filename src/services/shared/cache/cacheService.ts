/**
 * Cache Service
 * Consolidated caching functionality following coding standards
 * Schema-aligned with consolidated cache types
 */

import { createLogger } from '@/lib/config/environment';
import type { CacheEntry, CacheStats } from '@/types/infrastructure/cache/cache';
import { createInitialCacheStats } from '@/types/infrastructure/cache/cache';

const logger = createLogger('CacheService');

/**
 * Cache Service Class
 * Consolidated in-memory caching with TTL and tag-based invalidation
 */
export class CacheService {
  private readonly cache = new Map<string, CacheEntry>();
  private stats: CacheStats = createInitialCacheStats();
  private readonly maxSize: number = 1000;
  private readonly defaultTTL: number = 5 * 60 * 1000; // 5 minutes
  private readonly keyPrefix = 'rbi:';

  /**
   * Get cached data
   */
  get<T>(key: string): T | null {
    const prefixedKey = this.keyPrefix + key;
    const entry = this.cache.get(prefixedKey);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(prefixedKey);
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
    const prefixedKey = this.keyPrefix + key;

    // Check if we need to evict old entries
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    const entry: CacheEntry<T> = {
      key: prefixedKey,
      data,
      timestamp: Date.now(),
      ttl: options.ttl || this.defaultTTL,
      tags: options.tags || [],
    };

    this.cache.set(prefixedKey, entry);
    this.updateStats();
  }

  /**
   * Delete specific cache entry
   */
  delete(key: string): boolean {
    const prefixedKey = this.keyPrefix + key;
    const result = this.cache.delete(prefixedKey);
    if (result) {
      this.updateStats();
    }
    return result;
  }

  /**
   * Get or set cached value with automatic computation
   */
  async getOrSet<T>(
    key: string,
    computeFn: () => Promise<T>,
    options: { ttl?: number; tags?: string[] } = {}
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const computed = await computeFn();
    this.set(key, computed, options);
    return computed;
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
   * Invalidate cache keys by pattern
   */
  invalidatePattern(pattern: string): number {
    const prefixedPattern = this.keyPrefix + pattern;
    const regex = new RegExp(prefixedPattern.replace('*', '.*'));

    let deleted = 0;
    for (const key of Array.from(this.cache.keys())) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deleted++;
      }
    }

    this.updateStats();
    logger.info(`Invalidated ${deleted} cache keys matching pattern: ${pattern}`);
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats = createInitialCacheStats();
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

    // Estimate memory usage
    let memoryUsage = 0;
    for (const entry of Array.from(this.cache.values())) {
      memoryUsage += JSON.stringify(entry).length * 2; // Rough estimate
    }
    this.stats.memoryUsage = memoryUsage;
  }
}

// Singleton cache service instance
const cacheService = new CacheService();

/**
 * Cache decorator for service methods
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
    const cached = cacheService.get<TResult>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    try {
      const result = await fn(...args);

      const tags = typeof options.tags === 'function' ? options.tags(...args) : options.tags || [];

      cacheService.set(key, result, {
        ttl: options.ttl,
        tags,
      });

      return result;
    } catch (error) {
      // Don't cache errors, just re-throw
      logger.debug('Cache function execution failed', { key, error });
      throw error;
    }
  };
}

// Export consolidated cache keys and tags from centralized types
export { CacheKeyPatterns as CacheKeys, CacheTags } from '../../../types/infrastructure/cache/cache';

// Note: CacheService is now managed by the service container
// Import from container: container.getCacheService()

// Setup cache cleanup interval
let cleanupInterval: NodeJS.Timeout | null = null;

export function setupCacheCleanup(intervalMs: number = 10 * 60 * 1000): () => void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
  }

  cleanupInterval = setInterval(() => {
    const cleaned = cacheService.cleanup();
    if (cleaned > 0) {
      logger.debug('Cache cleanup completed', { entriesRemoved: cleaned });
    }
  }, intervalMs);

  return () => {
    if (cleanupInterval) {
      clearInterval(cleanupInterval);
      cleanupInterval = null;
    }
  };
}

// Export cache service instance (class is already exported above)
export { cacheService };
