/**
 * Database Types
 * Comprehensive TypeScript interfaces for all database table structures and query responses
 *
 * @description This file provides type-safe interfaces for all database operations,
 * replacing 'any' types throughout the application with proper TypeScript interfaces.
 * Based on the RBI system schema and PSGC reference data.
 *
 * @author Citizenly Development Team
 * @version 1.0.0
 */

// Note: Authentication types moved to auth.ts

// =============================================================================
// PSGC GEOGRAPHIC REFERENCE TYPES
// =============================================================================

export interface PSGCRegion {
  code: string;
  name: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PSGCProvince {
  code: string;
  name: string;
  region_code: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  // Joined relations
  psgc_regions?: PSGCRegion;
}

export interface PSGCCityMunicipality {
  code: string;
  name: string;
  type: string;
  province_code: string | null;
  is_independent?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  // Joined relations
  psgc_provinces?: PSGCProvince;
}

export interface PSGCBarangay {
  code: string;
  name: string;
  city_municipality_code: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  // Joined relations
  psgc_cities_municipalities?: PSGCCityMunicipality;
}

export interface PSGCSearchResponse {
  code: string;
  name: string;
  level: 'region' | 'province' | 'city' | 'barangay';
  type?: string;
  // Region fields
  region_code?: string;
  region_name?: string;
  // Province fields
  province_code?: string;
  province_name?: string;
  // City fields
  city_code?: string;
  city_name?: string;
  city_type?: string;
  // Barangay fields
  barangay_code?: string;
  barangay_name?: string;
  full_address: string;
}

// =============================================================================
// RESIDENT TYPES
// =============================================================================

/**
 * Resident record interface - EXACTLY matching residents table (38 fields)
 */
export interface ResidentRecord {
  // Primary identification
  id: string;
  philsys_card_number?: string | null;

  // Personal details
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  extension_name?: string | null;
  birthdate: string;
  birth_place_code?: string | null;
  sex: 'male' | 'female';

  // Civil status
  civil_status?: 'single' | 'married' | 'divorced' | 'separated' | 'widowed' | 'others' | null; // Default: 'single'
  civil_status_others_specify?: string | null;

  // Education and employment
  education_attainment?:
    | 'elementary'
    | 'high_school'
    | 'college'
    | 'post_graduate'
    | 'vocational'
    | null;
  is_graduate?: boolean | null; // Default: false
  employment_status?:
    | 'employed'
    | 'unemployed'
    | 'underemployed'
    | 'self_employed'
    | 'student'
    | 'retired'
    | 'homemaker'
    | 'unable_to_work'
    | 'looking_for_work'
    | 'not_in_labor_force'
    | null;
  occupation_code?: string | null;

  // Contact information
  email?: string | null;
  mobile_number?: string | null;
  telephone_number?: string | null;

  // Household membership
  household_code?: string | null;

  // Physical characteristics
  height?: number | null;
  weight?: number | null;
  complexion?: string | null;

  // Voting information
  is_voter?: boolean | null;
  is_resident_voter?: boolean | null;
  last_voted_date?: string | null;

  // Cultural/religious identity
  religion?:
    | 'roman_catholic'
    | 'islam'
    | 'iglesia_ni_cristo'
    | 'christian'
    | 'aglipayan_church'
    | 'seventh_day_adventist'
    | 'bible_baptist_church'
    | 'jehovahs_witnesses'
    | 'church_of_jesus_christ_latter_day_saints'
    | 'united_church_of_christ_philippines'
    | 'others'
    | null;
  religion_others_specify?: string | null;
  ethnicity?:
    | 'tagalog'
    | 'cebuano'
    | 'ilocano'
    | 'bisaya'
    | 'hiligaynon'
    | 'bikolano'
    | 'waray'
    | 'kapampangan'
    | 'pangasinense'
    | 'maranao'
    | 'maguindanao'
    | 'tausug'
    | 'yakan'
    | 'samal'
    | 'badjao'
    | 'aeta'
    | 'agta'
    | 'ati'
    | 'batak'
    | 'bukidnon'
    | 'gaddang'
    | 'higaonon'
    | 'ibaloi'
    | 'ifugao'
    | 'igorot'
    | 'ilongot'
    | 'isneg'
    | 'ivatan'
    | 'kalinga'
    | 'kankanaey'
    | 'mangyan'
    | 'mansaka'
    | 'palawan'
    | 'subanen'
    | 'tboli'
    | 'teduray'
    | 'tumandok'
    | 'chinese'
    | 'others'
    | null;
  citizenship?: 'filipino' | 'dual_citizen' | 'foreigner' | null; // Default: 'filipino'
  blood_type?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | null;

