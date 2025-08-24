import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/authentication/authUtils';
// Note: These imports are available for future error handling enhancements
// import { getErrorMessage, getStatusCodeForError, DatabaseResponse } from '@/lib/auth-errors';

interface CreateProfileRequest {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  barangay_code: string;
  city_municipality_code?: string;
  province_code?: string;
  region_code?: string;
  role_id: string;
  is_active?: boolean;
  updated_at?: string;
}

export async function POST(request: NextRequest) {
  try {
    const requestData: CreateProfileRequest = await request.json();

    // Validate required fields
    const { id, email, first_name, last_name, role_id } = requestData;
    if (!id || !email || !first_name || !last_name || !role_id) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['id', 'email', 'first_name', 'last_name', 'role_id'],
        },
        { status: 400 }
      );
    }

    // Validate UUID format before calling database function
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      console.error('Invalid UUID format:', { id: '[REDACTED]', format: typeof id });
      return NextResponse.json(
        {
          error: 'Invalid user ID format',
          details: 'User ID must be a valid UUID',
        },
        { status: 400 }
      );
    }

    console.log('Creating profile for newly created user:', { id: '[REDACTED]', email });

    // Create user profile using service role
    const supabaseAdmin = createAdminSupabaseClient();
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('auth_user_profiles')
      .upsert(requestData, {
        onConflict: 'id',
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', {
        error: profileError,
        requestData: { ...requestData, id: '[REDACTED]' },
      });
      return NextResponse.json(
        { error: 'Could not create user profile', details: profileError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      profile,
      message: 'Profile created successfully',
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
