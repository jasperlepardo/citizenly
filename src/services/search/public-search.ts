/**
 * Public Search Functions
 * Search functions that don't require authentication (for registration, etc.)
 */

import { createLogger } from '@/lib/config/environment';
import { supabase } from '@/lib/supabase/supabase';

const logger = createLogger('PublicSearch');

interface BarangayWithRelations {
  code: string;
  name: string;
  city_municipality_code: string;
  psgc_cities_municipalities: {
    name: string;
    type: string;
    psgc_provinces: {
      name: string;
      psgc_regions: {
        name: string;
      };
    };
  };
}

/**
 * Search barangays by name without authentication requirement
 * Used for user registration and public forms
 */
export const searchBarangaysPublic = async (searchTerm: string, limit = 20) => {
  try {
    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }

    logger.debug('Searching barangays publicly:', searchTerm);

    const { data, error } = await supabase
      .from('psgc_barangays')
      .select(
        `
        code, 
        name,
        city_municipality_code,
        psgc_cities_municipalities!inner(
          code,
          name,
          type,
          province_code,
          psgc_provinces!inner(
            code,
            name,
            region_code,
            psgc_regions!inner(
              code,
              name
            )
          )
        )
      `
      )
      .ilike('name', `%${searchTerm}%`)
      .limit(limit)
      .order('name');

    if (error) {
      logger.error('Error searching barangays:', error.message);
      throw error;
    }

    // Transform data to match expected format
    const transformedData =
      (data as any[])?.map((item: any) => ({
        code: item.code,
        name: item.name,
        city_name: `${item.psgc_cities_municipalities.name} (${item.psgc_cities_municipalities.type})`,
        province_name: item.psgc_cities_municipalities.psgc_provinces.name,
        region_name: item.psgc_cities_municipalities.psgc_provinces.psgc_regions.name,
        full_address: `${item.name}, ${item.psgc_cities_municipalities.name}, ${item.psgc_cities_municipalities.psgc_provinces.name}, ${item.psgc_cities_municipalities.psgc_provinces.psgc_regions.name}`,
      })) || [];

    logger.debug(`Found ${transformedData.length} barangays`);
    return transformedData;
  } catch (error) {
    logger.error('Public barangay search failed:', error);
    throw error;
  }
};

/**
 * Search PSGC regions without authentication requirement
 */
export const getRegionsPublic = async () => {
  try {
    const { data, error } = await supabase.from('psgc_regions').select('code, name').order('name');

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Error fetching regions:', error);
    throw error;
  }
};

/**
 * Search PSGC provinces by region without authentication requirement
 */
export const getProvincesByRegionPublic = async (regionCode: string) => {
  try {
    const { data, error } = await supabase
      .from('psgc_provinces')
      .select('code, name')
      .eq('region_code', regionCode)
      .order('name');

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Error fetching provinces:', error);
    throw error;
  }
};

/**
 * Search PSGC cities by province without authentication requirement
 */
export const getCitiesByProvincePublic = async (provinceCode: string) => {
  try {
    const { data, error } = await supabase
      .from('psgc_cities_municipalities')
      .select('code, name, type')
      .eq('province_code', provinceCode)
      .order('name');

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Error fetching cities:', error);
    throw error;
  }
};

/**
 * Search barangays by city without authentication requirement
 */
export const getBarangaysByCityPublic = async (cityCode: string) => {
  try {
    const { data, error } = await supabase
      .from('psgc_barangays')
      .select('code, name')
      .eq('city_municipality_code', cityCode)
      .order('name');

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Error fetching barangays:', error);
    throw error;
  }
};

/**
 * Search occupations using unified search without authentication requirement
 */
export const searchOccupationsPublic = async (searchTerm: string, limit = 20) => {
  try {
    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }

    const { data, error } = await supabase
      .from('psoc_unified_search')
      .select('occupation_code, occupation_title, psoc_level, parent_title')
      .ilike('search_text', `%${searchTerm}%`)
      .limit(limit)
      .order('occupation_title');

    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.error('Error searching occupations:', error);
    throw error;
  }
};
