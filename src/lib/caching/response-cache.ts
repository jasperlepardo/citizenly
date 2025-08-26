/**
 * HTTP Response Caching Middleware
 * Intelligent caching for API responses with cache-control headers
 */

import { NextRequest, NextResponse } from 'next/server';
import { cacheManager } from './redis-client';
import { createLogger, isProduction } from '@/lib/config/environment';
import { performanceMonitor } from '@/lib/monitoring/performance';

const logger = createLogger('ResponseCache');

export interface CacheConfig {
  ttl: number;
  tags?: string[];
  varyBy?: string[];
  conditions?: {
    methods?: string[];
    statusCodes?: number[];
    contentTypes?: string[];
  };
}

interface CachedResponse {
  status: number;
  headers: Record<string, string>;
  body: any;
  timestamp: number;
  etag?: string;
}

/**
 * Response cache utility class
 */
export class ResponseCache {
  private defaultTTL = 300; // 5 minutes
  private maxCacheSize = 100 * 1024 * 1024; // 100MB

  /**
   * Generate cache key from request
   */
  private generateCacheKey(
    request: NextRequest, 
    config?: CacheConfig
  ): string {
    const url = new URL(request.url);
    const method = request.method;
    
    // Base key components
    const keyParts = [
      'response',
      method.toLowerCase(),
      url.pathname,
      url.search
    ];

    // Add vary-by headers if specified
    if (config?.varyBy) {
      for (const header of config.varyBy) {
        const value = request.headers.get(header);
        if (value) {
          keyParts.push(`${header}:${value}`);
        }
      }
    }

    // Add user-specific caching for authenticated requests
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      // Use hashed version of token for security
      const tokenHash = this.hashString(authHeader);
      keyParts.push(`auth:${tokenHash.substring(0, 8)}`);
    }

