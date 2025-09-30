/**
 * Geographic Domain Service
 * Pure business logic for geographic operations
 * No infrastructure dependencies - uses interfaces only
 */

import type { IGeographicRepository } from '@/types/domain/repositories';
import type { RepositoryResult } from '@/types/infrastructure/services/repositories';

/**
 * Geographic location data
 */
export interface GeographicLocation {
  code: string;
  name: string;
  level: 'region' | 'province' | 'city' | 'barangay';
  parent_code?: string;
}

/**
 * Complete address information
 */
export interface CompleteAddress {
  region?: { code: string; name: string };
  province?: { code: string; name: string };
  city?: { code: string; name: string };
  barangay?: { code: string; name: string };
  full_address: string;
}

/**
 * Geographic Domain Service
 * Contains pure business logic for geographic operations
 */
export class GeographicDomainService {
  constructor(private readonly repository: IGeographicRepository) {}

  /**
   * Get hierarchical address data from codes
   */
  async buildCompleteAddress(codes: {
    regionCode?: string;
    provinceCode?: string;
    cityCode?: string;
    barangayCode?: string;
  }): Promise<RepositoryResult<CompleteAddress>> {
    // Build complete address from individual lookups
    const parts: CompleteAddress = { full_address: '' };

    if (codes.regionCode) {
      const regionResult = await this.repository.findRegionByCode(codes.regionCode);
      if (regionResult.success && regionResult.data) {
        parts.region = { code: codes.regionCode, name: regionResult.data.name };
      }
    }

    if (codes.provinceCode) {
      const provinceResult = await this.repository.findProvinceByCode(codes.provinceCode);
      if (provinceResult.success && provinceResult.data) {
        parts.province = { code: codes.provinceCode, name: provinceResult.data.name };
      }
    }

    if (codes.cityCode) {
      const cityResult = await this.repository.findCityByCode(codes.cityCode);
      if (cityResult.success && cityResult.data) {
        parts.city = { code: codes.cityCode, name: cityResult.data.name };
      }
    }

    if (codes.barangayCode) {
      const barangayResult = await this.repository.findBarangayByCode(codes.barangayCode);
      if (barangayResult.success && barangayResult.data) {
        parts.barangay = { code: codes.barangayCode, name: barangayResult.data.name };
      }
    }

    // Build full address string
    const addressParts = [];
    if (parts.barangay) addressParts.push(parts.barangay.name);
    if (parts.city) addressParts.push(parts.city.name);
    if (parts.province) addressParts.push(parts.province.name);
    if (parts.region) addressParts.push(parts.region.name);

    parts.full_address = addressParts.join(', ');

    const result = { success: true, data: parts, error: null };
    
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to lookup address'
      };
    }

    // Build hierarchical address
    const address: CompleteAddress = {
      region: result.data.region,
      province: result.data.province,
      city: result.data.city,
      barangay: result.data.barangay,
      full_address: this.formatFullAddress(result.data)
    };

    return {
      success: true,
      data: address
    };
  }

  /**
   * Get regions for dropdown
   */
  async getRegions(): Promise<RepositoryResult<GeographicLocation[]>> {
    const result = await this.repository.findRegions();
    
    if (!result.success) {
      return result;
    }

    // Transform and validate data
    const regions = (result.data || []).map((region: any) => ({
      code: region.code,
      name: region.name,
      level: 'region' as const
    }));

    return {
      success: true,
      data: regions
    };
  }

  /**
   * Get provinces for a region
   */
  async getProvinces(regionCode: string): Promise<RepositoryResult<GeographicLocation[]>> {
    // Validate region code
    if (!this.isValidRegionCode(regionCode)) {
      return {
        success: false,
        error: 'Invalid region code format'
      };
    }

    const result = await this.repository.findProvinces(regionCode);
    
    if (!result.success) {
      return result;
    }

    // Transform and sort data
    const provinces = (result.data || [])
      .map((province: any) => ({
        code: province.code,
        name: province.name,
        level: 'province' as const,
        parent_code: regionCode
      }))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));

    return {
      success: true,
      data: provinces
    };
  }

  /**
   * Get cities/municipalities for a province
   */
  async getCities(provinceCode: string): Promise<RepositoryResult<GeographicLocation[]>> {
    // Validate province code
    if (!this.isValidProvinceCode(provinceCode)) {
      return {
        success: false,
        error: 'Invalid province code format'
      };
    }

    const result = await this.repository.findCities(provinceCode);
    
    if (!result.success) {
      return result;
    }

    // Transform and categorize
    const cities = (result.data || [])
      .map((city: any) => ({
        code: city.code,
        name: this.formatCityName(city),
        level: 'city' as const,
        parent_code: provinceCode
      }))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));

    return {
      success: true,
      data: cities
    };
  }

  /**
   * Get barangays for a city
   */
  async getBarangays(cityCode: string): Promise<RepositoryResult<GeographicLocation[]>> {
    // Validate city code
    if (!this.isValidCityCode(cityCode)) {
      return {
        success: false,
        error: 'Invalid city code format'
      };
    }

    const result = await this.repository.findBarangays(cityCode);

    if (!result.success) {
      return result;
    }

    // Transform and sort
    const barangays = (result.data || [])
      .map((barangay: any) => ({
        code: barangay.code,
        name: barangay.name,
        level: 'barangay' as const,
        parent_code: cityCode
      }))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));

    return {
      success: true,
      data: barangays
    };
  }

  /**
   * Search geographic locations by name
   */
  async searchLocations(query: string, level?: 'region' | 'province' | 'city' | 'barangay'): Promise<RepositoryResult<GeographicLocation[]>> {
    // Validate query
    if (!query || query.trim().length < 2) {
      return {
        success: false,
        error: 'Search query must be at least 2 characters'
      };
    }

    const sanitizedQuery = query.trim().toLowerCase();

    // Get all locations of specified level (or all if not specified)
    const results: GeographicLocation[] = [];

    try {
      if (!level || level === 'region') {
        const regions = await this.getRegions();
        if (regions.success) {
          results.push(...regions.data!.filter(r => 
            r.name.toLowerCase().includes(sanitizedQuery)
          ));
        }
      }

      if (!level || level === 'province') {
        // Note: This would need to search all provinces, not just for a region
        // Implementation depends on repository capabilities
      }

      // Similar for city and barangay...

      return {
        success: true,
        data: results.slice(0, 20) // Limit results
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed'
      };
    }
  }

  /**
   * Validate address hierarchy
   */
  async validateAddressHierarchy(codes: {
    regionCode?: string;
    provinceCode?: string;
    cityCode?: string;
    barangayCode?: string;
  }): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check code formats
    if (codes.regionCode && !this.isValidRegionCode(codes.regionCode)) {
      errors.push('Invalid region code format');
    }
    if (codes.provinceCode && !this.isValidProvinceCode(codes.provinceCode)) {
      errors.push('Invalid province code format');
    }
    if (codes.cityCode && !this.isValidCityCode(codes.cityCode)) {
      errors.push('Invalid city code format');
    }
    if (codes.barangayCode && !this.isValidBarangayCode(codes.barangayCode)) {
      errors.push('Invalid barangay code format');
    }

    // Check hierarchy consistency
    if (codes.barangayCode && !codes.cityCode) {
      errors.push('City code required when barangay code is provided');
    }
    if (codes.cityCode && !codes.provinceCode) {
      errors.push('Province code required when city code is provided');
    }
    if (codes.provinceCode && !codes.regionCode) {
      errors.push('Region code required when province code is provided');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Format full address from components
   */
  private formatFullAddress(components: any): string {
    const parts = [
      components.barangay?.name ? `Barangay ${components.barangay.name}` : null,
      components.city?.name,
      components.province?.name,
      components.region?.name
    ].filter(Boolean);

    return parts.join(', ');
  }

  /**
   * Format city name with type indicator
   */
  private formatCityName(city: any): string {
    const name = city.name;
    const isCity = city.type === 'City' || city.is_independent;
    return isCity ? `${name} (City)` : name;
  }

  /**
   * Validate region code format
   */
  private isValidRegionCode(code: string): boolean {
    // Region codes are typically 2 digits
    return /^\d{2}$/.test(code);
  }

  /**
   * Validate province code format
   */
  private isValidProvinceCode(code: string): boolean {
    // Province codes are typically 4 digits
    return /^\d{4}$/.test(code);
  }

  /**
   * Validate city code format
   */
  private isValidCityCode(code: string): boolean {
    // City codes are typically 6 digits
    return /^\d{6}$/.test(code);
  }

  /**
   * Validate barangay code format
   */
  private isValidBarangayCode(code: string): boolean {
    // Barangay codes are typically 9 digits
    return /^\d{9}$/.test(code);
  }
}