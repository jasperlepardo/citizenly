/**
 * Redis Client Configuration
 * Centralized caching solution using Redis or in-memory fallback
 */

import { createLogger, isProduction, isDevelopment } from '@/lib/config/environment';

const logger = createLogger('RedisClient');

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

interface CacheClient {
  get<T = any>(key: string): Promise<T | null>;
  set(key: string, value: any, ttlSeconds?: number): Promise<boolean>;
  del(key: string): Promise<boolean>;
  flush(): Promise<boolean>;
  keys(pattern: string): Promise<string[]>;
  exists(key: string): Promise<boolean>;
  expire(key: string, ttlSeconds: number): Promise<boolean>;
  getStats(): Promise<{ hits: number; misses: number; keys: number; memoryUsage?: number }>;
}

/**
 * In-memory cache implementation for development and fallback
 */
class InMemoryCache implements CacheClient {
  private cache = new Map<string, CacheEntry>();
  private stats = { hits: 0, misses: 0 };
  private maxSize = 1000;
  private defaultTTL = 300; // 5 minutes

  async get<T = any>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl * 1000) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.data as T;
  }

  async set(key: string, value: any, ttlSeconds = this.defaultTTL): Promise<boolean> {
    try {
      // Clean cache if at capacity
      if (this.cache.size >= this.maxSize) {
        this.cleanup();
      }

      this.cache.set(key, {
        data: value,
        timestamp: Date.now(),
        ttl: ttlSeconds,
      });

      return true;
    } catch (error) {
      logger.error('Failed to set cache entry', { key, error });
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }

  async flush(): Promise<boolean> {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
    return true;
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace('*', '.*'));
    return Array.from(this.cache.keys()).filter(key => regex.test(key));
  }

  async exists(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl * 1000) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) return false;

    entry.ttl = ttlSeconds;
    entry.timestamp = Date.now();
    return true;
  }

  async getStats() {
    return {
      ...this.stats,
      keys: this.cache.size,
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    // Remove expired entries first
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl * 1000) {
        expiredKeys.push(key);
      }
    });

    for (const key of expiredKeys) {
      this.cache.delete(key);
    }

    // If still at capacity, remove oldest entries
    if (this.cache.size >= this.maxSize) {
      const entries = Array.from(this.cache.entries()).sort(
        ([, a], [, b]) => a.timestamp - b.timestamp
      );

      const toRemove = entries.slice(0, Math.floor(this.maxSize * 0.2)); // Remove 20%
      for (const [key] of toRemove) {
        this.cache.delete(key);
      }
    }

    logger.debug(`Cleaned up cache: removed ${expiredKeys.length} expired entries`);
  }

  private estimateMemoryUsage(): number {
    // Rough estimation of memory usage in bytes
    let size = 0;
    this.cache.forEach((entry, key) => {
      size += key.length * 2; // String chars are 2 bytes
      size += JSON.stringify(entry.data).length * 2;
      size += 16; // Timestamp and TTL
    });
    return size;
  }
}

/**
 * Redis client implementation for production
 * Currently disabled - using in-memory cache
 */
class RedisCache implements CacheClient {
  async get<T = any>(key: string): Promise<T | null> {
    // Disabled - fallback to null
    return null;
  }

  async set(key: string, value: any, ttlSeconds = 300): Promise<boolean> {
    // Disabled - fallback to false
    return false;
  }

  async del(key: string): Promise<boolean> {
    return false;
  }

  async flush(): Promise<boolean> {
    return false;
  }

  async keys(pattern: string): Promise<string[]> {
    return [];
  }

  async exists(key: string): Promise<boolean> {
    return false;
  }

  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    return false;
  }

  async getStats() {
    return { hits: 0, misses: 0, keys: 0 };
  }
}

/**
 * Cache client factory
 */
function createCacheClient(): CacheClient {
  // Use in-memory cache for now - Redis support can be enabled later
  logger.info('Initializing in-memory cache client');
  return new InMemoryCache();

  // TODO: Enable Redis support when package is installed
  // if (isProduction() && process.env.REDIS_URL) {
  //   try {
  //     logger.info('Attempting to initialize Redis cache client');
  //     return new RedisCache();
  //   } catch (error) {
  //     logger.warn('Failed to initialize Redis cache, falling back to in-memory cache');
  //   }
  // }
}

// Singleton cache client
export const cacheClient = createCacheClient();

// Cache utility functions
export class CacheManager {
  private client: CacheClient;
  private defaultTTL = 300; // 5 minutes
  private keyPrefix = 'rbi:';

  constructor(client: CacheClient) {
    this.client = client;
  }

  /**
   * Get cached value with automatic JSON parsing
   */
  async get<T = any>(key: string): Promise<T | null> {
    const prefixedKey = this.keyPrefix + key;
    return await this.client.get<T>(prefixedKey);
  }

  /**
   * Set cached value with automatic JSON serialization
   */
  async set(key: string, value: any, ttlSeconds = this.defaultTTL): Promise<boolean> {
    const prefixedKey = this.keyPrefix + key;
    return await this.client.set(prefixedKey, value, ttlSeconds);
  }

  /**
   * Delete cached value
   */
  async del(key: string): Promise<boolean> {
    const prefixedKey = this.keyPrefix + key;
    return await this.client.del(prefixedKey);
  }

  /**
   * Get or set cached value with automatic computation
   */
  async getOrSet<T>(
    key: string,
    computeFn: () => Promise<T>,
    ttlSeconds = this.defaultTTL
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const computed = await computeFn();
    await this.set(key, computed, ttlSeconds);
    return computed;
  }

  /**
   * Invalidate cache keys by pattern
   */
  async invalidatePattern(pattern: string): Promise<number> {
    const prefixedPattern = this.keyPrefix + pattern;
    const keys = await this.client.keys(prefixedPattern);

    let deleted = 0;
    for (const key of keys) {
      if (await this.client.del(key)) {
        deleted++;
      }
    }

    logger.info(`Invalidated ${deleted} cache keys matching pattern: ${pattern}`);
    return deleted;
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    return await this.client.getStats();
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<boolean> {
    return await this.client.flush();
  }
}

// Export cache manager instance
export const cacheManager = new CacheManager(cacheClient);

export default cacheManager;
