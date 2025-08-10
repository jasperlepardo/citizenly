import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const regionCode = searchParams.get('region');

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
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Build query
    let query = supabaseAdmin
      .from('psgc_provinces')
      .select('code, name, region_code')
      .order('name');

    // Filter by region if provided
    if (regionCode) {
      query = query.eq('region_code', regionCode);
    }

    const { data: provinces, error: provincesError } = await query;

    if (provincesError) {
      console.error('Provinces query error:', provincesError);
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
