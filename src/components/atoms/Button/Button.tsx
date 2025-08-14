'use client';

/**
 * Button Component
 *
 * A versatile button component with multiple variants, sizes, and states.
 * Built with accessibility in mind and supports icons, loading states, and full customization.
 *
 * @example
 * ```tsx
 * // Basic button
 * <Button>Click me</Button>
 *
 * // With variant and size
 * <Button variant="danger" size="lg">Delete</Button>
 *
 * // With icons
 * <Button leftIcon={<PlusIcon />}>Add Item</Button>
 *
 * // Loading state
 * <Button loading>Saving...</Button>
 *
 * // Icon-only button
 * <Button iconOnly aria-label="Settings">
 *   <SettingsIcon />
 * </Button>
 * ```
 */
import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1 rounded text-base font-medium leading-5 transition-colors font-system focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        // Primary variants
        primary:
          'bg-blue-600 text-white hover:bg-blue-500 focus-visible:ring-blue-600 disabled:text-muted disabled:bg-background-muted',
        'primary-subtle':
          'bg-blue-50 text-blue-800 hover:bg-blue-100 hover:text-blue-900 focus-visible:ring-blue-800',
        'primary-faded':
          'bg-blue-100 text-blue-800 hover:bg-blue-200 hover:text-blue-900 focus-visible:ring-blue-800',
        'primary-outline':
          'border border-blue-600 text-blue-800 bg-surface hover:bg-blue-50 hover:text-blue-900 focus-visible:ring-blue-800',

        // Secondary variants
        secondary: 'bg-purple-600 text-white hover:bg-purple-500 focus-visible:ring-purple-600',
        'secondary-subtle':
          'bg-purple-50 text-purple-800 hover:bg-purple-100 hover:text-purple-900 focus-visible:ring-purple-800',
        'secondary-faded':
          'bg-purple-100 text-purple-800 hover:bg-purple-200 hover:text-purple-900 focus-visible:ring-purple-800',
        'secondary-outline':
          'border border-purple-600 text-purple-800 bg-surface hover:bg-purple-50 hover:text-purple-900 focus-visible:ring-purple-800',

        // Success variants
        success: 'bg-green-600 text-white hover:bg-green-500 focus-visible:ring-green-600',
        'success-subtle':
          'bg-green-50 text-green-800 hover:bg-green-100 hover:text-green-900 focus-visible:ring-green-800',
        'success-faded':
          'bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900 focus-visible:ring-green-800',
        'success-outline':
          'border border-green-600 text-green-800 bg-surface hover:bg-green-50 hover:text-green-900 focus-visible:ring-green-800',

        // Warning variants
        warning: 'bg-orange-600 text-white hover:bg-orange-500 focus-visible:ring-orange-600',
        'warning-subtle':
          'bg-orange-50 text-orange-800 hover:bg-orange-100 hover:text-orange-900 focus-visible:ring-orange-800',
        'warning-faded':
          'bg-orange-100 text-orange-800 hover:bg-orange-200 hover:text-orange-900 focus-visible:ring-orange-800',
        'warning-outline':
          'border border-orange-600 text-orange-800 bg-surface hover:bg-orange-50 hover:text-orange-900 focus-visible:ring-orange-800',

        // Danger variants
        danger: 'bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-600',
        'danger-subtle':
          'bg-red-50 text-red-800 hover:bg-red-100 hover:text-red-900 focus-visible:ring-red-800',
        'danger-faded':
          'bg-red-100 text-red-800 hover:bg-red-200 hover:text-red-900 focus-visible:ring-red-800',
        'danger-outline':
          'border border-red-600 text-red-800 bg-surface hover:bg-red-50 hover:text-red-900 focus-visible:ring-red-800',

        // Neutral variants
        neutral:
          'bg-border-default focus-visible:ring-secondary text-secondary hover:text-primary hover:bg-surface-hover disabled:text-muted disabled:bg-background-muted',
        'neutral-subtle':
          'hover:bg-border-default focus-visible:ring-secondary text-secondary bg-surface-hover hover:text-primary disabled:text-muted disabled:bg-background-muted',
        'neutral-faded':
          'bg-border-default focus-visible:ring-secondary text-secondary hover:text-primary hover:bg-surface-hover disabled:text-muted disabled:bg-background-muted',
        'neutral-outline':
          'focus-visible:ring-secondary border text-secondary bg-surface border-default hover:text-primary hover:bg-surface-hover disabled:text-muted disabled:bg-background-muted disabled:border-default',

        // Ghost variants
        ghost:
          'focus-visible:ring-secondary text-secondary hover:text-primary hover:bg-surface-hover disabled:text-muted',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-9 px-4 text-base',
        lg: 'h-10 px-6 text-base',
        regular: 'p-2 text-base', // p=8 (2rem = 32px, but using px-2 py-2 for content padding)
      },
      iconOnly: {
        true: 'aspect-square p-0',
        false: '',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    compoundVariants: [
      {
        size: 'sm',
        iconOnly: true,
        class: 'size-8',
      },
      {
        size: 'md',
        iconOnly: true,
        class: 'size-9',
      },
      {
        size: 'lg',
        iconOnly: true,
        class: 'size-10',
      },
      {
        size: 'regular',
        iconOnly: true,
        class: 'size-9 p-2',
      },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'regular',
      iconOnly: false,
      fullWidth: false,
    },
  }
);

/**
 * Button component props
 */
export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as a different element (future implementation for Radix Slot) */
  asChild?: boolean;

  /** Show loading spinner and disable button */
  loading?: boolean;

  /** Icon to display on the left side of the button */
  leftIcon?: React.ReactNode;

  /** Icon to display on the right side of the button */
  rightIcon?: React.ReactNode;
}

/**
 * Button component with comprehensive variant support and accessibility features.
 *
 * Features:
 * - Multiple visual variants (primary, secondary, success, warning, danger, neutral, ghost)
 * - Semantic variant styles (subtle, faded, outline)
 * - Loading states with spinner animation
 * - Icon support (left, right, icon-only)
 * - Full width and size options
 * - Built-in accessibility (focus management, ARIA attributes)
 * - Proper disabled state handling
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      iconOnly,
      fullWidth,
      asChild: _asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        type="button"
        className={cn(buttonVariants({ variant, size, iconOnly, fullWidth, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <svg
            className="size-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon && leftIcon}
        {!iconOnly && children}
        {iconOnly && !leftIcon && !rightIcon && children}
        {!loading && rightIcon && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
