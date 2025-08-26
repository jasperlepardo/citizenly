/**
 * API Security Utilities
 * Centralized security functions for API routes
 */

import { NextRequest, NextResponse } from 'next/server';

// Security headers for API responses
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'",
} as const;

// Rate limiting configuration by endpoint type
export const rateLimits = {
  search: { requests: 100, window: 60 }, // 100 requests per minute
  create: { requests: 10, window: 60 },  // 10 creates per minute
  update: { requests: 20, window: 60 },  // 20 updates per minute
  delete: { requests: 5, window: 60 },   // 5 deletes per minute
} as const;

/**
 * Add security headers to API response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

/**
 * Validate environment variables are properly configured
 */
export function validateEnvironmentSecurity(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for production-specific security requirements
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.SUPABASE_WEBHOOK_SECRET || process.env.SUPABASE_WEBHOOK_SECRET === 'dev-webhook-secret') {
      errors.push('Production webhook secret not configured');
    }
    
    if (!process.env.CSRF_SECRET || process.env.CSRF_SECRET.length < 32) {
      errors.push('CSRF secret not properly configured');
    }
  }
  
  // Check for required environment variables
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];
  
  required.forEach(key => {
    if (!process.env[key]) {
      errors.push(`Missing required environment variable: ${key}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize error messages for client response
 */
export function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    // In development, show full error. In production, sanitize.
    if (process.env.NODE_ENV === 'development') {
      return error.message;
    }
    
    // Map known errors to safe messages
    const safeErrors = {
      'duplicate key value': 'Resource already exists',
      'foreign key constraint': 'Invalid reference',
      'not null violation': 'Required field missing',
      'invalid input syntax': 'Invalid data format',
    };
    
    for (const [pattern, safeMessage] of Object.entries(safeErrors)) {
      if (error.message.toLowerCase().includes(pattern)) {
        return safeMessage;
      }
    }
    
    return 'An error occurred';
  }
  
  return 'Unknown error';
}

/**
 * Create standardized error response with security headers
 */
export function createSecureErrorResponse(
  error: string,
  status: number = 500,
  details?: unknown
): NextResponse {
  const response = NextResponse.json(
    {
      error: sanitizeError(error),
      ...(process.env.NODE_ENV === 'development' && details ? { details } : {}),
    },
    { status }
  );
  
  return addSecurityHeaders(response);
}

/**
 * Validate request origin for sensitive operations
 */
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ].filter(Boolean);
  
  return !origin || allowedOrigins.includes(origin);
}