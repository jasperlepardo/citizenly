'use client';

/**
 * HouseholdFormWizard Component (Refactored)
 *
 * Pure UI component for household creation wizard.
 * All business logic has been extracted to services and hooks.
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHouseholdOperations } from '@/hooks/useHouseholdOperations';
import { HouseholdFormData } from '@/services/household.service';

// Import molecules and atoms
import { Button } from '@/components/atoms';
import { InputField, SelectField } from '@/components/molecules';

interface FormStep {
  id: number;
  title: string;
  description: string;
}

interface HouseholdFormWizardProps {
  onSubmit?: (data: HouseholdFormData) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<HouseholdFormData>;
  showProgress?: boolean;
}

const initialFormData: HouseholdFormData = {
  // Step 1: Basic Information
  householdCode: '',
  householdType: '',
  headFirstName: '',
  headMiddleName: '',
  headLastName: '',
  headExtensionName: '',

  // Step 2: Location Details
  streetName: '',
  houseNumber: '',
  subdivision: '',
  landmark: '',
  coordinates: {
    latitude: '',
    longitude: '',
  },

  // Step 3: Household Composition
  totalMembers: 1,
  totalMales: 0,
  totalFemales: 0,
  children: 0,
  adults: 0,
  seniors: 0,

  // Step 4: Economic Information
  monthlyIncome: '',
  incomeSource: '',
  hasElectricity: false,
  hasWater: false,
  hasInternet: false,
  dwellingType: '',
  dwellingOwnership: '',

  // Address Information (auto-populated)
  regionCode: '',
  provinceCode: '',
  cityMunicipalityCode: '',
  barangayCode: '',
};

/**
 * HouseholdFormWizard Component
 *
 * This is now a pure UI component that:
 * - Manages form state and navigation
 * - Handles validation through the hook
 * - Delegates business logic to services
 */
