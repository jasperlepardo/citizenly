/**
 * Address Service
 * CONSOLIDATED - Address lookup and geographic data services
 * Consolidates lib/utilities/address-lookup.ts functionality
 */

import { createLogger } from '../lib/config/environment';
import { supabase } from '../lib/supabase';

import { cacheService, CacheKeys, CacheTags } from './cache-service';

const logger = createLogger('AddressService');

export interface AddressLabels {
  regionLabel?: string;
  provinceLabel?: string;
  cityLabel?: string;
  barangayLabel?: string;
  streetLabel?: string;
  subdivisionLabel?: string;
}

export interface HouseholdTypeLabels {
  householdTypeLabel?: string;
  tenureStatusLabel?: string;
  householdUnitLabel?: string;
  householdHeadPositionLabel?: string;
  householdHeadLabel?: string;
}

export interface CompleteAddress {
  region_code: string | null;
  region_name: string;
  province_code: string | null;
  province_name: string | null;
  city_municipality_code: string | null;
  city_municipality_name: string;
  city_municipality_type: string;
  barangay_code: string;
  barangay_name: string;
  full_address: string;
}

/**
 * Address Service Class
 * Consolidated address lookup and geographic utilities
 */
export class AddressService {
  /**
   * Lookup address labels from their codes/IDs with caching
   */
  async lookupAddressLabels(addressData: {
    regionCode?: string;
    provinceCode?: string;
    cityMunicipalityCode?: string;
    barangayCode?: string;
    streetId?: string;
    subdivisionId?: string;
  }): Promise<AddressLabels> {
    const cacheKey = `address-labels:${JSON.stringify(addressData)}`;
    
    return await cacheService.getOrSet(
      cacheKey,
      async () => {
        const labels: AddressLabels = {};

        try {
          // Batch lookup for better performance
          const lookupPromises = [];

          // Lookup region
          if (addressData.regionCode) {
            lookupPromises.push(
              supabase
                .from('psgc_regions')
                .select('name')
                .eq('code', addressData.regionCode)
                .single()
                .then(({ data }) => {
                  if (data) labels.regionLabel = data.name;
                })
            );
          }

          // Lookup province
          if (addressData.provinceCode) {
            lookupPromises.push(
              supabase
                .from('psgc_provinces')
                .select('name')
                .eq('code', addressData.provinceCode)
                .single()
                .then(({ data }) => {
                  if (data) labels.provinceLabel = data.name;
                })
            );
          }

          // Lookup city/municipality
          if (addressData.cityMunicipalityCode) {
            lookupPromises.push(
              supabase
                .from('psgc_cities_municipalities')
                .select('name')
                .eq('code', addressData.cityMunicipalityCode)
                .single()
                .then(({ data }) => {
                  if (data) labels.cityLabel = data.name;
                })
            );
          }

          // Lookup barangay
          if (addressData.barangayCode) {
            lookupPromises.push(
              supabase
                .from('psgc_barangays')
                .select('name')
                .eq('code', addressData.barangayCode)
                .single()
                .then(({ data }) => {
                  if (data) labels.barangayLabel = data.name;
                })
            );
          }

          // Lookup street
          if (addressData.streetId) {
            lookupPromises.push(
              supabase
                .from('geo_streets')
                .select('name')
                .eq('id', addressData.streetId)
                .single()
                .then(({ data }) => {
                  if (data) labels.streetLabel = data.name;
                })
            );
          }

          // Lookup subdivision
          if (addressData.subdivisionId) {
            lookupPromises.push(
              supabase
                .from('geo_subdivisions')
                .select('name')
                .eq('id', addressData.subdivisionId)
                .single()
                .then(({ data }) => {
                  if (data) labels.subdivisionLabel = data.name;
                })
            );
          }

          await Promise.all(lookupPromises);
        } catch (error) {
          logger.warn('Error looking up address labels:', error);
        }

        return labels;
      },
      {
        ttl: 300000, // 5 minutes
        tags: [CacheTags.ADDRESSES]
      }
    );
  }

