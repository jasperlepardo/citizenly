/**
 * JSPR Design System Select Component
 * Updated to match Figma specifications exactly
 */

import React, { forwardRef, SelectHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const selectContainerVariants = cva(
  'w-full bg-surface rounded transition-all duration-200 relative',
  {
    variants: {
      variant: {
        default:
          'border border-default focus-within:border-blue-500 focus-within:shadow-[0px_0px_0px_4px_rgba(59,130,246,0.32)]',
        error: 'border border-red-500',
        disabled: 'border border-default bg-background-muted',
      },
      size: {
        default: 'px-3 py-2 min-h-[40px]', // 12px + 8px padding from Figma
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const selectVariants = cva(
  "w-full appearance-none font-body text-base leading-5 font-normal bg-transparent border-none outline-none resize-none",
  {
    variants: {
      variant: {
        default: 'text-primary',
        error: 'text-primary',
        disabled: 'text-muted cursor-not-allowed',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'onChange'>,
    VariantProps<typeof selectContainerVariants> {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
  errorMessage?: string;
  helperText?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      options,
      value,
      onChange,
      placeholder = 'Select an option...',
      disabled = false,
      loading = false,
      errorMessage,
      helperText,
      ...props
    },
    ref
  ) => {
    const selectVariant = disabled ? 'disabled' : errorMessage ? 'error' : variant;

    return (
      <div className="relative">
        <div
          className={cn(
            selectContainerVariants({ variant: selectVariant, size }),
            '[color-scheme:light] dark:[color-scheme:dark]',
            className
          )}
          style={{
            colorScheme: 'light dark',
          }}
        >
          <select
            ref={ref}
            value={value}
            onChange={e => onChange(e.target.value)}
            disabled={disabled || loading}
            className={cn(
              selectVariants({ variant: selectVariant }),
              'pr-8 dark:[color-scheme:dark]' // Space for dropdown arrow
            )}
            {...props}
          >
            <option
              value=""
              disabled
              className="text-muted bg-surface"
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-muted)',
              }}
            >
              {loading ? 'Loading...' : placeholder}
            </option>
            {options.map(option => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="text-primary bg-surface"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Dropdown Arrow Icon */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {loading ? (
              <div className="animate-spin h-4 w-4 border-2 border-border-light border-t-blue-600 rounded-full"></div>
            ) : (
              <svg
                className="w-4 h-4 text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Helper Text */}
        {helperText && !errorMessage && <p className="mt-1 text-xs text-secondary">{helperText}</p>}

        {/* Error Message */}
        {errorMessage && <p className="mt-1 text-xs text-danger-600">{errorMessage}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
