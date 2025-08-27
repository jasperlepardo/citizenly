/**
 * Error Types Library
 * 
 * @deprecated This file is maintained for backwards compatibility only.
 * All error types have been moved to @/types/errors.
 * Please update imports to use the new location directly.
 * 
 * @see {@link @/types/errors} - New location for all error types
 */

// Re-export all error types from the centralized location
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
} from '@/types/errors';

export { ErrorSeverity, ErrorCode } from '@/types/errors';

// Note: ValidationError was removed from exports as it's not present in the centralized types
