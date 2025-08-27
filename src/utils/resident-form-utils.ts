/**
 * Resident Form Utility Functions
 * Philippine government standards and RA 10173 compliant form processing utilities.
 */

import { REQUIRED_FIELDS, FIELD_LABELS, DEFAULT_VALUES, VALIDATION_RULES } from '@/constants/resident-form';
import { sanitizeFormData, sanitizeNameInput, validateNameInput } from '@/utils/input-sanitizer';
import { ResidentFormData } from '@/types/forms';
import { philippineCompliantLogger } from '@/lib/security/philippine-logging';
import { calculateAge } from '@/utils/date-utils';
import type { SimpleValidationResult as ValidationResult } from '@/types/validation';

// Types moved to src/types/utilities.ts for consolidation
import type { 
  NameParts, 
  UnknownFormData,
  FormProcessingStage,
  FormProcessingOptions,
  ProcessedFormResult 
} from '@/types/utilities';

function isValidFormStructure(data: unknown): data is UnknownFormData {
  return data !== null && typeof data === 'object' && !Array.isArray(data);
}

function hasRequiredFormFields(data: UnknownFormData): boolean {
  return REQUIRED_FIELDS.every(field => field in data);
}

export function validateRequiredFields(formData: unknown): ValidationResult {
  if (!isValidFormStructure(formData)) {
    return {
      isValid: false,
      errors: { _form: 'Invalid form data structure provided' }
    };
  }

  const missingFields = REQUIRED_FIELDS.filter(field => {
    const value = formData[field];
    return !value || (typeof value === 'string' && value.trim() === '');
  });
  
  if (missingFields.length === 0) {
    return { isValid: true, errors: {} };
  }
  
  const missingLabels = missingFields.map(field => FIELD_LABELS[field] || field);
  return {
    isValid: false,
    errors: {
      _form: `Please fill in required fields: ${missingLabels.join(', ')}`
    }
  };
}

export function transformFormData(formData: UnknownFormData): ResidentFormData {
  if (!isValidFormStructure(formData)) {
    throw new Error('Invalid form data structure provided for transformation');
  }

  const sanitizedData = sanitizeFormData(formData as Record<string, any>);
  
  return {
    first_name: sanitizedData.first_name || '',
    middle_name: sanitizedData.middle_name || '',
    last_name: sanitizedData.last_name || '',
    extension_name: sanitizedData.extension_name || '',
    birthdate: sanitizedData.birthdate || '',
    sex: sanitizedData.sex as 'male' | 'female',
    civil_status: sanitizedData.civil_status || DEFAULT_VALUES.CIVIL_STATUS,
    citizenship: sanitizedData.citizenship || DEFAULT_VALUES.CITIZENSHIP,
    education_attainment: sanitizedData.education_attainment || '',
    is_graduate: sanitizedData.is_graduate !== undefined ? sanitizedData.is_graduate : DEFAULT_VALUES.IS_GRADUATE,
    occupation_code: sanitizedData.occupation_code || '',
    employment_status: sanitizedData.employment_status || DEFAULT_VALUES.EMPLOYMENT_STATUS,
    email: sanitizedData.email || '',
    mobile_number: sanitizedData.mobile_number || '',
    telephone_number: sanitizedData.telephone_number || '',
    philsys_card_number: sanitizedData.philsys_card_number || '',
    province_code: sanitizedData.province_code || '',
    city_municipality_code: sanitizedData.city_municipality_code || '',
    barangay_code: sanitizedData.barangay_code || '',
    household_code: sanitizedData.household_code || '',
    mother_maiden_first: sanitizedData.mother_maiden_first || '',
    mother_maiden_middle: sanitizedData.mother_maiden_middle || '',
    mother_maiden_last: sanitizedData.mother_maiden_last || '',
    height: sanitizedData.height || null,
    weight: sanitizedData.weight || null,
    complexion: sanitizedData.complexion || '',
    blood_type: sanitizedData.blood_type || '',
    religion: sanitizedData.religion || DEFAULT_VALUES.RELIGION,
    religion_others_specify: sanitizedData.religion_others_specify || '',
    ethnicity: sanitizedData.ethnicity || '',
    is_voter: sanitizedData.is_voter !== undefined ? sanitizedData.is_voter : null,
    is_resident_voter: sanitizedData.is_resident_voter !== undefined ? sanitizedData.is_resident_voter : null,
    last_voted_date: sanitizedData.last_voted_date || '',
    ...extractAdditionalFields(sanitizedData)
  };
}

