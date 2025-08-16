'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CommandMenuEmptyProps {
  query?: string;
  className?: string;
  children?: React.ReactNode;
  onSuggestionClick?: (suggestion: WorkflowSuggestion) => void;
}

interface WorkflowSuggestion {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  href?: string;
  keywords: string[];
}

// Smart workflow suggestions based on query analysis
function getWorkflowSuggestions(query?: string): WorkflowSuggestion[] {
  if (!query) {
    return [
      {
        id: 'add-resident',
        title: 'Add New Resident',
        description: 'Register a new resident in the system',
        action: 'Create resident',
        href: '/residents/create',
        keywords: ['add', 'new', 'create', 'register'],
        icon: (
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        ),
      },
      {
        id: 'add-household',
        title: 'Add New Household',
        description: 'Create a new household record',
        action: 'Create household',
        href: '/households/create',
        keywords: ['household', 'family', 'add', 'new'],
        icon: (
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          </svg>
        ),
      },
      {
        id: 'view-reports',
        title: 'View Reports',
        description: 'Access population and statistical reports',
        action: 'View reports',
        href: '/reports',
        keywords: ['reports', 'statistics', 'data', 'analytics'],
        icon: (
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
      },
    ];
  }

  // Analyze query to provide contextual suggestions
  const queryLower = query.toLowerCase();
  const suggestions: WorkflowSuggestion[] = [];

  // Suggest creating new records if searching for non-existent items
  if (queryLower.match(/^\d+$/) && query.length > 3) {
    // Looks like searching for an ID/code
    suggestions.push({
      id: 'create-resident-with-id',
      title: 'Add New Resident',
      description: 'Register a new resident in the system',
      action: 'Create resident',
      href: `/residents/create?suggested_id=${query}`,
      keywords: ['create', 'add', 'resident'],
      icon: (
        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
    });

    suggestions.push({
      id: 'create-household-with-code',
      title: 'Add New Household',
      description: 'Create a new household record',
      action: 'Create household',
      href: `/households/create?suggested_code=${query}`,
      keywords: ['create', 'add', 'household'],
      icon: (
        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
    });
  }

  // Name-like queries
  if (queryLower.match(/^[a-zA-Z\s]+$/) && query.length > 2) {
    suggestions.push({
      id: 'create-resident-with-name',
      title: 'Add New Resident',
      description: 'Register a new resident in the system',
      action: 'Create resident',
      href: `/residents/create?suggested_name=${encodeURIComponent(query)}`,
      keywords: ['create', 'add', 'resident', 'person'],
      icon: (
        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
    });

    suggestions.push({
      id: 'create-household-with-head-name',
      title: 'Add New Household',
      description: 'Create a new household record',
      action: 'Create household',
      href: `/households/create?suggested_name=${encodeURIComponent(query)}`,
      keywords: ['create', 'add', 'household', 'family'],
      icon: (
        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
    });
  }

  // Generic helpful actions
  suggestions.push({
    id: 'browse-residents',
    title: 'Browse All Residents',
    description: 'View the complete residents directory',
    action: 'View residents',
    href: '/residents',
    keywords: ['browse', 'view', 'residents', 'directory'],
    icon: (
      <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  });

  suggestions.push({
    id: 'browse-households',
    title: 'Browse All Households',
    description: 'View the complete households directory',
    action: 'View households',
    href: '/households',
    keywords: ['browse', 'view', 'households', 'families'],
    icon: (
      <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  });

  return suggestions.slice(0, 4); // Limit to 4 suggestions
}

export type { WorkflowSuggestion };

export function CommandMenuEmpty({
  query,
  className,
  children,
  onSuggestionClick,
}: CommandMenuEmptyProps) {
  const suggestions = getWorkflowSuggestions(query);
  const defaultMessage = query 
    ? `No results found for "${query}"`
    : 'Start typing to search...';

  const handleSuggestionClick = (suggestion: WorkflowSuggestion) => {
    onSuggestionClick?.(suggestion);
    
    // Navigate to the suggestion's href if available
    if (suggestion.href) {
      window.location.href = suggestion.href;
    }
  };

  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-8 px-4 text-center',
      className
    )}>
      {/* Icon */}
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        {query ? (
          <svg
            className="size-6 text-gray-400 dark:text-gray-500"
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
        ) : (
          <svg
            className="size-6 text-gray-400 dark:text-gray-500"
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
        )}
      </div>

      {/* Message */}
      <div className="space-y-2 mb-6">
        <h3 className="font-medium text-gray-900 dark:text-gray-100">
          {query ? 'No results found' : 'Search anything'}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {children || defaultMessage}
        </p>
        {query && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Here's what you can do instead:
          </p>
        )}
      </div>

      {/* Workflow Suggestions */}
      {suggestions.length > 0 && (
        <div className="w-full max-w-sm space-y-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div className="flex size-5 shrink-0 items-center justify-center">
                <div className="size-4 text-gray-500 dark:text-gray-400">
                  {suggestion.icon}
                </div>
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {suggestion.title}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {suggestion.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Basic tips for empty state */}
      {!query && suggestions.length === 0 && (
        <div className="mt-6 space-y-2">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Try searching for:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-300">
              residents
            </span>
            <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-300">
              households
            </span>
            <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-300">
              reports
            </span>
          </div>
        </div>
      )}
    </div>
  );
}