import type { Meta, StoryObj } from '@storybook/react';
import { GeographicLocationStep } from './GeographicLocationStep';

const meta = {
  title: 'Organisms/GeographicLocationStep',
  component: GeographicLocationStep,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A form step component for displaying and managing geographic location information. Automatically assigns location from the user\'s barangay admin profile with read-only display format.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    formData: {
      control: { type: 'object' },
      description: 'Geographic location data including codes and names',
    },
    updateFormData: {
      action: 'updateFormData',
      description: 'Function to update form data',
    },
    errors: {
      control: { type: 'object' },
      description: 'Validation errors object',
    },
    required: {
      control: { type: 'boolean' },
      description: 'Whether geographic location is required',
    },
  },
} satisfies Meta<typeof GeographicLocationStep>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock fetch for API calls
const mockFetch = (responseData: any, delay = 500) => {
  return () =>
    new Promise(resolve =>
      setTimeout(() => resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(responseData),
      }), delay)
    );
};

// Complete geographic data for CALABARZON region
const completeGeographicData = {
  regionCode: '04',
  provinceCode: '0421',
  cityMunicipalityCode: '042108',
  barangayCode: '042108001',
  regionName: 'CALABARZON',
  provinceName: 'Batangas',
  cityMunicipalityName: 'Lipa City',
  barangayName: 'Barangay 1',
};

// Complete example with all location data
export const CompleteLocation: Story = {
  args: {
    formData: completeGeographicData,
    updateFormData: () => {},
    errors: {},
    required: true,
  },
  render: (args) => {
    // Mock successful API response
    global.fetch = mockFetch({
      region: { name: 'CALABARZON' },
      province: { name: 'Batangas' },
      city: { name: 'Lipa City' },
      barangay: { name: 'Barangay 1' },
    });

    return <GeographicLocationStep {...args} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Complete geographic location step with all location hierarchy filled.',
      },
    },
  },
};

// Metro Manila location
export const MetroManilaLocation: Story = {
  args: {
    formData: {
      regionCode: '13',
      provinceCode: '1376',
      cityMunicipalityCode: '137604',
      barangayCode: '137604001',
      regionName: 'National Capital Region (NCR)',
      provinceName: 'Metro Manila',
      cityMunicipalityName: 'Makati City',
      barangayName: 'Barangay Poblacion',
    },
    updateFormData: () => {},
    errors: {},
    required: true,
  },
  render: (args) => {
    global.fetch = mockFetch({
      region: { name: 'National Capital Region (NCR)' },
      province: { name: 'Metro Manila' },
      city: { name: 'Makati City' },
      barangay: { name: 'Barangay Poblacion' },
    });

    return <GeographicLocationStep {...args} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Geographic location step showing Metro Manila/NCR location.',
      },
    },
  },
};

// Cebu location
export const CebuLocation: Story = {
  args: {
    formData: {
      regionCode: '07',
      provinceCode: '0722',
      cityMunicipalityCode: '072209',
      barangayCode: '072209001',
      regionName: 'Central Visayas',
      provinceName: 'Cebu',
      cityMunicipalityName: 'Cebu City',
      barangayName: 'Barangay Lahug',
    },
    updateFormData: () => {},
    errors: {},
    required: true,
  },
  render: (args) => {
    global.fetch = mockFetch({
      region: { name: 'Central Visayas' },
      province: { name: 'Cebu' },
      city: { name: 'Cebu City' },
      barangay: { name: 'Barangay Lahug' },
    });

    return <GeographicLocationStep {...args} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Geographic location step showing Cebu City location.',
      },
    },
  },
};

