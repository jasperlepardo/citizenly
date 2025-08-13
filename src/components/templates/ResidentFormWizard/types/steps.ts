import { ResidentFormData, ValidationErrors } from './index';

// Step-specific data interfaces
export interface BasicInfoStepData {
  firstName: string;
  middleName: string;
  lastName: string;
  extensionName: string;
  birthdate: string;
  sex: 'male' | 'female' | '';
  civilStatus: string;
  citizenship: string;
  motherMaidenFirstName: string;
  motherMaidenMiddleName: string;
  motherMaidenLastName: string;
  birthPlaceCode: string;
  birthPlaceLevel: string;
  birthPlaceName: string;
}

export interface ContactAddressStepData {
  email: string;
  mobileNumber: string;
  telephoneNumber: string;
  regionCode: string;
  provinceCode: string;
  cityMunicipalityCode: string;
  barangayCode: string;
  streetId: string;
  subdivisionId: string;
  zipCode: string;
}

export interface EducationEmploymentStepData {
  educationAttainment: string;
  isGraduate: boolean;
  employmentStatus: string;
  psocCode: string;
  psocLevel: string | number | null;
  occupationTitle: string;
  workplace: string;
}

export interface AdditionalDetailsStepData {
  bloodType: string;
  height: string;
  weight: string;
  complexion: string;
  ethnicity: string;
  religion: string;
  religionOthersSpecify: string;
  isVoter: boolean | null;
  isResidentVoter: boolean | null;
  lastVotedDate: string;
  philsysCardNumber: string;
}

export interface ReviewStepData {
  householdCode: string;
  migrationInfo: any;
}

// Validation function types for each step
export type StepValidationFn<T = ResidentFormData> = (data: T) => ValidationErrors;

// Step configuration types
export interface StepConfig {
  title: string;
  description: string;
  fields: (keyof ResidentFormData)[];
  requiredFields: (keyof ResidentFormData)[];
  validation: StepValidationFn;
}

// Navigation state types
export interface NavigationState {
  currentStep: number;
  completedSteps: Set<number>;
  canGoBack: boolean;
  canProceedToNext: boolean;
  isLastStep: boolean;
}

// Form submission types
export interface SubmissionResult {
  success: boolean;
  residentId?: string;
  error?: string;
  details?: string[];
}

export interface ApiResponse {
  resident_id?: string;
  resident?: { id: string };
  confirmation?: any;
  message?: string;
  error?: string;
  details?: string[];
}
