/**
 * Enhanced Select Component
 * Follows PSGCSelector patterns for consistency across the application
 * Supports both static enums and API-driven data
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

import { Input } from '../Input';

import { Option } from './Option';

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
  category?: string;
  badge?: string;
};

interface SelectProps {
  value?: string;
  onSelect: (option: SelectOption | null) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  // Data sources
  options?: SelectOption[];
  enumData?: Record<string, string> | SelectOption[];
  // Configuration options
  name?: string;
  id?: string;
  disabled?: boolean;
  searchable?: boolean;
  allowCustom?: boolean;
  // API integration (similar to PSGCSelector)
  onSearch?: (query: string) => void;
  loading?: boolean;
  // Lazy loading support
  hasMore?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  infiniteScroll?: boolean; // Enable infinite scroll vs manual button
}

// Utility function to convert enum/constant data to SelectOption array
const normalizeOptions = (
  data: SelectOption[] | Record<string, string> | undefined
): SelectOption[] => {
  if (!data) return [];

  if (Array.isArray(data)) {
    return data;
  }

  // Convert enum or object to options
  return Object.entries(data).map(([key, value]) => ({
    value: key,
    label: typeof value === 'string' ? value : String(value),
  }));
};

export default function Select({
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
  onSearch, // For API-driven searches
  loading = false,
  hasMore = false,
  onLoadMore,
  loadingMore = false,
  infiniteScroll = true, // Default to infinite scroll
}: SelectProps) {
  const [inputValue, setInputValue] = useState('');
  const [normalizedOptions, setNormalizedOptions] = useState<SelectOption[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<SelectOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<SelectOption | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState<'below' | 'above'>('below');
  const [justSelected, setJustSelected] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lastSearchRef = useRef<string>('');

  // Generate unique IDs for the form elements
  const inputId = id || `select-input-${Math.random().toString(36).substr(2, 9)}`;

  // Normalize and set options (for static data)
  useEffect(() => {
    if (enumData || options.length > 0) {
      const normalized = normalizeOptions(enumData || options);
      setNormalizedOptions(normalized);
      // Don't automatically set filteredOptions here - let explicit interactions control this
      // setFilteredOptions(normalized);
    }
  }, [options, enumData]);

  // Debounced search (handles both static and API)
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (onSearch) {
      // API-driven search with debounce
      const timer = setTimeout(() => {
        if (inputValue.trim() && inputValue.length >= 2 && lastSearchRef.current !== inputValue) {
          lastSearchRef.current = inputValue;
          onSearch(inputValue);
        } else if (!enumData && inputValue.trim().length < 2) {
          setFilteredOptions([]);
        }
      }, 300);
      debounceTimerRef.current = timer;
    } else {
      // Static data filtering - immediate for better UX
      if (!inputValue.trim() || !searchable) {
        // Don't automatically set filteredOptions when input is empty
        // This prevents unwanted dropdown showing
        // setFilteredOptions(normalizedOptions);
        setFocusedIndex(-1);
      } else {
        const filtered = normalizedOptions.filter(
          option =>
            option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
            option.value.toLowerCase().includes(inputValue.toLowerCase()) ||
            option.description?.toLowerCase().includes(inputValue.toLowerCase())
        );
        setFilteredOptions(filtered);
        setFocusedIndex(filtered.length > 0 ? 0 : -1);
      }
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputValue, onSearch, normalizedOptions, searchable, enumData]);

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

  // Show dropdown only on explicit user interaction (focus, click, typing, keyboard)
  // By default, hide dropdown - only show when user actively interacts
  useEffect(() => {
    // Always hide dropdown by default after selection
    if (justSelected) {
      setShowDropdown(false);
      return;
    }

    // For typing behavior: only show when user has typed enough characters
    // BUT don't show if the inputValue exactly matches the selectedOption (means it's not user typing)
    if (inputValue.trim().length > 0 && !(selectedOption && inputValue === selectedOption.label)) {
      const shouldShow = onSearch
        ? true // For API search: always show when user is typing, let dropdown content handle the messaging
        : filteredOptions.length > 0; // For static data: only show if there are options

      if (shouldShow) {
        setShowDropdown(true);
        setDropdownPosition(calculateDropdownPosition());
        optionRefs.current = optionRefs.current.slice(0, Math.max(filteredOptions.length, 1));
      } else {
        setShowDropdown(false);
      }
    }
    // Note: Focus and keyboard interactions are handled separately in their respective handlers
  }, [
    filteredOptions,
    inputValue,
    calculateDropdownPosition,
    onSearch,
    justSelected,
    selectedOption,
  ]);

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
  }, []);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Prevent event bubbling to parent components
    const query = e.target.value;
    setInputValue(query);

    // Always show dropdown when user starts typing (especially important for API selects and error states)
    setShowDropdown(true);
    setDropdownPosition(calculateDropdownPosition());
    setFocusedIndex(-1);
    setJustSelected(false); // Reset the flag when user starts typing

    // Clear selection when user starts typing (unless it matches exactly)
    if (!onSearch) {
      // Only clear selection if the input doesn't match the current selection
      if (selectedOption && query !== selectedOption.label) {
        setSelectedOption(null);
        onSelect(null);
      }

      // Check for exact matches
      const matchingOption = normalizedOptions.find(
        option => option.label === query || option.value === query
      );

      if (matchingOption && query === matchingOption.label) {
        setSelectedOption(matchingOption);
        onSelect(matchingOption);
      } else if (!query.trim()) {
        setSelectedOption(null);
        onSelect(null);
        setShowDropdown(false);
      } else if (allowCustom && query.trim()) {
        // Create custom option for allowCustom mode
        const customOption: SelectOption = { value: query, label: query };
        setSelectedOption(customOption);
        onSelect(customOption);
      }
    } else {
      // For API-driven search, clear selection when user modifies input
      if (selectedOption && query !== selectedOption.label) {
        setSelectedOption(null);
        onSelect(null);
      }
    }
  };

  // Handle input focus - show options with selected value highlighted
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Prevent event bubbling to parent components
    if (!disabled) {
      // Reset just selected flag to allow dropdown to show
      setJustSelected(false);

      // For static data, show all options on focus
      if (!onSearch && normalizedOptions.length > 0) {
        setFilteredOptions(normalizedOptions);
        setShowDropdown(true);
        setDropdownPosition(calculateDropdownPosition());

        // Highlight and scroll to the currently selected item
        if (selectedOption) {
          const selectedIndex = normalizedOptions.findIndex(
            opt => opt.value === selectedOption.value
          );
          if (selectedIndex >= 0) {
            setFocusedIndex(selectedIndex);
            // Scroll will be handled by the focusedIndex useEffect
          } else {
            setFocusedIndex(0);
          }
        } else {
          setFocusedIndex(0);
        }
      }

      // For API-driven selects, show dropdown immediately to display empty state
      else if (onSearch) {
        setShowDropdown(true);
        setDropdownPosition(calculateDropdownPosition());
        setFocusedIndex(-1);
        // Don't trigger onSearch with empty string to avoid API errors
      }
    }
  };

  // Handle input blur
  const handleInputBlur = () => {
    // Delay hiding dropdown to allow clicks on options
    setTimeout(() => {
      // More specific check: only hide if the active element is not within this component
      const activeElement = document.activeElement;
      const isWithinThisComponent =
        dropdownRef.current?.contains(activeElement) ||
        inputRef.current?.contains(activeElement) ||
        inputRef.current === activeElement;

      if (!isWithinThisComponent) {
        setShowDropdown(false);
        setFocusedIndex(-1);
      }
    }, 300);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle Escape key regardless of dropdown state
    if (e.key === 'Escape') {
      e.preventDefault();
      setShowDropdown(false);
      setFocusedIndex(-1);
      inputRef.current?.blur();
      return;
    }

    // Handle Enter key - select focused option or close dropdown
    if (e.key === 'Enter') {
      e.preventDefault();
      if (showDropdown && focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
        handleOptionSelect(filteredOptions[focusedIndex]);
      } else if (showDropdown) {
        // If dropdown is open but no option focused, just close it
        setShowDropdown(false);
        setFocusedIndex(-1);
      }
      return;
    }

    if (!showDropdown || filteredOptions.length === 0) {
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !showDropdown) {
        e.preventDefault();
        // Reset just selected flag to allow dropdown to show
        setJustSelected(false);

        if (onSearch) {
          // For API-driven selects, show dropdown immediately without triggering API call
          setShowDropdown(true);
          setDropdownPosition(calculateDropdownPosition());
        } else {
          // Show all options when opening dropdown via keyboard for static data
          setFilteredOptions(normalizedOptions);
          setShowDropdown(true);
          setDropdownPosition(calculateDropdownPosition());

          // Highlight and scroll to the currently selected item
          if (selectedOption) {
            const selectedIndex = normalizedOptions.findIndex(
              opt => opt.value === selectedOption.value
            );
            setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0);
          } else {
            setFocusedIndex(0);
          }
        }
        return;
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => (prev + 1) % filteredOptions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => (prev <= 0 ? filteredOptions.length - 1 : prev - 1));
        break;
    }
  };

  // Handle option selection from dropdown
  const handleOptionSelect = (option: SelectOption) => {
    if (option.disabled) return;

    setSelectedOption(option);
    setInputValue(option.label);
    setShowDropdown(false);
    setFocusedIndex(-1);
    setJustSelected(true);

    // Always reset filtering for static data after selection to show all options next time
    if (!onSearch && normalizedOptions.length > 0) {
      setFilteredOptions(normalizedOptions);
    }

    onSelect(option);

    // Blur the input after selection to prevent API handler from reopening
    inputRef.current?.blur();

    // Reset the justSelected flag after a longer delay to prevent reopening
    setTimeout(() => setJustSelected(false), 300);
  };

  // Load initial value if provided
  useEffect(() => {
    if (value && !selectedOption && normalizedOptions.length > 0) {
      const matchingOption = normalizedOptions.find(opt => opt.value === value);
      if (matchingOption) {
        setSelectedOption(matchingOption);
        setInputValue(matchingOption.label);
      }
    }
  }, [value, selectedOption, normalizedOptions]);

  // Handle external option updates (for API-driven data)
  useEffect(() => {
    if (onSearch && options.length > 0) {
      // Only update if options have actually changed
      setFilteredOptions(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(options)) {
          return options;
        }
        return prev;
      });
    }
  }, [options, onSearch]);

  // Special handler for API-driven selects: show dropdown after focus loads options
  useEffect(() => {
    // Only show dropdown if:
    // 1. It's an API-driven select
    // 2. We have options from API
    // 3. We haven't just selected something
    // 4. Input is currently focused (user is actively interacting)
    // 5. Input is not showing a selected value (avoid reopening after selection)
    const shouldShowAPI =
      onSearch &&
      options.length > 0 &&
      !justSelected &&
      document.activeElement === inputRef.current &&
      !showDropdown && // Don't reopen if already showing
      !(selectedOption && inputValue === selectedOption.label); // Don't reopen if showing selected value

    if (shouldShowAPI) {
      setShowDropdown(true);
      setDropdownPosition(calculateDropdownPosition());

      // Highlight and scroll to the currently selected item
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
  ]);

  // Handle clear button click
  const handleClearClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setSelectedOption(null);
    setInputValue('');
    setShowDropdown(false);
    setFocusedIndex(-1);
    onSelect(null);

    // Focus back to input for better UX
    inputRef.current?.focus();
  };

  // Handle dropdown icon click
  const handleDropdownIconClick = () => {
    if (!disabled) {
      if (showDropdown) {
        setShowDropdown(false);
        setFocusedIndex(-1);
      } else {
        // Reset just selected flag to allow dropdown to show
        setJustSelected(false);

        if (onSearch) {
          // For API-driven selects, show dropdown immediately without triggering API call
          setShowDropdown(true);
          setDropdownPosition(calculateDropdownPosition());
          inputRef.current?.focus();
        } else {
          // Show all options when clicking the dropdown arrow for static data
          setFilteredOptions(normalizedOptions);
          setShowDropdown(true);
          setDropdownPosition(calculateDropdownPosition());

          // Highlight and scroll to the currently selected item
          if (selectedOption) {
            const selectedIndex = normalizedOptions.findIndex(
              opt => opt.value === selectedOption.value
            );
            setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0);
          } else {
            setFocusedIndex(0);
          }

          inputRef.current?.focus();
        }
      }
    }
  };

  // Create the clear button icon
  const clearIcon = (
    <svg
      className="size-4 cursor-pointer transition-colors duration-200 hover:text-red-600 dark:hover:text-red-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      onClick={handleClearClick}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  // Create the dropdown chevron icon
  const dropdownIcon = (
    <svg
      className={`size-4 cursor-pointer transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      onClick={handleDropdownIconClick}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );

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
        rightIcon={selectedOption && inputValue ? clearIcon : dropdownIcon}
        suppressActions={true}
        autoComplete="off"
        role="combobox"
        aria-expanded={showDropdown}
        aria-haspopup="listbox"
        className={className}
      />

      {/* Custom dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className={`absolute right-0 left-0 z-50 max-h-60 overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg sm:max-h-80 dark:border-gray-600 dark:bg-gray-800 ${
            dropdownPosition === 'above' ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
          onMouseDown={e => {
            // Prevent the dropdown from closing when clicking inside it
            e.preventDefault();
          }}
        >
          <div
            role="listbox"
            className="py-1"
            onScroll={e => {
              // Enhanced infinite scroll debugging
              const target = e.currentTarget;
              const scrollTop = target.scrollTop;
              const scrollHeight = target.scrollHeight;
              const clientHeight = target.clientHeight;
              const threshold = 50;
              const isScrollable = scrollHeight > clientHeight;
              const isNearBottom = scrollTop + clientHeight >= scrollHeight - threshold;

              console.log('📊 Scroll Debug:', {
                infiniteScroll,
                hasMore,
                hasOnLoadMore: !!onLoadMore,
                loadingMore,
                scrollTop,
                scrollHeight,
                clientHeight,
                isScrollable,
                isNearBottom,
                distanceFromBottom: scrollHeight - (scrollTop + clientHeight),
              });

              // Infinite scroll: trigger when scrolled near bottom
              if (infiniteScroll && hasMore && onLoadMore && !loadingMore) {
                if (isScrollable && isNearBottom) {
                  console.log('🚀 Infinite scroll triggered');
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

                {/* Load More Indicator */}
                {hasMore && (
                  <div className="border-t border-gray-200 px-4 py-2 text-center dark:border-gray-600">
                    {loadingMore ? (
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600 dark:border-blue-400"></div>
                        {infiniteScroll ? 'Loading more...' : 'Loading...'}
                      </div>
                    ) : !infiniteScroll ? (
                      <button
                        onClick={onLoadMore}
                        className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none dark:text-blue-400 dark:hover:text-blue-200"
                      >
                        Load more results
                      </button>
                    ) : (
                      <div className="py-1 text-xs text-gray-400">Scroll for more results</div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                {loading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600 dark:border-blue-400"></div>
                    <p className="text-sm">Searching...</p>
                  </div>
                ) : onSearch && inputValue.length >= 2 && filteredOptions.length === 0 ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600 dark:border-blue-400"></div>
                    <p className="text-sm">Searching...</p>
                  </div>
                ) : onSearch && inputValue.length < 2 ? (
                  <div className="flex flex-col items-center gap-3">
                    <svg
                      className="h-8 w-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium">Start typing to search</p>
                      <p className="mt-1 text-xs">Type at least 2 characters to see results</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <svg
                      className="h-8 w-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium">No results found</p>
                      <p className="mt-1 text-xs">Try a different search term</p>
                    </div>
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
}

export type { SelectProps };
