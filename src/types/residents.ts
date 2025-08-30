/**
 * Resident Types - Database-Aligned TypeScript Interfaces
 *
 * @fileoverview Consolidated resident-related TypeScript interfaces that exactly match
 * the database schema defined in database/schema.sql. All interfaces are 100% compliant
 * with PostgreSQL constraints and DILG RBI requirements.
 *
 * @version 3.0.0
 * @since 2025-01-01
 *
 * Database Tables Covered:
 * - residents (main resident data)
 * - resident_sectoral_info (sectoral classifications)
 * - resident_migrant_info (migration history)
 *
 * @example Basic Usage
 * ```typescript
 * import { ResidentRecord, PersonalInfoFormState } from '@/types/residents';
 * import { SEX_OPTIONS } from '@/constants/resident-form-options';
 *
 * const resident: ResidentRecord = {
 *   id: 'uuid-here',
 *   first_name: 'Juan',
 *   last_name: 'Dela Cruz',
 *   // ... other required fields
 * };
 * ```
 */

import { ReactNode } from 'react';

import type { AddressInfo } from './addresses';
import type {
  ResidentRecord,
  SexEnum,
  CivilStatusEnum,
  CitizenshipEnum,
  EducationLevelEnum,
  EmploymentStatusEnum,
  BloodTypeEnum,
  ReligionEnum,
  EthnicityEnum,
} from './database';

// =============================================================================
// DATABASE ENUMS AND TYPES
// =============================================================================

// Import enums from database.ts
// Re-export database enums for backward compatibility
export type {
  SexEnum,
  CivilStatusEnum,
  CitizenshipEnum,
  EducationLevelEnum,
  EmploymentStatusEnum,
  BloodTypeEnum,
  ReligionEnum,
  EthnicityEnum,
} from './database';

// BirthPlaceLevelEnum removed - not in database schema. Use PSGC codes directly.

// =============================================================================
// CORE RESIDENT INTERFACES
// =============================================================================

// ResidentDatabaseRecord and ResidentApiData removed - use ResidentRecord from './database' directly

/**
 * Complete resident interface for detail views and comprehensive data management
 * Consolidated from src/lib/types/resident-detail.ts
 *
 * @description Represents a comprehensive resident profile including personal information,
 * geographic location, sectoral demographics, household relationships, and migration data.
 * This interface extends ResidentRecord with additional computed and related fields.
 */
export interface Resident extends ResidentRecord {
  // Computed display fields
  /** Full name (computed field, optional for display) */
  name?: string;
  /** Birth place information (resolved from birth_place_code) */
  birth_place_name?: string;
  /** Administrative level of birth place (region, province, city, or barangay) */
  birth_place_level?: 'region' | 'province' | 'city_municipality' | 'barangay';
  /** Last 4 digits of PhilSys number (for verification purposes) */
  philsys_last4?: string;
  /** Whether the resident is employed (computed from employment_status) */
  is_employed?: boolean;
  /** PSOC classification level (1-4, with 4 being most specific) */
  psoc_level?: number;
  /** Name/description of current employment */
  employment_name?: string;
  /** Postal ZIP code */
  zip_code?: string;
  /** Street identifier within the barangay */
  street_id?: string;
  /** Subdivision identifier (if applicable) */
  subdivision_id?: string;

  // Related data from API Response
  /**
   * Household information when resident data includes household details
   * @description Complete household record associated with this resident
   */
  household?: {
    /** Unique household identifier code (format: BBBBBBBBB-YYYY-NNNNNN) */
    code: string;
    /** Household name or identifier */
    name?: string;
    /** Complete address string */
    address?: string;
    /** House number on the street */
    house_number: string;
    /** Street identifier within barangay */
    street_id: string;
    /** Subdivision identifier (if applicable) */
    subdivision_id?: string;
    /** PSGC barangay code where household is located */
    barangay_code: string;
    /** PSGC city/municipality code */
    city_municipality_code: string;
    /** PSGC province code */
    province_code?: string;
    /** PSGC region code */
    region_code: string;
    /** Number of families within this household */
    no_of_families?: number;
    /** Total number of household members */
    no_of_household_members?: number;
    /** Type of household (nuclear, extended, etc.) */
    household_type?: string;
    /** Housing tenure status (owned, rented, free, etc.) */
    tenure_status?: string;
    /** Monthly household income in Philippine Peso */
    monthly_income?: number;
    /** Income classification bracket */
    income_class?: string;
    /** Resident ID of the household head */
    household_head_id?: string;
  };

