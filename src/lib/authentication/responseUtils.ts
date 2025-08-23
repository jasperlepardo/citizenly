/**
 * Standardized API Response Utilities
 * Consistent response formatting and error handling
 */

import { NextResponse, NextRequest } from 'next/server';
import {
  ApiResponse,
  PaginatedResponse,
  ErrorResponse,
  ErrorCode,
  RequestContext,
} from './types';
import { auditError, auditSecurityViolation, AuditEventType } from '../security/audit-storage';
import { sanitizeSearchQuery } from '../validation/sanitizers';
import { logger } from '@/lib/logging/secure-logger';

/**
 * Create a successful API response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  context?: RequestContext
): Response {
  const response: ApiResponse<T> = {
    data,
    message,
    metadata: {
      timestamp: new Date().toISOString(),
      version: '1.0',
      requestId: context?.requestId,
    },
  };

  return NextResponse.json(response, { status: 200 });
}

/**
 * Create a paginated API response
 */
export function createPaginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  message?: string,
  context?: RequestContext
): Response {
  const pages = Math.ceil(pagination.total / pagination.limit);

  const response: PaginatedResponse<T> = {
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      pages,
      hasNext: pagination.page < pages,
      hasPrev: pagination.page > 1,
    },
    message,
    metadata: {
      timestamp: new Date().toISOString(),
      version: '1.0',
      requestId: context?.requestId,
    },
  };

  return NextResponse.json(response, { status: 200 });
}

/**
 * Create an error response
 */
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  status: number = 500,
  details?: any,
  field?: string,
  context?: RequestContext
): Response {
  const response: ErrorResponse = {
    error: {
      code,
      message,
      details,
      field,
    },
    timestamp: new Date().toISOString(),
    path: context?.path || 'unknown',
    requestId: context?.requestId,
  };

  return NextResponse.json(response, { status });
}

/**
 * Create a validation error response
 */
export function createValidationErrorResponse(
  details: Array<{ field: string; message: string }>,
  context?: RequestContext
): Response {
  return createErrorResponse(
    ErrorCode.VALIDATION_ERROR,
    'Invalid input data',
    422,
    details,
    undefined,
    context
  );
}

/**
 * Create an unauthorized error response
 */
export function createUnauthorizedResponse(
  message: string = 'Authentication required',
  context?: RequestContext
): Response {
  return createErrorResponse(ErrorCode.UNAUTHORIZED, message, 401, undefined, undefined, context);
}

/**
 * Create a forbidden error response
 */
export function createForbiddenResponse(
  message: string = 'Insufficient permissions',
  context?: RequestContext
): Response {
  return createErrorResponse(ErrorCode.FORBIDDEN, message, 403, undefined, undefined, context);
}

/**
 * Create a not found error response
 */
export function createNotFoundResponse(
  resource: string = 'Resource',
  context?: RequestContext
): Response {
  return createErrorResponse(
    ErrorCode.NOT_FOUND,
    `${resource} not found`,
    404,
    undefined,
    undefined,
    context
  );
}

/**
 * Create a conflict error response
 */
export function createConflictResponse(message: string, context?: RequestContext): Response {
  return createErrorResponse(ErrorCode.CONFLICT, message, 409, undefined, undefined, context);
}

/**
 * Create a rate limit error response
 */
export function createRateLimitResponse(retryAfter: number, context?: RequestContext): Response {
  const response = createErrorResponse(
    ErrorCode.RATE_LIMIT_EXCEEDED,
    `Too many requests. Try again in ${retryAfter} seconds.`,
    429,
    { retryAfter },
    undefined,
    context
  );

  response.headers.set('Retry-After', retryAfter.toString());
  return response;
}

/**
 * Handle database errors consistently
 */
export async function handleDatabaseError(error: any, context?: RequestContext): Promise<Response> {
  logger.error('Database error', { error, context });

  if (context) {
    await auditError(error, context, ErrorCode.DATABASE_ERROR);
  }

  // Check for specific database error codes
  if (error?.code === '23505') {
    // Unique constraint violation
    return createConflictResponse('Resource already exists', context);
  }

  if (error?.code === '23503') {
    // Foreign key violation
    return createErrorResponse(
      ErrorCode.VALIDATION_ERROR,
      'Invalid reference to related resource',
      400,
      undefined,
      undefined,
      context
    );
  }

  if (error?.code === '42P01') {
    // Table does not exist
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      'Database configuration error',
      500,
      undefined,
      undefined,
      context
    );
  }

  // Generic database error
  return createErrorResponse(
    ErrorCode.DATABASE_ERROR,
    'Database operation failed',
    500,
    process.env.NODE_ENV === 'development'
      ? {
          code: error?.code,
          message: error?.message,
        }
      : undefined,
    undefined,
    context
  );
}

/**
 * Handle unexpected errors
 */
