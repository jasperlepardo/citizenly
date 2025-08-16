import type { Meta, StoryObj } from '@storybook/react';
import { action } from 'storybook/actions';
import CreateHouseholdModal from './CreateHouseholdModal';

const meta: Meta<typeof CreateHouseholdModal> = {
  title: 'Organisms/CreateHouseholdModal',
  component: CreateHouseholdModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
A modal dialog for creating new household records in the barangay system. This component provides a comprehensive form for capturing household address information while automatically handling geographic data integration. Key features include:

- **Geographic Integration** - Automatically derives region, province, and city from user's barangay assignment
- **Form Validation** - Client-side validation with error messaging
- **Auto-Generated Codes** - Creates PSGC-compliant household codes automatically
- **Address Hierarchy Display** - Shows the complete address hierarchy for context
- **Real-time Feedback** - Loading states and success/error handling
- **Responsive Design** - Works on desktop and mobile devices

The modal integrates with the Supabase backend to create household records and maintains data consistency with the PSGC (Philippine Standard Geographic Code) system.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Controls modal visibility',
    },
    onClose: {
      action: 'onClose',
      description: 'Callback when modal is closed',
    },
    onHouseholdCreated: {
      action: 'onHouseholdCreated',
      description: 'Callback when household is successfully created',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock auth context for stories
const mockAuthContext = {
  userProfile: {
    id: 'user-123',
    barangay_code: '042109001',
    first_name: 'Juan',
    last_name: 'dela Cruz',
    role: 'admin',
  },
};

// Decorator to provide mock auth context
const withMockAuth = (Story: any) => {
  return (
    <div>
      {/* Mock auth context would be provided here in real implementation */}
      <Story />
    </div>
  );
};

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: action('modal-closed'),
    onHouseholdCreated: action('household-created'),
  },
  decorators: [withMockAuth],
  parameters: {
    docs: {
      description: {
        story:
          'Default modal state ready for household creation. Shows the geographic location context and form fields.',
      },
    },
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    onClose: action('modal-closed'),
    onHouseholdCreated: action('household-created'),
  },
  decorators: [withMockAuth],
  parameters: {
    docs: {
      description: {
        story: 'Modal in closed state - not visible.',
      },
    },
  },
  render: args => (
    <div className="space-y-4">
      <CreateHouseholdModal {...args} />
      <div className="text-center">
        <button
          onClick={() => args.onClose()}
          className="rounded bg-blue-600 px-4 py-2 text-white dark:text-black hover:bg-blue-700"
        >
          Open Create Household Modal
        </button>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">Click the button above to open the modal</p>
      </div>
    </div>
  ),
};

export const WithPrefilledData: Story = {
  args: {
    isOpen: true,
    onClose: action('modal-closed'),
    onHouseholdCreated: action('household-created'),
  },
  decorators: [withMockAuth],
  parameters: {
    docs: {
      description: {
        story: 'Modal demonstrating how it would appear with some form data filled in.',
      },
    },
  },
  render: args => {
    // This would be handled by the component's internal state in real usage
    React.useEffect(() => {
      // Simulate filling in some form data
      const streetInput = document.querySelector(
        'input[placeholder*="Main Street"]'
      ) as HTMLInputElement;
      const houseInput = document.querySelector('input[placeholder*="Blk 1"]') as HTMLInputElement;

      if (streetInput) streetInput.value = 'San Lorenzo Street';
      if (houseInput) houseInput.value = 'Block 5 Lot 12';
    }, []);

    return <CreateHouseholdModal {...args} />;
  },
};

export const GeographicContextDemo: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates how the modal shows different geographic contexts based on the user&rsquo;s barangay assignment.',
      },
    },
  },
  render: () => {
    const [currentModal, setCurrentModal] = React.useState<string | null>(null);

    const locations = [
      {
        id: 'makati',
        name: 'Makati City Location',
        context: {
          region: 'National Capital Region (NCR)',
          province: 'Metro Manila',
          cityMunicipality: 'Makati City (City)',
          barangay: 'San Lorenzo',
          code: '042109001',
        },
      },
      {
        id: 'quezon',
        name: 'Quezon City Location',
        context: {
          region: 'National Capital Region (NCR)',
          province: 'Metro Manila',
          cityMunicipality: 'Quezon City (City)',
          barangay: 'Bagumbayan',
          code: '174212001',
        },
      },
      {
        id: 'cebu',
        name: 'Cebu Province Location',
        context: {
          region: 'Central Visayas (Region VII)',
          province: 'Cebu',
          cityMunicipality: 'Cebu City (City)',
          barangay: 'Lahug',
          code: '071234001',
        },
      },
    ];

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {locations.map(location => (
            <div key={location.id} className="rounded-lg border border-gray-200 p-4">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">{location.name}</h3>
              <div className="mb-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <strong>Region:</strong> {location.context.region}
                </div>
                <div>
                  <strong>Province:</strong> {location.context.province}
                </div>
                <div>
                  <strong>City:</strong> {location.context.cityMunicipality}
                </div>
                <div>
                  <strong>Barangay:</strong> {location.context.barangay}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">Code: {location.context.code}</div>
              </div>
              <button
                onClick={() => setCurrentModal(location.id)}
                className="w-full rounded-sm bg-blue-600 px-3 py-2 text-sm text-white dark:text-black hover:bg-blue-700"
              >
                Create Household Here
              </button>
            </div>
          ))}
        </div>

        {locations.map(location => (
          <CreateHouseholdModal
            key={location.id}
            isOpen={currentModal === location.id}
            onClose={() => setCurrentModal(null)}
            onHouseholdCreated={code => {
              action('household-created')(code, location.context);
              setCurrentModal(null);
            }}
          />
        ))}
      </div>
    );
  },
};

