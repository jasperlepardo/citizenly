'use client';

import React from 'react';

export interface HelperTextProps {
  /** The helper text content */
  children: React.ReactNode;
  /** Whether this is an error message */
  error?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md';
  /** Unique ID for accessibility */
  id?: string;
}

const sizeClasses = {
  xs: 'text-xs leading-4',
  sm: 'text-sm leading-5',
  md: 'text-base leading-6',
};

export const HelperText: React.FC<HelperTextProps> = ({
  children,
  error = false,
  className = '',
  size = 'xs',
  id,
}) => {
  const baseClasses = `block mt-1 ${sizeClasses[size]} font-system`;
  
  const variantClasses = error
    ? 'text-red-600 dark:text-red-400'
    : 'text-gray-500 dark:text-gray-400';

  return (
    <p
      id={id}
      className={`${baseClasses} ${variantClasses} ${className}`.trim()}
      role={error ? 'alert' : 'note'}
      aria-live={error ? 'polite' : undefined}
    >
      {children}
    </p>
  );
};

export default HelperText;