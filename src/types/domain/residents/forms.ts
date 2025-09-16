/**
 * Resident Form Types
 * 
 * @fileoverview Form-specific interfaces for resident data entry and editing.
 * These types handle the mapping between form fields and database schema.
 */

import type { FormValidationError } from '@/types/shared/validation/validation';

/**
 * Personal Information section of resident form
 * Contains fields from PersonalInformation form section components
 */
export interface PersonalInfoFormState {
  // PhilSys Card Field
  philsys_card_number?: string | null;
  
  // Basic Information - matching database schema exactly
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  extension_name?: string | null;
  sex: string;
  civil_status: string;
  civil_status_others_specify?: string | null;
  
  // Birth Information
  birthdate: string;
  birth_place_code?: string | null;
  birth_place_name?: string | null; // UI display field - maps to PSGC data
  
  // Education Information
  education_attainment?: string | null;
  is_graduate?: boolean | null;
  
  // Employment Information
  employment_status?: string | null;
  occupation_code?: string | null;
  occupation_title?: string | null; // UI display field - maps to PSOC data
}

/**
 * Contact Information section of resident form
 * Contains fields from ContactInformation form section components
 */
export interface ContactInfoFormState {
  // Contact Details - matching database schema exactly
  mobile_number?: string | null;
  telephone_number?: string | null;
  email?: string | null;
  
  // Household Information
  household_code?: string | null;
  household_name?: string | null; // UI display field - maps to households.name
}

/**
 * Physical & Personal Details section of resident form
 * Contains fields from PhysicalPersonalDetails form section components
 */
export interface PhysicalPersonalDetailsFormState {
  // Physical Characteristics - matching database schema exactly  
  blood_type?: string | null;
  complexion?: string | null;
  height?: string | null;
  weight?: string | null;
  citizenship?: string | null;
  ethnicity?: string | null;
  ethnicity_others_specify?: string | null;
  religion?: string | null;
  religion_others_specify?: string | null;
  
  // Voting Information - form uses strings, converts to boolean for DB
  is_voter?: boolean | null;
  is_resident_voter?: boolean | null;
  last_voted_date?: string | null;
  
  // Mother's Maiden Name
  mother_maiden_first?: string | null;
  mother_maiden_middle?: string | null;
  mother_maiden_last?: string | null;
}

/**
 * Sectoral Information section (database field names)
 */
export interface SectoralInformation {
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
  is_indigenous_people: boolean; // Auto from ethnicity
  is_migrant: boolean; // Manual
}

/**
 * Context data for sectoral auto-calculations
 * Uses subset of existing form state fields - no need for separate interface
 * Fields come from: PersonalInfoFormState + PhysicalPersonalDetailsFormState
 */
export type SectoralContext = Pick<
  PersonalInfoFormState & PhysicalPersonalDetailsFormState,
  'birthdate' | 'employment_status' | 'education_attainment' | 'ethnicity'
>;


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
 * Complete resident form data - combines all form sections
 * Maps to actual form sections in the UI
 */
export interface ResidentFormData
  extends PersonalInfoFormState,
    ContactInfoFormState,
    PhysicalPersonalDetailsFormState,
    SectoralInformation,
    MigrationInfoFormState {
  // Additional fields for editing existing residents
  id?: string;
}

// Note: FormValidationError is defined in ../validation.ts

/**
 * Resident data for editing (includes IDs and metadata)
 */
export interface ResidentEditFormData extends ResidentFormData {
  id: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}


/**
 * Validation-specific resident data
 */
export interface ResidentValidationData extends Partial<ResidentFormData> {
  _validated?: boolean;
  _errors?: FormValidationError[];
}