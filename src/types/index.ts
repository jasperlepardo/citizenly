/**
 * Consolidated Type Exports
 * Central barrel export for all application types
 * 
 * This replaces scattered type imports from multiple locations with a single,
 * organized source of truth for TypeScript interfaces and types.
 */

// =============================================================================
// CORE DOMAIN TYPES
// =============================================================================

// Database types - explicit exports to avoid conflicts
export type {
  PSGCRegion,
  PSGCProvince,
  PSGCCityMunicipality,
  PSGCBarangay,
  AddressHierarchyQueryResult,
  GeographicHierarchyResult,
  GeographicHierarchySingleResult,
  SupabaseQueryResponse,
  ValidationError,
  RequestMetadata,
  AuditLogEntry,
  DashboardStats,
  PopulationByAgeGroup,
  EmploymentStatistics
} from './database';

// Resident types - explicit exports to avoid conflicts
export type {
  SexEnum,
  CivilStatusEnum,
  CitizenshipEnum,
  EducationLevelEnum,
  EmploymentStatusEnum,
  BloodTypeEnum,
  ReligionEnum,
  EthnicityEnum,
  BirthPlaceLevelEnum,
  ResidentDatabaseRecord,
  // Legacy aliases
  ResidentDatabaseRecord as ResidentRecord,
  ResidentDatabaseRecord as ResidentData,
  ResidentDatabaseRecord as ResidentDetail,
  ResidentDatabaseRecord as ResidentListing,
  ResidentApiData,
  ResidentSectoralInfo,
  ResidentMigrantInfo,
  ResidentFormData,
  ResidentFormState,
  PsocData,
  PsocOption,
  PsgcData,
  PsgcOption,
  AddressInfo,
  ResidentWithRelations,
  CombinedResidentFormData,
  SectoralInformation,
  SectoralContext,
  FormValidationError,
  ResidentApiResponse,
  ResidentsListResponse,
  ResidentSearchParams,
  ResidentTableAction,
  ResidentTableColumn
} from './residents';

// Export resident option constants
export {
  SEX_OPTIONS,
  CIVIL_STATUS_OPTIONS,
  CITIZENSHIP_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  BLOOD_TYPE_OPTIONS,
  RELIGION_OPTIONS,
  ETHNICITY_OPTIONS,
  BIRTH_PLACE_LEVEL_OPTIONS
} from './residents';

// Household types - explicit exports
export type {
  HouseholdRecord,
  // Legacy aliases
  HouseholdRecord as Household,
  HouseholdData,
  HouseholdHead,
  HouseholdWithMembersResult,
  HouseholdFormData,
  HouseholdOption,
  HouseholdSearchParams,
  HouseholdApiResponse,
  HouseholdsListResponse,
  HouseholdTableColumn,
  HouseholdTableAction,
  HouseholdValidationError,
  HouseholdFormSubmissionState
} from './households';

// Export household option constants
export {
  HOUSEHOLD_TYPE_OPTIONS,
  TENURE_STATUS_OPTIONS,
  INCOME_CLASS_OPTIONS
} from './households';

// Authentication and authorization types
export type {
  AuthUser,
  // Legacy aliases
  AuthUser as User,
  AuthUserProfile,
  AuthUserProfile as UserProfile,
  AuthRole,
  AuthRole as Role,
  AuthSession,
  AuthState,
  AuthPermission,
  RolePermission,
  UserRole,
  LoginRequest,
  SignupRequest,
  PasswordResetRequest,
  PasswordUpdateRequest,
  ProfileUpdateRequest,
  SupabaseAuthResponse,
  UserProfileQueryResult,
  PermissionContext,
  AccessControlResult,
  WebhookUserRecord,
  UserNotificationRecord,
  AuthProvider,
  OAuthConfig,
  SessionStorageOptions,
  SessionValidationResult,
  RouteProtection,
  AuthMiddlewareContext,
  AuthErrorType,
  AuthError,
  LoginFormData,
  SignupFormData,
  ProfileFormData
} from './auth';

// Export auth constants
export { DEFAULT_ROLES, PERMISSION_ACTIONS, RESOURCE_TYPES } from './auth';

// =============================================================================
// API AND FORM TYPES
// =============================================================================

// API request/response types
export type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiResponse,
  PaginationParams,
  SearchParams,
  PsgcSearchParams,
  PsgcSearchResult,
  PsgcLookupResponse,
  PsocSearchParams,
  PsocSearchResult,
  PsocLookupResponse,
  CreateResidentRequest,
  UpdateResidentRequest,
  CreateHouseholdRequest,
  UpdateHouseholdRequest,
  FieldValidationError,
  ValidationErrorResponse,
  RateLimitErrorResponse,
  AuthErrorResponse,
  HealthCheckResponse,
  CommandMenuSearchResponse
} from './api';

// Export API type guards
export { isApiSuccess, isApiError, isValidationError, isRateLimitError, isAuthError } from './api';

// Form field and validation types
export type {
  BaseFieldSetProps,
  FieldSetWithIconsProps,
  ClearableFieldSetProps,
  ValidationState,
  FieldSize,
  ValidatedFieldSetProps,
  LoadableFieldSetProps,
  GenericSelectOption,
  SelectFieldBaseProps,
  FormSectionProps,
  FieldValidator,
  ValidatableFieldSetProps,
  FormMode,
  FormSubmissionState
} from './forms';

// =============================================================================
// VALIDATION RESULT TYPE
// =============================================================================

// Re-export validation types from lib/validation/types if needed
import type { ValidationError } from './database';

export type ValidationResult<T = any> = {
  isValid: boolean;
  errors: ValidationError[];
  data?: T;
};

// =============================================================================
// COMMON UTILITY TYPES
// =============================================================================

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make specific properties required
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Extract keys that are of a certain type
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * Generic pagination wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Generic select option (widely used across the app)
 */
export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
  description?: string;
}

/**
 * Generic search result
 */
export interface SearchResult<T = any> {
  item: T;
  score: number;
  highlights?: string[];
}

/**
 * Loading state wrapper
 */
export interface LoadingState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Async operation state
 */
export interface AsyncState<T = any> extends LoadingState<T> {
  lastFetch: Date | null;
  refetch: () => Promise<void>;
}

// =============================================================================
// COMPONENT PROP TYPES
// =============================================================================

/**
 * Base component props that most components should have
 */
export interface BaseComponentProps {
  className?: string;
  id?: string;
  'data-testid'?: string;
}

/**
 * Props for components that can be disabled
 */
export interface DisableableProps {
  disabled?: boolean;
}

/**
 * Props for components with loading states
 */
export interface LoadableProps {
  loading?: boolean;
}

/**
 * Props for components with size variants
 */
export interface SizableProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Props for components with color variants
 */
export interface ColoredProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
}

// =============================================================================
// EVENT HANDLER TYPES
// =============================================================================

/**
 * Generic change handler
 */
export type ChangeHandler<T = any> = (value: T) => void;

/**
 * Generic click handler
 */
export type ClickHandler<T = HTMLElement> = (event: React.MouseEvent<T>) => void;

/**
 * Generic form submit handler
 */
export type SubmitHandler<T = any> = (data: T) => void | Promise<void>;

// Note: Legacy type aliases are now included in the main export sections above

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Check if a value is defined (not null or undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Check if a string is not empty
 */
export function isNotEmpty(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Check if an array is not empty
 */
export function isNotEmptyArray<T>(value: T[] | null | undefined): value is T[] {
  return Array.isArray(value) && value.length > 0;
}