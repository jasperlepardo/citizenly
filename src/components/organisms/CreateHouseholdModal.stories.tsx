import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import CreateHouseholdModal from './CreateHouseholdModal';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useState } from 'react';

const meta = {
  title: 'Organisms/CreateHouseholdModal',
  component: CreateHouseholdModal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A comprehensive modal for creating new households in the RBI System. Includes address hierarchy display, form validation, PSGC-compliant household code generation, and integration with the Philippine geographic classification system.',
      },
    },
  },
  decorators: [
    Story => (
      <ThemeProvider>
        <AuthProvider>
          <Story />
        </AuthProvider>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof CreateHouseholdModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Modal closed'),
    onHouseholdCreated: code => console.log('Household created with code:', code),
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    onClose: () => console.log('Modal closed'),
    onHouseholdCreated: code => console.log('Household created with code:', code),
  },
};

// Interactive example
const InteractiveComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [createdHouseholds, setCreatedHouseholds] = useState<string[]>([]);

  const handleHouseholdCreated = (code: string) => {
    setCreatedHouseholds(prev => [...prev, code]);
    alert(`Household created successfully! Code: ${code}`);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-lg border p-6 bg-background border-default">
        <h3 className="mb-4 font-semibold text-primary">Create Household Modal Demo</h3>
        <p className="mb-4 text-secondary">
          Click the button below to open the household creation modal. The modal includes form
          validation, address hierarchy display, and PSGC-compliant household code generation.
        </p>

        <button
          onClick={() => setIsOpen(true)}
          className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          Create New Household
        </button>
      </div>

      {createdHouseholds.length > 0 && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <h4 className="mb-2 font-medium text-green-800 dark:text-green-200">
            Created Households:
          </h4>
          <ul className="space-y-1 text-sm text-green-700 dark:text-green-300">
            {createdHouseholds.map((code, index) => (
              <li key={index}>• {code}</li>
            ))}
          </ul>
        </div>
      )}

      <CreateHouseholdModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onHouseholdCreated={handleHouseholdCreated}
      />
    </div>
  );
};

export const Interactive: Story = {
  render: InteractiveComponent,
};

// Modal states demonstration
const ModalStatesComponent = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  return (
    <div className="space-y-4 p-6">
      <div className="rounded-lg border p-6 bg-background border-default">
        <h3 className="mb-4 font-semibold text-primary">Modal States</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <button
            onClick={() => setActiveModal('default')}
            className="rounded-lg border p-4 text-left transition-colors border-default hover:bg-surface-hover"
          >
            <h4 className="font-medium text-primary">Default State</h4>
            <p className="mt-1 text-sm text-secondary">Standard modal with empty form</p>
          </button>

          <button
            onClick={() => setActiveModal('prefilled')}
            className="rounded-lg border p-4 text-left transition-colors border-default hover:bg-surface-hover"
          >
            <h4 className="font-medium text-primary">With Sample Data</h4>
            <p className="mt-1 text-sm text-secondary">Modal with pre-filled sample data</p>
          </button>
        </div>
      </div>

      <CreateHouseholdModal
        isOpen={activeModal === 'default'}
        onClose={() => setActiveModal(null)}
        onHouseholdCreated={code => {
          alert(`Household created: ${code}`);
          setActiveModal(null);
        }}
      />

      <CreateHouseholdModal
        isOpen={activeModal === 'prefilled'}
        onClose={() => setActiveModal(null)}
        onHouseholdCreated={code => {
          alert(`Household created: ${code}`);
          setActiveModal(null);
        }}
      />
    </div>
  );
};

export const ModalStates: Story = {
  render: ModalStatesComponent,
};

// Feature showcase
export const FeatureShowcase: Story = {
  render: () => (
    <div className="space-y-6 p-6">
      <div className="rounded-lg border p-6 bg-background border-default">
        <h3 className="mb-4 font-semibold text-primary">Create Household Modal Features</h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-2 font-medium text-primary">Address Integration</h4>
            <ul className="space-y-1 text-sm text-secondary">
              <li>• Automatic barangay assignment from user profile</li>
              <li>• Real-time address hierarchy display</li>
              <li>• PSGC database integration</li>
              <li>• Geographic code derivation</li>
              <li>• Complete address validation</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-2 font-medium text-primary">Form Features</h4>
            <ul className="space-y-1 text-sm text-secondary">
              <li>• Real-time form validation</li>
              <li>• Required field indicators</li>
              <li>• Error message display</li>
              <li>• Loading states during submission</li>
              <li>• Form reset on close/cancel</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-2 font-medium text-primary">Code Generation</h4>
            <ul className="space-y-1 text-sm text-secondary">
              <li>• PSGC-compliant household codes</li>
              <li>• Format: RRPPMMBBB-SSSS-TTTT-HHHH</li>
              <li>• Sequential numbering within barangay</li>
              <li>• Unique code generation</li>
              <li>• Database sequence tracking</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-2 font-medium text-primary">User Experience</h4>
            <ul className="space-y-1 text-sm text-secondary">
              <li>• Modal overlay with backdrop</li>
              <li>• Responsive design</li>
              <li>• Keyboard navigation support</li>
              <li>• Loading indicators</li>
              <li>• Success feedback</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <h4 className="mb-2 font-medium text-blue-800 dark:text-blue-200">
            Address Hierarchy Example
          </h4>
          <div className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
            <div>
              <strong>Format:</strong> RRPPMMBBB-SSSS-TTTT-HHHH
            </div>
            <div>
              <strong>Example:</strong> 137404001-0000-0001-0001
            </div>
            <div>
              <strong>Breakdown:</strong>
            </div>
            <ul className="ml-4 mt-1 space-y-1">
              <li>
                • <strong>137404001:</strong> Barangay code
              </li>
              <li>
                • <strong>0000:</strong> Subdivision code (default)
              </li>
              <li>
                • <strong>0001:</strong> Street code (default)
              </li>
              <li>
                • <strong>0001:</strong> House sequence number
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <CreateHouseholdModal
          isOpen={true}
          onClose={() => {}}
          onHouseholdCreated={code => console.log('Created:', code)}
        />
      </div>
    </div>
  ),
};

// Form validation showcase
const ValidationDemoComponent = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-lg border p-6 bg-background border-default">
        <h3 className="mb-4 font-semibold text-primary">Form Validation Demo</h3>
        <p className="mb-4 text-secondary">
          This demo shows the form validation in action. Try submitting the form without filling
          required fields to see the validation errors.
        </p>

        <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
          <h4 className="mb-2 font-medium text-yellow-800 dark:text-yellow-200">
            Validation Rules:
          </h4>
          <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
            <li>
              • <strong>Street Name:</strong> Required field
            </li>
            <li>
              • <strong>House Number:</strong> Optional
            </li>
            <li>
              • <strong>Subdivision:</strong> Optional
            </li>
            <li>
              • <strong>ZIP Code:</strong> Optional
            </li>
          </ul>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          Test Form Validation
        </button>
      </div>

      <CreateHouseholdModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onHouseholdCreated={code => {
          alert(`Validation passed! Household created: ${code}`);
          setIsOpen(false);
        }}
      />
    </div>
  );
};

export const ValidationDemo: Story = {
  render: ValidationDemoComponent,
};
