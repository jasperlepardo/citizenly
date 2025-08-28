/**
 * Error Handling Library Module
 *
 * @description Centralized error handling utilities and patterns.
 * Provides reusable error types, utilities, and boundary components separated from UI logic.
 */

// Explicit exports to prevent circular dependencies
export {
  createAppError,
  isAppError,
  isNetworkError,
  isValidationError,
  getErrorMessage,
  getErrorSeverity,
  classifyError,
  logError,
  sanitizeError,
  createValidationError,
  createNetworkError,
} from '@/utils/error-utils';

export {
  createErrorBoundaryState,
  handleErrorBoundaryError,
  shouldRetryError,
  createDefaultErrorFallback,
  createFieldErrorFallback,
  createErrorBoundaryComponent,
  withErrorBoundary,
  errorBoundaryUtils,
} from './ErrorBoundaries';

export type {
  AppError,
  ErrorBoundaryState,
  ErrorBoundaryProps,
  ErrorFallbackProps,
  FieldErrorBoundaryProps,
  ErrorLogContext,
  ErrorRecoveryStrategy,
  FieldError,
  NetworkError,
} from './error-types';

export { ErrorSeverity, ErrorCode } from './error-types';
