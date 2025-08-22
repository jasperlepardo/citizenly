'use client';

/**
 * Resident Validation Errors Hook
 * 
 * @description Focused hook for managing validation errors and field-level validation.
 * Extracted from useResidentEditForm to follow single responsibility principle.
 */

import { useState, useCallback } from 'react';
import { ResidentEditFormData, validateResidentForm, ValidationResult } from '@/lib/validation/residentSchema';

/**
 * Return type for useResidentValidationErrors hook
 */
export interface UseResidentValidationErrorsReturn {
  /** Current validation errors */
  errors: Record<string, string>;
  /** Whether form is currently valid */
  isValid: boolean;
  /** Validate a single field */
  validateField: (field: keyof ResidentEditFormData, value: any) => void;
  /** Validate entire form */
  validateForm: (formData: Partial<ResidentEditFormData>) => ValidationResult;
  /** Get error for specific field */
  getFieldError: (field: keyof ResidentEditFormData) => string | undefined;
  /** Check if field has error */
  hasFieldError: (field: keyof ResidentEditFormData) => boolean;
  /** Clear error for specific field */
  clearFieldError: (field: keyof ResidentEditFormData) => void;
  /** Clear all errors */
  clearAllErrors: () => void;
  /** Set errors programmatically */
  setErrors: (errors: Record<string, string>) => void;
}

/**
 * Custom hook for resident validation error management
 * 
 * @description Manages validation errors, provides field-level validation,
 * and maintains form validity state.
 */
export function useResidentValidationErrors(): UseResidentValidationErrorsReturn {
  const [errors, setErrorsState] = useState<Record<string, string>>({});

  /**
   * Check if form is valid (no errors)
   */
  const isValid = Object.keys(errors).length === 0;

  /**
   * Validate a single field
   */
  const validateField = useCallback((field: keyof ResidentEditFormData, value: any) => {
    try {
      // Create a partial form data object for validation
      const testData = { [field]: value };
      const result = validateResidentForm(testData);
      
      if (result.success) {
        // Clear error if validation passes
        setErrorsState(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      } else {
        // Set error if validation fails
        const fieldError = result.errors[field];
        if (fieldError) {
          setErrorsState(prev => ({
            ...prev,
            [field]: fieldError
          }));
        }
      }
    } catch (error) {
      // Validation error handled silently
    }
  }, []);

  /**
   * Validate entire form
   */
  const validateForm = useCallback((formData: Partial<ResidentEditFormData>): ValidationResult => {
    const result = validateResidentForm(formData);
    
    if (!result.success) {
      setErrorsState(result.errors);
    } else {
      setErrorsState({});
    }
    
    return result;
  }, []);

  /**
   * Get error for specific field
   */
  const getFieldError = useCallback((field: keyof ResidentEditFormData): string | undefined => {
    return errors[field];
  }, [errors]);

  /**
   * Check if field has error
   */
  const hasFieldError = useCallback((field: keyof ResidentEditFormData): boolean => {
    return Boolean(errors[field]);
  }, [errors]);

  /**
   * Clear error for specific field
   */
  const clearFieldError = useCallback((field: keyof ResidentEditFormData) => {
    setErrorsState(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  /**
   * Clear all errors
   */
  const clearAllErrors = useCallback(() => {
    setErrorsState({});
  }, []);

  /**
   * Set errors programmatically
   */
  const setErrors = useCallback((newErrors: Record<string, string>) => {
    setErrorsState(newErrors);
  }, []);

  return {
    errors,
    isValid,
    validateField,
    validateForm,
    getFieldError,
    hasFieldError,
    clearFieldError,
    clearAllErrors,
    setErrors,
  };
}