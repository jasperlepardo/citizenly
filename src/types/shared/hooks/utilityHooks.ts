/**
 * Utility Hook Types
 *
 * @fileoverview TypeScript interfaces for utility React hooks
 * in the Citizenly RBI system.
 */

// ComponentType import removed - was not being used
import type { FormMode } from '@/types/app/ui/forms';
import type { AddressHierarchyInfo } from '@/types/domain/addresses/addresses';
import type { AddressHierarchyQueryResult } from '@/types/infrastructure/database/database';
import type { HookPerformanceMetrics } from '@/types/shared/utilities/performance';

// Re-export performance metrics for use in hooks
export type { HookPerformanceMetrics };

// Re-export commonly used form and validation types
export type { ResidentFormData } from '@/types/domain/residents/forms';
export type { ValidationResult, FieldValidationResult } from '@/types/consolidated/validation';

// Note: Form hook types removed - unused (FormFieldState, FormState, UseFormOptions, UseFormReturn)

// Note: Search hook types removed - unused (SearchOptions, SearchResults, UseSearchReturn)

// =============================================================================
// UTILITY HOOK TYPES
// =============================================================================

// Note: Basic utility hook types removed - unused:
// UseLocalStorageOptions, UseLocalStorageReturn, UseDebounceOptions, UseApiConfig,
// PermissionCheckResult, UserBarangayData, FormHookResult

// =============================================================================
// URL PARAMETER HOOKS
// =============================================================================

/**
 * URL parameter configuration
 */
export interface URLParameterConfig {
  key: string;
  sanitizationType?: 'text' | 'name' | 'none';
  defaultValue?: string;
}

// Note: URLParametersResult and ResidentFormURLParametersResult removed - unused

// =============================================================================
// UTILITY HOOK TYPES (Hook-specific interfaces)
// =============================================================================

/**
 * Logger hook-specific log entry
 * Different from API LogEntry - includes hook-specific fields
 */
export interface HookLogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  component: string;
  message: string;
  data?: any;
  error?: Error;
  userId?: string;
  sessionId?: string;
}

/**
 * Logger hook configuration
 */
export interface HookLoggerConfig {
  level: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  enableConsole: boolean;
  enablePersistence: boolean;
  maxEntries: number;
  prefix?: string;
}

/**
 * Async validation result for hooks
 * Simpler than the main AsyncValidationResult in validation.ts
 */
export interface HookAsyncValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Form submission props for hooks
 */
export interface HookFormSubmissionProps<T> {
  onSubmit?: (data: T) => void | Promise<void>;
  mode: FormMode;
}

/**
 * Form submission return for hooks
 */
export interface HookFormSubmissionReturn<T> {
  isSubmitting: boolean;
  isOptimisticallyUpdated: boolean;
  handleSubmit: (formData: T) => Promise<{ success: boolean; errors?: Record<string, string> }>;
}

/**
 * Performance tracking hook options
 * Consolidates from src/lib/monitoring/hooks/usePerformanceTracking.ts
 */
export interface UsePerformanceTrackingOptions {
  componentName: string;
  trackRenders?: boolean;
  trackMounts?: boolean;
  trackUpdates?: boolean;
  metadata?: Record<string, any>;
}

/**
 * Performance tracking hook return interface
 * Consolidates from src/lib/monitoring/hooks/usePerformanceTracking.ts
 */
export interface PerformanceTrackingReturn {
  trackOperation: (name: string, metadata?: Record<string, any>) => () => void;
  trackAsyncOperation: <T>(
    name: string,
    operation: () => Promise<T>,
    metadata?: Record<string, any>
  ) => Promise<T>;
}

/**
 * Error boundary hook options
 * Consolidates from src/lib/monitoring/hooks/useErrorBoundary.ts
 */
export interface UseErrorBoundaryOptions {
  componentName: string;
  fallbackComponent?: React.ComponentType<{ error: Error; reset: () => void }>;
  onError?: (error: Error, errorInfo: any) => void;
  enableReporting?: boolean;
}

