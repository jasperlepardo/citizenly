/**
 * Constants Module
 * Centralized application constants
 */

export * from './chart-sizes';
export * from './resident-form-defaults';

// Export specific non-conflicting items from generated-enums
export { 
  EDUCATION_LEVEL_OPTIONS, 
  ETHNICITY_OPTIONS, 
  RELIGION_OPTIONS,
  extractValues,
  getLabelByValue
} from './generated-enums';

// Export specific non-conflicting items from form-options  
export {
  BLOOD_TYPE_OPTIONS,
  CITIZENSHIP_OPTIONS,
  CIVIL_STATUS_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  SEX_OPTIONS
} from './form-options';

export type {
  BloodTypeValue,
  CitizenshipValue,
  CivilStatusValue,
  EmploymentStatusValue,
  SexValue
} from './form-options';

// Export resident-enums
export * from './resident-enums';

// API Error Codes
export const API_ERROR_CODES = {
  // Authentication
  AUTH_001: 'UNAUTHORIZED',
  AUTH_002: 'INVALID_TOKEN', 
  AUTH_003: 'TOKEN_EXPIRED',
  AUTH_004: 'INSUFFICIENT_PERMISSIONS',
  
  // Profile/User
  USER_001: 'PROFILE_NOT_FOUND',
  USER_002: 'BARANGAY_NOT_ASSIGNED',
  
  // Data Access
  DATA_001: 'RESOURCE_NOT_FOUND',
  DATA_002: 'QUERY_FAILED',
  DATA_003: 'DATABASE_ERROR',
  
  // Rate Limiting
  RATE_001: 'RATE_LIMIT_EXCEEDED',
  
  // Server
  SERVER_001: 'INTERNAL_ERROR',
  SERVER_002: 'SERVICE_UNAVAILABLE'
} as const;

// Standardized error response interface
export interface StandardErrorResponse {
  error: string;
  message: string;
  code: keyof typeof API_ERROR_CODES;
  timestamp: string;
}

// Helper function to create standardized error response objects (not Response instances)
export function createErrorResponseObject(
  code: keyof typeof API_ERROR_CODES,
  message: string
): StandardErrorResponse {
  return {
    error: API_ERROR_CODES[code],
    message,
    code,
    timestamp: new Date().toISOString()
  };
}

// Type for error codes
export type ErrorCode = keyof typeof API_ERROR_CODES;