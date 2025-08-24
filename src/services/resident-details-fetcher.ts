/**
 * Optimized data fetching utilities for resident details page
 * Replaces sequential queries with optimized batch operations
 */

import { supabase } from '@/lib/data/supabase';
import { logger } from '@/lib/logging/secure-logger';

export interface AddressInfo {
  barangay_name?: string;
  city_municipality_name?: string;
  province_name?: string;
  region_name?: string;
  full_address?: string;
}

export interface PsocInfo {
  code: string;
  title: string;
  hierarchy?: string;
  level?: string;
}

/**
 * Optimized address fetcher - tries efficient view first, falls back gracefully
 */
export const fetchAddressInfo = async (barangayCode: string): Promise<AddressInfo | undefined> => {
  try {
    logger.debug('Loading address information', { barangayCode });

    // Try address hierarchy view first (most efficient)
    const { data: addressViewData, error: viewError } = await supabase
      .from('psgc_address_hierarchy')
      .select('barangay_name, city_municipality_name, province_name, region_name, full_address')
      .eq('barangay_code', barangayCode)
      .single();

    if (addressViewData && !viewError) {
      return {
        barangay_name: addressViewData.barangay_name,
        city_municipality_name: addressViewData.city_municipality_name,
        province_name: addressViewData.province_name,
        region_name: addressViewData.region_name,
        full_address: addressViewData.full_address,
      };
    }

    // Fallback to optimized join query (much faster than sequential queries)
    return await fetchAddressFromJoinedTables(barangayCode);
  } catch (addressError) {
    logger.warn('Address data lookup failed', {
      error: addressError instanceof Error ? addressError.message : 'Unknown error',
    });
    return undefined;
  }
};

/**
 * Optimized address fallback - single join query instead of sequential queries
 */
const fetchAddressFromJoinedTables = async (barangayCode: string): Promise<AddressInfo | undefined> => {
  try {
    logger.debug('Using optimized join query for address data');

    // Single optimized query with joins instead of sequential queries
    const { data, error } = await supabase
      .from('psgc_barangays')
      .select(`
        name,
        psgc_cities_municipalities(
          name,
          is_independent,
          psgc_provinces(
            name,
            psgc_regions(name)
          )
        )
      `)
      .eq('code', barangayCode)
      .single();

    if (!data || error) {
      logger.warn('Optimized address query failed', { error: error?.message });
      return undefined;
    }

    const city = data.psgc_cities_municipalities as any;
    const province = city?.psgc_provinces;
    const region = province?.psgc_regions;

    const addressParts = [
      data.name,
      city?.name,
      !city?.is_independent ? province?.name : null,
      region?.name,
    ].filter(Boolean);

    return {
      barangay_name: data.name,
      city_municipality_name: city?.name,
      province_name: !city?.is_independent ? province?.name : undefined,
      region_name: region?.name,
      full_address: addressParts.join(', '),
    };
  } catch (error) {
    logger.warn('Fallback address query failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return undefined;
  }
};

/**
 * Optimized PSOC fetcher with caching
 */
const psocCache = new Map<string, PsocInfo>();

export const fetchPsocInfo = async (occupationCode: string): Promise<PsocInfo | null> => {
  // Check cache first
  if (psocCache.has(occupationCode)) {
    return psocCache.get(occupationCode)!;
  }

  try {
    const { data: psocData, error } = await supabase
      .from('psoc_occupation_search')
      .select('occupation_code, occupation_title, full_hierarchy')
      .eq('occupation_code', occupationCode)
      .single();

    if (psocData && !error) {
      const psocInfo = {
        code: psocData.occupation_code,
        title: psocData.occupation_title,
        hierarchy: psocData.full_hierarchy || psocData.occupation_title,
        level: 'occupation'
      };
      
      // Cache the result
      psocCache.set(occupationCode, psocInfo);
      return psocInfo;
    }
    
    return null;
  } catch (psocError) {
    logger.warn('PSOC data lookup failed', {
      error: psocError instanceof Error ? psocError.message : 'Unknown error',
    });
    return null;
  }
};

/**
 * Batch fetch multiple resident details efficiently
 */
export const fetchResidentDetailsOptimized = async (
  barangayCode?: string,
  occupationCode?: string
): Promise<{
  addressInfo?: AddressInfo;
  psocInfo?: PsocInfo;
}> => {
  // Use Promise.allSettled for parallel execution with graceful error handling
  const [addressResult, psocResult] = await Promise.allSettled([
    barangayCode ? fetchAddressInfo(barangayCode) : Promise.resolve(undefined),
    occupationCode ? fetchPsocInfo(occupationCode) : Promise.resolve(null),
  ]);

  return {
    addressInfo: addressResult.status === 'fulfilled' ? addressResult.value : undefined,
    psocInfo: psocResult.status === 'fulfilled' ? psocResult.value || undefined : undefined,
  };
};

/**
 * Clear PSOC cache when needed
 */
export const clearPsocCache = (): void => {
  psocCache.clear();
};