/**
 * Error boundary hook return interface
 * Consolidates from src/lib/monitoring/hooks/useErrorBoundary.ts
 */
export interface ErrorBoundaryReturn {
  error: Error | null;
  hasError: boolean;
  resetError: () => void;
  captureError: (error: Error, context?: Record<string, any>) => void;
  wrapAsync: <T>(operation: () => Promise<T>, operationName?: string) => Promise<T>;
}

/**
 * User barangay information hook return interface
 * Consolidates from src/hooks/utilities/useUserBarangay.ts
 */
export interface UserBarangayInfo {
  barangayCode: string | null;
  address: AddressHierarchyQueryResult | null;
  loading: boolean;
  error: string | null;
}

/**
 * Selector hook options interface
 * Consolidates from src/hooks/utilities/useSelector.ts
 */
export interface UseSelectorOptions<T> {
  value: string;
  onChange: (value: string) => void;
  searchFn: (term: string) => Promise<T[]>;
  loadSelectedFn?: (value: string) => Promise<T | null>;
  debounceMs?: number;
  minSearchLength?: number;
  formatDisplayValue?: (item: T) => string;
}

/**
 * Selector hook return interface
 * Consolidates from src/hooks/utilities/useSelector.ts
 */
export interface UseSelectorReturn<T> {
  searchTerm: string;
  options: T[];
  loading: boolean;
  isOpen: boolean;
  selectedOption: T | null;
  onSearchChange: (search: string) => void;
  onOpenChange: (open: boolean) => void;
  setSearchTerm: (term: string) => void;
  setOptions: (options: T[]) => void;
  setSelectedOption: (option: T | null) => void;
}

/**
 * Retry strategy options interface
 * Consolidates from src/hooks/utilities/useRetryLogic.ts
 */
export interface RetryStrategy {
  /** Maximum number of retry attempts */
  maxAttempts: number;
  /** Initial delay in milliseconds */
  initialDelay: number;
  /** Maximum delay in milliseconds */
  maxDelay: number;
  /** Exponential backoff multiplier */
  backoffMultiplier: number;
  /** Add jitter to prevent thundering herd */
  enableJitter: boolean;
  /** Custom condition to determine if error should be retried */
  shouldRetry?: (error: Error, attempt: number) => boolean;
}

/**
 * Retry state interface
 * Consolidates from src/hooks/utilities/useRetryLogic.ts
 */
export interface RetryState {
  /** Current attempt number (0 = initial attempt) */
  attempt: number;
  /** Whether retry is currently in progress */
  isRetrying: boolean;
  /** Last error encountered */
  lastError: Error | null;
  /** Next retry delay in milliseconds */
  nextDelay: number;
  /** Whether max attempts have been reached */
  maxAttemptsReached: boolean;
}

/**
 * Retry logic hook options interface
 * Consolidates from src/hooks/utilities/useRetryLogic.ts
 */
export interface UseRetryLogicOptions extends Partial<RetryStrategy> {
  /** Hook name for logging */
  name?: string;
  /** Called when operation succeeds after retry */
  onSuccess?: (result: any, attempt: number) => void;
  /** Called when operation fails (before retry) */
  onError?: (error: Error, attempt: number) => void;
  /** Called when max attempts reached */
  onMaxAttemptsReached?: (error: Error) => void;
}

/**
 * Return type for retry logic hook
 * Consolidates from src/hooks/utilities/useRetryLogic.ts
 */
export interface UseRetryLogicReturn {
  /** Current retry state */
  state: RetryState;
  /** Execute operation with retry logic */
  execute: <T>(operation: () => Promise<T>) => Promise<T>;
  /** Reset retry state */
  reset: () => void;
  /** Cancel any pending retry */
  cancel: () => void;
}

/**
 * Resident cross-field validation hook return interface
 * Consolidates from src/hooks/utilities/useResidentCrossFieldValidation.ts
 */