  /**
   * Lookup household type labels with enum mapping
   */
  lookupHouseholdTypeLabels(householdData: {
    householdType?: string;
    tenureStatus?: string;
    householdUnit?: string;
    householdHeadPosition?: string;
  }): HouseholdTypeLabels {
    const labels: HouseholdTypeLabels = {};

    // Static mappings - no need for database lookup
    const householdTypeMap: Record<string, string> = {
      nuclear: 'Nuclear Family',
      single_parent: 'Single Parent',
      extended: 'Extended Family',
      childless: 'Childless',
      one_person: 'One Person',
      non_family: 'Non-Family',
      other: 'Other',
    };

    const tenureStatusMap: Record<string, string> = {
      owned: 'Owned',
      owned_with_mortgage: 'Owned with Mortgage',
      rented: 'Rented',
      occupied_for_free: 'Occupied for Free',
      occupied_without_consent: 'Occupied without Consent',
      others: 'Others',
    };

    const householdUnitMap: Record<string, string> = {
      single_house: 'Single House',
      duplex: 'Duplex',
      apartment: 'Apartment',
      townhouse: 'Townhouse',
      condominium: 'Condominium',
      boarding_house: 'Boarding House',
      institutional: 'Institutional',
      makeshift: 'Makeshift',
      others: 'Others',
    };

    const householdHeadPositionMap: Record<string, string> = {
      father: 'Father',
      mother: 'Mother',
      son: 'Son',
      daughter: 'Daughter',
      grandmother: 'Grandmother',
      grandfather: 'Grandfather',
      father_in_law: 'Father-in-law',
      mother_in_law: 'Mother-in-law',
      brother_in_law: 'Brother-in-law',
      sister_in_law: 'Sister-in-law',
      spouse: 'Spouse',
      sibling: 'Sibling',
      guardian: 'Guardian',
      ward: 'Ward',
      other: 'Other',
    };

    if (householdData.householdType) {
      labels.householdTypeLabel =
        householdTypeMap[householdData.householdType] || householdData.householdType;
    }

    if (householdData.tenureStatus) {
      labels.tenureStatusLabel =
        tenureStatusMap[householdData.tenureStatus] || householdData.tenureStatus;
    }

    if (householdData.householdUnit) {
      labels.householdUnitLabel =
        householdUnitMap[householdData.householdUnit] || householdData.householdUnit;
    }

    if (householdData.householdHeadPosition) {
      labels.householdHeadPositionLabel =
        householdHeadPositionMap[householdData.householdHeadPosition] ||
        householdData.householdHeadPosition;
    }

    return labels;
  }

  /**
   * Lookup household head name from residents table with caching
   */
  async lookupHouseholdHeadLabel(householdHeadId?: string): Promise<string | undefined> {
    if (!householdHeadId) return undefined;

    const cacheKey = `household-head:${householdHeadId}`;
    
    return await cacheService.getOrSet(
      cacheKey,
      async () => {
        try {
          const { data: resident } = await supabase
            .from('residents')
            .select('first_name, middle_name, last_name, extension_name')
            .eq('id', householdHeadId)
            .single();

          if (resident) {
            return [
              resident.first_name,
              resident.middle_name,
              resident.last_name,
              resident.extension_name,
            ]
              .filter(Boolean)
              .join(' ');
          }
        } catch (error) {
          logger.warn('Error looking up household head:', error);
        }

        return undefined;
      },
      {
        ttl: 300000, // 5 minutes
        tags: [CacheTags.RESIDENTS, CacheTags.HOUSEHOLDS]
      }
    );
  }

  /**
   * Format complete address from components
   */
  formatFullAddress(address: Partial<CompleteAddress>): string {
    if (!address) return '';
    
    const parts = [
      address.barangay_name,
      address.city_municipality_name,
      address.province_name,
      address.region_name,
    ].filter(Boolean);
    
    return parts.join(', ') || '';
  }

  /**
   * Format barangay display name
   */
  formatBarangayName(name: string): string {
    if (!name) return '';
    
    // Add "Barangay" prefix if not already present
    if (name.toLowerCase().startsWith('barangay ')) {
      return name;
    }
    
    return `Barangay ${name}`;
  }

  /**
   * Format city/municipality display name
   */
  formatCityName(name: string, type: string): string {
    if (!name) return '';
    
    const cityType = type?.toLowerCase();
    
    if (cityType === 'city' && !name.toLowerCase().includes('city')) {
      return `${name} City`;
    }
    
    if (cityType === 'municipality' && !name.toLowerCase().includes('municipality')) {
      return `Municipality of ${name}`;
    }
    
    return name;
  }

  /**
   * Validate PSGC code format
   */
  isValidPsgcCode(code: string, level?: 'region' | 'province' | 'city' | 'barangay'): boolean {
    if (!code) return false;
    
    const digitsOnly = code.replace(/\D/g, '');
    const detectedLevel = this.getPsgcLevel(code);
    
    if (level && detectedLevel !== level) {
      return false;
    }
    
    return detectedLevel !== 'unknown';
  }

  /**
   * Extract PSGC level from code length
   */
  getPsgcLevel(code: string): 'region' | 'province' | 'city' | 'barangay' | 'unknown' {
    if (!code) return 'unknown';
    
    const length = code.replace(/\D/g, '').length;
    
    switch (length) {
      case 2: return 'region';
      case 4: return 'province';
      case 6: return 'city';
      case 9: return 'barangay';
      default: return 'unknown';
    }
  }

  /**
   * Extract parent codes from PSGC code
   */
  extractParentCodes(barangayCode: string): {
    regionCode: string;
    provinceCode: string;
    cityCode: string;
  } {
    if (!barangayCode || barangayCode.length < 9) {
      return { regionCode: '', provinceCode: '', cityCode: '' };
    }
    
    const digits = barangayCode.replace(/\D/g, '');
    
    return {
      regionCode: digits.substring(0, 2),
      provinceCode: digits.substring(0, 4), 
      cityCode: digits.substring(0, 6),
    };
  }

  /**
   * Check if address is in Metro Manila
   */
  isMetroManilaAddress(address: Partial<CompleteAddress>): boolean {
    if (!address.region_code) return false;
    
    // NCR (National Capital Region) code
    return address.region_code === '13' || address.region_code === '130000000';
  }

  /**
   * Clear address-related caches
   */
  clearCache(): void {
    cacheService.invalidateByTag(CacheTags.ADDRESSES);
  }
}

// Export singleton instance
export const addressService = new AddressService();
