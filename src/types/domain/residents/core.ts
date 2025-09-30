/**
 * Core Resident Types
 * 
 * @fileoverview Core resident interfaces that extend the database record
 * with computed fields and display properties.
 */

import type { 
  ResidentRecord,
  ResidentSectoralInfoRecord,
  ResidentMigrantInfoRecord 
} from '../../infrastructure/database/database';

/**
 * Complete resident interface for detail views and comprehensive data management
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

  // Related data from other tables
  /** Household information if available */
  household?: {
    id: string;
    code: string;
    head_name?: string;
    members_count?: number;
  };
  /** Occupation information from PSOC data */
  occupation?: {
    code: string;
    title: string;
    category?: string;
  };
  /** Geographic location information */
  location?: {
    region_name?: string;
    province_name?: string;
    city_municipality_name?: string;
    barangay_name?: string;
  };
  
  // Demographic summary fields
  age_group?: string;
  demographic_category?: string;
  vulnerability_status?: string;
}

/**
 * Optimized resident data structure for listing and table views
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
  };
};

/**
 * Resident record with all relationships loaded
 */
export interface ResidentWithRelations extends ResidentRecord {
  sectoral_info?: ResidentSectoralInfo;
  migrant_info?: ResidentMigrantInfo;
  household?: {
    id: string;
    code: string;
    head_of_household_id: string;
    members?: ResidentRecord[];
  };
  
  // Computed properties used in the application
  address_info?: {
    barangay_name?: string;
    city_municipality_name?: string;
    province_name?: string;
    region_name?: string;
    full_address?: string;
    barangay_code?: string;
    city_municipality_code?: string;
    region_code?: string;
  };
  
  psoc_info?: {
    title?: string;
    level?: number;
  };
  
  // Employment computed fields
  is_employed?: boolean;
  is_unemployed?: boolean;
  is_senior_citizen?: boolean;
  
  // Personal computed fields  
  philsys_last4?: string;
  psoc_level?: number;
  occupation_title?: string;
  
  // Geographic fields (explicitly declared to ensure TypeScript visibility)
  barangay_code: string;
  city_municipality_code: string;  
  province_code: string | null;
  region_code: string;
}

/**
 * Display-optimized resident data
 */
export interface ResidentDisplayData extends ResidentListItem {
  display_name: string;
  display_address: string;
  display_age: number;
  display_occupation?: string;
}

/**
 * Demographic summary for statistics
 */
export interface ResidentDemographicSummary {
  total_count: number;
  by_sex: Record<string, number>;
  by_age_group: Record<string, number>;
  by_civil_status: Record<string, number>;
  by_employment_status: Record<string, number>;
  by_education_level: Record<string, number>;
}

// Note: ResidentSectoralInfo and ResidentMigrantInfo are already exported from database.ts
// These are just internal type references
type ResidentSectoralInfo = ResidentSectoralInfoRecord;
type ResidentMigrantInfo = ResidentMigrantInfoRecord;