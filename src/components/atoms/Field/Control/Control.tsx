'use client';

import React, { forwardRef, InputHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { TitleDescription } from './TitleDescription';

const controlVariants = cva(
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

// Common input variants for checkbox and radio
const inputVariants = cva(
  'relative border transition-colors focus:outline-hidden focus:ring-2 focus:ring-offset-1',
  {
    variants: {
      variant: {
        default: 'border-[#d4d4d4] bg-white focus:ring-[#7c3aed]/20',
        primary: 'border-[#d4d4d4] bg-white focus:ring-[#2563eb]/20',
        error: 'border-[#dc2626] bg-white focus:ring-[#dc2626]/20',
        disabled: 'border-[#d4d4d4] bg-[#fafafa] cursor-not-allowed',
      },
      size: {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
      },
      type: {
        checkbox: 'rounded-sm',
        radio: 'rounded-full',
        toggle: 'rounded-full', // Will be overridden with specific toggle styles
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      type: 'checkbox',
    },
  }
);

// Toggle-specific variants
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

export interface ControlProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'onToggle'>,
    VariantProps<typeof controlVariants> {
  /** Option type: checkbox, radio, or toggle */
  type: 'checkbox' | 'radio' | 'toggle';
  /** Label text displayed next to the option */
  label?: string;
  /** Description text displayed below the label */
  description?: string;
  /** Error message to display */
  errorMessage?: string;
  /** Visual variant */
  variant?: 'default' | 'primary' | 'error' | 'disabled';
  /** Indeterminate state (checkbox only) */
  indeterminate?: boolean;
  /** Toggle change handler (toggle only) */
  onToggle?: (checked: boolean) => void;
}

const Control = forwardRef<HTMLInputElement, ControlProps>(
  (
    {
      className,
      size = 'md',
      variant = 'default',
      type,
      label,
      description,
      errorMessage,
      indeterminate = false,
      disabled,
      checked = false,
      onToggle,
      onChange,
      ...props
    },
    ref
  ) => {
    const actualVariant = disabled ? 'disabled' : errorMessage ? 'error' : variant;
    const checkboxRef = React.useRef<HTMLInputElement>(null);

    // Handle indeterminate state for checkboxes
    React.useEffect(() => {
      if (type === 'checkbox' && checkboxRef.current) {
        checkboxRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate, type]);

    // Use either the forwarded ref or our internal ref
    const inputRef = ref || checkboxRef;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = e.target.checked;
      onChange?.(e);
      if (type === 'toggle') {
        onToggle?.(newChecked);
      }
    };

    // Render toggle
    const renderToggle = () => {
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

      const getThumbClasses = () => {
        const baseClasses = 'inline-block rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out';
        const sizeClasses = {
          sm: 'w-3 h-3',
          md: 'w-4 h-4',
          lg: 'w-5 h-5',
        };
        const translateClasses = checked
          ? {
              sm: 'translate-x-4',
              md: 'translate-x-5',
              lg: 'translate-x-6',
            }
          : 'translate-x-0';

        return cn(baseClasses, sizeClasses[size!], translateClasses[size!] || translateClasses);
      };

      return (
        <div className="relative flex items-start">
          <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-disabled={disabled}
            className={cn(
              toggleSwitchVariants({ variant: actualVariant, size }),
              getBackgroundColor()
            )}
            onClick={() => {
              if (!disabled) {
                const newChecked = !checked;
                onToggle?.(newChecked);
                // Create synthetic event for compatibility
                const syntheticEvent = {
                  target: { checked: newChecked },
                  currentTarget: { checked: newChecked },
                } as React.ChangeEvent<HTMLInputElement>;
                onChange?.(syntheticEvent);
              }
            }}
          >
            <span className={getThumbClasses()} />
          </button>

          {/* Hidden input for form compatibility */}
          <input
            ref={inputRef}
            type="checkbox"
            className="sr-only"
            checked={checked}
            disabled={disabled}
            onChange={handleChange}
            {...props}
          />
        </div>
      );
    };

    // Render checkbox or radio
    const renderInput = () => {
      return (
        <div className="relative flex items-start">
          <input
            ref={inputRef}
            type={type}
            className={cn(
              inputVariants({ variant: actualVariant, size, type }),
              'shrink-0 appearance-none',
              // Checked styles
              type === 'checkbox' && 'checked:bg-[#7c3aed] checked:border-[#7c3aed]',
              type === 'checkbox' && actualVariant === 'primary' && 'checked:bg-[#2563eb] checked:border-[#2563eb]',
              type === 'checkbox' && actualVariant === 'error' && 'checked:bg-[#dc2626] checked:border-[#dc2626]',
              type === 'checkbox' && actualVariant === 'disabled' && 'checked:bg-[#d4d4d4]',
              type === 'radio' && 'checked:border-[#7c3aed]',
              type === 'radio' && actualVariant === 'primary' && 'checked:border-[#2563eb]',
              type === 'radio' && actualVariant === 'error' && 'checked:border-[#dc2626]'
            )}
            disabled={disabled}
            checked={checked}
            onChange={handleChange}
            {...props}
          />

          {/* Custom indicators */}
          {type === 'checkbox' && (
            <div
              className={cn(
                'pointer-events-none absolute inset-0 flex items-center justify-center',
                size === 'sm' && 'h-4 w-4',
                size === 'md' && 'h-5 w-5',
                size === 'lg' && 'h-6 w-6'
              )}
            >
              {indeterminate ? (
                <div
                  className={cn(
                    'bg-white',
                    size === 'sm' && 'h-0.5 w-2',
                    size === 'md' && 'h-0.5 w-2.5',
                    size === 'lg' && 'h-1 w-3'
                  )}
                />
              ) : (
                checked && (
                  <svg
                    className={cn(
                      'text-white',
                      size === 'sm' && 'h-3 w-3',
                      size === 'md' && 'h-3 w-3',
                      size === 'lg' && 'h-4 w-4'
                    )}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )
              )}
            </div>
          )}

          {type === 'radio' && checked && (
            <div
              className={cn(
                'pointer-events-none absolute inset-0 flex items-center justify-center',
                size === 'sm' && 'h-4 w-4',
                size === 'md' && 'h-5 w-5',
                size === 'lg' && 'h-6 w-6'
              )}
            >
              <div
                className={cn(
                  'rounded-full',
                  actualVariant === 'primary' && 'bg-[#2563eb]',
                  actualVariant === 'error' && 'bg-[#dc2626]',
                  actualVariant === 'disabled' && 'bg-[#d4d4d4]',
                  actualVariant === 'default' && 'bg-[#7c3aed]',
                  size === 'sm' && 'h-1.5 w-1.5',
                  size === 'md' && 'h-2 w-2',
                  size === 'lg' && 'h-2.5 w-2.5'
                )}
              />
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="w-full">
        <label className={cn(controlVariants({ size }), className)}>
          {type === 'toggle' ? renderToggle() : renderInput()}
          
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

Control.displayName = 'Control';

export { Control };
export default Control;