export interface UseResidentCrossFieldValidationReturn {
  /** Validate all cross-field rules for given data */
  validateCrossFields: (data: any) => Record<string, string>;
  /** Get fields affected by cross-field validation */
  getCrossFieldDependencies: (fieldName: string) => string[];
  /** Check if field has cross-field dependencies */
  hasCrossFieldDependencies: (fieldName: string) => boolean;
}

/**
 * Async validation options interface
 * Consolidates from src/hooks/utilities/useResidentAsyncValidation.ts
 */
export interface AsyncValidationOptions {
  /** Debounce delay for async validation */
  debounceDelay?: number;
  /** Enable/disable async validation */
  enabled?: boolean;
}

/**
 * Resident async validation hook return interface
 * Consolidates from src/hooks/utilities/useResidentAsyncValidation.ts
 */
export interface UseResidentAsyncValidationReturn {
  /** Validate field asynchronously */
  validateFieldAsync: (fieldName: string, value: unknown) => Promise<HookAsyncValidationResult>;
  /** Check if async validation is in progress */
  isAsyncValidating: boolean;
  /** Get async validation errors */
  asyncValidationErrors: Record<string, string>;
  /** Clear async validation errors */
  clearAsyncValidationErrors: () => void;
  /** Clear async validation error for specific field */
  clearAsyncValidationError: (fieldName: string) => void;
}

/**
 * Preload on hover hook return interface
 * Consolidates from src/hooks/utilities/usePreloadOnHover.ts
 */
export interface UsePreloadOnHoverReturn {
  /**
   * Mouse enter event handler that triggers component preloading
   * Apply this to the element that should trigger preloading on hover
   */
  readonly onMouseEnter: () => void;
}

/**
 * Performance monitor options interface
 * Consolidates from src/hooks/utilities/usePerformanceMonitor.ts
 */
export interface UsePerformanceMonitorOptions {
  /** Threshold for excessive renders (default: 10) */
  excessiveRenderThreshold?: number;
  /** Whether to log performance warnings (default: true) */
  enableWarnings?: boolean;
  /** Whether to track render timing (default: true) */
  trackTiming?: boolean;
}

/**
 * Performance monitor hook return interface
 * Consolidates from src/hooks/utilities/usePerformanceMonitor.ts
 */
export interface UsePerformanceMonitorReturn {
  /** Current performance metrics */
  metrics: HookPerformanceMetrics;
  /** Reset performance counters */
  reset: () => void;
  /** Get performance report */
  getReport: () => string;
}

/**
 * Field error handler hook return interface
 * Consolidates from src/hooks/utilities/useFieldErrorHandler.ts
 */
export interface UseFieldErrorHandlerReturn {
  /** Handle field error */
  handleFieldError: (error: Error, fieldName?: string) => void;
}

/**
 * Logger hook return interface
 * Consolidates from src/hooks/utilities/useLogger.ts
 */
export interface UseLoggerReturn {
  debug: (message: string, data?: unknown) => void;
  info: (message: string, data?: unknown) => void;
  warn: (message: string, data?: unknown) => void;
  error: (message: string, error?: unknown, data?: unknown) => void;
  critical: (message: string, error?: Error, data?: unknown) => void;
  trackPerformance: (operation: string, duration: number) => void;
  trackEvent: (event: string, properties?: Record<string, unknown>) => void;
}

/**
 * Household code generation hook return interface
 * Consolidates from src/hooks/utilities/useHouseholdCodeGeneration.ts
 */
export interface UseHouseholdCodeGenerationReturn {
  /** Generates a PSGC-compliant household code */
  generateHouseholdCode: () => Promise<string>;
  /** Derives geographic codes from barangay code */
  deriveGeographicCodes: (barangayCode: string) => {
    region_code: string;
    province_code: string;
    city_municipality_code: string;
  } | null;
}

/**
 * Generic form submission options interface
 * Consolidates from src/hooks/utilities/useGenericFormSubmission.ts
 */
export interface UseGenericFormSubmissionOptions<T> {
  /** Function to call when form is submitted */
  onSubmit: (data: T) => Promise<void>;
  /** Optional validation function */
  validate?: (data: T) => { isValid: boolean; errors: Record<string, string> };
  /** Called on successful submission */
  onSuccess?: () => void;
  /** Called on submission error */
  onError?: (error: any) => void;
}

