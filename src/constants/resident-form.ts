/**
 * Resident Form Constants
 * 
 * Centralized constants for form validation, field labels,
 * and default values following Philippine government standards.
 */

// Required fields for resident registration per barangay standards
export const REQUIRED_FIELDS = [
  'first_name', 
  'last_name', 
  'birthdate', 
  'sex', 
  'household_code'
] as const;

export type RequiredField = typeof REQUIRED_FIELDS[number];

// Field labels for UI display and validation messages
export const FIELD_LABELS: Record<string, string> = {
  // Personal Information
  first_name: 'First Name',
  middle_name: 'Middle Name',
  last_name: 'Last Name',
  extension_name: 'Extension Name',
  birthdate: 'Birth Date',
  sex: 'Sex',
  civil_status: 'Civil Status',
  citizenship: 'Citizenship',
  
  // Education & Employment
  education_attainment: 'Educational Attainment',
  is_graduate: 'Graduate Status',
  occupation_code: 'Occupation',
  employment_status: 'Employment Status',
  
  // Contact Information
  email: 'Email Address',
  mobile_number: 'Mobile Number',
  telephone_number: 'Telephone Number',
  philsys_card_number: 'PhilSys Card Number',
  
  // Address Information
  region_code: 'Region',
  province_code: 'Province',
  city_municipality_code: 'City/Municipality',
  barangay_code: 'Barangay',
  
  // Household Information
  household_code: 'Household Assignment',
  
  // Family Information
  mother_maiden_first: "Mother's Maiden First Name",
  mother_maiden_middle: "Mother's Maiden Middle Name",
  mother_maiden_last: "Mother's Maiden Last Name",
  
  // Additional Fields
  religion: 'Religion',
  ethnicity: 'Ethnicity',
  blood_type: 'Blood Type',
  height: 'Height (cm)',
  weight: 'Weight (kg)',
  complexion: 'Complexion',
  
  // Voting Information
  is_voter: 'Registered Voter',
  is_resident_voter: 'Resident Voter',
  last_voted_date: 'Last Voted Date'
};

// Default values following Philippine standards
export const DEFAULT_VALUES = {
  CIVIL_STATUS: 'single',
  CITIZENSHIP: 'filipino',
  EMPLOYMENT_STATUS: 'not_in_labor_force',
  RELIGION: 'roman_catholic',
  SEX: '',
  EDUCATION_ATTAINMENT: '',
  IS_GRADUATE: false,
  IS_VOTER: null,
  IS_RESIDENT_VOTER: null
} as const;

// Validation rules
export const VALIDATION_RULES = {
  // Name validation
  NAME_MAX_LENGTH: 100,
  NAME_MIN_LENGTH: 1,
  NAME_PATTERN: /^[a-zA-ZÀ-ÿ\s\-'\.ñÑ]{1,100}$/,
  
  // Contact validation
  PHONE_PATTERN: /^(\+63|0)[89]\d{9}$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  EMAIL_MAX_LENGTH: 254,
  
  // PhilSys validation
  PHILSYS_PATTERN: /^\d{4}-\d{4}-\d{4}$/,
  PHILSYS_LENGTH: 12,
  
  // PSGC Code validation
  PSGC_PATTERN: /^\d{9,10}$/,
  
  // Age validation
  MIN_AGE: 0,
  MAX_AGE: 150,
  
  // Physical measurements
  MIN_HEIGHT: 50, // cm
  MAX_HEIGHT: 250, // cm
  MIN_WEIGHT: 1, // kg
  MAX_WEIGHT: 500 // kg
} as const;

// Philippine-specific enums
export const CIVIL_STATUS_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'separated', label: 'Separated' },
  { value: 'annulled', label: 'Annulled' },
  { value: 'others', label: 'Others' }
] as const;

export const CITIZENSHIP_OPTIONS = [
  { value: 'filipino', label: 'Filipino' },
  { value: 'dual_citizen', label: 'Dual Citizen' },
  { value: 'naturalized', label: 'Naturalized Filipino' },
  { value: 'foreign', label: 'Foreign National' }
] as const;

