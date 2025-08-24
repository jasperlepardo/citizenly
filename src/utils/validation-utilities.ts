/**
 * Common Validation Utilities
 * 
 * @description Shared utilities and patterns for validation functionality across hooks.
 * Extracted from multiple validation hooks to eliminate duplication.
 */

import { useState, useCallback } from 'react';
import { 
  ValidationResult, 
  FieldValidationResult, 
  BaseValidationConfig,
  ValidateFormFunction,
  ValidateFieldFunction 
} from '@/lib/validation/types';

// Re-export types for easier access
export type { 
  ValidationResult, 
  FieldValidationResult, 
  BaseValidationConfig,
  ValidateFormFunction,
  ValidateFieldFunction 
};
import { 
  isValidEmail, 
  isValidPhilippineMobile 
} from '@/lib/validation/utilities';
import { toTitleCase } from '../lib/utilities/string-utils';

// All types are now imported from the centralized validation types
// This eliminates duplication and ensures consistency

/**
 * Validation state interface
 */
export interface ValidationState {
  errors: Record<string, string>;
  isValid: boolean;
  hasValidated: boolean;
}

/**
 * Create initial validation state
 */
export function createValidationState(): ValidationState {
  return {
    errors: {},
    isValid: true,
    hasValidated: false,
  };
}

/**
 * Validation state management hook
 */
export function useValidationState(config: BaseValidationConfig = {}) {
  const [state, setState] = useState<ValidationState>(createValidationState);

  /**
   * Set validation errors
   */
  const setErrors = useCallback((errors: Record<string, string>) => {
    const isValid = Object.keys(errors).length === 0;
    
    setState({
      errors,
      isValid,
      hasValidated: true,
    });

    // Trigger callbacks
    if (isValid && config.onValidationSuccess) {
      config.onValidationSuccess();
    } else if (!isValid && config.onValidationError) {
      config.onValidationError(errors);
    }
  }, [config]);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setState(createValidationState());
  }, []);

  /**
   * Set error for specific field
   */
  const setFieldError = useCallback((field: string, error: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error },
      isValid: false,
      hasValidated: true,
    }));
  }, []);

  /**
   * Clear error for specific field
   */
  const clearFieldError = useCallback((field: string) => {
    setState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[field];
      const isValid = Object.keys(newErrors).length === 0;
      
      return {
        errors: newErrors,
        isValid,
        hasValidated: prev.hasValidated,
      };
    });
  }, []);

  /**
   * Get error for specific field
   */
  const getFieldError = useCallback((field: string): string | undefined => {
    return state.errors[field];
  }, [state.errors]);

  /**
   * Check if field has error
   */
  const hasFieldError = useCallback((field: string): boolean => {
    return Boolean(state.errors[field]);
  }, [state.errors]);

  return {
    ...state,
    setErrors,
    clearErrors,
    setFieldError,
    clearFieldError,
    getFieldError,
    hasFieldError,
  };
}

/**
 * Create validation executor for forms
 */
export function createFormValidationExecutor<T>(
  validateFn: ValidateFormFunction<T>,
  setErrors: (errors: Record<string, string>) => void
) {
  return useCallback((formData: T): ValidationResult => {
    const result = validateFn(formData);
    
    // Normalize result format
    const normalizedResult: ValidationResult = {
      isValid: result.isValid || result.success === true,
      errors: result.errors || {},
    };

    setErrors(normalizedResult.errors);
    
    return normalizedResult;
  }, [validateFn, setErrors]);
}

/**
 * Create field validation executor
 */
export function createFieldValidationExecutor(
  validateFn: ValidateFieldFunction,
  setFieldError: (field: string, error: string) => void,
  clearFieldError: (field: string) => void
) {
  return useCallback((fieldName: string, value: any): FieldValidationResult => {
    const result = validateFn(fieldName, value);
    
    if (result.isValid) {
      clearFieldError(fieldName);
    } else if (result.error) {
      setFieldError(fieldName, result.error);
    }
    
    return result;
  }, [validateFn, setFieldError, clearFieldError]);
}

/**
 * Common validation utilities
 */
