/**
 * Centralized form options for resident forms
 * All dropdown and select options should be defined here for consistency
 */

export const CIVIL_STATUS_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'separated', label: 'Separated' },
  { value: 'annulled', label: 'Annulled' },
  { value: 'registered_partnership', label: 'Registered Partnership' },
  { value: 'live_in', label: 'Live-in' },
  { value: 'others', label: 'Others (specify)' },
];

export const CITIZENSHIP_OPTIONS = [
  { value: 'filipino', label: 'Filipino' },
  { value: 'dual_citizen', label: 'Dual Citizen' },
  { value: 'foreign_national', label: 'Foreign National' },
];

export const SEX_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

export const BLOOD_TYPE_OPTIONS = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
];

export const EDUCATION_ATTAINMENT_OPTIONS = [
  { value: 'no_formal_education', label: 'No Formal Education' },
  { value: 'elementary_undergraduate', label: 'Elementary Undergraduate' },
  { value: 'elementary_graduate', label: 'Elementary Graduate' },
  { value: 'high_school_undergraduate', label: 'High School Undergraduate' },
  { value: 'high_school_graduate', label: 'High School Graduate' },
  { value: 'post_secondary_undergraduate', label: 'Post Secondary Undergraduate' },
  { value: 'post_secondary_graduate', label: 'Post Secondary Graduate' },
  { value: 'college_undergraduate', label: 'College Undergraduate' },
  { value: 'college_graduate', label: 'College Graduate' },
  { value: 'post_baccalaureate', label: 'Post Baccalaureate' },
];

export const EMPLOYMENT_STATUS_OPTIONS = [
  { value: 'employed', label: 'Employed' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'self_employed', label: 'Self-Employed' },
  { value: 'student', label: 'Student' },
  { value: 'retired', label: 'Retired' },
  { value: 'homemaker', label: 'Homemaker' },
  { value: 'unable_to_work', label: 'Unable to Work' },
  { value: 'not_applicable', label: 'Not Applicable' },
];

// Helper functions to add empty/default options
export const withEmptyOption = (
  options: { value: string; label: string }[],
  placeholder = 'Select...'
): { value: string; label: string }[] => [{ value: '', label: placeholder }, ...options];

// Type helpers for form option values
export type CivilStatusValue = (typeof CIVIL_STATUS_OPTIONS)[number]['value'];
export type CitizenshipValue = (typeof CITIZENSHIP_OPTIONS)[number]['value'];
export type SexValue = (typeof SEX_OPTIONS)[number]['value'];
export type BloodTypeValue = (typeof BLOOD_TYPE_OPTIONS)[number]['value'];
export type EducationAttainmentValue = (typeof EDUCATION_ATTAINMENT_OPTIONS)[number]['value'];
export type EmploymentStatusValue = (typeof EMPLOYMENT_STATUS_OPTIONS)[number]['value'];
