import { 
  SexValue, 
  CivilStatusValue, 
  CitizenshipValue, 
  EducationLevelValue, 
  EmploymentStatusValue, 
  BloodTypeValue, 
  ReligionValue, 
  EthnicityValue 
} from '../constants/enums';

export interface ResidentFormData {
  // Personal Information - Step 1
  firstName: string;
  middleName: string;
  lastName: string;
  extensionName: string;
  birthdate: string;
  sex: SexValue | '';
  civilStatus: CivilStatusValue | '';
  citizenship: CitizenshipValue | '';

  // Family Information - Step 1
  motherMaidenFirstName: string;
  motherMaidenMiddleName: string;
  motherMaidenLastName: string;

  // Birth Place Information - Step 1
  birthPlaceCode: string;
  birthPlaceLevel: string;
  birthPlaceName: string;

  // Contact Information - Step 2
  email: string;
  mobileNumber: string;
  telephoneNumber: string;

  // Geographic Information - Step 2
  regionCode: string;
  provinceCode: string;
  cityMunicipalityCode: string;
  barangayCode: string;

  // Address Details - Step 2
  streetId: string;
  subdivisionId: string;
  zipCode: string;

  // Education & Employment - Step 3
  educationAttainment: EducationLevelValue | '';
  isGraduate: boolean;
  employmentStatus: EmploymentStatusValue | '';
  psocCode: string;
  psocLevel: string | number | null;
  occupationTitle: string;
  workplace: string;

  // Physical & Identity Information - Step 4
  bloodType: BloodTypeValue | '';
  height: string;
  weight: string;
  complexion: string;
  ethnicity: EthnicityValue | '';
  religion: ReligionValue | '';
  religionOthersSpecify: string;

  // Voting Information - Step 4
  isVoter: boolean | null;
  isResidentVoter: boolean | null;
  lastVotedDate: string;

  // Documentation - Step 4
  philsysCardNumber: string;

  // Household Assignment - Step 5
  householdCode: string;

  // Migration Information - Step 5 (optional)
  migrationInfo: {
    previousBarangayCode?: string;
    previousCityMunicipalityCode?: string;
    previousProvinceCode?: string;
    previousRegionCode?: string;
    reasonForLeaving?: string;
    dateOfTransfer?: string;
    reasonForTransferring?: string;
    durationOfStayCurrentMonths?: number;
    isIntendingToReturn?: boolean;
    migrationType?: string;
  } | null;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface StepComponentProps {
  formData: ResidentFormData;
  onChange: (field: keyof ResidentFormData, value: string | boolean | number | null) => void;
  errors: ValidationErrors;
  onNext: () => void;
  onPrevious: () => void;
}

export interface FormStep {
  id: number;
  title: string;
  description: string;
  component: React.ComponentType<StepComponentProps>;
  validation: (data: ResidentFormData) => ValidationErrors;
}

export interface ResidentFormWizardProps {
  onSubmit?: (data: ResidentFormData) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<ResidentFormData>;
}

export interface UseResidentFormReturn {
  // State
  formData: ResidentFormData;
  errors: ValidationErrors;
  currentStep: number;
  isSubmitting: boolean;
  
  // Actions
  handleInputChange: (field: keyof ResidentFormData, value: string | boolean | number | null) => void;
  handleNextStep: () => void;
  handlePrevStep: () => void;
  handleSubmit: () => Promise<void>;
  
  // Validation
  validateStep: (step: number) => boolean;
  validateForm: () => boolean;
  
  // Utilities
  steps: FormStep[];
  canProceedToNext: boolean;
  canGoBack: boolean;
}