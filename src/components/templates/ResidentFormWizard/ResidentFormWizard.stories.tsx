import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import ResidentFormWizard, { type ResidentFormData } from './ResidentFormWizard';

// Mock the required hooks and contexts
const MockProviders = ({ children }: { children: React.ReactNode }) => {
  React.useEffect(() => {
    // Mock useUserBarangay hook
    const mockUserBarangay = {
      barangayCode: '137404001',
      address: {
        region_code: '13',
        region_name: 'National Capital Region (NCR)',
        province_code: '1374',
        province_name: 'Metro Manila',
        city_municipality_code: '137404',
        city_municipality_name: 'Quezon City',
        city_municipality_type: 'City',
        barangay_code: '137404001',
        barangay_name: 'Bagong Pag-asa',
      },
      loading: false,
      error: null,
    };

    (window as any).useUserBarangay = () => mockUserBarangay;
    (window as any).useCSRFToken = () => ({ getToken: () => 'mock-csrf-token' });

    // Mock Next.js router
    (window as any).useRouter = () => ({
      push: (path: string) => console.log('Navigate to:', path),
      pathname: '/residents/create',
    });

    // Mock Supabase
    (window as any).supabase = {
      from: () => ({
        insert: () => ({
          select: () =>
            Promise.resolve({
              data: [{ id: 'mock-resident-id' }],
              error: null,
            }),
        }),
        update: () => ({
          eq: () => Promise.resolve({ error: null }),
        }),
      }),
    };

    // Mock validation functions
    (window as any).validateResidentData = async () => ({ success: true });
    (window as any).validatePhilSysFormat = () => true;
    (window as any).hashPhilSysNumber = async (num: string) => `hash_${num}`;
    (window as any).extractPhilSysLast4 = (num: string) => num.slice(-4);
    (window as any).logSecurityOperation = () => {};
  }, []);

  return <>{children}</>;
};

// Wrapper component to handle form submission
const WizardWrapper = ({
  onSubmit,
  showSubmissionResult = false,
}: {
  onSubmit?: (data: ResidentFormData) => Promise<void>;
  showSubmissionResult?: boolean;
}) => {
  const [submissionResult, setSubmissionResult] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<ResidentFormData | null>(null);

  const handleSubmit = async (data: ResidentFormData) => {
    if (onSubmit) {
      await onSubmit(data);
    } else if (showSubmissionResult) {
      setSubmittedData(data);
      setSubmissionResult('Resident registered successfully!');
      console.log('Resident Form Data:', data);
    }
  };

  const handleCancel = () => {
    console.log('Form cancelled');
  };

  if (submissionResult && submittedData) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-green-900">{submissionResult}</h1>
          <p className="text-green-700">The resident profile has been created in the system.</p>
        </div>

        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-6">
          <h2 className="mb-4 font-semibold text-green-900">Resident Summary</h2>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div>
              <span className="font-medium text-green-800">Name:</span>
              <span className="ml-2 text-green-700">
                {`${submittedData.firstName} ${submittedData.middleName} ${submittedData.lastName} ${submittedData.extensionName}`.trim()}
              </span>
            </div>
            <div>
              <span className="font-medium text-green-800">Birth Date:</span>
              <span className="ml-2 text-green-700">{submittedData.birthdate}</span>
            </div>
            <div>
              <span className="font-medium text-green-800">Sex:</span>
              <span className="ml-2 text-green-700">{submittedData.sex}</span>
            </div>
            <div>
              <span className="font-medium text-green-800">Civil Status:</span>
              <span className="ml-2 text-green-700">{submittedData.civilStatus}</span>
            </div>
            <div>
              <span className="font-medium text-green-800">Mobile:</span>
              <span className="ml-2 text-green-700">{submittedData.mobileNumber}</span>
            </div>
            <div>
              <span className="font-medium text-green-800">Education:</span>
              <span className="ml-2 text-green-700">{submittedData.educationLevel}</span>
            </div>
            <div>
              <span className="font-medium text-green-800">Employment:</span>
              <span className="ml-2 text-green-700">{submittedData.employmentStatus}</span>
            </div>
            <div>
              <span className="font-medium text-green-800">Household:</span>
              <span className="ml-2 text-green-700">
                {submittedData.householdCode || 'Not assigned'}
                {submittedData.householdRole && ` (${submittedData.householdRole})`}
              </span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => {
              setSubmissionResult(null);
              setSubmittedData(null);
            }}
            className="rounded-lg bg-primary px-6 py-3 text-white transition-colors hover:bg-primary-600"
          >
            Register Another Resident
          </button>
        </div>
      </div>
    );
  }

  return (
    <MockProviders>
      <div className="bg-background min-h-screen p-4">
        <ResidentFormWizard onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </MockProviders>
  );
};

