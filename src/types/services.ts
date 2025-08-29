/**
 * Service Types
 * Consolidated service layer interfaces and types
 */

import type { HouseholdFormData } from '@/types/forms';

// =============================================================================
// REPOSITORY TYPES
// =============================================================================

/**
 * Generic repository result
 * Standard result format for repository operations
 */
export interface RepositoryResult<T = any> {
  success: boolean;
  data?: T;
  error?: RepositoryError;
  metadata?: Record<string, unknown>;
  count?: number;
}

/**
 * Repository error
 * Standard error format for repository operations
 */
export interface RepositoryError {
  /** Error code for programmatic handling */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Additional error details */
  details?: Record<string, unknown> | string;
  /** Field name if error is field-specific */
  field?: string;
  /** Error timestamp */
  timestamp?: string;
}

/**
 * Query options for repository methods
 */
export interface QueryOptions {
  /** Maximum number of records to return */
  limit?: number;
  /** Number of records to skip for pagination */
  offset?: number;
  /** Field name to sort by */
  orderBy?: string;
  /** Sort direction */
  orderDirection?: 'asc' | 'desc';
  /** Specific fields to select */
  select?: string[];
  /** Related data to include */
  include?: string[];
  /** Additional filters to apply */
  filters?: Record<string, any>;
}

/**
 * Paginated query result
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// =============================================================================
// DATA TRANSFORMATION TYPES
// =============================================================================

/**
 * Basic information data
 * From form data transformers
 */
export interface BasicInformationData {
  first_name: string;
  middle_name: string;
  last_name: string;
  extension_name: string;
  sex: 'male' | 'female' | '';
  civil_status: string;
  civil_status_others_specify: string;
}

/**
 * Birth information data
 * From form data transformers
 */
export interface BirthInformationData {
  birthdate: string;
  birth_place_name: string;
  birth_place_code: string;
  citizenship: string;
}

/**
 * Education information data
 * From form data transformers
 */
export interface EducationInformationData {
  education_attainment: string;
  is_graduate: boolean;
}

/**
 * Employment information data
 * From form data transformers
 */
export interface EmploymentInformationData {
  employment_status: string;
  occupation_code: string;
  employment_code: string;
  employment_name: string;
  occupation_title: string;
}

/**
 * Contact information data
 * From form data transformers
 */
export interface ContactInformationData {
  email: string;
  mobile_number: string;
  telephone_number: string;
  household_code: string;
}

/**
 * Physical information data
 * From form data transformers
 */
export interface PhysicalInformationData {
  blood_type: string;
  complexion: string;
  height: string | number;
  weight: string | number;
  citizenship?: string;
  ethnicity: string;
  religion: string;
  religion_others_specify: string;
}

/**
 * Voting information data
 * From form data transformers
 */
export interface VotingInformationData {
  is_voter: boolean;
  is_resident_voter: boolean;
  last_voted_date: string;
}

/**
 * Migration information data
 * From form data transformers and migration hooks
 */
export interface MigrationInformationData {
  previous_barangay_code?: string;
  previous_city_municipality_code?: string;
  previous_province_code?: string;
  previous_region_code?: string;
  length_of_stay_previous_months?: number;
  reason_for_migration?: string;
  date_of_transfer?: string;
  migration_type?: string;
  // Legacy fields for backward compatibility (will be mapped to above)
  reason_for_leaving?: string;
  reason_for_transferring?: string;
  duration_of_stay_current_months?: number;
  is_intending_to_return?: boolean;
}

/**
 * Family information data
 * From form data transformers
 */
export interface FamilyInformationData {
  mother_maiden_first: string;
  mother_maiden_middle: string;
  mother_maiden_last: string;
}

// =============================================================================
// CACHE TYPES
// =============================================================================

// Import consolidated cache types from centralized location
export type {
  CacheEntry,
  CacheStats,
  CacheConfig,
  CacheSetOptions,
  CacheClient,
  CacheDecoratorOptions,
  CacheInvalidationOptions,
  CacheWarmingOptions,
  CacheOperationResult,
  CacheError,
} from '@/types/cache';

