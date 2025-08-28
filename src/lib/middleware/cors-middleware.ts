/**
 * CORS Middleware
 * Handle Cross-Origin Resource Sharing for API routes
 */

import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  // Add production domains
  'https://citizenly.ph',
  'https://www.citizenly.ph',
].filter(Boolean);

const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'];
const ALLOWED_HEADERS = [
  'Content-Type',
  'Authorization',
  'X-Requested-With',
  'Accept',
  'Origin',
  'User-Agent',
];

/**
 * Add CORS headers to response
 */
export function addCorsHeaders(response: NextResponse, origin?: string | null): NextResponse {
  // Check if origin is allowed
  const isAllowedOrigin = !origin || ALLOWED_ORIGINS.includes(origin);

  if (isAllowedOrigin && origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    response.headers.set('Access-Control-Allow-Origin', '*');
  }

  response.headers.set('Access-Control-Allow-Methods', ALLOWED_METHODS.join(', '));
  response.headers.set('Access-Control-Allow-Headers', ALLOWED_HEADERS.join(', '));
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours

  return response;
}

/**
 * Handle OPTIONS preflight requests
 */
export function handleCorsPreflightOptions(request: NextRequest): NextResponse {
  const origin = request.headers.get('origin');
  const response = new NextResponse(null, { status: 200 });

  return addCorsHeaders(response, origin);
}

/**
 * Higher-order function to add CORS to API routes
 */
export function withCors(handler: (request: NextRequest, context: any) => Promise<NextResponse>) {
  return async (request: NextRequest, context: any): Promise<NextResponse> => {
    // Handle preflight OPTIONS requests
    if (request.method === 'OPTIONS') {
      return handleCorsPreflightOptions(request);
    }

    // Process the actual request
    const response = await handler(request, context);

    // Add CORS headers to the response
    const origin = request.headers.get('origin');
    return addCorsHeaders(response, origin);
  };
}

/**
 * Validate origin for sensitive operations
 */
export function validateCorsOrigin(request: NextRequest): { valid: boolean; origin?: string } {
  const origin = request.headers.get('origin');

  // Allow same-origin requests (no origin header)
  if (!origin) {
    return { valid: true };
  }

  // Check against allowed origins
  const isAllowed = ALLOWED_ORIGINS.includes(origin);

  return {
    valid: isAllowed,
    origin,
  };
}