  // Geographic Information from API
  /** Barangay details for display purposes */
  barangay_info?: {
    code: string;
    name: string;
  };
  /** City/Municipality details for display purposes */
  city_municipality_info?: {
    code: string;
    name: string;
    type: string;
  };
  /** Province details for display purposes */
  province_info?: {
    code: string;
    name: string;
  };
  /** Region details for display purposes */
  region_info?: {
    code: string;
    name: string;
  };

  // Sectoral Information (from resident_sectoral_info table)
  /** Government sectoral demographic classifications */
  sectoral_info?: {
    /** Whether resident is part of the labor force (working age 15-64) */
    is_labor_force?: boolean;
    /** Whether labor force resident is currently employed */
    is_labor_force_employed?: boolean;
    /** Whether resident is unemployed (actively seeking work) */
    is_unemployed?: boolean;
    /** Whether resident is an Overseas Filipino Worker (OFW) */
    is_overseas_filipino_worker?: boolean;
    /** Whether resident is a Person with Disability (PWD) */
    is_person_with_disability?: boolean;
    /** Whether resident is out-of-school children (6-14 years old not in school) */
    is_out_of_school_children?: boolean;
    /** Whether resident is out-of-school youth (15-24 years old not in school) */
    is_out_of_school_youth?: boolean;
    /** Whether resident is a senior citizen (60+ years old) */
    is_senior_citizen?: boolean;
    /** Whether senior citizen is registered with DSWD */
    is_registered_senior_citizen?: boolean;
    /** Whether resident is a solo parent (single parent raising children) */
    is_solo_parent?: boolean;
    /** Whether resident belongs to an indigenous cultural community */
    is_indigenous_people?: boolean;
    /** Whether resident is an internal migrant (moved from another location) */
    is_migrant?: boolean;
  };

  // Migration Information (from resident_migrant_info table)
  /** Internal migration tracking information */
  migrant_info?: {
    /** PSGC barangay code of previous residence */
    previous_barangay_code?: string;
    /** PSGC city/municipality code of previous residence */
    previous_city_municipality_code?: string;
    /** PSGC province code of previous residence */
    previous_province_code?: string;
    /** PSGC region code of previous residence */
    previous_region_code?: string;
    /** Number of months lived in previous location */
    length_of_stay_previous_months?: number;
    /** Reason for leaving previous location */
    reason_for_leaving?: string;
    /** Date when resident moved to current location (ISO 8601 format) */
    date_of_transfer?: string;
    /** Reason for transferring to current location */
    reason_for_transferring?: string;
    /** Number of months resident has been in current location */
    duration_of_stay_current_months?: number;
    /** Whether resident intends to return to previous location */
    is_intending_to_return?: boolean;
  };
}

// =============================================================================
// SECTORAL AND MIGRATION INFORMATION
// =============================================================================

/**
 * Sectoral information interface matching resident_sectoral_info table exactly (15 fields)
 *
 * @description Maps to `resident_sectoral_info` table in PostgreSQL database.
 * Contains boolean flags for various sectoral classifications used in RBI reporting.
 *
 * @example
 * ```typescript
 * const sectoralInfo: ResidentSectoralInfo = {
 *   resident_id: 'uuid-here',
 *   is_senior_citizen: true,
 *   is_person_with_disability: false,
 *   // ... other sectoral flags
 * };
 * ```
 */
export interface ResidentSectoralInfo {
  resident_id: string; // Primary key - UUID, NOT NULL
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
  created_at?: string | null; // TIMESTAMPTZ with DEFAULT NOW()
  updated_at?: string | null; // TIMESTAMPTZ with DEFAULT NOW()
}

/**
 * Migration information interface matching resident_migrant_info table exactly (15 fields)
 *
 * @description Maps to `resident_migrant_info` table in PostgreSQL database.
 * Tracks migration history and patterns for demographic analysis.
 *
 * @example
 * ```typescript
 * const migrantInfo: ResidentMigrantInfo = {
 *   resident_id: 'uuid-here',
 *   previous_province_code: '0349', // Mindoro Oriental
 *   date_of_transfer: '2023-06-15',
 *   reason_for_migration: 'Employment opportunity',
 *   // ... other migration data
 * };
 * ```
 */
