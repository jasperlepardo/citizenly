'use client';

/**
 * Address Resolution Hook
 *
 * @description Focused hook for resolving and displaying address hierarchy information.
 * Extracted from useHouseholdCreation to follow single responsibility principle.
 */

import { useState, useCallback, useEffect } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/data/supabase';
import { logger } from '@/lib/logging/secure-logger';

import type { AddressHierarchyInfo } from '@/types/domain/addresses/addresses';
import type { UseAddressResolutionReturn } from '@/types/shared/hooks/utilityHooks';

/**
 * Default loading state
 */
const LOADING_ADDRESS_INFO: AddressHierarchyInfo = {
  region: 'Loading...',
  province: 'Loading...',
  cityMunicipality: 'Loading...',
  barangay: 'Loading...',
};

/**
 * Default error state
 */
const ERROR_ADDRESS_INFO: AddressHierarchyInfo = {
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
  const [addressDisplayInfo, setAddressHierarchyInfo] =
    useState<AddressHierarchyInfo>(LOADING_ADDRESS_INFO);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Resolves barangay information
   */
  const resolveBarangayInfo = useCallback(
    async (barangayCode: string, addressInfo: AddressHierarchyInfo) => {
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
    },
    []
  );

  /**
   * Resolves city/municipality information
   */
  const resolveCityInfo = useCallback(
    async (cityCode: string, addressInfo: AddressHierarchyInfo) => {
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
    },
    []
  );

  /**
   * Resolves province information
   */
  const resolveProvinceInfo = useCallback(
    async (provinceCode: string, addressInfo: AddressHierarchyInfo) => {
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
    },
    []
  );

  /**
   * Resolves region information
   */
  const resolveRegionInfo = useCallback(
    async (regionCode: string, addressInfo: AddressHierarchyInfo) => {
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
    },
    []
  );

  /**
   * Loads and resolves complete address hierarchy for display
   */
  const loadAddressHierarchyInfo = useCallback(
    async (barangayCode: string) => {
      if (!barangayCode) {
        logger.warn('No barangay code provided for address resolution');
        setAddressHierarchyInfo(ERROR_ADDRESS_INFO);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        logger.debug('Loading address display info', { barangayCode });

        const addressInfo: AddressHierarchyInfo = { ...ERROR_ADDRESS_INFO };
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

        setAddressHierarchyInfo(addressInfo);
        logger.debug('Address resolution completed', { addressInfo });
      } catch (error) {
        const errorMessage = 'Failed to resolve address information';
        logger.error(errorMessage, { error, barangayCode });
        setError(errorMessage);
        setAddressHierarchyInfo(ERROR_ADDRESS_INFO);
      } finally {
        setIsLoading(false);
      }
    },
    [resolveBarangayInfo, resolveCityInfo, resolveProvinceInfo, resolveRegionInfo]
  );

  /**
   * Reset address display info to initial state
   */
  const resetAddressInfo = useCallback(() => {
    setAddressHierarchyInfo(LOADING_ADDRESS_INFO);
    setError(null);
    setIsLoading(false);
  }, []);

  /**
   * Auto-load address info when user profile changes
   */
  useEffect(() => {
    if (userProfile?.barangay_code) {
      loadAddressHierarchyInfo(userProfile.barangay_code);
    }
  }, [userProfile?.barangay_code, loadAddressHierarchyInfo]);

  return {
    addressDisplayInfo,
    isLoading,
    error,
    loadAddressHierarchyInfo,
    resetAddressInfo,
  };
}
