/**
 * Resident Types
 * Consolidated resident-related TypeScript interfaces from multiple sources
 * Combines resident-detail.ts, resident-listing.ts, resident.ts, and resident-form.ts
 */

import { ReactNode } from 'react';

// =============================================================================
// DATABASE ENUMS AND TYPES
// =============================================================================

export type SexEnum = 'male' | 'female';
export type CivilStatusEnum = 'single' | 'married' | 'divorced' | 'separated' | 'widowed' | 'others';
export type CitizenshipEnum = 'filipino' | 'dual_citizen' | 'foreigner';
export type EducationLevelEnum = 'elementary' | 'high_school' | 'college' | 'post_graduate' | 'vocational';

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
  | 'tagalog' | 'cebuano' | 'ilocano' | 'bisaya' | 'hiligaynon' | 'bikolano' | 'waray' | 'kapampangan' | 'pangasinense'
  | 'maranao' | 'maguindanao' | 'tausug' | 'yakan' | 'samal' | 'badjao'
  | 'aeta' | 'agta' | 'ati' | 'batak' | 'bukidnon' | 'gaddang' | 'higaonon' | 'ibaloi' | 'ifugao' | 'igorot'
  | 'ilongot' | 'isneg' | 'ivatan' | 'kalinga' | 'kankanaey' | 'mangyan' | 'mansaka' | 'palawan' | 'subanen'
  | 'tboli' | 'teduray' | 'tumandok'
  | 'chinese' | 'others';

export type BirthPlaceLevelEnum = 'region' | 'province' | 'city_municipality' | 'barangay';

// =============================================================================
// CORE RESIDENT INTERFACES
// =============================================================================

/**
 * Database record interface matching database schema exactly
 */
export interface ResidentDatabaseRecord {
  id?: string;
  name?: string; // Combined full name
  philsys_card_number?: string;
  philsys_last4?: string; // Only last 4 digits
  first_name: string; // Required
  middle_name?: string;
  last_name: string; // Required
  extension_name?: string;
  birthdate: string; // Required, DATE format
  birth_place_code?: string;
  birth_place_level?: BirthPlaceLevelEnum;
  birth_place_name?: string;
  sex: SexEnum; // Required
  civil_status?: CivilStatusEnum;
  civil_status_others_specify?: string;
  education_attainment?: EducationLevelEnum;
  is_graduate?: boolean;
  employment_status?: EmploymentStatusEnum;
  employment_code?: string;
  employment_name?: string;
  occupation_code?: string;
  psoc_level?: number;
  occupation_title?: string;
  email?: string;
  mobile_number?: string;
  telephone_number?: string;
  household_code?: string;
  street_id?: string;
  subdivision_id?: string;
  barangay_code: string; // Required
  city_municipality_code: string; // Required
  province_code?: string;
  region_code: string; // Required
  zip_code?: string;
  blood_type?: BloodTypeEnum;
  height?: number; // DECIMAL(5,2)
  weight?: number; // DECIMAL(5,2)
  complexion?: string;
  citizenship?: CitizenshipEnum;
  is_voter?: boolean;
  is_resident_voter?: boolean;
  last_voted_date?: string; // DATE format
  ethnicity?: EthnicityEnum;
  religion?: ReligionEnum;
  religion_others_specify?: string;
  mother_maiden_first?: string;
  mother_maiden_middle?: string;
  mother_maiden_last?: string;
  is_active?: boolean;
  created_by?: string;
  updated_by?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * API request/response format (snake_case matching database schema)
 */
export interface ResidentApiData {
  // Required fields
  first_name: string;
  last_name: string;
  birthdate: string;
  sex: 'male' | 'female';

