import React from 'react';
import { Button } from '@/components/atoms';

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  canGoBack: boolean;
  canProceed: boolean;
  isSubmitting: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export function NavigationButtons({
  currentStep,
  totalSteps,
  canGoBack,
  canProceed,
  isSubmitting,
  onPrevious,
  onNext,
  onSubmit,
}: NavigationButtonsProps) {
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="mt-8 flex justify-between">
      {/* Previous Button */}
      <div>
        {canGoBack && (
          <Button
            variant="secondary-outline"
            onClick={onPrevious}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Previous
          </Button>
        )}
      </div>

      {/* Next/Submit Button */}
      <div>
        {isLastStep ? (
          <Button
            variant="primary"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Submitting...
              </>
            ) : (
              <>
                Submit Registration
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </>
            )}
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={onNext}
            disabled={!canProceed || isSubmitting}
            className="inline-flex items-center gap-2"
          >
            Next
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Button>
        )}
      </div>
    </div>
  );
}