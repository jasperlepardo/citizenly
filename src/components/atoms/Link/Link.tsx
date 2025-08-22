'use client';

/**
 * Link Component
 *
 * A versatile link component that shares the same design system as Button.
 * Built with accessibility in mind and supports icons, external links, and full customization.
 *
 * @example
 * ```tsx
 * // Basic link
 * <Link href="/dashboard">Go to Dashboard</Link>
 *
 * // With variant and size
 * <Link href="/delete" variant="danger" size="lg">Delete Account</Link>
 *
 * // With icons
 * <Link href="/add" leftIcon={<PlusIcon />}>Add Item</Link>
 *
 * // External link
 * <Link href="https://example.com" external>Visit Website</Link>
 *
 * // Icon-only link
 * <Link href="/settings" iconOnly aria-label="Settings">
 *   <SettingsIcon />
 * </Link>
 * ```
 */
import React, { forwardRef, AnchorHTMLAttributes } from 'react';
import NextLink from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utilities';

// Link variants using pure Tailwind classes
const linkVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // Primary variants
        primary: 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700',
        'primary-subtle': 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-400 dark:hover:bg-blue-900',
        'primary-faded': 'bg-blue-50/50 text-blue-600 hover:bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400 dark:hover:bg-blue-950',
        'primary-outline': 'border border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950',

        // Secondary variants
        secondary: 'bg-zinc-600 text-white hover:bg-zinc-700 dark:bg-zinc-600 dark:hover:bg-zinc-700',
        'secondary-subtle': 'bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800',
        'secondary-faded': 'bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800',
        'secondary-outline': 'bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800',

        // Success variants
        success: 'bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700',
        'success-subtle': 'bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-400 dark:hover:bg-green-900',
        'success-faded': 'bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-400 dark:hover:bg-green-900',
        'success-outline': 'bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-400 dark:hover:bg-green-900',

        // Warning variants
        warning: 'bg-yellow-600 text-white hover:bg-yellow-700 dark:bg-yellow-600 dark:hover:bg-yellow-700',
        'warning-subtle': 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-950 dark:text-yellow-400 dark:hover:bg-yellow-900',
        'warning-faded': 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-950 dark:text-yellow-400 dark:hover:bg-yellow-900',
        'warning-outline': 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-950 dark:text-yellow-400 dark:hover:bg-yellow-900',

        // Danger variants
        danger: 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700',
        'danger-subtle': 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900',
        'danger-faded': 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900',
        'danger-outline': 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900',

        // Neutral variants
        zinc: 'bg-zinc-600 text-white hover:bg-zinc-700 dark:bg-zinc-600 dark:hover:bg-zinc-700',
        'zinc-subtle': 'bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800',
        'zinc-faded': 'bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800',
        'zinc-outline': 'border border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900',

        // Ghost variants
        ghost: 'hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100',

        // Link-specific variants
        link: 'text-blue-600 underline-offset-4 hover:underline dark:text-blue-400',
        'link-subtle': 'text-zinc-600 underline-offset-4 hover:underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-9 px-4 text-sm',
        regular: 'h-10 px-4 text-base',
        lg: 'h-11 px-6 text-lg',
      },
      iconOnly: {
        true: 'w-10 h-10 p-0',
        false: '',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'link',
      size: 'regular',
      iconOnly: false,
      fullWidth: false,
    },
  }
);

/**
 * Link component props
 */
export interface LinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>,
    VariantProps<typeof linkVariants> {
  /** The URL to navigate to */
  href: string;

  /** Whether this is an external link (opens in new tab) */
  external?: boolean;

  /** Icon to display on the left side of the link */
  leftIcon?: React.ReactNode;

  /** Icon to display on the right side of the link */
  rightIcon?: React.ReactNode;

  /** Accessible label for icon-only links or additional context */
  'aria-label'?: string;
}

/**
 * Link component that shares the same design system as Button.
 *
 * Features:
 * - Multiple visual variants (same as Button + link-specific variants)
 * - Semantic variant styles (subtle, faded, outline)
 * - Icon support (left, right, icon-only)
 * - Full width and size options
 * - Built-in accessibility (focus management, ARIA attributes)
 * - External link handling with security attributes
 * - Next.js Link integration for internal navigation
 */
const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      className,
      variant,
      size,
      iconOnly,
      fullWidth,
      href,
      external = false,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    const linkClassName = cn(linkVariants({ variant, size, iconOnly, fullWidth, className }));

    // External link
    if (external || href.startsWith('http')) {
      return (
        <a
          href={href}
          className={linkClassName}
          ref={ref}
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {leftIcon && leftIcon}
          {!iconOnly && children}
          {iconOnly && !leftIcon && !rightIcon && children}
          {rightIcon && rightIcon}
          {external && !iconOnly && !rightIcon && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          )}
        </a>
      );
    }

    // Internal link with Next.js
    return (
      <NextLink href={href} className={linkClassName} ref={ref} {...props}>
        {leftIcon && leftIcon}
        {!iconOnly && children}
        {iconOnly && !leftIcon && !rightIcon && children}
        {rightIcon && rightIcon}
      </NextLink>
    );
  }
);

Link.displayName = 'Link';

export { Link, linkVariants };