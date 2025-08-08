import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { action } from 'storybook/actions';
import SearchBar, { SearchFilter } from './SearchBar';

const meta: Meta<typeof SearchBar> = {
  title: 'Organisms/SearchBar',
  component: SearchBar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
A comprehensive search component with advanced filtering capabilities. This component provides both simple text search and complex multi-field filtering for data-heavy applications. Key features include:

- **Debounced Search** - Optimized search with automatic debouncing
- **Advanced Filters** - Multiple filter criteria with different operators
- **Dynamic Filter Types** - Text, select, number, and date filters
- **Filter Management** - Add, remove, and modify filters dynamically
- **Visual Feedback** - Active filters display and clear options
- **Responsive Design** - Adapts to different screen sizes
- **Accessibility** - Full keyboard navigation support

Perfect for resident search, household filtering, and other complex data queries in the barangay management system.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the main search input',
    },
    onSearch: {
      action: 'onSearch',
      description: 'Callback when search is triggered with term and filters',
    },
    onClear: {
      action: 'onClear',
      description: 'Callback when search is cleared',
    },
    showAdvancedFilters: {
      control: 'boolean',
      description: 'Whether to show advanced filters initially',
    },
    initialSearchTerm: {
      control: 'text',
      description: 'Initial search term value',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock filter options for stories
const residentFilterOptions = [
  { field: 'name', label: 'Name', type: 'text' as const },
  { field: 'age', label: 'Age', type: 'number' as const },
  {
    field: 'status',
    label: 'Status',
    type: 'select' as const,
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'pending', label: 'Pending' },
    ],
  },
  {
    field: 'gender',
    label: 'Gender',
    type: 'select' as const,
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
    ],
  },
  { field: 'date_registered', label: 'Registration Date', type: 'date' as const },
  { field: 'household', label: 'Household', type: 'text' as const },
];

export const Default: Story = {
  args: {
    placeholder: 'Search...',
    onSearch: action('search-performed'),
    onClear: action('search-cleared'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic search bar with default placeholder and no filters.',
      },
    },
  },
};

export const WithFilters: Story = {
  args: {
    placeholder: 'Search residents...',
    onSearch: action('search-performed'),
    onClear: action('search-cleared'),
    filterOptions: residentFilterOptions,
    showAdvancedFilters: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Search bar with advanced filters available but initially hidden.',
      },
    },
  },
};

export const FiltersExpanded: Story = {
  args: {
    placeholder: 'Search residents...',
    onSearch: action('search-performed'),
    onClear: action('search-cleared'),
    filterOptions: residentFilterOptions,
    showAdvancedFilters: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Search bar with advanced filters panel expanded and visible.',
      },
    },
  },
};

export const WithInitialData: Story = {
  args: {
    placeholder: 'Search residents...',
    onSearch: action('search-performed'),
    onClear: action('search-cleared'),
    filterOptions: residentFilterOptions,
    initialSearchTerm: 'Juan',
    initialFilters: [
      {
        field: 'status',
        operator: 'equals',
        value: 'active',
        label: 'Status',
      },
      {
        field: 'age',
        operator: 'greater_than',
        value: 18,
        label: 'Age',
      },
    ],
    showAdvancedFilters: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Search bar pre-populated with search term and active filters.',
      },
    },
  },
};

const ResidentSearchComponent = () => {
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  const handleSearch = (searchTerm: string, filters: SearchFilter[]) => {
    setIsSearching(true);
    action('resident-search')({ searchTerm, filters });

    // Simulate search results
    setTimeout(() => {
      const mockResults = [
        {
          id: 1,
          name: 'Juan dela Cruz',
          age: 34,
          status: 'active',
          gender: 'male',
          household: 'HH-001',
        },
        {
          id: 2,
          name: 'Maria Santos',
          age: 29,
          status: 'active',
          gender: 'female',
          household: 'HH-002',
        },
        {
          id: 3,
          name: 'Pedro Garcia',
          age: 45,
          status: 'inactive',
          gender: 'male',
          household: 'HH-003',
        },
      ];

      let results = mockResults;

      // Apply search term filter
      if (searchTerm) {
        results = results.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));
      }

      // Apply additional filters
      filters.forEach(filter => {
        if (filter.operator === 'equals' && filter.value) {
          results = results.filter(r => r[filter.field] === filter.value);
        }
        if (filter.operator === 'greater_than' && filter.value) {
          results = results.filter(r => r[filter.field] > filter.value);
        }
      });

      setSearchResults(results);
      setIsSearching(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-lg font-semibold">Barangay Resident Search</h3>
        <SearchBar
          placeholder="Search residents by name, household, or other criteria..."
          onSearch={handleSearch}
          onClear={() => setSearchResults([])}
          filterOptions={[
            { field: 'name', label: 'Full Name', type: 'text' },
            { field: 'age', label: 'Age', type: 'number' },
            {
              field: 'status',
              label: 'Status',
              type: 'select',
              options: [
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'pending', label: 'Pending Registration' },
              ],
            },
            {
              field: 'gender',
              label: 'Gender',
              type: 'select',
              options: [
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
              ],
            },
            {
              field: 'civil_status',
              label: 'Civil Status',
              type: 'select',
              options: [
                { value: 'single', label: 'Single' },
                { value: 'married', label: 'Married' },
                { value: 'widowed', label: 'Widowed' },
              ],
            },
            { field: 'household', label: 'Household Code', type: 'text' },
          ]}
        />
      </div>

      {/* Search Results */}
      <div className="rounded-lg border border-gray-200">
        <div className="border-b border-gray-200 bg-gray-50 p-4">
          <h4 className="font-semibold text-gray-900">
            Search Results
            {isSearching ? ' (Searching...)' : ` (${searchResults.length} found)`}
          </h4>
        </div>

        <div className="divide-y divide-gray-200">
          {isSearching ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-pulse">Searching residents...</div>
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map(resident => (
              <div key={resident.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900">{resident.name}</h5>
                    <div className="space-x-4 text-sm text-gray-600">
                      <span>{resident.age} years old</span>
                      <span>•</span>
                      <span className="capitalize">{resident.gender}</span>
                      <span>•</span>
                      <span>Household: {resident.household}</span>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      resident.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {resident.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <div className="mb-2 text-4xl">🔍</div>
              <div>No residents found matching your criteria</div>
              <div className="mt-1 text-sm">Try adjusting your search or filters</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ResidentSearch: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Real-world example: Resident search with Filipino context and relevant filters.',
      },
    },
  },
  render: () => <ResidentSearchComponent />,
};

export const HouseholdSearch: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Household search example with address and demographic filters.',
      },
    },
  },
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Household Search</h3>
      <SearchBar
        placeholder="Search households by address, head of household, or code..."
        onSearch={action('household-search')}
        onClear={action('household-search-cleared')}
        filterOptions={[
          { field: 'address', label: 'Address', type: 'text' },
          { field: 'head_name', label: 'Head of Household', type: 'text' },
          { field: 'member_count', label: 'Number of Members', type: 'number' },
          {
            field: 'household_type',
            label: 'Household Type',
            type: 'select',
            options: [
              { value: 'nuclear', label: 'Nuclear Family' },
              { value: 'extended', label: 'Extended Family' },
              { value: 'single_parent', label: 'Single Parent' },
              { value: 'elderly', label: 'Elderly Only' },
            ],
          },
          { field: 'registration_date', label: 'Registration Date', type: 'date' },
        ]}
      />
    </div>
  ),
};

