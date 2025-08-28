/**
 * Form Validators
 * Comprehensive form-level validation functions
 */

import type {
  FormValidator,
  ValidationResult,
  ValidationContext,
  FieldValidator,
  FieldValidationResult,
} from './types';

/**
 * Create a validation result
 */
function createValidationResult(
  isValid: boolean,
  errors: Record<string, string> = {},
  warnings: Record<string, string> = {},
  data?: any
): ValidationResult {
  // Convert errors from Record<string, string> to ValidationError[]
  const validationErrors = Object.entries(errors).map(([field, message]) => ({
    field,
    message,
  }));
  
  // Convert warnings from Record<string, string> to string[]
  const warningList = Object.values(warnings);
  
  return {
    isValid,
    errors: validationErrors,
    warnings: warningList.length > 0 ? warningList : undefined,
    data,
  };
}

/**
 * Create a form validator from field validators
 */
export function createFormValidator<T extends Record<string, any>>(
  fieldValidators: Record<keyof T, FieldValidator | FieldValidator[]>,
  crossFieldValidators?: ((data: T, context?: ValidationContext) => ValidationResult)[]
): FormValidator<T> {
  return async (data, context) => {
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};
    const sanitizedData: Record<string, any> = { ...data };

    // Validate individual fields
    for (const [fieldName, validators] of Object.entries(fieldValidators)) {
      const fieldValue = data[fieldName as keyof T];
      const validatorArray = Array.isArray(validators) ? validators : [validators];

      for (const validator of validatorArray) {
        try {
          const result = await validator(fieldValue, fieldName, data);

          if (result !== null) {
            errors[fieldName] = result;
            break; // Stop at first error for this field
          }
        } catch (error) {
          errors[fieldName] = 'Validation error occurred';
          console.error(`Validation error for field ${fieldName}:`, error);
        }
      }
    }

    // Run cross-field validations if no individual field errors
    if (Object.keys(errors).length === 0 && crossFieldValidators) {
      for (const crossValidator of crossFieldValidators) {
        try {
          const crossResult = crossValidator(data, context);

          if (!crossResult.isValid) {
            // Convert ValidationError[] back to Record<string, string> for internal processing
            const errorRecord = crossResult.errors.reduce((acc, err) => {
              acc[err.field] = err.message;
              return acc;
            }, {} as Record<string, string>);
            Object.assign(errors, errorRecord);
          }

          if (crossResult.warnings && crossResult.warnings.length > 0) {
            // For cross-field warnings, we'll add them to the form level
            warnings['_form'] = crossResult.warnings.join('; ');
          }
        } catch (error) {
          errors['_form'] = 'Cross-field validation error occurred';
          console.error('Cross-field validation error:', error);
        }
      }
    }

    const isValid = Object.keys(errors).length === 0;

    return createValidationResult(
      isValid,
      errors,
      warnings,
      isValid ? sanitizedData : undefined
    );
  };
}

/**
 * Create a field validator with common patterns
 */
