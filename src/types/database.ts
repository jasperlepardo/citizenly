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

// =============================================================================
// AUTHENTICATION AND USER TYPES
// =============================================================================

export interface AuthUser {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  phone: string | null;
  phone_confirmed_at: string | null;
  confirmed_at: string | null;
  last_sign_in_at: string | null;
  created_at: string;
  updated_at: string;
  app_metadata: Record<string, unknown>;
  user_metadata: Record<string, unknown>;
}

export interface AuthUserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  barangay_code: string;
  city_municipality_code?: string | null;
  province_code?: string | null;
  region_code?: string | null;
  role_id: string;
  email_verified: boolean;
  email_verified_at?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthRole {
  id: string;
  name: string;
  display_name: string;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

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
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  extension_name?: string | null;
  birthdate: string;
  birth_place_code?: string | null;
  birth_place_level?: 'region' | 'province' | 'city_municipality' | 'barangay' | null;
  birth_place_name?: string | null;
  sex: 'male' | 'female';
  civil_status: string;
  citizenship: string;
  mobile_number?: string | null;
  telephone_number?: string | null;
  email?: string | null;
  mother_maiden_first?: string | null;
  mother_maiden_middle?: string | null;
  mother_maiden_last?: string | null;
  household_code?: string | null;
  barangay_code: string;
  city_municipality_code?: string | null;
  province_code?: string | null;
  region_code?: string | null;
  zip_code?: string | null;
  civil_status_others_specify?: string | null;
  blood_type?: string | null;
  height?: number | null;
  weight?: number | null;
  complexion?: string | null;
  ethnicity?: string | null;
  religion?: string | null;
  religion_others_specify?: string | null;
  employment_status?: string | null;
  education_attainment?: string | null;
  is_graduate?: boolean | null;
  psoc_code?: string | null;
  psoc_level?: number | null;
  occupation_title?: string | null;
  philsys_card_number?: string | null;
  is_voter?: boolean | null;
  is_resident_voter?: boolean | null;
  last_voted_date?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface ResidentSectoralInfo {
  resident_id: string;
  is_labor_force?: boolean | null;
  is_labor_force_employed?: boolean | null;
  is_unemployed?: boolean | null;
  is_overseas_filipino_worker?: boolean | null;
  is_person_with_disability?: boolean | null;
  is_out_of_school_children?: boolean | null;
  is_out_of_school_youth?: boolean | null;
  is_senior_citizen?: boolean | null;
  is_registered_senior_citizen?: boolean | null;
  is_solo_parent?: boolean | null;
  is_indigenous_people?: boolean | null;
  is_migrant?: boolean | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// HOUSEHOLD TYPES
// =============================================================================

export interface HouseholdRecord {
  id: string;
  code: string;
  street_name?: string | null;
  subdivision_name?: string | null;
  household_number?: string | null;
  barangay_code: string;
  city_municipality_code?: string | null;
  province_code?: string | null;
  region_code?: string | null;
  head_resident_id?: string | null;
  household_type?: string | null;
  tenure_status?: string | null;
  monthly_income?: number | null;
  income_class?: string | null;
  no_of_families?: number | null;
  no_of_household_members?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
}

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

export interface UserProfileQueryResult {
  email: string;
  first_name: string;
  phone?: string | null;
  auth_roles: {
    name: string;
  };
}

// Alternative interface for single result queries
export interface UserProfileSingleResult {
  email: string;
  first_name: string;
  phone?: string | null;
  auth_roles: {
    name: string;
  };
}

export interface HouseholdWithMembersResult {
  id: string;
  code: string;
  street_name?: string | null;
  subdivision_name?: string | null;
  household_number?: string | null;
  barangay_code: string;
  city_municipality_code?: string | null;
  province_code?: string | null;
  region_code?: string | null;
  head_resident_id?: string | null;
  household_type?: string | null;
  tenure_status?: string | null;
  monthly_income?: number | null;
  income_class?: string | null;
  no_of_families?: number | null;
  no_of_household_members?: number | null;
  member_count?: number;
  head_name?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// WEBHOOK AND NOTIFICATION TYPES
// =============================================================================

export interface WebhookUserRecord {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  phone?: string | null;
  created_at: string;
  updated_at: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}

export interface UserNotificationRecord {
  id?: string;
  user_id: string;
  notification_type: string;
  metadata: Record<string, unknown>;
  status?: 'pending' | 'sent' | 'failed';
  created_at?: string;
  updated_at?: string;
}

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

export interface SupabaseAuthResponse {
  data: {
    user: AuthUser | null;
    session: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      token_type: string;
      user: AuthUser;
    } | null;
  };
  error: {
    message: string;
    status?: number;
  } | null;
}

// =============================================================================
// FORM DATA TYPES
// =============================================================================

export interface ResidentFormData {
  firstName: string;
  middleName?: string;
  lastName: string;
  extensionName?: string;
  birthdate: string;
  sex: 'male' | 'female';
  civilStatus: string;
  citizenship: string;
  mobileNumber?: string;
  telephoneNumber?: string;
  email?: string;
  motherMaidenFirstName?: string;
  motherMaidenMiddleName?: string;
  motherMaidenLastName?: string;
  birthPlaceCode?: string;
  birthPlaceLevel?: 'region' | 'province' | 'city_municipality' | 'barangay';
  birthPlaceName?: string;
  householdCode?: string;
  barangayCode?: string;
  cityMunicipalityCode?: string;
  provinceCode?: string;
  regionCode?: string;
  zipCode?: string;
  bloodType?: string;
  height?: string;
  weight?: string;
  complexion?: string;
  ethnicity?: string;
  religion?: string;
  religionOthersSpecify?: string;
  employmentStatus?: string;
  educationAttainment?: string;
  isGraduate?: boolean;
  psocCode?: string;
  psocLevel?: number;
  occupationTitle?: string;
  philsysCardNumber?: string;
  isVoter?: boolean;
  isResidentVoter?: boolean;
  lastVotedDate?: string;
}

export interface HouseholdFormData {
  code: string;
  streetName?: string;
  subdivisionName?: string;
  householdNumber?: string;
  barangayCode?: string;
  cityMunicipalityCode?: string;
  provinceCode?: string;
  regionCode?: string;
  headResidentId?: string;
  householdType?: string;
  tenureStatus?: string;
  monthlyIncome?: number;
  incomeClass?: string;
}

// =============================================================================
// VALIDATION ERROR TYPES
// =============================================================================

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  data?: unknown;
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
