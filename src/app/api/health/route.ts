/**
 * Health Check Endpoint
 * Production monitoring and system status checks
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

import {
  performRuntimeHealthCheck,
  validateEnvironment,
  getEnvironmentConfig,
} from '@/lib/config/environment';

export const dynamic = 'force-dynamic';

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  environment: string;
  uptime: number;
  checks: {
    [key: string]: {
      status: 'pass' | 'fail' | 'warn';
      message: string;
      responseTime?: number;
    };
  };
  system?: {
    memory?: {
      used: number;
      total: number;
      percentage: number;
    };
    node?: {
      version: string;
      platform: string;
    };
  };
}

/**
 * Basic health check endpoint
 * GET /api/health - Returns system health status
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    // Get environment configuration
    const envConfig = getEnvironmentConfig();
    const envValidation = validateEnvironment();

    // Perform comprehensive health checks
    const healthCheck = await performRuntimeHealthCheck();

    // Additional system information (server-side only)
    let systemInfo = {};
    if (typeof process !== 'undefined') {
      const memory = process.memoryUsage();
      systemInfo = {
        memory: {
          used: Math.round(memory.heapUsed / 1024 / 1024), // MB
          total: Math.round(memory.heapTotal / 1024 / 1024), // MB
          percentage: Math.round((memory.heapUsed / memory.heapTotal) * 100),
        },
        node: {
          version: process.version,
          platform: process.platform,
        },
      };
    }

    // Calculate uptime
    const uptime = typeof process !== 'undefined' && process.uptime ? process.uptime() : 0;

    // Determine overall status
    const hasFailures = Object.values(healthCheck.checks).some(check => check.status === 'fail');
    const hasWarnings = Object.values(healthCheck.checks).some(check => check.status === 'warn');
    const environmentValid = envValidation.isValid;

    let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    if (!environmentValid || hasFailures) {
      status = 'unhealthy';
    } else if (hasWarnings || envValidation.warnings.length > 0) {
      status = 'degraded';
    }

    const result: HealthCheckResult = {
      status,
      timestamp: new Date().toISOString(),
      version: envConfig.appVersion || '1.0.0',
      environment: envConfig.environment,
      uptime: Math.round(uptime),
      checks: {
        ...healthCheck.checks,
        environment: {
          status: environmentValid ? 'pass' : 'fail',
          message: environmentValid
            ? 'Environment configuration valid'
            : `Environment issues: ${envValidation.errors.join(', ')}`,
          responseTime: Date.now() - startTime,
        },
      },
      system: systemInfo,
    };

    // Add environment warnings to checks if any
    if (envValidation.warnings.length > 0) {
      result.checks.environment_warnings = {
        status: 'warn',
        message: `Warnings: ${envValidation.warnings.join(', ')}`,
      };
    }

    // Return appropriate HTTP status code
    const httpStatus = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;

    return NextResponse.json(result, {
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    // Fallback error response
    const result: HealthCheckResult = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: 'unknown',
      uptime: 0,
      checks: {
        system: {
          status: 'fail',
          message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          responseTime: Date.now() - startTime,
        },
      },
    };

    return NextResponse.json(result, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  }
}

/**
 * Detailed health check endpoint
 * POST /api/health - Returns detailed system diagnostics
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Check if request has proper authorization for detailed checks
    const authHeader = request.headers.get('Authorization');
    const isAuthorized = authHeader && authHeader.includes('Bearer');

    if (!isAuthorized) {
      return NextResponse.json(
        {
          error: 'Unauthorized access to detailed health checks',
        },
        { status: 401 }
      );
    }

    // Perform detailed checks
    const startTime = Date.now();
    const envValidation = validateEnvironment();
    const healthCheck = await performRuntimeHealthCheck();

    // Database connectivity test
    let dbCheck: { status: 'pass' | 'fail' | 'skip'; message: string; responseTime?: number } = {
      status: 'skip',
      message: 'Database check skipped',
    };

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        const dbStartTime = Date.now();
        const { error } = await supabase.from('auth_user_profiles').select('id').limit(1);
        const dbResponseTime = Date.now() - dbStartTime;

        dbCheck = {
          status: error ? 'fail' : 'pass',
          message: error
            ? `Database error: ${error.message}`
            : `Database accessible (${dbResponseTime}ms)`,
          responseTime: dbResponseTime,
        };
      } catch (error) {
        dbCheck = {
          status: 'fail',
          message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    }

    const result = {
      status: 'detailed-check',
      timestamp: new Date().toISOString(),
      environment: envValidation,
      runtime: healthCheck,
      database: dbCheck,
      performance: {
        checkDuration: Date.now() - startTime,
        memoryUsage: typeof process !== 'undefined' ? process.memoryUsage() : null,
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Detailed health check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
