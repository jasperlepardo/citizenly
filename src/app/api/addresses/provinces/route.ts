import { NextRequest, NextResponse } from 'next/server';

import { createAdminSupabaseClient } from '@/lib';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient() as any;
    const { searchParams } = new URL(request.url);
    const regionCode = searchParams.get('region');

    // Build query
    let query = supabase.from('psgc_provinces').select('code, name, region_code').order('name');

    // Filter by region if provided
    if (regionCode) {
      query = query.eq('region_code', regionCode);
    }

    const { data: provinces, error: provincesError } = await query;

    if (provincesError) {
      console.error('Provinces query error:', provincesError);
      return NextResponse.json({ error: 'Failed to fetch provinces' }, { status: 500 });
    }

    // Transform data to match SelectField format
    const options =
      provinces?.map((province: any) => ({
        value: province.code,
        label: province.name,
        region_code: province.region_code,
      })) || [];

    return NextResponse.json({
      success: true,
      data: options,
      count: options.length,
    });
  } catch (error) {
    console.error('Provinces API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
