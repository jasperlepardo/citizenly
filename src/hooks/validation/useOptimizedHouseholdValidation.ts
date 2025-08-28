'use client';

/**
 * Optimized Household Validation Hook
 *
 * @description Refactored household validation hook using common utilities.
 * Maintains the same API while using shared validation patterns.
 */

import { useCallback } from 'react';

import { householdService, HouseholdFormData } from '@/services/household.service';
import type { UseGenericValidationReturn } from '@/types/hooks';
import { ValidationResult, FieldValidationResult } from '@/types/validation';
import { toTitleCase } from '@/utils/string-utils';

import { useGenericValidation } from './useGenericValidation';


// Simple validation utilities for backward compatibility
const validationUtils = {
  isEmpty: (value: any): boolean => {
    return value === null || value === undefined || value === '';
  },
  formatFieldName: (fieldName: string): string => {
    const formatted = fieldName.replace(/([A-Z])/g, ' $1').trim();
    return toTitleCase(formatted);
  },
};

/**
 * Household validation result (backward compatible)
 */
export interface HouseholdValidationResult {
  success: boolean;
  errors?: Record<string, string>;
}

/**
 * Household validation return type (backward compatible)
 */
export interface UseHouseholdValidationReturn
  extends UseGenericValidationReturn<HouseholdFormData> {
  /** Current validation errors */
  validationErrors: Record<string, string>;
  /** Validate household data */
  validateHousehold: (formData: HouseholdFormData) => HouseholdValidationResult;
  /** Set validation errors programmatically */
  setValidationErrors: (errors: Record<string, string>) => void;
  /** Clear all validation errors */
  clearValidationErrors: () => void;
}

/**
 * Enhanced household form validation function
 */
function createHouseholdFormValidator() {
  return (formData: HouseholdFormData): ValidationResult => {
    // Use the service validation but normalize the result
    const serviceResult = householdService.validateHousehold(formData);

    // Convert Record<string, string> to ValidationError[] format
    const errors = serviceResult.errors || {};
    const validationErrors = Object.entries(errors).map(([field, message]) => ({
      field,
      message,
      code: 'VALIDATION_ERROR'
    }));

    return {
      isValid: serviceResult.success,
      errors: validationErrors,
    };
  };
}

/**
 * Enhanced household field validation function
 */
function createHouseholdFieldValidator() {
  return (fieldName: string, value: any): ValidationResult => {
    // Basic field validation rules for household forms
    let fieldResult: FieldValidationResult;
    
    switch (fieldName) {
      case 'house_number':
        if (validationUtils.isEmpty(value)) {
          fieldResult = { isValid: false, error: 'House number is required' };
        } else if (!/^[0-9A-Za-z\-\/\s]+$/.test(value)) {
          fieldResult = { isValid: false, error: 'House number contains invalid characters' };
        } else {
          fieldResult = { isValid: true };
        }
        break;

      case 'street_id':
        if (validationUtils.isEmpty(value)) {
          fieldResult = { isValid: false, error: 'Street is required' };
        } else {
          fieldResult = { isValid: true };
        }
        break;

      case 'subdivision_id':
        // Optional field, no validation needed
        fieldResult = { isValid: true };
        break;

      default:
        // For unknown fields, just check if required
        if (validationUtils.isEmpty(value)) {
          const formattedFieldName = validationUtils.formatFieldName(fieldName);
          fieldResult = { isValid: false, error: `${formattedFieldName} is required` };
        } else {
          fieldResult = { isValid: true };
        }
        break;
    }

    // Convert FieldValidationResult to ValidationResult
    const errors = fieldResult.error ? [{
      field: fieldName,
      message: fieldResult.error,
      code: 'VALIDATION_ERROR'
    }] : [];

    return {
      isValid: fieldResult.isValid,
      errors,
    };
  };
}

/**
 * Optimized household validation hook
 *
 * @description Provides household validation using shared utilities while
 * maintaining backward compatibility with existing household service integration.
 */
export function useOptimizedHouseholdValidation(): UseHouseholdValidationReturn {
  // Create validation functions
  const validateFormFn = createHouseholdFormValidator();
  const validateFieldFn = createHouseholdFieldValidator();

  // Use generic validation hook (with proper typing)
  const genericValidationImpl = useGenericValidation({
    validateForm: validateFormFn,
    validateField: validateFieldFn,
  });

  // Type assertion to access the actual implementation methods
  const genericValidation = genericValidationImpl as any;

  /**
   * Validate household data (backward compatible interface)
   */
  const validateHousehold = useCallback(
    (formData: HouseholdFormData): HouseholdValidationResult => {
      // Call the sync validator directly for backward compatibility
      const result = validateFormFn(formData);

      // Convert ValidationError[] back to Record<string, string> format
      const errors: Record<string, string> = {};
      result.errors.forEach(error => {
        errors[error.field] = error.message;
      });

      return {
        success: result.isValid,
        errors,
      };
    },
    [validateFormFn]
  );

  /**
   * Set validation errors (backward compatible)
   */
  const setValidationErrors = useCallback(
    (errors: Record<string, string>) => {
      genericValidation.setErrors(errors);
    },
    [genericValidation.setErrors]
  );

  /**
   * Clear validation errors (backward compatible)
   */
  const clearValidationErrors = useCallback(() => {
    genericValidation.clearAllErrors();
  }, [genericValidation.clearAllErrors]);

  // Create interface-compliant wrapper functions
  const clearErrors = useCallback(() => {
    genericValidation.clearAllErrors();
  }, [genericValidation.clearAllErrors]);

  const setError = useCallback((fieldName: string, error: string) => {
    genericValidation.setFieldError(fieldName, error);
  }, [genericValidation.setFieldError]);

  return {
    // Generic validation interface (matching UseGenericValidationReturn)
    errors: genericValidationImpl.errors,
    isValid: genericValidationImpl.isValid,
    hasValidated: genericValidationImpl.hasValidated || false,
    validateForm: genericValidationImpl.validateForm,
    validateField: genericValidationImpl.validateField || (() => Promise.resolve({ isValid: true, errors: [] })),
    clearErrors,
    clearFieldError: genericValidationImpl.clearFieldError,
    setError,
    setFieldError: genericValidationImpl.setFieldError,
    getFieldError: genericValidationImpl.getFieldError,
    hasFieldError: genericValidationImpl.hasFieldError || ((fieldName: string) => !!genericValidationImpl.errors[fieldName]),
    setErrors: genericValidationImpl.setErrors || setValidationErrors,

    // Backward compatible interface
    validationErrors: genericValidationImpl.errors,
    validateHousehold,
    setValidationErrors,
    clearValidationErrors,
  };
}

// Export as useHouseholdValidation for backward compatibility
export { useOptimizedHouseholdValidation as useHouseholdValidation };
