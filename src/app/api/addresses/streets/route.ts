import { NextRequest, NextResponse } from 'next/server';

import { createAdminSupabaseClient } from '@/lib';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const barangayCode = searchParams.get('barangay_code');
  const subdivisionId = searchParams.get('subdivision_id');
  const search = searchParams.get('search');

  try {
    const supabase = createAdminSupabaseClient() as any;

    let query = supabase
      .from('geo_streets')
      .select(
        `
        id,
        name,
        subdivision_id,
        barangay_code,
        is_active
      `
      )
      .eq('is_active', true)
      .order('name');

    // Filter by barangay if provided
    if (barangayCode) {
      query = query.eq('barangay_code', barangayCode);
    }

    // Filter by subdivision if provided
    if (subdivisionId) {
      query = query.eq('subdivision_id', subdivisionId);
    }

    // Add search filter if provided
    if (search && search.trim() !== '') {
      query = query.ilike('name', `%${search.trim()}%`);
    }

    const { data: streets, error } = await query.limit(100);

    if (error) {
      console.error('Error fetching streets:', error);
      return NextResponse.json(
        { error: 'Failed to fetch streets', details: error.message },
        { status: 500 }
      );
    }

    // Transform data to match SelectField format
    const options =
      streets?.map((street: any) => ({
        value: street.id,
        label: street.name,
        subdivision_id: street.subdivision_id,
        barangay_code: street.barangay_code,
      })) || [];

    return NextResponse.json({
      success: true,
      data: options,
      count: options.length,
    });
  } catch (error) {
    console.error('Unexpected error in streets API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
