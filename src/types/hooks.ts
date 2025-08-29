/**
 * Hook Types - React Hooks Interface Collection
 *
 * @fileoverview Consolidated TypeScript interfaces for custom React hooks
 * in the Citizenly RBI system. Provides type-safe patterns for state management,
 * data fetching, validation, and form handling hooks.
 *
 * @version 3.0.0
 * @since 2025-01-01
 * @author Citizenly Development Team
 */

import type { ComponentType } from 'react';

import type { FormMode } from './forms';
import type {
  ValidationResult,
  FieldValidationConfig,
  ValidationFunction,
  FieldValidationResult,
} from './validation';

// =============================================================================
// VALIDATION HOOK TYPES
// =============================================================================

/**
 * Generic validation hook options
 */
export interface UseGenericValidationOptions<T> extends FieldValidationConfig {
  validateForm: (data: T) => ValidationResult<T> | Promise<ValidationResult<T>>;
  validateField?: (
    fieldName: string,
    value: any,
    formData?: T
  ) => string | null | FieldValidationResult;
}

/**
 * Generic validation hook return type
 */
export interface UseGenericValidationReturn<T> {
  /** Current validation errors */
  errors: Record<string, string>;
  /** Whether form is currently valid */
  isValid: boolean;
  /** Whether validation has been attempted */
  hasValidated: boolean;
  /** Validate entire form */
  validateForm: (data: T) => Promise<ValidationResult<T>>;
  /** Validate single field */
  validateField: (fieldName: string, value: any) => Promise<ValidationResult>;
  /** Clear validation errors */
  clearErrors: () => void;
  /** Clear specific field error */
  clearFieldError: (fieldName: string) => void;
  /** Set manual validation error */
  setError: (fieldName: string, error: string) => void;
  /** Set field-specific validation error (alias for setError) */
  setFieldError: (fieldName: string, error: string) => void;
  /** Get field-specific validation error */
  getFieldError: (fieldName: string) => string | undefined;
  /** Check if field has error */
  hasFieldError: (fieldName: string) => boolean;
  /** Set multiple errors */
  setErrors: (errors: Record<string, string>) => void;
}

/**
 * Validation progress state
 */
export interface ValidationProgressState {
  totalSteps: number;
  completedSteps: number;
  currentStep: number;
  stepValidation: Record<number, boolean>;
  overallValid: boolean;
}

/**
 * Validation progress hook return type
 */
export interface UseValidationProgressReturn {
  progress: ValidationProgressState;
  updateStepValidation: (step: number, isValid: boolean) => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  resetProgress: () => void;
}

// =============================================================================
// CRUD HOOK TYPES
// =============================================================================

/**
 * Generic CRUD hook options
 */
export interface UseCrudOptions<T> {
  /** Resource name for API endpoints */
  resource: string;
  /** Transform data before API calls */
  transformData?: (data: T) => T;
  /** Validation function */
  validate?: (data: T) => ValidationResult<T>;
  /** Enable optimistic updates */
  optimistic?: boolean;
}

/**
 * Generic CRUD hook return type
 */
export interface UseCrudReturn<T> {
  /** All items */
  items: T[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: string | null;
  /** Create new item */
  create: (data: T) => Promise<T>;
  /** Update existing item */
  update: (id: string, data: Partial<T>) => Promise<T>;
  /** Delete item */
  remove: (id: string) => Promise<void>;
  /** Refresh items */
  refresh: () => Promise<void>;
  /** Clear error */
  clearError: () => void;
}

/**
 * Async operation state
 */
export interface AsyncOperationState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Async operation hook return type
 */
export interface UseAsyncReturn<T, Args extends any[] = any[]> extends AsyncOperationState<T> {
  /** Execute the async operation */
  execute: (...args: Args) => Promise<T>;
  /** Reset the state */
  reset: () => void;
}

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
// WORKFLOW HOOKS
// =============================================================================

/**
 * Workflow state interface
 */
export interface WorkflowState<T = any> {
  currentStep: number;
  totalSteps: number;
  data: T;
  isComplete: boolean;
  canProceed: boolean;
  canGoBack: boolean;
}

/**
 * Workflow hook result
 */
export interface WorkflowHookResult<T = any> {
  state: WorkflowState<T>;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  updateData: (data: Partial<T>) => void;
  reset: () => void;
  complete: () => Promise<void>;
}

// =============================================================================
// COMMAND MENU HOOKS
// =============================================================================

/**
 * Command menu search result
 */
export interface CommandMenuSearchResult<T = any> {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string | React.ComponentType<{ className?: string }>;
  data: T;
  score: number;
  type: 'resident' | 'household' | 'action' | 'navigation';
  disabled?: boolean;
  shortcut?: string[];
  avatar?: string | { src: string; alt: string; fallback?: string };
  label?: string;
  recent?: boolean;
  group?: string;
  description?: string;
  keywords?: string[];
  href?: string;
  onClick?: () => void;
}

/**
 * Command menu hook result
 */
export interface CommandMenuHookResult<T = any> {
  query: string;
  results: CommandMenuSearchResult<T>[];
  isSearching: boolean;
  isOpen: boolean;
  selectedIndex: number;
  setQuery: (query: string) => void;
  open: () => void;
  close: () => void;
  selectNext: () => void;
  selectPrevious: () => void;
  execute: (result?: CommandMenuSearchResult<T>) => void;
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
