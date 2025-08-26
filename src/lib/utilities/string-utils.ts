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
