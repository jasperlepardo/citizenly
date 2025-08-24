import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provinceCode = searchParams.get('province');

    // Build query
    let query = supabase
      .from('psgc_cities_municipalities')
      .select('code, name, type, province_code')
      .order('name');

    // Filter by province if provided
    if (provinceCode) {
      query = query.eq('province_code', provinceCode);
    }

    const { data: cities, error: citiesError } = await query;

    if (citiesError) {
      console.error('Cities query error:', citiesError);
      return NextResponse.json({ error: 'Failed to fetch cities/municipalities' }, { status: 500 });
    }

    // Transform data to match SelectField format
    const options = cities?.map((city) => ({
      value: city.code,
      label: city.name,
      province_code: city.province_code,
      type: city.type,
    })) || [];

    return NextResponse.json({
      success: true,
      data: options,
      count: options.length,
    });
  } catch (error) {
    console.error('Cities API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