/**
 * Generic form submission hook return interface
 * Consolidates from src/hooks/utilities/useGenericFormSubmission.ts
 */
export interface UseGenericFormSubmissionReturn<T> {
  /** Whether the form is currently being submitted */
  isSubmitting: boolean;
  /** Form submission handler */
  handleSubmit: (e: React.FormEvent, formData: T) => Promise<void>;
  /** Manual submission function (without event) */
  submit: (formData: T) => Promise<void>;
}

/**
 * Resident submission options interface
 * For use with resident form submission hook
 */
export interface UseResidentSubmissionOptions {
  /** Function to call when form is submitted */
  onSubmit?: (data: any) => Promise<void>;
  /** Called on successful submission */
  onSuccess?: (data: any) => void;
  /** Called on submission error */
  onError?: (error: any) => void;
}

/**
 * Resident submission hook return interface
 * For use with resident form submission hook
 */
export interface UseResidentSubmissionReturn {
  /** Whether the form is currently being submitted */
  isSubmitting: boolean;
  /** Current submission error if any */
  submissionError: string | null;
  /** Form submission function */
  submitForm: (formData: any, validationResult: any) => Promise<void>;
  /** Reset submission state */
  resetSubmissionState: () => void;
}

// =============================================================================
// VALIDATION HOOK TYPES
// =============================================================================

/**
 * Resident validation options interface
 * For resident validation configuration
 */
export interface ResidentValidationOptions {
  /** Whether to validate on blur events */
  validateOnBlur?: boolean;
  /** Whether to validate on change events */
  validateOnChange?: boolean;
  /** Whether to enable async validation */
  enableAsyncValidation?: boolean;
  /** Custom validation messages */
  customMessages?: Record<string, string>;
}

/**
 * Validation summary interface
 * For tracking validation progress across sections
 */
export interface ValidationSummary {
  /** Total number of fields */
  totalFields: number;
  /** Number of validated fields */
  validatedFields: number;
  /** Number of invalid fields */
  invalidFields: number;
  /** Total number of errors */
  totalErrors: number;
  /** Number of critical errors */
  criticalErrors: number;
  /** Number of warnings */
  warnings: number;
  /** Validation progress percentage */
  progress: number;
}

/**
 * Section validation status interface
 * For tracking validation status of form sections
 */
export interface SectionValidationStatus {
  /** Section identifier */
  sectionId: string;
  /** Section display name */
  sectionName: string;
  /** Section (alias for sectionId for backward compatibility) */
  section?: string;
  /** Whether section is valid */
  isValid: boolean;
  /** Number of errors in section */
  errorCount: number;
  /** Total number of fields in section */
  totalFields: number;
  /** Progress percentage for this section */
  progressPercentage: number;
  /** Whether section has been validated */
  hasValidated: boolean;
}

/**
 * Resident validation core hook return interface
 * For core resident validation functionality
 */
export interface UseResidentValidationCoreReturn {
  /** Validation errors by field */
  errors: Record<string, string>;
  /** Whether form is currently valid */
  isValid: boolean;
  /** Whether validation has been performed */
  hasValidated: boolean;
  /** Whether currently validating */
  isValidating: boolean;
  /** Get error for specific field */
  getFieldError: (fieldName: string) => string | undefined;
  /** Check if field has error */
  hasFieldError: (fieldName: string) => boolean;
  /** Validate entire form */
  validateForm: (data: any) => Promise<any>;
  /** Validate single field */
  validateField: (fieldName: string, value: any) => Promise<any>;
  /** Clear all errors */
  clearErrors: () => void;
  /** Set field error */
  setFieldError: (fieldName: string, error: string) => void;
  /** Validate form section */
  validateSectionFields: (formData: any, section: any) => any;
  /** Get required fields for section */
  getRequiredFieldsForSection: (section: any) => string[];
  /** Validate field with debouncing */
  validateFieldDebounced: (fieldName: string, value: any) => void;
  /** Get formatted field error */
  getFormattedFieldError: (fieldName: string) => string | undefined;
  /** Batch validate multiple fields */
  batchValidateFields: (fields: Record<string, unknown>) => Record<string, string>;
  /** Clear errors for specific section */
  clearSectionErrors: (section: string) => void;
  /** Check if section is valid */
  isSectionValid: (section: string) => boolean;
  /** Check if field should be validated */
  shouldValidateField: (fieldName: string) => boolean;
}

