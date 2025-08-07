import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { action } from '@storybook/addon-actions';
import PSOCSelector from './PSOCSelector';

const meta: Meta<typeof PSOCSelector> = {
  title: 'Organisms/PSOCSelector',
  component: PSOCSelector,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
A specialized occupation selector component that integrates with the Philippine Standard Occupational Classification (PSOC) system. This component provides standardized occupation data entry for resident employment information. Key features include:

- **PSOC Integration** - Searches through official Philippine occupation classifications
- **Hierarchical Search** - Supports major groups, unit groups, and unit sub-groups
- **Auto-complete** - Real-time search with debounced queries
- **Detailed Display** - Shows occupation codes, titles, and hierarchy levels
- **Fallback Support** - Handles missing PSOC data gracefully
- **Accessibility** - Full keyboard navigation and screen reader support

The component is essential for standardizing occupation data across the barangay management system and ensuring compliance with national statistical standards.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'Currently selected PSOC occupation code',
    },
    onSelect: {
      action: 'onSelect',
      description: 'Callback when occupation is selected',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the search input',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: '',
    onSelect: action('occupation-selected'),
    placeholder: 'Search for occupation...',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Default PSOC selector ready for occupation search. Type at least 2 characters to begin searching.',
      },
    },
  },
};

export const WithSelectedValue: Story = {
  args: {
    value: '2421',
    onSelect: action('occupation-selected'),
  },
  parameters: {
    docs: {
      description: {
        story:
          'PSOC selector with a pre-selected occupation code. The component will load and display the occupation details.',
      },
    },
  },
};

export const WithError: Story = {
  args: {
    value: '',
    onSelect: action('occupation-selected'),
    error: 'Please select a valid occupation',
  },
  parameters: {
    docs: {
      description: {
        story: 'Error state showing validation message for required occupation selection.',
      },
    },
  },
};

export const CustomPlaceholder: Story = {
  args: {
    value: '',
    onSelect: action('occupation-selected'),
    placeholder: 'Type job title (e.g., Teacher, Manager, Driver)',
  },
  parameters: {
    docs: {
      description: {
        story: 'Custom placeholder providing helpful search examples.',
      },
    },
  },
};

export const SearchExamples: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Examples of common occupation searches and expected behavior.',
      },
    },
  },
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-lg font-semibold">Search Examples</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-gray-50 p-4">
            <h4 className="mb-2 font-medium">By Job Title</h4>
            <PSOCSelector
              value=""
              onSelect={action('search-by-title')}
              placeholder='Try "Teacher" or "Manager"'
            />
            <p className="mt-2 text-sm text-gray-600">Search by common job titles</p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <h4 className="mb-2 font-medium">By Industry</h4>
            <PSOCSelector
              value=""
              onSelect={action('search-by-industry')}
              placeholder='Try "Health" or "Education"'
            />
            <p className="mt-2 text-sm text-gray-600">Search by industry or field</p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <h4 className="mb-2 font-medium">Skilled Trades</h4>
            <PSOCSelector
              value=""
              onSelect={action('search-skilled')}
              placeholder='Try "Mechanic" or "Electrician"'
            />
            <p className="mt-2 text-sm text-gray-600">Search for skilled trade occupations</p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <h4 className="mb-2 font-medium">Service Jobs</h4>
            <PSOCSelector
              value=""
              onSelect={action('search-service')}
              placeholder='Try "Security" or "Cook"'
            />
            <p className="mt-2 text-sm text-gray-600">Search for service industry jobs</p>
          </div>
        </div>
      </div>
    </div>
  ),
};

