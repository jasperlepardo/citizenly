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
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PSGCProvince {
  code: string;
  name: string;
  region_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PSGCCityMunicipality {
  code: string;
  name: string;
  type: string;
  province_code: string | null;
  is_independent: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PSGCBarangay {
  code: string;
  name: string;
  city_municipality_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// RESIDENT TYPES
// =============================================================================

export interface ResidentRecord {
  id: string;
  philsys_card_number?: string | null;
  philsys_last4?: string | null;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  extension_name?: string | null;
  birthdate: string;
  birth_place_code?: string | null;
  birth_place_name?: string | null;
  sex: 'male' | 'female';
  civil_status: string;
  civil_status_others_specify?: string | null;
  education_attainment?: string | null;
  is_graduate?: boolean | null;
  employment_status?: string | null;
  occupation_code?: string | null;
  email?: string | null;
  mobile_number?: string | null;
  telephone_number?: string | null;
  household_code?: string | null;
  blood_type?: string | null;
  height?: number | null;
  weight?: number | null;
  complexion?: string | null;
  citizenship: string;
  is_voter?: boolean | null;
  is_resident_voter?: boolean | null;
  last_voted_date?: string | null;
  ethnicity?: string | null;
  religion?: string | null;
  religion_others_specify?: string | null;
  mother_maiden_first?: string | null;
  mother_maiden_middle?: string | null;
  mother_maiden_last?: string | null;
  is_active: boolean;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

// Note: ResidentSectoralInfo moved to residents.ts
// Note: HouseholdRecord moved to households.ts

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
// WEBHOOK AND NOTIFICATION TYPES
// =============================================================================

// Note: Webhook and notification types moved to auth.ts

// =============================================================================
// SUPABASE QUERY RESPONSE TYPES
// =============================================================================

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