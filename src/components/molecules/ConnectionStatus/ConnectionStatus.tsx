'use client';

import React, { useState, useEffect } from 'react';
import { syncQueue } from '@/lib/sync-queue';
import { offlineStorage } from '@/lib/offline-storage';

interface ConnectionStatusProps {
  className?: string;
}

export default function ConnectionStatus({ className = '' }: ConnectionStatusProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState({
    isProcessing: false,
    pendingCount: 0,
  });
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Initialize online status
    setIsOnline(navigator.onLine);

    // Setup online/offline event listeners
    const handleOnline = async () => {
      setIsOnline(true);
      setShowBanner(true);
      
      // Check for pending sync items
      const status = await syncQueue.getStatus();
      setSyncStatus(status);
      
      // Auto-hide banner after sync completes
      setTimeout(() => {
        if (status.pendingCount === 0) {
          setShowBanner(false);
        }
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial sync status check
    const checkSyncStatus = async () => {
      const status = await syncQueue.getStatus();
      setSyncStatus(status);
      
      // Show banner if there are pending items
      if (status.pendingCount > 0) {
        setShowBanner(true);
      }
    };

    checkSyncStatus();

    // Periodic sync status updates
    const statusInterval = setInterval(checkSyncStatus, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(statusInterval);
    };
  }, []);

  const handleDismiss = () => {
    setShowBanner(false);
  };

  const handleForceSync = async () => {
    if (isOnline) {
      try {
        await syncQueue.forceSync();
        const status = await syncQueue.getStatus();
        setSyncStatus(status);
      } catch (error) {
        console.error('Force sync failed:', error);
      }
    }
  };

  // Don't show if online and no pending sync
  if (!showBanner && (isOnline && syncStatus.pendingCount === 0)) {
    return null;
  }

  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        message: 'You are offline',
        detail: 'Changes will be saved locally and synced when connection is restored',
        color: 'bg-red-500',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M18.364 5.636L5.636 18.364M5.636 5.636l12.728 12.728" />
          </svg>
        ),
      };
    }

    if (syncStatus.isProcessing) {
      return {
        message: 'Syncing data...',
        detail: `Uploading ${syncStatus.pendingCount} pending changes`,
        color: 'bg-blue-500',
        icon: (
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ),
      };
    }

    if (syncStatus.pendingCount > 0) {
      return {
        message: 'Connection restored',
        detail: `${syncStatus.pendingCount} changes ready to sync`,
        color: 'bg-orange-500',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        ),
      };
    }

    return {
      message: 'Connection restored',
      detail: 'All data is up to date',
      color: 'bg-green-500',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M5 13l4 4L19 7" />
        </svg>
      ),
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${statusInfo.color} text-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {statusInfo.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {statusInfo.message}
              </p>
              <p className="text-xs opacity-90 truncate">
                {statusInfo.detail}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Force Sync Button */}
            {isOnline && syncStatus.pendingCount > 0 && !syncStatus.isProcessing && (
              <button
                onClick={handleForceSync}
                className="text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded transition-colors"
              >
                Sync Now
              </button>
            )}

            {/* Dismiss Button */}
            <button
              onClick={handleDismiss}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Connection Status Hook
export function useConnectionStatus() {
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