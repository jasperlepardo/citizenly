/**
 * Consolidated Keyboard Event Handling Utilities
 * 
 * @fileoverview Eliminates duplicate handleKeyDown patterns across UI components.
 * Provides standardized keyboard interaction handlers for dropdowns, search,
 * and global shortcuts with proper event handling and accessibility support.
 * 
 * @version 1.0.0
 * @since 2025-08-29
 * @author Citizenly Development Team
 */

'use client';

import { useEffect, useCallback } from 'react';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Base keyboard event handler type
 */
export type KeyboardEventHandler = (event: KeyboardEvent | React.KeyboardEvent) => void;

/**
 * Key combination configuration
 */
export interface KeyCombination {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
}

/**
 * Dropdown navigation options
 */
export interface DropdownKeyboardOptions {
  isOpen: boolean;
  selectedIndex: number;
  itemCount: number;
  onOpen?: () => void;
  onClose?: () => void;
  onSelect?: (index: number) => void;
  onNavigate?: (index: number) => void;
  preventDefault?: boolean;
}

/**
 * Search keyboard options
 */
export interface SearchKeyboardOptions {
  onSearch?: (query: string) => void;
  onClear?: () => void;
  onEscape?: () => void;
  currentValue?: string;
  preventDefault?: boolean;
}

/**
 * Global shortcut options
 */
export interface GlobalShortcutOptions {
  enabled?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

// =============================================================================
// KEYBOARD UTILITIES
// =============================================================================

/**
 * Checks if a key combination matches the current event
 */
export function matchesKeyCombination(
  event: KeyboardEvent | React.KeyboardEvent,
  combination: KeyCombination
): boolean {
  return (
    event.key === combination.key &&
    !!event.ctrlKey === !!combination.ctrlKey &&
    !!event.metaKey === !!combination.metaKey &&
    !!event.shiftKey === !!combination.shiftKey &&
    !!event.altKey === !!combination.altKey
  );
}

/**
 * Creates a standardized dropdown navigation handler
 * Consolidates arrow key navigation, Enter selection, and Escape closing
 */
export function createDropdownKeyHandler(options: DropdownKeyboardOptions): KeyboardEventHandler {
  return (event: KeyboardEvent | React.KeyboardEvent) => {
    const {
      isOpen,
      selectedIndex,
      itemCount,
      onOpen,
      onClose,
      onSelect,
      onNavigate,
      preventDefault = true
    } = options;

    switch (event.key) {
      case 'ArrowDown':
        if (preventDefault) event.preventDefault();
        if (!isOpen && onOpen) {
          onOpen();
        } else if (isOpen && onNavigate) {
          const nextIndex = selectedIndex < itemCount - 1 ? selectedIndex + 1 : 0;
          onNavigate(nextIndex);
        }
        break;

      case 'ArrowUp':
        if (preventDefault) event.preventDefault();
        if (isOpen && onNavigate) {
          const prevIndex = selectedIndex > 0 ? selectedIndex - 1 : itemCount - 1;
          onNavigate(prevIndex);
        }
        break;

      case 'Enter':
        if (preventDefault) event.preventDefault();
        if (isOpen && onSelect && selectedIndex >= 0) {
          onSelect(selectedIndex);
        } else if (!isOpen && onOpen) {
          onOpen();
        }
        break;

      case 'Escape':
        if (preventDefault) event.preventDefault();
        if (isOpen && onClose) {
          onClose();
        }
        break;

      case ' ': // Space key
        if (preventDefault) event.preventDefault();
        if (!isOpen && onOpen) {
          onOpen();
        }
        break;
    }
  };
}

/**
 * Creates a standardized search input handler
 * Consolidates Enter search, Escape clear/blur, and input validation
 */
export function createSearchKeyHandler(options: SearchKeyboardOptions): KeyboardEventHandler {
  return (event: KeyboardEvent | React.KeyboardEvent) => {
    const {
      onSearch,
      onClear,
      onEscape,
      currentValue = '',
      preventDefault = false
    } = options;

    switch (event.key) {
      case 'Enter':
        if (preventDefault) event.preventDefault();
        if (onSearch && currentValue.trim()) {
          onSearch(currentValue.trim());
        }
        break;

      case 'Escape':
        if (preventDefault) event.preventDefault();
        if (currentValue && onClear) {
          onClear();
        } else if (onEscape) {
          onEscape();
        }
        // Blur the input if it's focused
        if (event.target instanceof HTMLElement) {
          event.target.blur();
        }
        break;
    }
  };
}

/**
 * Creates a global keyboard shortcut handler
 * Consolidates Cmd/Ctrl+Key combinations with proper platform detection
 */
export function createGlobalShortcutHandler(
  combinations: Array<{ combination: KeyCombination; handler: () => void }>,
  options: GlobalShortcutOptions = {}
): KeyboardEventHandler {
  const { enabled = true, preventDefault = true, stopPropagation = true } = options;

  return (event: KeyboardEvent | React.KeyboardEvent) => {
    if (!enabled) return;

    for (const { combination, handler } of combinations) {
      if (matchesKeyCombination(event, combination)) {
        if (preventDefault) event.preventDefault();
        if (stopPropagation) event.stopPropagation();
        handler();
        break;
      }
    }
  };
}

// =============================================================================
// REACT HOOKS
// =============================================================================

/**
 * Hook for global keyboard shortcuts
 * Consolidates document-level keyboard event handling
 */
export function useGlobalKeyboard(
  combinations: Array<{ combination: KeyCombination; handler: () => void }>,
  options: GlobalShortcutOptions = {}
) {
  const { enabled = true } = options;

  const handleKeyDown = useCallback(
    createGlobalShortcutHandler(combinations, options),
    [combinations, options]
  );

  useEffect(() => {
    if (!enabled) return;

    const handleEvent = (event: KeyboardEvent) => {
      handleKeyDown(event);
    };

    document.addEventListener('keydown', handleEvent);
    return () => document.removeEventListener('keydown', handleEvent);
  }, [handleKeyDown, enabled]);
}

/**
 * Hook for command menu keyboard shortcuts
 * Standardized Cmd/Ctrl+K pattern with platform detection
 */
export function useCommandMenuShortcut(
  onToggle: () => void,
  enabled: boolean = true
) {
  const combinations = [
    {
      combination: { key: 'k', metaKey: true } as KeyCombination, // Mac: Cmd+K
      handler: onToggle
    },
    {
      combination: { key: 'k', ctrlKey: true } as KeyCombination, // Windows/Linux: Ctrl+K
      handler: onToggle
    }
  ];

  useGlobalKeyboard(combinations, { enabled });
}

// =============================================================================
// ACCESSIBILITY HELPERS
// =============================================================================

/**
 * ARIA keyboard handler for custom interactive elements
 * Ensures proper accessibility for keyboard navigation
 */
export function createAriaKeyHandler(
  element: HTMLElement | null,
  options: {
    role?: string;
    onActivate?: () => void;
    onEscape?: () => void;
    allowEnterActivation?: boolean;
    allowSpaceActivation?: boolean;
  } = {}
): KeyboardEventHandler {
  const {
    onActivate,
    onEscape,
    allowEnterActivation = true,
    allowSpaceActivation = true
  } = options;

  return (event: KeyboardEvent | React.KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
        if (allowEnterActivation && onActivate) {
          event.preventDefault();
          onActivate();
        }
        break;

      case ' ':
        if (allowSpaceActivation && onActivate) {
          event.preventDefault();
          onActivate();
        }
        break;

      case 'Escape':
        if (onEscape) {
          event.preventDefault();
          onEscape();
        }
        break;
    }
  };
}

