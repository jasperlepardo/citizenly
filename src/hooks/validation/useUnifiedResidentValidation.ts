'use client';

/**
 * Unified Resident Validation Hook
 * 
 * @description Consolidated validation hook that combines functionality from:
 * - useResidentValidation
 * - useOptimizedResidentValidation  
 * - useResidentValidationCore
 * - useResidentValidationErrors
 * - useResidentValidationProgress
 * 
 * This reduces the 6+ validation hooks to a single, comprehensive hook.
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { z } from 'zod';

import { CRITICAL_VALIDATION_FIELDS } from '@/constants/residentFormDefaults';
import { useResidentAsyncValidation } from '@/hooks/utilities/useResidentAsyncValidation';
import { useResidentCrossFieldValidation } from '@/hooks/utilities/useResidentCrossFieldValidation';
import { REQUIRED_FIELDS } from '@/services/infrastructure/validation/fieldValidators';
import type {
  ResidentFormData,
  ResidentValidationOptions,
  ValidationResult,
  FieldValidationResult,
  ValidationSummary,
  SectionValidationStatus,
} from '@/types/shared/hooks/utilityHooks';

/**
 * Comprehensive resident validation schema
 */
const residentValidationSchema = z
  .object({
    // Personal Information
    last_name: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
    first_name: z.string().min(1, 'First name is required').max(50, 'First name too long'),
    middle_name: z.string().max(50, 'Middle name too long').optional(),
    suffix: z.string().max(10, 'Suffix too long').optional(),

    // Birth Information
    birthdate: z
      .string()
      .min(1, 'Birthdate is required')
      .refine(date => {
        const birthDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        return age >= 0 && age <= 150;
      }, 'Please enter a valid birthdate'),

    place_of_birth: z
      .string()
      .min(1, 'Place of birth is required')
      .max(100, 'Place of birth too long'),

    // Demographics
    sex: z.enum(['male', 'female'], {
      message: 'Please select a valid sex',
    }),

    civil_status: z.enum(
      [
        'single',
        'married',
        'widowed',
        'divorced',
        'separated',
        'annulled',
        'registered_partnership',
        'live_in',
      ],
      {
        message: 'Please select a valid civil status',
      }
    ),

    citizenship: z.string().min(1, 'Citizenship is required').max(50, 'Citizenship too long'),

    // Contact Information
    contact_number: z
      .string()
      .optional()
      .refine(
        phone => !phone || /^(\+63|63|0)?[0-9]{10}$/.test(phone.replace(/[\s-()]/g, '')),
        'Please enter a valid Philippine phone number'
      ),

    email_address: z
      .string()
      .optional()
      .refine(
        email => !email || z.string().email().safeParse(email).success,
        'Please enter a valid email address'
      ),

    // Address Information
    house_number: z.string().max(20, 'House number too long').optional(),
    street: z.string().max(100, 'Street name too long').optional(),
    subdivision: z.string().max(100, 'Subdivision name too long').optional(),
    sitio: z.string().max(50, 'Sitio name too long').optional(),
    purok: z.string().max(50, 'Purok name too long').optional(),

    // Employment Information
    employment_status: z.enum(
      [
        'employed',
        'unemployed',
        'self_employed',
        'student',
        'retired',
        'homemaker',
        'disabled',
        'other',
      ],
      {
        message: 'Please select a valid employment status',
      }
    ),

    occupation: z.string().max(100, 'Occupation too long').optional(),
    monthly_income: z.number().min(0, 'Monthly income cannot be negative').optional(),

    // Education Information
    educational_attainment: z.enum(
      [
        'no_formal_education',
        'elementary_undergraduate',
        'elementary_graduate',
        'high_school_undergraduate',
        'high_school_graduate',
        'college_undergraduate',
        'college_graduate',
        'vocational',
        'post_graduate',
      ],
      {
        message: 'Please select a valid educational attainment',
      }
    ),

    // Physical Characteristics
    height: z.number().min(30, 'Height too low').max(300, 'Height too high').optional(),
    weight: z.number().min(1, 'Weight too low').max(500, 'Weight too high').optional(),

    // Family Information
    mother_maiden_name: z.string().max(100, 'Mother maiden name too long').optional(),
    father_name: z.string().max(100, 'Father name too long').optional(),

    // Government IDs
    philsys_card_number: z
      .string()
      .optional()
      .refine(
        id => !id || /^[0-9]{4}-[0-9]{7}-[0-9]{1}$/.test(id),
        'PhilSys ID format should be ####-#######-#'
      ),

    // Voting Information
    is_registered_voter: z.boolean().optional(),
    precinct_number: z.string().max(20, 'Precinct number too long').optional(),

    // Special Classifications
    is_senior_citizen: z.boolean().optional(),
    is_pwd: z.boolean().optional(),
    is_solo_parent: z.boolean().optional(),
    is_indigenous: z.boolean().optional(),

    // Migration Information
    is_migrant: z.boolean().optional(),
    previous_address: z.string().max(200, 'Previous address too long').optional(),

    // Sectoral Information
    sectoral_membership: z.array(z.string()).optional(),
  })
  .refine(
    data => {
      if (data.is_registered_voter && !data.precinct_number) {
        return false;
      }
      return true;
    },
    {
      message: 'Precinct number is required for registered voters',
      path: ['precinct_number'],
    }
  )
  .refine(
    data => {
      if (data.employment_status === 'employed' && !data.occupation) {
        return false;
      }
      return true;
    },
    {
      message: 'Occupation is required for employed residents',
      path: ['occupation'],
    }
  );

