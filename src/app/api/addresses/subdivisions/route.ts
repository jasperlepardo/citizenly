/**
 * Subdivisions API Route
 * Query parameters: ?barangay_code=BARANGAY_CODE&search=SEARCH_TERM
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const barangayCode = searchParams.get('barangay_code');
    const searchTerm = searchParams.get('search') || '';

    // Use service role client to bypass RLS for geographic reference data
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Build query for geo_subdivisions table
    let query = supabase
      .from('geo_subdivisions')
      .select('id, name, type, barangay_code')
      .eq('is_active', true);

    // Filter by barangay if provided
    if (barangayCode) {
      query = query.eq('barangay_code', barangayCode);
    }

    // Add search filter if provided
    if (searchTerm) {
      query = query.ilike('name', `%${searchTerm}%`);
    }

    // Order by name
    query = query.order('name');

    const { data: subdivisions, error } = await query;

    if (error) {
      console.error('Error fetching subdivisions:', error);
      return NextResponse.json({ error: `Failed to fetch subdivisions: ${error.message}` }, { status: 500 });
    }

    // Transform to expected format
    const options = (subdivisions || []).map((subdivision: any) => ({
      value: subdivision.id,
      label: subdivision.name,
      barangay_code: subdivision.barangay_code,
      type: subdivision.type,
    }));

    return NextResponse.json({
      data: options,
      message: 'Subdivisions retrieved successfully'
    });
  } catch (error) {
    console.error('Subdivisions API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { name, barangay_code, type = 'Subdivision' } = body;

    // Validate required fields
    if (!name || !barangay_code) {
      return NextResponse.json({
        error: 'Missing required fields: name and barangay_code are required'
      }, { status: 400 });
    }

    // Get auth header from the request for POST operations (creating data requires auth)
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - No auth token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // Verify user authentication
    const publicClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const {
      data: { user },
      error: authError,
    } = await publicClient.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    // Use service role client for database operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if subdivision already exists in the same barangay
    const { data: existingSubdivision } = await supabase
      .from('geo_subdivisions')
      .select('id, name')
      .eq('name', name.trim())
      .eq('barangay_code', barangay_code)
      .eq('is_active', true)
      .single();

    if (existingSubdivision) {
      return NextResponse.json({
        error: 'A subdivision with this name already exists in the selected barangay'
      }, { status: 409 });
    }

    // Get city and province from barangay for auto-population
    const { data: barangayData } = await supabase
      .from('psgc_barangays')
      .select('city_municipality_code')
      .eq('code', barangay_code)
      .single();

    let cityCode = null;
    let provinceCode = null;
    let regionCode = null;

    if (barangayData) {
      // Get city data
      const { data: cityData } = await supabase
        .from('psgc_cities_municipalities')
        .select('code, province_code')
        .eq('code', barangayData.city_municipality_code)
        .single();

      if (cityData) {
        cityCode = cityData.code;
        provinceCode = cityData.province_code;

        // Get region from province
        if (provinceCode) {
          const { data: provinceData } = await supabase
            .from('psgc_provinces')
            .select('region_code')
            .eq('code', provinceCode)
            .single();

          if (provinceData) {
            regionCode = provinceData.region_code;
          }
        }
      }
    }

    // Insert new subdivision with authenticated user
    const { data: newSubdivision, error: insertError } = await supabase
      .from('geo_subdivisions')
      .insert({
        name: name.trim(),
        type: type,
        barangay_code,
        city_municipality_code: cityCode,
        province_code: provinceCode,
        region_code: regionCode,
        is_active: true,
        created_by: user.id,
        updated_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id, name, type, barangay_code')
      .single();

    if (insertError) {
      console.error('Error creating subdivision:', insertError);
      return NextResponse.json({
        error: `Failed to create subdivision: ${insertError.message}`
      }, { status: 500 });
    }

    // Transform to expected format
    const subdivisionOption = {
      value: newSubdivision.id,
      label: newSubdivision.name,
      barangay_code: newSubdivision.barangay_code,
      type: newSubdivision.type,
    };

    return NextResponse.json({
      data: subdivisionOption,
      message: 'Subdivision created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Subdivisions POST API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
