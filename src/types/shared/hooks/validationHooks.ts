/**
 * Validation Hook Types
 *
 * @fileoverview TypeScript interfaces for validation-related React hooks
 * in the Citizenly RBI system.
 */

import type {
  ValidationResult,
  FieldValidationConfig,
  FieldValidationResult,
} from '../validation/validation';

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

/**
 * Household validation result
 * Consolidates from src/hooks/validation/useOptimizedHouseholdValidation.ts
 */
export interface HouseholdValidationResult {
  success: boolean;
  errors?: Record<string, string>;
}

/**
 * Household validation return type
 * Consolidates from src/hooks/validation/useOptimizedHouseholdValidation.ts
 */
export interface UseHouseholdValidationReturn {
  /** Current validation errors */
  errors: Record<string, string>;
  /** Whether form is currently valid */
  isValid: boolean;
  /** Whether validation has been attempted */
  hasValidated: boolean;
  /** Validate entire form */
  validateForm: (data: any) => Promise<ValidationResult<any>>;
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
  getFieldError: (field: string) => string | undefined;
  /** Check if field has error */
  hasFieldError: (field: string) => boolean;
  /** Set multiple errors */
  setErrors: (errors: Record<string, string>) => void;
  /** Current validation errors (legacy alias) */
  validationErrors: Record<string, string>;
  /** Validate household data */
  validateHousehold: (formData: any) => HouseholdValidationResult;
  /** Set validation errors programmatically */
  setValidationErrors: (errors: Record<string, string>) => void;
  /** Clear all validation errors */
  clearValidationErrors: () => void;
}

/**
 * Validation summary
 * Consolidates from src/hooks/validation/useResidentValidationProgress.ts
 */
export interface ValidationSummary {
  totalErrors: number;
  criticalErrors: number;
  warnings: number;
  totalFields: number;
  validFields: number;
  progressPercentage: number;
}

/**
 * Section validation status
 * Consolidates from src/hooks/validation/useResidentValidationProgress.ts
 */
export interface SectionValidationStatus {
  section: string;
  isValid: boolean;
  errorCount: number;
  totalFields: number;
  progressPercentage: number;
}

/**
 * Resident validation progress return type
 * Consolidates from src/hooks/validation/useResidentValidationProgress.ts
 */
export interface UseResidentValidationProgressReturn {
  /** Get comprehensive validation summary */
  getValidationSummary: (errors: Record<string, string>) => ValidationSummary;
  /** Get validation progress percentage */
  getValidationProgress: (errors: Record<string, string>) => number;
  /** Check if form has critical errors */
  hasCriticalErrors: (errors: Record<string, string>) => boolean;
  /** Get section validation status */
  getSectionValidationStatus: (
    section: any,
    errors: Record<string, string>
  ) => SectionValidationStatus;
  /** Get all section validation statuses */
  getAllSectionStatuses: (errors: Record<string, string>) => SectionValidationStatus[];
  /** Check if field is critical */
  isFieldCritical: (fieldName: string) => boolean;
  /** Get all required fields */
  getAllRequiredFields: () => string[];
  /** Check if field is required */
  isFieldRequired: (fieldName: string) => boolean;
}

/**
 * Resident validation errors hook return type
 * Consolidates from src/hooks/validation/useResidentValidationErrors.ts
 */
export interface UseResidentValidationErrorsReturn {
  /** Current validation errors */
  errors: Record<string, string>;
  /** Whether form is currently valid */
  isValid: boolean;
  /** Validate a single field */
  validateField: (field: string, value: any) => void;
  /** Validate entire form */
  validateForm: (formData: any) => any;
  /** Get error for specific field */
  getFieldError: (field: string) => string | undefined;
  /** Check if field has error */
  hasFieldError: (field: string) => boolean;
  /** Clear error for specific field */
  clearFieldError: (field: string) => void;
  /** Clear all errors */
  clearAllErrors: () => void;
  /** Set errors programmatically */
  setErrors: (errors: Record<string, string>) => void;
}

/**
 * Resident validation options
 * Consolidates from src/hooks/validation/useResidentValidationCore.ts
 */
