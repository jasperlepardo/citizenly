import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/data/client-factory';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const barangayCode = searchParams.get('barangay_code');
  const subdivisionId = searchParams.get('subdivision_id');
  const search = searchParams.get('search');

  try {
    const supabase = createAdminSupabaseClient();
    let query = supabase
      .from('geo_streets')
      .select(`
        id,
        name,
        subdivision_id,
        barangay_code,
        is_active
      `)
      .eq('is_active', true)
      .order('name');

    // Filter by barangay if provided
    if (barangayCode) {
      query = query.eq('barangay_code', barangayCode);
    }

    // Filter by subdivision if provided
    if (subdivisionId) {
      const subdivisionIdNum = Number(subdivisionId);
      if (!Number.isNaN(subdivisionIdNum)) {
        query = query.eq('subdivision_id', subdivisionIdNum);
      }
    }

    // Add search filter if provided
    if (search && search.trim() !== '') {
      query = query.ilike('name', `%${search.trim()}%`);
    }

    const { data: streets, error } = await query.limit(100);

    if (error) {
      console.error('Error fetching streets:', error);
      return NextResponse.json(
        { error: 'Failed to fetch streets' },
        { status: 500 }
      );
    }

    // Transform data to match SelectField format
    const options = streets?.map((street: { id: string; name: string; subdivision_id: number | null; barangay_code: string | null }) => ({
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}