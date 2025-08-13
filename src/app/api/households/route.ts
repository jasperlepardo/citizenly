import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const householdData = await request.json();

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

    // Use service role client to bypass RLS for this specific operation
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user profile with full geographic access info
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('auth_user_profiles')
      .select('barangay_code, city_municipality_code, province_code, region_code, role_id')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 400 });
    }

    // Ensure household has required geographic data based on user's access level
    const newHouseholdData = {
      ...householdData,
      barangay_code: householdData.barangay_code || userProfile.barangay_code,
      city_municipality_code:
        householdData.city_municipality_code || userProfile.city_municipality_code,
      province_code: householdData.province_code || userProfile.province_code,
      region_code: householdData.region_code || userProfile.region_code,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: newHousehold, error: createError } = await supabaseAdmin
      .from('households')
      .insert([newHouseholdData])
      .select()
      .single();

    if (createError) {
      console.error('Household creation error:', createError);
      return NextResponse.json({ error: 'Failed to create household' }, { status: 500 });
    }

    return NextResponse.json(
      {
        household: newHousehold,
        message: 'Household created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Household creation API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search') || '';

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

    // Get user profile with full geographic access info
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('auth_user_profiles')
      .select('barangay_code, city_municipality_code, province_code, region_code, role_id')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 400 });
    }

    // Get user role to determine access level
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('auth_roles')
      .select('name')
      .eq('id', userProfile.role_id)
      .single();

    if (roleError || !roleData) {
      return NextResponse.json({ error: 'User role not found' }, { status: 400 });
    }

    // Determine access level from role name
    const accessLevel = roleData.name.includes('barangay') ? 'barangay' :
                       roleData.name.includes('city') ? 'city' :
                       roleData.name.includes('province') ? 'province' :
                       roleData.name.includes('region') ? 'region' :
                       roleData.name.includes('national') ? 'national' : 'barangay';

    // Build the households query using optimized flat view with multi-level filtering
    let query = supabaseAdmin
      .from('api_households_with_members')
      .select('*', { count: 'exact' })
      .order('code', { ascending: true });

    // Apply geographic filtering based on user's access level
    switch (accessLevel) {
      case 'barangay':
        if (userProfile.barangay_code) {
          query = query.eq('barangay_code', userProfile.barangay_code);
        }
        break;
      case 'city':
        if (userProfile.city_municipality_code) {
          query = query.eq('city_municipality_code', userProfile.city_municipality_code);
        }
        break;
      case 'province':
        if (userProfile.province_code) {
          query = query.eq('province_code', userProfile.province_code);
        }
        break;
      case 'region':
        if (userProfile.region_code) {
          query = query.eq('region_code', userProfile.region_code);
        }
        break;
      case 'national':
        // No filtering - national access sees all
        break;
      default:
        // Default to barangay-level access for security
        if (userProfile.barangay_code) {
          query = query.eq('barangay_code', userProfile.barangay_code);
        }
    }

    // Add search if provided
    if (searchTerm.trim()) {
      query = query.or(`code.ilike.%${searchTerm}%,street_name.ilike.%${searchTerm}%`);
    }

    const { data: households, error: householdsError, count } = await query;

    if (householdsError) {
      console.error('Households query error:', householdsError);
      return NextResponse.json({ error: 'Failed to fetch households' }, { status: 500 });
    }

    return NextResponse.json({
      data: households || [],
      total: count || 0,
    });
  } catch (error) {
    console.error('Households API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