export interface ResidentValidationOptions {
  /** Enable real-time validation with debouncing */
  enableRealTimeValidation?: boolean;
  /** Custom debounce delay in milliseconds */
  debounceDelay?: number;
  /** Enable async validation for specific fields */
  enableAsyncValidation?: boolean;
  /** Custom error messages */
  customErrorMessages?: Record<string, string>;
}

/**
 * Resident validation core return type
 * Consolidates from src/hooks/validation/useResidentValidationCore.ts
 */
export interface UseResidentValidationCoreReturn {
  /** Current validation errors */
  errors: Record<string, string>;
  /** Whether form is currently valid */
  isValid: boolean;
  /** Whether validation has been attempted */
  hasValidated: boolean;
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
  /** Validate entire form */
  validateForm: (formData: any) => Promise<ValidationResult<any>>;
  /** Validate specific field */
  validateField: (fieldName: string, value: unknown) => any;
  /** Check if field should be validated */
  shouldValidateField: (fieldName: string) => boolean;
  /** Validate form section */
  validateSectionFields: (formData: any, section: any) => ValidationResult;
  /** Get required fields for section */
  getRequiredFieldsForSection: (section: any) => string[];
  /** Validate field with debouncing */
  validateFieldDebounced: (fieldName: string, value: unknown) => void;
  /** Get formatted error message for field */
  getFormattedFieldError: (fieldName: string) => string | undefined;
  /** Batch validate multiple fields */
  batchValidateFields: (fields: Record<string, unknown>) => Record<string, string>;
  /** Clear validation for specific section */
  clearSectionErrors: (section: any) => void;
  /** Check if section is valid */
  isSectionValid: (section: any) => boolean;
  /** Validation state */
  isValidating: boolean;
}

/**
 * Resident form validation return type (orchestrator)
 * Consolidates from src/hooks/validation/useOptimizedResidentValidation.ts
 */
export interface UseResidentFormValidationReturn {
  /** Current validation errors */
  errors: Record<string, string>;
  /** Whether form is currently valid */
  isValid: boolean;
  /** Whether validation has been attempted */
  hasValidated: boolean;
  /** Set field-specific validation error */
  setFieldError: (fieldName: string, error: string) => void;
  /** Clear specific field error */
  clearFieldError: (fieldName: string) => void;
  /** Get field-specific validation error */
  getFieldError: (fieldName: string) => string | undefined;
  /** Clear all validation errors */
  clearErrors: () => void;
  /** Set multiple errors */
  setErrors: (errors: Record<string, string>) => void;
  /** Check if field has error */
  hasFieldError: (fieldName: string) => boolean;
  /** Enhanced form validation with cross-field rules */
  validateForm: (formData: any) => Promise<{
    isValid: boolean;
    errors: Record<string, string>;
  }>;
  /** Validate field asynchronously */
  validateFieldAsync: (
    fieldName: string,
    value: unknown
  ) => Promise<{ isValid: boolean; error?: string }>;
  /** Get cross-field dependencies for a field */
  getCrossFieldDependencies: (fieldName: string) => string[];
  /** Check if field has cross-field dependencies */
  hasCrossFieldDependencies: (fieldName: string) => boolean;
  /** Whether async validation is in progress */
  isAsyncValidating: boolean;
  /** Async validation errors */
  asyncValidationErrors: Record<string, string>;
  /** Clear all async validation errors */
  clearAsyncValidationErrors: () => void;
  /** Clear async validation error for specific field */
  clearAsyncValidationError: (fieldName: string) => void;
  /** Get comprehensive validation summary */
  getValidationSummary: (errors: Record<string, string>) => ValidationSummary;
  /** Get validation progress percentage */
  getValidationProgress: (errors: Record<string, string>) => number;
  /** Check if form has critical errors */
  hasCriticalErrors: (errors: Record<string, string>) => boolean;
  /** Get section validation status */
  getSectionValidationStatus: (
    section: any,
    errors: Record<string, string>
  ) => SectionValidationStatus;
  /** Get all section validation statuses */
  getAllSectionStatuses: (errors: Record<string, string>) => SectionValidationStatus[];
  /** Check if field is critical */
  isFieldCritical: (fieldName: string) => boolean;
  /** Get all required fields */
  getAllRequiredFields: () => string[];
  /** Check if field is required */
  isFieldRequired: (fieldName: string) => boolean;
}