export const BusinessSearch: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Business permit search with industry and license filters.',
      },
    },
  },
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Business Permit Search</h3>
      <SearchBar
        placeholder="Search businesses by name, owner, or permit number..."
        onSearch={action('business-search')}
        onClear={action('business-search-cleared')}
        filterOptions={[
          { field: 'business_name', label: 'Business Name', type: 'text' },
          { field: 'owner_name', label: 'Owner Name', type: 'text' },
          {
            field: 'business_type',
            label: 'Business Type',
            type: 'select',
            options: [
              { value: 'retail', label: 'Retail Store' },
              { value: 'restaurant', label: 'Restaurant/Food' },
              { value: 'service', label: 'Service Business' },
              { value: 'manufacturing', label: 'Manufacturing' },
            ],
          },
          {
            field: 'permit_status',
            label: 'Permit Status',
            type: 'select',
            options: [
              { value: 'active', label: 'Active' },
              { value: 'expired', label: 'Expired' },
              { value: 'pending', label: 'Pending Renewal' },
              { value: 'suspended', label: 'Suspended' },
            ],
          },
          { field: 'annual_income', label: 'Annual Income', type: 'number' },
          { field: 'permit_date', label: 'Permit Issue Date', type: 'date' },
        ]}
      />
    </div>
  ),
};

export const FilterTypesDemo: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Demonstration of all available filter types and operators.',
      },
    },
  },
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-lg font-semibold">All Filter Types Demo</h3>
        <SearchBar
          placeholder="Try adding different types of filters..."
          onSearch={action('filter-demo-search')}
          onClear={action('filter-demo-cleared')}
          showAdvancedFilters={true}
          filterOptions={[
            { field: 'text_field', label: 'Text Field', type: 'text' },
            { field: 'number_field', label: 'Number Field', type: 'number' },
            { field: 'date_field', label: 'Date Field', type: 'date' },
            {
              field: 'select_field',
              label: 'Select Field',
              type: 'select',
              options: [
                { value: 'option1', label: 'Option 1' },
                { value: 'option2', label: 'Option 2' },
                { value: 'option3', label: 'Option 3' },
              ],
            },
          ]}
        />
      </div>

      <div className="rounded border bg-gray-50 p-4">
        <h4 className="mb-2 font-semibold">Available Operators by Type:</h4>
        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
          <div>
            <strong>Text Fields:</strong>
            <ul className="mt-1 list-inside list-disc text-gray-600">
              <li>Contains</li>
              <li>Equals</li>
              <li>Starts with</li>
              <li>Ends with</li>
            </ul>
          </div>
          <div>
            <strong>Number/Date Fields:</strong>
            <ul className="mt-1 list-inside list-disc text-gray-600">
              <li>All text operators</li>
              <li>Greater than</li>
              <li>Less than</li>
              <li>Between (range)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  ),
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
    <div className="space-y-8">
      <div className="max-w-sm">
        <h3 className="mb-2 text-sm font-semibold">Mobile Layout</h3>
        <div className="rounded border border-gray-200 p-2">
          <SearchBar
            placeholder="Mobile search..."
            onSearch={action('mobile-search')}
            filterOptions={residentFilterOptions.slice(0, 3)}
          />
        </div>
      </div>

      <div className="max-w-2xl">
        <h3 className="mb-2 text-sm font-semibold">Tablet Layout</h3>
        <div className="rounded border border-gray-200 p-4">
          <SearchBar
            placeholder="Tablet search with more filters..."
            onSearch={action('tablet-search')}
            filterOptions={residentFilterOptions}
          />
        </div>
      </div>

      <div className="max-w-6xl">
        <h3 className="mb-2 text-sm font-semibold">Desktop Layout</h3>
        <div className="rounded border border-gray-200 p-6">
          <SearchBar
            placeholder="Desktop search with full filter capabilities..."
            onSearch={action('desktop-search')}
            filterOptions={residentFilterOptions}
            showAdvancedFilters={true}
          />
        </div>
      </div>
    </div>
  ),
};
