/**
 * Resident Service
 *
 * Business logic and API operations for resident management.
 * Handles data transformation, validation, and database operations.
 */

import { supabase } from '@/lib/supabase';
import { hashPhilSysNumber, extractPhilSysLast4, validatePhilSysFormat } from '@/lib/crypto';
import { validateResidentData } from '@/lib/validation';
import { logger, logError, dbLogger } from '@/lib/secure-logger';
import { logSecurityOperation } from '@/lib/crypto';

// Types
export interface ResidentFormData {
  // Personal Information - Step 1
  firstName: string;
  middleName: string;
  lastName: string;
  extensionName: string;
  birthdate: string;
  sex: 'male' | 'female' | '';
  civilStatus: string;
  citizenship: string;

  // Education & Employment - Step 2
  educationLevel: string;
  educationStatus: string;
  psocCode: string;
  psocLevel: string;
  positionTitleId: string;
  occupationDescription: string;
  employmentStatus: string;
  workplace: string;

  // Contact & Documentation - Step 3
  email: string;
  mobileNumber: string;
  telephoneNumber: string;
  philsysCardNumber: string;

  // Physical & Identity Information - Step 3
  bloodType: string;
  height: string;
  weight: string;
  complexion: string;
  ethnicity: string;
  religion: string;

  // Voting Information - Step 3
  voterRegistrationStatus: boolean;
  residentVoterStatus: boolean;
  lastVotedYear: string;

  // Family Information - Step 3
  motherMaidenFirstName: string;
  motherMaidenMiddleName: string;
  motherMaidenLastName: string;

  // Migration Information - Step 4
  migrationInfo: any;

  // Address Information (PSGC Codes) - auto-populated
  regionCode: string;
  provinceCode: string;
  cityMunicipalityCode: string;
  barangayCode: string;

  // Household Assignment - Step 5
  householdCode: string;
  householdRole: 'Head' | 'Member';
}

export interface UserAddress {
  region_code: string;
  province_code?: string;
  city_municipality_code: string;
  barangay_code: string;
  region_name: string;
  province_name?: string;
  city_municipality_name: string;
  city_municipality_type: string;
  barangay_name: string;
}

export interface CreateResidentRequest {
  formData: ResidentFormData;
  userAddress?: UserAddress;
  barangayCode?: string;
  csrfToken?: string;
}

export interface CreateResidentResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  success: boolean;
  errors?: ValidationError[];
}

/**
 * Resident Service Class
 * Contains all business logic for resident operations
 */
export class ResidentService {
  /**
   * Validate resident form data
   */
  async validateResident(formData: ResidentFormData): Promise<ValidationResult> {
    try {
      const result = await validateResidentData(formData);
      // Ensure the result matches our interface
      if (!result.success) {
        return {
          success: false,
          errors: result.errors || [{ field: 'general', message: 'Validation failed' }],
        };
      }
      return { success: true };
    } catch (error) {
      logError(error as Error, 'RESIDENT_VALIDATION_ERROR');
      return {
        success: false,
        errors: [{ field: 'general', message: 'Validation error occurred' }],
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
   * Transform form data to database schema
   */
  private transformToDbSchema(
    formData: ResidentFormData,
    userAddress?: UserAddress,
    barangayCode?: string,
    philsysHash?: string,
    philsysLast4?: string
  ) {
    return {
      first_name: formData.firstName,
      middle_name: formData.middleName || null,
      last_name: formData.lastName,
      extension_name: formData.extensionName || null,
      birthdate: formData.birthdate,
      sex: formData.sex as 'male' | 'female',
      civil_status: formData.civilStatus as any,
      citizenship: formData.citizenship as any,
      education_level: formData.educationLevel as any,
      education_status: formData.educationStatus as any,
      psoc_code: formData.psocCode || null,
      psoc_level: formData.psocLevel || null,
      occupation_title: formData.occupationDescription || null,
      employment_status: (formData.employmentStatus as any) || 'not_in_labor_force',
      mobile_number: formData.mobileNumber,
      email: formData.email || null,
      // Securely hashed PhilSys card number
      philsys_card_number_hash: philsysHash || null,
      philsys_last4: philsysLast4 || null,
      // Physical information
      blood_type: (formData.bloodType as any) || 'unknown',
      ethnicity: (formData.ethnicity as any) || 'not_reported',
      religion: (formData.religion as any) || 'other',
      // Voting information
      is_voter: formData.voterRegistrationStatus,
      is_resident_voter: formData.residentVoterStatus,
      // Geographic hierarchy - auto-populated from user's assigned barangay
      region_code: userAddress?.region_code || null,
      province_code: userAddress?.province_code || null,
      city_municipality_code: userAddress?.city_municipality_code || null,
      barangay_code: barangayCode || null,
      // Household assignment
      household_code: formData.householdCode || null,
      // Address details will be populated from household assignment
      street_name: null,
      house_number: null,
      subdivision: null,
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
      // Validate form data
      const validationResult = await this.validateResident(formData);
      if (!validationResult.success) {
        return {
          success: false,
          error: 'Validation failed',
          data: { validationErrors: validationResult.errors },
        };
      }

      // Process PhilSys card number
      const philsysResult = await this.processPhilSysNumber(formData.philsysCardNumber);
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
        has_philsys: !!formData.philsysCardNumber,
        household_code: formData.householdCode,
        barangay_code: barangayCode,
        csrf_token_used: !!csrfToken,
      });

      logger.info('Creating resident with household assignment', {
        householdCode: formData.householdCode,
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
        household_code: formData.householdCode,
        is_household_head: formData.householdRole === 'Head',
      });

      dbLogger.info('Resident created successfully', {
        recordId: data[0]?.id,
        householdCode: formData.householdCode,
      });

      // Handle household head assignment
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
