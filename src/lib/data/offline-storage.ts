/**
 * Offline Storage System using IndexedDB
 * Provides offline-first data storage for PWA functionality
 */

import type { OfflineStoredData as StoredData, PendingSyncItem } from '@/types/utilities';



export class OfflineStorage {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'CitizenlyOffline';
  private readonly DB_VERSION = 1;

  /**
   * Initialize the IndexedDB database
   */
  async init(): Promise<IDBDatabase> {
    if (typeof window === 'undefined') {
      throw new Error('IndexedDB not available in server environment');
    }

    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onupgradeneeded = event => {
        this.db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!this.db.objectStoreNames.contains('residents')) {
          const residentsStore = this.db.createObjectStore('residents', { keyPath: 'id' });
          residentsStore.createIndex('barangay_code', 'barangay_code', { unique: false });
          residentsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!this.db.objectStoreNames.contains('households')) {
          const householdsStore = this.db.createObjectStore('households', { keyPath: 'code' });
          householdsStore.createIndex('barangay_code', 'barangay_code', { unique: false });
          householdsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!this.db.objectStoreNames.contains('dashboard_stats')) {
          this.db.createObjectStore('dashboard_stats', { keyPath: 'id' });
        }

        if (!this.db.objectStoreNames.contains('pending_sync')) {
          const syncStore = this.db.createObjectStore('pending_sync', {
            keyPath: 'id',
            autoIncrement: true,
          });
          syncStore.createIndex('type', 'type', { unique: false });
          syncStore.createIndex('synced', 'synced', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!this.db.objectStoreNames.contains('api_cache')) {
          const cacheStore = this.db.createObjectStore('api_cache', { keyPath: 'url' });
          cacheStore.createIndex('expiry', 'expiry', { unique: false });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onerror = () => {
        reject(new Error(`Failed to open IndexedDB: ${request.error}`));
      };
    });
  }

