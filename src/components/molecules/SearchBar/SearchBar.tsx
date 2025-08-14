'use client';

import React, { forwardRef, InputHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const searchBarVariants = cva(
  'relative flex w-full items-center transition-colors font-system focus-within:outline-none',
  {
    variants: {
      variant: {
        default:
          'rounded border bg-surface border-default focus-within:border-blue-600 focus-within:shadow-[0px_0px_0px_4px_rgba(59,130,246,0.32)]',
        filled:
          'rounded border bg-surface border-default focus-within:border-blue-600 focus-within:shadow-[0px_0px_0px_4px_rgba(59,130,246,0.32)]',
        outlined:
          'rounded border bg-surface border-default focus-within:border-blue-600 focus-within:shadow-[0px_0px_0px_4px_rgba(59,130,246,0.32)]',
      },
      size: {
        sm: 'min-h-8 p-1.5 text-sm',
        md: 'min-h-10 p-2 text-base', // Figma: exact 8px padding
        lg: 'min-h-12 p-3 text-lg',
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
          <div className="text-secondary flex size-5 shrink-0 items-center justify-center">
            {leftIcon || (
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="flex min-h-0 min-w-0 grow basis-0 flex-col items-center justify-center gap-0.5 px-1 py-0">
          {/* Input wrapped in flex container - Figma: flex flex-col justify-center */}
          <div className="font-montserrat flex w-full flex-col justify-center overflow-hidden text-ellipsis text-nowrap font-normal leading-5">
            <input
              ref={ref}
              type="text"
              className={cn(
                'font-montserrat placeholder:text-muted text-primary w-full bg-transparent font-normal',
                // Remove ALL borders and focus states
                'border-0 shadow-none outline-0 ring-0',
                'focus:border-0 focus:shadow-none focus:outline-0 focus:ring-0',
                'active:border-0 active:shadow-none active:outline-0 active:ring-0',
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
          <div className="text-secondary flex size-5 shrink-0 items-center justify-center">
            <button
              type="button"
              onClick={handleClear}
              className="text-secondary hover:text-primary flex size-full items-center justify-center transition-colors"
              aria-label="Clear search"
              tabIndex={-1}
            >
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
