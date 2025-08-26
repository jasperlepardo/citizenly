/**
 * User Behavior Analytics
 * Tracks user engagement patterns for PWA install prompts and general app usage
 */

export interface UserBehaviorMetrics {
  pageViews: number;
  timeSpent: number;
  interactions: number;
  revisits: number;
  lastVisit: number;
}

export interface PWAInstallCriteria {
  isReturningUser: boolean;
  hasInteracted: boolean;
  hasSpentTime: boolean;
  hasExplored: boolean;
}

export interface PersonalizedMessage {
  title: string;
  description: string;
}

const STORAGE_KEY = 'pwa-user-metrics';
const DISMISSAL_KEY = 'pwa-prompt-dismissed-date';
const SESSION_DISMISSAL_KEY = 'pwa-prompt-dismissed';

/**
 * Load user behavior metrics from localStorage
 */
export function loadUserMetrics(): UserBehaviorMetrics {
  if (typeof window === 'undefined') {
    return getDefaultMetrics();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load user metrics:', error);
  }
  return getDefaultMetrics();
}

/**
 * Save user behavior metrics to localStorage
 */
export function saveUserMetrics(metrics: UserBehaviorMetrics): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics));
  } catch (error) {
    console.warn('Failed to save user metrics:', error);
  }
}

/**
 * Get default user metrics
 */
export function getDefaultMetrics(): UserBehaviorMetrics {
  return {
    pageViews: 0,
    timeSpent: 0,
    interactions: 0,
    revisits: 0,
    lastVisit: 0,
  };
}

/**
 * Update user behavior metrics for a page view
 */
export function updatePageViewMetrics(): UserBehaviorMetrics {
  const metrics = loadUserMetrics();
  const now = Date.now();
  const isRevisit = metrics.lastVisit > 0 && now - metrics.lastVisit > 24 * 60 * 60 * 1000; // 24 hours

  const updatedMetrics = {
    pageViews: metrics.pageViews + 1,
    timeSpent: metrics.timeSpent,
    interactions: metrics.interactions,
    revisits: isRevisit ? metrics.revisits + 1 : metrics.revisits,
    lastVisit: now,
  };

  saveUserMetrics(updatedMetrics);
  return updatedMetrics;
}

/**
 * Update interaction count
 */
export function trackUserInteraction(): UserBehaviorMetrics {
  const metrics = loadUserMetrics();
  const updated = { ...metrics, interactions: metrics.interactions + 1 };
  saveUserMetrics(updated);
  return updated;
}

/**
 * Track time spent in session
 */
export function trackTimeSpent(sessionStartTime: number): UserBehaviorMetrics {
  const metrics = loadUserMetrics();
  const timeSpent = Date.now() - sessionStartTime;
  const updated = { ...metrics, timeSpent: metrics.timeSpent + timeSpent };
  saveUserMetrics(updated);
  return updated;
}

/**
 * Check if PWA install prompt should be shown based on user behavior
 */
export function shouldShowInstallPrompt(metrics: UserBehaviorMetrics): boolean {
  // Don't show if recently dismissed (within 7 days)
  if (typeof window !== 'undefined') {
    const dismissedDate = localStorage.getItem(DISMISSAL_KEY);
    if (dismissedDate) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedDate)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return false;
      }
    }

    // Don't show if dismissed in current session
    if (sessionStorage.getItem(SESSION_DISMISSAL_KEY)) {
      return false;
    }
  }

  // Smart timing criteria
  const criteria = getPWAInstallCriteria(metrics);

  // Must meet at least 2 of the 4 criteria
  const metCriteria = Object.values(criteria).filter(Boolean).length;
  return metCriteria >= 2;
}

/**
 * Get PWA install criteria for a user
 */
export function getPWAInstallCriteria(metrics: UserBehaviorMetrics): PWAInstallCriteria {
  return {
    // User has visited multiple times
    isReturningUser: metrics.revisits >= 2,
    // User has engaged with the app
    hasInteracted: metrics.interactions >= 5,
    // User has spent reasonable time
    hasSpentTime: metrics.timeSpent >= 60000, // 1 minute
    // Multiple page views indicate engagement
    hasExplored: metrics.pageViews >= 3,
  };
}

/**
 * Get personalized install message based on user behavior
 */
export function getPersonalizedInstallMessage(metrics: UserBehaviorMetrics): PersonalizedMessage {
  if (metrics.revisits >= 2) {
    return {
      title: 'Welcome back! Install Citizenly',
      description:
        "You've been using Citizenly regularly. Install it for faster access and offline use.",
    };
  }

  if (metrics.pageViews >= 5) {
    return {
      title: 'Enjoying Citizenly? Install it!',
      description: "You've explored multiple features. Get the full experience with our app.",
    };
  }

  if (metrics.timeSpent >= 120000) {
    // 2 minutes
    return {
      title: 'Install Citizenly for convenience',
      description:
        "You've spent quality time here. Install for quicker access and offline capabilities.",
    };
  }

  return {
    title: 'Install Citizenly',
    description: 'Add to your home screen for quick access and offline use',
  };
}

/**
 * Check if PWA is installed
 */
export function isPWAInstalled(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for standalone mode (Android/iOS)
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }

  // Check for iOS Safari standalone
  if ((window.navigator as any).standalone === true) {
    return true;
  }

  return false;
}

/**
 * Record install prompt dismissal
 */
export function recordInstallDismissal(): void {
  if (typeof window === 'undefined') return;

  // Store dismissal date for smart timing (7 days cooldown)
  localStorage.setItem(DISMISSAL_KEY, Date.now().toString());

  // Also set session storage for immediate dismissal
  sessionStorage.setItem(SESSION_DISMISSAL_KEY, 'true');
}

/**
 * Get delay for install prompt based on user behavior
 */
export function getInstallPromptDelay(metrics: UserBehaviorMetrics): number {
  // Shorter delay for returning users
  return metrics.revisits > 0 ? 2000 : 5000;
}

/**
 * Setup user interaction tracking listeners
 */
export function setupUserInteractionTracking(onInteraction: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  // Track user interactions
  const trackInteraction = () => onInteraction();

  window.addEventListener('click', trackInteraction);
  window.addEventListener('scroll', trackInteraction);
  window.addEventListener('keydown', trackInteraction);

  // Return cleanup function
  return () => {
    window.removeEventListener('click', trackInteraction);
    window.removeEventListener('scroll', trackInteraction);
    window.removeEventListener('keydown', trackInteraction);
  };
}

/**
 * Setup time tracking for a session
 */
export function setupTimeTracking(onTimeUpdate: (sessionTime: number) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const sessionStart = Date.now();

  const trackTime = () => {
    const sessionTime = Date.now() - sessionStart;
    onTimeUpdate(sessionTime);
  };

  // Track time on beforeunload
  window.addEventListener('beforeunload', trackTime);

  // Return cleanup function that also tracks final time
  return () => {
    window.removeEventListener('beforeunload', trackTime);
    trackTime(); // Track time when cleanup is called
  };
}
