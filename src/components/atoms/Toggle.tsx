'use client'

import React, { forwardRef, InputHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const toggleVariants = cva(
  "relative inline-flex items-center cursor-pointer disabled:cursor-not-allowed",
  {
    variants: {
      size: {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg"
      }
    },
    defaultVariants: {
      size: "md"
    }
  }
)

const toggleSwitchVariants = cva(
  "relative inline-flex items-center rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent focus:ring-[#7c3aed]/20",
        primary: "border-transparent focus:ring-[#2563eb]/20",
        error: "border-transparent focus:ring-[#dc2626]/20",
        disabled: "border-transparent cursor-not-allowed"
      },
      size: {
        sm: "h-5 w-9",
        md: "h-6 w-11", 
        lg: "h-7 w-13"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
)

export interface ToggleProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'onToggle'>,
    VariantProps<typeof toggleVariants> {
  label?: string
  description?: string
  errorMessage?: string
  variant?: 'default' | 'primary' | 'error' | 'disabled'
  onToggle?: (checked: boolean) => void
}

const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ 
    className,
    size = "md",
    variant = "default",
    label,
    description, 
    errorMessage,
    disabled,
    checked = false,
    onToggle,
    onChange,
    ...props 
  }, ref) => {
    const actualVariant = disabled ? 'disabled' : errorMessage ? 'error' : variant

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = e.target.checked
      onChange?.(e)
      onToggle?.(newChecked)
    }

    // Calculate background colors based on state and variant
    const getBackgroundColor = () => {
      if (disabled) {
        return checked ? 'bg-[#d4d4d4]' : 'bg-[#fafafa]'
      }
      if (!checked) {
        return 'bg-[#d4d4d4]'
      }
      switch (actualVariant) {
        case 'primary':
          return 'bg-[#2563eb]'
        case 'error':
          return 'bg-[#dc2626]'
        default:
          return 'bg-[#7c3aed]'
      }
    }

    // Calculate thumb size and position
    const getThumbClasses = () => {
      const baseClasses = "inline-block bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out"
      
      switch (size) {
        case 'sm':
          return cn(baseClasses, "h-3 w-3", checked ? "translate-x-4" : "translate-x-0")
        case 'lg':
          return cn(baseClasses, "h-5 w-5", checked ? "translate-x-6" : "translate-x-0")
        default: // md
          return cn(baseClasses, "h-4 w-4", checked ? "translate-x-5" : "translate-x-0")
      }
    }

    return (
      <div className="w-full">
        <label className={cn(toggleVariants({ size }), className)}>
          <div className="flex items-start">
            {/* Toggle Switch */}
            <div className="relative">
              <input
                ref={ref}
                type="checkbox"
                className="sr-only"
                disabled={disabled}
                checked={checked}
                onChange={handleChange}
                {...props}
              />
              <div className={cn(
                toggleSwitchVariants({ variant: actualVariant, size }),
                getBackgroundColor()
              )}>
                <div className={getThumbClasses()} />
              </div>
            </div>
            
            {/* Label and Description */}
            {(label || description) && (
              <div className={cn("ml-3 flex-1", size === 'sm' && "ml-2", size === 'lg' && "ml-4")}>
                {label && (
                  <div className={cn(
                    "font-['Montserrat'] font-medium leading-tight",
                    disabled ? "text-[#737373]" : "text-[#262626]",
                    size === 'sm' && "text-sm",
                    size === 'md' && "text-base",
                    size === 'lg' && "text-lg"
                  )}>
                    {label}
                  </div>
                )}
                {description && (
                  <div className={cn(
                    "font-['Montserrat'] leading-tight mt-0.5",
                    disabled ? "text-[#a3a3a3]" : "text-[#737373]",
                    size === 'sm' && "text-xs",
                    size === 'md' && "text-sm",
                    size === 'lg' && "text-base"
                  )}>
                    {description}
                  </div>
                )}
              </div>
            )}
          </div>
        </label>
        
        {/* Error Message */}
        {errorMessage && (
          <p className="text-xs text-[#b91c1c] font-['Montserrat'] mt-1 ml-12">
            {errorMessage}
          </p>
        )}
      </div>
    )
  }
)

Toggle.displayName = "Toggle"

export { Toggle, toggleVariants }