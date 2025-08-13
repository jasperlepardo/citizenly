'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useUserBarangay } from '@/hooks/useUserBarangay';
import { useCSRFToken } from '@/lib/csrf';
import { logger, logError, dbLogger } from '@/lib/secure-logger';

// Import our organism components
import { HouseholdTypeSelector } from '@/components/organisms';

// Import molecules and atoms
import { Button } from '@/components/atoms';
import { InputField, DropdownSelect } from '@/components/molecules';

export interface HouseholdFormData {
  // Step 1: Basic Information
  householdCode: string;
  householdType: string;
  headFirstName: string;
  headMiddleName: string;
  headLastName: string;
  headExtensionName: string;

  // Step 2: Location Details
  streetName: string;
  houseNumber: string;
  subdivision: string;
  landmark: string;
  coordinates: {
    latitude: string;
    longitude: string;
  };

  // Step 3: Household Composition
  totalMembers: number;
  totalMales: number;
  totalFemales: number;
  children: number;
  adults: number;
  seniors: number;

  // Step 4: Economic Information
  monthlyIncome: string;
  incomeSource: string;
  hasElectricity: boolean;
  hasWater: boolean;
  hasInternet: boolean;
  dwellingType: string;
  dwellingOwnership: string;

  // Address Information (PSGC Codes) - auto-populated
  regionCode: string;
  provinceCode: string;
  cityMunicipalityCode: string;
  barangayCode: string;
}

interface FormStep {
  id: number;
  title: string;
  description: string;
}

interface HouseholdFormWizardProps {
  onSubmit?: (data: HouseholdFormData) => Promise<void>;
  onCancel?: () => void;
}

