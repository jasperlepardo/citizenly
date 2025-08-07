import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import PSOCSelector from './PSOCSelector';
import { useState } from 'react';

// Mock PSOC option type for stories
interface PSOCOption {
  occupation_code: string;
  level_type: string;
  occupation_title: string;
  occupation_description: string | null;
  full_hierarchy: string;
  hierarchy_level: number;
}

const meta = {
  title: 'Organisms/PSOCSelector',
  component: PSOCSelector,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Philippine Standard Occupational Classification (PSOC) selector component. Provides searchable occupation selection with hierarchical occupation data, real-time search capabilities, and integration with the PSOC database for accurate occupation classification.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
    },
    error: {
      control: 'text',
    },
    className: {
      control: 'text',
    },
  },
} satisfies Meta<typeof PSOCSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSelect: option => console.log('Selected PSOC:', option),
  },
};

export const WithError: Story = {
  args: {
    error: 'Please select an occupation',
    onSelect: option => console.log('Selected PSOC:', option),
  },
};

export const WithCustomPlaceholder: Story = {
  args: {
    placeholder: 'Type your occupation here...',
    onSelect: option => console.log('Selected PSOC:', option),
  },
};

export const WithPreselectedValue: Story = {
  args: {
    value: '2221', // Sample PSOC code
    onSelect: option => console.log('Selected PSOC:', option),
  },
};

