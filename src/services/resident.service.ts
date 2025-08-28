/**
 * Resident Service
 * Business logic and API operations for resident management
 * Handles data transformation, validation, and database operations
 * Follows standardized service pattern
 */

import { supabase, logError, dbLogger } from '@/lib';
import { createLogger } from '@/lib/config/environment';

const logger = createLogger('ResidentService');
import {
  hashPhilSysNumber,
  extractPhilSysLast4,
  logSecurityOperation,
} from '@/lib/security/crypto';
import { validateResidentData } from '@/lib/validation';
import type { ValidationResult as BaseValidationResult } from '@/lib/validation/types';

// Import database types
import { ResidentRecord } from '@/types/database';
import { ResidentFormData as BaseResidentFormData } from '@/types/forms';
import {
  EducationLevelEnum,
  EmploymentStatusEnum,
  ReligionEnum,
  EthnicityEnum,
} from '@/types/residents';

// Types moved to src/types/services.ts for consolidation
import type {
  ServiceResidentFormData as ResidentFormData,
  ServiceUserAddress as UserAddress,
  ServiceCreateResidentRequest as CreateResidentRequest,
  ServiceCreateResidentResponse as CreateResidentResponse,
  ResidentValidationResult,
} from '@/types/services';
import type { ValidationError } from '@/types/validation';
import { validatePhilSysFormat } from '@/utils/sanitization-utils';

/**
 * Resident Service Class
 * Contains all business logic for resident operations
 */
export class ResidentService {
  /**
   * Validate resident form data
   */
  async validateResident(formData: ResidentFormData): Promise<ResidentValidationResult> {
    try {
      console.log('Validating resident data:', formData);
      const result = await validateResidentData(formData as any);
      console.log('Validation result:', result);
      if (result.errors) {
        console.log('Validation errors detail:', JSON.stringify(result.errors, null, 2));
      }

      // Ensure the result matches our interface
      if (!result.isValid) {
        const errors = result.errors
          ? Array.isArray(result.errors)
            ? result.errors
            : Object.entries(result.errors).map(([field, message]) => ({
                field,
                message: String(message),
              }))
          : [{ field: 'general', message: 'Validation failed' }];

        // Filter out validation errors for fields that weren't submitted
        // This handles cases where hidden form sections have fields that fail validation
        // but the user never had the opportunity to fill them out
        const submittedFields = Object.keys(formData);
        const filteredErrors = errors.filter(error => {
          const isFieldSubmitted = submittedFields.includes(error.field);
          if (!isFieldSubmitted) {
            console.log(`Filtering out validation error for non-submitted field: ${error.field}`);
          }
          return isFieldSubmitted;
        });

        // If we filtered out all errors, consider validation successful
        if (filteredErrors.length === 0) {
          console.log('All validation errors were for non-submitted fields. Treating as valid.');
          return { isValid: true, success: true };
        }

        console.error('Validation failed with errors:', filteredErrors);
        return {
          isValid: false,
          success: false,
          errors: filteredErrors,
        };
      }
      return { isValid: true, success: true };
    } catch (error) {
      console.error('Validation exception:', error);
      logError(error as Error, 'RESIDENT_VALIDATION_ERROR');
      return {
        isValid: false,
        success: false,
        errors: [
          {
            field: 'general',
            message: error instanceof Error ? error.message : 'Validation error occurred',
          },
        ],
      };
    }
  }

  /**
   * Validate and process PhilSys card number
   */
  async processPhilSysNumber(philsysNumber?: string): Promise<{
    success: boolean;
    hash?: string;
    last4?: string;
    error?: string;
  }> {
    if (!philsysNumber) {
      return { success: true };
    }

    // Validate format
    if (!validatePhilSysFormat(philsysNumber)) {
      return {
        success: false,
        error: 'Invalid PhilSys card number format. Please use format: 1234-5678-9012-3456',
      };
    }

    try {
      const hash = await hashPhilSysNumber(philsysNumber);
      const last4 = extractPhilSysLast4(philsysNumber);

      // Log security operation for audit trail
      logSecurityOperation('PHILSYS_HASH_CREATED', 'current-user', {
        action: 'resident_creation',
        philsys_last4: last4,
      });

      return { success: true, hash, last4 };
    } catch (error) {
      logError(error as Error, 'PHILSYS_ENCRYPTION_ERROR');
      return {
        success: false,
        error: 'Error processing PhilSys card number. Please try again.',
      };
    }
  }

