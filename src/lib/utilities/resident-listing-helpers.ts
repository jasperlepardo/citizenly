/**
 * Resident Listing Helper Functions
 *
 * @description Utility functions for resident listing view formatting and operations
 * @author Citizenly Development Team
 * @version 1.0.0
 */

import { ResidentDatabaseRecord as ResidentListItem } from '@/types/residents';
import { formatDate as libFormatDate } from './dataTransformers';

/**
 * Formats resident's full name for display in listing views with proper spacing
 *
 * @param resident - ResidentListItem object containing name fields (first_name, middle_name, last_name, extension_name)
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
export const formatResidentListFullName = (resident: ResidentListItem): string => {
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
 * Formats date string for listing views with compact format
 * Uses the centralized formatDate function from lib/utils for consistency
 *
 * @param dateString - ISO date string to format
 * @returns Formatted date string in short format, or '-' if invalid
 *
 * @example
 * ```typescript
 * const formattedDate = formatDate('2023-01-15T00:00:00Z');
 * // Returns: "1/15/23" (compact format for listings)
 *
 * const emptyDate = formatDate('');
 * // Returns: "-"
 * ```
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  try {
    return libFormatDate(dateString, { dateStyle: 'short' });
  } catch {
    return '-';
  }
};

/**
 * Fetches residents data from API with search and pagination
 *
 * @param session - Active user session with access token
 * @param search - Optional search query to filter residents
 * @param pageNum - Page number to fetch (1-based indexing)
 * @returns Promise resolving to API response data with residents array
 *
 * @throws {Error} When API request fails or returns non-200 status
 * @throws {TypeError} When session is null or missing access_token
 *
 * @example
 * ```typescript
 * const session = { access_token: 'your-jwt-token' };
 * const data = await fetchResidents(session, 'john', 1);
 * // Returns: { residents: [...], total: 100, page: 1, limit: 10 }
 * ```
 */
export const fetchResidents = async (
  session: { access_token: string } | null,
  search?: string,
  pageNum = 1
): Promise<any> => {
  if (!session) return null;

  const params = new URLSearchParams({
    page: pageNum.toString(),
    limit: '10',
    ...(search && { search }),
  });

  const response = await fetch(`/api/residents?${params}`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch residents: ${response.status}`);
  }

  return response.json();
};
