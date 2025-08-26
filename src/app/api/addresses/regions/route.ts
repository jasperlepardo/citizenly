import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get regions data
    const { data: regions, error: regionsError } = await supabase
      .from('psgc_regions')
      .select('code, name')
      .order('name');

    if (regionsError) {
      console.error('Regions query error:', regionsError);
      return NextResponse.json({ error: 'Failed to fetch regions' }, { status: 500 });
    }

    // Transform data to match SelectField format
    const options =
      regions?.map(region => ({
        value: region.code,
        label: region.name,
      })) || [];

    return NextResponse.json({
      success: true,
      data: options,
      count: options.length,
    });
  } catch (error) {
    console.error('Regions API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
