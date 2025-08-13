import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cityCode = searchParams.get('city');

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
      .from('psgc_barangays')
      .select('code, name, city_municipality_code')
      .order('name');

    // Filter by city if provided
    if (cityCode) {
      query = query.eq('city_municipality_code', cityCode);
    }

    const { data: barangays, error: barangaysError } = await query;

    if (barangaysError) {
      console.error('Barangays query error:', barangaysError);
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