const meta = {
  title: 'Templates/ResidentFormWizard',
  component: ResidentFormWizard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Resident Form Wizard - A comprehensive multi-step form for registering new residents. Features extensive data collection including personal information, education & employment, physical characteristics, contact details, migration information, and family relationships. Includes advanced security features, validation, and PSOC integration.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ResidentFormWizard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story - complete workflow
export const Default: Story = {
  render: () => <WizardWrapper />,
};

// With form submission demonstration
export const WithSubmission: Story = {
  render: () => <WizardWrapper showSubmissionResult={true} />,
  parameters: {
    docs: {
      description: {
        story:
          'Complete resident form wizard with submission handling. Fill out the form and submit to see the success state and data summary.',
      },
    },
  },
};

// Step-by-step breakdown
export const Step1PersonalInformation: Story = {
  render: () => (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold text-primary">Step 1: Personal Information</h1>
        <p className="text-secondary">
          Basic personal details and identification information for the resident.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-xl font-semibold text-primary">Required Information</h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <h3 className="mb-2 font-semibold text-red-900">Name Fields (Required)</h3>
              <ul className="space-y-1 text-sm text-red-800">
                <li>• First Name</li>
                <li>• Last Name</li>
                <li>• Middle Name (optional)</li>
                <li>• Extension Name (Jr., Sr., etc.)</li>
              </ul>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="mb-2 font-semibold text-blue-900">Basic Demographics</h3>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Birth Date (required)</li>
                <li>• Sex (Male/Female) (required)</li>
                <li>• Civil Status (required)</li>
                <li>• Citizenship (required)</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold text-primary">Field Features</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-2 h-2 w-2 rounded-full bg-green-500"></div>
              <div>
                <p className="text-sm font-medium text-primary">Real-time Validation</p>
                <p className="text-xs text-secondary">
                  Form validation occurs as user types and moves between fields
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-2 h-2 w-2 rounded-full bg-blue-500"></div>
              <div>
                <p className="text-sm font-medium text-primary">Dropdown Options</p>
                <p className="text-xs text-secondary">
                  Civil status and citizenship use predefined dropdown selections
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-2 h-2 w-2 rounded-full bg-purple-500"></div>
              <div>
                <p className="text-sm font-medium text-primary">Accessibility</p>
                <p className="text-xs text-secondary">
                  All fields include proper labels, ARIA attributes, and keyboard navigation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
            <span className="text-2xl">👤</span>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-indigo-900">Identity Foundation</h3>
            <p className="text-sm text-indigo-800">
              This step establishes the core identity information for the resident profile. All
              subsequent data and services will be linked to this primary identification.
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Detailed breakdown of Step 1 - Personal Information including name, demographics, and identification details.',
      },
    },
  },
};

export const Step2EducationEmployment: Story = {
  render: () => (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold text-primary">Step 2: Education & Employment</h1>
        <p className="text-secondary">
          Academic achievements and professional occupation information.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-xl font-semibold text-primary">Education Details</h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h3 className="mb-2 font-semibold text-green-900">Education Level (Required)</h3>
              <p className="mb-2 text-sm text-green-800">
                Highest educational attainment of the resident.
              </p>
              <div className="rounded bg-green-100 p-2 text-xs text-green-800">
                Options include elementary, high school, college, vocational, graduate, and
                post-graduate levels
              </div>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="mb-2 font-semibold text-blue-900">Education Status (Required)</h3>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Currently Enrolled</li>
                <li>• Graduated/Completed</li>
                <li>• Dropped Out</li>
                <li>• Never Attended</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold text-primary">Employment Information</h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
              <h3 className="mb-2 font-semibold text-purple-900">PSOC Integration</h3>
              <ul className="space-y-1 text-sm text-purple-800">
                <li>• Philippine Standard Occupational Classification</li>
                <li>• Structured occupation coding system</li>
                <li>• Multiple hierarchy levels</li>
                <li>• Professional categorization</li>
              </ul>
            </div>

            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
              <h3 className="mb-2 font-semibold text-orange-900">Employment Status</h3>
              <ul className="space-y-1 text-sm text-orange-800">
                <li>• Employed (full-time/part-time)</li>
                <li>• Self-employed</li>
                <li>• Unemployed</li>
                <li>• Not in labor force</li>
                <li>• Student</li>
                <li>• Retired</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <svg
            className="mt-0.5 h-5 w-5 text-amber-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-amber-900">Advanced Features</h4>
            <p className="mt-1 text-xs text-amber-800">
              This step includes advanced occupation classification using the PSOC system, which
              provides standardized codes for different types of work and professional categories.
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Step 2 focuses on education and employment with PSOC integration for occupation classification.',
      },
    },
  },
};

