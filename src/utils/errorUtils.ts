/**
 * Error Handling Utilities - CONSOLIDATED COMPREHENSIVE VERSION
 * Merged from utils/error-utils.ts and lib/error-handling/error-utils.ts
 */

import type { AppError, ErrorLogContext, NetworkError, FieldError } from '@/types/errors';
import { ErrorSeverity, ErrorCode } from '@/types/errors';
import type { ValidationError } from '@/types/validation';

import { generateId } from './id-generators';

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
    error instanceof Error &&
    ('status' in error || 'response' in error || error.message.includes('fetch'))
  );
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: any): error is ValidationError {
  return error && typeof error === 'object' && 'field' in error && 'message' in error;
}

/**
 * Extract error message safely
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
 * Determine error severity
 */
export function getErrorSeverity(error: unknown): ErrorSeverity {
  if (isAppError(error)) {
    return error.severity || ErrorSeverity.LOW;
  }

  if (isNetworkError(error)) {
    const status = ('status' in error ? error.status : 0) as number;
    if (status >= 500) return ErrorSeverity.HIGH;
    if (status >= 400) return ErrorSeverity.MEDIUM;
    return ErrorSeverity.LOW;
  }

  if (isValidationError(error)) {
    return ErrorSeverity.LOW;
  }

  return ErrorSeverity.MEDIUM;
}

/**
 * Classify error type
 */
export function classifyError(error: unknown): ErrorCode {
  if (isNetworkError(error)) {
    const status = 'status' in error ? error.status : 0;
    switch (status) {
      case 400:
        return ErrorCode.BAD_REQUEST;
      case 401:
        return ErrorCode.UNAUTHORIZED;
      case 403:
        return ErrorCode.FORBIDDEN;
      case 404:
        return ErrorCode.NOT_FOUND;
      case 429:
        return ErrorCode.RATE_LIMITED;
      case 500:
        return ErrorCode.INTERNAL_SERVER_ERROR;
      default:
        return ErrorCode.NETWORK_ERROR;
    }
  }

  if (isValidationError(error)) {
    return ErrorCode.VALIDATION_ERROR;
  }

  if (error instanceof TypeError) {
    return ErrorCode.TYPE_ERROR;
  }

  if (error instanceof ReferenceError) {
    return ErrorCode.REFERENCE_ERROR;
  }

  return ErrorCode.UNKNOWN_ERROR;
}

/**
 * Create error log context
 */
export function createErrorLogContext(
  operation: string,
  userId?: string,
  additionalContext: Record<string, any> = {}
): ErrorLogContext {
  return {
    id: generateId(),
    operation,
    userId,
    timestamp: new Date(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    environment:
      process.env.NODE_ENV === 'production'
        ? ('production' as const)
        : process.env.VERCEL_ENV === 'staging'
          ? ('staging' as const)
          : ('development' as const),
    ...additionalContext,
  } as ErrorLogContext;
}

/**
 * Log error with context
 */
export function logError(error: unknown, context: Partial<ErrorLogContext> = {}): void {
  const errorMessage = getErrorMessage(error);
  const severity = getErrorSeverity(error);
  const code = classifyError(error);

  const logContext: ErrorLogContext = {
    id: generateId(),
    operation: context.operation || 'unknown',
    userId: context.userId,
    timestamp: new Date(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    environment:
      process.env.NODE_ENV === 'production'
        ? ('production' as const)
        : process.env.VERCEL_ENV === 'staging'
          ? ('staging' as const)
          : ('development' as const),
    ...context,
  };

  const logData = {
    message: errorMessage,
    code,
    severity,
    context: logContext,
  };

  // Log based on severity
  switch (severity) {
    case ErrorSeverity.CRITICAL:
      console.error('CRITICAL ERROR:', logData);
      break;
    case ErrorSeverity.HIGH:
      console.error('HIGH ERROR:', logData);
      break;
    case ErrorSeverity.MEDIUM:
      console.warn('MEDIUM ERROR:', logData);
      break;
    case ErrorSeverity.LOW:
      console.info('LOW ERROR:', logData);
      break;
  }
}

/**
 * Sanitize error for client consumption
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
 * Create a validation error
 */
export function createValidationError(
  field: string,
  message: string,
  value?: any,
  code?: string
): ValidationError {
  return {
    field,
    message,
    value,
    code: code || 'VALIDATION_FAILED',
  };
}

/**
 * Create a network error
 */
export async function createNetworkError(
  response: Response,
  message?: string
): Promise<NetworkError> {
  const error = new Error(message || `Network error: ${response.status}`) as NetworkError;
  error.status = response.status;
  error.response = {
    data: await response.text(),
    headers: Object.fromEntries(response.headers.entries()),
  };
  return error;
}

/**
 * Format validation errors for client display
 */
export function formatValidationErrors(errors: ValidationError[]): Record<string, string> {
  return errors.reduce(
    (formatted, error) => {
      formatted[error.field] = error.message;
      return formatted;
    },
    {} as Record<string, string>
  );
}

/**
 * Extract error message for client display (sanitized)
 */
export function extractErrorMessage(error: unknown): string {
  const message = getErrorMessage(error);

  // Don't expose sensitive technical details to client
  if (message.toLowerCase().includes('internal server error')) {
    return 'A server error occurred. Please try again later.';
  }

  if (message.toLowerCase().includes('database')) {
    return 'A data processing error occurred. Please try again.';
  }

  return message;
}

/**
 * Sanitize error for client consumption (safe version)
 */
export function sanitizeErrorForClient(error: unknown): { message: string; code?: string } {
  return {
    message: extractErrorMessage(error),
    code: classifyError(error),
  };
}