/**
 * Resident validation errors hook return interface
 * For managing validation errors
 */
export interface UseResidentValidationErrorsReturn {
  /** Current validation errors */
  errors: Record<string, string>;
  /** Whether form is valid (no errors) */
  isValid: boolean;
  /** Set errors for multiple fields */
  setErrors: (errors: Record<string, string>) => void;
  /** Add error for single field */
  addError: (fieldName: string, message: string) => void;
  /** Remove error for single field */
  removeError: (fieldName: string) => void;
  /** Clear all errors */
  clearErrors: () => void;
  /** Get formatted error for field */
  getFormattedError: (fieldName: string) => string | undefined;
  /** Check if field has error */
  hasFieldError: (fieldName: string) => boolean;
  /** Clear error for specific field */
  clearFieldError: (fieldName: string) => void;
  /** Validate entire form */
  validateForm: (data: any) => any;
  /** Get error for field */
  getFieldError: (fieldName: string) => string | undefined;
  /** Validate single field */
  validateField: (fieldName: string, value: any) => Promise<any>;
  /** Clear all errors (alias for clearErrors) */
  clearAllErrors: () => void;
}

/**
 * Resident validation progress hook return interface
 * For tracking validation progress
 */
export interface UseResidentValidationProgressReturn {
  /** Current validation summary */
  summary: ValidationSummary;
  /** Validation status by section */
  sectionStatuses: SectionValidationStatus[];
  /** Overall validation progress percentage */
  progress: number;
  /** Update section validation status */
  updateSectionStatus: (sectionId: string, status: Partial<SectionValidationStatus>) => void;
  /** Reset validation progress */
  resetProgress: () => void;
  /** Get validation summary from errors */
  getValidationSummary: (errors: Record<string, string>) => ValidationSummary;
  /** Get validation progress from errors */
  getValidationProgress: (errors: Record<string, string>) => number;
  /** Check if errors contain critical issues */
  hasCriticalErrors: (errors: Record<string, string>) => boolean;
  /** Get validation status for specific section */
  getSectionValidationStatus: (sectionId: string) => SectionValidationStatus | undefined;
  /** Get all section statuses from errors (alias for compatibility) */
  getAllSectionStatuses: (errors: Record<string, string>) => SectionValidationStatus[];
  /** Check if field is critical */
  isFieldCritical: (fieldName: string) => boolean;
  /** Get all required fields */
  getAllRequiredFields: () => string[];
  /** Check if field is required */
  isFieldRequired: (fieldName: string) => boolean;
}

// =============================================================================
// WORKFLOW HOOK TYPES
// =============================================================================

/**
 * Resident form state options interface
 * For configuring resident form state management
 */
export interface UseResidentFormStateOptions {
  /** Initial form data */
  initialData?: any;
  /** Whether to track dirty state */
  trackDirty?: boolean;
  /** Auto-save interval in milliseconds */
  autoSaveInterval?: number;
  /** Auto-save enabled */
  autoSave?: boolean;
  /** Auto-save key for storage */
  autoSaveKey?: string;
}

/**
 * Resident edit workflow options interface
 * For configuring the complete resident edit workflow
 */
export interface UseResidentEditWorkflowOptions {
  /** Initial resident data */
  initialData?: any;
  /** Validation options */
  validationOptions?: ResidentValidationOptions;
  /** Submission options */
  submissionOptions?: UseResidentSubmissionOptions;
  /** Form state options */
  formStateOptions?: UseResidentFormStateOptions;
  /** Auto-save enabled */
  autoSave?: boolean;
  /** Auto-save key for storage */
  autoSaveKey?: string;
  /** Form submission handler */
  onSubmit?: (data: any) => Promise<void>;
  /** Success callback */
  onSuccess?: (data: any) => void;
  /** Error callback */
  onError?: (error: any) => void;
}

