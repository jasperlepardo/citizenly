/**
 * API Types
 * Comprehensive TypeScript interfaces for API requests, responses, and error handling
 */

// =============================================================================
// GENERIC API RESPONSE TYPES
// =============================================================================

/**
 * Standard API success response structure
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  metadata?: Record<string, unknown>;
}

/**
 * Standard API error response structure
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
    field?: string; // For validation errors
  };
  timestamp: string;
  path?: string;
}

/**
 * Union type for all API responses
 */
export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// =============================================================================
// REQUEST TYPES
// =============================================================================

/**
 * Standard pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Standard search parameters
 */
export interface SearchParams extends PaginationParams {
  query?: string;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
}

/**
 * Request metadata for tracking and auditing
 */
export interface RequestMetadata {
  userAgent?: string;
  ipAddress?: string;
  requestId?: string;
  timestamp: string;
  userId?: string;
}

// =============================================================================
// SUPABASE-SPECIFIC TYPES
// =============================================================================

/**
 * Supabase query response wrapper
 */
export interface SupabaseQueryResponse<T> {
  data: T | null;
  error: {
    message: string;
    details?: string;
    hint?: string;
    code?: string;
  } | null;
  count?: number | null;
  status?: number;
  statusText?: string;
}

// Note: SupabaseAuthResponse moved to auth.ts to avoid conflicts

// =============================================================================
// PSGC API TYPES
// =============================================================================

/**
 * PSGC search request parameters
 */
export interface PsgcSearchParams extends SearchParams {
  level?: 'region' | 'province' | 'city' | 'municipality' | 'barangay' | 'all';
  parentCode?: string;
  includeInactive?: boolean;
}

/**
 * PSGC search result item
 */
export interface PsgcSearchResult {
  code: string;
  name: string;
  level: string;
  parent_code?: string;
  full_hierarchy?: string;
  is_active: boolean;
}

/**
 * PSGC lookup response
 */
export interface PsgcLookupResponse extends ApiSuccessResponse<PsgcSearchResult[]> {
  data: PsgcSearchResult[];
}

// =============================================================================
// PSOC API TYPES
// =============================================================================

/**
 * PSOC (occupation) search parameters
 */
export interface PsocSearchParams extends SearchParams {
  level?: number;
  parentCode?: string;
  includeHierarchy?: boolean;
}

/**
 * PSOC search result item
 */
export interface PsocSearchResult {
  code: string;
  title: string;
  level: number;
  parent_code?: string;
  hierarchy?: string;
  is_active: boolean;
}

/**
 * PSOC lookup response
 */
export interface PsocLookupResponse extends ApiSuccessResponse<PsocSearchResult[]> {
  data: PsocSearchResult[];
}

// =============================================================================
// RESIDENT API TYPES
// =============================================================================

/**
 * Resident creation request
 */
export interface CreateResidentRequest {
  // Personal Information
  first_name: string;
  middle_name?: string;
  last_name: string;
  extension_name?: string;
  birthdate: string;
  sex: 'male' | 'female';
  civil_status?: string;
  citizenship?: string;

  // Contact Information
  email?: string;
  mobile_number?: string;
  telephone_number?: string;

  // Location Information
  barangay_code: string;
  city_municipality_code: string;
  region_code: string;
  household_code?: string;

  // Additional Information
  philsys_card_number?: string;
  education_attainment?: string;
  employment_status?: string;
  occupation_code?: string;

  // Physical Information
  blood_type?: string;
  height?: number;
  weight?: number;
  complexion?: string;

  // Cultural Information
  ethnicity?: string;
  religion?: string;
  religion_others_specify?: string;

  // Family Information
  mother_maiden_first?: string;
  mother_maiden_middle?: string;
  mother_maiden_last?: string;

  // Voting Information
  is_voter?: boolean;
  is_resident_voter?: boolean;
  last_voted_date?: string;
}

/**
 * Resident update request (partial)
 */
