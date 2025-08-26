/**
 * Sentry Configuration for Error Monitoring
 * Centralized error tracking and performance monitoring setup
 */

import { isProduction, isDevelopment, getEnvironment } from '@/lib/config/environment';

interface SentryConfig {
  dsn: string | undefined;
  environment: string;
  tracesSampleRate: number;
  replaysSessionSampleRate: number;
  replaysOnErrorSampleRate: number;
  beforeSend?: (event: any, hint: any) => any | null;
  initialScope?: {
    tags: Record<string, string>;
    user: Record<string, any>;
  };
}

/**
 * Get Sentry configuration for current environment
 */
export const getSentryConfig = (): SentryConfig => {
  return {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: getEnvironment(),

    // Performance Monitoring
    tracesSampleRate: isProduction() ? 0.1 : 1.0, // Capture 10% of the transactions in production

    // Session Replay
    replaysSessionSampleRate: isProduction() ? 0.01 : 0.1, // 1% in production, 10% in development
    replaysOnErrorSampleRate: 1.0, // Always capture replays for errors

    // Filter and enhance events before sending
    beforeSend: (event, hint) => {
      // Don't send events in development unless explicitly enabled
      if (isDevelopment() && process.env.NEXT_PUBLIC_SENTRY_DEBUG !== 'true') {
        return null;
      }

      // Filter out known non-critical errors
      if (event.exception) {
        const error = hint.originalException;
        if (error instanceof Error) {
          // Filter out common browser extension errors
          if (
            error.message.includes('chrome-extension://') ||
            error.message.includes('moz-extension://') ||
            error.message.includes('safari-extension://')
          ) {
            return null;
          }

          // Filter out network errors that are expected
          if (error.message.includes('Failed to fetch') && error.message.includes('/api/')) {
            // Still log API errors but with lower severity
            event.level = 'warning';
          }
        }
      }

      // Enhance event with additional context
      event.tags = {
        ...event.tags,
        environment: getEnvironment(),
        component: event.tags?.component || 'unknown',
      };

      return event;
    },

    // Initial scope configuration
    initialScope: {
      tags: {
        environment: getEnvironment(),
        application: 'rbi-system',
      },
      user: {
        // Will be set dynamically when user is authenticated
      },
    },
  };
};

/**
 * Configure Sentry user context
 */
export const setSentryUser = (userId: string, email?: string, barangayCode?: string) => {
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    const Sentry = (window as any).Sentry;
    Sentry.setUser({
      id: userId,
      email,
      barangay_code: barangayCode,
    });
  }
};

/**
 * Set custom Sentry context
 */
export const setSentryContext = (key: string, context: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    const Sentry = (window as any).Sentry;
    Sentry.setContext(key, context);
  }
};

/**
 * Add breadcrumb for debugging
 */
export const addSentryBreadcrumb = (
  message: string,
  category?: string,
  level?: 'info' | 'warning' | 'error' | 'debug'
) => {
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    const Sentry = (window as any).Sentry;
    Sentry.addBreadcrumb({
      message,
      category: category || 'custom',
      level: level || 'info',
      timestamp: Date.now() / 1000,
    });
  }
};

/**
 * Manually capture exception
 */
export const captureError = (error: Error, context?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    const Sentry = (window as any).Sentry;
    Sentry.captureException(error, {
      contexts: {
        custom: context,
      },
    });
  }
};

/**
 * Performance monitoring helpers
 */
export const startSentryTransaction = (name: string, op?: string) => {
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    const Sentry = (window as any).Sentry;
    return Sentry.startTransaction({
      name,
      op: op || 'navigation',
    });
  }
  return null;
};

/**
 * Check if Sentry is properly configured
 */
export const isSentryConfigured = (): boolean => {
  return !!(
    process.env.NEXT_PUBLIC_SENTRY_DSN &&
    typeof window !== 'undefined' &&
    (window as any).Sentry
  );
};

export default getSentryConfig;
