'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/atoms';
import { trackPWAEvents } from '@/lib/performance/pwaPerformanceUtils';
import { 
  loadUserMetrics, 
  updatePageViewMetrics, 
  trackUserInteraction, 
  trackTimeSpent, 
  shouldShowInstallPrompt, 
  getPersonalizedInstallMessage, 
  isPWAInstalled, 
  recordInstallDismissal, 
  getInstallPromptDelay,
  setupUserInteractionTracking,
  setupTimeTracking,
  type UserBehaviorMetrics 
} from '@/lib/analytics/user-behavior';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(isPWAInstalled);
  const [userMetrics, setUserMetrics] = useState<UserBehaviorMetrics>(loadUserMetrics);

  useEffect(() => {
    // Initialize PWA installation check
    setIsInstalled(isPWAInstalled());

    // Update page view metrics
    const updatedMetrics = updatePageViewMetrics();
    setUserMetrics(updatedMetrics);

    // Setup beforeinstallprompt event listener
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Use smart timing based on user behavior
      if (!isPWAInstalled() && shouldShowInstallPrompt(updatedMetrics)) {
        const delay = getInstallPromptDelay(updatedMetrics);
        setTimeout(() => {
          if (!isInstalled) {
            setShowPrompt(true);
            trackPWAEvents.installPromptShown();
          }
        }, delay);
      }
    };

    // Setup app installed event listener
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      trackPWAEvents.installAccepted();
    };

    // Setup user interaction tracking
    const cleanupInteractionTracking = setupUserInteractionTracking(() => {
      const updatedMetrics = trackUserInteraction();
      setUserMetrics(updatedMetrics);
    });

    // Setup time tracking
    const cleanupTimeTracking = setupTimeTracking((sessionTime) => {
      const updatedMetrics = trackTimeSpent(Date.now() - sessionTime);
      setUserMetrics(updatedMetrics);
    });

    // Add PWA event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      cleanupInteractionTracking();
      cleanupTimeTracking();
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      // Show the install prompt
      await deferredPrompt.prompt();
      
      // Wait for user choice
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA install accepted');
        trackPWAEvents.installAccepted();
      } else {
        console.log('PWA install dismissed by user');
        trackPWAEvents.installDismissed();
        // Record dismissal for smart timing
        recordInstallDismissal();
      }
    } catch (error) {
      console.error('PWA install error:', error);
      trackPWAEvents.installDismissed();
    } finally {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    trackPWAEvents.installDismissed();
    recordInstallDismissal();
  };

  // Don't show if already installed, dismissed this session, or conditions not met
  if (isInstalled || !showPrompt || sessionStorage.getItem('pwa-prompt-dismissed')) {
    return null;
  }

  // Generate personalized message based on user behavior
  const personalizedMessage = getPersonalizedInstallMessage(userMetrics);

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 animate-slide-up">
        <div className="flex items-start space-x-3">
          {/* App Icon with engagement indicator */}
          <div className="flex-shrink-0 relative">
            <img 
              src="/icons/icon-72x72.png" 
              alt="Citizenly" 
              className="w-12 h-12 rounded-lg"
            />
            {userMetrics.revisits >= 2 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {personalizedMessage.title}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {personalizedMessage.description}
            </p>
            
            {/* Engagement indicators */}
            {userMetrics.revisits >= 2 && (
              <div className="flex items-center space-x-1 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600 dark:text-green-400">Returning user</span>
              </div>
            )}
            
            {/* Buttons */}
            <div className="flex space-x-2 mt-3">
              <Button
                onClick={handleInstallClick}
                variant="primary"
                size="sm"
                className="text-xs px-3 py-1"
              >
                Install
              </Button>
              <Button
                onClick={handleDismiss}
                variant="neutral-outline"
                size="sm"
                className="text-xs px-3 py-1"
              >
                Not now
              </Button>
            </div>
          </div>
          
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Features */}
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Fast</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <span>Offline</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>Mobile</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}