// =============================================================================
// AUTHENTICATION SERVICE TYPES
// =============================================================================

/**
 * Authentication context
 */
export interface AuthContext {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
  barangayCode?: string;
}

/**
 * Session validation result
 */
export interface SessionValidationResult {
  isValid: boolean;
  context?: AuthContext;
  error?: string;
}

// =============================================================================
// ANALYTICS TYPES
// =============================================================================

/**
 * Analytics event
 */
export interface AnalyticsEvent {
  name: string;
  properties: Record<string, unknown>;
  userId?: string;
  timestamp: number;
  sessionId?: string;
}

/**
 * User behavior tracking
 */
export interface UserBehaviorEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  userId?: string;
  timestamp: number;
}

// =============================================================================
// SEARCH SERVICE TYPES
// =============================================================================

/**
 * Search configuration
 */
export interface SearchConfig {
  fuzzyMatch: boolean;
  maxResults: number;
  minQueryLength: number;
  debounceMs: number;
}

/**
 * Search result item
 */
export interface SearchResultItem<T = any> {
  item: T;
  score: number;
  matches: string[];
  highlights?: Record<string, string>;
}

/**
 * Search response
 */
export interface SearchResponse<T = any> {
  results: SearchResultItem<T>[];
  totalCount: number;
  query: string;
  executionTime: number;
  suggestions?: string[];
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Service operation result
 */
export type ServiceResult<T = any> = Promise<RepositoryResult<T>>;

/**
 * Async operation state
 */
export interface AsyncOperationState<T = any> {
  isLoading: boolean;
  data?: T;
  error?: string;
  lastUpdated?: Date;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier?: number;
  maxDelayMs?: number;
}

// =============================================================================
// HOUSEHOLD SERVICE TYPES (using canonical types from @/types/forms)
// =============================================================================

/**
 * User address information (duplicated from addresses.ts, but more detailed)
 */
export interface UserAddressDetailed {
  region_code: string;
  province_code?: string;
  city_municipality_code: string;
  barangay_code: string;
  region_name: string;
  province_name?: string;
  city_municipality_name: string;
  city_municipality_type: string;
  barangay_name: string;
}

/**
 * Create household request
 */
export interface CreateHouseholdRequest {
  formData: HouseholdFormData;
  userAddress?: UserAddressDetailed;
  barangay_code?: string;
  csrf_token?: string;
}

/**
 * Create household response
 */
export interface CreateHouseholdResponse {
  success: boolean;
  data?: any; // HouseholdRecord type from @/types
  error?: string;
}

/**
 * Household validation result
 */
export interface HouseholdValidationResult {
  success: boolean;
  errors?: Record<string, string>;
}

// =============================================================================
// RESIDENT SERVICE TYPES (from services/resident.service.ts)
// =============================================================================

/**
 * Create resident request
 */
export interface CreateResidentRequest {
  formData: any; // ResidentFormData type
  userAddress?: UserAddressDetailed;
  barangay_code?: string;
  csrf_token?: string;
}

/**
 * Create resident response
 */
export interface CreateResidentResponse {
  success: boolean;
  data?: any; // ResidentRecord type from @/types
  error?: string;
}

/**
 * Resident validation result (consolidated from multiple service files)
 */
export interface ResidentValidationResult {
  isValid: boolean;
  success: boolean;
  errors?: Array<{
    field: string;
    message: string;
    code?: string;
  }>;
}

// =============================================================================
// SCATTERED SERVICE INTERFACES CONSOLIDATION
// =============================================================================

/**
 * Service-specific resident form data with optional id for updates
 * Consolidates from src/services/resident.service.ts
 */
export interface ServiceResidentFormData {
  id?: string; // Optional for create operations, required for updates
  // Extends base ResidentFormData - imported at runtime to avoid circular dependencies
  [key: string]: any;
}

/**
 * User address for service operations
 * Consolidates from src/services/resident.service.ts
 */
export interface ServiceUserAddress {
  region_code: string;
  province_code?: string;
  city_municipality_code: string;
  barangay_code: string;
  region_name: string;
  province_name?: string;
  city_municipality_name: string;
  city_municipality_type: string;
  barangay_name: string;
}

/**
 * Create resident request for service layer
 * Consolidates from src/services/resident.service.ts
 */
export interface ServiceCreateResidentRequest {
  formData: ServiceResidentFormData;
  userAddress?: ServiceUserAddress;
  barangayCode?: string;
  csrfToken?: string;
}

/**
 * Create resident response from service layer
 * Consolidates from src/services/resident.service.ts
 */
export interface ServiceCreateResidentResponse {
  success: boolean;
  data?: any; // ResidentRecord type
  error?: string;
}

/**
 * User data interface for user repository
 * Consolidates from src/services/user-repository.ts
 */
export interface UserRepositoryData {
  id?: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  phone?: string;
  role_id: string; // UUID reference to auth_roles
  role?: string; // For backward compatibility - computed field
  barangay_code?: string;
  city_municipality_code?: string;
  province_code?: string;
  region_code?: string;
  is_active: boolean;
  last_login?: string; // Database field name
  last_login_at?: string; // Alias for backward compatibility
  email_verified?: boolean;
  email_verified_at?: string;
  onboarding_completed?: boolean;
  onboarding_completed_at?: string;
  welcome_email_sent?: boolean;
  welcome_email_sent_at?: string;
  login_attempts?: number;
  locked_until?: string;
  password_changed_at?: string;
  created_by?: string;
  updated_by?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * User search options for repository layer
 * Consolidates from src/services/user-repository.ts
 */
export interface UserRepositorySearchOptions extends QueryOptions {
  email?: string;
  name?: string;
  role?: string;
  barangay_code?: string;
  is_active?: boolean;
  last_login_before?: string;
  last_login_after?: string;
}

/**
 * User security data for authentication
 * Consolidates from src/services/user-repository.ts
 */
export interface UserSecurityData {
  login_attempts?: number;
  last_login?: string; // Database field name
  last_login_at?: string; // Alias for backward compatibility
  last_login_ip?: string;
  locked_until?: string;
  password_changed_at?: string;
  email_verified?: boolean;
  email_verified_at?: string;
}

/**
 * Command menu search result
 * Consolidates from src/services/command-menu/api-utils.ts
 */
export interface CommandMenuSearchResult {
  id: string;
  title: string;
  description: string;
  type: 'resident' | 'household';
  href: string;
}

/**
 * Export options for command menu
 * Consolidates from src/services/command-menu/api-utils.ts
 */
export interface CommandMenuExportOptions {
  type: 'residents' | 'households';
  format: 'csv' | 'xlsx';
  filters?: Record<string, any>;
}

/**
 * Command menu analytics event
 * Consolidates from src/services/command-menu/analytics-utils.ts
 */
export interface CommandMenuAnalyticsEvent {
  type: 'search' | 'navigation' | 'action' | 'error' | 'performance';
  timestamp: number;
  userId?: string;
  sessionId?: string;
  data: Record<string, any>;
}

/**
 * Raw PSOC data for mapping
 * Consolidates from src/services/residentMapper.ts
 */
export interface ServiceRawPsocData {
  code: string;
  title: string;
  level?: string;
  level_name?: string;
  hierarchy?: string;
  full_hierarchy?: string;
}

/**
 * Raw PSGC data for mapping
 * Consolidates from src/services/residentMapper.ts
 */
export interface ServiceRawPsgcData {
  code?: string;
  city_code?: string;
  province_code?: string;
  name?: string;
  city_name?: string;
  province_name?: string;
  level: string;
  full_address?: string;
  full_hierarchy?: string;
}

/**
 * Chart data point for charts service
 * Consolidates from src/services/charts/chart-transformers.ts
 */
export interface ServiceChartDataPoint {
  label: string;
  value: number;
  color?: string;
  percentage?: number;
  metadata?: Record<string, any>;
}

/**
 * Database response wrapper
 * Consolidates from src/services/auth/errors.ts
 */
export interface ServiceDatabaseResponse {
  success: boolean;
  data?: any;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    operation: string;
    affectedRows?: number;
  };
}
