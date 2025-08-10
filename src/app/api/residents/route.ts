import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    const { create_household, resident_data: residentData, ...directResidentData } = requestData;

    // Support both formats: direct resident data or nested structure
    const finalResidentData = residentData || directResidentData;

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
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Get user profile with full geographic access info
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('auth_user_profiles')
      .select('barangay_code, city_municipality_code, province_code, region_code, role')
      .eq('user_id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 400 });
    }

    let householdCode = finalResidentData.household_code;

    // Handle inline household creation if requested
    if (create_household && !householdCode) {
      const householdData = {
        ...create_household,
        barangay_code: create_household.barangay_code || userProfile.barangay_code,
        city_municipality_code:
          create_household.city_municipality_code || userProfile.city_municipality_code,
        province_code: create_household.province_code || userProfile.province_code,
        region_code: create_household.region_code || userProfile.region_code,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
      };

      const { data: newHousehold, error: householdError } = await supabaseAdmin
        .from('households')
        .insert([householdData])
        .select('code')
        .single();

      if (householdError) {
        console.error('Household creation error:', householdError);
        return NextResponse.json({ error: 'Failed to create household' }, { status: 500 });
      }

      householdCode = newHousehold.code;
    }

    // Prepare resident data - let database trigger handle auto-population from household
    const newResidentData = {
      ...finalResidentData,
      household_code: householdCode,
      // Don't override geographic fields if household_code is provided - let trigger handle it
      // If no household_code, fall back to user's geographic profile
      ...(householdCode
        ? {}
        : {
            barangay_code: finalResidentData.barangay_code || userProfile.barangay_code,
            city_municipality_code:
              finalResidentData.city_municipality_code || userProfile.city_municipality_code,
            province_code: finalResidentData.province_code || userProfile.province_code,
            region_code: finalResidentData.region_code || userProfile.region_code,
          }),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
    };

    const { data: newResident, error: createError } = await supabaseAdmin
      .from('residents')
      .insert([newResidentData])
      .select()
      .single();

    if (createError) {
      console.error('Resident creation error:', createError);
      return NextResponse.json({ error: 'Failed to create resident' }, { status: 500 });
    }

    // Prepare response
    const response: any = {
      resident: newResident,
      message: create_household
        ? 'Household and resident created successfully'
        : 'Resident created successfully',
    };

    // Include household code in response if household was created
    if (create_household && householdCode) {
      response.household_code = householdCode;
    }

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Resident creation API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
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
    // This is safe because we've already verified the user's authentication
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Get user profile with full geographic access info
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('auth_user_profiles')
      .select('barangay_code, city_municipality_code, province_code, region_code, role')
      .eq('user_id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 400 });
    }

    // Get user role to determine access level
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('auth_roles')
      .select('access_level')
      .eq('role_name', userProfile.role)
      .single();

    if (roleError || !roleData) {
      return NextResponse.json({ error: 'User role not found' }, { status: 400 });
    }

    const accessLevel = roleData.access_level;

    // Build the query using optimized flat view with multi-level filtering
    let query = supabaseAdmin
      .from('api_residents_with_geography')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

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
      // Search in name fields and email
      query = query.or(
        `first_name.ilike.%${searchTerm}%,middle_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
      );
    }

    // Add pagination
    query = query.range((page - 1) * pageSize, page * pageSize - 1);

    const { data: residents, error: residentsError, count } = await query;

    if (residentsError) {
      console.error('Residents query error:', residentsError);
      return NextResponse.json({ error: 'Failed to fetch residents' }, { status: 500 });
    }

    return NextResponse.json({
      data: residents || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    });
  } catch (error) {
    console.error('Residents API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
