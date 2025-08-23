'use client';

/**
 * ErrorMessage Component
 * Accessible error message for form fields
 */

import React from 'react';
import { cn } from '@/lib/utilities/css-utils';

interface ErrorMessageProps {
  id: string;
  error?: string;
  className?: string;
}

export default function ErrorMessage({ id, error, className }: ErrorMessageProps) {
  if (!error) return null;

  return (
    <span
      id={id}
      role="alert"
      aria-live="polite"
      className={cn('mt-1 text-sm text-red-600 dark:text-red-400', className)}
    >
      {error}
    </span>
  );
}

// Export for use in forms
export { ErrorMessage };