// Davao location
export const DavaoLocation: Story = {
  args: {
    formData: {
      regionCode: '11',
      provinceCode: '1123',
      cityMunicipalityCode: '112302',
      barangayCode: '112302001',
      regionName: 'Davao Region',
      provinceName: 'Davao del Sur',
      cityMunicipalityName: 'Davao City',
      barangayName: 'Barangay Poblacion District',
    },
    updateFormData: () => {},
    errors: {},
    required: true,
  },
  render: (args) => {
    global.fetch = mockFetch({
      region: { name: 'Davao Region' },
      province: { name: 'Davao del Sur' },
      city: { name: 'Davao City' },
      barangay: { name: 'Barangay Poblacion District' },
    });

    return <GeographicLocationStep {...args} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Geographic location step showing Davao City location.',
      },
    },
  },
};

// Rural municipality location
export const RuralMunicipalityLocation: Story = {
  args: {
    formData: {
      regionCode: '05',
      provinceCode: '0554',
      cityMunicipalityCode: '055407',
      barangayCode: '055407001',
      regionName: 'Bicol Region',
      provinceName: 'Albay',
      cityMunicipalityName: 'Guinobatan',
      barangayName: 'Barangay Poblacion',
    },
    updateFormData: () => {},
    errors: {},
    required: true,
  },
  render: (args) => {
    global.fetch = mockFetch({
      region: { name: 'Bicol Region' },
      province: { name: 'Albay' },
      city: { name: 'Guinobatan' },
      barangay: { name: 'Barangay Poblacion' },
    });

    return <GeographicLocationStep {...args} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Geographic location step showing rural municipality location.',
      },
    },
  },
};

// Empty/unassigned location
export const EmptyLocation: Story = {
  args: {
    formData: {},
    updateFormData: () => {},
    errors: {},
    required: true,
  },
  render: (args) => {
    global.fetch = mockFetch({});

    return <GeographicLocationStep {...args} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Geographic location step when no location is assigned.',
      },
    },
  },
};

// Loading state
export const LoadingState: Story = {
  args: {
    formData: completeGeographicData,
    updateFormData: () => {},
    errors: {},
    required: true,
  },
  render: (args) => {
    // Mock slow API response to show loading state
    global.fetch = mockFetch({
      region: { name: 'CALABARZON' },
      province: { name: 'Batangas' },
      city: { name: 'Lipa City' },
      barangay: { name: 'Barangay 1' },
    }, 10000); // 10 second delay

    return <GeographicLocationStep {...args} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Geographic location step in loading state while fetching location names.',
      },
    },
  },
};

// With validation errors
export const WithValidationErrors: Story = {
  args: {
    formData: {
      regionCode: '04',
      // Missing other codes to trigger errors
    },
    updateFormData: () => {},
    errors: {
      regionCode: 'Region is required',
      provinceCode: 'Province is required',
      cityMunicipalityCode: 'City/Municipality is required',
      barangayCode: 'Barangay is required',
    },
    required: true,
  },
  render: (args) => {
    global.fetch = mockFetch({
      region: { name: 'CALABARZON' },
    });

    return <GeographicLocationStep {...args} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Geographic location step with validation errors displayed.',
      },
    },
  },
};

// Network error scenario
export const NetworkError: Story = {
  args: {
    formData: completeGeographicData,
    updateFormData: () => {},
    errors: {},
    required: true,
  },
  render: (args) => {
    // Mock network error
    global.fetch = (() =>
      Promise.reject(new Error('Network error'))
    );

    return <GeographicLocationStep {...args} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Geographic location step when API request fails.',
      },
    },
  },
};

// API error response
export const APIError: Story = {
  args: {
    formData: completeGeographicData,
    updateFormData: () => {},
    errors: {},
    required: true,
  },
  render: (args) => {
    // Mock API error response
    global.fetch = (() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Internal server error' }),
      })
    );

    return <GeographicLocationStep {...args} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Geographic location step when API returns error response.',
      },
    },
  },
};

// Optional (not required) mode
export const OptionalMode: Story = {
  args: {
    formData: completeGeographicData,
    updateFormData: () => {},
    errors: {},
    required: false,
  },
  render: (args) => {
    global.fetch = mockFetch({
      region: { name: 'CALABARZON' },
      province: { name: 'Batangas' },
      city: { name: 'Lipa City' },
      barangay: { name: 'Barangay 1' },
    });

    return <GeographicLocationStep {...args} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Geographic location step in optional mode (not required).',
      },
    },
  },
};

