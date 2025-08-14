import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import HouseholdFormWizard, { type HouseholdFormData } from './HouseholdFormWizard';

// Mock the required hooks and contexts
const MockProviders = ({ children }: { children: React.ReactNode }) => {
  // Mock useUserBarangay hook
  React.useEffect(() => {
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
      pathname: '/households/create',
    });

    // Mock Supabase
    (window as any).supabase = {
      from: () => ({
        insert: () => ({
          select: () =>
            Promise.resolve({
              data: [{ id: 'mock-household-id' }],
              error: null,
            }),
        }),
      }),
    };
  }, []);

  return <>{children}</>;
};

// Wrapper component to handle form submission
const WizardWrapper = ({
  onSubmit,
  initialStep,
  showSubmissionResult = false,
}: {
  onSubmit?: (data: HouseholdFormData) => Promise<void>;
  initialStep?: number;
  showSubmissionResult?: boolean;
}) => {
  const [submissionResult, setSubmissionResult] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<HouseholdFormData | null>(null);

  const handleSubmit = async (data: HouseholdFormData) => {
    if (onSubmit) {
      await onSubmit(data);
    } else if (showSubmissionResult) {
      setSubmittedData(data);
      setSubmissionResult('Household created successfully!');
      console.log('Household Form Data:', data);
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
          <p className="text-green-700">Your household registration has been completed.</p>
        </div>

        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-6">
          <h2 className="mb-4 font-semibold text-green-900">Household Summary</h2>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div>
              <span className="font-medium text-green-800">Household Code:</span>
              <span className="ml-2 font-mono text-green-700">{submittedData.householdCode}</span>
            </div>
            <div>
              <span className="font-medium text-green-800">Household Type:</span>
              <span className="ml-2 text-green-700">{submittedData.householdType}</span>
            </div>
            <div>
              <span className="font-medium text-green-800">Head of Household:</span>
              <span className="ml-2 text-green-700">
                {`${submittedData.headFirstName} ${submittedData.headLastName}`.trim()}
              </span>
            </div>
            <div>
              <span className="font-medium text-green-800">Total Members:</span>
              <span className="ml-2 text-green-700">{submittedData.totalMembers}</span>
            </div>
            <div>
              <span className="font-medium text-green-800">Address:</span>
              <span className="ml-2 text-green-700">{submittedData.streetName}</span>
            </div>
            <div>
              <span className="font-medium text-green-800">Dwelling Type:</span>
              <span className="ml-2 text-green-700">{submittedData.dwellingType}</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => {
              setSubmissionResult(null);
              setSubmittedData(null);
            }}
            className="bg-primary hover:bg-primary-600 rounded-lg px-6 py-3 text-white transition-colors"
          >
            Create Another Household
          </button>
        </div>
      </div>
    );
  }

  return (
    <MockProviders>
      <div className="bg-background min-h-screen p-4">
        <HouseholdFormWizard onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </MockProviders>
  );
};

const meta = {
  title: 'Templates/HouseholdFormWizard',
  component: HouseholdFormWizard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Household Form Wizard - A comprehensive multi-step form for creating new household records. Features step-by-step data collection, validation, auto-population of geographic data, and integration with the barangay management system. Includes household composition, economic information, and location details.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof HouseholdFormWizard>;

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
          'Complete household form wizard with submission handling. Fill out the form and submit to see the success state and data summary.',
      },
    },
  },
};