/**
 * Resident edit workflow hook return interface
 * For the complete resident edit workflow
 */
export interface UseResidentEditWorkflowReturn {
  // Form state
  /** Current form data */
  formData: any;
  /** Whether form has unsaved changes */
  isDirty: boolean;
  /** Update single field */
  updateField: (field: string, value: any) => void;
  /** Update multiple fields */
  updateFields: (fields: Record<string, any>) => void;
  /** Reset form to initial state */
  resetForm: () => void;

  // Validation
  /** Current validation errors */
  errors: Record<string, string>;
  /** Whether form is valid */
  isValid: boolean;
  /** Validate single field */
  validateField: (field: string, value: any) => Promise<any>;
  /** Get error for specific field */
  getFieldError: (field: string) => string | undefined;
  /** Check if field has error */
  hasFieldError: (field: string) => boolean;
  /** Clear error for specific field */
  clearFieldError: (field: string) => void;
  /** Validate entire form */
  validateForm: () => any;

  // Submission
  /** Whether form is being submitted */
  isSubmitting: boolean;
  /** Current submission error */
  submissionError: string | null;
  /** Submit form */
  submitForm: () => Promise<void>;
  /** Validate and submit form */
  validateAndSubmit: () => Promise<void>;
  /** Reset entire workflow */
  resetWorkflow: () => void;
}

/**
 * Connection status hook return interface
 * Consolidates from src/hooks/utilities/useConnectionStatus.ts
 */
export interface UseConnectionStatusReturn {
  /** Whether the user is online */
  isOnline: boolean;
  /** Whether there are pending sync items */
  syncPending: boolean;
  /** Whether sync can be performed (online + pending) */
  canSync: boolean;
}

/**
 * Async error boundary options interface
 * Consolidates from src/hooks/utilities/useAsyncErrorBoundary.ts
 */
export interface AsyncErrorBoundaryOptions {
  /** Callback when error occurs */
  onError?: (error: Error, errorInfo: string) => void;
  /** Enable automatic error recovery */
  enableRecovery?: boolean;
  /** Recovery timeout in milliseconds */
  recoveryTimeout?: number;
  /** Maximum retry attempts */
  maxRetries?: number;
  /** Delay between retries in milliseconds */
  retryDelay?: number;
}

/**
 * Async error boundary hook return interface
 * Consolidates from src/hooks/utilities/useAsyncErrorBoundary.ts
 */
export interface UseAsyncErrorBoundaryReturn {
  /** Current error boundary state */
  errorState: {
    hasError: boolean;
    error: Error | null;
    errorInfo: string | null;
  };
  /** Wrap async operation with error boundary */
  wrapAsync: <T>(asyncFn: () => Promise<T>, context?: string) => () => Promise<T | null>;
  /** Clear error state */
  clearError: () => void;
  /** Retry last failed operation */
  retry: () => Promise<void>;
  /** Check if operation can be retried */
  canRetry: boolean;
  /** Current retry count */
  retryCount: number;
  /** Current error (shorthand for errorState.error) */
  error: Error | null;
  /** Whether currently retrying */
  isRetrying: boolean;
}

/**
 * Address resolution hook return interface
 * Consolidates from src/hooks/utilities/useAddressResolution.ts
 */
export interface UseAddressResolutionReturn {
  /** Resolved address information for display */
  addressDisplayInfo: AddressHierarchyInfo;
  /** Whether address resolution is in progress */
  isLoading: boolean;
  /** Error message if resolution fails */
  error: string | null;
  /** Manually trigger address resolution */
  loadAddressHierarchyInfo: (barangayCode: string) => Promise<void>;
  /** Reset address display info */
  resetAddressInfo: () => void;
}