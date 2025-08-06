'use client';

import React, { forwardRef, InputHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const searchBarVariants = cva(
  'flex items-center w-full transition-colors font-system focus-within:outline-none relative',
  {
    variants: {
      variant: {
        default:
          'border border-default bg-surface rounded focus-within:border-blue-600 focus-within:shadow-[0px_0px_0px_4px_rgba(59,130,246,0.32)]',
        filled:
          'border border-default bg-surface rounded focus-within:border-blue-600 focus-within:shadow-[0px_0px_0px_4px_rgba(59,130,246,0.32)]',
        outlined:
          'border border-default bg-surface rounded focus-within:border-blue-600 focus-within:shadow-[0px_0px_0px_4px_rgba(59,130,246,0.32)]',
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

export interface SearchBarProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof searchBarVariants> {
  onClear?: () => void;
  showClearButton?: boolean;
  leftIcon?: React.ReactNode;
  onSearch?: (value: string) => void;
  className?: string;
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      placeholder = 'Search...',
      value = '',
      onChange,
      onClear,
      onSearch,
      showClearButton = true,
      leftIcon,
      onKeyDown,
      disabled,
      ...props
    },
    ref
  ) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSearch?.(e.currentTarget.value);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.currentTarget.blur();
        onClear?.();
      }
      onKeyDown?.(e);
    };

    const handleClear = () => {
      onClear?.();
      // Focus back to input after clearing
      if (ref && 'current' in ref && ref.current) {
        ref.current.focus();
      }
    };

    const hasValue = value && value.toString().length > 0;

    return (
      <div className={cn(searchBarVariants({ variant, size }), 'search-bar-container', className)}>
        {/* Left Icon - Figma: w-5 (20px width) */}
        {(leftIcon || true) && (
          <div className="flex items-center justify-center w-5 h-5 text-secondary shrink-0">
            {leftIcon || (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            )}
          </div>
        )}

        {/* Content Area - Figma: basis-0 grow flex-col gap-0.5 items-center justify-center px-1 py-0 */}
        <div className="basis-0 grow flex flex-col gap-0.5 items-center justify-center min-h-0 min-w-0 px-1 py-0">
          {/* Input wrapped in flex container - Figma: flex flex-col justify-center */}
          <div className="flex flex-col font-montserrat font-normal justify-center leading-[0] overflow-ellipsis overflow-hidden w-full text-nowrap">
            <input
              ref={ref}
              type="text"
              className={cn(
                'w-full bg-transparent font-montserrat font-normal text-primary placeholder:text-muted',
                // Remove ALL borders and focus states
                'border-0 outline-0 ring-0 shadow-none',
                'focus:border-0 focus:outline-0 focus:ring-0 focus:shadow-none',
                'active:border-0 active:outline-0 active:ring-0 active:shadow-none',
                // Figma text-base-regular: 16px/20px (leading-5 = 20px)
                size === 'sm' && 'text-sm leading-4',
                size === 'md' && 'text-base leading-5',
                size === 'lg' && 'text-lg leading-6',
                disabled && 'text-muted cursor-not-allowed'
              )}
              style={{
                border: 'none',
                outline: 'none',
                boxShadow: 'none',
                appearance: 'none',
              }}
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              aria-label="Search"
              {...props}
            />
          </div>
        </div>

        {/* Clear Button - Figma: w-5 (20px width) */}
        {showClearButton && hasValue && (
          <div className="flex items-center justify-center w-5 h-5 text-secondary shrink-0">
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center justify-center w-full h-full text-secondary hover:text-primary transition-colors"
              aria-label="Clear search"
              tabIndex={-1}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';

export { SearchBar, searchBarVariants };
