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

    // Get dashboard stats using service role
    const [householdSummaryResult, residentsResult, householdCountResult] = await Promise.all([
      // Try to get household summary via RPC
      supabaseAdmin.rpc('get_household_summary', {
        user_barangay: barangayCode,
      }),

      // Get residents data for demographics
      supabaseAdmin
        .from('residents')
        .select('birthdate, sex, civil_status, employment_status, is_employed')
        .eq('barangay_code', barangayCode)
        .eq('is_active', true),

      // Get household count
      supabaseAdmin
        .from('households')
        .select('*', { count: 'exact', head: true })
        .eq('barangay_code', barangayCode),
    ]);

    // Handle errors gracefully
    let summaryData = {
      total_households: 0,
      total_residents: 0,
      avg_household_size: 0,
      senior_citizens: 0,
      pwd_residents: 0,
    };

    if (householdSummaryResult.data && householdSummaryResult.data[0]) {
      summaryData = householdSummaryResult.data[0];
    } else if (householdSummaryResult.error) {
      console.warn('Household summary RPC failed:', householdSummaryResult.error);
    }

    // Use household count from direct query if RPC didn't provide it
    if (summaryData.total_households === 0 && householdCountResult.count) {
      summaryData.total_households = householdCountResult.count;
    }

    const residentsData = residentsResult.data || [];

    return NextResponse.json({
      stats: {
        residents: summaryData.total_residents,
        households: summaryData.total_households,
        businesses: 0, // TODO: Add when businesses table exists
        certifications: 0, // TODO: Add when certifications table exists
        seniorCitizens: summaryData.senior_citizens,
        employedResidents: residentsData.filter(r => r.is_employed === true).length,
      },
      residentsData: residentsData,
      barangayCode: barangayCode,
    });
  } catch (error) {
    console.error('Dashboard stats API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
