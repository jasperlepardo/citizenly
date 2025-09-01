/**
 * Cache Types - Consolidated Caching System Types
 *
 * @fileoverview Production-ready, schema-aligned cache type definitions for the
 * Citizenly RBI system. Provides consistent caching interfaces across all cache
 * implementations (Redis, in-memory, query cache).
 *
 * @version 1.0.0
 * @since 2025-08-29
 * @author Citizenly Development Team
 */

// =============================================================================
// CORE CACHE TYPES
// =============================================================================

/**
 * Cache entry interface - standardized across all cache implementations
 * Combines features from all cache layers for maximum compatibility
 */
export interface CacheEntry<T = unknown> {
  /** Unique cache key identifier */
  key: string;
  /** Cached data payload */
  data: T;
  /** Entry creation timestamp in milliseconds */
  timestamp: number;
  /** Time to live in milliseconds */
  ttl: number;
  /** Cache tags for grouped invalidation */
  tags: string[];
  /** Number of cache hits for this entry */
  hits?: number;
}

/**
 * Cache statistics interface
 */
export interface CacheStats {
  /** Total cache hits */
  hits: number;
  /** Total cache misses */
  misses: number;
  /** Current cache size (number of entries) */
  size: number;
  /** Estimated memory usage in bytes */
  memoryUsage: number;
  /** Cache hit ratio (0-1) */
  hitRatio?: number;
}

/**
 * Create initial cache stats object
 * Eliminates duplicate initialization patterns
 */
export function createInitialCacheStats(): CacheStats {
  return { hits: 0, misses: 0, size: 0, memoryUsage: 0 };
}

/**
 * Cache configuration options
 */
export interface CacheConfig {
  /** Default TTL in milliseconds */
  defaultTTL: number;
  /** Maximum number of cache entries */
  maxSize: number;
  /** Cache key prefix */
  keyPrefix?: string;
  /** Enable cache statistics tracking */
  enableStats?: boolean;
  /** Cleanup interval in milliseconds */
  cleanupInterval?: number;
}

/**
 * Cache set options
 */
export interface CacheSetOptions {
  /** Time to live in milliseconds */
  ttl?: number;
  /** Cache tags for grouped invalidation */
  tags?: string[];
}

/**
 * Cache client interface - standardized cache operations
 */
export interface CacheClient {
  /** Get cached value */
  get<T = unknown>(key: string): Promise<T | null>;
  /** Set cached value */
  set<T>(key: string, value: T, options?: CacheSetOptions): Promise<boolean>;
  /** Delete cached value */
  del(key: string): Promise<boolean>;
  /** Check if key exists */
  exists(key: string): Promise<boolean>;
  /** Set TTL for existing key */
  expire(key: string, ttlSeconds: number): Promise<boolean>;
  /** Get keys matching pattern */
  keys(pattern: string): Promise<string[]>;
  /** Clear all cache entries */
  flush(): Promise<boolean>;
  /** Get cache statistics */
  getStats(): Promise<CacheStats>;
}

// =============================================================================
// CACHE DECORATOR TYPES
// =============================================================================

/**
 * Cache decorator options
 */
export interface CacheDecoratorOptions<TArgs extends readonly unknown[]> {
  /** Time to live in milliseconds */
  ttl?: number;
  /** Custom cache key generator function */
  keyGenerator?: (...args: TArgs) => string;
  /** Cache tags (static or dynamic) */
  tags?: string[] | ((...args: TArgs) => string[]);
  /** Whether to cache null/undefined results */
  cacheNulls?: boolean;
}

// =============================================================================
// CACHE UTILITY TYPES
// =============================================================================

/**
 * Cache invalidation options
 */
export interface CacheInvalidationOptions {
  /** Invalidate by specific keys */
  keys?: string[];
  /** Invalidate by key patterns */
  patterns?: string[];
  /** Invalidate by cache tags */
  tags?: string[];
}

/**
 * Cache warming options
 */
export interface CacheWarmingOptions {
  /** Data keys to pre-load */
  keys: string[];
  /** TTL for warmed entries */
  ttl?: number;
  /** Tags for warmed entries */
  tags?: string[];
}

// =============================================================================
// CACHE KEY GENERATORS
// =============================================================================

/**
 * Common cache key patterns
 */
export const CacheKeyPatterns = {
  /** User profile cache key */
  userProfile: (userId: string) => `user:profile:${userId}`,
  /** Resident cache key */
  resident: (id: string) => `resident:${id}`,
  /** Household cache key */
  household: (id: string) => `household:${id}`,
  /** Dashboard stats cache key */
  dashboardStats: (barangayCode: string) => `dashboard:stats:${barangayCode}`,
  /** Geographic data cache keys */
  regions: () => 'geo:regions',
  provinces: (regionCode?: string) => `geo:provinces:${regionCode || 'all'}`,
  cities: (provinceCode?: string) => `geo:cities:${provinceCode || 'all'}`,
  barangays: (cityCode?: string) => `geo:barangays:${cityCode || 'all'}`,
  /** Search results cache */
  searchResults: (query: string, filters?: Record<string, unknown>) =>
    `search:${query}:${filters ? JSON.stringify(filters) : 'no-filters'}`,
} as const;

/**
 * Common cache tags for invalidation
 */
export const CacheTags = {
  /** User-related data */
  USERS: 'users',
  /** Resident data */
  RESIDENTS: 'residents',
  /** Household data */
  HOUSEHOLDS: 'households',
  /** Geographic/address data */
  ADDRESSES: 'addresses',
  /** Dashboard statistics */
  DASHBOARD: 'dashboard',
  /** User profiles */
  PROFILES: 'profiles',
  /** Search results */
  SEARCH: 'search',
} as const;

// =============================================================================
// CACHE ERROR TYPES
// =============================================================================

/**
 * Cache operation error
 */
export interface CacheError {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Cache key that caused the error */
  key?: string;
  /** Additional error details */
  details?: Record<string, unknown>;
}

/**
 * Cache operation result
 */
export interface CacheOperationResult<T = unknown> {
  /** Operation success status */
  success: boolean;
  /** Result data (if successful) */
  data?: T;
  /** Error information (if failed) */
  error?: CacheError;
}
