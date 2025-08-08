/**
 * Household Service
 *
 * Business logic and API operations for household management.
 * Handles data transformation, validation, and database operations.
 */

import { supabase } from '@/lib/supabase';
import { logger, logError, dbLogger } from '@/lib/secure-logger';

// Types
export interface HouseholdFormData {
  // Step 1: Basic Information
  householdCode: string;
  householdType: string;
  headFirstName: string;
  headMiddleName: string;
  headLastName: string;
  headExtensionName: string;

  // Step 2: Location Details
  streetName: string;
  houseNumber: string;
  subdivision: string;
  landmark: string;
  coordinates: {
    latitude: string;
    longitude: string;
  };

  // Step 3: Household Composition
  totalMembers: number;
  totalMales: number;
  totalFemales: number;
  children: number;
  adults: number;
  seniors: number;

  // Step 4: Economic Information
  monthlyIncome: string;
  incomeSource: string;
  hasElectricity: boolean;
  hasWater: boolean;
  hasInternet: boolean;
  dwellingType: string;
  dwellingOwnership: string;

  // Address Information (PSGC Codes) - auto-populated
  regionCode: string;
  provinceCode: string;
  cityMunicipalityCode: string;
  barangayCode: string;
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
   * Validate household form data
   */
  validateHousehold(formData: HouseholdFormData): HouseholdValidationResult {
    const errors: Record<string, string> = {};

    try {
      // Step 1: Basic Information
      if (!formData.householdType) {
        errors.householdType = 'Household type is required';
      }
      if (!formData.headFirstName?.trim()) {
        errors.headFirstName = 'Head first name is required';
      }
      if (!formData.headLastName?.trim()) {
        errors.headLastName = 'Head last name is required';
      }

      // Step 2: Location Details
      if (!formData.streetName?.trim()) {
        errors.streetName = 'Street name is required';
      }

      // Step 3: Household Composition
      if (formData.totalMembers < 1) {
        errors.totalMembers = 'Total members must be at least 1';
      }
      if (formData.totalMales + formData.totalFemales !== formData.totalMembers) {
        errors.totalMales = 'Total male and female members must equal total members';
      }

      // Step 4: Economic Information
      if (!formData.dwellingType) {
        errors.dwellingType = 'Dwelling type is required';
      }
      if (!formData.dwellingOwnership) {
        errors.dwellingOwnership = 'Dwelling ownership is required';
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
   * Generate unique household code
   */
  generateHouseholdCode(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `HH-${timestamp}-${randomStr}`.toUpperCase();
  }

  /**
   * Transform form data to database schema
   */
  private transformToDbSchema(formData: HouseholdFormData, userAddress?: UserAddress) {
    return {
      code: formData.householdCode,
      household_type: formData.householdType as any,
      head_first_name: formData.headFirstName,
      head_middle_name: formData.headMiddleName || null,
      head_last_name: formData.headLastName,
      head_extension_name: formData.headExtensionName || null,
      street_name: formData.streetName,
      house_number: formData.houseNumber || null,
      subdivision: formData.subdivision || null,
      landmark: formData.landmark || null,
      coordinates:
        formData.coordinates.latitude && formData.coordinates.longitude
          ? `POINT(${formData.coordinates.longitude} ${formData.coordinates.latitude})`
          : null,
      total_members: formData.totalMembers,
      total_males: formData.totalMales,
      total_females: formData.totalFemales,
      children_count: formData.children,
      adults_count: formData.adults,
      seniors_count: formData.seniors,
      monthly_income_range: formData.monthlyIncome || null,
      primary_income_source: formData.incomeSource || null,
      has_electricity: formData.hasElectricity,
      has_water_supply: formData.hasWater,
      has_internet: formData.hasInternet,
      dwelling_type: formData.dwellingType as any,
      dwelling_ownership: formData.dwellingOwnership as any,
      // Geographic hierarchy - auto-populated from user's assigned barangay
      region_code: userAddress?.region_code || null,
      province_code: userAddress?.province_code || null,
      city_municipality_code: userAddress?.city_municipality_code || null,
      barangay_code: userAddress?.barangay_code || null,
      // No household head initially - will be set when first resident is added
      household_head_id: null,
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
      if (!formData.householdCode) {
        formData.householdCode = this.generateHouseholdCode();
      }

      // Transform data to database schema
      const householdData = this.transformToDbSchema(formData, userAddress);

      // Set barangay code from parameter if provided
      if (barangayCode) {
        householdData.barangay_code = barangayCode;
      }

      logger.info('Creating household', { householdCode: formData.householdCode });

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
        recordId: data[0]?.id,
        householdCode: formData.householdCode,
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
   * Get household by ID
   */
  async getHousehold(id: string) {
    try {
      const { data, error } = await supabase.from('households').select('*').eq('id', id).single();

      if (error) {
        dbLogger.error('Failed to fetch household', { error: error.message, id });
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
   * Update household information
   */
  async updateHousehold(id: string, updates: Partial<HouseholdFormData>) {
    try {
      // Transform updates to database schema
      const dbUpdates: Record<string, any> = {};

      if (updates.householdType) dbUpdates.household_type = updates.householdType;
      if (updates.headFirstName) dbUpdates.head_first_name = updates.headFirstName;
      if (updates.headMiddleName !== undefined)
        dbUpdates.head_middle_name = updates.headMiddleName || null;
      if (updates.headLastName) dbUpdates.head_last_name = updates.headLastName;
      if (updates.headExtensionName !== undefined)
        dbUpdates.head_extension_name = updates.headExtensionName || null;
      if (updates.streetName) dbUpdates.street_name = updates.streetName;
      if (updates.houseNumber !== undefined) dbUpdates.house_number = updates.houseNumber || null;
      if (updates.subdivision !== undefined) dbUpdates.subdivision = updates.subdivision || null;
      if (updates.landmark !== undefined) dbUpdates.landmark = updates.landmark || null;
      if (updates.totalMembers !== undefined) dbUpdates.total_members = updates.totalMembers;
      if (updates.totalMales !== undefined) dbUpdates.total_males = updates.totalMales;
      if (updates.totalFemales !== undefined) dbUpdates.total_females = updates.totalFemales;
      if (updates.children !== undefined) dbUpdates.children_count = updates.children;
      if (updates.adults !== undefined) dbUpdates.adults_count = updates.adults;
      if (updates.seniors !== undefined) dbUpdates.seniors_count = updates.seniors;
      if (updates.monthlyIncome !== undefined)
        dbUpdates.monthly_income_range = updates.monthlyIncome || null;
      if (updates.incomeSource !== undefined)
        dbUpdates.primary_income_source = updates.incomeSource || null;
      if (updates.hasElectricity !== undefined) dbUpdates.has_electricity = updates.hasElectricity;
      if (updates.hasWater !== undefined) dbUpdates.has_water_supply = updates.hasWater;
      if (updates.hasInternet !== undefined) dbUpdates.has_internet = updates.hasInternet;
      if (updates.dwellingType) dbUpdates.dwelling_type = updates.dwellingType;
      if (updates.dwellingOwnership) dbUpdates.dwelling_ownership = updates.dwellingOwnership;

      if (updates.coordinates) {
        if (updates.coordinates.latitude && updates.coordinates.longitude) {
          dbUpdates.coordinates = `POINT(${updates.coordinates.longitude} ${updates.coordinates.latitude})`;
        }
      }

      const { data, error } = await supabase
        .from('households')
        .update(dbUpdates)
        .eq('id', id)
        .select();

      if (error) {
        dbLogger.error('Failed to update household', { error: error.message, id });
        return { success: false, error: error.message };
      }

      dbLogger.info('Household updated successfully', { id });
      return { success: true, data: data[0] };
    } catch (error) {
      logger.error('Unexpected error updating household', error);
      return { success: false, error: 'Failed to update household' };
    }
  }

  /**
   * Delete household
   */
  async deleteHousehold(id: string) {
    try {
      const { error } = await supabase.from('households').delete().eq('id', id);

      if (error) {
        dbLogger.error('Failed to delete household', { error: error.message, id });
        return { success: false, error: error.message };
      }

      dbLogger.info('Household deleted successfully', { id });
      return { success: true };
    } catch (error) {
      logger.error('Unexpected error deleting household', error);
      return { success: false, error: 'Failed to delete household' };
    }
  }
}

// Export singleton instance
export const householdService = new HouseholdService();
