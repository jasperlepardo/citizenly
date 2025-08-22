'use client';

import React, { useState, useEffect } from 'react';
import { pwaPerformance } from '@/lib/performance/pwaPerformanceUtils';
import { syncQueue } from '@/lib/storage';
import { offlineStorage } from '@/lib/storage';

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
    alert('PWA data cleared');
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
    <div className={`fixed bottom-20 right-4 z-50 ${className}`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors"
        title="PWA Dev Tools"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="absolute bottom-12 right-0 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              PWA Dev Tools
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Performance Metrics */}
          {metrics && (
            <div className="mb-4">
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Performance Metrics
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  <div className="text-gray-600 dark:text-gray-400">Cache Hit Rate</div>
                  <div className="font-medium">{(metrics.rates.cacheHitRate * 100).toFixed(1)}%</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  <div className="text-gray-600 dark:text-gray-400">Install Conversion</div>
                  <div className="font-medium">{(metrics.rates.installConversionRate * 100).toFixed(1)}%</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  <div className="text-gray-600 dark:text-gray-400">Prompts Shown</div>
                  <div className="font-medium">{metrics.metrics.installPromptShown}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  <div className="text-gray-600 dark:text-gray-400">Offline Usage</div>
                  <div className="font-medium">{metrics.metrics.offlineUsage}</div>
                </div>
              </div>
            </div>
          )}

          {/* Sync Status */}
          {syncStatus && (
            <div className="mb-4">
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sync Status
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  <div className="text-gray-600 dark:text-gray-400">Pending Items</div>
                  <div className="font-medium">{syncStatus.pendingCount}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  <div className="text-gray-600 dark:text-gray-400">Processing</div>
                  <div className="font-medium">{syncStatus.isProcessing ? 'Yes' : 'No'}</div>
                </div>
              </div>
            </div>
          )}

          {/* User Behavior */}
          {userMetrics && (
            <div className="mb-4">
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                User Behavior
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  <div className="text-gray-600 dark:text-gray-400">Page Views</div>
                  <div className="font-medium">{userMetrics.pageViews}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  <div className="text-gray-600 dark:text-gray-400">Revisits</div>
                  <div className="font-medium">{userMetrics.revisits}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  <div className="text-gray-600 dark:text-gray-400">Time Spent</div>
                  <div className="font-medium">{Math.round(userMetrics.timeSpent / 1000)}s</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
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
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded transition-colors"
            >
              Export Metrics
            </button>
            <button
              onClick={clearAllData}
              className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded transition-colors"
            >
              Clear All Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}