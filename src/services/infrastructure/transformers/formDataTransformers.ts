/**
 * Data transformation utilities for form data mapping
 */

import type {
  SexEnum,
  CivilStatusEnum,
  CitizenshipEnum,
  BloodTypeEnum,
  ReligionEnum,
  EthnicityEnum,
  EducationLevelEnum,
  EmploymentStatusEnum,
} from '@/types/infrastructure/database/database';
import type { ResidentFormData } from '@/types/domain/residents/forms';
import type {
  MigrationInformationData,
  BasicInformationData,
  BirthInformationData,
  EducationInformationData,
  EmploymentInformationData,
  PhysicalInformationData,
} from '../../../types/infrastructure/services/services';

export const transformBasicInfoToFormData = (
  basicInfo: BasicInformationData
): Partial<ResidentFormData> => {
  return {
    first_name: basicInfo.first_name,
    middle_name: basicInfo.middle_name,
    last_name: basicInfo.last_name,
    extension_name: basicInfo.extension_name,
    sex: basicInfo.sex === '' ? undefined : (basicInfo.sex as SexEnum),
    civil_status:
      basicInfo.civil_status === '' ? undefined : (basicInfo.civil_status as CivilStatusEnum),
  };
};

export const extractBasicInfoFromFormData = (formData: ResidentFormData): BasicInformationData => {
  return {
    first_name: formData.first_name || '',
    middle_name: formData.middle_name || '',
    last_name: formData.last_name || '',
    extension_name: formData.extension_name || '',
    sex: (formData.sex || '') as '' | 'male' | 'female',
    civil_status: formData.civil_status || '',
    civil_status_others_specify: formData.civil_status_others_specify || '',
  };
};

// Using consolidated BirthInformationData from @/types/infrastructure/services

export const transformBirthInfoToFormData = (
  birthInfo: BirthInformationData
): Partial<ResidentFormData> => {
  return {
    birthdate: birthInfo.birthdate,
    birth_place_code: birthInfo.birth_place_code,
  };
};

export const extractBirthInfoFromFormData = (formData: ResidentFormData): BirthInformationData => {
  return {
    birthdate: formData.birthdate || '',
    birth_place_name: formData.birth_place_name || '',
    birth_place_code: formData.birth_place_code || '',
    citizenship: formData.citizenship || '',
  };
};

// Using consolidated EducationInformationData from @/types/infrastructure/services

export const transformEducationInfoToFormData = (
  educationInfo: EducationInformationData
): Partial<ResidentFormData> => {
  return {
    education_attainment:
      educationInfo.education_attainment === ''
        ? undefined
        : (educationInfo.education_attainment as EducationLevelEnum),
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

// Using consolidated EmploymentInformationData from @/types/infrastructure/services

export const transformEmploymentInfoToFormData = (
  employmentInfo: EmploymentInformationData
): Partial<ResidentFormData> => {
  return {
    employment_status:
      employmentInfo.employment_status === ''
        ? undefined
        : (employmentInfo.employment_status as EmploymentStatusEnum),
    occupation_code: employmentInfo.occupation_code,
  };
};

export const extractEmploymentInfoFromFormData = (
  formData: ResidentFormData
): EmploymentInformationData => {
  return {
    employment_status: formData.employment_status || '',
    occupation_code: formData.occupation_code || '',
    employment_code: '', // Not available in ResidentFormData
    employment_name: '', // Not available in ResidentFormData
    occupation_title: '', // Not available in ResidentFormData
  };
};

// Data transformer for PhysicalCharacteristics
// Using consolidated PhysicalInformationData from @/types/infrastructure/services

export const transformPhysicalCharacteristicsToFormData = (
  physicalInfo: PhysicalInformationData
): Partial<ResidentFormData> => {
  return {
    blood_type:
      physicalInfo.blood_type === '' ? undefined : (physicalInfo.blood_type as BloodTypeEnum),
    complexion: physicalInfo.complexion,
    height: physicalInfo.height ? physicalInfo.height.toString() : undefined,
    weight: physicalInfo.weight ? physicalInfo.weight.toString() : undefined,
    citizenship:
      physicalInfo.citizenship === '' || !physicalInfo.citizenship
        ? undefined
        : (physicalInfo.citizenship as CitizenshipEnum),
    ethnicity:
      physicalInfo.ethnicity === '' ? undefined : (physicalInfo.ethnicity as EthnicityEnum),
    religion: physicalInfo.religion === '' ? undefined : (physicalInfo.religion as ReligionEnum),
    religion_others_specify: physicalInfo.religion_others_specify,
  };
};

export const extractPhysicalCharacteristicsFromFormData = (
  formData: ResidentFormData
): PhysicalInformationData => {
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
// Note: Migration data is stored in a separate table (resident_migrant_info)
// These functions should be used when handling migration data separately from resident form data

export const createMigrationInfoFromData = (
  migrationInfo: MigrationInformationData
): MigrationInformationData => {
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

export const extractMigrationInfoFromRawData = (migrationData: any): MigrationInformationData => {
  return {
    previous_barangay_code: migrationData.previous_barangay_code || '',
    previous_city_municipality_code: migrationData.previous_city_municipality_code || '',
    previous_province_code: migrationData.previous_province_code || '',
    previous_region_code: migrationData.previous_region_code || '',
    length_of_stay_previous_months: migrationData.length_of_stay_previous_months || 0,
    reason_for_migration: migrationData.reason_for_migration || '',
    date_of_transfer: migrationData.date_of_transfer || '',
    migration_type: migrationData.migration_type || '',
  };
};

// Generic field change handler factory
export const createFieldChangeHandler =
  <T extends Record<string, unknown>>(currentValue: T, onChange: (value: T) => void) =>
  (field: keyof T, value: T[keyof T]) => {
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
