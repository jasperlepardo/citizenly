/**
 * Field Validators
 * Reusable field-level validation functions
 */

import { z } from 'zod';

import {
  isValidPhilSysCardNumber,
  isValidMobileNumber,
  isValidBirthdate,
} from '@/services/domain/residents/formRules';

import type { FieldValidator } from '@/types/shared/validation/validation';

// Note: FieldValidationResult interface is still exported from types for backward compatibility
// but these validators now return string | null per the updated FieldValidator type signature

/**
 * Required field validator
 */
export const validateRequired: FieldValidator = (value, _fieldName, _formData) => {
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
export const validateEmail: FieldValidator<string> = (email, _fieldName, _formData) => {
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
export const validatePhilippineMobile: FieldValidator<string> = (mobile, _fieldName, _formData) => {
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
export const validatePhilSysNumber: FieldValidator<string> = (philsys, _fieldName, _formData) => {
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
export const validateName: FieldValidator<string> = (name, _fieldName, _formData) => {
  if (!name) {
    return null; // Allow empty for optional fields
  }

  const namePattern = /^[a-zA-Z\s\-'.]*$/;
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
export const validateAge: FieldValidator<number> = (age, _fieldName, _formData) => {
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
  return (value, _fieldName, _formData) => {
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
  return (value, _fieldName, _formData) => {
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
  return (value, _fieldName, _formData) => {
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
export const validateDate: FieldValidator<string | Date> = (date, _fieldName, _formData) => {
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
export const validateUrl: FieldValidator<string> = (url, _fieldName, _formData) => {
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
  condition: (value: T, fieldName: string, formData: Record<string, unknown>) => boolean,
  validator: FieldValidator<T>
): FieldValidator<T> {
  return (value: T, fieldName: string, formData: Record<string, unknown>) => {
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
  asyncFn: (value: T, fieldName: string, formData: Record<string, unknown>) => Promise<boolean>,
  errorMessage: string
): FieldValidator<T> {
  return async (value: T, fieldName: string, formData: Record<string, unknown>) => {
    if (!value) {
      return null; // Allow empty for optional fields
    }

    try {
      const isValid = await asyncFn(value, fieldName, formData);
      return isValid ? null : errorMessage;
    } catch (error) {
      // Log error for debugging while providing user-friendly message
      console.error('Async validation error:', error);
      return 'Validation failed';
    }
  };
}

// ===== Form Section Management (from fieldLevelSchemas.ts) =====

// Zod-based validators for schema validation
export const phoneNumberValidator = z.string().refine(isValidMobileNumber, {
  message: 'Please enter a valid Philippine mobile number (09XXXXXXXXX or +639XXXXXXXXX)',
});

export const philsysCardValidator = z.string().refine(isValidPhilSysCardNumber, {
  message: 'PhilSys card number must be 12 digits',
});

export const birthdateValidator = z.string().refine(isValidBirthdate, {
  message: 'Please enter a valid birthdate',
});

export const emailValidator = z.string().regex(
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  'Please enter a valid email address'
);

// Name validators
export const nameValidator = z
  .string()
  .min(1, 'This field is required')
  .max(100, 'Name cannot exceed 100 characters')
  .regex(
    /^[a-zA-Z\s\-'.]*$/,
    'Name can only contain letters, spaces, hyphens, apostrophes, and periods'
  );

export const requiredNameValidator = nameValidator.min(1, 'This field is required');

// Numeric validators
export const positiveNumberValidator = z
  .number()
  .positive('Must be a positive number')
  .max(999999, 'Value is too large');

export const heightValidator = z
  .number()
  .min(50, 'Height must be at least 50 cm')
  .max(300, 'Height cannot exceed 300 cm');

export const weightValidator = z
  .number()
  .min(1, 'Weight must be at least 1 kg')
  .max(500, 'Weight cannot exceed 500 kg');

export const ageValidator = z
  .number()
  .min(0, 'Age cannot be negative')
  .max(150, 'Age cannot exceed 150 years');

// Selection validators
export const sexValidator = z.enum(['male', 'female'], {
  message: 'Please select a valid sex',
});

export const requiredSelectValidator = z.string().min(1, 'Please make a selection');

// Field validation mapping for better maintainability
const FIELD_VALIDATORS: Record<string, { validator: z.ZodSchema; optional?: boolean; transform?: (value: unknown) => unknown }> = {
  firstName: { validator: requiredNameValidator },
  lastName: { validator: requiredNameValidator },
  middleName: { validator: nameValidator, optional: true },
  extensionName: { validator: nameValidator, optional: true },
  sex: { validator: sexValidator },
  birthdate: { validator: birthdateValidator },
  email: { validator: emailValidator, optional: true },
  mobileNumber: { validator: phoneNumberValidator, optional: true },
  philsysCardNumber: { validator: philsysCardValidator, optional: true },
  height: { validator: heightValidator, optional: true, transform: Number },
  weight: { validator: weightValidator, optional: true, transform: Number },
  civilStatus: { validator: requiredSelectValidator },
  citizenship: { validator: requiredSelectValidator },
  educationAttainment: { validator: requiredSelectValidator },
  employmentStatus: { validator: requiredSelectValidator },
};

// Field-specific validation functions
export const validateFieldByName = (
  fieldName: string,
  value: unknown
): { isValid: boolean; error?: string } => {
  try {
    const fieldConfig = FIELD_VALIDATORS[fieldName];
    
    if (fieldConfig) {
      // Skip validation for optional empty fields
      if (fieldConfig.optional && (!value || value === '')) {
        return { isValid: true };
      }
      
      // Transform value if needed
      const finalValue = fieldConfig.transform ? fieldConfig.transform(value) : value;
      
      // Validate with the configured validator
      fieldConfig.validator.parse(finalValue);
    } else if (value === null || value === undefined || value === '') {
      // Default validation for unknown fields
      return { isValid: false, error: 'This field is required' };
    }

    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.issues[0]?.message || 'Invalid value' };
    }
    return { isValid: false, error: 'Validation error' };
  }
};

// Batch validation for multiple fields
export const validateFields = (
  data: Record<string, unknown>,
  fieldNames: string[]
): Record<string, string> => {
  const errors: Record<string, string> = {};

  fieldNames.forEach(fieldName => {
    const value = data[fieldName];
    const result = validateFieldByName(fieldName, value);

    if (!result.isValid && result.error) {
      errors[fieldName] = result.error;
    }
  });

  return errors;
};

// Required fields by form section
export const REQUIRED_FIELDS = {
  basicInformation: ['firstName', 'lastName', 'sex', 'civilStatus'],
  birthInformation: ['birthdate'],
  contactInformation: ['mobileNumber'],
  physicalDetails: [],
  sectoralInformation: [],
  migrationInformation: [],
} as const;

// Get required fields for a section
export const getRequiredFieldsForSection = (section: keyof typeof REQUIRED_FIELDS): string[] => {
  return [...(REQUIRED_FIELDS[section] || [])];
};

// Validate a complete form section
export const validateFormSection = (
  data: Record<string, unknown>,
  section: keyof typeof REQUIRED_FIELDS
): { isValid: boolean; errors: Record<string, string> } => {
  const requiredFields = getRequiredFieldsForSection(section);
  const errors = validateFields(data, requiredFields);

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Real-time validation with debouncing
export const createDebouncedValidator = (
  fieldName: string,
  onValidation: (isValid: boolean, error?: string) => void,
  delay = 500
) => {
  let timeoutId: NodeJS.Timeout;

  return (value: unknown) => {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      const result = validateFieldByName(fieldName, value);
      onValidation(result.isValid, result.error);
    }, delay);
  };
};

// Backward compatibility export
export const validateField = validateFieldByName;