// Step-by-step breakdown
export const Step1BasicInformation: Story = {
  render: () => (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-8">
        <h1 className="text-primary mb-4 text-3xl font-bold">Step 1: Basic Information</h1>
        <p className="text-secondary">
          The first step collects basic household information and head of household details.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-primary mb-4 text-xl font-semibold">Information Collected</h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="mb-2 font-semibold text-blue-900">Household Code</h3>
              <p className="text-sm text-blue-800">
                Automatically generated unique identifier for the household (e.g., HH-ABC123-XYZ789)
              </p>
            </div>

            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h3 className="mb-2 font-semibold text-green-900">Household Type</h3>
              <p className="text-sm text-green-800">
                Classification of the household structure (nuclear, extended, single, etc.)
              </p>
            </div>

            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
              <h3 className="mb-2 font-semibold text-purple-900">Head of Household</h3>
              <ul className="space-y-1 text-sm text-purple-800">
                <li>• First Name (required)</li>
                <li>• Middle Name (optional)</li>
                <li>• Last Name (required)</li>
                <li>• Extension Name (Jr., Sr., etc.)</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-primary mb-4 text-xl font-semibold">Validation Rules</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-2 h-2 w-2 rounded-full bg-red-500"></div>
              <div>
                <p className="text-primary text-sm font-medium">Required Fields</p>
                <p className="text-secondary text-xs">
                  Household type, head&rsquo;s first and last name must be filled
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-2 h-2 w-2 rounded-full bg-yellow-500"></div>
              <div>
                <p className="text-primary text-sm font-medium">Auto-Generation</p>
                <p className="text-secondary text-xs">
                  Household code is automatically created when component loads
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-2 h-2 w-2 rounded-full bg-blue-500"></div>
              <div>
                <p className="text-primary text-sm font-medium">Real-time Validation</p>
                <p className="text-secondary text-xs">
                  Errors clear automatically as user types valid information
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
            <span className="text-2xl">🏠</span>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-indigo-900">Household Registration System</h3>
            <p className="text-sm text-indigo-800">
              Each household gets a unique code for tracking and reference throughout the system.
              The head of household serves as the primary contact and decision maker for the family
              unit.
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
          'Detailed breakdown of Step 1 - Basic Information collection including household identification and head of household details.',
      },
    },
  },
};

export const Step2LocationDetails: Story = {
  render: () => (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-8">
        <h1 className="text-primary mb-4 text-3xl font-bold">Step 2: Location Details</h1>
        <p className="text-secondary">
          Geographic and address information with automatic PSGC hierarchy population.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-primary mb-4 text-xl font-semibold">Geographic Integration</h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h3 className="mb-2 font-semibold text-green-900">PSGC Auto-Population</h3>
              <p className="mb-3 text-sm text-green-800">
                Region, Province, City/Municipality, and Barangay codes are automatically populated
                from the user's assigned barangay.
              </p>
              <div className="rounded bg-green-100 p-2 text-xs text-green-800">
                Example: NCR &gt; Metro Manila &gt; Quezon City &gt; Bagong Pag-asa
              </div>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="mb-2 font-semibold text-blue-900">Address Components</h3>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Street Name (required)</li>
                <li>• House Number</li>
                <li>• Subdivision/Village</li>
                <li>• Landmark</li>
                <li>• GPS Coordinates (optional)</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-primary mb-4 text-xl font-semibold">Address Features</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-2 h-2 w-2 rounded-full bg-green-500"></div>
              <div>
                <p className="text-primary text-sm font-medium">Automatic Loading</p>
                <p className="text-secondary text-xs">
                  Geographic hierarchy loads from user&rsquo;s barangay assignment
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-2 h-2 w-2 rounded-full bg-blue-500"></div>
              <div>
                <p className="text-primary text-sm font-medium">GPS Integration</p>
                <p className="text-secondary text-xs">
                  Optional latitude/longitude coordinates for precise mapping
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-2 h-2 w-2 rounded-full bg-purple-500"></div>
              <div>
                <p className="text-primary text-sm font-medium">Validation States</p>
                <p className="text-secondary text-xs">
                  Visual feedback for loading, success, and error states
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
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
                <h4 className="text-sm font-medium text-amber-900">Loading States</h4>
                <p className="mt-1 text-xs text-amber-800">
                  The form shows different states: loading (spinner), success (green badge), error
                  (red warning) based on barangay data availability.
                </p>
              </div>
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
          'Step 2 focuses on location and address details with automatic PSGC integration and geographic data population.',
      },
    },
  },
};

