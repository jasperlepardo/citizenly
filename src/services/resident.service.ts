/**
 * Resident Service
 *
 * Business logic and API operations for resident management.
 * Handles data transformation, validation, and database operations.
 */

import { supabase } from '@/lib';
import {
  hashPhilSysNumber,
  extractPhilSysLast4,
  validatePhilSysFormat,
  logSecurityOperation,
} from '@/lib/security/crypto';
import { validateResidentData } from '@/lib/validation';
import { logger, logError, dbLogger } from '@/lib';
import type { ValidationResult as BaseValidationResult } from '@/lib/validation/types';

// Import database types
import { ResidentRecord } from '@/types/database';

// Types - aligned with exact database structure (38 fields)
export interface ResidentFormData {
  // Primary identification
  id?: string; // Optional for create operations
  philsys_card_number?: string;
  
  // Personal details
  first_name: string;
  middle_name?: string;
  last_name: string;
  extension_name?: string;
  birthdate: string;
  birth_place_code?: string;
  sex: 'male' | 'female';
  
  // Civil status
  civil_status?: 'single' | 'married' | 'divorced' | 'separated' | 'widowed' | 'others';
  civil_status_others_specify?: string;
  
  // Education and employment
  education_attainment?: 'elementary' | 'high_school' | 'college' | 'post_graduate' | 'vocational';
  is_graduate?: boolean;
  employment_status?: 'employed' | 'unemployed' | 'underemployed' | 'self_employed' | 'student' | 'retired' | 'homemaker' | 'unable_to_work' | 'looking_for_work' | 'not_in_labor_force';
  occupation_code?: string;
  
  // Contact information
  email?: string;
  mobile_number?: string;
  telephone_number?: string;
  
  // Household membership
  household_code?: string;
  
  // Physical characteristics
  height?: number;
  weight?: number;
  complexion?: string;
  
  // Voting information
  is_voter?: boolean;
  is_resident_voter?: boolean;
  last_voted_date?: string;
  
  // Cultural/religious identity
  religion?: 'roman_catholic' | 'islam' | 'iglesia_ni_cristo' | 'christian' | 'aglipayan_church' | 'seventh_day_adventist' | 'bible_baptist_church' | 'jehovahs_witnesses' | 'church_of_jesus_christ_latter_day_saints' | 'united_church_of_christ_philippines' | 'others';
  religion_others_specify?: string;
  ethnicity?: 'tagalog' | 'cebuano' | 'ilocano' | 'bisaya' | 'hiligaynon' | 'bikolano' | 'waray' | 'kapampangan' | 'pangasinense' | 'maranao' | 'maguindanao' | 'tausug' | 'yakan' | 'samal' | 'badjao' | 'aeta' | 'agta' | 'ati' | 'batak' | 'bukidnon' | 'gaddang' | 'higaonon' | 'ibaloi' | 'ifugao' | 'igorot' | 'ilongot' | 'isneg' | 'ivatan' | 'kalinga' | 'kankanaey' | 'mangyan' | 'mansaka' | 'palawan' | 'subanen' | 'tboli' | 'teduray' | 'tumandok' | 'chinese' | 'others';
  citizenship?: 'filipino' | 'dual_citizen' | 'foreigner';
  blood_type?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  
  // Family information
  mother_maiden_first?: string;
  mother_maiden_middle?: string;
  mother_maiden_last?: string;
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

export interface ResidentValidationResult {
  isValid: boolean;
  success?: boolean; // Backward compatibility
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
  async validateResident(formData: ResidentFormData): Promise<ResidentValidationResult> {
    try {
      const result = await validateResidentData(formData);
      // Ensure the result matches our interface
      if (!result.success) {
        return {
          isValid: false,
          success: false,
          errors: result.errors ? Object.entries(result.errors).map(([field, message]) => ({ field, message })) : [{ field: 'general', message: 'Validation failed' }],
        };
      }
      return { isValid: true, success: true };
    } catch (error) {
      logError(error as Error, 'RESIDENT_VALIDATION_ERROR');
      return {
        isValid: false,
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
      education_attainment: formData.education_attainment || null,
      is_graduate: formData.is_graduate || false,
      employment_status: formData.employment_status || null,
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
      religion: formData.religion || 'roman_catholic',
      religion_others_specify: formData.religion_others_specify || null,
      ethnicity: formData.ethnicity || null,
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
        household_code: formData.householdCode,
        // is_household_head: formData.householdRole === 'Head', // householdRole not in ResidentFormData
      });

      dbLogger.info('Resident created successfully', {
        recordId: data[0]?.id,
        householdCode: formData.householdCode,
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
