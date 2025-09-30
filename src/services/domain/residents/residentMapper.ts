/**
 * Resident Mapper Service
 * CONSOLIDATED - This is the SINGLE source of truth for resident data mapping
 * Eliminates duplicate implementations and inconsistent mapping patterns
 */

import {
  HouseholdData,
  HouseholdHead,
  HouseholdOption,
} from '@/types/domain/households/households';
import { PsocOption, PsgcOption } from '@/types/domain/residents/api';
import { ResidentWithRelations } from '@/types/domain/residents/core';
import { ResidentFormData } from '@/types/domain/residents/forms';
import { ResidentRecord } from '@/types/infrastructure/database/database';
import type {
  ServiceRawPsocData as RawPsocData,
  ServiceRawPsgcData as RawPsgcData,
} from '@/types/infrastructure/services/services';
import { parseFullName } from '@/utils/residents/residentDataProcessing';
import { calculateAge } from '@/utils/shared/dateUtils';

import { formatFullName } from './residentHelpers';

/**
 * Map form data (camelCase) to API format (snake_case for database)
 * This is the definitive mapping - no more inconsistencies!
 */
export const mapFormToApi = (
  formData: ResidentFormData
): Omit<ResidentRecord, 'id' | 'created_at' | 'updated_at'> => {
  return {
    // Required fields
    first_name: formData.first_name,
    last_name: formData.last_name,
    birthdate: formData.birthdate,
    sex: formData.sex as 'male' | 'female',

    // Optional personal info
    middle_name: formData.middle_name || undefined,
    extension_name: formData.extension_name || undefined,
    email: formData.email || undefined,
    mobile_number: formData.mobile_number || undefined,
    telephone_number: formData.telephone_number || undefined, // Maps to telephone_number in DB
    civil_status: (formData.civil_status as any) || undefined,
    civil_status_others_specify: formData.civil_status_others_specify || undefined,
    citizenship: (formData.citizenship as any) || undefined,
    blood_type: (formData.blood_type as any) || undefined,
    ethnicity: (formData.ethnicity as any) || undefined,
    religion: (formData.religion as any) || undefined,
    religion_others_specify: formData.religion_others_specify || undefined,

    // Physical characteristics - convert to numbers for API
    height:
      typeof formData.height === 'string' ? parseFloat(formData.height) || 0 : formData.height || 0,
    weight:
      typeof formData.weight === 'string' ? parseFloat(formData.weight) || 0 : formData.weight || 0,
    complexion: formData.complexion || undefined,

    // Documentation
    birth_place_code: formData.birth_place_code || undefined,
    philsys_card_number: formData.philsys_card_number || undefined,

    // Family information
    mother_maiden_first: formData.mother_maiden_first || undefined,
    mother_maiden_middle: formData.mother_maiden_middle || undefined,
    mother_maiden_last: formData.mother_maiden_last || undefined,

    // Education and employment
    education_attainment: (formData.education_attainment as any) || undefined,
    is_graduate: formData.is_graduate || false,
    employment_status: (formData.employment_status as any) || undefined,
    occupation_code: formData.occupation_code || undefined, // Maps to occupation_code in DB

    // Voting information
    is_voter: formData.is_voter ?? undefined,
    is_resident_voter: formData.is_resident_voter ?? undefined,
    last_voted_date: formData.last_voted_date || undefined,

    // Household
    household_code: formData.household_code || undefined,
  };
};

/**
 * Map database record to form data
 * Used when loading existing resident for editing
 */
export const mapDatabaseToForm = (resident: ResidentWithRelations): ResidentFormData => {
  return {
    // Required database fields
    id: resident.id,
    // Personal Information
    first_name: resident.first_name,
    middle_name: resident.middle_name || '',
    last_name: resident.last_name,
    extension_name: resident.extension_name || '',
    sex: resident.sex,
    civil_status: resident.civil_status || '',
    civil_status_others_specify: resident.civil_status_others_specify || '',
    citizenship: resident.citizenship || 'filipino',
    birthdate: resident.birthdate,
    birth_place_code: resident.birth_place_code || '',
    philsys_card_number: resident.philsys_card_number || '',
    education_attainment: resident.education_attainment || undefined,
    is_graduate: resident.is_graduate || false,
    employment_status: resident.employment_status || undefined,
    occupation_code: resident.occupation_code || '', // Maps to occupation_code in DB
    ethnicity: resident.ethnicity || undefined,

    // Contact Information
    email: resident.email || '',
    telephone_number: resident.telephone_number || '', // Maps from telephone_number in DB
    mobile_number: resident.mobile_number || '',
    household_code: resident.household_code || '',

    // Physical Characteristics
    blood_type: resident.blood_type || undefined,
    complexion: resident.complexion || '',
    height: resident.height ? resident.height.toString() : '',
    weight: resident.weight ? resident.weight.toString() : '',
    religion: resident.religion || undefined,
    religion_others_specify: resident.religion_others_specify || '',

    // Voting Information
    is_voter: resident.is_voter,
    is_resident_voter: resident.is_resident_voter,
    last_voted_date: resident.last_voted_date || '',

    // Mother's Maiden Name
    mother_maiden_first: resident.mother_maiden_first || '',
    mother_maiden_middle: resident.mother_maiden_middle || '',
    mother_maiden_last: resident.mother_maiden_last || '',

    // Note: Sectoral and migration information are handled separately
    // These should be fetched/stored via separate services and tables
  } as ResidentFormData;
};

