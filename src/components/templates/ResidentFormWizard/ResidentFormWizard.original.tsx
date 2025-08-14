'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useUserBarangay } from '@/hooks/useUserBarangay';
import { useCSRFToken } from '@/lib/csrf';
import {
  hashPhilSysNumber,
  extractPhilSysLast4,
  validatePhilSysFormat,
  logSecurityOperation,
} from '@/lib/crypto';
import { validateResidentData } from '@/lib/validation';
import { logger, logError, dbLogger } from '@/lib/secure-logger';

// No longer importing complex organism components - using simplified inline components

// Import molecules and atoms
import { Button } from '@/components/atoms';
import { InputField } from '@/components/molecules';
import { ErrorModal, SuccessModal } from '@/components/lazy/LazyComponents';
import PSOCSelector from '@/components/organisms/PSOCSelector/PSOCSelector';

export interface ResidentFormData {
  // Personal Information - Step 1
  firstName: string;
  middleName: string;
  lastName: string;
  extensionName: string;
  birthdate: string;
  sex: 'male' | 'female' | '';
  civilStatus: string;
  citizenship: string;

  // Education & Employment - Step 2
  educationAttainment: string;
  isGraduate: boolean;
  psocCode: string;
  psocLevel: string | number | null;
  positionTitleId: string;
  occupationDescription: string;
  occupationTitle: string;
  employmentStatus: string;
  workplace: string;

  // Contact & Documentation - Step 3
  email: string;
  mobileNumber: string;
  telephoneNumber: string;
  philsysCardNumber: string;

  // Physical & Identity Information - Step 3
  bloodType: string;
  height: string;
  weight: string;
  complexion: string;
  ethnicity: string;
  religion: string;

  // Voting Information - Step 3
  isVoter: boolean | null;
  isResidentVoter: boolean | null;

  // Family Information - Step 3
  motherMaidenFirstName: string;
  motherMaidenMiddleName: string;
  motherMaidenLastName: string;

  // Birth Place Information - Step 1
  birth_place_code: string;
  birth_place_level: string;
  birth_place_name: string;

  // Additional Voting Information - Step 3
  last_voted_date: string;

  // Religion Details - Step 3
  religion_others_specify: string;

  // Address Details - Step 5
  street_id: string;
  subdivision_id: string;
  zip_code: string;

  // Employment Details - Step 2
  employment_code: string;
  employment_name: string;

  // Migration Information - Step 4
  migrationInfo: any;

  // Address Information (PSGC Codes) - auto-populated
  regionCode: string;
  provinceCode: string;
  cityMunicipalityCode: string;
  barangayCode: string;

  // Household Assignment - Step 5
  householdCode: string;
  householdRole: 'Head' | 'Member';
}

interface FormStep {
  id: number;
  title: string;
  description: string;
  component: React.ComponentType<any>;
}

interface ResidentFormWizardProps {
  onSubmit?: (data: ResidentFormData) => Promise<void>;
  onCancel?: () => void;
}