  // Optional personal info
  middle_name?: string;
  extension_name?: string;
  email?: string;
  mobile_number?: string;
  telephone_number?: string;
  civil_status?: string;
  civil_status_others_specify?: string;
  citizenship?: string;
  blood_type?: string;
  ethnicity?: string;
  religion?: string;
  religion_others_specify?: string;
  height?: number;
  weight?: number;
  complexion?: string;
  birth_place_code?: string;
  philsys_card_number?: string;
  mother_maiden_first?: string;
  mother_maiden_middle?: string;
  mother_maiden_last?: string;
  education_attainment?: string;
  is_graduate?: boolean;
  employment_status?: string;
  occupation_code?: string;
  is_voter?: boolean;
  is_resident_voter?: boolean;
  last_voted_date?: string;
  household_code?: string;
}

// =============================================================================
// SECTORAL AND MIGRATION INFORMATION
// =============================================================================

/**
 * Sectoral information interface matching resident_sectoral_info table exactly (15 fields)
 */
export interface ResidentSectoralInfo {
  resident_id: string; // Primary key - UUID, NOT NULL
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
  created_at?: string | null; // TIMESTAMPTZ with DEFAULT NOW()
  updated_at?: string | null; // TIMESTAMPTZ with DEFAULT NOW()
}

/**
 * Migration information interface matching resident_migrant_info table exactly (15 fields)
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

/**
 * Form data structure (camelCase for React forms)
 */
export interface ResidentFormData {
  // Personal Information (matching database fields exactly)
  firstName: string;
  middleName: string;
  lastName: string;
  extensionName: string;
  sex: string;
  civilStatus: string;
  civilStatusOthersSpecify?: string;
  citizenship: string;
  birthdate: string;
  birthPlaceCode: string; // Database only has birth_place_code, not birth_place_name or birth_place_level
  philsysCardNumber: string;
  educationAttainment: string; // This maps to education_attainment education_level_enum in DB
  isGraduate: boolean;
  employmentStatus: string;
  occupationCode?: string; // This maps to occupation_code in DB
  ethnicity: string;

  // Contact Information (matching database fields exactly)
  email: string;
  telephoneNumber: string; // Maps to telephone_number in DB
  mobileNumber: string; // Maps to mobile_number in DB  
  householdCode: string; // Maps to household_code in DB
  
  // Physical Characteristics
  bloodType: string;
  complexion: string;
  height: string;
  weight: string;
  religion: string;
  religionOthersSpecify: string;
  
  // Voting Information (matching database fields exactly)
  isVoter?: boolean | null;
  isResidentVoter?: boolean | null;
  lastVotedDate: string;
  
  // Mother's Maiden Name
  motherMaidenFirstName: string;
  motherMaidenMiddleName: string;
  motherMaidenLastName: string;
  
  // Note: Sectoral and Migration information are stored in separate tables:
  // - resident_sectoral_info
  // - resident_migrant_info
}

/**
 * Form-specific interface with all fields as optional for progressive form filling
 */
export interface ResidentFormState {
  // Personal Information - matching database exactly
  first_name: string;
  middle_name: string;
  last_name: string;
  extension_name: string;
  sex: SexEnum | '';
  civil_status: CivilStatusEnum | '';
  civil_status_others_specify: string;
  citizenship: CitizenshipEnum | '';
  birthdate: string;
  birth_place_name: string;
  birth_place_code: string;
  birth_place_level: BirthPlaceLevelEnum | '';
  philsys_card_number: string;
  philsys_last4: string;
  education_attainment: EducationLevelEnum | '';
  is_graduate: boolean;
  employment_status: EmploymentStatusEnum | '';
  employment_code: string;
  employment_name: string;
  occupation_code: string;
  psoc_level: number;
  occupation_title: string;

  // Contact Information
  email: string;
  mobile_number: string;
  telephone_number: string;
  household_code: string;

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