  /**
   * Store residents data offline
   */
  async storeResidents(residents: any[], barangayCode?: string): Promise<void> {
    if (typeof window === 'undefined') return;

    await this.init();

    const tx = this.db!.transaction(['residents'], 'readwrite');
    const store = tx.objectStore('residents');

    const timestamp = Date.now();

    for (const resident of residents) {
      const storedResident = {
        ...resident,
        timestamp,
        barangay_code: barangayCode || resident.barangay_code,
      };
      await store.put(storedResident);
    }

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Get residents from offline storage
   */
  async getOfflineResidents(barangayCode?: string): Promise<any[]> {
    await this.init();

    const tx = this.db!.transaction(['residents'], 'readonly');
    const store = tx.objectStore('residents');

    if (barangayCode) {
      const index = store.index('barangay_code');
      return await new Promise<any[]>((resolve, reject) => {
        const request = index.getAll(barangayCode);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }

    return await new Promise<any[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Store households data offline
   */
  async storeHouseholds(households: any[], barangayCode?: string): Promise<void> {
    await this.init();

    const tx = this.db!.transaction(['households'], 'readwrite');
    const store = tx.objectStore('households');

    const timestamp = Date.now();

    for (const household of households) {
      const storedHousehold = {
        ...household,
        timestamp,
        barangay_code: barangayCode || household.barangay_code,
      };
      await store.put(storedHousehold);
    }

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Get households from offline storage
   */
  async getOfflineHouseholds(barangayCode?: string): Promise<any[]> {
    await this.init();

    const tx = this.db!.transaction(['households'], 'readonly');
    const store = tx.objectStore('households');

    if (barangayCode) {
      const index = store.index('barangay_code');
      return await new Promise<any[]>((resolve, reject) => {
        const request = index.getAll(barangayCode);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }

    return await new Promise<any[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Store dashboard statistics
   */
  async storeDashboardStats(stats: any): Promise<void> {
    await this.init();

    const tx = this.db!.transaction(['dashboard_stats'], 'readwrite');
    const store = tx.objectStore('dashboard_stats');

    await store.put({
      id: 'current',
      data: stats,
      timestamp: Date.now(),
    });

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Get dashboard statistics from offline storage
   */
  async getOfflineDashboardStats(): Promise<any | null> {
    await this.init();

    const tx = this.db!.transaction(['dashboard_stats'], 'readonly');
    const store = tx.objectStore('dashboard_stats');

    const result = await new Promise<StoredData | undefined>((resolve, reject) => {
      const request = store.get('current');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return result?.data || null;
  }

  /**
   * Add item to sync queue for when online
   */
  async addToSyncQueue(
    item: Omit<PendingSyncItem, 'id' | 'timestamp' | 'synced' | 'retryCount'>
  ): Promise<void> {
    if (typeof window === 'undefined') return;

    await this.init();

    const tx = this.db!.transaction(['pending_sync'], 'readwrite');
    const store = tx.objectStore('pending_sync');

    const syncItem: Omit<PendingSyncItem, 'id'> = {
      ...item,
      timestamp: Date.now(),
      synced: false,
      retryCount: 0,
    };

    await store.add(syncItem);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Get pending sync items
   */
  async getPendingSyncItems(): Promise<PendingSyncItem[]> {
    if (typeof window === 'undefined') return [];

    try {
      await this.init();

      const tx = this.db!.transaction(['pending_sync'], 'readonly');
      const store = tx.objectStore('pending_sync');

      // Get all items and filter for non-synced ones
      const allItems = await new Promise<PendingSyncItem[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      return allItems.filter((item: PendingSyncItem) => !item.synced);
    } catch (error) {
      console.warn('Failed to get pending sync items:', error);
      return [];
    }
  }

  /**
   * Mark sync item as completed
   */
  async markSyncItemCompleted(id: number): Promise<void> {
    if (typeof window === 'undefined') return;

    await this.init();

    const tx = this.db!.transaction(['pending_sync'], 'readwrite');
    const store = tx.objectStore('pending_sync');

    const item = await new Promise<PendingSyncItem | undefined>((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    if (item) {
      item.synced = true;
      await store.put(item);
    }

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Increment retry count for sync item
   */
  async incrementSyncRetry(id: number): Promise<void> {
    if (typeof window === 'undefined') return;

    await this.init();

    const tx = this.db!.transaction(['pending_sync'], 'readwrite');
    const store = tx.objectStore('pending_sync');

    const item = await new Promise<PendingSyncItem | undefined>((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    if (item) {
      item.retryCount = (item.retryCount || 0) + 1;
      await store.put(item);
    }

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Store API response in cache
   */
  async cacheApiResponse(url: string, data: any, ttlMinutes: number = 30): Promise<void> {
    await this.init();

    const tx = this.db!.transaction(['api_cache'], 'readwrite');
    const store = tx.objectStore('api_cache');

    const cacheItem = {
      url,
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttlMinutes * 60 * 1000,
    };

    await store.put(cacheItem);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Get cached API response
   */
  async getCachedApiResponse(url: string): Promise<any | null> {
    await this.init();

    const tx = this.db!.transaction(['api_cache'], 'readonly');
    const store = tx.objectStore('api_cache');

    const result = await new Promise<StoredData | undefined>((resolve, reject) => {
      const request = store.get(url);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (result && result.expiry && result.expiry > Date.now()) {
      return result.data;
    }

    // Remove expired cache
    if (result) {
      const deleteTx = this.db!.transaction(['api_cache'], 'readwrite');
      const deleteStore = deleteTx.objectStore('api_cache');
      await deleteStore.delete(url);
    }

    return null;
  }

  /**
   * Clean up expired cache entries
   */
  async cleanupExpiredCache(): Promise<void> {
    await this.init();

    const tx = this.db!.transaction(['api_cache'], 'readwrite');
    const store = tx.objectStore('api_cache');
    const index = store.index('expiry');

    const now = Date.now();
    const expiredItems = await new Promise<any[]>((resolve, reject) => {
      const request = index.getAll(IDBKeyRange.upperBound(now));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    for (const item of expiredItems) {
      await store.delete(item.url);
    }

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Clear all offline data
   */
  async clearAllData(): Promise<void> {
    await this.init();

    const storeNames = ['residents', 'households', 'dashboard_stats', 'pending_sync', 'api_cache'];
    const tx = this.db!.transaction(storeNames, 'readwrite');

    for (const storeName of storeNames) {
      const store = tx.objectStore(storeName);
      await store.clear();
    }

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    residents: number;
    households: number;
    pendingSync: number;
    cacheSize: number;
  }> {
    await this.init();

    const tx = this.db!.transaction(
      ['residents', 'households', 'pending_sync', 'api_cache'],
      'readonly'
    );

    const [residentsCount, householdsCount, pendingSyncCount, cacheCount] = await Promise.all([
      new Promise<number>((resolve, reject) => {
        const request = tx.objectStore('residents').count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }),
      new Promise<number>((resolve, reject) => {
        const request = tx.objectStore('households').count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }),
      new Promise<number>((resolve, reject) => {
        const request = tx.objectStore('pending_sync').count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }),
      new Promise<number>((resolve, reject) => {
        const request = tx.objectStore('api_cache').count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }),
    ]);

    return {
      residents: residentsCount,
      households: householdsCount,
      pendingSync: pendingSyncCount,
      cacheSize: cacheCount,
    };
  }
}

// Export singleton instance
export const offlineStorage = new OfflineStorage();