export async function handleUnexpectedError(
  error: any,
  context?: RequestContext
): Promise<Response> {
  logger.error('Unexpected API error', { error, context });

  if (context) {
    await auditError(error, context, ErrorCode.INTERNAL_ERROR);
  }

  return createErrorResponse(
    ErrorCode.INTERNAL_ERROR,
    'An unexpected error occurred',
    500,
    process.env.NODE_ENV === 'development'
      ? {
          name: error?.name,
          message: error?.message,
          stack: error?.stack?.split('\n').slice(0, 5),
        }
      : undefined,
    undefined,
    context
  );
}

/**
 * Detect and handle potential SQL injection attempts
 */
export async function detectSQLInjection(
  input: string,
  context?: RequestContext
): Promise<boolean> {
  const sqlPatterns = [
    /('|(\\')|(;|#|--|\/\*|\*\/))/, // SQL injection patterns
    /(union|select|insert|update|delete|drop|create|alter)\s/i,
    /(\bor\b|\band\b)\s+\d+\s*=\s*\d+/i,
    /(\bor\b|\band\b)\s+['"].*['"]?\s*=\s*['"].*['"]?/i,
    /(exec|execute|sp_|xp_)/i,
  ];

  const isSQLInjection = sqlPatterns.some(pattern => pattern.test(input));

  if (isSQLInjection && context) {
    await auditSecurityViolation(
      AuditEventType.SQL_INJECTION_ATTEMPT,
      context,
      { suspiciousInput: input }
    );
  }

  return isSQLInjection;
}

/**
 * Safely process search parameters
 */
export async function processSearchParams(
  searchParams: URLSearchParams,
  context?: RequestContext
): Promise<{
  search: string | null;
  page: number;
  limit: number;
  offset: number;
}> {
  const search = searchParams.get('search');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const offset = (page - 1) * limit;

  // Check for SQL injection in search parameter
  if (search && context) {
    const isSQLInjection = await detectSQLInjection(search, context);
    if (isSQLInjection) {
      throw new Error('Invalid search parameter detected');
    }
  }

  return {
    search: search ? sanitizeSearchQuery(search) : null,
    page,
    limit,
    offset,
  };
}

/**
 * Apply search filters safely to Supabase query
 */
export function applySearchFilter(query: any, searchTerm: string, searchFields: string[]): any {
  if (!searchTerm || !searchFields.length) {
    return query;
  }

  const sanitizedTerm = sanitizeSearchQuery(searchTerm);
  const searchConditions = searchFields.map(field => `${field}.ilike.%${sanitizedTerm}%`).join(',');

  return query.or(searchConditions);
}

/**
 * Wrapper for API route handlers with error handling
 */
export function withErrorHandling<T extends any[]>(
  handler: (request: Request | NextRequest, ...args: T) => Promise<Response>
) {
  return async (request: Request | NextRequest, ...args: T): Promise<Response> => {
    try {
      return await handler(request, ...args);
    } catch (error: any) {
      const context = args.find(arg => arg && typeof arg === 'object' && 'requestId' in arg) as
        | RequestContext
        | undefined;

      // Check for validation errors
      if (error.name === 'ZodError') {
        return createValidationErrorResponse(
          error.errors.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
          context
        );
      }

      // Check for database errors
      if (error?.code && typeof error.code === 'string') {
        return handleDatabaseError(error, context);
      }

      // Handle unexpected errors
      return handleUnexpectedError(error, context);
    }
  };
}

/**
 * Specialized error handling for NextRequest (used with withAuth)
 */
export function withNextRequestErrorHandling<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<Response>
) {
  return async (request: NextRequest, ...args: T): Promise<Response> => {
    try {
      return await handler(request, ...args);
    } catch (error: any) {
      const context = args.find(arg => arg && typeof arg === 'object' && 'requestId' in arg) as
        | RequestContext
        | undefined;

      // Check for validation errors
      if (error.name === 'ZodError') {
        return createValidationErrorResponse(
          error.errors.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
          context
        );
      }

      // Check for database errors
      if (error?.code && typeof error.code === 'string') {
        return handleDatabaseError(error, context);
      }

      // Handle unexpected errors
      return handleUnexpectedError(error, context);
    }
  };
}

/**
 * Create a 201 Created response for successful resource creation
 */
export function createCreatedResponse<T>(
  data: T,
  message?: string,
  context?: RequestContext
): Response {
  const response: ApiResponse<T> = {
    data,
    message: message || 'Resource created successfully',
    metadata: {
      timestamp: new Date().toISOString(),
      version: '1.0',
      requestId: context?.requestId,
    },
  };

  return NextResponse.json(response, { status: 201 });
}

/**
 * Create a 204 No Content response for successful deletion
 */
export function createNoContentResponse(): Response {
  return new Response(null, { status: 204 });
}

/**
 * Add security headers to response
 */
export function addSecurityHeaders(response: Response): Response {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

/**
 * Middleware to add security headers to all responses
 */
export function withSecurityHeaders(handler: (request: Request) => Promise<Response>) {
  return async (request: Request): Promise<Response> => {
    const response = await handler(request);
    return addSecurityHeaders(response);
  };
}
