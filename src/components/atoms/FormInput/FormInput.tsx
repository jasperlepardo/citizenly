'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  variant?: 'default' | 'error';
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, error, variant, ...props }, ref) => {
    const inputVariant = error ? 'error' : variant || 'default';

    return (
      <div className="w-full">
        <input
          ref={ref}
          className={cn(
            'w-full rounded-md border px-3 py-2 shadow-sm transition-colors',
            'bg-default border-default text-gray-600',
            'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500',
            'placeholder:text-muted',
            'dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400',
            'dark:focus:border-blue-400 dark:focus:ring-blue-400',
            inputVariant === 'error'
              ? 'border-red-300 text-red-900 placeholder:text-red-300 focus:border-red-500 focus:ring-danger-500 dark:border-red-500 dark:text-red-200 dark:placeholder:text-red-400'
              : '',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

export { FormInput };
export type { FormInputProps };
export default FormInput;
