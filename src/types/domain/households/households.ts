/**
 * Household Types - Database-Aligned TypeScript Interfaces
 *
 * @fileoverview Comprehensive household-related TypeScript interfaces that exactly match
 * the database schema defined in database/schema.sql. All interfaces are 100% compliant
 * with PostgreSQL constraints and DILG RBI household management requirements.
 *
 * @version 3.0.0
 * @since 2025-01-01
 * @author Citizenly Development Team
 *
 * Database Tables Covered:
 * - households (main household data with geographic references - 27 fields)
 * - household_members (resident-to-household relationships - 7 fields)
 * - geo_streets (street-level address components - 13 fields)
 * - geo_subdivisions (subdivision-level address components - 14 fields)
 *
 * Key Features:
 * - 100% PostgreSQL schema compliance
 * - Full DILG RBI household classification support
 * - Geographic hierarchy integration (Region > Province > City > Barangay > Street)
 * - Income classification per Philippine Statistical Office standards
 * - Tenure status tracking for housing security analysis
 * - Household type classification for demographic studies
 *
 * @example Basic Household Creation
 * ```typescript
 * import { HouseholdRecord, HouseholdFormData } from '@/types/domain/households';
 * import { HOUSEHOLD_TYPE_OPTIONS } from '@/constants/household-form-options';
 *
 * const household: HouseholdRecord = {
 *   code: 'BRG001-HH-2025-001',
 *   house_number: '123',
 *   street_id: 'uuid-street-id',
 *   barangay_code: '1234567890',
 *   city_municipality_code: '1234567890',
 *   region_code: '12',
 *   household_type: 'nuclear',
 *   tenure_status: 'owned',
 *   monthly_income: 25000,
 *   income_class: 'lower_middle_class',
 *   no_of_families: 1,
 *   no_of_household_members: 4,
 *   is_active: true
 * };
 * ```
 *
 * @example Household with Geographic Details
 * ```typescript
 * import { HouseholdWithMembersResult } from '@/types/domain/households';
 *
 * const householdWithDetails: HouseholdWithMembersResult = {
 *   code: 'BRG001-HH-2025-001',
 *   house_number: '123',
 *   street_id: 'uuid-street-id',
 *   barangay_code: '1234567890',
 *   city_municipality_code: '1234567890',
 *   region_code: '12',
 *   member_count: 4,
 *   head_name: 'Juan Dela Cruz',
 *   household_head_position: 'father',
 *   // ... full address hierarchy
 * };
 * ```
 *
 * @example Form Data Processing
 * ```typescript
 * import { HouseholdFormData, HouseholdValidationError } from '@/types/domain/households';
 *
 * const validateHouseholdForm = (data: HouseholdFormData): HouseholdValidationError[] => {
 *   const errors: HouseholdValidationError[] = [];
 *
 *   if (!data.house_number) {
 *     errors.push({ field: 'house_number', message: 'House number is required' });
 *   }
 *
 *   return errors;
 * };
 * ```
 */

import { ReactNode } from 'react';

// =============================================================================
// HOUSEHOLD ENUM TYPES (Re-exported from database.ts)
// =============================================================================

// Import enums and types from database.ts
import type {
  HouseholdTypeEnum,
  TenureStatusEnum,
  HouseholdUnitEnum,
  FamilyPositionEnum,
  IncomeClassEnum,
  HouseholdRecord as DatabaseHouseholdRecord,
} from '../../infrastructure/database/database';

// Re-export enums for backwards compatibility
export type {
  HouseholdTypeEnum,
  TenureStatusEnum,
  HouseholdUnitEnum,
  FamilyPositionEnum,
  IncomeClassEnum,
};

// =============================================================================
// CORE HOUSEHOLD INTERFACES
// =============================================================================

/**
 * Canonical household record interface - re-exported from database.ts
 * @description Matches the households table exactly (27 fields)
 */
export type HouseholdRecord = DatabaseHouseholdRecord;

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
 * @description Extended household data with computed fields for display purposes
 */
export interface HouseholdWithMembersResult {
  // PRIMARY KEY - households table uses 'code' as primary key, not 'id'
  code: string; // VARCHAR(50) NOT NULL PRIMARY KEY

  // Basic household information
  name?: string | null; // VARCHAR(200)
  address?: string | null; // TEXT

  // REQUIRED location fields (NOT NULL in database)
  house_number: string; // VARCHAR(50) NOT NULL
  street_id: string; // UUID NOT NULL REFERENCES geo_streets(id)
  barangay_code: string; // VARCHAR(10) NOT NULL REFERENCES psgc_barangays(code)
  city_municipality_code: string; // VARCHAR(10) NOT NULL REFERENCES psgc_cities_municipalities(code)
  region_code: string; // VARCHAR(10) NOT NULL REFERENCES psgc_regions(code)

  // Optional location fields
  subdivision_id?: string | null; // UUID REFERENCES geo_subdivisions(id)
  province_code?: string | null; // VARCHAR(10) REFERENCES psgc_provinces(code)
  zip_code?: string | null; // VARCHAR(10)

  // Household head information
  household_head_id?: string | null; // UUID REFERENCES residents(id)
  household_head_position?: FamilyPositionEnum | null; // Use database enum

  // Household classifications (use database enums)
  household_type?: HouseholdTypeEnum | null;
  tenure_status?: TenureStatusEnum | null;
  tenure_others_specify?: string | null; // TEXT
  household_unit?: HouseholdUnitEnum | null;

  // Economic information
  monthly_income?: number | null; // NUMERIC
  income_class?: IncomeClassEnum | null;

  // Household metrics
  no_of_families?: number | null; // INTEGER DEFAULT 1
  no_of_household_members?: number | null; // INTEGER DEFAULT 0
  no_of_migrants?: number | null; // INTEGER DEFAULT 0

  // Computed/joined fields for display
  member_count?: number;
  head_name?: string | null;

  // System fields (REQUIRED in database)
  is_active: boolean; // BOOLEAN NOT NULL DEFAULT true
  created_at: string; // TIMESTAMPTZ NOT NULL DEFAULT NOW()
  updated_at: string; // TIMESTAMPTZ NOT NULL DEFAULT NOW()
}

// =============================================================================
// FORM AND UI INTERFACES
// =============================================================================

/**
 * Household member with resident details interface
 * Used in components that display household member information
 */
export interface HouseholdMemberWithResident {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  extension_name?: string;
  birthdate: string;
  sex: 'male' | 'female';
  civil_status?: string;
  relationship_to_head?: string;
  mobile_number?: string;
  email?: string;
  education_attainment?: string;
  employment_status?: string;
  occupation_title?: string;
  is_head?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  household_code?: string;
  barangay_code?: string;
}

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

// Form option constants moved to dedicated constants file for better organization
// Import from: @/constants/household-form-options
export type { OptionType } from '@/constants/household-form-options';
export {
  HOUSEHOLD_TYPE_OPTIONS,
  TENURE_STATUS_OPTIONS,
  HOUSEHOLD_UNIT_OPTIONS,
  INCOME_CLASS_OPTIONS,
  HOUSEHOLD_FORM_OPTIONS,
} from '@/constants/household-form-options';

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

// =============================================================================
// FORM DATA TYPES - Re-exported from modular forms structure
// =============================================================================
export type {
  DemographicsInformationFormData,
  AddressInformationFormData, 
  IncomeAndHeadInformationFormData,
  HouseholdTypeInformationFormData,
} from './forms';