  // Family information
  mother_maiden_first?: string | null;
  mother_maiden_middle?: string | null;
  mother_maiden_last?: string | null;

  // Status and audit
  is_active?: boolean | null; // Default: true
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

// Note: ResidentSectoralInfo moved to residents.ts
// Note: HouseholdRecord moved to households.ts

// Re-export commonly used form types
export type { ResidentFormData } from './forms';

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface AddressHierarchyQueryResult {
  barangay_code: string;
  barangay_name: string;
  city_code: string;
  city_name: string;
  city_type: string;
  province_code: string | null;
  province_name: string | null;
  region_code: string;
  region_name: string;
  full_address: string;
}

export interface GeographicHierarchyResult {
  city_municipality_code: string;
  psgc_cities_municipalities: {
    code: string;
    province_code: string;
    psgc_provinces: {
      code: string;
      region_code: string;
    };
  };
}

// Alternative interface for single record results
export interface GeographicHierarchySingleResult {
  city_municipality_code: string;
  psgc_cities_municipalities: {
    code: string;
    province_code: string;
    psgc_provinces: {
      code: string;
      region_code: string;
    };
  };
}

// Note: UserProfile types moved to auth.ts

// Note: HouseholdWithMembersResult moved to households.ts

// =============================================================================
// RATE LIMITING TYPES
// =============================================================================

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  limit: number;
}

export type RateLimitAction = 
  | 'SEARCH_RESIDENTS' 
  | 'RESIDENT_CREATE' 
  | 'RESIDENT_UPDATE' 
  | 'RESIDENT_DELETE'
  | 'HOUSEHOLD_CREATE'
  | 'HOUSEHOLD_UPDATE';

// =============================================================================
// WEBHOOK AND NOTIFICATION TYPES
// =============================================================================

export interface NotificationRecord {
  id: string;
  user_id: string;
  notification_type: 'welcome_email' | 'sms_welcome' | 'password_reset' | 'account_verified';
  status: 'pending' | 'sent' | 'failed';
  metadata: Record<string, unknown>;
  retry_count: number;
  error_message?: string | null;
  scheduled_for?: string | null;
  sent_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  record: Record<string, unknown>;
  old_record?: Record<string, unknown>;
}

export interface UserProfileWithRole {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  barangay_code?: string | null;
  city_municipality_code?: string | null;
  province_code?: string | null;
  region_code?: string | null;
  auth_roles: {
    name: string;
  };
}

export interface AddressHierarchyWebhookResult {
  city_municipality_code: string;
  psgc_cities_municipalities: {
    code: string;
    province_code: string;
    psgc_provinces: {
      code: string;
      region_code: string;
    };
  };
}

// =============================================================================
// API RESPONSE STANDARDS
// =============================================================================

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  count?: number;
  totalCount?: number;
  offset?: number;
  hasMore?: boolean;
  message?: string;
}

