/**
 * Rate Limiting Middleware
 * Protect API routes from abuse and DoS attacks
 */

import { NextRequest, NextResponse } from 'next/server';

import { createSecureErrorResponse } from '@/lib/security/api-security';

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

import type { RateLimitConfig } from '@/types/security';

// Default rate limit configurations by endpoint type
export const rateLimitConfigs = {
  // Public endpoints
  search: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 requests/minute
  lookup: { windowMs: 60 * 1000, maxRequests: 200 }, // 200 requests/minute

  // Authentication endpoints
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 10 }, // 10 requests/15 minutes

  // CRUD operations
  create: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 creates/minute
  update: { windowMs: 60 * 1000, maxRequests: 20 }, // 20 updates/minute
  delete: { windowMs: 60 * 1000, maxRequests: 5 }, // 5 deletes/minute

  // Admin operations
  admin: { windowMs: 60 * 1000, maxRequests: 50 }, // 50 requests/minute

  // Webhook endpoints
  webhook: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 webhooks/minute

  // Default fallback
  default: { windowMs: 60 * 1000, maxRequests: 60 }, // 60 requests/minute
} as const;

/**
 * Get client identifier for rate limiting
 */
function getClientId(request: NextRequest): string {
  // Try to get authenticated user ID first
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    // Use token hash as identifier (would need to decode in real implementation)
    const token = authHeader.split(' ')[1];
    return `user:${token.substring(0, 16)}`; // First 16 chars as identifier
  }

  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
  return `ip:${ip}`;
}

/**
 * Check rate limit for client
 */
export function checkRateLimit(
  clientId: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = clientId;
  const existing = rateLimitStore.get(key);

  // If no existing record or window has expired, create new
  if (!existing || now > existing.resetTime) {
    const resetTime = now + config.windowMs;
    rateLimitStore.set(key, { count: 1, resetTime });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime,
    };
  }

  // Check if limit exceeded
  if (existing.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: existing.resetTime,
    };
  }

  // Increment count
  existing.count++;
  rateLimitStore.set(key, existing);

  return {
    allowed: true,
    remaining: config.maxRequests - existing.count,
    resetTime: existing.resetTime,
  };
}

/**
 * Clean up expired rate limit entries
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  const entries = Array.from(rateLimitStore.entries());
  for (const [key, value] of entries) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Clean up every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}

/**
 * Rate limiting middleware
 */
export function withRateLimit(
  handler: (request: NextRequest, context: any) => Promise<NextResponse>,
  configKey: keyof typeof rateLimitConfigs = 'default'
) {
  return async (request: NextRequest, context: any): Promise<NextResponse> => {
    const config = rateLimitConfigs[configKey];
    const clientId = getClientId(request);
    const rateLimitResult = checkRateLimit(clientId, config);

    // Create response with rate limit headers
    let response: NextResponse;

    if (!rateLimitResult.allowed) {
      response = createSecureErrorResponse('Rate limit exceeded. Too many requests.', 429);
    } else {
      response = await handler(request, context);
    }

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set(
      'X-RateLimit-Reset',
      Math.ceil(rateLimitResult.resetTime / 1000).toString()
    );
    response.headers.set(
      'Retry-After',
      Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
    );

    return response;
  };
}

/**
 * Get rate limit status for monitoring
 */
export function getRateLimitStats(): {
  totalClients: number;
  entries: Array<{ clientId: string; count: number; resetTime: number }>;
} {
  const entries: Array<{ clientId: string; count: number; resetTime: number }> = [];
  rateLimitStore.forEach((data, clientId) => {
    entries.push({
      clientId,
      count: data.count,
      resetTime: data.resetTime,
    });
  });

  return {
    totalClients: rateLimitStore.size,
    entries,
  };
}
