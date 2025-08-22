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
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user profile to get barangay_code
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('auth_user_profiles')
      .select('barangay_code')
      .eq('id', user.id)
      .single();

    console.log('User profile query result:', {
      userId: user.id,
      userProfile,
      profileError,
    });

    if (profileError || !userProfile?.barangay_code) {
      return NextResponse.json(
        { error: 'User profile not found or no barangay assigned' },
        { status: 400 }
      );
    }

    const barangayCode = userProfile.barangay_code;

    // Get dashboard stats from system table - handle case where no data exists
    const { data: dashboardStats, error: statsError } = await supabaseAdmin
      .from('system_dashboard_summaries')
      .select('*')
      .eq('barangay_code', barangayCode)
      .maybeSingle();

    console.log('Dashboard query result:', {
      barangayCode,
      dashboardStats,
      statsError,
    });

    if (statsError) {
      console.error('Dashboard stats query error:', statsError);
      return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
    }

    // If no stats data exists for this barangay, provide defaults
    const statsData = dashboardStats || {
      total_residents: 0,
      total_households: 0,
      seniors: 0,
      employed: 0,
    };

    // Get individual residents data for additional processing if needed
    const { data: residentsData, error: residentsError } = await supabaseAdmin
      .from('api_residents_with_geography')
      .select('birthdate, sex, civil_status, employment_status, is_labor_force_employed')
      .eq('barangay_code', barangayCode);

    console.log('Residents data query result:', {
      barangayCode,
      residentsCount: residentsData?.length || 0,
      residentsError,
      sampleResident: residentsData?.[0],
    });

    // If no individual residents data, try direct residents table query
    if (!residentsData || residentsData.length === 0) {
      console.log('No residents from view, trying direct table query...');
      const { data: directResidents, error: directError } = await supabaseAdmin
        .from('residents')
        .select('id, birthdate, sex, civil_status, employment_status')
        .eq('barangay_code', barangayCode)
        .eq('is_active', true);

      console.log('Direct residents query:', {
        count: directResidents?.length || 0,
        error: directError,
        sample: directResidents?.[0],
      });
    }

    const response = {
      stats: {
        residents: statsData.total_residents || 0,
        households: statsData.total_households || 0,
        businesses: 0, // TODO: Add when businesses table exists
        certifications: 0, // TODO: Add when certifications table exists
        seniorCitizens: statsData.age_65_plus || 0, // Using 65+ from system_dashboard_summaries
        employedResidents: statsData.employed_count || 0,
      },
      // Additional demographic data for charts
      demographics: {
        ageGroups: {
          youngDependents: statsData.age_0_14 || 0,
          workingAge: statsData.age_15_64 || 0,
          oldDependents: statsData.age_65_plus || 0,
        },
        sexDistribution: {
          male: statsData.male_count || 0,
          female: statsData.female_count || 0,
        },
        civilStatus: {
          single: statsData.single_count || 0,
          married: statsData.married_count || 0,
          widowed: statsData.widowed_count || 0,
          divorced: statsData.divorced_separated_count || 0,
        },
        employment: {
          laborForce: (statsData.employed_count || 0) + (statsData.unemployed_count || 0),
          employed: statsData.employed_count || 0,
          unemployed: statsData.unemployed_count || 0,
        },
        specialCategories: {
          pwd: 0, // Not available in system_dashboard_summaries
          soloParents: 0, // Not available in system_dashboard_summaries  
          ofw: 0, // Not available in system_dashboard_summaries
          indigenous: 0, // Not available in system_dashboard_summaries
        },
      },
      residentsData: residentsData || [],
      barangayCode: barangayCode,
    };

    console.log('Final API response:', JSON.stringify(response, null, 2));

    return NextResponse.json(response);
  } catch (error) {
    console.error('Dashboard stats API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
