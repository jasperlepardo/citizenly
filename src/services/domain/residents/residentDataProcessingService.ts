/**
 * Resident Data Processing Service
 * 
 * Domain service for resident data processing, validation, transformation,
 * and audit trail generation following Philippine government standards.
 * 
 * Extracted from utils/residents/residentDataProcessing.ts to maintain
 * proper architectural boundaries (business logic belongs in services).
 */

import {
  REQUIRED_FIELDS,
  FIELD_LABELS,
  DEFAULT_VALUES,
  VALIDATION_RULES,
} from '@/constants/residentForm';
import { philippineCompliantLogger } from '@/lib/security/philippineLogging';
import { ResidentFormData } from '@/types/domain/residents/forms';
import type {
  NameParts,
  UnknownFormData,
  FormProcessingOptions,
  ProcessedFormResult,
} from '@/types/shared/utilities/utilities';
import type { SimpleValidationResult as ValidationResult } from '@/types/shared/validation/validation';
import { calculateAge } from '@/utils/shared/dateUtils';
import { sanitizeInput, sanitizeNameInput, validateNameInput } from '@/utils/auth/sanitizationUtils';

/**
 * Domain service for resident data processing operations
 */
export class ResidentDataProcessingService {
  private static isValidFormStructure(data: unknown): data is UnknownFormData {
    return data !== null && typeof data === 'object' && !Array.isArray(data);
  }

  /**
   * Validates required fields according to Philippine barangay standards
   */
  public static validateRequiredFields(formData: unknown): ValidationResult {
    if (!this.isValidFormStructure(formData)) {
      return {
        isValid: false,
        errors: { _form: 'Invalid form data structure provided' },
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
        _form: `Required fields missing: ${missingLabels.join(', ')}`,
      },
    };
  }

