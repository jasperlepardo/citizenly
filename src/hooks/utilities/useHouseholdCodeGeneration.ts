'use client';

/**
 * Household Code Generation Hook
 * 
 * @description Focused hook for generating PSGC-compliant household codes.
 * Extracted from useHouseholdCreation to follow single responsibility principle.
 */

import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logging/secureLogger';

/**
 * Return type for useHouseholdCodeGeneration hook
 */
export interface UseHouseholdCodeGenerationReturn {
  /** Generates a PSGC-compliant household code */
  generateHouseholdCode: () => Promise<string>;
  /** Derives geographic codes from barangay code */
  deriveGeographicCodes: (barangayCode: string) => {
    region_code: string;
    province_code: string;
    city_municipality_code: string;
  } | null;
}

/**
 * Custom hook for household code generation
 * 
 * @description Handles the generation of PSGC-compliant household codes
 * following the format: RRPPMMBBB-SSSS-TTTT-HHHH
 */
export function useHouseholdCodeGeneration(): UseHouseholdCodeGenerationReturn {
  const { userProfile } = useAuth();

  /**
   * Generates a PSGC-compliant household code
   *
   * @description Creates a unique household identifier following the format:
   * RRPPMMBBB-SSSS-TTTT-HHHH where:
   * - RRPPMMBBB: 9-digit barangay code
   * - SSSS: Street/Sitio code (0000 for now)
   * - TTTT: Type code (0001 for household)
   * - HHHH: Sequential household number
   *
   * @returns {Promise<string>} Generated household code
   */
  const generateHouseholdCode = useCallback(async (): Promise<string> => {
    const barangayCode = userProfile?.barangay_code || '000000000';

    try {
      logger.debug('Generating household code', { barangayCode });

      // Get next household sequence number for this barangay
      const { count, error } = await supabase
        .from('households')
        .select('*', { count: 'exact', head: true })
        .eq('barangay_code', barangayCode);

      if (error) {
        logger.warn('Error counting households, using fallback', { error: error.message });
        throw new Error('Failed to generate household code');
      }

      const nextSequence = (count || 0) + 1;

      // Format: RRPPMMBBB-SSSS-TTTT-HHHH
      const householdCode = `${barangayCode}-0000-0001-${nextSequence.toString().padStart(4, '0')}`;
      
      logger.debug('Generated household code', { householdCode, sequence: nextSequence });
      return householdCode;
    } catch (error) {
      logger.error('Failed to generate household code', { error, barangayCode });
      throw new Error('Unable to generate household code. Please try again.');
    }
  }, [userProfile?.barangay_code]);

  /**
   * Derives higher-level geographic codes from barangay code
   *
   * @description Extracts region, province, and city/municipality codes
   * from the 9-digit PSGC barangay code following the format:
   * RRPPMMBBB (Region-Province-City/Municipality-Barangay)
   *
   * @param barangayCode - 9-digit PSGC barangay code
   * @returns Geographic code hierarchy or null if invalid
   */
  const deriveGeographicCodes = useCallback((barangayCode: string) => {
    if (!barangayCode || barangayCode.length !== 9 || !/^\d{9}$/.test(barangayCode)) {
      logger.warn('Invalid barangay code format', { barangayCode });
      return null;
    }

    const regionCode = barangayCode.substring(0, 2);
    const provinceCode = barangayCode.substring(0, 4);
    const cityMunicipalityCode = barangayCode.substring(0, 6);

    return {
      region_code: regionCode,
      province_code: provinceCode,
      city_municipality_code: cityMunicipalityCode,
    };
  }, []);

  return {
    generateHouseholdCode,
    deriveGeographicCodes,
  };
}