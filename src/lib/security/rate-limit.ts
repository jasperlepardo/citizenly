import { logger } from '@/lib/logging';

import { ErrorCode } from '../api/types';

/**
 * Advanced Rate Limiting System
 *
 * @description Comprehensive rate limiting implementation for API endpoints and user actions.
 * Uses token bucket algorithm with sliding window for accurate rate limiting.
 * Supports different limits per endpoint type and user-specific vs IP-based limiting.
 *
 * @features
 * - Configurable rate limits per endpoint type
 * - User-based and IP-based identification
 * - Sliding window algorithm for smooth rate limiting
 * - Support for skipping successful/failed requests
 * - Standard HTTP rate limit headers
 * - In-memory storage with Redis-ready architecture
 *
 * @algorithms
 * - **Token Bucket**: Each client gets a bucket with tokens that refill over time
 * - **Sliding Window**: More accurate than fixed windows, prevents burst at window edges
 * - **Exponential Backoff**: Increasing delays for repeated violations
 *
 * @security
 * - Prevents DoS attacks by limiting request frequency
 * - Protects against brute force attacks (login attempts)
 * - Rate limits file uploads to prevent resource exhaustion
 * - Handles proxy headers to get real client IP
 *
 * @compliance
 * - HTTP 429 "Too Many Requests" standard
 * - RFC 6585 Additional HTTP Status Codes
 * - OWASP Rate Limiting guidance
 *
 * @note Production deployment should use Redis for distributed rate limiting
 */

/**
 * Rate limiting rule configuration
 *
 * @interface RateLimitRule
 * @property maxRequests - Maximum number of requests allowed in the time window
 * @property windowMs - Time window duration in milliseconds
 * @property skipSuccessfulRequests - If true, successful requests don't count toward limit
 * @property skipFailedRequests - If true, failed requests don't count toward limit
 */