export const SEX_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' }
] as const;

export const EMPLOYMENT_STATUS_OPTIONS = [
  { value: 'employed', label: 'Employed' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'not_in_labor_force', label: 'Not in Labor Force' },
  { value: 'self_employed', label: 'Self-Employed' },
  { value: 'underemployed', label: 'Underemployed' }
] as const;

export const EDUCATION_LEVEL_OPTIONS = [
  { value: 'no_formal_education', label: 'No Formal Education' },
  { value: 'elementary_undergraduate', label: 'Elementary Undergraduate' },
  { value: 'elementary_graduate', label: 'Elementary Graduate' },
  { value: 'high_school_undergraduate', label: 'High School Undergraduate' },
  { value: 'high_school_graduate', label: 'High School Graduate' },
  { value: 'vocational', label: 'Vocational/Technical' },
  { value: 'college_undergraduate', label: 'College Undergraduate' },
  { value: 'college_graduate', label: 'College Graduate' },
  { value: 'post_graduate', label: 'Post Graduate' }
] as const;

export const RELIGION_OPTIONS = [
  { value: 'roman_catholic', label: 'Roman Catholic' },
  { value: 'islam', label: 'Islam' },
  { value: 'iglesia_ni_cristo', label: 'Iglesia ni Cristo' },
  { value: 'protestant', label: 'Protestant' },
  { value: 'buddhist', label: 'Buddhist' },
  { value: 'others', label: 'Others' }
] as const;

export const BLOOD_TYPE_OPTIONS = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
  { value: 'unknown', label: 'Unknown' }
] as const;

// Field groups for form organization
export const FIELD_GROUPS = {
  PERSONAL_INFO: [
    'first_name', 'middle_name', 'last_name', 'extension_name',
    'birthdate', 'sex', 'civil_status', 'citizenship'
  ],
  CONTACT_INFO: [
    'email', 'mobile_number', 'telephone_number'
  ],
  ADDRESS_INFO: [
    'region_code', 'province_code', 'city_municipality_code', 'barangay_code'
  ],
  EDUCATION_EMPLOYMENT: [
    'education_attainment', 'is_graduate', 'occupation_code', 'employment_status'
  ],
  FAMILY_INFO: [
    'mother_maiden_first', 'mother_maiden_middle', 'mother_maiden_last'
  ],
  PHYSICAL_INFO: [
    'height', 'weight', 'complexion', 'blood_type'
  ],
  VOTING_INFO: [
    'is_voter', 'is_resident_voter', 'last_voted_date'
  ],
  HOUSEHOLD_INFO: [
    'household_code'
  ],
  IDENTIFICATION: [
    'philsys_card_number'
  ],
  CULTURAL_INFO: [
    'religion', 'ethnicity'
  ]
} as const;

// Security-sensitive fields that require special handling
export const SENSITIVE_FIELDS = new Set([
  'philsys_card_number',
  'mobile_number',
  'telephone_number',
  'email',
  'birthdate',
  'mother_maiden_first',
  'mother_maiden_middle',
  'mother_maiden_last'
]);

// Fields that should not be logged per RA 10173
export const PII_FIELDS = new Set([
  'first_name', 'middle_name', 'last_name', 'extension_name',
  'birthdate', 'mobile_number', 'telephone_number', 'email',
  'philsys_card_number', 'mother_maiden_first', 'mother_maiden_middle',
  'mother_maiden_last'
]);

// Rate limiting configuration
export const RATE_LIMITS = {
  FORM_SUBMISSION: {
    MAX_ATTEMPTS: 5,
    WINDOW_MS: 300000, // 5 minutes
    BLOCK_DURATION_MS: 900000 // 15 minutes
  },
  VALIDATION_ATTEMPTS: {
    MAX_ATTEMPTS: 20,
    WINDOW_MS: 60000 // 1 minute
  }
} as const;