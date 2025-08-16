import type { Meta, StoryObj } from '@storybook/react';
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import Select from './Select';
import { 
  SEX_OPTIONS,
  CIVIL_STATUS_OPTIONS,
  CITIZENSHIP_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS
} from '@/lib/constants/resident-enums';
import { 
  withAuthenticatedSupabase, 
  withUnauthenticatedSupabase, 
  mockPSGCData, 
  mockPSOCData 
} from '../../../../../.storybook/decorators/SupabaseDecorator';

const meta: Meta<typeof Select> = {
  title: 'Atoms/Field/Select',
  component: Select,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Enhanced Select component that follows PSGCSelector patterns but works with static enum/constant data.

## Features
- **Searchable**: Type to filter options
- **Keyboard Navigation**: Arrow keys, Enter, Escape support
- **Enum Support**: Direct integration with TypeScript enums and constants
- **Consistent UX**: Same patterns as PSGCSelector and PSOCSelector
- **Dark Mode**: Full dark theme support
- **Accessibility**: WCAG 2.1 AA compliant

## Usage with Enums/Constants
\`\`\`tsx
import { Select } from '@/components/atoms/Field';
import { SEX_OPTIONS } from '@/lib/constants/resident-enums';

<Select
  enumData={SEX_OPTIONS}
  value={selectedValue}
  onSelect={(option) => setSelectedValue(option?.value || '')}
  placeholder="Select gender..."
/>
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    searchable: {
      control: 'boolean',
      description: 'Whether to enable search/filter functionality',
    },
    allowCustom: {
      control: 'boolean',
      description: 'Whether to allow custom input values',
    },
    clearOnSelect: {
      control: 'boolean',
      description: 'Whether to clear search term after selection',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the select is disabled',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

// Basic Examples with Constants
export const WithSexOptions: Story = {
  render: () => {
    const [value, setValue] = useState('');
    
    return (
      <Select
        enumData={SEX_OPTIONS}
        value={value}
        onSelect={(option) => setValue(option?.value || '')}
        placeholder="Select gender..."
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Select using SEX_OPTIONS constant from resident-enums.ts. Type to search or use arrow keys to navigate.',
      },
    },
  },
};

export const WithCivilStatusOptions: Story = {
  render: () => {
    const [value, setValue] = useState('');
    
    return (
      <Select
        enumData={CIVIL_STATUS_OPTIONS}
        value={value}
        onSelect={(option) => setValue(option?.value || '')}
        placeholder="Select civil status..."
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Select using CIVIL_STATUS_OPTIONS constant with multiple options.',
      },
    },
  },
};

export const WithEducationLevels: Story = {
  render: () => {
    const [value, setValue] = useState('');
    
    return (
      <Select
        enumData={EDUCATION_LEVEL_OPTIONS}
        value={value}
        onSelect={(option) => setValue(option?.value || '')}
        placeholder="Select education level..."
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Select using EDUCATION_LEVEL_OPTIONS showing educational attainment levels.',
      },
    },
  },
};

// Enhanced Options with Descriptions
export const WithDescriptions: Story = {
  render: () => {
    const [value, setValue] = useState('');
    
    const optionsWithDescriptions = [
      { 
        value: 'admin', 
        label: 'Administrator', 
        description: 'Full access to all system features' 
      },
      { 
        value: 'moderator', 
        label: 'Moderator', 
        description: 'Can manage users and content' 
      },
      { 
        value: 'user', 
        label: 'Regular User', 
        description: 'Basic access to system features' 
      },
      { 
        value: 'guest', 
        label: 'Guest', 
        description: 'Limited read-only access',
        disabled: true
      },
    ];
    
    return (
      <Select
        options={optionsWithDescriptions}
        value={value}
        onSelect={(option) => setValue(option?.value || '')}
        placeholder="Select user role..."
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Select with option descriptions that appear below each option label.',
      },
    },
  },
};

// Searchable Examples
export const SearchableSelect: Story = {
  render: () => {
    const [value, setValue] = useState('');
    
    const countries = [
      { value: 'ph', label: 'Philippines' },
      { value: 'us', label: 'United States' },
      { value: 'jp', label: 'Japan' },
      { value: 'kr', label: 'South Korea' },
      { value: 'sg', label: 'Singapore' },
      { value: 'my', label: 'Malaysia' },
      { value: 'th', label: 'Thailand' },
      { value: 'vn', label: 'Vietnam' },
      { value: 'id', label: 'Indonesia' },
      { value: 'au', label: 'Australia' },
    ];
    
    return (
      <div className="space-y-2">
        <Select
          options={countries}
          value={value}
          onSelect={(option) => setValue(option?.value || '')}
          placeholder="Search countries..."
          searchable={true}
        />
        <p className="text-sm text-gray-500">
          Selected: {value || 'None'} • Type to search
        </p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Searchable select - type to filter options in real-time.',
      },
    },
  },
};

// Custom Input Allowed
export const AllowCustomInput: Story = {
  render: () => {
    const [value, setValue] = useState('');
    
    return (
      <div className="space-y-2">
        <Select
          enumData={EMPLOYMENT_STATUS_OPTIONS}
          value={value}
          onSelect={(option) => setValue(option?.value || '')}
          placeholder="Select or type employment status..."
          allowCustom={true}
          searchable={true}
        />
        <p className="text-sm text-gray-500">
          Current value: "{value}" • Type custom values or select from list
        </p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Allow custom input values in addition to predefined options.',
      },
    },
  },
};

// States Examples
export const ErrorState: Story = {
  render: () => {
    const [value, setValue] = useState('');
    
    return (
      <Select
        enumData={CITIZENSHIP_OPTIONS}
        value={value}
        onSelect={(option) => setValue(option?.value || '')}
        placeholder="Select citizenship..."
        error="Please select a citizenship option"
      />
    );
  },
};

export const DisabledState: Story = {
  render: () => {
    return (
      <Select
        enumData={SEX_OPTIONS}
        value="male"
        onSelect={() => {}}
        placeholder="This select is disabled"
        disabled={true}
      />
    );
  },
};

// Interactive Playground
export const InteractiveDemo: Story = {
  render: () => {
    const [sex, setSex] = useState('');
    const [civilStatus, setCivilStatus] = useState('');
    const [education, setEducation] = useState('');
    
    return (
      <div className="space-y-6 max-w-md">
        <h3 className="text-lg font-semibold">Resident Information Form</h3>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
            Gender <span className="text-red-500">*</span>
          </label>
          <Select
            enumData={SEX_OPTIONS}
            value={sex}
            onSelect={(option) => setSex(option?.value || '')}
            placeholder="Select gender..."
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
            Civil Status <span className="text-red-500">*</span>
          </label>
          <Select
            enumData={CIVIL_STATUS_OPTIONS}
            value={civilStatus}
            onSelect={(option) => setCivilStatus(option?.value || '')}
            placeholder="Select civil status..."
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
            Education Level
          </label>
          <Select
            enumData={EDUCATION_LEVEL_OPTIONS}
            value={education}
            onSelect={(option) => setEducation(option?.value || '')}
            placeholder="Select education level..."
          />
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-medium mb-2">Form Values:</h4>
          <pre className="text-sm">
{JSON.stringify({
  sex,
  civilStatus,
  education
}, null, 2)}
          </pre>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive form demo showing multiple selects working with resident enum constants.',
      },
    },
  },
};

// Keyboard Navigation Demo
export const KeyboardNavigation: Story = {
  render: () => {
    const [value, setValue] = useState('');
    
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
            Civil Status
          </label>
          <Select
            enumData={CIVIL_STATUS_OPTIONS}
            value={value}
            onSelect={(option) => setValue(option?.value || '')}
            placeholder="Try keyboard navigation..."
          />
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <p><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">↓</kbd> Open dropdown / Next option</p>
          <p><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">↑</kbd> Previous option</p>
          <p><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Enter</kbd> Select highlighted option</p>
          <p><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Esc</kbd> Close dropdown</p>
          <p><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Type</kbd> Filter options</p>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Full keyboard navigation support with visual guide.',
      },
    },
  },
};

// API-Driven Examples (PSGC and PSOC patterns)
export const PSGCPattern: Story = {
  render: () => {
    const [value, setValue] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Mock PSGC API search - use useMemo to prevent recreation
    const mockPSGCData = useMemo(() => [
      { code: '137401001', name: 'Barangay Bagong Silang, Caloocan City, Metro Manila' },
      { code: '137401002', name: 'Barangay Bagong Barrio, Caloocan City, Metro Manila' },
      { code: '137402001', name: 'Barangay Baesa, Quezon City, Metro Manila' },
      { code: '137402002', name: 'Barangay Bagbag, Quezon City, Metro Manila' },
      { code: '137403001', name: 'Barangay Bangkal, Makati City, Metro Manila' },
      { code: '137403002', name: 'Barangay Bel-Air, Makati City, Metro Manila' },
    ], []);
    
    const handleSearch = useCallback((query) => {
      if (query.length < 2) {
        setSearchResults([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      // Simulate API delay
      setTimeout(() => {
        const filtered = mockPSGCData.filter(item =>
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.code.includes(query)
        ).map(item => ({
          value: item.code,
          label: item.name,
          description: `Code: ${item.code}`
        }));
        
        setSearchResults(filtered);
        setLoading(false);
      }, 500);
    }, [mockPSGCData]);
    
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
          Geographic Location (PSGC Pattern)
        </label>
        <Select
          options={searchResults}
          onSearch={handleSearch}
          loading={loading}
          value={value}
          onSelect={(option) => setValue(option?.value || '')}
          placeholder="Search for barangay..."
          searchable={true}
        />
        <p className="text-sm text-gray-500">
          Selected PSGC Code: {value || 'None'} • Type at least 2 characters to search
        </p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'API-driven Select following PSGCSelector patterns for geographic location search. Demonstrates debounced search with loading states.',
      },
    },
  },
};

export const PSOCPattern: Story = {
  render: () => {
    const [value, setValue] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Mock PSOC API search - use useMemo to prevent recreation
    const mockPSOCData = useMemo(() => [
      { code: '1111', title: 'Chief Executives, Senior Officials and Legislators', description: 'Leadership and governance roles' },
      { code: '2111', title: 'Physicists and Astronomers', description: 'Physical sciences professionals' },
      { code: '2112', title: 'Meteorologists', description: 'Weather and climate specialists' },
      { code: '2113', title: 'Chemists', description: 'Chemical sciences professionals' },
      { code: '2114', title: 'Geologists and Geophysicists', description: 'Earth sciences professionals' },
      { code: '3111', title: 'Chemical and Physical Science Technicians', description: 'Laboratory and research support' },
      { code: '5111', title: 'Travel Attendants and Travel Stewards', description: 'Tourism and hospitality services' },
    ], []);
    
    const handleSearch = useCallback((query) => {
      if (query.length < 2) {
        setSearchResults([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      // Simulate API delay
      setTimeout(() => {
        const filtered = mockPSOCData.filter(item =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase()) ||
          item.code.includes(query)
        ).map(item => ({
          value: item.code,
          label: item.title,
          description: `${item.code} - ${item.description}`
        }));
        
        setSearchResults(filtered);
        setLoading(false);
      }, 400);
    }, [mockPSOCData]);
    
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
          Occupation (PSOC Pattern)
        </label>
        <Select
          options={searchResults}
          onSearch={handleSearch}
          loading={loading}
          value={value}
          onSelect={(option) => setValue(option?.value || '')}
          placeholder="Search for occupation..."
          searchable={true}
        />
        <p className="text-sm text-gray-500">
          Selected PSOC Code: {value || 'None'} • Type occupation name or code
        </p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'API-driven Select following PSOCSelector patterns for occupation search. Shows how to implement Philippine Standard Occupational Classification searches.',
      },
    },
  },
};

export const APIComparison: Story = {
  render: () => {
    const [psgcValue, setPsgcValue] = useState('');
    const [psocValue, setPsocValue] = useState('');
    const [psgcResults, setPsgcResults] = useState([]);
    const [psocResults, setPsocResults] = useState([]);
    const [psgcLoading, setPsgcLoading] = useState(false);
    const [psocLoading, setPsocLoading] = useState(false);
    
    // Refs to track timeouts
    const psgcTimeoutRef = useRef(null);
    const psocTimeoutRef = useRef(null);
    
    // Mock data - moved to useMemo to prevent recreating on every render
    const mockPSGCData = useMemo(() => [
      { code: '137401001', name: 'Barangay Bagong Silang, Caloocan City' },
      { code: '137402001', name: 'Barangay Baesa, Quezon City' },
      { code: '137403001', name: 'Barangay Bangkal, Makati City' },
    ], []);
    
    const mockPSOCData = useMemo(() => [
      { code: '1111', title: 'Chief Executives', description: 'Leadership roles' },
      { code: '2111', title: 'Physicists', description: 'Physical sciences' },
      { code: '3111', title: 'Science Technicians', description: 'Laboratory support' },
    ], []);
    
    const handlePSGCSearch = useCallback((query) => {
      // Clear existing timeout
      if (psgcTimeoutRef.current) {
        clearTimeout(psgcTimeoutRef.current);
      }
      
      if (query.length < 2) {
        setPsgcResults([]);
        setPsgcLoading(false);
        return;
      }
      
      setPsgcLoading(true);
      psgcTimeoutRef.current = setTimeout(() => {
        const filtered = mockPSGCData.filter(item =>
          item.name.toLowerCase().includes(query.toLowerCase())
        ).map(item => ({
          value: item.code,
          label: item.name,
          description: `Code: ${item.code}`
        }));
        setPsgcResults(filtered);
        setPsgcLoading(false);
        psgcTimeoutRef.current = null;
      }, 300);
    }, []); // Empty dependency array - mockPSGCData is stable from useMemo
    
    const handlePSOCSearch = useCallback((query) => {
      // Clear existing timeout
      if (psocTimeoutRef.current) {
        clearTimeout(psocTimeoutRef.current);
      }
      
      if (query.length < 2) {
        setPsocResults([]);
        setPsocLoading(false);
        return;
      }
      
      setPsocLoading(true);
      psocTimeoutRef.current = setTimeout(() => {
        const filtered = mockPSOCData.filter(item =>
          item.title.toLowerCase().includes(query.toLowerCase())
        ).map(item => ({
          value: item.code,
          label: item.title,
          description: `${item.code} - ${item.description}`
        }));
        
        setPsocResults(filtered);
        setPsocLoading(false);
        psocTimeoutRef.current = null;
      }, 350);
    }, []); // Empty dependency array - mockPSOCData is stable from useMemo
    
    // Cleanup timeouts on unmount
    useEffect(() => {
      return () => {
        if (psgcTimeoutRef.current) {
          clearTimeout(psgcTimeoutRef.current);
        }
        if (psocTimeoutRef.current) {
          clearTimeout(psocTimeoutRef.current);
        }
      };
    }, []);
    
    return (
      <div className="space-y-6 max-w-2xl">
        <h3 className="text-lg font-semibold">API Pattern Comparison</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
              PSGC Geographic Search
            </label>
            <Select
              options={psgcResults}
              onSearch={handlePSGCSearch}
              loading={psgcLoading}
              value={psgcValue}
              onSelect={(option) => setPsgcValue(option?.value || '')}
              placeholder="Search barangay..."
            />
            <p className="text-xs text-gray-500">
              PSGC Code: {psgcValue || 'None'}
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
              PSOC Occupation Search
            </label>
            <Select
              options={psocResults}
              onSearch={handlePSOCSearch}
              loading={psocLoading}
              value={psocValue}
              onSelect={(option) => setPsocValue(option?.value || '')}
              placeholder="Search occupation..."
            />
            <p className="text-xs text-gray-500">
              PSOC Code: {psocValue || 'None'}
            </p>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-medium mb-2">Selected Values:</h4>
          <pre className="text-sm">
{JSON.stringify({
  psgcCode: psgcValue,
  psocCode: psocValue
}, null, 2)}
          </pre>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Side-by-side comparison showing Select component with both PSGC and PSOC API patterns. Demonstrates consistent UX across different data sources.',
      },
    },
  },
};

// Unauthenticated Context Demo
export const UnauthenticatedDemo: Story = {
  decorators: [withUnauthenticatedSupabase],
  render: () => {
    const [value, setValue] = useState('');
    
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
          Unauthenticated Context Demo
        </label>
        <Select
          enumData={SEX_OPTIONS}
          value={value}
          onSelect={(option) => setValue(option?.value || '')}
          placeholder="No authentication required..."
        />
        <p className="text-sm text-gray-500">
          Selected: {value || 'None'} • Using unauthenticated mock context
        </p>
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            <strong>⚠️ Unauthenticated Context:</strong> This story simulates components that work without authentication.
          </p>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates components using unauthenticated context with mock Supabase decorators.',
      },
    },
  },
};

// Real API Integration Examples (Using Mock Authentication)
export const RealPSGCAPI: Story = {
  decorators: [withAuthenticatedSupabase],
  render: () => {
    const [value, setValue] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const handleSearch = useCallback((query) => {
      if (query.length < 2) {
        setSearchResults([]);
        return;
      }
      
      setLoading(true);
      
      // Simulate API delay with mock data
      setTimeout(() => {
        const filtered = mockPSGCData.filter(item =>
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.full_address.toLowerCase().includes(query.toLowerCase())
        ).map(item => ({
          value: item.code,
          label: item.full_address,
          description: `Code: ${item.code} | Level: ${item.level} | 🔐 Mock Auth Context`
        }));
        
        setSearchResults(filtered);
        setLoading(false);
      }, 400);
    }, []);
    
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
          Geographic Location (Mock PSGC API with Auth Context)
        </label>
        <Select
          options={searchResults}
          onSearch={handleSearch}
          loading={loading}
          value={value}
          onSelect={(option) => setValue(option?.value || '')}
          placeholder="Search Philippine locations..."
          searchable={true}
        />
        <p className="text-sm text-gray-500">
          Selected PSGC Code: {value || 'None'} • Using mock Supabase authentication context
        </p>
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <p className="text-sm text-green-600 dark:text-green-400">
            <strong>✅ Mock Authentication Active:</strong> This story uses Storybook decorators to provide authenticated context.
          </p>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: `PSGC API integration with mock Supabase authentication context. This demonstrates Option 4: Storybook Decorators approach.

**Features:**
- Mock authenticated user context
- Simulated API responses with authentication
- Consistent UX patterns with real implementation
- No API proxy configuration required

**Usage:**
\`\`\`tsx
export const YourStory = {
  decorators: [withAuthenticatedSupabase],
  render: () => <YourComponent />
};
\`\`\``,
      },
    },
  },
};