export interface UpdateResidentRequest extends Partial<CreateResidentRequest> {
  id: string;
}

/**
 * Resident search parameters
 */
export interface ResidentSearchParams extends SearchParams {
  sex?: 'male' | 'female';
  ageMin?: number;
  ageMax?: number;
  civilStatus?: string;
  employmentStatus?: string;
  educationAttainment?: string;
  barangayCode?: string;
  cityMunicipalityCode?: string;
  provinceCode?: string;
  regionCode?: string;
  isVoter?: boolean;
  bloodType?: string;
  religion?: string;
  ethnicity?: string;
}

// =============================================================================
// HOUSEHOLD API TYPES
// =============================================================================

/**
 * Household creation request
 */
export interface CreateHouseholdRequest {
  code: string;
  street_name?: string;
  subdivision_name?: string;
  household_number?: string;
  barangay_code: string;
  city_municipality_code?: string;
  province_code?: string;
  region_code?: string;
  head_resident_id?: string;
  household_type?: string;
  tenure_status?: string;
  monthly_income?: number;
  income_class?: string;
  no_of_families?: number;
}

/**
 * Household update request
 */
export interface UpdateHouseholdRequest extends Partial<CreateHouseholdRequest> {
  id: string;
}

/**
 * Household search parameters
 */
export interface HouseholdSearchParams extends SearchParams {
  barangayCode?: string;
  cityMunicipalityCode?: string;
  provinceCode?: string;
  regionCode?: string;
  householdType?: string;
  tenureStatus?: string;
  incomeClass?: string;
  minIncome?: number;
  maxIncome?: number;
  minMembers?: number;
  maxMembers?: number;
}

// =============================================================================
// VALIDATION AND ERROR TYPES
// =============================================================================

/**
 * Field validation error
 */
export interface FieldValidationError {
  field: string;
  message: string;
  code?: string;
  value?: unknown;
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
  };
}

/**
 * Authentication error response
 */
export interface AuthErrorResponse extends ApiErrorResponse {
  error: {
    message: string;
    code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'TOKEN_EXPIRED';
    details?: {
      requiredRole?: string;
      requiredPermission?: string;
    };
  };
}

// =============================================================================
// COMMON API TYPES
// =============================================================================

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  services: {
    database: 'connected' | 'disconnected';
    storage: 'available' | 'unavailable';
    cache: 'available' | 'unavailable';
  };
  uptime: number;
}

/**
 * Command menu search response
 */
export interface CommandMenuSearchResponse extends ApiSuccessResponse {
  data: {
    residents?: Array<{
      id: string;
      name: string;
      type: 'resident';
      description: string;
      href: string;
    }>;
    households?: Array<{
      id: string;
      code: string;
      type: 'household';
      description: string;
      href: string;
    }>;
    pages?: Array<{
      name: string;
      type: 'page';
      description: string;
      href: string;
    }>;
  };
}

// =============================================================================
// TYPE GUARDS AND UTILITIES
// =============================================================================

/**
 * Type guard to check if response is successful
 */
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
  return response.success === true;
}

/**
 * Type guard to check if response is an error
 */
export function isApiError(response: ApiResponse): response is ApiErrorResponse {
  return response.success === false;
}

/**
 * Type guard to check if error is validation error
 */
export function isValidationError(response: ApiErrorResponse): response is ValidationErrorResponse {
  return response.error.code === 'VALIDATION_ERROR';
}

/**
 * Type guard to check if error is rate limit error
 */
export function isRateLimitError(response: ApiErrorResponse): response is RateLimitErrorResponse {
  return response.error.code === 'RATE_LIMIT_EXCEEDED';
}

/**
 * Type guard to check if error is auth error
 */
export function isAuthError(response: ApiErrorResponse): response is AuthErrorResponse {
  return ['UNAUTHORIZED', 'FORBIDDEN', 'TOKEN_EXPIRED'].includes(response.error.code || '');
}
