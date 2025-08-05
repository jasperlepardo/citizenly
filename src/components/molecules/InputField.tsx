'use client'

import React, { forwardRef, InputHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const inputVariants = cva(
  "flex items-center w-full transition-colors font-system focus-within:outline-none relative",
  {
    variants: {
      variant: {
        default: "border border-default bg-surface rounded focus-within:border-blue-600 focus-within:shadow-[0px_0px_0px_4px_rgba(59,130,246,0.32)]",
        filled: "border border-default bg-surface rounded focus-within:border-blue-600 focus-within:shadow-[0px_0px_0px_4px_rgba(59,130,246,0.32)]",
        error: "border border-red-600 bg-surface rounded focus-within:border-red-600 focus-within:shadow-[0px_0px_0px_4px_rgba(220,38,38,0.32)]",
        success: "border border-green-500 bg-surface rounded focus-within:border-green-500 focus-within:shadow-[0px_0px_0px_4px_rgba(5,150,105,0.32)]",
        disabled: "border border-default bg-background-muted rounded cursor-not-allowed",
        readonly: "border-0 bg-background-muted rounded-none",
        borderless: "border-0 bg-transparent rounded-none"
      },
      size: {
        sm: "p-1.5 text-sm min-h-[32px]",
        md: "p-[8px] text-base min-h-[40px]", // Figma: exact 8px padding
        lg: "p-3 text-lg min-h-[48px]"
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
          <label className="block text-sm font-medium text-primary mb-2 font-system">
            {label}
          </label>
        )}
        
        {/* Input Container */}
        <div className={cn(inputVariants({ variant: actualVariant, size }), "input-field-container", className)}>
          {/* Left Icon - Figma: w-5 (20px width) */}
          {leftIcon && (
            <div className="flex items-center justify-center w-5 h-5 text-secondary shrink-0">
              {leftIcon}
            </div>
          )}
          
          {/* Content Area - Figma: basis-0 grow flex-col gap-0.5 items-center justify-center px-1 py-0 */}
          <div className="basis-0 grow flex flex-col gap-0.5 items-center justify-center min-h-0 min-w-0 px-1 py-0">
            {/* Input wrapped in flex container - Figma: flex flex-col justify-center */}
            <div className="flex flex-col font-montserrat font-normal justify-center leading-[0] overflow-ellipsis overflow-hidden w-full text-nowrap">
              <input
                ref={ref}
                className={cn(
                  "w-full bg-transparent font-montserrat font-normal text-primary placeholder:text-muted",
                  // Remove ALL borders and focus states
                  "border-0 outline-0 ring-0 shadow-none",
                  "focus:border-0 focus:outline-0 focus:ring-0 focus:shadow-none",
                  "active:border-0 active:outline-0 active:ring-0 active:shadow-none",
                  // Figma text-base-regular: 16px/20px (leading-5 = 20px)
                  size === 'sm' && "text-sm leading-4",
                  size === 'md' && "text-base leading-5", 
                  size === 'lg' && "text-lg leading-6",
                  disabled && "text-muted cursor-not-allowed",
                  readOnly && "text-secondary"
                )}
                style={{
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                  appearance: 'none'
                }}
                disabled={disabled}
                readOnly={readOnly}
                value={value}
                {...props}
              />
            </div>
          </div>
          
          {/* Right Icon - Figma: w-5 (20px width) */}
          {(rightIcon || showClearButton) && (
            <div className="flex items-center justify-center w-5 h-5 text-secondary shrink-0">
              {showClearButton ? (
                <button
                  type="button"
                  onClick={onClear}
                  className="flex items-center justify-center w-full h-full text-secondary hover:text-primary transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              ) : (
                rightIcon
              )}
            </div>
          )}
          
          {/* Addons for special cases */}
          {leftAddon && (
            <div className="flex items-center px-3 bg-background-muted border-r border-default text-muted text-sm">
              {leftAddon}
            </div>
          )}
          
          {rightAddon && (
            <div className="flex items-center px-3 bg-background-muted border-l border-default text-muted text-sm">
              {rightAddon}
            </div>
          )}
        </div>
        
        {/* Helper Text / Error Message */}
        {(helperText || errorMessage) && (
          <div className="mt-2">
            {errorMessage ? (
              <p className="text-xs text-red-500 font-system leading-[14px]">
                {errorMessage}
              </p>
            ) : (
              <p className="text-xs text-muted font-system leading-[14px]">
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