export const RealPSOCAPI: Story = {
  decorators: [withAuthenticatedSupabase],
  render: () => {
    const [value, setValue] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const handleSearch = useCallback((query) => {
      if (query.length < 2) {
        setSearchResults([]);
        return;
      }
      
      setLoading(true);
      
      // Simulate API delay with mock data
      setTimeout(() => {
        const filtered = mockPSOCData.filter(item =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.hierarchy.toLowerCase().includes(query.toLowerCase())
        ).map(item => ({
          value: item.code,
          label: item.title,
          description: `${item.code} - ${item.level} | ${item.hierarchy} | 🔐 Mock Auth Context`
        }));
        
        setSearchResults(filtered);
        setLoading(false);
      }, 350);
    }, []);
    
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
          Occupation (Mock PSOC API with Auth Context)
        </label>
        <Select
          options={searchResults}
          onSearch={handleSearch}
          loading={loading}
          value={value}
          onSelect={(option) => setValue(option?.value || '')}
          placeholder="Search Philippine occupations..."
          searchable={true}
        />
        <p className="text-sm text-gray-500">
          Selected PSOC Code: {value || 'None'} • Using mock Supabase authentication context
        </p>
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <p className="text-sm text-green-600 dark:text-green-400">
            <strong>✅ Mock Authentication Active:</strong> This story simulates authenticated API calls with consistent UX patterns.
          </p>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: `PSOC API integration with mock Supabase authentication context. Demonstrates Option 4: Storybook Decorators for occupation search.

**Features:**
- Mock authenticated user context
- Simulated PSOC API responses
- Real UX patterns without API complexity
- Easy to test and document

**Decorator Usage:**
\`\`\`tsx
export const YourPSOCStory = {
  decorators: [withAuthenticatedSupabase],
  render: () => <YourOccupationSelector />
};
\`\`\``,
      },
    },
  },
};

