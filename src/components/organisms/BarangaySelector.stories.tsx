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

      <div className="rounded-lg border p-4 bg-background border-default">
        <h3 className="mb-3 font-semibold text-primary">Selection Status</h3>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Selected Code:</strong>{' '}
            <code className="rounded px-2 py-1 bg-background-muted">{selectedCode || 'None'}</code>
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
          className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Validate Selection
        </button>
      </div>
    </div>
  );
};

export const Interactive: Story = {
  args: {
    value: '',
    onChange: () => {},
  },
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
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <h3 className="mb-2 font-semibold text-blue-800 dark:text-blue-200">Search Instructions</h3>
        <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
          <li>• Type at least 2 characters to start searching</li>
          <li>• Search by barangay name (e.g., &quot;Poblacion&quot;, &quot;San Antonio&quot;)</li>
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
        <div className="rounded-lg border p-4 bg-background border-default">
          <h3 className="mb-3 font-semibold text-primary">Recent Selections</h3>
          <ul className="space-y-1 text-sm text-secondary">
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
  args: {
    value: '',
    onChange: () => {},
  },
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
        <label className="mb-2 block text-sm font-medium text-primary">Full Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className={`w-full rounded-md border p-3 focus:ring-2 focus:ring-blue-500 ${
            errors.name ? 'border-red-300' : 'border-default'
          }`}
          placeholder="Enter your full name"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-primary">Barangay *</label>
        <BarangaySelector
          value={formData.barangayCode}
          onChange={handleBarangayChange}
          error={errors.barangayCode}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-primary">Email Address *</label>
        <input
          type="email"
          value={formData.email}
          onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className={`w-full rounded-md border p-3 focus:ring-2 focus:ring-blue-500 ${
            errors.email ? 'border-red-300' : 'border-default'
          }`}
          placeholder="Enter your email address"
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
      >
        Submit Registration
      </button>
    </form>
  );
};

export const InForm: Story = {
  args: {
    value: '',
    onChange: () => {},
  },
  render: InFormComponent,
};

// Different states showcase
export const AllStates: Story = {
  args: {
    value: '',
    onChange: () => {},
  },
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 font-semibold text-primary">Default State</h3>
        <BarangaySelector value="" onChange={() => {}} />
      </div>

      <div>
        <h3 className="mb-4 font-semibold text-primary">With Error</h3>
        <BarangaySelector value="" onChange={() => {}} error="This field is required" />
      </div>

      <div>
        <h3 className="mb-4 font-semibold text-primary">Disabled</h3>
        <BarangaySelector value="" onChange={() => {}} disabled={true} />
      </div>

      <div>
        <h3 className="mb-4 font-semibold text-primary">With Custom Placeholder</h3>
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
  args: {
    value: '',
    onChange: () => {},
  },
  render: () => (
    <div className="space-y-6">
      <div className="rounded-lg border p-6 bg-background border-default">
        <h3 className="mb-4 font-semibold text-primary">Key Features</h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-2 font-medium text-primary">Search Capabilities</h4>
            <ul className="space-y-1 text-sm text-secondary">
              <li>• Real-time search with debouncing</li>
              <li>• Minimum 2 characters to start search</li>
              <li>• Case-insensitive matching</li>
              <li>• Search highlighting in results</li>
              <li>• Limit of 20 results for performance</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-2 font-medium text-primary">User Experience</h4>
            <ul className="space-y-1 text-sm text-secondary">
              <li>• Loading indicators during search</li>
              <li>• Clear &quot;no results&quot; messaging</li>
              <li>• Helpful search instructions</li>
              <li>• Click outside to close dropdown</li>
              <li>• Accessible keyboard navigation</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-2 font-medium text-primary">Data Display</h4>
            <ul className="space-y-1 text-sm text-secondary">
              <li>• Hierarchical address display</li>
              <li>• Barangay name (primary)</li>
              <li>• City and province (secondary)</li>
              <li>• Region information (tertiary)</li>
              <li>• Full address selection</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-2 font-medium text-primary">Integration</h4>
            <ul className="space-y-1 text-sm text-secondary">
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
