/**
 * Error Handling Utilities
 *
 * @description Pure utility functions for error handling, logging, and recovery.
 * Contains error transformation, classification, and processing utilities.
 */

import { generateId } from '../utilities/id-generators';

import type {
  AppError,
  ErrorLogContext,
  NetworkError,
  ValidationError,
  FieldError,
} from './error-types';
import { ErrorSeverity, ErrorCode } from './error-types';

/**
 * Create a standardized application error
 */
export function createAppError(
  message: string,
  options: {
    code?: ErrorCode;
    cause?: Error;
    context?: Record<string, any>;
    severity?: ErrorSeverity;
  } = {}
): AppError {
  const error = new Error(message) as AppError;

  error.code = options.code || ErrorCode.UNKNOWN_ERROR;
  error.context = options.context || {};
  error.timestamp = new Date();
  error.severity = options.severity || ErrorSeverity.MEDIUM;

  if (options.cause) {
    error.cause = options.cause;
    error.stack = options.cause.stack;
  }

  return error;
}

/**
 * Check if error is an application error
 */
export function isAppError(error: any): error is AppError {
  return error instanceof Error && 'code' in error && 'severity' in error;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: any): error is NetworkError {
  return (
    isAppError(error) &&
    (error.code === ErrorCode.NETWORK_ERROR ||
      error.code === ErrorCode.REQUEST_TIMEOUT ||
      error.code === ErrorCode.SERVER_ERROR ||
      'status' in error)
  );
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: any): error is ValidationError {
  return isAppError(error) && (error.code === ErrorCode.VALIDATION_FAILED || 'fields' in error);
}

/**
 * Extract error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return 'An unknown error occurred';
}

/**
 * Get error severity level
 */
export function getErrorSeverity(error: unknown): ErrorSeverity {
  if (isAppError(error)) {
    return error.severity || ErrorSeverity.MEDIUM;
  }

  // Classify by error type
  if (error instanceof TypeError || error instanceof ReferenceError) {
    return ErrorSeverity.HIGH;
  }

  if (error instanceof SyntaxError) {
    return ErrorSeverity.CRITICAL;
  }

  return ErrorSeverity.MEDIUM;
}

/**
 * Classify error by type and return appropriate error code
 */
export function classifyError(error: unknown): ErrorCode {
  if (isAppError(error) && error.code) {
    return error.code as ErrorCode;
  }

  const message = getErrorMessage(error).toLowerCase();

  // Network-related errors
  if (message.includes('network') || message.includes('fetch')) {
    return ErrorCode.NETWORK_ERROR;
  }

  if (message.includes('timeout')) {
    return ErrorCode.REQUEST_TIMEOUT;
  }

  if (message.includes('unauthorized') || message.includes('401')) {
    return ErrorCode.UNAUTHORIZED;
  }

  if (message.includes('forbidden') || message.includes('403')) {
    return ErrorCode.FORBIDDEN;
  }

  if (message.includes('not found') || message.includes('404')) {
    return ErrorCode.DATA_NOT_FOUND;
  }

  if (message.includes('validation') || message.includes('invalid')) {
    return ErrorCode.VALIDATION_FAILED;
  }

  return ErrorCode.UNKNOWN_ERROR;
}

/**
 * Create error logging context
 */
export function createErrorLogContext(
  additionalContext: Partial<ErrorLogContext> = {}
): ErrorLogContext {
  return {
    timestamp: new Date(),
    environment: (process.env.NODE_ENV as any) || 'development',
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    ...additionalContext,
  };
}

/**
 * Log error with context
 */
export function logError(error: unknown, context: Partial<ErrorLogContext> = {}): void {
  const fullContext = createErrorLogContext(context);
  const severity = getErrorSeverity(error);
  const errorCode = classifyError(error);
  const message = getErrorMessage(error);

  const logData = {
    error: {
      message,
      code: errorCode,
      severity,
      stack: error instanceof Error ? error.stack : undefined,
    },
    context: fullContext,
  };

  // In development, log to console
  if (fullContext.environment === 'development') {
    console.error('Application Error:', logData);
  }

  // In production, send to monitoring service
  if (fullContext.environment === 'production') {
    // Example: Send to monitoring service
    // monitoringService.captureException(error, { extra: logData });
  }
}

/**
 * Sanitize error for safe logging (remove sensitive data)
 */
export function sanitizeError(error: unknown): Record<string, any> {
  const message = getErrorMessage(error);
  const code = classifyError(error);
  const severity = getErrorSeverity(error);

  const sanitized: Record<string, any> = {
    message,
    code,
    severity,
    timestamp: new Date().toISOString(),
  };

  if (error instanceof Error) {
    sanitized.name = error.name;
    // Only include stack trace in development
    if (process.env.NODE_ENV === 'development') {
      sanitized.stack = error.stack;
    }
  }

  if (isAppError(error)) {
    // Filter out sensitive context data
    const safeContext = Object.fromEntries(
      Object.entries(error.context || {}).filter(
        ([key]) =>
          !key.toLowerCase().includes('password') &&
          !key.toLowerCase().includes('token') &&
          !key.toLowerCase().includes('secret')
      )
    );
    sanitized.context = safeContext;
  }

  return sanitized;
}

/**
 * Create validation error from field errors
 */
export function createValidationError(
  fields: FieldError[],
  message: string = 'Validation failed'
): ValidationError {
  const error = createAppError(message, {
    code: ErrorCode.VALIDATION_FAILED,
    severity: ErrorSeverity.LOW,
  }) as ValidationError;

  error.fields = fields;
  error.invalidValues = Object.fromEntries(fields.map(field => [field.field, field.value]));

  return error;
}

/**
 * Create network error from fetch response
 */
export function createNetworkError(response: Response, message?: string): NetworkError {
  const error = createAppError(message || `Network request failed with status ${response.status}`, {
    code: response.status >= 500 ? ErrorCode.SERVER_ERROR : ErrorCode.NETWORK_ERROR,
    severity: response.status >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
  }) as NetworkError;

  error.status = response.status;
  error.statusText = response.statusText;
  error.url = response.url;

  return error;
}

/**
 * Error handling utilities
 */
export const errorUtils = {
  /**
   * Check if error is retryable
   */
  isRetryableError: (error: unknown): boolean => {
    if (isNetworkError(error)) {
      return error.status ? error.status >= 500 || error.status === 429 : true;
    }

    const code = classifyError(error);
    return [ErrorCode.NETWORK_ERROR, ErrorCode.REQUEST_TIMEOUT, ErrorCode.SERVER_ERROR].includes(
      code
    );
  },

  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage: (error: unknown): string => {
    const code = classifyError(error);

    switch (code) {
      case ErrorCode.UNAUTHORIZED:
        return 'Please log in to continue.';
      case ErrorCode.FORBIDDEN:
        return 'You do not have permission to perform this action.';
      case ErrorCode.NETWORK_ERROR:
        return 'Unable to connect to the server. Please check your internet connection.';
      case ErrorCode.REQUEST_TIMEOUT:
        return 'The request took too long. Please try again.';
      case ErrorCode.SERVER_ERROR:
        return 'A server error occurred. Please try again later.';
      case ErrorCode.VALIDATION_FAILED:
        return 'Please check your input and try again.';
      case ErrorCode.DATA_NOT_FOUND:
        return 'The requested information could not be found.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  },

  /**
   * Generate unique error ID for tracking (uses centralized ID generator)
   */
  generateErrorId: (): string => {
    return generateId('error');
  },
};