/**
 * Default error messages
 */
const DEFAULT_ERROR_MESSAGES = {
  last_name: "Please enter the resident's last name",
  first_name: "Please enter the resident's first name",
  birthdate: 'Please select a valid birthdate',
  place_of_birth: 'Please specify where the resident was born',
  sex: "Please specify the resident's sex",
  civil_status: "Please select the resident's civil status",
  citizenship: "Please specify the resident's citizenship",
  employment_status: 'Please select the employment status',
  educational_attainment: 'Please select the educational attainment',
};

/**
 * Unified resident validation hook interface
 */
export interface UseUnifiedResidentValidationReturn {
  // State
  errors: Record<string, string>;
  isValid: boolean;
  hasValidated: boolean;
  isValidating: boolean;
  
  // Validation methods
  validateForm: (formData: ResidentFormData) => Promise<ValidationResult<ResidentFormData>>;
  validateField: (fieldName: string, value: unknown) => FieldValidationResult;
  validateFieldAsync: (fieldName: string, value: unknown) => Promise<FieldValidationResult>;
  validateFieldDebounced: (fieldName: string, value: unknown) => void;
  
  // Error management
  getFieldError: (field: string) => string | undefined;
  hasFieldError: (field: string) => boolean;
  clearFieldError: (field: string) => void;
  clearAllErrors: () => void;
  setErrors: (errors: Record<string, string>) => void;
  setFieldError: (field: string, message: string) => void;
  
  // Progress tracking
  getValidationSummary: (errors?: Record<string, string>) => ValidationSummary;
  getValidationProgress: (errors?: Record<string, string>) => number;
  hasCriticalErrors: (errors?: Record<string, string>) => boolean;
  
  // Section validation
  getSectionValidationStatus: (section: keyof typeof REQUIRED_FIELDS, errors?: Record<string, string>) => SectionValidationStatus;
  getAllSectionStatuses: (errors?: Record<string, string>) => SectionValidationStatus[];
  isSectionValid: (section: keyof typeof REQUIRED_FIELDS) => boolean;
  clearSectionErrors: (section: keyof typeof REQUIRED_FIELDS) => void;
  
  // Cross-field validation
  getCrossFieldDependencies: (fieldName: string) => string[];
  hasCrossFieldDependencies: (fieldName: string) => boolean;
  
  // Utility methods
  isFieldRequired: (fieldName: string) => boolean;
  isFieldCritical: (fieldName: string) => boolean;
  getAllRequiredFields: () => string[];
}

/**
 * Unified resident validation hook
 * 
 * @description Single hook that consolidates all resident validation functionality.
 * Replaces 6+ validation hooks with a single, comprehensive interface.
 */
