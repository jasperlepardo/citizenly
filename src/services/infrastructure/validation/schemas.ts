/**
 * Validation Schemas
 * Pre-built validation schemas for common data types
 */

import type { LoginFormData, PasswordUpdateRequest } from '../../types/auth';
import type { HouseholdData } from '../../types/households';
import type { ResidentFormState } from '../../types/residents';
import type {
  SimpleValidationResult as ValidationResult,
  ValidationContext,
} from '../../types/validation';

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
    errors,
  };
}

/**
 * Consolidated validateField helper function
 * Eliminates duplicate code across all validation schemas
 */
async function validateField(
  errors: Record<string, string>,
  fieldName: string,
  value: any,
  validators: any[],
  data?: any
): Promise<void> {
  for (const validator of validators) {
    const result = await validator(value, fieldName, data);
    if (result !== null) {
      errors[fieldName] = result;
      break;
    }
  }
}

/**
 * Resident data validation schema
 */
export async function residentSchema(
  data: Partial<ResidentFormState>,
  context?: ValidationContext
): Promise<ValidationResult> {
  const errors: Record<string, string> = {};

  // Validate required fields
  await validateField(
    errors,
    'first_name',
    data.first_name,
    [validateRequired, validateName],
    data
  );
  await validateField(errors, 'last_name', data.last_name, [validateRequired, validateName], data);
  await validateField(errors, 'birthdate', data.birthdate, [validateRequired, validateDate], data);
  await validateField(errors, 'sex', data.sex, [validateRequired], data);

  // Validate optional fields
  if (data.middle_name !== undefined) {
    await validateField(errors, 'middle_name', data.middle_name, [validateName], data);
  }
  if (data.extension_name !== undefined) {
    await validateField(errors, 'extension_name', data.extension_name, [validateName], data);
  }
  if (data.email !== undefined) {
    await validateField(errors, 'email', data.email, [validateEmail], data);
  }
  if (data.mobile_number !== undefined) {
    await validateField(
      errors,
      'mobile_number',
      data.mobile_number,
      [validatePhilippineMobile],
      data
    );
  }
  if (data.telephone_number !== undefined) {
    await validateField(
      errors,
      'telephone_number',
      data.telephone_number,
      [validateLength(0, 20)],
      data
    );
  }
  if (data.civil_status !== undefined) {
    await validateField(errors, 'civil_status', data.civil_status, [validateLength(0, 50)], data);
  }
  if (data.citizenship !== undefined) {
    await validateField(errors, 'citizenship', data.citizenship, [validateLength(0, 50)], data);
  }
  if (data.blood_type !== undefined) {
    await validateField(errors, 'blood_type', data.blood_type, [validateLength(0, 10)], data);
  }
  if (data.ethnicity !== undefined) {
    await validateField(errors, 'ethnicity', data.ethnicity, [validateLength(0, 50)], data);
  }
  if (data.religion !== undefined) {
    await validateField(errors, 'religion', data.religion, [validateLength(0, 50)], data);
  }
  if (data.religion_others_specify !== undefined) {
    await validateField(
      errors,
      'religion_others_specify',
      data.religion_others_specify,
      [validateLength(0, 100)],
      data
    );
  }
  if (data.height !== undefined) {
    await validateField(errors, 'height', data.height, [validateRange(50, 300)], data);
  }
  if (data.weight !== undefined) {
    await validateField(errors, 'weight', data.weight, [validateRange(10, 500)], data);
  }
  if (data.complexion !== undefined) {
    await validateField(errors, 'complexion', data.complexion, [validateLength(0, 50)], data);
  }
  if (data.birth_place_code !== undefined) {
    await validateField(
      errors,
      'birth_place_code',
      data.birth_place_code,
      [validateLength(0, 20)],
      data
    );
  }
  if (data.philsys_card_number !== undefined) {
    await validateField(
      errors,
      'philsys_card_number',
      data.philsys_card_number,
      [validatePhilSysNumber],
      data
    );
  }
  if (data.mother_maiden_first !== undefined) {
    await validateField(
      errors,
      'mother_maiden_first',
      data.mother_maiden_first,
      [validateName],
      data
    );
  }
  if (data.mother_maiden_middle !== undefined) {
    await validateField(
      errors,
      'mother_maiden_middle',
      data.mother_maiden_middle,
      [validateName],
      data
    );
  }
  if (data.mother_maiden_last !== undefined) {
    await validateField(
      errors,
      'mother_maiden_last',
      data.mother_maiden_last,
      [validateName],
      data
    );
  }
  if (data.education_attainment !== undefined) {
    await validateField(
      errors,
      'education_attainment',
      data.education_attainment,
      [validateLength(0, 50)],
      data
    );
  }
  if (data.is_graduate !== undefined) {
    if (typeof data.is_graduate !== 'boolean') {
      errors['is_graduate'] = 'Must be true or false';
    }
  }
  if (data.employment_status !== undefined) {
    await validateField(
      errors,
      'employment_status',
      data.employment_status,
      [validateLength(0, 50)],
      data
    );
  }
  if (data.occupation_code !== undefined) {
    await validateField(
      errors,
      'occupation_code',
      data.occupation_code,
      [validateLength(0, 20)],
      data
    );
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
    await validateField(errors, 'last_voted_date', data.last_voted_date, [validateDate], data);
  }
  if (data.household_code !== undefined) {
    await validateField(
      errors,
      'household_code',
      data.household_code,
      [validateLength(0, 50)],
      data
    );
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

  // Validate required fields
  await validateField(errors, 'code', data.code, [validateRequired, validateLength(1, 50)], data);
  await validateField(
    errors,
    'barangay_code',
    data.barangay_code,
    [validateRequired, validateLength(1, 20)],
    data
  );

  // Validate optional fields
  if (data.name !== undefined) {
    await validateField(errors, 'name', data.name, [validateLength(0, 200)], data);
  }
  if (data.house_number !== undefined) {
    await validateField(errors, 'house_number', data.house_number, [validateLength(0, 50)], data);
  }
  if (data.street_id !== undefined) {
    await validateField(errors, 'street_id', data.street_id, [validateRequired], data);
  }
  if (data.subdivision_id !== undefined) {
    await validateField(
      errors,
      'subdivision_id',
      data.subdivision_id,
      [validateLength(0, 50)],
      data
    );
  }
  if (data.household_head_id !== undefined) {
    await validateField(
      errors,
      'household_head_id',
      data.household_head_id,
      [validateLength(0, 50)],
      data
    );
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

  // Validate required fields
  await validateField(errors, 'email', data.email, [validateRequired, validateEmail], data);
  await validateField(
    errors,
    'first_name',
    data.first_name,
    [validateRequired, validateName],
    data
  );
  await validateField(errors, 'last_name', data.last_name, [validateRequired, validateName], data);
  await validateField(errors, 'role', data.role, [validateRequired], data);

  // Validate optional fields
  if (data.barangay_code !== undefined) {
    await validateField(errors, 'barangay_code', data.barangay_code, [validateLength(0, 20)], data);
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

  // Validate required fields
  await validateField(errors, 'email', data.email, [validateRequired, validateEmail], data);
  await validateField(
    errors,
    'password',
    data.password,
    [validateRequired, validateLength(1, 100)],
    data
  );

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

  // Validate required fields
  await validateField(
    errors,
    'current_password',
    data.current_password,
    [validateRequired, validateLength(1, 100)],
    data
  );
  await validateField(
    errors,
    'new_password',
    data.new_password,
    [validateRequired, validateLength(8, 100)],
    data
  );
  await validateField(
    errors,
    'confirm_password',
    data.confirm_password,
    [validateRequired, validateLength(1, 100)],
    data
  );

  // Password complexity validation
  if (data.new_password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(data.new_password)) {
      errors['new_password'] =
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
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

  // Validate required fields
  await validateField(
    errors,
    'query',
    data.query,
    [validateRequired, validateLength(1, 100)],
    data
  );

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
    await validateField(errors, 'page', data.page, [validateRange(1, 1000)], data);
  }
  if (data.limit !== undefined) {
    await validateField(errors, 'limit', data.limit, [validateRange(1, 100)], data);
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

  // Validate required fields
  await validateField(
    errors,
    'fileName',
    data.fileName,
    [validateRequired, validateLength(1, 255)],
    data
  );
  await validateField(
    errors,
    'fileSize',
    data.fileSize,
    [validateRequired, validateRange(1, 5 * 1024 * 1024)],
    data
  );
  await validateField(errors, 'fileType', data.fileType, [validateRequired], data);

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
