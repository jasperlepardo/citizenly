'use client';

import { Dialog } from '@headlessui/react';
import { cva, type VariantProps } from 'class-variance-authority';
import React, { useEffect, useRef } from 'react';

import { useCommandMenuWithApi } from '@/hooks/ui/useCommandMenuWithApi';
import { cn } from '@/lib';
import type { CommandMenuSearchResult as CommandMenuItem, CommandMenuHookResult as CommandMenuProps } from '@/types';

import { CommandMenuEmpty } from './CommandMenuEmpty';
import { CommandMenuGroup } from './CommandMenuGroup';

const commandMenuVariants = cva(
  'relative mx-auto w-full overflow-hidden rounded-xl bg-white dark:bg-gray-900 shadow-2xl ring-1 ring-black/5 dark:ring-white/10',
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

interface CommandMenuComponentProps extends VariantProps<typeof commandMenuVariants> {
  items?: CommandMenuItem[]; // Made optional since we get items from API  
  placeholder?: string;
  emptyStateText?: string;
  maxResults?: number;
  showShortcuts?: boolean;
  showRecentSection?: boolean;
  className?: string;
}

export function CommandMenu({
  items, // This is now optional and will be ignored in favor of API data
  placeholder = 'Search for anything...',
  emptyStateText,
  maxResults = 10,
  showShortcuts = true,
  showRecentSection = true,
  size,
  className,
}: CommandMenuComponentProps) {
  const {
    isOpen,
    close,
    searchQuery,
    setSearchQuery,
    filteredItems,
    selectedIndex,
    executeCommand,
    isLoading,
  } = useCommandMenuWithApi({ maxResults });

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when menu opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Group items by category
  const groupedItems = React.useMemo(() => {
    const groups = new Map<string, CommandMenuItem[]>();

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

  return (
    <Dialog open={isOpen} onClose={close} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/25 dark:bg-black/50" aria-hidden="true" />

      {/* Dialog */}
      <div className="fixed inset-0 overflow-y-auto p-4 pt-[25vh]">
        <Dialog.Panel className={cn(commandMenuVariants({ size }), className)}>
          {/* Search Input */}
          <div className="flex items-center border-b border-gray-200 px-4 dark:border-gray-700">
            {isLoading ? (
              <svg
                className="size-5 shrink-0 animate-spin text-gray-400 dark:text-gray-500"
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
                className="size-5 shrink-0 text-gray-400 dark:text-gray-500"
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
              className="w-full border-0 bg-transparent py-4 pr-4 pl-3 text-gray-900 placeholder-gray-500 focus:ring-0 focus:outline-none dark:text-gray-100 dark:placeholder-gray-400"
              placeholder={placeholder}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <div className="flex shrink-0 items-center gap-1">
              <kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-gray-200 bg-gray-50 px-1 text-xs font-medium text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400">
                ESC
              </kbd>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <CommandMenuEmpty query={searchQuery}>{emptyStateText}</CommandMenuEmpty>
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
                      onItemClick={executeCommand}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-700">
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
                  ⌘K
                </kbd>
                <span>to open</span>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

export { commandMenuVariants };
export type { CommandMenuComponentProps };
