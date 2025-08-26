'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useMemo } from 'react';

import type { CommandMenuItemType as CommandMenuItem } from '@/components';

interface UseCommandMenuProps {
  items: CommandMenuItem[];
  maxResults?: number;
}

export function useCommandMenu({ items, maxResults = 10 }: UseCommandMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  // Filter and search items
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      // Show recent items first when no search query
      const recentItems = items.filter(item => item.recent).slice(0, 5);
      const otherItems = items.filter(item => !item.recent).slice(0, maxResults - recentItems.length);
      return [...recentItems, ...otherItems];
    }

    const query = searchQuery.toLowerCase();
    const scored = items
      .map(item => {
        let score = 0;
        const label = item.label.toLowerCase();
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Global shortcut to open command menu
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsOpen(true);
        return;
      }

      // Menu is not open, ignore other shortcuts
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          close();
          break;
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev >= filteredItems.length - 1 ? 0 : prev + 1
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev <= 0 ? filteredItems.length - 1 : prev - 1
          );
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

  const executeCommand = useCallback((item: CommandMenuItem) => {
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
  }, [close, router]);

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