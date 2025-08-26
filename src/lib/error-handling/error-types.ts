/**
 * Error Types Library
 *
 * @description Standardized error types and interfaces for consistent error handling
 * across the application. Provides type-safe error definitions and utilities.
 */

import type { ReactNode } from 'react';

/**
 * Base error interface for application errors
 */
export interface AppError extends Error {
  code?: string;
  context?: Record<string, string | number | boolean>;
  timestamp?: Date;
  severity?: ErrorSeverity;
  cause?: Error;
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Error boundary state interface
 */
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorId?: string;
  retryCount?: number;
}

/**
 * Error boundary props interface
 */
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  maxRetries?: number;
  resetOnPropsChange?: boolean;
}

/**
 * Error fallback component props
 */
export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  retryCount?: number;
  maxRetries?: number;
}

/**
 * Field-specific error boundary props
 */
export interface FieldErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  fieldName?: string;
  onFieldError?: (error: Error, fieldName?: string) => void;
}

/**
 * Error logging context
 */
export interface ErrorLogContext {
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
  component?: string;
  action?: string;
  field?: string;
  timestamp: Date;
  environment: 'development' | 'staging' | 'production';
  errorInfo?: {
    componentStack?: string;
  };
}

/**
 * Error recovery strategy
 */
export interface ErrorRecoveryStrategy {
  type: 'retry' | 'fallback' | 'redirect' | 'ignore';
  maxAttempts?: number;
  delay?: number;
  fallbackComponent?: React.ComponentType<Record<string, never>>;
  redirectUrl?: string;
}

/**
 * Form field error interface
 */
export interface FieldError {
  field: string;
  message: string;
  code?: string;
  value?: string | number | boolean | null;
}

/**
 * Validation error interface
 */
export interface ValidationError extends AppError {
  fields?: FieldError[];
  invalidValues?: Record<string, string | number | boolean>;
}

/**
 * Network error interface
 */
export interface NetworkError extends AppError {
  status?: number;
  statusText?: string;
  url?: string;
  method?: string;
  response?: { data?: unknown; headers?: Record<string, string>; };
}

/**
 * Application-specific error codes
 */
export enum ErrorCode {
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  SESSION_EXPIRED = 'SESSION_EXPIRED',

  // Validation errors
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  REQUIRED_FIELD_MISSING = 'REQUIRED_FIELD_MISSING',
  INVALID_FORMAT = 'INVALID_FORMAT',

  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  REQUEST_TIMEOUT = 'REQUEST_TIMEOUT',
  SERVER_ERROR = 'SERVER_ERROR',

  // Form errors
  FORM_SUBMISSION_FAILED = 'FORM_SUBMISSION_FAILED',
  FIELD_RENDER_ERROR = 'FIELD_RENDER_ERROR',

  // Data errors
  DATA_NOT_FOUND = 'DATA_NOT_FOUND',
  DATA_CORRUPTED = 'DATA_CORRUPTED',

  // Component errors
  COMPONENT_RENDER_ERROR = 'COMPONENT_RENDER_ERROR',
  HOOK_ERROR = 'HOOK_ERROR',

  // Operation errors
  OPERATION_FAILED = 'OPERATION_FAILED',
  INVALID_OPERATION = 'INVALID_OPERATION',

  // Unknown errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}
