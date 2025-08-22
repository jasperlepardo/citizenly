/**
 * Validation Module Index
 * Centralized validation system for the application
 */

// Schema validators
export {
  validateResidentData,
  validateHouseholdData,
  validateUserData,
  residentSchema,
  householdSchema,
  userSchema,
  residentSchema as ResidentFormSchema,
} from './schemas';

// Field validators
export {
  validateEmail,
  validatePhilippineMobile,
  validatePhilSysNumber,
  validateName,
  validateAge,
  validateRequired,
  validateLength,
  validatePattern,
  composeValidators,
} from './fieldValidators';

// Form validators
export {
  createFormValidator,
  createFieldValidator,
  validateFormData,
  buildValidationErrors,
} from './formValidators';

// Input sanitizers
export {
  sanitizeInput,
  sanitizeHtml,
  sanitizePhilSysNumber,
  sanitizeName,
  sanitizePhone,
  sanitizeEmail,
} from './sanitizers';

// Validation utilities
export {
  isValidEmail,
  isValidPhilippineMobile,
  isValidPhilSysFormat,
  isValidName,
  isValidAge,
  formatValidationError,
  createValidationResult,
} from './utilities';

// Types
export type {
  ValidationResult,
  FieldValidator,
  FormValidator,
  ValidationError,
  ValidationContext,
  SanitizationOptions,
} from './types';