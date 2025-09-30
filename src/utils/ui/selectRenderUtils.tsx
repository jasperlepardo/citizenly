/**
 * Select Component Render Utilities
 * Helper functions for rendering complex UI elements in Select component
 */

import React from 'react';

/**
 * Renders the load more section based on loading state and scroll type
 */
export const renderLoadMoreSection = (
  loadingMore: boolean,
  infiniteScroll: boolean,
  onLoadMore?: () => void
): React.ReactNode => {
  if (loadingMore) {
    return (
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600 dark:border-blue-400"></div>
        {infiniteScroll ? 'Loading more...' : 'Loading...'}
      </div>
    );
  }

  if (!infiniteScroll) {
    return (
      <button
        onClick={onLoadMore}
        className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none dark:text-blue-400 dark:hover:text-blue-200"
      >
        Load more results
      </button>
    );
  }

  return <div className="py-1 text-xs text-gray-400">Scroll for more results</div>;
};

/**
 * Renders the empty state based on loading and search conditions
 */
export const renderEmptyState = (
  loading: boolean,
  onSearch: ((query: string) => void) | undefined,
  inputValue: string
): React.ReactNode => {
  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600 dark:border-blue-400"></div>
        <p className="text-sm">Searching...</p>
      </div>
    );
  }

  if (onSearch && inputValue.length < 2) {
    return (
      <div className="flex flex-col items-center gap-3">
        <svg
          className="h-8 w-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <div>
          <p className="text-sm font-medium">Start typing to search</p>
          <p className="mt-1 text-xs">Type at least 2 characters to see results</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 px-4 py-8">
      <svg
        className="h-8 w-8 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <div>
        <p className="text-sm font-medium">No results found</p>
        <p className="mt-1 text-xs">Try a different search term</p>
      </div>
    </div>
  );
};