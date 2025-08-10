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

    // Use service role client to bypass RLS for this specific query
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Get user profile to get barangay_code
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('barangay_code')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile?.barangay_code) {
      return NextResponse.json(
        { error: 'User profile not found or no barangay assigned' },
        { status: 400 }
      );
    }

    const barangayCode = userProfile.barangay_code;

    // Get dashboard stats using optimized flat view
    const { data: dashboardStats, error: statsError } = await supabaseAdmin
      .from('api_dashboard_stats')
      .select('*')
      .eq('barangay_code', barangayCode)
      .single();

    if (statsError) {
      console.error('Dashboard stats query error:', statsError);
      return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
    }

    // Get individual residents data for additional processing if needed
    const { data: residentsData } = await supabaseAdmin
      .from('api_residents_with_geography')
      .select('birthdate, sex, civil_status, employment_status, is_employed')
      .eq('barangay_code', barangayCode);

    return NextResponse.json({
      stats: {
        residents: dashboardStats?.total_residents || 0,
        households: dashboardStats?.total_households || 0,
        businesses: 0, // TODO: Add when businesses table exists
        certifications: 0, // TODO: Add when certifications table exists
        seniorCitizens: dashboardStats?.senior_citizens || 0,
        employedResidents: dashboardStats?.employed_residents || 0,
      },
      residentsData: residentsData || [],
      barangayCode: barangayCode,
    });
  } catch (error) {
    console.error('Dashboard stats API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
