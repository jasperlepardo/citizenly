/**
 * Sanitization Utilities
 * CONSOLIDATED - Single source of truth for input sanitization
 * Philippine government-grade input sanitization following BSP Circular 808 and NIST standards
 * Database schema aligned - PhilSys format: 12 digits (VARCHAR(20))
 */

import DOMPurify from 'isomorphic-dompurify';

import type { SanitizationType, SanitizationOptions } from '@/types/utilities';

/**
 * Default field type mapping for intelligent sanitization
 * Aligned with database schema constraints
 */
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
 * Consolidated from multiple implementations across lib and utils
 */
export function sanitizeInput(input: string | null, options: SanitizationOptions = {}): string {
  if (!input) return '';

  // Early length check to avoid unnecessary processing
  if (options.maxLength && input.length > options.maxLength * 2) {
    input = input.substring(0, options.maxLength * 2);
  }

  let result: string;

  // Remove potentially dangerous characters and scripts
  result = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/expression\s*\(/gi, '');

  // Apply options
  if (options.normalizeUnicode !== false) {
    result = result.normalize('NFC');
  }

  if (options.trim !== false) {
    result = result.trim();
  }

  if (options.removeHtml !== false) {
    result = result.replace(/<[^>]*>/g, '');
  }

  if (options.removeScripts !== false) {
    result = result
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  if (options.allowedChars && options.allowedChars instanceof RegExp) {
    result = result.replace(new RegExp(`[^${options.allowedChars.source}]`, 'g'), '');
  }

  if (options.maxLength && result.length > options.maxLength) {
    result = result.substring(0, options.maxLength);
  }

  // Use DOMPurify for additional sanitization
  return DOMPurify.sanitize(result, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }).trim();
}

/**
 * Sanitize HTML content while allowing safe tags
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Remove dangerous patterns that could bypass DOMPurify
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi,
    /data:/gi,
    /expression\s*\(/gi,
    /<iframe\b[^>]*>/gi,
    /<object\b[^>]*>/gi,
    /<embed\b[^>]*>/gi,
    /<link\b[^>]*>/gi,
    /<meta\b[^>]*>/gi,
  ];

  let sanitized = html;
  dangerousPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  return sanitized.trim();
}

/**
 * Sanitize name input for Philippine names
 * Supports Filipino naming patterns, Spanish influences, and indigenous names
 * Database constraint: VARCHAR(100)
 */
export function sanitizeName(name: string): string {
  if (!name || typeof name !== 'string') {
    return '';
  }

  return sanitizeInput(name, {
    allowedChars: /[a-zA-ZÀ-ÿñÑ\s\-'.]/,
    maxLength: 100,
    normalizeUnicode: true,
    trim: true,
  });
}

/**
 * Validate name input format
 */
export function validateNameInput(name: string): boolean {
  // Philippine name validation pattern
  // Supports: Juan, María José, Rizal y López, O'Connor, Dela Cruz Jr.
  const nameRegex = /^[a-zA-ZÀ-ÿñÑ\s\-'.]{1,100}$/;
  return nameRegex.test(name) && name.trim().length > 0;
}

/**
 * Sanitize PhilSys card number format
 * CORRECT FORMAT: 12 digits formatted as XXXX-XXXX-XXXX
 * Database constraint: VARCHAR(20)
 */
export function sanitizePhilSysNumber(input: string | null): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove all non-digits and format properly
  const digitsOnly = input.replace(/\D/g, '');

  // Validate length (PhilSys is 12 digits, not 16!)
  if (digitsOnly.length !== 12) {
    return '';
  }

  // Format as XXXX-XXXX-XXXX (14 characters with dashes)
  return `${digitsOnly.substring(0, 4)}-${digitsOnly.substring(4, 8)}-${digitsOnly.substring(8, 12)}`;
}

/**
 * Validate PhilSys card number format
 * CORRECT: 12 digits in XXXX-XXXX-XXXX format
 */
export function validatePhilSysFormat(philsysNumber: string): boolean {
  const philsysRegex = /^\d{4}-\d{4}-\d{4}$/;
  return philsysRegex.test(philsysNumber);
}

/**
 * Sanitize mobile number for Philippine format
 */
export function sanitizePhone(input: string | null): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return sanitizeInput(input, {
    allowedChars: /[0-9+\-\s()]/,
    maxLength: 20,
    normalizeUnicode: false,
    removeHtml: true,
  });
}

/**
 * Sanitize mobile number for Philippine format with proper formatting
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
export function sanitizeEmail(email: string | null): string {
  if (!email || typeof email !== 'string') {
    return '';
  }

  return sanitizeInput(email.toLowerCase(), {
    allowedChars: /[a-zA-Z0-9@._-]/,
    maxLength: 254, // RFC 5321 limit
    normalizeUnicode: false,
    removeHtml: true,
  });
}

/**
 * Validate email format
 */
export function validateEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Sanitize PSGC codes (barangay codes)
 * Barangay codes are typically 9-10 digit numbers
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
 * Sanitize search query
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') {
    return '';
  }

  return sanitizeInput(query, {
    allowedChars: /[a-zA-Z0-9À-ÿñÑ\s\-'.]/,
    maxLength: 100,
    normalizeUnicode: true,
    trim: true,
  });
}

/**
 * Generic sanitization function with configurable type-specific processing
 * CONSOLIDATED from multiple implementations
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
      result = sanitizeInput(input, options);
      break;

    case 'name':
      result = sanitizeName(input);
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
      result = sanitizeInput(input, options);
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
 * Deep sanitize object (recursively sanitize all string values)
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  options: SanitizationOptions = {}
): T {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const sanitized = { ...obj };

  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === 'string') {
      (sanitized as any)[key] = sanitizeInput(value, options);
    } else if (Array.isArray(value)) {
      (sanitized as any)[key] = value.map(item =>
        typeof item === 'string' ? sanitizeInput(item, options) : item
      );
    } else if (value && typeof value === 'object') {
      (sanitized as any)[key] = sanitizeObject(value, options);
    }
  }

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
