'use client';

import React, { forwardRef, InputHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const radioVariants = cva(
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

const radioInputVariants = cva(
  'relative border rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1',
  {
    variants: {
      variant: {
        default: 'border-[#d4d4d4] bg-white checked:border-[#7c3aed] focus:ring-[#7c3aed]/20',
        primary: 'border-[#d4d4d4] bg-white checked:border-[#2563eb] focus:ring-[#2563eb]/20',
        error: 'border-[#dc2626] bg-white checked:border-[#dc2626] focus:ring-[#dc2626]/20',
        disabled: 'border-[#d4d4d4] bg-[#fafafa] cursor-not-allowed',
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

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof radioVariants> {
  label?: string;
  description?: string;
  errorMessage?: string;
  variant?: 'default' | 'primary' | 'error' | 'disabled';
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      className,
      size = 'md',
      variant = 'default',
      label,
      description,
      errorMessage,
      disabled,
      checked,
      ...props
    },
    ref
  ) => {
    const actualVariant = disabled ? 'disabled' : errorMessage ? 'error' : variant;

    return (
      <div className="w-full">
        <label className={cn(radioVariants({ size }), className)}>
          <div className="relative flex items-start">
            {/* Radio Input */}
            <input
              ref={ref}
              type="radio"
              className={cn(
                radioInputVariants({ variant: actualVariant, size }),
                'flex-shrink-0 appearance-none'
              )}
              disabled={disabled}
              checked={checked}
              {...props}
            />

            {/* Custom Radio Dot */}
            <div
              className={cn(
                'pointer-events-none absolute inset-0 flex items-center justify-center',
                size === 'sm' && 'h-4 w-4',
                size === 'md' && 'h-5 w-5',
                size === 'lg' && 'h-6 w-6'
              )}
            >
              {checked && (
                <div
                  className={cn(
                    'rounded-full',
                    actualVariant === 'default' && 'bg-[#7c3aed]',
                    actualVariant === 'primary' && 'bg-[#2563eb]',
                    actualVariant === 'error' && 'bg-[#dc2626]',
                    actualVariant === 'disabled' && 'bg-[#d4d4d4]',
                    size === 'sm' && 'h-1.5 w-1.5',
                    size === 'md' && 'h-2 w-2',
                    size === 'lg' && 'h-2.5 w-2.5'
                  )}
                />
              )}
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

Radio.displayName = 'Radio';

// Radio Group Component
export interface RadioGroupProps {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  errorMessage?: string;
}

export const RadioGroup = ({
  name,
  value,
  onChange,
  children,
  className,
  orientation = 'vertical',
  errorMessage,
}: RadioGroupProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn('flex gap-4', orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap')}
      >
        {React.Children.map(children, child => {
          if (React.isValidElement(child) && child.type === Radio) {
            const childElement = child as React.ReactElement<RadioProps>;
            return React.cloneElement(childElement, {
              name,
              checked: childElement.props.value === value,
              onChange: handleChange,
              errorMessage: undefined, // Don't show individual error messages
            });
          }
          return child;
        })}
      </div>

      {/* Group Error Message */}
      {errorMessage && (
        <p className="mt-2 font-['Montserrat'] text-xs text-[#b91c1c]">{errorMessage}</p>
      )}
    </div>
  );
};

export { Radio, radioVariants };
