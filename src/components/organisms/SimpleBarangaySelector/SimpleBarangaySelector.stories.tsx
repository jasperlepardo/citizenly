import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import SimpleBarangaySelector from './SimpleBarangaySelector';

const meta: Meta<typeof SimpleBarangaySelector> = {
  title: 'Organisms/SimpleBarangaySelector',
  component: SimpleBarangaySelector,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
A streamlined barangay selection component designed for quick and simple barangay selection. This is a simplified version of the full BarangaySelector, focusing on essential functionality without complex address hierarchy display. Key features include:

- **Simple Search** - Type-ahead search with basic barangay name matching
- **Minimal UI** - Clean, lightweight interface without extra details
- **Fast Performance** - Optimized for speed with debounced queries
- **Error Handling** - Graceful handling of missing PSGC data
- **Accessibility** - Full keyboard navigation support
- **Mobile Friendly** - Optimized for touch interfaces

Perfect for forms where you need quick barangay selection without the full geographic context of the complete BarangaySelector.
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

export const Default: Story = {
  args: {
    value: '',
    onChange: action('barangay-changed'),
    placeholder: 'Search for your barangay...',
  },
  parameters: {
    docs: {
      description: {
        story: 'Default simple barangay selector ready for user input. Type at least 2 characters to trigger search.',
      },
    },
  },
};

export const WithSelectedValue: Story = {
  args: {
    value: '042109001',
    onChange: action('barangay-changed'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Simple barangay selector with a pre-selected value showing the barangay name.',
      },
    },
  },
};

export const WithError: Story = {
  args: {
    value: '',
    onChange: action('barangay-changed'),
    error: 'Please select your barangay',
  },
  parameters: {
    docs: {
      description: {
        story: 'Error state showing validation message with red border styling.',
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    value: '042109001',
    onChange: action('barangay-changed'),
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
    onChange: action('barangay-changed'),
    placeholder: 'Type barangay name (min. 2 letters)',
  },
  parameters: {
    docs: {
      description: {
        story: 'Custom placeholder text with specific instructions for users.',
      },
    },
  },
};

export const LoadingState: Story = {
  args: {
    value: '',
    onChange: action('barangay-changed'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Loading state demonstration while searching for barangays.',
      },
    },
  },
  render: (args) => (
    <div className="space-y-4">
      <SimpleBarangaySelector {...args} />
      <p className="text-sm text-gray-600">
        💡 Type "San" or "Poblacion" to see search results in a real implementation
      </p>
    </div>
  ),
};

export const QuickRegistrationForm: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Example integration in a quick registration form where simplicity is key.',
      },
    },
  },
  render: () => {
    const [formData, setFormData] = React.useState({
      name: '',
      barangayCode: '',
      email: '',
    });
    const [errors, setErrors] = React.useState<any>({});

    const handleSubmit = () => {
      const newErrors: any = {};
      
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      }
      
      if (!formData.barangayCode) {
        newErrors.barangayCode = 'Please select your barangay';
      }
      
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      }

      setErrors(newErrors);

      if (Object.keys(newErrors).length === 0) {
        action('quick-form-submitted')(formData);
        alert(`Registration submitted!\nName: ${formData.name}\nBarangay Code: ${formData.barangayCode}\nEmail: ${formData.email}`);
      }
    };

    return (
      <div className="max-w-md mx-auto space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Quick Registration</h2>
          <p className="text-sm text-gray-600">Register for barangay services</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => {
              setFormData({...formData, name: e.target.value});
              if (errors.name) setErrors({...errors, name: ''});
            }}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your full name"
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Barangay *
          </label>
          <SimpleBarangaySelector
            value={formData.barangayCode}
            onChange={(code) => {
              setFormData({...formData, barangayCode: code});
              if (errors.barangayCode) setErrors({...errors, barangayCode: ''});
            }}
            error={errors.barangayCode}
            placeholder="Type to search your barangay"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData({...formData, email: e.target.value});
              if (errors.email) setErrors({...errors, email: ''});
            }}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="your.email@example.com"
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>

        <button
          onClick={handleSubmit}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Register
        </button>

        {formData.barangayCode && (
          <div className="p-3 bg-green-50 border border-green-200 rounded text-sm">
            <p className="text-green-800">
              <strong>Selected Barangay Code:</strong> {formData.barangayCode}
            </p>
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
        story: 'Examples of common search patterns and expected behavior.',
      },
    },
  },
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Search Examples</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Common Names</h4>
            <SimpleBarangaySelector
              value=""
              onChange={action('search-common')}
              placeholder='Try "Poblacion" or "San Antonio"'
            />
            <p className="text-sm text-gray-600 mt-2">
              Most barangays have common names like Poblacion
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Partial Matching</h4>
            <SimpleBarangaySelector
              value=""
              onChange={action('search-partial')}
              placeholder='Try "San" or "Bayan"'
            />
            <p className="text-sm text-gray-600 mt-2">
              Partial matches work - shows all barangays containing the text
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Urban Areas</h4>
            <SimpleBarangaySelector
              value=""
              onChange={action('search-urban')}
              placeholder='Try "Makati" or "Quezon"'
            />
            <p className="text-sm text-gray-600 mt-2">
              Find barangays in major cities
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Rural Areas</h4>
            <SimpleBarangaySelector
              value=""
              onChange={action('search-rural')}
              placeholder='Try "Bagong" or "Mala"'
            />
            <p className="text-sm text-gray-600 mt-2">
              Rural barangays often have descriptive names
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const ComparisonWithFullSelector: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Side-by-side comparison with the full BarangaySelector to show differences.',
      },
    },
  },
  render: () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-3 text-green-800">SimpleBarangaySelector</h3>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <SimpleBarangaySelector
              value=""
              onChange={action('simple-selector')}
              placeholder="Simple search interface"
            />
            <div className="mt-4 text-sm text-green-700">
              <h4 className="font-semibold mb-2">Features:</h4>
              <ul className="space-y-1">
                <li>• Minimal UI design</li>
                <li>• Basic name search only</li>
                <li>• Fast and lightweight</li>
                <li>• Shows barangay name and code</li>
                <li>• Perfect for quick forms</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-3 text-blue-800">Full BarangaySelector</h3>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-500 cursor-not-allowed">
              Full BarangaySelector (would appear here)
            </div>
            <div className="mt-4 text-sm text-blue-700">
              <h4 className="font-semibold mb-2">Features:</h4>
              <ul className="space-y-1">
                <li>• Rich address hierarchy display</li>
                <li>• Shows city, province, region</li>
                <li>• Advanced search highlighting</li>
                <li>• Geographic context information</li>
                <li>• Comprehensive address details</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">When to Use Which?</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-700">
          <div>
            <strong>Use SimpleBarangaySelector when:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Simple forms requiring basic barangay selection</li>
              <li>Mobile-first applications needing minimal UI</li>
              <li>Quick registration or survey forms</li>
              <li>Performance is critical</li>
            </ul>
          </div>
          <div>
            <strong>Use Full BarangaySelector when:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Detailed resident registration forms</li>
              <li>Users need geographic context</li>
              <li>Address verification is important</li>
              <li>Complex administrative workflows</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const MobileOptimized: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Mobile-optimized layout showing touch-friendly interface.',
      },
    },
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm mx-auto p-4">
        <Story />
      </div>
    ),
  ],
  args: {
    value: '',
    onChange: action('mobile-barangay-changed'),
    placeholder: 'Tap to search barangay',
  },
};