export const Step3HouseholdComposition: Story = {
  render: () => (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-8">
        <h1 className="text-primary mb-4 text-3xl font-bold">Step 3: Household Composition</h1>
        <p className="text-secondary">
          Demographic information about household members and age distribution.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-primary mb-4 text-xl font-semibold">Member Information</h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="mb-2 font-semibold text-blue-900">Total Members</h3>
              <p className="mb-2 text-sm text-blue-800">
                Overall count of people living in the household (minimum 1).
              </p>
              <div className="rounded bg-blue-100 p-2 text-xs text-blue-800">
                Must be at least 1 person (the household head)
              </div>
            </div>

            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h3 className="mb-2 font-semibold text-green-900">Gender Distribution</h3>
              <ul className="space-y-1 text-sm text-green-800">
                <li>• Male Members count</li>
                <li>• Female Members count</li>
                <li>• Total must equal overall member count</li>
              </ul>
            </div>

            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
              <h3 className="mb-2 font-semibold text-purple-900">Age Groups</h3>
              <ul className="space-y-1 text-sm text-purple-800">
                <li>• Children (0-17 years)</li>
                <li>• Adults (18-59 years)</li>
                <li>• Seniors (60+ years)</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-primary mb-4 text-xl font-semibold">Validation Logic</h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <h3 className="mb-2 font-semibold text-red-900">Mathematical Validation</h3>
              <p className="text-sm text-red-800">
                The system validates that male + female members equals the total member count. An
                error message appears if numbers don't match.
              </p>
            </div>

            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <h3 className="mb-2 font-semibold text-yellow-900">Visual Feedback</h3>
              <p className="text-sm text-yellow-800">
                When numbers don't match, an amber warning box appears with specific guidance on
                correcting the discrepancy.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-2 h-2 w-2 rounded-full bg-blue-500"></div>
              <div>
                <p className="text-primary text-sm font-medium">Real-time Calculation</p>
                <p className="text-secondary text-xs">Validation occurs as user types numbers</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-2 h-2 w-2 rounded-full bg-green-500"></div>
              <div>
                <p className="text-primary text-sm font-medium">Clear Error Messages</p>
                <p className="text-secondary text-xs">
                  Specific guidance on what needs to be corrected
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100">
            <span className="text-2xl">👨‍👩‍👧‍👦</span>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-cyan-900">Demographic Planning</h3>
            <p className="text-sm text-cyan-800">
              This information helps barangay officials understand population distribution, plan
              services for different age groups, and allocate resources effectively.
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
          'Step 3 collects household demographic composition with built-in validation for mathematical consistency.',
      },
    },
  },
};

export const Step4EconomicInformation: Story = {
  render: () => (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-8">
        <h1 className="text-primary mb-4 text-3xl font-bold">Step 4: Economic & Utilities</h1>
        <p className="text-secondary">
          Economic status, utilities access, and dwelling information for comprehensive household
          profiling.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-primary mb-4 text-xl font-semibold">Economic Data</h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h3 className="mb-2 font-semibold text-green-900">Income Information</h3>
              <ul className="space-y-1 text-sm text-green-800">
                <li>• Monthly household income range</li>
                <li>• Primary income source classification</li>
                <li>• Employment/business/agriculture/remittances</li>
              </ul>
              <div className="mt-2 rounded bg-green-100 p-2 text-xs text-green-800">
                Income ranges: Below ₱10k, ₱10k-25k, ₱25k-50k, ₱50k-100k, Above ₱100k
              </div>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="mb-2 font-semibold text-blue-900">Utilities Access</h3>
              <p className="mb-2 text-sm text-blue-800">
                Checkbox-based utility availability tracking:
              </p>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Electricity connection</li>
                <li>• Water supply access</li>
                <li>• Internet connectivity</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-primary mb-4 text-xl font-semibold">Dwelling Information</h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
              <h3 className="mb-2 font-semibold text-purple-900">Dwelling Type (Required)</h3>
              <ul className="space-y-1 text-sm text-purple-800">
                <li>• Single Detached House</li>
                <li>• Duplex</li>
                <li>• Apartment</li>
                <li>• Condominium</li>
                <li>• Townhouse</li>
                <li>• Informal Dwelling</li>
                <li>• Other</li>
              </ul>
            </div>

            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
              <h3 className="mb-2 font-semibold text-orange-900">Ownership Status (Required)</h3>
              <ul className="space-y-1 text-sm text-orange-800">
                <li>• Owned (full ownership)</li>
                <li>• Rented (paying rent)</li>
                <li>• Shared with others</li>
                <li>• Caretaker arrangement</li>
                <li>• Other arrangements</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-emerald-900">Socioeconomic Profiling</h3>
              <p className="text-sm text-emerald-800">
                Economic and dwelling data helps identify households that may need assistance
                programs, infrastructure development, or social services.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
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
              <h4 className="text-sm font-medium text-amber-900">Required Fields</h4>
              <p className="mt-1 text-xs text-amber-800">
                Dwelling type and ownership status are required to complete this step. Income and
                utilities information is optional but recommended for comprehensive profiling.
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
          'Step 4 captures economic status, utility access, and dwelling information for socioeconomic profiling.',
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
          'Household Form Wizard optimized for mobile devices with touch-friendly inputs and responsive layout.',
      },
    },
  },
};

