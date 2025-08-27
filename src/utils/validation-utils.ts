/**
 * Validation Utilities
 * Consolidated validation functions aligned with database schema
 */

import type { ValidationError } from '@/types/validation';

/**
 * Check if email is valid
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if Philippine mobile number is valid
 */
export function isValidPhilippineMobile(mobile: string): boolean {
  if (!mobile || typeof mobile !== 'string') {
    return false;
  }

  const cleaned = mobile.replace(/\D/g, '');
  return /^09\d{9}$/.test(cleaned) || /^639\d{9}$/.test(cleaned);
}

/**
 * Check if PhilSys format is valid (aligned with database schema)
 */
export function isValidPhilSysFormat(philsys: string): boolean {
  if (!philsys || typeof philsys !== 'string') {
    return false;
  }

  return /^\d{4}-\d{4}-\d{4}-\d{4}$/.test(philsys);
}

/**
 * Check if name is valid (contains only allowed characters)
 */
export function isValidName(name: string): boolean {
  if (!name || typeof name !== 'string') {
    return false;
  }

  // Allow letters, spaces, hyphens, apostrophes, periods (Filipino names)
  const nameRegex = /^[a-zA-Z\s\-\.']+$/;
  return nameRegex.test(name) && name.trim().length > 0;
}

/**
 * Check if age is valid and reasonable
 */
export function isValidAge(age: number): boolean {
  return typeof age === 'number' && age >= 0 && age <= 150;
}

/**
 * Validate required field
 */
export function validateRequired(value: any, fieldName: string): ValidationError | null {
  if (value === null || value === undefined || value === '') {
    return {
      field: fieldName,
      message: `${fieldName} is required`,
      code: 'REQUIRED'
    };
  }
  return null;
}

/**
 * Validate field length
 */
export function validateLength(
  value: string, 
  fieldName: string, 
  min?: number, 
  max?: number
): ValidationError | null {
  if (!value) return null;

  if (min && value.length < min) {
    return {
      field: fieldName,
      message: `${fieldName} must be at least ${min} characters`,
      code: 'MIN_LENGTH'
    };
  }

  if (max && value.length > max) {
    return {
      field: fieldName,
      message: `${fieldName} must not exceed ${max} characters`,
      code: 'MAX_LENGTH'
    };
  }

  return null;
}

/**
 * Validate numeric range
 */
export function validateRange(
  value: number, 
  fieldName: string, 
  min?: number, 
  max?: number
): ValidationError | null {
  if (value === null || value === undefined) return null;

  if (min !== undefined && value < min) {
    return {
      field: fieldName,
      message: `${fieldName} must be at least ${min}`,
      code: 'MIN_VALUE'
    };
  }

  if (max !== undefined && value > max) {
    return {
      field: fieldName,
      message: `${fieldName} must not exceed ${max}`,
      code: 'MAX_VALUE'
    };
  }

  return null;
}

/**
 * Validate date format and range
 */
export function validateDate(
  dateString: string, 
  fieldName: string
): ValidationError | null {
  if (!dateString) return null;

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return {
      field: fieldName,
      message: `${fieldName} must be a valid date`,
      code: 'INVALID_DATE'
    };
  }

  // Check reasonable date range (1900 to current year + 1)
  const minYear = 1900;
  const maxYear = new Date().getFullYear() + 1;
  const year = date.getFullYear();

  if (year < minYear || year > maxYear) {
    return {
      field: fieldName,
      message: `${fieldName} must be between ${minYear} and ${maxYear}`,
      code: 'DATE_RANGE'
    };
  }

  return null;
}

/**
 * Create validation error
 */
export function createValidationError(
  field: string,
  message: string,
  code?: string
): ValidationError {
  return { field, message, code: code || 'VALIDATION_ERROR' };
}

/**
 * Combine multiple validation results
 */
export function combineValidationResults(...results: (ValidationError | null)[]): ValidationError[] {
  return results.filter((result): result is ValidationError => result !== null);
}