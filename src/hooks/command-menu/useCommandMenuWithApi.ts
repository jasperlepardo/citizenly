/**
 * Command Menu with API Hook (Refactored)
 *
 * @description Lightweight orchestrator for command menu functionality with API integration.
 * Composes specialized hooks for better maintainability.
 *
 * Architecture:
 * - useCommandMenuSearch: Search functionality
 * - useCommandMenuRecents: Recent items management
 * - useCommandMenuActions: Command execution and API actions
 * - useCommandMenu: Base menu functionality
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

import type { CommandMenuItemType as CommandMenuItem } from '@/components';
import { getCommandMenuItems } from '@/lib/command-menu';

import { useCommandMenu } from './useCommandMenu';
import { useCommandMenuActions, type UseCommandMenuActionsReturn } from './useCommandMenuActions';
import { useCommandMenuRecents, type UseCommandMenuRecentsReturn } from './useCommandMenuRecents';
import { useCommandMenuSearch, type UseCommandMenuSearchReturn } from './useCommandMenuSearch';

/**
 * Options for command menu with API
 */
export interface UseCommandMenuWithApiProps {
  /** Maximum number of results */
  maxResults?: number;
}

/**
 * Return type for command menu with API hook
 */
export interface UseCommandMenuWithApiReturn
  extends Pick<UseCommandMenuSearchReturn, 'searchQuery' | 'setSearchQuery' | 'isLoading'>,
    Pick<UseCommandMenuRecentsReturn, 'handleClearRecentItems'>,
    Pick<UseCommandMenuActionsReturn, 'executeCommand'> {
  /** Menu open state */
  isOpen: boolean;
  /** Open menu */
  open: () => void;
  /** Close menu */
  close: () => void;
  /** Toggle menu */
  toggle: () => void;
  /** Filtered menu items */
  filteredItems: CommandMenuItem[];
  /** Selected index */
  selectedIndex: number;
  /** Set selected index */
  setSelectedIndex: (index: number) => void;
  /** Number of dynamic results */
  dynamicResults: number;
  /** Number of recent items */
  recentItems: number;
}

/**
 * Command menu with API integration hook (Refactored)
 *
 * @description Orchestrates command menu functionality with API integration.
 * Much smaller and more maintainable than the original implementation.
 */
export function useCommandMenuWithApi({
  maxResults = 10,
}: UseCommandMenuWithApiProps = {}): UseCommandMenuWithApiReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Compose specialized hooks
  const search = useCommandMenuSearch({ maxResults: 5 });
  const recents = useCommandMenuRecents();
  const actions = useCommandMenuActions();

  // Get static menu items with enhanced actions
  const staticMenuItems = useMemo(() => {
    const baseItems = getCommandMenuItems();
    return actions.getEnhancedMenuItems(baseItems);
  }, [actions]);

  // Load recent items when menu opens
  useEffect(() => {
    if (isOpen) {
      recents.loadRecentItems();
    }
  }, [isOpen, recents.loadRecentItems]);

  // Combine all items based on search state
  const allItems = useMemo(() => {
    let items: CommandMenuItem[] = [];

    if (search.searchQuery.trim()) {
      // Show dynamic search results first, then filtered static items
      items = [...search.dynamicResults];

      // Add matching static items
      const query = search.searchQuery.toLowerCase();
      const matchingStaticItems = staticMenuItems.filter(
        item =>
          item.label.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.keywords?.some(keyword => keyword.includes(query))
      );

      items.push(...matchingStaticItems);
    } else {
      // Show recent items first, then all static items
      items = [...recents.recentItems, ...staticMenuItems];
    }

    // Ensure we always have at least the static menu items
    if (items.length === 0 && staticMenuItems.length > 0) {
      items = staticMenuItems;
    }

    // Only limit results for search queries - show all static items when browsing
    const limit = search.searchQuery.trim()
      ? maxResults
      : Math.max(maxResults, staticMenuItems.length);
    return items.slice(0, limit);
  }, [search.searchQuery, search.dynamicResults, staticMenuItems, recents.recentItems, maxResults]);

  // Use base command menu for keyboard handling
  const baseMenu = useCommandMenu({
    items: allItems,
    maxResults,
  });

  // Reset selected index when filtered items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [allItems]);

  // Override base menu's open/close to manage our state
  const open = useCallback(() => {
    setIsOpen(true);
    search.setSearchQuery('');
    setSelectedIndex(0);
  }, [search]);

  const close = useCallback(() => {
    setIsOpen(false);
    search.clearSearch();
    setSelectedIndex(0);
  }, [search]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  // Enhanced execute command with close
  const executeCommand = useCallback(
    (item: CommandMenuItem) => {
      close();
      actions.executeCommand(item);
    },
    [close, actions]
  );

  return {
    // Menu state
    isOpen,
    open,
    close,
    toggle,

    // Search functionality
    searchQuery: search.searchQuery,
    setSearchQuery: search.setSearchQuery,
    isLoading: search.isLoading,

    // Items and selection
    filteredItems: allItems,
    selectedIndex,
    setSelectedIndex,

    // Actions
    executeCommand,

    // Statistics
    dynamicResults: search.dynamicResults.length,
    recentItems: recents.recentItemsCount,

    // Recent items management
    handleClearRecentItems: recents.handleClearRecentItems,
  };
}

// Export for backward compatibility
export default useCommandMenuWithApi;
