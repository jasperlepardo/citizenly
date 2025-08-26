import React from 'react';

interface FormValidationFeedbackProps {
  errorCount: number;
  isSubmitting: boolean;
  isOptimisticallyUpdated: boolean;
}

const FormValidationFeedbackComponent = ({ 
  errorCount, 
  isSubmitting, 
  isOptimisticallyUpdated 
}: FormValidationFeedbackProps) => {
  return (
    <div 
      aria-live="polite" 
      aria-atomic="true" 
      className="sr-only" 
      aria-label="Form status announcements"
    >
      {errorCount > 0 && (
        <div>
          Form contains {errorCount} validation error{errorCount > 1 ? 's' : ''}. Please review and correct the highlighted fields.
        </div>
      )}
      {isSubmitting && <div>Submitting form data, please wait...</div>}
      {isOptimisticallyUpdated && <div>Changes saved successfully!</div>}
    </div>
  );
};

FormValidationFeedbackComponent.displayName = 'FormValidationFeedback';

export const FormValidationFeedback = React.memo(FormValidationFeedbackComponent);