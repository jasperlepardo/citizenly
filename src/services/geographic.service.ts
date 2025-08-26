/**
 * Geographic Data Service
 * Handles PSGC (Philippine Standard Geographic Code) data operations
 */

import { supabase } from '@/lib';
import { logger, logError } from '@/lib';

export interface Region {
  code: string;
  name: string;
  is_active: boolean;
}

export interface Province {
  code: string;
  name: string;
  region_code: string;
  is_active: boolean;
}

export interface CityMunicipality {
  code: string;
  name: string;
  province_code: string | null;
  type: string;
  is_independent: boolean;
  is_active: boolean;
}

export interface Barangay {
  code: string;
  name: string;
  city_municipality_code: string;
  is_active: boolean;
}

export interface GeographicOption {
  value: string;
  label: string;
}

interface BarangayWithJoins {
  psgc_cities_municipalities: {
    code: string;
    name: string;
    type: string;
    psgc_provinces: {
      code: string;
      name: string;
      psgc_regions: {
        code: string;
        name: string;
      };
    };
  };
}

/**
 * Geographic Data Service Class
 */
export class GeographicService {
  /**
   * Get all active regions
   */
  async getRegions(): Promise<GeographicOption[]> {
    try {
      const { data, error } = await supabase
        .from('psgc_regions')
        .select('code, name')
        .eq('is_active', true)
        .order('name');

      if (error) {
        logError(new Error(error.message), 'GEOGRAPHIC_SERVICE_GET_REGIONS');
        return [];
      }

      return data.map(region => ({
        value: region.code,
        label: region.name,
      }));
    } catch (error) {
      logError(error as Error, 'GEOGRAPHIC_SERVICE_GET_REGIONS');
      return [];
    }
  }

  /**
   * Get provinces by region code
   */
  async getProvincesByRegion(regionCode: string): Promise<GeographicOption[]> {
    if (!regionCode) return [];

    try {
      const { data, error } = await supabase
        .from('psgc_provinces')
        .select('code, name')
        .eq('region_code', regionCode)
        .eq('is_active', true)
        .order('name');

      if (error) {
        logError(new Error(error.message), 'GEOGRAPHIC_SERVICE_GET_PROVINCES');
        return [];
      }

      return data.map(province => ({
        value: province.code,
        label: province.name,
      }));
    } catch (error) {
      logError(error as Error, 'GEOGRAPHIC_SERVICE_GET_PROVINCES');
      return [];
    }
  }

  /**
   * Get cities/municipalities by province code
   * For independent cities, get by region code
   */
  async getCitiesByProvince(provinceCode: string): Promise<GeographicOption[]> {
    if (!provinceCode) return [];

    try {
      const { data, error } = await supabase
        .from('psgc_cities_municipalities')
        .select('code, name, type')
        .eq('province_code', provinceCode)
        .eq('is_active', true)
        .order('name');

      if (error) {
        logError(new Error(error.message), 'GEOGRAPHIC_SERVICE_GET_CITIES');
        return [];
      }

      return data.map(city => ({
        value: city.code,
        label: `${city.name} (${city.type})`,
      }));
    } catch (error) {
      logError(error as Error, 'GEOGRAPHIC_SERVICE_GET_CITIES');
      return [];
    }
  }

  /**
   * Get independent cities by region code (for regions without provinces)
   */
  async getIndependentCitiesByRegion(regionCode: string): Promise<GeographicOption[]> {
    if (!regionCode) return [];

    try {
      // For independent cities like Metro Manila, we need to query differently
      const { data, error } = await supabase
        .from('psgc_cities_municipalities')
        .select(`
          code, 
          name, 
          type,
          province_code
        `)
        .eq('is_independent', true)
        .eq('is_active', true)
        .order('name');

      if (error) {
        logError(new Error(error.message), 'GEOGRAPHIC_SERVICE_GET_INDEPENDENT_CITIES');
        return [];
      }

      // Filter by region through province relationship or direct region relationship
      const filteredData = data.filter(city => {
        // For Metro Manila (NCR), cities don't have province_code
        return city.province_code === null;
      });

      return filteredData.map(city => ({
        value: city.code,
        label: `${city.name} (${city.type})`,
      }));
    } catch (error) {
      logError(error as Error, 'GEOGRAPHIC_SERVICE_GET_INDEPENDENT_CITIES');
      return [];
    }
  }