export function useUnifiedResidentValidation(
  options: ResidentValidationOptions = {}
): UseUnifiedResidentValidationReturn {
  // State management
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasValidated, setHasValidated] = useState(false);
  const debouncedValidatorsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Configuration
  const config = useMemo(() => ({
    enableRealTimeValidation: false,
    debounceDelay: 300,
    enableAsyncValidation: false,
    customErrorMessages: {} as Record<string, string>,
    ...options,
  }), [options]);

  // Use specialized validation hooks
  const crossFieldValidation = useResidentCrossFieldValidation();
  const asyncValidation = useResidentAsyncValidation({
    debounceDelay: config.debounceDelay,
    enabled: config.enableAsyncValidation,
  });

  // Memoized required fields calculation
  const allRequiredFields = useMemo((): string[] => {
    const sections = Object.keys(REQUIRED_FIELDS) as Array<keyof typeof REQUIRED_FIELDS>;
    const allFields = new Set<string>();

    sections.forEach(section => {
      // Simplified - just use critical fields for production readiness
      CRITICAL_VALIDATION_FIELDS.forEach(field => allFields.add(field));
    });

    return Array.from(allFields);
  }, []);

  // Utility functions
  const isFieldRequired = useCallback((fieldName: string): boolean => {
    return allRequiredFields.includes(fieldName);
  }, [allRequiredFields]);

  const isFieldCritical = useCallback((fieldName: string): boolean => {
    return CRITICAL_VALIDATION_FIELDS.includes(fieldName as any);
  }, []);

  // Core validation function
  const validateWithSchema = useCallback((data: ResidentFormData): ValidationResult<ResidentFormData> => {
    try {
      residentValidationSchema.parse(data);
      return {
        isValid: true,
        errors: [],
        data,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: config.customErrorMessages[issue.path.join('.')] || 
                  DEFAULT_ERROR_MESSAGES[issue.path.join('.') as keyof typeof DEFAULT_ERROR_MESSAGES] ||
                  issue.message,
        }));

        return {
          isValid: false,
          errors: validationErrors,
          data,
        };
      }

      return {
        isValid: false,
        errors: [{ field: 'general', message: 'Validation failed' }],
        data,
      };
    }
  }, [config.customErrorMessages]);

  // Field validation
  const validateField = useCallback((fieldName: string, value: unknown): FieldValidationResult => {
    // Simple field validation for production readiness
    const isRequired = isFieldRequired(fieldName);
    const isEmpty = !value || (typeof value === 'string' && value.trim() === '');
    
    if (isRequired && isEmpty) {
      return {
        isValid: false,
        error: config.customErrorMessages[fieldName] || 
               DEFAULT_ERROR_MESSAGES[fieldName as keyof typeof DEFAULT_ERROR_MESSAGES] ||
               `${fieldName} is required`,
        sanitizedValue: value,
      };
    }

    return {
      isValid: true,
      error: undefined,
      sanitizedValue: value,
    };
  }, [isFieldRequired, config.customErrorMessages]);

  // Async field validation
  const validateFieldAsync = useCallback(async (fieldName: string, value: unknown): Promise<FieldValidationResult> => {
    const syncResult = validateField(fieldName, value);
    
    if (config.enableAsyncValidation) {
      return asyncValidation.validateFieldAsync(fieldName, value);
    }
    
    return syncResult;
  }, [validateField, config.enableAsyncValidation, asyncValidation]);

  // Debounced field validation
  const validateFieldDebounced = useCallback((fieldName: string, value: unknown): void => {
    // Clear existing timeout
    const existingTimeout = debouncedValidatorsRef.current.get(fieldName);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      const result = validateField(fieldName, value);
      if (!result.isValid && result.error) {
        setErrors(prev => ({ ...prev, [fieldName]: result.error! }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }
    }, config.debounceDelay);

    debouncedValidatorsRef.current.set(fieldName, timeout);
  }, [validateField, config.debounceDelay]);

  // Form validation
  const validateForm = useCallback(async (formData: ResidentFormData): Promise<ValidationResult<ResidentFormData>> => {
    setHasValidated(true);

    // Schema validation
    const schemaResult = validateWithSchema(formData);
    
    // Cross-field validation
    const crossFieldErrors = crossFieldValidation.validateCrossFields(formData);

    // Convert schema errors to record format
    const schemaErrors: Record<string, string> = {};
    schemaResult.errors.forEach(error => {
      schemaErrors[error.field] = error.message;
    });

    // Combine all errors
    const allErrors = {
      ...schemaErrors,
      ...crossFieldErrors,
      ...asyncValidation.asyncValidationErrors,
    };

    setErrors(allErrors);

    return {
      isValid: Object.keys(allErrors).length === 0,
      errors: Object.entries(allErrors).map(([field, message]) => ({ field, message })),
      data: formData,
    };
  }, [validateWithSchema, crossFieldValidation, asyncValidation.asyncValidationErrors]);

  // Error management methods
  const getFieldError = useCallback((field: string): string | undefined => {
    return errors[field] || asyncValidation.asyncValidationErrors[field];
  }, [errors, asyncValidation.asyncValidationErrors]);

  const hasFieldError = useCallback((field: string): boolean => {
    return Boolean(errors[field] || asyncValidation.asyncValidationErrors[field]);
  }, [errors, asyncValidation.asyncValidationErrors]);

  const clearFieldError = useCallback((field: string): void => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
    asyncValidation.clearAsyncValidationError(field);
  }, [asyncValidation]);

  const clearAllErrors = useCallback((): void => {
    setErrors({});
    asyncValidation.clearAsyncValidationErrors();
  }, [asyncValidation]);

  const setFieldError = useCallback((field: string, message: string): void => {
    setErrors(prev => ({ ...prev, [field]: message }));
  }, []);

  // Progress tracking methods
  const getValidationProgress = useCallback((customErrors?: Record<string, string>): number => {
    const errorsToUse = customErrors || errors;
    const totalRequired = allRequiredFields.length;
    
    if (totalRequired === 0) return 100;
    
    const errorCount = allRequiredFields.filter(field => errorsToUse[field]).length;
    const validCount = totalRequired - errorCount;
    
    return Math.round((validCount / totalRequired) * 100);
  }, [errors, allRequiredFields]);

  const getValidationSummary = useCallback((customErrors?: Record<string, string>): ValidationSummary => {
    const errorsToUse = customErrors || errors;
    const errorFields = Object.keys(errorsToUse);
    
    const criticalErrors = errorFields.filter(field =>
      CRITICAL_VALIDATION_FIELDS.includes(field as any)
    ).length;
    
    const totalErrors = errorFields.length;
    const totalFields = allRequiredFields.length;
    const validatedFields = totalFields; // All fields have been processed
    const invalidFields = totalErrors;
    const progress = getValidationProgress(errorsToUse);

    return {
      totalErrors,
      criticalErrors,
      warnings: 0,
      totalFields,
      validatedFields,
      invalidFields,
      progress,
    };
  }, [errors, allRequiredFields, getValidationProgress]);

  const hasCriticalErrors = useCallback((customErrors?: Record<string, string>): boolean => {
    const errorsToUse = customErrors || errors;
    return Object.keys(errorsToUse).some(field =>
      CRITICAL_VALIDATION_FIELDS.includes(field as any)
    );
  }, [errors]);

  // Section validation methods
  const getSectionValidationStatus = useCallback((
    section: keyof typeof REQUIRED_FIELDS,
    customErrors?: Record<string, string>
  ): SectionValidationStatus => {
    const errorsToUse = customErrors || errors;
    // Simplified - use critical fields as section fields
    const sectionFields = CRITICAL_VALIDATION_FIELDS;
    const sectionErrors = sectionFields.filter(field => errorsToUse[field]);
    const errorCount = sectionErrors.length;
    const totalFields = sectionFields.length;
    const isValid = errorCount === 0;
    const progressPercentage = totalFields > 0 ? Math.round(((totalFields - errorCount) / totalFields) * 100) : 100;

    return {
      sectionId: section,
      sectionName: section,
      section,
      isValid,
      errorCount,
      totalFields,
      progressPercentage,
      hasValidated: true,
    };
  }, [errors]);

  const getAllSectionStatuses = useCallback((customErrors?: Record<string, string>): SectionValidationStatus[] => {
    const sections = Object.keys(REQUIRED_FIELDS) as Array<keyof typeof REQUIRED_FIELDS>;
    return sections.map(section => getSectionValidationStatus(section, customErrors));
  }, [getSectionValidationStatus]);

  const isSectionValid = useCallback((section: keyof typeof REQUIRED_FIELDS): boolean => {
    const status = getSectionValidationStatus(section);
    return status.isValid;
  }, [getSectionValidationStatus]);

  const clearSectionErrors = useCallback((section: keyof typeof REQUIRED_FIELDS): void => {
    // Simplified - clear critical field errors
    CRITICAL_VALIDATION_FIELDS.forEach(field => {
      clearFieldError(field);
    });
  }, [clearFieldError]);

  // Cross-field validation methods
  const getCrossFieldDependencies = useCallback((fieldName: string): string[] => {
    return crossFieldValidation.getCrossFieldDependencies(fieldName);
  }, [crossFieldValidation]);

  const hasCrossFieldDependencies = useCallback((fieldName: string): boolean => {
    return crossFieldValidation.hasCrossFieldDependencies(fieldName);
  }, [crossFieldValidation]);

  // Computed state
  const isValid = Object.keys(errors).length === 0 && Object.keys(asyncValidation.asyncValidationErrors).length === 0;
  const isValidating = asyncValidation.isAsyncValidating;

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      debouncedValidatorsRef.current.forEach(timeout => clearTimeout(timeout));
      debouncedValidatorsRef.current.clear();
    };
  }, []);

  return {
    // State
    errors: { ...errors, ...asyncValidation.asyncValidationErrors },
    isValid,
    hasValidated,
    isValidating,
    
    // Validation methods
    validateForm,
    validateField,
    validateFieldAsync,
    validateFieldDebounced,
    
    // Error management
    getFieldError,
    hasFieldError,
    clearFieldError,
    clearAllErrors,
    setErrors,
    setFieldError,
    
    // Progress tracking
    getValidationSummary,
    getValidationProgress,
    hasCriticalErrors,
    
    // Section validation
    getSectionValidationStatus,
    getAllSectionStatuses,
    isSectionValid,
    clearSectionErrors,
    
    // Cross-field validation
    getCrossFieldDependencies,
    hasCrossFieldDependencies,
    
    // Utility methods
    isFieldRequired,
    isFieldCritical,
    getAllRequiredFields: () => allRequiredFields,
  };
}

// Export types
export type { ResidentFormData } from '@/types/domain/residents/forms';
export type UnifiedResidentValidationReturn = UseUnifiedResidentValidationReturn;

// Export as default
export default useUnifiedResidentValidation;