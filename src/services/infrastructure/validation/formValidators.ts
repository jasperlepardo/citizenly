/**
 * Form Validators
 * Comprehensive form-level validation functions
 */

import type {
  FormValidator,
  ValidationResult,
  ValidationContext,
  FieldValidator,
} from '../../../types/shared/validation/validation';

/**
 * Create a validation result
 */
function createValidationResult<T = unknown>(
  isValid: boolean,
  errors: Record<string, string> = {},
  warnings: Record<string, string> = {},
  data?: T
): ValidationResult<T> {
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
 * Validate a single field with its validators
 */
async function validateField<T extends Record<string, unknown>>(
  fieldName: string,
  fieldValue: unknown,
  validators: FieldValidator | FieldValidator[],
  data: T
): Promise<string | null> {
  const validatorArray = Array.isArray(validators) ? validators : [validators];

  for (const validator of validatorArray) {
    try {
      const result = await validator(fieldValue, fieldName, data);
      if (result !== null) {
        return result;
      }
    } catch (error) {
      console.error(`Validation error for field ${fieldName}:`, error);
      return 'Validation error occurred';
    }
  }
  return null;
}

/**
 * Run cross-field validations
 */
function runCrossFieldValidations<T extends Record<string, unknown>>(
  data: T,
  context: ValidationContext | undefined,
  crossValidators: ((data: T, context?: ValidationContext) => ValidationResult)[],
  errors: Record<string, string>,
  warnings: Record<string, string>
): void {
  for (const crossValidator of crossValidators) {
    try {
      const crossResult = crossValidator(data, context);

      if (!crossResult.isValid) {
        const errorRecord = crossResult.errors.reduce(
          (acc, err) => {
            acc[err.field] = err.message;
            return acc;
          },
          {} as Record<string, string>
        );
        Object.assign(errors, errorRecord);
      }

      if (crossResult.warnings && crossResult.warnings.length > 0) {
        warnings['_form'] = crossResult.warnings.join('; ');
      }
    } catch (error) {
      errors['_form'] = 'Cross-field validation error occurred';
      console.error('Cross-field validation error:', error);
    }
  }
}

/**
 * Create a form validator from field validators
 */
export function createFormValidator<T extends Record<string, unknown>>(
  fieldValidators: Record<keyof T, FieldValidator | FieldValidator[]>,
  crossFieldValidators?: ((data: T, context?: ValidationContext) => ValidationResult)[]
): FormValidator<T> {
  return async (data, context) => {
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};
    const sanitizedData: Record<string, unknown> = { ...data };

    // Validate individual fields
    for (const [fieldName, validators] of Object.entries(fieldValidators)) {
      const fieldValue = data[fieldName as keyof T];
      const error = await validateField(fieldName, fieldValue, validators, data);
      if (error) {
        errors[fieldName] = error;
      }
    }

    // Run cross-field validations if no individual field errors
    if (Object.keys(errors).length === 0 && crossFieldValidators) {
      runCrossFieldValidations(data, context, crossFieldValidators, errors, warnings);
    }

    const isValid = Object.keys(errors).length === 0;
    return createValidationResult(isValid, errors, warnings, isValid ? sanitizedData : undefined);
  };
}

/**
 * Validation rule types
 */
type ValidationRules = {
  required?: boolean;
  type?: 'string' | 'number' | 'email' | 'phone' | 'date' | 'url';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: FieldValidator;
  customMessage?: string;
};

/**
 * Validate required field
 */
function validateRequired(value: unknown, rules: ValidationRules): string | null {
  if (rules.required && (value === null || value === undefined || value === '')) {
    return rules.customMessage || 'This field is required';
  }
  return null;
}

/**
 * Check if field is empty and optional
 */
function isEmptyOptional(value: unknown, rules: ValidationRules): boolean {
  return !rules.required && (value === null || value === undefined || value === '');
}

/**
 * Validate field type
 */
