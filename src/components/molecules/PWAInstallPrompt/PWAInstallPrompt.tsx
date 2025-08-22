'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/atoms';
import { trackPWAEvents } from '@/lib/performance/pwaPerformanceUtils';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface UserBehaviorMetrics {
  pageViews: number;
  timeSpent: number;
  interactions: number;
  revisits: number;
  lastVisit: number;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [userMetrics, setUserMetrics] = useState<UserBehaviorMetrics>({
    pageViews: 0,
    timeSpent: 0,
    interactions: 0,
    revisits: 0,
    lastVisit: 0,
  });

  useEffect(() => {
    // Load user behavior metrics
    const loadUserMetrics = (): UserBehaviorMetrics => {
      try {
        const stored = localStorage.getItem('pwa-user-metrics');
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (error) {
        console.warn('Failed to load user metrics:', error);
      }
      return {
        pageViews: 0,
        timeSpent: 0,
        interactions: 0,
        revisits: 0,
        lastVisit: 0,
      };
    };

    // Save user behavior metrics
    const saveUserMetrics = (metrics: UserBehaviorMetrics) => {
      try {
        localStorage.setItem('pwa-user-metrics', JSON.stringify(metrics));
      } catch (error) {
        console.warn('Failed to save user metrics:', error);
      }
    };

    // Check if PWA is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return true;
      }
      
      if ((window.navigator as any).standalone === true) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    // Update user behavior metrics
    const updateUserMetrics = () => {
      const metrics = loadUserMetrics();
      const now = Date.now();
      const isRevisit = metrics.lastVisit > 0 && (now - metrics.lastVisit > 24 * 60 * 60 * 1000); // 24 hours

      const updatedMetrics = {
        pageViews: metrics.pageViews + 1,
        timeSpent: metrics.timeSpent,
        interactions: metrics.interactions,
        revisits: isRevisit ? metrics.revisits + 1 : metrics.revisits,
        lastVisit: now,
      };

      setUserMetrics(updatedMetrics);
      saveUserMetrics(updatedMetrics);
    };

    // Check install eligibility based on user behavior
    const shouldShowInstallPrompt = (metrics: UserBehaviorMetrics): boolean => {
      // Don't show if recently dismissed (within 7 days)
      const dismissedDate = localStorage.getItem('pwa-prompt-dismissed-date');
      if (dismissedDate) {
        const daysSinceDismissed = (Date.now() - parseInt(dismissedDate)) / (1000 * 60 * 60 * 24);
        if (daysSinceDismissed < 7) {
          return false;
        }
      }

      // Smart timing criteria
      const criteria = {
        // User has visited multiple times
        isReturningUser: metrics.revisits >= 2,
        // User has engaged with the app
        hasInteracted: metrics.interactions >= 5,
        // User has spent reasonable time
        hasSpentTime: metrics.timeSpent >= 60000, // 1 minute
        // Multiple page views indicate engagement
        hasExplored: metrics.pageViews >= 3,
      };

      // Must meet at least 2 of the 4 criteria
      const metCriteria = Object.values(criteria).filter(Boolean).length;
      return metCriteria >= 2;
    };

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Use smart timing instead of fixed delay
      const metrics = loadUserMetrics();
      if (!checkIfInstalled() && shouldShowInstallPrompt(metrics)) {
        // Show prompt with intelligent delay based on user behavior
        const delay = metrics.revisits > 0 ? 2000 : 5000; // Shorter delay for returning users
        setTimeout(() => {
          if (!isInstalled) {
            setShowPrompt(true);
            trackPWAEvents.installPromptShown();
          }
        }, delay);
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      trackPWAEvents.installAccepted();
    };

    // Track user interactions
    const trackUserInteraction = () => {
      setUserMetrics(prev => {
        const updated = { ...prev, interactions: prev.interactions + 1 };
        saveUserMetrics(updated);
        return updated;
      });
    };

    // Track time spent
    const sessionStart = Date.now();
    const trackTimeSpent = () => {
      const timeSpent = Date.now() - sessionStart;
      setUserMetrics(prev => {
        const updated = { ...prev, timeSpent: prev.timeSpent + timeSpent };
        saveUserMetrics(updated);
        return updated;
      });
    };

    // Initialize
    checkIfInstalled();
    updateUserMetrics();
    
    // Event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    // Track interactions
    window.addEventListener('click', trackUserInteraction);
    window.addEventListener('scroll', trackUserInteraction);
    window.addEventListener('keydown', trackUserInteraction);
    
    // Track time on beforeunload
    window.addEventListener('beforeunload', trackTimeSpent);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('click', trackUserInteraction);
      window.removeEventListener('scroll', trackUserInteraction);
      window.removeEventListener('keydown', trackUserInteraction);
      window.removeEventListener('beforeunload', trackTimeSpent);
      trackTimeSpent(); // Track time when component unmounts
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
        // Store dismissal date for smart timing
        localStorage.setItem('pwa-prompt-dismissed-date', Date.now().toString());
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
    
    // Store dismissal date for smart timing (7 days cooldown)
    localStorage.setItem('pwa-prompt-dismissed-date', Date.now().toString());
    
    // Also set session storage for immediate dismissal
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Don't show if already installed, dismissed this session, or conditions not met
  if (isInstalled || !showPrompt || sessionStorage.getItem('pwa-prompt-dismissed')) {
    return null;
  }

  // Generate personalized message based on user behavior
  const getPersonalizedMessage = () => {
    if (userMetrics.revisits >= 2) {
      return {
        title: "Welcome back! Install Citizenly",
        description: "You've been using Citizenly regularly. Install it for faster access and offline use."
      };
    }
    
    if (userMetrics.pageViews >= 5) {
      return {
        title: "Enjoying Citizenly? Install it!",
        description: "You've explored multiple features. Get the full experience with our app."
      };
    }
    
    if (userMetrics.timeSpent >= 120000) { // 2 minutes
      return {
        title: "Install Citizenly for convenience",
        description: "You've spent quality time here. Install for quicker access and offline capabilities."
      };
    }

    return {
      title: "Install Citizenly",
      description: "Add to your home screen for quick access and offline use"
    };
  };

  const personalizedMessage = getPersonalizedMessage();

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