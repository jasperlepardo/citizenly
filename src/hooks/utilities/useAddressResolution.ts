'use client';

/**
 * Address Resolution Hook
 * 
 * @description Focused hook for resolving and displaying address hierarchy information.
 * Extracted from useHouseholdCreation to follow single responsibility principle.
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/data/supabase';
import { logger } from '@/lib/logging/secure-logger';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Address hierarchy information for display purposes
 */
export interface AddressDisplayInfo {
  /** Region name */
  region: string;
  /** Province name */
  province: string;
  /** City/Municipality name with type */
  cityMunicipality: string;
  /** Barangay name */
  barangay: string;
}

/**
 * Return type for useAddressResolution hook
 */
export interface UseAddressResolutionReturn {
  /** Resolved address information for display */
  addressDisplayInfo: AddressDisplayInfo;
  /** Whether address resolution is in progress */
  isLoading: boolean;
  /** Error message if resolution fails */
  error: string | null;
  /** Manually trigger address resolution */
  loadAddressDisplayInfo: (barangayCode: string) => Promise<void>;
  /** Reset address display info */
  resetAddressInfo: () => void;
}

/**
 * Default loading state
 */
const LOADING_ADDRESS_INFO: AddressDisplayInfo = {
  region: 'Loading...',
  province: 'Loading...',
  cityMunicipality: 'Loading...',
  barangay: 'Loading...',
};

/**
 * Default error state
 */
const ERROR_ADDRESS_INFO: AddressDisplayInfo = {
  region: 'Region information not available',
  province: 'Province information not available',
  cityMunicipality: 'City/Municipality information not available',
  barangay: 'Barangay information not available',
};

/**
 * Custom hook for address resolution
 * 
 * @description Handles loading and resolving complete address hierarchy 
 * from barangay code to region level for display purposes.
 */
export function useAddressResolution(): UseAddressResolutionReturn {
  const { userProfile } = useAuth();
  const [addressDisplayInfo, setAddressDisplayInfo] = useState<AddressDisplayInfo>(LOADING_ADDRESS_INFO);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Resolves barangay information
   */
  const resolveBarangayInfo = useCallback(async (barangayCode: string, addressInfo: AddressDisplayInfo) => {
    const { data: barangayData, error: barangayError } = await supabase
      .from('psgc_barangays')
      .select('name, city_municipality_code')
      .eq('code', barangayCode)
      .single();

    if (barangayError) {
      logger.warn('Barangay not found', { barangayCode, error: barangayError.message });
      return null;
    }

    if (barangayData) {
      addressInfo.barangay = barangayData.name;
      return barangayData.city_municipality_code;
    }

    return null;
  }, []);

  /**
   * Resolves city/municipality information
   */
  const resolveCityInfo = useCallback(async (cityCode: string, addressInfo: AddressDisplayInfo) => {
    const { data: cityData, error: cityError } = await supabase
      .from('psgc_cities_municipalities')
      .select('name, type, province_code')
      .eq('code', cityCode)
      .single();

    if (cityError) {
      logger.warn('City/Municipality not found', { cityCode, error: cityError.message });
      return null;
    }

    if (cityData) {
      addressInfo.cityMunicipality = `${cityData.name} (${cityData.type})`;
      return cityData.province_code;
    }

    return null;
  }, []);

  /**
   * Resolves province information
   */
  const resolveProvinceInfo = useCallback(async (provinceCode: string, addressInfo: AddressDisplayInfo) => {
    const { data: provinceData, error: provinceError } = await supabase
      .from('psgc_provinces')
      .select('name, region_code')
      .eq('code', provinceCode)
      .single();

    if (provinceError) {
      logger.warn('Province not found', { provinceCode, error: provinceError.message });
      return null;
    }

    if (provinceData) {
      addressInfo.province = provinceData.name;
      return provinceData.region_code;
    }

    return null;
  }, []);

  /**
   * Resolves region information
   */
  const resolveRegionInfo = useCallback(async (regionCode: string, addressInfo: AddressDisplayInfo) => {
    const { data: regionData, error: regionError } = await supabase
      .from('psgc_regions')
      .select('name')
      .eq('code', regionCode)
      .single();

    if (regionError) {
      logger.warn('Region not found', { regionCode, error: regionError.message });
      return;
    }

    if (regionData) {
      addressInfo.region = regionData.name;
    }
  }, []);

  /**
   * Loads and resolves complete address hierarchy for display
   */
  const loadAddressDisplayInfo = useCallback(async (barangayCode: string) => {
    if (!barangayCode) {
      logger.warn('No barangay code provided for address resolution');
      setAddressDisplayInfo(ERROR_ADDRESS_INFO);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      logger.debug('Loading address display info', { barangayCode });

      const addressInfo: AddressDisplayInfo = { ...ERROR_ADDRESS_INFO };
      addressInfo.barangay = `Barangay ${barangayCode}`;

      // Sequential resolution with early exit on errors
      const cityCode = await resolveBarangayInfo(barangayCode, addressInfo);
      if (cityCode) {
        const provinceCode = await resolveCityInfo(cityCode, addressInfo);
        if (provinceCode) {
          const regionCode = await resolveProvinceInfo(provinceCode, addressInfo);
          if (regionCode) {
            await resolveRegionInfo(regionCode, addressInfo);
          }
        }
      }

      setAddressDisplayInfo(addressInfo);
      logger.debug('Address resolution completed', { addressInfo });
    } catch (error) {
      const errorMessage = 'Failed to resolve address information';
      logger.error(errorMessage, { error, barangayCode });
      setError(errorMessage);
      setAddressDisplayInfo(ERROR_ADDRESS_INFO);
    } finally {
      setIsLoading(false);
    }
  }, [resolveBarangayInfo, resolveCityInfo, resolveProvinceInfo, resolveRegionInfo]);

  /**
   * Reset address display info to initial state
   */
  const resetAddressInfo = useCallback(() => {
    setAddressDisplayInfo(LOADING_ADDRESS_INFO);
    setError(null);
    setIsLoading(false);
  }, []);

  /**
   * Auto-load address info when user profile changes
   */
  useEffect(() => {
    if (userProfile?.barangay_code) {
      loadAddressDisplayInfo(userProfile.barangay_code);
    }
  }, [userProfile?.barangay_code, loadAddressDisplayInfo]);

  return {
    addressDisplayInfo,
    isLoading,
    error,
    loadAddressDisplayInfo,
    resetAddressInfo,
  };
}