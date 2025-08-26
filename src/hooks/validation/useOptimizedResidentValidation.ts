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

import { REQUIRED_FIELDS } from '@/lib/validation/fieldLevelSchemas';
import type { ResidentFormData } from '@/types';

import {
  useResidentAsyncValidation,
  type UseResidentAsyncValidationReturn,
} from '../utilities/useResidentAsyncValidation';
import {
  useResidentCrossFieldValidation,
  type UseResidentCrossFieldValidationReturn,
} from '../utilities/useResidentCrossFieldValidation';

import {
  useResidentValidationCore,
  type ResidentValidationOptions,
  type UseResidentValidationCoreReturn,
} from './useResidentValidationCore';
import {
  useResidentValidationProgress,
  type UseResidentValidationProgressReturn,
} from './useResidentValidationProgress';

/**
 * Combined return type for the orchestrator hook
 */
export interface UseResidentFormValidationReturn
  extends Omit<UseResidentValidationCoreReturn, 'validateForm'>,
    Omit<UseResidentCrossFieldValidationReturn, 'validateCrossFields'>,
    Omit<UseResidentAsyncValidationReturn, 'validateFieldAsync'>,
    UseResidentValidationProgressReturn {
  /** Enhanced form validation with cross-field rules */
  validateForm: (formData: ResidentFormData) => {
    isValid: boolean;
    errors: Record<string, string>;
  };
  /** Validate field asynchronously */
  validateFieldAsync: (
    fieldName: string,
    value: unknown
  ) => Promise<{ isValid: boolean; error?: string }>;
}

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
    (formData: ResidentFormData) => {
      // Core validation
      const coreResult = coreValidation.validateForm(formData);

      // Cross-field validation
      const crossFieldErrors = crossFieldValidation.validateCrossFields(formData);

      // Combine all errors
      const allErrors = {
        ...coreResult.errors,
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
