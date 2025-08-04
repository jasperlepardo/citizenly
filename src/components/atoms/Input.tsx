'use client'

import React, { forwardRef } from 'react'

const imgSearch = "http://localhost:3845/assets/8343dce0aa29f087a3cf9ea3a982f4dd305fdc7b.svg"
const imgClose = "http://localhost:3845/assets/fc0cd39392abfe2830dd5bdda3b04c5662d13389.svg"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showBefore?: boolean
  showAfter?: boolean
  beforeIcon?: React.ReactNode
  afterIcon?: React.ReactNode
  state?: 'default' | 'active' | 'filled' | 'error' | 'disabled'
  error?: string // Legacy compatibility
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    showBefore = true, 
    showAfter = true, 
    beforeIcon, 
    afterIcon, 
    state = 'default',
    className = '',
    error,
    ...props 
  }, ref) => {
    // Set state to error if error prop is provided
    const actualState = error ? 'error' : state
    const defaultBeforeIcon = (
      <div className="w-5 h-5 flex items-center justify-center">
        <img 
          alt="search" 
          className="block max-w-none size-full" 
          src={imgSearch}
        />
      </div>
    )

    const defaultAfterIcon = (
      <div className="w-5 h-5 flex items-center justify-center">
        <img 
          alt="close" 
          className="block max-w-none size-full" 
          src={imgClose}
        />
      </div>
    )

    return (
      <div>
        <div className={`relative rounded bg-white dark:bg-white/5 ${actualState === 'error' ? 'border border-red-500' : ''} ${className}`}>
          <div className="flex items-center p-2 gap-1">
            {showBefore && (
              <div className="shrink-0">
                {beforeIcon || defaultBeforeIcon}
              </div>
            )}
            
            <div className="flex-1 px-1">
              <input
                ref={ref}
                className="w-full bg-transparent font-['Montserrat'] text-base font-normal leading-5 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 border-none outline-none"
                {...props}
              />
            </div>
            
            {showAfter && (
              <div className="shrink-0">
                {afterIcon || defaultAfterIcon}
              </div>
            )}
          </div>
          <div 
            aria-hidden="true" 
            className={`absolute border ${actualState === 'error' ? 'border-red-500' : 'border-zinc-950/10 dark:border-white/10'} border-solid inset-0 pointer-events-none rounded`}
          />
        </div>
        
        {/* Error Message */}
        {error && (
          <p className="text-xs text-red-600 mt-1 font-['Montserrat']">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input