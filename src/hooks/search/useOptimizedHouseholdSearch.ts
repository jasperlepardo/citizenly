'use client';

/**
 * Optimized Household Search Hook
 *
 * @description Refactored household search hook using common utilities.
 * Eliminates code duplication while maintaining functionality.
 */

import { useCallback, useState } from 'react';

import { useAuth } from '@/contexts';
import { supabase } from '@/lib';
import { useSearchCache, searchFormatters } from '@/utils/search-utilities';

import { useGenericSearch } from './useGenericSearch';

/**
 * Household search result interface
 */
export interface HouseholdSearchResult {
  id: string;
  code: string;
  name: string;
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
 * Household search options
 */
export interface UseHouseholdSearchOptions {
  limit?: number;
  debounceMs?: number;
  enableCache?: boolean;
}

/**
 * Return type for useHouseholdSearch hook
 */
export interface UseHouseholdSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  options: HouseholdSearchResult[];
  isLoading: boolean;
  error: Error | null;
  clearSearch: () => void;
  refresh: () => void;
  // Lazy loading support
  hasMore: boolean;
  loadMore: () => void;
  isLoadingMore: boolean;
  totalCount: number;
}

/**
 * Process households data and add computed fields
 */
const processHouseholdsData = (householdsData: any[]): HouseholdSearchResult[] => {
  return householdsData.map(household => ({
    id: household.id || household.code,
    code: household.code,
    name: household.name || `Household ${household.code}`,
    address:
      household.address ||
      searchFormatters.formatAddress([
        household.house_number,
        household.geo_streets?.[0]?.name || '',
        household.geo_subdivisions?.[0]?.name || '',
      ]),
    house_number: household.house_number,
    geo_streets: household.geo_streets,
    geo_subdivisions: household.geo_subdivisions,
    head_resident: household.head_resident,
  }));
};

/**
 * Optimized household search hook
 *
 * @description Provides search functionality for households within the user's barangay
 * with proper formatting and error handling.
 */
export function useOptimizedHouseholdSearch({
  limit = 20,
  debounceMs = 400,
  enableCache = true,
}: UseHouseholdSearchOptions = {}): UseHouseholdSearchReturn {
  const { userProfile, session } = useAuth();

  // Additional state for lazy loading
  const [offset, setOffset] = useState(0);
  const [allResults, setAllResults] = useState<HouseholdSearchResult[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Setup caching if enabled
  const { getCachedResult, setCachedResult } = useSearchCache<HouseholdSearchResult>(
    `households-${userProfile?.barangay_code || 'all'}`,
    enableCache ? 100 : 0
  );

  /**
   * Household search function with pagination support
   */
  const searchFunction = useCallback(
    async (
      query: string,
      currentOffset: number = 0,
      append: boolean = false
    ): Promise<HouseholdSearchResult[]> => {
      
      // Get fresh session from Supabase first
      const { data: { session: freshSession } } = await supabase.auth.getSession();
      const hasValidAuth = !!(freshSession?.access_token || session?.access_token);
      
      // Check authentication requirements
      if (!hasValidAuth) {
        console.warn('Authentication required for household search');
        throw new Error('Authentication required. Please sign in to search households.');
      }

      // Check cache first (only for initial search)
      if (enableCache && currentOffset === 0) {
        const cached = getCachedResult(query);
        if (cached) {
          setAllResults(cached);
          setHasMore(false); // Cached results don't have pagination info
          setTotalCount(cached.length);
          return cached;
        }
      }

      try {
        // Build API request URL
        const searchParams = new URLSearchParams({
          page: Math.floor(currentOffset / limit) + 1 + '', // API expects 1-based page
          limit: limit.toString(),
        });

        if (query && query.trim()) {
          searchParams.set('search', query.trim());
        }

        // Get current session for authentication - always get fresh from Supabase
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        const token = currentSession?.access_token || session?.access_token;
        
        console.log('Auth check:', {
          hasCurrentSession: !!currentSession,
          hasToken: !!token,
          tokenLength: token?.length || 0,
        });
        
        
        if (!token) {
          throw new Error('Authentication required. Please sign in.');
        }

        const response = await fetch(`/api/households?${searchParams}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const apiResponse = await response.json();

        // The API response structure: { data, pagination, message, metadata }
        // No 'success' field - if response.ok is true, the request succeeded

        const householdsData = apiResponse.data || [];
        const results = processHouseholdsData(householdsData);

        // Update pagination state based on API response
        const { total, page: currentPage, limit: currentLimit } = apiResponse.pagination || {};
        setTotalCount(total || 0);
        setHasMore(results.length >= currentLimit && currentPage * currentLimit < (total || 0));

        if (append) {
          setAllResults(currentAllResults => {
            const newAllResults = [...currentAllResults, ...results];
            return newAllResults;
          });
          return results;
        } else {
          // Replace results (initial search)
          setAllResults(results);

          // Cache initial results
          if (enableCache) {
            setCachedResult(query, results);
          }

          return results;
        }
      } catch (error) {
        console.error('Household search API error:', error);
        
        // Handle authentication errors specifically
        if (error instanceof Error && error.message.includes('401')) {
          // Clear any cached authentication state that might be stale
          setAllResults([]);
          setHasMore(false);
          setTotalCount(0);
          throw new Error('Authentication required. Please sign in to search households.');
        }
        
        throw new Error('Unable to search households. Please try again.');
      }
    },
    [
      userProfile?.barangay_code,
      session?.access_token,
      enableCache,
      getCachedResult,
      setCachedResult,
      limit,
    ]
  );

  // Use generic search hook with modified search function
  const {
    query,
    setQuery: originalSetQuery,
    results: options,
    isLoading,
    error,
    clearSearch: originalClearSearch,
    refresh,
  } = useGenericSearch(q => searchFunction(q, 0, false), {
    debounceMs,
    minQueryLength: 0,
    onError: () => {
      // Error already handled by search function and useGenericSearch
    },
  });

  // Enhanced setQuery that resets pagination
  const setQuery = useCallback(
    (newQuery: string) => {
      setOffset(0);
      setAllResults([]);
      setHasMore(false);
      originalSetQuery(newQuery);
    },
    [originalSetQuery]
  );

  // Enhanced clear search
  const clearSearch = useCallback(() => {
    setOffset(0);
    setAllResults([]);
    setHasMore(false);
    setTotalCount(0);
    originalClearSearch();
  }, [originalClearSearch]);

  // Load more function for lazy loading
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || !query.trim()) return;

    setIsLoadingMore(true);

    // Use functional update to get current length without dependency
    let currentOffset = 0;
    setAllResults(currentResults => {
      currentOffset = currentResults.length;
      return currentResults; // No change, just get the length
    });

    setOffset(currentOffset);

    try {
      await searchFunction(query, currentOffset, true);
    } catch (error) {
      console.error('Failed to load more results:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, query, searchFunction]);

  return {
    query,
    setQuery,
    options: allResults.length > 0 ? allResults : options || [], // Use allResults when available for pagination
    isLoading,
    error,
    clearSearch,
    refresh,
    hasMore,
    loadMore,
    isLoadingMore,
    totalCount,
  };
}

// Export as useHouseholdSearch for backward compatibility
export { useOptimizedHouseholdSearch as useHouseholdSearch };
