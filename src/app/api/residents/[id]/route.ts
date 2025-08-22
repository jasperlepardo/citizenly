import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const residentId = resolvedParams.id;

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

    // Get resident data with household join to check barangay access
    const { data: residentWithHousehold, error: residentError } = await supabaseAdmin
      .from('residents')
      .select(`
        *,
        households!inner(
          code,
          barangay_code,
          name,
          address,
          house_number,
          street_id,
          subdivision_id,
          city_municipality_code,
          province_code,
          region_code,
          zip_code,
          no_of_families,
          no_of_household_members,
          no_of_migrants,
          household_type,
          tenure_status,
          tenure_others_specify,
          household_unit,
          monthly_income,
          income_class,
          household_head_id,
          household_head_position,
          is_active,
          created_by,
          updated_by,
          created_at,
          updated_at
        )
      `)
      .eq('id', residentId)
      .eq('households.barangay_code', userProfile.barangay_code) // Ensure same barangay through household
      .single();

    if (residentError || !residentWithHousehold) {
      return NextResponse.json({ error: 'Resident not found or access denied' }, { status: 404 });
    }

    const resident = residentWithHousehold;
    const household = resident.households;

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
      resident: {
        ...resident,
        ...geoInfo,
      },
      household,
    });
  } catch (error) {
    console.error('Resident detail API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const residentId = resolvedParams.id;
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

    // First check if resident exists and user has access through household
    const { data: existingResident, error: checkError } = await supabaseAdmin
      .from('residents')
      .select(`
        id,
        household_code,
        households!inner(barangay_code)
      `)
      .eq('id', residentId)
      .eq('households.barangay_code', userProfile.barangay_code)
      .single();

    if (checkError || !existingResident) {
      return NextResponse.json({ error: 'Resident not found or access denied' }, { status: 404 });
    }

    // Update resident data (access already verified)
    const { data: updatedResident, error: updateError } = await supabaseAdmin
      .from('residents')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', residentId)
      .select()
      .single();

    if (updateError) {
      console.error('Resident update error:', updateError);
      return NextResponse.json({ error: 'Failed to update resident' }, { status: 500 });
    }

    if (!updatedResident) {
      return NextResponse.json({ error: 'Resident not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({
      resident: updatedResident,
      message: 'Resident updated successfully',
    });
  } catch (error) {
    console.error('Resident update API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