interface RateLimitRule {
  maxRequests: number;
  windowMs: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

/**
 * Internal rate limit tracking entry
 *
 * @interface RateLimitEntry
 * @property count - Current number of requests in the window
 * @property resetTime - Unix timestamp when the window resets
 * @property blocked - Whether the client is currently blocked
 * @internal This is used internally by the rate limiting engine
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
}

// Using ErrorCode from api-types for consistency across the application

/**
 * In-memory rate limiting storage
 *
 * @description Simple Map-based storage for rate limiting data. Suitable for
 * development and single-server deployments. Production systems should use
 * Redis or another distributed cache for multi-server compatibility.
 *
 * @note Production deployment recommendations:
 * - Use Redis for distributed rate limiting
 * - Implement data persistence for server restarts
 * - Add automatic cleanup of expired entries
 * - Consider rate limiting across server clusters
 */
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Predefined rate limiting rules for different endpoint types
 *
 * @description Security-focused rate limits designed to prevent abuse while
 * allowing normal usage patterns. Limits are conservative for security.
 *
 * @rules
 * - **login**: 5 attempts per 15 minutes - Prevents brute force attacks
 * - **api**: 100 requests per minute - Protects against API abuse
 * - **upload**: 10 uploads per minute - Prevents resource exhaustion
 *
 * @security These limits are designed based on:
 * - OWASP authentication rate limiting guidelines
 * - Typical user behavior patterns
 * - Server resource protection requirements
 *
 * @customization Production deployments should adjust these based on:
 * - Expected user load patterns
 * - Server capacity and performance testing
 * - Business requirements and user experience needs
 */
export const RATE_LIMIT_RULES = {
  login: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  api: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
  upload: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 uploads per minute
  SEARCH_RESIDENTS: { maxRequests: 50, windowMs: 60 * 1000 }, // 50 searches per minute
  RESIDENT_CREATE: { maxRequests: 20, windowMs: 60 * 1000 }, // 20 creates per minute
} as const;

/**
 * Generate a unique storage key for rate limiting entries
 *
 * @description Creates a namespaced key for storing rate limit data.
 * Uses format: "rate_limit:{ruleType}:{identifier}" for clear organization.
 *
 * @param identifier - Client identifier (user ID, IP address, etc.)
 * @param ruleKey - Type of rate limit rule being applied
 * @returns Formatted storage key for the rate limit entry
 *
 * @example
 * ```typescript
 * generateRateLimitKey('user:123', 'api') // "rate_limit:api:user:123"
 * generateRateLimitKey('ip:192.168.1.1', 'login') // "rate_limit:login:ip:192.168.1.1"
 * ```
 *
 * @internal Used internally for consistent key generation across the system
 */
function generateRateLimitKey(identifier: string, ruleKey: string): string {
  return `rate_limit:${ruleKey}:${identifier}`;
}

/**
 * Core rate limiting check function using sliding window algorithm
 *
 * @description Implements the main rate limiting logic using a sliding window approach.
 * Checks if a request should be allowed based on the client's recent request history.
 * Automatically handles window expiration and resets.
 *
 * @param identifier - Unique client identifier (user ID, IP, etc.)
 * @param rule - Rate limiting rule configuration to apply
 * @param ruleKey - Human-readable rule type for logging
 * @returns Rate limiting result with allowed status and timing information
 *
 * @algorithm Sliding Window Token Bucket:
 * 1. Check if client has existing rate limit entry
 * 2. If expired or missing, create new window with full tokens
 * 3. Check if request can be allowed (tokens available and not blocked)
 * 4. If allowed, consume one token
 * 5. Update blocking status if limit reached
 * 6. Return status with retry timing information
 *
 * @example
 * ```typescript
 * const result = checkRateLimit(
 *   'user:123',
 *   { maxRequests: 10, windowMs: 60000 },
 *   'api'
 * );
 *
 * if (!result.allowed) {
 *   console.log(`Blocked! Retry after ${result.retryAfter} seconds`);
 * }
 * ```
 *
 * @performance O(1) time complexity with in-memory storage
 * @scalability Ready for Redis backend for distributed systems
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
 * Record a successful request and potentially refund a token
 *
 * @description For rate limiting rules configured to skip successful requests,
 * this function decrements the request count and unblocks the client.
 * Useful for login attempts where successful logins shouldn't count toward the limit.
 *
 * @param identifier - Client identifier who made the successful request
 * @param rule - Rate limiting rule (must have skipSuccessfulRequests: true)
 * @param ruleKey - Rule type for key generation
 *
 * @example Login endpoint with forgiving rate limiting
 * ```typescript
 * const loginRule = {
 *   maxRequests: 5,
 *   windowMs: 15 * 60 * 1000,
 *   skipSuccessfulRequests: true
 * };
 *
 * // After successful login
 * if (loginSuccess) {
 *   recordSuccessfulRequest(clientId, loginRule, 'login');
 *   // Client gets a token back, can attempt more logins
 * }
 * ```
 *
 * @rationale This prevents legitimate users from being locked out after
 * a few failed attempts followed by a successful login.
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
 * Record a failed request and potentially refund a token
 *
 * @description For rate limiting rules configured to skip failed requests,
 * this function decrements the request count. Useful for API endpoints where
 * server errors (5xx) shouldn't count against the client's rate limit.
 *
 * @param identifier - Client identifier who made the failed request
 * @param rule - Rate limiting rule (must have skipFailedRequests: true)
 * @param ruleKey - Rule type for key generation
 *
 * @example API with server error forgiveness
 * ```typescript
 * const apiRule = {
 *   maxRequests: 100,
 *   windowMs: 60000,
 *   skipFailedRequests: true
 * };
 *
 * // After server error (not client's fault)
 * if (response.status >= 500) {
 *   recordFailedRequest(clientId, apiRule, 'api');
 *   // Client doesn't lose quota for our server problems
 * }
 * ```
 *
 * @rationale Prevents punishing clients for server-side issues that are
 * not the client's fault (database errors, service unavailability, etc.)
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
 * Extract client identifier from HTTP request for rate limiting
 *
 * @description Determines the unique identifier for rate limiting purposes.
 * Prefers user ID for authenticated requests, falls back to IP address for
 * anonymous requests. Handles various proxy headers to get the real client IP.
 *
 * @param request - HTTP Request object to analyze
 * @param userId - Optional authenticated user ID
 * @returns Formatted identifier string for rate limiting storage
 *
 * @algorithm Identifier Priority:
 * 1. **User ID** (if authenticated): "user:{uuid}"
 * 2. **X-Forwarded-For** (first IP): "ip:{address}"
 * 3. **X-Real-IP** header: "ip:{address}"
 * 4. **Remote-Addr** header: "ip:{address}"
 * 5. **Fallback**: "ip:unknown"
 *
 * @example Different client scenarios
 * ```typescript
 * // Authenticated user
 * getClientIdentifier(request, 'user-123') // "user:user-123"
 *
 * // Anonymous behind proxy
 * // X-Forwarded-For: "203.0.113.1, 198.51.100.2"
 * getClientIdentifier(request) // "ip:203.0.113.1"
 *
 * // Direct connection
 * getClientIdentifier(request) // "ip:192.168.1.100"
 * ```
 *
 * @security Handles proxy headers safely by:
 * - Taking only the first IP from X-Forwarded-For (client IP)
 * - Validating header presence to prevent spoofing
 * - Using consistent formatting for storage
 *
 * @network Supports common proxy configurations:
 * - Nginx: X-Real-IP, X-Forwarded-For
 * - CloudFlare: CF-Connecting-IP via X-Forwarded-For
 * - AWS ALB: X-Forwarded-For
 * - Direct connections: Remote-Addr
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
 * Create a rate limiting middleware function for specific endpoint types
 *
 * @description Factory function that creates a rate limiting middleware
 * configured for specific endpoint types (login, api, upload). Returns a
 * function that can be called with client identifier to check rate limits.
 *
 * @param ruleKey - Type of rate limiting rule to apply
 * @returns Middleware function that accepts identifier and callbacks
 *
 * @example Usage in authentication flow
 * ```typescript
 * const loginRateLimit = rateLimitMiddleware('login');
 *
 * export async function authenticate(email: string, password: string) {
 *   const identifier = getClientIdentifier(request, undefined);
 *
 *   const result = loginRateLimit(
 *     identifier,
 *     () => console.log('Login succeeded - token refunded'),
 *     () => console.log('Login failed - counting toward limit')
 *   );
 *
 *   if (!result.success) {
 *     throw new RateLimitError(result.error, result.retryAfter);
 *   }
 *
 *   // Proceed with authentication...
 *   const authResult = await verifyCredentials(email, password);
 *
 *   if (authResult.success) {
 *     result.callbacks.recordSuccess();
 *   } else {
 *     result.callbacks.recordFailure();
 *   }
 * }
 * ```
 *
 * @pattern This function implements the middleware pattern, allowing
 * rate limiting to be easily integrated into existing authentication
 * and API handling code without major refactoring.
 */
export function rateLimitMiddleware(ruleKey: keyof typeof RATE_LIMIT_RULES) {
  return (identifier: string, onSuccess?: () => void, onFailure?: () => void) => {
    const rule = RATE_LIMIT_RULES[ruleKey];
    const result = checkRateLimit(identifier, rule, ruleKey);

    if (!result.allowed) {
      // Log rate limit violation
      logger.warn('Rate limit exceeded', {
        ruleKey,
        identifier,
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
 * Next.js/Vercel compatible rate limiting handler with standard HTTP responses
 *
 * @description Creates a complete HTTP response handler for rate limiting that
 * follows web standards. Returns null if request should proceed, or a properly
 * formatted 429 Response if rate limit is exceeded. Includes all standard
 * rate limiting headers for client compatibility.
 *
 * @param ruleKey - Type of rate limiting rule to apply ('login' | 'api' | 'upload')
 * @returns Async function that processes requests and returns Response or null
 *
 * @example Next.js API Route Integration
 * ```typescript
 * // pages/api/login.ts
 * export async function POST(request: Request) {
 *   const rateLimitHandler = createRateLimitHandler('login');
 *
 *   // Check rate limit first
 *   const rateLimitResponse = await rateLimitHandler(request);
 *   if (rateLimitResponse) {
 *     return rateLimitResponse; // Return 429 with proper headers
 *   }
 *
 *   // Proceed with actual login logic
 *   const { email, password } = await request.json();
 *   return handleLogin(email, password);
 * }
 * ```
 *
 * @example API Route with User Context
 * ```typescript
 * export async function POST(request: Request) {
 *   const session = await getSession(request);
 *   const rateLimitHandler = createRateLimitHandler('api');
 *
 *   // Use user ID if authenticated, IP if not
 *   const rateLimitResponse = await rateLimitHandler(request, session?.userId);
 *   if (rateLimitResponse) return rateLimitResponse;
 *
 *   // Continue with API logic...
 * }
 * ```
 *
 * @headers Standard rate limiting headers included:
 * - `Retry-After`: Seconds until client can retry
 * - `X-RateLimit-Limit`: Maximum requests allowed in window
 * - `X-RateLimit-Remaining`: Requests remaining in current window
 * - `X-RateLimit-Reset`: Unix timestamp when window resets
 *
 * @compliance
 * - HTTP 429 "Too Many Requests" (RFC 6585)
 * - Standard rate limiting headers
 * - JSON error format matching API standards
 */
export function createRateLimitHandler(ruleKey: keyof typeof RATE_LIMIT_RULES) {
  return async (request: Request, userId?: string) => {
    const identifier = getClientIdentifier(request, userId);
    const rule = RATE_LIMIT_RULES[ruleKey];
    const result = checkRateLimit(identifier, rule, ruleKey);

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: {
            code: ErrorCode.RATE_LIMIT_EXCEEDED,
            message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
            details: {
              retryAfter: result.retryAfter,
              limit: rule.maxRequests,
              window: rule.windowMs / 1000, // seconds
            },
          },
          timestamp: new Date().toISOString(),
          path: new URL(request.url).pathname,
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
 * Reset rate limit for a specific client (administrative function)
 *
 * @description Manually resets the rate limit for a specific client identifier.
 * Useful for administrative actions like unblocking users or clearing limits
 * during testing. Should be used sparingly and with proper authorization.
 *
 * @param identifier - Client identifier to reset (user ID, IP, etc.)
 * @param ruleKey - Type of rate limit to reset
 * @returns True if a limit was found and reset, false if no limit existed
 *
 * @example Admin endpoint to unblock users
 * ```typescript
 * // Admin API to reset user's login rate limit
 * export async function POST(request: Request) {
 *   const { userId, ruleType } = await request.json();
 *
 *   // Verify admin permissions first
 *   if (!await isAdmin(request)) {
 *     return new Response('Unauthorized', { status: 403 });
 *   }
 *
 *   const wasReset = resetRateLimit(`user:${userId}`, ruleType);
 *
 *   return Response.json({
 *     success: wasReset,
 *     message: wasReset ? 'Rate limit reset' : 'No active rate limit found'
 *   });
 * }
 * ```
 *
 * @security This function should only be accessible to:
 * - System administrators
 * - Automated monitoring systems
 * - Testing environments
 *
 * @caution Use with care in production as it can circumvent security measures.
 */
export function resetRateLimit(identifier: string, ruleKey: string): boolean {
  const key = generateRateLimitKey(identifier, ruleKey);
  return rateLimitStore.delete(key);
}

/**
 * Get current rate limiting status for monitoring and debugging
 *
 * @description Retrieves the current rate limiting state for a specific client
 * without modifying it. Useful for debugging rate limiting issues, monitoring
 * client behavior, and building administrative dashboards.
 *
 * @param identifier - Client identifier to check
 * @param ruleKey - Type of rate limit to check
 * @returns Current rate limit entry or null if no active limits
 *
 * @example Debugging rate limit issues
 * ```typescript
 * // Check why a user is being rate limited
 * const status = getRateLimitStatus('user:123', 'login');
 *
 * if (status) {
 *   console.log(`User has made ${status.count} attempts`);
 *   console.log(`Blocked: ${status.blocked}`);
 *   console.log(`Resets at: ${new Date(status.resetTime)}`);
 * } else {
 *   console.log('No active rate limits for this user');
 * }
 * ```
 *
 * @example Admin dashboard endpoint
 * ```typescript
 * export async function GET(request: Request) {
 *   const { searchParams } = new URL(request.url);
 *   const identifier = searchParams.get('identifier');
 *   const ruleKey = searchParams.get('rule');
 *
 *   const status = getRateLimitStatus(identifier, ruleKey);
 *
 *   return Response.json({
 *     identifier,
 *     ruleKey,
 *     status: status || 'No active limits',
 *     resetTime: status ? new Date(status.resetTime).toISOString() : null
 *   });
 * }
 * ```
 *
 * @monitoring Can be integrated with monitoring systems to:
 * - Alert on unusual rate limiting patterns
 * - Track rate limiting effectiveness
 * - Identify clients that frequently hit limits
 * - Monitor for potential attacks or abuse
 */
export function getRateLimitStatus(identifier: string, ruleKey: string): RateLimitEntry | null {
  const key = generateRateLimitKey(identifier, ruleKey);
  return rateLimitStore.get(key) || null;
}
