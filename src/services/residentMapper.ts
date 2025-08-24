/**
 * Centralized data mapping utilities for Resident module
 * Eliminates inconsistent mapping patterns across components
 */

import { 
  ResidentFormData, 
  ResidentApiData, 
  ResidentWithRelations,
  PsocOption,
  PsgcOption
} from '@/types';
import { 
  HouseholdData,
  HouseholdHead,
  HouseholdOption
} from '@/types';

/**
 * Map form data (camelCase) to API format (snake_case for database)
 * This is the definitive mapping - no more inconsistencies!
 */
export const mapFormToApi = (formData: ResidentFormData): ResidentApiData => {
  return {
    // Required fields
    first_name: formData.firstName,
    last_name: formData.lastName,
    birthdate: formData.birthdate,
    sex: formData.sex as 'male' | 'female',

    // Optional personal info
    middle_name: formData.middleName || undefined,
    extension_name: formData.extensionName || undefined,
    email: formData.email || undefined,
    mobile_number: formData.mobileNumber || undefined,
    telephone_number: formData.telephoneNumber || undefined, // Maps to telephone_number in DB
    civil_status: formData.civilStatus || undefined,
    civil_status_others_specify: formData.civilStatusOthersSpecify || undefined,
    citizenship: formData.citizenship || undefined,
    blood_type: formData.bloodType || undefined,
    ethnicity: formData.ethnicity || undefined,
    religion: formData.religion || undefined,
    religion_others_specify: formData.religionOthersSpecify || undefined,
    
    // Physical characteristics - convert strings to numbers for API
    height: formData.height ? parseFloat(formData.height) || undefined : undefined,
    weight: formData.weight ? parseFloat(formData.weight) || undefined : undefined,
    complexion: formData.complexion || undefined,
    
    // Documentation
    birth_place_code: formData.birthPlaceCode || undefined,
    philsys_card_number: formData.philsysCardNumber || undefined,
    
    // Family information
    mother_maiden_first: formData.motherMaidenFirstName || undefined,
    mother_maiden_middle: formData.motherMaidenMiddleName || undefined,
    mother_maiden_last: formData.motherMaidenLastName || undefined,
    
    // Education and employment
    education_attainment: formData.educationAttainment || undefined,
    is_graduate: formData.isGraduate || false,
    employment_status: formData.employmentStatus || undefined,
    occupation_code: formData.occupationCode || undefined, // Maps to occupation_code in DB
    
    // Voting information
    is_voter: formData.isVoter ?? undefined,
    is_resident_voter: formData.isResidentVoter ?? undefined,
    last_voted_date: formData.lastVotedDate || undefined,
    
    // Household
    household_code: formData.householdCode || undefined,
  };
};

/**
 * Map database record to form data
 * Used when loading existing resident for editing
 */
export const mapDatabaseToForm = (resident: ResidentWithRelations): ResidentFormData => {
  return {
    // Personal Information
    firstName: resident.first_name,
    middleName: resident.middle_name || '',
    lastName: resident.last_name,
    extensionName: resident.extension_name || '',
    sex: resident.sex,
    civilStatus: resident.civil_status || '',
    civilStatusOthersSpecify: resident.civil_status_others_specify || '',
    citizenship: resident.citizenship || 'filipino',
    birthdate: resident.birthdate,
    birthPlaceCode: resident.birth_place_code || '',
    philsysCardNumber: resident.philsys_card_number || '',
    educationAttainment: resident.education_attainment || '',
    isGraduate: resident.is_graduate || false,
    employmentStatus: resident.employment_status || '',
    occupationCode: resident.occupation_code || '', // Maps to occupation_code in DB
    ethnicity: resident.ethnicity || '',

    // Contact Information
    email: resident.email || '',
    telephoneNumber: resident.telephone_number || '', // Maps from telephone_number in DB
    mobileNumber: resident.mobile_number || '',
    householdCode: resident.household_code || '',
    
    // Physical Characteristics
    bloodType: resident.blood_type || '',
    complexion: resident.complexion || '',
    height: resident.height?.toString() || '',
    weight: resident.weight?.toString() || '',
    religion: resident.religion || '',
    religionOthersSpecify: resident.religion_others_specify || '',
    
    // Voting Information
    isVoter: resident.is_voter,
    isResidentVoter: resident.is_resident_voter,
    lastVotedDate: resident.last_voted_date || '',
    
    // Mother's Maiden Name
    motherMaidenFirstName: resident.mother_maiden_first || '',
    motherMaidenMiddleName: resident.mother_maiden_middle || '',
    motherMaidenLastName: resident.mother_maiden_last || '',
    
    // Note: Sectoral and migration information are handled separately
    // These should be fetched/stored via separate services and tables
  };
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
 * Raw PSOC data structure from database/API
 */
interface RawPsocData {
  code: string;
  title: string;
  level?: string;
  level_name?: string;
  hierarchy?: string;
  full_hierarchy?: string;
}

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
    occupation_title: psocData.title,
    hierarchy: psocData.hierarchy || psocData.full_hierarchy,
    badge: psocData.level_name || psocData.level || 'occupation',
  };
};