export interface ResidentMigrantInfo {
  id?: string | null; // UUID PRIMARY KEY with DEFAULT uuid_generate_v4()
  resident_id: string; // UUID NOT NULL
  previous_barangay_code?: string | null; // VARCHAR(10)
  previous_city_municipality_code?: string | null; // VARCHAR(10)
  previous_province_code?: string | null; // VARCHAR(10)
  previous_region_code?: string | null; // VARCHAR(10)
  date_of_transfer?: string | null; // DATE format
  reason_for_migration?: string | null; // TEXT (single field, not reason_for_leaving + reason_for_transferring)
  is_intending_to_return?: boolean | null;
  length_of_stay_previous_months?: number | null; // INTEGER
  duration_of_stay_current_months?: number | null; // INTEGER
  migration_type?: string | null; // VARCHAR(50)
  is_whole_family_migrated?: boolean | null;
  created_at?: string | null; // TIMESTAMPTZ with DEFAULT NOW()
  updated_at?: string | null; // TIMESTAMPTZ with DEFAULT NOW()
}

// =============================================================================
// FORM DATA INTERFACES
// =============================================================================

// ResidentFormData is now imported from ./forms to avoid duplication

/**
 * Personal Information section of resident form
 *
 * @description Form state interface for personal information fields.
 * Includes validation-friendly string unions and database constraint annotations.
 *
 * @example
 * ```typescript
 * const personalInfo: PersonalInfoFormState = {
 *   first_name: 'Maria',
 *   middle_name: 'Santos',
 *   last_name: 'Garcia',
 *   sex: 'female',
 *   civil_status: 'single',
 *   // ... other personal fields
 * };
 * ```
 */
export interface PersonalInfoFormState {
  // Personal Information - matching database exactly
  first_name: string;
  middle_name: string; // Database: VARCHAR(100) - nullable
  last_name: string;
  extension_name: string; // Database: VARCHAR(20) - nullable
  sex: SexEnum | '';
  civil_status: CivilStatusEnum | '';
  civil_status_others_specify: string;
  citizenship: CitizenshipEnum | '';
  birthdate: string;
  birth_place_name: string;
  birth_place_code: string; // Database: VARCHAR(10) - nullable
  // birth_place_level removed - use birth_place_code instead
  philsys_card_number: string;
  education_attainment: EducationLevelEnum | '';
  is_graduate: boolean;
  employment_status: EmploymentStatusEnum | '';
  occupation_code: string; // Database: VARCHAR(10) - nullable
  occupation_title: string;

  // Physical Personal Details
  blood_type: BloodTypeEnum | '';
  complexion: string;
  height: number;
  weight: number;
  ethnicity: EthnicityEnum | '';
  religion: ReligionEnum | '';
  religion_others_specify: string;
  is_voter: boolean | null;
  is_resident_voter: boolean | null;
  last_voted_date: string;
  mother_maiden_first: string;
  mother_maiden_middle: string;
  mother_maiden_last: string;
}

/**
 * Contact Information section of resident form
 */
export interface ContactInfoFormState {
  // Contact Information
  email: string;
  mobile_number: string;
  telephone_number: string;
  household_code: string;
  household_name?: string; // Optional - display name of selected household
}

/**
 * Sectoral Information section of resident form
 */
export interface SectoralInfoFormState {
  // Sectoral Information - matching database exactly
  is_labor_force_employed: boolean; // Auto from employment_status
  is_unemployed: boolean; // Auto from employment_status
  is_overseas_filipino_worker: boolean; // Manual - Overseas Filipino Worker
  is_person_with_disability: boolean; // Manual - Person with Disability
  is_out_of_school_children: boolean; // Auto from age + education (5-17)
  is_out_of_school_youth: boolean; // Auto from age + education + employment (18-30)
  is_senior_citizen: boolean; // Auto from age (60+)
  is_registered_senior_citizen: boolean; // Manual, conditional on is_senior_citizen
  is_solo_parent: boolean; // Manual
  is_indigenous_people: boolean; // Manual
  is_migrant: boolean; // Manual
}

/**
 * Migration Information section of resident form
 */