export const APIImplementationGuide: Story = {
  render: () => {
    return (
      <div className="max-w-4xl space-y-6">
        <h3 className="text-xl font-bold">API Integration Implementation Guide</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-blue-600">1. PSGC API Setup</h4>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h5 className="font-medium mb-2">Required API Endpoint:</h5>
              <code className="text-sm bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                GET /api/psgc/search
              </code>
              
              <h5 className="font-medium mb-2 mt-4">Query Parameters:</h5>
              <ul className="text-sm space-y-1">
                <li>• <code>q</code> - Search query string</li>
                <li>• <code>limit</code> - Maximum results (optional, default: 20)</li>
                <li>• <code>levels</code> - Geographic levels: region,province,city,barangay</li>
              </ul>
              
              <h5 className="font-medium mb-2 mt-4">Response Format:</h5>
              <pre className="text-xs bg-gray-200 dark:bg-gray-700 p-2 rounded overflow-x-auto">
{`{
  "data": [
    {
      "code": "137401001",
      "name": "Barangay Bagong Silang",
      "level": "barangay",
      "full_address": "Barangay Bagong Silang, Caloocan City, Metro Manila",
      "barangay_name": "Barangay Bagong Silang",
      "city_name": "Caloocan City",
      "province_name": "Metro Manila",
      "region_name": "NCR"
    }
  ],
  "count": 1
}`}
              </pre>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-green-600">2. PSOC API Setup</h4>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h5 className="font-medium mb-2">Required API Endpoint:</h5>
              <code className="text-sm bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                GET /api/psoc/search
              </code>
              
              <h5 className="font-medium mb-2 mt-4">Query Parameters:</h5>
              <ul className="text-sm space-y-1">
                <li>• <code>q</code> - Search query string</li>
                <li>• <code>limit</code> - Maximum results (optional, default: 20)</li>
                <li>• <code>levels</code> - Occupation levels: major_group,unit_group,occupation</li>
              </ul>
              
              <h5 className="font-medium mb-2 mt-4">Response Format:</h5>
              <pre className="text-xs bg-gray-200 dark:bg-gray-700 p-2 rounded overflow-x-auto">
{`{
  "data": [
    {
      "code": "1111",
      "title": "Chief Executives",
      "level": "occupation",
      "hierarchy": "Major Group: Managers",
      "match_score": 5
    }
  ],
  "count": 1
}`}
              </pre>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">🔧 Next.js API Routes Implementation</h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Create the API endpoints in your Next.js application:
          </p>
          <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
            <li>• <code>src/app/api/psgc/search/route.ts</code> - PSGC search endpoint</li>
            <li>• <code>src/app/api/psoc/search/route.ts</code> - PSOC search endpoint</li>
            <li>• Connect to your PostgreSQL database with PSGC/PSOC tables</li>
            <li>• Implement proper error handling and validation</li>
            <li>• Add rate limiting and caching for production use</li>
          </ul>
        </div>

        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
          <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">📖 Storybook API Proxy Setup (Optional)</h4>
          <p className="text-sm text-purple-700 dark:text-purple-300">
            To connect Storybook stories to real APIs, configure proxy in <code>.storybook/main.ts</code>:
          </p>
          <pre className="text-xs bg-purple-100 dark:bg-purple-900/40 p-2 rounded mt-2 overflow-x-auto">
{`webpackFinal: async (config) => {
  config.devServer = {
    ...config.devServer,
    proxy: [{
      context: ['/api'],
      target: 'http://localhost:3000',
      changeOrigin: true,
      headers: {
        'Authorization': 'Bearer YOUR_SERVICE_ROLE_KEY'
      }
    }]
  };
  return config;
}`}
          </pre>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
            Note: Stories will show mock data if proxy isn't configured, demonstrating the same API patterns.
          </p>
        </div>
        
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">✨ Component Usage</h4>
          <pre className="text-sm text-green-700 dark:text-green-300 mt-2">
{`// Real API integration with error handling
const [results, setResults] = useState([]);
const [loading, setLoading] = useState(false);

const handleSearch = useCallback(async (query) => {
  if (query.length < 2) return;
  
  setLoading(true);
  try {
    const response = await fetch(\`/api/psgc/search?q=\${query}&levels=barangay,city\`);
    const data = await response.json();
    
    setResults(data.data?.map(item => ({
      value: item.code,
      label: item.full_address || item.name,
      description: \`\${item.code} - \${item.level}\`
    })) || []);
  } catch (error) {
    console.error('API Error:', error);
  } finally {
    setLoading(false);
  }
}, []);

<Select
  options={results}
  onSearch={handleSearch}
  loading={loading}
  placeholder="Search locations..."
/>`}
          </pre>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Complete implementation guide for integrating the Select component with real PSGC and PSOC APIs.',
      },
    },
  },
};

// Playground
export const Playground: Story = {
  args: {
    enumData: SEX_OPTIONS,
    placeholder: 'Customize this select...',
    searchable: true,
    allowCustom: false,
    clearOnSelect: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Playground to experiment with different Select configurations.',
      },
    },
  },
};