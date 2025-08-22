'use client';

import React, { forwardRef } from 'react';

export interface OptionProps {
  /** Whether this option is currently selected */
  selected?: boolean;
  /** Whether this option is currently focused/highlighted */
  focused?: boolean;
  /** Whether this option is disabled */
  disabled?: boolean;
  /** Main option label */
  label: string;
  /** Optional description text */
  description?: string;
  /** Optional value for the option */
  value?: string;
  /** Optional badge text to display on the right */
  badge?: string;
  /** Click handler */
  onClick?: () => void;
  /** Mouse enter handler for focus management */
  onMouseEnter?: () => void;
  /** Custom class name */
  className?: string;
  /** Custom children to override default rendering */
  children?: React.ReactNode;
}

export const Option = forwardRef<HTMLDivElement, OptionProps>(
  ({
    selected = false,
    focused = false,
    disabled = false,
    label,
    description,
    value,
    badge,
    onClick,
    onMouseEnter,
    className = '',
    children,
  }, ref) => {

    const handleClick = () => {
      if (!disabled && onClick) {
        onClick();
      }
    };

    const handleMouseEnter = () => {
      if (!disabled && onMouseEnter) {
        onMouseEnter();
      }
    };

    return (
      <div
        ref={ref}
        role="option"
        aria-selected={selected}
        aria-disabled={disabled}
        className={`px-3 py-3 sm:px-4 cursor-pointer transition-colors duration-150 ${
          focused
            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
            : 'text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
        } ${
          selected
            ? 'bg-blue-100 dark:bg-blue-900/20 font-medium'
            : ''
        } ${
          disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : ''
        } ${className}`}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
      >
        {children ? (
          children
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">
                {label.includes(',') ? (
                  <>
                    {label.split(',')[0]}
                    <span className="text-gray-500 dark:text-gray-400 font-normal">
                      , {label.split(',').slice(1).join(',')}
                    </span>
                  </>
                ) : (
                  label
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {badge && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                  {badge}
                </span>
              )}
              {selected && (
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

Option.displayName = 'Option';

export default Option;