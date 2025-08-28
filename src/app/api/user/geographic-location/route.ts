import { NextRequest, NextResponse } from 'next/server';

import { createPublicSupabaseClient, createAdminSupabaseClient } from '@/lib/data/client-factory';

export async function GET(request: NextRequest) {
  try {
    // Get auth header from the request
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - No auth token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // Create regular client to verify user
    const supabase = createPublicSupabaseClient();

    // Verify the user token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    // Use admin client to get complete geographic hierarchy
    const supabaseAdmin = createAdminSupabaseClient() as any;

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
      .select(
        `
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
      `
      )
      .eq('code', profile.barangay_code)
      .single();

    if (hierarchyError || !hierarchy) {
      return NextResponse.json({ error: 'Geographic hierarchy not found' }, { status: 404 });
    }

    const city = (hierarchy as any).psgc_cities_municipalities;
    const province = (city as any).psgc_provinces;
    const region = (province as any).psgc_regions;

    return NextResponse.json({
      region: { code: region.code, name: region.name },
      province: { code: province.code, name: province.name },
      city: { code: (city as any).code, name: (city as any).name },
      barangay: { code: hierarchy.code, name: hierarchy.name },
    });
  } catch (error) {
    console.error('Geographic location API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
