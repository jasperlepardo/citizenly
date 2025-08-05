'use client';

import React, { forwardRef, SelectHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const selectVariants = cva(
  'flex items-center w-full bg-surface rounded transition-all duration-200 font-montserrat focus-within:outline-none relative',
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

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectFieldProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof selectVariants> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  placeholder?: string;
  options: SelectOption[];
  loading?: boolean;
  leftIcon?: React.ReactNode;
}

const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      label,
      helperText,
      errorMessage,
      placeholder,
      options,
      loading = false,
      leftIcon,
      disabled,
      value,
      ...props
    },
    ref
  ) => {
    const actualVariant = disabled ? 'disabled' : errorMessage ? 'error' : variant;

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-primary mb-1 font-['Montserrat']">
            {label}
          </label>
        )}

        {/* Select Container */}
        <div
          className={cn(
            selectVariants({ variant: actualVariant, size }),
            '[color-scheme:light] dark:[color-scheme:dark]',
            className
          )}
          style={{
            colorScheme: 'light dark',
          }}
        >
          {/* Left Icon - Figma: w-5 (20px width) */}
          {leftIcon && (
            <div className="flex items-center justify-center w-5 h-5 text-secondary shrink-0">
              {leftIcon}
            </div>
          )}

          {/* Content Area - Figma: basis-0 grow flex-col gap-0.5 items-center justify-center px-1 py-0 */}
          <div className="basis-0 grow flex flex-col gap-0.5 items-center justify-center min-h-0 min-w-0 px-1 py-0">
            {/* Select wrapped in flex container - Figma: flex flex-col justify-center */}
            <div className="flex flex-col font-montserrat font-normal justify-center leading-[0] overflow-ellipsis overflow-hidden w-full text-nowrap">
              <select
                ref={ref}
                className={cn(
                  'w-full bg-transparent border-none outline-none font-montserrat font-normal text-primary appearance-none cursor-pointer',
                  'dark:[color-scheme:dark]', // This helps browsers apply dark theme to native dropdowns
                  // Figma text-base-regular: 16px/20px (leading-5 = 20px)
                  size === 'sm' && 'text-sm leading-4',
                  size === 'md' && 'text-base leading-5', // 16px from Figma
                  size === 'lg' && 'text-lg leading-6',
                  disabled && 'text-muted cursor-not-allowed',
                  !value && 'text-muted' // Placeholder color from Figma
                )}
                disabled={disabled || loading}
                value={value}
                {...props}
              >
                {placeholder && (
                  <option
                    value=""
                    disabled
                    hidden
                    className="text-muted bg-surface"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    {loading ? 'Loading...' : placeholder}
                  </option>
                )}
                {loading ? (
                  <option
                    value=""
                    disabled
                    className="text-muted bg-surface"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    Loading...
                  </option>
                ) : (
                  options.map(option => (
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
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Dropdown Icon - Figma: w-5 (20px width) */}
          <div className="flex items-center justify-center w-5 h-5 text-secondary shrink-0">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Helper Text / Error Message */}
        {(helperText || errorMessage) && (
          <div className="mt-1">
            {errorMessage ? (
              <p className="text-xs text-red-500 font-['Montserrat']">{errorMessage}</p>
            ) : (
              <p className="text-xs text-muted font-['Montserrat']">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

SelectField.displayName = 'SelectField';

export { SelectField, selectVariants };
