import type { ResidentFormData } from '@/types';

export const DEFAULT_FORM_VALUES: ResidentFormData = {
  first_name: '',
  middle_name: '',
  last_name: '',
  extension_name: '',
  sex: 'male' as const,
  civil_status: 'single' as const,
  civil_status_others_specify: '',
  citizenship: 'filipino' as const,
  birthdate: '',
  birth_place_code: '',
  philsys_card_number: '',
  education_attainment: '',
  is_graduate: false,
  employment_status: '',
  occupation_code: '',
  ethnicity: '',
  email: '',
  telephone_number: '',
  mobile_number: '',
  household_code: '',
  // Physical Characteristics
  blood_type: null,
  complexion: '',
  height: 0,
  weight: 0,
  religion: '',
  religion_others_specify: '',
  // Voting Information
  last_voted_date: '',
  // Mother's Maiden Name
  mother_maiden_first: '',
  mother_maiden_middle: '',
  mother_maiden_last: '',
  // Note: Sectoral and migration information are handled separately
  // These properties are stored in separate tables (resident_sectoral_info, resident_migrant_info)
  // and should not be part of the core ResidentFormData interface
};

export const CRITICAL_VALIDATION_FIELDS = [
  'first_name', 
  'last_name', 
  'sex', 
  'birthdate', 
  'civil_status', 
  'mobile_number', 
  'email'
] as const;

export const VALIDATION_DEBOUNCE_MS = 800;