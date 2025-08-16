'use client';

/**
 * ResidentFormWizard Component (Refactored)
 *
 * Pure UI component for resident registration wizard.
 * All business logic has been extracted to services and hooks.
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useResidentOperations } from '@/hooks/useResidentOperations';
import { ResidentFormData } from '@/services/resident.service';

// Import our organism components
import {
  PersonalInformation,
  EducationEmployment,
  PhysicalCharacteristics,
  MigrantInformation,
  MotherMaidenName,
  ResidentStatusSelector,
  SectoralInfo,
} from '@/components/organisms';

// Import molecules and atoms
import { Button } from '@/components/atoms';
import { InputField } from '@/components/molecules';

interface FormStep {
  id: number;
  title: string;
  description: string;
  component: React.ComponentType<any>;
}

interface ResidentFormWizardProps {
  onSubmit?: (data: ResidentFormData) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<ResidentFormData>;
  showProgress?: boolean;
}

const initialFormData: ResidentFormData = {
  // Personal Information
  firstName: '',
  middleName: '',
  lastName: '',
  extensionName: '',
  birthdate: '',
  sex: '',
  civilStatus: '',
  citizenship: 'filipino',

  // Education & Employment
  educationLevel: '',
  educationStatus: '',
  psocCode: '',
  psocLevel: '',
  positionTitleId: '',
  occupationDescription: '',
  employmentStatus: '',
  workplace: '',

  // Contact & Documentation
  email: '',
  mobileNumber: '',
  telephoneNumber: '',
  philsysCardNumber: '',

  // Physical & Identity Information
  bloodType: '',
  height: '',
  weight: '',
  complexion: '',
  ethnicity: '',
  religion: '',

  // Voting Information
  voterRegistrationStatus: false,
  residentVoterStatus: false,
  lastVotedYear: '',

  // Family Information
  motherMaidenFirstName: '',
  motherMaidenMiddleName: '',
  motherMaidenLastName: '',

  // Migration Information
  migrationInfo: null,

  // Address Information (auto-populated)
  regionCode: '',
  provinceCode: '',
  cityMunicipalityCode: '',
  barangayCode: '',

  // Household Assignment
  householdCode: '',
  householdRole: 'Member',
};

/**
 * ResidentFormWizard Component
 *
 * This is now a pure UI component that:
 * - Manages form state and navigation
 * - Handles validation through the hook
 * - Delegates business logic to services
 */
