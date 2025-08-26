import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const barangayCode = searchParams.get('barangay_code');
  const search = searchParams.get('search');

  try {
    let query = supabase
      .from('geo_subdivisions')
      .select(`
        id,
        name,
        type,
        barangay_code,
        is_active
      `)
      .eq('is_active', true)
      .order('name');

    // Filter by barangay if provided
    if (barangayCode) {
      query = query.eq('barangay_code', barangayCode);
    }

    // Add search filter if provided
    if (search && search.trim() !== '') {
      query = query.ilike('name', `%${search.trim()}%`);
    }

    const { data: subdivisions, error } = await query.limit(100);

    if (error) {
      console.error('Error fetching subdivisions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subdivisions', details: error.message },
        { status: 500 }
      );
    }

    // Transform data to match SelectField format
    const options = subdivisions?.map((subdivision) => ({
      value: subdivision.id,
      label: subdivision.name,
      barangay_code: subdivision.barangay_code,
      type: subdivision.type,
    })) || [];

    return NextResponse.json({
      success: true,
      data: options,
      count: options.length,
    });

  } catch (error) {
    console.error('Unexpected error in subdivisions API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}