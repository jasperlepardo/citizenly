'use client';

/**
 * Generic Paginated Search Hook
 *
 * @description Refactored paginated search hook using extracted utilities.
 * Provides clean pagination support with filtering capabilities.
 */

import { useState, useEffect , useCallback } from 'react';

import { useDebounce } from '@/hooks/utilities/useDebounce';
import type {
  PaginatedSearchConfig,
  PaginatedSearchState,
  PaginatedSearchFunction,
  UseGenericPaginatedSearchReturn
} from '@/types/shared/hooks/searchHooks';

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

  const [state, setState] = useState<PaginatedSearchState<T>>(() => ({
    query: '',
    results: [],
    isLoading: false,
    error: null,
    pagination: {
      current: 1,
      pageSize: initialPageSize,
      total: 0,
      hasMore: false,
    },
  }));

  const [filters, setFilters] = useState<F | undefined>();

  const debouncedQuery = useDebounce(state.query, debounceMs);

  // Create search executor
  const executeSearch = useCallback(
    async (query: string, page: number, searchFilters?: F, resetResults = false) => {
      if (query.length < (config.minQueryLength || 0)) {
        setState((prev: PaginatedSearchState<T>) => ({
          ...prev,
          results: [],
          error: null,
          isLoading: false,
          pagination: {
            ...prev.pagination,
            current: 1,
            total: 0,
            hasMore: false,
          },
        }));
        return;
      }

      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
        ...(resetResults && { results: [] }),
      }));

      try {
        const result = await searchFn(query, page, state.pagination.pageSize, searchFilters);

        setState((prev: PaginatedSearchState<T>) => ({
          ...prev,
          results: resetResults ? result.data : [...prev.results, ...result.data],
          isLoading: false,
          pagination: {
            current: page,
            pageSize: prev.pagination.pageSize,
            total: result.total,
            hasMore: result.data.length === prev.pagination.pageSize && 
                     (resetResults ? result.data.length : prev.results.length + result.data.length) < result.total,
          },
        }));
      } catch (error) {
        const searchError = error instanceof Error ? error : new Error('Search failed');
        if (config.onError) {
          config.onError(searchError);
        }
        setState((prev: PaginatedSearchState<T>) => ({
          ...prev,
          results: resetResults ? [] : prev.results,
          error: searchError,
          isLoading: false,
        }));
      }
    },
    [searchFn, state.pagination.pageSize, config]
  );

  // Create search utilities
  const setQuery = useCallback((newQuery: string) => {
    setState(prev => ({ ...prev, query: newQuery }));
  }, []);

  const clearSearch = useCallback(() => {
    setState(prev => ({
      ...prev,
      query: '',
      results: [],
      error: null,
      pagination: {
        ...prev.pagination,
        current: 1,
        total: 0,
        hasMore: false,
      },
    }));
  }, []);

  const refresh = useCallback(() => {
    executeSearch(state.query, 1, filters, true);
  }, [executeSearch, state.query, filters]);

  const loadMore = useCallback(() => {
    if (state.pagination.hasMore && !state.isLoading) {
      executeSearch(state.query, state.pagination.current + 1, filters, false);
    }
  }, [executeSearch, state.query, state.pagination.hasMore, state.pagination.current, state.isLoading, filters]);

  const setPage = useCallback((page: number) => {
    executeSearch(state.query, page, filters, true);
  }, [executeSearch, state.query, filters]);

  const setPageSize = useCallback((pageSize: number) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, pageSize, current: 1 },
    }));
    executeSearch(state.query, 1, filters, true);
  }, [executeSearch, state.query, filters]);

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