// Interactive example showing real-time search
const InteractiveComponent = () => {
  const [selectedOption, setSelectedOption] = useState<PSOCOption | null>(null);
  const [error, setError] = useState('');

  const handleSelect = (option: PSOCOption | null) => {
    setSelectedOption(option);
    if (option && error) {
      setError('');
    }
  };

  const handleValidate = () => {
    if (!selectedOption) {
      setError('Please select an occupation');
    } else {
      setError('');
      alert(`Valid selection! Code: ${selectedOption.occupation_code}`);
    }
  };

  return (
    <div className="space-y-6">
      <PSOCSelector
        onSelect={handleSelect}
        error={error}
        placeholder="Search for occupation (e.g., 'doctor', 'teacher', 'engineer')..."
      />

      <div className="rounded-lg border p-4 bg-background border-default">
        <h3 className="mb-3 font-semibold text-primary">Selection Details</h3>
        {selectedOption ? (
          <div className="space-y-2 text-sm">
            <div>
              <strong>Title:</strong> {selectedOption.occupation_title}
            </div>
            <div>
              <strong>Code:</strong>{' '}
              <code className="rounded px-2 py-1 bg-background-muted">
                {selectedOption.occupation_code}
              </code>
            </div>
            <div>
              <strong>Level:</strong> {selectedOption.level_type.replace('_', ' ')}
            </div>
            <div>
              <strong>Hierarchy:</strong> {selectedOption.full_hierarchy}
            </div>
            <div>
              <strong>Hierarchy Level:</strong> {selectedOption.hierarchy_level}
            </div>
            {selectedOption.occupation_description && (
              <div>
                <strong>Description:</strong> {selectedOption.occupation_description}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-secondary">No occupation selected</p>
        )}

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
  render: InteractiveComponent,
};

// Search demonstration with examples
const SearchDemoComponent = () => {
  const [, setSelectedOption] = useState<PSOCOption | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const handleSelect = (option: PSOCOption | null) => {
    setSelectedOption(option);
    if (option) {
      setSearchHistory(prev =>
        [...prev, `${option.occupation_title} (${option.occupation_code})`].slice(-5)
      );
    }
  };

  const suggestedSearches = [
    'doctor',
    'teacher',
    'engineer',
    'nurse',
    'programmer',
    'manager',
    'technician',
    'analyst',
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <h3 className="mb-2 font-semibold text-blue-800 dark:text-blue-200">Search Tips</h3>
        <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
          <li>
            • Type occupation names in English (e.g., &quot;doctor&quot;, &quot;teacher&quot;)
          </li>
          <li>• Search works across all hierarchy levels</li>
          <li>• Results show occupation title, code, and classification level</li>
          <li>• More specific occupations have lower hierarchy levels</li>
        </ul>

        <div className="mt-3">
          <h4 className="mb-2 font-medium text-blue-800 dark:text-blue-200">Try these searches:</h4>
          <div className="flex flex-wrap gap-2">
            {suggestedSearches.map(search => (
              <button
                key={search}
                onClick={() => {
                  const input = document.querySelector(
                    'input[placeholder*="occupation"]'
                  ) as HTMLInputElement;
                  if (input) {
                    input.value = search;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.focus();
                  }
                }}
                className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700 transition-colors hover:bg-blue-200 dark:bg-blue-800 dark:text-blue-300 dark:hover:bg-blue-700"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      </div>

      <PSOCSelector
        onSelect={handleSelect}
        placeholder="Try searching: 'doctor', 'teacher', 'engineer'..."
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
  render: SearchDemoComponent,
};

// Form integration example
const InEmploymentFormComponent = () => {
  const [formData, setFormData] = useState({
    employerName: '',
    occupation: null as PSOCOption | null,
    salary: '',
    startDate: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};

    if (!formData.employerName.trim()) {
      newErrors.employerName = 'Employer name is required';
    }

    if (!formData.occupation) {
      newErrors.occupation = 'Please select an occupation';
    }

    if (!formData.salary.trim()) {
      newErrors.salary = 'Salary is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      alert('Employment information submitted successfully!');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium text-primary">Employer Name *</label>
        <input
          type="text"
          value={formData.employerName}
          onChange={e => setFormData(prev => ({ ...prev, employerName: e.target.value }))}
          className={`w-full rounded-md border p-3 focus:ring-2 focus:ring-blue-500 ${
            errors.employerName ? 'border-red-300' : 'border-default'
          }`}
          placeholder="Enter employer name"
        />
        {errors.employerName && <p className="mt-1 text-sm text-red-600">{errors.employerName}</p>}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-primary">Occupation *</label>
        <PSOCSelector
          onSelect={option => {
            setFormData(prev => ({ ...prev, occupation: option }));
            if (option) {
              setErrors(prev => ({ ...prev, occupation: '' }));
            }
          }}
          error={errors.occupation}
          placeholder="Search and select your occupation..."
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-primary">Monthly Salary *</label>
          <input
            type="number"
            value={formData.salary}
            onChange={e => setFormData(prev => ({ ...prev, salary: e.target.value }))}
            className={`w-full rounded-md border p-3 focus:ring-2 focus:ring-blue-500 ${
              errors.salary ? 'border-red-300' : 'border-default'
            }`}
            placeholder="Enter monthly salary"
          />
          {errors.salary && <p className="mt-1 text-sm text-red-600">{errors.salary}</p>}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-primary">Start Date *</label>
          <input
            type="date"
            value={formData.startDate}
            onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
            className={`w-full rounded-md border p-3 focus:ring-2 focus:ring-blue-500 ${
              errors.startDate ? 'border-red-300' : 'border-default'
            }`}
          />
          {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
      >
        Submit Employment Information
      </button>

      {formData.occupation && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <h4 className="mb-2 font-medium text-green-800 dark:text-green-200">
            Selected Occupation:
          </h4>
          <p className="text-sm text-green-700 dark:text-green-300">
            <strong>{formData.occupation.occupation_title}</strong> (Code:{' '}
            {formData.occupation.occupation_code})
          </p>
          <p className="mt-1 text-xs text-green-600 dark:text-green-400">
            Classification: {formData.occupation.level_type.replace('_', ' ')} • Level:{' '}
            {formData.occupation.hierarchy_level}
          </p>
        </div>
      )}
    </form>
  );
};

export const InEmploymentForm: Story = {
  render: InEmploymentFormComponent,
};

// Different states showcase
export const AllStates: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 font-semibold text-primary">Default State</h3>
        <PSOCSelector onSelect={() => {}} />
      </div>

      <div>
        <h3 className="mb-4 font-semibold text-primary">With Error</h3>
        <PSOCSelector onSelect={() => {}} error="This field is required" />
      </div>

      <div>
        <h3 className="mb-4 font-semibold text-primary">With Custom Placeholder</h3>
        <PSOCSelector onSelect={() => {}} placeholder="What is your profession?" />
      </div>

      <div>
        <h3 className="mb-4 font-semibold text-primary">With Custom Styling</h3>
        <PSOCSelector
          onSelect={() => {}}
          className="rounded-lg border-2 border-purple-300"
          placeholder="Custom styled PSOC selector"
        />
      </div>
    </div>
  ),
};

// Features and hierarchy explanation
export const FeaturesShowcase: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="rounded-lg border p-6 bg-background border-default">
        <h3 className="mb-4 font-semibold text-primary">PSOC Hierarchy Levels</h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-2 font-medium text-primary">Classification Levels</h4>
            <ul className="space-y-2 text-sm text-secondary">
              <li className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-purple-500"></span>
                <strong>Major Groups (Level 4):</strong> Broad occupational categories
              </li>
              <li className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-blue-500"></span>
                <strong>Sub-Major Groups (Level 3):</strong> More specific groupings
              </li>
              <li className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-green-500"></span>
                <strong>Minor Groups (Level 2):</strong> Detailed occupational groups
              </li>
              <li className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-orange-500"></span>
                <strong>Unit Groups (Level 1):</strong> Specific job categories
              </li>
              <li className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-red-500"></span>
                <strong>Unit Sub-Groups (Level 0):</strong> Most specific occupations
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-2 font-medium text-primary">Search Features</h4>
            <ul className="space-y-1 text-sm text-secondary">
              <li>• Real-time search with 300ms debouncing</li>
              <li>• Multi-table search across PSOC hierarchy</li>
              <li>• Intelligent fallback to different classification levels</li>
              <li>• Code-based preselection support</li>
              <li>• Loading states and error handling</li>
              <li>• Keyboard navigation and accessibility</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
          <h4 className="mb-2 font-medium text-yellow-800 dark:text-yellow-200">
            Database Integration
          </h4>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            This component connects to the Philippine Standard Occupational Classification (PSOC)
            database to provide accurate occupation codes for statistical and administrative
            purposes. If no results appear, the PSOC data may need to be loaded into the database.
          </p>
        </div>
      </div>

      <PSOCSelector
        onSelect={option => console.log('Selected:', option)}
        placeholder="Try searching for occupations..."
      />
    </div>
  ),
};
