/**
 * Validation Schemas
 * Pre-built validation schemas for common data types
 */

import type { LoginFormData, PasswordUpdateRequest } from '@/types/app/auth/auth';
import type { HouseholdData } from '@/types/domain/households/households';

import type {
  SimpleValidationResult as ValidationResult,
  ValidationContext,
  FieldValidator,
} from '../../../types/shared/validation/validation';

import {
  validateRequired,
  validateEmail,
  validateName,
  validateLength,
  validateRange,
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
  value: unknown,
  validators: FieldValidator[],
  data?: Record<string, unknown>
): Promise<void> {
  for (const validator of validators) {
    const result = await validator(value, fieldName, data || {});
    if (result !== null) {
      errors[fieldName] = result;
      break;
    }
  }
}


/**
 * Household data validation schema
 */
export async function householdSchema(
  data: Partial<HouseholdData>,
  _context?: ValidationContext
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
  data: Record<string, unknown>,
  _context?: ValidationContext
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
  _context?: ValidationContext
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
  _context?: ValidationContext
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
  _context?: ValidationContext
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
  _context?: ValidationContext
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
  data: Record<string, unknown>,
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