export default function HouseholdFormWizard({
  onSubmit,
  onCancel: _onCancel,
}: HouseholdFormWizardProps) {
  const router = useRouter();
  const { getToken: getCSRFToken } = useCSRFToken();

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Partial<Record<keyof HouseholdFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<HouseholdFormData>({
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
    adults: 1,
    seniors: 0,

    // Step 4: Economic Information
    monthlyIncome: '',
    incomeSource: '',
    hasElectricity: false,
    hasWater: false,
    hasInternet: false,
    dwellingType: '',
    dwellingOwnership: '',

    // Address Information (PSGC Codes)
    regionCode: '',
    provinceCode: '',
    cityMunicipalityCode: '',
    barangayCode: '',
  });

  // User's assigned barangay address (auto-populated)
  const {
    barangayCode,
    address: userAddress,
    loading: loadingAddress,
    error: addressError,
  } = useUserBarangay();

  // Auto-populate form data when user address is loaded
  useEffect(() => {
    if (userAddress && barangayCode) {
      setFormData(prev => ({
        ...prev,
        regionCode: userAddress.region_code,
        provinceCode: userAddress.province_code || '',
        cityMunicipalityCode: userAddress.city_municipality_code,
        barangayCode: userAddress.barangay_code,
      }));
    }
  }, [userAddress, barangayCode]);

  // Generate household code when component mounts
  useEffect(() => {
    const generateHouseholdCode = () => {
      const timestamp = Date.now().toString(36);
      const randomStr = Math.random().toString(36).substring(2, 8);
      return `HH-${timestamp}-${randomStr}`.toUpperCase();
    };

    if (!formData.householdCode) {
      setFormData(prev => ({
        ...prev,
        householdCode: generateHouseholdCode(),
      }));
    }
  }, [formData.householdCode]);

  const steps: FormStep[] = [
    {
      id: 1,
      title: 'Basic Information',
      description: 'Household details and head of household',
    },
    {
      id: 2,
      title: 'Location Details',
      description: 'Address and geographic information',
    },
    {
      id: 3,
      title: 'Household Composition',
      description: 'Family members and demographics',
    },
    {
      id: 4,
      title: 'Economic & Utilities',
      description: 'Income, utilities, and dwelling information',
    },
  ];

  const handleInputChange = (field: keyof HouseholdFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof HouseholdFormData, string>> = {};

    try {
      if (step === 1) {
        // Step 1: Basic Information
        if (!formData.householdType) newErrors.householdType = 'Household type is required';
        if (!formData.headFirstName?.trim())
          newErrors.headFirstName = 'Head first name is required';
        if (!formData.headLastName?.trim()) newErrors.headLastName = 'Head last name is required';
      }

      if (step === 2) {
        // Step 2: Location Details
        if (!formData.streetName?.trim()) newErrors.streetName = 'Street name is required';
      }

      if (step === 3) {
        // Step 3: Household Composition
        if (formData.totalMembers < 1) newErrors.totalMembers = 'Total members must be at least 1';
        if (formData.totalMales + formData.totalFemales !== formData.totalMembers) {
          newErrors.totalMales = 'Total male and female members must equal total members';
        }
      }

      if (step === 4) {
        // Step 4: Economic Information
        if (!formData.dwellingType) newErrors.dwellingType = 'Dwelling type is required';
        if (!formData.dwellingOwnership)
          newErrors.dwellingOwnership = 'Dwelling ownership is required';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    } catch (error) {
      logError(error as Error, 'VALIDATION_ERROR');
      return false;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep) && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (onSubmit) {
      await onSubmit(formData);
      return;
    }

    // Validate all steps before submitting
    const allStepsValid = [1, 2, 3, 4].every(step => validateStep(step));

    if (!allStepsValid) {
      alert('Please fill in all required fields correctly');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get CSRF token for secure form submission
      getCSRFToken();

      // Convert form data to match database schema
      logger.info('Creating household', { householdCode: formData.householdCode });

      const householdData = {
        code: formData.householdCode,
        household_type: formData.householdType as any,
        head_first_name: formData.headFirstName,
        head_middle_name: formData.headMiddleName || null,
        head_last_name: formData.headLastName,
        head_extension_name: formData.headExtensionName || null,
        street_name: formData.streetName,
        house_number: formData.houseNumber || null,
        subdivision: formData.subdivision || null,
        landmark: formData.landmark || null,
        coordinates:
          formData.coordinates.latitude && formData.coordinates.longitude
            ? `POINT(${formData.coordinates.longitude} ${formData.coordinates.latitude})`
            : null,
        total_members: formData.totalMembers,
        total_males: formData.totalMales,
        total_females: formData.totalFemales,
        children_count: formData.children,
        adults_count: formData.adults,
        seniors_count: formData.seniors,
        monthly_income_range: formData.monthlyIncome || null,
        primary_income_source: formData.incomeSource || null,
        has_electricity: formData.hasElectricity,
        has_water_supply: formData.hasWater,
        has_internet: formData.hasInternet,
        dwelling_type: formData.dwellingType as any,
        dwelling_ownership: formData.dwellingOwnership as any,
        // Geographic hierarchy - auto-populated from user's assigned barangay
        region_code: userAddress?.region_code || null,
        province_code: userAddress?.province_code || null,
        city_municipality_code: userAddress?.city_municipality_code || null,
        barangay_code: barangayCode || null,
        // No household head initially - will be set when first resident is added
        household_head_id: null,
      };

      // Use API endpoint instead of direct insert
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        alert('Authentication required. Please log in again.');
        return;
      }

      const response = await fetch('/api/households', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(householdData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;

        dbLogger.error('Failed to create household via API', {
          error: errorMessage,
          status: response.status,
        });
        alert(`Failed to create household: ${errorMessage}`);
        return;
      }

      const { household: data } = await response.json();

      dbLogger.info('Household created successfully via API', {
        recordId: data?.id,
        householdCode: formData.householdCode,
      });

      alert('Household created successfully!');

      // Navigate to households list using Next.js router
      router.push('/households');
    } catch (error) {
      logger.error('Unexpected error during household creation', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInformationStep formData={formData} onChange={handleInputChange} errors={errors} />
        );
      case 2:
        return (
          <LocationDetailsStep
            formData={formData}
            onChange={handleInputChange}
            errors={errors}
            userAddress={userAddress}
            loadingAddress={loadingAddress}
            addressError={addressError}
          />
        );
      case 3:
        return (
          <HouseholdCompositionStep
            formData={formData}
            onChange={handleInputChange}
            errors={errors}
          />
        );
      case 4:
        return (
          <EconomicInformationStep
            formData={formData}
            onChange={handleInputChange}
            errors={errors}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      {/* Progress Steps */}
      <div className="mb-8">
        <nav aria-label="Progress">
          <ol role="list" className="flex items-center">
            {steps.map((step, stepIdx) => (
              <li
                key={step.id}
                className={stepIdx !== steps.length - 1 ? 'relative pr-8 sm:pr-20' : 'relative'}
              >
                {currentStep > step.id ? (
                  <>
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="h-0.5 w-full bg-zinc-600" />
                    </div>
                    <div className="relative flex size-8 items-center justify-center rounded-full bg-zinc-600">
                      <svg className="size-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </>
                ) : currentStep === step.id ? (
                  <>
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="h-0.5 w-full bg-zinc-200" />
                    </div>
                    <div className="relative flex size-8 items-center justify-center rounded-full border-2 border-zinc-600 bg-white">
                      <span className="text-sm font-medium text-zinc-600">{step.id}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="h-0.5 w-full bg-zinc-200" />
                    </div>
                    <div className="group relative flex size-8 items-center justify-center rounded-full border-2 border-zinc-300 bg-white">
                      <span className="text-sm font-medium text-zinc-500">{step.id}</span>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <div className="mt-6">
          <h2 className="text-lg/8 font-semibold text-zinc-950 dark:text-white">
            {steps[currentStep - 1].title}
          </h2>
          <p className="mt-1 text-sm/6 text-zinc-500 dark:text-zinc-400">
            {steps[currentStep - 1].description}
          </p>
        </div>
      </div>

      {/* Form Content */}
      <div className="rounded-lg bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
        <div className="px-6 py-8">{renderStepContent()}</div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
        <Button variant="secondary-outline" onClick={handlePrevStep} disabled={currentStep === 1}>
          Previous
        </Button>

        {currentStep < 4 ? (
          <Button variant="primary" onClick={handleNextStep}>
            Continue
          </Button>
        ) : (
          <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creating Household...' : 'Create Household'}
          </Button>
        )}
      </div>
    </div>
  );
}

// Step 1: Basic Information
function BasicInformationStep({ formData, onChange, errors }: any) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-base/7 font-semibold text-zinc-950 dark:text-white">
          Basic Information
        </h3>
        <p className="mt-1 text-sm/6 text-zinc-500 dark:text-zinc-400">
          Household details and head of household information.
        </p>
      </div>

      {/* Household Code */}
      <div className="rounded-lg bg-blue-50 p-4 ring-1 ring-blue-900/10 dark:bg-blue-400/10 dark:ring-blue-400/20">
        <div className="flex">
          <div className="shrink-0">
            <svg className="size-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm/6 font-medium text-blue-800 dark:text-blue-200">
              Household Code (Auto-generated)
            </h4>
            <div className="mt-2 text-sm/6 text-blue-700 dark:text-blue-300">
              <p className="font-mono text-lg font-semibold">{formData.householdCode}</p>
              <p className="mt-1">This unique code will identify this household in the system.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Household Type */}
      <HouseholdTypeSelector
        value={formData.householdType}
        onChange={value => onChange('householdType', value)}
        error={errors.householdType}
      />

      {/* Head of Household */}
      <div className="space-y-6">
        <h4 className="text-sm/6 font-medium text-zinc-950 dark:text-white">Head of Household</h4>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <InputField
            label="First Name"
            value={formData.headFirstName}
            onChange={e => onChange('headFirstName', e.target.value)}
            placeholder="Enter first name"
            required
            errorMessage={errors.headFirstName}
          />

          <InputField
            label="Middle Name"
            value={formData.headMiddleName}
            onChange={e => onChange('headMiddleName', e.target.value)}
            placeholder="Enter middle name"
          />

          <InputField
            label="Last Name"
            value={formData.headLastName}
            onChange={e => onChange('headLastName', e.target.value)}
            placeholder="Enter last name"
            required
            errorMessage={errors.headLastName}
          />

          <InputField
            label="Extension Name"
            value={formData.headExtensionName}
            onChange={e => onChange('headExtensionName', e.target.value)}
            placeholder="Jr., Sr., III, etc."
          />
        </div>
      </div>
    </div>
  );
}

// Step 2: Location Details
function LocationDetailsStep({
  formData,
  onChange,
  errors,
  userAddress,
  loadingAddress,
  addressError,
}: any) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-base/7 font-semibold text-zinc-950 dark:text-white">
          Location Details
        </h3>
        <p className="mt-1 text-sm/6 text-zinc-500 dark:text-zinc-400">
          Address and geographic information.
        </p>
      </div>

      {/* Geographic Information */}
      <div className="space-y-4">
        <h4 className="text-sm/6 font-medium text-zinc-950 dark:text-white">
          Geographic Information
        </h4>

        {loadingAddress ? (
          <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <svg className="size-5 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
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
            <span className="text-sm font-medium text-blue-700">
              Loading your assigned barangay...
            </span>
          </div>
        ) : userAddress ? (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-green-600">📍</span>
              <div>
                <h5 className="mb-2 font-medium text-green-800">
                  Auto-populated from your assigned barangay
                </h5>
                <div className="space-y-1 text-sm text-green-700">
                  <div>
                    <strong>Region:</strong> {userAddress.region_name}
                  </div>
                  {userAddress.province_name && (
                    <div>
                      <strong>Province:</strong> {userAddress.province_name}
                    </div>
                  )}
                  <div>
                    <strong>City/Municipality:</strong> {userAddress.city_municipality_name} (
                    {userAddress.city_municipality_type})
                  </div>
                  <div>
                    <strong>Barangay:</strong> {userAddress.barangay_name}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-red-600">⚠️</span>
              <div>
                <h5 className="mb-1 font-medium text-red-800">
                  {addressError || 'No barangay assignment found'}
                </h5>
                <p className="text-sm text-red-700">
                  {addressError
                    ? 'There was an error loading your barangay information. Please try refreshing the page.'
                    : 'Please contact your system administrator to assign you to a barangay.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Address Details */}
      <div className="space-y-6">
        <h4 className="text-sm/6 font-medium text-zinc-950 dark:text-white">Address Details</h4>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <InputField
            label="Street Name"
            value={formData.streetName}
            onChange={e => onChange('streetName', e.target.value)}
            placeholder="Enter street name"
            required
            errorMessage={errors.streetName}
          />

          <InputField
            label="House Number"
            value={formData.houseNumber}
            onChange={e => onChange('houseNumber', e.target.value)}
            placeholder="e.g., 123, Blk 4 Lot 5"
          />

          <InputField
            label="Subdivision"
            value={formData.subdivision}
            onChange={e => onChange('subdivision', e.target.value)}
            placeholder="Subdivision/Village name"
          />

          <InputField
            label="Landmark"
            value={formData.landmark}
            onChange={e => onChange('landmark', e.target.value)}
            placeholder="Nearby landmark"
          />
        </div>

        {/* GPS Coordinates */}
        <div className="space-y-4">
          <h5 className="text-sm/6 font-medium text-zinc-950 dark:text-white">
            GPS Coordinates (Optional)
          </h5>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <InputField
              label="Latitude"
              type="number"
              step="any"
              value={formData.coordinates.latitude}
              onChange={e =>
                onChange('coordinates', { ...formData.coordinates, latitude: e.target.value })
              }
              placeholder="e.g., 14.5995"
            />

            <InputField
              label="Longitude"
              type="number"
              step="any"
              value={formData.coordinates.longitude}
              onChange={e =>
                onChange('coordinates', { ...formData.coordinates, longitude: e.target.value })
              }
              placeholder="e.g., 120.9842"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 3: Household Composition
function HouseholdCompositionStep({ formData, onChange, errors }: any) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-base/7 font-semibold text-zinc-950 dark:text-white">
          Household Composition
        </h3>
        <p className="mt-1 text-sm/6 text-zinc-500 dark:text-zinc-400">
          Family members and demographic information.
        </p>
      </div>

      {/* Total Members */}
      <div className="space-y-6">
        <h4 className="text-sm/6 font-medium text-zinc-950 dark:text-white">Total Members</h4>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <InputField
            label="Total Members"
            type="number"
            min="1"
            value={formData.totalMembers.toString()}
            onChange={e => onChange('totalMembers', parseInt(e.target.value) || 1)}
            required
            errorMessage={errors.totalMembers}
          />

          <InputField
            label="Male Members"
            type="number"
            min="0"
            value={formData.totalMales.toString()}
            onChange={e => onChange('totalMales', parseInt(e.target.value) || 0)}
            errorMessage={errors.totalMales}
          />

          <InputField
            label="Female Members"
            type="number"
            min="0"
            value={formData.totalFemales.toString()}
            onChange={e => onChange('totalFemales', parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      {/* Age Groups */}
      <div className="space-y-6">
        <h4 className="text-sm/6 font-medium text-zinc-950 dark:text-white">Age Groups</h4>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <InputField
            label="Children (0-17)"
            type="number"
            min="0"
            value={formData.children.toString()}
            onChange={e => onChange('children', parseInt(e.target.value) || 0)}
          />

          <InputField
            label="Adults (18-59)"
            type="number"
            min="0"
            value={formData.adults.toString()}
            onChange={e => onChange('adults', parseInt(e.target.value) || 0)}
          />

          <InputField
            label="Seniors (60+)"
            type="number"
            min="0"
            value={formData.seniors.toString()}
            onChange={e => onChange('seniors', parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      {/* Validation Summary */}
      {formData.totalMales + formData.totalFemales !== formData.totalMembers && (
        <div className="rounded-lg bg-amber-50 p-4 ring-1 ring-amber-900/10 dark:bg-amber-400/10 dark:ring-amber-400/20">
          <div className="flex">
            <div className="shrink-0">
              <svg className="size-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm/6 font-medium text-amber-800 dark:text-amber-200">
                Please check your numbers
              </h3>
              <div className="mt-2 text-sm/6 text-amber-700 dark:text-amber-300">
                <p>
                  Total members ({formData.totalMembers}) should equal the sum of male (
                  {formData.totalMales}) and female ({formData.totalFemales}) members.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Step 4: Economic Information
function EconomicInformationStep({ formData, onChange, errors }: any) {
  const INCOME_RANGES = [
    { value: 'below_10k', label: 'Below ₱10,000' },
    { value: '10k_25k', label: '₱10,000 - ₱25,000' },
    { value: '25k_50k', label: '₱25,000 - ₱50,000' },
    { value: '50k_100k', label: '₱50,000 - ₱100,000' },
    { value: 'above_100k', label: 'Above ₱100,000' },
  ];

  const INCOME_SOURCES = [
    { value: 'employment', label: 'Employment/Salary' },
    { value: 'business', label: 'Business/Self-employed' },
    { value: 'agriculture', label: 'Agriculture/Farming' },
    { value: 'remittances', label: 'Remittances (OFW)' },
    { value: 'pension', label: 'Pension/Retirement' },
    { value: 'government_aid', label: 'Government Aid' },
    { value: 'other', label: 'Other' },
  ];

  const DWELLING_TYPES = [
    { value: 'single_detached', label: 'Single Detached House' },
    { value: 'duplex', label: 'Duplex' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'condominium', label: 'Condominium' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'informal_dwelling', label: 'Informal Dwelling' },
    { value: 'other', label: 'Other' },
  ];

  const OWNERSHIP_TYPES = [
    { value: 'owned', label: 'Owned' },
    { value: 'rented', label: 'Rented' },
    { value: 'shared', label: 'Shared with others' },
    { value: 'caretaker', label: 'Caretaker' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-base/7 font-semibold text-zinc-950 dark:text-white">
          Economic & Utilities Information
        </h3>
        <p className="mt-1 text-sm/6 text-zinc-500 dark:text-zinc-400">
          Income, utilities access, and dwelling information.
        </p>
      </div>

      {/* Economic Information */}
      <div className="space-y-6">
        <h4 className="text-sm/6 font-medium text-zinc-950 dark:text-white">
          Economic Information
        </h4>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <DropdownSelect
            label="Monthly Household Income"
            value={formData.monthlyIncome}
            onChange={val => onChange('monthlyIncome', val)}
            options={INCOME_RANGES}
            placeholder="Select income range"
          />

          <DropdownSelect
            label="Primary Income Source"
            value={formData.incomeSource}
            onChange={val => onChange('incomeSource', val)}
            options={INCOME_SOURCES}
            placeholder="Select income source"
          />
        </div>
      </div>

      {/* Utilities */}
      <div className="space-y-6">
        <h4 className="text-sm/6 font-medium text-zinc-950 dark:text-white">Utilities Access</h4>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="hasElectricity"
              checked={formData.hasElectricity}
              onChange={e => onChange('hasElectricity', e.target.checked)}
              className="size-4 rounded border-neutral-300 bg-white text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="hasElectricity" className="text-sm text-zinc-950 dark:text-white">
              Has Electricity
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="hasWater"
              checked={formData.hasWater}
              onChange={e => onChange('hasWater', e.target.checked)}
              className="size-4 rounded border-neutral-300 bg-white text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="hasWater" className="text-sm text-zinc-950 dark:text-white">
              Has Water Supply
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="hasInternet"
              checked={formData.hasInternet}
              onChange={e => onChange('hasInternet', e.target.checked)}
              className="size-4 rounded border-neutral-300 bg-white text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="hasInternet" className="text-sm text-zinc-950 dark:text-white">
              Has Internet Access
            </label>
          </div>
        </div>
      </div>

      {/* Dwelling Information */}
      <div className="space-y-6">
        <h4 className="text-sm/6 font-medium text-zinc-950 dark:text-white">
          Dwelling Information
        </h4>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <DropdownSelect
            label="Dwelling Type"
            value={formData.dwellingType}
            onChange={val => onChange('dwellingType', val)}
            options={DWELLING_TYPES}
            placeholder="Select dwelling type"
            errorMessage={errors.dwellingType}
          />

          <DropdownSelect
            label="Dwelling Ownership"
            value={formData.dwellingOwnership}
            onChange={val => onChange('dwellingOwnership', val)}
            options={OWNERSHIP_TYPES}
            placeholder="Select ownership type"
            errorMessage={errors.dwellingOwnership}
          />
        </div>
      </div>
    </div>
  );
}
