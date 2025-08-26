'use client';

/**
 * Logger Hook
 *
 * @description Centralized logging service for development and production environments.
 * Provides structured logging with component context and automatic error tracking.
 */

import { useCallback, useRef } from 'react';

/**
 * Log levels for different severity
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Log entry structure
 */
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  data?: any;
  error?: Error;
  userId?: string;
  sessionId?: string;
}

/**
 * Logger configuration
 */
interface LoggerConfig {
  enableInProduction?: boolean;
  sendToMonitoring?: boolean;
  logToConsole?: boolean;
  minLevel?: LogLevel;
}

/**
 * Logger return interface
 */
export interface UseLoggerReturn {
  debug: (message: string, data?: any) => void;
  info: (message: string, data?: any) => void;
  warn: (message: string, data?: any) => void;
  error: (message: string, error?: Error | any, data?: any) => void;
  critical: (message: string, error?: Error, data?: any) => void;
  trackPerformance: (operation: string, duration: number) => void;
  trackEvent: (event: string, properties?: Record<string, any>) => void;
}

/**
 * Get current environment configuration
 */
const getEnvironmentConfig = (): LoggerConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return {
    enableInProduction: process.env.NEXT_PUBLIC_ENABLE_LOGGING === 'true',
    sendToMonitoring: !isDevelopment,
    logToConsole: isDevelopment,
    minLevel: isDevelopment ? LogLevel.DEBUG : LogLevel.WARN,
  };
};

/**
 * Send log to monitoring service (placeholder for actual implementation)
 */
const sendToMonitoringService = async (entry: LogEntry): Promise<void> => {
  // In production, this would send to services like Sentry, LogRocket, etc.
  if (process.env.NEXT_PUBLIC_MONITORING_ENDPOINT) {
    try {
      // Placeholder for actual monitoring service integration
      await fetch(process.env.NEXT_PUBLIC_MONITORING_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
    } catch {
      // Silently fail to avoid recursive errors
    }
  }
};

/**
 * Format log message for console output
 */
const formatConsoleMessage = (entry: LogEntry): string => {
  const timestamp = new Date(entry.timestamp).toLocaleTimeString();
  const prefix = `[${timestamp}] [${entry.component}] [${entry.level.toUpperCase()}]`;
  return `${prefix} ${entry.message}`;
};

/**
 * Determine if log should be output based on level
 */
const shouldLog = (level: LogLevel, minLevel: LogLevel): boolean => {
  const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.CRITICAL];
  const currentIndex = levels.indexOf(level);
  const minIndex = levels.indexOf(minLevel);
  return currentIndex >= minIndex;
};

/**
 * Custom hook for structured logging
 *
 * @param component - Name of the component or hook using the logger
 * @param config - Optional configuration overrides
 * @returns Logger functions for different severity levels
 *
 * @example
 * ```typescript
 * function useMyHook() {
 *   const logger = useLogger('useMyHook');
 *
 *   const fetchData = async () => {
 *     logger.debug('Fetching data...');
 *     try {
 *       const data = await api.getData();
 *       logger.info('Data fetched successfully', { count: data.length });
 *     } catch (error) {
 *       logger.error('Failed to fetch data', error);
 *     }
 *   };
 * }
 * ```
 */
export function useLogger(component: string, config?: Partial<LoggerConfig>): UseLoggerReturn {
  const environmentConfig = getEnvironmentConfig();
  const finalConfig = { ...environmentConfig, ...config };
  const performanceMap = useRef<Map<string, number[]>>(new Map());

  /**
   * Core logging function
   */
  const log = useCallback(
    (level: LogLevel, message: string, error?: Error | any, data?: any) => {
      if (!shouldLog(level, finalConfig.minLevel || LogLevel.INFO)) {
        return;
      }

      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level,
        component,
        message,
        data: data !== undefined ? data : undefined,
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
        userId:
          typeof window !== 'undefined'
            ? window.localStorage.getItem('userId') || undefined
            : undefined,
        sessionId:
          typeof window !== 'undefined'
            ? window.sessionStorage.getItem('sessionId') || undefined
            : undefined,
      };

      // Log to console in development
      if (finalConfig.logToConsole) {
        const consoleMessage = formatConsoleMessage(entry);
        const consoleData = entry.data || entry.error;

        switch (level) {
          case LogLevel.DEBUG:
            console.debug(consoleMessage, consoleData);
            break;
          case LogLevel.INFO:
            console.info(consoleMessage, consoleData);
            break;
          case LogLevel.WARN:
            console.warn(consoleMessage, consoleData);
            break;
          case LogLevel.ERROR:
          case LogLevel.CRITICAL:
            console.error(consoleMessage, consoleData);
            break;
        }
      }

      // Send to monitoring service in production
      if (finalConfig.sendToMonitoring && level >= LogLevel.WARN) {
        sendToMonitoringService(entry);
      }
    },
    [component, finalConfig]
  );

  /**
   * Debug level logging
   */
  const debug = useCallback(
    (message: string, data?: any) => {
      log(LogLevel.DEBUG, message, undefined, data);
    },
    [log]
  );

  /**
   * Info level logging
   */
  const info = useCallback(
    (message: string, data?: any) => {
      log(LogLevel.INFO, message, undefined, data);
    },
    [log]
  );

  /**
   * Warning level logging
   */
  const warn = useCallback(
    (message: string, data?: any) => {
      log(LogLevel.WARN, message, undefined, data);
    },
    [log]
  );

  /**
   * Error level logging
   */
  const error = useCallback(
    (message: string, error?: Error | any, data?: any) => {
      log(LogLevel.ERROR, message, error, data);
    },
    [log]
  );

  /**
   * Critical error logging (always sent to monitoring)
   */
  const critical = useCallback(
    (message: string, error?: Error, data?: any) => {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: LogLevel.CRITICAL,
        component,
        message,
        data,
        error: error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : undefined,
      };

      // Always log critical errors
      if (finalConfig.logToConsole) {
        console.error(formatConsoleMessage(entry), error);
      }

      // Always send critical errors to monitoring
      sendToMonitoringService(entry);
    },
    [component, finalConfig.logToConsole]
  );

  /**
   * Track performance metrics
   */
  const trackPerformance = useCallback(
    (operation: string, duration: number) => {
      const message = `Performance: ${operation} took ${duration}ms`;

      if (duration > 1000) {
        warn(message, { operation, duration, slow: true });
      } else if (finalConfig.logToConsole && process.env.NODE_ENV === 'development') {
        debug(message, { operation, duration });
      }

      // Store for aggregation
      const key = `${component}:${operation}`;
      const current = performanceMap.current.get(key) || [];
      performanceMap.current.set(key, [...current, duration]);
    },
    [component, debug, warn, finalConfig.logToConsole]
  );

  /**
   * Track custom events
   */
  const trackEvent = useCallback(
    (event: string, properties?: Record<string, any>) => {
      info(`Event: ${event}`, properties);

      // Send to analytics service if configured
      if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.track(event, {
          component,
          ...properties,
        });
      }
    },
    [component, info]
  );

  return {
    debug,
    info,
    warn,
    error,
    critical,
    trackPerformance,
    trackEvent,
  };
}

/**
 * Default logger instance for non-component contexts
 */
export const logger = {
  debug: (component: string, message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${component}] ${message}`, data);
    }
  },
  info: (component: string, message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[${component}] ${message}`, data);
    }
  },
  warn: (component: string, message: string, data?: any) => {
    console.warn(`[${component}] ${message}`, data);
  },
  error: (component: string, message: string, error?: any) => {
    console.error(`[${component}] ${message}`, error);
  },
};
