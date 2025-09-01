/**
 * Input Sanitization Utilities
 * Philippine government-grade input sanitization following BSP Circular 808 and NIST standards.
 */

import DOMPurify from 'isomorphic-dompurify';

// Types moved to src/types/utilities.ts for consolidation
import type { SanitizationType, SanitizationOptions } from '@/types/shared/utilities/utilities';

const DEFAULT_FIELD_TYPE_MAPPING: Readonly<Record<string, SanitizationType>> = {
  first_name: 'name',
  middle_name: 'name',
  last_name: 'name',
  extension_name: 'name',
  mother_maiden_first: 'name',
  mother_maiden_middle: 'name',
  mother_maiden_last: 'name',
  email: 'email',
  mobile_number: 'mobile',
  telephone_number: 'text',
  philsys_card_number: 'philsys',
  region_code: 'psgc',
  province_code: 'psgc',
  city_municipality_code: 'psgc',
  barangay_code: 'psgc',
  height: 'numeric',
  weight: 'numeric',
} as const;

/**
 * Sanitize general input to prevent XSS and injection attacks
 */
export function sanitizeInput(input: string | null): string {
  if (!input) return '';

  // Remove potentially dangerous characters and scripts
  const cleaned = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/expression\s*\(/gi, '');

  // Use DOMPurify for additional sanitization
  return DOMPurify.sanitize(cleaned, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }).trim();
}

/**
 * Sanitize name input for Philippine names (supports Filipino naming patterns)
 */