export const Step3ContactPhysical: Story = {
  render: () => (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold text-primary">Step 3: Contact & Physical Details</h1>
        <p className="text-secondary">
          Communication information, physical characteristics, and family details.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-xl font-semibold text-primary">Contact Information</h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <h3 className="mb-2 font-semibold text-red-900">Mobile Number (Required)</h3>
              <p className="mb-2 text-sm text-red-800">
                Primary contact number with Philippine format validation (09XXXXXXXXX).
              </p>
              <div className="rounded bg-red-100 p-2 text-xs text-red-800">
                Must be 11 digits starting with 09
              </div>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="mb-2 font-semibold text-blue-900">Additional Contact</h3>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Email Address (with validation)</li>
                <li>• Telephone Number</li>
                <li>• PhilSys Card Number (encrypted)</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold text-primary">Physical Characteristics</h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h3 className="mb-2 font-semibold text-green-900">Measurements</h3>
              <ul className="space-y-1 text-sm text-green-800">
                <li>• Height (in centimeters)</li>
                <li>• Weight (in kilograms)</li>
                <li>• Blood Type (ABO system)</li>
                <li>• Complexion</li>
              </ul>
            </div>

            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
              <h3 className="mb-2 font-semibold text-purple-900">Family Information</h3>
              <ul className="space-y-1 text-sm text-purple-800">
                <li>• Mother&rsquo;s First Name</li>
                <li>• Mother&rsquo;s Middle Name</li>
                <li>• Mother&rsquo;s Maiden Last Name</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <div className="rounded-xl border border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100">
              <span className="text-2xl">📞</span>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-cyan-900">Communication & Identification</h3>
              <p className="text-sm text-cyan-800">
                This step establishes how to contact the resident and collects physical identifying
                characteristics for official records and emergency situations.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="mt-0.5 h-5 w-5 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-yellow-900">Security Features</h4>
              <p className="mt-1 text-xs text-yellow-800">
                PhilSys card numbers are encrypted using secure hashing algorithms. Only the last 4
                digits are stored in plain text for reference purposes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Step 3 combines contact information, physical characteristics, and family details with security features.',
      },
    },
  },
};

export const Step4AdditionalInfo: Story = {
  render: () => (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold text-primary">Step 4: Additional Information</h1>
        <p className="text-secondary">
          Migration status, family information, and sectoral classification.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-xl font-semibold text-primary">Migration Information</h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="mb-2 font-semibold text-blue-900">Migration Status</h3>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Is Migrant (Yes/No)</li>
                <li>• Migration Type (Internal/International)</li>
                <li>• Previous Address</li>
                <li>• Migration Reason</li>
                <li>• Migration Date</li>
                <li>• Documentation Status</li>
              </ul>
            </div>

            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h3 className="mb-2 font-semibold text-green-900">Resident Status</h3>
              <ul className="space-y-1 text-sm text-green-800">
                <li>• Permanent Resident</li>
                <li>• Temporary Resident</li>
                <li>• Returning Resident</li>
                <li>• Legal Status Classification</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold text-primary">Sectoral Classification</h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
              <h3 className="mb-2 font-semibold text-purple-900">Auto-Calculated Sectors</h3>
              <ul className="space-y-1 text-sm text-purple-800">
                <li>• Labor Force Participation</li>
                <li>• Employment Status</li>
                <li>• Student Status</li>
                <li>• Senior Citizen Status</li>
                <li>• Indigenous People Classification</li>
                <li>• Person with Disability Status</li>
              </ul>
            </div>

            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
              <h3 className="mb-2 font-semibold text-orange-900">Special Categories</h3>
              <ul className="space-y-1 text-sm text-orange-800">
                <li>• Overseas Filipino Worker (OFW)</li>
                <li>• Solo Parent</li>
                <li>• Out-of-School Children</li>
                <li>• Out-of-School Youth</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
            <span className="text-2xl">🌍</span>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-emerald-900">Comprehensive Profiling</h3>
            <p className="text-sm text-emerald-800">
              This final data collection step creates a complete profile for program eligibility,
              service delivery, and demographic analysis. Many fields are automatically calculated
              based on previous inputs.
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Step 4 captures migration history and automatically calculates sectoral classifications.',
      },
    },
  },
};

