/**
 * Form Field Logic Library
 *
 * @description Pure business logic for form fields, separated from UI components.
 * Contains field state logic, validation rules, and data transformation utilities.
 */

import type { FormMode } from '../types/forms';

/**
 * Helper function to determine if a field should be readonly
 */
export const isFieldReadOnly = (
  fieldName: string,
  mode: FormMode,
  readOnlyFields: string[] = []
): boolean => {
  return mode === 'view' || readOnlyFields.includes(fieldName);
};

/**
 * Format date for display in readonly mode
 */
export const formatDateForDisplay = (dateValue: string | undefined): string => {
  if (!dateValue) return '';

  try {
    return new Date(dateValue).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateValue; // Fallback to original value if parsing fails
  }
};

/**
 * Format boolean value for display in readonly mode
 */
export const formatBooleanForDisplay = (value: boolean | undefined): string => {
  return value ? 'Yes' : 'No';
};

/**
 * Get the display value for a select option
 */
export const getSelectDisplayValue = (
  value: string | undefined,
  options: Array<{ value: string; label: string }>
): string => {
  if (!value) return '';

  const selectedOption = options.find(opt => opt.value === value);
  return selectedOption?.label || value;
};

/**
 * Common field validation utilities
 */
export const fieldLogic = {
  /**
   * Validate required fields
   */
  validateRequired: (value: any, fieldName: string): string | null => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName} is required`;
    }
    return null;
  },

  /**
   * Validate number ranges
   */
  validateNumberRange: (
    value: number | undefined,
    min?: number,
    max?: number,
    fieldName: string = 'Field'
  ): string | null => {
    if (value === undefined || value === null) return null;

    if (min !== undefined && value < min) {
      return `${fieldName} must be at least ${min}`;
    }

    if (max !== undefined && value > max) {
      return `${fieldName} must be no more than ${max}`;
    }

    return null;
  },

  /**
   * Validate date ranges
   */
  validateDateRange: (
    value: string | undefined,
    min?: string,
    max?: string,
    fieldName: string = 'Date'
  ): string | null => {
    if (!value) return null;

    const dateValue = new Date(value);

    if (min && dateValue < new Date(min)) {
      return `${fieldName} must be after ${formatDateForDisplay(min)}`;
    }

    if (max && dateValue > new Date(max)) {
      return `${fieldName} must be before ${formatDateForDisplay(max)}`;
    }

    return null;
  },
};

/**
 * Field state management utilities
 */
export const fieldState = {
  /**
   * Get common field props based on mode and configuration
   */
  getFieldProps: (fieldName: string, mode: FormMode, readOnlyFields: string[] = []) => ({
    isReadOnly: isFieldReadOnly(fieldName, mode, readOnlyFields),
    isDisabled: mode === 'view',
    isRequired: mode !== 'view', // Usually required in edit/create modes
  }),

  /**
   * Get field validation state
   */
  getValidationState: (value: any, validators: Array<(value: any) => string | null>) => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) {
        return { isValid: false, error };
      }
    }
    return { isValid: true, error: null };
  },
};
