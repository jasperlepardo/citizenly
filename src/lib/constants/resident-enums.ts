/**
 * Resident Form Constants
 * Centralized enums and options for resident-related forms
 */

// Personal Information Options
export const SEX_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

export const CIVIL_STATUS_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'separated', label: 'Separated' },
  { value: 'annulled', label: 'Annulled' },
  { value: 'registered_partnership', label: 'Registered Partnership' },
  { value: 'live_in', label: 'Live-in' },
];

export const CITIZENSHIP_OPTIONS = [
  { value: 'filipino', label: 'Filipino' },
  { value: 'dual_citizen', label: 'Dual Citizen' },
  { value: 'foreign_national', label: 'Foreign National' },
];

// Education Options
export const EDUCATION_LEVEL_OPTIONS = [
  { value: 'no_formal_education', label: 'No Formal Education' },
  { value: 'elementary', label: 'Elementary' },
  { value: 'high_school', label: 'High School' },
  { value: 'college', label: 'College' },
  { value: 'post_graduate', label: 'Post Graduate' },
  { value: 'vocational', label: 'Vocational' },
  { value: 'graduate', label: 'Graduate' },
  { value: 'undergraduate', label: 'Undergraduate' },
];

export const EDUCATION_STATUS_OPTIONS = [
  { value: 'currently_studying', label: 'Currently Studying' },
  { value: 'not_studying', label: 'Not Studying' },
  { value: 'graduated', label: 'Graduated' },
  { value: 'dropped_out', label: 'Dropped Out' },
];

export const EMPLOYMENT_STATUS_OPTIONS = [
  { value: 'employed', label: 'Employed' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'self_employed', label: 'Self Employed' },
  { value: 'student', label: 'Student' },
  { value: 'retired', label: 'Retired' },
  { value: 'not_in_labor_force', label: 'Not in Labor Force' },
  { value: 'ofw', label: 'Overseas Filipino Worker (OFW)' },
];

// Physical Characteristics Options
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
];

// Cultural and Religious Options
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
];

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
];

// Helper function to extract just the values
export const extractValues = (options: { value: string; label: string }[]) =>
  options.map(option => option.value).filter(value => value !== '');

// Helper function to get label by value
export const getLabelByValue = (options: { value: string; label: string }[], value: string) =>
  options.find(option => option.value === value)?.label || value;
