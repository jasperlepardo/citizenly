/**
 * Resident Form Constants - 100% ALIGNED WITH SUPABASE DATABASE
 * These values MUST match exactly with database enum definitions
 */

// Import the database-aligned enums and options from generated enums (Supabase source of truth)
import {
  SEX_OPTIONS as DB_SEX_OPTIONS,
  CIVIL_STATUS_OPTIONS as DB_CIVIL_STATUS_OPTIONS,
  CITIZENSHIP_OPTIONS as DB_CITIZENSHIP_OPTIONS,
  EDUCATION_LEVEL_OPTIONS as DB_EDUCATION_LEVEL_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS as DB_EMPLOYMENT_STATUS_OPTIONS,
  BLOOD_TYPE_OPTIONS as DB_BLOOD_TYPE_OPTIONS,
  RELIGION_OPTIONS as DB_RELIGION_OPTIONS,
  ETHNICITY_OPTIONS as DB_ETHNICITY_OPTIONS,
} from '@/lib/constants/generated-enums';

// Re-export database-aligned options
export const SEX_OPTIONS = DB_SEX_OPTIONS;
export const CIVIL_STATUS_OPTIONS = DB_CIVIL_STATUS_OPTIONS;
export const CITIZENSHIP_OPTIONS = DB_CITIZENSHIP_OPTIONS;
export const EDUCATION_LEVEL_OPTIONS = DB_EDUCATION_LEVEL_OPTIONS;
export const EMPLOYMENT_STATUS_OPTIONS = DB_EMPLOYMENT_STATUS_OPTIONS;
export const BLOOD_TYPE_OPTIONS = DB_BLOOD_TYPE_OPTIONS;
export const RELIGION_OPTIONS = DB_RELIGION_OPTIONS;
export const ETHNICITY_OPTIONS = DB_ETHNICITY_OPTIONS;

// Additional helper options for specific form components
export const GRADUATE_STATUS_OPTIONS = [
  { value: true, label: 'Yes' },
  { value: false, label: 'No' },
];

// Legacy options for backward compatibility
export const EDUCATION_STATUS_OPTIONS = [
  { value: 'currently_studying', label: 'Currently Studying' },
  { value: 'not_studying', label: 'Not Studying' },
  { value: 'graduated', label: 'Graduated' },
  { value: 'dropped_out', label: 'Dropped Out' },
];

// Helper function to extract just the values (string values only)
export const extractValues = (options: readonly { value: string; label: string }[]) =>
  options.map(option => option.value).filter(value => value !== '' && value !== null && value !== undefined);

// Helper function to extract values including booleans
export const extractAllValues = (options: readonly { value: string | boolean; label: string }[]) =>
  options.map(option => option.value).filter(value => value !== '' && value !== null && value !== undefined);

// Helper function to get label by value
export const getLabelByValue = (options: readonly { value: string | boolean; label: string }[], value: string | boolean) =>
  options.find(option => option.value === value)?.label || String(value);

// Fields WITH database defaults - no empty option needed since form starts with default value
export const BLOOD_TYPE_OPTIONS_WITH_DEFAULT = BLOOD_TYPE_OPTIONS;
export const CIVIL_STATUS_OPTIONS_WITH_DEFAULT = CIVIL_STATUS_OPTIONS;
export const CITIZENSHIP_OPTIONS_WITH_DEFAULT = CITIZENSHIP_OPTIONS;

// Fields WITHOUT database defaults - need select options
export const RELIGION_OPTIONS_WITH_DEFAULT = [
  { value: '', label: 'Select religion' },
  ...RELIGION_OPTIONS,
];
export const ETHNICITY_OPTIONS_WITH_DEFAULT = [
  { value: '', label: 'Select ethnicity' },
  ...ETHNICITY_OPTIONS,
];

// Sex field - now has UX default, so no empty option needed
export const SEX_OPTIONS_WITH_DEFAULT = SEX_OPTIONS;

export const EDUCATION_LEVEL_OPTIONS_WITH_EMPTY = [
  { value: '', label: 'Select education level' },
  ...EDUCATION_LEVEL_OPTIONS,
];

export const EMPLOYMENT_STATUS_OPTIONS_WITH_EMPTY = [
  { value: '', label: 'Select employment status' },
  ...EMPLOYMENT_STATUS_OPTIONS,
];

// Legacy exports for backward compatibility - fields with defaults now use direct options
export const BLOOD_TYPE_OPTIONS_WITH_EMPTY = BLOOD_TYPE_OPTIONS;
export const RELIGION_OPTIONS_WITH_EMPTY = RELIGION_OPTIONS;
export const ETHNICITY_OPTIONS_WITH_EMPTY = ETHNICITY_OPTIONS;
export const CIVIL_STATUS_OPTIONS_WITH_EMPTY = CIVIL_STATUS_OPTIONS;
export const CITIZENSHIP_OPTIONS_WITH_EMPTY = CITIZENSHIP_OPTIONS;
export const SEX_OPTIONS_WITH_EMPTY = SEX_OPTIONS; // Now also has default
