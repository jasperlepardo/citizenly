import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import HouseholdFormWizard, { type HouseholdFormData } from './HouseholdFormWizard';

// Create a Storybook-compatible wrapper that handles Next.js dependencies

// Error boundary for Next.js dependencies
class NextJsErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    // Check if it's a Next.js router error
    if (
      error.message.includes('NextjsRouterMocksNotAvailable') ||
      error.message.includes('next/navigation')
    ) {
      return { hasError: true, error };
    }
    // Let other errors propagate
    throw error;
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-4xl p-8">
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
            <div className="flex items-center gap-3">
              <svg
                className="h-6 w-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-yellow-800">
                  Next.js Dependencies Required
                </h3>
                <p className="mt-1 text-yellow-700">
                  The HouseholdFormWizard component requires Next.js router and other server-side
                  dependencies that are not available in the Storybook environment.
                </p>
                <p className="mt-2 text-sm text-yellow-600">
                  This component works correctly in the Next.js application but cannot be fully
                  rendered in Storybook due to dependencies on useRouter, Supabase client, and
                  custom hooks.
                </p>
              </div>
            </div>
          </div>

          {/* Show component documentation instead */}
          <div className="mt-8">
            <h2 className="mb-4 text-2xl font-bold text-gray-800">HouseholdFormWizard Component</h2>

            <div className="space-y-6">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h3 className="font-semibold text-blue-900">Purpose</h3>
                <p className="text-blue-800">
                  A comprehensive multi-step form wizard for creating new household records in the
                  barangay system.
                </p>
              </div>

              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <h3 className="font-semibold text-green-900">Features</h3>
                <ul className="list-inside list-disc space-y-1 text-green-800">
                  <li>4-step wizard: Basic Info → Location → Composition → Economic Data</li>
                  <li>Real-time validation with error handling</li>
                  <li>Integration with PSGC geographic data</li>
                  <li>Automatic household code generation</li>
                  <li>Progress indicator with step navigation</li>
                </ul>
              </div>

              <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                <h3 className="font-semibold text-purple-900">Dependencies</h3>
                <ul className="list-inside list-disc space-y-1 text-purple-800">
                  <li>Next.js useRouter for navigation</li>
                  <li>Supabase client for data persistence</li>
                  <li>useUserBarangay hook for geographic context</li>
                  <li>CSRF token management</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Mock the required hooks and contexts
const MockProviders = ({ children }: { children: React.ReactNode }) => {
  return <NextJsErrorBoundary>{children}</NextJsErrorBoundary>;
};

