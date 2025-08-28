'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';

import {
  trackCommandMenuSearch,
  trackCommandMenuNavigation,
  trackCommandMenuAction,
  trackCommandMenuError,
} from '@/lib/command-menu/analytics-utils';
import {
  searchData,
  exportData,
  backupData,
  getRecentItems as getRecentApiItems,
  clearRecentItems as clearRecentApiItems,
  createResident,
  createHousehold,
  findSeniorCitizens,
  findPWDs,
  findSoloParents,
  generateCertificate,
  generateReport,
} from '@/lib/command-menu/api-utils';
import { getCommandMenuItems, getAllCommandMenuItems } from '@/lib/command-menu/items-utils';
import { trackSearch, trackNavigation, trackAction } from '@/lib/data';
import type { CommandMenuSearchResult as CommandMenuItem } from '@/types';

interface UseCommandMenuWithApiProps {
  maxResults?: number;
}

export function useCommandMenuWithApi({ maxResults = 10 }: UseCommandMenuWithApiProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [dynamicResults, setDynamicResults] = useState<CommandMenuItem[]>([]);
  const [recentItems, setRecentItems] = useState<CommandMenuItem[]>([]);

  const router = useRouter();

  // Load recent items when menu opens
  useEffect(() => {
    if (isOpen) {
      loadRecentItems(); // Always reload to get latest recent items
    }
  }, [isOpen]);

  const loadRecentItems = async () => {
    try {
      const recent = await getRecentApiItems();
      const recentMenuItems: CommandMenuItem[] = recent.map(item => ({
        id: `recent-${item.id}`,
        title: item.title,
        subtitle: item.description,
        group: 'Recent',
        data: item.href,
        score: 0,
        type: 'navigation' as const,
        recent: true,
      }));
      setRecentItems(recentMenuItems);
    } catch (error) {
      console.error('Failed to load recent items:', error);
    }
  };

  const handleClearRecentItems = async () => {
    try {
      const success = await clearRecentApiItems();
      if (success) {
        setRecentItems([]); // Clear the UI immediately
        toast.success('Recent items cleared');
      } else {
        toast.error('Failed to clear recent items');
      }
    } catch (error) {
      console.error('Failed to clear recent items:', error);
      toast.error('Failed to clear recent items');
    }
  };

  // Get static menu items with API-powered actions
  const staticMenuItems = useMemo(() => {
    const baseItems = getCommandMenuItems();

    // Enhance static items with real API functionality
    return baseItems.map(item => {
      const enhancedItem = { ...item };

      // Add real onClick handlers for specific actions
      switch (item.id) {
        case 'export-residents':
          enhancedItem.onClick = () => handleExportData('residents', 'csv');
          break;
        case 'export-households':
          enhancedItem.onClick = () => handleExportData('households', 'csv');
          break;
        case 'admin-backup':
          enhancedItem.onClick = () => handleBackupData();
          break;
        case 'action-add-resident':
          enhancedItem.onClick = () => handleQuickAction(async () => createResident());
          break;
        case 'action-create-household':
          enhancedItem.onClick = () => handleQuickAction(async () => createHousehold());
          break;
        case 'search-seniors':
          enhancedItem.onClick = () => handleQuickAction(async () => findSeniorCitizens());
          break;
        case 'search-pwd':
          enhancedItem.onClick = () => handleQuickAction(async () => findPWDs());
          break;
        case 'search-solo-parents':
          enhancedItem.onClick = () => handleQuickAction(async () => findSoloParents());
          break;
        case 'cert-barangay-clearance':
          enhancedItem.onClick = () =>
            handleQuickAction(async () => generateCertificate('clearance'));
          break;
        case 'cert-residency':
          enhancedItem.onClick = () =>
            handleQuickAction(async () => generateCertificate('residency'));
          break;
        case 'cert-indigency':
          enhancedItem.onClick = () =>
            handleQuickAction(async () => generateCertificate('indigency'));
          break;
        case 'report-population':
          enhancedItem.onClick = () => handleQuickAction(async () => generateReport('population'));
          break;
        case 'report-households-summary':
          enhancedItem.onClick = () => handleQuickAction(async () => generateReport('households'));
          break;
      }

      return enhancedItem;
    });
  }, []);

  // Search with API integration
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

        const apiResults = await searchData(searchQuery, 5);

        // Track search analytics
        trackCommandMenuSearch(searchQuery, apiResults.length);
        const dynamicMenuItems: CommandMenuItem[] = apiResults.map(result => ({
          id: `search-${result.id}`,
          title: result.title,
          subtitle: result.description,
          data: result.href,
          score: 0,
          type: 'navigation' as const,
          group: 'Search Results',
          label: result.title,
          description: result.description,
          href: result.href,
          keywords: [result.title.toLowerCase(), result.type],
          icon:
            result.type === 'resident'
              ? staticMenuItems.find(i => i.id === 'nav-residents')?.icon
              : staticMenuItems.find(i => i.id === 'nav-households')?.icon,
        }));

        setDynamicResults(dynamicMenuItems);
      } catch (error) {
        console.error('Search error:', error);
        trackCommandMenuError(error as Error, {
          context: 'search',
          query: searchQuery.slice(0, 50),
        });
        setDynamicResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchWithApi, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, staticMenuItems]);

  // Combine all items based on search state
  const allItems = useMemo(() => {
    let items: CommandMenuItem[] = [];

    if (searchQuery.trim()) {
      // Show dynamic search results first, then filtered static items
      items = [...dynamicResults];

      // Add matching static items
      const query = searchQuery.toLowerCase();
      const matchingStaticItems = staticMenuItems.filter(
        item =>
          item.label?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.keywords?.some(keyword => keyword.includes(query))
      );

      items.push(...matchingStaticItems);
    } else {
      // Show recent items first, then all static items
      // Ensure static items are always shown when there's no search query
      items = [...recentItems, ...staticMenuItems];
    }

    // Ensure we always have at least the static menu items
    if (items.length === 0 && staticMenuItems.length > 0) {
      items = staticMenuItems;
    }

    // Only limit results for search queries - show all static items when browsing
    const limit = searchQuery.trim() ? maxResults : Math.max(maxResults, staticMenuItems.length);
    return items.slice(0, limit);
  }, [searchQuery, dynamicResults, staticMenuItems, recentItems, maxResults]);

  // Filter and search items (legacy compatibility)
  const filteredItems = allItems;

  // Reset selected index when filtered items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems]);

  // Keyboard shortcuts (modified for inline dropdown)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle global shortcuts when not in an input field
      if ((event.metaKey || event.ctrlKey) && event.key === 'k' && !isInputFocused()) {
        event.preventDefault();
        setIsOpen(true);
        return;
      }

      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          close();
          break;
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => (prev >= filteredItems.length - 1 ? 0 : prev + 1));
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => (prev <= 0 ? filteredItems.length - 1 : prev - 1));
          break;
        case 'Enter':
          event.preventDefault();
          if (filteredItems[selectedIndex]) {
            executeCommand(filteredItems[selectedIndex]);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex]);

  // Helper to check if an input is currently focused
  const isInputFocused = () => {
    const activeElement = document.activeElement;
    return (
      activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')
    );
  };

  const open = useCallback(() => {
    setIsOpen(true);
    setSearchQuery('');
    setSelectedIndex(0);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setSearchQuery('');
    setSelectedIndex(0);
    setDynamicResults([]);
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  // API action handlers
  const handleExportData = async (type: 'residents' | 'households', format: 'csv' | 'xlsx') => {
    toast.loading('Preparing export...', { id: 'export' });
    const success = await exportData({ type, format });

    if (success) {
      toast.success('Export completed successfully', { id: 'export' });
    } else {
      toast.error('Export failed', { id: 'export' });
    }
  };

  const handleBackupData = async () => {
    toast.loading('Creating backup...', { id: 'backup' });
    const success = await backupData();

    if (success) {
      toast.success('Backup created successfully', { id: 'backup' });
    } else {
      toast.error('Backup failed', { id: 'backup' });
    }
  };

  const handleQuickAction = async (actionFn: () => Promise<string>) => {
    try {
      const href = await actionFn();
      router.push(href);
    } catch (error) {
      toast.error('Action failed');
      console.error('Quick action error:', error);
    }
  };

  const executeCommand = useCallback(
    (item: CommandMenuItem) => {
      if (item.disabled) return;

      close();

      // Track the interaction based on item type
      if (item.id.startsWith('search-')) {
        // Track navigation to search result
        const originalId = item.id.replace('search-', '');
        const type = item.description?.includes('Resident') ? 'resident' : 'household';
        if (item.href) {
          trackNavigation(
            originalId,
            item.label || item.title || 'Unknown',
            item.description || '',
            type as 'resident' | 'household',
            item.href
          );
          trackCommandMenuNavigation(originalId, type, item.href);
        }
      } else if (item.onClick) {
        // Track action execution
        trackAction(item.id, item.label || item.title || 'Unknown', item.description || '');
        trackCommandMenuAction(item.id, 'click_action');
      } else if (item.href) {
        // Track navigation
        trackAction(
          item.id,
          item.label || item.title || 'Unknown',
          `Navigated to ${item.label || item.title || 'Unknown'}`
        );
        trackCommandMenuNavigation(item.id, 'navigation', item.href);
      }

      if (item.onClick) {
        item.onClick();
      } else if (item.href) {
        router.push(item.href);
      }
    },
    [close, router]
  );

  return {
    isOpen,
    open,
    close,
    toggle,
    searchQuery,
    setSearchQuery,
    filteredItems,
    selectedIndex,
    setSelectedIndex,
    executeCommand,
    isLoading,
    dynamicResults: dynamicResults.length,
    recentItems: recentItems.length,
    handleClearRecentItems,
  };
}
