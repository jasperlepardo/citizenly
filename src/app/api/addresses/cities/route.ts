import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provinceCode = searchParams.get('province');

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
      .from('psgc_cities_municipalities')
      .select('code, name, type, province_code')
      .order('name');

    // Filter by province if provided
    if (provinceCode) {
      query = query.eq('province_code', provinceCode);
    }

    const { data: cities, error: citiesError } = await query;

    if (citiesError) {
      console.error('Cities query error:', citiesError);
      return NextResponse.json({ error: 'Failed to fetch cities/municipalities' }, { status: 500 });
    }

    return NextResponse.json({
      data: cities || [],
    });
  } catch (error) {
    console.error('Cities API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
