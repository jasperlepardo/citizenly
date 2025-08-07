'use client';

import React, { forwardRef, TextareaHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const textareaVariants = cva(
  'font-montserrat w-full resize-none rounded border transition-colors focus:outline-none',
  {
    variants: {
      variant: {
        default:
          'bg-surface border-default focus:border-blue-600 focus:shadow-[0px_0px_0px_4px_rgba(59,130,246,0.32)]',
        error:
          'border-red-600 bg-surface focus:border-red-600 focus:shadow-[0px_0px_0px_4px_rgba(220,38,38,0.32)]',
        success:
          'border-green-500 bg-surface focus:border-green-500 focus:shadow-[0px_0px_0px_4px_rgba(5,150,105,0.32)]',
        disabled: 'cursor-not-allowed bg-background-muted border-default',
        readonly: 'bg-background-muted border-default',
      },
      size: {
        sm: 'min-h-20 p-1.5 text-sm',
        md: 'min-h-[120px] p-2 text-base', // Figma: exact 8px padding
        lg: 'min-h-40 p-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof textareaVariants> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  maxLength?: number;
  showCharCount?: boolean;
  resizable?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      label,
      helperText,
      errorMessage,
      maxLength,
      showCharCount = false,
      resizable = false,
      disabled,
      readOnly,
      value,
      ...props
    },
    ref
  ) => {
    const actualVariant = disabled
      ? 'disabled'
      : readOnly
        ? 'readonly'
        : errorMessage
          ? 'error'
          : variant;
    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label className="font-montserrat mb-2 block text-sm font-medium text-primary">
            {label}
          </label>
        )}

        {/* Textarea */}
        <textarea
          ref={ref}
          className={cn(
            textareaVariants({ variant: actualVariant, size }),
            resizable ? 'resize-y' : 'resize-none',
            disabled && 'text-muted',
            readOnly && 'text-secondary',
            'text-primary placeholder:text-muted',
            className
          )}
          disabled={disabled}
          readOnly={readOnly}
          value={value}
          maxLength={maxLength}
          {...props}
        />

        {/* Footer with Helper Text and Character Count */}
        <div className="mt-2 flex items-start justify-between">
          <div className="flex-1">
            {errorMessage ? (
              <p className="font-montserrat text-xs leading-[14px] text-red-500">{errorMessage}</p>
            ) : helperText ? (
              <p className="font-montserrat text-xs leading-[14px] text-muted">{helperText}</p>
            ) : null}
          </div>

          {/* Character Count */}
          {(showCharCount || maxLength) && (
            <div className="ml-2 shrink-0">
              <span
                className={cn(
                  'font-montserrat text-xs',
                  maxLength && currentLength > maxLength * 0.9 ? 'text-red-600' : 'text-muted'
                )}
              >
                {maxLength ? `${currentLength}/${maxLength}` : currentLength}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea, textareaVariants };
