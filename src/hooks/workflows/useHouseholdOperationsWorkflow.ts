'use client';

/**
 * Household Operations Workflow Hook
 *
 * @description Orchestrates household operations by composing smaller, focused hooks.
 * Replaces the monolithic useHouseholdOperations hook.
 */

import { useCallback } from 'react';

import { HouseholdFormData } from '@/services/household.service';

import { useHouseholdCrud, UseHouseholdCrudOptions } from '../crud/useHouseholdCrud';
import { useHouseholdValidation } from '../validation/useOptimizedHouseholdValidation';

import {
  useHouseholdCreationService,
  UseHouseholdCreationServiceOptions,
} from './useHouseholdCreationService';

/**
 * Workflow options combining all sub-hook options
 */
export interface UseHouseholdOperationsWorkflowOptions
  extends UseHouseholdCrudOptions,
    UseHouseholdCreationServiceOptions {}

/**
 * Return type for useHouseholdOperationsWorkflow hook
 */
export interface UseHouseholdOperationsWorkflowReturn {
  // CRUD operations
  getHousehold: ReturnType<typeof useHouseholdCrud>['getHousehold'];
  getHouseholdByCode: ReturnType<typeof useHouseholdCrud>['getHouseholdByCode'];
  listHouseholds: ReturnType<typeof useHouseholdCrud>['listHouseholds'];
  updateHousehold: ReturnType<typeof useHouseholdCrud>['updateHousehold'];
  deleteHousehold: ReturnType<typeof useHouseholdCrud>['deleteHousehold'];

  // Creation operations
  createHousehold: ReturnType<typeof useHouseholdCreationService>['createHousehold'];
  generateHouseholdCode: ReturnType<typeof useHouseholdCreationService>['generateHouseholdCode'];

  // Validation
  validateHousehold: ReturnType<typeof useHouseholdValidation>['validateHousehold'];
  validationErrors: ReturnType<typeof useHouseholdValidation>['validationErrors'];
  getFieldError: ReturnType<typeof useHouseholdValidation>['getFieldError'];
  hasFieldError: ReturnType<typeof useHouseholdValidation>['hasFieldError'];
  clearFieldError: ReturnType<typeof useHouseholdValidation>['clearFieldError'];
  clearValidationErrors: ReturnType<typeof useHouseholdValidation>['clearValidationErrors'];

  // State
  isSubmitting: boolean;
  isValid: ReturnType<typeof useHouseholdValidation>['isValid'];
}

/**
 * Custom hook for complete household operations workflow
 *
 * @description Orchestrates household operations by composing focused hooks
 * for CRUD operations, validation, and creation services.
 *
 * @example
 * ```typescript
 * function HouseholdManagement() {
 *   const {
 *     createHousehold,
 *     validateHousehold,
 *     validationErrors,
 *     isSubmitting
 *   } = useHouseholdOperationsWorkflow({
 *     onSuccess: (data) => console.log('Success:', data),
 *     onError: (error) => console.error('Error:', error)
 *   });
 *
 *   return (
 *     <div>
 *       // Household management UI
 *     </div>
 *   );
 * }
 * ```
 */
export function useHouseholdOperationsWorkflow(
  options: UseHouseholdOperationsWorkflowOptions = {}
): UseHouseholdOperationsWorkflowReturn {
  // Extract options for each hook
  const crudOptions: UseHouseholdCrudOptions = {
    onSuccess: options.onSuccess,
    onError: options.onError,
  };

  const creationOptions: UseHouseholdCreationServiceOptions = {
    onSuccess: options.onSuccess,
    onError: options.onError,
    onValidationError: options.onValidationError,
  };

  // Compose focused hooks
  const crudHook = useHouseholdCrud(crudOptions);
  const validationHook = useHouseholdValidation();
  const creationHook = useHouseholdCreationService(creationOptions);

  /**
   * Enhanced createHousehold with validation integration
   */
  const createHousehold = useCallback(
    async (formData: HouseholdFormData) => {
      // Clear previous validation errors
      validationHook.clearValidationErrors();

      // Validate before creation
      const validationResult = validationHook.validateHousehold(formData);

      if (!validationResult.success) {
        return {
          success: false,
          error: 'Validation failed',
          validationErrors: validationResult.errors,
        };
      }

      // Proceed with creation
      const result = await creationHook.createHousehold(formData);

      // Set validation errors if any
      if (result.validationErrors) {
        validationHook.setValidationErrors(result.validationErrors);
      }

      return result;
    },
    [validationHook, creationHook]
  );

  /**
   * Enhanced updateHousehold with validation
   */
  const updateHousehold = useCallback(
    async (id: string, updates: Partial<HouseholdFormData>) => {
      // Clear previous validation errors
      validationHook.clearValidationErrors();

      // Note: Partial validation might be needed here depending on requirements

      return crudHook.updateHousehold(id, updates);
    },
    [validationHook, crudHook]
  );

  // Determine if any operation is submitting
  const isSubmitting = crudHook.isLoading || creationHook.isCreating;

  return {
    // CRUD operations
    getHousehold: crudHook.getHousehold,
    getHouseholdByCode: crudHook.getHouseholdByCode,
    listHouseholds: crudHook.listHouseholds,
    updateHousehold,
    deleteHousehold: crudHook.deleteHousehold,

    // Creation operations
    createHousehold,
    generateHouseholdCode: creationHook.generateHouseholdCode,

    // Validation
    validateHousehold: validationHook.validateHousehold,
    validationErrors: validationHook.validationErrors,
    getFieldError: validationHook.getFieldError,
    hasFieldError: validationHook.hasFieldError,
    clearFieldError: validationHook.clearFieldError,
    clearValidationErrors: validationHook.clearValidationErrors,

    // State
    isSubmitting,
    isValid: validationHook.isValid,
  };
}

// Export the workflow hook as the main household operations hook
export { useHouseholdOperationsWorkflow as useHouseholdOperations };

// Export the workflow hook for direct import
export default useHouseholdOperationsWorkflow;
