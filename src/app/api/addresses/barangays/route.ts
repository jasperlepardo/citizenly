import { NextRequest, NextResponse } from 'next/server';

import { createAdminSupabaseClient } from '@/lib';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient() as any;
    const { searchParams } = new URL(request.url);
    const cityCode = searchParams.get('city');

    // Build query
    let query = supabase
      .from('psgc_barangays')
      .select('code, name, city_municipality_code')
      .order('name');

    // Filter by city if provided
    if (cityCode) {
      query = query.eq('city_municipality_code', cityCode);
    }

    const { data: barangays, error: barangaysError } = await query;

    if (barangaysError) {
      console.error('Barangays query error:', barangaysError);
      return NextResponse.json({ error: 'Failed to fetch barangays' }, { status: 500 });
    }

    // Transform data to match SelectField format
    const options =
      barangays?.map((barangay: any) => ({
        value: barangay.code,
        label: barangay.name,
        city_municipality_code: barangay.city_municipality_code,
      })) || [];

    return NextResponse.json({
      success: true,
      data: options,
      count: options.length,
    });
  } catch (error) {
    console.error('Barangays API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