// Tablet view
export const TabletView: Story = {
  render: () => <WizardWrapper />,
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story:
          'Household Form Wizard on tablet-sized screens showing optimal layout for medium screen sizes.',
      },
    },
  },
};

// Progress indicator showcase
export const ProgressIndicator: Story = {
  render: () => (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-8">
        <h1 className="text-primary mb-4 text-3xl font-bold">Progress Indicator</h1>
        <p className="text-secondary">
          Visual progress tracking through the multi-step form with clear step indicators.
        </p>
      </div>

      <div className="space-y-8">
        {/* Step states demonstration */}
        <div className="bg-surface border-default rounded-xl border p-6">
          <h2 className="text-primary mb-4 text-lg font-semibold">Step States</h2>
          <div className="space-y-6">
            {/* Completed Step */}
            <div className="flex items-center gap-4">
              <div className="relative flex size-8 items-center justify-center rounded-full bg-zinc-600">
                <svg className="size-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-primary font-medium">Completed Step</h3>
                <p className="text-secondary text-sm">Green checkmark indicates completed steps</p>
              </div>
            </div>

            {/* Current Step */}
            <div className="flex items-center gap-4">
              <div className="relative flex size-8 items-center justify-center rounded-full border-2 border-zinc-600 bg-white">
                <span className="text-sm font-medium text-zinc-600">2</span>
              </div>
              <div>
                <h3 className="text-primary font-medium">Current Step</h3>
                <p className="text-secondary text-sm">
                  Bold border and step number for active step
                </p>
              </div>
            </div>

            {/* Future Step */}
            <div className="flex items-center gap-4">
              <div className="group relative flex size-8 items-center justify-center rounded-full border-2 border-zinc-300 bg-white">
                <span className="text-sm font-medium text-zinc-500">3</span>
              </div>
              <div>
                <h3 className="text-primary font-medium">Future Step</h3>
                <p className="text-secondary text-sm">Grayed out for steps not yet reached</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form steps overview */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { step: 1, title: 'Basic Information', description: 'Household details and head info' },
            { step: 2, title: 'Location Details', description: 'Address and geographic data' },
            { step: 3, title: 'Household Composition', description: 'Member demographics' },
            { step: 4, title: 'Economic & Utilities', description: 'Income and dwelling info' },
          ].map((stepInfo, index) => (
            <div
              key={index}
              className="bg-surface border-default rounded-lg border p-4 text-center"
            >
              <div className="bg-primary-100 mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full">
                <span className="text-primary text-sm font-medium">{stepInfo.step}</span>
              </div>
              <h3 className="text-primary mb-1 text-sm font-medium">{stepInfo.title}</h3>
              <p className="text-secondary text-xs">{stepInfo.description}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-blue-900">Progressive Enhancement</h3>
              <p className="text-sm text-blue-800">
                Each step builds upon the previous, ensuring data completeness and logical flow.
                Users can navigate back to previous steps to make corrections while maintaining
                progress.
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
          'Detailed view of the progress indicator system showing different step states and navigation flow.',
      },
    },
  },
};
