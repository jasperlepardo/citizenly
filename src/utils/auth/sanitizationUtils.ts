/**
 * Sanitization Utilities
 * CONSOLIDATED - Single source of truth for input sanitization
 * Philippine government-grade input sanitization following BSP Circular 808 and NIST standards
 * Database schema aligned - PhilSys format: 12 digits (VARCHAR(20))
 */

import DOMPurify from 'isomorphic-dompurify';

import type { SanitizationOptions } from '@/types/shared/utilities/utilities';

// Note: DEFAULT_FIELD_TYPE_MAPPING removed - unused

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

// Note: sanitizeHtml removed - unused

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
    allowedChars: /[a-zA-ZÀ-ÿ\s\-'.]/,
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
  const nameRegex = /^[a-zA-ZÀ-ÿ\s\-'.]{1,100}$/;
  return nameRegex.test(name) && name.trim().length > 0;
}

// Note: sanitizePhilSysNumber removed - unused

/**
 * Validate PhilSys card number format
 * CORRECT: 12 digits in XXXX-XXXX-XXXX format
 */
export function validatePhilSysFormat(philsysNumber: string): boolean {
  const philsysRegex = /^\d{4}-\d{4}-\d{4}$/;
  return philsysRegex.test(philsysNumber);
}

// Note: sanitizePhone removed - unused

// Note: sanitizeMobileNumber removed - unused

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
// Note: sanitizeEmail removed - unused

// Note: validateEmailFormat removed - unused

// Note: sanitizeBarangayCode removed - unused

/**
 * Validate PSGC (Philippine Standard Geographic Code)
 */
export function validatePSGC(code: string): boolean {
  const psgcRegex = /^\d{9,10}$/;
  return psgcRegex.test(code);
}

// Note: sanitizeSearchQuery removed - unused

// Note: sanitizeByType removed - unused

// Note: sanitizeObjectByFieldTypes removed - unused

// Note: sanitizeObject removed - unused

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

/**
 * Sanitize name input for Philippine names (supports Filipino naming patterns)
 * Alias for sanitizeName to maintain compatibility
 */
export function sanitizeNameInput(input: string | null): string {
  return sanitizeName(input || '');
}
