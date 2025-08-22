'use client';

/**
 * Optimized PSGC Search Hook
 * 
 * @description Refactored PSGC search hook using common utilities.
 * Maintains the same API while using shared search patterns.
 */

import { useCallback } from 'react';
import { useGenericSearch } from './useGenericSearch';
import { useSearchCache, searchFormatters } from '@/lib/utilities/searchUtilities';

/**
 * PSGC search result interface
 */
export interface PsgcSearchResult {
  code: string;
  name: string;
  level: 'region' | 'province' | 'city' | 'municipality' | 'barangay';
  parent_code?: string;
}

/**
 * PSGC search options
 */
export interface UsePsgcSearchOptions {
  levels?: 'region' | 'province' | 'city' | 'municipality' | 'barangay' | 'all';
  limit?: number;
  parentCode?: string;
  debounceMs?: number;
  enableCache?: boolean;
}

/**
 * Return type for usePsgcSearch hook
 */
export interface UsePsgcSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  options: PsgcSearchResult[];
  isLoading: boolean;
  error: Error | null;
  clearSearch: () => void;
  refresh: () => void;
  searchByLevel: (level: string, query: string) => Promise<void>;
}

/**
 * Mock PSGC API - Replace with actual implementation
 */
const mockPsgcApi = {
  async searchLocations(params: {
    query: string;
    levels: string;
    limit: number;
    parentCode?: string;
  }): Promise<PsgcSearchResult[]> {
    // Mock implementation - replace with actual PSGC API calls
    
    // Return empty array for now - actual implementation would fetch from API
    return [];
  }
};

/**
 * Optimized PSGC search hook
 * 
 * @description Provides search functionality for Philippine Standard Geographic Code (PSGC)
 * locations with caching, debouncing, and level filtering.
 */
export function useOptimizedPsgcSearch({
  levels = 'barangay',
  limit = 50,
  parentCode,
  debounceMs = 300,
  enableCache = true,
}: UsePsgcSearchOptions = {}): UsePsgcSearchReturn {
  
  // Setup caching if enabled
  const { getCachedResult, setCachedResult } = useSearchCache<PsgcSearchResult>(
    `psgc-${levels}-${parentCode || 'all'}`,
    enableCache ? 100 : 0
  );

  /**
   * PSGC search function with caching
   */
  const searchFunction = useCallback(async (query: string): Promise<PsgcSearchResult[]> => {
    if (!query.trim()) {
      return [];
    }

    // Check cache first
    if (enableCache) {
      const cached = getCachedResult(query);
      if (cached) {
        return cached;
      }
    }

    try {
      const results = await mockPsgcApi.searchLocations({
        query: query.trim(),
        levels,
        limit,
        parentCode,
      });

      // Cache the results
      if (enableCache) {
        setCachedResult(query, results);
      }

      return results;
    } catch (error) {
      throw new Error('Failed to search PSGC locations');
    }
  }, [levels, limit, parentCode, enableCache, getCachedResult, setCachedResult]);

  // Use generic search hook
  const {
    query,
    setQuery,
    results: options,
    isLoading,
    error,
    clearSearch,
    refresh,
  } = useGenericSearch(searchFunction, {
    debounceMs,
    minQueryLength: 2,
    onError: (error) => {
    },
  });

  /**
   * Search by specific level
   */
  const searchByLevel = useCallback(async (level: string, searchQuery: string): Promise<void> => {
    try {
      await mockPsgcApi.searchLocations({
        query: searchQuery.trim(),
        levels: level,
        limit,
        parentCode,
      });

      // Update query to trigger re-render with new results
      setQuery(searchQuery);
    } catch (error) {
      throw error;
    }
  }, [limit, parentCode, setQuery]);

  return {
    query,
    setQuery,
    options,
    isLoading,
    error,
    clearSearch,
    refresh,
    searchByLevel,
  };
}

// Export as usePsgcSearch for backward compatibility
export { useOptimizedPsgcSearch as usePsgcSearch };

// Export the optimized hook for direct import
export default useOptimizedPsgcSearch;