export default function HouseholdFormWizard({
  onSubmit,
  onCancel,
  initialData,
  showProgress = true,
}: HouseholdFormWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<HouseholdFormData>({
    ...initialFormData,
    ...initialData,
  });
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Use the custom hook for all business operations
  const {
    createHousehold,
    validateHousehold,
    generateHouseholdCode,
    isSubmitting,
    validationErrors,
    clearValidationErrors,
  } = useHouseholdOperations({
    onSuccess: _data => {
      // Handle success - redirect to households list or show success message
      alert('Household created successfully!');
      router.push('/households');
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
      title: 'Basic Information',
      description: 'Household type and head information',
    },
    {
      id: 2,
      title: 'Location Details',
      description: 'Address and location information',
    },
    {
      id: 3,
      title: 'Household Composition',
      description: 'Member demographics',
    },
    {
      id: 4,
      title: 'Economic Information',
      description: 'Income and utilities',
    },
  ];

  /**
   * Update form data
   */
  const updateFormData = (updates: Partial<HouseholdFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear validation errors when user makes changes
    if (Object.keys(validationErrors).length > 0) {
      clearValidationErrors();
    }
  };

  /**
   * Generate household code
   */
  const handleGenerateCode = () => {
    const code = generateHouseholdCode();
    updateFormData({ householdCode: code });
  };

  /**
   * Validate current step
   */
  const validateStep = (step: number): boolean => {
    validateHousehold(formData);

    // For step validation, we only check fields relevant to that step
    switch (step) {
      case 1:
        return !!(
          formData.householdType &&
          formData.headFirstName?.trim() &&
          formData.headLastName?.trim()
        );
      case 2:
        return !!formData.streetName?.trim();
      case 3:
        return (
          formData.totalMembers >= 1 &&
          formData.totalMales + formData.totalFemales === formData.totalMembers
        );
      case 4:
        return !!(formData.dwellingType && formData.dwellingOwnership);
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

    // Generate household code if not provided
    if (!formData.householdCode) {
      formData.householdCode = generateHouseholdCode();
    }

    // Use the hook to create household (business logic separated)
    await createHousehold(formData);
  };

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/households');
    }
  };

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
                        ? 'border-blue-600 bg-blue-600 text-white dark:text-white'
                        : currentStep > step.id || completedSteps.has(step.id)
                          ? 'border-green-600 bg-green-600 text-white dark:text-white'
                          : 'border-gray-300 bg-white text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400'
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
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {steps[currentStep - 1].description}
              </p>
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

          {/* Render step content based on current step */}
          {currentStep === 1 && (
            <BasicInformationStep
              data={formData}
              onChange={updateFormData}
              errors={validationErrors}
              onGenerateCode={handleGenerateCode}
            />
          )}

          {currentStep === 2 && (
            <LocationDetailsStep
              data={formData}
              onChange={updateFormData}
              errors={validationErrors}
            />
          )}

          {currentStep === 3 && (
            <HouseholdCompositionStep
              data={formData}
              onChange={updateFormData}
              errors={validationErrors}
            />
          )}

          {currentStep === 4 && (
            <EconomicInformationStep
              data={formData}
              onChange={updateFormData}
              errors={validationErrors}
            />
          )}

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
 * Step 1: Basic Information
 */
function BasicInformationStep({
  data,
  onChange,
  errors,
  onGenerateCode,
}: {
  data: HouseholdFormData;
  onChange: (updates: Partial<HouseholdFormData>) => void;
  errors: Record<string, string>;
  onGenerateCode: () => void;
}) {
  const householdTypes = [
    { value: 'single_family', label: 'Single Family' },
    { value: 'extended_family', label: 'Extended Family' },
    { value: 'multiple_family', label: 'Multiple Family' },
    { value: 'non_family', label: 'Non-Family' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          Basic Information
        </h3>

        <div className="space-y-4">
          <div className="flex gap-2">
            <InputField
              label="Household Code"
              inputProps={{
                value: data.householdCode,
                onChange: e => onChange({ householdCode: e.target.value }),
                placeholder: 'Auto-generated or enter manually',
              }}
              errorMessage={errors.householdCode}
              className="flex-1"
            />
            <Button variant="secondary" onClick={onGenerateCode} className="mt-6">
              Generate
            </Button>
          </div>

          <SelectField
            label="Household Type"
            selectProps={{
              value: data.householdType,
              onSelect: option => onChange({ householdType: option?.value || '' }),
              options: householdTypes,
            }}
            required
            errorMessage={errors.householdType}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField
              label="Head First Name"
              inputProps={{
                value: data.headFirstName,
                onChange: e => onChange({ headFirstName: e.target.value }),
              }}
              required
              errorMessage={errors.headFirstName}
            />
            <InputField
              label="Head Middle Name"
              inputProps={{
                value: data.headMiddleName,
                onChange: e => onChange({ headMiddleName: e.target.value }),
              }}
              errorMessage={errors.headMiddleName}
            />
            <InputField
              label="Head Last Name"
              inputProps={{
                value: data.headLastName,
                onChange: e => onChange({ headLastName: e.target.value }),
              }}
              required
              errorMessage={errors.headLastName}
            />
            <InputField
              label="Extension Name"
              inputProps={{
                value: data.headExtensionName,
                onChange: e => onChange({ headExtensionName: e.target.value }),
                placeholder: 'Jr., Sr., III, etc.',
              }}
              errorMessage={errors.headExtensionName}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Step 2: Location Details
 */
function LocationDetailsStep({
  data,
  onChange,
  errors,
}: {
  data: HouseholdFormData;
  onChange: (updates: Partial<HouseholdFormData>) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          Location Details
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField
              label="House Number"
              inputProps={{
                value: data.houseNumber,
                onChange: e => onChange({ houseNumber: e.target.value }),
              }}
              errorMessage={errors.houseNumber}
            />
            <InputField
              label="Street Name"
              inputProps={{
                value: data.streetName,
                onChange: e => onChange({ streetName: e.target.value }),
              }}
              required
              errorMessage={errors.streetName}
            />
          </div>

          <InputField
            label="Subdivision/Village"
            inputProps={{
              value: data.subdivision,
              onChange: e => onChange({ subdivision: e.target.value }),
            }}
            errorMessage={errors.subdivision}
          />

          <InputField
            label="Landmark"
            inputProps={{
              value: data.landmark,
              onChange: e => onChange({ landmark: e.target.value }),
              placeholder: 'Near church, school, etc.',
            }}
            errorMessage={errors.landmark}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField
              label="Latitude"
              inputProps={{
                value: data.coordinates.latitude,
                onChange: e =>
                  onChange({
                    coordinates: { ...data.coordinates, latitude: e.target.value },
                  }),
                placeholder: 'e.g., 14.5995',
              }}
              errorMessage={errors['coordinates.latitude']}
            />
            <InputField
              label="Longitude"
              inputProps={{
                value: data.coordinates.longitude,
                onChange: e =>
                  onChange({
                    coordinates: { ...data.coordinates, longitude: e.target.value },
                  }),
                placeholder: 'e.g., 120.9842',
              }}
              errorMessage={errors['coordinates.longitude']}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Step 3: Household Composition
 */
function HouseholdCompositionStep({
  data,
  onChange,
  errors,
}: {
  data: HouseholdFormData;
  onChange: (updates: Partial<HouseholdFormData>) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          Household Composition
        </h3>

        <div className="space-y-4">
          <InputField
            label="Total Members"
            inputProps={{
              type: 'number',
              value: data.totalMembers.toString(),
              onChange: e => onChange({ totalMembers: parseInt(e.target.value) || 0 }),
              min: '1',
            }}
            required
            errorMessage={errors.totalMembers}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField
              label="Total Males"
              inputProps={{
                type: 'number',
                value: data.totalMales.toString(),
                onChange: e => onChange({ totalMales: parseInt(e.target.value) || 0 }),
                min: '0',
              }}
              required
              errorMessage={errors.totalMales}
            />
            <InputField
              label="Total Females"
              inputProps={{
                type: 'number',
                value: data.totalFemales.toString(),
                onChange: e => onChange({ totalFemales: parseInt(e.target.value) || 0 }),
                min: '0',
              }}
              required
              errorMessage={errors.totalFemales}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <InputField
              label="Children (0-17)"
              inputProps={{
                type: 'number',
                value: data.children.toString(),
                onChange: e => onChange({ children: parseInt(e.target.value) || 0 }),
                min: '0',
              }}
              errorMessage={errors.children}
            />
            <InputField
              label="Adults (18-59)"
              inputProps={{
                type: 'number',
                value: data.adults.toString(),
                onChange: e => onChange({ adults: parseInt(e.target.value) || 0 }),
                min: '0',
              }}
              errorMessage={errors.adults}
            />
            <InputField
              label="Seniors (60+)"
              inputProps={{
                type: 'number',
                value: data.seniors.toString(),
                onChange: e => onChange({ seniors: parseInt(e.target.value) || 0 }),
                min: '0',
              }}
              errorMessage={errors.seniors}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Step 4: Economic Information
 */
function EconomicInformationStep({
  data,
  onChange,
  errors,
}: {
  data: HouseholdFormData;
  onChange: (updates: Partial<HouseholdFormData>) => void;
  errors: Record<string, string>;
}) {
  const incomeRanges = [
    { value: 'below_10k', label: 'Below ₱10,000' },
    { value: '10k_20k', label: '₱10,000 - ₱20,000' },
    { value: '20k_30k', label: '₱20,000 - ₱30,000' },
    { value: '30k_50k', label: '₱30,000 - ₱50,000' },
    { value: '50k_100k', label: '₱50,000 - ₱100,000' },
    { value: 'above_100k', label: 'Above ₱100,000' },
  ];

  const dwellingTypes = [
    { value: 'single_detached', label: 'Single Detached' },
    { value: 'duplex', label: 'Duplex' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'condominium', label: 'Condominium' },
    { value: 'other', label: 'Other' },
  ];

  const ownershipTypes = [
    { value: 'owned', label: 'Owned' },
    { value: 'rented', label: 'Rented' },
    { value: 'shared', label: 'Shared' },
    { value: 'free_with_consent', label: 'Free with Consent' },
    { value: 'free_without_consent', label: 'Free without Consent' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          Economic Information
        </h3>

        <div className="space-y-4">
          <SelectField
            label="Monthly Income Range"
            selectProps={{
              value: data.monthlyIncome,
              onSelect: option => onChange({ monthlyIncome: option?.value || '' }),
              options: incomeRanges,
            }}
            errorMessage={errors.monthlyIncome}
          />

          <InputField
            label="Primary Income Source"
            inputProps={{
              value: data.incomeSource,
              onChange: e => onChange({ incomeSource: e.target.value }),
              placeholder: 'e.g., Employment, Business, Pension',
            }}
            errorMessage={errors.incomeSource}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Utilities
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={data.hasElectricity}
                  onChange={e => onChange({ hasElectricity: e.target.checked })}
                  className="mr-2"
                />
                <span>Has Electricity</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={data.hasWater}
                  onChange={e => onChange({ hasWater: e.target.checked })}
                  className="mr-2"
                />
                <span>Has Water Supply</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={data.hasInternet}
                  onChange={e => onChange({ hasInternet: e.target.checked })}
                  className="mr-2"
                />
                <span>Has Internet</span>
              </label>
            </div>
          </div>

          <SelectField
            label="Dwelling Type"
            selectProps={{
              value: data.dwellingType,
              onSelect: option => onChange({ dwellingType: option?.value || '' }),
              options: dwellingTypes,
            }}
            required
            errorMessage={errors.dwellingType}
          />

          <SelectField
            label="Dwelling Ownership"
            selectProps={{
              value: data.dwellingOwnership,
              onSelect: option => onChange({ dwellingOwnership: option?.value || '' }),
              options: ownershipTypes,
            }}
            required
            errorMessage={errors.dwellingOwnership}
          />
        </div>
      </div>
    </div>
  );
}
