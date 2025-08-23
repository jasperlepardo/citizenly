'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utilities/css-utils';

const titleDescriptionVariants = cva(
  'ml-3 flex flex-col',
  {
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const titleVariants = cva(
  'font-medium select-none',
  {
    variants: {
      variant: {
        default: 'text-gray-900 dark:text-gray-100',
        primary: 'text-gray-900 dark:text-gray-100',
        error: 'text-gray-900 dark:text-gray-100',
        disabled: 'text-gray-400 dark:text-gray-500',
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const descriptionVariants = cva(
  'select-none',
  {
    variants: {
      variant: {
        default: 'text-gray-500 dark:text-gray-400',
        primary: 'text-gray-500 dark:text-gray-400',
        error: 'text-gray-500 dark:text-gray-400',
        disabled: 'text-gray-400 dark:text-gray-500',
      },
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const errorMessageVariants = cva(
  'select-none text-red-600 dark:text-red-400',
  {
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface TitleDescriptionProps extends VariantProps<typeof titleDescriptionVariants> {
  title?: string;
  description?: string;
  errorMessage?: string;
  variant?: 'default' | 'primary' | 'error' | 'disabled';
  disabled?: boolean;
  className?: string;
}

export const TitleDescription: React.FC<TitleDescriptionProps> = ({
  title,
  description,
  errorMessage,
  variant = 'default',
  disabled = false,
  size = 'md',
  className,
}) => {
  const actualVariant = disabled ? 'disabled' : errorMessage ? 'error' : variant;

  if (!title && !description && !errorMessage) {
    return null;
  }

  return (
    <div className={cn(titleDescriptionVariants({ size }), className)}>
      {title && (
        <span className={cn(titleVariants({ variant: actualVariant, size }))}>
          {title}
        </span>
      )}
      
      {description && (
        <span className={cn(descriptionVariants({ variant: actualVariant, size }))}>
          {description}
        </span>
      )}
      
      {errorMessage && (
        <span className={cn(errorMessageVariants({ size }))}>
          {errorMessage}
        </span>
      )}
    </div>
  );
};

export default TitleDescription;