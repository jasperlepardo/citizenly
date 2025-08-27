/**
 * Error Types - Application Error Handling Framework
 * 
 * @fileoverview Comprehensive error handling TypeScript interfaces for the Citizenly RBI system.
 * Provides structured error types, severity levels, and error boundary patterns for robust
 * application error management and user experience.
 * 
 * @version 3.0.0
 * @since 2025-01-01
 * @author Citizenly Development Team
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

// =============================================================================
// AUTH ERROR HANDLING
// =============================================================================

/**
 * Database response interface
 */
export interface DatabaseResponse {
  success: boolean;
  error?: string;
  error_code?: string;
  details?: string;
  profile_id?: string;
  user_data?: Record<string, unknown>;
  role_data?: Record<string, unknown>;
  location_data?: Record<string, unknown>;
  message?: string;
}

/**
 * Authentication error messages mapping
 */
export const AUTH_ERROR_MESSAGES = {
  // Exact error messages from database function
  'User not found in authentication system':
    'User account setup is still in progress. Please wait a moment and try again.',
  'Role "barangay_admin" not found in system':
    'System configuration error. Please contact technical support.',
  'Invalid or inactive barangay code':
    'The selected barangay is not valid or is currently inactive. Please choose a different barangay.',
  'A user profile with this information already exists':
    'An account with this information already exists. Please try signing in instead.',
  'Referenced data not found (user, role, or location)':
    'Some required system data is missing. Please contact support.',
  'Database operation failed':
    'A technical error occurred. Please try again or contact support if the problem persists.',
  // Pattern matching for dynamic error messages
  'User not found in authentication system with ID:':
    'Account setup is taking longer than expected. Please try again in a few moments.',
} as const;

/**
 * HTTP status code mapping for database errors
 */
export const ERROR_STATUS_MAP: Record<string, number> = {
  DUPLICATE_PROFILE: 409, // Conflict
  INVALID_REFERENCE: 400, // Bad Request
  USER_NOT_FOUND: 404, // Not Found
  VALIDATION_FAILED: 422, // Unprocessable Entity
  UNAUTHORIZED: 401, // Unauthorized
  FORBIDDEN: 403, // Forbidden
  SESSION_EXPIRED: 401, // Unauthorized
  RATE_LIMIT_EXCEEDED: 429, // Too Many Requests
} as const;

// =============================================================================
// LOGGING TYPES
// =============================================================================

/**
 * Log level enumeration
 * Consolidates from src/lib/logging/client-logger.ts and src/lib/logging/secure-logger.ts
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Log context information
 * Consolidates from src/lib/logging/client-logger.ts
 */
export interface LogContext {
  component?: string;
  action?: string;
  data?: Record<string, unknown>;
  error?: Error;
  userId?: string;
  sessionId?: string;
}

/**
 * Secure log entry for security-focused logging
 * Consolidates from src/lib/logging/secure-logger.ts
 */
export interface SecureLogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  sanitizedData?: Record<string, unknown>;
}

/**
 * Philippine data privacy compliance logging context
 * Consolidates from src/lib/security/philippine-logging.ts
 */
export interface PhilippineLogContext {
  userId?: string;
  sessionId?: string;
  barangayCode?: string;
  timestamp: string;
  complianceNote: string;
  [key: string]: any;
}

/**
 * Audit log context for compliance
 * Consolidates from src/lib/security/philippine-logging.ts
 */
export interface AuditLogContext {
  eventType: string;
  userId: string;
  action: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  barangayOfficial?: boolean;
  complianceFramework: string;
  retentionPeriod: string;
}

/**
 * National Privacy Commission logging context
 * Consolidates from src/lib/security/philippine-logging.ts
 */
export interface NPCLogContext {
  dataCategory: string;
  processingPurpose: string;
  legalBasis: string;
  dataSubjectCount: number;
  sensitiveDataProcessed: boolean;
  consentStatus: string;
  timestamp: string;
  npcRegistrationRef?: string;
}

/**
 * Comprehensive security audit log entry
 * Consolidates from src/lib/authentication/auditUtils.ts
 */
export interface SecurityAuditLogEntry {
  id?: string;
  event_type: string;
  severity: string;
  user_id?: string;
  user_role?: string;
  resource_type?: string;
  resource_id?: string;
  action: string;
  outcome: string;
  details?: Record<string, string | number | boolean>;
  error_code?: string;
  error_message?: string;
  request_id: string;
  ip_address?: string;
  user_agent?: string;
  path: string;
  method: string;
  timestamp: string;
  barangay_code?: string;
  city_code?: string;
  province_code?: string;
  region_code?: string;
}