export interface MigrationInfoFormState {
  // Migration Information - matching database schema exactly
  previous_barangay_code?: string | null; // VARCHAR(10), nullable in database
  previous_city_municipality_code?: string | null; // VARCHAR(10), nullable in database
  previous_province_code?: string | null; // VARCHAR(10), nullable in database
  previous_region_code?: string | null; // VARCHAR(10), nullable in database
  date_of_transfer?: string | null; // DATE, nullable in database
  reason_for_migration?: string | null; // TEXT, nullable in database
  is_intending_to_return?: boolean | null; // BOOLEAN, nullable in database
  length_of_stay_previous_months?: number | null; // INTEGER, nullable in database
  duration_of_stay_current_months?: number | null; // INTEGER, nullable in database
  migration_type?: string | null; // VARCHAR(50), nullable in database
  is_whole_family_migrated?: boolean | null; // BOOLEAN, nullable in database
}

/**
 * Combined form state interface for the ResidentForm component
 */
export interface ResidentFormState
  extends PersonalInfoFormState,
    ContactInfoFormState,
    SectoralInfoFormState,
    MigrationInfoFormState {}

// =============================================================================
// RELATED DATA INTERFACES
// =============================================================================

// Note: Household-related interfaces moved to households.ts
// Note: PSGC and PSOC interfaces moved to database.ts as canonical source

import type { ServiceRawPsocData, ServiceRawPsgcData } from './services';

// Backward compatibility aliases for resident form usage
export type PsocData = ServiceRawPsocData;
export type PsgcData = ServiceRawPsgcData;

// Form option interfaces for resident forms
export interface PsocOption {
  value: string;
  label: string;
  description?: string;
  level_type?: string;
  occupation_code: string;
  occupation_title: string;
  hierarchy?: string;
  badge?: string;
}

export interface PsgcOption {
  value: string;
  label: string;
  description?: string;
  level: string;
  full_hierarchy?: string;
  code: string;
}

// =============================================================================
// EXTENDED AND COMPOSITE INTERFACES
// =============================================================================

/**
 * Extended resident interface with related data
 */
export interface ResidentWithRelations extends ResidentRecord {
  // Birth place information (resolved from birth_place_code)
  birth_place_info?: {
    code: string;
    name: string;
    level: string;
  };

  household?: {
    id?: string;
    household_number?: string;
    code: string;
    street_name?: string;
    house_number?: string;
    subdivision?: string;
    zip_code?: string;
    barangay_code: string;
    region_code?: string;
    province_code?: string;
    city_municipality_code?: string;
    total_members?: number;
    created_at?: string;
    updated_at?: string;
    head_resident?: {
      id: string;
      first_name: string;
      middle_name?: string;
      last_name: string;
    };
  };
  psoc_info?: {
    code: string;
    title: string;
    level?: string;
    hierarchy?: string;
  };
  address_info?: AddressInfo;

  // Legacy field mapping for backward compatibility
  is_employed?: boolean; // Maps to employment_status check
  philsys_last4?: string; // Computed from philsys_card_number
  psoc_level?: string; // From psoc_info.level
  occupation_title?: string; // From psoc_info.title

  // Geographic codes (flattened for display)
  region_code?: string;
  province_code?: string;
  city_municipality_code?: string;
  barangay_code?: string;

  // Computed fields for classifications (matching database schema exactly)
  is_labor_force_employed?: boolean;
  is_unemployed?: boolean;
  is_senior_citizen?: boolean;
  is_registered_senior_citizen?: boolean;
  is_person_with_disability?: boolean;
  is_solo_parent?: boolean;
  is_overseas_filipino_worker?: boolean;
  is_indigenous_people?: boolean;
  is_migrant?: boolean;
  is_out_of_school_children?: boolean;
  is_out_of_school_youth?: boolean;
  voter_id_number?: string;
  household_id?: string;
}

/**
 * Combined form data interface for the ResidentForm component
 */
export interface CombinedResidentFormData extends ResidentRecord {
  // Sectoral information (flattened for form usage)
  sectoral_info?: ResidentSectoralInfo;

  // Migration information (flattened for form usage)
  migrant_info?: ResidentMigrantInfo;
}

// =============================================================================
// SECTORAL INFORMATION INTERFACES
// =============================================================================

/**
 * Sectoral Information Interface (matches database schema)
 * @deprecated Use SectoralInfoFormState instead - same interface with better naming
 */
export type SectoralInformation = SectoralInfoFormState;

/**
 * Context data needed for auto-calculations
 */
