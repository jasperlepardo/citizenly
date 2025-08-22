/**
 * Validation Schemas
 * Pre-built validation schemas for common data types
 */

import { 
  createFormValidator, 
  createFieldValidator,
  crossFieldValidators 
} from './formValidators';
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
import type { FormValidator, ValidationResult, ValidationContext } from './types';

/**
 * Resident data validation schema
 */
export const residentSchema = createFormValidator({
  // Required fields
  firstName: composeValidators(validateRequired, validateName),
  lastName: composeValidators(validateRequired, validateName),
  birthdate: composeValidators(validateRequired, validateDate),
  sex: validateRequired,
  
  // Optional personal information
  middleName: validateName,
  extensionName: validateName,
  email: validateEmail,
  mobileNumber: validatePhilippineMobile,
  telephoneNumber: validateLength(0, 20),
  civilStatus: validateLength(0, 50),
  citizenship: validateLength(0, 50),
  bloodType: validateLength(0, 10),
  ethnicity: validateLength(0, 50),
  religion: validateLength(0, 50),
  religionOthersSpecify: validateLength(0, 100),
  
  // Physical characteristics
  height: validateRange(50, 300), // cm
  weight: validateRange(10, 500), // kg
  complexion: validateLength(0, 50),
  
  // Documentation
  birthPlaceCode: validateLength(0, 20),
  philsysCardNumber: validatePhilSysNumber,
  
  // Family information
  motherMaidenFirst: validateName,
  motherMaidenMiddle: validateName,
  motherMaidenLast: validateName,
  
  // Education and employment
  educationAttainment: validateLength(0, 50),
  isGraduate: (value: any) => ({ isValid: typeof value === 'boolean', error: 'Must be true or false' }),
  employmentStatus: validateLength(0, 50),
  occupationCode: validateLength(0, 20),
  
  // Voting information
  isVoter: (value: any) => ({ isValid: typeof value === 'boolean', error: 'Must be true or false' }),
  isResidentVoter: (value: any) => ({ isValid: typeof value === 'boolean', error: 'Must be true or false' }),
  lastVotedDate: validateDate,
  
  // Household
  householdCode: validateLength(0, 50),
}, [
  // Cross-field validations
  crossFieldValidators.conditionalRequired('philsysCardNumber', 'birthPlaceCode'),
  crossFieldValidators.conditionalRequired('isVoter', 'lastVotedDate'),
]);

/**
 * Household data validation schema
 */
export const householdSchema = createFormValidator({
  code: composeValidators(validateRequired, validateLength(1, 50)),
  houseNumber: validateLength(0, 20),
  streetName: validateLength(0, 100),
  subdivisionName: validateLength(0, 100),
  barangayCode: composeValidators(validateRequired, validateLength(1, 20)),
  cityCode: composeValidators(validateRequired, validateLength(1, 20)),
  provinceCode: composeValidators(validateRequired, validateLength(1, 20)),
  regionCode: composeValidators(validateRequired, validateLength(1, 20)),
  zipCode: validateLength(0, 10),
});

/**
 * User data validation schema
 */
export const userSchema = createFormValidator({
  email: composeValidators(validateRequired, validateEmail),
  firstName: composeValidators(validateRequired, validateName),
  lastName: composeValidators(validateRequired, validateName),
  role: validateRequired,
  barangayCode: validateLength(0, 20),
  isActive: (value: any) => ({ isValid: typeof value === 'boolean', error: 'Must be true or false' }),
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
export const passwordChangeSchema = createFormValidator({
  currentPassword: composeValidators(validateRequired, validateLength(1, 100)),
  newPassword: composeValidators(
    validateRequired,
    validateLength(8, 100),
    createFieldValidator({
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      customMessage: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    })
  ),
  confirmPassword: composeValidators(validateRequired, validateLength(1, 100)),
}, [
  crossFieldValidators.fieldsMatch('newPassword', 'confirmPassword', 'Passwords must match'),
]);

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
  filters: (value: any) => ({ isValid: typeof value === 'object' && value !== null, error: 'Must be a valid object' }),
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
  data: any,
  context?: ValidationContext
): Promise<ValidationResult> {
  return await residentSchema(data, context);
}

/**
 * Validate household data
 */
export async function validateHouseholdData(
  data: any,
  context?: ValidationContext
): Promise<ValidationResult> {
  return await householdSchema(data, context);
}

/**
 * Validate user data
 */
export async function validateUserData(
  data: any,
  context?: ValidationContext
): Promise<ValidationResult> {
  return await userSchema(data, context);
}

/**
 * Validate login data
 */
export async function validateLoginData(
  data: any,
  context?: ValidationContext
): Promise<ValidationResult> {
  return await loginSchema(data, context);
}

/**
 * Validate password change data
 */
export async function validatePasswordChangeData(
  data: any,
  context?: ValidationContext
): Promise<ValidationResult> {
  return await passwordChangeSchema(data, context);
}

/**
 * Validate search query data
 */
export async function validateSearchQueryData(
  data: any,
  context?: ValidationContext
): Promise<ValidationResult> {
  return await searchQuerySchema(data, context);
}

/**
 * Validate file upload data
 */
export async function validateFileUploadData(
  data: any,
  context?: ValidationContext
): Promise<ValidationResult> {
  return await fileUploadSchema(data, context);
}