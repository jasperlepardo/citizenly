'use client';

import React, { useState, useRef, useEffect, useCallback, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const dropdownVariants = cva(
  'flex items-center w-full bg-surface rounded transition-all duration-200 font-montserrat focus-within:outline-none relative cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'border border-default focus-within:border-blue-600 focus-within:shadow-[0px_0px_0px_4px_rgba(59,130,246,0.32)]',
        error:
          'border border-red-600 focus-within:border-red-600 focus-within:shadow-[0px_0px_0px_4px_rgba(220,38,38,0.32)]',
        success:
          'border border-green-500 focus-within:border-green-500 focus-within:shadow-[0px_0px_0px_4px_rgba(5,150,105,0.32)]',
        disabled: 'border border-default bg-background-muted cursor-not-allowed',
        readonly: 'border border-default bg-background-muted',
      },
      size: {
        sm: 'p-1.5 text-sm min-h-[32px]',
        md: 'p-[8px] text-base min-h-[40px]', // Figma: exact 8px padding
        lg: 'p-3 text-lg min-h-[48px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
}

export interface DropdownSelectProps extends VariantProps<typeof dropdownVariants> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  placeholder?: string;
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  searchable?: boolean;
  clearable?: boolean;
  maxHeight?: number;
  className?: string;
  dropdownClassName?: string;
}

