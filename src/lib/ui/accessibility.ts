"use client";

/**
 * Accessibility Utilities
 * Helper functions and hooks for improving accessibility
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * Focus trap hook for modals and dialogs
 * Keeps focus within a container element
 */
export function useFocusTrap(isActive: boolean = false) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store the currently focused element
    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    // Get all focusable elements within the container
    const getFocusableElements = () => {
      if (!containerRef.current) return [];

      const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(',');

      return Array.from(
        containerRef.current.querySelectorAll<HTMLElement>(focusableSelectors)
      ).filter(el => el.offsetParent !== null); // Filter out hidden elements
    };

    // Focus the first focusable element
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Handle Tab key navigation
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift+Tab on first element -> focus last element
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
      // Tab on last element -> focus first element
      else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // Restore focus to the previously focused element
      if (previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Keyboard navigation hook for lists and grids
 * Supports arrow key navigation
 */
export function useArrowKeyNavigation(itemsCount: number, onSelect?: (index: number) => void) {
  const currentIndex = useRef(0);
  const containerRef = useRef<HTMLElement>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!containerRef.current) return;

      const items = Array.from(
        containerRef.current.querySelectorAll('[role="option"], [role="menuitem"], [role="tab"]')
      ) as HTMLElement[];

      if (items.length === 0) return;

      let nextIndex = currentIndex.current;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          nextIndex = Math.min(currentIndex.current + 1, items.length - 1);
          break;
        case 'ArrowUp':
          event.preventDefault();
          nextIndex = Math.max(currentIndex.current - 1, 0);
          break;
        case 'Home':
          event.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          event.preventDefault();
          nextIndex = items.length - 1;
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (onSelect) {
            onSelect(currentIndex.current);
          }
          break;
        default:
          return;
      }

      if (nextIndex !== currentIndex.current) {
        currentIndex.current = nextIndex;
        items[nextIndex]?.focus();
      }
    },
    [onSelect]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return containerRef;
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove the announcement after it's been read
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Generate unique IDs for form elements
 */
export function useUniqueId(prefix: string = 'id'): string {
  const idRef = useRef<string | undefined>(undefined);

  if (!idRef.current) {
    idRef.current = `${prefix}-${Math.random().toString(36).substring(2, 11)}`;
  }

  return idRef.current;
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
}

/**
 * Get appropriate transition duration based on motion preference
 */
export function getTransitionDuration(
  defaultDuration: number = 300,
  reducedDuration: number = 0
): number {
  return prefersReducedMotion() ? reducedDuration : defaultDuration;
}

/**
 * ARIA attribute helpers
 */
export const aria = {
  // Set aria-expanded attribute
  expanded: (isExpanded: boolean) => ({
    'aria-expanded': isExpanded,
  }),

  // Set aria-selected attribute
  selected: (isSelected: boolean) => ({
    'aria-selected': isSelected,
  }),

  // Set aria-checked attribute
  checked: (isChecked: boolean | 'mixed') => ({
    'aria-checked': isChecked,
  }),

  // Set aria-current attribute
  current: (isCurrent: boolean | 'page' | 'step' | 'location' | 'date' | 'time') => ({
    'aria-current': isCurrent || undefined,
  }),

  // Set aria-disabled attribute
  disabled: (isDisabled: boolean) => ({
    'aria-disabled': isDisabled,
  }),

  // Set aria-invalid attribute
  invalid: (isInvalid: boolean) => ({
    'aria-invalid': isInvalid || undefined,
  }),

  // Set aria-describedby attribute
  describedBy: (...ids: (string | undefined)[]) => {
    const validIds = ids.filter(Boolean).join(' ');
    return validIds ? { 'aria-describedby': validIds } : {};
  },

  // Set aria-labelledby attribute
  labelledBy: (...ids: (string | undefined)[]) => {
    const validIds = ids.filter(Boolean).join(' ');
    return validIds ? { 'aria-labelledby': validIds } : {};
  },
};

/**
 * Semantic HTML helpers
 */
export const semantic = {
  // Button or link decision helper
  buttonOrLink: (href?: string) => {
    if (href) {
      return { as: 'a', href } as const;
    }
    return { as: 'button', type: 'button' } as const;
  },

  // Heading level helper
  heading: (level: 1 | 2 | 3 | 4 | 5 | 6) => {
    return `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  },
};

/**
 * Keyboard event helpers
 */
export const keyboard = {
  // Check if Enter or Space key
  isActionKey: (event: React.KeyboardEvent): boolean => {
    return event.key === 'Enter' || event.key === ' ';
  },

  // Check if Escape key
  isEscapeKey: (event: React.KeyboardEvent): boolean => {
    return event.key === 'Escape';
  },

  // Check if Tab key
  isTabKey: (event: React.KeyboardEvent): boolean => {
    return event.key === 'Tab';
  },

  // Check if arrow key
  isArrowKey: (event: React.KeyboardEvent): boolean => {
    return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key);
  },

  // Prevent default for specific keys
  preventDefaultForKeys: (keys: string[]) => {
    return (event: React.KeyboardEvent) => {
      if (keys.includes(event.key)) {
        event.preventDefault();
      }
    };
  },
};

/**
 * Screen reader only text component helper
 */
export function visuallyHidden(): React.CSSProperties {
  return {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  };
}
