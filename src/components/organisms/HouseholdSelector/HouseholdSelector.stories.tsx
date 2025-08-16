import type { Meta, StoryObj } from '@storybook/react';
import { action } from 'storybook/actions';
import HouseholdSelector from './HouseholdSelector';

const meta: Meta<typeof HouseholdSelector> = {
  title: 'Organisms/HouseholdSelector',
  component: HouseholdSelector,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
A sophisticated household selection component that allows users to choose from existing households or create new ones. This component is essential for resident registration and household management. Key features include:

- **Smart Search** - Search existing households by code, head resident name, or address
- **Create New Option** - Integrated option to create new households
- **Rich Display** - Shows household details, head resident, member count, and full address
- **Geographic Context** - Displays complete address hierarchy from barangay to region
- **Auto-Selection** - Automatically selects newly created households
- **Validation Support** - Error handling and validation messaging

The component integrates with the CreateHouseholdModal for seamless household creation workflow.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'Currently selected household code',
    },
    onSelect: {
      action: 'onSelect',
      description: 'Callback when household is selected or deselected',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the selector',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: '',
    onSelect: action('household-selected'),
    placeholder: '🏠 Search households or leave blank to create new',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Default household selector ready for user interaction. Shows search placeholder with create option.',
      },
    },
  },
};

export const WithSelectedHousehold: Story = {
  args: {
    value: 'HH-042109001-0001-0001-0001',
    onSelect: action('household-selected'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Household selector with a pre-selected household showing formatted display.',
      },
    },
  },
};

export const WithError: Story = {
  args: {
    value: '',
    onSelect: action('household-selected'),
    error: 'Please select a household for this resident',
  },
  parameters: {
    docs: {
      description: {
        story: 'Error state showing validation message for required household selection.',
      },
    },
  },
};

export const CustomPlaceholder: Story = {
  args: {
    value: '',
    onSelect: action('household-selected'),
    placeholder: 'Select an existing household or create a new one',
  },
  parameters: {
    docs: {
      description: {
        story: 'Customized placeholder text for specific use cases.',
      },
    },
  },
};

export const LoadingState: Story = {
  args: {
    value: '',
    onSelect: action('household-selected'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Loading state while fetching household data from the server.',
      },
    },
  },
  render: args => (
    <div className="space-y-4">
      <HouseholdSelector {...args} />
      <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-600">
        💡 In a real implementation, this would show loading spinner while fetching households
      </p>
    </div>
  ),
};

export const WorkflowDemo: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Complete workflow demonstration: search, select, or create new household.',
      },
    },
  },
  render: () => {
    const [selectedHousehold, setSelectedHousehold] = React.useState<string | null>(null);
    const [step, setStep] = React.useState<'select' | 'confirm' | 'complete'>('select');

    const handleSelect = (householdCode: string | null) => {
      setSelectedHousehold(householdCode);
      if (householdCode) {
        setStep('confirm');
      }
    };

    const handleConfirm = () => {
      action('workflow-completed')(selectedHousehold);
      setStep('complete');
    };

    const handleReset = () => {
      setSelectedHousehold(null);
      setStep('select');
    };

    return (
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center space-x-2 text-sm">
          <div
            className={`rounded-sm px-3 py-1 ${step === 'select' ? 'bg-blue-100 text-gray-800 dark:text-gray-200' : 'bg-gray-100 text-gray-600 dark:text-gray-400'}`}
          >
            1. Select Household
          </div>
          <div
            className={`rounded-sm px-3 py-1 ${step === 'confirm' ? 'bg-blue-100 text-gray-800 dark:text-gray-200' : 'bg-gray-100 text-gray-600 dark:text-gray-400'}`}
          >
            2. Confirm
          </div>
          <div
            className={`rounded-sm px-3 py-1 ${step === 'complete' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600 dark:text-gray-400'}`}
          >
            3. Complete
          </div>
        </div>

        {step === 'select' && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Household for New Resident
            </label>
            <HouseholdSelector
              value={selectedHousehold || ''}
              onSelect={handleSelect}
              placeholder="Search for existing household or create new"
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
              Search by household code, head resident name, or address. Select "Create New
              Household" if none exist.
            </p>
          </div>
        )}

        {step === 'confirm' && selectedHousehold && (
          <div className="space-y-4">
            <div className="rounded border border-green-200 bg-green-50 p-4">
              <h3 className="mb-2 font-semibold text-green-800">Household Selected</h3>
              <p className="text-sm text-green-700">Selected Household: {selectedHousehold}</p>
              <p className="mt-1 text-xs text-green-600">
                The new resident will be added to this household.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                className="rounded bg-blue-600 px-4 py-2 text-white dark:text-black hover:bg-blue-700"
              >
                Confirm Selection
              </button>
              <button
                onClick={handleReset}
                className="rounded bg-gray-300 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-400"
              >
                Change Household
              </button>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="space-y-4 text-center">
            <div className="rounded border border-green-200 bg-green-50 p-6">
              <div className="mb-2 text-4xl text-green-600">✅</div>
              <h3 className="mb-2 font-semibold text-green-800">Household Assignment Complete</h3>
              <p className="text-sm text-green-700">
                Household {selectedHousehold} has been selected for the new resident.
              </p>
            </div>

            <button
              onClick={handleReset}
              className="rounded bg-blue-600 px-4 py-2 text-white dark:text-black hover:bg-blue-700"
            >
              Start Over
            </button>
          </div>
        )}
      </div>
    );
  },
};

