import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
// Force rebuild - fixed switch case scoping issue (v2)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code || code.trim().length < 6) {
      return NextResponse.json({ error: 'Valid PSGC code is required' }, { status: 400 });
    }

    // Use service role client to bypass RLS for geographic data
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const lookupCode = code.trim();
    
    // Determine level based on code length and structure
    let level: string;
    let result: any = null;

    if (lookupCode.length === 2) {
      level = 'region';
    } else if (lookupCode.length === 4) {
      level = 'province';
    } else if (lookupCode.length === 6) {
      level = 'city';
    } else if (lookupCode.length >= 9) {
      level = 'barangay';
    } else {
      return NextResponse.json({ error: 'Invalid PSGC code format' }, { status: 400 });
    }

    // Look up based on determined level
    switch (level) {
      case 'region': {
        const { data: regionData, error: regionError } = await supabase
          .from('psgc_regions')
          .select('code, name')
          .eq('code', lookupCode)
          .single();

        if (regionError || !regionData) {
          return NextResponse.json({ error: 'Region not found' }, { status: 404 });
        }

        result = {
          code: regionData.code,
          name: regionData.name,
          level: 'region',
          region_code: regionData.code,
          region_name: regionData.name,
          full_address: regionData.name
        };
        break;
      }

      case 'province': {
        const { data: provinceData, error: provinceError } = await supabase
          .from('psgc_provinces')
          .select(`
            code,
            name,
            region_code,
            psgc_regions (code, name)
          `)
          .eq('code', lookupCode)
          .single();

        if (provinceError || !provinceData) {
          return NextResponse.json({ error: 'Province not found' }, { status: 404 });
        }

        const region = provinceData.psgc_regions;
        result = {
          code: provinceData.code,
          name: provinceData.name,
          level: 'province',
          province_code: provinceData.code,
          province_name: provinceData.name,
          region_code: region?.code,
          region_name: region?.name,
          full_address: [provinceData.name, region?.name].filter(Boolean).join(', ')
        };
        break;
      }

      case 'city': {
        const { data: cityData, error: cityError } = await supabase
          .from('psgc_cities_municipalities')
          .select(`
            code,
            name,
            type,
            is_independent,
            province_code,
            psgc_provinces (
              code,
              name,
              region_code,
              psgc_regions (code, name)
            )
          `)
          .eq('code', lookupCode)
          .single();

        if (cityError || !cityData) {
          return NextResponse.json({ error: 'City/Municipality not found' }, { status: 404 });
        }

        const cityProvince = cityData.psgc_provinces;
        const cityRegion = cityProvince?.psgc_regions;
        result = {
          code: cityData.code,
          name: cityData.name,
          level: 'city',
          type: cityData.type,
          city_code: cityData.code,
          city_name: cityData.name,
          city_type: cityData.type,
          province_code: cityProvince?.code,
          province_name: cityProvince?.name,
          region_code: cityRegion?.code,
          region_name: cityRegion?.name,
          full_address: [cityData.name, cityProvince?.name, cityRegion?.name].filter(Boolean).join(', ')
        };
        break;
      }

      case 'barangay': {
        // First get the barangay data
        const { data: barangayData, error: barangayError } = await supabase
          .from('psgc_barangays')
          .select('code, name, city_municipality_code')
          .eq('code', lookupCode)
          .single();

        if (barangayError || !barangayData) {
          return NextResponse.json({ error: 'Barangay not found' }, { status: 404 });
        }

        // Then get the city data separately
        const { data: cityData, error: cityError } = await supabase
          .from('psgc_cities_municipalities')
          .select('code, name, type, province_code')
          .eq('code', barangayData.city_municipality_code)
          .single();

        // Then get the province data separately
        let provinceData = null;
        let regionData = null;
        
        if (cityData && !cityError) {
          const { data: provData, error: provError } = await supabase
            .from('psgc_provinces')
            .select('code, name, region_code')
            .eq('code', cityData.province_code)
            .single();
          
          provinceData = provData;
          
          // Finally get the region data
          if (provData && !provError) {
            const { data: regData, error: regError } = await supabase
              .from('psgc_regions')
              .select('code, name')
              .eq('code', provData.region_code)
              .single();
            
            regionData = regData;
          }
        }

        result = {
          code: barangayData.code,
          name: barangayData.name,
          level: 'barangay',
          barangay_code: barangayData.code,
          barangay_name: barangayData.name,
          city_code: cityData?.code,
          city_name: cityData?.name,
          city_type: cityData?.type,
          province_code: provinceData?.code,
          province_name: provinceData?.name,
          region_code: regionData?.code,
          region_name: regionData?.name,
          full_address: [barangayData.name, cityData?.name, provinceData?.name, regionData?.name].filter(Boolean).join(', ')
        };
        break;
      }

      default:
        return NextResponse.json({ error: 'Unsupported PSGC level' }, { status: 400 });
    }

    return NextResponse.json({
      data: result,
      level: level
    });
  } catch (error) {
    console.error('PSGC lookup API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}