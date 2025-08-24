'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components';

interface PWAStatusInfo {
  isOnline: boolean;
  isInstalled: boolean;
  hasServiceWorker: boolean;
  cacheStatus: string;
  installPromptAvailable: boolean;
}

export default function PWAStatus() {
  const [status, setStatus] = useState<PWAStatusInfo>({
    isOnline: true,
    isInstalled: false,
    hasServiceWorker: false,
    cacheStatus: 'Unknown',
    installPromptAvailable: false,
  });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      const isOnline = navigator.onLine;
      
      const isInstalled = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      
      const hasServiceWorker = 'serviceWorker' in navigator;
      
      setStatus(prev => ({
        ...prev,
        isOnline,
        isInstalled,
        hasServiceWorker,
      }));
    };

    // Initial status check
    updateStatus();

    // Listen for online/offline changes
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    // Check service worker status
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setStatus(prev => ({ ...prev, cacheStatus: 'Active' }));
      });
    }

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  const handleClearCache = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        
        // Also unregister service worker
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map(reg => reg.unregister()));
        }
        
        setStatus(prev => ({ ...prev, cacheStatus: 'Cleared' }));
        
        // Reload the page
        window.location.reload();
      } catch (error) {
        console.error('Failed to clear cache:', error);
      }
    }
  };

  const handleTestOffline = () => {
    // Simulate offline mode for testing
    alert('To test offline mode:\n1. Open DevTools (F12)\n2. Go to Network tab\n3. Check "Offline" checkbox\n4. Try navigating pages');
  };

  if (!showDetails) {
    return (
      <button
        onClick={() => setShowDetails(true)}
        className="fixed bottom-20 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
        title="PWA Status"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-sm z-40">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          PWA Status
        </h3>
        <button
          onClick={() => setShowDetails(false)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-2 text-xs">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">Connection:</span>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${status.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={status.isOnline ? 'text-green-600' : 'text-red-600'}>
              {status.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Installation Status */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">Installed:</span>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${status.isInstalled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className={status.isInstalled ? 'text-green-600' : 'text-gray-600'}>
              {status.isInstalled ? 'Yes' : 'No'}
            </span>
          </div>
        </div>

        {/* Service Worker Status */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">Service Worker:</span>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${status.hasServiceWorker ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className={status.hasServiceWorker ? 'text-green-600' : 'text-gray-600'}>
              {status.hasServiceWorker ? 'Active' : 'Disabled'}
            </span>
          </div>
        </div>

        {/* Cache Status */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">Cache:</span>
          <span className="text-blue-600">{status.cacheStatus}</span>
        </div>
      </div>

      {/* PWA Features */}
      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Features Available:</h4>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Offline Mode</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Fast Loading</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-gray-600 dark:text-gray-400">App Install</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Background Sync</span>
          </div>
        </div>
      </div>

      {/* Test Actions */}
      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
        <Button
          onClick={handleTestOffline}
          variant="primary"
          size="sm"
          className="w-full text-xs"
        >
          Test Offline Mode
        </Button>
        <Button
          onClick={handleClearCache}
          variant="neutral-outline"
          size="sm"
          className="w-full text-xs"
        >
          Clear Cache & Reload
        </Button>
      </div>

      {/* Instructions */}
      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          <strong>Install:</strong> Look for the install prompt or use browser menu → "Install Citizenly"
        </p>
      </div>
    </div>
  );
}