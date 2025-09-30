/**
 * Select State Management Hook
 * Manages all state for the Select component
 */

import { useState, useRef } from 'react';

import type { SelectOption } from '@/utils/ui/selectUtils';

export interface UseSelectStateProps {
  value?: string;
  options?: SelectOption[];
  enumData?: Record<string, string> | SelectOption[];
}

export const useSelectState = ({ value, options = [], enumData }: UseSelectStateProps) => {
  // Core state
  const [inputValue, setInputValue] = useState('');
  const [normalizedOptions, setNormalizedOptions] = useState<SelectOption[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<SelectOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<SelectOption | null>(null);

  // UI state
  const [showDropdown, setShowDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState<'below' | 'above'>('below');
  const [justSelected, setJustSelected] = useState(false);

  // Creation state
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Refs
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lastSearchRef = useRef<string>('');

  return {
    // State
    inputValue,
    setInputValue,
    normalizedOptions,
    setNormalizedOptions,
    filteredOptions,
    setFilteredOptions,
    selectedOption,
    setSelectedOption,
    showDropdown,
    setShowDropdown,
    focusedIndex,
    setFocusedIndex,
    dropdownPosition,
    setDropdownPosition,
    justSelected,
    setJustSelected,
    isCreating,
    setIsCreating,
    createError,
    setCreateError,

    // Refs
    debounceTimerRef,
    inputRef,
    dropdownRef,
    optionRefs,
    lastSearchRef,
  };
};