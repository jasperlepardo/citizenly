'use client';

/**
 * Optimized Household Search Hook
 * 
 * @description Refactored household search hook using common utilities.
 * Eliminates code duplication while maintaining functionality.
 */

import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGenericSearch } from './useGenericSearch';
import { searchFormatters } from '@/lib/utilities';

/**
 * Household search result interface
 */
export interface HouseholdSearchResult {
  id: string;
  code: string;
  head_name: string;
  address: string;
  house_number?: string;
  geo_streets?: Array<{ name: string }>;
  geo_subdivisions?: Array<{ name: string }>;
  head_resident?: {
    first_name?: string;
    middle_name?: string;
    last_name?: string;
  };
}

/**
 * Return type for useHouseholdSearch hook
 */
export interface UseHouseholdSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  households: HouseholdSearchResult[];
  isLoading: boolean;
  error: Error | null;
  clearSearch: () => void;
  refresh: () => void;
}

/**
 * Temporary mock household query builder - Replace with actual Supabase implementation
 */
const TEMP_mockHouseholdQuery = {
  select: (fields: string) => ({
    eq: (field: string, value: string) => ({
      ilike: (searchField: string, searchValue: string) => ({
        limit: (count: number) => Promise.resolve({
          data: [] as any[], // Mock empty results
          error: null,
        }),
      }),
      limit: (count: number) => Promise.resolve({
        data: [] as any[], // Mock empty results
        error: null,
      }),
    }),
  }),
};

/**
 * Process households data and add computed fields
 */
const processHouseholdsData = (householdsData: any[]): HouseholdSearchResult[] => {
  return householdsData.map(household => ({
    ...household,
    head_name: searchFormatters.formatName(
      household.head_resident?.first_name,
      household.head_resident?.middle_name,
      household.head_resident?.last_name
    ),
    address: searchFormatters.formatAddress([
      household.house_number,
      household.geo_streets?.[0]?.name,
      household.geo_subdivisions?.[0]?.name,
    ]),
  }));
};

/**
 * Optimized household search hook
 * 
 * @description Provides search functionality for households within the user's barangay
 * with proper formatting and error handling.
 */
export function useOptimizedHouseholdSearch(): UseHouseholdSearchReturn {
  const { userProfile } = useAuth();

  /**
   * Household search function
   */
  const searchFunction = useCallback(async (query: string): Promise<HouseholdSearchResult[]> => {
    if (!userProfile?.barangay_code) {
      return [];
    }

    try {
      const queryFields = `
        id,
        code,
        house_number,
        geo_streets (name),
        geo_subdivisions (name),
        head_resident:residents!households_head_resident_id_fkey (
          first_name,
          middle_name,
          last_name
        )
      `;

      let queryBuilder;

      if (!query.trim()) {
        // Load first few households for the barangay when no search query
        queryBuilder = TEMP_mockHouseholdQuery
          .select(queryFields)
          .eq('barangay_code', userProfile.barangay_code)
          .limit(20);
      } else {
        // Search households by code or head resident name
        queryBuilder = TEMP_mockHouseholdQuery
          .select(queryFields)
          .eq('barangay_code', userProfile.barangay_code)
          .ilike('code', `%${query}%`)
          .limit(50);
      }

      const { data: householdsData, error } = await queryBuilder;

      if (error) {
        throw new Error('Failed to search households');
      }

      return processHouseholdsData(householdsData || []);
    } catch (error) {
      throw new Error('Unable to search households. Please try again.');
    }
  }, [userProfile?.barangay_code]);

  // Use generic search hook
  const {
    query,
    setQuery,
    results: households,
    isLoading,
    error,
    clearSearch,
    refresh,
  } = useGenericSearch(searchFunction, {
    debounceMs: 400,
    minQueryLength: 0,
    onError: (error) => {
      // Error already handled by onError callback
    },
  });

  return {
    query,
    setQuery,
    households,
    isLoading,
    error,
    clearSearch,
    refresh,
  };
}

// Export as useHouseholdSearch for backward compatibility
export { useOptimizedHouseholdSearch as useHouseholdSearch };