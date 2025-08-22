/**
 * Comprehensive TypeScript interfaces for Resident module
 * Replaces all 'any' types with proper type safety
 */

// Base resident data structure matching database schema
export interface ResidentDatabaseRecord {
  id: string;
  philsys_card_number?: string;
  philsys_last4?: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  extension_name?: string;
  birthdate: string;
  birth_place_code?: string;
  birth_place_name?: string;
  sex: 'male' | 'female';
  civil_status: 'single' | 'married' | 'divorced' | 'separated' | 'widowed' | 'others';
  civil_status_others_specify?: string;
  education_attainment?: 'elementary' | 'high_school' | 'college' | 'post_graduate' | 'vocational';
  is_graduate: boolean;
  employment_status?: 'employed' | 'unemployed' | 'underemployed' | 'self_employed' | 'student' | 'retired' | 'homemaker' | 'unable_to_work' | 'looking_for_work' | 'not_in_labor_force';
  occupation_code?: string;
  email?: string;
  mobile_number?: string;
  telephone_number?: string;
  household_code?: string;
  blood_type?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown';
  height?: number;
  weight?: number;
  complexion?: string;
  citizenship?: 'filipino' | 'dual_citizen' | 'foreign_national';
  is_voter?: boolean;
  is_resident_voter?: boolean;
  last_voted_date?: string;
  ethnicity?: string;
  religion?: string;
  religion_others_specify?: string;
  mother_maiden_first?: string;
  mother_maiden_middle?: string;
  mother_maiden_last?: string;
  is_active: boolean;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at?: string;
}

// Form data structure (camelCase for React forms)
export interface ResidentFormData {
  // Personal Information
  firstName: string;
  middleName: string;
  lastName: string;
  extensionName: string;
  sex: string;
  civilStatus: string;
  citizenship: string;
  birthdate: string;
  birthPlaceName: string;
  birthPlaceCode: string;
  philsysCardNumber: string;
  educationAttainment: string;
  isGraduate: boolean;
  employmentStatus: string;
  psocCode: string;
  occupationTitle: string;
  ethnicity: string;

  // Contact Information
  email: string;
  phoneNumber: string;
  mobileNumber: string;
  householdCode: string;
  
  // Physical Characteristics
  bloodType: string;
  complexion: string;
  height: string;
  weight: string;
  religion: string;
  religionOthersSpecify: string;
  
  // Voting Information
  isVoter?: boolean;
  isResidentVoter?: boolean;
  lastVotedDate: string;
  
  // Mother's Maiden Name
  motherMaidenFirstName: string;
  motherMaidenMiddleName: string;
  motherMaidenLastName: string;
  
  // Sectoral Information
  isLaborForceEmployed?: boolean;
  isUnemployed?: boolean;
  isOverseasFilipino?: boolean;
  isPersonWithDisability?: boolean;
  isOutOfSchoolChildren?: boolean;
  isOutOfSchoolYouth?: boolean;
  isSeniorCitizen?: boolean;
  isRegisteredSeniorCitizen?: boolean;
  isSoloParent?: boolean;
  isIndigenousPeople?: boolean;
  isMigrant?: boolean;
  
  // Migration Information
  previousBarangayCode?: string;
  previousCityMunicipalityCode?: string;
  previousProvinceCode?: string;
  previousRegionCode?: string;
  lengthOfStayPreviousMonths?: number;
  reasonForLeaving?: string;
  dateOfTransfer?: string;
  reasonForTransferring?: string;
  durationOfStayCurrentMonths?: number;
  isIntendingToReturn?: boolean;
}

// API request/response format (snake_case matching database schema)
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

// Household-related interfaces
export interface HouseholdHead {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
}

export interface HouseholdData {
  code: string;
  name?: string;
  house_number?: string;
  street_id?: string;
  subdivision_id?: string;
  barangay_code: string;
  household_head_id?: string;
  geo_streets?: Array<{
    id: string;
    name: string;
  }>;
  geo_subdivisions?: Array<{
    id: string;
    name: string;
    type: string;
  }>;
}

export interface HouseholdOption {
  value: string;
  label: string;
  description: string;
  code: string;
  head_name: string;
  address: string;
}

// PSOC (occupation) interfaces
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

// PSGC (geographic) interfaces
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

// Address information interface
export interface AddressInfo {
  barangay_name: string;
  city_municipality_name?: string;
  province_name?: string;
  region_name?: string;
  full_address: string;
}

// Extended resident interface with related data
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
    head_resident?: HouseholdHead;
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

// Form validation error interface
export interface FormValidationError {
  field: string;
  message: string;
}

// Form mode type
export type FormMode = 'create' | 'view' | 'edit';

// API response interfaces
export interface ResidentApiResponse {
  resident: ResidentDatabaseRecord;
  household?: HouseholdData;
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

// Search and filter interfaces
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
  render?: (value: any, record: ResidentDatabaseRecord) => React.ReactNode;
  sortable?: boolean;
}

// Sectoral Information Interface (matches database schema)
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

// Context data needed for auto-calculations
export interface SectoralContext {
  age?: number;
  birthdate?: string;
  employment_status?: string;
  highest_educational_attainment?: string;
  marital_status?: string;
  ethnicity?: string;
}