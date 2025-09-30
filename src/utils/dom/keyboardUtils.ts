/**
 * Keyboard Utilities
 * Provides keyboard event handling utilities.
 */

import { useEffect } from 'react';

/**
 * Hook for command menu keyboard shortcut
 */
export function useCommandMenuShortcut(onToggle: () => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd/Ctrl + K to toggle command menu
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        onToggle();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onToggle]);
}

/**
 * Create dropdown key handler
 * Supports both simple callback and advanced dropdown navigation
 */
export function createDropdownKeyHandler(
  options:
    | (() => void) // Simple callback for basic dropdowns
    | {
        isOpen: boolean;
        selectedIndex: number;
        itemCount: number;
        onOpen: () => void;
        onClose: () => void;
        onSelect: (index: number) => void;
        onNavigate: (index: number) => void;
        searchable?: boolean; // New flag to indicate if this is a searchable input
      } // Advanced options for Select component
) {
  return (event: React.KeyboardEvent) => {
    // Simple callback version (backward compatibility)
    if (typeof options === 'function') {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        options();
      }
      return;
    }

    // Advanced dropdown navigation
    const { isOpen, selectedIndex, itemCount, onOpen, onClose, onSelect, onNavigate, searchable = false } = options;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          onOpen();
        } else if (itemCount > 0) {
          const nextIndex = selectedIndex < itemCount - 1 ? selectedIndex + 1 : 0;
          onNavigate(nextIndex);
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          onOpen();
        } else if (itemCount > 0) {
          const prevIndex = selectedIndex > 0 ? selectedIndex - 1 : itemCount - 1;
          onNavigate(prevIndex);
        }
        break;

      case 'Enter':
        event.preventDefault();
        if (isOpen && selectedIndex >= 0) {
          onSelect(selectedIndex);
        } else {
          onOpen();
        }
        break;

      case ' ':
        // For searchable inputs: only prevent spacebar if explicitly navigating to an option
        // For non-searchable inputs: use traditional dropdown behavior
        if (searchable) {
          // Searchable input: only prevent spacebar if user has navigated to an option
          if (isOpen && selectedIndex >= 0) {
            event.preventDefault();
            onSelect(selectedIndex);
          }
          // Otherwise allow spacebar for typing in searchable inputs
        } else {
          // Non-searchable input: traditional dropdown behavior
          if (isOpen && selectedIndex >= 0) {
            event.preventDefault();
            onSelect(selectedIndex);
          } else if (!isOpen) {
            event.preventDefault();
            onOpen();
          }
        }
        break;

      case 'Escape':
        event.preventDefault();
        if (isOpen) {
          onClose();
        }
        break;

      case 'Home':
        event.preventDefault();
        if (isOpen && itemCount > 0) {
          onNavigate(0);
        }
        break;

      case 'End':
        event.preventDefault();
        if (isOpen && itemCount > 0) {
          onNavigate(itemCount - 1);
        }
        break;

      case 'Tab':
        // Don't prevent Tab - let natural focus management work
        // Just close the dropdown when tabbing away
        if (isOpen) {
          onClose();
        }
        break;
    }
  };
}

/**
 * Create search key handler
 */
export function createSearchKeyHandler(options: {
  onSearch?: (value: string) => void;
  onClear?: () => void;
  onEscape?: () => void;
  currentValue?: string;
  preventDefault?: boolean;
}) {
  return (event: React.KeyboardEvent<HTMLInputElement>) => {
    const { onSearch, onClear, onEscape, currentValue = '', preventDefault = false } = options;
    
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
        break;
    }
  };
}