export function sanitizeNameInput(input: string | null): string {
  if (!input) return '';

  // Allow letters, spaces, hyphens, apostrophes, and periods for Filipino names
  // Includes support for Spanish-influenced names and indigenous names
  return input
    .replace(/[^a-zA-ZÀ-ÿ\s\-'.]/g, '') // Include Spanish characters
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()
    .substring(0, 100); // Limit length per government standards
}

/**
 * Validate name input format
 */
export function validateNameInput(name: string): boolean {
  // Philippine name validation pattern
  // Supports: Juan, María José, Rizal y López, O'Connor, Dela Cruz Jr.
  const nameRegex = /^[a-zA-ZÀ-ÿ\s\-'.]{1,100}$/;
  return nameRegex.test(name) && name.trim().length > 0;
}

/**
 * Sanitize PhilSys card number format
 */
export function sanitizePhilSysNumber(input: string | null): string {
  if (!input) return '';

  // Remove all non-digits and format properly
  const digitsOnly = input.replace(/\D/g, '');

  // Validate length (PhilSys is 12 digits)
  if (digitsOnly.length !== 12) return '';

  // Format as XXXX-XXXX-XXXX
  return `${digitsOnly.substring(0, 4)}-${digitsOnly.substring(4, 8)}-${digitsOnly.substring(8, 12)}`;
}

/**
 * Validate PhilSys card number format
 */
// validatePhilSysFormat moved to sanitization-utils.ts - removed duplicate

/**
 * Sanitize mobile number for Philippine format
 */
export function sanitizeMobileNumber(input: string | null): string {
  if (!input) return '';

  // Remove all non-digits
  const digitsOnly = input.replace(/\D/g, '');

  // Handle different Philippine mobile number formats
  if (digitsOnly.startsWith('63')) {
    // +63 format
    return `+${digitsOnly}`;
  } else if (digitsOnly.startsWith('0')) {
    // 0xxx format - convert to +63
    return `+63${digitsOnly.substring(1)}`;
  } else if (digitsOnly.length === 10) {
    // xxx format - add +63
    return `+63${digitsOnly}`;
  }

  return input.trim();
}

/**
 * Validate Philippine mobile number format
 */
export function validatePhilippineMobile(mobile: string): boolean {
  // Philippine mobile number patterns
  const mobileRegex = /^(\+63|0)[89]\d{9}$/;
  return mobileRegex.test(mobile.replace(/\s/g, ''));
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(input: string | null): string {
  if (!input) return '';

  return input
    .toLowerCase()
    .replace(/[<>"'&]/g, '') // Remove dangerous characters
    .trim()
    .substring(0, 254); // RFC 5321 limit
}

/**
 * Validate email format
 */
export function validateEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Sanitize barangay code
 */
export function sanitizeBarangayCode(input: string | null): string {
  if (!input) return '';

  // Barangay codes are typically 9-10 digit numbers
  const digitsOnly = input.replace(/\D/g, '');
  return digitsOnly.substring(0, 10);
}

/**
 * Validate PSGC (Philippine Standard Geographic Code)
 */
export function validatePSGC(code: string): boolean {
  const psgcRegex = /^\d{9,10}$/;
  return psgcRegex.test(code);
}

/**
 * Generic sanitization function with configurable type-specific processing
 * Consolidates all sanitization logic into a single, flexible function
 *
 * @param input - Raw input string that may contain unsafe content
 * @param type - Sanitization type determining processing rules
 * @param options - Additional configuration for sanitization behavior
 * @returns Sanitized string safe for storage and display
 *
 * @example
 * ```typescript
 * // Basic text sanitization with XSS protection
 * const clean = sanitizeByType('<script>alert("xss")</script>', 'text');
 *
 * // Name sanitization with Filipino character support
 * const name = sanitizeByType('José María', 'name');
 *
 * // Custom options for length limiting
 * const limited = sanitizeByType('Very long text...', 'text', { maxLength: 50 });
 * ```
 *
 * @since 2025.1.0
 * @security Philippine BSP Circular 808 compliant
 * @performance Early exit patterns for optimal performance
 */
export function sanitizeByType(
  input: string | null,
  type: SanitizationType,
  options: SanitizationOptions = {}
): string {
  // Handle null/empty inputs - early exit for performance
  if (!input) {
    return '';
  }

  // No sanitization - pass through for maximum performance
  if (type === 'none') {
    return input;
  }

  // Early length check to avoid unnecessary processing
  if (options.maxLength && input.length > options.maxLength * 2) {
    input = input.substring(0, options.maxLength * 2);
  }

  let result: string;

  // Apply type-specific sanitization
  switch (type) {
    case 'text':
      result = sanitizeInput(input);
      break;

    case 'name':
      result = sanitizeNameInput(input);
      break;

    case 'email':
      result = sanitizeEmail(input);
      break;

    case 'mobile':
      result = sanitizeMobileNumber(input);
      break;

    case 'philsys':
      result = sanitizePhilSysNumber(input);
      break;

    case 'psgc':
      result = sanitizeBarangayCode(input);
      break;

    case 'numeric':
      result = input.replace(/[^\d]/g, '');
      break;

    default:
      result = sanitizeInput(input);
  }

  // Apply additional options
  if (options.maxLength && result.length > options.maxLength) {
    result = result.substring(0, options.maxLength);
  }

  if (options.customPattern && !options.customPattern.test(result)) {
    result = options.replacement || '';
  }

  return result;
}

/**
 * Enhanced sanitization function for objects with field-specific rules
 * Provides intelligent sanitization based on field names and patterns
 */
export function sanitizeObjectByFieldTypes(
  data: Record<string, any>,
  fieldTypeMap?: Record<string, SanitizationType>
): Record<string, any> {
  // Early exit for empty objects
  if (!data || Object.keys(data).length === 0) {
    return {};
  }

  const sanitized: Record<string, any> = {};

  // Use cached field types for performance
  const fieldTypes = fieldTypeMap
    ? { ...DEFAULT_FIELD_TYPE_MAPPING, ...fieldTypeMap }
    : DEFAULT_FIELD_TYPE_MAPPING;

  // Optimized iteration using for...in for better performance
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const value = data[key];
      if (typeof value === 'string' && value.length > 0) {
        const sanitizationType = fieldTypes[key] || 'text';
        sanitized[key] = sanitizeByType(value, sanitizationType);
      } else {
        sanitized[key] = value;
      }
    }
  }

  return sanitized;
}

/**
 * Sanitize form data object
 * @deprecated Use sanitizeObjectByFieldTypes for better type safety
 */
export function sanitizeFormData(formData: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};

  Object.entries(formData).forEach(([key, value]) => {
    if (typeof value === 'string') {
      switch (key) {
        case 'first_name':
        case 'middle_name':
        case 'last_name':
        case 'extension_name':
        case 'mother_maiden_first':
        case 'mother_maiden_middle':
        case 'mother_maiden_last':
          sanitized[key] = sanitizeNameInput(value);
          break;

        case 'philsys_card_number':
          sanitized[key] = sanitizePhilSysNumber(value);
          break;

        case 'mobile_number':
        case 'telephone_number':
          sanitized[key] = sanitizeMobileNumber(value);
          break;

        case 'email':
          sanitized[key] = sanitizeEmail(value);
          break;

        case 'region_code':
        case 'province_code':
        case 'city_municipality_code':
        case 'barangay_code':
          sanitized[key] = sanitizeBarangayCode(value);
          break;

        case 'household_code':
          // Household codes have format like 042114014-0000-0001-0001, preserve dashes
          sanitized[key] = sanitizeInput(value);
          break;

        default:
          sanitized[key] = sanitizeInput(value);
      }
    } else {
      sanitized[key] = value;
    }
  });

  return sanitized;
}

/**
 * Rate limiting utility for form submissions
 */
const submissionAttempts = new Map<string, { count: number; lastAttempt: number }>();

export function checkRateLimit(identifier: string, maxAttempts = 5, windowMs = 300000): boolean {
  const now = Date.now();
  const attempts = submissionAttempts.get(identifier);

  if (!attempts || now - attempts.lastAttempt > windowMs) {
    submissionAttempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }

  if (attempts.count >= maxAttempts) {
    return false;
  }

  attempts.count++;
  attempts.lastAttempt = now;
  submissionAttempts.set(identifier, attempts);

  return true;
}

/**
 * Clear rate limit for a specific identifier (development/admin use)
 */
export function clearRateLimit(identifier: string): void {
  submissionAttempts.delete(identifier);
}

/**
 * Get current rate limit status for debugging
 */
export function getRateLimitStatus(identifier: string): {
  hasAttempts: boolean;
  count?: number;
  lastAttempt?: Date;
  remainingTime?: number;
} {
  const attempts = submissionAttempts.get(identifier);

  if (!attempts) {
    return { hasAttempts: false };
  }

  const now = Date.now();
  const remainingTime = Math.max(0, 300000 - (now - attempts.lastAttempt));

  return {
    hasAttempts: true,
    count: attempts.count,
    lastAttempt: new Date(attempts.lastAttempt),
    remainingTime,
  };
}
