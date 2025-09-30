/**
 * Supabase Geographic Repository
 * Infrastructure implementation of IGeographicRepository
 * Handles all Supabase-specific geographic data access
 */

import { createLogger } from '@/lib/config/environment';
import { supabase } from '@/lib/data/supabase';
import type { RepositoryResult } from '@/types/infrastructure/services/repositories';

const logger = createLogger('SupabaseGeographicRepository');

/**
 * Supabase implementation of Geographic Repository
 * All Supabase PSGC data access logic is isolated here
 * Uses shared singleton Supabase client to prevent multiple auth instances
 */
export class SupabaseGeographicRepository {
  private readonly supabase = supabase;

  /**
   * Find all regions from PSGC data
   */
  async findRegions(): Promise<RepositoryResult<any[]>> {
    try {
      const { data, error } = await this.supabase
        .from('psgc_regions')
        .select('code, name')
        .order('code');

      if (error) {
        logger.error('Failed to fetch regions', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      logger.error('Unexpected error fetching regions', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get provinces for a specific region
   */
  async findProvinces(regionCode?: string): Promise<RepositoryResult<any[]>> {
    try {
      let query = this.supabase
        .from('psgc_provinces')
        .select('code, name, region_code');

      if (regionCode) {
        query = query.eq('region_code', regionCode);
      }

      const { data, error } = await query.order('name');

      if (error) {
        logger.error('Failed to fetch provinces', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      logger.error('Unexpected error fetching provinces', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get cities/municipalities for a specific province
   */
  async findCities(provinceCode?: string): Promise<RepositoryResult<any[]>> {
    try {
      let query = this.supabase
        .from('psgc_cities_municipalities')
        .select(`
          code,
          name,
          type,
          province_code,
          is_independent
        `);

      if (provinceCode) {
        query = query.eq('province_code', provinceCode);
      }

      const { data, error } = await query.order('name');

      if (error) {
        logger.error('Failed to fetch cities', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      logger.error('Unexpected error fetching cities', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get barangays for a specific city/municipality
   */
  async findBarangays(cityCode?: string): Promise<RepositoryResult<any[]>> {
    try {
      let query = this.supabase
        .from('psgc_barangays')
        .select(`
          code,
          name,
          city_municipality_code
        `);

      if (cityCode) {
        query = query.eq('city_municipality_code', cityCode);
      }

      const { data, error } = await query.order('name');

      if (error) {
        logger.error('Failed to fetch barangays', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      logger.error('Unexpected error fetching barangays', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Lookup complete address information from codes
   */
  async lookupAddress(codes: {
    regionCode?: string;
    provinceCode?: string;
    cityCode?: string;
    barangayCode?: string;
  }): Promise<RepositoryResult<any>> {
    try {
      const address: any = {};

      // Lookup region
      if (codes.regionCode) {
        const { data: region, error: regionError } = await this.supabase
          .from('psgc_regions')
          .select('code, name')
          .eq('code', codes.regionCode)
          .single();

        if (regionError && regionError.code !== 'PGRST116') {
          logger.error('Failed to lookup region - Code:', codes.regionCode, 'Error:', JSON.stringify(regionError));
          return { success: false, error: 'Failed to lookup region' };
        }

        if (regionError?.code === 'PGRST116') {
          logger.warn('Region not found in database - Code:', codes.regionCode);
        }

        if (region) {
          address.region = { code: region.code, name: region.name };
        }
      }

      // Lookup province
      if (codes.provinceCode) {
        const { data: province, error: provinceError } = await this.supabase
          .from('psgc_provinces')
          .select('code, name, region_code')
          .eq('code', codes.provinceCode)
          .single();

        if (provinceError && provinceError.code !== 'PGRST116') {
          logger.error('Failed to lookup province - Code:', codes.provinceCode, 'Error:', JSON.stringify(provinceError));
          return { success: false, error: 'Failed to lookup province' };
        }

        if (provinceError?.code === 'PGRST116') {
          logger.warn('Province not found in database - Code:', codes.provinceCode);
        }

        if (province) {
          address.province = { code: province.code, name: province.name };
          // Also get region if not already retrieved
          if (!address.region && province.region_code) {
            const regionResult = await this.lookupAddress({ regionCode: province.region_code });
            if (regionResult.success && regionResult.data?.region) {
              address.region = regionResult.data.region;
            }
          }
        }
      }

      // Lookup city
      if (codes.cityCode) {
        const { data: city, error: cityError } = await this.supabase
          .from('psgc_cities_municipalities')
          .select(`
            code,
            name,
            province_code,
            type,
            is_independent
          `)
          .eq('code', codes.cityCode)
          .single();

        if (cityError && cityError.code !== 'PGRST116') {
          logger.error('Failed to lookup city - Code:', codes.cityCode, 'Error:', JSON.stringify(cityError));
          return { success: false, error: 'Failed to lookup city' };
        }

        if (cityError?.code === 'PGRST116') {
          logger.warn('City not found in database - Code:', codes.cityCode);
        }

        if (city) {
          address.city = {
            code: city.code,
            name: city.name,
            type: city.type,
            is_independent: city.is_independent
          };
          // Also get province and region if not already retrieved
          if (!address.province && city.province_code) {
            const provinceResult = await this.lookupAddress({ provinceCode: city.province_code });
            if (provinceResult.success && provinceResult.data) {
              address.province = provinceResult.data.province;
              address.region = provinceResult.data.region;
            }
          }
        }
      }

      // Lookup barangay
      if (codes.barangayCode) {
        const { data: barangay, error: barangayError } = await this.supabase
          .from('psgc_barangays')
          .select(`
            code,
            name,
            city_municipality_code
          `)
          .eq('code', codes.barangayCode)
          .single();

        if (barangayError && barangayError.code !== 'PGRST116') {
          logger.error('Failed to lookup barangay - Code:', codes.barangayCode, 'Error:', JSON.stringify(barangayError));
          return { success: false, error: 'Failed to lookup barangay' };
        }

        if (barangayError?.code === 'PGRST116') {
          logger.warn('Barangay not found in database - Code:', codes.barangayCode);
        }

        if (barangay) {
          address.barangay = {
            code: barangay.code,
            name: barangay.name
          };
          // Also get city, province, and region if not already retrieved
          if (!address.city && barangay.city_municipality_code) {
            const cityResult = await this.lookupAddress({ cityCode: barangay.city_municipality_code });
            if (cityResult.success && cityResult.data) {
              address.city = cityResult.data.city;
              address.province = cityResult.data.province;
              address.region = cityResult.data.region;
            }
          }
        }
      }

      return { success: true, data: address };
    } catch (error) {
      logger.error('Unexpected error looking up address', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Address lookup failed' 
      };
    }
  }

  /**
   * Lookup address labels from their codes/IDs
   */
  async lookupAddressLabels(addressData: {
    regionCode?: string;
    provinceCode?: string;
    cityMunicipalityCode?: string;
    barangayCode?: string;
    streetId?: string;
    subdivisionId?: string;
  }): Promise<RepositoryResult<any>> {
    console.log('🔍 SupabaseGeographicRepository.lookupAddressLabels called with:', addressData);
    try {
      const labels: any = {};

      // Helper function to lookup a single address component using API endpoints
      const lookupAddressComponent = async (
        table: string,
        field: string,
        value: string | undefined
      ): Promise<string | undefined> => {
        if (!value) return undefined;

        console.log(`🔍 Looking up ${field}=${value} in table ${table}`);

        try {
          // Use API endpoints instead of direct database queries to avoid RLS issues
          let apiUrl = '';
          let searchParam = '';

          if (table === 'geo_streets') {
            // For streets, we need to find by ID - use a search approach
            apiUrl = '/api/addresses/streets';
            searchParam = ''; // We'll filter the results client-side
          } else if (table === 'geo_subdivisions') {
            // For subdivisions, we need to find by ID - use a search approach
            apiUrl = '/api/addresses/subdivisions';
            searchParam = ''; // We'll filter the results client-side
          } else {
            // For PSGC tables, use direct query (these work fine)
            const queryPromise = this.supabase
              .from(table)
              .select('name')
              .eq(field, value)
              .single();

            const { data, error } = await queryPromise;

            if (error) {
              logger.warn(`Database error looking up ${field} in ${table}`, {
                error: error.message,
                code: error.code,
                value
              });
              return undefined;
            }

            return data?.name;
          }

          // For geo_streets and geo_subdivisions, use API endpoints
          if (apiUrl) {
            const response = await fetch(apiUrl, {
              headers: {
                'Authorization': `Bearer ${(await this.supabase.auth.getSession()).data.session?.access_token}`,
                'Content-Type': 'application/json',
              },
            });

            if (!response.ok) {
              logger.warn(`API error looking up ${field} in ${table}`, {
                status: response.status,
                statusText: response.statusText,
                value
              });
              return undefined;
            }

            const result = await response.json();
            const items = result.data || [];

            // Find the item with matching ID
            const item = items.find((item: any) => item.value === value);
            const name = item?.label;

            console.log(`🔍 API Lookup result for ${table}.${field}=${value}:`, { name, itemsCount: items.length });

            return name;
          }

          return undefined;
        } catch (error) {
          // Log the specific error for debugging
          logger.warn(`Failed to lookup ${field} in ${table}`, { error: error instanceof Error ? error.message : String(error) });
          return undefined;
        }
      };

      // Define lookup configurations
      const lookupConfigs = [
        { code: addressData.regionCode, table: 'psgc_regions', field: 'code', labelKey: 'regionLabel' },
        { code: addressData.provinceCode, table: 'psgc_provinces', field: 'code', labelKey: 'provinceLabel' },
        { code: addressData.cityMunicipalityCode, table: 'psgc_cities_municipalities', field: 'code', labelKey: 'cityLabel' },
        { code: addressData.barangayCode, table: 'psgc_barangays', field: 'code', labelKey: 'barangayLabel' },
        { code: addressData.streetId, table: 'geo_streets', field: 'id', labelKey: 'streetLabel' },
        { code: addressData.subdivisionId, table: 'geo_subdivisions', field: 'id', labelKey: 'subdivisionLabel' },
      ];

      // Perform lookups in parallel for better performance
      const results = await Promise.all(
        lookupConfigs.map(async (config) => ({
          labelKey: config.labelKey,
          value: await lookupAddressComponent(config.table, config.field, config.code)
        }))
      );

      // Assign results to labels object
      results.forEach(({ labelKey, value }) => {
        if (value) {
          labels[labelKey] = value;
        }
      });

      return { success: true, data: labels };
    } catch (error) {
      logger.error('Error looking up address labels', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Address label lookup failed' 
      };
    }
  }

  /**
   * Lookup household head name from residents table
   */
  async lookupHouseholdHeadLabel(householdHeadId?: string): Promise<RepositoryResult<string>> {
    if (!householdHeadId) {
      return { success: true, data: '' };
    }

    try {
      const { data: resident, error } = await this.supabase
        .from('residents')
        .select('first_name, middle_name, last_name, extension_name')
        .eq('id', householdHeadId)
        .single();

      if (error) {
        logger.error('Failed to lookup household head', error);
        return { success: false, error: 'Failed to lookup household head' };
      }

      if (resident) {
        const fullName = [
          resident.first_name,
          resident.middle_name,
          resident.last_name,
          resident.extension_name,
        ]
          .filter(Boolean)
          .join(' ');

        return { success: true, data: fullName };
      }

      return { success: true, data: '' };
    } catch (error) {
      logger.error('Error looking up household head', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Household head lookup failed' 
      };
    }
  }

  /**
   * Find region by code
   */
  async findRegionByCode(code: string): Promise<RepositoryResult<any>> {
    try {
      const { data, error } = await this.supabase
        .from('psgc_regions')
        .select('code, name')
        .eq('code', code)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: false, error: 'Region not found' };
        }
        logger.error('Failed to find region by code', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      logger.error('Unexpected error finding region', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to find region'
      };
    }
  }

  /**
   * Find province by code
   */
  async findProvinceByCode(code: string): Promise<RepositoryResult<any>> {
    try {
      const { data, error } = await this.supabase
        .from('psgc_provinces')
        .select('code, name, region_code')
        .eq('code', code)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: false, error: 'Province not found' };
        }
        logger.error('Failed to find province by code', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      logger.error('Unexpected error finding province', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to find province'
      };
    }
  }

  /**
   * Find city by code
   */
  async findCityByCode(code: string): Promise<RepositoryResult<any>> {
    try {
      const { data, error } = await this.supabase
        .from('psgc_cities_municipalities')
        .select('code, name, type, province_code, is_independent')
        .eq('code', code)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: false, error: 'City not found' };
        }
        logger.error('Failed to find city by code', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      logger.error('Unexpected error finding city', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to find city'
      };
    }
  }

  /**
   * Find barangay by code
   */
  async findBarangayByCode(code: string): Promise<RepositoryResult<any>> {
    try {
      const { data, error } = await this.supabase
        .from('psgc_barangays')
        .select('code, name, city_municipality_code')
        .eq('code', code)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: false, error: 'Barangay not found' };
        }
        logger.error('Failed to find barangay by code', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      logger.error('Unexpected error finding barangay', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to find barangay'
      };
    }
  }

  /**
   * Backward compatibility aliases
   */
  async getRegions(): Promise<RepositoryResult<any[]>> {
    return this.findRegions();
  }

  async getProvinces(regionCode: string): Promise<RepositoryResult<any[]>> {
    return this.findProvinces(regionCode);
  }

  async getCities(provinceCode: string): Promise<RepositoryResult<any[]>> {
    return this.findCities(provinceCode);
  }

  async getBarangays(cityCode: string): Promise<RepositoryResult<any[]>> {
    return this.findBarangays(cityCode);
  }
}