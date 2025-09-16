/**
 * Command Menu Recent Items Hook
 *
 * @description Handles recent items management for command menu.
 * Extracted from useCommandMenuWithApi for better maintainability.
 */

'use client';

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

import { useAsyncErrorBoundary } from '@/hooks/utilities/useAsyncErrorBoundary';
import {
  getRecentItems,
  clearRecentItems,
} from '@/utils/shared/apiUtils';
import type { CommandMenuSearchResult as CommandMenuItem } from '@/types';


import type { UseCommandMenuRecentsReturn } from '@/types';

// Interface moved to centralized types

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
          title: item.title,
          subtitle: item.description,
          group: 'Recent',
          data: item.href,
          score: 0,
          type: 'navigation' as const,
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