export default function ResidentFormWizard({
  onSubmit,
  onCancel,
  initialData,
  showProgress = true,
}: ResidentFormWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ResidentFormData>({
    ...initialFormData,
    ...initialData,
  });
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Use the custom hook for all business operations
  const {
    createResident,
    validateResident,
    isSubmitting,
    validationErrors,
    clearValidationErrors,
  } = useResidentOperations({
    onSuccess: data => {
      // Handle success - redirect to residents list or show success message
      alert('Resident created successfully!');
      router.push('/residents');
    },
    onError: error => {
      // Handle error - show error message
      alert(error);
    },
  });

  // Form steps configuration
  const steps: FormStep[] = [
    {
      id: 1,
      title: 'Personal Information',
      description: 'Basic personal details',
      component: PersonalInformation,
    },
    {
      id: 2,
      title: 'Education & Employment',
      description: 'Educational background and work details',
      component: EducationEmployment,
    },
    {
      id: 3,
      title: 'Additional Details',
      description: 'Contact, physical, and family information',
      component: PhysicalCharacteristics,
    },
    {
      id: 4,
      title: 'Migration & Status',
      description: 'Migration history and resident status',
      component: MigrantInformation,
    },
    {
      id: 5,
      title: 'Household Assignment',
      description: 'Assign to household',
      component: HouseholdAssignment,
    },
  ];

  /**
   * Update form data
   */
  const updateFormData = (updates: Partial<ResidentFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear validation errors when user makes changes
    if (Object.keys(validationErrors).length > 0) {
      clearValidationErrors();
    }
  };

  /**
   * Validate current step
   */
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.firstName?.trim() &&
          formData.lastName?.trim() &&
          formData.birthdate &&
          formData.sex &&
          formData.civilStatus &&
          formData.citizenship
        );
      case 2:
        return !!(formData.educationLevel && formData.educationStatus && formData.employmentStatus);
      case 3:
        return !!formData.mobileNumber?.trim();
      case 4:
        return true; // Migration info is optional
      case 5:
        return !!formData.householdCode;
      default:
        return true;
    }
  };

  /**
   * Handle step navigation
   */
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCompletedSteps(prev => new Set(Array.from(prev).concat(currentStep)));
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      alert('Please fill in all required fields before proceeding.');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    // If custom onSubmit is provided, use it
    if (onSubmit) {
      await onSubmit(formData);
      return;
    }

    // Validate all steps before submitting
    const allStepsValid = steps.every(step => validateStep(step.id));
    if (!allStepsValid) {
      // Find first invalid step and navigate to it
      const firstInvalidStep = steps.find(step => !validateStep(step.id));
      if (firstInvalidStep) {
        setCurrentStep(firstInvalidStep.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      alert('Please fill in all required fields correctly');
      return;
    }

    // Use the hook to create resident (business logic separated)
    await createResident(formData);
  };

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/residents');
    }
  };

  // Get current step component
  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        {/* Progress indicator */}
        {showProgress && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      currentStep === step.id
                        ? 'border-blue-600 bg-blue-600 text-white dark:text-black'
                        : currentStep > step.id || completedSteps.has(step.id)
                          ? 'border-green-600 bg-green-600 text-white dark:text-black'
                          : 'border-gray-300 bg-white text-gray-500 dark:text-gray-500 dark:text-gray-500 dark:text-gray-500'
                    }`}
                  >
                    {currentStep > step.id || completedSteps.has(step.id) ? (
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      step.id
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 w-full ${
                        currentStep > step.id || completedSteps.has(step.id)
                          ? 'bg-green-600'
                          : 'bg-gray-300'
                      }`}
                      style={{ width: '100px' }}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {steps[currentStep - 1].title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{steps[currentStep - 1].description}</p>
            </div>
          </div>
        )}

        {/* Form content */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          {/* Display validation errors */}
          {Object.keys(validationErrors).length > 0 && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <h3 className="text-sm font-medium text-red-800">
                Please correct the following errors:
              </h3>
              <ul className="mt-2 list-inside list-disc text-sm text-red-700">
                {Object.entries(validationErrors).map(([field, error]) => (
                  <li key={field}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Render current step component */}
          <CurrentStepComponent
            data={formData}
            onChange={updateFormData}
            errors={validationErrors}
          />

          {/* Navigation buttons */}
          <div className="mt-8 flex justify-between">
            <div>
              {currentStep > 1 && (
                <Button
                  variant="secondary-outline"
                  onClick={handlePrevious}
                  disabled={isSubmitting}
                >
                  Previous
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="neutral-outline" onClick={handleCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              {currentStep < steps.length ? (
                <Button variant="primary" onClick={handleNext} disabled={isSubmitting}>
                  Next
                </Button>
              ) : (
                <Button
                  variant="success"
                  onClick={handleSubmit}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * HouseholdAssignment Component
 * Simple component for household assignment step
 */
function HouseholdAssignment({
  data,
  onChange,
  errors,
}: {
  data: ResidentFormData;
  onChange: (updates: Partial<ResidentFormData>) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">Household Assignment</h3>
        <div className="space-y-4">
          <InputField
            label="Household Code"
            value={data.householdCode}
            onChange={e => onChange({ householdCode: e.target.value })}
            placeholder="Enter household code"
            required
            errorMessage={errors.householdCode}
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Role in Household
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="householdRole"
                  value="Head"
                  checked={data.householdRole === 'Head'}
                  onChange={e => onChange({ householdRole: e.target.value as 'Head' | 'Member' })}
                  className="mr-2"
                />
                <span>Household Head</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="householdRole"
                  value="Member"
                  checked={data.householdRole === 'Member'}
                  onChange={e => onChange({ householdRole: e.target.value as 'Head' | 'Member' })}
                  className="mr-2"
                />
                <span>Household Member</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