function validateType(value: unknown, rules: ValidationRules): { error: string | null; transformedValue: unknown } {
  if (!rules.type) return { error: null, transformedValue: value };

  switch (rules.type) {
    case 'string':
      return typeof value !== 'string' 
        ? { error: 'Must be a string', transformedValue: value }
        : { error: null, transformedValue: value };

    case 'number': {
      const numValue = Number(value);
      return isNaN(numValue)
        ? { error: 'Must be a valid number', transformedValue: value }
        : { error: null, transformedValue: numValue };
    }

    case 'email': {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return !emailPattern.test(String(value))
        ? { error: 'Must be a valid email address', transformedValue: value }
        : { error: null, transformedValue: value };
    }

    case 'phone': {
      const phonePattern = /^(\+63|63|09)\d{9}$/;
      const cleanedPhone = String(value).replace(/\D/g, '');
      return !phonePattern.test(cleanedPhone)
        ? { error: 'Must be a valid Philippine phone number', transformedValue: value }
        : { error: null, transformedValue: value };
    }

    case 'date': {
      const dateValue = new Date(String(value));
      return isNaN(dateValue.getTime())
        ? { error: 'Must be a valid date', transformedValue: value }
        : { error: null, transformedValue: value };
    }

    case 'url':
      try {
        new URL(String(value));
        return { error: null, transformedValue: value };
      } catch {
        return { error: 'Must be a valid URL', transformedValue: value };
      }

    default:
      return { error: null, transformedValue: value };
  }
}

/**
 * Validate string length
 */
function validateStringLength(value: unknown, rules: ValidationRules): string | null {
  if (typeof value !== 'string') return null;

  if (rules.minLength !== undefined && value.length < rules.minLength) {
    return `Must be at least ${rules.minLength} characters long`;
  }

  if (rules.maxLength !== undefined && value.length > rules.maxLength) {
    return `Must not exceed ${rules.maxLength} characters`;
  }

  return null;
}

/**
 * Validate number range
 */
function validateNumberRange(value: unknown, rules: ValidationRules): string | null {
  if (typeof value !== 'number') return null;

  if (rules.min !== undefined && value < rules.min) {
    return `Must be at least ${rules.min}`;
  }

  if (rules.max !== undefined && value > rules.max) {
    return `Must not exceed ${rules.max}`;
  }

  return null;
}

/**
 * Validate pattern
 */
function validatePattern(value: unknown, rules: ValidationRules): string | null {
  if (!rules.pattern) return null;
  
  return !rules.pattern.test(String(value))
    ? rules.customMessage || 'Invalid format'
    : null;
}

/**
 * Create a field validator with common patterns
 */
export function createFieldValidator(rules: ValidationRules): FieldValidator {
  return async (value, fieldName, formData) => {
    // Required validation
    const requiredError = validateRequired(value, rules);
    if (requiredError) return requiredError;

    // Skip other validations if value is empty and not required
    if (isEmptyOptional(value, rules)) return null;

    // Type validation
    const { error: typeError, transformedValue } = validateType(value, rules);
    if (typeError) return typeError;

    // Length validations for strings
    const lengthError = validateStringLength(transformedValue, rules);
    if (lengthError) return lengthError;

    // Range validations for numbers
    const rangeError = validateNumberRange(transformedValue, rules);
    if (rangeError) return rangeError;

    // Pattern validation
    const patternError = validatePattern(transformedValue, rules);
    if (patternError) return patternError;

    // Custom validation
    if (rules.custom) {
      return await rules.custom(transformedValue, fieldName, formData);
    }

    return null;
  };
}

/**
 * Validate form data with a schema
 */
export async function validateFormData<T extends Record<string, unknown>>(
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
    return (data: Record<string, unknown>) => {
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
    return (data: Record<string, unknown>) => {
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
    return (data: Record<string, unknown>) => {
      const startDate = data[startField];
      const endDate = data[endField];

      if (startDate && endDate) {
        const start = new Date(startDate as string | number | Date);
        const end = new Date(endDate as string | number | Date);

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
    return (data: Record<string, unknown>) => {
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
