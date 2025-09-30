'use client';

import React, { forwardRef, useState, useCallback, useMemo } from 'react';

import type { InputProps } from '@/types/app/ui/input';
import { getContainerClasses, getInputClasses, getInputStyles } from '@/utils/ui/inputUtils';

export const Input = React.memo(forwardRef<HTMLInputElement, InputProps>(
  (
    {
      error,
      className = '',
      clearable = false,
      dismissible = false,
      onClear,
      value,
      showPasswordToggle = false,
      type,
      leftIcon,
      rightIcon,
      name,
      id,
      disabled = false,
      loading = false,
      suppressActions = false,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    // Memoize computed values
    const inputId = useMemo(() => id || `input-field`, [id]);
    const hasValue = useMemo(() => value !== undefined && value !== '', [value]);
    const isPasswordInput = useMemo(() => type === 'password', [type]);
    const effectiveType = useMemo(() =>
      isPasswordInput && showPassword ? 'text' : type,
      [isPasswordInput, showPassword, type]
    );

    const showClearButton = useMemo(() =>
      !suppressActions && (clearable || dismissible) && hasValue,
      [suppressActions, clearable, dismissible, hasValue]
    );

    const showPasswordButton = useMemo(() =>
      !suppressActions && showPasswordToggle && isPasswordInput,
      [suppressActions, showPasswordToggle, isPasswordInput]
    );

    // Memoize container classes
    const containerClasses = useMemo(() =>
      getContainerClasses(error, className),
      [error, className]
    );

    const handleClear = useCallback(() => {
      if (onClear) {
        onClear();
      }
    }, [onClear]);

    const togglePasswordVisibility = useCallback(() => {
      setShowPassword(prev => !prev);
    }, []);

    // Memoized icons
    const loadingIcon = useMemo(() => (
      <svg className="size-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    ), []);

    const clearIcon = useMemo(() => (
      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ), []);

    const eyeOffIcon = useMemo(() => (
      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
        />
      </svg>
    ), []);

    const eyeIcon = useMemo(() => (
      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
    ), []);

    return (
      <div className="relative">
        <div className={containerClasses}>
          {/* Left Icon */}
          {leftIcon && (
            <div className="mr-2 flex size-5 shrink-0 items-center justify-center text-gray-400 dark:text-gray-500">
              {leftIcon}
            </div>
          )}

          <div className="flex min-h-0 min-w-0 grow basis-0 flex-col items-center justify-center gap-0.5 px-1 py-0">
            <div className="font-montserrat flex w-full flex-col justify-center overflow-hidden leading-5 font-normal text-nowrap text-ellipsis">
              <input
                ref={ref}
                id={inputId}
                name={name}
                type={effectiveType}
                value={value || ''}
                {...props}
                className={getInputClasses()}
                style={getInputStyles()}
                disabled={disabled}
                aria-invalid={error ? 'true' : 'false'}
              />
            </div>
          </div>

          {/* Right Icons and Controls */}
          <div className="flex items-center space-x-2">
            {/* Loading Indicator */}
            {loading && (
              <div className="flex size-5 shrink-0 items-center justify-center text-gray-600 dark:text-gray-400">
                {loadingIcon}
              </div>
            )}

            {/* Right Icon */}
            {rightIcon && (
              <div className="flex size-5 shrink-0 items-center justify-center text-gray-400 dark:text-gray-500">
                {rightIcon}
              </div>
            )}

            {/* Clear/Dismiss Button */}
            {showClearButton && (
              <button
                type="button"
                className="focus:ring-opacity-50 flex size-5 shrink-0 items-center justify-center rounded text-gray-400 transition-colors duration-200 hover:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-gray-500 dark:hover:text-gray-300"
                onClick={handleClear}
                aria-label="Clear input"
                tabIndex={-1}
              >
                {clearIcon}
              </button>
            )}

            {/* Password Toggle */}
            {showPasswordButton && (
              <button
                type="button"
                className="focus:ring-opacity-50 flex size-5 shrink-0 items-center justify-center rounded text-gray-400 transition-colors duration-200 hover:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-gray-500 dark:hover:text-gray-300"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? eyeOffIcon : eyeIcon}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
));

Input.displayName = 'Input';

export default Input;
