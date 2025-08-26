/**
 * Validation Schemas
 * Pre-built validation schemas for common data types
 */

import {
  validateRequired,
  validateEmail,
  validatePhilippineMobile,
  validatePhilSysNumber,
  validateName,
  validateAge,
  validateLength,
  validateRange,
  validateDate,
  composeValidators,
} from './fieldValidators';
import { createFormValidator, createFieldValidator, crossFieldValidators } from './formValidators';
import type { FormValidator, ValidationResult, ValidationContext } from './types';
import type { ResidentFormData } from '@/types/resident-form';
import type { HouseholdFormData } from '@/types/households';

interface UserRegistrationData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role_id?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface PasswordChangeData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

/**
 * Resident data validation schema
 */
export const residentSchema = createFormValidator(
  {
    // Required fields
    first_name: composeValidators(validateRequired, validateName),
    last_name: composeValidators(validateRequired, validateName),
    birthdate: composeValidators(validateRequired, validateDate),
    sex: validateRequired,

    // Optional personal information
    middle_name: validateName,
    extension_name: validateName,
    email: validateEmail,
    mobile_number: validatePhilippineMobile,
    telephone_number: validateLength(0, 20),
    civil_status: validateLength(0, 50),
    citizenship: validateLength(0, 50),
    blood_type: validateLength(0, 10),
    ethnicity: validateLength(0, 50),
    religion: validateLength(0, 50),
    religion_others_specify: validateLength(0, 100),

    // Physical characteristics
    height: validateRange(50, 300), // cm
    weight: validateRange(10, 500), // kg
    complexion: validateLength(0, 50),

    // Documentation
    birth_place_code: validateLength(0, 20),
    philsys_card_number: validatePhilSysNumber,

    // Family information
    mother_maiden_first: validateName,
    mother_maiden_middle: validateName,
    mother_maiden_last: validateName,

    // Education and employment
    education_attainment: validateLength(0, 50),
    is_graduate: (value: unknown) => ({
      isValid: typeof value === 'boolean',
      error: 'Must be true or false',
    }),
    employment_status: validateLength(0, 50),
    occupation_code: validateLength(0, 20),

    // Voting information
    is_voter: (value: unknown) => ({
      isValid: typeof value === 'boolean',
      error: 'Must be true or false',
    }),
    is_resident_voter: (value: unknown) => ({
      isValid: typeof value === 'boolean',
      error: 'Must be true or false',
    }),
    last_voted_date: validateDate,

    // Household
    household_code: validateLength(0, 50),
  },
  [
    // Cross-field validations
    crossFieldValidators.conditionalRequired('philsys_card_number', 'birth_place_code'),
    crossFieldValidators.conditionalRequired('is_voter', 'last_voted_date'),
  ]
);

/**
 * Household data validation schema
 */
export const householdSchema = createFormValidator({
  code: composeValidators(validateRequired, validateLength(1, 50)),
  house_number: validateLength(0, 20),
  street_name: validateLength(0, 100),
  subdivision_name: validateLength(0, 100),
  barangay_code: composeValidators(validateRequired, validateLength(1, 20)),
  city_code: composeValidators(validateRequired, validateLength(1, 20)),
  province_code: composeValidators(validateRequired, validateLength(1, 20)),
  region_code: composeValidators(validateRequired, validateLength(1, 20)),
  zip_code: validateLength(0, 10),
});

/**
 * User data validation schema
 */
export const userSchema = createFormValidator({
  email: composeValidators(validateRequired, validateEmail),
  first_name: composeValidators(validateRequired, validateName),
  last_name: composeValidators(validateRequired, validateName),
  role: validateRequired,
  barangay_code: validateLength(0, 20),
  is_active: (value: unknown) => ({
    isValid: typeof value === 'boolean',
    error: 'Must be true or false',
  }),
});

/**
 * Login validation schema
 */
export const loginSchema = createFormValidator({
  email: composeValidators(validateRequired, validateEmail),
  password: composeValidators(validateRequired, validateLength(1, 100)),
});

/**
 * Password change validation schema
 */
export const passwordChangeSchema = createFormValidator(
  {
    current_password: composeValidators(validateRequired, validateLength(1, 100)),
    new_password: composeValidators(
      validateRequired,
      validateLength(8, 100),
      createFieldValidator({
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        customMessage:
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      })
    ),
    confirm_password: composeValidators(validateRequired, validateLength(1, 100)),
  },
  [crossFieldValidators.fieldsMatch('new_password', 'confirm_password', 'Passwords must match')]
);

/**
 * Search query validation schema
 */
export const searchQuerySchema = createFormValidator({
  query: composeValidators(
    validateRequired,
    validateLength(1, 100),
    createFieldValidator({
      pattern: /^[a-zA-Z0-9\s\-_.@]*$/,
      customMessage: 'Search query contains invalid characters',
    })
  ),
  filters: (value: unknown) => ({
    isValid: typeof value === 'object' && value !== null,
    error: 'Must be a valid object',
  }),
  page: validateRange(1, 1000),
  limit: validateRange(1, 100),
});

/**
 * File upload validation schema
 */
export const fileUploadSchema = createFormValidator({
  fileName: composeValidators(
    validateRequired,
    validateLength(1, 255),
    createFieldValidator({
      pattern: /^[a-zA-Z0-9\s\-_.]*$/,
      customMessage: 'File name contains invalid characters',
    })
  ),
  fileSize: composeValidators(
    validateRequired,
    validateRange(1, 5 * 1024 * 1024) // 5MB max
  ),
  fileType: composeValidators(
    validateRequired,
    createFieldValidator({
      pattern: /^(image\/(jpeg|jpg|png|gif|webp)|application\/pdf)$/,
      customMessage: 'File type not allowed',
    })
  ),
});

/**
 * Validate resident data
 */
export async function validateResidentData(
  data: Partial<ResidentFormData>,
  context?: ValidationContext
): Promise<ValidationResult> {
  return await residentSchema(data, context);
}

/**
 * Validate household data
 */
export async function validateHouseholdData(
  data: Partial<HouseholdFormData>,
  context?: ValidationContext
): Promise<ValidationResult> {
  return await householdSchema(data, context);
}

/**
 * Validate user data
 */
export async function validateUserData(
  data: Partial<UserRegistrationData>,
  context?: ValidationContext
): Promise<ValidationResult> {
  return await userSchema(data, context);
}

/**
 * Validate login data
 */
export async function validateLoginData(
  data: Partial<LoginData>,
  context?: ValidationContext
): Promise<ValidationResult> {
  return await loginSchema(data, context);
}

/**
 * Validate password change data
 */
export async function validatePasswordChangeData(
  data: Partial<PasswordChangeData>,
  context?: ValidationContext
): Promise<ValidationResult> {
  return await passwordChangeSchema(data, context);
}

/**
 * Validate search query data
 */
export async function validateSearchQueryData(
  data: { query?: string; filters?: Record<string, unknown>; page?: number; limit?: number },
  context?: ValidationContext
): Promise<ValidationResult> {
  return await searchQuerySchema(data, context);
}

/**
 * Validate file upload data
 */
export async function validateFileUploadData(
  data: { fileName?: string; fileSize?: number; fileType?: string },
  context?: ValidationContext
): Promise<ValidationResult> {
  return await fileUploadSchema(data, context);
}