/**
 * Format household data for select options
 * Replaces the inconsistent formatting functions
 */
export const formatHouseholdOption = (
  household: HouseholdData,
  headResident?: HouseholdHead
): HouseholdOption => {
  const addressParts = [
    household.house_number,
    household.geo_streets?.[0]?.name,
    household.geo_subdivisions?.[0]?.name,
  ].filter(Boolean);

  const address = addressParts.length > 0 ? addressParts.join(', ') : 'No address';

  const headName = headResident
    ? [headResident.first_name, headResident.middle_name, headResident.last_name]
        .filter(Boolean)
        .join(' ')
    : 'No head assigned';

  return {
    value: household.code,
    label: `Household #${household.code}`,
    description: `${headName} - ${address}`,
    code: household.code,
    head_name: headName,
    address: address,
  };
};

/**
 * Format PSOC data for select options
 */
export const formatPsocOption = (psocData: RawPsocData): PsocOption => {
  // Format hierarchical display for main label
  let displayLabel = psocData.title;
  if (psocData.hierarchy && psocData.hierarchy !== psocData.title) {
    // Extract parent hierarchy (everything before the last " > ")
    const hierarchyParts = psocData.hierarchy.split(' > ');
    if (hierarchyParts.length > 1) {
      const mainTitle = hierarchyParts[hierarchyParts.length - 1];
      const parentHierarchy = hierarchyParts.slice(0, -1).join(' > ');
      displayLabel = `${mainTitle}, ${parentHierarchy}`;
    }
  }

  return {
    value: psocData.code,
    label: displayLabel,
    description: psocData.hierarchy || psocData.full_hierarchy || psocData.title,
    level_type: psocData.level,
    occupation_code: psocData.code,
    occupation_category: psocData.level_name || psocData.level,
  };
};

/**
 * Format PSGC data for select options
 */
export const formatPsgcOption = (psgcData: RawPsgcData): PsgcOption => {
  return {
    value: psgcData.code || psgcData.city_code || psgcData.province_code || '',
    label: psgcData.name || psgcData.city_name || psgcData.province_name || '',
    description: psgcData.full_address || psgcData.full_hierarchy,
    level: psgcData.level,
    full_hierarchy: psgcData.full_address || psgcData.full_hierarchy,
    geographic_level: psgcData.level,
  };
};

/**
 * Format mother's maiden name consistently
 */
export const formatMotherMaidenName = (mother: {
  mother_maiden_first?: string;
  motherMaidenFirstName?: string;
  mother_maiden_middle?: string;
  motherMaidenMiddleName?: string;
  mother_maiden_last?: string;
  motherMaidenLastName?: string;
}): string => {
  const firstName = mother.mother_maiden_first || mother.motherMaidenFirstName || '';
  const middleName = mother.mother_maiden_middle || mother.motherMaidenMiddleName || '';
  const lastName = mother.mother_maiden_last || mother.motherMaidenLastName || '';

  return [firstName, middleName, lastName].filter(Boolean).join(' ');
};

/**
 * Format enum values for display
 */
export const formatEnumValue = (value: string | undefined): string => {
  if (!value) return 'N/A';
  return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Format boolean values for display
 */
export const formatBoolean = (value: boolean | undefined): string => {
  if (value === undefined || value === null) return 'N/A';
  return value ? 'Yes' : 'No';
};

/**
 * Field mapping for validation errors
 * Maps between form field names and schema field names
 */
export const getFormToSchemaFieldMapping = (): Record<string, string> => ({
  // All fields now use snake_case consistently
  first_name: 'first_name',
  middle_name: 'middle_name',
  last_name: 'last_name',
  extension_name: 'extension_name',
  mobile_number: 'mobile_number',
  civil_status: 'civil_status',
  telephone_number: 'telephone_number',
  birth_place_code: 'birth_place_code',
  philsys_card_number: 'philsys_card_number',
  education_attainment: 'education_attainment',
  is_graduate: 'is_graduate',
  employment_status: 'employment_status',
  occupation_code: 'occupation_code',
  household_code: 'household_code',
  mother_maiden_first: 'mother_maiden_first',
  mother_maiden_middle: 'mother_maiden_middle',
  mother_maiden_last: 'mother_maiden_last',
  religion_others_specify: 'religion_others_specify',
  civil_status_others_specify: 'civil_status_others_specify',
  last_voted_date: 'last_voted_date',
  is_voter: 'is_voter',
  is_resident_voter: 'is_resident_voter',
  blood_type: 'blood_type',
});

/**
 * Reverse mapping for displaying validation errors on form fields
 */
export const getSchemaToFormFieldMapping = (): Record<string, string> => {
  const formToSchema = getFormToSchemaFieldMapping();
  return Object.entries(formToSchema).reduce(
    (acc, [formField, schemaField]) => {
      acc[schemaField] = formField;
      return acc;
    },
    {} as Record<string, string>
  );
};

// Re-export consolidated utilities to maintain existing API
export { calculateAge, formatFullName, parseFullName };
