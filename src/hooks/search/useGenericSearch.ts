'use client';

/**
 * Generic Search Hook
 *
 * @description Refactored generic search hook using extracted utilities.
 * Replaces the original useSearch hook with cleaner implementation.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';

import {
  BaseSearchConfig,
  SearchState,
  SearchFunction,
  createSearchState,
  createSearchUtilities,
} from '@/lib/utilities/search-utilities';

import { useDebounce } from '../utilities/useDebounce';

/**
 * Return type for useGenericSearch hook
 */
export interface UseGenericSearchReturn<T> {
  query: string;
  setQuery: (query: string) => void;
  results: T[];
  isLoading: boolean;
  error: Error | null;
  clearSearch: () => void;
  refresh: () => void;
}

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

  // Create search utilities
  const { clearSearch, refresh, setQuery } = createSearchUtilities(state, setState, executeSearch);

  // Execute search when debounced query changes
  useEffect(() => {
    executeSearch(debouncedQuery);
  }, [debouncedQuery]); // Remove executeSearch from dependencies to prevent infinite loop

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
