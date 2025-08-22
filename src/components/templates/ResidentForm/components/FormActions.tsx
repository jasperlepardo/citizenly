import React from 'react';
import type { FormMode } from '@/lib/types/forms';

// Helper function to get button variant
const getButtonVariant = (isOptimisticallyUpdated: boolean): string => {
  return isOptimisticallyUpdated 
    ? 'px-4 py-2 bg-success-600 hover:bg-success-700 text-white font-medium rounded-lg transition-colors' 
    : 'px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors';
};

// Helper function to get button content
const getButtonContent = (isSubmitting: boolean, isOptimisticallyUpdated: boolean) => {
  if (isSubmitting) {
    return (
      <>
        <span aria-hidden="true">Saving...</span>
        <span className="sr-only">Saving resident data, please wait</span>
      </>
    );
  }
  
  if (isOptimisticallyUpdated) {
    return (
      <>
        <span aria-hidden="true">✓ Saved</span>
        <span className="sr-only">Changes saved successfully</span>
      </>
    );
  }
  
  return 'Save Resident';
};

// Helper function to get help text
const getHelpText = (errorCount: number): string => {
  if (errorCount > 0) {
    const errorText = errorCount > 1 ? 's' : '';
    return `Please fix ${errorCount} validation error${errorText} before submitting`;
  }
  return 'Form is ready to submit';
};

interface FormActionsProps {
  mode: FormMode;
  isSubmitting: boolean;
  isOptimisticallyUpdated: boolean;
  onCancel?: () => void;
  errorCount: number;
}

export const FormActions = React.memo(({ 
  mode, 
  isSubmitting, 
  isOptimisticallyUpdated, 
  onCancel, 
  errorCount 
}: FormActionsProps) => {
  console.log('🎬 FormActions render - mode:', mode, 'errorCount:', errorCount, 'isSubmitting:', isSubmitting);
  
  if (mode === 'view') {
    console.log('👁️ FormActions: returning null because mode is "view"');
    return null;
  }

  return (
    <div className="flex items-center justify-end gap-3 pt-8 mt-8 border-t border-zinc-200 dark:border-zinc-800">
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-lg transition-colors font-medium"
        >
          Cancel
        </button>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        aria-describedby="submit-help"
        aria-label={isSubmitting ? 'Saving resident data, please wait' : 'Save resident information'}
        className={getButtonVariant(isOptimisticallyUpdated)}
      >
        {getButtonContent(isSubmitting, isOptimisticallyUpdated)}
      </button>
      <div id="submit-help" className="sr-only">
        {getHelpText(errorCount)}
      </div>
    </div>
  );
});