/**
 * Authentication API Response Types
 * Re-exports from consolidated type system with backward compatibility
 */

// Re-export standardized API response types
export type {
  StandardApiResponse as ApiResponse,
  StandardPaginatedResponse as PaginatedResponse,
  StandardErrorResponse as ErrorResponse,
  PaginationParams,
  SortParams,
  FilterParams,
} from '@/types/api';

// Re-export enums and const objects as values
export { ErrorCode } from '@/types/api';
export { Role, ROLE_PERMISSIONS } from '@/types/auth';

// Re-export interface types
export type { RequestContext } from '@/types/auth';

// ErrorCode enum is now exported from @/types/api

// Role enum and ROLE_PERMISSIONS are now exported from @/types/auth

// PaginationParams, SortParams, FilterParams, and RequestContext are now exported from consolidated types
