/**
 * TypeScript types for Resident Form that align 100% with Supabase schema
 * Generated from database/schema.sql
 */

// Database enum types
export type SexEnum = 'male' | 'female';

export type CivilStatusEnum =
  | 'single'
  | 'married'
  | 'divorced'
  | 'separated'
  | 'widowed'
  | 'others';

export type CitizenshipEnum = 'filipino' | 'dual_citizen' | 'foreigner';

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

export type BirthPlaceLevelEnum = 'region' | 'province' | 'city_municipality' | 'barangay';

/**
 * Main residents table interface matching database schema exactly
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
 * Sectoral information interface matching resident_sectoral_info table
 */
export interface ResidentSectoralInfo {
  id?: string;
  resident_id?: string;
  is_labor_force_employed?: boolean;
  is_unemployed?: boolean;
  is_overseas_filipino_worker?: boolean;
  is_person_with_disability?: boolean;
  is_out_of_school_children?: boolean;
  is_out_of_school_youth?: boolean;
  is_senior_citizen?: boolean;
  is_registered_senior_citizen?: boolean;
  is_solo_parent?: boolean;
  is_indigenous_people?: boolean;
  is_migrant?: boolean;
  created_by?: string;
  created_at?: string;
  updated_by?: string;
  updated_at?: string;
}

/**
 * Migration information interface matching resident_migrant_info table
 */
export interface ResidentMigrantInfo {
  id?: string;
  resident_id?: string;
  previous_barangay_code?: string;
  previous_city_municipality_code?: string;
  previous_province_code?: string;
  previous_region_code?: string;
  length_of_stay_previous_months?: number;
  reason_for_leaving?: string;
  date_of_transfer?: string; // DATE format
  reason_for_transferring?: string;
  duration_of_stay_current_months?: number;
  is_intending_to_return?: boolean;
  migration_type?: string;
  is_whole_family_migrated?: boolean;
  created_by?: string;
  created_at?: string;
  updated_by?: string;
  updated_at?: string;
}

/**
 * Combined form data interface for the ResidentForm component
 * This matches the database schema exactly and can be used for form submission
 */
export interface ResidentFormData extends ResidentDatabaseRecord {
  // Sectoral information (flattened for form usage)
  sectoral_info?: ResidentSectoralInfo;

  // Migration information (flattened for form usage)
  migrant_info?: ResidentMigrantInfo;
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

  // Address Information (PSGC Codes)
  region_code: string;
  province_code: string;
  city_municipality_code: string;
  barangay_code: string;

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
  length_of_stay_previous_months: number;
  reason_for_leaving: string;
  date_of_transfer: string;
  reason_for_transferring: string;
  duration_of_stay_current_months: number;
  is_intending_to_return: boolean;
}

/**
 * Enum option interfaces for dropdowns
 */
export interface EnumOption {
  value: string;
  label: string;
}

export const SEX_OPTIONS: EnumOption[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

export const CIVIL_STATUS_OPTIONS: EnumOption[] = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'separated', label: 'Separated' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'others', label: 'Others' },
];

export const CITIZENSHIP_OPTIONS: EnumOption[] = [
  { value: 'filipino', label: 'Filipino' },
  { value: 'dual_citizen', label: 'Dual Citizen' },
  { value: 'foreigner', label: 'Foreigner' },
];

export const EDUCATION_LEVEL_OPTIONS: EnumOption[] = [
  { value: 'elementary', label: 'Elementary' },
  { value: 'high_school', label: 'High School' },
  { value: 'college', label: 'College' },
  { value: 'post_graduate', label: 'Post Graduate' },
  { value: 'vocational', label: 'Vocational' },
];

export const EMPLOYMENT_STATUS_OPTIONS: EnumOption[] = [
  { value: 'employed', label: 'Employed' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'underemployed', label: 'Underemployed' },
  { value: 'self_employed', label: 'Self Employed' },
  { value: 'student', label: 'Student' },
  { value: 'retired', label: 'Retired' },
  { value: 'homemaker', label: 'Homemaker' },
  { value: 'unable_to_work', label: 'Unable to Work' },
  { value: 'looking_for_work', label: 'Looking for Work' },
  { value: 'not_in_labor_force', label: 'Not in Labor Force' },
];

export const BLOOD_TYPE_OPTIONS: EnumOption[] = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
];

// Export common religion options (subset for UI)
export const RELIGION_OPTIONS: EnumOption[] = [
  { value: 'roman_catholic', label: 'Roman Catholic' },
  { value: 'islam', label: 'Islam' },
  { value: 'iglesia_ni_cristo', label: 'Iglesia ni Cristo' },
  { value: 'christian', label: 'Christian' },
  { value: 'aglipayan_church', label: 'Aglipayan Church' },
  { value: 'seventh_day_adventist', label: 'Seventh Day Adventist' },
  { value: 'bible_baptist_church', label: 'Bible Baptist Church' },
  { value: 'jehovahs_witnesses', label: "Jehovah's Witnesses" },
  {
    value: 'church_of_jesus_christ_latter_day_saints',
    label: 'Church of Jesus Christ of Latter-day Saints',
  },
  { value: 'united_church_of_christ_philippines', label: 'United Church of Christ Philippines' },
  { value: 'others', label: 'Others (specify)' },
];

// Export common ethnicity options (subset for UI)
export const ETHNICITY_OPTIONS: EnumOption[] = [
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
  { value: 'tboli', label: "T'boli" },
  { value: 'teduray', label: 'Teduray' },
  { value: 'tumandok', label: 'Tumandok' },
  // Other groups
  { value: 'chinese', label: 'Chinese' },
  { value: 'others', label: 'Others' },
];

export const BIRTH_PLACE_LEVEL_OPTIONS: EnumOption[] = [
  { value: 'region', label: 'Region' },
  { value: 'province', label: 'Province' },
  { value: 'city_municipality', label: 'City/Municipality' },
  { value: 'barangay', label: 'Barangay' },
];

// Legacy aliases removed - use ResidentDatabaseRecord directly
