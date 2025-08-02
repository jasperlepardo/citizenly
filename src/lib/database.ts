/**
 * Database API Functions
 * High-level functions to interact with the complete PSGC geographic data
 */

import { supabase } from './supabase'

// Geographic data types
export interface Region {
  code: string
  name: string
}

export interface Province {
  code: string
  name: string
  region_code: string
}

export interface City {
  code: string
  name: string
  type: string
  province_code: string | null
  is_independent: boolean
}

export interface Barangay {
  code: string
  name: string
  city_municipality_code: string
  urban_rural_status: string | null
}

export interface AddressHierarchy {
  region_code: string
  region_name: string
  province_code: string | null
  province_name: string | null
  city_municipality_code: string
  city_municipality_name: string
  city_municipality_type: string
  is_independent: boolean
  barangay_code: string
  barangay_name: string
  urban_rural_status: string | null
  full_address: string
}

/**
 * Test database connection and get basic stats
 */
export async function testDatabaseConnection() {
  try {
    // Test connection with basic counts
    const [regionsResult, provincesResult, citiesResult, barangaysResult] = 
      await Promise.all([
        supabase.from('psgc_regions').select('*', { count: 'exact', head: true }),
        supabase.from('psgc_provinces').select('*', { count: 'exact', head: true }),
        supabase.from('psgc_cities_municipalities').select('*', { count: 'exact', head: true }),
        supabase.from('psgc_barangays').select('*', { count: 'exact', head: true })
      ])

    return {
      success: true,
      data: {
        regions: regionsResult.count || 0,
        provinces: provincesResult.count || 0,
        cities: citiesResult.count || 0,
        barangays: barangaysResult.count || 0
      },
      errors: [
        regionsResult.error,
        provincesResult.error,
        citiesResult.error,
        barangaysResult.error
      ].filter(Boolean)
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      errors: [error]
    }
  }
}

/**
 * Get all regions (17 regions)
 */
export async function getRegions(): Promise<Region[]> {
  const { data, error } = await supabase
    .from('psgc_regions')
    .select('code, name')
    .order('name')

  if (error) {
    console.error('Error fetching regions:', error)
    return []
  }

  return data || []
}

/**
 * Get provinces by region
 */
export async function getProvincesByRegion(regionCode: string): Promise<Province[]> {
  const { data, error } = await supabase
    .from('psgc_provinces')
    .select('code, name, region_code')
    .eq('region_code', regionCode)
    .order('name')

  if (error) {
    console.error('Error fetching provinces:', error)
    return []
  }

  return data || []
}

/**
 * Get cities by province (handles independent cities)
 */
export async function getCitiesByProvince(provinceCode: string | null): Promise<City[]> {
  let query = supabase
    .from('psgc_cities_municipalities')
    .select('code, name, type, province_code, is_independent')

  if (provinceCode === null) {
    // Get independent cities (no province)
    query = query.is('province_code', null).eq('is_independent', true)
  } else {
    // Get cities in specific province
    query = query.eq('province_code', provinceCode)
  }

  const { data, error } = await query.order('name')

  if (error) {
    console.error('Error fetching cities:', error)
    return []
  }

  return data || []
}

/**
 * Get barangays by city
 */
export async function getBarangaysByCity(cityCode: string): Promise<Barangay[]> {
  const { data, error } = await supabase
    .from('psgc_barangays')
    .select('code, name, city_municipality_code, urban_rural_status')
    .eq('city_municipality_code', cityCode)
    .order('name')

  if (error) {
    console.error('Error fetching barangays:', error)
    return []
  }

  return data || []
}

/**
 * Search addresses using the complete hierarchy view
 */
export async function searchAddresses(searchTerm: string, limit: number = 50): Promise<AddressHierarchy[]> {
  const { data, error } = await supabase
    .from('address_hierarchy')
    .select('*')
    .or(`region_name.ilike.%${searchTerm}%,province_name.ilike.%${searchTerm}%,city_municipality_name.ilike.%${searchTerm}%,barangay_name.ilike.%${searchTerm}%`)
    .limit(limit)

  if (error) {
    console.error('Error searching addresses:', error)
    return []
  }

  return data || []
}

/**
 * Get complete address hierarchy for a specific barangay
 */
export async function getCompleteAddress(barangayCode: string): Promise<AddressHierarchy | null> {
  const { data, error } = await supabase
    .from('address_hierarchy')
    .select('*')
    .eq('barangay_code', barangayCode)
    .single()

  if (error) {
    console.error('Error fetching complete address:', error)
    return null
  }

  return data || null
}

/**
 * Get Metro Manila cities (independent cities with districts)
 */
export async function getMetroManilaCities(): Promise<City[]> {
  const { data, error } = await supabase
    .from('psgc_cities_municipalities')
    .select('code, name, type, province_code, is_independent')
    .in('province_code', ['1374', '1375', '1376']) // Metro Manila districts
    .order('name')

  if (error) {
    console.error('Error fetching Metro Manila cities:', error)
    return []
  }

  return data || []
}