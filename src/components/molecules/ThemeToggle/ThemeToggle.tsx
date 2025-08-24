'use client';

import React from 'react';
import { useTheme } from '@/contexts';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib';

const themeToggleVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400',
        ghost: 'hover:bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
        outline: 'border border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
      },
      size: {
        sm: 'h-8 w-8 p-1',
        md: 'h-9 w-9 p-2',
        lg: 'h-10 w-10 p-2.5',
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'md',
    },
  }
);

export interface ThemeToggleProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof themeToggleVariants> {
  showLabel?: boolean;
  labelPosition?: 'left' | 'right';
}

const ThemeToggle = React.forwardRef<HTMLButtonElement, ThemeToggleProps>(
  ({ className, variant, size, showLabel = false, labelPosition = 'right', ...props }, ref) => {
    const { theme, actualTheme, toggleTheme } = useTheme();

    const getIcon = () => {
      if (theme === 'system') {
        // Monitor/system icon for system theme
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        );
      } else if (actualTheme === 'dark') {
        // Moon icon for dark theme
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        );
      } else {
        // Sun icon for light theme
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        );
      }
    };

    const getLabel = () => {
      switch (theme) {
        case 'light':
          return 'Light';
        case 'dark':
          return 'Dark';
        case 'system':
          return 'System';
        default:
          return 'Theme';
      }
    };

    const handleClick = () => {
      toggleTheme();
    };

    return (
      <button
        ref={ref}
        className={cn(themeToggleVariants({ variant, size }), className)}
        onClick={handleClick}
        title={`Current theme: ${getLabel()}${theme === 'system' ? ` (${actualTheme})` : ''}. Click to toggle.`}
        aria-label={`Toggle theme. Current: ${getLabel()}${theme === 'system' ? ` (following system: ${actualTheme})` : ''}`}
        {...props}
      >
        {showLabel && labelPosition === 'left' && (
          <span className="font-montserrat mr-2 text-sm font-medium">{getLabel()}</span>
        )}
        {getIcon()}
        {showLabel && labelPosition === 'right' && (
          <span className="font-montserrat ml-2 text-sm font-medium">{getLabel()}</span>
        )}
      </button>
    );
  }
);

ThemeToggle.displayName = 'ThemeToggle';

export { ThemeToggle, themeToggleVariants };