function extractAdditionalFields(formData: any): Record<string, any> {
  const knownFields = new Set([
    ...REQUIRED_FIELDS,
    'middle_name', 'extension_name', 'civil_status', 'citizenship',
    'education_attainment', 'is_graduate', 'occupation_code', 'employment_status',
    'email', 'mobile_number', 'telephone_number', 'philsys_card_number',
    'region_code', 'province_code', 'city_municipality_code', 
    'barangay_code', 'household_code', 'mother_maiden_first',
    'mother_maiden_middle', 'mother_maiden_last', 'height', 'weight',
    'complexion', 'blood_type', 'religion', 'religion_others_specify',
    'ethnicity', 'is_voter', 'is_resident_voter', 'last_voted_date'
  ]);
  
  return Object.fromEntries(
    Object.entries(formData).filter(([key]) => !knownFields.has(key))
  );
}

export function parseFullName(fullName: string, useSecureMode = true): NameParts {
  if (!fullName?.trim()) {
    return { first_name: '', middleName: '', last_name: '' };
  }
  
  try {
    const processedName = useSecureMode ? sanitizeNameInput(fullName) : fullName.trim();
    
    if (useSecureMode && !validateNameInput(processedName)) {
      throw new Error('Invalid name format detected');
    }
    
    const nameParts = processedName.split(/\s+/).filter(Boolean);
    
    switch (nameParts.length) {
      case 0:
        return { first_name: '', middleName: '', last_name: '' };
        
      case 1:
        return {
          first_name: nameParts[0],
          middleName: '',
          last_name: ''
        };
        
      case 2:
        return {
          first_name: nameParts[0],
          middleName: '',
          last_name: nameParts[1]
        };
        
      case 3:
        return {
          first_name: nameParts[0],
          middleName: nameParts[1],
          last_name: nameParts[2]
        };
        
      default:
        return {
          first_name: nameParts[0],
          middleName: nameParts.slice(1, -1).join(' '),
          last_name: nameParts[nameParts.length - 1]
        };
    }
  } catch (error) {
    philippineCompliantLogger.debug('Name parsing security validation failed', {
      eventType: 'NAME_PARSING_VALIDATION_FAILED',
      error: error instanceof Error ? error.message : 'Unknown parsing error',
      useSecureMode,
      complianceFramework: 'RA_10173_BSP_808',
      timestamp: new Date().toISOString()
    });
    return { first_name: '', middleName: '', last_name: '' };
  }
}

/**
 * Validate form data comprehensively
 */
