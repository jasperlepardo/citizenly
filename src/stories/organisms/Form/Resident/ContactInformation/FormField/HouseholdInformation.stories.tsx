import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { HouseholdInformation, HouseholdInformationData } from '@/components/organisms/HouseholdInformation';

const meta = {
  title: 'Organisms/Form/Resident/ContactInformation/FormField/HouseholdInformation',
  component: HouseholdInformation,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A form section for selecting household information. Features searchable household selection with support for searching by code, head name, or address.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'object' },
      description: 'Current household information values',
    },
    onChange: {
      action: 'changed',
      description: 'Callback when field value changes',
    },
    errors: {
      control: { type: 'object' },
      description: 'Error messages for household fields',
    },
    onHouseholdSearch: {
      action: 'searched',
      description: 'Callback when user searches for households',
    },
    householdOptions: {
      control: { type: 'object' },
      description: 'Available household options',
    },
    householdLoading: {
      control: { type: 'boolean' },
      description: 'Loading state for household search',
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof HouseholdInformation>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample household options
const sampleHouseholdOptions = [
  {
    value: 'HH-001',
    label: 'HH-001 - Juan Dela Cruz (123 Main St, Brgy. Central)',
  },
  {
    value: 'HH-002',
    label: 'HH-002 - Maria Santos (456 Rizal Ave, Brgy. Poblacion)',
  },
  {
    value: 'HH-003',
    label: 'HH-003 - Pedro Garcia (789 Luna St, Brgy. San Jose)',
  },
  {
    value: 'HH-004',
    label: 'HH-004 - Ana Reyes (321 Bonifacio St, Brgy. Central)',
  },
  {
    value: 'HH-005',
    label: 'HH-005 - Carlos Mendoza (654 Mabini Ave, Brgy. San Antonio)',
  },
];

// Default empty state
const emptyData: HouseholdInformationData = {
  householdCode: '',
};

// Basic Examples
export const Default: Story = {
  args: {
    value: emptyData,
    onChange: () => {},
    errors: {},
    householdOptions: sampleHouseholdOptions,
    householdLoading: false,
  },
};

export const WithSelectedHousehold: Story = {
  args: {
    value: {
      householdCode: 'HH-001',
    },
    onChange: () => {},
    errors: {},
    householdOptions: sampleHouseholdOptions,
    householdLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Form with a household already selected.',
      },
    },
  },
};

// Error States
export const WithValidationError: Story = {
  args: {
    value: emptyData,
    onChange: () => {},
    errors: {
      householdCode: 'Please select a household',
    },
    householdOptions: sampleHouseholdOptions,
    householdLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Form showing validation error for required household selection.',
      },
    },
  },
};

export const InvalidHouseholdError: Story = {
  args: {
    value: {
      householdCode: 'HH-999',
    },
    onChange: () => {},
    errors: {
      householdCode: 'Selected household is no longer available',
    },
    householdOptions: sampleHouseholdOptions,
    householdLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Form showing error for invalid household selection.',
      },
    },
  },
};

// Loading States
export const LoadingHouseholds: Story = {
  args: {
    value: emptyData,
    onChange: () => {},
    errors: {},
    householdOptions: [],
    householdLoading: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Form showing loading state while searching for households.',
      },
    },
  },
};

export const NoHouseholdsFound: Story = {
  args: {
    value: emptyData,
    onChange: () => {},
    errors: {},
    householdOptions: [],
    householdLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Form when no households are found or available.',
      },
    },
  },
};

// Different Household Types
export const DifferentHouseholdTypes: Story = {
  args: {
    value: emptyData,
    onChange: () => {},
    errors: {},
    householdOptions: [
      {
        value: 'HH-001',
        label: 'HH-001 - Juan Dela Cruz (Family - 4 members)',
      },
      {
        value: 'HH-002',
        label: 'HH-002 - Maria Santos (Single Parent - 2 members)',
      },
      {
        value: 'HH-003',
        label: 'HH-003 - Pedro Garcia (Extended Family - 7 members)',
      },
      {
        value: 'HH-004',
        label: 'HH-004 - Ana Reyes (Single - 1 member)',
      },
      {
        value: 'HH-005',
        label: 'HH-005 - Carlos Mendoza (Couple - 2 members)',
      },
    ],
    householdLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Households showing different family compositions and member counts.',
      },
    },
  },
};

export const HouseholdsWithAddresses: Story = {
  args: {
    value: emptyData,
    onChange: () => {},
    errors: {},
    householdOptions: [
      {
        value: 'HH-101',
        label: 'HH-101 - Rodriguez Family (456 Sampaguita St, Brgy. Maligaya, Quezon City)',
      },
      {
        value: 'HH-102',
        label: 'HH-102 - Villanueva Household (789 Orchid Ave, Brgy. Bagong Silang, Caloocan)',
      },
      {
        value: 'HH-103',
        label: 'HH-103 - Fernandez Residence (321 Rose Lane, Brgy. San Isidro, Makati)',
      },
      {
        value: 'HH-104',
        label: 'HH-104 - Torres Home (654 Jasmine St, Brgy. Bagumbayan, Taguig)',
      },
    ],
    householdLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Households with complete address information.',
      },
    },
  },
};

