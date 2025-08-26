'use client';

/**
 * Optimized Household Validation Hook
 * 
 * @description Refactored household validation hook using common utilities.
 * Maintains the same API while using shared validation patterns.
 */

import { useCallback } from 'react';

import { toTitleCase } from '@/lib/utilities/string-utils';
import {
  ValidationResult,
  FieldValidationResult,
} from '@/lib/validation/types';
import { householdService, HouseholdFormData } from '@/services/household.service';

import {
  useGenericValidation,
  UseGenericValidationReturn,
} from './useGenericValidation';

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
export interface UseHouseholdValidationReturn extends Omit<UseGenericValidationReturn<HouseholdFormData>, 'validateForm'> {
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
    
    return {
      isValid: serviceResult.success,
      errors: serviceResult.errors || {},
    };
  };
}

/**
 * Enhanced household field validation function
 */
function createHouseholdFieldValidator() {
  return (fieldName: string, value: any): FieldValidationResult => {
    // Basic field validation rules for household forms
    switch (fieldName) {
      case 'house_number':
        if (validationUtils.isEmpty(value)) {
          return { isValid: false, error: 'House number is required' };
        }
        if (!/^[0-9A-Za-z\-\/\s]+$/.test(value)) {
          return { isValid: false, error: 'House number contains invalid characters' };
        }
        break;

      case 'street_id':
        if (validationUtils.isEmpty(value)) {
          return { isValid: false, error: 'Street is required' };
        }
        break;

      case 'subdivision_id':
        // Optional field, no validation needed
        break;

      default:
        // For unknown fields, just check if required
        if (validationUtils.isEmpty(value)) {
          const formattedFieldName = validationUtils.formatFieldName(fieldName);
          return { isValid: false, error: `${formattedFieldName} is required` };
        }
        break;
    }

    return { isValid: true };
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

  // Use generic validation hook
  const genericValidation = useGenericValidation({
    validateForm: validateFormFn,
    validateField: validateFieldFn,
    autoValidate: false,
  });

  /**
   * Validate household data (backward compatible interface)
   */
  const validateHousehold = useCallback((formData: HouseholdFormData): HouseholdValidationResult => {
    const result = genericValidation.validateForm(formData);
    
    return {
      success: result.isValid,
      errors: result.errors,
    };
  }, [genericValidation.validateForm]);

  /**
   * Set validation errors (backward compatible)
   */
  const setValidationErrors = useCallback((errors: Record<string, string>) => {
    genericValidation.setErrors(errors);
  }, [genericValidation.setErrors]);

  /**
   * Clear validation errors (backward compatible)
   */
  const clearValidationErrors = useCallback(() => {
    genericValidation.clearAllErrors();
  }, [genericValidation.clearAllErrors]);

  return {
    // Generic validation interface
    errors: genericValidation.errors,
    isValid: genericValidation.isValid,
    hasValidated: genericValidation.hasValidated,
    validateField: genericValidation.validateField,
    getFieldError: genericValidation.getFieldError,
    hasFieldError: genericValidation.hasFieldError,
    clearFieldError: genericValidation.clearFieldError,
    clearAllErrors: genericValidation.clearAllErrors,
    setErrors: genericValidation.setErrors,
    setFieldError: genericValidation.setFieldError,

    // Backward compatible interface
    validationErrors: genericValidation.errors,
    validateHousehold,
    setValidationErrors,
    clearValidationErrors,
  };
}

// Export as useHouseholdValidation for backward compatibility
export { useOptimizedHouseholdValidation as useHouseholdValidation };