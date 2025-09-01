/**
 * Utility Hook Types
 *
 * @fileoverview TypeScript interfaces for utility React hooks
 * in the Citizenly RBI system.
 */

// ComponentType import removed - was not being used
import type { FormMode } from '../../app/ui/forms';
import type { AddressHierarchyQueryResult } from '../../infrastructure/database/database';
import type { HookPerformanceMetrics } from '../utilities/performance';
import type { AddressHierarchyInfo } from '../../domain/addresses/addresses';

// =============================================================================
// FORM HOOK TYPES
// =============================================================================

/**
 * Form field state
 */
export interface FormFieldState {
  value: any;
  error: string | null;
  touched: boolean;
  dirty: boolean;
  validating: boolean;
}

/**
 * Form state
 */
export interface FormState<T = Record<string, any>> {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  dirty: Record<keyof T, boolean>;
  validating: boolean;
  submitting: boolean;
  isValid: boolean;
}

/**
 * Form hook options
 */
export interface UseFormOptions<T> {
  initialValues: T;
  validationSchema?: any;
  onSubmit?: (values: T) => Promise<void> | void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

/**
 * Form hook return type
 */
export interface UseFormReturn<T> {
  /** Current form state */
  state: FormState<T>;
  /** Get field props for inputs */
  getFieldProps: (name: keyof T) => {
    value: any;
    onChange: (value: any) => void;
    onBlur: () => void;
    error: string | null;
  };
  /** Set field value */
  setFieldValue: (name: keyof T, value: any) => void;
  /** Set field error */
  setFieldError: (name: keyof T, error: string) => void;
  /** Reset form */
  reset: () => void;
  /** Submit form */
  submit: () => Promise<void>;
  /** Validate form */
  validate: () => Promise<boolean>;
}

// =============================================================================
// SEARCH HOOK TYPES
// =============================================================================

/**
 * Search options
 */
export interface SearchOptions {
  query: string;
  filters?: Record<string, any>;
  sort?: { field: string; direction: 'asc' | 'desc' };
  pagination?: { page: number; limit: number };
  debounceMs?: number;
}

/**
 * Search results
 */
export interface SearchResults<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Search hook return type
 */
export interface UseSearchReturn<T> {
  /** Search results */
  results: SearchResults<T>;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: string | null;
  /** Current search query */
  query: string;
  /** Execute search */
  search: (options: SearchOptions) => Promise<void>;
  /** Clear search */
  clear: () => void;
  /** Load more results */
  loadMore: () => Promise<void>;
}

// =============================================================================
// UTILITY HOOK TYPES
// =============================================================================

/**
 * Local storage hook options
 */
export interface UseLocalStorageOptions<T> {
  defaultValue?: T;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
}

/**
 * Local storage hook return type
 */
export interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  removeValue: () => void;
}

/**
 * Debounce hook options
 */
export interface UseDebounceOptions {
  delay: number;
  leading?: boolean;
  trailing?: boolean;
}

/**
 * API hook configuration
 */
export interface UseApiConfig {
  baseURL?: string;
  headers?: Record<string, string>;
  timeout?: number;
  retry?: {
    attempts: number;
    delay: number;
  };
}

/**
 * Permission check result
 */
export interface PermissionCheckResult {
  hasPermission: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * User barangay data
 */
export interface UserBarangayData {
  barangayCode: string;
  barangayName: string;
  cityMunicipalityName: string;
  provinceName: string;
  regionName: string;
}

/**
 * Generic form hook result
 */
export interface FormHookResult<T> {
  data: T;
  errors: Record<string, string>;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
  reset: () => void;
  submit: () => Promise<void>;
  setValue: (field: keyof T, value: T[keyof T]) => void;
  setError: (field: keyof T, error: string) => void;
  clearError: (field: keyof T) => void;
}

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

/**
 * URL parameter hook result
 */
export interface URLParametersResult {
  [key: string]: string | null;
}

/**
 * Resident form URL parameters result
 */
export interface ResidentFormURLParametersResult {
  suggestedName: string | null;
  suggestedId: string | null;
  isPreFilled: boolean;
}

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