// Interactive Examples
export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState<HouseholdInformationData>(emptyData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Filter households based on search term
    const filteredHouseholds = sampleHouseholdOptions.filter(household =>
      household.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleChange = (newValue: HouseholdInformationData) => {
      setValue(newValue);
      
      // Clear errors when a household is selected
      if (newValue.householdCode && errors.householdCode) {
        setErrors(prev => ({ ...prev, householdCode: '' }));
      }
    };

    const handleSearch = (query: string) => {
      setSearchTerm(query);
      setIsLoading(true);
      
      // Simulate API call delay
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    };

    const validate = () => {
      const newErrors: Record<string, string> = {};
      
      if (!value.householdCode) {
        newErrors.householdCode = 'Please select a household';
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const reset = () => {
      setValue(emptyData);
      setErrors({});
      setSearchTerm('');
    };

    return (
      <div className="space-y-6">
        <HouseholdInformation
          value={value}
          onChange={handleChange}
          errors={errors}
          onHouseholdSearch={handleSearch}
          householdOptions={filteredHouseholds}
          householdLoading={isLoading}
        />
        
        <div className="flex space-x-4">
          <button
            onClick={validate}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Validate
          </button>
          <button
            onClick={reset}
            className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
          >
            Reset
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="rounded bg-gray-100 p-4">
            <h4 className="font-medium">Current State:</h4>
            <div className="mt-2 space-y-1 text-sm">
              <p><strong>Selected:</strong> {value.householdCode || 'None'}</p>
              <p><strong>Search Term:</strong> "{searchTerm}"</p>
              <p><strong>Available Options:</strong> {filteredHouseholds.length}</p>
              <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
            </div>
          </div>
          
          {Object.keys(errors).length > 0 && (
            <div className="rounded bg-red-100 p-4">
              <h4 className="font-medium text-red-800">Validation Errors:</h4>
              <pre className="mt-2 text-sm text-red-700">{JSON.stringify(errors, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive household selection with search functionality and validation.',
      },
    },
  },
};

// Search Examples
export const SearchScenarios: Story = {
  render: () => {
    const [currentScenario, setCurrentScenario] = useState(0);
    
    const scenarios = [
      {
        label: 'All Households',
        searchTerm: '',
        options: sampleHouseholdOptions,
        loading: false,
      },
      {
        label: 'Search by Code',
        searchTerm: 'HH-001',
        options: sampleHouseholdOptions.filter(h => h.label.includes('HH-001')),
        loading: false,
      },
      {
        label: 'Search by Name',
        searchTerm: 'Maria',
        options: sampleHouseholdOptions.filter(h => h.label.toLowerCase().includes('maria')),
        loading: false,
      },
      {
        label: 'Search by Address',
        searchTerm: 'Rizal',
        options: sampleHouseholdOptions.filter(h => h.label.toLowerCase().includes('rizal')),
        loading: false,
      },
      {
        label: 'No Results',
        searchTerm: 'nonexistent',
        options: [],
        loading: false,
      },
      {
        label: 'Loading...',
        searchTerm: 'searching',
        options: [],
        loading: true,
      },
    ];

    const currentData = scenarios[currentScenario];

    return (
      <div className="space-y-6">
        <HouseholdInformation
          value={emptyData}
          onChange={() => {}}
          errors={{}}
          onHouseholdSearch={() => {}}
          householdOptions={currentData.options}
          householdLoading={currentData.loading}
        />
        
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {scenarios.map((scenario, index) => (
              <button
                key={index}
                onClick={() => setCurrentScenario(index)}
                className={`rounded px-3 py-1 text-sm ${
                  currentScenario === index
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {scenario.label}
              </button>
            ))}
          </div>
          
          <div className="rounded bg-gray-100 p-4">
            <h4 className="font-medium">Current Scenario:</h4>
            <div className="mt-2 space-y-1 text-sm">
              <p><strong>Label:</strong> {currentData.label}</p>
              <p><strong>Search Term:</strong> "{currentData.searchTerm}"</p>
              <p><strong>Results:</strong> {currentData.options.length} households</p>
              <p><strong>Loading:</strong> {currentData.loading ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Different search scenarios and result states.',
      },
    },
  },
};

// Large Dataset Example
export const LargeDataset: Story = {
  args: {
    value: emptyData,
    onChange: () => {},
    errors: {},
    householdOptions: Array.from({ length: 20 }, (_, i) => ({
      value: `HH-${String(i + 1).padStart(3, '0')}`,
      label: `HH-${String(i + 1).padStart(3, '0')} - Family ${i + 1} (${Math.floor(Math.random() * 8) + 1} members)`,
    })),
    householdLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Household selection with a larger dataset to test performance.',
      },
    },
  },
};

// Quick Selection Examples
export const QuickSelectionExamples: Story = {
  render: () => {
    const [value, setValue] = useState<HouseholdInformationData>(emptyData);

    const quickOptions = [
      { code: 'HH-001', label: 'Dela Cruz Family' },
      { code: 'HH-002', label: 'Santos Household' },
      { code: 'HH-003', label: 'Garcia Residence' },
      { code: 'HH-004', label: 'Reyes Home' },
    ];

    return (
      <div className="space-y-6">
        <HouseholdInformation
          value={value}
          onChange={setValue}
          errors={{}}
          householdOptions={sampleHouseholdOptions}
          householdLoading={false}
        />
        
        <div className="space-y-4">
          <h4 className="font-medium">Quick Selection:</h4>
          <div className="flex flex-wrap gap-2">
            {quickOptions.map((option) => (
              <button
                key={option.code}
                onClick={() => setValue({ householdCode: option.code })}
                className="rounded bg-blue-100 px-3 py-1 text-sm text-blue-800 hover:bg-blue-200"
              >
                {option.label}
              </button>
            ))}
            <button
              onClick={() => setValue(emptyData)}
              className="rounded bg-gray-100 px-3 py-1 text-sm text-gray-800 hover:bg-gray-200"
            >
              Clear
            </button>
          </div>
          
          <div className="rounded bg-gray-100 p-4">
            <h4 className="font-medium">Selected Household:</h4>
            <p className="mt-2 text-sm">{value.householdCode || 'None selected'}</p>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Quick selection buttons for common household choices.',
      },
    },
  },
};