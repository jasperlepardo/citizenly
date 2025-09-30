/**
 * Sync Service
 * CONSOLIDATED - Background sync queue system for offline data synchronization
 * Consolidates lib/data/sync-queue.ts functionality
 */

import { createLogger } from '@/lib/config/environment';
import { offlineStorage } from '@/lib/data/offline-storage';
import { ErrorCode, ErrorSeverity } from '@/types/shared/errors/errors';
import type { SyncResult } from '@/types/shared/utilities/utilities';
import { createAppError } from '@/utils/shared/errorUtils';



const logger = createLogger('SyncService');

// Re-export consolidated sync service types
export type { SyncQueueItem, SyncStatus } from '@/types/infrastructure/services/services';

// Import for local usage
import type { SyncQueueItem, SyncStatus } from '@/types/infrastructure/services/services';

/**
 * Sync Service Class
 * Handles offline data synchronization when connection is restored
 */
export class SyncService {
  private isProcessing = false;
  private maxRetries = 3;
  private retryDelay = 5000; // 5 seconds
  private syncDelay = 1000; // 1 second between operations
  private eventListenersSetup = false;

  /**
   * Add action to sync queue
   */
  async addToQueue(
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    type: 'resident' | 'household' | 'user',
    data: Record<string, unknown>
  ): Promise<void> {
    if (typeof window === 'undefined') {
      logger.debug('Skipping sync queue in server environment');
      return;
    }

    try {
      await offlineStorage.addToSyncQueue({
        action,
        type,
        data,
      });

      logger.debug(`Added ${action} ${type} to sync queue`);

      // Try to process queue if online
      if (navigator.onLine && !this.isProcessing) {
        this.processQueue();
      }
    } catch (error) {
      logger.error('Failed to add item to sync queue:', error);
      throw error;
    }
  }