// Different Philippine regions showcase
export const RegionalShowcase: Story = {
  render: () => {
    const regions = [
      {
        regionCode: '01',
        regionName: 'Ilocos Region',
        provinceCode: '0128',
        provinceName: 'Ilocos Sur',
        cityMunicipalityCode: '012801',
        cityMunicipalityName: 'Vigan City',
        barangayCode: '012801001',
        barangayName: 'Barangay I',
      },
      {
        regionCode: '08',
        regionName: 'Eastern Visayas',
        provinceCode: '0837',
        provinceName: 'Leyte',
        cityMunicipalityCode: '083747',
        cityMunicipalityName: 'Tacloban City',
        barangayCode: '083747001',
        barangayName: 'Barangay 1',
      },
      {
        regionCode: '12',
        regionName: 'SOCCSKSARGEN',
        provinceCode: '1263',
        provinceName: 'South Cotabato',
        cityMunicipalityCode: '126306',
        cityMunicipalityName: 'General Santos City',
        barangayCode: '126306001',
        barangayName: 'Barangay Apopong',
      },
    ];

    global.fetch = mockFetch({
      region: { name: 'Multiple Regions' },
      province: { name: 'Various Provinces' },
      city: { name: 'Different Cities' },
      barangay: { name: 'Sample Barangays' },
    });

    return (
      <div className="space-y-8">
        <h2 className="text-xl font-bold">Geographic Locations Across Philippines</h2>
        {regions.map((region, index) => (
          <div key={index} className="border-b pb-6">
            <GeographicLocationStep
              formData={region}
              updateFormData={() => {}}
              errors={{}}
              required={true}
            />
          </div>
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Showcase of geographic location steps from different regions across the Philippines.',
      },
    },
  },
};

// Partial data scenarios
export const PartialDataScenarios: Story = {
  render: () => {
    const scenarios = [
      {
        title: 'Region Only',
        data: { regionCode: '04', regionName: 'CALABARZON' },
      },
      {
        title: 'Region & Province',
        data: {
          regionCode: '04',
          regionName: 'CALABARZON',
          provinceCode: '0421',
          provinceName: 'Batangas',
        },
      },
      {
        title: 'Up to City/Municipality',
        data: {
          regionCode: '04',
          regionName: 'CALABARZON',
          provinceCode: '0421',
          provinceName: 'Batangas',
          cityMunicipalityCode: '042108',
          cityMunicipalityName: 'Lipa City',
        },
      },
    ];

    global.fetch = mockFetch({
      region: { name: 'CALABARZON' },
      province: { name: 'Batangas' },
      city: { name: 'Lipa City' },
      barangay: { name: 'Barangay 1' },
    });

    return (
      <div className="space-y-8">
        <h2 className="text-xl font-bold">Partial Geographic Data Scenarios</h2>
        {scenarios.map((scenario, index) => (
          <div key={index} className="border-b pb-6">
            <h3 className="mb-4 text-lg font-medium">{scenario.title}</h3>
            <GeographicLocationStep
              formData={scenario.data}
              updateFormData={() => {}}
              errors={{}}
              required={true}
            />
          </div>
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Different scenarios with partial geographic data to show progressive completion.',
      },
    },
  },
};

// Dark mode
export const DarkMode: Story = {
  args: {
    formData: completeGeographicData,
    updateFormData: () => {},
    errors: {},
    required: true,
  },
  render: (args) => {
    global.fetch = mockFetch({
      region: { name: 'CALABARZON' },
      province: { name: 'Batangas' },
      city: { name: 'Lipa City' },
      barangay: { name: 'Barangay 1' },
    });

    return (
      <div className="dark">
        <GeographicLocationStep {...args} />
      </div>
    );
  },
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#1f2937' }],
    },
    docs: {
      description: {
        story: 'Geographic location step in dark mode.',
      },
    },
  },
};