/**
 * Database API Functions
 * High-level functions to interact with the complete PSGC geographic data
 */

import { supabase } from '../supabase';

// Geographic data types
export interface Region {
  code: string;
  name: string;
}

export interface Province {
  code: string;
  name: string;
  region_code: string;
}

export interface City {
  code: string;
  name: string;
  type: string;
  province_code: string | null;
  is_independent: boolean;
}

export interface Barangay {
  code: string;
  name: string;
  city_municipality_code: string;
}

export interface AddressHierarchy {
  region_code: string | null;
  region_name: string;
  province_code: string | null;
  province_name: string | null;
  city_municipality_code: string | null;
  city_municipality_name: string;
  city_municipality_type: string;
  is_independent: boolean;
  barangay_code: string;
  barangay_name: string;
  full_address: string;
}

/**
 * Test database connection and get basic stats
 */
export async function testDatabaseConnection() {
  try {
    // Test connection with basic counts
    const [regionsResult, provincesResult, citiesResult, barangaysResult] = await Promise.all([
      supabase.from('psgc_regions').select('*', { count: 'exact', head: true }),
      supabase.from('psgc_provinces').select('*', { count: 'exact', head: true }),
      supabase.from('psgc_cities_municipalities').select('*', { count: 'exact', head: true }),
      supabase.from('psgc_barangays').select('*', { count: 'exact', head: true }),
    ]);

    return {
      success:
        !regionsResult.error &&
        !provincesResult.error &&
        !citiesResult.error &&
        !barangaysResult.error,
      data: {
        regions: regionsResult.count || 0,
        provinces: provincesResult.count || 0,
        cities: citiesResult.count || 0,
        barangays: barangaysResult.count || 0,
      },
      errors: [
        regionsResult.error,
        provincesResult.error,
        citiesResult.error,
        barangaysResult.error,
      ].filter(Boolean),
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

/**
 * Get all regions (17 regions)
 */
export async function getRegions(): Promise<Region[]> {
  const { data, error } = await supabase.from('psgc_regions').select('code, name').order('name');

  if (error) {
    console.error('Error fetching regions:', error);
    return [];
  }

  return data || [];
}

/**
 * Get provinces by region
 */
export async function getProvincesByRegion(regionCode: string): Promise<Province[]> {
  const { data, error } = await supabase
    .from('psgc_provinces')
    .select('code, name, region_code')
    .eq('region_code', regionCode)
    .order('name');

  if (error) {
    console.error('Error fetching provinces:', error);
    return [];
  }

  return data || [];
}

/**
 * Get cities by province (handles independent cities)
 */
export async function getCitiesByProvince(provinceCode: string | null): Promise<City[]> {
  let query = supabase
    .from('psgc_cities_municipalities')
    .select('code, name, type, province_code, is_independent');

  if (provinceCode === null) {
    // Get independent cities (no province)
    query = query.is('province_code', null).eq('is_independent', true);
  } else {
    // Get cities in specific province
    query = query.eq('province_code', provinceCode);
  }

  const { data, error } = await query.order('name');

  if (error) {
    console.error('Error fetching cities:', error);
    return [];
  }

  return data || [];
}

/**
 * Get barangays by city
 */
export async function getBarangaysByCity(cityCode: string): Promise<Barangay[]> {
  const { data, error } = await supabase
    .from('psgc_barangays')
    .select('code, name, city_municipality_code')
    .eq('city_municipality_code', cityCode)
    .order('name');

  if (error) {
    console.error('Error fetching barangays:', error);
    return [];
  }

  return data || [];
}

/**
 * Search addresses using the complete hierarchy view
 */
export async function searchAddresses(
  searchTerm: string,
  limit: number = 50
): Promise<AddressHierarchy[]> {
  try {
    // Use API endpoint to avoid complex nested queries
    const response = await fetch(`/api/psgc/search?q=${encodeURIComponent(searchTerm)}&levels=barangay&limit=${limit}`);
    
    if (!response.ok) {
      console.error('Error searching addresses:', response.status);
      return [];
    }
    
    const result = await response.json();
    const data = result.data || [];
    const error = result.error;

    // Transform the flattened API response to match AddressHierarchy interface
    const results: AddressHierarchy[] = (data || []).map((barangay: any) => {
      return {
        region_code: barangay.region_code || null,
        region_name: barangay.region_name || '',
        province_code: barangay.province_code || null,
        province_name: barangay.province_name || null,
        city_municipality_code: barangay.city_code || null,
        city_municipality_name: barangay.city_name || '',
        city_municipality_type: barangay.city_type || '',
        is_independent: false, // Default value
        barangay_code: barangay.code || barangay.barangay_code,
        barangay_name: barangay.name || barangay.barangay_name,
        full_address: barangay.full_address || [
          barangay.name || barangay.barangay_name, 
          barangay.city_name, 
          barangay.province_name, 
          barangay.region_name
        ].filter(Boolean).join(', '),
      };
    });

    return results;
  } catch (error) {
    console.error('Error searching addresses:', error);
    return [];
  }
}

/**
 * Get complete address hierarchy for a specific barangay
 * Uses separate queries instead of JOINs due to removed foreign key constraints
 */
export async function getCompleteAddress(barangayCode: string): Promise<AddressHierarchy | null> {
  try {
    // Validate barangay code
    if (!barangayCode || typeof barangayCode !== 'string') {
      console.error('Invalid barangay code provided:', barangayCode);
      return null;
    }

    // Get complete address hierarchy from view with explicit column selection
    const { data: addressData, error: addressError } = await supabase
      .from('address_hierarchy')
      .select(
        'barangay_code, barangay_name, city_code, city_name, city_type, province_code, province_name, region_code, region_name, full_address'
      )
      .eq('barangay_code', barangayCode)
      .single();

    if (addressError || !addressData) {
      console.warn('Barangay not found in database:', {
        code: barangayCode,
        error: addressError?.message || 'No data returned',
      });
      // Return null values for unknown barangays to avoid FK constraint violations
      return {
        region_code: null,
        region_name: 'Unknown Region',
        province_code: null,
        province_name: 'Unknown Province',
        city_municipality_code: null,
        city_municipality_name: 'Unknown City',
        city_municipality_type: 'unknown',
        is_independent: false,
        barangay_code: barangayCode,
        barangay_name: 'Unknown Barangay',
        full_address: `Barangay ${barangayCode}`,
      };
    }

    // Return complete address hierarchy from view
    return {
      region_code: addressData.region_code,
      region_name: addressData.region_name,
      province_code: addressData.province_code,
      province_name: addressData.province_name,
      city_municipality_code: addressData.city_code,
      city_municipality_name: addressData.city_name,
      city_municipality_type: addressData.city_type,
      is_independent: false, // Default value, view doesn't include this
      barangay_code: addressData.barangay_code,
      barangay_name: addressData.barangay_name,
      full_address: addressData.full_address,
    };
  } catch (error) {
    console.error('Error fetching complete address:', error);
    return null;
  }
}

/**
 * Get Metro Manila cities (independent cities with districts)
 */
export async function getMetroManilaCities(): Promise<City[]> {
  const { data, error } = await supabase
    .from('psgc_cities_municipalities')
    .select('code, name, type, province_code, is_independent')
    .in('province_code', ['1374', '1375', '1376']) // Metro Manila districts
    .order('name');

  if (error) {
    console.error('Error fetching Metro Manila cities:', error);
    return [];
  }

  return data || [];
}
