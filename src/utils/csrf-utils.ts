/**
 * CSRF Protection Utilities
 * Consolidated Cross-Site Request Forgery protection for forms
 */

import { randomBytes, createHash, timingSafeEqual } from 'crypto';
import type { CSRFToken } from '@/types/services';

const CSRF_SECRET = process.env.CSRF_SECRET;

function validateCSRFSecret() {
  if (!CSRF_SECRET && process.env.NODE_ENV === 'production') {
    throw new Error(
      'CSRF_SECRET environment variable must be set in production. Generate a secure random string of at least 32 characters.'
    );
  }
}

const SECRET =
  CSRF_SECRET ||
  (process.env.NODE_ENV !== 'production' ? 'dev-only-csrf-secret-do-not-use-in-production' : '');

const TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour in milliseconds

function toBase64Url(str: string): string {
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Generate a secure CSRF token
 */
export function generateCSRFToken(): CSRFToken {
  validateCSRFSecret();
  const timestamp = Date.now();
  const randomToken = toBase64Url(randomBytes(32).toString('base64'));

  const data = `${randomToken}:${timestamp}`;
  const signature = toBase64Url(
    createHash('sha256')
      .update(data + SECRET)
      .digest('base64')
  );

  return {
    token: randomToken,
    timestamp,
    signature,
  };
}

/**
 * Verify a CSRF token
 */
export function verifyCSRFToken(token: string, timestamp: number, signature: string): boolean {
  try {
    validateCSRFSecret();
    
    if (Date.now() - timestamp > TOKEN_EXPIRY) {
      console.warn('[CSRF] Token expired');
      return false;
    }

    const data = `${token}:${timestamp}`;
    const expectedSignature = toBase64Url(
      createHash('sha256')
        .update(data + SECRET)
        .digest('base64')
    );

    const expectedBuffer = Buffer.from(expectedSignature, 'base64');
    const actualBuffer = Buffer.from(signature, 'base64');

    if (expectedBuffer.length !== actualBuffer.length) {
      return false;
    }

    return timingSafeEqual(expectedBuffer, actualBuffer);
  } catch (error) {
    console.error('[CSRF] Token verification error:', error);
    return false;
  }
}

/**
 * Create a serialized CSRF token for forms
 */
export function createCSRFTokenString(): string {
  const csrfData = generateCSRFToken();
  return `${csrfData.token}:${csrfData.timestamp}:${csrfData.signature}`;
}

/**
 * Parse and verify a serialized CSRF token
 */
export function verifyCSRFTokenString(tokenString: string): boolean {
  try {
    const parts = tokenString.split(':');
    if (parts.length !== 3) {
      return false;
    }

    const [token, timestampStr, signature] = parts;
    const timestamp = parseInt(timestampStr, 10);

    if (isNaN(timestamp)) {
      return false;
    }

    return verifyCSRFToken(token, timestamp, signature);
  } catch (error) {
    console.error('[CSRF] Token parsing error:', error);
    return false;
  }
}

/**
 * React hook for CSRF token management
 */
export function useCSRFToken() {
  const getToken = (): string => {
    if (typeof window !== 'undefined') {
      let token = sessionStorage.getItem('csrf_token');
      if (!token) {
        token = createCSRFTokenString();
        sessionStorage.setItem('csrf_token', token);
      }
      return token;
    }
    return createCSRFTokenString();
  };

  const validateToken = (token: string): boolean => {
    return verifyCSRFTokenString(token);
  };

  const refreshToken = (): string => {
    const newToken = createCSRFTokenString();
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('csrf_token', newToken);
    }
    return newToken;
  };

  return {
    getToken,
    validateToken,
    refreshToken,
  };
}

/**
 * Middleware to validate CSRF tokens on server side
 */
export function validateCSRFMiddleware(token: string | undefined, method: string): boolean {
  const protectedMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];

  if (!protectedMethods.includes(method.toUpperCase())) {
    return true;
  }

  if (!token) {
    console.warn('[CSRF] Missing CSRF token for protected request');
    return false;
  }

  return verifyCSRFTokenString(token);
}

/**
 * Generate CSRF meta tags for HTML head
 */
export function getCSRFMetaTags() {
  const csrfData = generateCSRFToken();
  return {
    'csrf-token': `${csrfData.token}:${csrfData.timestamp}:${csrfData.signature}`,
    'csrf-param': '_csrf',
  };
}