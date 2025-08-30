'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

import { useCommandMenuShortcut, createDropdownKeyHandler } from '@/lib/keyboardUtils';
import type { CommandMenuSearchResult as CommandMenuItem } from '@/types';

// Safe router hook that works in both Next.js and Storybook environments
function useSafeRouter() {
  // Mock router for Storybook/testing environments
  const mockRouter = {
    push: (href: string) => {
      console.log('Navigation to:', href);
      // In Storybook, we can use window.location or just log
      if (typeof window !== 'undefined' && window.location) {
        window.location.href = href;
      }
    },
    replace: (href: string) => console.log('Replace with:', href),
    back: () => console.log('Navigate back'),
    forward: () => console.log('Navigate forward'),
    refresh: () => console.log('Refresh page'),
  };

  // For Storybook/testing environments, return mock
  if (typeof window === 'undefined' || !(window as any).next) {
    return mockRouter;
  }

  try {
    // Only import useRouter when we're in a Next.js environment
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useRouter } = require('next/navigation');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useRouter();
  } catch {
    return mockRouter;
  }
}

interface UseCommandMenuProps {
  items: CommandMenuItem[];
  maxResults?: number;
}

export function useCommandMenu({ items, maxResults = 10 }: UseCommandMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useSafeRouter();

  // Filter and search items
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      // Show recent items first when no search query
      const recentItems = items.filter(item => item.recent).slice(0, 5);
      const otherItems = items
        .filter(item => !item.recent)
        .slice(0, maxResults - recentItems.length);
      return [...recentItems, ...otherItems];
    }

    const query = searchQuery.toLowerCase();
    const scored = items
      .map(item => {
        let score = 0;
        const label = item.label?.toLowerCase() || '';
        const description = item.description?.toLowerCase() || '';
        const keywords = item.keywords?.join(' ').toLowerCase() || '';

        // Exact match gets highest score
        if (label === query) score += 100;
        else if (label.startsWith(query)) score += 50;
        else if (label.includes(query)) score += 25;

        // Description matches
        if (description.includes(query)) score += 15;

        // Keywords matches
        if (keywords.includes(query)) score += 10;

        return { item, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(({ item }) => item);

    return scored;
  }, [items, searchQuery, maxResults]);

  // Reset selected index when filtered items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems]);

  // Global keyboard shortcut for opening command menu
  useCommandMenuShortcut(() => setIsOpen(true), true);

  // Command menu navigation when open
  useEffect(() => {
    if (!isOpen) return;

    const handleMenuKeyDown = createDropdownKeyHandler({
      isOpen: true,
      selectedIndex,
      itemCount: filteredItems.length,
      onClose: close,
      onSelect: (index: number) => {
        if (filteredItems[index]) {
          executeCommand(filteredItems[index]);
        }
      },
      onNavigate: setSelectedIndex,
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      handleMenuKeyDown(event);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex]);

  const open = useCallback(() => {
    setIsOpen(true);
    setSearchQuery('');
    setSelectedIndex(0);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setSearchQuery('');
    setSelectedIndex(0);
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  const executeCommand = useCallback(
    (item: CommandMenuItem) => {
      if (item.disabled) return;

      // Close menu first
      close();

      // Execute the command
      if (item.onClick) {
        item.onClick();
      } else if (item.href) {
        router.push(item.href);
      }

      // Mark as recent (this would typically be handled by a context or store)
      // For now, we'll just trigger the action
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
  };
}
