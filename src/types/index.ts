/**
 * Consolidated Type Exports
 * Central barrel export for all application types
 *
 * Clean, direct imports with no legacy aliases or duplicates.
 * Use specific type names from their respective modules.
 */

// =============================================================================
// NEW CONSOLIDATED TYPE EXPORTS
// =============================================================================

// Validation types
export * from './validation';

// Address types
export * from './addresses';

// Performance types
export * from './performance';

// Form types (includes HouseholdFormData)
export * from './forms';

// Service types
export * from './services';

// Export specific service types for clarity
export type {
  ServiceResidentFormData,
  ServiceUserAddress,
  ServiceCreateResidentRequest,
  ServiceCreateResidentResponse,
  UserRepositoryData,
  UserRepositorySearchOptions,
  UserSecurityData,
  CommandMenuExportOptions,
  CommandMenuAnalyticsEvent,
  ServiceRawPsocData,
  ServiceRawPsgcData,
  ServiceChartDataPoint,
  ServiceDatabaseResponse,
} from './services';

// Repository types
export * from './repositories';

// API request types
export * from './api-requests';

// Export specific API request types for clarity
export type {
  HealthCheckResult,
  LogEntry,
  ClientLogRequest,
  WebhookPayload,
  WebhookVerification,
  CreateProfileRequest,
  CreateProfileResponse,
  TestResults,
  TestSuiteResults,
  ProfileTestResults,
  NotificationRecord,
  CreateUserData,
  UserManagementRequest,
  BulkUserOperationResponse,
  DataExportRequest,
  DataImportRequest,
  ImportExportJobStatus,
} from './api-requests';

// Page component props
export * from './page-props';

// Hook types
export type {
  UseGenericValidationOptions,
  UseGenericValidationReturn,
  ValidationProgressState,
  UseValidationProgressReturn,
  UseCrudOptions,
  UseCrudReturn,
  UseAsyncReturn,
  FormFieldState,
  UseFormOptions,
  UseFormReturn,
  SearchOptions,
  SearchResults,
  UseSearchReturn,
  UseLocalStorageOptions,
  UseLocalStorageReturn,
  UseDebounceOptions,
  UseApiConfig,
  PermissionCheckResult,
  UserBarangayData,
  FormHookResult,
  URLParameterConfig,
  URLParametersResult,
  ResidentFormURLParametersResult,
  WorkflowState,
  WorkflowHookResult,
  CommandMenuSearchResult,
  CommandMenuHookResult,
} from './hooks';

// Component types
export type {
  BaseComponentProps,
  ComponentWithChildren,
  ComponentSize,
  ComponentVariant,
  ButtonProps,
  FormFieldProps,
  InputProps,
  SelectProps,
  CheckboxProps,
  RadioProps,
  CardProps,
  ModalProps,
  DrawerProps,
  TableColumn,
  TableProps,
  PaginationProps,
  AlertSeverity,
  AlertProps,
  LoadingProps,
  ProgressProps,
  NavItem,
  BreadcrumbItem,
  TabItem,
  TabsProps,
  FileUploadProps,
  FilePreview,
  SearchBarProps,
  SearchResultItem,
  ButtonGroupOption,
  ButtonGroupProps,
  DialogAction,
  ConfirmationDialogProps,
} from './components';

// API types
export * from './api-consolidated';

// Utility types
export * from './utilities';

// Export specific utility types for clarity
export type {
  NameParts,
  UnknownFormData,
  FormProcessingStage,
  FormProcessingOptions,
  ProcessedFormResult,
  UtilityValidationState,
  SanitizationType,
  SanitizationOptions,
} from './utilities';

// Error handling types
export * from './errors';

// Chart and visualization types
export * from './charts';

// Application constants
export * from './constants';

// =============================================================================
// CORE DOMAIN TYPES
// =============================================================================

// Database types
export type {
  // Core Record Types
  ResidentRecord,
  HouseholdRecord,

  // Geographic Types
  PSGCRegion,
  PSGCProvince,
  PSGCCityMunicipality,
  PSGCBarangay,
  GeoSubdivision,
  GeoStreet,

  // PSOC Types
  PsocMajorGroup,
  PsocSubMajorGroup,
  PsocMinorGroup,
  PsocUnitGroup,
  PsocUnitSubGroup,
  PsocPositionTitle,
  PsocOccupationCrossReference,

  // Relationship Types
  HouseholdMember,
  ResidentRelationship,

  // System Types
  SystemDashboardSummary,
  SystemSchemaVersion,

  // Query Result Types
  AddressHierarchyQueryResult,
  GeographicHierarchyResult,
  GeographicHierarchySingleResult,
  SupabaseQueryResponse,
  RequestMetadata,
  AuditLogEntry,
  DashboardStats,
  PopulationByAgeGroup,
  EmploymentStatistics,
} from './database';

// Authentication types
export type {
  AuthUser,
  AuthUserProfile,
  AuthenticatedUser,
  AuthSession,
  AuthState,
  AuthRole,
  AuthPermission,
  RolePermission,
  UserRoleAssignment,
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
  ProfileFormData,
} from './auth';

// Export auth constants
export { DEFAULT_ROLES, PERMISSION_ACTIONS, RESOURCE_TYPES } from './auth';

// Database enums (from database.ts)
export type {
  SexEnum,
  CivilStatusEnum,
  CitizenshipEnum,
  EducationLevelEnum,
  EmploymentStatusEnum,
  BloodTypeEnum,
  ReligionEnum,
  EthnicityEnum,
} from './database';

// Resident types
export type {
  // Core interfaces
  PersonalInfoFormState,
  ContactInfoFormState,
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
  ResidentApiResponse,
  ResidentsListResponse,
  ResidentSearchParams,
  ResidentTableAction,
  ResidentTableColumn,

  // Validation
  FormValidationError,
  SectoralInformation,
  SectoralContext,
} from './residents';

// Address types are in addresses.ts
export type { AddressInfo } from './addresses';

// Note: Resident option constants are available from @/constants/resident-form-options
// They are not re-exported here to maintain clean type separation

// Household types
export type {
  // Household Enums
  HouseholdTypeEnum,
  TenureStatusEnum,
  HouseholdUnitEnum,
  FamilyPositionEnum,
  IncomeClassEnum,

  // Household Interfaces
  HouseholdData,
  HouseholdHead,
  HouseholdWithMembersResult,
  HouseholdOption,
  HouseholdSearchParams,
  HouseholdApiResponse,
  HouseholdsListResponse,
  HouseholdTableColumn,
  HouseholdTableAction,
  HouseholdValidationError,
  HouseholdFormSubmissionState,
} from './households';

// Note: Household option constants are available from @/constants/household-form-options
// They are not re-exported here to maintain clean type separation

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
  HouseholdFormProps,
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
  CommandMenuSearchResponse,
} from './api';

// Export API type guards
export { isApiSuccess, isApiError, isValidationError, isRateLimitError, isAuthError } from './api';

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

// Component prop types consolidated into components.ts - imported via barrel export

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
