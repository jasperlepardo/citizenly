import { NextRequest } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/authentication/authUtils';
import { createClient } from '@supabase/supabase-js';
import {
  createSuccessResponse,
  createUnauthorizedResponse,
  createNotFoundResponse,
  handleDatabaseError,
  handleUnexpectedError,
} from '@/lib/api/responseUtils';

/**
 * GET API Handler for auth/profile
 *
 * @description Handles GET requests for the auth/profile endpoint
 * @param {NextRequest} request - The incoming HTTP request object
 * @returns {Promise<NextResponse>} JSON response with data or error message
 *
 * @example
 * ```typescript
 * // GET /auth/profile
 * const response = await fetch('/auth/profile', { method: 'GET' });
 * const data = await response.json();
 * ```
 */
export async function GET(request: NextRequest) {
  try {
    // Get auth header from the request
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createUnauthorizedResponse('No auth token provided. Please log in again.');
    }

    const token = authHeader.split(' ')[1];

    // Create regular client to verify user
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Verify the user token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return createUnauthorizedResponse('Invalid or expired token. Please log in again.');
    }

    // Use service role client to bypass RLS for this specific query
    // This is safe because we've already verified the user's authentication
    const supabaseAdmin = createAdminSupabaseClient();

    // Fetch user profile with service role (bypasses RLS)
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('auth_user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return await handleDatabaseError(profileError);
    }

    if (!profileData) {
      return createNotFoundResponse('Profile');
    }

    // Fetch role separately if needed
    let roleData = null;
    if (profileData.role_id) {
      const { data: role } = await supabaseAdmin
        .from('auth_roles')
        .select('*')
        .eq('id', profileData.role_id)
        .single();

      roleData = role;
    }

    return createSuccessResponse(
      {
        profile: profileData,
        role: roleData,
      },
      'Profile retrieved successfully'
    );
  } catch (error) {
    return await handleUnexpectedError(error);
  }
}
