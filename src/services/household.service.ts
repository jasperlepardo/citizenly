/**
 * Household Service
 *
 * Business logic and API operations for household management.
 * Handles data transformation, validation, and database operations.
 */

import { supabase } from '@/lib';
import { logger, logError, dbLogger } from '@/lib';

// Import database types
import { HouseholdRecord } from '@/types';

// Types - aligned with exact database structure (27 fields)
export interface HouseholdFormData {
  // Primary identification
  code: string;
  name?: string;
  address?: string;
  
  // Location details
  houseNumber: string;
  streetId: string; // UUID reference to geo_streets
  subdivisionId?: string; // UUID reference to geo_subdivisions
  barangayCode: string;
  cityMunicipalityCode: string;
  provinceCode?: string;
  regionCode: string;
  zipCode?: string;
  
  // Household metrics
  noOfFamilies?: number;
  noOfHouseholdMembers?: number;
  noOfMigrants?: number;
  
  // Household classifications (enums)
  householdType?: 'nuclear' | 'single_parent' | 'extended' | 'childless' | 'one_person' | 'non_family' | 'other';
  tenureStatus?: 'owned' | 'owned_with_mortgage' | 'rented' | 'occupied_for_free' | 'occupied_without_consent' | 'others';
  tenureOthersSpecify?: string;
  householdUnit?: 'single_house' | 'duplex' | 'apartment' | 'townhouse' | 'condominium' | 'boarding_house' | 'institutional' | 'makeshift' | 'others';
  
  // Economic information
  monthlyIncome?: number;
  incomeClass?: 'rich' | 'high_income' | 'upper_middle_income' | 'middle_class' | 'lower_middle_class' | 'low_income' | 'poor' | 'not_determined';
  
  // Head of household
  householdHeadId?: string; // UUID reference to residents
  householdHeadPosition?: 'father' | 'mother' | 'son' | 'daughter' | 'grandmother' | 'grandfather' | 'father_in_law' | 'mother_in_law' | 'brother_in_law' | 'sister_in_law' | 'spouse' | 'sibling' | 'guardian' | 'ward' | 'other';
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

export interface CreateHouseholdRequest {
  formData: HouseholdFormData;
  userAddress?: UserAddress;
  barangayCode?: string;
  csrfToken?: string;
}

export interface CreateHouseholdResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface HouseholdValidationResult {
  success: boolean;
  errors?: Record<string, string>;
}

/**
 * Household Service Class
 * Contains all business logic for household operations
 */
export class HouseholdService {
  /**
   * Validate household form data - aligned with database structure
   */
  validateHousehold(formData: HouseholdFormData): HouseholdValidationResult {
    const errors: Record<string, string> = {};

    try {
      // Required fields validation
      if (!formData.code?.trim()) {
        errors.code = 'Household code is required';
      }
      if (!formData.houseNumber?.trim()) {
        errors.houseNumber = 'House number is required';
      }
      if (!formData.streetId?.trim()) {
        errors.streetId = 'Street ID is required';
      }
      if (!formData.barangayCode?.trim()) {
        errors.barangayCode = 'Barangay code is required';
      }
      if (!formData.cityMunicipalityCode?.trim()) {
        errors.cityMunicipalityCode = 'City/Municipality code is required';
      }
      if (!formData.regionCode?.trim()) {
        errors.regionCode = 'Region code is required';
      }

      // Validate numeric fields if provided
      if (formData.noOfFamilies !== undefined && formData.noOfFamilies < 0) {
        errors.noOfFamilies = 'Number of families cannot be negative';
      }
      if (formData.noOfHouseholdMembers !== undefined && formData.noOfHouseholdMembers < 0) {
        errors.noOfHouseholdMembers = 'Number of household members cannot be negative';
      }
      if (formData.noOfMigrants !== undefined && formData.noOfMigrants < 0) {
        errors.noOfMigrants = 'Number of migrants cannot be negative';
      }
      if (formData.monthlyIncome !== undefined && formData.monthlyIncome < 0) {
        errors.monthlyIncome = 'Monthly income cannot be negative';
      }

      return {
        success: Object.keys(errors).length === 0,
        errors: Object.keys(errors).length > 0 ? errors : undefined,
      };
    } catch (error) {
      logError(error as Error, 'HOUSEHOLD_VALIDATION_ERROR');
      return {
        success: false,
        errors: { general: 'Validation error occurred' },
      };
    }
  }

