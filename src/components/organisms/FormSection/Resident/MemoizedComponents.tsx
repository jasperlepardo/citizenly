/**
 * Memoized Form Components for Performance Optimization
 * 
 * Pre-optimized components to prevent unnecessary re-renders
 * following Philippine government performance standards.
 */

import React, { memo, useMemo, useCallback } from 'react';
import { FIELD_LABELS, DEFAULT_VALUES } from '@/constants/resident-form';

// Memoized field validation error display
export const MemoizedFieldError = memo<{
  fieldName: string;
  error?: string;
}>(({ fieldName, error }) => {
  if (!error) return null;
  
  return (
    <div className="mt-1 text-sm text-red-600" role="alert">
      <strong>{FIELD_LABELS[fieldName] || fieldName}:</strong> {error}
    </div>
  );
});

MemoizedFieldError.displayName = 'MemoizedFieldError';

// Memoized form section wrapper
export const MemoizedFormSection = memo<{
  title: string;
  description?: string;
  children: React.ReactNode;
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
}>(({ title, description, children, isCollapsible = false, defaultExpanded = true }) => {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
  
  const toggleExpanded = useCallback(() => {
    if (isCollapsible) {
      setIsExpanded(prev => !prev);
    }
  }, [isCollapsible]);
  
  const sectionContent = useMemo(() => (
    <div className="space-y-4">
      <div className="border-b border-gray-200 pb-4">
        <div 
          className={`flex items-center justify-between ${isCollapsible ? 'cursor-pointer' : ''}`}
          onClick={toggleExpanded}
        >
          <div>
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>
          {isCollapsible && (
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600"
              aria-expanded={isExpanded}
            >
              <svg
                className={`h-5 w-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {(!isCollapsible || isExpanded) && (
        <div className="space-y-4">
          {children}
        </div>
      )}
    </div>
  ), [title, description, children, isCollapsible, isExpanded, toggleExpanded]);
  
  return sectionContent;
});

MemoizedFormSection.displayName = 'MemoizedFormSection';

// Memoized loading skeleton
export const MemoizedFormSkeleton = memo(() => {
  const skeletonFields = useMemo(() => (
    Array.from({ length: 8 }, (_, index) => (
      <div key={index} className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
      </div>
    ))
  ), []);
  
  return (
    <div className="space-y-6">
      <div className="h-8 bg-gray-200 rounded animate-pulse w-1/2"></div>
      <div className="space-y-4">
        {skeletonFields}
      </div>
      <div className="flex justify-end space-x-3">
        <div className="h-10 bg-gray-200 rounded animate-pulse w-20"></div>
        <div className="h-10 bg-blue-200 rounded animate-pulse w-24"></div>
      </div>
    </div>
  );
});

MemoizedFormSkeleton.displayName = 'MemoizedFormSkeleton';

// Memoized validation summary
export const MemoizedValidationSummary = memo<{
  errors: Record<string, string>;
  onErrorClick?: (fieldName: string) => void;
}>(({ errors, onErrorClick }) => {
  const errorEntries = useMemo(() => 
    Object.entries(errors).filter(([field, error]) => error && field !== '_form'),
    [errors]
  );
  
  const handleErrorClick = useCallback((fieldName: string) => {
    onErrorClick?.(fieldName);
    
    // Focus the field with error
    const fieldElement = document.querySelector(`[name="${fieldName}"], #${fieldName}`) as HTMLElement;
    if (fieldElement) {
      fieldElement.focus();
      fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [onErrorClick]);
  
  if (errorEntries.length === 0 && !errors._form) {
    return null;
  }
  
  return (
    <div className="rounded-md bg-red-50 p-4" role="alert">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            {errors._form ? 'Form Validation Error' : 'Please fix the following errors:'}
          </h3>
          {errors._form ? (
            <div className="mt-2 text-sm text-red-700">
              {errors._form}
            </div>
          ) : (
            <div className="mt-2 text-sm text-red-700">
              <ul className="list-disc space-y-1 pl-5">
                {errorEntries.map(([field, error]) => (
                  <li key={field}>
                    <button
                      type="button"
                      className="text-red-700 hover:text-red-900 underline text-left"
                      onClick={() => handleErrorClick(field)}
                    >
                      <strong>{FIELD_LABELS[field] || field}:</strong> {error}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

MemoizedValidationSummary.displayName = 'MemoizedValidationSummary';

// Memoized form actions (submit/cancel buttons)
export const MemoizedFormActions = memo<{
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  submitText?: string;
  cancelText?: string;
  isValid?: boolean;
}>(({ 
  onSubmit, 
  onCancel, 
  isSubmitting, 
  submitText = 'Submit', 
  cancelText = 'Cancel',
  isValid = true 
}) => {
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubmitting && isValid) {
      onSubmit();
    }
  }, [onSubmit, isSubmitting, isValid]);
  
  const handleCancel = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubmitting) {
      onCancel();
    }
  }, [onCancel, isSubmitting]);
  
  return (
    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
      <button
        type="button"
        onClick={handleCancel}
        disabled={isSubmitting}
        className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {cancelText}
      </button>
      <button
        type="submit"
        onClick={handleSubmit}
        disabled={isSubmitting || !isValid}
        className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <svg
              className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
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
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </>
        ) : (
          submitText
        )}
      </button>
    </div>
  );
});

MemoizedFormActions.displayName = 'MemoizedFormActions';

// Memoized field group for related fields
export const MemoizedFieldGroup = memo<{
  legend: string;
  description?: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}>(({ legend, description, children, required = false, className = '' }) => {
  const groupContent = useMemo(() => (
    <fieldset className={`space-y-4 ${className}`}>
      <legend className="text-base font-medium text-gray-900">
        {legend}
        {required && (
          <span className="text-red-500 ml-1" aria-label="Required">*</span>
        )}
      </legend>
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </fieldset>
  ), [legend, description, children, required, className]);
  
  return groupContent;
});

MemoizedFieldGroup.displayName = 'MemoizedFieldGroup';

// Memoized progressive enhancement wrapper
export const MemoizedProgressiveForm = memo<{
  children: React.ReactNode;
  onFormChange?: (hasChanges: boolean) => void;
}>(({ children, onFormChange }) => {
  const [hasChanges, setHasChanges] = React.useState(false);
  
  const handleFormChange = useCallback(() => {
    if (!hasChanges) {
      setHasChanges(true);
      onFormChange?.(true);
    }
  }, [hasChanges, onFormChange]);
  
  // Add change listeners to form
  React.useEffect(() => {
    const handleChange = () => handleFormChange();
    const handleInput = () => handleFormChange();
    
    document.addEventListener('change', handleChange);
    document.addEventListener('input', handleInput);
    
    return () => {
      document.removeEventListener('change', handleChange);
      document.removeEventListener('input', handleInput);
    };
  }, [handleFormChange]);
  
  return (
    <div className="space-y-6">
      {hasChanges && (
        <div className="rounded-md bg-yellow-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You have unsaved changes. Make sure to submit the form to save your progress.
              </p>
            </div>
          </div>
        </div>
      )}
      {children}
    </div>
  );
});

MemoizedProgressiveForm.displayName = 'MemoizedProgressiveForm';