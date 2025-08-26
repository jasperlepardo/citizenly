'use client';

import React from 'react';

import { cn } from '@/lib';

// Define the variant types for TypeScript
interface BadgeVariants {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  shape?: 'rounded' | 'pill';
  outlined?: boolean;
}

export interface BadgeProps extends BadgeVariants {
  /** Badge content */
  children: React.ReactNode;
  /** Custom class name */
  className?: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Icon position */
  iconPosition?: 'left' | 'right';
}

const getBadgeClasses = ({ variant = 'default', size = 'md', shape = 'rounded', outlined = false }: BadgeVariants): string => {
  // Base classes
  const baseClasses = 'inline-flex items-center font-medium gap-1';
  
  // Size classes using Tailwind spacing
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-sm', 
    lg: 'px-3 py-1.5 text-base',
  };
  
  // Shape classes
  const shapeClasses = {
    rounded: 'rounded',
    pill: 'rounded-full',
  };
  
  // Variant classes using pure Tailwind colors
  const variantClasses = {
    default: outlined 
      ? 'bg-transparent text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700 border' 
      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100',
    success: outlined 
      ? 'bg-transparent text-green-700 dark:text-green-400 border-green-500 border' 
      : 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400',
    warning: outlined 
      ? 'bg-transparent text-orange-700 dark:text-orange-400 border-orange-500 border' 
      : 'bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-400',
    danger: outlined 
      ? 'bg-transparent text-red-700 dark:text-red-400 border-red-500 border' 
      : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400',
    info: outlined 
      ? 'bg-transparent text-blue-700 dark:text-blue-400 border-blue-500 border' 
      : 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400',
    secondary: outlined 
      ? 'bg-transparent text-zinc-600 dark:text-zinc-400 border-zinc-400 dark:border-zinc-600 border' 
      : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400',
  };

  return `${baseClasses} ${sizeClasses[size]} ${shapeClasses[shape]} ${variantClasses[variant]}`;
};

const getIconClasses = (size: string = 'md'): string => {
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5',
  };
  
  return `${iconSizes[size as keyof typeof iconSizes]} shrink-0 inline-flex items-center justify-center`;
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  shape = 'rounded',
  outlined = false,
  className,
  icon,
  iconPosition = 'left',
}) => {
  const badgeClasses = getBadgeClasses({ variant, size, shape, outlined });
  const iconClasses = getIconClasses(size);

  return (
    <span className={cn(badgeClasses, className)}>
      {icon && iconPosition === 'left' && (
        <span className={iconClasses}>
          {icon}
        </span>
      )}
      <span>{children}</span>
      {icon && iconPosition === 'right' && (
        <span className={iconClasses}>
          {icon}
        </span>
      )}
    </span>
  );
};

Badge.displayName = 'Badge';

export default Badge;