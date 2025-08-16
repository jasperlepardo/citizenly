/**
 * Generated Enums - Single Source of Truth
 * 
 * This file is auto-generated. Do not edit manually.
 * Generated at: 2025-08-14T09:48:14.341Z
 * 
 * To update enums, modify scripts/generate-enums.ts and run:
 * npm run generate:enums
 */

// Gender/sex options
export const SEX_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
] as const;

// Marital status options
export const CIVIL_STATUS_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'separated', label: 'Separated' },
  { value: 'annulled', label: 'Annulled' },
] as const;

// Employment status options - synced with API validation
export const EMPLOYMENT_STATUS_OPTIONS = [
  { value: 'employed', label: 'Employed' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'self_employed', label: 'Self Employed' },
  { value: 'student', label: 'Student' },
  { value: 'retired', label: 'Retired' },
  { value: 'not_in_labor_force', label: 'Not in Labor Force' },
  { value: 'ofw', label: 'Overseas Filipino Worker (OFW)' },
] as const;

// Blood type options
export const BLOOD_TYPE_OPTIONS = [
  { value: '', label: 'Select blood type' },
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
  { value: 'unknown', label: 'Unknown' },
] as const;

// Citizenship options
export const CITIZENSHIP_OPTIONS = [
  { value: 'filipino', label: 'Filipino' },
  { value: 'dual_citizen', label: 'Dual Citizen' },
  { value: 'foreign_national', label: 'Foreign National' },
] as const;

// Religious affiliation options
export const RELIGION_OPTIONS = [
  { value: 'roman_catholic', label: 'Roman Catholic' },
  { value: 'protestant', label: 'Protestant' },
  { value: 'iglesia_ni_cristo', label: 'Iglesia ni Cristo' },
  { value: 'islam', label: 'Islam' },
  { value: 'buddhism', label: 'Buddhism' },
  { value: 'judaism', label: 'Judaism' },
  { value: 'hinduism', label: 'Hinduism' },
  { value: 'indigenous_beliefs', label: 'Indigenous Beliefs' },
  { value: 'other', label: 'Other' },
  { value: 'none', label: 'None' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const;

// Ethnicity/tribal affiliation options
export const ETHNICITY_OPTIONS = [
  { value: 'tagalog', label: 'Tagalog' },
  { value: 'cebuano', label: 'Cebuano' },
  { value: 'ilocano', label: 'Ilocano' },
  { value: 'bisaya', label: 'Bisaya' },
  { value: 'hiligaynon', label: 'Hiligaynon' },
  { value: 'bicolano', label: 'Bicolano' },
  { value: 'waray', label: 'Waray' },
  { value: 'kapampangan', label: 'Kapampangan' },
  { value: 'pangasinan', label: 'Pangasinan' },
  { value: 'maranao', label: 'Maranao' },
  { value: 'maguindanao', label: 'Maguindanao' },
  { value: 'tausug', label: 'Tausug' },
  { value: 'indigenous_group', label: 'Indigenous Group' },
  { value: 'mixed_heritage', label: 'Mixed Heritage' },
  { value: 'other', label: 'Other' },
  { value: 'not_reported', label: 'Not Reported' },
] as const;

// Education attainment levels
export const EDUCATION_LEVEL_OPTIONS = [
  { value: 'no_schooling', label: 'No Schooling' },
  { value: 'elementary_undergraduate', label: 'Elementary Undergraduate' },
  { value: 'elementary_graduate', label: 'Elementary Graduate' },
  { value: 'high_school_undergraduate', label: 'High School Undergraduate' },
  { value: 'high_school_graduate', label: 'High School Graduate' },
  { value: 'college_undergraduate', label: 'College Undergraduate' },
  { value: 'college_graduate', label: 'College Graduate' },
  { value: 'post_graduate', label: 'Post Graduate' },
  { value: 'vocational', label: 'Vocational' },
] as const;

// Type helpers for strict typing
export type SexValue = (typeof SEX_OPTIONS)[number]['value'];
export type CivilStatusValue = (typeof CIVIL_STATUS_OPTIONS)[number]['value'];
export type EmploymentStatusValue = (typeof EMPLOYMENT_STATUS_OPTIONS)[number]['value'];
export type BloodTypeValue = (typeof BLOOD_TYPE_OPTIONS)[number]['value'];
export type CitizenshipValue = (typeof CITIZENSHIP_OPTIONS)[number]['value'];
export type ReligionValue = (typeof RELIGION_OPTIONS)[number]['value'];
export type EthnicityValue = (typeof ETHNICITY_OPTIONS)[number]['value'];
export type EducationLevelValue = (typeof EDUCATION_LEVEL_OPTIONS)[number]['value'];

// Helper function to extract just the values
export const extractValues = (options: { value: string; label: string }[]) =>
  options.map(option => option.value).filter(value => value !== '');

// Helper function to get label by value
export const getLabelByValue = (options: { value: string; label: string }[], value: string) =>
  options.find(option => option.value === value)?.label || value;

// Helper function to validate enum value
export const isValidEnumValue = <T extends readonly { value: string; label: string }[]>(
  options: T,
  value: string
): value is T[number]['value'] => {
  return options.some(option => option.value === value);
};
