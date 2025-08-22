'use client';

/**
 * Resident Edit Workflow Hook
 * 
 * @description Orchestrates the complete resident edit workflow by composing
 * smaller, focused hooks. Replaces the monolithic useResidentEditForm hook.
 */

import { useCallback } from 'react';
import { ResidentEditFormData } from '@/lib/validation/residentSchema';
import { useResidentFormState, UseResidentFormStateOptions } from './useResidentFormState';
import { useResidentValidationErrors } from '../validation/useResidentValidationErrors';
import { useResidentSubmission, UseResidentSubmissionOptions } from '../utilities/useResidentSubmission';

/**
 * Workflow options combining all sub-hook options
 */
export interface UseResidentEditWorkflowOptions 
  extends UseResidentFormStateOptions, 
          UseResidentSubmissionOptions {}

/**
 * Return type for useResidentEditWorkflow hook
 */
export interface UseResidentEditWorkflowReturn {
  // Form state
  formData: ReturnType<typeof useResidentFormState>['formData'];
  isDirty: ReturnType<typeof useResidentFormState>['isDirty'];
  updateField: ReturnType<typeof useResidentFormState>['updateField'];
  updateFields: ReturnType<typeof useResidentFormState>['updateFields'];
  resetForm: ReturnType<typeof useResidentFormState>['resetForm'];
  
  // Validation errors
  errors: ReturnType<typeof useResidentFormValidationErrors>['errors'];
  isValid: ReturnType<typeof useResidentFormValidationErrors>['isValid'];
  validateField: ReturnType<typeof useResidentFormValidationErrors>['validateField'];
  getFieldError: ReturnType<typeof useResidentFormValidationErrors>['getFieldError'];
  hasFieldError: ReturnType<typeof useResidentFormValidationErrors>['hasFieldError'];
  clearFieldError: ReturnType<typeof useResidentFormValidationErrors>['clearFieldError'];
  
  // Submission
  isSubmitting: ReturnType<typeof useResidentFormSubmission>['isSubmitting'];
  submissionError: ReturnType<typeof useResidentFormSubmission>['submissionError'];
  
  // Workflow methods
  validateForm: () => ReturnType<typeof useResidentFormValidationErrors>['validateForm'];
  submitForm: () => Promise<void>;
  resetWorkflow: () => void;
}

/**
 * Custom hook for complete resident edit workflow
 * 
 * @description Orchestrates the entire resident edit process by composing
 * focused hooks for state management, validation, and submission.
 * 
 * @example
 * ```typescript
 * function ResidentEditForm() {
 *   const {
 *     formData,
 *     errors,
 *     isSubmitting,
 *     updateField,
 *     submitForm
 *   } = useResidentEditWorkflow({
 *     initialData: existingResident,
 *     onSubmit: async (data) => {
 *       await updateResident(data);
 *     }
 *   });
 *
 *   return (
 *     <form onSubmit={submitForm}>
 *       <input
 *         value={formData.first_name || ''}
 *         onChange={(e) => updateField('first_name', e.target.value)}
 *       />
 *     </form>
 *   );
 * }
 * ```
 */
export function useResidentEditWorkflow(
  options: UseResidentEditWorkflowOptions = {}
): UseResidentEditWorkflowReturn {
  // Extract options for each hook
  const stateOptions: UseResidentFormStateOptions = {
    initialData: options.initialData,
    autoSave: options.autoSave,
    autoSaveKey: options.autoSaveKey,
  };

  const submissionOptions: UseResidentSubmissionOptions = {
    onSubmit: options.onSubmit,
    onSuccess: options.onSuccess,
    onError: options.onError,
  };

  // Compose focused hooks
  const stateHook = useResidentFormState(stateOptions);
  const validationHook = useResidentValidationErrors();
  const submissionHook = useResidentSubmission(submissionOptions);

  /**
   * Enhanced field update with validation
   */
  const updateField = useCallback(<K extends keyof ResidentEditFormData>(
    field: K,
    value: ResidentEditFormData[K]
  ) => {
    stateHook.updateField(field, value);
    
    // Clear field error when user starts typing
    if (validationHook.hasFieldError(field)) {
      validationHook.clearFieldError(field);
    }
  }, [stateHook, validationHook]);

  /**
   * Enhanced field update with validation for multiple fields
   */
  const updateFields = useCallback((fields: Partial<ResidentEditFormData>) => {
    stateHook.updateFields(fields);
    
    // Clear errors for updated fields
    Object.keys(fields).forEach(field => {
      if (validationHook.hasFieldError(field as keyof ResidentEditFormData)) {
        validationHook.clearFieldError(field as keyof ResidentEditFormData);
      }
    });
  }, [stateHook, validationHook]);

  /**
   * Validate form and return result
   */
  const validateForm = useCallback(() => {
    return validationHook.validateForm(stateHook.formData);
  }, [validationHook, stateHook]);

  /**
   * Submit form with validation
   */
  const submitForm = useCallback(async () => {
    const validationResult = validateForm();
    await submissionHook.submitForm(stateHook.formData, validationResult);
  }, [validateForm, submissionHook, stateHook]);

  /**
   * Reset entire workflow
   */
  const resetWorkflow = useCallback(() => {
    stateHook.resetForm();
    validationHook.clearAllErrors();
    submissionHook.resetSubmissionState();
  }, [stateHook, validationHook, submissionHook]);

  return {
    // Form state
    formData: stateHook.formData,
    isDirty: stateHook.isDirty,
    updateField,
    updateFields,
    resetForm: stateHook.resetForm,
    
    // Validation errors
    errors: validationHook.errors,
    isValid: validationHook.isValid,
    validateField: validationHook.validateField,
    getFieldError: validationHook.getFieldError,
    hasFieldError: validationHook.hasFieldError,
    clearFieldError: validationHook.clearFieldError,
    
    // Submission
    isSubmitting: submissionHook.isSubmitting,
    submissionError: submissionHook.submissionError,
    
    // Workflow methods
    validateForm,
    submitForm,
    resetWorkflow,
  };
}

// Export the workflow hook as the main resident edit hook
export { useResidentEditWorkflow as useResidentEditForm };