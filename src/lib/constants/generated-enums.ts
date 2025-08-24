/**
 * Generated Enums - Single Source of Truth
 * 
 * This file is auto-generated. Do not edit manually.
 * Generated at: 2025-08-22T16:48:38.722Z
 * 
 * To update enums, modify scripts/generate-enums.ts and run:
 * npm run generate:enums
 */

// Gender/sex options
export const SEX_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
] as const;

// Marital status options - EXACTLY matching civil_status_enum in database
export const CIVIL_STATUS_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'separated', label: 'Separated' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'others', label: 'Others (specify)' },
] as const;

// Employment status options - synced with database schema and API validation
export const EMPLOYMENT_STATUS_OPTIONS = [
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
] as const;

// Blood type options - EXACTLY matching blood_type_enum in database
export const BLOOD_TYPE_OPTIONS = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
] as const;

// Citizenship options
export const CITIZENSHIP_OPTIONS = [
  { value: 'filipino', label: 'Filipino' },
  { value: 'dual_citizen', label: 'Dual Citizen' },
  { value: 'foreigner', label: 'Foreigner' },
] as const;

// Religious affiliation options
export const RELIGION_OPTIONS = [
  { value: 'roman_catholic', label: 'Roman Catholic' },
  { value: 'islam', label: 'Islam' },
  { value: 'iglesia_ni_cristo', label: 'Iglesia ni Cristo' },
  { value: 'christian', label: 'Christian' },
  { value: 'aglipayan_church', label: 'Aglipayan Church' },
  { value: 'seventh_day_adventist', label: 'Seventh Day Adventist' },
  { value: 'bible_baptist_church', label: 'Bible Baptist Church' },
  { value: 'jehovahs_witnesses', label: 'Jehovahs Witnesses' },
  { value: 'church_of_jesus_christ_latter_day_saints', label: 'Church of Jesus Christ of Latter-day Saints' },
  { value: 'united_church_of_christ_philippines', label: 'United Church of Christ Philippines' },
  { value: 'others', label: 'Others (specify)' },
] as const;

// Ethnicity/tribal affiliation options
export const ETHNICITY_OPTIONS = [
  { value: 'tagalog', label: 'Tagalog' },
  { value: 'cebuano', label: 'Cebuano' },
  { value: 'ilocano', label: 'Ilocano' },
  { value: 'bisaya', label: 'Bisaya' },
  { value: 'hiligaynon', label: 'Hiligaynon' },
  { value: 'bikolano', label: 'Bikolano' },
  { value: 'waray', label: 'Waray' },
  { value: 'kapampangan', label: 'Kapampangan' },
  { value: 'pangasinense', label: 'Pangasinense' },
  { value: 'maranao', label: 'Maranao' },
  { value: 'maguindanao', label: 'Maguindanao' },
  { value: 'tausug', label: 'Tausug' },
  { value: 'yakan', label: 'Yakan' },
  { value: 'samal', label: 'Samal' },
  { value: 'badjao', label: 'Badjao' },
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
  { value: 'tboli', label: 'Tboli' },
  { value: 'teduray', label: 'Teduray' },
  { value: 'tumandok', label: 'Tumandok' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'others', label: 'Others' },
] as const;

// Education attainment levels - aligned with Supabase schema
export const EDUCATION_LEVEL_OPTIONS = [
  { value: 'elementary', label: 'Elementary' },
  { value: 'high_school', label: 'High School' },
  { value: 'college', label: 'College' },
  { value: 'post_graduate', label: 'Post Graduate' },
  { value: 'vocational', label: 'Vocational' },
] as const;

// Income Classifications (NEDA standards)
export const INCOME_CLASS_OPTIONS = [
  { value: 'rich', label: 'Rich' },
  { value: 'high_income', label: 'High Income' },
  { value: 'upper_middle_income', label: 'Upper Middle Income' },
  { value: 'middle_class', label: 'Middle Class' },
  { value: 'lower_middle_class', label: 'Lower Middle Class' },
  { value: 'low_income', label: 'Low Income' },
  { value: 'poor', label: 'Poor' },
  { value: 'not_determined', label: 'Not Determined' },
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
export type IncomeClassValue = (typeof INCOME_CLASS_OPTIONS)[number]['value'];

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
