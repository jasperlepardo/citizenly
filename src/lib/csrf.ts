import { randomBytes, createHash, timingSafeEqual } from 'crypto';

/**
 * CSRF Protection Implementation
 * Provides Cross-Site Request Forgery protection for forms
 */

const CSRF_SECRET = process.env.CSRF_SECRET;

if (!CSRF_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error(
    'CSRF_SECRET environment variable must be set in production. Generate a secure random string of at least 32 characters.'
  );
}

// Use a development-only fallback for non-production environments
const SECRET =
  CSRF_SECRET ||
  (process.env.NODE_ENV !== 'production' ? 'dev-only-csrf-secret-do-not-use-in-production' : '');

const TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour in milliseconds

export interface CSRFToken {
  token: string;
  timestamp: number;
  signature: string;
}

/**
 * Generate a secure CSRF token
 * @returns Object containing the token and its signature
 */
export function generateCSRFToken(): CSRFToken {
  const timestamp = Date.now();
  const randomToken = randomBytes(32).toString('base64url');

  // Create signature using HMAC
  const data = `${randomToken}:${timestamp}`;
  const signature = createHash('sha256')
    .update(data + SECRET)
    .digest('base64url');

  return {
    token: randomToken,
    timestamp,
    signature,
  };
}

/**
 * Verify a CSRF token
 * @param token - The CSRF token to verify
 * @param timestamp - The timestamp when token was created
 * @param signature - The signature to verify
 * @returns boolean indicating if token is valid
 */
export function verifyCSRFToken(token: string, timestamp: number, signature: string): boolean {
  try {
    // Check if token has expired
    if (Date.now() - timestamp > TOKEN_EXPIRY) {
      console.warn('[CSRF] Token expired');
      return false;
    }

    // Recreate the signature
    const data = `${token}:${timestamp}`;
    const expectedSignature = createHash('sha256')
      .update(data + SECRET)
      .digest('base64url');

    // Use timing-safe comparison to prevent timing attacks
    const expectedBuffer = Buffer.from(expectedSignature, 'base64url');
    const actualBuffer = Buffer.from(signature, 'base64url');

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
 * @returns String token that can be embedded in forms
 */
export function createCSRFTokenString(): string {
  const csrfData = generateCSRFToken();
  return `${csrfData.token}:${csrfData.timestamp}:${csrfData.signature}`;
}

/**
 * Parse and verify a serialized CSRF token
 * @param tokenString - The serialized token from form
 * @returns boolean indicating if token is valid
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
  // In a real implementation, this would be stored in session or secure cookie
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
 * @param token - Token from request
 * @param method - HTTP method
 * @returns boolean indicating if request should be allowed
 */
export function validateCSRFMiddleware(token: string | undefined, method: string): boolean {
  // Only validate POST, PUT, DELETE, PATCH requests
  const protectedMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];

  if (!protectedMethods.includes(method.toUpperCase())) {
    return true; // GET requests don't need CSRF protection
  }

  if (!token) {
    console.warn('[CSRF] Missing CSRF token for protected request');
    return false;
  }

  return verifyCSRFTokenString(token);
}

/**
 * Generate CSRF meta tags for HTML head
 * @returns Object with CSRF token data for meta tags
 */
export function getCSRFMetaTags() {
  const csrfData = generateCSRFToken();
  return {
    'csrf-token': `${csrfData.token}:${csrfData.timestamp}:${csrfData.signature}`,
    'csrf-param': '_csrf',
  };
}
