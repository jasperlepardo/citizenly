import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

import { createAdminSupabaseClient } from '@/lib/data/client-factory';
import {
  createSuccessResponse,
  createUnauthorizedResponse,
  createValidationErrorResponse,
  handleDatabaseError,
  handleUnexpectedError,
} from '@/utils/auth/apiResponseHandlers';

/**
 * PATCH API Handler for auth/profile/update
 *
 * @description Updates user profile information, including barangay_code
 * @param {NextRequest} request - The incoming HTTP request object
 * @returns {Promise<NextResponse>} JSON response with updated data or error message
 */
export async function PATCH(request: NextRequest) {
  try {
    // Get auth header from the request
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createUnauthorizedResponse('No auth token provided. Please log in again.');
    }

    const token = authHeader.split(' ')[1];

    // Create regular client to verify user
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the user token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return createUnauthorizedResponse('Invalid or expired token. Please log in again.');
    }

    // Parse request body
    const body = await request.json();
    const { barangay_code, first_name, last_name, phone } = body;

    // Validate required fields
    if (!barangay_code) {
      return createValidationErrorResponse([
        { field: 'barangay_code', message: 'Barangay code is required' }
      ]);
    }

    // Use service role client to bypass RLS for this specific update
    const supabaseAdmin = createAdminSupabaseClient();

    // Verify barangay exists
    const { data: barangayExists, error: barangayError } = await supabaseAdmin
      .from('psgc_barangays')
      .select('code')
      .eq('code', barangay_code)
      .single();

    if (barangayError || !barangayExists) {
      return createValidationErrorResponse([
        { field: 'barangay_code', message: 'Invalid barangay code' }
      ]);
    }

    // Update the user profile
    const updateData: Record<string, any> = {
      barangay_code,
      updated_at: new Date().toISOString(),
    };

    // Add optional fields if provided
    if (first_name) updateData.first_name = first_name;
    if (last_name) updateData.last_name = last_name;
    if (phone) updateData.phone = phone;

    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('auth_user_profiles')
      // @ts-expect-error - Supabase typing issue with dynamic update object
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (profileError) {
      return await handleDatabaseError(profileError);
    }

    return createSuccessResponse(
      {
        profile: profileData,
      },
      'Profile updated successfully'
    );
  } catch (error) {
    return await handleUnexpectedError(error instanceof Error ? error : new Error(String(error)));
  }
}