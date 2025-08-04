'use client'

import React, { forwardRef, ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center font-['Montserrat'] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-1",
  {
    variants: {
      variant: {
        // Primary variants
        primary: "bg-[#2563eb] text-white hover:bg-[#3b82f6] focus-visible:ring-[#2563eb]",
        "primary-subtle": "bg-[#dbeafe] text-[#1d4ed8] hover:bg-[#bfdbfe] hover:text-[#1e40af] focus-visible:ring-[#1d4ed8]",
        "primary-faded": "bg-[#bfdbfe] text-[#1d4ed8] hover:bg-[#93c5fd] hover:text-[#1e40af] focus-visible:ring-[#1d4ed8]",
        "primary-outline": "border border-[#2563eb] bg-white text-[#1d4ed8] hover:bg-[#dbeafe] hover:text-[#1e40af] focus-visible:ring-[#1d4ed8]",
        
        // Secondary variants  
        secondary: "bg-[#7c3aed] text-white hover:bg-[#8b5cf6] focus-visible:ring-[#7c3aed]",
        "secondary-subtle": "bg-[#ede9fe] text-[#6d28d9] hover:bg-[#ddd6fe] hover:text-[#5b21b6] focus-visible:ring-[#6d28d9]",
        "secondary-faded": "bg-[#ddd6fe] text-[#6d28d9] hover:bg-[#c4b5fd] hover:text-[#5b21b6] focus-visible:ring-[#6d28d9]",
        "secondary-outline": "border border-[#7c3aed] bg-white text-[#6d28d9] hover:bg-[#ede9fe] hover:text-[#5b21b6] focus-visible:ring-[#6d28d9]",
        
        // Success variants
        success: "bg-[#059669] text-white hover:bg-[#10b981] focus-visible:ring-[#059669]",
        "success-subtle": "bg-[#d1fae5] text-[#047857] hover:bg-[#a7f3d0] hover:text-[#065f46] focus-visible:ring-[#047857]",
        "success-faded": "bg-[#a7f3d0] text-[#047857] hover:bg-[#6ee7b7] hover:text-[#065f46] focus-visible:ring-[#047857]",
        "success-outline": "border border-[#065f46] bg-white text-[#047857] hover:bg-[#d1fae5] hover:text-[#065f46] focus-visible:ring-[#047857]",
        
        // Warning variants
        warning: "bg-[#ea580c] text-white hover:bg-[#f97316] focus-visible:ring-[#ea580c]",
        "warning-subtle": "bg-[#ffedd5] text-[#c2410c] hover:bg-[#fed7aa] hover:text-[#9a3412] focus-visible:ring-[#c2410c]",
        "warning-faded": "bg-[#fed7aa] text-[#c2410c] hover:bg-[#fdba74] hover:text-[#9a3412] focus-visible:ring-[#c2410c]",
        "warning-outline": "border border-[#ea580c] bg-white text-[#c2410c] hover:bg-[#ffedd5] hover:text-[#9a3412] focus-visible:ring-[#c2410c]",
        
        // Danger variants
        danger: "bg-[#dc2626] text-white hover:bg-[#ef4444] focus-visible:ring-[#dc2626]",
        "danger-subtle": "bg-[#fee2e2] text-[#b91c1c] hover:bg-[#fecaca] hover:text-[#991b1b] focus-visible:ring-[#b91c1c]",
        "danger-faded": "bg-[#fecaca] text-[#b91c1c] hover:bg-[#fca5a5] hover:text-[#991b1b] focus-visible:ring-[#b91c1c]",
        "danger-outline": "border border-[#dc2626] bg-white text-[#b91c1c] hover:bg-[#fee2e2] hover:text-[#991b1b] focus-visible:ring-[#b91c1c]",
        
        // Neutral variants
        neutral: "bg-[#d4d4d4] text-[#404040] hover:bg-[#e5e5e5] hover:text-[#262626] focus-visible:ring-[#404040]",
        "neutral-subtle": "bg-[#e5e5e5] text-[#404040] hover:bg-[#d4d4d4] hover:text-[#262626] focus-visible:ring-[#404040]",
        "neutral-faded": "bg-[#d4d4d4] text-[#404040] hover:bg-[#e5e5e5] hover:text-[#262626] focus-visible:ring-[#404040]",
        "neutral-outline": "border border-[#d4d4d4] bg-white text-[#404040] hover:bg-[#e5e5e5] hover:text-[#262626] focus-visible:ring-[#404040]",
        
        // Ghost variants
        ghost: "text-[#404040] hover:bg-[#e5e5e5] hover:text-[#262626] focus-visible:ring-[#404040]",
      },
      size: {
        sm: "h-8 px-3 text-sm rounded",
        md: "h-9 px-4 text-base rounded",
        lg: "h-10 px-6 text-base rounded",
      },
      iconOnly: {
        true: "aspect-square p-0",
        false: ""
      },
      fullWidth: {
        true: "w-full",
        false: ""
      }
    },
    compoundVariants: [
      {
        size: "sm",
        iconOnly: true,
        class: "h-8 w-8"
      },
      {
        size: "md", 
        iconOnly: true,
        class: "h-9 w-9"
      },
      {
        size: "lg",
        iconOnly: true,
        class: "h-10 w-10"
      }
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
      iconOnly: false,
      fullWidth: false
    }
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    iconOnly,
    fullWidth, 
    asChild = false, 
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading

    return (
      <button
        type="button"
        className={cn(buttonVariants({ variant, size, iconOnly, fullWidth, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
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
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon && leftIcon}
        {!iconOnly && children}
        {iconOnly && !leftIcon && !rightIcon && children}
        {!loading && rightIcon && rightIcon}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }