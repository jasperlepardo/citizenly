/**
 * Performance Monitoring Middleware
 * Track API route performance and add optimization headers
 */

import { NextRequest, NextResponse } from 'next/server';
import type { RequestPerformanceMetrics } from '@/types/performance';

// In-memory performance store (use proper metrics service in production)
const performanceStore: RequestPerformanceMetrics[] = [];
const MAX_STORED_METRICS = 1000;

/**
 * Record performance metrics
 */
function recordMetrics(metrics: RequestPerformanceMetrics): void {
  performanceStore.push(metrics);

  // Keep only recent metrics
  if (performanceStore.length > MAX_STORED_METRICS) {
    performanceStore.shift();
  }

  // Log slow requests
  if (metrics.duration > 1000) {
    console.warn('🐌 Slow API request detected:', {
      path: metrics.path,
      method: metrics.method,
      duration: `${metrics.duration}ms`,
      statusCode: metrics.statusCode,
    });
  }
}

/**
 * Get performance statistics
 */
export function getPerformanceStats(): {
  totalRequests: number;
  averageResponseTime: number;
  slowRequests: number;
  recentMetrics: RequestPerformanceMetrics[];
} {
  const now = Date.now();
  const recentMetrics = performanceStore.filter(m => now - m.timestamp < 60 * 60 * 1000); // Last hour

  const totalRequests = recentMetrics.length;
  const averageResponseTime =
    totalRequests > 0 ? recentMetrics.reduce((sum, m) => sum + m.duration, 0) / totalRequests : 0;
  const slowRequests = recentMetrics.filter(m => m.duration > 1000).length;

  return {
    totalRequests,
    averageResponseTime: Math.round(averageResponseTime),
    slowRequests,
    recentMetrics: recentMetrics.slice(-10), // Last 10 requests
  };
}

/**
 * Add performance optimization headers
 */
function addPerformanceHeaders(response: NextResponse, duration: number): NextResponse {
  // Server timing API
  response.headers.set('Server-Timing', `total;dur=${duration}`);

  // Cache control for different response types
  const status = response.status;
  if (status === 200) {
    // Cache successful responses briefly
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=600');
  } else if (status >= 400 && status < 500) {
    // Don't cache client errors
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  } else if (status >= 500) {
    // Don't cache server errors
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  }

  return response;
}

/**
 * Performance monitoring middleware
 */
export function withPerformanceMonitoring(
  handler: (request: NextRequest, context: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: any): Promise<NextResponse> => {
    const startTime = Date.now();
    const path = new URL(request.url).pathname;

    let response: NextResponse;
    let error: Error | null = null;

    try {
      response = await handler(request, context);
    } catch (err) {
      error = err instanceof Error ? err : new Error('Unknown error');
      response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const duration = Date.now() - startTime;

    // Record metrics
    const metrics: RequestPerformanceMetrics = {
      path,
      method: request.method,
      duration,
      timestamp: startTime,
      statusCode: response.status,
      userAgent: request.headers.get('user-agent') || undefined,
      ip:
        request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        undefined,
    };

    recordMetrics(metrics);

    // Add performance headers
    response = addPerformanceHeaders(response, duration);

    // Add request ID for debugging
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    response.headers.set('X-Request-ID', requestId);

    // Log if there was an error
    if (error) {
      console.error('❌ API route error:', {
        requestId,
        path,
        method: request.method,
        duration: `${duration}ms`,
        error: error.message,
      });
    }

    return response;
  };
}

/**
 * Database query performance tracking
 */
export class QueryPerformanceTracker {
  private static queries: Array<{
    query: string;
    duration: number;
    timestamp: number;
  }> = [];

  static startTracking(query: string): () => void {
    const startTime = Date.now();

    return () => {
      const duration = Date.now() - startTime;
      this.queries.push({
        query,
        duration,
        timestamp: startTime,
      });

      // Keep only recent queries
      if (this.queries.length > 500) {
        this.queries.shift();
      }

      // Log slow queries
      if (duration > 500) {
        console.warn('🐌 Slow database query:', {
          query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
          duration: `${duration}ms`,
        });
      }
    };
  }

  static getStats() {
    const now = Date.now();
    const recentQueries = this.queries.filter(q => now - q.timestamp < 60 * 60 * 1000);

    return {
      totalQueries: recentQueries.length,
      averageQueryTime:
        recentQueries.length > 0
          ? Math.round(recentQueries.reduce((sum, q) => sum + q.duration, 0) / recentQueries.length)
          : 0,
      slowQueries: recentQueries.filter(q => q.duration > 500).length,
    };
  }
}

/**
 * Memory usage monitoring
 */
export function getMemoryUsage(): {
  used: number;
  total: number;
  percentage: number;
} {
  const memUsage = process.memoryUsage();
  const used = Math.round(memUsage.heapUsed / 1024 / 1024); // MB
  const total = Math.round(memUsage.heapTotal / 1024 / 1024); // MB

  return {
    used,
    total,
    percentage: Math.round((used / total) * 100),
  };
}
