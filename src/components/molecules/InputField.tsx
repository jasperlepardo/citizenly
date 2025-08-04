'use client'

import React, { forwardRef, InputHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const inputVariants = cva(
  "flex items-center w-full rounded border transition-colors font-['Montserrat'] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-1",
  {
    variants: {
      variant: {
        default: "border-[#d4d4d4] bg-white focus-within:border-[#2563eb] focus-within:ring-[#2563eb]/20",
        filled: "border-[#d4d4d4] bg-white focus-within:border-[#2563eb] focus-within:ring-[#2563eb]/20",
        error: "border-[#dc2626] bg-white focus-within:border-[#dc2626] focus-within:ring-[#dc2626]/20",
        success: "border-[#059669] bg-white focus-within:border-[#059669] focus-within:ring-[#059669]/20",
        disabled: "border-[#d4d4d4] bg-[#fafafa] cursor-not-allowed",
        readonly: "border-[#d4d4d4] bg-[#fafafa]"
      },
      size: {
        sm: "px-2 py-1 text-sm min-h-[32px]",
        md: "px-3 py-2 text-base min-h-[40px]", 
        lg: "px-4 py-3 text-lg min-h-[48px]"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
)

export interface InputFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string
  helperText?: string
  errorMessage?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  leftAddon?: React.ReactNode
  rightAddon?: React.ReactNode
  clearable?: boolean
  onClear?: () => void
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ 
    className,
    variant = "default", 
    size = "md",
    label,
    helperText,
    errorMessage,
    leftIcon,
    rightIcon,
    leftAddon,
    rightAddon,
    clearable = false,
    onClear,
    disabled,
    readOnly,
    value,
    ...props 
  }, ref) => {
    const actualVariant = disabled ? 'disabled' : readOnly ? 'readonly' : errorMessage ? 'error' : variant
    const showClearButton = clearable && value && !disabled && !readOnly

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-[#262626] mb-1 font-['Montserrat']">
            {label}
          </label>
        )}
        
        {/* Input Container */}
        <div className={cn(inputVariants({ variant: actualVariant, size }), className)}>
          {/* Left Addon */}
          {leftAddon && (
            <div className="flex items-center px-3 bg-[#fafafa] border-r border-[#d4d4d4] text-[#737373] text-sm">
              {leftAddon}
            </div>
          )}
          
          {/* Left Icon */}
          {leftIcon && (
            <div className="flex items-center justify-center px-2 text-[#737373]">
              {leftIcon}
            </div>
          )}
          
          {/* Input */}
          <input
            ref={ref}
            className={cn(
              "flex-1 bg-transparent border-none outline-none font-['Montserrat'] text-[#262626] placeholder:text-[#a3a3a3]",
              size === 'sm' && "text-sm py-1 px-2",
              size === 'md' && "text-base py-2 px-3", 
              size === 'lg' && "text-lg py-3 px-4",
              leftIcon && "px-1",
              rightIcon && "px-1",
              disabled && "text-[#737373] cursor-not-allowed",
              readOnly && "text-[#525252]"
            )}
            disabled={disabled}
            readOnly={readOnly}
            value={value}
            {...props}
          />
          
          {/* Clear Button */}
          {showClearButton && (
            <button
              type="button"
              onClick={onClear}
              className="flex items-center justify-center px-2 text-[#737373] hover:text-[#404040] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
          
          {/* Right Icon */}
          {rightIcon && (
            <div className="flex items-center justify-center px-2 text-[#737373]">
              {rightIcon}
            </div>
          )}
          
          {/* Right Addon */}
          {rightAddon && (
            <div className="flex items-center px-3 bg-[#fafafa] border-l border-[#d4d4d4] text-[#737373] text-sm">
              {rightAddon}
            </div>
          )}
        </div>
        
        {/* Helper Text / Error Message */}
        {(helperText || errorMessage) && (
          <div className="mt-1">
            {errorMessage ? (
              <p className="text-xs text-[#b91c1c] font-['Montserrat']">
                {errorMessage}
              </p>
            ) : (
              <p className="text-xs text-[#737373] font-['Montserrat']">
                {helperText}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)

InputField.displayName = "InputField"

export { InputField, inputVariants }