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

    // Ensure household is created in user's barangay
    const newHouseholdData = {
      ...householdData,
      barangay_code: userProfile.barangay_code,
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

    // Build the households query
    let query = supabaseAdmin
      .from('households')
      .select(
        `
        *,
        head_resident:residents!households_household_head_id_fkey(
          id,
          first_name,
          middle_name,
          last_name
        )
        `,
        { count: 'exact' }
      )
      .eq('barangay_code', userProfile.barangay_code)
      .order('code', { ascending: true });

    // Add search if provided
    if (searchTerm.trim()) {
      query = query.or(`code.ilike.%${searchTerm}%,street_name.ilike.%${searchTerm}%`);
    }

    const { data: households, error: householdsError, count } = await query;

    if (householdsError) {
      console.error('Households query error:', householdsError);
      return NextResponse.json({ error: 'Failed to fetch households' }, { status: 500 });
    }

    // Get member counts and geographic information for each household
    const householdsWithDetails = await Promise.all(
      (households || []).map(async household => {
        try {
          // Get member count
          const { count: memberCount } = await supabaseAdmin
            .from('residents')
            .select('*', { count: 'exact', head: true })
            .eq('household_code', household.code);

          // Get geographic information from PSGC tables
          const { data: barangayData } = await supabaseAdmin
            .from('psgc_barangays')
            .select(
              `
              code,
              name,
              psgc_cities_municipalities!inner(
                code,
                name,
                type,
                psgc_provinces!inner(
                  code,
                  name,
                  psgc_regions!inner(
                    code,
                    name
                  )
                )
              )
              `
            )
            .eq('code', household.barangay_code)
            .single();

          let geoInfo = {};
          if (barangayData) {
            const cityMunData = barangayData.psgc_cities_municipalities as any;
            const province = cityMunData.psgc_provinces;
            const region = province.psgc_regions;

            geoInfo = {
              barangay_info: {
                code: barangayData.code,
                name: barangayData.name,
              },
              city_municipality_info: {
                code: cityMunData.code,
                name: cityMunData.name,
                type: cityMunData.type,
              },
              province_info: {
                code: province.code,
                name: province.name,
              },
              region_info: {
                code: region.code,
                name: region.name,
              },
            };
          }

          return {
            ...household,
            member_count: memberCount || 0,
            ...geoInfo,
          };
        } catch (detailError) {
          console.warn('Failed to get household details:', detailError);
          return {
            ...household,
            member_count: 0,
          };
        }
      })
    );

    return NextResponse.json({
      data: householdsWithDetails,
      total: count || 0,
    });
  } catch (error) {
    console.error('Households API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
