'use client';

import React, { forwardRef, InputHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const checkboxVariants = cva(
  'relative inline-flex items-center cursor-pointer disabled:cursor-not-allowed',
  {
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const checkboxInputVariants = cva(
  'relative border rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1',
  {
    variants: {
      variant: {
        default:
          'border-[#d4d4d4] bg-white checked:bg-[#7c3aed] checked:border-[#7c3aed] focus:ring-[#7c3aed]/20',
        primary:
          'border-[#d4d4d4] bg-white checked:bg-[#2563eb] checked:border-[#2563eb] focus:ring-[#2563eb]/20',
        error:
          'border-[#dc2626] bg-white checked:bg-[#dc2626] checked:border-[#dc2626] focus:ring-[#dc2626]/20',
        disabled: 'border-[#d4d4d4] bg-[#fafafa] cursor-not-allowed checked:bg-[#d4d4d4]',
      },
      size: {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof checkboxVariants> {
  label?: string;
  description?: string;
  errorMessage?: string;
  indeterminate?: boolean;
  variant?: 'default' | 'primary' | 'error' | 'disabled';
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      size = 'md',
      variant = 'default',
      label,
      description,
      errorMessage,
      indeterminate = false,
      disabled,
      checked,
      ...props
    },
    ref
  ) => {
    const actualVariant = disabled ? 'disabled' : errorMessage ? 'error' : variant;

    const checkboxRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
      if (checkboxRef.current) {
        checkboxRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    // Use either the forwarded ref or our internal ref
    const inputRef = ref || checkboxRef;

    return (
      <div className="w-full">
        <label className={cn(checkboxVariants({ size }), className)}>
          <div className="relative flex items-start">
            {/* Checkbox Input */}
            <input
              ref={inputRef}
              type="checkbox"
              className={cn(
                checkboxInputVariants({ variant: actualVariant, size }),
                'flex-shrink-0 appearance-none'
              )}
              disabled={disabled}
              checked={checked}
              {...props}
            />

            {/* Custom Checkmark */}
            <div
              className={cn(
                'pointer-events-none absolute inset-0 flex items-center justify-center',
                size === 'sm' && 'h-4 w-4',
                size === 'md' && 'h-5 w-5',
                size === 'lg' && 'h-6 w-6'
              )}
            >
              {indeterminate ? (
                <svg
                  className={cn(
                    'text-white',
                    size === 'sm' && 'h-2 w-2',
                    size === 'md' && 'h-3 w-3',
                    size === 'lg' && 'h-4 w-4'
                  )}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              ) : checked ? (
                <svg
                  className={cn(
                    'text-white',
                    size === 'sm' && 'h-2 w-2',
                    size === 'md' && 'h-3 w-3',
                    size === 'lg' && 'h-4 w-4'
                  )}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
              ) : null}
            </div>
          </div>

          {/* Label and Description */}
          {(label || description) && (
            <div className={cn('ml-2 flex-1', size === 'sm' && 'ml-1.5', size === 'lg' && 'ml-3')}>
              {label && (
                <div
                  className={cn(
                    "font-['Montserrat'] font-medium leading-tight",
                    disabled ? 'text-[#737373]' : 'text-[#262626]',
                    size === 'sm' && 'text-sm',
                    size === 'md' && 'text-base',
                    size === 'lg' && 'text-lg'
                  )}
                >
                  {label}
                </div>
              )}
              {description && (
                <div
                  className={cn(
                    "mt-0.5 font-['Montserrat'] leading-tight",
                    disabled ? 'text-[#a3a3a3]' : 'text-[#737373]',
                    size === 'sm' && 'text-xs',
                    size === 'md' && 'text-sm',
                    size === 'lg' && 'text-base'
                  )}
                >
                  {description}
                </div>
              )}
            </div>
          )}
        </label>

        {/* Error Message */}
        {errorMessage && (
          <p className="ml-6 mt-1 font-['Montserrat'] text-xs text-[#b91c1c]">{errorMessage}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox, checkboxVariants };
