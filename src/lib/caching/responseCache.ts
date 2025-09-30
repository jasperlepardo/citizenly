/**
 * HTTP Response Caching Middleware
 * Simplified caching for API responses
 */

import { NextRequest, NextResponse } from 'next/server';

// Simplified logger
const logger = {
  debug: (msg: string, data?: any) => process.env.NODE_ENV === 'development' && console.debug(`[ResponseCache] ${msg}`, data),
  info: (msg: string, data?: any) => console.info(`[ResponseCache] ${msg}`, data),
  error: (msg: string, data?: any) => console.error(`[ResponseCache] ${msg}`, data),
};

// Cache configuration interface
interface CacheConfig {
  ttl?: number;
  tags?: string[];
  varyBy?: string[];
  conditions?: {
    methods?: string[];
    statusCodes?: number[];
  };
}

interface CachedResponse<T = unknown> {
  status: number;
  headers: Record<string, string>;
  body: T;
  timestamp: number;
  etag?: string;
}

/**
 * Simple in-memory cache (stub implementation)
 */
const memoryCache = new Map<string, CachedResponse>();

/**
 * Response cache utility class
 */
export class ResponseCache {
  private readonly defaultTTL = 300; // 5 minutes

  /**
   * Generate cache key from request
   */
  private generateCacheKey(request: NextRequest, _config?: CacheConfig): string {
    const url = new URL(request.url);
    return `response_${request.method}_${url.pathname}_${url.search}`.replace(/[^a-zA-Z0-9_-]/g, '_');
  }

  /**
   * Generate ETag for response
   */
  private generateETag(body: unknown): string {
    const content = typeof body === 'string' ? body : JSON.stringify(body);
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return `"${Math.abs(hash).toString(36)}"`;
  }

  /**
   * Check if request should be cached
   */
  private shouldCache(request: NextRequest, response?: NextResponse): boolean {
    if (request.method !== 'GET') return false;
    if (response && response.status !== 200) return false;
    if (request.headers.has('x-no-cache')) return false;
    return true;
  }

  /**
   * Get cached response
   */
  async getCachedResponse(request: NextRequest, config?: CacheConfig): Promise<NextResponse | null> {
    if (!this.shouldCache(request)) return null;

    const cacheKey = this.generateCacheKey(request, config);
    const cached = memoryCache.get(cacheKey);

    if (!cached) {
      logger.debug('Cache miss', { cacheKey });
      return null;
    }

    // Check if cached response is still valid
    const age = Date.now() - cached.timestamp;
    const maxAge = (config?.ttl || this.defaultTTL) * 1000;

    if (age > maxAge) {
      logger.debug('Cache expired', { cacheKey });
      memoryCache.delete(cacheKey);
      return null;
    }

    logger.debug('Cache hit', { cacheKey });

    const headers = new Headers(cached.headers);
    headers.set('X-Cache', 'HIT');
    headers.set('X-Cache-Age', Math.round(age / 1000).toString());

    if (cached.etag) {
      headers.set('ETag', cached.etag);
    }

    return new NextResponse(
      typeof cached.body === 'string' ? cached.body : JSON.stringify(cached.body),
      {
        status: cached.status,
        headers,
      }
    );
  }

  /**
   * Cache response
   */
  async cacheResponse(request: NextRequest, response: NextResponse, config?: CacheConfig): Promise<void> {
    if (!this.shouldCache(request, response)) return;

    const cacheKey = this.generateCacheKey(request, config);

    try {
      const responseClone = response.clone();
      const body = await responseClone.text();
      const etag = this.generateETag(body);

      const headers: Record<string, string> = {};
      responseClone.headers.forEach((value, key) => {
        headers[key] = value;
      });

      const cachedResponse: CachedResponse = {
        status: response.status,
        headers,
        body: this.isJSON(body) ? JSON.parse(body) : body,
        timestamp: Date.now(),
        etag,
      };

      memoryCache.set(cacheKey, cachedResponse);

      response.headers.set('X-Cache', 'MISS');
      response.headers.set('ETag', etag);

      logger.debug('Response cached', { cacheKey });
    } catch (error) {
      logger.error('Cache storage error', { cacheKey, error });
    }
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidate(pattern: string): Promise<number> {
    let count = 0;
    const keys = Array.from(memoryCache.keys());
    for (const key of keys) {
      if (key.includes(pattern)) {
        memoryCache.delete(key);
        count++;
      }
    }
    logger.info('Cache invalidated', { pattern, count });
    return count;
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    return {
      keys: memoryCache.size,
      hits: 0,
      misses: 0,
    };
  }

  /**
   * Check if content is JSON
   */
  private isJSON(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const responseCache = new ResponseCache();

/**
 * Cache configuration presets
 */
export const CachePresets = {
  dashboard: {
    ttl: 120,
    tags: ['dashboard'],
  } as CacheConfig,

  residents: {
    ttl: 60,
    tags: ['residents'],
  } as CacheConfig,

  static: {
    ttl: 600,
    tags: ['static'],
  } as CacheConfig,

  search: {
    ttl: 30,
    tags: ['search'],
  } as CacheConfig,
};

/**
 * Middleware function for automatic response caching
 */
export function withResponseCache(config?: CacheConfig) {
  return async (
    request: NextRequest,
    handler: () => Promise<NextResponse>
  ): Promise<NextResponse> => {
    const cachedResponse = await responseCache.getCachedResponse(request, config);
    if (cachedResponse) {
      return cachedResponse;
    }

    const response = await handler();
    
    responseCache.cacheResponse(request, response, config).catch(error => {
      logger.error('Background cache storage failed', { error });
    });

    return response;
  };
}