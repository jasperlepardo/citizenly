'use client';

/**
 * Generic Search Hook
 *
 * @description Refactored generic search hook using extracted utilities.
 * Replaces the original useSearch hook with cleaner implementation.
 */

import { useState, useEffect, useCallback } from 'react';

import { useDebounce } from '@/hooks/utilities/useDebounce';
import {
  BaseSearchConfig,
  SearchState,
  SearchFunction,
  createSearchState,
} from '@/utils/search/search-utilities';
import type { UseGenericSearchReturn } from '@/types';

/**
 * Generic search hook for handling search state and operations
 *
 * @description Provides a clean, reusable interface for search functionality
 * with debouncing, error handling, and loading states.
 */
export function useGenericSearch<T>(
  searchFn: SearchFunction<T>,
  config: BaseSearchConfig = {}
): UseGenericSearchReturn<T> {
  const { debounceMs = 300, initialQuery = '', minQueryLength = 0, onError } = config;

  const [state, setState] = useState<SearchState<T>>(() => createSearchState<T>(initialQuery));

  const debouncedQuery = useDebounce(state.query, debounceMs);

  // Create search executor directly with useCallback to prevent infinite loops
  const executeSearch = useCallback(
    async (searchQuery: string) => {
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
    },
    [searchFn, minQueryLength, onError]
  );

  // Create memoized search utilities to prevent infinite loops
  const setQuery = useCallback((newQuery: string) => {
    setState(prev => ({ ...prev, query: newQuery }));
  }, []);

  const clearSearch = useCallback(() => {
    setState(prev => ({
      ...prev,
      query: '',
      results: [],
      error: null,
    }));
  }, []);

  const refresh = useCallback(() => {
    executeSearch(state.query);
  }, [executeSearch, state.query]);

  // Execute search when debounced query changes
  useEffect(() => {
    executeSearch(debouncedQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]); // executeSearch intentionally excluded to prevent infinite loop

  return {
    query: state.query,
    setQuery,
    results: state.results,
    isLoading: state.isLoading,
    error: state.error,
    clearSearch,
    refresh,
  };
}

// Export the hook as useSearch for backward compatibility
export { useGenericSearch as useSearch };
