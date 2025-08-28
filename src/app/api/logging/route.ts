/**
 * Logging API Endpoint
 * Centralized logging collection for client-side errors and events
 */

import { NextRequest, NextResponse } from 'next/server';

import { logger, createErrorResponseObject } from '@/lib';
import { isProduction, getEnvironment } from '@/lib/config/environment';
import type { LogEntry } from '@/types/api-requests';

export const dynamic = 'force-dynamic';

// LogEntry moved to src/types/api-requests.ts for consolidation

// Rate limiting for logging endpoint
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_LOGS = 100; // 100 log entries per minute per IP
const logCounts = new Map<string, { count: number; resetTime: number }>();

function checkLogRateLimit(ip: string): boolean {
  const now = Date.now();
  const current = logCounts.get(ip);

  if (!current || now > current.resetTime) {
    logCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (current.count >= RATE_LIMIT_MAX_LOGS) {
    return false;
  }

  current.count++;
  return true;
}

/**
 * POST /api/logging - Collect client-side logs
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Rate limiting
    const ip =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    if (!checkLogRateLimit(ip)) {
      return NextResponse.json(
        createErrorResponseObject('RATE_001', 'Logging rate limit exceeded'),
        { status: 429 }
      );
    }

    // Parse log entry
    const logEntry: LogEntry = await request.json();

    // Validate log entry structure
    if (!logEntry.timestamp || !logEntry.level || !logEntry.message) {
      return NextResponse.json(createErrorResponseObject('DATA_001', 'Invalid log entry format'), {
        status: 400,
      });
    }

    // Sanitize and enhance log entry
    const enhancedLogEntry = {
      ...logEntry,
      serverTimestamp: new Date().toISOString(),
      environment: getEnvironment(),
      ip,
      source: 'client',
    };

    // Log based on level
    const logMessage = `[CLIENT] ${logEntry.message}`;
    const logContext = {
      ...(typeof logEntry.context === 'object' && logEntry.context !== null ? logEntry.context : {}),
      clientData: {
        url: logEntry.url,
        userAgent: logEntry.userAgent,
        timestamp: logEntry.timestamp,
      },
    };

    switch (logEntry.level.toLowerCase()) {
      case 'error':
        logger.error(logMessage, logContext);
        break;
      case 'warn':
        logger.warn(logMessage, logContext);
        break;
      case 'info':
        logger.info(logMessage, logContext);
        break;
      case 'debug':
        if (!isProduction()) {
          logger.debug(logMessage, logContext);
        }
        break;
      default:
        logger.info(logMessage, logContext);
    }

    // In production, you might want to:
    // 1. Store logs in a database for analytics
    // 2. Forward to external logging services
    // 3. Trigger alerts for critical errors
    if (isProduction() && logEntry.level.toLowerCase() === 'error') {
      // TODO: Integrate with external monitoring services
      // - Send to Sentry
      // - Store in error tracking database
      // - Send Slack/email notifications for critical errors
    }

    return NextResponse.json({
      success: true,
      message: 'Log entry recorded',
      timestamp: enhancedLogEntry.serverTimestamp,
    });
  } catch (error) {
    // Don't use logger here to avoid potential recursion
    console.error('Logging endpoint error:', error);

    return NextResponse.json(
      createErrorResponseObject('SERVER_001', 'Failed to process log entry'),
      { status: 500 }
    );
  }
}

/**
 * GET /api/logging - Health check for logging service
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'operational',
    service: 'logging',
    environment: getEnvironment(),
    timestamp: new Date().toISOString(),
  });
}
