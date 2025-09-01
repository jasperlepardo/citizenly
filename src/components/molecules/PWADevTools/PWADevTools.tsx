'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

import { syncQueue, offlineStorage } from '@/lib/data';
import { pwaPerformance } from '@/utils/performance/pwaPerformanceUtils';

interface PWADevToolsProps {
  className?: string;
}

export default function PWADevTools({ className = '' }: PWADevToolsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [userMetrics, setUserMetrics] = useState<any>(null);

  // Only show in development
  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (!isDevelopment) return;

    const updateMetrics = async () => {
      try {
        // Get PWA performance metrics
        if (pwaPerformance.instance) {
          const report = pwaPerformance.instance.generateReport();
          setMetrics(report);
        }

        // Get sync queue status
        const status = await syncQueue.getStatus();
        setSyncStatus(status);

        // Get user behavior metrics
        const stored = localStorage.getItem('pwa-user-metrics');
        if (stored) {
          setUserMetrics(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to update PWA dev tools metrics:', error);
      }
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, [isDevelopment]);

  if (!isDevelopment) {
    return null;
  }

  const clearAllData = () => {
    localStorage.removeItem('pwa-metrics');
    localStorage.removeItem('pwa-user-metrics');
    localStorage.removeItem('pwa-prompt-dismissed-date');
    sessionStorage.removeItem('pwa-prompt-dismissed');
    pwaPerformance.instance?.reset();
    toast.success('PWA data cleared');
    window.location.reload();
  };

  const exportMetrics = () => {
    const data = {
      pwaMetrics: metrics,
      syncStatus,
      userMetrics,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pwa-metrics-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`fixed right-4 bottom-20 z-50 ${className}`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full bg-blue-600 p-2 text-white shadow-lg transition-colors hover:bg-blue-700"
        title="PWA Dev Tools"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="absolute right-0 bottom-12 max-h-96 w-80 overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">PWA Dev Tools</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Performance Metrics */}
          {metrics && (
            <div className="mb-4">
              <h4 className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                Performance Metrics
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded bg-gray-50 p-2 dark:bg-gray-700">
                  <div className="text-gray-600 dark:text-gray-400">Cache Hit Rate</div>
                  <div className="font-medium">
                    {(metrics.rates.cacheHitRate * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="rounded bg-gray-50 p-2 dark:bg-gray-700">
                  <div className="text-gray-600 dark:text-gray-400">Install Conversion</div>
                  <div className="font-medium">
                    {(metrics.rates.installConversionRate * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="rounded bg-gray-50 p-2 dark:bg-gray-700">
                  <div className="text-gray-600 dark:text-gray-400">Prompts Shown</div>
                  <div className="font-medium">{metrics.metrics.installPromptShown}</div>
                </div>
                <div className="rounded bg-gray-50 p-2 dark:bg-gray-700">
                  <div className="text-gray-600 dark:text-gray-400">Offline Usage</div>
                  <div className="font-medium">{metrics.metrics.offlineUsage}</div>
                </div>
              </div>
            </div>
          )}

          {/* Sync Status */}
          {syncStatus && (
            <div className="mb-4">
              <h4 className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                Sync Status
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded bg-gray-50 p-2 dark:bg-gray-700">
                  <div className="text-gray-600 dark:text-gray-400">Pending Items</div>
                  <div className="font-medium">{syncStatus.pendingCount}</div>
                </div>
                <div className="rounded bg-gray-50 p-2 dark:bg-gray-700">
                  <div className="text-gray-600 dark:text-gray-400">Processing</div>
                  <div className="font-medium">{syncStatus.isProcessing ? 'Yes' : 'No'}</div>
                </div>
              </div>
            </div>
          )}

          {/* User Behavior */}
          {userMetrics && (
            <div className="mb-4">
              <h4 className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                User Behavior
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded bg-gray-50 p-2 dark:bg-gray-700">
                  <div className="text-gray-600 dark:text-gray-400">Page Views</div>
                  <div className="font-medium">{userMetrics.pageViews}</div>
                </div>
                <div className="rounded bg-gray-50 p-2 dark:bg-gray-700">
                  <div className="text-gray-600 dark:text-gray-400">Revisits</div>
                  <div className="font-medium">{userMetrics.revisits}</div>
                </div>
                <div className="rounded bg-gray-50 p-2 dark:bg-gray-700">
                  <div className="text-gray-600 dark:text-gray-400">Time Spent</div>
                  <div className="font-medium">{Math.round(userMetrics.timeSpent / 1000)}s</div>
                </div>
                <div className="rounded bg-gray-50 p-2 dark:bg-gray-700">
                  <div className="text-gray-600 dark:text-gray-400">Interactions</div>
                  <div className="font-medium">{userMetrics.interactions}</div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col space-y-2">
            <button
              onClick={exportMetrics}
              className="rounded bg-blue-600 px-3 py-2 text-xs text-white transition-colors hover:bg-blue-700"
            >
              Export Metrics
            </button>
            <button
              onClick={clearAllData}
              className="rounded bg-red-600 px-3 py-2 text-xs text-white transition-colors hover:bg-red-700"
            >
              Clear All Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