  /**
   * Validates form data structure and content
   */
  public static validateFormData(formData: unknown): ValidationResult {
    if (!this.isValidFormStructure(formData)) {
      return {
        isValid: false,
        errors: { _form: 'Form data must be a valid object' },
      };
    }

    // Start with required fields validation
    const requiredFieldsResult = this.validateRequiredFields(formData);
    if (!requiredFieldsResult.isValid) {
      return requiredFieldsResult;
    }

    const errors: Record<string, string> = {};

    // Name validation
    if (formData.first_name && !validateNameInput(formData.first_name)) {
      errors.first_name = 'First name contains invalid characters';
    }
    if (formData.last_name && !validateNameInput(formData.last_name)) {
      errors.last_name = 'Last name contains invalid characters';
    }
    if (formData.middle_name && !validateNameInput(formData.middle_name)) {
      errors.middle_name = 'Middle name contains invalid characters';
    }

    // Email validation
    if (formData.email && !VALIDATION_RULES.EMAIL_PATTERN.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    // Phone number validation
    if (formData.mobile_number && !VALIDATION_RULES.PHONE_PATTERN.test(formData.mobile_number)) {
      errors.mobile_number = 'Invalid Philippine mobile number format';
    }

    // PhilSys number validation
    if (formData.philsys_card_number && !VALIDATION_RULES.PHILSYS_PATTERN.test(formData.philsys_card_number)) {
      errors.philsys_card_number = 'Invalid PhilSys card number format (####-####-####)';
    }

    // Age validation
    if (formData.birthdate) {
      const age = calculateAge(formData.birthdate);
      if (age < VALIDATION_RULES.MIN_AGE || age > VALIDATION_RULES.MAX_AGE) {
        errors.birthdate = `Age must be between ${VALIDATION_RULES.MIN_AGE} and ${VALIDATION_RULES.MAX_AGE}`;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Transforms and sanitizes form data according to Philippine standards
   */
  public static transformFormData(formData: UnknownFormData): ResidentFormData {
    const sanitizedData: Record<string, any> = {};

    // Sanitize all string fields
    for (const [key, value] of Object.entries(formData)) {
      if (typeof value === 'string') {
        if (['first_name', 'middle_name', 'last_name', 'extension_name'].includes(key)) {
          sanitizedData[key] = sanitizeNameInput(value);
        } else {
          sanitizedData[key] = sanitizeInput(value);
        }
      } else {
        sanitizedData[key] = value;
      }
    }

    // Apply default values for missing fields
    const transformedData: ResidentFormData = {
      id: sanitizedData.id || '',
      first_name: sanitizedData.first_name || '',
      middle_name: sanitizedData.middle_name || '',
      last_name: sanitizedData.last_name || '',
      extension_name: sanitizedData.extension_name || '',
      birthdate: sanitizedData.birthdate || '',
      sex: sanitizedData.sex || DEFAULT_VALUES.SEX,
      civil_status: sanitizedData.civil_status || DEFAULT_VALUES.CIVIL_STATUS,
      citizenship: sanitizedData.citizenship || DEFAULT_VALUES.CITIZENSHIP,
      
      // Contact information
      email: sanitizedData.email || '',
      mobile_number: sanitizedData.mobile_number || '',
      telephone_number: sanitizedData.telephone_number || '',
      philsys_card_number: sanitizedData.philsys_card_number || '',
      
      // Address information
      region_code: sanitizedData.region_code || '',
      province_code: sanitizedData.province_code || '',
      city_municipality_code: sanitizedData.city_municipality_code || '',
      barangay_code: sanitizedData.barangay_code || '',
      
      // Education & employment
      education_attainment: sanitizedData.education_attainment || null,
      is_graduate: sanitizedData.is_graduate ?? DEFAULT_VALUES.IS_GRADUATE,
      employment_status: sanitizedData.employment_status ?? DEFAULT_VALUES.EMPLOYMENT_STATUS,
      occupation_code: sanitizedData.occupation_code || null,
      
      // Birth place information
      birth_place_code: sanitizedData.birth_place_code || null,
      
      // Family information
      mother_maiden_first: sanitizedData.mother_maiden_first || '',
      mother_maiden_middle: sanitizedData.mother_maiden_middle || '',
      mother_maiden_last: sanitizedData.mother_maiden_last || '',
      
      // Additional fields
      religion: sanitizedData.religion || DEFAULT_VALUES.RELIGION,
      ethnicity: sanitizedData.ethnicity || null,
      blood_type: sanitizedData.blood_type || null,
      height: sanitizedData.height || null,
      weight: sanitizedData.weight || null,
      
      // Voting information
      is_voter: sanitizedData.is_voter ?? DEFAULT_VALUES.IS_VOTER,
      is_resident_voter: sanitizedData.is_resident_voter ?? DEFAULT_VALUES.IS_RESIDENT_VOTER,
      
      // Household information
      household_code: sanitizedData.household_code || '',
      
      // System fields
      is_active: sanitizedData.is_active ?? true,
      created_at: sanitizedData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return transformedData;
  }

  /**
   * Parses and validates full name components
   */
  public static parseFullName(fullName: string): NameParts {
    if (!fullName || typeof fullName !== 'string') {
      return { first: '', middle: '', last: '', extension: '' };
    }

    const cleanName = sanitizeNameInput(fullName.trim());
    const parts = cleanName.split(/\s+/);

    if (parts.length === 1) {
      return { first: parts[0], middle: '', last: '', extension: '' };
    }

    if (parts.length === 2) {
      return { first: parts[0], middle: '', last: parts[1], extension: '' };
    }

    if (parts.length >= 3) {
      const lastPart = parts[parts.length - 1];
      const isExtension = ['Jr', 'Sr', 'II', 'III', 'IV', 'V'].includes(lastPart);
      
      if (isExtension && parts.length >= 4) {
        return {
          first: parts[0],
          middle: parts.slice(1, -2).join(' '),
          last: parts[parts.length - 2],
          extension: lastPart,
        };
      } else if (isExtension) {
        return {
          first: parts[0],
          middle: '',
          last: parts[parts.length - 2],
          extension: lastPart,
        };
      } else {
        return {
          first: parts[0],
          middle: parts.slice(1, -1).join(' '),
          last: lastPart,
          extension: '',
        };
      }
    }

    return { first: '', middle: '', last: '', extension: '' };
  }

  /**
   * Prepares form data for submission with audit trail
   */
  public static prepareFormSubmission(
    formData: UnknownFormData,
    userId: string,
    sessionId: string,
    barangayCode: string,
    options: FormProcessingOptions = {}
  ): ProcessedFormResult {
    const startTime = Date.now();

    try {
      // Validate form data
      const validationResult = this.validateFormData(formData);
      if (!validationResult.isValid) {
        philippineCompliantLogger.warn('FORM_VALIDATION_FAILED', {
          sessionId,
          userId,
          barangayCode,
          validationErrors: validationResult.errors,
          timestamp: new Date().toISOString(),
        }
        );

        return {
          success: false,
          errors: validationResult.errors,
          data: null,
          processingTime: Date.now() - startTime,
          auditTrail: {
            action: 'form_validation',
            userId,
            sessionId,
            timestamp: new Date().toISOString(),
            success: false,
            errors: validationResult.errors,
          },
        };
      }

      // Transform and sanitize data
      const transformedData = this.transformFormData(formData);

      // Generate audit trail
      const auditTrail = {
        action: 'form_processing',
        userId,
        sessionId,
        barangayCode,
        timestamp: new Date().toISOString(),
        success: true,
        dataProcessed: Object.keys(formData).length,
        processingTime: Date.now() - startTime,
        compliance: {
          ra10173: true,
          dataPrivacyCompliant: true,
          auditTrailGenerated: true,
        },
      };

      philippineCompliantLogger.info('FORM_PROCESSING_SUCCESS', auditTrail);

      return {
        success: true,
        errors: {},
        data: transformedData,
        processingTime: Date.now() - startTime,
        auditTrail,
      };
    } catch (error) {
      philippineCompliantLogger.error('FORM_PROCESSING_ERROR', {
        sessionId,
        userId,
        barangayCode,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });

      return {
        success: false,
        errors: { _form: 'Internal processing error occurred' },
        data: null,
        processingTime: Date.now() - startTime,
        auditTrail: {
          action: 'form_processing',
          userId,
          sessionId,
          timestamp: new Date().toISOString(),
          success: false,
          error: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }
}

// Export individual methods for backward compatibility during transition
export const validateRequiredFields = ResidentDataProcessingService.validateRequiredFields.bind(ResidentDataProcessingService);
export const validateFormData = ResidentDataProcessingService.validateFormData.bind(ResidentDataProcessingService);
export const transformFormData = ResidentDataProcessingService.transformFormData.bind(ResidentDataProcessingService);
export const parseFullName = ResidentDataProcessingService.parseFullName.bind(ResidentDataProcessingService);
export const prepareFormSubmission = ResidentDataProcessingService.prepareFormSubmission.bind(ResidentDataProcessingService);