'use client';

/**
 * Household Creation Workflow Hook
 * 
 * @description Orchestrates the complete household creation workflow by composing
 * smaller, focused hooks. Replaces the monolithic useHouseholdCreation hook.
 */

import { useCallback } from 'react';
import { logger } from '@/lib/logging/secure-logger';
import { useHouseholdForm } from '../utilities/useHouseholdForm';
import { useHouseholdCodeGeneration } from '../utilities/useHouseholdCodeGeneration';
import { useAddressResolution } from '../utilities/useAddressResolution';
import { useHouseholdCreationOperation } from './useHouseholdCreationOperation';

/**
 * Return type for useHouseholdCreationWorkflow hook
 */
export interface UseHouseholdCreationWorkflowReturn {
  // Form state and handlers
  formData: ReturnType<typeof useHouseholdForm>['formData'];
  errors: ReturnType<typeof useHouseholdForm>['errors'];
  handleInputChange: ReturnType<typeof useHouseholdForm>['handleInputChange'];
  resetForm: ReturnType<typeof useHouseholdForm>['resetForm'];
  
  // Address resolution
  addressDisplayInfo: ReturnType<typeof useAddressResolution>['addressDisplayInfo'];
  addressLoading: ReturnType<typeof useAddressResolution>['isLoading'];
  addressError: ReturnType<typeof useAddressResolution>['error'];
  
  // Creation operation
  isSubmitting: ReturnType<typeof useHouseholdCreationOperation>['isCreating'];
  creationError: ReturnType<typeof useHouseholdCreationOperation>['creationError'];
  
  // Workflow methods
  validateForm: () => boolean;
  createHousehold: () => Promise<string | null>;
  resetWorkflow: () => void;
}

/**
 * Custom hook for complete household creation workflow
 * 
 * @description Orchestrates the entire household creation process by composing
 * focused hooks for form management, code generation, address resolution,
 * and database operations.
 * 
 * @example
 * ```typescript
 * function CreateHouseholdForm() {
 *   const {
 *     formData,
 *     errors,
 *     isSubmitting,
 *     handleInputChange,
 *     createHousehold
 *   } = useHouseholdCreationWorkflow();
 *
 *   const handleSubmit = async () => {
 *     const householdCode = await createHousehold();
 *     if (householdCode) {
 *       router.push(`/households/${householdCode}`);
 *     }
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input
 *         value={formData.house_number}
 *         onChange={(e) => handleInputChange('house_number', e.target.value)}
 *       />
 *     </form>
 *   );
 * }
 * ```
 */
export function useHouseholdCreationWorkflow(): UseHouseholdCreationWorkflowReturn {
  // Compose focused hooks
  const formHook = useHouseholdForm();
  const codeGenerationHook = useHouseholdCodeGeneration();
  const addressHook = useAddressResolution();
  const operationHook = useHouseholdCreationOperation();

  /**
   * Validates the current form state
   */
  const validateForm = useCallback((): boolean => {
    return formHook.validateForm();
  }, [formHook]);

  /**
   * Creates the household following the complete workflow
   * 
   * @description Orchestrates the following steps:
   * 1. Validate form data
   * 2. Generate household code
   * 3. Create household record in database
   * 
   * @returns Promise resolving to household code on success, null on failure
   */
  const createHousehold = useCallback(async (): Promise<string | null> => {
    try {
      logger.debug('Starting household creation workflow', { formData: formHook.formData });

      // Step 1: Validate form
      if (!validateForm()) {
        logger.warn('Form validation failed during household creation');
        return null;
      }

      // Step 2: Generate household code
      const householdCode = await codeGenerationHook.generateHouseholdCode();
      if (!householdCode) {
        formHook.setErrors({ street_id: 'Failed to generate household code. Please try again.' });
        return null;
      }

      // Step 3: Create household record
      const createdCode = await operationHook.createHouseholdRecord(formHook.formData, householdCode);
      if (!createdCode) {
        // Error is already set by the operation hook
        return null;
      }

      logger.info('Household creation workflow completed successfully', { householdCode: createdCode });
      return createdCode;
    } catch (error) {
      logger.error('Household creation workflow failed', { error });
      formHook.setErrors({ 
        street_id: 'An unexpected error occurred. Please try again.' 
      });
      return null;
    }
  }, [formHook, codeGenerationHook, operationHook, validateForm]);

  /**
   * Resets the entire workflow to initial state
   */
  const resetWorkflow = useCallback(() => {
    formHook.resetForm();
    operationHook.resetCreationState();
    addressHook.resetAddressInfo();
  }, [formHook, operationHook, addressHook]);

  return {
    // Form state and handlers
    formData: formHook.formData,
    errors: formHook.errors,
    handleInputChange: formHook.handleInputChange,
    resetForm: formHook.resetForm,
    
    // Address resolution
    addressDisplayInfo: addressHook.addressDisplayInfo,
    addressLoading: addressHook.isLoading,
    addressError: addressHook.error,
    
    // Creation operation
    isSubmitting: operationHook.isCreating,
    creationError: operationHook.creationError,
    
    // Workflow methods
    validateForm,
    createHousehold,
    resetWorkflow,
  };
}

// Export the workflow hook as the main household creation hook
export { useHouseholdCreationWorkflow as useHouseholdCreation };