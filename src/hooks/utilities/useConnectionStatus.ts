'use client';

/**
 * Connection Status Hook
 * 
 * @description Hook for monitoring network connection and sync status.
 * Extracted from ConnectionStatus component for better maintainability.
 */

import { useState, useEffect } from 'react';
import { syncQueue } from '@/lib/data';

/**
 * Return type for connection status hook
 */
export interface UseConnectionStatusReturn {
  /** Whether the user is online */
  isOnline: boolean;
  /** Whether there are pending sync items */
  syncPending: boolean;
  /** Whether sync can be performed (online + pending) */
  canSync: boolean;
}

/**
 * Hook for monitoring network connection and sync status
 */
export function useConnectionStatus(): UseConnectionStatusReturn {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncPending, setSyncPending] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check for pending sync items
    const checkPendingSync = async () => {
      const status = await syncQueue.getStatus();
      setSyncPending(status.pendingCount > 0);
    };

    checkPendingSync();
    const interval = setInterval(checkPendingSync, 10000); // Check every 10 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return {
    isOnline,
    syncPending,
    canSync: isOnline && syncPending,
  };
}

// Export for backward compatibility
export default useConnectionStatus;