export function createFieldValidator(rules: {
  required?: boolean;
  type?: 'string' | 'number' | 'email' | 'phone' | 'date' | 'url';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: FieldValidator;
  customMessage?: string;
}): FieldValidator {
  return async (value, fieldName, formData) => {
    // Required validation
    if (rules.required) {
      if (value === null || value === undefined || value === '') {
        return rules.customMessage || 'This field is required';
      }
    }

    // Skip other validations if value is empty and not required
    if (!rules.required && (value === null || value === undefined || value === '')) {
      return null;
    }

    // Type validations
    switch (rules.type) {
      case 'string':
        if (typeof value !== 'string') {
          return 'Must be a string';
        }
        break;

      case 'number':
        const numValue = Number(value);
        if (isNaN(numValue)) {
          return 'Must be a valid number';
        }
        value = numValue;
        break;

      case 'email':
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(String(value))) {
          return 'Must be a valid email address';
        }
        break;

      case 'phone':
        const phonePattern = /^(\+63|63|09)\d{9}$/;
        const cleanedPhone = String(value).replace(/\D/g, '');
        if (!phonePattern.test(cleanedPhone)) {
          return 'Must be a valid Philippine phone number';
        }
        break;

      case 'date':
        const dateValue = new Date(String(value));
        if (isNaN(dateValue.getTime())) {
          return 'Must be a valid date';
        }
        break;

      case 'url':
        try {
          new URL(String(value));
        } catch {
          return 'Must be a valid URL';
        }
        break;
    }

    // Length validations for strings
    if (typeof value === 'string') {
      if (rules.minLength !== undefined && value.length < rules.minLength) {
        return `Must be at least ${rules.minLength} characters long`;
      }

      if (rules.maxLength !== undefined && value.length > rules.maxLength) {
        return `Must not exceed ${rules.maxLength} characters`;
      }
    }

    // Range validations for numbers
    if (typeof value === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        return `Must be at least ${rules.min}`;
      }

      if (rules.max !== undefined && value > rules.max) {
        return `Must not exceed ${rules.max}`;
      }
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(String(value))) {
      return rules.customMessage || 'Invalid format';
    }

    // Custom validation
    if (rules.custom) {
      return await rules.custom(value, fieldName, formData);
    }

    return null;
  };
}

/**
 * Validate form data with a schema
 */
export async function validateFormData<T extends Record<string, any>>(
  data: T,
  validator: FormValidator<T>,
  context?: ValidationContext
): Promise<ValidationResult> {
  try {
    return await validator(data, context);
  } catch (error) {
    console.error('Form validation error:', error);
    return createValidationResult(false, {
      _form: 'Validation failed due to an internal error',
    });
  }
}

/**
 * Build validation errors from multiple sources
 */
export function buildValidationErrors(
  ...errorSources: (Record<string, string> | undefined)[]
): Record<string, string> {
  return errorSources.reduce<Record<string, string>>((acc, errors) => {
    if (errors) {
      Object.assign(acc, errors);
    }
    return acc;
  }, {});
}

/**
 * Cross-field validators for common patterns
 */
export const crossFieldValidators = {
  /**
   * Validate that two fields match (e.g., password confirmation)
   */
  fieldsMatch: (field1: string, field2: string, message?: string) => {
    return (data: Record<string, any>) => {
      if (data[field1] !== data[field2]) {
        return createValidationResult(false, {
          [field2]: message || `${field2} must match ${field1}`,
        });
      }
      return createValidationResult(true);
    };
  },

  /**
   * Validate that at least one of the fields is provided
   */
  atLeastOneRequired: (fields: string[], message?: string) => {
    return (data: Record<string, any>) => {
      const hasValue = fields.some(
        field => data[field] !== null && data[field] !== undefined && data[field] !== ''
      );

      if (!hasValue) {
        const errors: Record<string, string> = {};
        fields.forEach(field => {
          errors[field] = message || `At least one of these fields is required`;
        });
        return createValidationResult(false, errors);
      }

      return createValidationResult(true);
    };
  },

  /**
   * Validate that a date range is valid (start <= end)
   */
  validDateRange: (startField: string, endField: string, message?: string) => {
    return (data: Record<string, any>) => {
      const startDate = data[startField];
      const endDate = data[endField];

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
          return createValidationResult(false, {
            [endField]: message || 'End date must be after start date',
          });
        }
      }

      return createValidationResult(true);
    };
  },

  /**
   * Validate conditional fields (if field A has value, field B is required)
   */
  conditionalRequired: (triggerField: string, requiredField: string, message?: string) => {
    return (data: Record<string, any>) => {
      const triggerValue = data[triggerField];
      const requiredValue = data[requiredField];

      if (triggerValue && (!requiredValue || requiredValue === '')) {
        return createValidationResult(false, {
          [requiredField]:
            message || `${requiredField} is required when ${triggerField} is provided`,
        });
      }

      return createValidationResult(true);
    };
  },
};
