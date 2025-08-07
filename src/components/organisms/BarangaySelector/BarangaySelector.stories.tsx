import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import BarangaySelector from './BarangaySelector';

const meta: Meta<typeof BarangaySelector> = {
  title: 'Organisms/BarangaySelector',
  component: BarangaySelector,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
A sophisticated location selection component for choosing barangays in the Philippines. Features:

- **Real-time search** with debounced queries for performance
- **PSGC integration** with proper geographic hierarchy
- **Auto-complete** with highlighting of matched terms
- **Loading states** and error handling
- **Accessibility** with proper ARIA attributes

The component loads barangay data from the PSGC (Philippine Standard Geographic Code) database and provides a user-friendly search interface for location selection.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'Currently selected barangay code',
    },
    onChange: {
      action: 'onChange',
      description: 'Callback when barangay selection changes',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the selector is disabled',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the search input',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock barangay data for stories
const mockBarangayOptions = [
  {
    code: '042109001',
    name: 'Poblacion',
    city_name: 'Makati City',
    province_name: 'Metro Manila',
    region_name: 'National Capital Region',
    full_address: 'Poblacion, Makati City, Metro Manila, National Capital Region',
  },
  {
    code: '042109002',
    name: 'San Lorenzo',
    city_name: 'Makati City',
    province_name: 'Metro Manila',
    region_name: 'National Capital Region',
    full_address: 'San Lorenzo, Makati City, Metro Manila, National Capital Region',
  },
  {
    code: '174212001',
    name: 'San Antonio',
    city_name: 'Quezon City',
    province_name: 'Metro Manila',
    region_name: 'National Capital Region',
    full_address: 'San Antonio, Quezon City, Metro Manila, National Capital Region',
  },
];

export const Default: Story = {
  args: {
    value: '',
    onChange: action('onChange'),
    placeholder: 'Search for your barangay...',
  },
  parameters: {
    docs: {
      description: {
        story: 'Default barangay selector ready for user input. Type at least 2 characters to trigger search.',
      },
    },
  },
};

export const WithSelectedValue: Story = {
  args: {
    value: '042109001',
    onChange: action('onChange'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Barangay selector with a pre-selected value. The component will load and display the selected barangay information.',
      },
    },
  },
};

export const WithError: Story = {
  args: {
    value: '',
    onChange: action('onChange'),
    error: 'Please select a valid barangay',
  },
  parameters: {
    docs: {
      description: {
        story: 'Error state showing validation message with red styling.',
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    value: '042109001',
    onChange: action('onChange'),
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled state when the selector cannot be interacted with.',
      },
    },
  },
};

export const CustomPlaceholder: Story = {
  args: {
    value: '',
    onChange: action('onChange'),
    placeholder: 'Type to find your barangay (e.g., "Poblacion", "San Lorenzo")',
  },
  parameters: {
    docs: {
      description: {
        story: 'Custom placeholder text providing usage hints to users.',
      },
    },
  },
};

export const LoadingState: Story = {
  args: {
    value: '',
    onChange: action('onChange'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Loading state shown while searching for barangays. This appears after typing 2+ characters.',
      },
    },
  },
  render: (args) => {
    // This story simulates the loading state
    return (
      <div className="space-y-4">
        <BarangaySelector {...args} />
        <p className="text-sm text-gray-600">
          💡 Type "San" or "Poblacion" to see search results in a real implementation
        </p>
      </div>
    );
  },
};

export const SearchExamples: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Examples of common search terms and expected behavior.',
      },
    },
  },
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Search Examples</h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <BarangaySelector
              value=""
              onChange={action('search-poblacion')}
              placeholder='Try typing "Poblacion"'
            />
            <p className="text-sm text-gray-600 mt-2">
              Most common barangay name in the Philippines
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <BarangaySelector
              value=""
              onChange={action('search-makati')}
              placeholder='Try typing "Makati"'
            />
            <p className="text-sm text-gray-600 mt-2">
              Search by city name to find all barangays in that city
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <BarangaySelector
              value=""
              onChange={action('search-san')}
              placeholder='Try typing "San"'
            />
            <p className="text-sm text-gray-600 mt-2">
              Partial matches work - will show all barangays starting with "San"
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
        story: 'Example of how the BarangaySelector integrates with form validation and submission.',
      },
    },
  },
  render: () => {
    const [selectedBarangay, setSelectedBarangay] = React.useState('');
    const [error, setError] = React.useState('');
    
    const handleSubmit = () => {
      if (!selectedBarangay) {
        setError('Please select your barangay');
        return;
      }
      setError('');
      action('form-submit')(selectedBarangay);
      alert(`Form submitted with barangay: ${selectedBarangay}`);
    };

    return (
      <div className="max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Barangay *
          </label>
          <BarangaySelector
            value={selectedBarangay}
            onChange={(code) => {
              setSelectedBarangay(code);
              if (error) setError(''); // Clear error when user makes selection
            }}
            error={error}
            placeholder="Search and select your barangay"
          />
        </div>
        <button
          onClick={handleSubmit}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Submit
        </button>
      </div>
    );
  },
};

export const ResponsiveDemo: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Responsive behavior on different screen sizes.',
      },
    },
  },
  render: () => (
    <div className="space-y-6">
      <div className="w-full">
        <h4 className="text-sm font-semibold mb-2">Desktop (Full Width)</h4>
        <BarangaySelector
          value=""
          onChange={action('desktop-change')}
          placeholder="Full width on desktop"
        />
      </div>
      
      <div className="w-80">
        <h4 className="text-sm font-semibold mb-2">Tablet (Medium Width)</h4>
        <BarangaySelector
          value=""
          onChange={action('tablet-change')}
          placeholder="Medium width container"
        />
      </div>
      
      <div className="w-64">
        <h4 className="text-sm font-semibold mb-2">Mobile (Small Width)</h4>
        <BarangaySelector
          value=""
          onChange={action('mobile-change')}
          placeholder="Small width container"
        />
      </div>
    </div>
  ),
};