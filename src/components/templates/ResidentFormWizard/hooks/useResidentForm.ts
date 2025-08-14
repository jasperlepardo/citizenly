import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useUserBarangay } from '@/hooks/useUserBarangay';
import {
  ResidentFormData,
  ValidationErrors,
  FormStep,
  UseResidentFormReturn,
  ResidentFormWizardProps,
} from '../types';
import {
  BasicInfoStep,
  ContactAddressStep,
  EducationEmploymentStep,
  AdditionalDetailsStep,
  ReviewStep,
} from '../steps';
import {
  validateStep1,
  validateStep2,
  validateStep3,
  validateStep4,
  validateStep5,
} from '../utils/validation';

// Default form data
const getInitialFormData = (initialData?: Partial<ResidentFormData>): ResidentFormData => ({
  // Personal Information - Step 1
  firstName: '',
  middleName: '',
  lastName: '',
  extensionName: '',
  birthdate: '',
  sex: '',
  civilStatus: 'single',
  citizenship: 'filipino',

  // Family Information - Step 1
  motherMaidenFirstName: '',
  motherMaidenMiddleName: '',
  motherMaidenLastName: '',

  // Birth Place Information - Step 1
  birthPlaceCode: '',
  birthPlaceLevel: '',
  birthPlaceName: '',

  // Contact Information - Step 2
  email: '',
  mobileNumber: '',
  telephoneNumber: '',

  // Geographic Information - Step 2
  regionCode: '',
  provinceCode: '',
  cityMunicipalityCode: '',
  barangayCode: '',

  // Address Details - Step 2
  streetId: '',
  subdivisionId: '',
  zipCode: '',

  // Education & Employment - Step 3
  educationAttainment: '',
  isGraduate: false,
  employmentStatus: 'not_in_labor_force',
  psocCode: '',
  psocLevel: null,
  occupationTitle: '',
  workplace: '',

  // Physical & Identity Information - Step 4
  bloodType: 'unknown',
  height: '',
  weight: '',
  complexion: '',
  ethnicity: 'not_reported',
  religion: 'prefer_not_to_say',
  religionOthersSpecify: '',

  // Voting Information - Step 4
  isVoter: null,
  isResidentVoter: null,
  lastVotedDate: '',

  // Documentation - Step 4
  philsysCardNumber: '',

  // Household Assignment - Step 5
  householdCode: '',

  // Migration Information - Step 5 (optional)
  migrationInfo: null,

  ...initialData,
});

