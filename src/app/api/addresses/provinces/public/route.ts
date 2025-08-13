import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const regionCode = searchParams.get('regionCode');

    if (!regionCode) {
      return NextResponse.json({ error: 'regionCode parameter is required' }, { status: 400 });
    }

    // Use service role client to bypass RLS for geographic data
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get provinces data for the specified region
    const { data: provinces, error } = await supabase
      .from('psgc_provinces')
      .select('code, name')
      .eq('region_code', regionCode)
      .order('name');

    if (error) {
      console.error('Provinces query error:', error);
      return NextResponse.json({ error: 'Failed to fetch provinces' }, { status: 500 });
    }

    return NextResponse.json({
      data: provinces || [],
    });
  } catch (error) {
    console.error('Provinces API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}