export const validationUtils = {
  /**
   * Check if value is empty
   */
  isEmpty: (value: any): boolean => {
    return value === null || value === undefined || value === '';
  },

  /**
   * Check if string is valid email (uses centralized string utility)
   */
  isValidEmail,

  /**
   * Check if string is valid Philippine mobile number (uses centralized string utility)
   */
  isValidPhilippineMobile,

  /**
   * Check if string contains only letters and common name characters
   */
  isValidName: (name: string): boolean => {
    return /^[a-zA-Z\s\-'\.]*$/.test(name);
  },

  /**
   * Check if number is within range
   */
  isInRange: (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max;
  },

  /**
   * Validate required fields
   */
  validateRequiredFields: (
    data: Record<string, any>, 
    requiredFields: string[]
  ): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    requiredFields.forEach(field => {
      if (validationUtils.isEmpty(data[field])) {
        errors[field] = `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
      }
    });
    
    return errors;
  },

  /**
   * Merge validation errors from multiple sources
   */
  mergeValidationErrors: (...errorSets: Record<string, string>[]): Record<string, string> => {
    return errorSets.reduce((merged, errors) => ({ ...merged, ...errors }), {});
  },

  /**
   * Format field name for display (uses centralized string utility)
   */
  formatFieldName: (fieldName: string): string => {
    const formatted = fieldName.replace(/([A-Z])/g, ' $1').trim();
    return toTitleCase(formatted);
  },

  /**
   * Create field validator with custom message
   */
  createFieldValidator: (
    predicate: (value: any) => boolean,
    errorMessage: string
  ): ValidateFieldFunction => {
    return (fieldName: string, value: any): FieldValidationResult => {
      const isValid = predicate(value);
      return {
        isValid,
        error: isValid ? undefined : errorMessage,
      };
    };
  },

  /**
   * Create required field validator
   */
  createRequiredValidator: (customMessage?: string): ValidateFieldFunction => {
    return (fieldName: string, value: any): FieldValidationResult => {
      const isValid = !validationUtils.isEmpty(value);
      const fieldDisplayName = validationUtils.formatFieldName(fieldName);
      
      return {
        isValid,
        error: isValid ? undefined : (customMessage || `${fieldDisplayName} is required`),
      };
    };
  },

  /**
   * Create length validator
   */
  createLengthValidator: (
    minLength?: number, 
    maxLength?: number,
    customMessage?: string
  ): ValidateFieldFunction => {
    return (fieldName: string, value: any): FieldValidationResult => {
      const stringValue = String(value || '');
      const length = stringValue.length;
      
      let isValid = true;
      let error: string | undefined;
      
      if (minLength !== undefined && length < minLength) {
        isValid = false;
        error = customMessage || `Minimum length is ${minLength} characters`;
      } else if (maxLength !== undefined && length > maxLength) {
        isValid = false;
        error = customMessage || `Maximum length is ${maxLength} characters`;
      }
      
      return { isValid, error };
    };
  },

  /**
   * Create regex validator
   */
  createRegexValidator: (
    pattern: RegExp,
    errorMessage: string
  ): ValidateFieldFunction => {
    return (fieldName: string, value: any): FieldValidationResult => {
      const stringValue = String(value || '');
      const isValid = pattern.test(stringValue);
      
      return {
        isValid,
        error: isValid ? undefined : errorMessage,
      };
    };
  },

  /**
   * Compose multiple validators
   */
  composeValidators: (...validators: ValidateFieldFunction[]): ValidateFieldFunction => {
    return (fieldName: string, value: any): FieldValidationResult => {
      for (const validator of validators) {
        const result = validator(fieldName, value);
        if (!result.isValid) {
          return result;
        }
      }
      return { isValid: true };
    };
  },
};

/**
 * Validation hooks factory
 */
export function createValidationHook<T>(
  validateFormFn: ValidateFormFunction<T>,
  validateFieldFn?: ValidateFieldFunction,
  config: BaseValidationConfig = {}
) {
  return function useValidation() {
    const validationState = useValidationState(config);
    
    const validateForm = createFormValidationExecutor(
      validateFormFn,
      validationState.setErrors
    );
    
    const validateField = validateFieldFn 
      ? createFieldValidationExecutor(
          validateFieldFn,
          validationState.setFieldError,
          validationState.clearFieldError
        )
      : undefined;
    
    return {
      ...validationState,
      validateForm,
      validateField,
    };
  };
}

/**
 * Async validation utilities
 */
export const asyncValidationUtils = {
  /**
   * Create debounced async validator
   */
  createDebouncedAsyncValidator: (
    asyncValidator: (value: any) => Promise<FieldValidationResult>,
    delay = 500
  ) => {
    let timeoutId: NodeJS.Timeout;
    
    return (
      fieldName: string,
      value: any,
      onResult: (result: FieldValidationResult) => void
    ) => {
      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(async () => {
        try {
          const result = await asyncValidator(value);
          onResult(result);
        } catch (error) {
          onResult({
            isValid: false,
            error: 'Validation failed',
          });
        }
      }, delay);
    };
  },

  /**
   * Create batch async validator
   */
  createBatchAsyncValidator: (
    asyncValidators: Record<string, (value: any) => Promise<FieldValidationResult>>
  ) => {
    return async (data: Record<string, any>): Promise<Record<string, string>> => {
      const validationPromises = Object.entries(asyncValidators).map(
        async ([field, validator]) => {
          try {
            const result = await validator(data[field]);
            return [field, result.error] as const;
          } catch (error) {
            return [field, 'Validation failed'] as const;
          }
        }
      );
      
      const results = await Promise.all(validationPromises);
      const errors: Record<string, string> = {};
      
      results.forEach(([field, error]) => {
        if (error) {
          errors[field] = error;
        }
      });
      
      return errors;
    };
  },
};