export const FormValidationDemo: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates form validation behavior and error states.',
      },
    },
  },
  render: () => {
    const [isOpen, setIsOpen] = React.useState(true);

    return (
      <div className="space-y-4">
        <CreateHouseholdModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onHouseholdCreated={code => {
            action('household-created')(code);
            setIsOpen(false);
          }}
        />

        {!isOpen && (
          <div className="text-center">
            <button
              onClick={() => setIsOpen(true)}
              className="rounded bg-blue-600 px-4 py-2 text-white dark:text-black hover:bg-blue-700"
            >
              Reopen Modal
            </button>
            <div className="mt-4 rounded-sm border border-yellow-200 bg-yellow-50 p-4 text-left">
              <h4 className="mb-2 font-semibold text-yellow-800">Form Validation Demo</h4>
              <p className="text-sm text-yellow-700">
                Try submitting the form without filling in the required "Street Name" field to see
                validation in action.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  },
};

export const MobileView: Story = {
  args: {
    isOpen: true,
    onClose: action('modal-closed'),
    onHouseholdCreated: action('household-created'),
  },
  decorators: [
    withMockAuth,
    Story => (
      <div className="mx-auto max-w-sm">
        <Story />
      </div>
    ),
  ],
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Modal appearance on mobile devices with responsive design adaptations.',
      },
    },
  },
};

export const LoadingStatesDemo: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates various loading states during the household creation process.',
      },
    },
  },
  render: () => {
    const [currentDemo, setCurrentDemo] = React.useState<'initial' | 'submitting' | 'success'>(
      'initial'
    );
    const [isOpen, setIsOpen] = React.useState(true);

    const handleSubmit = async () => {
      setCurrentDemo('submitting');

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      setCurrentDemo('success');

      // Auto close after success
      setTimeout(() => {
        setIsOpen(false);
        setCurrentDemo('initial');
      }, 1500);
    };

    return (
      <div className="space-y-4">
        <CreateHouseholdModal
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
            setCurrentDemo('initial');
          }}
          onHouseholdCreated={code => {
            action('household-created')(code);
            handleSubmit();
          }}
        />

        {!isOpen && (
          <div className="space-y-4 text-center">
            <button
              onClick={() => setIsOpen(true)}
              className="rounded bg-blue-600 px-4 py-2 text-white dark:text-black hover:bg-blue-700"
            >
              Try Loading States Demo
            </button>

            <div className="rounded border border-blue-200 bg-blue-50 p-4 text-left">
              <h4 className="mb-2 font-semibold text-gray-800 dark:text-gray-200">Loading States Demo</h4>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>
                  <strong>1. Initial:</strong> Form ready for input
                </p>
                <p>
                  <strong>2. Submitting:</strong> Shows loading spinner and disabled inputs
                </p>
                <p>
                  <strong>3. Success:</strong> Confirmation and auto-close
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
};

export const RealWorldScenarios: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Real-world household creation scenarios with different address types.',
      },
    },
  },
  render: () => {
    const [selectedScenario, setSelectedScenario] = React.useState<string | null>(null);

    const scenarios = [
      {
        id: 'subdivision',
        title: 'Subdivision Address',
        description: 'Creating household in a gated subdivision',
        example: {
          houseNumber: 'Block 5 Lot 12',
          streetName: 'San Lorenzo Street',
          subdivision: 'Greenview Subdivision',
          zipCode: '1223',
        },
      },
      {
        id: 'rural',
        title: 'Rural/Zone Address',
        description: 'Creating household in rural area with zone system',
        example: {
          houseNumber: '',
          streetName: 'Maharlika Highway',
          subdivision: 'Zone 3, Purok 2',
          zipCode: '',
        },
      },
      {
        id: 'urban',
        title: 'Urban Street Address',
        description: 'Creating household on regular city street',
        example: {
          houseNumber: '#123',
          streetName: 'Rizal Avenue',
          subdivision: '',
          zipCode: '1000',
        },
      },
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {scenarios.map(scenario => (
            <div key={scenario.id} className="rounded-lg border border-gray-200 p-4">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">{scenario.title}</h3>
              <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">{scenario.description}</p>

              <div className="mb-3 space-y-1 text-xs text-gray-500 dark:text-gray-500">
                <div>
                  <strong>House:</strong> {scenario.example.houseNumber || 'None'}
                </div>
                <div>
                  <strong>Street:</strong> {scenario.example.streetName}
                </div>
                <div>
                  <strong>Subdivision:</strong> {scenario.example.subdivision || 'None'}
                </div>
                <div>
                  <strong>ZIP:</strong> {scenario.example.zipCode || 'None'}
                </div>
              </div>

              <button
                onClick={() => setSelectedScenario(scenario.id)}
                className="w-full rounded-sm bg-green-600 px-3 py-2 text-sm text-white dark:text-black hover:bg-green-700"
              >
                Try This Scenario
              </button>
            </div>
          ))}
        </div>

        {scenarios.map(scenario => (
          <CreateHouseholdModal
            key={scenario.id}
            isOpen={selectedScenario === scenario.id}
            onClose={() => setSelectedScenario(null)}
            onHouseholdCreated={code => {
              action('household-created')(code, scenario);
              setSelectedScenario(null);
            }}
          />
        ))}
      </div>
    );
  },
};
