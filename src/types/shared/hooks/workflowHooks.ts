/**
 * Workflow Hook Types
 *
 * @fileoverview TypeScript interfaces for workflow and form state React hooks
 * in the Citizenly RBI system.
 */


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

/**
 * Resident form state hook options
 * Consolidates from src/hooks/workflows/useResidentFormState.ts
 */
export interface UseResidentFormStateOptions<T = any> {
  initialData?: Partial<T>;
  autoSave?: boolean;
  autoSaveKey?: string;
}

/**
 * Resident form state hook return type
 * Consolidates from src/hooks/workflows/useResidentFormState.ts
 */
export interface UseResidentFormStateReturn<T = any> {
  /** Current form data */
  formData: Partial<T>;
  /** Whether form has unsaved changes */
  isDirty: boolean;
  /** Update a single field */
  updateField: (field: string, value: any) => void;
  /** Update multiple fields at once */
  updateFields: (fields: Record<string, any>) => void;
  /** Reset form to initial state */
  resetForm: () => void;
  /** Set form data programmatically */
  setFormData: (data: Record<string, any>) => void;
  /** Clear auto-saved data */
  clearAutoSave: () => void;
}

/**
 * Resident submission hook options
 * Consolidates from src/hooks/utilities/useResidentSubmission.ts
 */
export interface UseResidentSubmissionOptions {
  onSubmit?: (data: any) => Promise<void>;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Resident submission hook return type
 * Consolidates from src/hooks/utilities/useResidentSubmission.ts
 */
export interface UseResidentSubmissionReturn {
  /** Whether submission is in progress */
  isSubmitting: boolean;
  /** Last submission error */
  submissionError: string | null;
  /** Submit form data */
  submitForm: (formData: any, validationResult: any) => Promise<void>;
  /** Reset submission state */
  resetSubmissionState: () => void;
}

/**
 * Resident edit workflow options
 * Consolidates from src/hooks/workflows/useResidentEditWorkflow.ts
 */
export interface UseResidentEditWorkflowOptions
  extends UseResidentFormStateOptions,
    UseResidentSubmissionOptions {}

/**
 * Resident edit workflow return type
 * Consolidates from src/hooks/workflows/useResidentEditWorkflow.ts
 */
export interface UseResidentEditWorkflowReturn {
  // Form state
  formData: any;
  isDirty: boolean;
  updateField: (field: string, value: any) => void;
  updateFields: (fields: Record<string, any>) => void;
  resetForm: () => void;

  // Validation errors
  errors: Record<string, string>;
  isValid: boolean;
  validateField: (field: string, value: any) => void;
  getFieldError: (field: string) => string | undefined;
  hasFieldError: (field: string) => boolean;
  clearFieldError: (field: string) => void;

  // Submission
  isSubmitting: boolean;
  submissionError: string | null;

  // Workflow methods
  validateForm: (formData: any) => any;
  submitForm: () => Promise<void>;
  resetWorkflow: () => void;
}

/**
 * Household creation result
 * Consolidates from src/hooks/workflows/useHouseholdCreationService.ts
 */
export interface HouseholdCreationResult {
  success: boolean;
  data?: any;
  error?: string;
  validationErrors?: Record<string, string>;
}

/**
 * Household creation service options
 * Consolidates from src/hooks/workflows/useHouseholdCreationService.ts
 */
export interface UseHouseholdCreationServiceOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  onValidationError?: (errors: Record<string, string>) => void;
}

/**
 * Household creation service return type
 * Consolidates from src/hooks/workflows/useHouseholdCreationService.ts
 */
export interface UseHouseholdCreationServiceReturn {
  /** Whether creation is in progress */
  isCreating: boolean;
  /** Create household using service */
  createHousehold: (formData: any) => Promise<HouseholdCreationResult>;
  /** Generate household code */
  generateHouseholdCode: () => string;
  /** Reset creation state */
  resetCreationState: () => void;
}

/**
 * Household operations workflow options
 * Consolidates from src/hooks/workflows/useHouseholdOperationsWorkflow.ts
 */
export interface UseHouseholdOperationsWorkflowOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  onValidationError?: (errors: any) => void;
}

/**
 * Household operations workflow return type
 * Consolidates from src/hooks/workflows/useHouseholdOperationsWorkflow.ts
 */
export interface UseHouseholdOperationsWorkflowReturn {
  // CRUD operations
  getHousehold: (id: string) => Promise<any>;
  listHouseholds: (params?: any) => Promise<any>;
  updateHousehold: (id: string, updates: any) => Promise<any>;
  deleteHousehold: (id: string) => Promise<any>;

  // Creation operations
  createHousehold: (formData: any) => Promise<any>;

  // Validation
  validateHousehold: (data: any) => any;
  validationErrors: Record<string, string>;
  getFieldError: (field: string) => string | undefined;
  hasFieldError: (field: string) => boolean;
  clearFieldError: (field: string) => void;
  clearValidationErrors: () => void;

  // State
  isSubmitting: boolean;
  isValid: boolean;
}