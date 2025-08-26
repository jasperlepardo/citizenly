/**
 * Client-Side Logging Utility
 * Replaces console.log with structured logging for development and production
 */

interface LogContext {
  component?: string;
  action?: string;
  data?: Record<string, unknown>;
  error?: Error;
  userId?: string;
  sessionId?: string;
}

interface LogLevel {
  DEBUG: 'debug';
  INFO: 'info';
  WARN: 'warn';
  ERROR: 'error';
}

const LOG_LEVELS: LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
};

class ClientLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  /**
   * Log debug information (development only)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(`🐛 [DEBUG] ${message}`, context || '');
    }
  }

  /**
   * Log general information
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.info(`ℹ️ [INFO] ${message}`, context || '');
    }

    // In production, send to monitoring service
    if (this.isProduction) {
      this.sendToMonitoring('info', message, context);
    }
  }

  /**
   * Log warnings
   */
  warn(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.warn(`⚠️ [WARN] ${message}`, context || '');
    }

    // Always log warnings in production
    if (this.isProduction) {
      this.sendToMonitoring('warn', message, context);
    }
  }

  /**
   * Log errors
   */
  error(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.error(`🚨 [ERROR] ${message}`, context || '');
    }

    // Always log errors in production
    if (this.isProduction) {
      this.sendToMonitoring('error', message, context);
    }
  }

  /**
   * Log component lifecycle events
   */
  component(component: string, action: string, data?: Record<string, string | number | boolean>): void {
    this.debug(`Component ${component}: ${action}`, {
      component,
      action,
      data,
    });
  }

  /**
   * Log API calls and responses
   */
  api(method: string, url: string, status?: number, duration?: number): void {
    const message = `${method.toUpperCase()} ${url}`;
    const context = { action: 'api_call', data: { method, url, status, duration } };

    if (status && status >= 400) {
      this.warn(`${message} - Status: ${status}`, context);
    } else {
      this.info(`${message} - Status: ${status || 'pending'}`, context);
    }
  }

  /**
   * Log user interactions
   */
  userAction(action: string, component?: string, data?: Record<string, string | number | boolean>): void {
    this.info(`User action: ${action}`, {
      component,
      action: 'user_interaction',
      data,
    });
  }

  /**
   * Log search operations
   */
  search(searchTerm: string, component: string, resultsCount?: number): void {
    this.info(`Search performed: "${searchTerm}"`, {
      component,
      action: 'search',
      data: { searchTerm, resultsCount },
    });
  }

  /**
   * Log data loading operations
   */
  dataLoad(resource: string, count?: number, duration?: number): void {
    this.info(`Data loaded: ${resource}`, {
      action: 'data_load',
      data: { resource, count, duration },
    });
  }

  /**
   * Send logs to monitoring service in production
   */
  private sendToMonitoring(level: string, message: string, context?: LogContext): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      context,
      url: typeof window !== 'undefined' ? window.location?.href : 'server',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
      environment: process.env.NODE_ENV,
    };

    // Send to external monitoring services based on configuration
    if (this.isProduction) {
      // Sentry integration
      if (typeof window !== 'undefined' && (window as any).Sentry) {
        const Sentry = (window as any).Sentry;
        
        if (level === 'error') {
          Sentry.captureException(context?.error || new Error(message), {
            tags: { component: context?.component },
            contexts: {
              custom: {
                action: context?.action,
                data: context?.data,
                url: logEntry.url,
              }
            }
          });
        } else if (level === 'warn') {
          Sentry.captureMessage(message, 'warning');
        }
      }

      // Custom API endpoint for structured logging
      if (typeof window !== 'undefined') {
        fetch('/api/logging', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(logEntry),
        }).catch(() => {
          // Silent fail - don't create logging loops
        });
      }
    }

    // Development: structured console output
    if (this.isDevelopment) {
      const colorMap = {
        error: '\x1b[31m', // Red
        warn: '\x1b[33m',  // Yellow
        info: '\x1b[36m',  // Cyan
        debug: '\x1b[90m', // Gray
      };
      const resetColor = '\x1b[0m';
      const color = colorMap[level as keyof typeof colorMap] || '';
      
      console.log(`${color}[${logEntry.level}] ${logEntry.message}${resetColor}`, {
        timestamp: logEntry.timestamp,
        context: logEntry.context,
        url: logEntry.url
      });
    }
  }
}

// Export singleton instance
export const clientLogger = new ClientLogger();

// Export convenience methods
/**
 * log Debug
 *
 * @description log Debug utility function
 * @returns {unknown} Function execution result
 */
export const logDebug = (message: string, context?: LogContext) =>
  clientLogger.debug(message, context);
/**
 * log Info
 *
 * @description log Info utility function
 * @returns {unknown} Function execution result
 */
export const logInfo = (message: string, context?: LogContext) =>
  clientLogger.info(message, context);
/**
 * log Warn
 *
 * @description log Warn utility function
 * @returns {unknown} Function execution result
 */
export const logWarn = (message: string, context?: LogContext) =>
  clientLogger.warn(message, context);
/**
 * log Error
 *
 * @description log Error utility function
 * @returns {unknown} Function execution result
 */
export const logError = (messageOrError: string | Error, context?: LogContext | string) => {
  const message = messageOrError instanceof Error ? messageOrError.message : messageOrError;
  
  // Handle string context by converting to LogContext
  const normalizedContext: LogContext | undefined = typeof context === 'string' 
    ? { action: context }
    : context;
    
  const errorContext = messageOrError instanceof Error 
    ? { ...normalizedContext, error: messageOrError }
    : normalizedContext;
    
  return clientLogger.error(message, errorContext);
};
/**
 * log Component
 *
 * @description log Component utility function
 * @returns {unknown} Function execution result
 */
export const logComponent = (component: string, action: string, data?: Record<string, string | number | boolean>) =>
  clientLogger.component(component, action, data);
/**
 * log Api
 *
 * @description log Api utility function
 * @returns {unknown} Function execution result
 */
export const logApi = (method: string, url: string, status?: number, duration?: number) =>
  clientLogger.api(method, url, status, duration);
/**
 * log User Action
 *
 * @description log User Action utility function
 * @returns {unknown} Function execution result
 */
export const logUserAction = (action: string, component?: string, data?: Record<string, string | number | boolean>) =>
  clientLogger.userAction(action, component, data);
/**
 * log Search
 *
 * @description log Search utility function
 * @returns {unknown} Function execution result
 */
export const logSearch = (searchTerm: string, component: string, resultsCount?: number) =>
  clientLogger.search(searchTerm, component, resultsCount);
/**
 * log Data Load
 *
 * @description log Data Load utility function
 * @returns {unknown} Function execution result
 */
export const logDataLoad = (resource: string, count?: number, duration?: number) =>
  clientLogger.dataLoad(resource, count, duration);

// Default export
export default clientLogger;
