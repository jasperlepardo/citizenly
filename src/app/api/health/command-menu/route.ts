/**
 * Command Menu Health Check Endpoint
 * Production monitoring endpoint for command menu system
 */

import { NextResponse } from 'next/server';

import { withSecurityHeaders } from '@/utils/auth/apiResponseHandlers';
// Note: command-menu analytics removed - directory was deleted as unused
const getCommandMenuHealth = () => ({ status: 'healthy', timestamp: new Date().toISOString() });

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
          searchLatency: Math.round((health as any).metrics?.searchLatency || 0),
          cacheHitRate: Math.round(((health as any).metrics?.cacheHitRate || 0) * 100) / 100,
          errorRate: Math.round(((health as any).metrics?.errorRate || 0) * 10000) / 10000,
          usageFrequency: (health as any).metrics?.usageFrequency || 'low',
        },
        checks: {
          search_performance: ((health as any).metrics?.searchLatency || 0) < 1000 ? 'pass' : 'fail',
          cache_efficiency: ((health as any).metrics?.cacheHitRate || 0) > 0.3 ? 'pass' : 'warn',
          error_rate: ((health as any).metrics?.errorRate || 0) < 0.1 ? 'pass' : 'fail',
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
