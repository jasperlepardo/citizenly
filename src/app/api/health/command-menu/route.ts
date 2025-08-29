/**
 * Command Menu Health Check Endpoint
 * Production monitoring endpoint for command menu system
 */

import { NextResponse } from 'next/server';

import { withSecurityHeaders } from '@/lib/authentication/responseUtils';
import { getCommandMenuHealth } from '@/lib/command-menu/analytics-utils';

// GET /api/health/command-menu - Health check for command menu system
export const GET = withSecurityHeaders(async () => {
  try {
    const health = getCommandMenuHealth();

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      component: 'command-menu',
      health: {
        status: health.status,
        metrics: {
          searchLatency: Math.round(health.metrics.searchLatency),
          cacheHitRate: Math.round(health.metrics.cacheHitRate * 100) / 100,
          errorRate: Math.round(health.metrics.errorRate * 10000) / 10000, // 4 decimal places
          usageFrequency: health.metrics.usageFrequency,
        },
        checks: {
          search_performance: health.metrics.searchLatency < 1000 ? 'pass' : 'fail',
          cache_efficiency: health.metrics.cacheHitRate > 0.3 ? 'pass' : 'warn',
          error_rate: health.metrics.errorRate < 0.1 ? 'pass' : 'fail',
          system_responsive: health.status !== 'critical' ? 'pass' : 'fail',
        },
      },
    });
  } catch {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        component: 'command-menu',
        health: {
          status: 'critical',
          error: 'Health check failed',
          checks: {
            search_performance: 'fail',
            cache_efficiency: 'fail',
            error_rate: 'fail',
            system_responsive: 'fail',
          },
        },
      },
      { status: 500 }
    );
  }
});

// Disable caching for health checks
export const dynamic = 'force-dynamic';
export const revalidate = 0;