// =============================================================================
// COMMON KEY COMBINATIONS
// =============================================================================

/**
 * Pre-defined key combinations for common shortcuts
 */
export const COMMON_SHORTCUTS = {
  COMMAND_PALETTE: [
    { key: 'k', metaKey: true },
    { key: 'k', ctrlKey: true }
  ] as KeyCombination[],

  SEARCH: [
    { key: '/', ctrlKey: false, metaKey: false },
    { key: 'f', ctrlKey: true },
    { key: 'f', metaKey: true }
  ] as KeyCombination[],

  ESCAPE: [
    { key: 'Escape' }
  ] as KeyCombination[],

  SAVE: [
    { key: 's', ctrlKey: true },
    { key: 's', metaKey: true }
  ] as KeyCombination[]
} as const;

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validates keyboard event target for input safety
 */
export function isValidKeyboardTarget(event: KeyboardEvent | React.KeyboardEvent): boolean {
  const target = event.target as HTMLElement;
  if (!target) return false;

  // Don't interfere with form inputs unless explicitly handled
  const tagName = target.tagName.toLowerCase();
  const isInput = ['input', 'textarea', 'select'].includes(tagName);
  const isContentEditable = target.contentEditable === 'true';

  return !(isInput || isContentEditable);
}

/**
 * Platform detection for keyboard shortcuts
 */
export const PLATFORM = {
  isMac: typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform),
  isWindows: typeof window !== 'undefined' && /Win/.test(navigator.platform),
  modifierKey: typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? 'metaKey' : 'ctrlKey'
} as const;