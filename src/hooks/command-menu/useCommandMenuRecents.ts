/**
 * Command Menu Recent Items Hook
 * 
 * @description Handles recent items management for command menu.
 * Extracted from useCommandMenuWithApi for better maintainability.
 */

'use client';

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import type { CommandMenuItemType as CommandMenuItem } from '@/components';
import { getRecentApiItems as getRecentItems, clearRecentApiItems as clearRecentItems } from '@/lib/command-menu';
import { useAsyncErrorBoundary } from '../utilities/useAsyncErrorBoundary';

/**
 * Recent item from storage
 */
export interface RecentItem {
  id: string;
  title: string;
  description: string;
  href: string;
}

/**
 * Return type for command menu recent items hook
 */
export interface UseCommandMenuRecentsReturn {
  /** Recent menu items */
  recentItems: CommandMenuItem[];
  /** Loading state */
  isLoading: boolean;
  /** Load recent items */
  loadRecentItems: () => Promise<void>;
  /** Clear all recent items */
  handleClearRecentItems: () => Promise<void>;
  /** Number of recent items */
  recentItemsCount: number;
}

/**
 * Hook for command menu recent items management
 * 
 * @description Provides recent items functionality with error handling
 * and toast notifications.
 */
export function useCommandMenuRecents(): UseCommandMenuRecentsReturn {
  
  const [recentItems, setRecentItems] = useState<CommandMenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Error boundary for recent items operations
  const { wrapAsync } = useAsyncErrorBoundary({
    onError: (error, errorInfo) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('Command Menu Recents Error:', errorInfo, error);
      }
    },
    enableRecovery: false,
    maxRetries: 0,
  });

  /**
   * Load recent items from storage
   */
  const loadRecentItems = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const recent = await wrapAsync(getRecentItems, 'load recent items')();
      
      if (recent) {
        const recentMenuItems: CommandMenuItem[] = recent.map(item => ({
          id: `recent-${item.id}`,
          label: item.title,
          description: item.description,
          group: 'Recent',
          href: item.href,
          keywords: item.title.toLowerCase().split(' '),
          recent: true,
        }));
        
        setRecentItems(recentMenuItems);
      } else {
        setRecentItems([]);
      }
    } catch (error) {
      // Error handled by async error boundary
      setRecentItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [wrapAsync]);

  /**
   * Clear all recent items
   */
  const handleClearRecentItems = useCallback(async () => {
    try {
      await wrapAsync(clearRecentItems, 'clear recent items')();
      setRecentItems([]); // Clear the UI immediately
      toast.success('Recent items cleared');
    } catch (error) {
      // Error handled by async error boundary
      toast.error('Failed to clear recent items');
    }
  }, [wrapAsync]);

  return {
    recentItems,
    isLoading,
    loadRecentItems,
    handleClearRecentItems,
    recentItemsCount: recentItems.length,
  };
}

// Export for backward compatibility
export default useCommandMenuRecents;