const DropdownSelect = forwardRef<HTMLDivElement, DropdownSelectProps>(
  (
    {
      className,
      dropdownClassName,
      variant = 'default',
      size = 'md',
      label,
      helperText,
      errorMessage,
      placeholder = 'Select an option...',
      options = [],
      value,
      onChange,
      onBlur,
      disabled = false,
      loading = false,
      leftIcon,
      searchable = false,
      clearable = false,
      maxHeight = 200,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const optionsListRef = useRef<HTMLDivElement>(null);
    const optionRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Generate unique IDs for ARIA attributes
    const listboxId = `dropdown-listbox-${Math.random().toString(36).substr(2, 9)}`;

    const actualVariant = errorMessage ? 'error' : variant;
    const selectedOption = options.find(opt => opt.value === value);

    // Filter options based on search term with intelligent sorting
    const filteredOptions =
      searchable && searchTerm
        ? options
            .filter(option => option.label.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => {
              const searchLower = searchTerm.toLowerCase();
              const aLabel = a.label.toLowerCase();
              const bLabel = b.label.toLowerCase();

              // Exact matches first
              if (aLabel === searchLower && bLabel !== searchLower) return -1;
              if (bLabel === searchLower && aLabel !== searchLower) return 1;

              // Starts with search term
              if (aLabel.startsWith(searchLower) && !bLabel.startsWith(searchLower)) return -1;
              if (bLabel.startsWith(searchLower) && !aLabel.startsWith(searchLower)) return 1;

              // Word boundary matches (starts with search term after space or dash)
              const aWordMatch = aLabel.match(new RegExp(`\\b${searchLower}`, 'i'));
              const bWordMatch = bLabel.match(new RegExp(`\\b${searchLower}`, 'i'));
              if (aWordMatch && !bWordMatch) return -1;
              if (bWordMatch && !aWordMatch) return 1;

              // Default alphabetical sort
              return aLabel.localeCompare(bLabel);
            })
        : options;

    // Auto-highlight first option when search results change
    useEffect(() => {
      if (searchable && searchTerm && filteredOptions.length > 0) {
        setHighlightedIndex(0);
      } else if (!searchTerm) {
        setHighlightedIndex(-1);
      }
    }, [searchTerm, filteredOptions.length, searchable]);

    // Update search term when value changes
    useEffect(() => {
      if (searchable && selectedOption && !isOpen) {
        setSearchTerm(selectedOption.label);
      }
    }, [selectedOption, searchable, isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setSearchTerm('');
          setHighlightedIndex(-1);
          onBlur?.();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onBlur]);

    // Focus search input when dropdown opens
    useEffect(() => {
      if (isOpen && searchable && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen, searchable]);

    // Scroll highlighted option into view
    useEffect(() => {
      if (highlightedIndex >= 0 && optionRefs.current[highlightedIndex] && optionsListRef.current) {
        const highlightedElement = optionRefs.current[highlightedIndex];
        const container = optionsListRef.current;

        if (highlightedElement) {
          const containerRect = container.getBoundingClientRect();
          const elementRect = highlightedElement.getBoundingClientRect();

          if (elementRect.bottom > containerRect.bottom) {
            // Scroll down
            highlightedElement.scrollIntoView({ block: 'end', behavior: 'smooth' });
          } else if (elementRect.top < containerRect.top) {
            // Scroll up
            highlightedElement.scrollIntoView({ block: 'start', behavior: 'smooth' });
          }
        }
      }
    }, [highlightedIndex]);

    // Define handleSelect before it's used in useEffect
    const handleSelect = useCallback(
      (option: DropdownOption) => {
        if (option.disabled) return;

        onChange?.(option.value);
        setIsOpen(false);
        // Don't clear search term if searchable - show selected value
        if (!searchable) {
          setSearchTerm('');
        } else {
          setSearchTerm(option.label);
        }
        setHighlightedIndex(-1);

        // Blur the input if searchable to prevent cursor showing
        if (searchable && searchInputRef.current) {
          searchInputRef.current.blur();
        }
      },
      [onChange, searchable]
    );

    // Handle keyboard navigation
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        // Don't handle keyboard events if search input is focused
        if (searchable && document.activeElement === searchInputRef.current) {
          return;
        }

        // Handle keyboard events when dropdown is open
        if (isOpen) {
          // Handle alphanumeric keys for quick selection (only for non-searchable dropdowns)
          if (!searchable && event.key.length === 1 && /^[a-zA-Z0-9]$/.test(event.key)) {
            event.preventDefault();
            const matchingIndex = filteredOptions.findIndex(option =>
              option.label.toLowerCase().startsWith(event.key.toLowerCase())
            );
            if (matchingIndex >= 0) {
              setHighlightedIndex(matchingIndex);
            }
            return;
          }

          switch (event.key) {
            case 'ArrowDown':
              event.preventDefault();
              setHighlightedIndex(prev => {
                const nextIndex = prev < filteredOptions.length - 1 ? prev + 1 : 0;
                return nextIndex;
              });
              break;
            case 'ArrowUp':
              event.preventDefault();
              setHighlightedIndex(prev => {
                const nextIndex = prev > 0 ? prev - 1 : filteredOptions.length - 1;
                return nextIndex;
              });
              break;
            case 'Enter':
              // Don't prevent default for Enter in search input - it's handled by onKeyDown
              if (!searchable || document.activeElement !== searchInputRef.current) {
                event.preventDefault();
                if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
                  handleSelect(filteredOptions[highlightedIndex]);
                }
              }
              break;
            case ' ': // Space key
              event.preventDefault();
              if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
                handleSelect(filteredOptions[highlightedIndex]);
              }
              break;
            case 'Tab':
              // Tab key: Select highlighted option and close dropdown
              if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
                event.preventDefault();
                handleSelect(filteredOptions[highlightedIndex]);
              } else {
                // If no option is highlighted, just close the dropdown and allow normal tab behavior
                setIsOpen(false);
                setSearchTerm('');
                setHighlightedIndex(-1);
              }
              break;
            case 'Escape':
              event.preventDefault();
              setIsOpen(false);
              setSearchTerm('');
              setHighlightedIndex(-1);
              // Return focus to the trigger element
              if (dropdownRef.current) {
                const trigger = dropdownRef.current.querySelector(
                  '[role="combobox"]'
                ) as HTMLElement;
                trigger?.focus();
              }
              break;
            case 'Home':
              event.preventDefault();
              setHighlightedIndex(0);
              break;
            case 'End':
              event.preventDefault();
              setHighlightedIndex(filteredOptions.length - 1);
              break;
          }
        } else {
          // Handle keyboard events when dropdown is closed
          switch (event.key) {
            case 'ArrowDown':
            case 'ArrowUp':
            case 'Enter':
            case ' ': // Space key
              // Open dropdown if trigger is focused
              if (
                document.activeElement === dropdownRef.current?.querySelector('[role="combobox"]')
              ) {
                event.preventDefault();
                setIsOpen(true);
                setHighlightedIndex(0);
              }
              break;
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, highlightedIndex, filteredOptions, searchable, handleSelect]);

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.('');
      setSearchTerm('');
      setIsOpen(false);
    };

    const toggleDropdown = () => {
      if (disabled || loading) return;
      setIsOpen(prev => !prev);
      setHighlightedIndex(-1);
    };

    return (
      <div className={cn('relative', className)} ref={dropdownRef}>
        {/* Label */}
        {label && <label className="block text-sm font-medium text-primary mb-1">{label}</label>}

        {/* Dropdown Trigger */}
        <div
          ref={ref}
          className={cn(dropdownVariants({ variant: actualVariant, size }), 'relative')}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          {...props}
        >
          {/* Left Icon - Figma: w-5 (20px width) */}
          {leftIcon && (
            <div className="flex items-center justify-center w-5 h-5 text-secondary shrink-0">
              {leftIcon}
            </div>
          )}

          {/* Content Area - Figma: basis-0 grow flex-col gap-0.5 items-center justify-center px-1 py-0 */}
          <div className="basis-0 grow flex flex-col gap-0.5 items-center justify-center min-h-0 min-w-0 px-1 py-0">
            {/* Input/Display Field - Figma: flex flex-col justify-center */}
            <div className="flex flex-col font-montserrat font-normal justify-center leading-[0] overflow-ellipsis overflow-hidden w-full text-nowrap">
              {searchable ? (
                <input
                  ref={searchInputRef}
                  type="text"
                  className={cn(
                    'w-full bg-transparent font-montserrat font-normal placeholder:text-muted border-0 outline-0 ring-0 shadow-none focus:border-0 focus:outline-0 focus:ring-0 focus:shadow-none active:border-0 active:outline-0 active:ring-0 active:shadow-none',
                    // Figma text-base-regular: 16px/20px (leading-5 = 20px)
                    size === 'sm' && 'text-sm leading-4',
                    size === 'md' && 'text-base leading-5',
                    size === 'lg' && 'text-lg leading-6',
                    'text-primary',
                    disabled && 'text-muted cursor-not-allowed'
                  )}
                  style={{
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    appearance: 'none',
                    padding: '0 !important',
                    margin: '0 !important',
                  }}
                  value={isOpen ? searchTerm : selectedOption?.label || ''}
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    if (!isOpen) setIsOpen(true);
                  }}
                  onFocus={() => {
                    setIsOpen(true);
                    // Clear search to allow fresh typing
                    setSearchTerm('');
                  }}
                  onBlur={() => {
                    // Delay closing to allow for option selection
                    setTimeout(() => {
                      if (isOpen) {
                        setIsOpen(false);
                        // Reset search term to selected value
                        if (selectedOption) {
                          setSearchTerm(selectedOption.label);
                        } else {
                          setSearchTerm('');
                        }
                      }
                    }, 200);
                  }}
                  onKeyDown={e => {
                    // Handle Enter key in search input
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
                        handleSelect(filteredOptions[highlightedIndex]);
                      } else if (filteredOptions.length === 1) {
                        // If only one option, select it
                        handleSelect(filteredOptions[0]);
                      }
                    }
                  }}
                  placeholder={loading ? 'Loading...' : placeholder}
                  disabled={disabled}
                />
              ) : (
                <span
                  className={cn(
                    'w-full text-left cursor-pointer',
                    // Figma text-base-regular: 16px/20px (leading-5 = 20px)
                    size === 'sm' && 'text-sm leading-4',
                    size === 'md' && 'text-base leading-5',
                    size === 'lg' && 'text-lg leading-6',
                    selectedOption ? 'text-primary' : 'text-muted',
                    disabled && 'text-muted cursor-not-allowed'
                  )}
                  onClick={toggleDropdown}
                >
                  {loading ? 'Loading...' : selectedOption?.label || placeholder}
                </span>
              )}
            </div>
          </div>

          {/* Clear Button */}
          {clearable && selectedOption && !disabled && (
            <div className="flex items-center justify-center w-5 h-5 text-secondary shrink-0">
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center justify-center w-full h-full text-secondary hover:text-primary transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          )}

          {/* Dropdown Icon - Figma: w-5 (20px width) */}
          <div className="flex items-center justify-center w-5 h-5 text-secondary shrink-0">
            <svg
              className={cn('w-4 h-4 transition-transform duration-200', isOpen && 'rotate-180')}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            className={cn(
              'absolute z-50 w-full mt-1 bg-surface rounded-md shadow-xl border border-default',
              'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-100',
              dropdownClassName
            )}
            style={{ maxHeight: `${maxHeight}px` }}
          >
            {/* Options List */}
            <div
              ref={optionsListRef}
              id={listboxId}
              role="listbox"
              className="max-h-60 overflow-auto py-1"
            >
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted">
                  {searchable && searchTerm ? 'No options found' : 'No options available'}
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <div
                    key={option.value}
                    ref={el => {
                      optionRefs.current[index] = el;
                    }}
                    className={cn(
                      'flex items-center px-3 py-2 text-sm cursor-pointer transition-colors',
                      'hover:bg-surface-hover',
                      highlightedIndex === index && 'bg-surface-hover',
                      option.value === value &&
                        'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
                      option.disabled && 'text-muted cursor-not-allowed opacity-50'
                    )}
                    onClick={() => handleSelect(option)}
                    role="option"
                    aria-selected={option.value === value}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <div className="flex-1">
                      <div className="font-medium">{option.label}</div>
                      {option.description && (
                        <div className="text-xs text-muted mt-1">{option.description}</div>
                      )}
                    </div>

                    {/* Selected Checkmark */}
                    {option.value === value && (
                      <div className="flex items-center justify-center w-5 h-5 text-blue-600 dark:text-blue-400">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="20,6 9,17 4,12"></polyline>
                        </svg>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Helper Text / Error Message */}
        {(helperText || errorMessage) && (
          <div className="mt-1">
            {errorMessage ? (
              <p className="text-xs text-red-500 font-montserrat">{errorMessage}</p>
            ) : (
              <p className="text-xs text-muted font-montserrat">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

DropdownSelect.displayName = 'DropdownSelect';

export { DropdownSelect, dropdownVariants };
