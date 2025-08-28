/**
 * Validation Schemas
 * Pre-built validation schemas for common data types
 */

import type { LoginFormData, PasswordUpdateRequest } from '../../types/auth';
import type { HouseholdData } from '../../types/households';
import type { ResidentFormState } from '../../types/residents';
import type { SimpleValidationResult as ValidationResult, ValidationContext } from '../../types/validation';

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

/**
 * Helper function to create validation results
 */
function createValidationResult(
  isValid: boolean,
  errors: Record<string, string> = {}
): ValidationResult {
  return {
    isValid,
    errors
  };
}




/**
 * Resident data validation schema
 */
export async function residentSchema(
  data: Partial<ResidentFormState>,
  context?: ValidationContext
): Promise<ValidationResult> {
  const errors: Record<string, string> = {};
  
  // Helper function to validate a field
  const validateField = async (fieldName: string, value: any, validators: any[]) => {
    for (const validator of validators) {
      const result = await validator(value, fieldName, data);
      if (result !== null) {
        errors[fieldName] = result;
        break;
      }
    }
  };

  // Validate required fields
  await validateField('first_name', data.first_name, [validateRequired, validateName]);
  await validateField('last_name', data.last_name, [validateRequired, validateName]);
  await validateField('birthdate', data.birthdate, [validateRequired, validateDate]);
  await validateField('sex', data.sex, [validateRequired]);

  // Validate optional fields
  if (data.middle_name !== undefined) {
    await validateField('middle_name', data.middle_name, [validateName]);
  }
  if (data.extension_name !== undefined) {
    await validateField('extension_name', data.extension_name, [validateName]);
  }
  if (data.email !== undefined) {
    await validateField('email', data.email, [validateEmail]);
  }
  if (data.mobile_number !== undefined) {
    await validateField('mobile_number', data.mobile_number, [validatePhilippineMobile]);
  }
  if (data.telephone_number !== undefined) {
    await validateField('telephone_number', data.telephone_number, [validateLength(0, 20)]);
  }
  if (data.civil_status !== undefined) {
    await validateField('civil_status', data.civil_status, [validateLength(0, 50)]);
  }
  if (data.citizenship !== undefined) {
    await validateField('citizenship', data.citizenship, [validateLength(0, 50)]);
  }
  if (data.blood_type !== undefined) {
    await validateField('blood_type', data.blood_type, [validateLength(0, 10)]);
  }
  if (data.ethnicity !== undefined) {
    await validateField('ethnicity', data.ethnicity, [validateLength(0, 50)]);
  }
  if (data.religion !== undefined) {
    await validateField('religion', data.religion, [validateLength(0, 50)]);
  }
  if (data.religion_others_specify !== undefined) {
    await validateField('religion_others_specify', data.religion_others_specify, [validateLength(0, 100)]);
  }
  if (data.height !== undefined) {
    await validateField('height', data.height, [validateRange(50, 300)]);
  }
  if (data.weight !== undefined) {
    await validateField('weight', data.weight, [validateRange(10, 500)]);
  }
  if (data.complexion !== undefined) {
    await validateField('complexion', data.complexion, [validateLength(0, 50)]);
  }
  if (data.birth_place_code !== undefined) {
    await validateField('birth_place_code', data.birth_place_code, [validateLength(0, 20)]);
  }
  if (data.philsys_card_number !== undefined) {
    await validateField('philsys_card_number', data.philsys_card_number, [validatePhilSysNumber]);
  }
  if (data.mother_maiden_first !== undefined) {
    await validateField('mother_maiden_first', data.mother_maiden_first, [validateName]);
  }
  if (data.mother_maiden_middle !== undefined) {
    await validateField('mother_maiden_middle', data.mother_maiden_middle, [validateName]);
  }
  if (data.mother_maiden_last !== undefined) {
    await validateField('mother_maiden_last', data.mother_maiden_last, [validateName]);
  }
  if (data.education_attainment !== undefined) {
    await validateField('education_attainment', data.education_attainment, [validateLength(0, 50)]);
  }
  if (data.is_graduate !== undefined) {
    if (typeof data.is_graduate !== 'boolean') {
      errors['is_graduate'] = 'Must be true or false';
    }
  }
  if (data.employment_status !== undefined) {
    await validateField('employment_status', data.employment_status, [validateLength(0, 50)]);
  }
  if (data.occupation_code !== undefined) {
    await validateField('occupation_code', data.occupation_code, [validateLength(0, 20)]);
  }
  if (data.is_voter !== undefined) {
    if (typeof data.is_voter !== 'boolean') {
      errors['is_voter'] = 'Must be true or false';
    }
  }
  if (data.is_resident_voter !== undefined) {
    if (typeof data.is_resident_voter !== 'boolean') {
      errors['is_resident_voter'] = 'Must be true or false';
    }
  }
  if (data.last_voted_date !== undefined) {
    await validateField('last_voted_date', data.last_voted_date, [validateDate]);
  }
  if (data.household_code !== undefined) {
    await validateField('household_code', data.household_code, [validateLength(0, 50)]);
  }

  // Cross-field validations
  if (data.philsys_card_number && !data.birth_place_code) {
    errors['birth_place_code'] = 'Birth place code is required when PhilSys number is provided';
  }
  if (data.is_voter && !data.last_voted_date) {
    errors['last_voted_date'] = 'Last voted date is required when voter status is true';
  }

  return createValidationResult(Object.keys(errors).length === 0, errors);
}

