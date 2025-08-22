/**
 * Library Index - Centralized exports for all lib modules
 * Provides clean imports for business logic, utilities, and shared code
 */

// Explicit exports to prevent circular dependencies

// Constants exports
export {
  SEX_OPTIONS,
  CIVIL_STATUS_OPTIONS,
  CITIZENSHIP_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
  EDUCATION_STATUS_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  BLOOD_TYPE_OPTIONS,
  ETHNICITY_OPTIONS,
  RELIGION_OPTIONS,
} from './constants/resident-enums';

// Type exports
export type {
  BaseFieldSetProps,
  FieldSetWithIconsProps,
  ClearableFieldSetProps,
  ValidatedFieldSetProps,
  LoadableFieldSetProps,
  GenericSelectOption,
  SelectFieldBaseProps,
  FormSectionProps,
  ValidatableFieldSetProps,
  FormMode,
  ValidationState,
  FieldSize,
  FormSubmissionState,
} from './types';

// Form utilities exports
export {
  createFieldChangeHandler,
  createSelectChangeHandler,
  createBooleanChangeHandler,
  createFormSubmitHandler,
  fieldValidators,
  buildErrorsFromValidation,
  isFieldReadOnly,
  formatDateForDisplay,
  formatBooleanForDisplay,
  getSelectDisplayValue,
  fieldLogic,
  fieldState,
} from './forms';

// Chart utilities exports
export {
  transformChartData,
  transformDependencyData,
  transformSexData,
  transformCivilStatusData,
  transformEmploymentData,
  getChartTitle,
  chartUtils,
  DEFAULT_CHART_TITLES,
  CHART_COLORS,
} from './charts';

export type {
  ChartDataPoint,
  ChartType,
  DependencyData,
  SexData,
  CivilStatusData,
  EmploymentStatusData,
} from './charts';

// Graphics utilities exports
export {
  generateColorVariations,
  applyColorsToData,
  isValidColor,
  colorUtils,
  CHARTJS_COLOR_PALETTE,
  createPieSlicePath,
  calculatePieSliceAngles,
  calculatePieChartTotal,
  filterNonEmptySlices,
  isSingleSlice,
  getSingleSlice,
  pieChartMath,
} from './graphics';

export type {
  PieSliceData,
  PieSliceWithAngles,
} from './graphics';

// Statistics utilities exports
export {
  filterEmptyAgeGroups,
  hasPopulationData,
  calculatePopulationStats,
  calculateMaxPercentage,
  generateTooltipData,
  populationPyramidStats,
} from './statistics';

export type {
  AgeGroupData,
  PopulationStats,
  TooltipData,
} from './statistics';

// Error handling exports
export {
  createAppError,
  isAppError,
  isNetworkError,
  isValidationError,
  getErrorMessage,
  getErrorSeverity,
  classifyError,
  sanitizeError,
  createValidationError,
  createNetworkError,
  errorUtils,
  createErrorBoundaryState,
  handleErrorBoundaryError,
  shouldRetryError,
  createDefaultErrorFallback,
  createFieldErrorFallback,
  createErrorBoundaryComponent,
  withErrorBoundary,
  errorBoundaryUtils,
} from './error-handling';

export type {
  AppError,
  ErrorBoundaryState,
  ErrorBoundaryProps,
  ErrorFallbackProps,
  FieldErrorBoundaryProps,
  ErrorLogContext,
  ErrorRecoveryStrategy,
  FieldError,
  ValidationError,
  NetworkError,
} from './error-handling';

export { ErrorSeverity, ErrorCode } from './error-handling';

// Business rules exports
export {
  calculateAge,
  isOutOfSchoolChildren,
  isOutOfSchoolYouth,
  isSeniorCitizen,
  isEmployed,
  isUnemployed,
  isIndigenousPeople,
  EMPLOYED_STATUSES,
  UNEMPLOYED_STATUSES,
  INDIGENOUS_ETHNICITIES,
} from './business-rules';

// Utility functions exports
export {
  // String utilities
  capitalize,
  toTitleCase,
  truncateText,
  sanitizeString,
  isValidEmail,
  isValidPhilippineMobile,
  formatPhoneNumber,
  // Data transformation utilities
  isEmpty,
  deepClone,
  groupBy,
  removeDuplicates,
  sortBy,
  formatCurrency,
  formatDate,
  parseQueryString,
  buildQueryString,
  // ID generation utilities
  generateId,
  generateFieldId,
  getFieldId,
  getFieldIds,
  buildAriaDescribedBy,
  buildAriaLabelledBy,
  // Async utilities
  debounce,
  throttle,
  sleep,
  retry,
  // CSS utilities
  cn,
  mergeClassNames,
} from './utilities';

// Validation system exports
export {
  residentSchema,
  householdSchema,
  userSchema,
  validateResidentData,
  validateHouseholdData,
  validateUserData,
} from './validation/schemas';

// Security system exports
export {
  storeSecurityAuditLog,
  storeThreatDetectionEvent,
  querySecurityAuditLogs,
  getSecurityStatistics,
  recordSecurityEvent,
  getThreatLevel,
  shouldBlockIp,
  getSecurityInsights,
} from './security';

// Repository pattern exports
export {
  BaseRepository,
  ResidentRepository,
  HouseholdRepository,
  UserRepository,
  RepositoryFactory,
  createRepositories,
  type QueryOptions,
  type RepositoryError,
  type RepositoryResult,
  type ResidentData,
  type ResidentSearchOptions,
  type HouseholdData,
  type HouseholdSearchOptions,
  type UserData,
  type UserSearchOptions,
  type UserSecurityData,
} from './repositories';

// API utilities exports
export * from './api';

// Authentication exports  
export * from './auth';

// Command menu exports
export * from './command-menu';

// Database utilities exports (conflicts resolved at module level)
export * from './database';

// Environment configuration exports
export * from './environment';

// Logging utilities exports (conflicts resolved at module level)
export * from './logging';

// Direct logger exports for convenience
export {
  logger,
  dbLogger,
  apiLogger,
  authLogger,
} from './logging';

// Performance utilities exports
export * from './performance';

// Storage utilities exports
export * from './storage';

// Supabase utilities exports
export * from './supabase';

// UI utilities exports
export * from './ui';

// Design system utilities exports

// Legacy utility exports (to be consolidated) - TODO: Fix missing modules
// export * from './utils';

// Additional individual exports for backward compatibility - TODO: Fix missing modules  
// export * from './fieldUtils';
// export * from './public-search';

// Validation type exports
export type {
  ValidationResult,
  FieldValidationResult,
  FieldValidator,
  FormValidator,
  ValidationContext,
  SanitizationOptions,
  ValidationRule,
  SchemaValidationConfig,
} from './validation/types';