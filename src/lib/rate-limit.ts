/**
 * Rate Limiting Implementation
 * Provides protection against brute force attacks and API abuse
 */

interface RateLimitRule {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean; // Skip counting successful requests
  skipFailedRequests?: boolean; // Skip counting failed requests
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
}

// In-memory store for rate limiting (in production, use Redis or similar)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup expired entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    rateLimitStore.forEach((entry, key) => {
      if (entry.resetTime <= now) {
        rateLimitStore.delete(key);
      }
    });
  },
  5 * 60 * 1000
);

/**
 * Rate limiting rules for different endpoints
 */
export const RATE_LIMIT_RULES = {
  // Authentication endpoints - strict limits
  AUTH_LOGIN: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    skipSuccessfulRequests: true,
  } as RateLimitRule,

  AUTH_SIGNUP: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 signups per hour
    skipSuccessfulRequests: false,
  } as RateLimitRule,

  // Data modification endpoints - moderate limits
  RESIDENT_CREATE: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 20, // 20 residents per 5 minutes
    skipSuccessfulRequests: false,
  } as RateLimitRule,

  RESIDENT_UPDATE: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 50, // 50 updates per 5 minutes
    skipSuccessfulRequests: false,
  } as RateLimitRule,

  // Search and read endpoints - generous limits
  SEARCH_RESIDENTS: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 100, // 100 searches per minute
    skipSuccessfulRequests: false,
  } as RateLimitRule,

  // File upload endpoints - strict limits due to resource usage
  FILE_UPLOAD: {
    windowMs: 10 * 60 * 1000, // 10 minutes
    maxRequests: 10, // 10 uploads per 10 minutes
    skipSuccessfulRequests: false,
  } as RateLimitRule,

  // General API endpoints
  API_GENERAL: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 200, // 200 requests per minute
    skipSuccessfulRequests: false,
  } as RateLimitRule,
};

/**
 * Generate a rate limit key based on identifier and rule
 */
function generateRateLimitKey(identifier: string, ruleKey: string): string {
  return `${ruleKey}:${identifier}`;
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (IP, user ID, etc.)
 * @param rule - Rate limiting rule to apply
 * @param ruleKey - Key to identify the rule type
 * @returns Object with rate limit status and metadata
 */
export function checkRateLimit(
  identifier: string,
  rule: RateLimitRule,
  ruleKey: string
): {
  allowed: boolean;
  remainingRequests: number;
  resetTime: number;
  retryAfter?: number;
} {
  const key = generateRateLimitKey(identifier, ruleKey);
  const now = Date.now();

  let entry = rateLimitStore.get(key);

  // Create new entry if doesn't exist or has expired
  if (!entry || entry.resetTime <= now) {
    entry = {
      count: 0,
      resetTime: now + rule.windowMs,
      blocked: false,
    };
    rateLimitStore.set(key, entry);
  }

  // Check if request should be allowed
  const allowed = entry.count < rule.maxRequests && !entry.blocked;

  if (allowed) {
    entry.count++;
  }

  // Calculate remaining requests and retry after
  const remainingRequests = Math.max(0, rule.maxRequests - entry.count);
  const retryAfter = allowed ? undefined : Math.ceil((entry.resetTime - now) / 1000);

  // Block further requests if limit exceeded
  if (entry.count >= rule.maxRequests) {
    entry.blocked = true;
  }

  return {
    allowed,
    remainingRequests,
    resetTime: entry.resetTime,
    retryAfter,
  };
}

/**
 * Record a successful request (for rules that skip successful requests)
 */
export function recordSuccessfulRequest(
  identifier: string,
  rule: RateLimitRule,
  ruleKey: string
): void {
  if (rule.skipSuccessfulRequests) {
    const key = generateRateLimitKey(identifier, ruleKey);
    const entry = rateLimitStore.get(key);

    if (entry && entry.count > 0) {
      entry.count--;
      entry.blocked = false;
    }
  }
}

/**
 * Record a failed request (for rules that skip failed requests)
 */
export function recordFailedRequest(
  identifier: string,
  rule: RateLimitRule,
  ruleKey: string
): void {
  if (rule.skipFailedRequests) {
    const key = generateRateLimitKey(identifier, ruleKey);
    const entry = rateLimitStore.get(key);

    if (entry && entry.count > 0) {
      entry.count--;
      entry.blocked = false;
    }
  }
}

/**
 * Get client identifier from request (IP address, user ID, etc.)
 */
export function getClientIdentifier(request: Request, userId?: string): string {
  // Prefer user ID for authenticated requests
  if (userId) {
    return `user:${userId}`;
  }

  // Get IP address from various headers (handle proxies)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('remote-addr');

  const ip = forwarded?.split(',')[0] || realIp || remoteAddr || 'unknown';
  return `ip:${ip}`;
}

/**
 * Middleware function to apply rate limiting
 */
export function rateLimitMiddleware(ruleKey: keyof typeof RATE_LIMIT_RULES) {
  return (identifier: string, onSuccess?: () => void, onFailure?: () => void) => {
    const rule = RATE_LIMIT_RULES[ruleKey];
    const result = checkRateLimit(identifier, rule, ruleKey);

    if (!result.allowed) {
      // Log rate limit violation
      console.warn(`[RATE_LIMIT] ${ruleKey} - ${identifier} exceeded limit`, {
        remainingRequests: result.remainingRequests,
        retryAfter: result.retryAfter,
        resetTime: new Date(result.resetTime).toISOString(),
      });

      return {
        success: false,
        error: 'Too many requests',
        retryAfter: result.retryAfter,
        remainingRequests: result.remainingRequests,
      };
    }

    // Set up success/failure callbacks
    const wrappedCallbacks = {
      recordSuccess: () => {
        recordSuccessfulRequest(identifier, rule, ruleKey);
        onSuccess?.();
      },
      recordFailure: () => {
        recordFailedRequest(identifier, rule, ruleKey);
        onFailure?.();
      },
    };

    return {
      success: true,
      remainingRequests: result.remainingRequests,
      resetTime: result.resetTime,
      callbacks: wrappedCallbacks,
    };
  };
}

/**
 * Express/Next.js compatible rate limiting middleware
 */
export function createRateLimitHandler(ruleKey: keyof typeof RATE_LIMIT_RULES) {
  return async (request: Request, userId?: string) => {
    const identifier = getClientIdentifier(request, userId);
    const rule = RATE_LIMIT_RULES[ruleKey];
    const result = checkRateLimit(identifier, rule, ruleKey);

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
          retryAfter: result.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': result.retryAfter?.toString() || '60',
            'X-RateLimit-Limit': rule.maxRequests.toString(),
            'X-RateLimit-Remaining': result.remainingRequests.toString(),
            'X-RateLimit-Reset': result.resetTime.toString(),
          },
        }
      );
    }

    return null; // Allow request to proceed
  };
}

/**
 * Reset rate limit for a specific identifier (admin function)
 */
export function resetRateLimit(identifier: string, ruleKey: string): boolean {
  const key = generateRateLimitKey(identifier, ruleKey);
  return rateLimitStore.delete(key);
}

/**
 * Get current rate limit status for debugging
 */
export function getRateLimitStatus(identifier: string, ruleKey: string): RateLimitEntry | null {
  const key = generateRateLimitKey(identifier, ruleKey);
  return rateLimitStore.get(key) || null;
}
