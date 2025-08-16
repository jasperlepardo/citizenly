import React from 'react';
import { FormStep } from '../types';

interface StepIndicatorProps {
  steps: FormStep[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                {/* Step Circle */}
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium ${
                    isActive
                      ? 'border-blue-600 bg-blue-600 text-white dark:text-black'
                      : isCompleted
                        ? 'border-green-600 bg-green-600 text-white dark:text-black'
                        : 'border-gray-300 bg-white text-gray-500 dark:text-gray-500 dark:text-gray-500 dark:text-gray-500'
                  } `}
                >
                  {isCompleted ? (
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>

                {/* Step Label */}
                <div className="mt-2 max-w-24 text-center">
                  <p
                    className={`text-xs font-medium ${
                      isActive ? 'text-gray-600 dark:text-gray-400' : isCompleted ? 'text-green-600' : 'text-gray-500 dark:text-gray-500 dark:text-gray-500 dark:text-gray-500'
                    } `}
                  >
                    {step.title}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div
                  className={`mx-4 mt-[-20px] h-0.5 flex-1 ${
                    isCompleted || (isActive && stepNumber > 1) ? 'bg-green-600' : 'bg-gray-300'
                  } `}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
