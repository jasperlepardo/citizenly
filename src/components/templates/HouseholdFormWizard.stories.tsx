import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import HouseholdFormWizard, { type HouseholdFormData } from './HouseholdFormWizard';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

const meta = {
  title: 'Templates/HouseholdFormWizard',
  component: HouseholdFormWizard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A comprehensive 4-step household registration form wizard for the RBI System. Features automatic household code generation, PSGC geographic integration, demographic composition tracking, economic data collection, and utilities assessment with complete validation and database integration.',
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
} satisfies Meta<typeof HouseholdFormWizard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSubmit: async data => {
      console.log('Household form submitted:', data);
      alert('Household created successfully!');
    },
    onCancel: () => console.log('Household form cancelled'),
  },
};

// Interactive form demonstration
const InteractiveComponent = () => {
  const [submittedData, setSubmittedData] = useState<HouseholdFormData | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (data: HouseholdFormData) => {
    console.log('Submitted household data:', data);
    setSubmittedData(data);
    setIsSubmitted(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('Household registration submitted successfully!');
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
            Household Created Successfully!
          </h3>
          <p className="mb-4 text-green-700 dark:text-green-300">
            The household has been successfully registered in the system with the following details:
          </p>

          <div className="mb-4 rounded-lg border p-4 bg-background border-default">
            <h4 className="mb-3 font-medium text-primary">Household Summary:</h4>
            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
              <div>
                <strong>Household Code:</strong> {submittedData.householdCode}
              </div>
              <div>
                <strong>Household Type:</strong> {submittedData.householdType}
              </div>
              <div>
                <strong>Head of Household:</strong>{' '}
                {`${submittedData.headFirstName} ${submittedData.headMiddleName} ${submittedData.headLastName} ${submittedData.headExtensionName}`.trim()}
              </div>
              <div>
                <strong>Address:</strong> {submittedData.streetName}
              </div>
              <div>
                <strong>Total Members:</strong> {submittedData.totalMembers}
              </div>
              <div>
                <strong>Dwelling Type:</strong> {submittedData.dwellingType}
              </div>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Create Another Household
          </button>
        </div>
      </div>
    );
  }

  return <HouseholdFormWizard onSubmit={handleSubmit} />;
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
            This wizard includes step-by-step validation. Try proceeding without filling required
            fields to see the validation in action.
          </p>

          <div className="mt-4 rounded-lg border p-4 bg-background border-default">
            <h4 className="mb-2 font-medium text-primary">Validation Rules:</h4>
            <ul className="space-y-1 text-sm text-secondary">
              <li>• Step 1: Household type and head of household name are required</li>
              <li>• Step 2: Street name is required for address</li>
              <li>• Step 3: Total members must equal sum of male and female members</li>
              <li>• Step 4: Dwelling type and ownership are required</li>
              <li>• Real-time validation feedback with error messages</li>
            </ul>
          </div>
        </div>

        <HouseholdFormWizard
          onSubmit={async data => {
            console.log('Validation demo submitted:', data);
            alert('All validation passed! Household created successfully.');
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
        <h3 className="mb-4 font-semibold text-primary">Household Form Wizard Features</h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-2 font-medium text-primary">Automatic Code Generation</h4>
            <ul className="space-y-1 text-sm text-secondary">
              <li>• Unique household code generation</li>
              <li>• Timestamp-based unique identifiers</li>
              <li>• Human-readable format</li>
              <li>• Database collision prevention</li>
              <li>• Audit trail integration</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-2 font-medium text-primary">Geographic Integration</h4>
            <ul className="space-y-1 text-sm text-secondary">
              <li>• Auto-population from user barangay</li>
              <li>• PSGC code validation</li>
              <li>• Address hierarchy display</li>
              <li>• GPS coordinates support</li>
              <li>• Location-based services</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-2 font-medium text-primary">Demographics Tracking</h4>
            <ul className="space-y-1 text-sm text-secondary">
              <li>• Total household members</li>
              <li>• Gender distribution tracking</li>
              <li>• Age group categorization</li>
              <li>• Household composition analysis</li>
              <li>• Population statistics support</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-2 font-medium text-primary">Economic Assessment</h4>
            <ul className="space-y-1 text-sm text-secondary">
              <li>• Income range classification</li>
              <li>• Primary income source tracking</li>
              <li>• Utilities access assessment</li>
              <li>• Dwelling type and ownership</li>
              <li>• Socioeconomic profiling</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <h4 className="mb-2 font-medium text-blue-800 dark:text-blue-200">Data Integration</h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            This household wizard seamlessly integrates with the resident management system,
            allowing for complete household-resident relationships and comprehensive demographic
            analysis across the barangay system.
          </p>
        </div>
      </div>

      <HouseholdFormWizard
        onSubmit={async data => {
          console.log('Feature showcase submitted:', data);
          alert('Household created successfully!');
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
      title: 'Basic Information',
      description:
        'Household details, automatic code generation, and head of household information.',
      features: [
        'Auto-generated unique household code',
        'Household type selection',
        'Head of household name fields',
        'Required field validation',
        'Code format standardization',
      ],
    },
    {
      id: 2,
      title: 'Location Details',
      description: 'Address information with PSGC integration and GPS coordinates.',
      features: [
        'Auto-populated barangay information',
        'Street address entry',
        'House number and subdivision',
        'Landmark reference points',
        'Optional GPS coordinates',
      ],
    },
    {
      id: 3,
      title: 'Household Composition',
      description: 'Member demographics and age group distribution.',
      features: [
        'Total household members',
        'Gender distribution tracking',
        'Age group categorization',
        'Member count validation',
        'Demographic consistency checks',
      ],
    },
    {
      id: 4,
      title: 'Economic & Utilities',
      description: 'Income assessment, utilities access, and dwelling information.',
      features: [
        'Monthly income range selection',
        'Primary income source tracking',
        'Utilities access checkboxes',
        'Dwelling type classification',
        'Ownership status documentation',
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-6 bg-background border-default">
        <h3 className="mb-4 font-semibold text-primary">Household Form Steps Overview</h3>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
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

      <HouseholdFormWizard
        onSubmit={async data => {
          console.log('Step walkthrough submitted:', data);
          alert('Household created successfully!');
        }}
      />
    </div>
  );
};

export const StepWalkthrough: Story = {
  render: StepWalkthroughComponent,
};

// Data collection showcase
export const DataCollection: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="rounded-lg border p-6 bg-background border-default">
        <h3 className="mb-4 font-semibold text-primary">Comprehensive Data Collection</h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
            <h4 className="mb-2 font-semibold text-green-800 dark:text-green-200">
              Household Identity
            </h4>
            <ul className="space-y-1 text-sm text-green-700 dark:text-green-300">
              <li>• Unique household codes</li>
              <li>• Household type classification</li>
              <li>• Head of household information</li>
              <li>• Family structure documentation</li>
              <li>• Relationship mapping</li>
            </ul>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <h4 className="mb-2 font-semibold text-blue-800 dark:text-blue-200">Geographic Data</h4>
            <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
              <li>• PSGC-compliant addressing</li>
              <li>• GPS coordinate tracking</li>
              <li>• Address hierarchy validation</li>
              <li>• Location-based services</li>
              <li>• Spatial data integration</li>
            </ul>
          </div>

          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
            <h4 className="mb-2 font-semibold text-purple-800 dark:text-purple-200">
              Socioeconomic Profile
            </h4>
            <ul className="space-y-1 text-sm text-purple-700 dark:text-purple-300">
              <li>• Income range assessment</li>
              <li>• Employment sector tracking</li>
              <li>• Utilities access mapping</li>
              <li>• Housing conditions analysis</li>
              <li>• Economic status indicators</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/20">
          <h4 className="mb-2 font-medium text-gray-800 dark:text-gray-200">
            Statistical Analysis Support
          </h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            The collected household data enables comprehensive barangay-level statistics including
            population density analysis, economic indicators, infrastructure needs assessment, and
            social service planning. All data follows standardized classification systems for
            compatibility with national statistics frameworks.
          </p>
        </div>
      </div>

      <HouseholdFormWizard
        onSubmit={async data => {
          console.log('Data collection demo submitted:', data);
          alert('Comprehensive household data collected successfully!');
        }}
      />
    </div>
  ),
};

// Form state management demo
const StateManagementComponent = () => {
  const [formStates, setFormStates] = useState<string[]>([]);
  const [currentData, setCurrentData] = useState<Partial<HouseholdFormData>>({});

  const logFormState = (action: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    setFormStates(prev => [...prev.slice(-4), `${timestamp}: ${action}`]);
    if (data) {
      setCurrentData(data);
    }
  };

  const mockDataUpdate = (field: keyof HouseholdFormData, value: any) => {
    const newData = { ...currentData, [field]: value };
    setCurrentData(newData);
    logFormState(`Updated ${field}`);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-6 bg-background border-default">
        <h3 className="mb-4 font-semibold text-primary">Household Form State Management</h3>

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
            <h4 className="mb-2 font-medium text-primary">Current Household Data:</h4>
            <div className="rounded border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900/20">
              <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <div>
                  <strong>Household Code:</strong> {currentData.householdCode || 'Not generated'}
                </div>
                <div>
                  <strong>Household Type:</strong> {currentData.householdType || 'Not selected'}
                </div>
                <div>
                  <strong>Head Name:</strong>{' '}
                  {currentData.headFirstName
                    ? `${currentData.headFirstName} ${currentData.headLastName || ''}`.trim()
                    : 'Not provided'}
                </div>
                <div>
                  <strong>Street:</strong> {currentData.streetName || 'Not provided'}
                </div>
                <div>
                  <strong>Total Members:</strong> {currentData.totalMembers || 1}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() =>
              mockDataUpdate('householdCode', 'HH-' + Date.now().toString(36).toUpperCase())
            }
            className="rounded bg-blue-100 px-3 py-1 text-sm text-blue-700 transition-colors hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
          >
            Generate Code
          </button>
          <button
            onClick={() => mockDataUpdate('headFirstName', 'Juan')}
            className="rounded bg-green-100 px-3 py-1 text-sm text-green-700 transition-colors hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50"
          >
            Set Head Name
          </button>
          <button
            onClick={() => setFormStates([])}
            className="rounded bg-gray-200 px-3 py-1 text-sm text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Clear Log
          </button>
        </div>
      </div>

      <HouseholdFormWizard
        onSubmit={async data => {
          logFormState('Form submitted', data);
          alert('Household form submitted successfully!');
        }}
        onCancel={() => logFormState('Form cancelled')}
      />
    </div>
  );
};

export const StateManagement: Story = {
  render: StateManagementComponent,
};

// Code generation showcase
const CodeGenerationComponent = () => {
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);

  const generateSampleCode = () => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    const newCode = `HH-${timestamp}-${randomStr}`.toUpperCase();
    setGeneratedCodes(prev => [...prev.slice(-9), newCode]);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-6 bg-background border-default">
        <h3 className="mb-4 font-semibold text-primary">Household Code Generation</h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-2 font-medium text-primary">Code Format:</h4>
            <div className="rounded border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
              <div className="mb-2 font-mono text-lg font-semibold text-blue-800 dark:text-blue-200">
                HH-&#123;timestamp&#125;-&#123;random&#125;
              </div>
              <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                <li>
                  • <strong>HH:</strong> Household prefix
                </li>
                <li>
                  • <strong>&#123;timestamp&#125;:</strong> Base-36 timestamp
                </li>
                <li>
                  • <strong>&#123;random&#125;:</strong> 6-character random string
                </li>
                <li>• Ensures uniqueness and traceability</li>
                <li>• Human-readable format</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="mb-2 font-medium text-primary">Sample Generated Codes:</h4>
            <div className="mb-4 space-y-2">
              <button
                onClick={generateSampleCode}
                className="rounded bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
              >
                Generate Sample Code
              </button>
            </div>

            {generatedCodes.length > 0 && (
              <div className="max-h-32 overflow-y-auto rounded border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900/20">
                <ul className="space-y-1 font-mono text-sm text-gray-700 dark:text-gray-300">
                  {generatedCodes.map((code, index) => (
                    <li key={index}>• {code}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <h4 className="mb-2 font-medium text-green-800 dark:text-green-200">Code Benefits</h4>
          <p className="text-sm text-green-700 dark:text-green-300">
            Each household receives a unique, automatically generated code that ensures proper
            identification and traceability throughout the system. The codes are designed to be
            collision-resistant and provide audit trail capabilities for household management and
            resident assignment.
          </p>
        </div>
      </div>

      <HouseholdFormWizard
        onSubmit={async data => {
          console.log('Code generation demo submitted:', data);
          alert(`Household created with code: ${data.householdCode}`);
        }}
      />
    </div>
  );
};

export const CodeGeneration: Story = {
  render: CodeGenerationComponent,
};
