/**
 * Pure utility functions for resident data processing
 * Domain layer - no infrastructure dependencies
 */

import { ResidentWithRelations } from '@/types/domain/residents/core';

/**
 * Initialize missing fields in resident data with default values
 * Ensures all expected fields are present for form consumption
 */
export const initializeResidentFields = (
  residentData: Partial<ResidentWithRelations>
): ResidentWithRelations => {
  // Set required fields with defaults if missing
  const baseData: ResidentWithRelations = {
    ...residentData,
    id: residentData.id || '',
    first_name: residentData.first_name || '',
    last_name: residentData.last_name || '',
    birthdate: residentData.birthdate || '',
    sex: residentData.sex || 'male',
    barangay_code: residentData.barangay_code || '',
    city_municipality_code: residentData.city_municipality_code || '',
    province_code: residentData.province_code ?? null,
    region_code: residentData.region_code || '',
    created_at: residentData.created_at || '',
    updated_at: residentData.updated_at || '',
    is_active: residentData.is_active ?? true,
    is_graduate: residentData.is_graduate ?? false,
    telephone_number: residentData.telephone_number || '',
    philsys_card_number: residentData.philsys_card_number || '',
    height: residentData.height || null,
    weight: residentData.weight || null,
    complexion: residentData.complexion || '',
    mother_maiden_first: residentData.mother_maiden_first || '',
    mother_maiden_middle: residentData.mother_maiden_middle || '',
    mother_maiden_last: residentData.mother_maiden_last || '',
  };

  return baseData;
};

/**
 * Get tooltip content for computed fields
 * Provides helpful explanations for auto-calculated values
 */
export const getComputedFieldTooltip = (field: string): string => {
  switch (field) {
    case 'is_employed':
      return `Automatically calculated from Employment Status. Includes: employed, self-employed`;
    case 'is_unemployed':
      return `Automatically calculated from Employment Status. Only when status is 'unemployed'`;
    case 'is_senior_citizen':
      return `Automatically calculated from Date of Birth. Senior citizen when age is 60 or above`;
    default:
      return 'This field is automatically calculated';
  }
};

/**
 * Calculate age from birthdate (pure business logic)
 */
export const calculateAge = (birthdate: string): number => {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

/**
 * Format full name from name components (pure business logic)
 */
export const formatFullName = (nameData: {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  extension_name?: string;
}): string => {
  const parts = [
    nameData.first_name,
    nameData.middle_name,
    nameData.last_name,
    nameData.extension_name
  ].filter(Boolean);
  return parts.join(' ');
};

/**
 * Validate PhilSys card number format (pure business logic)
 */
export const validatePhilSysFormat = (philsysNumber: string): boolean => {
  const pattern = /^\d{4}-\d{4}-\d{4}-\d{4}$/;
  return pattern.test(philsysNumber);
};

/**
 * Extract last 4 digits of PhilSys (pure business logic)
 */
export const extractPhilSysLast4 = (philsysNumber: string): string => {
  return philsysNumber.replace(/-/g, '').slice(-4);
};

/**
 * Determine sectoral classifications based on resident data (pure business logic)
 */
export const calculateSectoralFlags = (residentData: {
  birthdate?: string;
  employment_status?: string;
  pwd_details?: any;
  indigenous_group?: string;
}): {
  is_senior_citizen: boolean;
  is_minor: boolean;
  is_employed: boolean;
  is_unemployed: boolean;
  is_pwd: boolean;
  is_indigenous: boolean;
} => {
  const age = residentData.birthdate ? calculateAge(residentData.birthdate) : 0;
  
  return {
    is_senior_citizen: age >= 60,
    is_minor: age < 18,
    is_employed: ['employed', 'self-employed'].includes(residentData.employment_status || ''),
    is_unemployed: residentData.employment_status === 'unemployed',
    is_pwd: !!(residentData.pwd_details && Object.keys(residentData.pwd_details).length > 0),
    is_indigenous: !!(residentData.indigenous_group && residentData.indigenous_group.trim().length > 0),
  };
};