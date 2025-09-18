/**
 * Supabase Geographic Repository
 * Infrastructure implementation of IGeographicRepository
 * Handles all Supabase-specific geographic data access
 */

import type { RepositoryResult } from '@/types/infrastructure/services/repositories';
import { createLogger } from '@/lib/config/environment';
import { supabase } from '@/lib/data/supabase';

const logger = createLogger('SupabaseGeographicRepository');

/**
 * Supabase implementation of Geographic Repository
 * All Supabase PSGC data access logic is isolated here
 * Uses shared singleton Supabase client to prevent multiple auth instances
 */
export class SupabaseGeographicRepository {
  private readonly supabase = supabase;

  /**
   * Get all regions from PSGC data
   */
  async getRegions(): Promise<RepositoryResult<any[]>> {
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
  async getProvinces(regionCode: string): Promise<RepositoryResult<any[]>> {
    try {
      const { data, error } = await this.supabase
        .from('psgc_provinces')
        .select('code, name, region_code')
        .eq('region_code', regionCode)
        .order('name');

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
  async getCities(provinceCode: string): Promise<RepositoryResult<any[]>> {
    try {
      const { data, error } = await this.supabase
        .from('psgc_cities_municipalities')
        .select(`
          code,
          name,
          type,
          province_code,
          is_independent
        `)
        .eq('province_code', provinceCode)
        .order('name');

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
  async getBarangays(cityCode: string): Promise<RepositoryResult<any[]>> {
    try {
      const { data, error } = await this.supabase
        .from('psgc_barangays')
        .select(`
          code,
          name,
          city_municipality_code,
          urban_rural_status
        `)
        .eq('city_municipality_code', cityCode)
        .order('name');

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
          .select('region_code, region_name')
          .eq('region_code', codes.regionCode)
          .single();

        if (regionError && regionError.code !== 'PGRST116') {
          logger.error('Failed to lookup region', regionError);
          return { success: false, error: 'Failed to lookup region' };
        }

        if (region) {
          address.region = { code: region.region_code, name: region.region_name };
        }
      }

      // Lookup province
      if (codes.provinceCode) {
        const { data: province, error: provinceError } = await this.supabase
          .from('psgc_provinces')
          .select('province_code, province_name, region_code')
          .eq('province_code', codes.provinceCode)
          .single();

        if (provinceError && provinceError.code !== 'PGRST116') {
          logger.error('Failed to lookup province', provinceError);
          return { success: false, error: 'Failed to lookup province' };
        }

        if (province) {
          address.province = { code: province.province_code, name: province.province_name };
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
            city_municipality_code,
            city_municipality_name,
            province_code,
            is_city,
            city_class
          `)
          .eq('city_municipality_code', codes.cityCode)
          .single();

        if (cityError && cityError.code !== 'PGRST116') {
          logger.error('Failed to lookup city', cityError);
          return { success: false, error: 'Failed to lookup city' };
        }

        if (city) {
          address.city = { 
            code: city.city_municipality_code, 
            name: city.city_municipality_name,
            is_city: city.is_city
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
            barangay_code,
            barangay_name,
            city_municipality_code,
            is_urban
          `)
          .eq('barangay_code', codes.barangayCode)
          .single();

        if (barangayError && barangayError.code !== 'PGRST116') {
          logger.error('Failed to lookup barangay', barangayError);
          return { success: false, error: 'Failed to lookup barangay' };
        }

        if (barangay) {
          address.barangay = { 
            code: barangay.barangay_code, 
            name: barangay.barangay_name,
            is_urban: barangay.is_urban
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
    try {
      const labels: any = {};

      // Helper function to lookup a single address component
      const lookupAddressComponent = async (
        table: string,
        field: string,
        value: string | undefined
      ): Promise<string | undefined> => {
        if (!value) return undefined;
        
        try {
          // Add timeout to prevent hanging on permission errors
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Query timeout')), 5000); // 5 second timeout
          });
          
          const queryPromise = this.supabase
            .from(table)
            .select('name')
            .eq(field, value)
            .single();
          
          const { data } = await Promise.race([queryPromise, timeoutPromise]);
          return data?.name;
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
}