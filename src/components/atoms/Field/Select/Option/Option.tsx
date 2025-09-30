'use client';

import React, { forwardRef, useCallback, useMemo } from 'react';

import type { OptionProps } from '@/types/app/ui/select';
import { parseOptionLabel, getOptionClassName } from '@/utils/ui/optionUtils';

export const Option = React.memo(forwardRef<HTMLDivElement, OptionProps>(
  (
    {
      id,
      selected = false,
      focused = false,
      disabled = false,
      label,
      description,
      value,
      badge,
      onClick,
      onMouseEnter,
      onKeyDown,
      className = '',
      children,
    },
    ref
  ) => {
    const handleClick = useCallback(() => {
      if (!disabled && onClick) {
        onClick();
      }
    }, [disabled, onClick]);

    const handleMouseEnter = useCallback(() => {
      if (!disabled && onMouseEnter) {
        onMouseEnter();
      }
    }, [disabled, onMouseEnter]);

    const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!disabled) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick?.();
        }
        onKeyDown?.(event);
      }
    }, [disabled, onClick, onKeyDown]);

    // Memoize class name computation
    const computedClassName = useMemo(() =>
      getOptionClassName(focused, selected, disabled, className),
      [focused, selected, disabled, className]
    );

    // Memoize label parsing for performance
    const parsedLabel = useMemo(() => parseOptionLabel(label), [label]);

    // Memoize checkmark icon
    const checkmarkIcon = useMemo(() => (
      <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    ), []);

    return (
      <div
        ref={ref}
        id={id}
        role="option"
        aria-selected={selected}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        className={computedClassName}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onKeyDown={handleKeyDown}
      >
        {children ?? (
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">
                {parsedLabel.secondary ? (
                  <>
                    {parsedLabel.main}
                    <span className="font-normal text-gray-500 dark:text-gray-400">
                      , {parsedLabel.secondary}
                    </span>
                  </>
                ) : (
                  parsedLabel.main
                )}
              </div>
              {description && value && (
                <div className="truncate text-xs text-gray-500 dark:text-gray-400">
                  {description}
                </div>
              )}
            </div>
            <div className="flex flex-shrink-0 items-center gap-2">
              {badge && (
                <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                  {badge}
                </span>
              )}
              {selected && checkmarkIcon}
            </div>
          </div>
        )}
      </div>
    );
  }
));

Option.displayName = 'Option';

export default Option;