export default function ResidentFormWizard({
  onSubmit,
  onCancel: _onCancel,
}: ResidentFormWizardProps) {
  const router = useRouter();
  const { getToken: getCSRFToken } = useCSRFToken();

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Partial<Record<keyof ResidentFormData, string>>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal states
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [modalError, setModalError] = useState<{
    title: string;
    message: string;
    details: string[];
  }>({
    title: '',
    message: '',
    details: [],
  });
  const [modalSuccess, setModalSuccess] = useState<{ title: string; message: string }>({
    title: '',
    message: '',
  });

  // Helper functions for modals
  const showError = (title: string, message: string, details: string[] = []) => {
    setModalError({ title, message, details });
    setShowErrorModal(true);
  };

  const showSuccess = (title: string, message: string) => {
    setModalSuccess({ title, message });
    setShowSuccessModal(true);
  };

  const [formData, setFormData] = useState<ResidentFormData>({
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
    educationAttainment: '',
    isGraduate: false,
    psocCode: '',
    psocLevel: null,
    positionTitleId: '',
    occupationDescription: '',
    occupationTitle: '',
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
    isVoter: null,
    isResidentVoter: null,

    // Family Information
    motherMaidenFirstName: '',
    motherMaidenMiddleName: '',
    motherMaidenLastName: '',

    // Birth Place Information
    birth_place_code: '',
    birth_place_level: '',
    birth_place_name: '',

    // Additional Voting Information
    last_voted_date: '',

    // Religion Details
    religion_others_specify: '',

    // Address Details
    street_id: '',
    subdivision_id: '',
    zip_code: '',

    // Employment Details
    employment_code: '',
    employment_name: '',

    // Migration Information
    migrationInfo: {
      is_migrant: false,
      migration_type: null,
      previous_address: '',
      previous_country: '',
      migration_reason: null,
      migration_date: null,
      documentation_status: null,
      is_returning_resident: false,
    },

    // Address Information (PSGC Codes)
    regionCode: '',
    provinceCode: '',
    cityMunicipalityCode: '',
    barangayCode: '',

    // Household Assignment
    householdCode: '',
    householdRole: 'Member',
  });

  // User's assigned barangay address (auto-populated)
  const {
    barangayCode,
    address: userAddress,
    loading: loadingAddress,
    error: addressError,
  } = useUserBarangay();

  // Log address loading state for debugging
  useEffect(() => {
    console.log('ResidentFormWizard - Address state:', {
      barangayCode,
      userAddress,
      loadingAddress,
      addressError,
    });

    // Don't show error modal - allow manual barangay selection
    if (addressError) {
      console.log('No auto-assigned barangay, user can select manually:', addressError);
    }
  }, [barangayCode, userAddress, loadingAddress, addressError]);

  // Auto-populate form data when user address is loaded
  useEffect(() => {
    if (userAddress && barangayCode) {
      setFormData(prev => ({
        ...prev,
        regionCode: userAddress.region_code || '',
        provinceCode: userAddress.province_code || '',
        cityMunicipalityCode: userAddress.city_municipality_code || '',
        barangayCode: userAddress.barangay_code,
      }));
      console.log('[DEBUG] Auto-populated geographic data:', {
        regionCode: userAddress.region_code,
        provinceCode: userAddress.province_code,
        cityMunicipalityCode: userAddress.city_municipality_code,
        barangayCode: userAddress.barangay_code,
      });
    }
  }, [userAddress, barangayCode]);

  // Show address loading status - we'll display this info in the form if needed

  const steps: FormStep[] = [
    {
      id: 1,
      title: 'Basic Information',
      description: 'Essential personal details',
      component: BasicInfoStep,
    },
    {
      id: 2,
      title: 'Contact & Address',
      description: 'How to reach you and where you live',
      component: ContactAddressStep,
    },
    {
      id: 3,
      title: 'Education & Employment',
      description: 'Educational background and work details',
      component: EducationEmploymentStep,
    },
    {
      id: 4,
      title: 'Additional Details',
      description: 'Health, identity and voting information',
      component: AdditionalDetailsStep,
    },
    {
      id: 5,
      title: 'Review & Submit',
      description: 'Confirm your information',
      component: ReviewStep,
    },
  ];

  const handleInputChange = (field: keyof ResidentFormData, value: any) => {
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
    const newErrors: Partial<Record<keyof ResidentFormData, string>> = {};

    try {
      if (step === 1) {
        // Step 1: Basic Information - Only validate essential fields
        if (!formData.firstName?.trim()) {
          newErrors.firstName = 'First name is required';
        }

        if (!formData.lastName?.trim()) {
          newErrors.lastName = 'Last name is required';
        }

        if (!formData.birthdate) {
          newErrors.birthdate = 'Birth date is required';
        } else {
          const birthDate = new Date(formData.birthdate);
          const today = new Date();
          if (birthDate > today) {
            newErrors.birthdate = 'Birth date cannot be in the future';
          }
        }

        if (!formData.sex) {
          newErrors.sex = 'Sex is required';
        }

        // Civil status is not required in database (has default value)
      }

      if (step === 2) {
        // Step 2: Contact & Address - Validate geographic location (required in database)
        if (!userAddress && !formData.barangayCode) {
          newErrors.barangayCode = 'Geographic location (barangay) is required';
        }

        // Mobile number is optional but validate format if provided
        if (formData.mobileNumber?.trim()) {
          if (!/^(\+63|0)?9\d{9}$/.test(formData.mobileNumber.replace(/[\s-]/g, ''))) {
            newErrors.mobileNumber = 'Please enter a valid Philippine mobile number (09XXXXXXXXX)';
          }
        }
      }

      // Step 3: Review & Submit - No validation needed

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    } catch (error) {
      logError(error as Error, 'VALIDATION_ERROR');
      return false;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      // Show error message with specific field issues
      const errorFields = Object.keys(errors).filter(
        field => errors[field as keyof ResidentFormData]
      );
      const stepName = steps[currentStep - 1]?.title || `Step ${currentStep}`;

      if (errorFields.length > 0) {
        const errorMessages = errorFields.map(field => {
          const errorMsg = errors[field as keyof ResidentFormData];
          return `${field}: ${errorMsg}`;
        });

        showError(
          `Cannot proceed to next step`,
          `Please fix the following errors in ${stepName}:`,
          errorMessages
        );
      } else {
        showError(
          `Cannot proceed to next step`,
          `Please complete all required fields in ${stepName} before continuing.`
        );
      }

      // Focus on the first field with an error
      if (errorFields.length > 0) {
        const firstErrorField = errorFields[0];
        const fieldElement = document.querySelector(
          `[name="${firstErrorField}"], [id="${firstErrorField}"]`
        ) as HTMLElement;
        if (fieldElement) {
          fieldElement.focus();
          fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
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
    const invalidSteps: number[] = [];
    const allErrors: Array<{ step: number; field: string; message: string }> = [];

    for (const step of [1, 2, 3, 4]) {
      const isValid = validateStep(step);
      if (!isValid) {
        invalidSteps.push(step);
        // Collect errors for this step
        Object.keys(errors).forEach(field => {
          const errorMsg = errors[field as keyof ResidentFormData];
          if (errorMsg) {
            allErrors.push({
              step,
              field,
              message: errorMsg,
            });
          }
        });
      }
    }

    if (invalidSteps.length > 0) {
      const stepNames = invalidSteps
        .map(step => steps[step - 1]?.title || `Step ${step}`)
        .join(', ');
      // Error summary available for debugging purposes
      // const errorSummary = allErrors
      //   .map(error => `Step ${error.step} - ${error.field}: ${error.message}`)
      //   .join('\n');

      const errorDetails = invalidSteps.map(stepIndex => {
        const step = steps[stepIndex - 1];
        const stepErrors = allErrors.filter(e => e.step === stepIndex);
        return `${step.title}: ${stepErrors.map(e => `${e.field} - ${e.message}`).join(', ')}`;
      });

      showError('Cannot submit form', `Please fix errors in: ${stepNames}`, errorDetails);

      // Navigate to first invalid step
      setCurrentStep(invalidSteps[0]);
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate required fields are present
      if (!formData.firstName || !formData.lastName || !formData.birthdate) {
        throw new Error('Missing required fields: firstName, lastName, or birthdate');
      }

      // Check if barangay code is available (required for API)
      const finalBarangayCode = barangayCode || formData.barangayCode;
      console.log('[DEBUG] Barangay assignment check:', {
        barangayCodeFromHook: barangayCode,
        barangayCodeFromForm: formData.barangayCode,
        finalBarangayCode,
        userAddress,
        loadingAddress,
        addressError,
      });

      if (!finalBarangayCode) {
        showError(
          'Missing Geographic Assignment',
          'Please select a barangay location for the resident. You can either use your assigned barangay or select a different one manually.'
        );
        setIsSubmitting(false);
        return;
      }

      // Transform form data to match validation schema
      const validationData = {
        // Personal Information
        firstName: formData.firstName,
        middleName: formData.middleName || undefined,
        lastName: formData.lastName,
        extensionName: formData.extensionName || undefined,
        birthdate: formData.birthdate,
        sex: (formData.sex === '' ? 'male' : formData.sex) as 'male' | 'female',
        civilStatus: formData.civilStatus,
        citizenship: formData.citizenship,

        // Contact Information - ensure mobile number format is consistent
        mobileNumber: formData.mobileNumber ? formData.mobileNumber.replace(/\D/g, '') : '', // Remove non-digits
        telephoneNumber: formData.telephoneNumber || undefined,
        email: formData.email || undefined,

        // PhilSys
        philsysCardNumber: formData.philsysCardNumber || undefined,

        // Education
        educationLevel: formData.educationAttainment || undefined,
        educationStatus: formData.isGraduate ? 'graduated' : 'not_studying',

        // Employment
        employmentStatus: formData.employmentStatus || 'not_in_labor_force',
        psocCode: formData.psocCode || undefined,
        occupationTitle: formData.occupationTitle || undefined,
        workplace: formData.workplace || undefined,

        // Health
        bloodType: formData.bloodType || 'unknown',
        height: formData.height ? parseFloat(formData.height) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        complexion: formData.complexion || undefined,

        // Demographics
        ethnicity: formData.ethnicity || 'not_reported',
        religion: formData.religion || 'other',

        // Voting
        is_voter: formData.isVoter,
        is_resident_voter: formData.isResidentVoter,
        last_voted_date: formData.last_voted_date || undefined,

        // Birth Place
        birth_place_code: formData.birth_place_code || undefined,
        birth_place_level: formData.birth_place_level || undefined,
        birth_place_name: formData.birth_place_name || undefined,

        // Religion Details
        religion_others_specify: formData.religion_others_specify || undefined,

        // Employment Details
        employment_code: formData.employment_code || undefined,
        employment_name: formData.employment_name || undefined,

        // Address Details
        street_id: formData.street_id || undefined,
        subdivision_id: formData.subdivision_id || undefined,
        zip_code: formData.zip_code || undefined,

        // Household
        householdCode: formData.householdCode || undefined,
        householdNumber: undefined,
        streetName: undefined,
        houseNumber: undefined,
        subdivision: undefined,
        zipCode: undefined,
      };

      // Server-side validation of transformed data
      const validationResult = await validateResidentData(validationData);
      if (!validationResult.success) {
        const errorMap: Record<string, string> = {};
        const errorMessages: string[] = [];
        validationResult.errors?.forEach((error: { field: string; message: string }) => {
          errorMap[error.field] = error.message;
          errorMessages.push(`${error.field}: ${error.message}`);
        });
        setValidationErrors(errorMap);

        console.error('Validation errors:', errorMap);

        // Show detailed error message
        showError(
          'Validation Failed',
          `Found ${errorMessages.length} validation error(s):`,
          errorMessages
        );
        setIsSubmitting(false);
        return;
      }

      // Clear any previous validation errors
      setValidationErrors({});

      // Validate PhilSys card number format if provided
      if (formData.philsysCardNumber && !validatePhilSysFormat(formData.philsysCardNumber)) {
        showError(
          'Invalid PhilSys Card Number',
          'Please use the correct format: 1234-5678-9012-3456'
        );
        setIsSubmitting(false);
        return;
      }

      // Securely hash PhilSys card number if provided
      let philsysLast4 = null;

      if (formData.philsysCardNumber) {
        try {
          // Hash generated but not stored for security reasons
          await hashPhilSysNumber(formData.philsysCardNumber);
          philsysLast4 = extractPhilSysLast4(formData.philsysCardNumber);

          // Log security operation for audit trail
          logSecurityOperation('PHILSYS_HASH_CREATED', 'current-user', {
            action: 'resident_creation',
            philsys_last4: philsysLast4,
          });
        } catch (error) {
          logError(error as Error, 'PHILSYS_ENCRYPTION_ERROR');
          showError('Processing Error', 'Error processing PhilSys card number. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }

      // Get CSRF token for secure form submission
      const csrfToken = getCSRFToken();

      // Convert form data for new API
      logger.info('Creating resident with household assignment', {
        householdCode: formData.householdCode,
      });

      const residentData = {
        // Basic Information
        firstName: formData.firstName,
        middleName: formData.middleName || null,
        lastName: formData.lastName,
        extensionName: formData.extensionName || null,
        birthdate: formData.birthdate,
        sex: formData.sex as 'male' | 'female',

        // Personal Details
        civilStatus: formData.civilStatus || 'single',
        citizenship: formData.citizenship || 'filipino',

        // Education & Employment
        educationAttainment: formData.educationAttainment || null,
        isGraduate: formData.isGraduate || false,
        employmentStatus: formData.employmentStatus || 'not_in_labor_force',
        psocCode: formData.psocCode || null,
        psocLevel: formData.psocLevel || null,
        occupationTitle: formData.occupationTitle || null,

        // Contact Information
        mobileNumber: formData.mobileNumber ? formData.mobileNumber.replace(/[^\d+]/g, '') : null,
        telephoneNumber: formData.telephoneNumber ? formData.telephoneNumber.trim() : null,
        email: formData.email ? formData.email.trim().toLowerCase() : null,

        // Family Information
        motherMaidenFirstName: formData.motherMaidenFirstName || null,
        motherMaidenMiddleName: formData.motherMaidenMiddleName || null,
        motherMaidenLastName: formData.motherMaidenLastName || null,

        // Physical & Identity
        bloodType: formData.bloodType || 'unknown',
        ethnicity: formData.ethnicity || 'not_reported',
        religion: formData.religion || 'prefer_not_to_say',

        // Voting Information
        isVoter: formData.isVoter,
        isResidentVoter: formData.isResidentVoter,

        // Geographic Location
        barangayCode: finalBarangayCode,
        regionCode: formData.regionCode,
        provinceCode: formData.provinceCode,
        cityMunicipalityCode: formData.cityMunicipalityCode,

        // Household Assignment
        household_code: formData.householdCode || null,

        // PhilSys (plain text - API will handle encryption)
        philsysCardNumber: formData.philsysCardNumber || null,
      };

      // Log security operation before database insert
      logSecurityOperation('RESIDENT_CREATE_ATTEMPT', 'current-user', {
        action: 'resident_creation',
        has_philsys: !!formData.philsysCardNumber,
        household_code: formData.householdCode,
        barangay_code: barangayCode,
        csrf_token_used: !!csrfToken,
      });

      // Use API endpoint instead of direct insert
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(`Authentication error: ${sessionError.message}`);
      }

      if (!session?.access_token) {
        showError('Authentication Required', 'Please log in again to continue.', [
          'Your session has expired or is invalid',
        ]);
        window.location.href = '/login';
        return;
      }

      const response = await fetch('/api/residents', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(residentData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}) as any);
        const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        const detailLines: string[] = [];
        if (Array.isArray(errorData.details)) {
          detailLines.push(
            ...errorData.details.map((d: any) =>
              typeof d === 'string'
                ? d
                : typeof d === 'object' && d !== null
                  ? `${d.field ?? 'field'}: ${d.message ?? JSON.stringify(d)}`
                  : String(d)
            )
          );
        } else if (errorData.details && typeof errorData.details === 'object') {
          detailLines.push(JSON.stringify(errorData.details));
        }
        detailLines.push(`Status: ${response.status}`);
        detailLines.push('Please check your input and try again.');

        // Handle specific error types
        if (response.status === 401) {
          showError('Authentication Expired', 'Please log in again to continue.', [
            'Your session has expired',
          ]);
          window.location.href = '/login';
          return;
        }

        // Log failed creation attempt
        logSecurityOperation('RESIDENT_CREATE_FAILED', 'current-user', {
          error_message: errorMessage,
          status_code: response.status,
        });
        dbLogger.error('Failed to create resident via API', {
          error: errorMessage,
          status: response.status,
          details: errorData.details ?? null,
        });
        showError('Failed to Create Resident', errorMessage, detailLines);
        return;
      }

      const { resident: data } = await response.json();

      // Log successful creation
      logSecurityOperation('RESIDENT_CREATED', 'current-user', {
        resident_id: data?.id,
        household_code: formData.householdCode,
        is_household_head: formData.householdRole === 'Head',
      });

      dbLogger.info('Resident created successfully', {
        recordId: data?.id,
        householdCode: formData.householdCode,
      });

      // If this resident is assigned as household head, update the household
      if (formData.householdRole === 'Head' && formData.householdCode && data?.id) {
        logger.info('Updating household head assignment');
        const { error: householdUpdateError } = await supabase
          .from('households')
          .update({ household_head_id: data.id })
          .eq('code', formData.householdCode);

        if (householdUpdateError) {
          dbLogger.error('Error updating household head', { error: householdUpdateError.message });
          showError(
            'Resident Created with Warning',
            'Resident was created successfully, but failed to assign as household head.',
            [householdUpdateError.message]
          );
        } else {
          dbLogger.info('Household head updated successfully', {
            householdCode: formData.householdCode,
            headId: data.id,
          });
        }
      }

      showSuccess('Success!', 'Resident has been created successfully and added to the system.');

      // Navigate to residents list using Next.js router
      router.push('/residents');
    } catch (error) {
      console.error('Full error details:', error);
      logger.error('Unexpected error during resident creation', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        formData: formData,
      });
      showError('Unexpected Error', 'An unexpected error occurred while processing your request.', [
        error instanceof Error ? error.message : 'Unknown error',
        'Please try again or contact support if the problem persists.',
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    const currentStepData = steps[currentStep - 1];

    // Use the component from steps array with simplified props
    const StepComponent = currentStepData.component;
    return (
      <StepComponent
        formData={formData}
        onChange={handleInputChange}
        errors={errors}
        validationErrors={validationErrors}
        userAddress={userAddress}
        loadingAddress={loadingAddress}
        addressError={addressError}
        showError={showError}
        showSuccess={showSuccess}
        showErrorModal={showErrorModal}
        setShowErrorModal={setShowErrorModal}
        showSuccessModal={showSuccessModal}
        setShowSuccessModal={setShowSuccessModal}
        modalError={modalError}
        modalSuccess={modalSuccess}
        router={router}
      />
    );
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
                      <div className="h-0.5 w-full bg-blue-600" />
                    </div>
                    <div className="relative flex size-8 items-center justify-center rounded-full bg-blue-600">
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
                      <div className="bg-border-light h-0.5 w-full" />
                    </div>
                    <div className="bg-default relative flex size-8 items-center justify-center rounded-full border-2 border-blue-600">
                      <span className="text-sm font-medium text-gray-600">{step.id}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="bg-border-light h-0.5 w-full" />
                    </div>
                    <div className="bg-default group relative flex size-8 items-center justify-center rounded-full border-2 border-default">
                      <span className="text-sm font-medium text-gray-600">{step.id}</span>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <div className="mt-6">
          <h2 className="text-lg/8 font-semibold text-gray-600">{steps[currentStep - 1].title}</h2>
          <p className="mt-1 text-sm/6 text-gray-600">{steps[currentStep - 1].description}</p>
          <p className="mt-2 text-xs text-amber-600">
            <span className="font-medium">*</span> Required fields must be completed to continue
          </p>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-default rounded-lg border border-default shadow-sm">
        <div className="px-6 py-8">{renderStepContent()}</div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
        <Button variant="secondary-outline" onClick={handlePrevStep} disabled={currentStep === 1}>
          Previous
        </Button>

        {currentStep < steps.length ? (
          <Button variant="primary" onClick={handleNextStep}>
            Continue
          </Button>
        ) : (
          <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Registration'}
          </Button>
        )}
      </div>

      {/* Error Modal */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title={modalError.title}
        message={modalError.message}
        details={modalError.details}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          // Navigate after closing success modal
          if (modalSuccess.title === 'Success!') {
            router.push('/residents');
          }
        }}
        title={modalSuccess.title}
        message={modalSuccess.message}
      />
    </div>
  );
}

// Step 1: Basic Information Step (Simplified)
function BasicInfoStep({ formData, onChange, errors }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base/7 font-semibold text-gray-600">Basic Information</h3>
        <p className="mt-1 text-sm/6 text-gray-600">Essential personal details.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <InputField
          label="First Name"
          type="text"
          value={formData.firstName}
          onChange={e => onChange('firstName', e.target.value)}
          placeholder="Enter first name"
          required
          errorMessage={errors.firstName}
        />

        <InputField
          label="Last Name"
          type="text"
          value={formData.lastName}
          onChange={e => onChange('lastName', e.target.value)}
          placeholder="Enter last name"
          required
          errorMessage={errors.lastName}
        />

        <InputField
          label="Middle Name"
          type="text"
          value={formData.middleName}
          onChange={e => onChange('middleName', e.target.value)}
          placeholder="Enter middle name (optional)"
          errorMessage={errors.middleName}
        />

        <InputField
          label="Birth Date"
          type="date"
          value={formData.birthdate}
          onChange={e => onChange('birthdate', e.target.value)}
          required
          errorMessage={errors.birthdate}
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-600">
            Sex <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.sex}
            onChange={e => onChange('sex', e.target.value)}
            className="bg-default w-full rounded-md border border-default px-3 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select sex</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          {errors.sex && <p className="mt-1 text-sm text-red-600">{errors.sex}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-gray-600">Civil Status</label>
          <select
            value={formData.civilStatus}
            onChange={e => onChange('civilStatus', e.target.value)}
            className="bg-default w-full rounded-md border border-default px-3 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select civil status</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="widowed">Widowed</option>
            <option value="divorced">Divorced</option>
            <option value="separated">Separated</option>
          </select>
          {errors.civilStatus && <p className="mt-1 text-sm text-red-600">{errors.civilStatus}</p>}
        </div>
      </div>

      {/* Mother's Maiden Name Section */}
      <div>
        <h4 className="mb-4 text-sm font-medium text-gray-600">
          Mother&rsquo;s Maiden Name (Optional)
        </h4>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <InputField
            label="Mother&rsquo;s First Name"
            type="text"
            value={formData.motherMaidenFirstName}
            onChange={e => onChange('motherMaidenFirstName', e.target.value)}
            placeholder="Enter mother&rsquo;s first name"
            errorMessage={errors.motherMaidenFirstName}
          />

          <InputField
            label="Mother&rsquo;s Middle Name"
            type="text"
            value={formData.motherMaidenMiddleName}
            onChange={e => onChange('motherMaidenMiddleName', e.target.value)}
            placeholder="Enter mother&rsquo;s middle name"
            errorMessage={errors.motherMaidenMiddleName}
          />

          <InputField
            label="Mother&rsquo;s Last Name"
            type="text"
            value={formData.motherMaidenLastName}
            onChange={e => onChange('motherMaidenLastName', e.target.value)}
            placeholder="Enter mother&rsquo;s last name"
            errorMessage={errors.motherMaidenLastName}
          />
        </div>
      </div>
    </div>
  );
}

// Step 2: Contact & Address Step (Simplified)
function EducationEmploymentStep({ formData, onChange, errors }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base/7 font-semibold text-gray-600">Education & Employment</h3>
        <p className="mt-1 text-sm/6 text-gray-600">
          Your educational background and work information.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-600">Education Level</label>
          <select
            value={formData.educationAttainment || ''}
            onChange={e => onChange('educationAttainment', e.target.value)}
            className="bg-default w-full rounded-md border border-default px-3 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select education level</option>
            <option value="elementary">Elementary</option>
            <option value="high_school">High School</option>
            <option value="college">College</option>
            <option value="post_graduate">Post Graduate</option>
            <option value="vocational">Vocational</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-600">Graduate Status</label>
          <select
            value={formData.isGraduate ? 'yes' : 'no'}
            onChange={e => onChange('isGraduate', e.target.value === 'yes')}
            className="bg-default w-full rounded-md border border-default px-3 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="no">Not a Graduate</option>
            <option value="yes">Graduate</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-600">Employment Status</label>
          <select
            value={formData.employmentStatus || ''}
            onChange={e => onChange('employmentStatus', e.target.value)}
            className="bg-default w-full rounded-md border border-default px-3 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select employment status</option>
            <option value="employed">Employed</option>
            <option value="unemployed">Unemployed</option>
            <option value="underemployed">Underemployed</option>
            <option value="self_employed">Self Employed</option>
            <option value="student">Student</option>
            <option value="retired">Retired</option>
            <option value="homemaker">Homemaker</option>
            <option value="unable_to_work">Unable to Work</option>
            <option value="looking_for_work">Looking for Work</option>
            <option value="not_in_labor_force">Not in Labor Force</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-gray-600">Occupation (PSOC)</label>
          <PSOCSelector
            value={formData.psocCode || ''}
            onSelect={option => {
              if (option) {
                onChange('occupationTitle', option.occupation_title);
                onChange('psocCode', option.occupation_code);
                onChange('psocLevel', option.hierarchy_level);
              } else {
                onChange('occupationTitle', '');
                onChange('psocCode', '');
                onChange('psocLevel', null);
              }
            }}
            placeholder="Search for occupation (e.g., Teacher, Engineer, Doctor)..."
            error={errors.psocCode}
          />
          <p className="mt-1 text-xs text-gray-600">
            Search across all occupation levels - the system will automatically fill in the PSOC
            code and level
          </p>
          {formData.psocCode && (
            <div className="mt-2 text-xs text-gray-600">
              Selected: {formData.occupationTitle} • Code: {formData.psocCode} • Level:{' '}
              {formData.psocLevel}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdditionalDetailsStep({ formData, onChange, errors }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base/7 font-semibold text-gray-600">Additional Details</h3>
        <p className="mt-1 text-sm/6 text-gray-600">Health, identity, and voting information.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-600">Citizenship</label>
          <select
            value={formData.citizenship || 'filipino'}
            onChange={e => onChange('citizenship', e.target.value)}
            className="bg-default w-full rounded-md border border-default px-3 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="filipino">Filipino</option>
            <option value="dual_citizen">Dual Citizen</option>
            <option value="foreign_national">Foreign National</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-600">Blood Type</label>
          <select
            value={formData.bloodType || 'unknown'}
            onChange={e => onChange('bloodType', e.target.value)}
            className="bg-default w-full rounded-md border border-default px-3 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="unknown">Unknown</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-600">Religion</label>
          <select
            value={formData.religion || 'prefer_not_to_say'}
            onChange={e => onChange('religion', e.target.value)}
            className="bg-default w-full rounded-md border border-default px-3 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="prefer_not_to_say">Prefer Not to Say</option>
            <option value="roman_catholic">Roman Catholic</option>
            <option value="islam">Islam</option>
            <option value="iglesia_ni_cristo">Iglesia ni Cristo</option>
            <option value="christian">Christian</option>
            <option value="protestant">Protestant</option>
            <option value="baptist">Baptist</option>
            <option value="methodist">Methodist</option>
            <option value="evangelical">Evangelical</option>
            <option value="buddhism">Buddhism</option>
            <option value="hinduism">Hinduism</option>
            <option value="no_religion">No Religion</option>
            <option value="others">Others</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-600">Ethnicity</label>
          <select
            value={formData.ethnicity || 'not_reported'}
            onChange={e => onChange('ethnicity', e.target.value)}
            className="bg-default w-full rounded-md border border-default px-3 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="not_reported">Not Reported</option>
            <option value="tagalog">Tagalog</option>
            <option value="cebuano">Cebuano</option>
            <option value="ilocano">Ilocano</option>
            <option value="bisaya">Bisaya</option>
            <option value="hiligaynon">Hiligaynon</option>
            <option value="bikolano">Bikolano</option>
            <option value="waray">Waray</option>
            <option value="kapampangan">Kapampangan</option>
            <option value="pangasinense">Pangasinense</option>
            <option value="maranao">Maranao</option>
            <option value="maguindanao">Maguindanao</option>
            <option value="tausug">Tausug</option>
            <option value="chinese">Chinese</option>
            <option value="others">Others</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-600">Registered Voter?</label>
          <select
            value={formData.isVoter === true ? 'yes' : formData.isVoter === false ? 'no' : ''}
            onChange={e =>
              onChange(
                'isVoter',
                e.target.value === 'yes' ? true : e.target.value === 'no' ? false : null
              )
            }
            className="bg-default w-full rounded-md border border-default px-3 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Not specified</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-600">Resident Voter?</label>
          <select
            value={
              formData.isResidentVoter === true
                ? 'yes'
                : formData.isResidentVoter === false
                  ? 'no'
                  : ''
            }
            onChange={e =>
              onChange(
                'isResidentVoter',
                e.target.value === 'yes' ? true : e.target.value === 'no' ? false : null
              )
            }
            className="bg-default w-full rounded-md border border-default px-3 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Not specified</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>

        <InputField
          label="Extension Name"
          type="text"
          value={formData.extensionName || ''}
          onChange={e => onChange('extensionName', e.target.value)}
          placeholder="Jr., Sr., III, etc."
          errorMessage={errors.extensionName}
          helperText="Optional - name suffix"
        />

        <InputField
          label="PhilSys Card Number"
          type="text"
          value={formData.philsysCardNumber || ''}
          onChange={e => onChange('philsysCardNumber', e.target.value)}
          placeholder="1234-5678-9012-3456"
          errorMessage={errors.philsysCardNumber}
          helperText="Optional - Philippine ID number"
        />
      </div>
    </div>
  );
}

function ContactAddressStep({ formData, onChange, errors, userAddress }: any) {
  console.log('ContactAddressStep userAddress:', userAddress);

  // Import the cascading selector at the top of the file if not already there
  const CascadingGeographicSelector = React.lazy(() =>
    import('@/components/molecules/CascadingGeographicSelector').then(module => ({
      default: module.CascadingGeographicSelector,
    }))
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base/7 font-semibold text-gray-600">Contact & Address</h3>
        <p className="mt-1 text-sm/6 text-gray-600">How to reach you and where you live.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <InputField
          label="Mobile Number"
          type="tel"
          value={formData.mobileNumber}
          onChange={e => onChange('mobileNumber', e.target.value)}
          placeholder="09XX-XXX-XXXX"
          errorMessage={errors.mobileNumber}
          helperText="Optional - Philippine mobile number format"
        />

        <InputField
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={e => onChange('email', e.target.value)}
          placeholder="your.email@example.com"
          errorMessage={errors.email}
          helperText="Optional - for notifications and updates"
        />

        <InputField
          label="Telephone Number"
          type="tel"
          value={formData.telephoneNumber}
          onChange={e => onChange('telephoneNumber', e.target.value)}
          placeholder="(02) 123-4567"
          errorMessage={errors.telephoneNumber}
          helperText="Optional - landline number"
        />
      </div>

      {/* Geographic Location - REQUIRED */}
      <div>
        <h4 className="mb-4 text-sm font-medium text-gray-600">
          Geographic Location <span className="text-red-500">*</span>
        </h4>

        {/* Cascading Geographic Selector */}
        <React.Suspense
          fallback={
            <div className="animate-pulse">
              <div className="mb-4 h-12 rounded bg-gray-200"></div>
              <div className="mb-4 h-12 rounded bg-gray-200"></div>
              <div className="mb-4 h-12 rounded bg-gray-200"></div>
              <div className="h-12 rounded bg-gray-200"></div>
            </div>
          }
        >
          <CascadingGeographicSelector
            onSelectionChange={selection => {
              // Update all geographic codes and names
              onChange('regionCode', selection.regionCode);
              onChange('provinceCode', selection.provinceCode);
              onChange('cityMunicipalityCode', selection.cityCode);
              onChange('barangayCode', selection.barangayCode);

              // Also store names for display purposes (not sent to API)
              onChange('regionName', selection.regionName);
              onChange('provinceName', selection.provinceName);
              onChange('cityMunicipalityName', selection.cityName);
              onChange('barangayName', selection.barangayName);

              console.log('[Geographic Selection]', {
                codes: {
                  region: selection.regionCode,
                  province: selection.provinceCode,
                  city: selection.cityCode,
                  barangay: selection.barangayCode,
                },
                names: {
                  region: selection.regionName,
                  province: selection.provinceName,
                  city: selection.cityName,
                  barangay: selection.barangayName,
                },
              });
            }}
            initialValues={{
              regionCode: formData.regionCode || userAddress?.region_code,
              provinceCode: formData.provinceCode || userAddress?.province_code,
              cityCode: formData.cityMunicipalityCode || userAddress?.city_municipality_code,
              barangayCode: formData.barangayCode || userAddress?.barangay_code,
            }}
            required
          />
        </React.Suspense>

        {errors.barangayCode && <p className="mt-2 text-sm text-red-600">{errors.barangayCode}</p>}

        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="flex">
            <div className="shrink-0">
              <svg className="size-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-700 dark:text-gray-200">
                <strong>Note:</strong> Start by selecting your region, then province,
                city/municipality, and finally your barangay. You can search by typing the name of
                the location.
              </p>
            </div>
          </div>
        </div>

        {/* Manual Barangay Selection */}
        <div className="mt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField
              label="Region Code"
              type="text"
              value={formData.regionCode || ''}
              onChange={e => onChange('regionCode', e.target.value)}
              placeholder="e.g., 13"
              helperText="Optional - 2-digit PSGC region code"
            />

            <InputField
              label="Province Code"
              type="text"
              value={formData.provinceCode || ''}
              onChange={e => onChange('provinceCode', e.target.value)}
              placeholder="e.g., 1374"
              helperText="Optional - 4-digit PSGC province code"
            />

            <InputField
              label="City/Municipality Code"
              type="text"
              value={formData.cityMunicipalityCode || ''}
              onChange={e => onChange('cityMunicipalityCode', e.target.value)}
              placeholder="e.g., 137404"
              helperText="Optional - 6-digit PSGC city/municipality code"
            />

            <InputField
              label="Barangay Code"
              type="text"
              value={formData.barangayCode || ''}
              onChange={e => onChange('barangayCode', e.target.value)}
              placeholder="e.g., 137404001"
              errorMessage={errors.barangayCode}
              helperText="Required - 9-digit PSGC barangay code"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex">
          <div className="shrink-0">
            <svg className="size-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm/6 font-medium text-gray-800 dark:text-gray-200">
              Address Information
            </h3>
            <div className="mt-2 text-sm/6 text-gray-700 dark:text-gray-300">
              <p>
                Geographic location can be automatically assigned from your user account or manually
                selected below. Contact information is optional but recommended.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Removed unused step components - now using only 3 simplified steps

// Step 3: Review & Submit (Simplified)
function ReviewStep({
  formData,
  userAddress: _userAddress,
  showError: _showError,
  showSuccess: _showSuccess,
  showErrorModal: _showErrorModal,
  setShowErrorModal: _setShowErrorModal,
  showSuccessModal: _showSuccessModal,
  setShowSuccessModal: _setShowSuccessModal,
  modalError: _modalError,
  modalSuccess: _modalSuccess,
  router: _router,
}: {
  formData: ResidentFormData;
  userAddress: unknown;
  showError: (title: string, message: string, details?: string[]) => void;
  showSuccess: (title: string, message: string) => void;
  showErrorModal: boolean;
  setShowErrorModal: (value: boolean) => void;
  showSuccessModal: boolean;
  setShowSuccessModal: (value: boolean) => void;
  modalError: { title: string; message: string; details: string[] };
  modalSuccess: { title: string; message: string };
  router: any;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-base/7 font-semibold text-gray-600">Review & Submit</h3>
        <p className="mt-1 text-sm/6 text-gray-600">
          Please review your information before submitting.
        </p>
      </div>

      <div className="bg-default-muted rounded-lg border border-default p-6">
        <div className="space-y-6">
          {/* Basic Information Summary */}
          <div>
            <h4 className="mb-3 text-sm/6 font-medium text-gray-600">Basic Information</h4>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              <div>
                <dt className="text-sm/6 font-medium text-gray-600">Name</dt>
                <dd className="text-sm/6 text-gray-600">
                  {`${formData.firstName} ${formData.lastName}`.trim()}
                </dd>
              </div>
              <div>
                <dt className="text-sm/6 font-medium text-gray-600">Birth Date</dt>
                <dd className="text-sm/6 text-gray-600">{formData.birthdate}</dd>
              </div>
              <div>
                <dt className="text-sm/6 font-medium text-gray-600">Sex</dt>
                <dd className="text-sm/6 text-gray-600">{formData.sex}</dd>
              </div>
              <div>
                <dt className="text-sm/6 font-medium text-gray-600">Civil Status</dt>
                <dd className="text-sm/6 text-gray-600">{formData.civilStatus}</dd>
              </div>
            </dl>
          </div>

          {/* Contact Information Summary */}
          <div>
            <h4 className="mb-3 text-sm/6 font-medium text-gray-600">Contact Information</h4>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              <div>
                <dt className="text-sm/6 font-medium text-gray-600">Mobile Number</dt>
                <dd className="text-sm/6 text-gray-600">
                  {formData.mobileNumber || 'Not provided'}
                </dd>
              </div>
              <div>
                <dt className="text-sm/6 font-medium text-gray-600">Email</dt>
                <dd className="text-sm/6 text-gray-600">{formData.email || 'Not provided'}</dd>
              </div>
            </dl>
          </div>

          {/* Education & Employment Summary */}
          <div>
            <h4 className="mb-3 text-sm/6 font-medium text-gray-600">Education & Employment</h4>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              <div>
                <dt className="text-sm/6 font-medium text-gray-600">Education Level</dt>
                <dd className="text-sm/6 text-gray-600">
                  {formData.educationAttainment || 'Not specified'}
                </dd>
              </div>
              <div>
                <dt className="text-sm/6 font-medium text-gray-600">Employment Status</dt>
                <dd className="text-sm/6 text-gray-600">
                  {formData.employmentStatus || 'Not specified'}
                </dd>
              </div>
              {formData.occupationTitle && (
                <div>
                  <dt className="text-sm/6 font-medium text-gray-600">Occupation</dt>
                  <dd className="text-sm/6 text-gray-600">{formData.occupationTitle}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Additional Details Summary */}
          <div>
            <h4 className="mb-3 text-sm/6 font-medium text-gray-600">Additional Details</h4>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              <div>
                <dt className="text-sm/6 font-medium text-gray-600">Citizenship</dt>
                <dd className="text-sm/6 text-gray-600">{formData.citizenship || 'Filipino'}</dd>
              </div>
              <div>
                <dt className="text-sm/6 font-medium text-gray-600">Blood Type</dt>
                <dd className="text-sm/6 text-gray-600">{formData.bloodType || 'Unknown'}</dd>
              </div>
              <div>
                <dt className="text-sm/6 font-medium text-gray-600">Religion</dt>
                <dd className="text-sm/6 text-gray-600">
                  {formData.religion || 'Prefer not to say'}
                </dd>
              </div>
              <div>
                <dt className="text-sm/6 font-medium text-gray-600">Ethnicity</dt>
                <dd className="text-sm/6 text-gray-600">{formData.ethnicity || 'Not reported'}</dd>
              </div>
              {formData.isVoter !== null && (
                <div>
                  <dt className="text-sm/6 font-medium text-gray-600">Registered Voter</dt>
                  <dd className="text-sm/6 text-gray-600">{formData.isVoter ? 'Yes' : 'No'}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
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
              Please review carefully
            </h3>
            <div className="mt-2 text-sm/6 text-amber-700 dark:text-amber-300">
              <p>
                Once submitted, this resident profile will be created with the essential information
                above. Additional details can be added later through your profile settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
