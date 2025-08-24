'use client';

/**
 * Household Creation Operation Hook
 * 
 * @description Focused hook for handling the database creation operation of households.
 * Extracted from useHouseholdCreation to follow single responsibility principle.
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/data/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { logger, logError } from '@/lib/logging/secure-logger';
import type { HouseholdFormData } from '../utilities/useHouseholdForm';

/**
 * Household database record structure
 */
export interface HouseholdRecord {
  code: string;
  house_number: string;
  street_id: string;
  subdivision_id?: string;
  barangay_code: string;
  region_code: string;
  province_code: string;
  city_municipality_code: string;
  created_by: string;
}

/**
 * Return type for useHouseholdCreationOperation hook
 */
export interface UseHouseholdCreationOperationReturn {
  /** Whether creation operation is in progress */
  isCreating: boolean;
  /** Error message from creation operation */
  creationError: string | null;
  /** Creates the household record in database */
  createHouseholdRecord: (formData: HouseholdFormData, householdCode: string) => Promise<string | null>;
  /** Resets creation state */
  resetCreationState: () => void;
}

/**
 * Custom hook for household creation database operations
 * 
 * @description Handles the actual database insertion of household records
 * with proper error handling and user context.
 */
export function useHouseholdCreationOperation(): UseHouseholdCreationOperationReturn {
  const { userProfile } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);

  /**
   * Derives geographic codes from barangay code
   */
  const deriveGeographicCodes = useCallback((barangayCode: string) => {
    if (!barangayCode || barangayCode.length !== 9 || !/^\d{9}$/.test(barangayCode)) {
      return null;
    }

    return {
      region_code: barangayCode.substring(0, 2),
      province_code: barangayCode.substring(0, 4),
      city_municipality_code: barangayCode.substring(0, 6),
    };
  }, []);

  /**
   * Creates the household record in the database
   *
   * @param formData - Form data containing household information
   * @param householdCode - Generated household code
   * @returns Promise resolving to household code on success, null on failure
   */
  const createHouseholdRecord = useCallback(async (
    formData: HouseholdFormData, 
    householdCode: string
  ): Promise<string | null> => {
    if (!userProfile?.barangay_code || !userProfile?.id) {
      const error = 'User profile or barangay code not available';
      setCreationError(error);
      logger.error('Household creation failed', { error });
      return null;
    }

    setIsCreating(true);
    setCreationError(null);

    try {
      logger.debug('Creating household record', { 
        householdCode, 
        formData,
        barangayCode: userProfile.barangay_code 
      });

      // Derive geographic codes
      const geoCodes = deriveGeographicCodes(userProfile.barangay_code);
      if (!geoCodes) {
        throw new Error('Invalid barangay code format');
      }

      // Prepare household record
      const householdRecord: Omit<HouseholdRecord, 'created_at' | 'updated_at'> = {
        code: householdCode,
        house_number: formData.house_number.trim(),
        street_id: formData.street_id,
        subdivision_id: formData.subdivision_id || undefined,
        barangay_code: userProfile.barangay_code,
        region_code: geoCodes.region_code,
        province_code: geoCodes.province_code,
        city_municipality_code: geoCodes.city_municipality_code,
        created_by: userProfile.id,
      };

      // Insert household record
      const { data, error } = await supabase
        .from('households')
        .insert([householdRecord])
        .select('code')
        .single();

      if (error) {
        logger.error('Database insertion failed', { error: error.message, householdRecord });
        
        // Provide user-friendly error messages
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('A household with this code already exists. Please try again.');
        } else if (error.code === '23503') { // Foreign key constraint violation
          throw new Error('Invalid street or subdivision selected. Please check your selection.');
        } else {
          throw new Error('Failed to create household. Please try again.');
        }
      }

      if (!data?.code) {
        throw new Error('Household created but code not returned');
      }

      logger.info('Household created successfully', { 
        householdCode: data.code,
        barangayCode: userProfile.barangay_code 
      });

      return data.code;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setCreationError(errorMessage);
      logError(error instanceof Error ? error : new Error('Household creation failed'));
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [userProfile, deriveGeographicCodes]);

  /**
   * Resets creation state
   */
  const resetCreationState = useCallback(() => {
    setIsCreating(false);
    setCreationError(null);
  }, []);

  return {
    isCreating,
    creationError,
    createHouseholdRecord,
    resetCreationState,
  };
}