export function validateFormData(formData: any): ValidationResult {
  const errors: Record<string, string> = {};
  
  // Check required fields
  const requiredValidation = validateRequiredFields(formData);
  if (!requiredValidation.isValid) {
    Object.assign(errors, requiredValidation.errors);
  }
  
  // Validate email format if provided
  if (formData.email && !VALIDATION_RULES.EMAIL_PATTERN.test(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  // Validate mobile number format if provided
  if (formData.mobile_number && !VALIDATION_RULES.PHONE_PATTERN.test(formData.mobile_number)) {
    errors.mobile_number = 'Please enter a valid Philippine mobile number (e.g., +639123456789)';
  }
  
  // Validate PhilSys card number format if provided
  if (formData.philsys_card_number && !VALIDATION_RULES.PHILSYS_PATTERN.test(formData.philsys_card_number)) {
    errors.philsys_card_number = 'Please enter a valid PhilSys card number (XXXX-XXXX-XXXX)';
  }
  
  // Validate name fields
  ['first_name', 'middle_name', 'last_name'].forEach(field => {
    if (formData[field] && !VALIDATION_RULES.NAME_PATTERN.test(formData[field])) {
      errors[field] = `${FIELD_LABELS[field]} contains invalid characters`;
    }
  });
  
  // Validate age if birthdate provided
  if (formData.birthdate) {
    const age = calculateAge(formData.birthdate);
    if (age < VALIDATION_RULES.MIN_AGE || age > VALIDATION_RULES.MAX_AGE) {
      errors.birthdate = `Age must be between ${VALIDATION_RULES.MIN_AGE} and ${VALIDATION_RULES.MAX_AGE}`;
    }
  }
  
  // Validate physical measurements
  if (formData.height && (formData.height < VALIDATION_RULES.MIN_HEIGHT || formData.height > VALIDATION_RULES.MAX_HEIGHT)) {
    errors.height = `Height must be between ${VALIDATION_RULES.MIN_HEIGHT} and ${VALIDATION_RULES.MAX_HEIGHT} cm`;
  }
  
  if (formData.weight && (formData.weight < VALIDATION_RULES.MIN_WEIGHT || formData.weight > VALIDATION_RULES.MAX_WEIGHT)) {
    errors.weight = `Weight must be between ${VALIDATION_RULES.MIN_WEIGHT} and ${VALIDATION_RULES.MAX_WEIGHT} kg`;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Calculate age from birthdate
 */
// calculateAge moved to date-utils.ts - use that version instead
// export function calculateAge... // REMOVED DUPLICATE

/**
 * Generate secure form submission data with audit trail
 */
// Import statements moved to top of file

/**
 * Unified form processing function with configurable stages
 * Consolidates transformFormData and prepareFormSubmission functionality
 * @param formData - Form data from external sources (validated at runtime)
 * @param options - Processing configuration options
 * @returns Processed form result with optional audit information
 */
export function processFormData(
  formData: UnknownFormData,
  options: FormProcessingOptions = { stage: 'full' }
): ProcessedFormResult {
  const { stage = 'full', userId = '', sessionId = '', barangayCode = '' } = options;
  
  // Stage 1: Basic transformation (always performed)
  const transformedData = transformFormData(formData);
  
  // Early return for basic transformation
  if (stage === 'transform') {
    return { transformedData };
  }
  
  // Stage 2: Security and audit info generation
  if (stage === 'full' || stage === 'audit') {
    const auditInfo = {
      userId,
      sessionId,
      barangayCode,
      timestamp: new Date().toISOString(),
      fieldCount: Object.keys(formData).length,
      hasPhilSys: !!formData.philsys_card_number,
      hasVoterData: !!(formData.is_voter || formData.is_resident_voter)
    };
    
    return {
      transformedData,
      auditInfo
    };
  }
  
  return { transformedData };
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use processFormData with stage: 'full' instead
 * @param formData - Form data from external sources (validated at runtime)
 * @param userId - User identifier for audit trail
 * @param sessionId - Session identifier for security tracking
 * @param barangayCode - Barangay code for geographic context
 * @returns Legacy format result with transformed data and audit info
 */
export function prepareFormSubmission(
  formData: UnknownFormData,
  userId: string,
  sessionId: string,
  barangayCode: string
): {
  transformedData: ResidentFormData;
  auditInfo: {
    userId: string;
    sessionId: string;
    barangayCode: string;
    timestamp: string;
    fieldCount: number;
    hasPhilSys: boolean;
    hasVoterData: boolean;
  };
} {
  const result = processFormData(formData, {
    stage: 'full',
    userId,
    sessionId,
    barangayCode
  });
  
  return {
    transformedData: result.transformedData,
    auditInfo: {
      ...result.auditInfo!,
      hasVoterData: !!(formData.is_voter || formData.is_resident_voter)
    }
  };
}

/**
 * Get field validation error message
 */
export function getFieldErrorMessage(field: string, value: any): string | null {
  if (!value) return null;
  
  switch (field) {
    case 'email':
      return VALIDATION_RULES.EMAIL_PATTERN.test(value) ? null : 'Invalid email format';
      
    case 'mobile_number':
    case 'telephone_number':
      return VALIDATION_RULES.PHONE_PATTERN.test(value) ? null : 'Invalid phone number format';
      
    case 'philsys_card_number':
      return VALIDATION_RULES.PHILSYS_PATTERN.test(value) ? null : 'Invalid PhilSys card format (XXXX-XXXX-XXXX)';
      
    case 'first_name':
    case 'middle_name':
    case 'last_name':
    case 'extension_name':
      return VALIDATION_RULES.NAME_PATTERN.test(value) ? null : 'Name contains invalid characters';
      
    default:
      return null;
  }
}

/**
 * Check if form data has changed significantly (for preventing duplicate submissions)
 */
export function hasSignificantChanges(oldData: any, newData: any): boolean {
  const significantFields = ['first_name', 'last_name', 'birthdate', 'philsys_card_number', 'household_code'];
  
  return significantFields.some(field => oldData[field] !== newData[field]);
}

/**
 * Generate form summary for audit purposes (non-PII)
 */
export function generateFormSummary(formData: any): Record<string, any> {
  return {
    hasPersonalInfo: !!(formData.first_name && formData.last_name),
    hasContactInfo: !!(formData.email || formData.mobile_number),
    hasPhilSysCard: !!formData.philsys_card_number,
    hasVoterInfo: !!(formData.is_voter || formData.is_resident_voter),
    hasHouseholdAssignment: !!formData.household_code,
    educationLevel: formData.education_attainment || 'not_specified',
    employmentStatus: formData.employment_status || 'not_specified',
    civilStatus: formData.civil_status || 'not_specified',
    citizenship: formData.citizenship || 'not_specified',
    fieldCount: Object.keys(formData).length
  };
}