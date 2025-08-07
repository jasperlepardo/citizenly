import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ResidentFormWizard, { type ResidentFormData } from './ResidentFormWizard';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

const meta = {
  title: 'Templates/ResidentFormWizard',
  component: ResidentFormWizard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A comprehensive multi-step resident registration form wizard for the RBI System. Features progressive form validation, security-hardened PhilSys number handling, PSOC occupation integration, household assignment, and complete resident data management with PSGC geographic compliance.',
      },
    },
  },
  decorators: [
    Story => (
      <ThemeProvider>
        <AuthProvider>
          <div className="min-h-screen p-6 bg-background">
            <Story />
          </div>
        </AuthProvider>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof ResidentFormWizard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSubmit: async data => {
      console.log('Form submitted:', data);
      alert('Form submitted successfully!');
    },
    onCancel: () => console.log('Form cancelled'),
  },
};

// Interactive form demonstration
const InteractiveComponent = () => {
  const [submittedData, setSubmittedData] = useState<ResidentFormData | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (data: ResidentFormData) => {
    console.log('Submitted resident data:', data);
    setSubmittedData(data);
    setIsSubmitted(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('Resident registration submitted successfully!');
  };

  const handleReset = () => {
    setSubmittedData(null);
    setIsSubmitted(false);
  };

  if (isSubmitted && submittedData) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20">
          <h3 className="mb-4 font-semibold text-green-800 dark:text-green-200">
            Registration Completed!
          </h3>
          <p className="mb-4 text-green-700 dark:text-green-300">
            The resident has been successfully registered in the system.
          </p>

          <div className="mb-4 rounded-lg border p-4 bg-background border-default">
            <h4 className="mb-3 font-medium text-primary">Submitted Information Summary:</h4>
            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
              <div>
                <strong>Name:</strong>{' '}
                {`${submittedData.firstName} ${submittedData.middleName} ${submittedData.lastName} ${submittedData.extensionName}`.trim()}
              </div>
              <div>
                <strong>Birth Date:</strong> {submittedData.birthdate}
              </div>
              <div>
                <strong>Sex:</strong> {submittedData.sex}
              </div>
              <div>
                <strong>Mobile:</strong> {submittedData.mobileNumber}
              </div>
              <div>
                <strong>Education:</strong> {submittedData.educationLevel}
              </div>
              <div>
                <strong>Employment:</strong> {submittedData.employmentStatus}
              </div>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Start New Registration
          </button>
        </div>
      </div>
    );
  }

  return <ResidentFormWizard onSubmit={handleSubmit} />;
};

export const Interactive: Story = {
  render: InteractiveComponent,
};

// Form validation demonstration
export const ValidationDemo: Story = {
  render: () => {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
          <h3 className="mb-2 font-semibold text-yellow-800 dark:text-yellow-200">
            Form Validation Demo
          </h3>
          <p className="mb-3 text-sm text-yellow-700 dark:text-yellow-300">
            This wizard includes comprehensive validation at each step. Try proceeding without
            filling required fields to see the validation in action.
          </p>

          <div className="mt-4 rounded-lg border p-4 bg-background border-default">
            <h4 className="mb-2 font-medium text-primary">Validation Features:</h4>
            <ul className="space-y-1 text-sm text-secondary">
              <li>• Progressive validation at each step</li>
              <li>• Real-time field validation</li>
              <li>• PhilSys number format validation</li>
              <li>• Email and mobile number validation</li>
              <li>• Required field indicators</li>
              <li>• Server-side validation integration</li>
            </ul>
          </div>
        </div>

        <ResidentFormWizard
          onSubmit={async data => {
            console.log('Validation demo submitted:', data);
            alert('All validation passed! Form submitted successfully.');
          }}
        />
      </div>
    );
  },
};

