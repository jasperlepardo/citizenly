'use client';

import React, { forwardRef, InputHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Input } from '@/components/atoms/Input';

const inputVariants = cva(
  'relative flex w-full items-center transition-colors font-system focus-within:outline-none',
  {
    variants: {
      variant: {
        default:
          'rounded border bg-surface border-default focus-within:border-blue-600 focus-within:shadow-[0px_0px_0px_4px_rgba(59,130,246,0.32)]',
        filled:
          'rounded border bg-surface border-default focus-within:border-blue-600 focus-within:shadow-[0px_0px_0px_4px_rgba(59,130,246,0.32)]',
        error:
          'rounded border border-red-600 bg-surface focus-within:border-red-600 focus-within:shadow-[0px_0px_0px_4px_rgba(220,38,38,0.32)]',
        success:
          'rounded border border-green-500 bg-surface focus-within:border-green-500 focus-within:shadow-[0px_0px_0px_4px_rgba(5,150,105,0.32)]',
        disabled: 'cursor-not-allowed rounded border bg-background-muted border-default',
        readonly: 'rounded-none border-0 bg-background-muted',
        borderless: 'rounded-none border-0 bg-transparent',
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

export interface InputFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      label,
      helperText,
      errorMessage,
      leftIcon,
      rightIcon,
      leftAddon,
      rightAddon,
      clearable = false,
      onClear,
      disabled,
      readOnly,
      value,
      id,
      ...props
    },
    ref
  ) => {
    const actualVariant = disabled
      ? 'disabled'
      : readOnly
        ? 'readonly'
        : errorMessage
          ? 'error'
          : variant;
    const showClearButton = clearable && value && !disabled && !readOnly;

    // Generate IDs for accessibility
    const inputId = id || `input-${Math.random().toString(36).substring(2, 11)}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-medium font-system text-primary"
          >
            {label}
          </label>
        )}

        {/* Input Container */}
        <div
          className={cn(
            inputVariants({ variant: actualVariant, size }),
            'input-field-container',
            className
          )}
        >
          {/* Left Icon - Figma: w-5 (20px width) */}
          {leftIcon && (
            <div className="flex size-5 shrink-0 items-center justify-center text-secondary">
              {leftIcon}
            </div>
          )}

          {/* Content Area - Figma: basis-0 grow flex-col gap-0.5 items-center justify-center px-1 py-0 */}
          <div className="flex min-h-0 min-w-0 grow basis-0 flex-col items-center justify-center gap-0.5 px-1 py-0">
            {/* Input wrapped in flex container - Figma: flex flex-col justify-center */}
            <div className="font-montserrat flex w-full flex-col justify-center overflow-hidden text-ellipsis text-nowrap font-normal leading-5">
              <Input
                ref={ref}
                id={inputId}
                size={size}
                aria-invalid={errorMessage ? 'true' : undefined}
                aria-describedby={errorMessage ? errorId : helperText ? helperId : undefined}
                disabled={disabled}
                readOnly={readOnly}
                value={value}
                {...props}
              />
            </div>
          </div>

          {/* Right Icon - Figma: w-5 (20px width) */}
          {(rightIcon || showClearButton) && (
            <div className="flex size-5 shrink-0 items-center justify-center text-secondary">
              {showClearButton ? (
                <button
                  type="button"
                  onClick={onClear}
                  className="flex size-full items-center justify-center transition-colors text-secondary hover:text-primary"
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
              ) : (
                rightIcon
              )}
            </div>
          )}

          {/* Addons for special cases */}
          {leftAddon && (
            <div className="flex items-center border-r px-3 text-sm text-muted bg-background-muted border-default">
              {leftAddon}
            </div>
          )}

          {rightAddon && (
            <div className="flex items-center border-l px-3 text-sm text-muted bg-background-muted border-default">
              {rightAddon}
            </div>
          )}
        </div>

        {/* Helper Text / Error Message */}
        {errorMessage && (
          <p
            id={errorId}
            role="alert"
            aria-live="polite"
            className="mt-2 text-xs leading-[14px] text-red-500 font-system"
          >
            {errorMessage}
          </p>
        )}
        {helperText && !errorMessage && (
          <p id={helperId} className="mt-2 text-xs leading-[14px] font-system text-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

InputField.displayName = 'InputField';

export { InputField, inputVariants };
