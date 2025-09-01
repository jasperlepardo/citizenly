/**
 * Command Menu Actions Hook
 *
 * @description Handles command execution and API actions for command menu.
 * Extracted from useCommandMenuWithApi for better maintainability.
 */

'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { toast } from 'react-hot-toast';

import type { CommandMenuItemType as CommandMenuItem } from '@/components';
import { useAsyncErrorBoundary } from '@/hooks/utilities/useAsyncErrorBoundary';
import {
  exportData,
  backupData,
  createResident,
  createHousehold,
  findSeniorCitizens,
  findPWDs,
  findSoloParents,
  generateCertificate,
  generateReport,
  trackCommandMenuNavigation,
  trackCommandMenuAction,
} from '@/lib/command-menu';
import { trackNavigation, trackAction } from '@/lib/data';

import type { UseCommandMenuActionsReturn } from '@/types';

// Interface moved to centralized types

/**
 * Hook for command menu actions and execution
 *
 * @description Provides command execution with error handling, analytics tracking,
 * and toast notifications.
 */
export function useCommandMenuActions(): UseCommandMenuActionsReturn {
  const router = useRouter();

  // Error boundary for action operations
  const { wrapAsync } = useAsyncErrorBoundary({
    onError: (error, errorInfo) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('Command Menu Action Error:', errorInfo, error);
      }
    },
    enableRecovery: false,
    maxRetries: 0,
  });

  /**
   * Handle export data action
   */
  const handleExportData = useCallback(
    async (type: 'residents' | 'households', format: 'csv' | 'xlsx') => {
      toast.loading('Preparing export...', { id: 'export' });

      try {
        await wrapAsync(() => exportData({ type, format }), 'export data')();
        toast.success('Export completed successfully', { id: 'export' });
      } catch (error) {
        toast.error('Export failed', { id: 'export' });
      }
    },
    [wrapAsync]
  );

  /**
   * Handle backup data action
   */
  const handleBackupData = useCallback(async () => {
    toast.loading('Creating backup...', { id: 'backup' });

    try {
      await wrapAsync(backupData, 'backup data')();
      toast.success('Backup created successfully', { id: 'backup' });
    } catch (error) {
      toast.error('Backup failed', { id: 'backup' });
    }
  }, [wrapAsync]);

  /**
   * Handle quick action
   */
  const handleQuickAction = useCallback(
    async (actionFn: () => Promise<string>) => {
      try {
        const href = await wrapAsync(actionFn, 'quick action')();
        if (href) {
          router.push(href);
        }
      } catch (error) {
        // Error handled by async error boundary
        toast.error('Action failed');
      }
    },
    [router, wrapAsync]
  );

  /**
   * Execute a command
   */
  const executeCommand = useCallback(
    (item: CommandMenuItem) => {
      if (item.disabled) return;

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

      // Execute the command
      if (item.onClick) {
        item.onClick();
      } else if (item.href) {
        router.push(item.href);
      }
    },
    [router]
  );

  /**
   * Get enhanced menu items with real API functionality
   */
  const getEnhancedMenuItems = useCallback(
    (baseItems: CommandMenuItem[]): CommandMenuItem[] => {
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
            enhancedItem.onClick = () =>
              handleQuickAction(async () => generateReport('population'));
            break;
          case 'report-households-summary':
            enhancedItem.onClick = () =>
              handleQuickAction(async () => generateReport('households'));
            break;
        }

        return enhancedItem;
      });
    },
    [handleExportData, handleBackupData, handleQuickAction]
  );

  return {
    executeCommand,
    handleExportData,
    handleBackupData,
    handleQuickAction,
    getEnhancedMenuItems,
  };
}

// Export for backward compatibility
export default useCommandMenuActions;
