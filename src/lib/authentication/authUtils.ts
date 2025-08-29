/**
 * Authentication and Authorization Middleware
 * Centralized auth handling with proper role-based access control
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

import { logger } from '@/lib/logging';
import { AuthUserProfile } from '@/types/auth';

import { Role, ROLE_PERMISSIONS, ErrorCode, RequestContext } from './types';

export interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    role: Role;
    barangayCode?: string;
    cityCode?: string;
    provinceCode?: string;
    regionCode?: string;
  };
  error?: {
    code: ErrorCode;
    message: string;
    status: number;
  };
  context?: RequestContext;
}

export interface AuthConfig {
  requiredPermissions?: string[];
  allowServiceRole?: boolean;
  skipAuth?: boolean;
}

/**
 * Extract and validate bearer token from request
 */
function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.split(' ')[1];
}

/**
 * Get client IP address from request headers
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  return ip;
}

/**
 * Check if user has required permissions
 */
export function hasPermission(userRole: Role, requiredPermission: string): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return (rolePermissions as readonly string[]).includes(requiredPermission);
}

/**
 * Check if user has any of the required permissions
 */
export function hasAnyPermission(userRole: Role, requiredPermissions: string[]): boolean {
  return requiredPermissions.some(permission => hasPermission(userRole, permission));
}

/**
 * Get geographic access level based on role
 */
export function getAccessLevel(
  userRole: Role
): 'national' | 'region' | 'province' | 'city' | 'barangay' {
  const accessLevels: Record<Role, 'national' | 'region' | 'province' | 'city' | 'barangay'> = {
    [Role.SUPER_ADMIN]: 'national',
    [Role.REGION_ADMIN]: 'region',
    [Role.PROVINCE_ADMIN]: 'province',
    [Role.CITY_ADMIN]: 'city',
    [Role.BARANGAY_ADMIN]: 'barangay',
    [Role.BARANGAY_STAFF]: 'barangay',
    [Role.RESIDENT]: 'barangay',
  };

  return accessLevels[userRole] || 'barangay';
}

/**
 * Main authentication and authorization function
 */
export async function authenticate(
  request: NextRequest,
  config: AuthConfig = {}
): Promise<AuthResult> {
  const requestId = uuidv4();
  const timestamp = new Date().toISOString();
  const path = request.nextUrl.pathname;
  const method = request.method;
  const ip = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Skip authentication if configured
  if (config.skipAuth) {
    return {
      success: true,
      context: {
        userId: 'anonymous',
        userRole: Role.RESIDENT,
        requestId,
        timestamp,
        path,
        method,
        ip,
        userAgent,
      },
    };
  }

  // Extract token
  const token = extractBearerToken(request);
  if (!token) {
    return {
      success: false,
      error: {
        code: ErrorCode.UNAUTHORIZED,
        message: 'Authentication required. Please provide a valid Bearer token.',
        status: 401,
      },
    };
  }

  try {
    // Create Supabase clients
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify user token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return {
        success: false,
        error: {
          code: ErrorCode.INVALID_TOKEN,
          message: 'Invalid or expired authentication token.',
          status: 401,
        },
      };
    }

    // Get user profile with role information
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('auth_user_profiles')
      .select(
        `
        barangay_code,
        city_municipality_code,
        province_code,
        region_code,
        role_id,
        is_active
      `
      )
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return {
        success: false,
        error: {
          code: ErrorCode.NOT_FOUND,
          message: 'User profile not found.',
          status: 404,
        },
      };
    }

    // Check if user is active
    if (!userProfile.is_active) {
      return {
        success: false,
        error: {
          code: ErrorCode.FORBIDDEN,
          message: 'Account is deactivated. Please contact administrator.',
          status: 403,
        },
      };
    }

    // Get role information
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('auth_roles')
      .select('name')
      .eq('id', userProfile.role_id)
      .single();

    if (roleError || !roleData) {
      return {
        success: false,
        error: {
          code: ErrorCode.NOT_FOUND,
          message: 'User role not found.',
          status: 404,
        },
      };
    }

    const userRole = roleData.name as Role;

    // Check permissions if required
    if (config.requiredPermissions && config.requiredPermissions.length > 0) {
      if (!hasAnyPermission(userRole, config.requiredPermissions)) {
        return {
          success: false,
          error: {
            code: ErrorCode.INSUFFICIENT_PERMISSIONS,
            message: 'Insufficient permissions to access this resource.',
            status: 403,
          },
        };
      }
    }

    // Create request context
    const context: RequestContext = {
      userId: user.id,
      userRole,
      barangayCode: userProfile.barangay_code,
      cityCode: userProfile.city_municipality_code,
      provinceCode: userProfile.province_code,
      regionCode: userProfile.region_code,
      requestId,
      timestamp,
      path,
      method,
      ip,
      userAgent,
    };

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email!,
        role: userRole,
        barangayCode: userProfile.barangay_code,
        cityCode: userProfile.city_municipality_code,
        provinceCode: userProfile.province_code,
        regionCode: userProfile.region_code,
      },
      context,
    };
  } catch (error) {
    logger.error('Authentication service error', { error });
    return {
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Authentication service temporarily unavailable.',
        status: 500,
      },
    };
  }
}

/**
 * Middleware wrapper for API routes
 */
export function withAuth(
  config: AuthConfig,
  handler: (
    request: NextRequest,
    context: RequestContext,
    user: NonNullable<AuthResult['user']>
  ) => Promise<Response>
) {
  return async (request: Request | NextRequest): Promise<Response> => {
    const nextRequest = request instanceof Request ? (request as NextRequest) : request;
    const authResult = await authenticate(nextRequest, config);

    if (!authResult.success) {
      return new Response(
        JSON.stringify({
          error: authResult.error,
          timestamp: new Date().toISOString(),
          path: nextRequest.nextUrl?.pathname || new URL(request.url).pathname,
        }),
        {
          status: authResult.error!.status,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return handler(nextRequest, authResult.context!, authResult.user!);
  };
}

/**
 * Create a Supabase client with user context for RLS
 */
export function createAuthorizedSupabaseClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );
}

/**
 * Create admin Supabase client (bypasses RLS)
 */
export function createAdminSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'Missing Supabase configuration: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required'
    );
  }

  return createClient(url, serviceKey);
}

/**
 * Apply geographic filtering based on user's access level
 */
export function applyGeographicFilter<T>(
  query: T & { eq: (column: string, value: string) => T },
  user: NonNullable<AuthResult['user']>
): T {
  const accessLevel = getAccessLevel(user.role);

  switch (accessLevel) {
    case 'barangay':
      if (user.barangayCode) {
        return query.eq('barangay_code', user.barangayCode);
      }
      break;
    case 'city':
      if (user.cityCode) {
        return query.eq('city_municipality_code', user.cityCode);
      }
      break;
    case 'province':
      if (user.provinceCode) {
        return query.eq('province_code', user.provinceCode);
      }
      break;
    case 'region':
      if (user.regionCode) {
        return query.eq('region_code', user.regionCode);
      }
      break;
    case 'national':
      // No filtering for national access
      break;
  }

  return query;
}
