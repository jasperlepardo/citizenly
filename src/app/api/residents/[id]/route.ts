import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const residentId = params.id;

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
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Get user profile to verify barangay access
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

    // Get resident data
    const { data: resident, error: residentError } = await supabaseAdmin
      .from('residents')
      .select('*')
      .eq('id', residentId)
      .eq('barangay_code', userProfile.barangay_code) // Ensure same barangay
      .single();

    if (residentError || !resident) {
      return NextResponse.json({ error: 'Resident not found or access denied' }, { status: 404 });
    }

    // Get household information if exists
    let household = null;
    if (resident.household_code) {
      const { data: householdData, error: householdError } = await supabaseAdmin
        .from('households')
        .select('*')
        .eq('code', resident.household_code)
        .single();

      if (!householdError && householdData) {
        household = householdData;
      }
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
        .eq('code', resident.barangay_code)
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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const residentId = params.id;
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
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Get user profile to verify barangay access
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

    // Update resident data (only allow updates within same barangay)
    const { data: updatedResident, error: updateError } = await supabaseAdmin
      .from('residents')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', residentId)
      .eq('barangay_code', userProfile.barangay_code) // Ensure same barangay
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
