/**
 * Field Validators
 * Reusable field-level validation functions
 */

import type { FieldValidator, FieldValidationResult, ValidationContext } from './types';

/**
 * Create a validation result
 */
function createResult(
  isValid: boolean,
  error?: string,
  warning?: string,
  sanitizedValue?: string | number | boolean | null
): FieldValidationResult {
  return {
    isValid,
    error,
    warning,
    sanitizedValue,
  };
}

/**
 * Required field validator
 */
export const validateRequired: FieldValidator = (value, context) => {
  if (value === null || value === undefined || value === '') {
    return createResult(false, 'This field is required');
  }

  if (typeof value === 'string' && value.trim() === '') {
    return createResult(false, 'This field cannot be empty');
  }

  return createResult(true);
};

/**
 * Email validator
 */
export const validateEmail: FieldValidator<string> = (email, context) => {
  if (!email) {
    return createResult(true); // Allow empty for optional fields
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);

  return createResult(isValid, isValid ? undefined : 'Please enter a valid email address');
};

/**
 * Philippine mobile number validator
 */
export const validatePhilippineMobile: FieldValidator<string> = (mobile, context) => {
  if (!mobile) {
    return createResult(true); // Allow empty for optional fields
  }

  const cleaned = mobile.replace(/\D/g, '');
  const isValid = /^09\d{9}$/.test(cleaned) || /^639\d{9}$/.test(cleaned);

  return createResult(
    isValid,
    isValid
      ? undefined
      : 'Please enter a valid Philippine mobile number (09XXXXXXXXX or +639XXXXXXXXX)',
    undefined,
    isValid ? cleaned : undefined
  );
};

/**
 * PhilSys number validator
 */
export const validatePhilSysNumber: FieldValidator<string> = (philsys, context) => {
  if (!philsys) {
    return createResult(true); // Allow empty for optional fields
  }

  // CORRECTED: PhilSys is 12 digits, not 16 - aligned with database schema VARCHAR(20)
  const pattern = /^\d{4}-\d{4}-\d{4}$/;
  const isValid = pattern.test(philsys);

  return createResult(
    isValid,
    isValid ? undefined : 'PhilSys number must be in format XXXX-XXXX-XXXX'
  );
};

/**
 * Name validator (letters, spaces, hyphens, apostrophes, periods)
 */
export const validateName: FieldValidator<string> = (name, context) => {
  if (!name) {
    return createResult(true); // Allow empty for optional fields
  }

  const namePattern = /^[a-zA-Z\s\-'\.]*$/;
  const isValid = namePattern.test(name) && name.trim().length > 0;

  if (!isValid) {
    return createResult(
      false,
      'Name can only contain letters, spaces, hyphens, apostrophes, and periods'
    );
  }

  if (name.length > 100) {
    return createResult(false, 'Name cannot exceed 100 characters');
  }

  return createResult(true, undefined, undefined, name.trim());
};

/**
 * Age validator
 */
export const validateAge: FieldValidator<number> = (age, context) => {
  if (age === null || age === undefined) {
    return createResult(true); // Allow empty for optional fields
  }

  if (typeof age !== 'number' || !Number.isInteger(age)) {
    return createResult(false, 'Age must be a whole number');
  }

  if (age < 0) {
    return createResult(false, 'Age cannot be negative');
  }

  if (age > 150) {
    return createResult(false, 'Age cannot exceed 150 years');
  }

  return createResult(true);
};

/**
 * Length validator factory
 */
export function validateLength(
  minLength?: number,
  maxLength?: number,
  customMessage?: string
): FieldValidator<string> {
  return (value, context) => {
    if (!value) {
      return createResult(true); // Allow empty for optional fields
    }

    const length = value.length;

    if (minLength !== undefined && length < minLength) {
      return createResult(false, customMessage || `Minimum length is ${minLength} characters`);
    }

    if (maxLength !== undefined && length > maxLength) {
      return createResult(false, customMessage || `Maximum length is ${maxLength} characters`);
    }

    return createResult(true);
  };
}

/**
 * Pattern validator factory
 */
export function validatePattern(pattern: RegExp, errorMessage: string): FieldValidator<string> {
  return (value, context) => {
    if (!value) {
      return createResult(true); // Allow empty for optional fields
    }

    const isValid = pattern.test(value);
    return createResult(isValid, isValid ? undefined : errorMessage);
  };
}

/**
 * Number range validator factory
 */
export function validateRange(
  min?: number,
  max?: number,
  customMessage?: string
): FieldValidator<number> {
  return (value, context) => {
    if (value === null || value === undefined) {
      return createResult(true); // Allow empty for optional fields
    }

    if (typeof value !== 'number') {
      return createResult(false, 'Value must be a number');
    }

    if (min !== undefined && value < min) {
      return createResult(false, customMessage || `Value must be at least ${min}`);
    }

    if (max !== undefined && value > max) {
      return createResult(false, customMessage || `Value cannot exceed ${max}`);
    }

    return createResult(true);
  };
}

/**
 * Date validator
 */
export const validateDate: FieldValidator<string | Date> = (date, context) => {
  if (!date) {
    return createResult(true); // Allow empty for optional fields
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return createResult(false, 'Please enter a valid date');
  }

  // Check if date is not in the future for birthdates
  if (context?.mode === 'create' && dateObj > new Date()) {
    return createResult(false, 'Date cannot be in the future');
  }

  return createResult(true);
};

/**
 * URL validator
 */
export const validateUrl: FieldValidator<string> = (url, context) => {
  if (!url) {
    return createResult(true); // Allow empty for optional fields
  }

  try {
    new URL(url);
    return createResult(true);
  } catch {
    return createResult(false, 'Please enter a valid URL');
  }
};

/**
 * Compose multiple validators
 */
export function composeValidators<T>(...validators: FieldValidator<T>[]): FieldValidator<T> {
  return async (value, context) => {
    for (const validator of validators) {
      const result = await validator(value, context);
      if (!result.isValid) {
        return result;
      }
    }
    return createResult(true);
  };
}

/**
 * Conditional validator
 */
export function conditionalValidator<T>(
  condition: (value: T, context?: ValidationContext) => boolean,
  validator: FieldValidator<T>
): FieldValidator<T> {
  return (value, context) => {
    if (!condition(value, context)) {
      return createResult(true); // Skip validation if condition not met
    }
    return validator(value, context);
  };
}

/**
 * Async validator wrapper
 */
export function createAsyncValidator<T>(
  asyncFn: (value: T, context?: ValidationContext) => Promise<boolean>,
  errorMessage: string
): FieldValidator<T> {
  return async (value, context) => {
    if (!value) {
      return createResult(true); // Allow empty for optional fields
    }

    try {
      const isValid = await asyncFn(value, context);
      return createResult(isValid, isValid ? undefined : errorMessage);
    } catch (error) {
      return createResult(false, 'Validation failed');
    }
  };
}
