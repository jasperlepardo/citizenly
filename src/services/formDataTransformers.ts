/**
 * Data transformation utilities for form data mapping
 */

import type { ResidentFormData } from '@/types';
import { MigrationInformationData } from '@/hooks/utilities/useMigrationInformation';

// Data transformer for BasicInformation
export interface BasicInformationData {
  first_name: string;
  middle_name: string;
  last_name: string;
  extension_name: string;
  sex: 'male' | 'female' | '';
  civil_status: string;
  civil_status_others_specify: string;
  citizenship: string;
}

export const transformBasicInfoToFormData = (
  basicInfo: BasicInformationData
): Partial<ResidentFormData> => {
  return {
    first_name: basicInfo.first_name,
    middle_name: basicInfo.middle_name,
    last_name: basicInfo.last_name,
    extension_name: basicInfo.extension_name,
    sex: basicInfo.sex === '' ? undefined : (basicInfo.sex as 'male' | 'female'),
    civil_status: basicInfo.civil_status as any,
    citizenship: basicInfo.citizenship as any,
  };
};

export const extractBasicInfoFromFormData = (
  formData: ResidentFormData
): BasicInformationData => {
  return {
    first_name: formData.first_name || '',
    middle_name: formData.middle_name || '',
    last_name: formData.last_name || '',
    extension_name: formData.extension_name || '',
    sex: (formData.sex || '') as '' | 'male' | 'female',
    civil_status: formData.civil_status || '',
    civil_status_others_specify: (formData as any).civil_status_others_specify || '',
    citizenship: formData.citizenship || '',
  };
};

// Data transformer for BirthInformation
export interface BirthInformationData {
  birthdate: string;
  birth_place_name: string;
  birth_place_code: string;
}

export const transformBirthInfoToFormData = (
  birthInfo: BirthInformationData
): Partial<ResidentFormData> => {
  return {
    birthdate: birthInfo.birthdate,
    birth_place_code: birthInfo.birth_place_code,
  };
};

export const extractBirthInfoFromFormData = (
  formData: ResidentFormData
): BirthInformationData => {
  return {
    birthdate: formData.birthdate || '',
    birth_place_name: formData.birth_place_name || '',
    birth_place_code: formData.birth_place_code || '',
  };
};

// Data transformer for EducationInformation
export interface EducationInformationData {
  education_attainment: string;
  is_graduate: boolean;
}

export const transformEducationInfoToFormData = (
  educationInfo: EducationInformationData
): Partial<ResidentFormData> => {
  return {
    education_attainment: educationInfo.education_attainment,
    is_graduate: educationInfo.is_graduate,
  };
};

export const extractEducationInfoFromFormData = (
  formData: ResidentFormData
): EducationInformationData => {
  return {
    education_attainment: formData.education_attainment || '',
    is_graduate: formData.is_graduate || false,
  };
};

// Data transformer for EmploymentInformation
export interface EmploymentInformationData {
  employment_status: string;
  occupation_code: string;
}

export const transformEmploymentInfoToFormData = (
  employmentInfo: EmploymentInformationData
): Partial<ResidentFormData> => {
  return {
    employment_status: employmentInfo.employment_status,
    occupation_code: employmentInfo.occupation_code,
  };
};

export const extractEmploymentInfoFromFormData = (
  formData: ResidentFormData
): EmploymentInformationData => {
  return {
    employment_status: formData.employment_status || '',
    occupation_code: formData.occupation_code || '',
  };
};

// Data transformer for PhysicalCharacteristics
export interface PhysicalCharacteristicsData {
  blood_type: string;
  complexion: string;
  height: string;
  weight: string;
  citizenship: string;
  ethnicity: string;
  religion: string;
  religion_others_specify: string;
}

export const transformPhysicalCharacteristicsToFormData = (
  physicalInfo: PhysicalCharacteristicsData
): Partial<ResidentFormData> => {
  return {
    blood_type: physicalInfo.blood_type as any,
    complexion: physicalInfo.complexion,
    height: parseFloat(physicalInfo.height) || 0,
    weight: parseFloat(physicalInfo.weight) || 0,
    citizenship: physicalInfo.citizenship as any,
    ethnicity: physicalInfo.ethnicity,
    religion: physicalInfo.religion,
    religion_others_specify: physicalInfo.religion_others_specify,
  };
};

export const extractPhysicalCharacteristicsFromFormData = (
  formData: ResidentFormData
): PhysicalCharacteristicsData => {
  return {
    blood_type: formData.blood_type || '',
    complexion: formData.complexion || '',
    height: String(formData.height || ''),
    weight: String(formData.weight || ''),
    citizenship: formData.citizenship || '',
    ethnicity: formData.ethnicity || '',
    religion: formData.religion || '',
    religion_others_specify: formData.religion_others_specify || '',
  };
};

// Data transformer for Migration Information
export const transformMigrationInfoToFormData = (
  migrationInfo: MigrationInformationData
): Partial<ResidentFormData> => {
  return {
    previous_barangay_code: migrationInfo.previous_barangay_code || '',
    previous_city_municipality_code: migrationInfo.previous_city_municipality_code || '',
    previous_province_code: migrationInfo.previous_province_code || '',
    previous_region_code: migrationInfo.previous_region_code || '',
    length_of_stay_previous_months: migrationInfo.length_of_stay_previous_months || 0,
    reason_for_migration: migrationInfo.reason_for_migration || '',
    date_of_transfer: migrationInfo.date_of_transfer || '',
    migration_type: migrationInfo.migration_type || '',
  };
};

export const extractMigrationInfoFromFormData = (
  formData: ResidentFormData
): MigrationInformationData => {
  return {
    previous_barangay_code: formData.previous_barangay_code || '',
    previous_city_municipality_code: formData.previous_city_municipality_code || '',
    previous_province_code: formData.previous_province_code || '',
    previous_region_code: formData.previous_region_code || '',
    length_of_stay_previous_months: formData.length_of_stay_previous_months || 0,
    reason_for_migration: formData.reason_for_migration || '',
    date_of_transfer: formData.date_of_transfer || '',
    migration_type: formData.migration_type || '',
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