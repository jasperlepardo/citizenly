/**
 * Household Service
 * Business logic and API operations for household management
 * Handles data transformation, validation, and database operations
 * Follows standardized service pattern
 */

import { createLogger } from '@/lib/config/environment';
import { supabase } from '@/lib/data/supabase';
import { logError, dbLogger } from '@/lib/logging';

const logger = createLogger('HouseholdService');

// Import database and consolidated types
import { HouseholdRecord } from '@/types';
import type { HouseholdFormData } from '@/types/forms';
import type {
  UserAddressDetailed as UserAddress,
  CreateHouseholdRequest,
  CreateHouseholdResponse,
  HouseholdValidationResult,
} from '@/types/services';
import type { ValidationError } from '@/types/validation';

// Re-export types for backward compatibility
export type {
  HouseholdFormData,
  UserAddress,
  CreateHouseholdRequest,
  CreateHouseholdResponse,
  HouseholdValidationResult,
};

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
      if (!formData.house_number?.trim()) {
        errors.house_number = 'House number is required';
      }
      if (!formData.street_id?.trim()) {
        errors.street_id = 'Street ID is required';
      }
      if (!formData.barangay_code?.trim()) {
        errors.barangay_code = 'Barangay code is required';
      }
      if (!formData.city_municipality_code?.trim()) {
        errors.city_municipality_code = 'City/Municipality code is required';
      }
      if (!formData.region_code?.trim()) {
        errors.region_code = 'Region code is required';
      }

      // Validate numeric fields if provided
      if (
        formData.no_of_families !== undefined &&
        formData.no_of_families !== null &&
        formData.no_of_families < 0
      ) {
        errors.no_of_families = 'Number of families cannot be negative';
      }
      if (
        formData.no_of_household_members !== undefined &&
        formData.no_of_household_members !== null &&
        formData.no_of_household_members < 0
      ) {
        errors.no_of_household_members = 'Number of household members cannot be negative';
      }
      if (
        formData.no_of_migrants !== undefined &&
        formData.no_of_migrants !== null &&
        formData.no_of_migrants < 0
      ) {
        errors.no_of_migrants = 'Number of migrants cannot be negative';
      }
      if (
        formData.monthly_income !== undefined &&
        formData.monthly_income !== null &&
        formData.monthly_income < 0
      ) {
        errors.monthly_income = 'Monthly income cannot be negative';
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
  generateHouseholdCode(barangay_code?: string): string {
    if (barangay_code) {
      // Use geographic hierarchy format as defined in schema function
      const timestamp = Date.now().toString().slice(-6);
      return `${barangay_code}-HH-${timestamp}`;
    }

    // Fallback format
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 6);
    return `HH-${timestamp}-${randomStr}`.toUpperCase();
  }

  /**
   * Transform form data to database schema - exact field mapping
   */
  private transformToDbSchema(
    formData: HouseholdFormData,
    userAddress?: UserAddress
  ): Partial<HouseholdRecord> {
    return {
      // Primary identification
      code: formData.code,
      name: formData.name || null,
      address: formData.address || null,

      // Location details
      house_number: formData.house_number,
      street_id: formData.street_id,
      subdivision_id: formData.subdivision_id || null,
      barangay_code: formData.barangay_code || userAddress?.barangay_code,
      city_municipality_code:
        formData.city_municipality_code || userAddress?.city_municipality_code,
      province_code: formData.province_code || userAddress?.province_code || null,
      region_code: formData.region_code || userAddress?.region_code,
      zip_code: formData.zip_code || null,

      // Household metrics
      no_of_families: formData.no_of_families || 1,
      no_of_household_members: formData.no_of_household_members || 0,
      no_of_migrants: formData.no_of_migrants || 0,

      // Household classifications
      household_type: formData.household_type || null,
      tenure_status: formData.tenure_status || null,
      tenure_others_specify: formData.tenure_others_specify || null,
      household_unit: formData.household_unit || null,

      // Economic information
      monthly_income: formData.monthly_income || null,
      income_class: formData.income_class || null,

      // Head of household
      household_head_id: formData.household_head_id || null,
      household_head_position: formData.household_head_position || null,

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
    barangay_code,
    csrf_token,
  }: CreateHouseholdRequest): Promise<CreateHouseholdResponse> {
    try {
      // Validate form data
      const validationResult = this.validateHousehold(formData);
      if (!validationResult.success) {
        return {
          success: false,
          error: 'Please fill in all required fields correctly',
          data: { validationErrors: validationResult.errors } as any,
        };
      }

      // Generate household code if not provided
      if (!formData.code) {
        formData.code = this.generateHouseholdCode(barangay_code || formData.barangay_code);
      }

      // Transform data to database schema
      const householdData = this.transformToDbSchema(formData, userAddress);

      // Set barangay code from parameter if provided
      if (barangay_code) {
        householdData.barangay_code = barangay_code;
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
      if (updates.house_number !== undefined) dbUpdates.house_number = updates.house_number;
      if (updates.street_id !== undefined) dbUpdates.street_id = updates.street_id;
      if (updates.subdivision_id !== undefined) dbUpdates.subdivision_id = updates.subdivision_id;
      if (updates.barangay_code !== undefined) dbUpdates.barangay_code = updates.barangay_code;
      if (updates.city_municipality_code !== undefined)
        dbUpdates.city_municipality_code = updates.city_municipality_code;
      if (updates.province_code !== undefined) dbUpdates.province_code = updates.province_code;
      if (updates.region_code !== undefined) dbUpdates.region_code = updates.region_code;
      if (updates.zip_code !== undefined) dbUpdates.zip_code = updates.zip_code;
      if (updates.no_of_families !== undefined) dbUpdates.no_of_families = updates.no_of_families;
      if (updates.no_of_household_members !== undefined)
        dbUpdates.no_of_household_members = updates.no_of_household_members;
      if (updates.no_of_migrants !== undefined) dbUpdates.no_of_migrants = updates.no_of_migrants;
      if (updates.household_type !== undefined) dbUpdates.household_type = updates.household_type;
      if (updates.tenure_status !== undefined) dbUpdates.tenure_status = updates.tenure_status;
      if (updates.tenure_others_specify !== undefined)
        dbUpdates.tenure_others_specify = updates.tenure_others_specify;
      if (updates.household_unit !== undefined) dbUpdates.household_unit = updates.household_unit;
      if (updates.monthly_income !== undefined) dbUpdates.monthly_income = updates.monthly_income;
      if (updates.income_class !== undefined) dbUpdates.income_class = updates.income_class;
      if (updates.household_head_id !== undefined)
        dbUpdates.household_head_id = updates.household_head_id;
      if (updates.household_head_position !== undefined)
        dbUpdates.household_head_position = updates.household_head_position;

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
          updated_at: new Date().toISOString(),
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