export const SearchExamples: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Examples of different search patterns and expected results.',
      },
    },
  },
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-lg font-semibold">Search Examples</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-gray-50 p-4">
            <h4 className="mb-2 font-medium">By Household Code</h4>
            <HouseholdSelector
              value=""
              onSelect={action('search-by-code')}
              placeholder='Try "HH-001" or "042109001"'
            />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Search using full or partial household codes
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <h4 className="mb-2 font-medium">By Head Resident Name</h4>
            <HouseholdSelector
              value=""
              onSelect={action('search-by-name')}
              placeholder='Try "Juan dela Cruz" or "Maria"'
            />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Search by household head's full or partial name
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <h4 className="mb-2 font-medium">By Address</h4>
            <HouseholdSelector
              value=""
              onSelect={action('search-by-address')}
              placeholder='Try "Block 5" or "San Lorenzo St"'
            />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Search by house number, street, or subdivision
            </p>
          </div>

          <div className="rounded-lg bg-blue-50 p-4">
            <h4 className="mb-2 font-medium text-gray-800 dark:text-gray-200">Create New</h4>
            <HouseholdSelector
              value=""
              onSelect={action('create-new')}
              placeholder="Click dropdown to see create option"
            />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-600">
              Always available option to create new household
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const FormIntegration: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Integration with form validation and submission workflow.',
      },
    },
  },
  render: () => {
    const [householdCode, setHouseholdCode] = React.useState<string>('');
    const [error, setError] = React.useState<string>('');
    const [residentName, setResidentName] = React.useState<string>('');

    const handleSubmit = () => {
      if (!residentName.trim()) {
        alert('Please enter resident name');
        return;
      }

      if (!householdCode) {
        setError('Please select or create a household');
        return;
      }

      setError('');
      action('form-submitted')({ residentName, householdCode });
      alert(`Resident "${residentName}" assigned to household: ${householdCode}`);
    };

    const handleHouseholdSelect = (code: string | null) => {
      setHouseholdCode(code || '');
      if (error && code) {
        setError(''); // Clear error when valid selection is made
      }
    };

    return (
      <div className="max-w-md space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Resident Name *</label>
          <input
            type="text"
            value={residentName}
            onChange={e => setResidentName(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            placeholder="Enter full name"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Household Assignment *
          </label>
          <HouseholdSelector
            value={householdCode}
            onSelect={handleHouseholdSelect}
            error={error}
            placeholder="Select household or create new"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white dark:text-black hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
        >
          Add Resident to Household
        </button>

        {householdCode && (
          <div className="rounded border border-blue-200 bg-blue-50 p-3">
            <p className="text-sm text-gray-800 dark:text-gray-200">
              <strong>Selected:</strong> {householdCode}
            </p>
          </div>
        )}
      </div>
    );
  },
};

export const ResponsiveLayout: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Responsive behavior on different screen sizes.',
      },
    },
  },
  render: () => (
    <div className="space-y-6">
      <div className="w-full max-w-sm">
        <h4 className="mb-2 text-sm font-semibold">Mobile Layout</h4>
        <HouseholdSelector value="" onSelect={action('mobile-select')} placeholder="Mobile view" />
      </div>

      <div className="w-full max-w-md">
        <h4 className="mb-2 text-sm font-semibold">Tablet Layout</h4>
        <HouseholdSelector
          value=""
          onSelect={action('tablet-select')}
          placeholder="Tablet view with more space"
        />
      </div>

      <div className="w-full max-w-2xl">
        <h4 className="mb-2 text-sm font-semibold">Desktop Layout</h4>
        <HouseholdSelector
          value=""
          onSelect={action('desktop-select')}
          placeholder="Desktop view with full width available"
        />
      </div>
    </div>
  ),
};
