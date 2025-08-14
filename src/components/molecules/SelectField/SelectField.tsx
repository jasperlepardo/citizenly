'use client';

import React, { forwardRef, SelectHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const selectVariants = cva(
  'font-montserrat relative flex w-full items-center rounded transition-all duration-200 bg-default focus-within:outline-none',
  {
    variants: {
      variant: {
        default:
          'border border-default focus-within:border-blue-600 focus-within:shadow-[0px_0px_0px_4px_rgba(59,130,246,0.32)]',
        error:
          'border border-red-600 focus-within:border-red-600 focus-within:shadow-[0px_0px_0px_4px_rgba(220,38,38,0.32)]',
        success:
          'border border-green-500 focus-within:border-green-500 focus-within:shadow-[0px_0px_0px_4px_rgba(5,150,105,0.32)]',
        disabled: 'cursor-not-allowed border bg-default-muted border-default',
        readonly: 'border bg-default-muted border-default',
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
          <label className="mb-1 block font-body text-sm font-medium text-gray-600">{label}</label>
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
            <div className="flex size-5 shrink-0 items-center justify-center text-gray-600">
              {leftIcon}
            </div>
          )}

          {/* Content Area - Figma: basis-0 grow flex-col gap-0.5 items-center justify-center px-1 py-0 */}
          <div className="flex min-h-0 min-w-0 grow basis-0 flex-col items-center justify-center gap-0.5 px-1 py-0">
            {/* Select wrapped in flex container - Figma: flex flex-col justify-center */}
            <div className="font-montserrat flex w-full flex-col justify-center overflow-hidden text-ellipsis text-nowrap font-normal leading-5">
              <select
                ref={ref}
                className={cn(
                  'font-montserrat w-full cursor-pointer appearance-none border-none bg-transparent font-normal text-gray-600 outline-none',
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
                    className="text-muted bg-default"
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
                    className="text-muted bg-default"
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
                      className="bg-default text-gray-600"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-text-gray-600)',
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
          <div className="flex size-5 shrink-0 items-center justify-center text-gray-600">
            <svg
              className="size-4"
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
              <p className="font-body text-xs text-red-600">{errorMessage}</p>
            ) : (
              <p className="text-muted font-body text-xs">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

SelectField.displayName = 'SelectField';

export { SelectField, selectVariants };
