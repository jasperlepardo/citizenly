/**
 * Background Sync Queue System
 * Handles offline data synchronization when connection is restored
 */

import { ErrorCode, ErrorSeverity } from '../error-handling/error-types';
import { createAppError } from '../error-handling/error-utils';

import { offlineStorage } from './offline-storage';

interface SyncResult {
  success: boolean;
  error?: string;
  data?: any;
}

export class SyncQueue {
  private isProcessing = false;
  private maxRetries = 3;
  private retryDelay = 5000; // 5 seconds

  /**
   * Add action to sync queue
   */
  async addToQueue(
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    type: 'resident' | 'household' | 'user',
    data: any
  ): Promise<void> {
    if (typeof window === 'undefined') return;
    
    await offlineStorage.addToSyncQueue({
      action,
      type,
      data,
    });

    console.log(`Added ${action} ${type} to sync queue`);

    // Try to process queue if online
    if (navigator.onLine && !this.isProcessing) {
      this.processQueue();
    }
  }

  /**
   * Process pending sync items
   */
  async processQueue(): Promise<void> {
    if (typeof window === 'undefined' || this.isProcessing || !navigator.onLine) {
      return;
    }

    this.isProcessing = true;
    console.log('Processing sync queue...');

    try {
      const pendingItems = await offlineStorage.getPendingSyncItems();
      
      for (const item of pendingItems) {
        if (item.retryCount >= this.maxRetries) {
          console.warn(`Max retries exceeded for sync item ${item.id}`);
          continue;
        }

        try {
          const result = await this.syncItem(item);
          
          if (result.success) {
            await offlineStorage.markSyncItemCompleted(item.id!);
            console.log(`Successfully synced ${item.action} ${item.type}`);
          } else {
            await offlineStorage.incrementSyncRetry(item.id!);
            console.error(`Failed to sync ${item.action} ${item.type}:`, result.error);
          }
        } catch (error) {
          await offlineStorage.incrementSyncRetry(item.id!);
          console.error(`Error syncing ${item.action} ${item.type}:`, error);
        }

        // Add delay between sync operations
        await this.delay(1000);
      }
    } catch (error) {
      console.error('Error processing sync queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Sync individual item
   */
  private async syncItem(item: any): Promise<SyncResult> {
    const { action, type, data } = item;

    try {
      // Get auth token
      const { supabase } = await import('@/lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        return { success: false, error: 'No authentication token' };
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
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
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}` 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Handle CREATE operations
   */
  private async handleCreate(type: string, data: any, headers: HeadersInit): Promise<Response> {
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
        context: { type, action: 'CREATE' }
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
  private async handleUpdate(type: string, data: any, headers: HeadersInit): Promise<Response> {
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
        context: { type, action: 'UPDATE' }
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
  private async handleDelete(type: string, data: any, headers: HeadersInit): Promise<Response> {
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
        context: { type, action: 'DELETE' }
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
    if (typeof window === 'undefined') return;
    
    if (!navigator.onLine) {
      throw createAppError('Cannot force sync while offline', {
        code: ErrorCode.NETWORK_ERROR,
        severity: ErrorSeverity.MEDIUM
      });
    }

    await this.processQueue();
  }

  /**
   * Get sync queue status
   */
  async getStatus(): Promise<{
    isProcessing: boolean;
    pendingCount: number;
    isOnline: boolean;
  }> {
    const pendingItems = await offlineStorage.getPendingSyncItems();
    
    return {
      isProcessing: this.isProcessing,
      pendingCount: pendingItems.length,
      isOnline: navigator.onLine,
    };
  }

  /**
   * Clear all completed sync items
   */
  async clearCompleted(): Promise<void> {
    // This would need to be implemented in offline storage
    // For now, we'll just log it
    console.log('Clearing completed sync items...');
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Setup event listeners for online/offline events
   */
  setupEventListeners(): void {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('online', () => {
      console.log('Connection restored, processing sync queue...');
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      console.log('Connection lost, sync queue paused');
    });

    // Process queue on page load if online
    if (navigator.onLine) {
      setTimeout(() => this.processQueue(), 1000);
    }
  }

  /**
   * Cleanup event listeners
   */
  cleanup(): void {
    window.removeEventListener('online', this.processQueue);
    window.removeEventListener('offline', () => {});
  }
}

// Export singleton instance
export const syncQueue = new SyncQueue();