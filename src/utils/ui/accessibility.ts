/**
 * Accessibility Utilities
 * Helper functions and hooks for accessibility features
 */

import { useEffect, useRef } from 'react';

/**
 * Hook for focus trapping within a modal or dialog
 * @param isActive Whether the focus trap should be active
 * @returns Ref to attach to the container element
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    
    // Get all focusable elements
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusableElement = focusableElements[0] as HTMLElement;
    const lastFocusableElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    // Focus the first element when activated
    if (firstFocusableElement) {
      firstFocusableElement.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstFocusableElement) {
            e.preventDefault();
            lastFocusableElement?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastFocusableElement) {
            e.preventDefault();
            firstFocusableElement?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Announce a message to screen readers
 * @param message The message to announce
 * @param priority The announcement priority ('polite' or 'assertive')
 */
export function announceToScreenReader(
  message: string, 
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const announcer = document.createElement('div');
  announcer.setAttribute('aria-live', priority);
  announcer.setAttribute('aria-atomic', 'true');
  announcer.style.position = 'absolute';
  announcer.style.left = '-10000px';
  announcer.style.width = '1px';
  announcer.style.height = '1px';
  announcer.style.overflow = 'hidden';
  
  document.body.appendChild(announcer);
  
  // Small delay to ensure screen readers pick up the announcement
  setTimeout(() => {
    announcer.textContent = message;
    
    // Remove the announcer after announcement
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  }, 100);
}