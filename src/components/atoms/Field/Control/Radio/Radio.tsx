'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import React, { forwardRef, InputHTMLAttributes } from 'react';

import { Button, type ButtonProps } from '@/components/atoms/Button/Button';
import { cn } from '@/utils/shared/cssUtils';

import { TitleDescription } from '../TitleDescription';

const radioVariants = cva(
  'relative inline-flex items-center cursor-pointer disabled:cursor-not-allowed',
  {
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
      style: {
        default: '',
        button: 'w-full',
      },
    },
    defaultVariants: {
      size: 'md',
      style: 'default',
    },
  }
);

const radioInputVariants = cva(
  'relative border rounded-full transition-colors focus:outline-hidden focus:ring-2 focus:ring-offset-1',
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
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'style'>,
    VariantProps<typeof radioVariants> {
  label?: string;
  description?: string;
  errorMessage?: string;
  variant?: 'default' | 'primary' | 'error' | 'disabled';
  style?: 'default' | 'button';
  /** Button props to use when style is 'button' */
  buttonProps?: Omit<ButtonProps, 'children' | 'onClick' | 'type' | 'disabled'>;
  /** Whether this radio is used within a group (affects width behavior) */
  inGroup?: boolean;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      className,
      size = 'md',
      variant = 'default',
      style = 'default',
      buttonProps,
      label,
      description,
      errorMessage,
      disabled,
      checked,
      inGroup = false,
      ...props
    },
    ref
  ) => {
    const actualVariant = disabled ? 'disabled' : errorMessage ? 'error' : variant;

    if (style === 'button') {
      const defaultButtonProps: ButtonProps = {
        variant: 'neutral-outline',
        size: 'lg',
        fullWidth: true,
        ...buttonProps,
      };

      const selectedButtonVariant = checked ? 'neutral' : defaultButtonProps.variant;

      const handleClick = () => {
        if (!disabled && props.onChange) {
          const event = {
            target: { value: props.value },
          } as React.ChangeEvent<HTMLInputElement>;
          props.onChange(event);
        }
      };

      return (
        <div className={inGroup ? 'flex-1' : 'w-full'}>
          <input
            ref={ref}
            type="radio"
            className="sr-only"
            disabled={disabled}
            checked={checked}
            {...props}
          />
          <Button
            {...defaultButtonProps}
            variant={selectedButtonVariant}
            disabled={disabled}
            className={cn(defaultButtonProps.className, className)}
            type="button"
            onClick={handleClick}
          >
            {label}
          </Button>
        </div>
      );
    }

    return (
      <div className={inGroup ? '' : 'w-full'}>
        <label className={cn(radioVariants({ size, style }), className)}>
          <div className="relative flex items-start">
            {/* Radio Input */}
            <input
              ref={ref}
              type="radio"
              className={cn(
                radioInputVariants({ variant: actualVariant, size }),
                'shrink-0 appearance-none'
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

          <TitleDescription
            title={label}
            description={description}
            errorMessage={errorMessage}
            variant={actualVariant}
            disabled={disabled}
            size={size}
          />
        </label>
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

  // Check if any child has button style to determine layout
  const hasButtonStyle = React.Children.toArray(children).some(
    child =>
      React.isValidElement(child) &&
      child.type === Radio &&
      (child as React.ReactElement<RadioProps>).props.style === 'button'
  );

  // Get layout classes based on button style and orientation
  const getLayoutClasses = () => {
    if (hasButtonStyle) {
      return 'flex-row w-full'; // Button group spans full width
    }
    return orientation === 'vertical' ? 'flex-col gap-4' : 'flex-row flex-wrap gap-6';
  };

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('flex', getLayoutClasses())}>
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child) && child.type === Radio) {
            const childElement = child as React.ReactElement<RadioProps>;
            const isFirst = index === 0;
            const isLast = index === React.Children.count(children) - 1;

            return React.cloneElement(childElement, {
              name,
              checked: childElement.props.value === value,
              onChange: handleChange,
              errorMessage: undefined, // Don't show individual error messages
              inGroup: true, // Mark as being used in a group
              buttonProps: hasButtonStyle
                ? {
                    ...childElement.props.buttonProps,
                    className: cn(
                      'appearance-none relative rounded-none -mr-px',
                      isFirst && 'rounded-l-sm mr-0',
                      isLast && 'rounded-r-sm',
                      childElement.props.buttonProps?.className
                    ),
                  }
                : childElement.props.buttonProps,
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
