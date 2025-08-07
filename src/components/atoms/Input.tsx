'use client';

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  'font-montserrat w-full border-0 bg-transparent font-normal shadow-none outline-0 ring-0 text-primary placeholder:text-muted focus:border-0 focus:shadow-none focus:outline-0 focus:ring-0 active:border-0 active:shadow-none active:outline-0 active:ring-0',
  {
    variants: {
      size: {
        sm: 'text-sm leading-4',
        md: 'text-base leading-5',
        lg: 'text-lg leading-6',
      },
      state: {
        default: '',
        disabled: 'cursor-not-allowed text-muted',
        readonly: 'text-secondary',
      },
    },
    defaultVariants: {
      size: 'md',
      state: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  state?: 'default' | 'disabled' | 'readonly';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, size = 'md', state = 'default', disabled, readOnly, ...props }, ref) => {
    const actualState = disabled ? 'disabled' : readOnly ? 'readonly' : state;

    return (
      <input
        ref={ref}
        className={cn(inputVariants({ size, state: actualState }), className)}
        style={{
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          appearance: 'none',
          padding: '0',
          margin: '0',
        }}
        disabled={disabled}
        readOnly={readOnly}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };
