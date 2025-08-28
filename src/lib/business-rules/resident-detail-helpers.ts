/**
 * Resident Detail Helper Functions
 *
 * @description Utility functions for resident detail view formatting
 * @author Citizenly Development Team
 * @version 1.0.0
 */

import { ResidentRecord as Resident } from '@/types';
import { formatDate as libFormatDate } from '@/utils/data-transformers';

/**
 * Formats resident's full name from individual name components with proper spacing
 *
 * @param resident - Resident object containing name fields (first_name, middle_name, last_name, extension_name)
 * @returns Formatted full name string with components separated by spaces, or '-' if resident is null/undefined
 *
 * @example
 * ```typescript
 * const resident = {
 *   first_name: 'Juan',
 *   middle_name: 'Santos',
 *   last_name: 'Dela Cruz',
 *   extension_name: 'Jr.'
 * };
 * const fullName = formatFullName(resident);
 * // Returns: "Juan Santos Dela Cruz Jr."
 *
 * const emptyName = formatFullName(null);
 * // Returns: "-"
 * ```
 */
export const formatResidentDetailFullName = (resident: Resident): string => {
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
 * Formats date string with fallback handling for resident data
 * Uses the centralized formatDate function from lib/utils for consistency
 *
 * @param dateString - ISO date string to format
 * @returns Formatted date string using Philippine locale, or '-' if invalid
 *
 * @example
 * ```typescript
 * const formattedDate = formatDate('2023-01-15T00:00:00Z');
 * // Returns: "January 15, 2023"
 *
 * const emptyDate = formatDate('');
 * // Returns: "-"
 * ```
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  try {
    return libFormatDate(dateString, { dateStyle: 'long' });
  } catch {
    return '-';
  }
};

/**
 * Calculates age from birthdate using precise date arithmetic
 *
 * @param birthdate - ISO date string of birth date (YYYY-MM-DD format)
 * @returns Age in years as number, or '-' as string if birthdate is invalid or empty
 *
 * @throws {Error} When birthdate string cannot be parsed as valid date
 *
 * @example
 * ```typescript
 * const age = calculateAge('1990-01-15T00:00:00Z');
 * // Returns: 34 (assuming current year is 2024)
 *
 * const invalidAge = calculateAge('');
 * // Returns: '-'
 *
 * const invalidAge2 = calculateAge('invalid-date');
 * // Returns: '-'
 * ```
 */
export const calculateAge = (birthdate: string): number | string => {
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
