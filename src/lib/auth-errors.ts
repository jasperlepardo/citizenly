// Enhanced error handling for user authentication and profile creation
// Based on docs/USER_CREATION_IMPLEMENTATION_PLAN.md

export const AUTH_ERROR_MESSAGES = {
  // Exact error messages from database function
  'User not found in authentication system': 
    'User account setup is still in progress. Please wait a moment and try again.',
  'Role "barangay_admin" not found in system': 
    'System configuration error. Please contact technical support.',
  'Invalid or inactive barangay code': 
    'The selected barangay is not valid or is currently inactive. Please choose a different barangay.',
  'A user profile with this information already exists': 
    'An account with this information already exists. Please try signing in instead.',
  'Referenced data not found (user, role, or location)': 
    'Some required system data is missing. Please contact support.',
  'Database operation failed': 
    'A technical error occurred. Please try again or contact support if the problem persists.',
  // Pattern matching for dynamic error messages
  'User not found in authentication system with ID:': 
    'Account setup is taking longer than expected. Please try again in a few moments.'
} as const;

export function getErrorMessage(error: string): string {
  // First try exact match
  const exactMatch = AUTH_ERROR_MESSAGES[error as keyof typeof AUTH_ERROR_MESSAGES];
  if (exactMatch) {
    return exactMatch;
  }
  
  // Try pattern matching for dynamic error messages
  if (error.startsWith('User not found in authentication system with ID:')) {
    return 'Account setup is taking longer than expected. Please try again in a few moments.';
  }
  
  if (error.includes('Role "') && error.includes('" not found in system')) {
    return 'System configuration error. Please contact technical support.';
  }
  
  if (error.startsWith('Invalid or inactive barangay code:')) {
    return 'The selected barangay is not valid or is currently inactive. Please choose a different barangay.';
  }
  
  // Default fallback
  return error;
}

// HTTP status code mapping for database errors
export function getStatusCodeForError(errorCode?: string): number {
  const errorMap: Record<string, number> = {
    'DUPLICATE_PROFILE': 409, // Conflict
    'INVALID_REFERENCE': 400, // Bad Request
    'USER_NOT_FOUND': 404,    // Not Found
  };
  
  return errorMap[errorCode || ''] || 500; // Default to 500
}

// Database response interface
export interface DatabaseResponse {
  success: boolean;
  error?: string;
  error_code?: string;
  details?: string;
  profile_id?: string;
  user_data?: Record<string, unknown>;
  role_data?: Record<string, unknown>;
  location_data?: Record<string, unknown>;
  message?: string;
}