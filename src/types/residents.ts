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

import { ResidentFormData } from './forms';
import type { AddressInfo } from './addresses';
import type { ResidentRecord } from './database';

// =============================================================================
// DATABASE ENUMS AND TYPES
// =============================================================================

// Import enums from database.ts
import type {
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
  // Migration Information - matching database exactly
  previous_barangay_code: string;
  previous_city_municipality_code: string;
  previous_province_code: string;
  previous_region_code: string;
  date_of_transfer: string;
  reason_for_migration: string;
  is_intending_to_return: boolean;
  length_of_stay_previous_months: number;
  duration_of_stay_current_months: number;
  migration_type: string;
  is_whole_family_migrated: boolean;
}

/**
 * Combined form state interface for the ResidentForm component
 */
export interface ResidentFormState extends 
  PersonalInfoFormState,
  ContactInfoFormState,
  SectoralInfoFormState,
  MigrationInfoFormState {
}

// =============================================================================
// RELATED DATA INTERFACES
// =============================================================================

// Note: Household-related interfaces moved to households.ts
// Note: PSGC and PSOC interfaces moved to database.ts as canonical source

import type {
  ServiceRawPsocData,
  ServiceRawPsgcData
} from './services';

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