  /**
   * Get barangays by city/municipality code
   */
  async getBarangaysByCity(cityCode: string): Promise<GeographicOption[]> {
    if (!cityCode) return [];

    try {
      const { data, error } = await supabase
        .from('psgc_barangays')
        .select('code, name')
        .eq('city_municipality_code', cityCode)
        .eq('is_active', true)
        .order('name');

      if (error) {
        logError(new Error(error.message), 'GEOGRAPHIC_SERVICE_GET_BARANGAYS');
        return [];
      }

      return data.map(barangay => ({
        value: barangay.code,
        label: barangay.name,
      }));
    } catch (error) {
      logError(error as Error, 'GEOGRAPHIC_SERVICE_GET_BARANGAYS');
      return [];
    }
  }

  /**
   * Get complete geographic hierarchy for a barangay code
   */
  async getGeographicHierarchy(barangayCode: string): Promise<{
    region?: Region;
    province?: Province;
    city?: CityMunicipality;
    barangay?: Barangay;
  }> {
    if (!barangayCode) return {};

    try {
      const { data, error } = await supabase
        .from('psgc_barangays')
        .select(`
          code,
          name,
          city_municipality_code,
          is_active,
          psgc_cities_municipalities!inner(
            code,
            name,
            type,
            province_code,
            is_independent,
            is_active,
            psgc_provinces(
              code,
              name,
              region_code,
              is_active,
              psgc_regions!inner(
                code,
                name,
                is_active
              )
            )
          )
        `)
        .eq('code', barangayCode)
        .single();

      if (error) {
        logError(new Error(error.message), 'GEOGRAPHIC_SERVICE_GET_HIERARCHY');
        return {};
      }

      const typedData = data as BarangayWithJoins;
      const city = typedData.psgc_cities_municipalities;
      const province = city.psgc_provinces;
      const region = province?.psgc_regions;

      return {
        barangay: {
          code: data.code,
          name: data.name,
          city_municipality_code: data.city_municipality_code,
          is_active: data.is_active,
        },
        city: {
          code: city.code,
          name: city.name,
          province_code: city.province_code,
          type: city.type,
          is_independent: city.is_independent,
          is_active: city.is_active,
        },
        province: province ? {
          code: province.code,
          name: province.name,
          region_code: province.region_code,
          is_active: province.is_active,
        } : undefined,
        region: region ? {
          code: region.code,
          name: region.name,
          is_active: region.is_active,
        } : undefined,
      };
    } catch (error) {
      logError(error as Error, 'GEOGRAPHIC_SERVICE_GET_HIERARCHY');
      return {};
    }
  }

  /**
   * Search locations by name (for autocomplete)
   */
  async searchLocations(query: string, limit = 10): Promise<{
    regions: GeographicOption[];
    provinces: GeographicOption[];
    cities: GeographicOption[];
    barangays: GeographicOption[];
  }> {
    if (!query || query.length < 2) {
      return { regions: [], provinces: [], cities: [], barangays: [] };
    }

    const searchPattern = `%${query}%`;

    try {
      const [regionsResult, provincesResult, citiesResult, barangaysResult] = await Promise.all([
        supabase
          .from('psgc_regions')
          .select('code, name')
          .ilike('name', searchPattern)
          .eq('is_active', true)
          .limit(limit),
        
        supabase
          .from('psgc_provinces')
          .select('code, name')
          .ilike('name', searchPattern)
          .eq('is_active', true)
          .limit(limit),
        
        supabase
          .from('psgc_cities_municipalities')
          .select('code, name, type')
          .ilike('name', searchPattern)
          .eq('is_active', true)
          .limit(limit),
        
        supabase
          .from('psgc_barangays')
          .select('code, name')
          .ilike('name', searchPattern)
          .eq('is_active', true)
          .limit(limit),
      ]);

      return {
        regions: regionsResult.data?.map(item => ({
          value: item.code,
          label: item.name,
        })) || [],
        provinces: provincesResult.data?.map(item => ({
          value: item.code,
          label: item.name,
        })) || [],
        cities: citiesResult.data?.map(item => ({
          value: item.code,
          label: `${item.name} (${item.type})`,
        })) || [],
        barangays: barangaysResult.data?.map(item => ({
          value: item.code,
          label: item.name,
        })) || [],
      };
    } catch (error) {
      logError(error as Error, 'GEOGRAPHIC_SERVICE_SEARCH');
      return { regions: [], provinces: [], cities: [], barangays: [] };
    }
  }
}

// Export singleton instance
export const geographicService = new GeographicService();