  /**
   * Generate unique household code - should use proper format based on geographic hierarchy
   * For now using simple format, but should ideally use barangay-based format from schema
   */
  generateHouseholdCode(barangayCode?: string): string {
    if (barangayCode) {
      // Use geographic hierarchy format as defined in schema function
      const timestamp = Date.now().toString().slice(-6);
      return `${barangayCode}-HH-${timestamp}`;
    }
    
    // Fallback format
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 6);
    return `HH-${timestamp}-${randomStr}`.toUpperCase();
  }

  /**
   * Transform form data to database schema - exact field mapping
   */
  private transformToDbSchema(formData: HouseholdFormData, userAddress?: UserAddress): Partial<HouseholdRecord> {
    return {
      // Primary identification
      code: formData.code,
      name: formData.name || null,
      address: formData.address || null,
      
      // Location details
      house_number: formData.houseNumber,
      street_id: formData.streetId,
      subdivision_id: formData.subdivisionId || null,
      barangay_code: formData.barangayCode || userAddress?.barangay_code,
      city_municipality_code: formData.cityMunicipalityCode || userAddress?.city_municipality_code,
      province_code: formData.provinceCode || userAddress?.province_code || null,
      region_code: formData.regionCode || userAddress?.region_code,
      zip_code: formData.zipCode || null,
      
      // Household metrics
      no_of_families: formData.noOfFamilies || 1,
      no_of_household_members: formData.noOfHouseholdMembers || 0,
      no_of_migrants: formData.noOfMigrants || 0,
      
      // Household classifications
      household_type: formData.householdType || null,
      tenure_status: formData.tenureStatus || null,
      tenure_others_specify: formData.tenureOthersSpecify || null,
      household_unit: formData.householdUnit || null,
      
      // Economic information
      monthly_income: formData.monthlyIncome || null,
      income_class: formData.incomeClass || null,
      
      // Head of household
      household_head_id: formData.householdHeadId || null,
      household_head_position: formData.householdHeadPosition || null,
      
      // Status and audit fields
      is_active: true,
    };
  }

