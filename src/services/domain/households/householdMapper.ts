/**
 * Household Data Mapper
 * Handles data transformation between different formats
 */

import type { HouseholdFormData } from '@/types/app/ui/forms';
import type { HouseholdRecord } from '@/types/infrastructure/database/database';

/**
 * Map form data to database record
 */
export const mapFormToDatabase = (
  formData: HouseholdFormData
): Omit<HouseholdRecord, 'id' | 'created_at' | 'updated_at'> => {
  return {
    // Primary identification
    code: formData.code,
    name: formData.name || null,
    address: formData.address || null,

    // Location details
    house_number: formData.house_number,
    street_id: formData.street_id,
    subdivision_id: formData.subdivision_id || null,
    barangay_code: formData.barangay_code,
    city_municipality_code: formData.city_municipality_code,
    province_code: formData.province_code || null,
    region_code: formData.region_code,
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

    // Status
    is_active: true,
  };
};

/**
 * Map database record to form data
 */
export const mapDatabaseToForm = (record: HouseholdRecord): HouseholdFormData => {
  return {
    // Primary identification
    code: record.code,
    name: record.name || '',
    address: record.address || '',

    // Location details
    house_number: record.house_number,
    street_id: record.street_id,
    subdivision_id: record.subdivision_id || '',
    barangay_code: record.barangay_code,
    city_municipality_code: record.city_municipality_code,
    province_code: record.province_code || '',
    region_code: record.region_code,
    zip_code: record.zip_code || '',

    // Household metrics
    no_of_families: record.no_of_families || 1,
    no_of_household_members: record.no_of_household_members || 0,
    no_of_migrants: record.no_of_migrants || 0,

    // Household classifications
    household_type: record.household_type || null,
    tenure_status: record.tenure_status || null,
    tenure_others_specify: record.tenure_others_specify || '',
    household_unit: record.household_unit || null,

    // Economic information
    monthly_income: record.monthly_income || 0,
    income_class: record.income_class || null,

    // Head of household
    household_head_id: record.household_head_id || '',
    household_head_position: record.household_head_position || null,

    // Timestamps (read-only in forms)
    created_at: record.created_at,
    updated_at: record.updated_at,
  };
};

/**
 * Map household record to display format
 */
export const mapToDisplayFormat = (record: HouseholdRecord) => {
  return {
    code: record.code,
    name: record.name || `Household ${record.code}`,
    address: [
      record.house_number,
      record.street_id,
      record.subdivision_id,
    ].filter(Boolean).join(', ') || 'No address',
    
    memberCount: record.no_of_household_members || 0,
    familyCount: record.no_of_families || 1,
    migrantCount: record.no_of_migrants || 0,
    
    householdType: record.household_type || 'Not specified',
    tenureStatus: record.tenure_status || 'Not specified',
    monthlyIncome: record.monthly_income || 0,
    incomeClass: record.income_class || 'Not classified',
    
    headId: record.household_head_id,
    headPosition: record.household_head_position,
    
    isActive: record.is_active,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
};

/**
 * Map to API response format
 */
export const mapToApiResponse = (record: HouseholdRecord) => {
  return {
    success: true,
    data: {
      household: mapToDisplayFormat(record),
      meta: {
        lastUpdated: record.updated_at,
        isActive: record.is_active,
      }
    }
  };
};

/**
 * Map multiple records to table format
 */
export const mapToTableFormat = (records: HouseholdRecord[]) => {
  return records.map(record => ({
    code: record.code,
    name: record.name || 'Unnamed',
    address: record.house_number || 'No house #',
    members: record.no_of_household_members || 0,
    income: record.monthly_income || 0,
    type: record.household_type || '-',
    status: record.is_active ? 'Active' : 'Inactive',
    createdAt: record.created_at,
  }));
};

/**
 * Transform database validation errors to form-friendly format
 */
export const mapValidationErrors = (errors: any): Record<string, string> => {
  const formErrors: Record<string, string> = {};
  
  if (Array.isArray(errors)) {
    errors.forEach(error => {
      if (error.field) {
        formErrors[error.field] = error.message || 'Invalid value';
      }
    });
  } else if (typeof errors === 'object') {
    Object.entries(errors).forEach(([field, message]) => {
      formErrors[field] = typeof message === 'string' ? message : 'Invalid value';
    });
  }
  
  return formErrors;
};

/**
 * Create default household form data
 */
export const createDefaultFormData = (
  barangayCode?: string,
  householdCode?: string
): Partial<HouseholdFormData> => {
  return {
    code: householdCode || '',
    name: '',
    house_number: '',
    street_id: '',
    subdivision_id: '',
    barangay_code: barangayCode || '',
    city_municipality_code: '',
    province_code: '',
    region_code: '',
    zip_code: '',
    no_of_families: 1,
    no_of_household_members: 0,
    no_of_migrants: 0,
    household_type: null,
    tenure_status: null,
    household_unit: null,
    monthly_income: 0,
    income_class: null,
    household_head_id: '',
    household_head_position: null,
  };
};