export const ResponsiveDemo: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Responsive behavior demonstration across different screen sizes.',
      },
    },
  },
  render: () => (
    <div className="space-y-6">
      <div className="w-full max-w-sm">
        <h4 className="text-sm font-semibold mb-2">Mobile (320px)</h4>
        <SimpleBarangaySelector
          value=""
          onChange={action('mobile-select')}
          placeholder="Mobile view"
        />
      </div>
      
      <div className="w-full max-w-md">
        <h4 className="text-sm font-semibold mb-2">Tablet (768px)</h4>
        <SimpleBarangaySelector
          value=""
          onChange={action('tablet-select')}
          placeholder="Tablet view"
        />
      </div>
      
      <div className="w-full max-w-2xl">
        <h4 className="text-sm font-semibold mb-2">Desktop (1024px+)</h4>
        <SimpleBarangaySelector
          value=""
          onChange={action('desktop-select')}
          placeholder="Desktop view"
        />
      </div>
    </div>
  ),
};

export const DataSourceDemo: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Demonstration of behavior with different data source scenarios.',
      },
    },
  },
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Data Source Scenarios</h3>
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">✅ PSGC Data Available</h4>
            <SimpleBarangaySelector
              value=""
              onChange={action('data-available')}
              placeholder="Normal operation with PSGC data"
            />
            <p className="text-sm text-green-700 mt-2">
              Full functionality with complete barangay database
            </p>
          </div>
          
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Limited Data</h4>
            <SimpleBarangaySelector
              value=""
              onChange={action('limited-data')}
              placeholder="Search may return fewer results"
            />
            <p className="text-sm text-yellow-700 mt-2">
              Partial barangay data - some searches may not find results
            </p>
          </div>
          
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">❌ No PSGC Data</h4>
            <SimpleBarangaySelector
              value=""
              onChange={action('no-data')}
              placeholder="PSGC data not loaded"
              disabled
            />
            <p className="text-sm text-red-700 mt-2">
              Component disabled when PSGC database is not available
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
};