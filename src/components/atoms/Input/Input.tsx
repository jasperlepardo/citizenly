'use client';

import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showBefore?: boolean;
  showAfter?: boolean;
  beforeIcon?: React.ReactNode;
  afterIcon?: React.ReactNode;
  state?: 'default' | 'active' | 'filled' | 'error' | 'disabled';
  error?: string; // Legacy compatibility
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      showBefore = true,
      showAfter = true,
      beforeIcon,
      afterIcon,
      state = 'default',
      className = '',
      error,
      ...props
    },
    ref
  ) => {
    // Set state to error if error prop is provided
    const actualState = error ? 'error' : state;
    const defaultBeforeIcon = (
      <div className="flex size-5 items-center justify-center text-secondary">
        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    );

    const defaultAfterIcon = (
      <div className="flex size-5 items-center justify-center text-secondary">
        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>
    );

    return (
      <div>
        <div
          className={`relative rounded transition-colors font-system focus-within:outline-none ${
            actualState === 'error'
              ? 'border border-red-600 bg-surface focus-within:border-red-600 focus-within:shadow-[0px_0px_0px_4px_rgba(220,38,38,0.32)]'
              : 'border bg-surface border-default focus-within:border-blue-600 focus-within:shadow-[0px_0px_0px_4px_rgba(59,130,246,0.32)]'
          } min-h-10 p-2 text-base ${className}`}
        >
          {showBefore && (
            <div className="flex size-5 shrink-0 items-center justify-center text-secondary">
              {beforeIcon || defaultBeforeIcon}
            </div>
          )}

          {/* Content Area - Figma: basis-0 grow flex-col gap-0.5 items-center justify-center px-1 py-0 */}
          <div className="flex min-h-0 min-w-0 grow basis-0 flex-col items-center justify-center gap-0.5 px-1 py-0">
            {/* Input wrapped in flex container - Figma: flex flex-col justify-center */}
            <div className="font-montserrat flex w-full flex-col justify-center overflow-hidden text-ellipsis text-nowrap font-normal leading-[0]">
              <input
                ref={ref}
                className="font-montserrat w-full border-0 bg-transparent text-base font-normal leading-5 shadow-none outline-0 ring-0 text-primary placeholder:text-muted focus:border-0 focus:shadow-none focus:outline-0 focus:ring-0 active:border-0 active:shadow-none active:outline-0 active:ring-0"
                style={{
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                  appearance: 'none',
                  padding: '0 !important',
                  margin: '0 !important',
                  paddingLeft: '0 !important',
                  paddingRight: '0 !important',
                  paddingTop: '0 !important',
                  paddingBottom: '0 !important',
                  marginLeft: '0 !important',
                  marginRight: '0 !important',
                  marginTop: '0 !important',
                  marginBottom: '0 !important',
                }}
                {...props}
              />
            </div>
          </div>

          {showAfter && (
            <div className="flex size-5 shrink-0 items-center justify-center text-secondary">
              {afterIcon || defaultAfterIcon}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="font-montserrat mt-2 text-xs leading-[14px] text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
