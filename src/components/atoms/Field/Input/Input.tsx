'use client';

import React, { forwardRef, useState } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Error message to display */
  error?: string;
  /** Custom class name */
  className?: string;
  /** Whether to show a clear button when input has content */
  clearable?: boolean;
  /** Callback when clear button is clicked */
  onClear?: () => void;
  /** Whether to show password visibility toggle for password inputs */
  showPasswordToggle?: boolean;
  /** Left icon element */
  leftIcon?: React.ReactNode;
  /** Right icon element */
  rightIcon?: React.ReactNode;
  /** Whether the input is dismissible/clearable */
  dismissible?: boolean;
  /** Loading state for async operations */
  loading?: boolean;
  /** Whether to suppress clear/dismiss buttons (for Select usage) */
  suppressActions?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
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

    // Generate unique IDs for the form elements
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const hasValue = value !== undefined && value !== '';
    const showClearButton = !suppressActions && (clearable || dismissible) && hasValue;
    const isPasswordInput = type === 'password';
    const showPasswordButton = !suppressActions && showPasswordToggle && isPasswordInput;
    const effectiveType = isPasswordInput && showPassword ? 'text' : type;

    // Calculate left padding for left icon
    const leftPadding = leftIcon ? 'pl-10' : 'pl-3';

    // Calculate right padding for right elements
    const rightElements = [rightIcon, showClearButton, showPasswordButton].filter(Boolean);
    const rightPadding =
      rightElements.length > 0
        ? rightElements.length === 1
          ? 'pr-10'
          : rightElements.length === 2
            ? 'pr-16'
            : 'pr-20'
        : 'pr-3';

    const handleClear = () => {
      if (onClear) {
        onClear();
      }
    };

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    return (
      <div className="relative">
        <div
          className={`font-system relative flex w-full items-center transition-colors focus-within:outline-hidden ${
            error
              ? 'rounded-sm border border-red-600 bg-white focus-within:border-red-600 focus-within:shadow-[0px_0px_0px_4px_rgba(220,38,38,0.32)] dark:bg-gray-800'
              : 'rounded-sm border border-gray-300 bg-white focus-within:border-blue-600 focus-within:shadow-[0px_0px_0px_4px_rgba(59,130,246,0.32)] dark:border-gray-600 dark:bg-gray-800'
          } min-h-10 p-2 text-base ${className}`}
        >
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
                value={value}
                className="font-montserrat w-full border-0 bg-transparent text-base leading-5 font-normal text-gray-600 shadow-none ring-0 outline-0 placeholder:text-gray-500 focus:border-0 focus:shadow-none focus:ring-0 focus:outline-0 dark:text-gray-300 dark:placeholder:text-gray-400"
                style={{
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                  appearance: 'none',
                }}
                disabled={disabled}
                aria-invalid={error ? 'true' : 'false'}
                {...props}
              />
            </div>
          </div>

          {/* Right Icons and Controls */}
          <div className="flex items-center space-x-2">
            {/* Loading Indicator */}
            {loading && (
              <div className="flex size-5 shrink-0 items-center justify-center text-gray-600 dark:text-gray-400">
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
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
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
                {showPassword ? (
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                    />
                  </svg>
                ) : (
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
                )}
              </button>
            )}
          </div>
        </div>

        {/* Hidden input for form submission */}
        <input type="hidden" name={name} value={value || ''} />
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
