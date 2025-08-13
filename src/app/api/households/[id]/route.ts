import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const householdCode = resolvedParams.id;

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

    // Use service role client to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user profile to verify barangay access
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('auth_user_profiles')
      .select('barangay_code')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile?.barangay_code) {
      return NextResponse.json(
        { error: 'User profile not found or no barangay assigned' },
        { status: 400 }
      );
    }

    // Get household data with head resident info
    const { data: household, error: householdError } = await supabaseAdmin
      .from('households')
      .select(
        `
        *,
        head_resident:residents!households_household_head_id_fkey(
          id,
          first_name,
          middle_name,
          last_name,
          email,
          mobile_number,
          sex,
          birthdate,
          civil_status
        )
        `
      )
      .eq('code', householdCode)
      .eq('barangay_code', userProfile.barangay_code) // Ensure same barangay
      .single();

    if (householdError || !household) {
      return NextResponse.json({ error: 'Household not found or access denied' }, { status: 404 });
    }

    // Get all household members
    const { data: members, error: membersError } = await supabaseAdmin
      .from('residents')
      .select('*')
      .eq('household_code', householdCode)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (membersError) {
      console.warn('Failed to fetch household members:', membersError);
    }

    // Get geographic information
    let geoInfo = {};
    try {
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
    } catch (geoError) {
      console.warn('Geographic info load failed:', geoError);
    }

    return NextResponse.json({
      household: {
        ...household,
        ...geoInfo,
        member_count: members?.length || 0,
      },
      members: members || [],
    });
  } catch (error) {
    console.error('Household detail API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const householdCode = resolvedParams.id;
    const updateData = await request.json();

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

    // Use service role client to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user profile to verify barangay access
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('auth_user_profiles')
      .select('barangay_code')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile?.barangay_code) {
      return NextResponse.json(
        { error: 'User profile not found or no barangay assigned' },
        { status: 400 }
      );
    }

    // Update household data (only allow updates within same barangay)
    const { data: updatedHousehold, error: updateError } = await supabaseAdmin
      .from('households')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('code', householdCode)
      .eq('barangay_code', userProfile.barangay_code) // Ensure same barangay
      .select()
      .single();

    if (updateError) {
      console.error('Household update error:', updateError);
      return NextResponse.json({ error: 'Failed to update household' }, { status: 500 });
    }

    if (!updatedHousehold) {
      return NextResponse.json({ error: 'Household not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({
      household: updatedHousehold,
      message: 'Household updated successfully',
    });
  } catch (error) {
    console.error('Household update API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