    return keyParts.join('_').replace(/[^a-zA-Z0-9_-]/g, '_');
  }

  /**
   * Generate ETag for response
   */
  private generateETag(body: any): string {
    const content = typeof body === 'string' ? body : JSON.stringify(body);
    return `"${this.hashString(content).substring(0, 16)}"`;
  }

  /**
   * Simple hash function
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Check if request should be cached
   */
  private shouldCache(
    request: NextRequest, 
    response?: NextResponse,
    config?: CacheConfig
  ): boolean {
    // Don't cache in development by default
    if (!isProduction() && !process.env.ENABLE_DEV_CACHE) {
      return false;
    }

    // Check method
    const allowedMethods = config?.conditions?.methods || ['GET', 'HEAD'];
    if (!allowedMethods.includes(request.method)) {
      return false;
    }

    // Check status codes if response is provided
    if (response) {
      const allowedStatus = config?.conditions?.statusCodes || [200, 201, 203, 300, 301, 302, 304, 307, 308, 410];
      if (!allowedStatus.includes(response.status)) {
        return false;
      }
    }

    // Don't cache requests with certain headers
    const noCacheHeaders = ['authorization', 'x-no-cache'];
    for (const header of noCacheHeaders) {
      if (request.headers.has(header) && header !== 'authorization') {
        return false;
      }
    }

    return true;
  }

  /**
   * Get cached response
   */
  async getCachedResponse(
    request: NextRequest,
    config?: CacheConfig
  ): Promise<NextResponse | null> {
    if (!this.shouldCache(request, undefined, config)) {
      return null;
    }

    const cacheKey = this.generateCacheKey(request, config);
    const endMetric = performanceMonitor.startMetric('cache_lookup');

    try {
      const cached = await cacheManager.get<CachedResponse>(cacheKey);
      endMetric?.();

      if (!cached) {
        logger.debug('Cache miss', { cacheKey, url: request.url });
        return null;
      }

      // Check if cached response is still valid
      const age = Date.now() - cached.timestamp;
      const maxAge = (config?.ttl || this.defaultTTL) * 1000;
      
      if (age > maxAge) {
        logger.debug('Cache expired', { cacheKey, age, maxAge });
        await cacheManager.del(cacheKey);
        return null;
      }

      // Handle conditional requests
      const ifNoneMatch = request.headers.get('if-none-match');
      if (ifNoneMatch && cached.etag && ifNoneMatch === cached.etag) {
        logger.debug('Cache hit - 304 Not Modified', { cacheKey });
        return new NextResponse(null, {
          status: 304,
          headers: {
            'ETag': cached.etag,
            'Cache-Control': `public, max-age=${Math.floor((maxAge - age) / 1000)}`,
            'X-Cache': 'HIT'
          }
        });
      }

      // Return cached response
      logger.debug('Cache hit', { cacheKey, age: Math.round(age / 1000) });
      
      const headers = new Headers(cached.headers);
      headers.set('X-Cache', 'HIT');
      headers.set('X-Cache-Age', Math.round(age / 1000).toString());
      headers.set('Cache-Control', `public, max-age=${Math.floor((maxAge - age) / 1000)}`);
      
      if (cached.etag) {
        headers.set('ETag', cached.etag);
      }

      return new NextResponse(
        typeof cached.body === 'string' ? cached.body : JSON.stringify(cached.body),
        {
          status: cached.status,
          headers
        }
      );

    } catch (error) {
      endMetric?.();
      logger.error('Cache lookup error', {
        cacheKey,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  /**
   * Cache response
   */
  async cacheResponse(
    request: NextRequest,
    response: NextResponse,
    config?: CacheConfig
  ): Promise<void> {
    if (!this.shouldCache(request, response, config)) {
      return;
    }

    const cacheKey = this.generateCacheKey(request, config);
    const endMetric = performanceMonitor.startMetric('cache_store');

    try {
      // Clone response to avoid consuming the original
      const responseClone = response.clone();
      const body = await responseClone.text();
      const etag = this.generateETag(body);

      // Prepare headers for caching (exclude some headers)
      const headers: Record<string, string> = {};
      const excludedHeaders = ['set-cookie', 'authorization', 'x-cache'];
      
      responseClone.headers.forEach((value, key) => {
        if (!excludedHeaders.includes(key.toLowerCase())) {
          headers[key] = value;
        }
      });

      const cachedResponse: CachedResponse = {
        status: response.status,
        headers,
        body: this.isJSON(body) ? JSON.parse(body) : body,
        timestamp: Date.now(),
        etag
      };

      const ttl = config?.ttl || this.defaultTTL;
      await cacheManager.set(cacheKey, cachedResponse, ttl);

      // Add cache headers to the original response
      response.headers.set('X-Cache', 'MISS');
      response.headers.set('ETag', etag);
      response.headers.set('Cache-Control', `public, max-age=${ttl}`);

      logger.debug('Response cached', { 
        cacheKey, 
        ttl, 
        status: response.status,
        bodySize: body.length 
      });

    } catch (error) {
      logger.error('Cache storage error', {
        cacheKey,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      endMetric?.();
    }
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidate(pattern: string, tags?: string[]): Promise<number> {
    logger.info('Invalidating cache', { pattern, tags });
    
    const count = await cacheManager.invalidatePattern(`response_*${pattern}*`);
    
    // TODO: Implement tag-based invalidation when tags are used
    if (tags && tags.length > 0) {
      logger.debug('Tag-based invalidation not yet implemented', { tags });
    }

    return count;
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    const stats = await cacheManager.getStats();
    return {
      ...stats,
      hitRate: stats.hits > 0 ? ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(2) + '%' : '0%'
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
  // Dashboard data - cache for 2 minutes
  dashboard: {
    ttl: 120,
    tags: ['dashboard', 'stats'],
    conditions: {
      methods: ['GET'],
      statusCodes: [200]
    }
  } as CacheConfig,

  // Resident data - cache for 1 minute
  residents: {
    ttl: 60,
    tags: ['residents', 'data'],
    varyBy: ['authorization'],
    conditions: {
      methods: ['GET'],
      statusCodes: [200]
    }
  } as CacheConfig,

  // Static data - cache for 10 minutes
  static: {
    ttl: 600,
    tags: ['static'],
    conditions: {
      methods: ['GET'],
      statusCodes: [200, 304]
    }
  } as CacheConfig,

  // Search results - cache for 30 seconds
  search: {
    ttl: 30,
    tags: ['search'],
    varyBy: ['authorization'],
    conditions: {
      methods: ['GET'],
      statusCodes: [200]
    }
  } as CacheConfig
};

/**
 * Middleware function for automatic response caching
 */
export function withResponseCache(config?: CacheConfig) {
  return async (request: NextRequest, handler: () => Promise<NextResponse>): Promise<NextResponse> => {
    // Try to get cached response first
    const cachedResponse = await responseCache.getCachedResponse(request, config);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Execute the handler
    const response = await handler();

    // Cache the response asynchronously (don't await to avoid blocking)
    responseCache.cacheResponse(request, response, config).catch(error => {
      logger.error('Background cache storage failed', { error });
    });

    return response;
  };
}

export default responseCache;