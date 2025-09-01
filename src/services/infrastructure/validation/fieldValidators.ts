/**
 * Field Validators
 * Reusable field-level validation functions
 */

import type {
  FieldValidator,
  FieldValidationResult,
  ValidationContext,
} from '../../types/validation';

// Note: FieldValidationResult interface is still exported from types for backward compatibility
// but these validators now return string | null per the updated FieldValidator type signature

/**
 * Required field validator
 */
export const validateRequired: FieldValidator = (value, fieldName, formData) => {
  if (value === null || value === undefined || value === '') {
    return 'This field is required';
  }

  if (typeof value === 'string' && value.trim() === '') {
    return 'This field cannot be empty';
  }

  return null;
};

/**
 * Email validator
 */
export const validateEmail: FieldValidator<string> = (email, fieldName, formData) => {
  if (!email) {
    return null; // Allow empty for optional fields
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);

  return isValid ? null : 'Please enter a valid email address';
};

/**
 * Philippine mobile number validator
 */
export const validatePhilippineMobile: FieldValidator<string> = (mobile, fieldName, formData) => {
  if (!mobile) {
    return null; // Allow empty for optional fields
  }

  const cleaned = mobile.replace(/\D/g, '');
  const isValid = /^09\d{9}$/.test(cleaned) || /^639\d{9}$/.test(cleaned);

  return isValid
    ? null
    : 'Please enter a valid Philippine mobile number (09XXXXXXXXX or +639XXXXXXXXX)';
};

/**
 * PhilSys number validator
 */
export const validatePhilSysNumber: FieldValidator<string> = (philsys, fieldName, formData) => {
  if (!philsys) {
    return null; // Allow empty for optional fields
  }

  // CORRECTED: PhilSys is 12 digits, not 16 - aligned with database schema VARCHAR(20)
  const pattern = /^\d{4}-\d{4}-\d{4}$/;
  const isValid = pattern.test(philsys);

  return isValid ? null : 'PhilSys number must be in format XXXX-XXXX-XXXX';
};

/**
 * Name validator (letters, spaces, hyphens, apostrophes, periods)
 */
export const validateName: FieldValidator<string> = (name, fieldName, formData) => {
  if (!name) {
    return null; // Allow empty for optional fields
  }

  const namePattern = /^[a-zA-Z\s\-'\.]*$/;
  const isValid = namePattern.test(name) && name.trim().length > 0;

  if (!isValid) {
    return 'Name can only contain letters, spaces, hyphens, apostrophes, and periods';
  }

  if (name.length > 100) {
    return 'Name cannot exceed 100 characters';
  }

  return null;
};

/**
 * Age validator
 */
export const validateAge: FieldValidator<number> = (age, fieldName, formData) => {
  if (age === null || age === undefined) {
    return null; // Allow empty for optional fields
  }

  if (typeof age !== 'number' || !Number.isInteger(age)) {
    return 'Age must be a whole number';
  }

  if (age < 0) {
    return 'Age cannot be negative';
  }

  if (age > 150) {
    return 'Age cannot exceed 150 years';
  }

  return null;
};

/**
 * Length validator factory
 */
export function validateLength(
  minLength?: number,
  maxLength?: number,
  customMessage?: string
): FieldValidator<string> {
  return (value, fieldName, formData) => {
    if (!value) {
      return null; // Allow empty for optional fields
    }

    const length = value.length;

    if (minLength !== undefined && length < minLength) {
      return customMessage || `Minimum length is ${minLength} characters`;
    }

    if (maxLength !== undefined && length > maxLength) {
      return customMessage || `Maximum length is ${maxLength} characters`;
    }

    return null;
  };
}

/**
 * Pattern validator factory
 */
export function validatePattern(pattern: RegExp, errorMessage: string): FieldValidator<string> {
  return (value, fieldName, formData) => {
    if (!value) {
      return null; // Allow empty for optional fields
    }

    const isValid = pattern.test(value);
    return isValid ? null : errorMessage;
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
  return (value, fieldName, formData) => {
    if (value === null || value === undefined) {
      return null; // Allow empty for optional fields
    }

    if (typeof value !== 'number') {
      return 'Value must be a number';
    }

    if (min !== undefined && value < min) {
      return customMessage || `Value must be at least ${min}`;
    }

    if (max !== undefined && value > max) {
      return customMessage || `Value cannot exceed ${max}`;
    }

    return null;
  };
}

/**
 * Date validator
 */
export const validateDate: FieldValidator<string | Date> = (date, fieldName, formData) => {
  if (!date) {
    return null; // Allow empty for optional fields
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Please enter a valid date';
  }

  // Check if date is not in the future for birthdates (simplified - can be enhanced later)
  if (dateObj > new Date()) {
    return 'Date cannot be in the future';
  }

  return null;
};

/**
 * URL validator
 */
export const validateUrl: FieldValidator<string> = (url, fieldName, formData) => {
  if (!url) {
    return null; // Allow empty for optional fields
  }

  try {
    new URL(url);
    return null;
  } catch {
    return 'Please enter a valid URL';
  }
};

/**
 * Compose multiple validators
 */
export function composeValidators<T>(...validators: FieldValidator<T>[]): FieldValidator<T> {
  return async (value, fieldName, formData) => {
    for (const validator of validators) {
      const result = await validator(value, fieldName, formData);
      if (result !== null) {
        return result;
      }
    }
    return null;
  };
}

/**
 * Conditional validator
 */
export function conditionalValidator<T>(
  condition: (value: T, fieldName?: string, formData?: Record<string, any>) => boolean,
  validator: FieldValidator<T>
): FieldValidator<T> {
  return (value, fieldName, formData) => {
    if (!condition(value, fieldName, formData)) {
      return null; // Skip validation if condition not met
    }
    return validator(value, fieldName, formData);
  };
}

/**
 * Async validator wrapper
 */
export function createAsyncValidator<T>(
  asyncFn: (value: T, fieldName?: string, formData?: Record<string, any>) => Promise<boolean>,
  errorMessage: string
): FieldValidator<T> {
  return async (value, fieldName, formData) => {
    if (!value) {
      return null; // Allow empty for optional fields
    }

    try {
      const isValid = await asyncFn(value, fieldName, formData);
      return isValid ? null : errorMessage;
    } catch (error) {
      return 'Validation failed';
    }
  };
}
