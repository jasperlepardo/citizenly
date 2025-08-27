/**
 * String Utility Functions
 * Consolidated string manipulation and validation utilities
 */

/**
 * Capitalize first letter of string
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert string to title case
 */
export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, length: number, suffix = '...'): string {
  if (text.length <= length) return text;
  return text.substring(0, length - suffix.length) + suffix;
}

/**
 * Truncate string with ellipsis (shorter alias)
 */
export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + '...' : str;
}

/**
 * Sanitize string for safe usage
 */
export function sanitizeString(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}

// REMOVED: isValidEmail - Use @/lib/validation/utilities instead
// The validation version has better null checking and error handling

// REMOVED: isValidPhilippineMobile - Use @/lib/validation/utilities instead
// The validation version has better null checking and error handling

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone?: string): string {
  if (!phone) return 'No phone';

  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.startsWith('63')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }

  if (cleaned.startsWith('09')) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }

  return phone;
}

/**
 * Format full name from parts
 * Handles both snake_case and camelCase field names
 */
export function formatFullName(person: {
  first_name?: string;
  firstName?: string;
  middle_name?: string;
  middleName?: string;
  last_name?: string;
  lastName?: string;
  extension_name?: string;
  extensionName?: string;
}): string {
  const firstName = person.first_name || person.firstName || '';
  const middleName = person.middle_name || person.middleName || '';
  const lastName = person.last_name || person.lastName || '';
  const extensionName = person.extension_name || person.extensionName || '';
  
  const parts = [firstName, middleName, lastName, extensionName].filter(Boolean);
  return parts.join(' ').trim() || '';
}

/**
 * Parse full name into parts
 */
export function parseFullName(fullName: string): {
  first_name: string;
  middle_name: string;
  last_name: string;
  extension_name?: string;
} {
  if (!fullName?.trim()) {
    return { first_name: '', middle_name: '', last_name: '' };
  }
  
  const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
  
  switch (nameParts.length) {
    case 0:
      return { first_name: '', middle_name: '', last_name: '' };
    case 1:
      return { first_name: nameParts[0], middle_name: '', last_name: '' };
    case 2:
      return { first_name: nameParts[0], middle_name: '', last_name: nameParts[1] };
    case 3:
      return { first_name: nameParts[0], middle_name: nameParts[1], last_name: nameParts[2] };
    default:
      // 4 or more parts - assume last part might be extension if it's short
      const lastPart = nameParts[nameParts.length - 1];
      const isExtension = lastPart.length <= 3 || ['Jr', 'Jr.', 'Sr', 'Sr.', 'III', 'II', 'IV'].includes(lastPart);
      
      if (isExtension) {
        return {
          first_name: nameParts[0],
          middle_name: nameParts.slice(1, -2).join(' '),
          last_name: nameParts[nameParts.length - 2],
          extension_name: lastPart,
        };
      } else {
        return {
          first_name: nameParts[0],
          middle_name: nameParts.slice(1, -1).join(' '),
          last_name: lastPart,
        };
      }
  }
}
