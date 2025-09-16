/**
 * Command Menu Search Hook
 *
 * @description Handles search functionality for command menu.
 * Extracted from useCommandMenuWithApi for better maintainability.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

import { useAsyncErrorBoundary } from '@/hooks/utilities/useAsyncErrorBoundary';
import { searchData } from '@/utils/shared/apiUtils';
import { trackCommandMenuSearch, trackCommandMenuError } from '@/utils/command-menu/analytics-utils';
import { trackSearch } from '@/lib/data/recent-items-storage';
import type { CommandMenuSearchResult as CommandMenuItem } from '@/types';

import type { CommandMenuSearchOptions, UseCommandMenuSearchReturn } from '@/types';

// Interfaces moved to centralized types

// Interface moved to centralized types

/**
 * Hook for command menu search functionality
 *
 * @description Provides search capabilities with debouncing, error handling,
 * and analytics tracking.
 */
export function useCommandMenuSearch(
  options: CommandMenuSearchOptions = {}
): UseCommandMenuSearchReturn {
  const { maxResults = 5, debounceDelay = 300 } = options;

  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dynamicResults, setDynamicResults] = useState<CommandMenuItem[]>([]);

  // Error boundary for search operations
  const { wrapAsync } = useAsyncErrorBoundary({
    onError: (error, errorInfo) => {
      // Track search errors for monitoring
      trackCommandMenuError(error, {
        context: 'search',
        query: searchQuery.slice(0, 50),
      });

      if (process.env.NODE_ENV === 'development') {
        console.error('Command Menu Search Error:', errorInfo, error);
      }
    },
    enableRecovery: false,
    maxRetries: 0,
  });

  /**
   * Search with API integration
   */
  useEffect(() => {
    const searchWithApi = async () => {
      if (!searchQuery.trim()) {
        setDynamicResults([]);
        return;
      }

      setIsLoading(true);

      try {
        // Track the search query in recent items
        trackSearch(searchQuery);

        // Wrap search API call with error boundary
        const apiResults = await wrapAsync(
          () => searchData(searchQuery, maxResults),
          'command menu search'
        )();

        if (apiResults) {
          // Track search analytics
          trackCommandMenuSearch(searchQuery, apiResults.length);

          // Convert API results to menu items
          const dynamicMenuItems: CommandMenuItem[] = apiResults.map(result => ({
            id: `search-${result.id}`,
            title: result.title,
            subtitle: result.description,
            group: 'Search Results',
            data: result.href,
            score: 0,
            type: 'navigation' as const,
            keywords: [result.title.toLowerCase(), result.type],
            icon: getIconForType(result.type),
          }));

          setDynamicResults(dynamicMenuItems);
        } else {
          setDynamicResults([]);
        }
      } catch (error) {
        // Error already handled by async error boundary
        setDynamicResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchWithApi, debounceDelay);
    return () => clearTimeout(debounce);
  }, [searchQuery, maxResults, debounceDelay, wrapAsync]);

  /**
   * Clear search state
   */
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setDynamicResults([]);
    setIsLoading(false);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    isLoading,
    dynamicResults,
    clearSearch,
  };
}

/**
 * Get icon for search result type
 */
function getIconForType(type: string): React.ComponentType<{ className?: string }> | undefined {
  // This would typically use your icon mapping logic - returning undefined for now
  // In a real implementation, you'd import and return actual icon components
  switch (type) {
    case 'resident':
    case 'household':
    default:
      return undefined;
  }
}

// Export for backward compatibility
export default useCommandMenuSearch;
