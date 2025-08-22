/**
 * Field-level validation schemas and utilities
 */

import { z } from 'zod';
import { 
  isValidPhilSysCardNumber, 
  isValidMobileNumber, 
  isValidBirthdate 
} from '@/lib/business-rules/residentFormRules';

// Basic field validators
export const phoneNumberValidator = z.string().refine(isValidMobileNumber, {
  message: 'Please enter a valid Philippine mobile number (09XXXXXXXXX or +639XXXXXXXXX)',
});

export const philsysCardValidator = z.string().refine(isValidPhilSysCardNumber, {
  message: 'PhilSys card number must be 12 digits',
});

export const birthdateValidator = z.string().refine(isValidBirthdate, {
  message: 'Please enter a valid birthdate',
});

export const emailValidator = z.string().email({
  message: 'Please enter a valid email address',
});

// Name validators
export const nameValidator = z.string()
  .min(1, 'This field is required')
  .max(100, 'Name cannot exceed 100 characters')
  .regex(/^[a-zA-Z\s\-'\.]*$/, 'Name can only contain letters, spaces, hyphens, apostrophes, and periods');

export const requiredNameValidator = nameValidator.min(1, 'This field is required');

// Numeric validators
export const positiveNumberValidator = z.number()
  .positive('Must be a positive number')
  .max(999999, 'Value is too large');

export const heightValidator = z.number()
  .min(50, 'Height must be at least 50 cm')
  .max(300, 'Height cannot exceed 300 cm');

export const weightValidator = z.number()
  .min(1, 'Weight must be at least 1 kg')
  .max(500, 'Weight cannot exceed 500 kg');

export const ageValidator = z.number()
  .min(0, 'Age cannot be negative')
  .max(150, 'Age cannot exceed 150 years');

// Selection validators
export const sexValidator = z.enum(['male', 'female'], {
  errorMap: () => ({ message: 'Please select a valid sex' }),
});

export const requiredSelectValidator = z.string()
  .min(1, 'Please make a selection');

// Field-specific validation functions
export const validateField = (fieldName: string, value: any): { isValid: boolean; error?: string } => {
  try {
    switch (fieldName) {
      case 'firstName':
      case 'lastName':
        requiredNameValidator.parse(value);
        break;
      
      case 'middleName':
      case 'extensionName':
        if (value) nameValidator.parse(value);
        break;
      
      case 'sex':
        sexValidator.parse(value);
        break;
      
      case 'birthdate':
        birthdateValidator.parse(value);
        break;
      
      case 'email':
        if (value) emailValidator.parse(value);
        break;
      
      case 'mobileNumber':
        if (value) phoneNumberValidator.parse(value);
        break;
      
      case 'philsysCardNumber':
        if (value) philsysCardValidator.parse(value);
        break;
      
      case 'height':
        if (value) heightValidator.parse(Number(value));
        break;
      
      case 'weight':
        if (value) weightValidator.parse(Number(value));
        break;
      
      case 'civilStatus':
      case 'citizenship':
      case 'educationAttainment':
      case 'employmentStatus':
        requiredSelectValidator.parse(value);
        break;
      
      default:
        // For fields without specific validation, just check if required
        if (value === null || value === undefined || value === '') {
          return { isValid: false, error: 'This field is required' };
        }
        break;
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
  data: Record<string, any>, 
  fieldNames: string[]
): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  fieldNames.forEach(fieldName => {
    const value = data[fieldName];
    const result = validateField(fieldName, value);
    
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
  data: Record<string, any>,
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
  
  return (value: any) => {
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      const result = validateField(fieldName, value);
      onValidation(result.isValid, result.error);
    }, delay);
  };
};