export interface SectoralContext {
  age?: number;
  birthdate?: string;
  employment_status?: string;
  highest_educational_attainment?: string;
  marital_status?: string;
  ethnicity?: string;
}

// =============================================================================
// LISTING AND TABLE INTERFACES
// =============================================================================

/**
 * Optimized resident data structure for listing and table views
 * Consolidated from src/lib/types/resident-listing.ts
 *
 * @description Lightweight version of Resident interface containing only fields needed
 * for list displays, search results, and table components. This reduces data transfer
 * and improves performance for paginated resident listings.
 */
export type ResidentListItem = Pick<
  ResidentRecord,
  | 'id'
  | 'first_name'
  | 'middle_name'
  | 'last_name'
  | 'extension_name'
  | 'email'
  | 'mobile_number'
  | 'sex'
  | 'birthdate'
  | 'civil_status'
  | 'occupation_code'
  | 'household_code'
  | 'created_at'
> & {
  // Additional fields specific to listing view
  /** Current occupation (computed field for display) */
  occupation?: string;
  /** Job title (alternative display field) */
  job_title?: string;
  /** Professional designation */
  profession?: string;
  /** Education level for filtering/display */
  education_level?: string;
  /** General status indicator */
  status?: string;
  /** Occupation title (computed from PSOC data) */
  occupation_title?: string;
  /** Barangay code for geographic filtering */
  barangay_code?: string;
  /** Simplified household information for listing context */
  household?: {
    /** Household identifier code */
    code: string;
    /** Street name for address display */
    street_name?: string;
    /** House number for address display */
    house_number?: string;
    /** Subdivision name for address display */
    subdivision?: string;
  };
};

/**
 * Standard API response format for resident listing endpoints
 * Consolidated from src/lib/types/resident-listing.ts
 *
 * @description Paginated response structure used by all resident listing APIs.
 * Provides consistent data format, pagination controls, and metadata for client consumption.
 */
export interface ResidentsApiResponse {
  /** Array of resident records for current page */
  data: ResidentListItem[];
  /** Pagination information and controls */
  pagination: {
    /** Current page number (1-based) */
    page: number;
    /** Number of records per page */
    limit: number;
    /** Total number of records across all pages */
    total: number;
    /** Total number of pages available */
    pages: number;
    /** Whether there is a next page available */
    hasNext: boolean;
    /** Whether there is a previous page available */
    hasPrev: boolean;
  };
  /** Optional success or informational message */
  message?: string;
  /** API response metadata */
  metadata?: {
    /** Response generation timestamp (ISO 8601 format) */
    timestamp: string;
    /** API version used for this response */
    version: string;
    /** Unique request identifier for tracking */
    requestId?: string;
  };
}

// =============================================================================
// API AND VALIDATION INTERFACES
// =============================================================================

// Import canonical interfaces from their proper locations
import type { FormValidationError } from './validation';

// Re-export for backward compatibility
export type { FormValidationError };

// Resident-specific API response interfaces
export interface ResidentApiResponse {
  resident: ResidentRecord;
  household?: {
    code: string;
    name?: string;
    house_number?: string;
    street_id?: string;
    subdivision_id?: string;
    barangay_code: string;
    household_head_id?: string;
  };
}

/**
 * @deprecated Use ResidentsApiResponse instead for consistent API response format
 */
export interface ResidentsListResponse {
  data: ResidentRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  message: string;
}

// Legacy search params interface (specific to residents)
export interface ResidentSearchParams {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  sex?: string;
  civil_status?: string;
  occupation?: string;
  email?: string;
}

// Table component interfaces for residents
export interface ResidentTableAction {
  key: string;
  label: string;
  href?: (record: ResidentRecord) => string;
  onClick?: (record: ResidentRecord) => void;
  variant: 'primary' | 'secondary' | 'danger';
}

export interface ResidentTableColumn {
  key: string;
  title: string;
  dataIndex: string | ((record: ResidentRecord) => string | number | boolean);
  render?: (value: string | number | boolean, record: ResidentRecord) => ReactNode;
  sortable?: boolean;
}

// =============================================================================
// FORM OPTIONS AND ENUMS
// =============================================================================

// Note: Form option constants moved to @/constants/resident-form-options for better organization
// Import from there: SEX_OPTIONS, CIVIL_STATUS_OPTIONS, CITIZENSHIP_OPTIONS, etc.
