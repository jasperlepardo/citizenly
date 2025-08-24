/**
 * Data transformation utilities for form data mapping
 */

import type { ResidentFormData } from '@/types/residents';
import { MigrationInformationData } from '@/hooks/utilities/useMigrationInformation';

// Data transformer for BasicInformation
export interface BasicInformationData {
  firstName: string;
  middleName: string;
  lastName: string;
  extensionName: string;
  sex: 'male' | 'female' | '';
  civilStatus: string;
  civilStatusOthersSpecify: string;
  citizenship: string;
}

export const transformBasicInfoToFormData = (
  basicInfo: BasicInformationData
): Partial<ResidentFormData> => {
  return {
    firstName: basicInfo.firstName,
    middleName: basicInfo.middleName,
    lastName: basicInfo.lastName,
    extensionName: basicInfo.extensionName,
    sex: basicInfo.sex,
    civilStatus: basicInfo.civilStatus,
    citizenship: basicInfo.citizenship,
  };
};

export const extractBasicInfoFromFormData = (
  formData: ResidentFormData
): BasicInformationData => {
  return {
    firstName: formData.firstName || '',
    middleName: formData.middleName || '',
    lastName: formData.lastName || '',
    extensionName: formData.extensionName || '',
    sex: (formData.sex || '') as '' | 'male' | 'female',
    civilStatus: formData.civilStatus || '',
    civilStatusOthersSpecify: (formData as any).civilStatusOthersSpecify || '',
    citizenship: formData.citizenship || '',
  };
};

// Data transformer for BirthInformation
export interface BirthInformationData {
  birthdate: string;
  birthPlaceName: string;
  birthPlaceCode: string;
}

export const transformBirthInfoToFormData = (
  birthInfo: BirthInformationData
): Partial<ResidentFormData> => {
  return {
    birthdate: birthInfo.birthdate,
    birthPlaceCode: birthInfo.birthPlaceCode,
  };
};

export const extractBirthInfoFromFormData = (
  formData: ResidentFormData
): BirthInformationData => {
  return {
    birthdate: formData.birthdate || '',
    birthPlaceCode: formData.birthPlaceCode || '',
  };
};

// Data transformer for EducationInformation
export interface EducationInformationData {
  educationAttainment: string;
  isGraduate: boolean;
}

export const transformEducationInfoToFormData = (
  educationInfo: EducationInformationData
): Partial<ResidentFormData> => {
  return {
    educationAttainment: educationInfo.educationAttainment,
    isGraduate: educationInfo.isGraduate,
  };
};

export const extractEducationInfoFromFormData = (
  formData: ResidentFormData
): EducationInformationData => {
  return {
    educationAttainment: formData.educationAttainment || '',
    isGraduate: formData.isGraduate || false,
  };
};

// Data transformer for EmploymentInformation
export interface EmploymentInformationData {
  employmentStatus: string;
  occupationCode: string;
}

export const transformEmploymentInfoToFormData = (
  employmentInfo: EmploymentInformationData
): Partial<ResidentFormData> => {
  return {
    employmentStatus: employmentInfo.employmentStatus,
    occupationCode: employmentInfo.occupationCode,
  };
};

export const extractEmploymentInfoFromFormData = (
  formData: ResidentFormData
): EmploymentInformationData => {
  return {
    employmentStatus: formData.employmentStatus || '',
    occupationCode: formData.occupationCode || '',
  };
};

// Data transformer for PhysicalCharacteristics
export interface PhysicalCharacteristicsData {
  bloodType: string;
  complexion: string;
  height: string;
  weight: string;
  citizenship: string;
  ethnicity: string;
  religion: string;
  religionOthersSpecify: string;
}

export const transformPhysicalCharacteristicsToFormData = (
  physicalInfo: PhysicalCharacteristicsData
): Partial<ResidentFormData> => {
  return {
    bloodType: physicalInfo.bloodType,
    complexion: physicalInfo.complexion,
    height: physicalInfo.height,
    weight: physicalInfo.weight,
    citizenship: physicalInfo.citizenship,
    ethnicity: physicalInfo.ethnicity,
    religion: physicalInfo.religion,
    religionOthersSpecify: physicalInfo.religionOthersSpecify,
  };
};

export const extractPhysicalCharacteristicsFromFormData = (
  formData: ResidentFormData
): PhysicalCharacteristicsData => {
  return {
    bloodType: formData.bloodType || '',
    complexion: formData.complexion || '',
    height: formData.height || '',
    weight: formData.weight || '',
    citizenship: formData.citizenship || '',
    ethnicity: formData.ethnicity || '',
    religion: formData.religion || '',
    religionOthersSpecify: formData.religionOthersSpecify || '',
  };
};

// Data transformer for Migration Information
export const transformMigrationInfoToFormData = (
  migrationInfo: MigrationInformationData
): Partial<ResidentFormData> => {
  return {
    previousBarangayCode: migrationInfo.previous_barangay_code || '',
    previousCityMunicipalityCode: migrationInfo.previous_city_municipality_code || '',
    previousProvinceCode: migrationInfo.previous_province_code || '',
    previousRegionCode: migrationInfo.previous_region_code || '',
    lengthOfStayPreviousMonths: migrationInfo.length_of_stay_previous_months || 0,
    reasonForLeaving: migrationInfo.reason_for_leaving || '',
    dateOfTransfer: migrationInfo.date_of_transfer || '',
    reasonForTransferring: migrationInfo.reason_for_transferring || '',
    durationOfStayCurrentMonths: migrationInfo.duration_of_stay_current_months || 0,
    isIntendingToReturn: migrationInfo.is_intending_to_return || false,
  };
};

export const extractMigrationInfoFromFormData = (
  formData: ResidentFormData
): MigrationInformationData => {
  return {
    previous_barangay_code: formData.previousBarangayCode || '',
    previous_city_municipality_code: formData.previousCityMunicipalityCode || '',
    previous_province_code: formData.previousProvinceCode || '',
    previous_region_code: formData.previousRegionCode || '',
    length_of_stay_previous_months: formData.lengthOfStayPreviousMonths || 0,
    reason_for_leaving: formData.reasonForLeaving || '',
    date_of_transfer: formData.dateOfTransfer || '',
    reason_for_transferring: formData.reasonForTransferring || '',
    duration_of_stay_current_months: formData.durationOfStayCurrentMonths || 0,
    is_intending_to_return: formData.isIntendingToReturn || false,
  };
};

// Generic field change handler factory
export const createFieldChangeHandler = <T extends Record<string, unknown>>(
  currentValue: T,
  onChange: (value: T) => void
) => (field: keyof T, value: T[keyof T]) => {
  onChange({
    ...currentValue,
    [field]: value,
  });
};

// Bulk field update utility
export const updateFormFields = (
  currentFormData: ResidentFormData,
  updates: Partial<ResidentFormData>
): ResidentFormData => {
  return {
    ...currentFormData,
    ...updates,
  };
};

// Form data validation helpers
export const validateRequiredFields = (
  data: Record<string, any>,
  requiredFields: string[]
): { isValid: boolean; missingFields: string[] } => {
  const missingFields = requiredFields.filter(field => {
    const value = data[field];
    return value === null || value === undefined || value === '';
  });

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
};

// Field dependency resolver
export const resolveFieldDependencies = (
  formData: ResidentFormData,
  fieldName: string,
  dependencies: Record<string, string[]>
): boolean => {
  const fieldDependencies = dependencies[fieldName];
  if (!fieldDependencies) return true;

  return fieldDependencies.every(dep => {
    const value = formData[dep as keyof ResidentFormData];
    return value !== null && value !== undefined && value !== '';
  });
};