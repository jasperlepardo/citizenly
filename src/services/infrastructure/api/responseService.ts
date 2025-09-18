/**
 * API Response Service
 * 
 * @description Infrastructure service for standardized API response formatting,
 * error handling, and security validations.
 * 
 * Extracted from utils/auth/apiResponseHandlers to maintain proper architectural boundaries.
 * Business logic belongs in services, not utils.
 */

import { NextResponse, NextRequest } from 'next/server';

import { logger } from '@/lib/logging/secure-logger';
import { sanitizeInput } from '@/utils/auth/sanitizationUtils';
import { auditError, auditSecurityViolation, AuditEventType } from '@/lib/security/auditStorage';
import type { ApiSuccessResponse, ApiErrorResponse } from '@/types/app/api/apiConsolidated';

// Service interfaces
interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    pages?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
  message?: string;
  timestamp: string;
}

interface RequestContext {
  userId?: string;
  userAgent?: string;
  ip?: string;
  requestId?: string;
  path?: string;
}

type ErrorResponse = ApiErrorResponse;

// Error codes as constants
const ErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  DATABASE_ERROR: 'DATABASE_ERROR'
} as const;

/**
 * API Response Service
 */
export class ApiResponseService {
  /**
   * Create a successful API response
   */
  public static createSuccessResponse<T>(
    data: T,
    message?: string,
    context?: RequestContext
  ): Response {
    const response: ApiSuccessResponse<T> = {
      success: true,
      data,
      message,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: context?.requestId,
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * Create a paginated API response
   */
  public static createPaginatedResponse<T>(
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
      success: true,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pages,
        pages,
        hasNext: pagination.page < pages,
        hasPrev: pagination.page > 1,
      },
      message,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * Create an error response
   */
  public static createErrorResponse(
    code: keyof typeof ErrorCode,
    message: string,
    status: number = 500,
    details?: Record<string, unknown>,
    field?: string,
    context?: RequestContext
  ): Response {
    const response: ErrorResponse = {
      success: false,
      error: {
        message,
        code: ErrorCode[code],
        details,
        timestamp: new Date().toISOString(),
        requestId: context?.requestId,
      },
    };

    return NextResponse.json(response, { status });
  }

  /**
   * Create a validation error response
   */
  public static createValidationErrorResponse(
    details: Array<{ field: string; message: string }>,
    context?: RequestContext
  ): Response {
    return this.createErrorResponse(
      'VALIDATION_ERROR',
      'Invalid input data',
      422,
      { validationErrors: details },
      undefined,
      context
    );
  }

  /**
   * Create an unauthorized error response
   */
  public static createUnauthorizedResponse(
    message: string = 'Authentication required',
    context?: RequestContext
  ): Response {
    return this.createErrorResponse('UNAUTHORIZED', message, 401, undefined, undefined, context);
  }

  /**
   * Create a forbidden error response
   */
  public static createForbiddenResponse(
    message: string = 'Insufficient permissions',
    context?: RequestContext
  ): Response {
    return this.createErrorResponse('FORBIDDEN', message, 403, undefined, undefined, context);
  }

  /**
   * Create a not found error response
   */
  public static createNotFoundResponse(
    resource: string = 'Resource',
    context?: RequestContext
  ): Response {
    return this.createErrorResponse(
      'NOT_FOUND',
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
  public static createConflictResponse(message: string, context?: RequestContext): Response {
    return this.createErrorResponse('CONFLICT', message, 409, undefined, undefined, context);
  }

  /**
   * Create a rate limit error response
   */
  public static createRateLimitResponse(retryAfter: number, context?: RequestContext): Response {
    const response = this.createErrorResponse(
      'RATE_LIMIT_EXCEEDED',
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
   * Create a 201 Created response for successful resource creation
   */
  public static createCreatedResponse<T>(
    data: T,
    message?: string,
    context?: RequestContext
  ): Response {
    const response: ApiSuccessResponse<T> = {
      success: true,
      data,
      message: message || 'Resource created successfully',
      meta: {
        timestamp: new Date().toISOString(),
        requestId: context?.requestId,
      },
    };

    return NextResponse.json(response, { status: 201 });
  }

  /**
   * Create a 204 No Content response for successful deletion
   */
  public static createNoContentResponse(): Response {
    return new Response(null, { status: 204 });
  }

  /**
   * Add security headers to response
   */
  public static addSecurityHeaders(response: Response): Response {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    return response;
  }
}

/**
 * Security Validation Service
 */
export class SecurityValidationService {
  /**
   * Detect and handle potential SQL injection attempts
   */
  public static async detectSQLInjection(
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
      await auditSecurityViolation(AuditEventType.SQL_INJECTION_ATTEMPT, context, {
        suspiciousInput: input.substring(0, 100), // Limit logged input length
      });
    }

    return isSQLInjection;
  }

  /**
   * Safely process search parameters
   */
  public static async processSearchParams(
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
    // Support both 'limit' and 'pageSize' parameter names for backwards compatibility
    const limitParam = searchParams.get('limit') || searchParams.get('pageSize') || '20';
    const limit = Math.min(100, Math.max(1, parseInt(limitParam)));
    const offset = (page - 1) * limit;


    // Check for SQL injection in search parameter
    if (search && context) {
      const isSQLInjection = await this.detectSQLInjection(search, context);
      if (isSQLInjection) {
        throw new Error('Invalid search parameter detected');
      }
    }

    return {
      search: search ? sanitizeInput(search) : null,
      page,
      limit,
      offset,
    };
  }

  /**
   * Apply search filters safely to Supabase query
   */
  public static applySearchFilter(query: any, searchTerm: string, searchFields: string[]): any {
    if (!searchTerm || !searchFields.length) {
      return query;
    }

    const sanitizedTerm = sanitizeInput(searchTerm);
    const searchConditions = searchFields.map(field => `${field}.ilike.%${sanitizedTerm}%`).join(',');

    return query.or(searchConditions);
  }
}

/**
 * Error Handling Service
 */
export class ErrorHandlingService {
  /**
   * Database error code handlers
   */
  public static databaseErrorHandlers = {
    '23505': (context?: RequestContext) => ApiResponseService.createConflictResponse('Resource already exists', context),
    '23503': (context?: RequestContext) => ApiResponseService.createErrorResponse(
      'VALIDATION_ERROR',
      'Invalid reference to related resource',
      400,
      undefined,
      undefined,
      context
    ),
    '42P01': (context?: RequestContext) => ApiResponseService.createErrorResponse(
      'INTERNAL_ERROR',
      'Database configuration error',
      500,
      undefined,
      undefined,
      context
    ),
  };

  /**
   * Handle database errors consistently
   */
  public static async handleDatabaseError(
    error: { code?: string; message: string; details?: string },
    context?: RequestContext
  ): Promise<Response> {
    logger.error('Database error', { error, context });

    if (context) {
      const errorObj = new Error(error.message);
      errorObj.name = 'DatabaseError';
      await auditError(errorObj, context, 'DATABASE_ERROR');
    }

    // Check for specific database error codes
    const handler = error?.code && ErrorHandlingService.databaseErrorHandlers[error.code as keyof typeof ErrorHandlingService.databaseErrorHandlers];
    if (handler) {
      return handler(context);
    }

    // Generic database error
    return ApiResponseService.createErrorResponse(
      'DATABASE_ERROR',
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
  public static async handleUnexpectedError(
    error: Error,
    context?: RequestContext
  ): Promise<Response> {
    logger.error('Unexpected API error', { error, context });

    if (context) {
      await auditError(error, context, 'INTERNAL_ERROR');
    }

    return ApiResponseService.createErrorResponse(
      'INTERNAL_ERROR',
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
   * Error type checkers for reducing cognitive complexity
   */
  public static errorTypeCheckers = {
    isZodError: (error: unknown): error is Error => error instanceof Error && error.name === 'ZodError',
    isDatabaseError: (error: unknown): error is { code?: string; message: string; details?: string } => 
      Boolean(error &&
      typeof error === 'object' &&
      'code' in error &&
      typeof (error as any).code === 'string' &&
      'message' in error),
    isError: (error: unknown): error is Error => error instanceof Error,
  };

  /**
   * Process different error types
   */
  public static async processError(error: unknown, context?: RequestContext): Promise<Response> {
    if (ErrorHandlingService.errorTypeCheckers.isZodError(error)) {
      return ApiResponseService.createValidationErrorResponse(
        (error as any).errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
        context
      );
    }

    if (ErrorHandlingService.errorTypeCheckers.isDatabaseError(error)) {
      return ErrorHandlingService.handleDatabaseError(error, context);
    }

    if (ErrorHandlingService.errorTypeCheckers.isError(error)) {
      return ErrorHandlingService.handleUnexpectedError(error, context);
    }

    // Handle unknown errors
    const unknownError = new Error('An unknown error occurred');
    return ErrorHandlingService.handleUnexpectedError(unknownError, context);
  }

  /**
   * Wrapper for API route handlers with error handling
   */
  public static withErrorHandling<T extends readonly unknown[]>(
    handler: (request: Request | NextRequest, ...args: T) => Promise<Response>
  ) {
    return async (request: Request | NextRequest, ...args: T): Promise<Response> => {
      try {
        return await handler(request, ...args);
      } catch (error: unknown) {
        const context = args.find(arg => arg && typeof arg === 'object' && 'requestId' in arg) as
          | RequestContext
          | undefined;

        return ErrorHandlingService.processError(error, context);
      }
    };
  }

  /**
   * Specialized error handling for NextRequest (used with withAuth)
   */
  public static withNextRequestErrorHandling<T extends readonly unknown[]>(
    handler: (request: NextRequest, ...args: T) => Promise<Response>
  ) {
    return async (request: NextRequest, ...args: T): Promise<Response> => {
      try {
        return await handler(request, ...args);
      } catch (error: unknown) {
        const context = args.find(arg => arg && typeof arg === 'object' && 'requestId' in arg) as
          | RequestContext
          | undefined;

        return ErrorHandlingService.processError(error, context);
      }
    };
  }

  /**
   * Middleware to add security headers to all responses
   */
  public static withSecurityHeaders(handler: (request: Request) => Promise<Response>) {
    return async (request: Request): Promise<Response> => {
      const response = await handler(request);
      return ApiResponseService.addSecurityHeaders(response);
    };
  }
}

// Export individual methods for backward compatibility during transition
export const createSuccessResponse = ApiResponseService.createSuccessResponse.bind(ApiResponseService);
export const createPaginatedResponse = ApiResponseService.createPaginatedResponse.bind(ApiResponseService);
export const createErrorResponse = ApiResponseService.createErrorResponse.bind(ApiResponseService);
export const createValidationErrorResponse = ApiResponseService.createValidationErrorResponse.bind(ApiResponseService);
export const createUnauthorizedResponse = ApiResponseService.createUnauthorizedResponse.bind(ApiResponseService);
export const createForbiddenResponse = ApiResponseService.createForbiddenResponse.bind(ApiResponseService);
export const createNotFoundResponse = ApiResponseService.createNotFoundResponse.bind(ApiResponseService);
export const createConflictResponse = ApiResponseService.createConflictResponse.bind(ApiResponseService);
export const createRateLimitResponse = ApiResponseService.createRateLimitResponse.bind(ApiResponseService);
export const createCreatedResponse = ApiResponseService.createCreatedResponse.bind(ApiResponseService);
export const createNoContentResponse = ApiResponseService.createNoContentResponse.bind(ApiResponseService);
export const addSecurityHeaders = ApiResponseService.addSecurityHeaders.bind(ApiResponseService);

export const detectSQLInjection = SecurityValidationService.detectSQLInjection.bind(SecurityValidationService);
export const processSearchParams = SecurityValidationService.processSearchParams.bind(SecurityValidationService);
export const applySearchFilter = SecurityValidationService.applySearchFilter.bind(SecurityValidationService);

export const handleDatabaseError = ErrorHandlingService.handleDatabaseError.bind(ErrorHandlingService);
export const handleUnexpectedError = ErrorHandlingService.handleUnexpectedError.bind(ErrorHandlingService);
export const withErrorHandling = ErrorHandlingService.withErrorHandling.bind(ErrorHandlingService);
export const withNextRequestErrorHandling = ErrorHandlingService.withNextRequestErrorHandling.bind(ErrorHandlingService);
export const withSecurityHeaders = ErrorHandlingService.withSecurityHeaders.bind(ErrorHandlingService);

// Export types
export type { RequestContext, PaginatedResponse };
export { ErrorCode };