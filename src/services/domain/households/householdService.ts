/**
 * Household Service
 * Business logic and API operations for household management
 * Handles data transformation, validation, and database operations
 * Follows standardized service pattern
 */

import { createLogger } from '../../../lib/config/environment';
import { supabase } from '../../../lib/data/supabase';
import { logError, dbLogger } from '../../../lib/logging';

const logger = createLogger('HouseholdService');

// Import database and consolidated types
import { HouseholdRecord } from '../../../types/domain/households/households';
import type { HouseholdFormData } from '../../../types/app/ui/forms';
import type {
  UserAddressDetailed as UserAddress,
  CreateHouseholdRequest,
  CreateHouseholdResponse,
  HouseholdValidationResult,
} from '../../../types/infrastructure/services/services';

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
  /**
   * Validate required fields
   */
  private validateRequiredFields(formData: HouseholdFormData): Record<string, string> {
    const errors: Record<string, string> = {};
    const requiredFields = [
      { field: 'code', message: 'Household code is required' },
      { field: 'house_number', message: 'House number is required' },
      { field: 'street_id', message: 'Street ID is required' },
      { field: 'barangay_code', message: 'Barangay code is required' },
      { field: 'city_municipality_code', message: 'City/Municipality code is required' },
      { field: 'region_code', message: 'Region code is required' },
    ];

    requiredFields.forEach(({ field, message }) => {
      const value = formData[field as keyof HouseholdFormData];
      if (!value || (typeof value === 'string' && !value.trim())) {
        errors[field] = message;
      }
    });

    return errors;
  }

  /**
   * Validate numeric fields
   */
  private validateNumericFields(formData: HouseholdFormData): Record<string, string> {
    const errors: Record<string, string> = {};
    const numericFields = [
      { field: 'no_of_families', message: 'Number of families cannot be negative' },
      { field: 'no_of_household_members', message: 'Number of household members cannot be negative' },
      { field: 'no_of_migrants', message: 'Number of migrants cannot be negative' },
      { field: 'monthly_income', message: 'Monthly income cannot be negative' },
    ];

    numericFields.forEach(({ field, message }) => {
      const value = formData[field as keyof HouseholdFormData] as number | undefined | null;
      if (value !== undefined && value !== null && value < 0) {
        errors[field] = message;
      }
    });

    return errors;
  }

  validateHousehold(formData: HouseholdFormData): HouseholdValidationResult {
    try {
      const requiredFieldErrors = this.validateRequiredFields(formData);
      const numericFieldErrors = this.validateNumericFields(formData);
      
      const errors = { ...requiredFieldErrors, ...numericFieldErrors };

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
    csrf_token: _csrf_token,
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
  /**
   * Map form fields to database updates
   */
  private mapFormFieldsToDatabase(updates: Partial<HouseholdFormData>): Partial<HouseholdRecord> {
    const fieldMappings: Array<[keyof HouseholdFormData, keyof HouseholdRecord]> = [
      ['name', 'name'],
      ['address', 'address'],
      ['house_number', 'house_number'],
      ['street_id', 'street_id'],
      ['subdivision_id', 'subdivision_id'],
      ['barangay_code', 'barangay_code'],
      ['city_municipality_code', 'city_municipality_code'],
      ['province_code', 'province_code'],
      ['region_code', 'region_code'],
      ['zip_code', 'zip_code'],
      ['no_of_families', 'no_of_families'],
      ['no_of_household_members', 'no_of_household_members'],
      ['no_of_migrants', 'no_of_migrants'],
      ['household_type', 'household_type'],
      ['tenure_status', 'tenure_status'],
      ['tenure_others_specify', 'tenure_others_specify'],
      ['household_unit', 'household_unit'],
      ['monthly_income', 'monthly_income'],
      ['income_class', 'income_class'],
      ['household_head_id', 'household_head_id'],
      ['household_head_position', 'household_head_position'],
    ];

    const dbUpdates: Partial<HouseholdRecord> = {};
    
    fieldMappings.forEach(([formField, dbField]) => {
      if (updates[formField] !== undefined) {
        (dbUpdates as any)[dbField] = updates[formField];
      }
    });

    return dbUpdates;
  }

  async updateHousehold(code: string, updates: Partial<HouseholdFormData>) {
    try {
      const dbUpdates = this.mapFormFieldsToDatabase(updates);
      
      // Always update the timestamp
      dbUpdates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('households')
        .update(dbUpdates)
        .eq('code', code)
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