export interface ApiErrorResponse {
  success?: false;
  error: string;
  details?: string;
  validationErrors?: Record<string, string[]>;
  code?: string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// =============================================================================
// VALIDATION TYPES
// =============================================================================

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// =============================================================================
// SUPABASE QUERY RESPONSE TYPES  
// =============================================================================

// Database query result types for joined relations
export interface PSGCProvinceWithRegion {
  code: string;
  name: string;
  region_code: string;
  psgc_regions: PSGCRegion | PSGCRegion[] | null;
}

export interface PSGCCityWithProvince {
  code: string;
  name: string;
  type: string;
  province_code: string | null;
  is_independent?: boolean;
  psgc_provinces: PSGCProvinceWithRegion | PSGCProvinceWithRegion[] | null;
}

export interface PSGCBarangayWithCity {
  code: string;
  name: string;
  city_municipality_code: string;
  psgc_cities_municipalities: PSGCCityWithProvince | PSGCCityWithProvince[] | null;
}

export interface SupabaseQueryResponse<T> {
  data: T | null;
  error: {
    message: string;
    details?: string;
    hint?: string;
    code?: string;
  } | null;
  count?: number | null;
  status?: number;
  statusText?: string;
}

// Note: SupabaseAuthResponse moved to auth.ts

// =============================================================================
// VALIDATION ERROR TYPES
// =============================================================================

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// =============================================================================
// API REQUEST CONTEXT TYPES
// =============================================================================

export interface RequestMetadata {
  userAgent?: string;
  ipAddress?: string;
  requestId?: string;
  timestamp: string;
  userId?: string;
}

export interface AuditLogEntry {
  id?: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'view';
  resource_type: string;
  resource_id?: string;
  user_id?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

// =============================================================================
// DASHBOARD AND STATISTICS TYPES
// =============================================================================

export interface DashboardStats {
  total_residents: number;
  total_households: number;
  total_male: number;
  total_female: number;
  total_senior_citizens: number;
  total_youth: number;
  total_children: number;
  total_labor_force: number;
  total_employed: number;
  total_unemployed: number;
  dependency_ratio: number;
  barangay_code: string;
  last_updated: string;
}

export interface PopulationByAgeGroup {
  age_group: string;
  male_count: number;
  female_count: number;
  total_count: number;
}

export interface EmploymentStatistics {
  employment_status: string;
  count: number;
  percentage: number;
}

// =============================================================================
// PSOC (PHILIPPINE STANDARD OCCUPATIONAL CLASSIFICATION) TYPES
// =============================================================================

/**
 * PSOC Major Groups (Level 1) - 10 major occupational categories
 */
export interface PSOCMajorGroup {
  code: string; // VARCHAR(10) PRIMARY KEY
  title: string; // VARCHAR(200) NOT NULL
  created_at: string; // TIMESTAMPTZ DEFAULT NOW()
}

/**
 * PSOC Sub-Major Groups (Level 2) - 39 sub-major categories
 */
export interface PSOCSubMajorGroup {
  code: string; // VARCHAR(10) PRIMARY KEY
  title: string; // VARCHAR(200) NOT NULL
  major_code: string; // VARCHAR(10) NOT NULL REFERENCES psoc_major_groups(code)
  created_at: string; // TIMESTAMPTZ DEFAULT NOW()
}

/**
 * PSOC Minor Groups (Level 3) - 124 minor categories
 */
export interface PSOCMinorGroup {
  code: string; // VARCHAR(10) PRIMARY KEY
  title: string; // VARCHAR(200) NOT NULL
  sub_major_code: string; // VARCHAR(10) NOT NULL REFERENCES psoc_sub_major_groups(code)
  created_at: string; // TIMESTAMPTZ DEFAULT NOW()
}

/**
 * PSOC Unit Groups (Level 4) - 444 unit categories
 */
export interface PSOCUnitGroup {
  code: string; // VARCHAR(10) PRIMARY KEY
  title: string; // VARCHAR(200) NOT NULL
  minor_code: string; // VARCHAR(10) NOT NULL REFERENCES psoc_minor_groups(code)
  created_at: string; // TIMESTAMPTZ DEFAULT NOW()
}

/**
 * PSOC Unit Sub-Groups (Level 5) - 1,000 detailed occupational categories
 */
export interface PSOCUnitSubGroup {
  code: string; // VARCHAR(10) PRIMARY KEY
  title: string; // VARCHAR(200) NOT NULL
  unit_code: string; // VARCHAR(10) NOT NULL REFERENCES psoc_unit_groups(code)
  created_at: string; // TIMESTAMPTZ DEFAULT NOW()
}

/**
 * PSOC Position Titles - Specific job titles (currently empty table)
 */
export interface PSOCPositionTitle {
  id: string; // UUID PRIMARY KEY DEFAULT uuid_generate_v4()
  title: string; // VARCHAR(200) NOT NULL
  unit_group_code: string; // VARCHAR(10) NOT NULL REFERENCES psoc_unit_groups(code)
  is_primary?: boolean | null; // BOOLEAN DEFAULT false
  description?: string | null; // TEXT
  created_at: string; // TIMESTAMPTZ DEFAULT NOW()
}

// =============================================================================
// ADDITIONAL UTILITY TYPES FOR ANY FIXES
// =============================================================================

import { ChangeEvent } from 'react';

// API Event Handler Types (alias for convenience)
export type FormChangeEvent = ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;

// PSGC Search Response Types  
export interface PSGCSearchResponse {
  code: string;
  name: string;
  level: number;
  parent_code?: string;
  is_active: boolean;
  type?: string;
  full_address?: string;
}

// Generic API Response Wrapper
export interface APIResponse<T = unknown> {
  data: T;
  success: boolean;
  error?: string;
  count?: number;
}

// Legacy Supabase Query Response Type - keeping for compatibility
export interface LegacySupabaseQueryResponse<T> {
  data: T | null;
  error: {
    message: string;
    code?: string;
    details?: string;
  } | null;
}

// Table Component Types
export interface TableRecord extends Record<string, unknown> {
  id: string | number;
}

// Select Option Interface for dropdowns
export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

// Migration Information Type
export interface ResidentMigrantInfo {
  id: string;
  resident_id: string;
  previous_barangay_code?: string;
  previous_city_municipality_code?: string;
  previous_province_code?: string;
  previous_region_code?: string;
  date_of_transfer?: string;
  reason_for_migration?: string;
  is_intending_to_return?: boolean;
  length_of_stay_previous_months?: number;
  migration_type?: string;
  created_at: string;
  updated_at: string;
}
