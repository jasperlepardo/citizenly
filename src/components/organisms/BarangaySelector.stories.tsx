import type { Meta, StoryObj } from '@storybook/react';
import BarangaySelector from './BarangaySelector';
import { useState } from 'react';

const meta = {
  title: 'Organisms/BarangaySelector',
  component: BarangaySelector,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A sophisticated barangay selector with real-time search functionality. Connects to the Philippine Standard Geographic Code (PSGC) database to provide accurate barangay selection with autocomplete, search highlighting, and address hierarchy display.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
    },
    placeholder: {
      control: 'text',
    },
    error: {
      control: 'text',
    },
  },
} satisfies Meta<typeof BarangaySelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: '',
    onChange: code => console.log('Selected barangay code:', code),
  },
};

export const WithError: Story = {
  args: {
    value: '',
    error: 'Please select your barangay',
    onChange: code => console.log('Selected barangay code:', code),
  },
};

export const Disabled: Story = {
  args: {
    value: '',
    disabled: true,
    onChange: code => console.log('Selected barangay code:', code),
  },
};

export const WithCustomPlaceholder: Story = {
  args: {
    value: '',
    placeholder: 'Type your barangay name here...',
    onChange: code => console.log('Selected barangay code:', code),
  },
};

export const PreselectedValue: Story = {
  args: {
    value: '137404001', // Sample barangay code
    onChange: code => console.log('Selected barangay code:', code),
  },
};

// Interactive example showing real-time updates
const InteractiveComponent = () => {
  const [selectedCode, setSelectedCode] = useState('');
  const [error, setError] = useState('');

  const handleChange = (code: string) => {
    setSelectedCode(code);
    // Clear error when user makes a selection
    if (code && error) {
      setError('');
    }
  };

  const handleValidate = () => {
    if (!selectedCode) {
      setError('Barangay selection is required');
    } else {
      setError('');
      alert(`Valid selection! Barangay code: ${selectedCode}`);
    }
  };

  return (
    <div className="space-y-6">
      <BarangaySelector
        value={selectedCode}
        onChange={handleChange}
        error={error}
        placeholder="Search for your barangay..."
      />

      <div className="bg-background rounded-lg border border-default p-4">
        <h3 className="font-semibold text-primary mb-3">Selection Status</h3>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Selected Code:</strong>{' '}
            <code className="bg-background-muted px-2 py-1 rounded">{selectedCode || 'None'}</code>
          </div>
          <div>
            <strong>Status:</strong>{' '}
            <span className={selectedCode ? 'text-green-600' : 'text-secondary'}>
              {selectedCode ? 'Selected' : 'No selection'}
            </span>
          </div>
        </div>

        <button
          onClick={handleValidate}
          className="mt-3 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
        >
          Validate Selection
        </button>
      </div>
    </div>
  );
};

export const Interactive: Story = {
  render: InteractiveComponent,
};

// Search demonstration
const SearchDemoComponent = () => {
  const [selectedCode, setSelectedCode] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const handleChange = (code: string) => {
    setSelectedCode(code);
    if (code) {
      setSearchHistory(prev => [...prev, `Selected: ${code}`].slice(-5));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Search Instructions</h3>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Type at least 2 characters to start searching</li>
          <li>• Search by barangay name (e.g., "Poblacion", "San Antonio")</li>
          <li>• Results show barangay name, city, province, and region</li>
          <li>• Click on a result to select it</li>
          <li>• Search terms are highlighted in results</li>
        </ul>
      </div>

      <BarangaySelector
        value={selectedCode}
        onChange={handleChange}
        placeholder="Try searching: 'Poblacion', 'San', 'Manila'..."
      />

      {searchHistory.length > 0 && (
        <div className="bg-background rounded-lg border border-default p-4">
          <h3 className="font-semibold text-primary mb-3">Recent Selections</h3>
          <ul className="text-sm text-secondary space-y-1">
            {searchHistory.map((item, index) => (
              <li key={index}>• {item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export const SearchDemo: Story = {
  render: SearchDemoComponent,
};

// Form integration example
const InFormComponent = () => {
  const [formData, setFormData] = useState({
    name: '',
    barangayCode: '',
    email: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleBarangayChange = (code: string) => {
    setFormData(prev => ({ ...prev, barangayCode: code }));
    if (code) {
      setErrors(prev => ({ ...prev, barangayCode: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};

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
      alert('Form submitted successfully!');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-primary mb-2">Full Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 ${
            errors.name ? 'border-red-300' : 'border-default'
          }`}
          placeholder="Enter your full name"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-primary mb-2">Barangay *</label>
        <BarangaySelector
          value={formData.barangayCode}
          onChange={handleBarangayChange}
          error={errors.barangayCode}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-primary mb-2">Email Address *</label>
        <input
          type="email"
          value={formData.email}
          onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 ${
            errors.email ? 'border-red-300' : 'border-default'
          }`}
          placeholder="Enter your email address"
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition-colors"
      >
        Submit Registration
      </button>
    </form>
  );
};

export const InForm: Story = {
  render: InFormComponent,
};

// Different states showcase
export const AllStates: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold text-primary mb-4">Default State</h3>
        <BarangaySelector value="" onChange={() => {}} />
      </div>

      <div>
        <h3 className="font-semibold text-primary mb-4">With Error</h3>
        <BarangaySelector value="" onChange={() => {}} error="This field is required" />
      </div>

      <div>
        <h3 className="font-semibold text-primary mb-4">Disabled</h3>
        <BarangaySelector value="" onChange={() => {}} disabled={true} />
      </div>

      <div>
        <h3 className="font-semibold text-primary mb-4">With Custom Placeholder</h3>
        <BarangaySelector
          value=""
          onChange={() => {}}
          placeholder="Start typing your barangay name..."
        />
      </div>
    </div>
  ),
};

// Performance and features showcase
export const FeaturesShowcase: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="bg-background rounded-lg border border-default p-6">
        <h3 className="font-semibold text-primary mb-4">Key Features</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-primary mb-2">Search Capabilities</h4>
            <ul className="text-sm text-secondary space-y-1">
              <li>• Real-time search with debouncing</li>
              <li>• Minimum 2 characters to start search</li>
              <li>• Case-insensitive matching</li>
              <li>• Search highlighting in results</li>
              <li>• Limit of 20 results for performance</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-primary mb-2">User Experience</h4>
            <ul className="text-sm text-secondary space-y-1">
              <li>• Loading indicators during search</li>
              <li>• Clear "no results" messaging</li>
              <li>• Helpful search instructions</li>
              <li>• Click outside to close dropdown</li>
              <li>• Accessible keyboard navigation</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-primary mb-2">Data Display</h4>
            <ul className="text-sm text-secondary space-y-1">
              <li>• Hierarchical address display</li>
              <li>• Barangay name (primary)</li>
              <li>• City and province (secondary)</li>
              <li>• Region information (tertiary)</li>
              <li>• Full address selection</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-primary mb-2">Integration</h4>
            <ul className="text-sm text-secondary space-y-1">
              <li>• PSGC database connectivity</li>
              <li>• Real-time Supabase queries</li>
              <li>• Error handling and fallbacks</li>
              <li>• Form validation support</li>
              <li>• Theme-aware styling</li>
            </ul>
          </div>
        </div>
      </div>

      <BarangaySelector
        value=""
        onChange={code => console.log('Selected:', code)}
        placeholder="Try the features above..."
      />
    </div>
  ),
};
