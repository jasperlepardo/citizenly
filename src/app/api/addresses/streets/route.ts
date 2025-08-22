import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const barangayCode = searchParams.get('barangay');
    const subdivisionId = searchParams.get('subdivision');

    // Get auth header from the request
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - No auth token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // Create regular client to verify user
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Verify the user token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    // Use service role client to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Build query
    let query = supabaseAdmin
      .from('geo_streets')
      .select('id, name, subdivision_id, barangay_code')
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

    const { data: streets, error: streetsError } = await query;

    if (streetsError) {
      console.error('Streets query error:', streetsError);
      return NextResponse.json({ error: 'Failed to fetch streets' }, { status: 500 });
    }

    return NextResponse.json({
      data: streets || [],
    });
  } catch (error) {
    console.error('Streets API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}