export function useResidentForm({
  onSubmit,
  onCancel,
  initialData,
}: ResidentFormWizardProps = {}): UseResidentFormReturn {
  const router = useRouter();
  const { barangayCode: userBarangayCode, loading: barangayLoading } = useUserBarangay();

  // Form state
  const [formData, setFormData] = useState<ResidentFormData>(() => getInitialFormData(initialData));
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-populate barangay code from user profile
  useEffect(() => {
    if (userBarangayCode && !formData.barangayCode) {
      setFormData(prev => ({ ...prev, barangayCode: userBarangayCode }));
    }
  }, [userBarangayCode, formData.barangayCode]);

  // Auto-populate complete geographic hierarchy from user profile
  useEffect(() => {
    const autoPopulateGeographicData = async () => {
      // Skip if already populated or no auth session
      if (formData.regionCode || formData.provinceCode || formData.cityMunicipalityCode) return;

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user) return;

        console.log('🚀 Pre-loading geographic data for faster form experience...');

        // Use dedicated API endpoint for secure auto-populate
        const response = await fetch('/api/user/geographic-location', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          console.log('⚠️ Could not pre-load geographic data, user will select manually');
          return;
        }

        const hierarchy = await response.json();
        console.log('✅ Geographic data pre-loaded:', hierarchy);

        // Update form data with complete hierarchy
        setFormData(prev => ({
          ...prev,
          regionCode: hierarchy.region?.code || '',
          provinceCode: hierarchy.province?.code || '',
          cityMunicipalityCode: hierarchy.city?.code || '',
          barangayCode: hierarchy.barangay?.code || prev.barangayCode, // Don't override if already set
        }));

        console.log('🎉 Form pre-populated with user geographic location');
      } catch (error) {
        console.error('❌ Error pre-loading geographic data:', error);
        // Silently fail - user can still select manually
      }
    };

    // Only run once when component mounts
    autoPopulateGeographicData();
  }, []); // Empty dependency array - only run once

  // Step configuration
  const steps: FormStep[] = useMemo(
    () => [
      {
        id: 1,
        title: 'Personal Information',
        description: 'Basic personal details and family information',
        component: BasicInfoStep,
        validation: validateStep1,
      },
      {
        id: 2,
        title: 'Contact & Address',
        description: 'Contact information and geographic location',
        component: ContactAddressStep,
        validation: validateStep2,
      },
      {
        id: 3,
        title: 'Education & Employment',
        description: 'Educational background and occupation details',
        component: EducationEmploymentStep,
        validation: validateStep3,
      },
      {
        id: 4,
        title: 'Additional Details',
        description: 'Physical characteristics, voting info, and documentation',
        component: AdditionalDetailsStep,
        validation: validateStep4,
      },
      {
        id: 5,
        title: 'Review & Submit',
        description: 'Review all information and submit registration',
        component: ReviewStep,
        validation: validateStep5,
      },
    ],
    []
  );

  // Handle input changes
  const handleInputChange = useCallback(
    (field: keyof ResidentFormData, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }));

      // Clear error for this field when user starts typing
      if (errors[field]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors]
  );

  // Validate current step
  const validateStep = useCallback(
    (step: number): boolean => {
      const currentStepConfig = steps[step - 1];
      if (!currentStepConfig) return true;

      const stepErrors = currentStepConfig.validation(formData);
      setErrors(stepErrors);

      return Object.keys(stepErrors).length === 0;
    },
    [steps, formData]
  );

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    let allErrors: ValidationErrors = {};

    steps.forEach(step => {
      const stepErrors = step.validation(formData);
      allErrors = { ...allErrors, ...stepErrors };
    });

    setErrors(allErrors);
    return Object.keys(allErrors).length === 0;
  }, [steps, formData]);

  // Navigation handlers
  const handleNextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  }, [currentStep, validateStep, steps.length]);

  const handlePrevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setErrors({}); // Clear errors when going back
  }, []);

  // Form submission
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      // If validation fails, go to first step with errors
      const firstStepWithError = steps.findIndex(step => {
        const stepErrors = step.validation(formData);
        return Object.keys(stepErrors).length > 0;
      });
      if (firstStepWithError !== -1) {
        setCurrentStep(firstStepWithError + 1);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Default submission logic
        await submitToAPI(formData);
        router.push('/residents?success=created');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      // Handle error (could set a global error state)
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, steps, onSubmit, router]);

  // Default API submission
  const submitToAPI = async (data: ResidentFormData) => {
    const token = await supabase.auth
      .getSession()
      .then(({ data: { session } }) => session?.access_token);

    if (!token) throw new Error('No authentication token');

    const response = await fetch('/api/residents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        resident_data: {
          firstName: data.firstName,
          middleName: data.middleName,
          lastName: data.lastName,
          extensionName: data.extensionName,
          birthdate: data.birthdate,
          sex: data.sex,
          civilStatus: data.civilStatus,
          citizenship: data.citizenship,
          email: data.email,
          mobileNumber: data.mobileNumber,
          telephoneNumber: data.telephoneNumber,
          motherMaidenFirstName: data.motherMaidenFirstName,
          motherMaidenMiddleName: data.motherMaidenMiddleName,
          motherMaidenLastName: data.motherMaidenLastName,
          educationAttainment: data.educationAttainment,
          isGraduate: data.isGraduate,
          employmentStatus: data.employmentStatus,
          psocCode: data.psocCode,
          psocLevel: data.psocLevel,
          occupationTitle: data.occupationTitle,
          workplace: data.workplace,
          bloodType: data.bloodType,
          height: data.height,
          weight: data.weight,
          ethnicity: data.ethnicity,
          religion: data.religion,
          religionOthersSpecify: data.religionOthersSpecify,
          isVoter: data.isVoter,
          isResidentVoter: data.isResidentVoter,
          lastVotedDate: data.lastVotedDate,
          philsysCardNumber: data.philsysCardNumber,
          barangayCode: data.barangayCode,
          cityMunicipalityCode: data.cityMunicipalityCode,
          provinceCode: data.provinceCode,
          regionCode: data.regionCode,
          householdCode: data.householdCode,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create resident');
    }

    return response.json();
  };

  // Computed properties
  const canProceedToNext = currentStep < steps.length;
  const canGoBack = currentStep > 1;

  return {
    // State
    formData,
    errors,
    currentStep,
    isSubmitting,

    // Actions
    handleInputChange,
    handleNextStep,
    handlePrevStep,
    handleSubmit,

    // Validation
    validateStep,
    validateForm,

    // Utilities
    steps,
    canProceedToNext,
    canGoBack,
  };
}
