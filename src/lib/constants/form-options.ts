/**
 * @deprecated This file is deprecated. Use generated-enums.ts instead.
 * Re-exports are provided for backwards compatibility only.
 */

// Re-export all options from the generated source of truth
export {
  CIVIL_STATUS_OPTIONS,
  CITIZENSHIP_OPTIONS,
  SEX_OPTIONS,
  BLOOD_TYPE_OPTIONS,
  EDUCATION_LEVEL_OPTIONS as EDUCATION_ATTAINMENT_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
} from './generated-enums';

// Re-export types from generated source
export type {
  CivilStatusValue,
  CitizenshipValue,
  SexValue,
  BloodTypeValue,
  EducationLevelValue as EducationAttainmentValue,
  EmploymentStatusValue,
} from './generated-enums';

// Helper functions to add empty/default options
export const withEmptyOption = (
  options: { value: string; label: string }[],
  placeholder = 'Select...'
): { value: string; label: string }[] => [{ value: '', label: placeholder }, ...options];
