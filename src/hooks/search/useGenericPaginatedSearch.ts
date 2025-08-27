'use client';

/**
 * Generic Paginated Search Hook
 *
 * @description Refactored paginated search hook using extracted utilities.
 * Provides clean pagination support with filtering capabilities.
 */

import { useState, useEffect } from 'react';

import {
  PaginatedSearchConfig,
  PaginatedSearchState,
  PaginatedSearchFunction,
  createPaginatedSearchState,
  createPaginatedSearchExecutor,
  createPaginatedSearchUtilities,
} from '@/utils/search-utilities';

import { useDebounce } from '@/hooks/utilities/useDebounce';

/**
 * Return type for useGenericPaginatedSearch hook
 */
export interface UseGenericPaginatedSearchReturn<T, F = any> {
  query: string;
  setQuery: (query: string) => void;
  results: T[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };
  isLoading: boolean;
  error: Error | null;
  filters?: F;
  setFilters: (filters: F) => void;
  clearSearch: () => void;
  refresh: () => void;
  loadMore: () => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
}

/**
 * Generic paginated search hook
 *
 * @description Provides comprehensive pagination support with filtering,
 * debouncing, and load-more functionality.
 */
export function useGenericPaginatedSearch<T, F = any>(
  searchFn: PaginatedSearchFunction<T, F>,
  config: PaginatedSearchConfig = {}
): UseGenericPaginatedSearchReturn<T, F> {
  const { debounceMs = 300, initialPageSize = 20, ...restConfig } = config;

  const [state, setState] = useState<PaginatedSearchState<T>>(() =>
    createPaginatedSearchState<T>('', initialPageSize)
  );

  const [filters, setFilters] = useState<F | undefined>();

  const debouncedQuery = useDebounce(state.query, debounceMs);

  // Create search executor
  const executeSearch = createPaginatedSearchExecutor(searchFn, setState, config);

  // Create search utilities
  const { clearSearch, refresh, setQuery, loadMore, setPage, setPageSize } =
    createPaginatedSearchUtilities(state, setState, executeSearch);

  // Execute search when debounced query or filters change
  useEffect(() => {
    executeSearch(debouncedQuery, 1, filters, true);
  }, [debouncedQuery, filters, executeSearch]);

  return {
    query: state.query,
    setQuery,
    results: state.results,
    pagination: state.pagination,
    isLoading: state.isLoading,
    error: state.error,
    filters,
    setFilters,
    clearSearch,
    refresh,
    loadMore,
    setPage,
    setPageSize,
  };
}

// Export the hook as usePaginatedSearch for backward compatibility
export { useGenericPaginatedSearch as usePaginatedSearch };
