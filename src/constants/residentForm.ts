/**
 * Resident Form Constants
 *
 * Centralized constants for form validation, field labels,
 * and default values following Philippine government standards.
 * 
 * NOTE: For enum options (SEX_OPTIONS, CIVIL_STATUS_OPTIONS, etc.),
 * import from @/constants/generatedEnums or @/constants/residentEnums
 * to ensure database alignment and avoid duplication.
 */

// Required fields for resident registration per barangay standards
export const REQUIRED_FIELDS = [
  'first_name',
  'last_name',
  'birthdate',
  'sex',
  'household_code',
] as const;

export type RequiredField = (typeof REQUIRED_FIELDS)[number];

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
  last_voted_date: 'Last Voted Date',
};

// Default values following Philippine standards
export const DEFAULT_VALUES = {
  CIVIL_STATUS: 'single',
  CITIZENSHIP: 'filipino',
  EMPLOYMENT_STATUS: 'not_in_labor_force',
  RELIGION: 'roman_catholic',
  SEX: '',
  EDUCATION_ATTAINMENT: null,
  IS_GRADUATE: false,
  IS_VOTER: null,
  IS_RESIDENT_VOTER: null,
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
  MAX_WEIGHT: 500, // kg
} as const;

// NOTE: Enum options are now imported from @/constants/generatedEnums or @/constants/residentEnums
// This eliminates duplication and ensures database alignment

// Field groups for form organization
export const FIELD_GROUPS = {
  PERSONAL_INFO: [
    'first_name',
    'middle_name',
    'last_name',
    'extension_name',
    'birthdate',
    'sex',
    'civil_status',
    'citizenship',
  ],
  CONTACT_INFO: ['email', 'mobile_number', 'telephone_number'],
  ADDRESS_INFO: ['region_code', 'province_code', 'city_municipality_code', 'barangay_code'],
  EDUCATION_EMPLOYMENT: [
    'education_attainment',
    'is_graduate',
    'occupation_code',
    'employment_status',
  ],
  FAMILY_INFO: ['mother_maiden_first', 'mother_maiden_middle', 'mother_maiden_last'],
  PHYSICAL_INFO: ['height', 'weight', 'complexion', 'blood_type'],
  VOTING_INFO: ['is_voter', 'is_resident_voter', 'last_voted_date'],
  HOUSEHOLD_INFO: ['household_code'],
  IDENTIFICATION: ['philsys_card_number'],
  CULTURAL_INFO: ['religion', 'ethnicity'],
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
  'mother_maiden_last',
]);

// Fields that should not be logged per RA 10173
export const PII_FIELDS = new Set([
  'first_name',
  'middle_name',
  'last_name',
  'extension_name',
  'birthdate',
  'mobile_number',
  'telephone_number',
  'email',
  'philsys_card_number',
  'mother_maiden_first',
  'mother_maiden_middle',
  'mother_maiden_last',
]);

// Rate limiting configuration
export const RATE_LIMITS = {
  FORM_SUBMISSION: {
    MAX_ATTEMPTS: 5,
    WINDOW_MS: 300000, // 5 minutes
    BLOCK_DURATION_MS: 900000, // 15 minutes
  },
  VALIDATION_ATTEMPTS: {
    MAX_ATTEMPTS: 20,
    WINDOW_MS: 60000, // 1 minute
  },
} as const;
