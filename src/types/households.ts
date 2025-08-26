/**
 * Household Types
 * Comprehensive TypeScript interfaces for household-related functionality
 */

import { ReactNode } from 'react';

// =============================================================================
// CORE HOUSEHOLD INTERFACES
// =============================================================================

/**
 * Database record interface for households - EXACTLY matching households table (27 fields)
 */
export interface HouseholdRecord {
  // Primary identification
  code: string;
  name?: string | null;
  address?: string | null;
  
  // Location details
  house_number: string;
  street_id: string;
  subdivision_id?: string | null;
  barangay_code: string;
  city_municipality_code: string;
  province_code?: string | null;
  region_code: string;
  zip_code?: string | null;
  
  // Household metrics
  no_of_families?: number | null;
  no_of_household_members?: number | null;
  no_of_migrants?: number | null;
  
  // Household classifications (enums)
  household_type?: 'nuclear' | 'single_parent' | 'extended' | 'childless' | 'one_person' | 'non_family' | 'other' | null;
  tenure_status?: 'owned' | 'owned_with_mortgage' | 'rented' | 'occupied_for_free' | 'occupied_without_consent' | 'others' | null;
  tenure_others_specify?: string | null;
  household_unit?: 'single_house' | 'duplex' | 'apartment' | 'townhouse' | 'condominium' | 'boarding_house' | 'institutional' | 'makeshift' | 'others' | null;
  
  // Economic information
  monthly_income?: number | null;
  income_class?: 'rich' | 'high_income' | 'upper_middle_income' | 'middle_class' | 'lower_middle_class' | 'low_income' | 'poor' | 'not_determined' | null;
  
  // Head of household
  household_head_id?: string | null;
  household_head_position?: 'father' | 'mother' | 'son' | 'daughter' | 'grandmother' | 'grandfather' | 'father_in_law' | 'mother_in_law' | 'brother_in_law' | 'sister_in_law' | 'spouse' | 'sibling' | 'guardian' | 'ward' | 'other' | null;
  
