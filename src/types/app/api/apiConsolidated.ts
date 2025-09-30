/**
 * API Types
 * Consolidated API request/response interfaces and error types
 */

// =============================================================================
// STANDARD API RESPONSE TYPES
// =============================================================================

/**
 * Standard API success response
 */
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
    timestamp?: string;
    requestId?: string;
  };
}

/**
 * Standard API error response
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId?: string;
  };
}

/**
 * Generic API response
 */
export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// =============================================================================
// SPECIFIC ERROR RESPONSE TYPES
// =============================================================================

/**
 * Field validation error
 */
export interface FieldValidationError {
  field: string;
  message: string;
  code?: string;
  value?: any;
}

/**
 * Validation error response
 */
export interface ValidationErrorResponse extends ApiErrorResponse {
  error: {
    message: string;
    code: 'VALIDATION_ERROR';
    details: {
      fields: FieldValidationError[];
    };
    timestamp: string;
  };
}

/**
 * Rate limit error response
 */
export interface RateLimitErrorResponse extends ApiErrorResponse {
  error: {
    message: string;
    code: 'RATE_LIMIT_EXCEEDED';
    details: {
      limit: number;
      windowMs: number;
      retryAfter: number;
    };
    timestamp: string;
  };
}

/**
 * Authentication error response
 */
export interface AuthErrorResponse extends ApiErrorResponse {
  error: {
    message: string;
    code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'SESSION_EXPIRED';
    details?: {
      requiredPermissions?: string[];
      currentRole?: string;
    };
    timestamp: string;
  };
}

// =============================================================================
// API REQUEST TYPES
// =============================================================================

/**
 * Paginated request parameters
 */
export interface PaginatedRequest {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Search request parameters
 */
export interface SearchRequest extends PaginatedRequest {
  query?: string;
  filters?: Record<string, any>;
}

/**
 * Bulk operation request
 */
export interface BulkOperationRequest<T = any> {
  items: T[];
  options?: {
    continueOnError?: boolean;
    validateAll?: boolean;
  };
}

// =============================================================================
// HEALTH CHECK TYPES
// =============================================================================

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    database: 'up' | 'down';
    auth: 'up' | 'down';
    storage: 'up' | 'down';
  };
  uptime: number;
  version: string;
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Check if response is successful
 */
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
  return response.success === true;
}

/**
 * Check if response is error
 */
export function isApiError(response: ApiResponse): response is ApiErrorResponse {
  return response.success === false;
}

/**
 * Check if error is validation error
 */
export function isValidationError(response: ApiErrorResponse): response is ValidationErrorResponse {
  return response.error.code === 'VALIDATION_ERROR';
}

/**
 * Check if error is rate limit error
 */
export function isRateLimitError(response: ApiErrorResponse): response is RateLimitErrorResponse {
  return response.error.code === 'RATE_LIMIT_EXCEEDED';
}

/**
 * Check if error is auth error
 */
export function isAuthError(response: ApiErrorResponse): response is AuthErrorResponse {
  return ['UNAUTHORIZED', 'FORBIDDEN', 'SESSION_EXPIRED'].includes(response.error.code);
}
