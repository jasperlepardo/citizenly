'use client';

import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Error message to display */
  error?: string;
  /** Custom class name */
  className?: string;
  /** Whether to show character count */
  showCharCount?: boolean;
  /** Whether the textarea is resizable */
  resizable?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      error,
      className = '',
      showCharCount = false,
      resizable = false,
      value,
      maxLength,
      name,
      id,
      disabled = false,
      rows = 3,
      ...props
    },
    ref
  ) => {
    // Generate unique IDs for the form elements
    const textareaId = id || `textarea-field`;

    const currentLength = typeof value === 'string' ? value.length : 0;
    const isNearLimit = maxLength && currentLength > maxLength * 0.8;

    return (
      <div className="relative">
        <div
          className={`font-system relative flex w-full transition-colors focus-within:outline-hidden ${
            error
              ? 'rounded-sm border border-red-600 bg-white focus-within:border-red-600 focus-within:shadow-[0px_0px_0px_4px_rgba(220,38,38,0.32)] dark:bg-gray-800'
              : 'rounded-sm border border-gray-300 bg-white focus-within:border-blue-600 focus-within:shadow-[0px_0px_0px_4px_rgba(59,130,246,0.32)] dark:border-gray-600 dark:bg-gray-800'
          } p-2 text-base ${className}`}
        >
          <div className="flex min-h-0 min-w-0 grow basis-0 flex-col justify-center gap-0.5 px-1 py-0">
            <div className="font-montserrat flex w-full flex-col justify-center leading-5 font-normal">
              <textarea
                ref={ref}
                id={textareaId}
                name={name}
                rows={rows}
                value={value}
                maxLength={maxLength}
                className={`font-montserrat w-full border-0 bg-transparent text-base leading-5 font-normal text-gray-600 shadow-none ring-0 outline-0 placeholder:text-gray-500 focus:border-0 focus:shadow-none focus:ring-0 focus:outline-0 dark:text-gray-300 dark:placeholder:text-gray-400 ${
                  resizable ? 'resize-y' : 'resize-none'
                }`}
                style={{
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                  appearance: 'none',
                  minHeight: `${1.25 * (rows || 3)}rem`, // 1.25rem per row (20px)
                }}
                disabled={disabled}
                aria-invalid={error ? 'true' : 'false'}
                {...props}
              />
            </div>
          </div>
        </div>

        {/* Character count */}
        {(showCharCount || maxLength) && (
          <div className="mt-2 flex justify-end">
            <span
              className={`font-system text-xs ${
                isNearLimit || (maxLength && currentLength > maxLength)
                  ? 'text-red-500'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
              aria-live="polite"
              aria-label={
                maxLength
                  ? `Character count: ${currentLength} of ${maxLength}`
                  : `Character count: ${currentLength}`
              }
            >
              {maxLength ? `${currentLength}/${maxLength}` : currentLength}
            </span>
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
