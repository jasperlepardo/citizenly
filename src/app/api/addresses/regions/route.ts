import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/data/client-factory';

export async function GET(_request: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient();
    
    // Get regions data
    const { data: regions, error: regionsError } = await supabase
      .from('psgc_regions')
      .select('code, name')
      .order('name');

    // Type the regions array properly
    type RegionResult = {
      code: string;
      name: string;
    };

    if (regionsError) {
      console.error('Regions query error:', regionsError);
      return NextResponse.json({ error: 'Failed to fetch regions' }, { status: 500 });
    }

    // Transform data to match SelectField format
    const options =
      (regions as RegionResult[])?.map(region => ({
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
