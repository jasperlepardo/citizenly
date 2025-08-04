'use client'

import React, { forwardRef, TextareaHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const textareaVariants = cva(
  "w-full rounded border font-['Montserrat'] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 resize-none",
  {
    variants: {
      variant: {
        default: "border-[#d4d4d4] bg-white focus:border-[#2563eb] focus:ring-[#2563eb]/20",
        error: "border-[#dc2626] bg-white focus:border-[#dc2626] focus:ring-[#dc2626]/20",
        success: "border-[#059669] bg-white focus:border-[#059669] focus:ring-[#059669]/20",
        disabled: "border-[#d4d4d4] bg-[#fafafa] cursor-not-allowed",
        readonly: "border-[#d4d4d4] bg-[#fafafa]"
      },
      size: {
        sm: "px-3 py-2 text-sm min-h-[80px]",
        md: "px-3 py-2 text-base min-h-[120px]",
        lg: "px-4 py-3 text-lg min-h-[160px]"
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
          <label className="block text-sm font-medium text-[#262626] mb-1 font-['Montserrat']">
            {label}
          </label>
        )}
        
        {/* Textarea */}
        <textarea
          ref={ref}
          className={cn(
            textareaVariants({ variant: actualVariant, size }),
            resizable ? "resize-y" : "resize-none",
            disabled && "text-[#737373]",
            readOnly && "text-[#525252]",
            "text-[#262626] placeholder:text-[#a3a3a3]",
            className
          )}
          disabled={disabled}
          readOnly={readOnly}
          value={value}
          maxLength={maxLength}
          {...props}
        />
        
        {/* Footer with Helper Text and Character Count */}
        <div className="flex justify-between items-start mt-1">
          <div className="flex-1">
            {errorMessage ? (
              <p className="text-xs text-[#b91c1c] font-['Montserrat']">
                {errorMessage}
              </p>
            ) : helperText ? (
              <p className="text-xs text-[#737373] font-['Montserrat']">
                {helperText}
              </p>
            ) : null}
          </div>
          
          {/* Character Count */}
          {(showCharCount || maxLength) && (
            <div className="flex-shrink-0 ml-2">
              <span className={cn(
                "text-xs font-['Montserrat']",
                maxLength && currentLength > maxLength * 0.9 ? "text-[#dc2626]" : "text-[#737373]"
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