  // Status and audit
  is_active: boolean;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Extended household data with related information
 */
export interface HouseholdData {
  code: string;
  name?: string;
  house_number?: string;
  street_id?: string;
  subdivision_id?: string;
  barangay_code: string;
  household_head_id?: string;
  geo_streets?: Array<{
    id: string;
    name: string;
  }>;
  geo_subdivisions?: Array<{
    id: string;
    name: string;
    type: string;
  }>;
}

/**
 * Household head information
 */
export interface HouseholdHead {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
}

/**
 * Household with member count and head information - aligned with database structure
 */
export interface HouseholdWithMembersResult {
  // Note: households table uses 'code' as primary key, not 'id'
  code: string;
  name?: string | null;
  address?: string | null;
  house_number: string;
  street_id: string; // UUID reference
  subdivision_id?: string | null; // UUID reference  
  barangay_code: string;
  city_municipality_code: string;
  province_code?: string | null;
  region_code: string;
  zip_code?: string | null;
  household_head_id?: string | null; // UUID reference to residents
  household_head_position?: 'father' | 'mother' | 'son' | 'daughter' | 'grandmother' | 'grandfather' | 'father_in_law' | 'mother_in_law' | 'brother_in_law' | 'sister_in_law' | 'spouse' | 'sibling' | 'guardian' | 'ward' | 'other' | null;
  household_type?: 'nuclear' | 'single_parent' | 'extended' | 'childless' | 'one_person' | 'non_family' | 'other' | null;
  tenure_status?: 'owned' | 'owned_with_mortgage' | 'rented' | 'occupied_for_free' | 'occupied_without_consent' | 'others' | null;
  tenure_others_specify?: string | null;
  household_unit?: 'single_house' | 'duplex' | 'apartment' | 'townhouse' | 'condominium' | 'boarding_house' | 'institutional' | 'makeshift' | 'others' | null;
  monthly_income?: number | null;
  income_class?: 'rich' | 'high_income' | 'upper_middle_income' | 'middle_class' | 'lower_middle_class' | 'low_income' | 'poor' | 'not_determined' | null;
  no_of_families?: number | null;
  no_of_household_members?: number | null;
  no_of_migrants?: number | null;
  // Computed/joined fields
  member_count?: number;
  head_name?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// FORM AND UI INTERFACES
// =============================================================================

/**
 * Household form data interface - re-export from forms.ts for backward compatibility
 */
export type { HouseholdFormData } from '@/types/forms';

/**
 * Household option for select components
 */
export interface HouseholdOption {
  value: string;
  label: string;
  description: string;
  code: string;
  head_name: string;
  address: string;
}

/**
 * Household search parameters
 */
export interface HouseholdSearchParams {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  barangayCode?: string;
  householdType?: string;
  incomeClass?: string;
}

// =============================================================================
// API AND RESPONSE INTERFACES
// =============================================================================

/**
 * API response for household creation/update
 */
export interface HouseholdApiResponse {
  household: HouseholdRecord;
  members?: Array<{
    id: string;
    first_name: string;
    last_name: string;
    relationship?: string;
  }>;
}

/**
 * API response for household listing
 */
export interface HouseholdsListResponse {
  data: HouseholdWithMembersResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  message: string;
}

// =============================================================================
// TABLE AND DISPLAY INTERFACES
// =============================================================================

/**
 * Household table column configuration
 */
export interface HouseholdTableColumn {
  key: string;
  title: string;
  dataIndex: string | ((record: HouseholdWithMembersResult) => string | number | boolean);
  render?: (value: string | number | boolean, record: HouseholdWithMembersResult) => ReactNode;
  sortable?: boolean;
}

/**
 * Household table action configuration
 */
export interface HouseholdTableAction {
  key: string;
  label: string;
  href?: (record: HouseholdWithMembersResult) => string;
  onClick?: (record: HouseholdWithMembersResult) => void;
  variant: 'primary' | 'secondary' | 'danger';
}

// =============================================================================
// ENUM OPTIONS AND CONSTANTS
// =============================================================================

// Note: EnumOption moved to forms.ts to avoid conflicts

type OptionType = { value: string; label: string };

export const HOUSEHOLD_TYPE_OPTIONS: OptionType[] = [
  { value: 'nuclear', label: 'Nuclear Family' },
  { value: 'single_parent', label: 'Single Parent' },
  { value: 'extended', label: 'Extended Family' },
  { value: 'childless', label: 'Childless' },
  { value: 'one_person', label: 'One Person' },
  { value: 'non_family', label: 'Non-Family' },
  { value: 'other', label: 'Other' }
];

export const TENURE_STATUS_OPTIONS: OptionType[] = [
  { value: 'owned', label: 'Owned' },
  { value: 'owned_with_mortgage', label: 'Owned with Mortgage' },
  { value: 'rented', label: 'Rented' },
  { value: 'occupied_for_free', label: 'Occupied for Free' },
  { value: 'occupied_without_consent', label: 'Occupied without Consent' },
  { value: 'others', label: 'Others' }
];

export const INCOME_CLASS_OPTIONS: OptionType[] = [
  { value: 'poor', label: 'Poor (Below ₱12,030/month)' },
  { value: 'low_income', label: 'Low Income (₱12,030-₱24,120)' },
  { value: 'lower_middle_class', label: 'Lower Middle Class (₱24,120-₱43,828)' },
  { value: 'middle_class', label: 'Middle Class (₱43,828-₱76,699)' },
  { value: 'upper_middle_income', label: 'Upper Middle Income (₱76,699-₱131,484)' },
  { value: 'high_income', label: 'High Income (₱131,484-₱219,140)' },
  { value: 'rich', label: 'Rich (Above ₱219,140)' },
  { value: 'not_determined', label: 'Not Determined' }
];

export const HOUSEHOLD_UNIT_OPTIONS: OptionType[] = [
  { value: 'single_house', label: 'Single House' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'condominium', label: 'Condominium' },
  { value: 'boarding_house', label: 'Boarding House' },
  { value: 'institutional', label: 'Institutional' },
  { value: 'makeshift', label: 'Makeshift' },
  { value: 'others', label: 'Others' }
];

// =============================================================================
// VALIDATION AND ERROR INTERFACES
// =============================================================================

/**
 * Household validation error
 */
export interface HouseholdValidationError {
  field: string;
  message: string;
}

// Note: FormMode moved to forms.ts to avoid conflicts

/**
 * Household form submission state
 */
export interface HouseholdFormSubmissionState {
  isSubmitting: boolean;
  isSubmitted: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}