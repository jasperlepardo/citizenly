'use client';

import React from 'react';
import { useResidentForm } from './hooks/useResidentForm';
import { StepIndicator, NavigationButtons } from './components';
import { ResidentFormWizardProps } from './types';

export function ResidentFormWizard({ onSubmit, onCancel, initialData }: ResidentFormWizardProps = {}) {
  const {
    formData,
    errors,
    currentStep,
    steps,
    isSubmitting,
    handleInputChange,
    handleNextStep,
    handlePrevStep,
    handleSubmit,
    canProceedToNext,
    canGoBack,
  } = useResidentForm({ onSubmit, onCancel, initialData });

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="mx-auto max-w-4xl">
      <StepIndicator 
        steps={steps}
        currentStep={currentStep}
      />
      
      <div className="bg-surface rounded-lg border border-default shadow-sm">
        <div className="px-6 py-8">
          <CurrentStepComponent 
            formData={formData}
            onChange={handleInputChange}
            errors={errors}
            onNext={handleNextStep}
            onPrevious={handlePrevStep}
          />
        </div>
      </div>
      
      <NavigationButtons 
        currentStep={currentStep}
        totalSteps={steps.length}
        canGoBack={canGoBack}
        canProceed={canProceedToNext}
        isSubmitting={isSubmitting}
        onPrevious={handlePrevStep}
        onNext={handleNextStep}
        onSubmit={handleSubmit}
      />
    </div>
  );
}