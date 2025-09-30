/**
 * Enhanced Select Component
 * Modular, maintainable Select component using custom hooks and utilities
 *
 * ACCESSIBILITY NOTE: This component implements a custom combobox pattern using ARIA
 * instead of native HTML elements (<select>, <input list>) because it provides:
 * - API-driven search with debouncing
 * - Infinite scrolling and lazy loading
 * - Custom option creation
 * - Rich option rendering (descriptions, badges)
 * - Advanced keyboard navigation
 * - Server-side filtering
 *
 * The component follows WAI-ARIA 1.2 combobox pattern with proper:
 * - Role attributes (combobox, listbox, option)
 * - ARIA states (expanded, selected, activedescendant)
 * - Keyboard navigation (Arrow keys, Enter, Escape, Tab)
 * - Screen reader support with proper labeling
 */

'use client';

import React, { useEffect, useCallback, useMemo, memo } from 'react';

// Types
import type { SelectProps } from '@/types/app/ui/select';

// Utilities
import {
  normalizeOptions,
  filterStaticOptions,
  handleInputChangeLogic,
  handleStaticDataFocus,
  handleApiDataFocus,
  handleDropdownToggle,
  type SelectOption,
} from '@/utils/ui/selectUtils';
import { renderLoadMoreSection, renderEmptyState } from '@/utils/ui/selectRenderUtils';

// Hooks
import { useSelectState } from '@/hooks/ui/useSelectState';
import { useSelectDropdown } from '@/hooks/ui/useSelectDropdown';
import { useSelectKeyboard } from '@/hooks/ui/useSelectKeyboard';

// Components
import { Input } from '@/components/atoms/Field/Input/Input';
import { Option } from './Option/Option';

