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
  educationLevel: string;
  educationStatus: string;
  psocCode: string;
  psocLevel: string;
  positionTitleId: string;
  occupationDescription: string;
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
  voterRegistrationStatus: boolean;
  residentVoterStatus: boolean;
  lastVotedYear: string;

  // Family Information - Step 3
  motherMaidenFirstName: string;
  motherMaidenMiddleName: string;
  motherMaidenLastName: string;

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

  const steps: FormStep[] = [
    {
      id: 1,
      title: 'Personal Information',
      description: 'Basic details and identification',
      component: PersonalInformation,
    },
    {
      id: 2,
      title: 'Education & Employment',
      description: 'Academic and work information',
      component: EducationEmployment,
    },
    {
      id: 3,
      title: 'Physical & Contact Details',
      description: 'Physical attributes and contact information',
      component: ContactPhysicalStep,
    },
    {
      id: 4,
      title: 'Additional Information',
      description: 'Migration, family, and sectoral information',
      component: AdditionalInfoStep,
    },
    {
      id: 5,
      title: 'Review & Submit',
      description: 'Confirm all information',
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
        // Step 1: Personal Information
        if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.birthdate) newErrors.birthdate = 'Birth date is required';
        if (!formData.sex) newErrors.sex = 'Sex is required';
        if (!formData.civilStatus) newErrors.civilStatus = 'Civil status is required';
        if (!formData.citizenship) newErrors.citizenship = 'Citizenship is required';
      }

      if (step === 2) {
        // Step 2: Education Information
        if (!formData.educationLevel) newErrors.educationLevel = 'Education level is required';
        if (!formData.educationStatus) newErrors.educationStatus = 'Education status is required';
      }

      if (step === 3) {
        // Step 3: Contact Information
        if (!formData.mobileNumber?.trim()) newErrors.mobileNumber = 'Mobile number is required';
        if (formData.mobileNumber && !/^09\d{9}$/.test(formData.mobileNumber)) {
          newErrors.mobileNumber = 'Please enter a valid mobile number (09XXXXXXXXX)';
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    } catch (error) {
      logError(error as Error, 'VALIDATION_ERROR');
      return false;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep) && currentStep < 5) {
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
      // Server-side validation of all form data
      const validationResult = await validateResidentData(formData);
      if (!validationResult.success) {
        const errorMap: Record<string, string> = {};
        validationResult.errors?.forEach((error: { field: string; message: string }) => {
          errorMap[error.field] = error.message;
        });
        setValidationErrors(errorMap);
        alert('Please correct the validation errors and try again');
        setIsSubmitting(false);
        return;
      }

      // Clear any previous validation errors
      setValidationErrors({});

      // Validate PhilSys card number format if provided
      if (formData.philsysCardNumber && !validatePhilSysFormat(formData.philsysCardNumber)) {
        alert('Invalid PhilSys card number format. Please use format: 1234-5678-9012-3456');
        setIsSubmitting(false);
        return;
      }

      // Securely hash PhilSys card number if provided
      let philsysHash = null;
      let philsysLast4 = null;

      if (formData.philsysCardNumber) {
        try {
          philsysHash = await hashPhilSysNumber(formData.philsysCardNumber);
          philsysLast4 = extractPhilSysLast4(formData.philsysCardNumber);

          // Log security operation for audit trail
          logSecurityOperation('PHILSYS_HASH_CREATED', 'current-user', {
            action: 'resident_creation',
            philsys_last4: philsysLast4,
          });
        } catch (error) {
          logError(error as Error, 'PHILSYS_ENCRYPTION_ERROR');
          alert('Error processing PhilSys card number. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }

      // Get CSRF token for secure form submission
      const csrfToken = getCSRFToken();

      // Convert form data to match database schema
      logger.info('Creating resident with household assignment', {
        householdCode: formData.householdCode,
      });

      const residentData = {
        first_name: formData.firstName,
        middle_name: formData.middleName || null,
        last_name: formData.lastName,
        extension_name: formData.extensionName || null,
        birthdate: formData.birthdate,
        sex: formData.sex as 'male' | 'female',
        civil_status: formData.civilStatus as any,
        citizenship: formData.citizenship as any,
        education_level: formData.educationLevel as any,
        education_status: formData.educationStatus as any,
        psoc_code: formData.psocCode || null,
        psoc_level: formData.psocLevel || null,
        occupation_title: formData.occupationDescription || null,
        employment_status: (formData.employmentStatus as any) || 'not_in_labor_force',
        mobile_number: formData.mobileNumber,
        email: formData.email || null,
        // Securely hashed PhilSys card number
        philsys_card_number_hash: philsysHash,
        philsys_last4: philsysLast4,
        // Physical information
        blood_type: (formData.bloodType as any) || 'unknown',
        ethnicity: (formData.ethnicity as any) || 'not_reported',
        religion: (formData.religion as any) || 'other',
        // Voting information
        is_voter: formData.voterRegistrationStatus,
        is_resident_voter: formData.residentVoterStatus,
        // Geographic hierarchy - auto-populated from user's assigned barangay
        region_code: userAddress?.region_code || null,
        province_code: userAddress?.province_code || null,
        city_municipality_code: userAddress?.city_municipality_code || null,
        barangay_code: barangayCode || null,
        // Household assignment
        household_code: formData.householdCode || null,
        // Address details will be populated from household assignment
        street_name: null,
        house_number: null,
        subdivision: null,
      };

      // Log security operation before database insert
      logSecurityOperation('RESIDENT_CREATE_ATTEMPT', 'current-user', {
        action: 'resident_creation',
        has_philsys: !!formData.philsysCardNumber,
        household_code: formData.householdCode,
        barangay_code: barangayCode,
        csrf_token_used: !!csrfToken,
      });

      const { data, error } = await supabase.from('residents').insert([residentData]).select();

      if (error) {
        // Log failed creation attempt
        logSecurityOperation('RESIDENT_CREATE_FAILED', 'current-user', {
          error_message: error.message,
          error_code: error.code,
        });
        dbLogger.error('Failed to create resident', { error: error.message, code: error.code });
        alert(`Failed to create resident: ${error.message}`);
        return;
      }

      // Log successful creation
      logSecurityOperation('RESIDENT_CREATED', 'current-user', {
        resident_id: data[0]?.id,
        household_code: formData.householdCode,
        is_household_head: formData.householdRole === 'Head',
      });

      dbLogger.info('Resident created successfully', {
        recordId: data[0]?.id,
        householdCode: formData.householdCode,
      });

      // If this resident is assigned as household head, update the household
      if (formData.householdRole === 'Head' && formData.householdCode && data?.[0]?.id) {
        logger.info('Updating household head assignment');
        const { error: householdUpdateError } = await supabase
          .from('households')
          .update({ household_head_id: data[0].id })
          .eq('code', formData.householdCode);

        if (householdUpdateError) {
          dbLogger.error('Error updating household head', { error: householdUpdateError.message });
          alert(
            `Resident created but failed to assign as household head: ${householdUpdateError.message}`
          );
        } else {
          dbLogger.info('Household head updated successfully', {
            householdCode: formData.householdCode,
            headId: data[0].id,
          });
        }
      }

      alert('Resident created successfully!');

      // Navigate to residents list using Next.js router
      router.push('/residents');
    } catch (error) {
      logger.error('Unexpected error during resident creation', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    const currentStepData = steps[currentStep - 1];

    if (currentStep === 1) {
      return (
        <PersonalInformation
          value={{
            firstName: formData.firstName,
            middleName: formData.middleName,
            lastName: formData.lastName,
            extensionName: formData.extensionName,
            birthdate: formData.birthdate,
            sex: formData.sex,
            civilStatus: formData.civilStatus,
            citizenship: formData.citizenship,
          }}
          onChange={personalData => {
            setFormData(prev => ({
              ...prev,
              ...personalData,
            }));
          }}
          errors={errors}
        />
      );
    }

    if (currentStep === 2) {
      return (
        <EducationEmployment
          value={{
            educationLevel: formData.educationLevel,
            educationStatus: formData.educationStatus,
            psocCode: formData.psocCode,
            psocLevel: formData.psocLevel,
            positionTitleId: formData.positionTitleId,
            occupationDescription: formData.occupationDescription,
            employmentStatus: formData.employmentStatus,
            workplace: formData.workplace,
          }}
          onChange={educationData => {
            setFormData(prev => ({
              ...prev,
              ...educationData,
            }));
          }}
          errors={errors}
        />
      );
    }

    // For other steps, use the component from steps array
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
                      <div className="h-0.5 w-full bg-primary" />
                    </div>
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                      <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
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
                      <div className="h-0.5 w-full bg-border-light" />
                    </div>
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-surface">
                      <span className="text-sm font-medium text-primary">{step.id}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="h-0.5 w-full bg-border-light" />
                    </div>
                    <div className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-default bg-surface">
                      <span className="text-sm font-medium text-secondary">{step.id}</span>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <div className="mt-6">
          <h2 className="text-lg/8 font-semibold text-primary">{steps[currentStep - 1].title}</h2>
          <p className="mt-1 text-sm/6 text-secondary">{steps[currentStep - 1].description}</p>
        </div>
      </div>

      {/* Form Content */}
      <div className="rounded-lg bg-surface shadow-sm border border-default">
        <div className="px-6 py-8">{renderStepContent()}</div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
        <Button variant="secondary-outline" onClick={handlePrevStep} disabled={currentStep === 1}>
          Previous
        </Button>

        {currentStep < 5 ? (
          <Button variant="primary" onClick={handleNextStep}>
            Continue
          </Button>
        ) : (
          <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Registration'}
          </Button>
        )}
      </div>
    </div>
  );
}

// Step 3: Contact & Physical Information Combined Step
function ContactPhysicalStep({ formData, onChange, errors }: any) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-base/7 font-semibold text-primary">Contact & Physical Information</h3>
        <p className="mt-1 text-sm/6 text-secondary">Contact details and physical attributes.</p>
      </div>

      {/* Contact Information */}
      <div className="space-y-6">
        <h4 className="text-sm/6 font-medium text-primary">Contact Details</h4>

        <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
          <InputField
            label="Mobile Number"
            type="tel"
            value={formData.mobileNumber}
            onChange={e => onChange('mobileNumber', e.target.value)}
            placeholder="09XXXXXXXXX"
            required
            errorMessage={errors.mobileNumber}
          />

          <InputField
            label="Telephone Number"
            type="tel"
            value={formData.telephoneNumber}
            onChange={e => onChange('telephoneNumber', e.target.value)}
            placeholder="(02) XXX-XXXX"
          />

          <InputField
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={e => onChange('email', e.target.value)}
            placeholder="email@example.com"
            errorMessage={errors.email}
          />

          <InputField
            label="PhilSys Card Number"
            type="text"
            value={formData.philsysCardNumber}
            onChange={e => onChange('philsysCardNumber', e.target.value)}
            placeholder="XXXX-XXXX-XXXX"
          />
        </div>
      </div>

      {/* Physical Characteristics */}
      <PhysicalCharacteristics
        value={{
          height_cm: formData.height ? parseFloat(formData.height) : undefined,
          weight_kg: formData.weight ? parseFloat(formData.weight) : undefined,
          blood_type: formData.bloodType as any,
          complexion: formData.complexion as any,
        }}
        onChange={value => {
          if (value.height_cm !== undefined) onChange('height', value.height_cm.toString());
          if (value.weight_kg !== undefined) onChange('weight', value.weight_kg.toString());
          if (value.blood_type) onChange('bloodType', value.blood_type);
          if (value.complexion !== undefined) onChange('complexion', value.complexion);
        }}
      />

      {/* Mother's Maiden Name */}
      <MotherMaidenName
        value={{
          mother_first_name: formData.motherMaidenFirstName,
          mother_middle_name: formData.motherMaidenMiddleName,
          mother_maiden_last_name: formData.motherMaidenLastName,
          is_unknown_mother: false,
          is_confidential: false,
        }}
        onChange={value => {
          onChange('motherMaidenFirstName', value.mother_first_name || '');
          onChange('motherMaidenMiddleName', value.mother_middle_name || '');
          onChange('motherMaidenLastName', value.mother_maiden_last_name || '');
        }}
      />

      {/* Voting Information */}
      <div className="space-y-4">
        <h4 className="text-sm/6 font-medium text-primary">Voting Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="voterRegistration"
              checked={formData.voterRegistrationStatus}
              onChange={e => onChange('voterRegistrationStatus', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-surface border-default rounded focus:ring-blue-500"
            />
            <label htmlFor="voterRegistration" className="text-sm text-primary">
              Registered Voter
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="residentVoter"
              checked={formData.residentVoterStatus}
              onChange={e => onChange('residentVoterStatus', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-surface border-default rounded focus:ring-blue-500"
            />
            <label htmlFor="residentVoter" className="text-sm text-primary">
              Resident Voter
            </label>
          </div>
          <InputField
            label="Last Voted Year"
            type="number"
            value={formData.lastVotedYear}
            onChange={value => onChange('lastVotedYear', value)}
            placeholder="2022"
          />
        </div>
      </div>
    </div>
  );
}

// Step 4: Additional Information (Migration + Sectoral)
function AdditionalInfoStep({ formData, onChange }: any) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-base/7 font-semibold text-primary">Additional Information</h3>
        <p className="mt-1 text-sm/6 text-secondary">
          Migration status, family information, and sectoral classification.
        </p>
      </div>

      {/* Migration Information */}
      <MigrantInformation
        value={formData.migrationInfo}
        onChange={value => onChange('migrationInfo', value)}
      />

      {/* Resident Status */}
      <ResidentStatusSelector
        value={{
          status_type: 'permanent',
          is_registered_voter: formData.voterRegistrationStatus,
          voter_id_number: undefined,
          precinct_number: undefined,
          is_indigenous_member: formData.ethnicity?.includes('indigenous') || false,
          tribal_affiliation: undefined,
          indigenous_community: undefined,
          legal_status:
            formData.citizenship === 'filipino'
              ? 'citizen'
              : formData.citizenship === 'dual_citizen'
                ? 'dual_citizen'
                : 'visitor',
          documentation_status: 'complete',
        }}
        onChange={() => {}} // Read-only for now, derived from other fields
        disabled
      />

      {/* Sectoral Information */}
      <SectoralInfo
        value={{
          is_labor_force: false,
          is_employed: false,
          is_unemployed: false,
          is_ofw: false,
          is_pwd: false,
          is_out_of_school_children: false,
          is_out_of_school_youth: false,
          is_senior_citizen: false,
          is_registered_senior_citizen: false,
          is_solo_parent: false,
          is_indigenous_people: false,
          is_migrant: false,
        }}
        onChange={() => {}} // Auto-calculated
        context={{
          age: formData.birthdate
            ? Math.floor(
                (Date.now() - new Date(formData.birthdate).getTime()) /
                  (365.25 * 24 * 60 * 60 * 1000)
              )
            : 0,
          employment_status: formData.employmentStatus,
          highest_educational_attainment: formData.educationLevel,
        }}
      />
    </div>
  );
}

// Step 5: Review
function ReviewStep({
  formData,
  userAddress: _userAddress,
}: {
  formData: ResidentFormData;
  userAddress: unknown;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-base/7 font-semibold text-primary">Review & Submit</h3>
        <p className="mt-1 text-sm/6 text-secondary">
          Please review all information before submitting.
        </p>
      </div>

      <div className="rounded-lg bg-background-muted p-6 border border-default">
        <div className="space-y-6">
          {/* Personal Information Summary */}
          <div>
            <h4 className="text-sm/6 font-medium text-primary mb-3">Personal Information</h4>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              <div>
                <dt className="text-sm/6 font-medium text-secondary">Name</dt>
                <dd className="text-sm/6 text-primary">
                  {`${formData.firstName} ${formData.middleName} ${formData.lastName} ${formData.extensionName}`.trim()}
                </dd>
              </div>
              <div>
                <dt className="text-sm/6 font-medium text-secondary">Birth Date</dt>
                <dd className="text-sm/6 text-primary">{formData.birthdate}</dd>
              </div>
              <div>
                <dt className="text-sm/6 font-medium text-secondary">Sex</dt>
                <dd className="text-sm/6 text-primary">{formData.sex}</dd>
              </div>
              <div>
                <dt className="text-sm/6 font-medium text-secondary">Civil Status</dt>
                <dd className="text-sm/6 text-primary">{formData.civilStatus}</dd>
              </div>
              <div>
                <dt className="text-sm/6 font-medium text-secondary">Citizenship</dt>
                <dd className="text-sm/6 text-primary">{formData.citizenship}</dd>
              </div>
            </dl>
          </div>

          {/* Education & Employment Summary */}
          <div>
            <h4 className="text-sm/6 font-medium text-primary mb-3">Education & Employment</h4>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              <div>
                <dt className="text-sm/6 font-medium text-secondary">Education Level</dt>
                <dd className="text-sm/6 text-primary">
                  {formData.educationLevel || 'Not specified'}
                </dd>
              </div>
              <div>
                <dt className="text-sm/6 font-medium text-secondary">Education Status</dt>
                <dd className="text-sm/6 text-primary">
                  {formData.educationStatus || 'Not specified'}
                </dd>
              </div>
              <div>
                <dt className="text-sm/6 font-medium text-secondary">Employment Status</dt>
                <dd className="text-sm/6 text-primary">
                  {formData.employmentStatus || 'Not specified'}
                </dd>
              </div>
              <div>
                <dt className="text-sm/6 font-medium text-secondary">Occupation</dt>
                <dd className="text-sm/6 text-primary">
                  {formData.occupationDescription || 'Not specified'}
                  {formData.psocCode && (
                    <span className="block text-xs text-muted">
                      PSOC Code: {formData.psocCode} ({formData.psocLevel?.replace('_', ' ')})
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>

          {/* Contact Information Summary */}
          <div>
            <h4 className="text-sm/6 font-medium text-primary mb-3">Contact Information</h4>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              <div>
                <dt className="text-sm/6 font-medium text-secondary">Mobile</dt>
                <dd className="text-sm/6 text-primary">{formData.mobileNumber}</dd>
              </div>
              <div>
                <dt className="text-sm/6 font-medium text-secondary">Email</dt>
                <dd className="text-sm/6 text-primary">{formData.email || 'Not provided'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-4 border border-amber-200 dark:border-amber-800">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
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
                Once submitted, this resident profile will be created and a unique resident ID will
                be generated. You can edit the information later if needed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
