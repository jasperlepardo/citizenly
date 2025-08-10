'use client';

import React, { useRef, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface BaseSelectorOption {
  value: string;
  label: string;
  metadata?: Record<string, any>;
}

export interface BaseSelectorProps<T extends BaseSelectorOption> {
  value: string;
  onChange: (value: string) => void;
  options: T[];
  loading?: boolean;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  renderOption?: (option: T, searchTerm: string) => ReactNode;
  renderSelectedValue?: (option: T | null) => string;
  emptyMessage?: string | ReactNode;
  searchInstructions?: string | ReactNode;
  minSearchLength?: number;
  className?: string;
}

export function BaseSelector<T extends BaseSelectorOption>({
  value,
  onChange,
  options,
  loading = false,
  error,
  disabled = false,
  placeholder = 'Search...',
  searchTerm,
  onSearchChange,
  isOpen,
  onOpenChange,
  renderOption,
  renderSelectedValue,
  emptyMessage = 'No results found',
  searchInstructions = 'Start typing to search',
  minSearchLength = 2,
  className,
}: BaseSelectorProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(opt => opt.value === value) || null;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onOpenChange(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onOpenChange]);

  const handleSelect = (option: T) => {
    onChange(option.value);
    onSearchChange(renderSelectedValue ? renderSelectedValue(option) : option.label);
    onOpenChange(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onSearchChange(newValue);
    onOpenChange(true);

    if (!newValue && value) {
      onChange('');
    }
  };

  const highlightMatch = (text: string, search: string) => {
    if (!search.trim()) return text;

    const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 font-medium text-primary">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const defaultRenderOption = (option: T) => (
    <div className="font-medium">{highlightMatch(option.label, searchTerm)}</div>
  );

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => onOpenChange(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full rounded-md border p-3 pr-10',
            'focus:border-blue-500 focus:ring-2 focus:ring-blue-500',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
          )}
        />

        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg
              className="size-5 animate-spin text-muted"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}

        {!loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className="size-5 text-muted"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        )}
      </div>

      {isOpen && options.length > 0 && searchTerm.length >= minSearchLength && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border shadow-lg bg-white border-gray-200">
          {options.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option)}
              className="w-full px-4 py-3 text-left border-b border-gray-100 last:border-b-0 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
            >
              {renderOption ? renderOption(option, searchTerm) : defaultRenderOption(option)}
            </button>
          ))}
        </div>
      )}

      {isOpen && !loading && options.length === 0 && searchTerm.length >= minSearchLength && (
        <div className="absolute z-50 mt-1 w-full rounded-md border p-4 shadow-lg bg-white border-gray-200">
          <div className="text-center text-muted">
            {typeof emptyMessage === 'string' ? (
              <>
                <svg
                  className="mx-auto mb-2 size-8 text-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <p className="text-sm">{emptyMessage}</p>
              </>
            ) : (
              emptyMessage
            )}
          </div>
        </div>
      )}

      {isOpen && !loading && searchTerm.length < minSearchLength && (
        <div className="absolute z-50 mt-1 w-full rounded-md border p-4 shadow-lg bg-white border-gray-200">
          <div className="text-center text-muted">
            {typeof searchInstructions === 'string' ? (
              <>
                <svg
                  className="mx-auto mb-2 size-8 text-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <p className="text-sm">{searchInstructions}</p>
                <p className="mt-1 text-xs">Type at least {minSearchLength} characters</p>
              </>
            ) : (
              searchInstructions
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}