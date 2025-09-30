import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get auth header from the request
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - No auth token' }, { status: 401 });
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
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    // Use service role client to check data directly
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user profile first
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('auth_user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        {
          error: 'Failed to get user profile',
          details: profileError,
        },
        { status: 500 }
      );
    }

    // Check total residents in database
    const { count: totalResidents } = await supabaseAdmin
      .from('residents')
      .select('*', { count: 'exact', head: true });

    // Check residents for user's barangay (via households join)
    let residentsInBarangay = 0;
    if (userProfile?.barangay_code) {
      const { count } = await supabaseAdmin
        .from('residents')
        .select('*, households!inner(barangay_code)', { count: 'exact', head: true })
        .eq('households.barangay_code', userProfile.barangay_code)
        .eq('is_active', true);
      residentsInBarangay = count || 0;
    }

    // Check what barangay codes exist in households table (residents don't have geographic fields)
    const { data: barangayCodes } = await supabaseAdmin
      .from('households')
      .select('barangay_code')
      .limit(10);

    // Check with user RLS policies (using user token) - need to join via households
    let rls_error = null;
    let rls_count = 0;
    try {
      if (userProfile?.barangay_code) {
        const { count, error } = await supabase
          .from('residents')
          .select('*, households!inner(barangay_code)', { count: 'exact', head: true })
          .eq('households.barangay_code', userProfile.barangay_code)
          .eq('is_active', true);

        if (error) {
          rls_error = error;
        } else {
          rls_count = count || 0;
        }
      }
    } catch (error) {
      rls_error = error;
    }

    return NextResponse.json({
      user_id: user.id,
      user_profile: userProfile,
      total_residents_in_db: totalResidents || 0,
      residents_in_user_barangay: residentsInBarangay,
      barangay_codes_sample: barangayCodes?.map(b => b.barangay_code).filter(Boolean) || [],
      rls_test: {
        count: rls_count,
        error: rls_error,
      },
    });
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 });
  }
}