  /**
   * Process pending sync items
   */
  async processQueue(): Promise<void> {
    if (!this.canProcessQueue()) {
      return;
    }

    this.isProcessing = true;
    logger.info('Processing sync queue...');

    try {
      const pendingItems = await offlineStorage.getPendingSyncItems();

      if (pendingItems.length === 0) {
        logger.debug('No pending sync items');
        return;
      }

      const stats = await this.processSyncItems(pendingItems as any);
      this.logProcessingResults(stats);
    } catch (error) {
      logger.error('Error processing sync queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Check if queue processing can proceed
   */
  private canProcessQueue(): boolean {
    return !(typeof window === 'undefined' || this.isProcessing || !navigator.onLine);
  }

  /**
   * Process all sync items and return statistics
   */
  private async processSyncItems(pendingItems: SyncQueueItem[]): Promise<{ processed: number; failed: number; total: number }> {
    let processed = 0;
    let failed = 0;

    for (const item of pendingItems) {
      const result = await this.processSingleItem(item);
      if (result.success) {
        processed++;
      } else {
        failed++;
      }

      await this.delay(this.syncDelay);
    }

    return { processed, failed, total: pendingItems.length };
  }

  /**
   * Process a single sync item
   */
  private async processSingleItem(item: SyncQueueItem): Promise<{ success: boolean }> {
    if (this.shouldSkipItem(item)) {
      return { success: false };
    }

    try {
      const result = await this.syncItem({
        ...item,
        id: String(item.id),
      });

      return await this.handleSyncResult(item, result);
    } catch (error) {
      return await this.handleSyncError(item, error);
    }
  }

  /**
   * Check if item should be skipped due to max retries
   */
  private shouldSkipItem(item: SyncQueueItem): boolean {
    if (item.retryCount >= this.maxRetries) {
      logger.warn(`Max retries exceeded for sync item ${item.id}`, {
        action: item.action,
        type: item.type,
        retryCount: item.retryCount,
      });
      return true;
    }
    return false;
  }

  /**
   * Handle successful or failed sync result
   */
  private async handleSyncResult(item: SyncQueueItem, result: SyncResult): Promise<{ success: boolean }> {
    if (result.success) {
      if (item.id) {
        await offlineStorage.markSyncItemCompleted(Number(item.id));
      }
      logger.info(`Successfully synced ${item.action} ${item.type}`);
      return { success: true };
    } else {
      if (item.id) {
        await offlineStorage.incrementSyncRetry(Number(item.id));
      }
      logger.error(`Failed to sync ${item.action} ${item.type}:`, result.error);
      return { success: false };
    }
  }

  /**
   * Handle sync error
   */
  private async handleSyncError(item: SyncQueueItem, error: unknown): Promise<{ success: boolean }> {
    if (item.id) {
      await offlineStorage.incrementSyncRetry(Number(item.id));
    }
    logger.error(`Error syncing ${item.action} ${item.type}:`, error);
    return { success: false };
  }

  /**
   * Log processing results
   */
  private logProcessingResults(stats: { processed: number; failed: number; total: number }): void {
    logger.info('Sync queue processing completed', stats);
  }

  /**
   * Sync individual item
   */
  private async syncItem(item: SyncQueueItem): Promise<SyncResult> {
    const { action, type, data } = item;

    try {
      // Get auth token through infrastructure service
      const { getAuthSession } = await import('../../infrastructure/auth/sessionService');
      const session = await getAuthSession();

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      };

      let response: Response;

      switch (action) {
        case 'CREATE':
          response = await this.handleCreate(type, data, headers);
          break;
        case 'UPDATE':
          response = await this.handleUpdate(type, data, headers);
          break;
        case 'DELETE':
          response = await this.handleDelete(type, data, headers);
          break;
        default:
          return { success: false, error: `Unknown action: ${action}` };
      }

      if (response.ok) {
        const responseData = await response.json();
        return { success: true, data: responseData };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Handle CREATE operations
   */
  private async handleCreate(type: string, data: Record<string, unknown>, headers: HeadersInit): Promise<Response> {
    const endpoints = {
      resident: '/api/residents',
      household: '/api/households',
      user: '/api/auth/create-profile',
    };

    const endpoint = endpoints[type as keyof typeof endpoints];
    if (!endpoint) {
      throw createAppError(`No endpoint defined for type: ${type}`, {
        code: ErrorCode.INVALID_OPERATION,
        severity: ErrorSeverity.HIGH,
        context: { type, action: 'CREATE' },
      });
    }

    return fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
  }

  /**
   * Handle UPDATE operations
   */
  private async handleUpdate(type: string, data: Record<string, unknown>, headers: HeadersInit): Promise<Response> {
    const endpoints = {
      resident: `/api/residents/${data.id}`,
      household: `/api/households/${data.code || data.id}`,
      user: `/api/auth/profile`,
    };

    const endpoint = endpoints[type as keyof typeof endpoints];
    if (!endpoint) {
      throw createAppError(`No endpoint defined for type: ${type}`, {
        code: ErrorCode.INVALID_OPERATION,
        severity: ErrorSeverity.HIGH,
        context: { type, action: 'UPDATE' },
      });
    }

    return fetch(endpoint, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
  }

  /**
   * Handle DELETE operations
   */
  private async handleDelete(type: string, data: Record<string, unknown>, headers: HeadersInit): Promise<Response> {
    const endpoints = {
      resident: `/api/residents/${data.id}`,
      household: `/api/households/${data.code || data.id}`,
      user: `/api/auth/profile`,
    };

    const endpoint = endpoints[type as keyof typeof endpoints];
    if (!endpoint) {
      throw createAppError(`No endpoint defined for type: ${type}`, {
        code: ErrorCode.INVALID_OPERATION,
        severity: ErrorSeverity.HIGH,
        context: { type, action: 'DELETE' },
      });
    }

    return fetch(endpoint, {
      method: 'DELETE',
      headers,
    });
  }

  /**
   * Force sync all pending items
   */
  async forceSync(): Promise<void> {
    if (typeof window === 'undefined') {
      logger.debug('Skipping force sync in server environment');
      return;
    }

    if (!navigator.onLine) {
      throw createAppError('Cannot force sync while offline', {
        code: ErrorCode.NETWORK_ERROR,
        severity: ErrorSeverity.MEDIUM,
      });
    }

    logger.info('Forcing sync of all pending items...');
    await this.processQueue();
  }

  /**
   * Get sync queue status
   */
  async getStatus(): Promise<SyncStatus> {
    try {
      const pendingItems = await offlineStorage.getPendingSyncItems();

      return {
        isProcessing: this.isProcessing,
        pendingCount: pendingItems.length,
        isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
        lastSyncAttempt: Date.now(),
      };
    } catch (error) {
      logger.error('Failed to get sync status:', error);
      return {
        isProcessing: false,
        pendingCount: 0,
        isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      };
    }
  }

  /**
   * Clear all completed sync items
   */
  async clearCompleted(): Promise<void> {
    try {
      logger.info('Clearing completed sync items...');
      // Implementation will depend on offline storage provider
      // Currently not implemented as offline storage is not yet configured
      logger.warn('Clear completed sync items not yet implemented');
    } catch (error) {
      logger.error('Failed to clear completed sync items:', error);
    }
  }

  /**
   * Setup event listeners for online/offline events
   */
  setupEventListeners(): void {
    if (typeof window === 'undefined' || this.eventListenersSetup) {
      return;
    }

    const handleOnline = () => {
      logger.info('Connection restored, processing sync queue...');
      this.processQueue();
    };

    const handleOffline = () => {
      logger.info('Connection lost, sync queue paused');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    this.eventListenersSetup = true;

    // Process queue on setup if online
    if (navigator.onLine) {
      setTimeout(() => this.processQueue(), 1000);
    }
  }

  /**
   * Cleanup event listeners
   */
  cleanup(): void {
    if (typeof window === 'undefined') return;

    window.removeEventListener('online', () => this.processQueue());
    window.removeEventListener('offline', () => {});
    this.eventListenersSetup = false;
  }

  /**
   * Configure sync settings
   */
  configure(options: { maxRetries?: number; retryDelay?: number; syncDelay?: number }): void {
    if (options.maxRetries !== undefined) {
      this.maxRetries = options.maxRetries;
    }
    if (options.retryDelay !== undefined) {
      this.retryDelay = options.retryDelay;
    }
    if (options.syncDelay !== undefined) {
      this.syncDelay = options.syncDelay;
    }

    logger.info('Sync service configured', {
      maxRetries: this.maxRetries,
      retryDelay: this.retryDelay,
      syncDelay: this.syncDelay,
    });
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Note: SyncService is now managed by the service container
// Import from container: container.getSyncService()