/**
 * Raw PSGC data structure from database/API
 */
interface RawPsgcData {
  code?: string;
  city_code?: string;
  province_code?: string;
  name?: string;
  city_name?: string;
  province_name?: string;
  level: string;
  full_address?: string;
  full_hierarchy?: string;
}

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
    code: psgcData.code || psgcData.city_code || psgcData.province_code || '',
  };
};

/**
 * Calculate age from birthdate
 * Centralized age calculation logic
 */
export const calculateAge = (birthdate: string): number => {
  if (!birthdate) return 0;
  
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Format full name consistently
 */
export const formatFullName = (person: {
  first_name?: string;
  firstName?: string;
  middle_name?: string;
  middleName?: string;
  last_name?: string;
  lastName?: string;
  extension_name?: string;
  extensionName?: string;
}): string => {
  const firstName = person.first_name || person.firstName || '';
  const middleName = person.middle_name || person.middleName || '';
  const lastName = person.last_name || person.lastName || '';
  const extensionName = person.extension_name || person.extensionName || '';
  
  return [firstName, middleName, lastName, extensionName]
    .filter(Boolean)
    .join(' ');
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
  
  return [firstName, middleName, lastName]
    .filter(Boolean)
    .join(' ');
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
 * Parse full name into components
 * Used for pre-filling forms from suggested names
 */
export const parseFullName = (fullName: string): {
  firstName: string;
  middleName: string;
  lastName: string;
} => {
  const nameParts = fullName.trim().split(/\s+/);
  
  if (nameParts.length === 1) {
    return {
      firstName: nameParts[0],
      middleName: '',
      lastName: '',
    };
  } else if (nameParts.length === 2) {
    return {
      firstName: nameParts[0],
      middleName: '',
      lastName: nameParts[1],
    };
  } else if (nameParts.length === 3) {
    return {
      firstName: nameParts[0],
      middleName: nameParts[1],
      lastName: nameParts[2],
    };
  } else {
    // For more than 3 parts, first name is first part, last name is last part, middle is everything in between
    return {
      firstName: nameParts[0],
      middleName: nameParts.slice(1, -1).join(' '),
      lastName: nameParts[nameParts.length - 1],
    };
  }
};

/**
 * Field mapping for validation errors
 * Maps between form field names and schema field names
 */
export const getFormToSchemaFieldMapping = (): Record<string, string> => ({
  firstName: 'first_name',
  middleName: 'middle_name',
  lastName: 'last_name',
  extensionName: 'extension_name',
  mobileNumber: 'mobile_number',
  civilStatus: 'civil_status',
  telephoneNumber: 'telephone_number',
  birthPlaceCode: 'birth_place_code',
  philsysCardNumber: 'philsys_card_number',
  educationAttainment: 'education_attainment',
  isGraduate: 'is_graduate',
  employmentStatus: 'employment_status',
  occupationCode: 'occupation_code',
  householdCode: 'household_code',
  motherMaidenFirstName: 'mother_maiden_first',
  motherMaidenMiddleName: 'mother_maiden_middle',
  motherMaidenLastName: 'mother_maiden_last',
  religionOthersSpecify: 'religion_others_specify',
  civilStatusOthersSpecify: 'civil_status_others_specify',
  lastVotedDate: 'last_voted_date',
  isVoter: 'is_voter',
  isResidentVoter: 'is_resident_voter',
});

/**
 * Reverse mapping for displaying validation errors on form fields
 */
export const getSchemaToFormFieldMapping = (): Record<string, string> => {
  const formToSchema = getFormToSchemaFieldMapping();
  return Object.entries(formToSchema).reduce((acc, [formField, schemaField]) => {
    acc[schemaField] = formField;
    return acc;
  }, {} as Record<string, string>);
};