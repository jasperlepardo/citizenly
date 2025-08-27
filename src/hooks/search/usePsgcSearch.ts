'use client';

/**
 * Optimized PSGC Search Hook
 *
 * @description Refactored PSGC search hook using common utilities.
 * Maintains the same API while using shared search patterns.
 */

import { useCallback, useState } from 'react';

import { useSearchCache, searchFormatters } from '@/utils/search-utilities';

import { useGenericSearch } from './useGenericSearch';

/**
 * PSGC search result interface
 */
export interface PsgcSearchResult {
  code: string;
  name: string;
  level: 'region' | 'province' | 'city' | 'municipality' | 'barangay';
  parent_code?: string;
  full_address?: string;
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
  // Lazy loading support
  hasMore: boolean;
  loadMore: () => void;
  isLoadingMore: boolean;
  totalCount: number;
}

/**
 * PSGC API implementation
 */
const psgcApi = {
  async searchLocations(params: {
    query: string;
    levels: string;
    limit: number;
    parentCode?: string;
  }): Promise<PsgcSearchResult[]> {
    const searchParams = new URLSearchParams({
      q: params.query,
      limit: params.limit.toString(),
      ...(params.parentCode && { parentCode: params.parentCode }),
      ...(params.levels !== 'all' && { levels: params.levels }),
    });

    const response = await fetch(`/api/psgc/search?${searchParams}`);
    if (!response.ok) {
      throw new Error('Failed to search PSGC locations');
    }

    const data = await response.json();
    return data.data || [];
  },
};

/**
 * PSGC search hook
 *
 * @description Provides search functionality for Philippine Standard Geographic Code (PSGC)
 * locations with caching, debouncing, and level filtering.
 */
export function usePsgcSearch({
  levels = 'barangay',
  limit = 50,
  parentCode,
  debounceMs = 300,
  enableCache = true,
}: UsePsgcSearchOptions = {}): UsePsgcSearchReturn {
  // Additional state for lazy loading
  const [offset, setOffset] = useState(0);
  const [allResults, setAllResults] = useState<PsgcSearchResult[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Setup caching if enabled
  const { getCachedResult, setCachedResult } = useSearchCache<PsgcSearchResult>(
    `psgc-${levels}-${parentCode || 'all'}`,
    enableCache ? 100 : 0
  );

  /**
   * PSGC search function with pagination support
   */
  const searchFunction = useCallback(
    async (
      query: string,
      currentOffset: number = 0,
      append: boolean = false
    ): Promise<PsgcSearchResult[]> => {
      if (!query.trim()) {
        setAllResults([]);
        setHasMore(false);
        setTotalCount(0);
        return [];
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
        const response = await fetch(
          `/api/psgc/search?q=${encodeURIComponent(query.trim())}&levels=${levels}&limit=${limit}&offset=${currentOffset}&parentCode=${parentCode || ''}`
        );
        if (!response.ok) {
          throw new Error('Failed to search PSGC locations');
        }

        const data = await response.json();
        const results = data.data || [];

        // Update pagination state
        setTotalCount(data.totalCount || 0);
        setHasMore(data.hasMore || false);

        if (append) {
          // Use functional update to avoid stale closure
          setAllResults(currentAllResults => {
            const newAllResults = [...currentAllResults, ...results];
            return newAllResults;
          });
          // Return the new combined results for immediate use
          return results; // Return just the new results, not the combined array
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
        throw new Error('Failed to search PSGC locations');
      }
    },
    [levels, limit, parentCode, enableCache, getCachedResult, setCachedResult]
  ); // Remove allResults from dependencies

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
    minQueryLength: 2,
    onError: error => {},
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

  /**
   * Search by specific level
   */
  const searchByLevel = useCallback(
    async (level: string, searchQuery: string): Promise<void> => {
      try {
        await psgcApi.searchLocations({
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
    },
    [limit, parentCode, setQuery]
  );

  return {
    query,
    setQuery,
    options: allResults.length > 0 ? allResults : options, // Use allResults when available for pagination
    isLoading,
    error,
    clearSearch,
    refresh,
    searchByLevel,
    hasMore,
    loadMore,
    isLoadingMore,
    totalCount,
  };
}

// Export as default
export default usePsgcSearch;