  /**
   * Transform form data to database schema - exact field mapping
   */
  private transformToDbSchema(
    formData: ResidentFormData,
    userAddress?: UserAddress,
    barangayCode?: string,
    philsysHash?: string,
    philsysLast4?: string
  ): Partial<ResidentRecord> {
    return {
      // Primary identification
      philsys_card_number: philsysHash || formData.philsys_card_number || null,

      // Personal details
      first_name: formData.first_name,
      middle_name: formData.middle_name || null,
      last_name: formData.last_name,
      extension_name: formData.extension_name || null,
      birthdate: formData.birthdate,
      birth_place_code: formData.birth_place_code || null,
      sex: formData.sex,

      // Civil status
      civil_status: formData.civil_status || 'single',
      civil_status_others_specify: formData.civil_status_others_specify || null,

      // Education and employment
      education_attainment: (formData.education_attainment as EducationLevelEnum) || null,
      is_graduate: formData.is_graduate || false,
      employment_status: (formData.employment_status as EmploymentStatusEnum) || null,
      occupation_code: formData.occupation_code || null,

      // Contact information
      email: formData.email || null,
      mobile_number: formData.mobile_number || null,
      telephone_number: formData.telephone_number || null,

      // Household membership
      household_code: formData.household_code || null,

      // Physical characteristics
      height: formData.height || null,
      weight: formData.weight || null,
      complexion: formData.complexion || null,

      // Voting information
      is_voter: formData.is_voter || null,
      is_resident_voter: formData.is_resident_voter || null,
      last_voted_date: formData.last_voted_date || null,

      // Cultural/religious identity
      religion: (formData.religion as ReligionEnum) || 'roman_catholic',
      religion_others_specify: formData.religion_others_specify || null,
      ethnicity: (formData.ethnicity as EthnicityEnum) || null,
      citizenship: formData.citizenship || 'filipino',
      blood_type: formData.blood_type || null,

      // Family information
      mother_maiden_first: formData.mother_maiden_first || null,
      mother_maiden_middle: formData.mother_maiden_middle || null,
      mother_maiden_last: formData.mother_maiden_last || null,

      // Status and audit fields
      is_active: true,
    };
  }

  /**
   * Create a new resident
   */
  async createResident({
    formData,
    userAddress,
    barangayCode,
    csrfToken,
  }: CreateResidentRequest): Promise<CreateResidentResponse> {
    try {
      console.log('Creating resident with data:', { formData, barangayCode });

      // Validate form data
      const validationResult = await this.validateResident(formData);
      if (!validationResult.success) {
        console.error('Validation failed:', validationResult.errors);
        return {
          success: false,
          error: 'Validation failed',
          data: { validationErrors: validationResult.errors } as any,
        };
      }

      // Process PhilSys card number
      const philsysResult = await this.processPhilSysNumber(formData.philsys_card_number);
      if (!philsysResult.success) {
        return {
          success: false,
          error: philsysResult.error,
        };
      }

      // Transform data to database schema
      const residentData = this.transformToDbSchema(
        formData,
        userAddress,
        barangayCode,
        philsysResult.hash,
        philsysResult.last4
      );

      // Log security operation before database insert
      logSecurityOperation('RESIDENT_CREATE_ATTEMPT', 'current-user', {
        action: 'resident_creation',
        has_philsys: !!formData.philsys_card_number,
        household_code: formData.household_code,
        barangay_code: barangayCode,
        csrf_token_used: !!csrfToken,
      });

      logger.info('Creating resident with household assignment', {
        householdCode: formData.household_code,
      });

      // Insert resident into database
      const { data, error } = await supabase.from('residents').insert([residentData]).select();

      if (error) {
        // Log failed creation attempt
        logSecurityOperation('RESIDENT_CREATE_FAILED', 'current-user', {
          error_message: error.message,
          error_code: error.code,
        });
        dbLogger.error('Failed to create resident', {
          error: error.message,
          code: error.code,
        });

        return {
          success: false,
          error: `Failed to create resident: ${error.message}`,
        };
      }

      // Log successful creation
      logSecurityOperation('RESIDENT_CREATED', 'current-user', {
        resident_id: data[0]?.id,
        household_code: formData.household_code,
      });

      dbLogger.info('Resident created successfully', {
        recordId: data[0]?.id,
        householdCode: formData.household_code,
      });

      // Handle household head assignment
      // TODO: householdRole not in ResidentFormData interface - need to handle separately
      /*
      if (formData.householdRole === 'Head' && formData.householdCode && data?.[0]?.id) {
        const householdResult = await this.updateHouseholdHead(formData.householdCode, data[0].id);

        if (!householdResult.success) {
          // Resident created but household head assignment failed
          return {
            success: true,
            data: data[0],
            error: `Resident created but failed to assign as household head: ${householdResult.error}`,
          };
        }
      }
      */

      return {
        success: true,
        data: data[0],
      };
    } catch (error) {
      logger.error('Unexpected error during resident creation', error);
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      };
    }
  }

  /**
   * Update household head assignment
   */
  private async updateHouseholdHead(
    householdCode: string,
    headId: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      logger.info('Updating household head assignment');

      const { error } = await supabase
        .from('households')
        .update({ household_head_id: headId })
        .eq('code', householdCode);

      if (error) {
        dbLogger.error('Error updating household head', { error: error.message });
        return {
          success: false,
          error: error.message,
        };
      }

      dbLogger.info('Household head updated successfully', {
        householdCode,
        headId,
      });

      return { success: true };
    } catch (error) {
      logger.error('Unexpected error updating household head', error);
      return {
        success: false,
        error: 'Unexpected error occurred',
      };
    }
  }

  /**
   * Get resident by ID
   */
  async getResident(id: string) {
    try {
      const { data, error } = await supabase.from('residents').select('*').eq('id', id).single();

      if (error) {
        dbLogger.error('Failed to fetch resident', { error: error.message, id });
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      logger.error('Unexpected error fetching resident', error);
      return { success: false, error: 'Failed to fetch resident' };
    }
  }

  /**
   * List residents with pagination
   */
  async listResidents(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from('residents')
        .select('*', { count: 'exact' })
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) {
        dbLogger.error('Failed to list residents', { error: error.message });
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data,
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      logger.error('Unexpected error listing residents', error);
      return { success: false, error: 'Failed to list residents' };
    }
  }
}

// Export singleton instance
export const residentService = new ResidentService();
