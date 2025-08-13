import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Use service role client to bypass RLS for geographic data
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get regions data
    const { data: regions, error } = await supabase
      .from('psgc_regions')
      .select('code, name')
      .order('name');

    if (error) {
      console.error('Regions query error:', error);
      return NextResponse.json({ error: 'Failed to fetch regions' }, { status: 500 });
    }

    return NextResponse.json({
      data: regions || [],
    });
  } catch (error) {
    console.error('Regions API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}