// Feature showcase
export const FeatureShowcase: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="rounded-lg border p-6 bg-background border-default">
        <h3 className="mb-4 font-semibold text-primary">Resident Form Wizard Features</h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-2 font-medium text-primary">Multi-Step Navigation</h4>
            <ul className="space-y-1 text-sm text-secondary">
              <li>• 5-step progressive form wizard</li>
              <li>• Visual progress indicator</li>
              <li>• Step validation before proceeding</li>
              <li>• Back/forward navigation</li>
              <li>• Step completion tracking</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-2 font-medium text-primary">Data Integration</h4>
            <ul className="space-y-1 text-sm text-secondary">
              <li>• PSOC occupation classification</li>
              <li>• PSGC geographic code integration</li>
              <li>• Household assignment system</li>
              <li>• Automatic barangay derivation</li>
              <li>• Migration status tracking</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-2 font-medium text-primary">Security Features</h4>
            <ul className="space-y-1 text-sm text-secondary">
              <li>• PhilSys number encryption</li>
              <li>• CSRF token protection</li>
              <li>• Security operation logging</li>
              <li>• PII data masking</li>
              <li>• Audit trail generation</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-2 font-medium text-primary">Form Sections</h4>
            <ul className="space-y-1 text-sm text-secondary">
              <li>• Personal information (Step 1)</li>
              <li>• Education & employment (Step 2)</li>
              <li>• Contact & physical details (Step 3)</li>
              <li>• Migration & sectoral info (Step 4)</li>
              <li>• Review & submission (Step 5)</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <h4 className="mb-2 font-medium text-blue-800 dark:text-blue-200">
            Data Privacy & Security
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            This form wizard implements comprehensive data protection measures including PhilSys
            number encryption, secure data transmission, and detailed audit logging. All personal
            information is handled according to Philippine data privacy laws and regulations.
          </p>
        </div>
      </div>

      <ResidentFormWizard
        onSubmit={async data => {
          console.log('Feature showcase submitted:', data);
          alert('Registration completed successfully!');
        }}
      />
    </div>
  ),
};

