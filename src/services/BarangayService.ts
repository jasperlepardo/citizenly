import { ServiceBase, ServiceResponse, SearchOptions } from './base/ServiceBase';
import { supabase } from '@/lib/supabase';

export interface Barangay {
  code: string;
  name: string;
  city_code?: string;
  province_code?: string;
  region_code?: string;
}

export interface BarangayWithHierarchy extends Barangay {
  city_name?: string;
  province_name?: string;
  region_name?: string;
  full_address?: string;
}

/**
 * Service for managing barangay data and operations
 */
export class BarangayService extends ServiceBase {
  constructor() {
    super('psgc_barangays', 'BARANGAY');
  }

  /**
   * Search barangays by name
   */
  async searchByName(
    searchTerm: string,
    options: SearchOptions = {}
  ): Promise<ServiceResponse<Barangay[]>> {
    return this.search<Barangay>('name', { ...options, searchTerm });
  }

  /**
   * Get barangay by code
   */
  async getByCode(code: string): Promise<ServiceResponse<Barangay>> {
    return this.fetch<Barangay>(() =>
      supabase
        .from(this.tableName)
        .select()
        .eq('code', code)
        .single()
    );
  }

  /**
   * Get barangay with full address hierarchy
   */
  async getWithHierarchy(code: string): Promise<ServiceResponse<BarangayWithHierarchy>> {
    return this.fetch<BarangayWithHierarchy>(() =>
      supabase
        .from(this.tableName)
        .select(`
          code,
          name,
          city:psgc_cities_municipalities!inner(
            code,
            name,
            province:psgc_provinces!inner(
              code,
              name,
              region:psgc_regions!inner(
                code,
                name
              )
            )
          )
        `)
        .eq('code', code)
        .single()
    );
  }

  /**
   * Get barangays by city
   */
  async getByCity(cityCode: string): Promise<ServiceResponse<Barangay[]>> {
    return this.fetch<Barangay[]>(() =>
      supabase
        .from(this.tableName)
        .select()
        .eq('city_code', cityCode)
        .order('name', { ascending: true })
    );
  }

  /**
   * Get barangays by province
   */
  async getByProvince(provinceCode: string): Promise<ServiceResponse<Barangay[]>> {
    return this.fetch<Barangay[]>(() =>
      supabase
        .from(this.tableName)
        .select(`
          code,
          name,
          city:psgc_cities_municipalities!inner(
            code,
            province_code
          )
        `)
        .eq('city.province_code', provinceCode)
        .order('name', { ascending: true })
    );
  }

  /**
   * Search barangays with advanced filters
   */
  async advancedSearch(
    searchTerm: string,
    cityCode?: string,
    provinceCode?: string
  ): Promise<ServiceResponse<BarangayWithHierarchy[]>> {
    return this.fetch<BarangayWithHierarchy[]>(() => {
      let query = supabase
        .from(this.tableName)
        .select(`
          code,
          name,
          city:psgc_cities_municipalities!inner(
            code,
            name,
            province:psgc_provinces!inner(
              code,
              name,
              region:psgc_regions!inner(
                code,
                name
              )
            )
          )
        `)
        .ilike('name', `%${searchTerm}%`)
        .limit(20);

      if (cityCode) {
        query = query.eq('city_code', cityCode);
      }

      if (provinceCode) {
        query = query.eq('city.province_code', provinceCode);
      }

      return query.order('name', { ascending: true });
    });
  }

  /**
   * Validate barangay code exists
   */
  async validateCode(code: string): Promise<boolean> {
    const { data, error } = await this.count({ code });
    return !error && data > 0;
  }

  /**
   * Get barangay statistics
   */
  async getStatistics(): Promise<ServiceResponse<{
    totalBarangays: number;
    barangaysByCity: Record<string, number>;
    barangaysByProvince: Record<string, number>;
  }>> {
    try {
      // Get total count
      const totalResult = await this.count();
      
      // Get counts by city
      const { data: cityData, error: cityError } = await supabase
        .from(this.tableName)
        .select('city_code')
        .not('city_code', 'is', null);

      if (cityError) {
        return { data: null, error: cityError };
      }

      // Get counts by province (through city relationship)
      const { data: provinceData, error: provinceError } = await supabase
        .from('psgc_cities_municipalities')
        .select('province_code, barangays:psgc_barangays(count)')
        .not('province_code', 'is', null);

      if (provinceError) {
        return { data: null, error: provinceError };
      }

      // Process counts
      const barangaysByCity: Record<string, number> = {};
      const barangaysByProvince: Record<string, number> = {};

      if (cityData) {
        cityData.forEach(item => {
          const city = item.city_code;
          barangaysByCity[city] = (barangaysByCity[city] || 0) + 1;
        });
      }

      if (provinceData) {
        provinceData.forEach(item => {
          const province = item.province_code;
          barangaysByProvince[province] = (barangaysByProvince[province] || 0) + 1;
        });
      }

      return {
        data: {
          totalBarangays: totalResult.data || 0,
          barangaysByCity,
          barangaysByProvince
        },
        error: null
      };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}

// Export singleton instance
export const barangayService = new BarangayService();