  // Sectoral Information - matching database exactly
  is_labor_force: boolean;
  is_labor_force_employed: boolean;
  is_unemployed: boolean;
  is_overseas_filipino_worker: boolean;
  is_person_with_disability: boolean;
  is_out_of_school_children: boolean;
  is_out_of_school_youth: boolean;
  is_senior_citizen: boolean;
  is_registered_senior_citizen: boolean;
  is_solo_parent: boolean;
  is_indigenous_people: boolean;
  is_migrant: boolean;

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

// =============================================================================
// RELATED DATA INTERFACES
// =============================================================================

// Note: Household-related interfaces moved to households.ts

export interface PsocData {
  code: string;
  title: string;
  hierarchy?: string;
  level?: string;
}

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

export interface PsgcData {
  code: string;
  name: string;
  full_address?: string;
  full_hierarchy?: string;
  level: 'region' | 'province' | 'city' | 'barangay';
}

export interface PsgcOption {
  value: string;
  label: string;
  description?: string;
  level: string;
  full_hierarchy?: string;
  code: string;
}

export interface AddressInfo {
  barangay_name: string;
  city_municipality_name?: string;
  province_name?: string;
  region_name?: string;
  full_address: string;
}

// =============================================================================
// EXTENDED AND COMPOSITE INTERFACES
// =============================================================================

/**
 * Extended resident interface with related data
 */
export interface ResidentWithRelations extends ResidentDatabaseRecord {
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
  