export const Step5Review: Story = {
  render: () => (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold text-primary">Step 5: Review & Submit</h1>
        <p className="text-secondary">
          Final review of all information before creating the resident profile.
        </p>
      </div>

      <div className="space-y-8">
        <div className="bg-surface rounded-xl border border-default p-6">
          <h2 className="mb-4 text-lg font-semibold text-primary">Review Features</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-3 font-medium text-primary">Data Summary</h3>
              <ul className="space-y-2 text-sm text-secondary">
                <li>• Personal information overview</li>
                <li>• Education and employment summary</li>
                <li>• Contact details verification</li>
                <li>• Sectoral classification display</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 font-medium text-primary">Validation Checks</h3>
              <ul className="space-y-2 text-sm text-secondary">
                <li>• Required field completeness</li>
                <li>• Data format validation</li>
                <li>• Cross-field consistency</li>
                <li>• Server-side verification</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
              <svg
                className="h-6 w-6 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-amber-900">Final Validation</h3>
              <p className="text-sm text-amber-800">
                The system performs comprehensive validation including server-side checks, data
                consistency verification, and security validation before creating the resident
                record.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <span className="text-2xl">👀</span>
            </div>
            <h3 className="mb-2 font-medium text-blue-900">Review</h3>
            <p className="text-sm text-blue-800">Comprehensive data summary for verification</p>
          </div>

          <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="mb-2 font-medium text-green-900">Validate</h3>
            <p className="text-sm text-green-800">Server-side validation and security checks</p>
          </div>

          <div className="rounded-lg border border-purple-200 bg-purple-50 p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <span className="text-2xl">💾</span>
            </div>
            <h3 className="mb-2 font-medium text-purple-900">Create</h3>
            <p className="text-sm text-purple-800">Generate resident profile and unique ID</p>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Step 5 provides comprehensive review and validation before final submission.',
      },
    },
  },
};

// Mobile view
export const MobileView: Story = {
  render: () => <WizardWrapper />,
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story:
          'Resident Form Wizard optimized for mobile devices with touch-friendly inputs and responsive layout.',
      },
    },
  },
};

// Security features showcase
export const SecurityFeatures: Story = {
  render: () => (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-3xl font-bold text-primary">Security Features</h1>
        <p className="mx-auto max-w-2xl text-secondary">
          The Resident Form Wizard includes comprehensive security measures to protect sensitive
          personal information and ensure data integrity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <div className="mb-3 flex items-center gap-3">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <h3 className="font-semibold text-red-900">PhilSys Encryption</h3>
            </div>
            <ul className="space-y-1 text-sm text-red-800">
              <li>• Secure hash-based encryption</li>
              <li>• Only last 4 digits stored in plain text</li>
              <li>• Full card number never stored</li>
              <li>• Cryptographic security operations</li>
            </ul>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
            <div className="mb-3 flex items-center gap-3">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <h3 className="font-semibold text-blue-900">CSRF Protection</h3>
            </div>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Cross-Site Request Forgery prevention</li>
              <li>• Secure token validation</li>
              <li>• Form submission protection</li>
              <li>• Session-based security</li>
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-green-200 bg-green-50 p-6">
            <div className="mb-3 flex items-center gap-3">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="font-semibold text-green-900">Audit Logging</h3>
            </div>
            <ul className="space-y-1 text-sm text-green-800">
              <li>• Security operation logging</li>
              <li>• User action tracking</li>
              <li>• Data access monitoring</li>
              <li>• Compliance reporting</li>
            </ul>
          </div>

          <div className="rounded-xl border border-purple-200 bg-purple-50 p-6">
            <div className="mb-3 flex items-center gap-3">
              <svg
                className="h-6 w-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="font-semibold text-purple-900">Data Validation</h3>
            </div>
            <ul className="space-y-1 text-sm text-purple-800">
              <li>• Client-side input validation</li>
              <li>• Server-side verification</li>
              <li>• Format checking and sanitization</li>
              <li>• Consistency validation</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <svg
            className="h-8 w-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <h2 className="mb-3 text-2xl font-bold text-gray-900">Defense in Depth</h2>
        <p className="mx-auto max-w-3xl text-gray-700">
          The form implements multiple layers of security including encryption, validation, audit
          logging, and CSRF protection to ensure the highest level of data protection for sensitive
          resident information.
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Comprehensive overview of the security features implemented in the Resident Form Wizard.',
      },
    },
  },
};
