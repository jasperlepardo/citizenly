'use client';

/**
 * Household Form State Management Hook
 *
 * @description Focused hook for managing household creation form state and validation.
 * Extracted from useHouseholdCreation to follow single responsibility principle.
 */

import { useState, useCallback } from 'react';

/**
 * Form data structure for household creation
 */
export interface HouseholdFormData {
  /** House/building number */
  house_number: string;
  /** Selected street ID */
  street_id: string;
  /** Optional subdivision ID */
  subdivision_id: string;
}

/**
 * Form validation errors
 */
export type HouseholdFormErrors = Partial<Record<keyof HouseholdFormData, string>>;

/**
 * Return type for useHouseholdForm hook
 */
export interface UseHouseholdFormReturn {
  /** Current form data state */
  formData: HouseholdFormData;
  /** Field-specific validation errors */
  errors: HouseholdFormErrors;
  /** Handler for form field changes */
  handleInputChange: (field: keyof HouseholdFormData, value: string) => void;
  /** Validates the current form state */
  validateForm: () => boolean;
  /** Resets form to initial state */
  resetForm: () => void;
  /** Sets form data programmatically */
  setFormData: (data: Partial<HouseholdFormData>) => void;
  /** Sets validation errors */
  setErrors: (errors: HouseholdFormErrors) => void;
}

/**
 * Initial form state
 */
const INITIAL_FORM_DATA: HouseholdFormData = {
  house_number: '',
  street_id: '',
  subdivision_id: '',
};

/**
 * Custom hook for household form state management
 *
 * @description Manages form state, validation, and input handling for household creation.
 * Provides clean separation between form logic and business logic.
 */
export function useHouseholdForm(): UseHouseholdFormReturn {
  const [formData, setFormDataState] = useState<HouseholdFormData>(INITIAL_FORM_DATA);
  const [errors, setErrorsState] = useState<HouseholdFormErrors>({});

  /**
   * Handles form field changes and clears related errors
   */
  const handleInputChange = useCallback(
    (field: keyof HouseholdFormData, value: string) => {
      setFormDataState(prev => ({ ...prev, [field]: value }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrorsState(prev => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  /**
   * Validates the current form state
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: HouseholdFormErrors = {};

    // Required field validation
    if (!formData.street_id.trim()) {
      newErrors.street_id = 'Street is required';
    }

    if (!formData.house_number.trim()) {
      newErrors.house_number = 'House number is required';
    }

    // House number format validation
    if (formData.house_number.trim() && !/^[0-9A-Za-z\-\/\s]+$/.test(formData.house_number)) {
      newErrors.house_number = 'House number contains invalid characters';
    }

    setErrorsState(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  /**
   * Resets form to initial state
   */
  const resetForm = useCallback(() => {
    setFormDataState(INITIAL_FORM_DATA);
    setErrorsState({});
  }, []);

  /**
   * Sets form data programmatically
   */
  const setFormData = useCallback((data: Partial<HouseholdFormData>) => {
    setFormDataState(prev => ({ ...prev, ...data }));
  }, []);

  /**
   * Sets validation errors
   */
  const setErrors = useCallback((errors: HouseholdFormErrors) => {
    setErrorsState(errors);
  }, []);

  return {
    formData,
    errors,
    handleInputChange,
    validateForm,
    resetForm,
    setFormData,
    setErrors,
  };
}
