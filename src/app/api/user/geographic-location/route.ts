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

    // Use service role client to get complete geographic hierarchy
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user profile with geographic codes
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('auth_user_profiles')
      .select('barangay_code, city_municipality_code, province_code, region_code')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get complete geographic hierarchy in a single query
    const { data: hierarchy, error: hierarchyError } = await supabaseAdmin
      .from('psgc_barangays')
      .select(`
        code,
        name,
        psgc_cities_municipalities!inner(
          code,
          name,
          psgc_provinces!inner(
            code,
            name,
            psgc_regions!inner(
              code,
              name
            )
          )
        )
      `)
      .eq('code', profile.barangay_code)
      .single();

    if (hierarchyError || !hierarchy) {
      return NextResponse.json({ error: 'Geographic hierarchy not found' }, { status: 404 });
    }

    const city = hierarchy.psgc_cities_municipalities;
    const province = city.psgc_provinces;
    const region = province.psgc_regions;

    return NextResponse.json({
      region: { code: region.code, name: region.name },
      province: { code: province.code, name: province.name },
      city: { code: city.code, name: city.name },
      barangay: { code: hierarchy.code, name: hierarchy.name }
    });

  } catch (error) {
    console.error('Geographic location API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}