/**
 * Cache Statistics API Endpoint
 * Monitor cache performance and metrics
 */

import { NextRequest, NextResponse } from 'next/server';

import { createErrorResponseObject } from '@/lib';
import { cacheManager } from '@/lib/caching/redis-client';
import { responseCache } from '@/lib/caching/response-cache';
import { isProduction } from '@/lib/config/environment';
import { getConnectionPoolStats } from '@/lib/database/connection-pool';
import { queryOptimizer } from '@/lib/database/query-optimizer';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cache/stats - Get cache and performance statistics
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Simple authentication check for admin endpoints
    const authHeader = request.headers.get('Authorization');
    const isAuthorized = authHeader && (
      authHeader.includes('Bearer') || 
      (!isProduction() && authHeader === 'dev-token')
    );

    if (!isAuthorized) {
      return NextResponse.json(
        createErrorResponseObject('AUTH_001', 'Unauthorized access to cache statistics'),
        { status: 401 }
      );
    }

    // Gather all cache and performance statistics
    const [
      cacheStats,
      responseCacheStats,
      queryStats,
      connectionPoolStats
    ] = await Promise.allSettled([
      cacheManager.getStats(),
      responseCache.getStats(),
      Promise.resolve(queryOptimizer.getMetrics()),
      Promise.resolve(getConnectionPoolStats())
    ]);

    // Helper to safely get stats from settled promises
    const getStatsValue = (result: PromiseSettledResult<any>, defaultValue: any = {}) => {
      return result.status === 'fulfilled' ? result.value : defaultValue;
    };

    const stats: any = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      
      // Cache statistics
      cache: {
        general: getStatsValue(cacheStats, {
          hits: 0,
          misses: 0,
          keys: 0,
          memoryUsage: 0
        }),
        
        responseCache: getStatsValue(responseCacheStats, {
          hits: 0,
          misses: 0,
          keys: 0,
          hitRate: '0%'
        })
      },

      // Database performance
      database: {
        queryOptimizer: getStatsValue(queryStats, {
          totalQueries: 0,
          averageExecutionTime: 0,
          cacheHitRate: 0,
          slowQueries: [],
          recentQueries: []
        }),
        
        connectionPool: getStatsValue(connectionPoolStats, {
          activeConnections: 0,
          totalConnections: 0,
          availableConnections: 0,
          maxConnections: 0,
          utilizationPercentage: 0
        })
      },

      // Health indicators
      health: {
        cacheHealthy: cacheStats.status === 'fulfilled',
        databaseHealthy: connectionPoolStats.status === 'fulfilled',
        overallHealthy: [cacheStats, connectionPoolStats].every(s => s.status === 'fulfilled')
      }
    };

    // Add performance warnings
    const warnings: string[] = [];
    
    const dbStats = getStatsValue(connectionPoolStats);
    if (dbStats.utilizationPercentage > 80) {
      warnings.push('Database connection pool utilization is high (>80%)');
    }

    const queryMetrics = getStatsValue(queryStats);
    if (queryMetrics.averageExecutionTime > 1000) {
      warnings.push('Average query execution time is high (>1000ms)');
    }

    if (queryMetrics.slowQueries?.length > 5) {
      warnings.push(`${queryMetrics.slowQueries.length} slow queries detected`);
    }

    if (warnings.length > 0) {
      stats.warnings = warnings;
    }

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    return NextResponse.json(
      createErrorResponseObject('SERVER_001', 'Failed to retrieve cache statistics'),
      { status: 500 }
    );
  }
}

/**
 * POST /api/cache/stats - Cache management operations
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Simple authentication check for admin endpoints
    const authHeader = request.headers.get('Authorization');
    const isAuthorized = authHeader && (
      authHeader.includes('Bearer') || 
      (!isProduction() && authHeader === 'dev-token')
    );

    if (!isAuthorized) {
      return NextResponse.json(
        createErrorResponseObject('AUTH_001', 'Unauthorized cache management access'),
        { status: 401 }
      );
    }

    const { action, pattern, tags } = await request.json();

    let result: any = { success: false };

    switch (action) {
      case 'clear':
        await cacheManager.clear();
        queryOptimizer.clearCache();
        result = { success: true, message: 'All caches cleared' };
        break;

      case 'invalidate':
        if (!pattern) {
          return NextResponse.json(
            createErrorResponseObject('DATA_001', 'Pattern required for invalidation'),
            { status: 400 }
          );
        }
        const count = await responseCache.invalidate(pattern, tags);
        result = { 
          success: true, 
          message: `Invalidated ${count} cache entries matching pattern: ${pattern}` 
        };
        break;

      case 'clear-query-metrics':
        queryOptimizer.clearMetrics();
        result = { success: true, message: 'Query metrics cleared' };
        break;

      default:
        return NextResponse.json(
          createErrorResponseObject('DATA_001', 'Invalid cache action'),
          { status: 400 }
        );
    }

    return NextResponse.json(result);

  } catch (error) {
    return NextResponse.json(
      createErrorResponseObject('SERVER_001', 'Cache management operation failed'),
      { status: 500 }
    );
  }
}