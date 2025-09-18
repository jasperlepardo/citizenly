/**
 * Resident Display Helper Functions
 * 
 * @description Consolidated utility functions for formatting resident data across all views
 * @author Citizenly Development Team
 * @version 2.0.0
 */

import { ResidentRecord } from '@/types/infrastructure/database/database';

/**
 * Formats resident's full name from individual name components with proper spacing
 * Used across detail views, listing views, and forms
 *
 * @param resident - Resident object containing name fields
 * @returns Formatted full name string with components separated by spaces, or '-' if null
 *
 * @example
 * ```typescript
 * const resident = {
 *   first_name: 'Juan',
 *   middle_name: 'Santos',
 *   last_name: 'Dela Cruz',
 *   extension_name: 'Jr.'
 * };
 * const fullName = formatResidentFullName(resident);
 * // Returns: "Juan Santos Dela Cruz Jr."
 * ```
 */
export const formatResidentFullName = (resident: Partial<ResidentRecord> | null): string => {
  if (!resident) return '-';
  const parts = [
    resident.first_name,
    resident.middle_name,
    resident.last_name,
    resident.extension_name,
  ].filter(Boolean);
  return parts.join(' ') || '-';
};

/**
 * Formats resident's name in "Last, First MI" format for compact displays
 * Useful for tables and lists where space is limited
 */
export const formatResidentCompactName = (resident: Partial<ResidentRecord> | null): string => {
  if (!resident) return '-';
  
  const lastName = resident.last_name || '';
  const firstName = resident.first_name || '';
  const middleInitial = resident.middle_name ? resident.middle_name.charAt(0) + '.' : '';
  
  if (!lastName && !firstName) return '-';
  
  return `${lastName}, ${firstName} ${middleInitial}`.trim();
};



/**
 * Calculates age from birthdate using precise date arithmetic
 *
 * @param birthdate - ISO date string of birth date
 * @returns Age in years as number, or '-' as string if invalid
 */
export const calculateAge = (birthdate: string | null | undefined): number | string => {
  if (!birthdate) return '-';
  try {
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  } catch {
    return '-';
  }
};

/**
 * Formats contact information with fallback for missing data
 */
export const formatContactInfo = (
  mobileNumber?: string | null,
  email?: string | null
): string => {
  const contacts = [];
  if (mobileNumber) contacts.push(mobileNumber);
  if (email) contacts.push(email);
  return contacts.length > 0 ? contacts.join(' | ') : '-';
};

/**
 * Formats address from components
 */
export const formatAddress = (
  houseNumber?: string | null,
  street?: string | null,
  barangay?: string | null,
  city?: string | null
): string => {
  const parts = [houseNumber, street, barangay, city].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : '-';
};

/**
 * Get display-friendly sex/gender text
 */
export const formatSex = (sex: string | null | undefined): string => {
  if (!sex) return '-';
  const sexMap: Record<string, string> = {
    male: 'Male',
    female: 'Female',
    m: 'Male',
    f: 'Female',
  };
  return sexMap[sex.toLowerCase()] || sex;
};

/**
 * Get display-friendly civil status
 */
export const formatCivilStatus = (status: string | null | undefined): string => {
  if (!status) return '-';
  const statusMap: Record<string, string> = {
    single: 'Single',
    married: 'Married',
    widowed: 'Widowed',
    separated: 'Separated',
    divorced: 'Divorced',
    others: 'Others',
  };
  return statusMap[status.toLowerCase()] || status;
};