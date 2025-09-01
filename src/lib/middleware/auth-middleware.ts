/**
 * Authentication Middleware
 * Centralized authentication handling for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { createPublicSupabaseClient, createAdminSupabaseClient } from '@/lib/data/client-factory';
import { createSecureErrorResponse } from '@/lib/security/api-security';

import type { AuthenticatedUser, AuthResult } from '@/types/security';

/**
 * Extract and validate Bearer token from request
 */
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.split(' ')[1];
}

/**
 * Authenticate user with token and get profile
 */
export async function authenticateUser(request: NextRequest): Promise<AuthResult> {
  const token = extractToken(request);

  if (!token) {
    return {
      success: false,
      error: 'No auth token provided',
      response: createSecureErrorResponse('Unauthorized - No auth token', 401),
    };
  }

  try {
    // Verify token with public client
    const supabase = createPublicSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return {
        success: false,
        error: 'Invalid token',
        response: createSecureErrorResponse('Unauthorized - Invalid token', 401),
      };
    }

    // Get user profile with admin client
    const supabaseAdmin = createAdminSupabaseClient();
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('auth_user_profiles')
      .select(
        `
        barangay_code,
        city_municipality_code,
        province_code,
        region_code,
        role_id,
        auth_roles!inner(name)
      `
      )
      .eq('id', user.id)
      .single();

    // Type the profile properly
    type UserProfileResult = {
      barangay_code: string | null;
      city_municipality_code: string | null;
      province_code: string | null;
      region_code: string | null;
      role_id: string;
      auth_roles: { name: string };
    };

    if (profileError) {
      console.warn('Profile fetch failed for user:', user.id, profileError.message);
      return {
        success: false,
        error: 'Profile not found',
        response: createSecureErrorResponse('Profile not found', 404),
      };
    }

    const typedProfile = profile as UserProfileResult;

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: typedProfile.auth_roles?.name,
        barangay_code: typedProfile.barangay_code,
        city_municipality_code: typedProfile.city_municipality_code,
        province_code: typedProfile.province_code,
        region_code: typedProfile.region_code,
        // role_id: typedProfile.role_id, // Not part of AuthenticatedUser interface
      },
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      error: 'Authentication failed',
      response: createSecureErrorResponse('Authentication failed', 500),
    };
  }
}

/**
 * Check if user has required role
 */
export function hasRole(user: AuthenticatedUser, requiredRoles: string[]): boolean {
  return user.role ? requiredRoles.includes(user.role) : false;
}

/**
 * Check if user has admin permissions
 */
export function isAdmin(user: AuthenticatedUser): boolean {
  return hasRole(user, ['super_admin', 'barangay_admin']);
}

/**
 * Authorize user for specific resource access
 */
export function authorizeResourceAccess(
  user: AuthenticatedUser,
  resourceBarangayCode?: string | null,
  resourceCityCode?: string | null
): { authorized: boolean; reason?: string } {
  // Super admins can access everything
  if (user.role === 'super_admin') {
    return { authorized: true };
  }

  // Barangay admins can access their barangay and city
  if (user.role === 'barangay_admin') {
    if (resourceBarangayCode && user.barangay_code === resourceBarangayCode) {
      return { authorized: true };
    }
    if (resourceCityCode && user.city_municipality_code === resourceCityCode) {
      return { authorized: true };
    }
    return { authorized: false, reason: 'Insufficient permissions for this resource' };
  }

  // Regular users can only access their own data
  if (user.role === 'user') {
    if (resourceBarangayCode && user.barangay_code === resourceBarangayCode) {
      return { authorized: true };
    }
    return { authorized: false, reason: 'Access denied for this resource' };
  }

  return { authorized: false, reason: 'Unknown role' };
}

/**
 * Higher-order function to protect API routes with authentication
 * Can accept either a simple handler or a configuration object with permissions
 */
export function withAuth(
  configOrHandler: any,
  handlerOrOptions?: any
): any {
  // Handle the case where first param is config object with requiredPermissions
  if (typeof configOrHandler === 'object' && configOrHandler.requiredPermissions) {
    const config = configOrHandler;
    const actualHandler = handlerOrOptions;
    
    return async (request: NextRequest, routeContext: any): Promise<NextResponse> => {
      const authResult = await authenticateUser(request);

      if (!authResult.success || !authResult.user) {
        return authResult.response || createSecureErrorResponse('Authentication failed', 401);
      }

      // Create proper RequestContext
      const context = {
        userId: authResult.user.id,
        userRole: authResult.user.role as any, // Type assertion needed here
        user: authResult.user,
        barangayCode: authResult.user.barangay_code,
        cityCode: authResult.user.city_municipality_code,
        provinceCode: authResult.user.province_code,
        regionCode: authResult.user.region_code,
        requestId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        path: request.nextUrl.pathname,
        method: request.method,
        ip: request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      };

      // Check permissions (simplified - would need proper permission checking)
      // For now, just check if user has a valid role
      if (config.requiredPermissions && !authResult.user.role) {
        return createSecureErrorResponse('Insufficient permissions', 403);
      }

      return actualHandler(request, context, authResult.user);
    };
  }
  
  // Handle the simple case where first param is the handler
  const handler = configOrHandler;
  const requiredRoles = handlerOrOptions;
  
  return async (request: NextRequest, context: any): Promise<NextResponse> => {
    const authResult = await authenticateUser(request);

    if (!authResult.success || !authResult.user) {
      return authResult.response || createSecureErrorResponse('Authentication failed', 401);
    }

    // Check role requirements
    if (requiredRoles && !hasRole(authResult.user, requiredRoles)) {
      return createSecureErrorResponse('Insufficient permissions', 403);
    }

    return handler(request, context, authResult.user);
  };
}
