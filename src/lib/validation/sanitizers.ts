/**
 * Input Sanitizers
 * Security-focused input sanitization functions
 */

import type { SanitizationOptions } from './types';

/**
 * Sanitize general input with configurable options
 */
export function sanitizeInput(input: string, options: SanitizationOptions = {}): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input;

  // Normalize unicode characters
  if (options.normalizeUnicode !== false) {
    sanitized = sanitized.normalize('NFC');
  }

  // Trim whitespace
  if (options.trimWhitespace !== false) {
    sanitized = sanitized.trim();
  }

  // Strip HTML tags
  if (options.stripHtml) {
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  }

  // Escape HTML entities
  if (options.escapeHtml) {
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Filter allowed characters
  if (options.allowedChars) {
    sanitized = sanitized.replace(new RegExp(`[^${options.allowedChars.source}]`, 'g'), '');
  }

  // Enforce max length
  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
  }

  return sanitized;
}

/**
 * Sanitize HTML content (allows safe HTML tags)
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Remove dangerous tags and attributes
  const dangerous = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi,
    /on\w+\s*=/gi, // Event handlers
    /javascript:/gi,
    /data:/gi,
    /vbscript:/gi,
  ];

  let sanitized = html;
  dangerous.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  return sanitized.trim();
}

/**
 * Sanitize PhilSys number (remove non-digits, format)
 */
export function sanitizePhilSysNumber(philsys: string): string {
  if (!philsys || typeof philsys !== 'string') {
    return '';
  }

  // Remove all non-digit characters
  const digitsOnly = philsys.replace(/\D/g, '');

  // Format as XXXX-XXXX-XXXX-XXXX if 16 digits
  if (digitsOnly.length === 16) {
    return `${digitsOnly.slice(0, 4)}-${digitsOnly.slice(4, 8)}-${digitsOnly.slice(8, 12)}-${digitsOnly.slice(12, 16)}`;
  }

  return digitsOnly;
}

/**
 * Sanitize name (letters, spaces, common name characters)
 */
export function sanitizeName(name: string): string {
  if (!name || typeof name !== 'string') {
    return '';
  }

  return (
    sanitizeInput(name, {
      allowedChars: /a-zA-Z\s\-'\.]/,
      maxLength: 100,
      trimWhitespace: true,
    })
      // Remove multiple spaces
      .replace(/\s+/g, ' ')
      // Remove leading/trailing hyphens, apostrophes, periods
      .replace(/^[\-'\.]+|[\-'\.]+$/g, '')
      // Capitalize first letter of each word
      .replace(/\b\w/g, char => char.toUpperCase())
  );
}

/**
 * Sanitize phone number (digits, +, parentheses, hyphens, spaces)
 */
export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  return sanitizeInput(phone, {
    allowedChars: /0-9\+\-\(\)\s]/,
    maxLength: 20,
    trimWhitespace: true,
  });
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }

  return sanitizeInput(email, {
    allowedChars: /a-zA-Z0-9@\.\-_\+]/,
    maxLength: 254, // RFC 5321 limit
    trimWhitespace: true,
  }).toLowerCase();
}

/**
 * Sanitize URL
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  // Basic URL sanitization
  const sanitized = sanitizeInput(url, {
    trimWhitespace: true,
    maxLength: 2048,
  });

  // Ensure safe protocols
  const safeProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
  try {
    const urlObj = new URL(sanitized);
    if (!safeProtocols.includes(urlObj.protocol)) {
      return '';
    }
  } catch {
    // Not a valid URL
    return '';
  }

  return sanitized;
}

/**
 * Sanitize text content (remove control characters, normalize whitespace)
 */
export function sanitizeText(text: string, maxLength?: number): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return (
    sanitizeInput(text, {
      trimWhitespace: true,
      stripHtml: true,
      maxLength,
      normalizeUnicode: true,
    })
      // Remove control characters except newlines and tabs
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
  );
}

/**
 * Sanitize search query (prevent injection attacks)
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') {
    return '';
  }

  return (
    sanitizeInput(query, {
      trimWhitespace: true,
      maxLength: 100,
      stripHtml: true,
    })
      // Remove SQL injection patterns
      .replace(/['";\\]/g, '')
      // Remove script injection patterns
      .replace(/<script|javascript:|data:/gi, '')
      // Remove excessive wildcards
      .replace(/[*%]{3,}/g, '**')
  );
}

/**
 * Sanitize file name (safe for filesystem)
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName || typeof fileName !== 'string') {
    return '';
  }

  return (
    sanitizeInput(fileName, {
      allowedChars: /a-zA-Z0-9\.\-_\s]/,
      maxLength: 255,
      trimWhitespace: true,
    })
      // Remove dangerous file extensions
      .replace(/\.(exe|bat|cmd|scr|pif|com|jar|sh|ps1|vbs)$/i, '.txt')
      // Remove directory traversal
      .replace(/\.\./g, '')
      // Remove leading dots (hidden files)
      .replace(/^\.+/, '')
      // Replace spaces with underscores
      .replace(/\s+/g, '_')
      // Remove multiple dots
      .replace(/\.{2,}/g, '.')
  );
}

/**
 * Sanitize database input (prevent SQL injection)
 */
export function sanitizeDatabaseInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return (
    sanitizeInput(input, {
      trimWhitespace: true,
      escapeHtml: false, // Don't escape HTML for database
    })
      // Remove SQL injection patterns
      .replace(/['"\\;]/g, '')
      // Remove SQL keywords in dangerous contexts
      .replace(/\b(DROP|DELETE|INSERT|UPDATE|SELECT|UNION|EXEC|EXECUTE)\b/gi, '')
      // Remove comment patterns
      .replace(/--|\*\/|\*|\/\*/g, '')
  );
}

/**
 * Sanitize JSON input (prevent JSON injection)
 */
export function sanitizeJsonInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return (
    sanitizeInput(input, {
      trimWhitespace: true,
      stripHtml: true,
    })
      // Remove dangerous JSON patterns
      .replace(/\\"|\\'|\\x|\\u/g, '')
      // Remove function calls
      .replace(/\(\s*\)/g, '')
  );
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
