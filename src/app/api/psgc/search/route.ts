import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const rawLevels = searchParams.get('levels') || 'city';
    // Handle 'all' levels parameter by including all geographic levels
    const levels = rawLevels === 'all' 
      ? ['region', 'province', 'city', 'barangay'] 
      : rawLevels.split(',');
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

    const rawQuery = query.trim().toLowerCase();
    
    // Create comprehensive search variations for fuzzy matching
    const variations = [
      `%${rawQuery}%`, // Basic contains search
      `${rawQuery}%`,  // Starts with
      `%${rawQuery}`,  // Ends with
    ];
    
    // Split query into words for multi-word fuzzy matching
    const words = rawQuery.split(/\s+/).filter(w => w.length > 0);
    if (words.length > 1) {
      // Add individual word searches
      words.forEach(word => {
        if (word.length >= 2) {
          variations.push(`%${word}%`);
        }
      });
      
      // Add reversed word order
      const reversed = words.reverse().join(' ');
      variations.push(`%${reversed}%`);
    }
    
    // Handle common abbreviations and variations
    const commonVariations: Record<string, string[]> = {
      'cav': ['cavite'],
      'bgc': ['bonifacio global city', 'taguig'],
      'qc': ['quezon city'],
      'mm': ['metro manila', 'manila'],
      'ncr': ['national capital region', 'metro manila'],
      'mla': ['manila'],
      'makat': ['makati'],
      'pasig': ['pasig city'],
      'taguig': ['taguig city'],
    };
    
    // Add abbreviation expansions
    Object.entries(commonVariations).forEach(([abbr, expansions]) => {
      if (rawQuery.includes(abbr)) {
        expansions.forEach(expansion => {
          variations.push(`%${expansion}%`);
          variations.push(`%${expansion.replace(/\s+/g, '')}%`); // Without spaces
        });
      }
    });
    
    // Handle common prefixes and suffixes
    if (rawQuery.includes('city')) {
      const cityName = rawQuery.replace(/\s*city\s*/g, '').trim();
      if (cityName) {
        variations.push(`%city of ${cityName}%`);
        variations.push(`%${cityName}%`);
        variations.push(`%${cityName} city%`);
      }
    }
    
    if (rawQuery.includes('municipality')) {
      const munName = rawQuery.replace(/\s*municipality\s*/g, '').trim();
      if (munName) {
        variations.push(`%municipality of ${munName}%`);
        variations.push(`%${munName}%`);
        variations.push(`%${munName} municipality%`);
      }
    }
    
    // Remove duplicates and empty variations
    const uniqueVariations = Array.from(new Set(variations)).filter(v => v.length > 2);

    const allResults: any[] = [];

    // Search regions if requested
    if (levels.includes('region')) {
      const regionSearchPromises = uniqueVariations.map(term => 
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
      const provinceSearchPromises = uniqueVariations.map(term => 
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
      // First search cities by name
      const citySearchPromises = uniqueVariations.map(term => 
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

      // Also search cities by province name (hierarchical search)
      const provinceMatchPromises = uniqueVariations.map(term => 
        supabase
          .from('psgc_cities_municipalities')
          .select(`
            code,
            name,
            type,
            is_independent,
            province_code,
            psgc_provinces!inner (
              code,
              name,
              region_code,
              psgc_regions (code, name)
            )
          `)
          .filter('psgc_provinces.name', 'ilike', term)
          .limit(Math.min(limit, 25))
      );
      
      const cityResults = await Promise.all(citySearchPromises);
      const provinceMatchResults = await Promise.all(provinceMatchPromises);
      
      // Process direct city name matches
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

      // Process cities found by province name (hierarchical matches)
      provinceMatchResults.forEach(result => {
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
      // Direct barangay name matches
      const barangaySearchPromises = uniqueVariations.map(term => 
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

      // Hierarchical search: barangays within matching provinces
      const barangayByProvincePromises = uniqueVariations.map(term => 
        supabase
          .from('psgc_barangays')
          .select(`
            code,
            name,
            city_municipality_code,
            psgc_cities_municipalities!inner (
              code,
              name,
              type,
              province_code,
              psgc_provinces!inner (
                code,
                name,
                region_code,
                psgc_regions (code, name)
              )
            )
          `)
          .filter('psgc_cities_municipalities.psgc_provinces.name', 'ilike', term)
          .limit(Math.min(limit, 30))
      );

      // Hierarchical search: barangays within matching cities
      const barangayByCityPromises = uniqueVariations.map(term => 
        supabase
          .from('psgc_barangays')
          .select(`
            code,
            name,
            city_municipality_code,
            psgc_cities_municipalities!inner (
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
          .filter('psgc_cities_municipalities.name', 'ilike', term)
          .limit(Math.min(limit, 20))
      );
      
      const barangayByProvinceResults = await Promise.all(barangayByProvincePromises);
      const barangayByCityResults = await Promise.all(barangayByCityPromises);
      
      const barangayResults = await Promise.all(barangaySearchPromises);
      
      // Process direct barangay name matches
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

      // Process hierarchical matches (barangays within provinces)
      barangayByProvinceResults.forEach(result => {
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

      // Process hierarchical matches (barangays within cities)
      barangayByCityResults.forEach(result => {
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

    // Enhanced sorting by relevance and geographic hierarchy
    uniqueResults.sort((a: any, b: any) => {
      // First priority: Direct name matches (exact or starts with query)
      const aDirectMatch = a.name.toLowerCase().startsWith(rawQuery) ? 1 : 0;
      const bDirectMatch = b.name.toLowerCase().startsWith(rawQuery) ? 1 : 0;
      if (aDirectMatch !== bDirectMatch) return bDirectMatch - aDirectMatch;
      
      // Second priority: Exact matches within direct matches
      if (aDirectMatch && bDirectMatch) {
        const aExactMatch = a.name.toLowerCase() === rawQuery ? 1 : 0;
        const bExactMatch = b.name.toLowerCase() === rawQuery ? 1 : 0;
        if (aExactMatch !== bExactMatch) return bExactMatch - aExactMatch;
      }
      
      // Third priority: Geographic hierarchy grouping
      // Group by province first, then by city within province, then barangays within city
      if (a.province_name !== b.province_name) {
        return (a.province_name || '').localeCompare(b.province_name || '');
      }
      
      // Within same province: create city groups (city followed by its barangays)
      if (a.city_name !== b.city_name) {
        return (a.city_name || '').localeCompare(b.city_name || '');
      }
      
      // Within same city: city comes first, then its barangays alphabetically
      const levelOrder = { region: 1, province: 2, city: 3, barangay: 4 };
      const levelDiff = levelOrder[a.level as keyof typeof levelOrder] - levelOrder[b.level as keyof typeof levelOrder];
      if (levelDiff !== 0) return levelDiff;
      
      // Final priority: Alphabetical by name
      return a.name.localeCompare(b.name);
    });

    // Apply pagination
    const totalCount = uniqueResults.length;
    const startIndex = Math.max(0, offset);
    const endIndex = Math.min(startIndex + limit, totalCount, startIndex + 100); // Cap at 100 per request
    const data = uniqueResults.slice(startIndex, endIndex);

    return NextResponse.json({
      data: data,
      count: data.length,
      totalCount: totalCount,
      offset: startIndex,
      hasMore: endIndex < totalCount
    });
  } catch (error) {
    console.error('Address search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}