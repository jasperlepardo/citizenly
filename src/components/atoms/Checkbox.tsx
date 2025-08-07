'use client';

import React, { forwardRef, InputHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const checkboxVariants = cva(
  'relative inline-flex cursor-pointer items-center disabled:cursor-not-allowed',
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
  'relative rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1',
  {
    variants: {
      variant: {
        default:
          'border-[#d4d4d4] bg-white checked:border-[#7c3aed] checked:bg-[#7c3aed] focus:ring-[#7c3aed]/20',
        primary:
          'border-[#d4d4d4] bg-white checked:border-[#2563eb] checked:bg-[#2563eb] focus:ring-[#2563eb]/20',
        error:
          'border-[#dc2626] bg-white checked:border-[#dc2626] checked:bg-[#dc2626] focus:ring-[#dc2626]/20',
        disabled: 'cursor-not-allowed border-[#d4d4d4] bg-[#fafafa] checked:bg-[#d4d4d4]',
      },
      size: {
        sm: 'size-4',
        md: 'size-5',
        lg: 'size-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

type CheckboxVariant = 'default' | 'primary' | 'error' | 'disabled';

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof checkboxVariants> {
  label?: string;
  description?: string;
  errorMessage?: string;
  indeterminate?: boolean;
  variant?: CheckboxVariant;
}

const getVariant = (
  variant: string,
  disabled?: boolean,
  errorMessage?: string
): CheckboxVariant => {
  if (disabled) return 'disabled';
  if (errorMessage) return 'error';
  return variant as CheckboxVariant;
};

const getIconSizeClasses = (size: string) => {
  const sizeMap = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };
  return sizeMap[size as keyof typeof sizeMap] || sizeMap.md;
};

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
      id,
      ...props
    },
    ref
  ) => {
    const actualVariant = getVariant(variant, disabled, errorMessage);
    const checkboxRef = React.useRef<HTMLInputElement>(null);
    const checkboxId = id || `checkbox-${Math.random().toString(36).substring(2, 11)}`;

    React.useEffect(() => {
      if (checkboxRef.current) {
        checkboxRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const inputRef = ref || checkboxRef;
    const iconSizeClass = getIconSizeClasses(size || 'md');

    const renderCheckIcon = () => {
      if (indeterminate) {
        return (
          <svg
            className={`text-white ${iconSizeClass}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        );
      }

      if (checked) {
        return (
          <svg
            className={`text-white ${iconSizeClass}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>
        );
      }

      return null;
    };

    return (
      <div className="w-full">
        <label htmlFor={checkboxId} className={cn(checkboxVariants({ size }), className)}>
          <div className="relative flex items-start">
            {/* Checkbox Input */}
            <input
              ref={inputRef}
              id={checkboxId}
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
              {renderCheckIcon()}
            </div>
          </div>

          {/* Label and Description */}
          {(label || description) && (
            <div className={cn('ml-2 flex-1', size === 'sm' && 'ml-1.5', size === 'lg' && 'ml-3')}>
              {label && (
                <div
                  className={cn(
                    'font-medium leading-tight font-body',
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
                    'mt-0.5 leading-tight font-body',
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
          <p className="ml-6 mt-1 text-xs text-danger-600 font-body">{errorMessage}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox, checkboxVariants };
