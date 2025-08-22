/**
 * Common Search Utilities
 * 
 * @description Shared utilities and patterns for search functionality across hooks.
 * Extracted from multiple search hooks to eliminate duplication.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useDebounce } from '@/hooks/utilities/useDebounce';

/**
 * Base search configuration
 */
export interface BaseSearchConfig {
  debounceMs?: number;
  minQueryLength?: number;
  initialQuery?: string;
  onError?: (error: Error) => void;
}

/**
 * Paginated search configuration
 */
export interface PaginatedSearchConfig extends BaseSearchConfig {
  initialPageSize?: number;
}

/**
 * Search result with pagination
 */
export interface PaginatedSearchResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
  page: number;
  pageSize: number;
}

/**
 * Search state
 */
export interface SearchState<T> {
  query: string;
  results: T[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Paginated search state
 */
export interface PaginatedSearchState<T> extends SearchState<T> {
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };
}

/**
 * Search function types
 */
export type SearchFunction<T> = (query: string) => Promise<T[]>;

export type PaginatedSearchFunction<T, F = any> = (params: {
  query: string;
  page: number;
  pageSize: number;
  filters?: F;
}) => Promise<PaginatedSearchResult<T>>;

/**
 * Create search state with default values
 */
export function createSearchState<T>(initialQuery = ''): SearchState<T> {
  return {
    query: initialQuery,
    results: [],
    isLoading: false,
    error: null,
  };
}

/**
 * Create paginated search state with default values
 */
export function createPaginatedSearchState<T>(
  initialQuery = '',
  initialPageSize = 20
): PaginatedSearchState<T> {
  return {
    ...createSearchState<T>(initialQuery),
    pagination: {
      current: 1,
      pageSize: initialPageSize,
      total: 0,
      hasMore: false,
    },
  };
}

/**
 * Generic search error handler
 */
export function createSearchErrorHandler(onError?: (error: Error) => void) {
  return useCallback((error: unknown, fallbackMessage = 'Search failed') => {
    const searchError = error instanceof Error ? error : new Error(fallbackMessage);
    if (onError) {
      onError(searchError);
    }
    return searchError;
  }, [onError]);
}

/**
 * Create search execution function
 */
export function createSearchExecutor<T>(
  searchFn: SearchFunction<T>,
  setState: React.Dispatch<React.SetStateAction<SearchState<T>>>,
  config: BaseSearchConfig
) {
  const { minQueryLength = 0, onError } = config;

  return useCallback(async (searchQuery: string) => {
    if (searchQuery.length < minQueryLength) {
      setState(prev => ({
        ...prev,
        results: [],
        error: null,
        isLoading: false,
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const searchResults = await searchFn(searchQuery);
      setState(prev => ({
        ...prev,
        results: searchResults,
        isLoading: false,
      }));
    } catch (error) {
      const searchError = error instanceof Error ? error : new Error('Search failed');
      if (onError) {
        onError(searchError);
      }
      setState(prev => ({
        ...prev,
        results: [],
        error: searchError,
        isLoading: false,
      }));
    }
  }, [searchFn, minQueryLength, setState, onError]);
}

/**
 * Create paginated search execution function
 */
export function createPaginatedSearchExecutor<T, F>(
  searchFn: PaginatedSearchFunction<T, F>,
  setState: React.Dispatch<React.SetStateAction<PaginatedSearchState<T>>>,
  config: PaginatedSearchConfig
) {
  const { minQueryLength = 0, onError } = config;

  return useCallback(async (
    searchQuery: string,
    page = 1,
    filters?: F,
    resetResults = true
  ) => {
    if (searchQuery.length < minQueryLength && page === 1) {
      setState(prev => ({
        ...prev,
        results: [],
        pagination: { ...prev.pagination, total: 0, hasMore: false },
        error: null,
        isLoading: false,
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const response = await searchFn({
        query: searchQuery,
        page,
        pageSize: config.initialPageSize || 20,
        filters,
      });

      setState(prev => ({
        ...prev,
        results: resetResults || page === 1 
          ? response.data 
          : [...prev.results, ...response.data],
        pagination: {
          current: page,
          pageSize: response.pageSize,
          total: response.total,
          hasMore: response.hasMore,
        },
        isLoading: false,
      }));
    } catch (error) {
      const searchError = error instanceof Error ? error : new Error('Search failed');
      if (onError) {
        onError(searchError);
      }
      setState(prev => ({
        ...prev,
        results: resetResults || page === 1 ? [] : prev.results,
        pagination: resetResults || page === 1 
          ? { ...prev.pagination, total: 0, hasMore: false }
          : prev.pagination,
        error: searchError,
        isLoading: false,
      }));
    }
  }, [searchFn, minQueryLength, config.initialPageSize, setState, onError]);
}

/**
 * Create common search utilities
 */
export function createSearchUtilities<T>(
  state: SearchState<T>,
  setState: React.Dispatch<React.SetStateAction<SearchState<T>>>,
  executeSearch: (query: string) => Promise<void>
) {
  const clearSearch = useCallback(() => {
    setState(prev => ({
      ...prev,
      query: '',
      results: [],
      error: null,
    }));
  }, [setState]);

  const refresh = useCallback(() => {
    executeSearch(state.query);
  }, [executeSearch, state.query]);

  const setQuery = useCallback((newQuery: string) => {
    setState(prev => ({ ...prev, query: newQuery }));
  }, [setState]);

  return { clearSearch, refresh, setQuery };
}

/**
 * Create paginated search utilities
 */
export function createPaginatedSearchUtilities<T, F>(
  state: PaginatedSearchState<T>,
  setState: React.Dispatch<React.SetStateAction<PaginatedSearchState<T>>>,
  executeSearch: (query: string, page?: number, filters?: F, resetResults?: boolean) => Promise<void>
) {
  const baseUtils = createSearchUtilities(state, setState, executeSearch);

  const loadMore = useCallback(() => {
    if (!state.isLoading && state.pagination.hasMore) {
      executeSearch(state.query, state.pagination.current + 1, undefined, false);
    }
  }, [executeSearch, state.query, state.pagination.current, state.pagination.hasMore, state.isLoading]);

  const setPage = useCallback((page: number) => {
    executeSearch(state.query, page, undefined, true);
  }, [executeSearch, state.query]);

  const setPageSize = useCallback((pageSize: number) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, pageSize, current: 1 },
    }));
    executeSearch(state.query, 1, undefined, true);
  }, [setState, executeSearch, state.query]);

  return {
    ...baseUtils,
    loadMore,
    setPage,
    setPageSize,
  };
}

/**
 * Memoized search results filter utility
 */
export function useSearchResultsFilter<T>(
  results: T[],
  filterFn: (item: T, query: string) => boolean,
  query: string
) {
  return useMemo(() => {
    if (!query.trim()) return results;
    return results.filter(item => filterFn(item, query));
  }, [results, filterFn, query]);
}

/**
 * Search highlighting utility
 */
export function highlightSearchText(text: string, query: string, className = 'bg-yellow-200'): string {
  if (!query.trim()) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, `<span class="${className}">$1</span>`);
}

/**
 * Common search result formatting utilities
 */
export const searchFormatters = {
  /**
   * Format name with proper spacing
   */
  formatName: (firstName?: string, middleName?: string, lastName?: string): string => {
    return [firstName, middleName, lastName].filter(Boolean).join(' ') || 'No name';
  },

  /**
   * Format address from parts
   */
  formatAddress: (parts: (string | undefined)[]): string => {
    const filtered = parts.filter(Boolean);
    return filtered.length > 0 ? filtered.join(', ') : 'No address';
  },

  /**
   * Truncate text with ellipsis
   */
  truncateText: (text: string, maxLength = 50): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  },

  /**
   * Format phone number
   */
  formatPhoneNumber: (phone?: string): string => {
    if (!phone) return 'No phone';
    // Basic Philippine number formatting
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('63')) {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    }
    if (cleaned.startsWith('09')) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    return phone;
  },
};

/**
 * Search performance optimization hooks
 */
export function useSearchCache<T>(key: string, maxSize = 100) {
  const [cache] = useState(() => new Map<string, { data: T[]; timestamp: number }>());
  const maxAge = 5 * 60 * 1000; // 5 minutes

  const getCachedResult = useCallback((query: string): T[] | null => {
    const cacheKey = `${key}:${query}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < maxAge) {
      return cached.data;
    }
    
    return null;
  }, [cache, key, maxAge]);

  const setCachedResult = useCallback((query: string, data: T[]) => {
    const cacheKey = `${key}:${query}`;
    
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }
    
    cache.set(cacheKey, { data, timestamp: Date.now() });
  }, [cache, key, maxSize]);

  return { getCachedResult, setCachedResult };
}