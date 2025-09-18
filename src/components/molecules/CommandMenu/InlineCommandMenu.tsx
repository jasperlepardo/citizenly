'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import React, { useEffect, useRef, useState } from 'react';

import { useCommandMenuWithApi } from '@/hooks/ui/useCommandMenuWithApi';
import { cn } from '@/components/shared/utils';
import { trackCommandMenuError, trackWorkflowSuggestion } from '@/utils/command-menu/analytics-utils';
import type {
  CommandMenuSearchResult,
} from '@/types/infrastructure/services/services';

import { CommandMenuEmpty } from './CommandMenuEmpty';
import { CommandMenuErrorBoundary } from './CommandMenuErrorBoundary';
import { CommandMenuGroup } from './CommandMenuGroup';

const inlineCommandMenuVariants = cva(
  'absolute top-full left-0 right-0 z-50 mt-1 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl ring-1 ring-black/5 dark:ring-white/10',
  {
    variants: {
      size: {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

interface InlineCommandMenuProps extends VariantProps<typeof inlineCommandMenuVariants> {
  placeholder?: string;
  emptyStateText?: string;
  maxResults?: number;
  showShortcuts?: boolean;
  showRecentSection?: boolean;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function InlineCommandMenu({
  placeholder = 'Search for anything...',
  emptyStateText,
  maxResults = 10,
  showShortcuts = true,
  showRecentSection = true,
  size,
  className,
  onFocus,
  onBlur,
}: InlineCommandMenuProps) {
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollableRef = useRef<HTMLDivElement>(null);

  const {
    searchQuery,
    setSearchQuery,
    filteredItems,
    selectedIndex,
    setSelectedIndex,
    executeCommand,
    isLoading,
    isOpen,
    open,
    close,
    handleClearRecentItems,
  } = useCommandMenuWithApi({ maxResults });

  // Show dropdown when input is focused, there's a search query, or hook says it's open (for ⌘K)
  useEffect(() => {
    const shouldShow = isInputFocused || searchQuery.trim().length > 0 || isOpen;
    setShowDropdown(shouldShow);

    // Also sync the hook's isOpen state with our dropdown state for keyboard navigation
    if (shouldShow && !isOpen) {
      open(); // This will make keyboard navigation work
    } else if (!shouldShow && isOpen) {
      close();
    }
  }, [isInputFocused, searchQuery, isOpen, open, close]);

  // When hook opens (via ⌘K), focus the input
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setIsInputFocused(true);
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (showDropdown && scrollableRef.current && filteredItems.length > 0) {
      const selectedElement = scrollableRef.current.querySelector(
        `[data-command-item-index="${selectedIndex}"]`
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }, [selectedIndex, showDropdown, filteredItems.length]);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsInputFocused(false);
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle input-specific events and coordinate with hook
  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Let the hook handle most navigation, but handle some input-specific behavior
    if (event.key === 'Enter' && filteredItems[selectedIndex]) {
      event.preventDefault();
      executeCommand(filteredItems[selectedIndex]);
      setIsInputFocused(false);
      setShowDropdown(false);
      close();
      inputRef.current?.blur();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setIsInputFocused(false);
      setShowDropdown(false);
      close();
      inputRef.current?.blur();
    }
  };

  // Group items by category
  const groupedItems = React.useMemo(() => {
    const groups = new Map<string, CommandMenuSearchResult[]>();

    // If showing recent section and no search query, separate recent items
    if (showRecentSection && !searchQuery.trim()) {
      const recentItems = filteredItems.filter(item => item.recent);
      const nonRecentItems = filteredItems.filter(item => !item.recent);

      if (recentItems.length > 0) {
        groups.set('Recent', recentItems);
      }

      // Group non-recent items by their group property
      nonRecentItems.forEach(item => {
        const groupName = item.group || 'Other';
        if (!groups.has(groupName)) {
          groups.set(groupName, []);
        }
        groups.get(groupName)!.push(item);
      });
    } else {
      // Group all items by their group property
      filteredItems.forEach(item => {
        const groupName = item.group || 'Results';
        if (!groups.has(groupName)) {
          groups.set(groupName, []);
        }
        groups.get(groupName)!.push(item);
      });
    }

    return Array.from(groups.entries()).map(([name, items]) => ({
      name,
      items,
    }));
  }, [filteredItems, searchQuery, showRecentSection]);

  const handleInputFocus = () => {
    setIsInputFocused(true);
    onFocus?.();
  };

  const handleInputBlur = () => {
    // Delay blur to allow for dropdown item clicks
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setIsInputFocused(false);
        close(); // Also close hook state
        onBlur?.();
      }
    }, 100);
  };

  return (
    <CommandMenuErrorBoundary
      onError={error => {
        trackCommandMenuError(error, {
          component: 'InlineCommandMenu',
          searchQuery: searchQuery.slice(0, 50),
          hasDropdown: showDropdown,
          filteredItemsCount: filteredItems.length,
        });
      }}
    >
      <div ref={containerRef} className="relative w-full">
        {/* Search Input */}
        <div className="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
          {isLoading ? (
            <svg
              className="size-4 shrink-0 animate-spin text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          ) : (
            <svg
              className="size-4 shrink-0 text-gray-400 dark:text-gray-500"
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
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none dark:text-gray-100 dark:placeholder-gray-400"
            placeholder={placeholder}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
          <div className="flex items-center gap-1">
            <kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-gray-200 bg-gray-50 px-1 text-xs font-medium text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Dropdown Results */}
        {showDropdown && (
          <div className={cn(inlineCommandMenuVariants({ size }), className)}>
            {/* Scrollable Results Area */}
            <div ref={scrollableRef} className="max-h-80 overflow-y-auto">
              {filteredItems.length === 0 ? (
                <div className="py-4">
                  <CommandMenuEmpty
                    query={searchQuery}
                    onSuggestionClick={suggestion => {
                      // Track workflow suggestion click
                      trackWorkflowSuggestion(suggestion.id, searchQuery, suggestion.title);

                      // Close the dropdown
                      setIsInputFocused(false);
                      setShowDropdown(false);
                      close();
                      inputRef.current?.blur();
                    }}
                  >
                    {emptyStateText}
                  </CommandMenuEmpty>
                </div>
              ) : (
                <div className="py-2">
                  {groupedItems.map((group, groupIndex) => {
                    // Calculate global index for this group
                    const globalIndex = groupedItems
                      .slice(0, groupIndex)
                      .reduce((acc, g) => acc + g.items.length, 0);

                    return (
                      <CommandMenuGroup
                        key={group.name}
                        label={group.name}
                        items={group.items}
                        selectedIndex={selectedIndex}
                        globalIndex={globalIndex}
                        showShortcuts={showShortcuts}
                        onItemClick={item => {
                          executeCommand(item);
                          setIsInputFocused(false);
                          setShowDropdown(false);
                          inputRef.current?.blur();
                        }}
                        onClearGroup={group.name === 'Recent' ? handleClearRecentItems : undefined}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Fixed Footer */}
            <div className="border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <kbd className="inline-flex h-4 min-w-[16px] items-center justify-center rounded border border-gray-200 bg-gray-50 px-1 text-xs font-medium dark:border-gray-600 dark:bg-gray-700">
                      ↵
                    </kbd>
                    <span>to select</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="inline-flex h-4 min-w-[16px] items-center justify-center rounded border border-gray-200 bg-gray-50 px-1 text-xs font-medium dark:border-gray-600 dark:bg-gray-700">
                      ↑↓
                    </kbd>
                    <span>to navigate</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="inline-flex h-4 min-w-[16px] items-center justify-center rounded border border-gray-200 bg-gray-50 px-1 text-xs font-medium dark:border-gray-600 dark:bg-gray-700">
                    ESC
                  </kbd>
                  <span>to close</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </CommandMenuErrorBoundary>
  );
}

export { inlineCommandMenuVariants };
export type { InlineCommandMenuProps };