/**
 * Household data validation schema
 */
export async function householdSchema(
  data: Partial<HouseholdData>,
  context?: ValidationContext
): Promise<ValidationResult> {
  const errors: Record<string, string> = {};
  
  // Helper function to validate a field
  const validateField = async (fieldName: string, value: any, validators: any[]) => {
    for (const validator of validators) {
      const result = await validator(value, fieldName, data);
      if (result !== null) {
        errors[fieldName] = result;
        break;
      }
    }
  };

  // Validate required fields
  await validateField('code', data.code, [validateRequired, validateLength(1, 50)]);
  await validateField('barangay_code', data.barangay_code, [validateRequired, validateLength(1, 20)]);

  // Validate optional fields
  if (data.name !== undefined) {
    await validateField('name', data.name, [validateLength(0, 200)]);
  }
  if (data.house_number !== undefined) {
    await validateField('house_number', data.house_number, [validateLength(0, 50)]);
  }
  if (data.street_id !== undefined) {
    await validateField('street_id', data.street_id, [validateRequired]);
  }
  if (data.subdivision_id !== undefined) {
    await validateField('subdivision_id', data.subdivision_id, [validateLength(0, 50)]);
  }
  if (data.household_head_id !== undefined) {
    await validateField('household_head_id', data.household_head_id, [validateLength(0, 50)]);
  }

  return createValidationResult(Object.keys(errors).length === 0, errors);
}

/**
 * User data validation schema
 */
export async function userSchema(
  data: Record<string, any>,
  context?: ValidationContext
): Promise<ValidationResult> {
  const errors: Record<string, string> = {};
  
  // Helper function to validate a field
  const validateField = async (fieldName: string, value: any, validators: any[]) => {
    for (const validator of validators) {
      const result = await validator(value, fieldName, data);
      if (result !== null) {
        errors[fieldName] = result;
        break;
      }
    }
  };

  // Validate required fields
  await validateField('email', data.email, [validateRequired, validateEmail]);
  await validateField('first_name', data.first_name, [validateRequired, validateName]);
  await validateField('last_name', data.last_name, [validateRequired, validateName]);
  await validateField('role', data.role, [validateRequired]);

  // Validate optional fields
  if (data.barangay_code !== undefined) {
    await validateField('barangay_code', data.barangay_code, [validateLength(0, 20)]);
  }
  if (data.is_active !== undefined) {
    if (typeof data.is_active !== 'boolean') {
      errors['is_active'] = 'Must be true or false';
    }
  }

  return createValidationResult(Object.keys(errors).length === 0, errors);
}

/**
 * Login validation schema
 */
export async function loginSchema(
  data: Partial<LoginFormData>,
  context?: ValidationContext
): Promise<ValidationResult> {
  const errors: Record<string, string> = {};
  
  // Helper function to validate a field
  const validateField = async (fieldName: string, value: any, validators: any[]) => {
    for (const validator of validators) {
      const result = await validator(value, fieldName, data);
      if (result !== null) {
        errors[fieldName] = result;
        break;
      }
    }
  };

  // Validate required fields
  await validateField('email', data.email, [validateRequired, validateEmail]);
  await validateField('password', data.password, [validateRequired, validateLength(1, 100)]);

  return createValidationResult(Object.keys(errors).length === 0, errors);
}

/**
 * Password change validation schema
 */
