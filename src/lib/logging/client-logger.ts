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
  component(component: string, action: string, data?: any): void {
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
  userAction(action: string, component?: string, data?: any): void {
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
    // In a real implementation, this would send to your monitoring service
    // For now, we'll use a structured console output
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      url: window?.location?.href,
      userAgent: navigator?.userAgent,
    };

    // Could send to services like:
    // - Sentry
    // - LogRocket
    // - DataDog
    // - Custom logging endpoint

    // For now, just structure the console output
    console.log(`[${level.toUpperCase()}]`, logEntry);
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
export const logError = (messageOrError: string | Error, context?: LogContext) => {
  const message = messageOrError instanceof Error ? messageOrError.message : messageOrError;
  const errorContext = messageOrError instanceof Error 
    ? { ...context, error: messageOrError }
    : context;
  return clientLogger.error(message, errorContext);
};
/**
 * log Component
 *
 * @description log Component utility function
 * @returns {unknown} Function execution result
 */
export const logComponent = (component: string, action: string, data?: any) =>
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
export const logUserAction = (action: string, component?: string, data?: any) =>
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