const SelectComponent: React.FC<SelectProps> = ({
  value,
  onSelect,
  placeholder = 'Select an option...',
  className = '',
  error,
  options = [],
  enumData,
  name,
  id,
  disabled = false,
  searchable = true,
  allowCustom = false,
  allowCreate = false,
  onCreateNew,
  onSearch,
  loading = false,
  hasMore = false,
  onLoadMore,
  loadingMore = false,
  infiniteScroll = true,
}) => {
  // Initialize state using custom hook
  const state = useSelectState({ value, options, enumData });

  const {
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
    debounceTimerRef,
    inputRef,
    dropdownRef,
    optionRefs,
    lastSearchRef,
  } = state;

  // Initialize dropdown management using custom hook
  const { calculateDropdownPosition } = useSelectDropdown({
    inputRef,
    dropdownRef,
    optionRefs,
    filteredOptions,
    focusedIndex,
    showDropdown,
    setShowDropdown,
    setDropdownPosition,
    setFocusedIndex,
  });

  // Generate unique IDs for form elements (memoized)
  const inputId = useMemo(() => id || 'select-field', [id]);

  // Handle option selection from dropdown (optimized dependencies)
  const handleOptionSelect = useCallback((option: SelectOption) => {
    if (option.disabled) return;

    setSelectedOption(option);
    setInputValue(option.label);
    setShowDropdown(false);
    setFocusedIndex(-1);
    setJustSelected(true);

    // Always reset filtering for static data after selection
    if (!onSearch && normalizedOptions.length > 0) {
      setFilteredOptions(normalizedOptions);
    }

    onSelect(option);

    // Blur the input after selection
    inputRef.current?.blur();

    // Reset the justSelected flag after a delay
    setTimeout(() => setJustSelected(false), 300);
  }, [onSearch, onSelect, normalizedOptions]);

  // Initialize keyboard navigation using custom hook
  const { handleKeyDown } = useSelectKeyboard({
    showDropdown,
    focusedIndex,
    filteredOptions,
    normalizedOptions,
    selectedOption,
    searchable,
    onSearch,
    setShowDropdown,
    setDropdownPosition,
    setFocusedIndex,
    setJustSelected,
    setFilteredOptions,
    calculateDropdownPosition,
    handleOptionSelect,
    inputRef,
  });

  // Normalize and set options (for static data)
  useEffect(() => {
    if (enumData || options.length > 0) {
      const normalized = normalizeOptions(enumData || options);
      setNormalizedOptions(normalized);
    }
  }, [options, enumData, setNormalizedOptions]);

  // Debounced search (handles both static and API)
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (onSearch) {
      // API-driven search with debounce
      const timer = setTimeout(() => {
        const shouldSearch = inputValue?.trim() && inputValue.length >= 2 && lastSearchRef.current !== inputValue;
        if (shouldSearch) {
          lastSearchRef.current = inputValue;
          onSearch(inputValue);
        } else if (!enumData && (inputValue?.trim()?.length ?? 0) < 2) {
          setFilteredOptions([]);
        }
      }, 300);
      debounceTimerRef.current = timer;
    }

    if (!onSearch) {
      // Static data filtering - immediate for better UX
      if (!inputValue.trim() || !searchable) {
        setFocusedIndex(-1);
      } else {
        const filtered = filterStaticOptions(normalizedOptions, inputValue, searchable);
        setFilteredOptions(filtered);
        setFocusedIndex(filtered.length > 0 ? 0 : -1);
      }
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputValue, onSearch, normalizedOptions, searchable, enumData, setFilteredOptions, setFocusedIndex]);

  // Memoized expensive computations
  const shouldShowCreateButton = useMemo(() =>
    allowCreate && inputValue.trim() && !filteredOptions.some(opt =>
      opt.label.toLowerCase() === inputValue.toLowerCase()
    ), [allowCreate, inputValue, filteredOptions]);

  const shouldShowCreateNoResults = useMemo(() =>
    allowCreate && inputValue.trim(), [allowCreate, inputValue]);

  const dropdownClasses = useMemo(() =>
    `absolute right-0 left-0 z-50 max-h-60 overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg sm:max-h-80 dark:border-gray-600 dark:bg-gray-800 ${
      dropdownPosition === 'above' ? 'bottom-full mb-1' : 'top-full mt-1'
    }`, [dropdownPosition]);

  // Show dropdown only on explicit user interaction
  useEffect(() => {
    if (justSelected) {
      setShowDropdown(false);
      return;
    }

    // For typing behavior: only show when user has typed enough characters
    if (inputValue && inputValue.trim().length > 0 && !(selectedOption && inputValue === selectedOption.label)) {
      const shouldShow = onSearch
        ? true // For API search: always show when user is typing
        : filteredOptions.length > 0; // For static data: only show if there are options

      if (shouldShow) {
        setShowDropdown(true);
        setDropdownPosition(calculateDropdownPosition());
        optionRefs.current = optionRefs.current.slice(0, Math.max(filteredOptions.length, 1));
      } else {
        setShowDropdown(false);
      }
    }
  }, [
    filteredOptions,
    inputValue,
    calculateDropdownPosition,
    onSearch,
    justSelected,
    selectedOption,
    setShowDropdown,
    setDropdownPosition,
  ]);

  // Handle input changes (optimized dependencies)
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const query = e.target.value;
    setInputValue(query);

    // Always show dropdown when user starts typing
    setShowDropdown(true);
    setDropdownPosition(calculateDropdownPosition());
    setFocusedIndex(-1);
    setJustSelected(false);

    const { shouldClearSelection, matchingOption, customOption } = handleInputChangeLogic(
      query,
      selectedOption,
      normalizedOptions,
      allowCustom,
      onSearch
    );

    if (shouldClearSelection) {
      setSelectedOption(null);
      onSelect(null);
    }

    if (matchingOption && query === matchingOption.label) {
      setSelectedOption(matchingOption);
      onSelect(matchingOption);
    } else if (!query.trim() && !onSearch) {
      setSelectedOption(null);
      onSelect(null);
      setShowDropdown(false);
    } else if (customOption) {
      setSelectedOption(customOption);
      onSelect(customOption);
    }
  }, [selectedOption, normalizedOptions, allowCustom, onSearch, onSelect, calculateDropdownPosition]);

  // Handle input focus (optimized dependencies)
  const handleInputFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (!disabled) {
      setJustSelected(false);

      if (!onSearch && normalizedOptions.length > 0) {
        const { filteredOptions: focusOptions, focusedIndex: focusIndex } =
          handleStaticDataFocus(normalizedOptions, selectedOption);
        setFilteredOptions(focusOptions);
        setShowDropdown(true);
        setDropdownPosition(calculateDropdownPosition());
        setFocusedIndex(focusIndex);
      }

      if (onSearch) {
        const { showDropdown: shouldShow, focusedIndex: focusIndex } = handleApiDataFocus();
        setShowDropdown(shouldShow);
        setDropdownPosition(calculateDropdownPosition());
        setFocusedIndex(focusIndex);
      }
    }
  }, [disabled, onSearch, normalizedOptions, selectedOption, calculateDropdownPosition]);

  // Handle input blur
  const handleInputBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const relatedTarget = e.relatedTarget as Node | null;
    const isMovingToDropdown = relatedTarget && dropdownRef.current?.contains(relatedTarget);

    if (isMovingToDropdown) {
      return;
    }

    if (!relatedTarget || !dropdownRef.current?.contains(relatedTarget)) {
      setShowDropdown(false);
      setFocusedIndex(-1);
      return;
    }

    setTimeout(() => {
      const activeElement = document.activeElement;
      const isWithinThisComponent =
        dropdownRef.current?.contains(activeElement) ||
        inputRef.current?.contains(activeElement) ||
        inputRef.current === activeElement;

      if (!isWithinThisComponent) {
        setShowDropdown(false);
        setFocusedIndex(-1);
      }
    }, 150);
  }, [setShowDropdown, setFocusedIndex]);

  // Handle clear button click
  const handleClearClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setSelectedOption(null);
    setInputValue('');
    setShowDropdown(false);
    setFocusedIndex(-1);
    onSelect(null);

    if (onSearch) {
      onSearch('');
    } else {
      setFilteredOptions(normalizedOptions);
    }

    inputRef.current?.focus();
  }, [
    normalizedOptions,
    onSearch,
    onSelect,
    setSelectedOption,
    setInputValue,
    setShowDropdown,
    setFocusedIndex,
    setFilteredOptions,
  ]);

  // Handle creating a new item
  const handleCreateNew = useCallback(async () => {
    if (!allowCreate || !onCreateNew || !inputValue.trim() || isCreating) return;

    setIsCreating(true);
    setCreateError(null);
    try {
      const newOption = await onCreateNew(inputValue.trim());

      setNormalizedOptions(prev => [...prev, newOption]);
      setFilteredOptions(prev => [...prev, newOption]);

      setSelectedOption(newOption);
      setInputValue(newOption.label);
      setShowDropdown(false);
      setFocusedIndex(-1);
      setJustSelected(true);

      onSelect(newOption);

      setTimeout(() => setJustSelected(false), 300);
    } catch (error) {
      console.error('Failed to create new item:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create new item';
      setCreateError(errorMessage);

      setTimeout(() => setCreateError(null), 5000);
    } finally {
      setIsCreating(false);
    }
  }, [
    allowCreate,
    onCreateNew,
    inputValue,
    isCreating,
    onSelect,
    setIsCreating,
    setCreateError,
    setNormalizedOptions,
    setFilteredOptions,
    setSelectedOption,
    setInputValue,
    setShowDropdown,
    setFocusedIndex,
    setJustSelected,
  ]);

  // Handle dropdown icon click
  const handleDropdownIconClick = useCallback(() => {
    if (disabled) return;

    setJustSelected(false);

    const { shouldShow, filteredOptions: toggleOptions, focusedIndex: toggleIndex } = handleDropdownToggle(
      showDropdown,
      onSearch,
      normalizedOptions,
      selectedOption
    );

    setShowDropdown(shouldShow);
    if (shouldShow) {
      setDropdownPosition(calculateDropdownPosition());
      setFilteredOptions(toggleOptions);
      setFocusedIndex(toggleIndex);
      inputRef.current?.focus();
    } else {
      setFocusedIndex(-1);
    }
  }, [
    disabled,
    showDropdown,
    onSearch,
    normalizedOptions,
    selectedOption,
    calculateDropdownPosition,
    setJustSelected,
    setShowDropdown,
    setDropdownPosition,
    setFilteredOptions,
    setFocusedIndex,
  ]);

  // Load initial value if provided
  useEffect(() => {
    if (value && !selectedOption && normalizedOptions.length > 0) {
      const matchingOption = normalizedOptions.find(opt => opt.value === value);
      if (matchingOption) {
        setSelectedOption(matchingOption);
        setInputValue(matchingOption.label);
      }
    }
  }, [value, selectedOption, normalizedOptions, setSelectedOption, setInputValue]);

  // Handle external option updates (for API-driven data)
  useEffect(() => {
    if (onSearch) {
      setFilteredOptions(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(options)) {
          return options;
        }
        return prev;
      });
    }
  }, [options, onSearch, setFilteredOptions]);

  // Special handler for API-driven selects: show dropdown after focus loads options
  useEffect(() => {
    const shouldShowAPI =
      onSearch &&
      options.length > 0 &&
      !justSelected &&
      document.activeElement === inputRef.current &&
      !showDropdown &&
      !(selectedOption && inputValue === selectedOption.label);

    if (shouldShowAPI) {
      setShowDropdown(true);
      setDropdownPosition(calculateDropdownPosition());

      if (selectedOption) {
        const selectedIndex = options.findIndex(opt => opt.value === selectedOption.value);
        if (selectedIndex >= 0) {
          setFocusedIndex(selectedIndex);
        } else {
          setFocusedIndex(0);
        }
      } else {
        setFocusedIndex(0);
      }
    }
  }, [
    options,
    onSearch,
    justSelected,
    selectedOption,
    calculateDropdownPosition,
    showDropdown,
    inputValue,
    setShowDropdown,
    setDropdownPosition,
    setFocusedIndex,
  ]);

  // Memoized icons to prevent recreation
  const clearIcon = useMemo(() => (
    <svg
      className="size-4 cursor-pointer transition-colors duration-200 hover:text-red-600 dark:hover:text-red-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      onClick={handleClearClick}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ), [handleClearClick]);

  const dropdownIcon = useMemo(() => (
    <svg
      className={`size-4 cursor-pointer transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      onClick={handleDropdownIconClick}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ), [showDropdown, handleDropdownIconClick]);

  // Memoized right icon based on state
  const rightIcon = useMemo(() => {
    if (selectedOption && !disabled) {
      return clearIcon;
    }
    return dropdownIcon;
  }, [selectedOption, disabled, clearIcon, dropdownIcon]);

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        id={inputId}
        name={name ? `${name}_display` : undefined}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        error={error}
        loading={loading}
        rightIcon={rightIcon}
        suppressActions={true}
        autoComplete="off"
        role="combobox"
        aria-expanded={showDropdown}
        aria-haspopup="listbox"
        aria-owns={showDropdown ? `${inputId}-listbox` : undefined}
        aria-activedescendant={focusedIndex >= 0 ? `${inputId}-option-${focusedIndex}` : undefined}
        className={className}
      />

      {/* Error message for create actions */}
      {createError && (
        <div className="mt-1 text-sm text-red-600 dark:text-red-400">
          {createError}
        </div>
      )}

      {/* Custom dropdown with full keyboard and mouse support */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className={dropdownClasses}
          onMouseDown={e => e.preventDefault()}
          onKeyDown={e => {
            if (e.key === 'Escape') {
              e.preventDefault();
              setShowDropdown(false);
              inputRef.current?.focus();
            }
          }}
          onTouchStart={e => e.stopPropagation()}
        >
          {/*
            Using role="listbox" instead of native <select> because:
            1. Native <select> doesn't support rich content (descriptions, badges)
            2. Native <select> doesn't support API-driven search
            3. Native <select> doesn't support infinite scrolling
            4. This provides better UX while maintaining accessibility
          */}
          <div
            id={`${inputId}-listbox`}
            role="listbox"
            aria-label="Options"
            className="py-1"
            onScroll={e => {
              const target = e.currentTarget;
              const scrollTop = target.scrollTop;
              const scrollHeight = target.scrollHeight;
              const clientHeight = target.clientHeight;
              const threshold = 50;
              const isScrollable = scrollHeight > clientHeight;
              const isNearBottom = scrollTop + clientHeight >= scrollHeight - threshold;

              if (infiniteScroll && hasMore && onLoadMore && !loadingMore) {
                if (isScrollable && isNearBottom) {
                  onLoadMore();
                }
              }
            }}
          >
            {filteredOptions.length > 0 ? (
              <>
                {filteredOptions.map((option, index) => (
                  <Option
                    key={`${option.value}-${index}`}
                    id={`${inputId}-option-${index}`}
                    ref={el => {
                      optionRefs.current[index] = el;
                    }}
                    selected={selectedOption?.value === option.value}
                    focused={focusedIndex === index}
                    disabled={option.disabled}
                    label={option.label}
                    description={option.description}
                    value={option.value}
                    badge={option.badge}
                    onClick={() => handleOptionSelect(option)}
                    onMouseEnter={() => setFocusedIndex(index)}
                  />
                ))}

                {/* Create New Option - shown when there are matches and input doesn't exactly match */}
                {shouldShowCreateButton && (
                  <div className="border-t border-gray-200 dark:border-gray-600">
                    <button
                      onClick={handleCreateNew}
                      disabled={isCreating}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-blue-600 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none disabled:opacity-50 dark:text-blue-400 dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                    >
                      {isCreating ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600 dark:border-blue-400"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Create "{inputValue.trim()}"
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Load More Indicator */}
                {hasMore && (
                  <div className="border-t border-gray-200 px-4 py-2 text-center dark:border-gray-600">
                    {renderLoadMoreSection(loadingMore, infiniteScroll, onLoadMore)}
                  </div>
                )}
              </>
            ) : (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                {renderEmptyState(loading, onSearch, inputValue)}

                {/* Create New Option - also show when no results found */}
                {shouldShowCreateNoResults && (
                  <div className="border-t border-gray-200 dark:border-gray-600">
                    <button
                      onClick={handleCreateNew}
                      disabled={isCreating}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-blue-600 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none disabled:opacity-50 dark:text-blue-400 dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                    >
                      {isCreating ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600 dark:border-blue-400"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Create "{inputValue.trim()}"
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={selectedOption?.value || ''} />
    </div>
  );
};

// Apply React.memo for performance optimization
const Select = memo(SelectComponent);

// Export types and component
export type { SelectOption, SelectProps };
export default Select;