export async function passwordChangeSchema(
  data: Partial<PasswordUpdateRequest>,
  context?: ValidationContext
): Promise<ValidationResult> {
  const errors: Record<string, string> = {};
  
  // Helper function to validate a field
  const validateField = async (fieldName: string, value: any, validators: any[]) => {
    for (const validator of validators) {
      const result = await validator(value, fieldName, data);
      if (result !== null) {
        errors[fieldName] = result;
        break;
      }
    }
  };

  // Validate required fields
  await validateField('current_password', data.current_password, [validateRequired, validateLength(1, 100)]);
  await validateField('new_password', data.new_password, [validateRequired, validateLength(8, 100)]);
  await validateField('confirm_password', data.confirm_password, [validateRequired, validateLength(1, 100)]);

  // Password complexity validation
  if (data.new_password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(data.new_password)) {
      errors['new_password'] = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
    }
  }

  // Password match validation
  if (data.new_password !== data.confirm_password) {
    errors['confirm_password'] = 'Passwords must match';
  }

  return createValidationResult(Object.keys(errors).length === 0, errors);
}

/**
 * Search query validation schema
 */
export async function searchQuerySchema(
  data: { query?: string; filters?: Record<string, unknown>; page?: number; limit?: number },
  context?: ValidationContext
): Promise<ValidationResult> {
  const errors: Record<string, string> = {};
  
  // Helper function to validate a field
  const validateField = async (fieldName: string, value: any, validators: any[]) => {
    for (const validator of validators) {
      const result = await validator(value, fieldName, data);
      if (result !== null) {
        errors[fieldName] = result;
        break;
      }
    }
  };

  // Validate required fields
  await validateField('query', data.query, [validateRequired, validateLength(1, 100)]);

  // Search query pattern validation
  if (data.query) {
    const queryPattern = /^[a-zA-Z0-9\s\-_.@]*$/;
    if (!queryPattern.test(data.query)) {
      errors['query'] = 'Search query contains invalid characters';
    }
  }

  // Validate optional fields
  if (data.filters !== undefined) {
    if (typeof data.filters !== 'object' || data.filters === null) {
      errors['filters'] = 'Must be a valid object';
    }
  }
  if (data.page !== undefined) {
    await validateField('page', data.page, [validateRange(1, 1000)]);
  }
  if (data.limit !== undefined) {
    await validateField('limit', data.limit, [validateRange(1, 100)]);
  }

  return createValidationResult(Object.keys(errors).length === 0, errors);
}

/**
 * File upload validation schema
 */
export async function fileUploadSchema(
  data: { fileName?: string; fileSize?: number; fileType?: string },
  context?: ValidationContext
): Promise<ValidationResult> {
  const errors: Record<string, string> = {};
  
  // Helper function to validate a field
  const validateField = async (fieldName: string, value: any, validators: any[]) => {
    for (const validator of validators) {
      const result = await validator(value, fieldName, data);
      if (result !== null) {
        errors[fieldName] = result;
        break;
      }
    }
  };

  // Validate required fields
  await validateField('fileName', data.fileName, [validateRequired, validateLength(1, 255)]);
  await validateField('fileSize', data.fileSize, [validateRequired, validateRange(1, 5 * 1024 * 1024)]);
  await validateField('fileType', data.fileType, [validateRequired]);

  // File name pattern validation
  if (data.fileName) {
    const fileNamePattern = /^[a-zA-Z0-9\s\-_.]*$/;
    if (!fileNamePattern.test(data.fileName)) {
      errors['fileName'] = 'File name contains invalid characters';
    }
  }

  // File type pattern validation
  if (data.fileType) {
    const fileTypePattern = /^(image\/(jpeg|jpg|png|gif|webp)|application\/pdf)$/;
    if (!fileTypePattern.test(data.fileType)) {
      errors['fileType'] = 'File type not allowed';
    }
  }

  return createValidationResult(Object.keys(errors).length === 0, errors);
}

/**
 * Validate resident data
 */
export async function validateResidentData(
  data: Partial<ResidentFormState>,
  context?: ValidationContext
): Promise<ValidationResult> {
  return await residentSchema(data, context);
}

/**
 * Validate household data
 */
export async function validateHouseholdData(
  data: Partial<HouseholdData>,
  context?: ValidationContext
): Promise<ValidationResult> {
  return await householdSchema(data, context);
}

/**
 * Validate user data
 */
export async function validateUserData(
  data: Record<string, any>,
  context?: ValidationContext
): Promise<ValidationResult> {
  return await userSchema(data, context);
}

/**
 * Validate login data
 */
export async function validateLoginData(
  data: Partial<LoginFormData>,
  context?: ValidationContext
): Promise<ValidationResult> {
  return await loginSchema(data, context);
}

/**
 * Validate password change data
 */
export async function validatePasswordChangeData(
  data: Partial<PasswordUpdateRequest>,
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
