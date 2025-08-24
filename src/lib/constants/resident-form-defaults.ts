import type { ResidentFormData } from '@/types/residents';

export const DEFAULT_FORM_VALUES: ResidentFormData = {
  firstName: '',
  middleName: '',
  lastName: '',
  extensionName: '',
  sex: '',
  civilStatus: '',
  civilStatusOthersSpecify: '',
  citizenship: '',
  birthdate: '',
  birthPlaceCode: '',
  philsysCardNumber: '',
  educationAttainment: '',
  isGraduate: false,
  employmentStatus: '',
  occupationCode: '',
  ethnicity: '',
  email: '',
  telephoneNumber: '',
  mobileNumber: '',
  householdCode: '',
  // Physical Characteristics
  bloodType: '',
  complexion: '',
  height: '',
  weight: '',
  religion: '',
  religionOthersSpecify: '',
  // Voting Information
  lastVotedDate: '',
  // Mother's Maiden Name
  motherMaidenFirstName: '',
  motherMaidenMiddleName: '',
  motherMaidenLastName: '',
  // Note: Sectoral and migration information are handled separately
  // These properties are stored in separate tables (resident_sectoral_info, resident_migrant_info)
  // and should not be part of the core ResidentFormData interface
};

export const CRITICAL_VALIDATION_FIELDS = [
  'firstName', 
  'lastName', 
  'sex', 
  'birthdate', 
  'civilStatus', 
  'mobileNumber', 
  'email'
] as const;

export const VALIDATION_DEBOUNCE_MS = 800;