// Step-by-step walkthrough
const StepWalkthroughComponent = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      id: 1,
      title: 'Personal Information',
      description:
        'Basic resident details including name, birth date, civil status, and citizenship information.',
      features: [
        'Required field validation',
        'Name format validation',
        'Birth date picker',
        'Civil status dropdown',
        'Citizenship selection',
      ],
    },
    {
      id: 2,
      title: 'Education & Employment',
      description: 'Academic background and work information with PSOC integration.',
      features: [
        'Education level selection',
        'Education status tracking',
        'PSOC occupation search',
        'Employment status dropdown',
        'Workplace information',
      ],
    },
    {
      id: 3,
      title: 'Contact & Physical Details',
      description: 'Contact information, physical characteristics, and family details.',
      features: [
        'Mobile number validation',
        'Email format validation',
        'PhilSys number handling',
        'Physical characteristics form',
        "Mother's maiden name",
      ],
    },
    {
      id: 4,
      title: 'Additional Information',
      description: 'Migration status, resident classification, and sectoral information.',
      features: [
        'Migration information form',
        'Resident status selector',
        'Sectoral classification',
        'Auto-calculated fields',
        'Conditional form sections',
      ],
    },
    {
      id: 5,
      title: 'Review & Submit',
      description: 'Final review of all entered information before submission.',
      features: [
        'Complete data summary',
        'Validation status check',
        'Edit capability',
        'Security confirmation',
        'Submission processing',
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-6 bg-background border-default">
        <h3 className="mb-4 font-semibold text-primary">Form Wizard Steps Overview</h3>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-5">
          {steps.map(step => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`rounded-lg border p-4 text-left transition-colors ${
                currentStep === step.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'bg-surface border-default hover:bg-surface-hover'
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`flex size-6 items-center justify-center rounded-full text-xs font-medium ${
                    currentStep === step.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {step.id}
                </span>
                <span className="text-sm font-medium text-primary">{step.title}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="rounded-lg border p-6 bg-surface border-default">
          <h4 className="mb-2 font-semibold text-primary">
            Step {steps[currentStep - 1].id}: {steps[currentStep - 1].title}
          </h4>
          <p className="mb-4 text-secondary">{steps[currentStep - 1].description}</p>

          <div>
            <h5 className="mb-2 font-medium text-primary">Key Features:</h5>
            <ul className="space-y-1 text-sm text-secondary">
              {steps[currentStep - 1].features.map((feature, index) => (
                <li key={index}>• {feature}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <ResidentFormWizard
        onSubmit={async data => {
          console.log('Step walkthrough submitted:', data);
          alert('Registration completed successfully!');
        }}
      />
    </div>
  );
};

export const StepWalkthrough: Story = {
  render: StepWalkthroughComponent,
};

// Data integration showcase
export const DataIntegration: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="rounded-lg border p-6 bg-background border-default">
        <h3 className="mb-4 font-semibold text-primary">Data Integration Features</h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
            <h4 className="mb-2 font-semibold text-green-800 dark:text-green-200">
              PSOC Integration
            </h4>
            <ul className="space-y-1 text-sm text-green-700 dark:text-green-300">
              <li>• Real-time occupation search</li>
              <li>• Automatic code assignment</li>
              <li>• Classification level detection</li>
              <li>• Standardized job titles</li>
              <li>• Labor statistics compliance</li>
            </ul>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <h4 className="mb-2 font-semibold text-blue-800 dark:text-blue-200">PSGC Compliance</h4>
            <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
              <li>• Geographic code validation</li>
              <li>• Barangay auto-assignment</li>
              <li>• Address hierarchy mapping</li>
              <li>• Location-based services</li>
              <li>• Government data standards</li>
            </ul>
          </div>

          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
            <h4 className="mb-2 font-semibold text-purple-800 dark:text-purple-200">
              Security Measures
            </h4>
            <ul className="space-y-1 text-sm text-purple-700 dark:text-purple-300">
              <li>• PhilSys number encryption</li>
              <li>• PII data protection</li>
              <li>• CSRF attack prevention</li>
              <li>• Audit trail logging</li>
              <li>• Data privacy compliance</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/20">
          <h4 className="mb-2 font-medium text-gray-800 dark:text-gray-200">
            Database Integration
          </h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            The form wizard seamlessly integrates with the RBI System database, automatically
            populating geographic codes from the user&apos;s barangay assignment, validating against
            PSOC occupation classifications, and maintaining referential integrity with household
            and address management systems.
          </p>
        </div>
      </div>

      <ResidentFormWizard
        onSubmit={async data => {
          console.log('Data integration demo submitted:', data);
          alert('Data successfully integrated and submitted!');
        }}
      />
    </div>
  ),
};

// Form state management demo
const StateManagementComponent = () => {
  const [formStates, setFormStates] = useState<string[]>([]);
  const [currentData, setCurrentData] = useState<Partial<ResidentFormData>>({});

  const logFormState = (action: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    setFormStates(prev => [...prev.slice(-4), `${timestamp}: ${action}`]);
    if (data) {
      setCurrentData(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-6 bg-background border-default">
        <h3 className="mb-4 font-semibold text-primary">Form State Management</h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-2 font-medium text-primary">Recent Form Actions:</h4>
            {formStates.length > 0 ? (
              <div className="rounded border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900/20">
                <ul className="space-y-1 font-mono text-sm text-gray-700 dark:text-gray-300">
                  {formStates.map((state, index) => (
                    <li key={index}>• {state}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-secondary">
                No actions logged yet. Start filling the form to see state changes.
              </p>
            )}
          </div>

          <div>
            <h4 className="mb-2 font-medium text-primary">Current Form Data:</h4>
            <div className="rounded border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900/20">
              <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <div>
                  <strong>Fields filled:</strong>{' '}
                  {
                    Object.keys(currentData).filter(k => currentData[k as keyof ResidentFormData])
                      .length
                  }
                </div>
                <div>
                  <strong>Name:</strong>{' '}
                  {currentData.firstName
                    ? `${currentData.firstName} ${currentData.lastName || ''}`.trim()
                    : 'Not provided'}
                </div>
                <div>
                  <strong>Email:</strong> {currentData.email || 'Not provided'}
                </div>
                <div>
                  <strong>Mobile:</strong> {currentData.mobileNumber || 'Not provided'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setFormStates([])}
          className="mt-4 rounded bg-gray-200 px-3 py-1 text-sm text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          Clear Log
        </button>
      </div>

      <ResidentFormWizard
        onSubmit={async data => {
          logFormState('Form submitted', data);
          alert('Form submitted successfully!');
        }}
        onCancel={() => logFormState('Form cancelled')}
      />
    </div>
  );
};

export const StateManagement: Story = {
  render: StateManagementComponent,
};
