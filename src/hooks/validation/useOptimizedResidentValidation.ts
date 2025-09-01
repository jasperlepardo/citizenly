'use client';

/**
 * Optimized Resident Validation Hook (Refactored)
 *
 * @description Lightweight orchestrator that composes multiple specialized validation hooks.
 * This hook has been refactored into smaller, focused components for better maintainability.
 *
 * Architecture:
 * - useResidentValidationCore: Core validation functionality
 * - useResidentCrossFieldValidation: Cross-field validation rules
 * - useResidentAsyncValidation: Async validation operations
 * - useResidentValidationProgress: Progress tracking and summaries
 */

import { useCallback } from 'react';

import { useResidentAsyncValidation } from '@/hooks/utilities/useResidentAsyncValidation';
import { useResidentCrossFieldValidation } from '@/hooks/utilities/useResidentCrossFieldValidation';
import type { 
  ResidentFormData,
  UseResidentFormValidationReturn,
  ResidentValidationOptions,
} from '@/types';

import { useResidentValidationCore } from './useResidentValidationCore';
import { useResidentValidationProgress } from './useResidentValidationProgress';


/**
 * Optimized resident form validation hook (Refactored)
 *
 * @description Orchestrates multiple specialized validation hooks to provide
 * comprehensive resident form validation. Much smaller and more maintainable
 * than the original monolithic implementation.
 *
 * @param options - Validation configuration options
 * @returns Complete validation interface with all enhanced features
 */
export function useOptimizedResidentValidation(
  options: ResidentValidationOptions = {}
): UseResidentFormValidationReturn {
  // Compose specialized validation hooks
  const coreValidation = useResidentValidationCore(options);
  const crossFieldValidation = useResidentCrossFieldValidation();
  const asyncValidation = useResidentAsyncValidation({
    debounceDelay: options.debounceDelay,
    enabled: options.enableAsyncValidation,
  });
  const progressValidation = useResidentValidationProgress();

  /**
   * Enhanced form validation with cross-field rules
   */
  const validateForm = useCallback(
    async (formData: ResidentFormData) => {
      // Core validation
      const coreResult = await coreValidation.validateForm(formData);

      // Cross-field validation
      const crossFieldErrors = crossFieldValidation.validateCrossFields(formData);

      // Convert core validation errors from ValidationError[] to Record<string, string>
      const coreErrors: Record<string, string> = {};
      if (Array.isArray(coreResult.errors)) {
        coreResult.errors.forEach(error => {
          coreErrors[error.field] = error.message;
        });
      }

      // Combine all errors
      const allErrors = {
        ...coreErrors,
        ...crossFieldErrors,
        ...asyncValidation.asyncValidationErrors,
      };

      return {
        isValid: Object.keys(allErrors).length === 0,
        errors: allErrors,
      };
    },
    [coreValidation, crossFieldValidation, asyncValidation.asyncValidationErrors]
  );

  /**
   * Validate field asynchronously
   */
  const validateFieldAsync = useCallback(
    async (fieldName: string, value: unknown) => {
      return asyncValidation.validateFieldAsync(fieldName, value);
    },
    [asyncValidation]
  );

  return {
    // Core validation interface
    ...coreValidation,

    // Enhanced validation methods
    validateForm,
    validateFieldAsync,

    // Cross-field validation
    getCrossFieldDependencies: crossFieldValidation.getCrossFieldDependencies,
    hasCrossFieldDependencies: crossFieldValidation.hasCrossFieldDependencies,

    // Async validation
    isAsyncValidating: asyncValidation.isAsyncValidating,
    asyncValidationErrors: asyncValidation.asyncValidationErrors,
    clearAsyncValidationErrors: asyncValidation.clearAsyncValidationErrors,
    clearAsyncValidationError: asyncValidation.clearAsyncValidationError,

    // Progress tracking
    getValidationSummary: (errors: Record<string, string>) =>
      progressValidation.getValidationSummary(errors),
    getValidationProgress: (errors: Record<string, string>) =>
      progressValidation.getValidationProgress(errors),
    hasCriticalErrors: (errors: Record<string, string>) =>
      progressValidation.hasCriticalErrors(errors),
    getSectionValidationStatus: progressValidation.getSectionValidationStatus,
    getAllSectionStatuses: (errors: Record<string, string>) =>
      progressValidation.getAllSectionStatuses(errors),
    isFieldCritical: progressValidation.isFieldCritical,
    getAllRequiredFields: progressValidation.getAllRequiredFields,
    isFieldRequired: progressValidation.isFieldRequired,
  };
}

// Export types for external use
export type { ResidentValidationOptions };

// Export as useResidentFormValidation for backward compatibility
export { useOptimizedResidentValidation as useResidentFormValidation };

// Export the optimized hook for direct import
export default useOptimizedResidentValidation;