  // Computed fields for classifications
  is_labor_force?: boolean;
  is_employed?: boolean;
  is_unemployed?: boolean;
  is_senior_citizen?: boolean;
  is_registered_senior_citizen?: boolean;
  is_pwd?: boolean;
  is_solo_parent?: boolean;
  is_ofw?: boolean;
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
export interface CombinedResidentFormData extends ResidentDatabaseRecord {
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
 */
export interface SectoralInformation {
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

export interface FormValidationError {
  field: string;
  message: string;
}

// Note: FormMode moved to forms.ts

export interface ResidentApiResponse {
  resident: ResidentDatabaseRecord;
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
  data: ResidentDatabaseRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  message: string;
}

export interface ResidentSearchParams {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  sex?: string;
  civil_status?: string;
  occupation?: string;
  email?: string;
}

export interface ResidentTableAction {
  key: string;
  label: string;
  href?: (record: ResidentDatabaseRecord) => string;
  onClick?: (record: ResidentDatabaseRecord) => void;
  variant: 'primary' | 'secondary' | 'danger';
}

export interface ResidentTableColumn {
  key: string;
  title: string;
  dataIndex: string | ((record: ResidentDatabaseRecord) => any);
  render?: (value: any, record: ResidentDatabaseRecord) => ReactNode;
  sortable?: boolean;
}

// =============================================================================
// FORM OPTIONS AND ENUMS
// =============================================================================

// Note: EnumOption moved to forms.ts to avoid conflicts

export const SEX_OPTIONS: { value: string; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' }
];

type OptionType = { value: string; label: string };

export const CIVIL_STATUS_OPTIONS: OptionType[] = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'separated', label: 'Separated' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'others', label: 'Others' }
];

export const CITIZENSHIP_OPTIONS: OptionType[] = [
  { value: 'filipino', label: 'Filipino' },
  { value: 'dual_citizen', label: 'Dual Citizen' },
  { value: 'foreigner', label: 'Foreigner' }
];

export const EDUCATION_LEVEL_OPTIONS: OptionType[] = [
  { value: 'elementary', label: 'Elementary' },
  { value: 'high_school', label: 'High School' },
  { value: 'college', label: 'College' },
  { value: 'post_graduate', label: 'Post Graduate' },
  { value: 'vocational', label: 'Vocational' }
];

export const EMPLOYMENT_STATUS_OPTIONS: OptionType[] = [
  { value: 'employed', label: 'Employed' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'underemployed', label: 'Underemployed' },
  { value: 'self_employed', label: 'Self Employed' },
  { value: 'student', label: 'Student' },
  { value: 'retired', label: 'Retired' },
  { value: 'homemaker', label: 'Homemaker' },
  { value: 'unable_to_work', label: 'Unable to Work' },
  { value: 'looking_for_work', label: 'Looking for Work' },
  { value: 'not_in_labor_force', label: 'Not in Labor Force' }
];

export const BLOOD_TYPE_OPTIONS: OptionType[] = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' }
];

export const RELIGION_OPTIONS: OptionType[] = [
  { value: 'roman_catholic', label: 'Roman Catholic' },
  { value: 'islam', label: 'Islam' },
  { value: 'iglesia_ni_cristo', label: 'Iglesia ni Cristo' },
  { value: 'christian', label: 'Christian' },
  { value: 'aglipayan_church', label: 'Aglipayan Church' },
  { value: 'seventh_day_adventist', label: 'Seventh Day Adventist' },
  { value: 'bible_baptist_church', label: 'Bible Baptist Church' },
  { value: 'jehovahs_witnesses', label: 'Jehovah\'s Witnesses' },
  { value: 'church_of_jesus_christ_latter_day_saints', label: 'Church of Jesus Christ of Latter-day Saints' },
  { value: 'united_church_of_christ_philippines', label: 'United Church of Christ Philippines' },
  { value: 'others', label: 'Others (specify)' }
];

export const ETHNICITY_OPTIONS: OptionType[] = [
  // Major ethnic groups
  { value: 'tagalog', label: 'Tagalog' },
  { value: 'cebuano', label: 'Cebuano' },
  { value: 'ilocano', label: 'Ilocano' },
  { value: 'bisaya', label: 'Bisaya' },
  { value: 'hiligaynon', label: 'Hiligaynon' },
  { value: 'bikolano', label: 'Bikolano' },
  { value: 'waray', label: 'Waray' },
  { value: 'kapampangan', label: 'Kapampangan' },
  { value: 'pangasinense', label: 'Pangasinense' },
  // Muslim/Moro groups
  { value: 'maranao', label: 'Maranao' },
  { value: 'maguindanao', label: 'Maguindanao' },
  { value: 'tausug', label: 'Tausug' },
  { value: 'yakan', label: 'Yakan' },
  { value: 'samal', label: 'Samal' },
  { value: 'badjao', label: 'Badjao' },
  // Indigenous Peoples
  { value: 'aeta', label: 'Aeta' },
  { value: 'agta', label: 'Agta' },
  { value: 'ati', label: 'Ati' },
  { value: 'batak', label: 'Batak' },
  { value: 'bukidnon', label: 'Bukidnon' },
  { value: 'gaddang', label: 'Gaddang' },
  { value: 'higaonon', label: 'Higaonon' },
  { value: 'ibaloi', label: 'Ibaloi' },
  { value: 'ifugao', label: 'Ifugao' },
  { value: 'igorot', label: 'Igorot' },
  { value: 'ilongot', label: 'Ilongot' },
  { value: 'isneg', label: 'Isneg' },
  { value: 'ivatan', label: 'Ivatan' },
  { value: 'kalinga', label: 'Kalinga' },
  { value: 'kankanaey', label: 'Kankanaey' },
  { value: 'mangyan', label: 'Mangyan' },
  { value: 'mansaka', label: 'Mansaka' },
  { value: 'palawan', label: 'Palawan' },
  { value: 'subanen', label: 'Subanen' },
  { value: 'tboli', label: 'T\'boli' },
  { value: 'teduray', label: 'Teduray' },
  { value: 'tumandok', label: 'Tumandok' },
  // Other groups
  { value: 'chinese', label: 'Chinese' },
  { value: 'others', label: 'Others' }
];

export const BIRTH_PLACE_LEVEL_OPTIONS: OptionType[] = [
  { value: 'region', label: 'Region' },
  { value: 'province', label: 'Province' },
  { value: 'city_municipality', label: 'City/Municipality' },
  { value: 'barangay', label: 'Barangay' }
];

// Legacy aliases removed - use ResidentDatabaseRecord directly or proper service layer imports