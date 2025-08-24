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
  // Sectoral Information
  isLaborForceEmployed: false,
  isUnemployed: false,
  isOverseasFilipinoWorker: false,
  isPersonWithDisability: false,
  isOutOfSchoolChildren: false,
  isOutOfSchoolYouth: false,
  isSeniorCitizen: false,
  isRegisteredSeniorCitizen: false,
  isSoloParent: false,
  isIndigenousPeople: false,
  isMigrant: false,
  // Migration Information
  previousBarangayCode: '',
  previousCityMunicipalityCode: '',
  previousProvinceCode: '',
  previousRegionCode: '',
  lengthOfStayPreviousMonths: 0,
  reasonForLeaving: '',
  dateOfTransfer: '',
  reasonForTransferring: '',
  durationOfStayCurrentMonths: 0,
  isIntendingToReturn: false,
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