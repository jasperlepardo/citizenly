import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cityCode = searchParams.get('cityCode');

    if (!cityCode) {
      return NextResponse.json({ error: 'cityCode parameter is required' }, { status: 400 });
    }

    // Use service role client to bypass RLS for geographic data
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get barangays data for the specified city/municipality
    const { data: barangays, error } = await supabase
      .from('psgc_barangays')
      .select('code, name')
      .eq('city_municipality_code', cityCode)
      .order('name');

    if (error) {
      console.error('Barangays query error:', error);
      return NextResponse.json({ error: 'Failed to fetch barangays' }, { status: 500 });
    }

    return NextResponse.json({
      data: barangays || [],
    });
  } catch (error) {
    console.error('Barangays API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}