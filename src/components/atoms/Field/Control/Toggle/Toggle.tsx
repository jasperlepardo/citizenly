'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import React, { forwardRef, InputHTMLAttributes } from 'react';

import { cn } from '@/components/shared/utils';

import { TitleDescription } from '@/components/atoms/Field/Control/TitleDescription';

const toggleVariants = cva(
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

const toggleSwitchVariants = cva(
  'relative inline-flex items-center rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent focus:ring-[#7c3aed]/20',
        primary: 'border-transparent focus:ring-[#2563eb]/20',
        error: 'border-transparent focus:ring-[#dc2626]/20',
        disabled: 'border-transparent cursor-not-allowed',
      },
      size: {
        sm: 'h-5 w-9',
        md: 'h-6 w-11',
        lg: 'h-7 w-13',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface ToggleProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'onToggle'>,
    VariantProps<typeof toggleVariants> {
  label?: string;
  description?: string;
  errorMessage?: string;
  variant?: 'default' | 'primary' | 'error' | 'disabled';
  onToggle?: (checked: boolean) => void;
}

const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  (
    {
      className,
      size = 'md',
      variant = 'default',
      label,
      description,
      errorMessage,
      disabled,
      checked = false,
      onToggle,
      onChange,
      ...props
    },
    ref
  ) => {
    const actualVariant = disabled ? 'disabled' : errorMessage ? 'error' : variant;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = e.target.checked;
      onChange?.(e);
      onToggle?.(newChecked);
    };

    // Calculate background colors based on state and variant
    const getBackgroundColor = () => {
      if (disabled) {
        return checked ? 'bg-[#d4d4d4]' : 'bg-[#fafafa]';
      }
      if (!checked) {
        return 'bg-[#d4d4d4]';
      }
      switch (actualVariant) {
        case 'primary':
          return 'bg-[#2563eb]';
        case 'error':
          return 'bg-[#dc2626]';
        default:
          return 'bg-[#7c3aed]';
      }
    };

    // Calculate thumb size and position
    const getThumbClasses = () => {
      const baseClasses =
        'inline-block bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out';

      switch (size) {
        case 'sm':
          return cn(baseClasses, 'h-3 w-3', checked ? 'translate-x-4' : 'translate-x-0');
        case 'lg':
          return cn(baseClasses, 'h-5 w-5', checked ? 'translate-x-6' : 'translate-x-0');
        default: // md
          return cn(baseClasses, 'h-4 w-4', checked ? 'translate-x-5' : 'translate-x-0');
      }
    };

    return (
      <div className="w-full">
        <label className={cn(toggleVariants({ size }), className)}>
          <div className="flex items-start">
            {/* Toggle Switch */}
            <div className="relative">
              <input
                ref={ref}
                type="checkbox"
                className="sr-only"
                disabled={disabled}
                checked={checked}
                onChange={handleChange}
                {...props}
              />
              <div
                className={cn(
                  toggleSwitchVariants({ variant: actualVariant, size }),
                  getBackgroundColor()
                )}
              >
                <div className={getThumbClasses()} />
              </div>
            </div>

            <TitleDescription
              title={label}
              description={description}
              errorMessage={errorMessage}
              variant={actualVariant}
              disabled={disabled}
              size={size}
            />
          </div>
        </label>
      </div>
    );
  }
);

Toggle.displayName = 'Toggle';

export { Toggle, toggleVariants };
