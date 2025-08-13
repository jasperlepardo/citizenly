import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

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

/**
 * Fallback profile creation endpoint that bypasses strict user verification
 * Used when main endpoint fails due to timing/propagation issues
 */
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

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }

    console.log('🔄 Fallback profile creation for user:', { id: '[REDACTED]', email });
    console.log(
      '⚠️ FALLBACK MODE: Skipping user existence check - proceeding with profile creation'
    );

    // Create profile regardless of user lookup result
    // The foreign key constraint will catch any real issues
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('auth_user_profiles')
      .upsert(requestData, {
        onConflict: 'id',
      })
      .select()
      .single();

    if (profileError) {
      console.error('Fallback profile creation error:', {
        error: profileError,
        requestData: { ...requestData, id: '[REDACTED]' },
      });

      // Check if it's a foreign key error (user doesn't exist)
      if (profileError.code === '23503') {
        return NextResponse.json(
          {
            error: 'User account not found. Please wait a moment and try again.',
            code: 'USER_NOT_PROPAGATED',
            details: 'The user account may still be propagating in the system.',
          },
          { status: 422 }
        );
      }

      return NextResponse.json(
        { error: 'Could not create user profile', details: profileError.message },
        { status: 500 }
      );
    }

    console.log('✅ Fallback profile created successfully:', { id: '[REDACTED]' });

    return NextResponse.json({
      profile,
      message: 'Profile created successfully (fallback)',
      note: 'Created without user verification due to timing issues',
    });
  } catch (error) {
    console.error('Fallback API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