  /**
   * Create a new household
   */
  async createHousehold({
    formData,
    userAddress,
    barangayCode,
    csrfToken,
  }: CreateHouseholdRequest): Promise<CreateHouseholdResponse> {
    try {
      // Validate form data
      const validationResult = this.validateHousehold(formData);
      if (!validationResult.success) {
        return {
          success: false,
          error: 'Please fill in all required fields correctly',
          data: { validationErrors: validationResult.errors },
        };
      }

      // Generate household code if not provided
      if (!formData.code) {
        formData.code = this.generateHouseholdCode(barangayCode || formData.barangayCode);
      }

      // Transform data to database schema
      const householdData = this.transformToDbSchema(formData, userAddress);

      // Set barangay code from parameter if provided
      if (barangayCode) {
        householdData.barangay_code = barangayCode;
      }

      logger.info('Creating household', { householdCode: formData.code });

      // Insert household into database
      const { data, error } = await supabase.from('households').insert([householdData]).select();

      if (error) {
        dbLogger.error('Failed to create household', {
          error: error.message,
          code: error.code,
        });

        return {
          success: false,
          error: `Failed to create household: ${error.message}`,
        };
      }

      dbLogger.info('Household created successfully', {
        recordId: data[0]?.code,
        householdCode: formData.code,
      });

      return {
        success: true,
        data: data[0],
      };
    } catch (error) {
      logger.error('Unexpected error during household creation', error);
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      };
    }
  }

  /**
   * Get household by code (primary key)
   */
  async getHousehold(code: string) {
    try {
      const { data, error } = await supabase
        .from('households')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();

      if (error) {
        dbLogger.error('Failed to fetch household', { error: error.message, code });
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      logger.error('Unexpected error fetching household', error);
      return { success: false, error: 'Failed to fetch household' };
    }
  }

  /**
   * Get household by code
   */
  async getHouseholdByCode(code: string) {
    try {
      const { data, error } = await supabase
        .from('households')
        .select('*')
        .eq('code', code)
        .single();

      if (error) {
        dbLogger.error('Failed to fetch household by code', { error: error.message, code });
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      logger.error('Unexpected error fetching household by code', error);
      return { success: false, error: 'Failed to fetch household' };
    }
  }

  /**
   * List households with pagination
   */
  async listHouseholds(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from('households')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) {
        dbLogger.error('Failed to list households', { error: error.message });
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
      logger.error('Unexpected error listing households', error);
      return { success: false, error: 'Failed to list households' };
    }
  }

  /**
   * Update household information - using exact database field names
   */
  async updateHousehold(code: string, updates: Partial<HouseholdFormData>) {
    try {
      // Transform updates to match exact database schema
      const dbUpdates: Partial<HouseholdRecord> = {};

      // Only update fields that are provided
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.address !== undefined) dbUpdates.address = updates.address;
      if (updates.houseNumber !== undefined) dbUpdates.house_number = updates.houseNumber;
      if (updates.streetId !== undefined) dbUpdates.street_id = updates.streetId;
      if (updates.subdivisionId !== undefined) dbUpdates.subdivision_id = updates.subdivisionId;
      if (updates.barangayCode !== undefined) dbUpdates.barangay_code = updates.barangayCode;
      if (updates.cityMunicipalityCode !== undefined) dbUpdates.city_municipality_code = updates.cityMunicipalityCode;
      if (updates.provinceCode !== undefined) dbUpdates.province_code = updates.provinceCode;
      if (updates.regionCode !== undefined) dbUpdates.region_code = updates.regionCode;
      if (updates.zipCode !== undefined) dbUpdates.zip_code = updates.zipCode;
      if (updates.noOfFamilies !== undefined) dbUpdates.no_of_families = updates.noOfFamilies;
      if (updates.noOfHouseholdMembers !== undefined) dbUpdates.no_of_household_members = updates.noOfHouseholdMembers;
      if (updates.noOfMigrants !== undefined) dbUpdates.no_of_migrants = updates.noOfMigrants;
      if (updates.householdType !== undefined) dbUpdates.household_type = updates.householdType;
      if (updates.tenureStatus !== undefined) dbUpdates.tenure_status = updates.tenureStatus;
      if (updates.tenureOthersSpecify !== undefined) dbUpdates.tenure_others_specify = updates.tenureOthersSpecify;
      if (updates.householdUnit !== undefined) dbUpdates.household_unit = updates.householdUnit;
      if (updates.monthlyIncome !== undefined) dbUpdates.monthly_income = updates.monthlyIncome;
      if (updates.incomeClass !== undefined) dbUpdates.income_class = updates.incomeClass;
      if (updates.householdHeadId !== undefined) dbUpdates.household_head_id = updates.householdHeadId;
      if (updates.householdHeadPosition !== undefined) dbUpdates.household_head_position = updates.householdHeadPosition;

      // Always update the timestamp
      dbUpdates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('households')
        .update(dbUpdates)
        .eq('code', code) // Use code instead of id as primary key
        .select();

      if (error) {
        dbLogger.error('Failed to update household', { error: error.message, code });
        return { success: false, error: error.message };
      }

      dbLogger.info('Household updated successfully', { code });
      return { success: true, data: data[0] };
    } catch (error) {
      logger.error('Unexpected error updating household', error);
      return { success: false, error: 'Failed to update household' };
    }
  }

  /**
   * Delete household (soft delete by setting is_active = false)
   */
  async deleteHousehold(code: string) {
    try {
      // Soft delete - set is_active to false instead of hard delete
      const { error } = await supabase
        .from('households')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('code', code); // Use code as primary key

      if (error) {
        dbLogger.error('Failed to delete household', { error: error.message, code });
        return { success: false, error: error.message };
      }

      dbLogger.info('Household deleted successfully', { code });
      return { success: true };
    } catch (error) {
      logger.error('Unexpected error deleting household', error);
      return { success: false, error: 'Failed to delete household' };
    }
  }
}

// Export singleton instance
export const householdService = new HouseholdService();
