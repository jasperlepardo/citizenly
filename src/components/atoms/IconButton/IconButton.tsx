'use client'

import React, { forwardRef } from 'react'
import { Button, ButtonProps } from '../Button/Button'
import { cn } from '@/lib/utils'

export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'iconOnly'> {
  icon: React.ReactNode
  'aria-label': string
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, className, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        iconOnly={true}
        className={cn("", className)}
        {...props}
      >
        {icon}
      </Button>
    )
  }
)

IconButton.displayName = "IconButton"

export { IconButton }