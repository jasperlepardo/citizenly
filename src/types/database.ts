/**
 * Database Types - Canonical PostgreSQL Schema Interface Collection
 *
 * @fileoverview Comprehensive TypeScript interfaces that provide 100% compliant mapping
 * to the PostgreSQL database schema defined in database/schema.sql. This serves as the
 * single source of truth for all database operations in the Citizenly RBI system.
 *
 * @version 3.0.0
 * @since 2025-01-01
 * @author Citizenly Development Team
 *
 * Database Schema Coverage (100% Complete):
 * - 13 Core Tables: residents, households, auth_*, psgc_*, psoc_*, geo_*, system_*
 * - 13 Enum Types: All PostgreSQL ENUMs with 100% value matching
 * - 42,046+ PSGC Barangays: Complete Philippine geographic hierarchy
 * - 1,634+ Cities/Municipalities: Full PSGC city coverage
 * - 5-Level PSOC Hierarchy: Complete Philippine occupation classification
 *
 * Key Features:
 * - 100% PostgreSQL constraint compliance (NOT NULL, FOREIGN KEY, CHECK)
 * - Full DILG RBI specification alignment for Philippine LGU systems
 * - Complete PSGC geographic hierarchy (17 regions, 81 provinces)
 * - Comprehensive PSOC occupational classification system
 * - Multi-level authentication and authorization support
 * - Proper nullable field handling with exact database mapping
 *
 * @example Basic Database Record Usage
 * ```typescript
 * import { ResidentRecord, HouseholdRecord } from '@/types/database';
 *
 * const resident: ResidentRecord = {
 *   id: '550e8400-e29b-41d4-a716-446655440000',
 *   first_name: 'Juan',
 *   last_name: 'Dela Cruz',
 *   sex: 'male',
 *   birthdate: '1990-01-15',
 *   civil_status: 'married',
 *   citizenship: 'filipino',
 *   // ... other required fields
 * };
 * ```
 *
 * @example PSGC Geographic Hierarchy
 * ```typescript
 * import { PSGCRegion, PSGCProvince, PSGCCityMunicipality, PSGCBarangay } from '@/types/database';
 *
 * // National Capital Region example
 * const region: PSGCRegion = {
 *   code: '13',
 *   name: 'National Capital Region',
 *   is_active: true,
 *   created_at: '2025-01-01T00:00:00Z',
 *   updated_at: '2025-01-01T00:00:00Z'
 * };
 * ```
 *
 * @example Enum Usage with Database Compliance
 * ```typescript
 * import { SexEnum, CivilStatusEnum, EmploymentStatusEnum } from '@/types/database';
 *
 * // All enum values exactly match database schema
 * const sex: SexEnum = 'male'; // matches CREATE TYPE sex_enum
 * const status: CivilStatusEnum = 'married'; // matches CREATE TYPE civil_status_enum
 * const employment: EmploymentStatusEnum = 'employed'; // matches CREATE TYPE employment_status_enum
 * ```
 */

// Note: Authentication types moved to auth.ts

// =============================================================================
// PSGC GEOGRAPHIC REFERENCE TYPES
// =============================================================================

/**
 * PSGC Region record interface - exactly matching psgc_regions table
 * @description Philippine region data structure per PSGC (Philippine Standard Geographic Code).
 * Represents the highest level in the 4-tier Philippine geographic hierarchy.
 *
 * @example National Capital Region
 * ```typescript
 * const ncrRegion: PSGCRegion = {
 *   code: '13',
 *   name: 'National Capital Region',
 *   is_active: true,
 *   created_at: '2025-01-01T00:00:00Z',
 *   updated_at: '2025-01-01T00:00:00Z'
 * };
 * ```
 */
export interface PSGCRegion {
  code: string; // VARCHAR(10) PRIMARY KEY - 2-digit region code
  name: string; // VARCHAR(100) NOT NULL - Full region name
  is_active: boolean; // BOOLEAN DEFAULT true - Active status
  created_at: string; // TIMESTAMPTZ DEFAULT NOW() - Creation timestamp
  updated_at: string; // TIMESTAMPTZ DEFAULT NOW() - Update timestamp
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
// ENUM TYPE DEFINITIONS (Matching database schema exactly)
// =============================================================================

// Personal Information Enums
export type SexEnum = 'male' | 'female';
export type CivilStatusEnum =
  | 'single'
  | 'married'
  | 'divorced'
  | 'separated'
  | 'widowed'
  | 'others';
export type CitizenshipEnum = 'filipino' | 'dual_citizen' | 'foreigner';

// Education & Employment Enums
export type EducationLevelEnum =
  | 'elementary'
  | 'high_school'
  | 'college'
  | 'post_graduate'
  | 'vocational';
export type EmploymentStatusEnum =
  | 'employed'
  | 'unemployed'
  | 'underemployed'
  | 'self_employed'
  | 'student'
  | 'retired'
  | 'homemaker'
  | 'unable_to_work'
  | 'looking_for_work'
  | 'not_in_labor_force';

// Health & Identity Enums
export type BloodTypeEnum = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type ReligionEnum =
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
  | 'others';

export type EthnicityEnum =
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
  | 'others';

// Household Enums
export type HouseholdTypeEnum =
  | 'nuclear'
  | 'single_parent'
  | 'extended'
  | 'childless'
  | 'one_person'
  | 'non_family'
  | 'other';
export type TenureStatusEnum =
  | 'owned'
  | 'owned_with_mortgage'
  | 'rented'
  | 'occupied_for_free'
  | 'occupied_without_consent'
  | 'others';
export type HouseholdUnitEnum =
  | 'single_house'
  | 'duplex'
  | 'apartment'
  | 'townhouse'
  | 'condominium'
  | 'boarding_house'
  | 'institutional'
  | 'makeshift'
  | 'others';
export type FamilyPositionEnum =
  | 'father'
  | 'mother'
  | 'son'
  | 'daughter'
  | 'grandmother'
  | 'grandfather'
  | 'father_in_law'
  | 'mother_in_law'
  | 'brother_in_law'
  | 'sister_in_law'
  | 'spouse'
  | 'sibling'
  | 'guardian'
  | 'ward'
  | 'other';
export type IncomeClassEnum =
  | 'rich'
  | 'high_income'
  | 'upper_middle_income'
  | 'middle_class'
  | 'lower_middle_class'
  | 'low_income'
  | 'poor'
  | 'not_determined';

// =============================================================================
// NOTE: These enums match database/schema.sql exactly
// =============================================================================
// GEOGRAPHIC SUBDIVISION TYPES
// =============================================================================

export interface GeoSubdivision {
  id: string;
  name: string;
  type: 'Subdivision' | 'Zone' | 'Sitio' | 'Purok';
  barangay_code: string;
  city_municipality_code: string;
  province_code: string | null;
  region_code: string;
  description: string | null;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface GeoStreet {
  id: string;
  name: string;
  subdivision_id: string | null;
  barangay_code: string;
  city_municipality_code: string;
  province_code: string | null;
  region_code: string;
  description: string | null;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// PSOC OCCUPATION REFERENCE TYPES (5-Level Philippine Occupational Hierarchy)
// =============================================================================

/**
 * PSOC occupation classification system interfaces
 * @description Philippine Standard Occupational Classification (PSOC) provides a 5-level
 * hierarchical structure for categorizing occupations: Major → Sub-Major → Minor → Unit → Unit Sub-Groups
 *
 * Hierarchy Structure:
 * 1. Major Groups (1-digit codes): 10 broad occupational categories
 * 2. Sub-Major Groups (2-digit codes): ~40 detailed occupational groups
 * 3. Minor Groups (3-digit codes): ~130 specific occupational families
 * 4. Unit Groups (4-digit codes): ~400 distinct occupational units
 * 5. Unit Sub-Groups (5-digit codes): Detailed occupational specializations
 */

/**
 * PSOC Major Group interface - Level 1 of occupation hierarchy
 * @description Broad occupational categories (e.g., "Managers", "Professionals")
 */
export interface PsocMajorGroup {
  code: string;
  title: string;
  created_at: string;
}

export interface PsocSubMajorGroup {
  code: string;
  title: string;
  major_code: string;
  created_at: string;
}

export interface PsocMinorGroup {
  code: string;
  title: string;
  sub_major_code: string;
  created_at: string;
}

export interface PsocUnitGroup {
  code: string;
  title: string;
  minor_code: string;
  created_at: string;
}

export interface PsocUnitSubGroup {
  code: string;
  title: string;
  unit_code: string;
  created_at: string;
}

export interface PsocPositionTitle {
  id: string;
  title: string;
  unit_group_code: string;
  is_primary: boolean;
  description: string | null;
  created_at: string;
}

export interface PsocOccupationCrossReference {
  id: string;
  unit_group_code: string;
  related_unit_code: string;
  related_occupation_title: string;
  created_at: string;
}

// =============================================================================
// MISSING RELATIONSHIP TABLES
// =============================================================================

export interface HouseholdMember {
  id: string;
  household_code: string;
  resident_id: string;
  family_position:
    | 'father'
    | 'mother'
    | 'son'
    | 'daughter'
    | 'grandmother'
    | 'grandfather'
    | 'father_in_law'
    | 'mother_in_law'
    | 'brother_in_law'
    | 'sister_in_law'
    | 'spouse'
    | 'sibling'
    | 'guardian'
    | 'ward'
    | 'other';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResidentRelationship {
  id: string;
  resident_a_id: string;
  resident_b_id: string;
  relationship_type: 'Spouse' | 'Parent' | 'Child' | 'Sibling' | 'Guardian' | 'Ward' | 'Other';
  relationship_description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResidentMigrantInfo {
  id: string;
  resident_id: string;
  previous_barangay_code: string | null;
  previous_city_municipality_code: string | null;
  previous_province_code: string | null;
  previous_region_code: string | null;
  date_of_transfer: string | null; // DATE type
  reason_for_migration: string | null;
  is_intending_to_return: boolean | null;
  length_of_stay_previous_months: number | null;
  duration_of_stay_current_months: number | null;
  migration_type: string | null;
  is_whole_family_migrated: boolean | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// SYSTEM TABLES
// =============================================================================

export interface SystemDashboardSummary {
  id: string;
  barangay_code: string;
  calculation_date: string; // DATE type
  total_residents: number;
  total_households: number;
  average_household_size: number; // DECIMAL(3,2)
  male_count: number;
  female_count: number;
  age_0_14: number;
  age_15_64: number;
  age_65_plus: number;
  single_count: number;
  married_count: number;
  widowed_count: number;
  divorced_separated_count: number;
  employed_count: number;
  unemployed_count: number;
  student_count: number;
  retired_count: number;
  created_at: string;
  updated_at: string;
}

export interface SystemSchemaVersion {
  version: string; // PRIMARY KEY
  applied_at: string;
  description: string | null;
  migration_script: string | null;
  applied_by: string | null;
  execution_time_ms: number | null;
  checksum: string | null;
}

// =============================================================================
// AUTHENTICATION & USER MANAGEMENT TYPES
// =============================================================================

/**
 * Auth role record interface - EXACTLY matching auth_roles table
 */
export interface AuthRoleRecord {
  id: string; // UUID PRIMARY KEY
  name: string; // VARCHAR(50) UNIQUE NOT NULL
  description?: string | null; // TEXT
  permissions?: Record<string, unknown> | null; // JSONB DEFAULT '{}'
  created_at?: string | null; // TIMESTAMPTZ DEFAULT NOW()
  updated_at?: string | null; // TIMESTAMPTZ DEFAULT NOW()
}

/**
 * Auth user profile record interface - EXACTLY matching auth_user_profiles table
 */
export interface AuthUserProfileRecord {
  id: string; // UUID PRIMARY KEY REFERENCES auth.users(id)
  first_name: string; // VARCHAR(100) NOT NULL
  middle_name?: string | null; // VARCHAR(100)
  last_name: string; // VARCHAR(100) NOT NULL
  email: string; // VARCHAR(255) NOT NULL
  phone?: string | null; // VARCHAR(20)
  role_id: string; // UUID NOT NULL REFERENCES auth_roles(id)
  barangay_code?: string | null; // VARCHAR(10) REFERENCES psgc_barangays(code)
  city_municipality_code?: string | null; // VARCHAR(10)
  province_code?: string | null; // VARCHAR(10)
  region_code?: string | null; // VARCHAR(10)
  is_active?: boolean | null; // BOOLEAN DEFAULT true
  last_login?: string | null; // TIMESTAMPTZ
  email_verified?: boolean | null; // BOOLEAN DEFAULT false
  email_verified_at?: string | null; // TIMESTAMPTZ
  onboarding_completed?: boolean | null; // BOOLEAN DEFAULT false
  onboarding_completed_at?: string | null; // TIMESTAMPTZ
  welcome_email_sent?: boolean | null; // BOOLEAN DEFAULT false
  welcome_email_sent_at?: string | null; // TIMESTAMPTZ
  created_by?: string | null; // UUID REFERENCES auth_user_profiles(id)
  updated_by?: string | null; // UUID REFERENCES auth_user_profiles(id)
  created_at?: string | null; // TIMESTAMPTZ DEFAULT NOW()
  updated_at?: string | null; // TIMESTAMPTZ DEFAULT NOW()
}

/**
 * Auth barangay account record interface - EXACTLY matching auth_barangay_accounts table
 */
export interface AuthBarangayAccountRecord {
  id: string; // UUID PRIMARY KEY
  user_id: string; // UUID NOT NULL REFERENCES auth_user_profiles(id)
  barangay_code: string; // VARCHAR(10) NOT NULL REFERENCES psgc_barangays(code)
  is_primary?: boolean | null; // BOOLEAN DEFAULT false
  created_by?: string | null; // UUID REFERENCES auth_user_profiles(id)
  updated_by?: string | null; // UUID REFERENCES auth_user_profiles(id)
  created_at?: string | null; // TIMESTAMPTZ DEFAULT NOW()
  updated_at?: string | null; // TIMESTAMPTZ DEFAULT NOW()
  // UNIQUE constraint: (user_id, barangay_code)
}

// =============================================================================
// HOUSEHOLD TYPES
// =============================================================================

/**
 * Household record interface - exactly matching households table (27 fields)
 * @description Core household data structure for the RBI system. Represents a single
 * household unit with complete geographic addressing and demographic classifications.
 *
 * @example Basic Household Record
 * ```typescript
 * const household: HouseholdRecord = {
 *   code: 'BRG001-HH-2025-001',
 *   house_number: '123',
 *   street_id: '550e8400-e29b-41d4-a716-446655440000',
 *   barangay_code: '1374000001',
 *   city_municipality_code: '1374000000',
 *   region_code: '13',
 *   household_type: 'nuclear',
 *   tenure_status: 'owned',
 *   monthly_income: 25000,
 *   income_class: 'lower_middle_class',
 *   no_of_families: 1,
 *   no_of_household_members: 4,
 *   is_active: true
 * };
 * ```
 */
export interface HouseholdRecord {
  // Primary identification
  code: string;
  name?: string | null;
  address?: string | null;

  // Location details
  house_number: string;
  street_id: string; // UUID REFERENCES geo_streets(id)
  subdivision_id?: string | null; // UUID REFERENCES geo_subdivisions(id)
  barangay_code: string;
  city_municipality_code: string;
  province_code?: string | null;
  region_code: string;
  zip_code?: string | null;

  // Household metrics
  no_of_families?: number | null; // Default: 1
  no_of_household_members?: number | null; // Default: 0
  no_of_migrants?: number | null; // Default: 0

  // Household classifications
  household_type?: HouseholdTypeEnum | null;
  tenure_status?: TenureStatusEnum | null;
  tenure_others_specify?: string | null;
  household_unit?: HouseholdUnitEnum | null;

  // Economic information
  monthly_income?: number | null; // NUMERIC
  income_class?: IncomeClassEnum | null;

  // Head of household
  household_head_id?: string | null; // UUID REFERENCES residents(id)
  household_head_position?: FamilyPositionEnum | null;

  // System fields
  is_active?: boolean | null; // Default: true
  created_by?: string | null; // UUID REFERENCES auth_user_profiles(id)
  updated_by?: string | null; // UUID REFERENCES auth_user_profiles(id)
  created_at?: string | null; // TIMESTAMPTZ
  updated_at?: string | null; // TIMESTAMPTZ
}

// =============================================================================
// RESIDENT TYPES
// =============================================================================

/**
 * Resident record interface - exactly matching residents table (38 fields)
 * @description Core resident data structure for the RBI system. Represents a single
 * individual with complete personal, demographic, and household membership information.
 *
 * @example Basic Resident Record
 * ```typescript
 * const resident: ResidentRecord = {
 *   id: '550e8400-e29b-41d4-a716-446655440000',
 *   first_name: 'Maria',
 *   middle_name: 'Santos',
 *   last_name: 'Dela Cruz',
 *   sex: 'female',
 *   birthdate: '1985-03-15',
 *   civil_status: 'married',
 *   citizenship: 'filipino',
 *   education_attainment: 'college',
 *   is_graduate: true,
 *   employment_status: 'employed',
 *   occupation_code: '2411',
 *   household_code: 'BRG001-HH-2025-001',
 *   email: 'maria.delacruz@email.com',
 *   mobile_number: '+639123456789',
 *   is_active: true
 * };
 * ```
 */
export interface ResidentRecord {
  // Primary identification
  id: string; // UUID PRIMARY KEY
  philsys_card_number?: string | null; // VARCHAR(20)

  // Personal details
  first_name: string; // VARCHAR(100) NOT NULL
  middle_name?: string | null; // VARCHAR(100)
  last_name: string; // VARCHAR(100) NOT NULL
  extension_name?: string | null; // VARCHAR(20)
  birthdate: string; // DATE NOT NULL
  birth_place_code?: string | null; // VARCHAR(10)
  sex: SexEnum; // sex_enum NOT NULL

  // Civil status
  civil_status?: CivilStatusEnum | null; // civil_status_enum DEFAULT 'single'
  civil_status_others_specify?: string | null; // TEXT

  // Education and employment
  education_attainment?: EducationLevelEnum | null; // education_level_enum
  is_graduate?: boolean | null; // BOOLEAN DEFAULT false
  employment_status?: EmploymentStatusEnum | null; // employment_status_enum
  occupation_code?: string | null; // VARCHAR(10)

  // Contact information
  email?: string | null; // VARCHAR(255)
  mobile_number?: string | null; // VARCHAR(20)
  telephone_number?: string | null; // VARCHAR(20)

  // Household membership
  household_code?: string | null; // VARCHAR(50) REFERENCES households(code)

  // Physical characteristics
  height?: number | null; // NUMERIC
  weight?: number | null; // NUMERIC
  complexion?: string | null; // VARCHAR(50)

  // Voting information
  is_voter?: boolean | null; // BOOLEAN
  is_resident_voter?: boolean | null; // BOOLEAN
  last_voted_date?: string | null; // DATE

  // Cultural/religious information
  religion_others_specify?: string | null; // TEXT
  mother_maiden_first?: string | null; // VARCHAR(100)
  mother_maiden_middle?: string | null; // VARCHAR(100)
  mother_maiden_last?: string | null; // VARCHAR(100)

  // System fields
  is_active?: boolean | null; // BOOLEAN DEFAULT true
  created_by?: string | null; // UUID REFERENCES auth_user_profiles(id)
  updated_by?: string | null; // UUID REFERENCES auth_user_profiles(id)
  created_at?: string | null; // TIMESTAMPTZ DEFAULT NOW()
  updated_at?: string | null; // TIMESTAMPTZ DEFAULT NOW()

  // Additional enums (at end of table definition)
  religion?: ReligionEnum | null; // religion_enum
  citizenship?: CitizenshipEnum | null; // citizenship_enum DEFAULT 'filipino'
  blood_type?: BloodTypeEnum | null; // blood_type_enum
  ethnicity?: EthnicityEnum | null; // ethnicity_enum
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
  city_municipality_code: string;
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
// SUPPLEMENTARY RESIDENT TABLES
// =============================================================================

/**
 * Resident sectoral info record interface - EXACTLY matching resident_sectoral_info table (13 fields)
 */
export interface ResidentSectoralInfoRecord {
  resident_id: string; // UUID PRIMARY KEY REFERENCES residents(id) ON DELETE CASCADE
  is_labor_force_employed?: boolean | null; // BOOLEAN
  is_unemployed?: boolean | null; // BOOLEAN
  is_overseas_filipino_worker?: boolean | null; // BOOLEAN
  is_person_with_disability?: boolean | null; // BOOLEAN
  is_out_of_school_children?: boolean | null; // BOOLEAN
  is_out_of_school_youth?: boolean | null; // BOOLEAN
  is_senior_citizen?: boolean | null; // BOOLEAN
  is_registered_senior_citizen?: boolean | null; // BOOLEAN
  is_solo_parent?: boolean | null; // BOOLEAN
  is_indigenous_people?: boolean | null; // BOOLEAN
  is_migrant?: boolean | null; // BOOLEAN
  created_at?: string | null; // TIMESTAMPTZ DEFAULT NOW()
  updated_at?: string | null; // TIMESTAMPTZ DEFAULT NOW()
}

/**
 * Resident migrant info record interface - EXACTLY matching resident_migrant_info table (14 fields)
 */
export interface ResidentMigrantInfoRecord {
  id: string; // UUID PRIMARY KEY DEFAULT uuid_generate_v4()
  resident_id: string; // UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE
  previous_barangay_code?: string | null; // VARCHAR(10) REFERENCES psgc_barangays(code)
  previous_city_municipality_code?: string | null; // VARCHAR(10)
  previous_province_code?: string | null; // VARCHAR(10)
  previous_region_code?: string | null; // VARCHAR(10)
  date_of_transfer?: string | null; // DATE
  reason_for_migration?: string | null; // TEXT
  is_intending_to_return?: boolean | null; // BOOLEAN
  length_of_stay_previous_months?: number | null; // INTEGER
  duration_of_stay_current_months?: number | null; // INTEGER
  migration_type?: string | null; // VARCHAR(50)
  is_whole_family_migrated?: boolean | null; // BOOLEAN
  created_at?: string | null; // TIMESTAMPTZ DEFAULT NOW()
  updated_at?: string | null; // TIMESTAMPTZ DEFAULT NOW()
  // UNIQUE constraint: resident_id
}

/**
 * Household member record interface - EXACTLY matching household_members table (7 fields)
 */
export interface HouseholdMemberRecord {
  id: string; // UUID PRIMARY KEY DEFAULT uuid_generate_v4()
  household_code: string; // VARCHAR(50) NOT NULL REFERENCES households(code) ON DELETE CASCADE
  resident_id: string; // UUID NOT NULL REFERENCES residents(id)
  family_position: FamilyPositionEnum; // family_position_enum NOT NULL DEFAULT 'other'
  is_active?: boolean | null; // BOOLEAN DEFAULT true
  created_at?: string | null; // TIMESTAMPTZ DEFAULT NOW()
  updated_at?: string | null; // TIMESTAMPTZ DEFAULT NOW()
  // UNIQUE constraint: (household_code, resident_id)
}

/**
 * Resident relationship record interface - EXACTLY matching resident_relationships table (8 fields)
 */
export interface ResidentRelationshipRecord {
  id: string; // UUID PRIMARY KEY DEFAULT uuid_generate_v4()
  resident_a_id: string; // UUID NOT NULL REFERENCES residents(id)
  resident_b_id: string; // UUID NOT NULL REFERENCES residents(id)
  relationship_type: 'Spouse' | 'Parent' | 'Child' | 'Sibling' | 'Guardian' | 'Ward' | 'Other'; // VARCHAR(50) CHECK constraint
  relationship_description?: string | null; // TEXT
  is_active?: boolean | null; // BOOLEAN DEFAULT true
  created_at?: string | null; // TIMESTAMPTZ DEFAULT NOW()
  updated_at?: string | null; // TIMESTAMPTZ DEFAULT NOW()
  // Constraints: no_self_relationship, unique_relationship
}

// =============================================================================
// =============================================================================
// DUPLICATE PSOC INTERFACES REMOVED
// Use the properly named PsocMajorGroup, PsocSubMajorGroup, etc. interfaces above
// =============================================================================
