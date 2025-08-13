import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provinceCode = searchParams.get('provinceCode');

    if (!provinceCode) {
      return NextResponse.json({ error: 'provinceCode parameter is required' }, { status: 400 });
    }

    // Use service role client to bypass RLS for geographic data
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get cities/municipalities data for the specified province
    const { data: cities, error } = await supabase
      .from('psgc_cities_municipalities')
      .select('code, name')
      .eq('province_code', provinceCode)
      .order('name');

    if (error) {
      console.error('Cities query error:', error);
      return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 });
    }

    return NextResponse.json({
      data: cities || [],
    });
  } catch (error) {
    console.error('Cities API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}