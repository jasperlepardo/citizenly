'use client';

/**
 * FormSection Component
 * Semantic form section with fieldset and legend for better accessibility
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface FormSectionProps {
  legend?: string;
  title?: string; // Alternative to legend for backwards compatibility
  description?: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
}

export default function FormSection({
  legend,
  title,
  description,
  children,
  className,
  required = false,
}: FormSectionProps) {
  // Use title as fallback for legend for backwards compatibility
  const sectionTitle = legend || title;
  return (
    <fieldset className={cn('space-y-4', className)}>
      <legend className="border-b pb-2 text-lg font-medium text-primary">
        {sectionTitle}
        {required && (
          <span className="ml-1 text-red-500" aria-label="required">
            *
          </span>
        )}
      </legend>
      {description && (
        <p
          className="mt-1 text-sm text-secondary"
          id={`${sectionTitle?.toLowerCase().replace(/\s+/g, '-')}-description`}
        >
          {description}
        </p>
      )}
      <div
        className="space-y-4"
        aria-describedby={
          description
            ? `${sectionTitle?.toLowerCase().replace(/\s+/g, '-')}-description`
            : undefined
        }
      >
        {children}
      </div>
    </fieldset>
  );
}

// Export for use in forms
export { FormSection };
