/**
 * Select Dropdown Management Hook
 * Handles dropdown positioning, visibility, and scroll behavior
 */

import { useCallback, useEffect } from 'react';
import type { SelectOption } from '@/utils/ui/selectUtils';

export interface UseSelectDropdownProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  optionRefs: { current: (HTMLDivElement | null)[] };
  filteredOptions: SelectOption[];
  focusedIndex: number;
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
  setDropdownPosition: (position: 'below' | 'above') => void;
  setFocusedIndex: (index: number) => void;
}

export const useSelectDropdown = ({
  inputRef,
  dropdownRef,
  optionRefs,
  filteredOptions,
  focusedIndex,
  showDropdown,
  setShowDropdown,
  setDropdownPosition,
  setFocusedIndex,
}: UseSelectDropdownProps) => {
  // Calculate dropdown position based on available space
  const calculateDropdownPosition = useCallback(() => {
    if (!inputRef.current) return 'below';

    const inputRect = inputRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = 320; // max-h-80 = 320px

    const spaceBelow = viewportHeight - inputRect.bottom;
    const spaceAbove = inputRect.top;

    // If there's not enough space below but enough space above, show above
    if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
      return 'above';
    }

    return 'below';
  }, []);

  // Scroll focused option into view
  useEffect(() => {
    if (focusedIndex >= 0 && optionRefs.current[focusedIndex]) {
      optionRefs.current[focusedIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [focusedIndex]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(target);
      const isOutsideInput = inputRef.current && !inputRef.current.contains(target);

      if (isOutsideDropdown && isOutsideInput) {
        setShowDropdown(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowDropdown, setFocusedIndex]);

  // Update option refs array length when filtered options change
  useEffect(() => {
    if (showDropdown) {
      optionRefs.current = optionRefs.current.slice(0, Math.max(filteredOptions.length, 1));
    }
  }, [filteredOptions.length, showDropdown]);

  return {
    calculateDropdownPosition,
  };
};