// Wrapper component to handle form submission
const WizardWrapper = ({
  onSubmit,
  showSubmissionResult = false,
}: {
  onSubmit?: (data: HouseholdFormData) => Promise<void>;
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
    }
  };

  const handleCancel = () => {};

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
            className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-600 dark:text-white"
          >
            Create Another Household
          </button>
        </div>
      </div>
    );
  }

  return (
    <MockProviders>
      <div className="min-h-screen bg-white p-4 dark:bg-gray-800">
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
        <h1 className="mb-4 text-3xl font-bold text-gray-600 dark:text-gray-400">
          Step 1: Basic Information
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          The first step collects basic household information and head of household details.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-600 dark:text-gray-400">
            Information Collected
          </h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                Household Code
              </h3>
              <p className="text-sm text-gray-800 dark:text-gray-200">
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
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                Head of Household
              </h3>
              <ul className="space-y-1 text-sm text-gray-800 dark:text-gray-200">
                <li>• First Name (required)</li>
                <li>• Middle Name (optional)</li>
                <li>• Last Name (required)</li>
                <li>• Extension Name (Jr., Sr., etc.)</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-600 dark:text-gray-400">
            Validation Rules
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-2 h-2 w-2 rounded-full bg-red-500"></div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Required Fields
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Household type, head&rsquo;s first and last name must be filled
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-2 h-2 w-2 rounded-full bg-yellow-500"></div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Auto-Generation
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Household code is automatically created when component loads
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-2 h-2 w-2 rounded-full bg-blue-500"></div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Real-time Validation
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Errors clear automatically as user types valid information
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-indigo-200 bg-linear-to-r from-indigo-50 to-blue-50 p-6">
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
        <h1 className="mb-4 text-3xl font-bold text-gray-600 dark:text-gray-400">
          Step 2: Location Details
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Geographic and address information with automatic PSGC hierarchy population.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-600 dark:text-gray-400">
            Geographic Integration
          </h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h3 className="mb-2 font-semibold text-green-900">PSGC Auto-Population</h3>
              <p className="mb-3 text-sm text-green-800">
                Region, Province, City/Municipality, and Barangay codes are automatically populated
                from the user&apos;s assigned barangay.
              </p>
              <div className="rounded bg-green-100 p-2 text-xs text-green-800">
                Example: NCR &gt; Metro Manila &gt; Quezon City &gt; Bagong Pag-asa
              </div>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                Address Components
              </h3>
              <ul className="space-y-1 text-sm text-gray-800 dark:text-gray-200">
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
          <h2 className="mb-4 text-xl font-semibold text-gray-600 dark:text-gray-400">
            Address Features
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-2 h-2 w-2 rounded-full bg-green-500"></div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Automatic Loading
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Geographic hierarchy loads from user&rsquo;s barangay assignment
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-2 h-2 w-2 rounded-full bg-blue-500"></div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  GPS Integration
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Optional latitude/longitude coordinates for precise mapping
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-2 h-2 w-2 rounded-full bg-purple-500"></div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Validation States
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
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
        <h1 className="mb-4 text-3xl font-bold text-gray-600 dark:text-gray-400">
          Step 3: Household Composition
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Demographic information about household members and age distribution.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-600 dark:text-gray-400">
            Member Information
          </h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Total Members</h3>
              <p className="mb-2 text-sm text-gray-800 dark:text-gray-200">
                Overall count of people living in the household (minimum 1).
              </p>
              <div className="rounded bg-blue-100 p-2 text-xs text-gray-800 dark:text-gray-200">
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
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Age Groups</h3>
              <ul className="space-y-1 text-sm text-gray-800 dark:text-gray-200">
                <li>• Children (0-17 years)</li>
                <li>• Adults (18-59 years)</li>
                <li>• Seniors (60+ years)</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-600 dark:text-gray-400">
            Validation Logic
          </h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <h3 className="mb-2 font-semibold text-red-900">Mathematical Validation</h3>
              <p className="text-sm text-red-800">
                The system validates that male + female members equals the total member count. An
                error message appears if numbers don&apos;t match.
              </p>
            </div>

            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <h3 className="mb-2 font-semibold text-yellow-900">Visual Feedback</h3>
              <p className="text-sm text-yellow-800">
                When numbers don&apos;t match, an amber warning box appears with specific guidance
                on correcting the discrepancy.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-2 h-2 w-2 rounded-full bg-blue-500"></div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Real-time Calculation
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Validation occurs as user types numbers
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-2 h-2 w-2 rounded-full bg-green-500"></div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Clear Error Messages
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Specific guidance on what needs to be corrected
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-cyan-200 bg-linear-to-r from-cyan-50 to-blue-50 p-6">
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
        <h1 className="mb-4 text-3xl font-bold text-gray-600 dark:text-gray-400">
          Step 4: Economic & Utilities
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Economic status, utilities access, and dwelling information for comprehensive household
          profiling.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-600 dark:text-gray-400">
            Economic Data
          </h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h3 className="mb-2 font-semibold text-green-900">Income Information</h3>
              <ul className="space-y-1 text-sm text-green-800">
                <li>• Monthly household income range</li>
                <li>• Primary income source classification</li>
                <li>• Employment/business/agriculture/remittances</li>
              </ul>
              <div className="mt-2 rounded-sm bg-green-100 p-2 text-xs text-green-800">
                Income ranges: Below ₱10k, ₱10k-25k, ₱25k-50k, ₱50k-100k, Above ₱100k
              </div>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                Utilities Access
              </h3>
              <p className="mb-2 text-sm text-gray-800 dark:text-gray-200">
                Checkbox-based utility availability tracking:
              </p>
              <ul className="space-y-1 text-sm text-gray-800 dark:text-gray-200">
                <li>• Electricity connection</li>
                <li>• Water supply access</li>
                <li>• Internet connectivity</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-600 dark:text-gray-400">
            Dwelling Information
          </h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                Dwelling Type (Required)
              </h3>
              <ul className="space-y-1 text-sm text-gray-800 dark:text-gray-200">
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
        <div className="rounded-xl border border-emerald-200 bg-linear-to-r from-emerald-50 to-green-50 p-6">
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
        <h1 className="mb-4 text-3xl font-bold text-gray-600 dark:text-gray-400">
          Progress Indicator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Visual progress tracking through the multi-step form with clear step indicators.
        </p>
      </div>

      <div className="space-y-8">
        {/* Step states demonstration */}
        <div className="rounded-xl border border-gray-300 bg-white p-6 dark:border-gray-600 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-600 dark:text-gray-400">
            Step States
          </h2>
          <div className="space-y-6">
            {/* Completed Step */}
            <div className="flex items-center gap-4">
              <div className="relative flex size-8 items-center justify-center rounded-full bg-zinc-600">
                <svg
                  className="size-5 text-white dark:text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-600 dark:text-gray-400">Completed Step</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Green checkmark indicates completed steps
                </p>
              </div>
            </div>

            {/* Current Step */}
            <div className="flex items-center gap-4">
              <div className="relative flex size-8 items-center justify-center rounded-full border-2 border-zinc-600 bg-white">
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">2</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-600 dark:text-gray-400">Current Step</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Bold border and step number for active step
                </p>
              </div>
            </div>

            {/* Future Step */}
            <div className="flex items-center gap-4">
              <div className="group relative flex size-8 items-center justify-center rounded-full border-2 border-zinc-300 bg-white">
                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-500">3</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-600 dark:text-gray-400">Future Step</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Grayed out for steps not yet reached
                </p>
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
              className="rounded-lg border border-gray-300 bg-white p-4 text-center dark:border-gray-600 dark:bg-gray-800"
            >
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stepInfo.step}
                </span>
              </div>
              <h3 className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                {stepInfo.title}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">{stepInfo.description}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <svg
                className="h-6 w-6 text-gray-600 dark:text-gray-400"
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
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                Progressive Enhancement
              </h3>
              <p className="text-sm text-gray-800 dark:text-gray-200">
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
