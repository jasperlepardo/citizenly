/**
 * Validation Utilities
 * Helper functions for validation operations
 */

import type { ValidationResult, FieldValidationResult, ValidationError } from './types';
import { debounce } from '../utilities/asyncUtils';

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
 * Check if PhilSys format is valid
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
  
  return /^[a-zA-Z\s\-'\.]*$/.test(name) && name.trim().length > 0;
}

/**
 * Check if age is valid
 */
export function isValidAge(age: number): boolean {
  return typeof age === 'number' && Number.isInteger(age) && age >= 0 && age <= 150;
}

/**
 * Format validation error for display
 */
export function formatValidationError(error: ValidationError): string {
  const field = error.field.replace(/([A-Z])/g, ' $1').toLowerCase();
  return `${field}: ${error.message}`;
}

/**
 * Create a validation result object
 */
export function createValidationResult(
  isValid: boolean,
  errors: Record<string, string> = {},
  warnings: Record<string, string> = {},
  data?: any
): ValidationResult {
  return {
    isValid,
    errors,
    warnings,
    data,
  };
}

/**
 * Create a field validation result object
 */
export function createFieldValidationResult(
  isValid: boolean,
  error?: string,
  warning?: string,
  sanitizedValue?: any
): FieldValidationResult {
  return {
    isValid,
    error,
    warning,
    sanitizedValue,
  };
}

/**
 * Merge multiple validation results
 */
export function mergeValidationResults(...results: ValidationResult[]): ValidationResult {
  const mergedErrors: Record<string, string> = {};
  const mergedWarnings: Record<string, string> = {};
  let mergedData: any = {};

  for (const result of results) {
    Object.assign(mergedErrors, result.errors);
    if (result.warnings) {
      Object.assign(mergedWarnings, result.warnings);
    }
    if (result.data) {
      mergedData = { ...mergedData, ...result.data };
    }
  }

  return createValidationResult(
    Object.keys(mergedErrors).length === 0,
    mergedErrors,
    Object.keys(mergedWarnings).length > 0 ? mergedWarnings : undefined,
    mergedData
  );
}

/**
 * Extract field names from validation errors
 */
export function getErrorFields(validationResult: ValidationResult): string[] {
  return Object.keys(validationResult.errors);
}

/**
 * Check if validation result has specific field error
 */
export function hasFieldError(validationResult: ValidationResult, fieldName: string): boolean {
  return fieldName in validationResult.errors;
}

/**
 * Get error message for specific field
 */
export function getFieldError(validationResult: ValidationResult, fieldName: string): string | undefined {
  return validationResult.errors[fieldName];
}

/**
 * Check if validation result has warnings
 */
export function hasWarnings(validationResult: ValidationResult): boolean {
  return Boolean(validationResult.warnings && Object.keys(validationResult.warnings).length > 0);
}

/**
 * Convert validation result to error array
 */
export function validationResultToErrors(validationResult: ValidationResult): ValidationError[] {
  return Object.entries(validationResult.errors).map(([field, message]) => ({
    field,
    message,
    code: 'VALIDATION_ERROR',
  }));
}

/**
 * Filter out empty validation errors
 */
export function filterEmptyErrors(errors: Record<string, string>): Record<string, string> {
  const filtered: Record<string, string> = {};
  
  for (const [field, message] of Object.entries(errors)) {
    if (message && message.trim()) {
      filtered[field] = message;
    }
  }
  
  return filtered;
}

/**
 * Normalize field name for display
 */
export function normalizeFieldName(fieldName: string): string {
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Create validation summary
 */
export function createValidationSummary(validationResult: ValidationResult): {
  isValid: boolean;
  errorCount: number;
  warningCount: number;
  summary: string;
} {
  const errorCount = Object.keys(validationResult.errors).length;
  const warningCount = validationResult.warnings ? Object.keys(validationResult.warnings).length : 0;
  
  let summary: string;
  if (validationResult.isValid) {
    summary = warningCount > 0 
      ? `Valid with ${warningCount} warning${warningCount === 1 ? '' : 's'}`
      : 'Valid';
  } else {
    summary = `${errorCount} error${errorCount === 1 ? '' : 's'}`;
    if (warningCount > 0) {
      summary += ` and ${warningCount} warning${warningCount === 1 ? '' : 's'}`;
    }
  }
  
  return {
    isValid: validationResult.isValid,
    errorCount,
    warningCount,
    summary,
  };
}

/**
 * Debounce validation function (uses centralized debounce utility)
 */
export function debounceValidation<T extends (...args: any[]) => any>(
  validationFn: T,
  delay: number = 300
): T {
  return debounce(validationFn, delay) as T;
}

/**
 * Create validation pipeline
 */
export function createValidationPipeline<T>(
  ...validators: ((data: T) => ValidationResult | Promise<ValidationResult>)[]
): (data: T) => Promise<ValidationResult> {
  return async (data: T) => {
    const results: ValidationResult[] = [];
    
    for (const validator of validators) {
      try {
        const result = await validator(data);
        results.push(result);
        
        // Stop on first validation failure if desired
        if (!result.isValid) {
          break;
        }
      } catch (error) {
        results.push(createValidationResult(false, {
          _pipeline: 'Validation pipeline error',
        }));
        break;
      }
    }
    
    return mergeValidationResults(...results);
  };
}

/**
 * Validate with timeout
 */
export async function validateWithTimeout<T>(
  validationFn: () => Promise<T>,
  timeoutMs: number = 5000
): Promise<T> {
  return Promise.race([
    validationFn(),
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('Validation timeout')), timeoutMs);
    }),
  ]);
}