const FormIntegrationComponent = () => {
  const [selectedOccupation, setSelectedOccupation] = React.useState<any>(null);
  const [employmentStatus, setEmploymentStatus] = React.useState('');
  const [workplace, setWorkplace] = React.useState('');
  const [error, setError] = React.useState('');

  const handleOccupationSelect = (occupation: any) => {
    setSelectedOccupation(occupation);
    if (error) setError('');
  };

  const handleSubmit = () => {
    if (employmentStatus === 'employed' && !selectedOccupation) {
      setError('Please select your occupation');
      return;
    }

    const formData = {
      occupation: selectedOccupation,
      employmentStatus,
      workplace,
    };

    action('employment-form-submitted')(formData);
    alert('Employment information submitted successfully!');
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Employment Status *
          </label>
          <select
            value={employmentStatus}
            onChange={e => setEmploymentStatus(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select employment status</option>
            <option value="employed">Employed</option>
            <option value="self_employed">Self-Employed</option>
            <option value="unemployed">Unemployed</option>
            <option value="student">Student</option>
            <option value="retired">Retired</option>
          </select>
        </div>

        {(employmentStatus === 'employed' || employmentStatus === 'self_employed') && (
          <>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Occupation *</label>
              <PSOCSelector
                value={selectedOccupation?.occupation_code || ''}
                onSelect={handleOccupationSelect}
                placeholder="Search for your occupation"
                error={error}
              />
              <p className="mt-1 text-xs text-gray-500">
                Search by job title, industry, or occupation category
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Workplace</label>
              <input
                type="text"
                value={workplace}
                onChange={e => setWorkplace(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Company or workplace name"
              />
            </div>
          </>
        )}
      </div>

      {selectedOccupation && (
        <div className="rounded border border-green-200 bg-green-50 p-4">
          <h4 className="mb-2 font-semibold text-green-800">Selected Occupation</h4>
          <div className="space-y-1 text-sm text-green-700">
            <div>
              <strong>Title:</strong> {selectedOccupation.occupation_title}
            </div>
            <div>
              <strong>Code:</strong> {selectedOccupation.occupation_code}
            </div>
            <div>
              <strong>Level:</strong> {selectedOccupation.level_type.replace('_', ' ')}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Submit Employment Information
      </button>
    </div>
  );
};

export const FormIntegration: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Integration with employment form showing occupation selection workflow.',
      },
    },
  },
  render: () => <FormIntegrationComponent />,
};

const CommonOccupationsComponent = () => {
  const [selectedExample, setSelectedExample] = React.useState<any>(null);

  const commonOccupations = [
    {
      title: 'Elementary Teacher',
      code: '2341',
      level: 'unit_group',
      description: 'Primary School Teachers',
      category: 'Education',
    },
    {
      title: 'Barangay Captain',
      code: '1112',
      level: 'unit_group',
      description: 'Senior Government Officials',
      category: 'Government',
    },
    {
      title: 'Tricycle Driver',
      code: '8322',
      level: 'unit_group',
      description: 'Car, Taxi and Van Drivers',
      category: 'Transportation',
    },
    {
      title: 'Store Keeper',
      code: '5223',
      level: 'unit_group',
      description: 'Shop Keepers',
      category: 'Retail',
    },
    {
      title: 'Security Guard',
      code: '5414',
      level: 'unit_group',
      description: 'Security Guards',
      category: 'Security',
    },
    {
      title: 'Call Center Agent',
      code: '4222',
      level: 'unit_group',
      description: 'Contact Centre Information Clerks',
      category: 'Business Process Outsourcing',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-lg font-semibold">Common Occupations in Filipino Communities</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {commonOccupations.map((occupation, index) => (
            <div
              key={index}
              className="cursor-pointer rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
              onClick={() => setSelectedExample(occupation)}
            >
              <h4 className="font-semibold text-gray-900">{occupation.title}</h4>
              <p className="text-sm text-gray-600">{occupation.category}</p>
              <p className="mt-1 text-xs text-gray-500">Code: {occupation.code}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Try selecting an occupation:
        </label>
        <PSOCSelector
          value={selectedExample?.code || ''}
          onSelect={occupation => {
            action('common-occupation-selected')(occupation);
            setSelectedExample(occupation);
          }}
          placeholder="Click an occupation above or search manually"
        />
      </div>

      {selectedExample && (
        <div className="rounded border border-blue-200 bg-blue-50 p-4">
          <h4 className="mb-2 font-semibold text-blue-800">Occupation Details</h4>
          <div className="space-y-1 text-sm text-blue-700">
            <div>
              <strong>Title:</strong> {selectedExample.occupation_title || selectedExample.title}
            </div>
            <div>
              <strong>Description:</strong>{' '}
              {selectedExample.occupation_description || selectedExample.description}
            </div>
            <div>
              <strong>Code:</strong> {selectedExample.occupation_code || selectedExample.code}
            </div>
            <div>
              <strong>Level:</strong> {selectedExample.level_type || selectedExample.level}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const CommonOccupations: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Pre-configured examples of common occupations in Filipino communities.',
      },
    },
  },
  render: () => <CommonOccupationsComponent />,
};

const LoadingAndErrorStatesComponent = () => {
  const [currentState, setCurrentState] = React.useState<
    'default' | 'loading' | 'no_data' | 'error'
  >('default');

  const states = [
    { key: 'default', label: 'Default' },
    { key: 'loading', label: 'Loading' },
    { key: 'no_data', label: 'No Results' },
    { key: 'error', label: 'Error State' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-lg font-semibold">Component States</h3>
        <div className="flex flex-wrap gap-2">
          {states.map(state => (
            <button
              key={state.key}
              onClick={() => setCurrentState(state.key as any)}
              className={`rounded px-4 py-2 text-sm ${
                currentState === state.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {state.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          PSOC Selector - {states.find(s => s.key === currentState)?.label} State
        </label>

        {currentState === 'default' && (
          <PSOCSelector
            value=""
            onSelect={action('state-demo-select')}
            placeholder="Normal state - type to search"
          />
        )}

        {currentState === 'loading' && (
          <div>
            <PSOCSelector
              value=""
              onSelect={action('state-demo-select')}
              placeholder="Loading state simulation"
            />
            <p className="mt-2 text-sm text-gray-600">
              💡 In real usage, this shows spinner while searching PSOC database
            </p>
          </div>
        )}

        {currentState === 'no_data' && (
          <div>
            <PSOCSelector
              value=""
              onSelect={action('state-demo-select')}
              placeholder='Type "xyz123" to simulate no results'
            />
            <p className="mt-2 text-sm text-gray-600">
              💡 Shows "No occupations found" message when search returns empty
            </p>
          </div>
        )}

        {currentState === 'error' && (
          <PSOCSelector
            value=""
            onSelect={action('state-demo-select')}
            error="Unable to connect to PSOC database. Please try again."
          />
        )}
      </div>
    </div>
  );
};

export const LoadingAndErrorStates: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Demonstration of loading states and error handling.',
      },
    },
  },
  render: () => <LoadingAndErrorStatesComponent />,
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
        <PSOCSelector value="" onSelect={action('mobile-select')} placeholder="Mobile view" />
      </div>

      <div className="w-full max-w-md">
        <h4 className="mb-2 text-sm font-semibold">Tablet Layout</h4>
        <PSOCSelector value="" onSelect={action('tablet-select')} placeholder="Tablet view" />
      </div>

      <div className="w-full max-w-2xl">
        <h4 className="mb-2 text-sm font-semibold">Desktop Layout</h4>
        <PSOCSelector
          value=""
          onSelect={action('desktop-select')}
          placeholder="Desktop view with full width"
        />
      </div>
    </div>
  ),
};
