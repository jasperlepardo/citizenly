'use client'

import React, { forwardRef, TextareaHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const textareaVariants = cva(
  "w-full rounded border font-montserrat transition-colors focus:outline-none resize-none",
  {
    variants: {
      variant: {
        default: "border-default bg-surface focus:border-blue-600 focus:shadow-[0px_0px_0px_4px_rgba(59,130,246,0.32)]",
        error: "border-red-600 bg-surface focus:border-red-600 focus:shadow-[0px_0px_0px_4px_rgba(220,38,38,0.32)]",
        success: "border-green-500 bg-surface focus:border-green-500 focus:shadow-[0px_0px_0px_4px_rgba(5,150,105,0.32)]",
        disabled: "border-default bg-background-muted cursor-not-allowed",
        readonly: "border-default bg-background-muted"
      },
      size: {
        sm: "p-1.5 text-sm min-h-[80px]",
        md: "p-[8px] text-base min-h-[120px]", // Figma: exact 8px padding
        lg: "p-3 text-lg min-h-[160px]"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
)

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof textareaVariants> {
  label?: string
  helperText?: string
  errorMessage?: string
  maxLength?: number
  showCharCount?: boolean
  resizable?: boolean
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className,
    variant = "default",
    size = "md", 
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
  }, ref) => {
    const actualVariant = disabled ? 'disabled' : readOnly ? 'readonly' : errorMessage ? 'error' : variant
    const currentLength = typeof value === 'string' ? value.length : 0

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-primary mb-2 font-montserrat">
            {label}
          </label>
        )}
        
        {/* Textarea */}
        <textarea
          ref={ref}
          className={cn(
            textareaVariants({ variant: actualVariant, size }),
            resizable ? "resize-y" : "resize-none",
            disabled && "text-muted",
            readOnly && "text-secondary",
            "text-primary placeholder:text-muted",
            className
          )}
          disabled={disabled}
          readOnly={readOnly}
          value={value}
          maxLength={maxLength}
          {...props}
        />
        
        {/* Footer with Helper Text and Character Count */}
        <div className="flex justify-between items-start mt-2">
          <div className="flex-1">
            {errorMessage ? (
              <p className="text-xs text-red-500 font-montserrat leading-[14px]">
                {errorMessage}
              </p>
            ) : helperText ? (
              <p className="text-xs text-muted font-montserrat leading-[14px]">
                {helperText}
              </p>
            ) : null}
          </div>
          
          {/* Character Count */}
          {(showCharCount || maxLength) && (
            <div className="flex-shrink-0 ml-2">
              <span className={cn(
                "text-xs font-montserrat",
                maxLength && currentLength > maxLength * 0.9 ? "text-red-600" : "text-muted"
              )}>
                {maxLength ? `${currentLength}/${maxLength}` : currentLength}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }
)

Textarea.displayName = "Textarea"

export { Textarea, textareaVariants }