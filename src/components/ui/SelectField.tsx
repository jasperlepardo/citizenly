'use client'

import React, { forwardRef, SelectHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const selectVariants = cva(
  "flex items-center w-full rounded border transition-colors font-['Montserrat'] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-1 relative",
  {
    variants: {
      variant: {
        default: "border-[#d4d4d4] bg-white focus-within:border-[#2563eb] focus-within:ring-[#2563eb]/20",
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

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectFieldProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof selectVariants> {
  label?: string
  helperText?: string
  errorMessage?: string
  placeholder?: string
  options: SelectOption[]
  leftIcon?: React.ReactNode
}

const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ 
    className,
    variant = "default",
    size = "md",
    label,
    helperText,
    errorMessage,
    placeholder,
    options,
    leftIcon,
    disabled,
    value,
    ...props 
  }, ref) => {
    const actualVariant = disabled ? 'disabled' : errorMessage ? 'error' : variant

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-[#262626] mb-1 font-['Montserrat']">
            {label}
          </label>
        )}
        
        {/* Select Container */}
        <div className={cn(selectVariants({ variant: actualVariant, size }), className)}>
          {/* Left Icon */}
          {leftIcon && (
            <div className="flex items-center justify-center px-2 text-[#737373]">
              {leftIcon}
            </div>
          )}
          
          {/* Select */}
          <select
            ref={ref}
            className={cn(
              "flex-1 bg-transparent border-none outline-none font-['Montserrat'] text-[#262626] appearance-none cursor-pointer",
              size === 'sm' && "text-sm py-1 px-2",
              size === 'md' && "text-base py-2 px-3",
              size === 'lg' && "text-lg py-3 px-4",
              leftIcon && "px-1",
              disabled && "text-[#737373] cursor-not-allowed",
              !value && "text-[#a3a3a3]"
            )}
            disabled={disabled}
            value={value}
            {...props}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
                className="text-[#262626]"
              >
                {option.label}
              </option>
            ))}
          </select>
          
          {/* Dropdown Icon */}
          <div className="flex items-center justify-center px-2 text-[#737373] pointer-events-none">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </div>
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

SelectField.displayName = "SelectField"

export { SelectField, selectVariants }