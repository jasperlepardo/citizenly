import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const levels = searchParams.get('levels')?.split(',') || ['city']; // Default to cities only
    const maxLevel = searchParams.get('maxLevel') || 'city';
    const minLevel = searchParams.get('minLevel') || 'region';

    if (!query || query.trim().length < 2) {
      // Return empty results instead of error for graceful handling
      return NextResponse.json({ data: [], count: 0 });
    }

    // Use service role client to bypass RLS for geographic data
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const rawQuery = query.trim();
    const searchTerm = `%${rawQuery}%`;
    
    // Create variations of the search term for better matching
    const variations = [searchTerm];
    
    // Handle common prefixes and suffixes
    if (rawQuery.toLowerCase().includes('city')) {
      const cityName = rawQuery.toLowerCase().replace(/\s*city\s*/g, '').trim();
      if (cityName) {
        variations.push(`%city of ${cityName}%`);
        variations.push(`%${cityName}%`);
      }
    }
    
    if (rawQuery.toLowerCase().includes('municipality')) {
      const munName = rawQuery.toLowerCase().replace(/\s*municipality\s*/g, '').trim();
      if (munName) {
        variations.push(`%municipality of ${munName}%`);
        variations.push(`%${munName}%`);
      }
    }

    const allResults: any[] = [];

    // Search regions if requested
    if (levels.includes('region')) {
      const regionSearchPromises = variations.map(term => 
        supabase
          .from('psgc_regions')
          .select('code, name')
          .ilike('name', term)
          .limit(Math.min(limit, 10))
      );
      
      const regionResults = await Promise.all(regionSearchPromises);
      regionResults.forEach(result => {
        if (result.data) {
          result.data.forEach((region: any) => {
            allResults.push({
              code: region.code,
              name: region.name,
              level: 'region',
              region_code: region.code,
              region_name: region.name,
              full_address: region.name
            });
          });
        }
      });
    }

    // Search provinces if requested
    if (levels.includes('province')) {
      const provinceSearchPromises = variations.map(term => 
        supabase
          .from('psgc_provinces')
          .select(`
            code,
            name,
            region_code,
            psgc_regions (code, name)
          `)
          .ilike('name', term)
          .limit(Math.min(limit, 15))
      );
      
      const provinceResults = await Promise.all(provinceSearchPromises);
      provinceResults.forEach(result => {
        if (result.data) {
          result.data.forEach((province: any) => {
            const region = province.psgc_regions;
            allResults.push({
              code: province.code,
              name: province.name,
              level: 'province',
              province_code: province.code,
              province_name: province.name,
              region_code: region?.code,
              region_name: region?.name,
              full_address: [province.name, region?.name].filter(Boolean).join(', ')
            });
          });
        }
      });
    }

    // Search cities/municipalities if requested
    if (levels.includes('city')) {
      const citySearchPromises = variations.map(term => 
        supabase
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
          .ilike('name', term)
          .limit(Math.min(limit, 20))
      );
      
      const cityResults = await Promise.all(citySearchPromises);
      cityResults.forEach(result => {
        if (result.data) {
          result.data.forEach((city: any) => {
            const province = city.psgc_provinces;
            const region = province?.psgc_regions;
            allResults.push({
              code: city.code,
              name: city.name,
              level: 'city',
              type: city.type,
              city_code: city.code,
              city_name: city.name,
              city_type: city.type,
              province_code: province?.code,
              province_name: province?.name,
              region_code: region?.code,
              region_name: region?.name,
              full_address: [city.name, province?.name, region?.name].filter(Boolean).join(', ')
            });
          });
        }
      });
    }

    // Search barangays if requested
    if (levels.includes('barangay')) {
      const barangaySearchPromises = variations.map(term => 
        supabase
          .from('psgc_barangays')
          .select(`
            code,
            name,
            city_municipality_code,
            psgc_cities_municipalities (
              code,
              name,
              type,
              province_code,
              psgc_provinces (
                code,
                name,
                region_code,
                psgc_regions (code, name)
              )
            )
          `)
          .ilike('name', term)
          .limit(Math.min(limit, 25))
      );
      
      const barangayResults = await Promise.all(barangaySearchPromises);
      barangayResults.forEach(result => {
        if (result.data) {
          result.data.forEach((barangay: any) => {
            const city = barangay.psgc_cities_municipalities;
            const province = city?.psgc_provinces;
            const region = province?.psgc_regions;
            allResults.push({
              code: barangay.code,
              name: barangay.name,
              level: 'barangay',
              barangay_code: barangay.code,
              barangay_name: barangay.name,
              city_code: city?.code,
              city_name: city?.name,
              city_type: city?.type,
              province_code: province?.code,
              province_name: province?.name,
              region_code: region?.code,
              region_name: region?.name,
              full_address: [barangay.name, city?.name, province?.name, region?.name].filter(Boolean).join(', ')
            });
          });
        }
      });
    }

    // Remove duplicates based on code
    const uniqueResults = allResults.reduce((acc, current) => {
      const exists = acc.find((item: any) => item.code === current.code);
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, [] as any[]);

    // Sort by level hierarchy (region -> province -> city -> barangay) and then by name
    const levelOrder = { region: 1, province: 2, city: 3, barangay: 4 };
    uniqueResults.sort((a: any, b: any) => {
      const levelDiff = levelOrder[a.level as keyof typeof levelOrder] - levelOrder[b.level as keyof typeof levelOrder];
      if (levelDiff !== 0) return levelDiff;
      return a.name.localeCompare(b.name);
    });

    const data = uniqueResults.slice(0, Math.min(limit, 50));

    return NextResponse.json({
      data: data,
      count: data.length
    });
  } catch (error) {
    console.error('Address search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}