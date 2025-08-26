/**
 * Consolidated Type Exports
 * Central barrel export for all application types
 * 
 * Clean, direct imports with no legacy aliases or duplicates.
 * Use specific type names from their respective modules.
 */

// =============================================================================
// CORE DOMAIN TYPES
// =============================================================================

// Database types
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

// Authentication types
export type {
  AuthUser,
  AuthUserProfile,
  AuthSession,
  AuthState,
  AuthRole,
  AuthPermission,
  RolePermission,
  UserRole,
  WebhookUserRecord,
  LoginRequest,
  SignupRequest,
  PasswordResetRequest,
  PasswordUpdateRequest,
  ProfileUpdateRequest,
  AccessControlResult,
  AuthProvider,
  AuthErrorType,
  AuthError,
  LoginFormData,
  SignupFormData,
  ProfileFormData
} from './auth';

// Export auth constants
export { DEFAULT_ROLES, PERMISSION_ACTIONS, RESOURCE_TYPES } from './auth';

// Resident types
export type {
  // Enums
  SexEnum,
  CivilStatusEnum,
  CitizenshipEnum,
  EducationLevelEnum,
  EmploymentStatusEnum,
  BloodTypeEnum,
  ReligionEnum,
  EthnicityEnum,
  BirthPlaceLevelEnum,
  
  // Core interfaces
  ResidentDatabaseRecord,
  ResidentApiData,
  ResidentSectoralInfo,
  ResidentMigrantInfo,
  ResidentFormState,
  ResidentWithRelations,
  CombinedResidentFormData,
  
  // Search and API
  PsocData,
  PsocOption,
  PsgcData,
  PsgcOption,
  AddressInfo,
  ResidentApiResponse,
  ResidentsListResponse,
  ResidentSearchParams,
  ResidentTableAction,
  ResidentTableColumn,
  
  // Validation
  FormValidationError,
  SectoralInformation,
  SectoralContext
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

// Household types
export type {
  HouseholdRecord,
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

// Form types
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
  FormSubmissionState,
  ResidentFormData,
  ExtendedHouseholdFormData,
  HouseholdDetailsData,
  FormSectionPropsGeneric,
  FieldConfig,
  HouseholdFormProps
} from './forms';

// =============================================================================
// API AND COMMUNICATION TYPES
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
export { 
  isApiSuccess, 
  isApiError, 
  isValidationError, 
  isRateLimitError, 
  isAuthError 
} from './api';

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Generic validation result wrapper
 */
export type ValidationResult<T = any> = {
  isValid: boolean;
  errors: string[];
  data?: T;
};

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