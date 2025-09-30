/**
 * @deprecated This file has been moved to services layer for proper architecture.
 * Use @/services/infrastructure/api/responseService instead.
 * 
 * This file provides backward compatibility exports during the migration period.
 * It will be removed in a future version.
 * 
 * ARCHITECTURAL NOTE: Business logic should be in services, not utils.
 * Utils should only contain pure functions with no business domain knowledge.
 */

// Re-export from the new service location for backward compatibility
export {
  // API Response methods
  createSuccessResponse,
  createPaginatedResponse,
  createErrorResponse,
  createValidationErrorResponse,
  createUnauthorizedResponse,
  createForbiddenResponse,
  createNotFoundResponse,
  createConflictResponse,
  createRateLimitResponse,
  createCreatedResponse,
  createNoContentResponse,
  addSecurityHeaders,
  
  // Security validation methods
  detectSQLInjection,
  processSearchParams,
  applySearchFilter,
  
  // Error handling methods
  handleDatabaseError,
  handleUnexpectedError,
  withErrorHandling,
  withNextRequestErrorHandling,
  withSecurityHeaders,
  
  // Service classes
  ApiResponseService,
  SecurityValidationService,
  ErrorHandlingService,
  
  // Types
  ErrorCode,
  type RequestContext,
  type PaginatedResponse,
} from '@/services/infrastructure/api/responseService';