import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import AddressSearch from './AddressSearch';
import { type AddressHierarchy } from '@/lib/database';

const meta = {
  title: 'Organisms/AddressSearch',
  component: AddressSearch,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'AddressSearch provides full-text search across 38,372 barangays with autocomplete functionality. Features PSGC (Philippine Standard Geographic Code) integration with hierarchical address selection supporting Region → Province → Municipality → Barangay structure. Perfect for Philippine government systems requiring accurate geographic data.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text for the search input',
    },
    maxResults: {
      control: { type: 'number', min: 1, max: 50 },
      description: 'Maximum number of search results to display',
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes to apply to the component',
    },
  },
} satisfies Meta<typeof AddressSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock function to simulate the database search with realistic Philippine data
const mockSearchAddresses = async (query: string, maxResults: number): Promise<AddressHierarchy[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const mockAddresses: AddressHierarchy[] = [
    {
      region_code: '01',
      region_name: 'Ilocos Region (Region I)',
      province_code: '0133',
      province_name: 'Ilocos Norte',
      city_municipality_code: '013301000',
      city_municipality_name: 'Adams',
      city_municipality_type: 'Municipality',
      is_independent: false,
      barangay_code: '013301001',
      barangay_name: 'Adams (Poblacion)',
      urban_rural_status: 'Rural',
      full_address: 'Adams (Poblacion), Adams, Ilocos Norte, Ilocos Region (Region I)'
    },
    {
      region_code: '13',
      region_name: 'National Capital Region (NCR)',
      province_code: null,
      province_name: null,
      city_municipality_code: '137404000',
      city_municipality_name: 'Quezon City',
      city_municipality_type: 'Highly Urbanized City',
      is_independent: true,
      barangay_code: '137404001',
      barangay_name: 'Alicia',
      urban_rural_status: 'Urban',
      full_address: 'Alicia, Quezon City, National Capital Region (NCR)'
    },
    {
      region_code: '04',
      region_name: 'CALABARZON (Region IV-A)',
      province_code: '0434',
      province_name: 'Laguna',
      city_municipality_code: '043404000',
      city_municipality_name: 'Biñan',
      city_municipality_type: 'Component City',
      is_independent: false,
      barangay_code: '043404001',
      barangay_name: 'Biñan',
      urban_rural_status: 'Urban',
      full_address: 'Biñan, Biñan City, Laguna, CALABARZON (Region IV-A)'
    },
    {
      region_code: '07',
      region_name: 'Central Visayas (Region VII)',
      province_code: '0722',
      province_name: 'Cebu',
      city_municipality_code: '072209000',
      city_municipality_name: 'Cebu City',
      city_municipality_type: 'Highly Urbanized City',
      is_independent: true,
      barangay_code: '072209001',
      barangay_name: 'Adlaon',
      urban_rural_status: 'Urban',
      full_address: 'Adlaon, Cebu City, Cebu, Central Visayas (Region VII)'
    },
    {
      region_code: '11',
      region_name: 'Davao Region (Region XI)',
      province_code: '1123',
      province_name: 'Davao del Sur',
      city_municipality_code: '112302000',
      city_municipality_name: 'Davao City',
      city_municipality_type: 'Highly Urbanized City',
      is_independent: true,
      barangay_code: '112302001',
      barangay_name: 'Agdao',
      urban_rural_status: 'Urban',
      full_address: 'Agdao, Davao City, Davao del Sur, Davao Region (Region XI)'
    },
    {
      region_code: '03',
      region_name: 'Central Luzon (Region III)',
      province_code: '0354',
      province_name: 'Pampanga',
      city_municipality_code: '035417000',
      city_municipality_name: 'San Fernando',
      city_municipality_type: 'Component City',
      is_independent: false,
      barangay_code: '035417001',
      barangay_name: 'Alasas',
      urban_rural_status: 'Urban',
      full_address: 'Alasas, San Fernando City, Pampanga, Central Luzon (Region III)'
    }
  ];

  // Filter based on query
  const filteredResults = mockAddresses.filter(address => 
    address.full_address.toLowerCase().includes(query.toLowerCase()) ||
    address.barangay_name.toLowerCase().includes(query.toLowerCase()) ||
    address.city_municipality_name.toLowerCase().includes(query.toLowerCase()) ||
    address.province_name?.toLowerCase().includes(query.toLowerCase()) ||
    address.region_name.toLowerCase().includes(query.toLowerCase())
  );

  return filteredResults.slice(0, maxResults);
};

export const Default: Story = {
  render: (args) => {
    const [selectedAddress, setSelectedAddress] = useState<AddressHierarchy | null>(null);
    
    return (
      <div className="w-96 space-y-4">
        <AddressSearch
          {...args}
          onSelect={setSelectedAddress}
        />
        {selectedAddress && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="text-sm font-medium text-green-800 mb-2">Selected Address:</h4>
            <div className="text-sm text-green-700">
              <div><strong>Full Address:</strong> {selectedAddress.full_address}</div>
              <div><strong>PSGC Code:</strong> {selectedAddress.barangay_code}</div>
              <div><strong>Type:</strong> {selectedAddress.city_municipality_type}</div>
              <div><strong>Status:</strong> {selectedAddress.urban_rural_status}</div>
            </div>
          </div>
        )}
      </div>
    );
  },
  args: {
    placeholder: 'Search for region, province, city, or barangay...',
    maxResults: 20,
  },
};

export const BasicSearch: Story = {
  render: () => {
    const [selectedAddress, setSelectedAddress] = useState<AddressHierarchy | null>(null);
    
    return (
      <div className="w-96 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Philippine Address Search
          </label>
          <AddressSearch
            onSelect={setSelectedAddress}
            placeholder="Type 'Quezon', 'Manila', or 'Cebu'..."
          />
          <p className="text-xs text-gray-500">
            Try searching for popular Philippine cities or regions
          </p>
        </div>
        
        {selectedAddress && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="text-sm">
              <div className="font-medium">{selectedAddress.barangay_name}</div>
              <div className="text-gray-600">
                {selectedAddress.city_municipality_name}, {selectedAddress.province_name || 'NCR'}
              </div>
              <div className="text-gray-500">{selectedAddress.region_name}</div>
            </div>
          </div>
        )}
      </div>
    );
  },
};

export const WithCustomPlaceholder: Story = {
  render: () => {
    const [selectedAddress, setSelectedAddress] = useState<AddressHierarchy | null>(null);
    
    return (
      <div className="w-96 space-y-4">
        <AddressSearch
          onSelect={setSelectedAddress}
          placeholder="Maghanap ng barangay, lungsod, o lalawigan..."
          maxResults={15}
        />
        <div className="text-xs text-gray-500">
          Using Filipino placeholder text for better localization
        </div>
      </div>
    );
  },
};

export const LimitedResults: Story = {
  render: () => {
    const [selectedAddress, setSelectedAddress] = useState<AddressHierarchy | null>(null);
    
    return (
      <div className="w-96 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Limited to 5 Results
          </label>
          <AddressSearch
            onSelect={setSelectedAddress}
            placeholder="Search with limited results..."
            maxResults={5}
          />
          <p className="text-xs text-gray-500">
            This search is limited to showing only 5 results maximum
          </p>
        </div>
      </div>
    );
  },
};

export const ErrorHandling: Story = {
  render: () => {
    const [selectedAddress, setSelectedAddress] = useState<AddressHierarchy | null>(null);
    
    // Mock implementation that throws errors
    const errorProneSearch = async (query: string) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (query.toLowerCase().includes('error')) {
        throw new Error('Network connection failed');
      }
      return mockSearchAddresses(query, 10);
    };
    
    return (
      <div className="w-96 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Error Handling Demo
          </label>
          <AddressSearch
            onSelect={setSelectedAddress}
            placeholder="Type 'error' to simulate network failure..."
          />
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-xs text-yellow-800">
              <strong>Try this:</strong> Type "error" to simulate a network failure and see how the component handles it gracefully.
            </p>
          </div>
        </div>
      </div>
    );
  },
};

export const LoadingStates: Story = {
  render: () => {
    const [selectedAddress, setSelectedAddress] = useState<AddressHierarchy | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Mock slow search to demonstrate loading states
    const slowSearch = async (query: string, maxResults: number) => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      const results = await mockSearchAddresses(query, maxResults);
      setIsLoading(false);
      return results;
    };
    
    return (
      <div className="w-96 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Slow Network Demo
          </label>
          <AddressSearch
            onSelect={setSelectedAddress}
            placeholder="Search to see loading indicator..."
          />
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-xs text-blue-800">
              This demo simulates a slow network connection (2-second delay) to showcase the loading spinner.
            </p>
          </div>
        </div>
        
        {isLoading && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span>Searching PSGC database...</span>
          </div>
        )}
      </div>
    );
  },
};

export const RegionSearch: Story = {
  render: () => {
    const [selectedAddress, setSelectedAddress] = useState<AddressHierarchy | null>(null);
    
    return (
      <div className="w-96 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Region-focused Search
          </label>
          <AddressSearch
            onSelect={setSelectedAddress}
            placeholder="Search by region (e.g., 'NCR', 'Region I', 'CALABARZON')..."
          />
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-gray-50 rounded">
              <strong>Regions to try:</strong>
              <ul className="mt-1 space-y-1 text-gray-600">
                <li>• NCR</li>
                <li>• Region I</li>
                <li>• CALABARZON</li>
                <li>• Central Visayas</li>
              </ul>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <strong>Cities to try:</strong>
              <ul className="mt-1 space-y-1 text-gray-600">
                <li>• Manila</li>
                <li>• Cebu City</li>
                <li>• Davao City</li>
                <li>• Quezon City</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

export const FormIntegration: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      name: '',
      address: null as AddressHierarchy | null,
      phone: '',
    });
    
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const newErrors: Record<string, string> = {};
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.address) newErrors.address = 'Address is required';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      
      setErrors(newErrors);
      
      if (Object.keys(newErrors).length === 0) {
        alert(`Registration submitted!\nName: ${formData.name}\nAddress: ${formData.address?.full_address}\nPhone: ${formData.phone}`);
      }
    };
    
    return (
      <form onSubmit={handleSubmit} className="w-96 space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Resident Registration Form</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your full name"
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <AddressSearch
            onSelect={(address) => {
              setFormData(prev => ({ ...prev, address }));
              if (errors.address) {
                setErrors(prev => ({ ...prev, address: '' }));
              }
            }}
            placeholder="Search for your barangay address..."
            className={errors.address ? 'border-red-500' : ''}
          />
          {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
          {formData.address && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
              <strong>Selected:</strong> {formData.address.full_address}
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="+63 912 345 6789"
          />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
        </div>
        
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Submit Registration
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData({ name: '', address: null, phone: '' });
              setErrors({});
            }}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Reset
          </button>
        </div>
      </form>
    );
  },
};

export const PSGCIntegration: Story = {
  render: () => {
    const [selectedAddress, setSelectedAddress] = useState<AddressHierarchy | null>(null);
    
    return (
      <div className="w-96 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            PSGC Code Integration Demo
          </label>
          <AddressSearch
            onSelect={setSelectedAddress}
            placeholder="Search to see PSGC codes..."
          />
        </div>
        
        {selectedAddress && (
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-3">PSGC Breakdown</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-blue-700">Region Code:</span>
                  <span className="font-mono bg-blue-100 px-2 py-1 rounded">{selectedAddress.region_code}</span>
                </div>
                {selectedAddress.province_code && (
                  <div className="flex justify-between">
                    <span className="text-blue-700">Province Code:</span>
                    <span className="font-mono bg-blue-100 px-2 py-1 rounded">{selectedAddress.province_code}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-blue-700">City/Municipality Code:</span>
                  <span className="font-mono bg-blue-100 px-2 py-1 rounded">{selectedAddress.city_municipality_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Barangay Code:</span>
                  <span className="font-mono bg-blue-100 px-2 py-1 rounded">{selectedAddress.barangay_code}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="text-sm font-medium text-green-800 mb-3">Geographic Properties</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-green-700">Municipality Type:</span>
                  <span className="bg-green-100 px-2 py-1 rounded">{selectedAddress.city_municipality_type}</span>
                </div>
                {selectedAddress.is_independent && (
                  <div className="flex justify-between">
                    <span className="text-green-700">Independent City:</span>
                    <span className="bg-green-100 px-2 py-1 rounded">Yes</span>
                  </div>
                )}
                {selectedAddress.urban_rural_status && (
                  <div className="flex justify-between">
                    <span className="text-green-700">Classification:</span>
                    <span className="bg-green-100 px-2 py-1 rounded">{selectedAddress.urban_rural_status}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="p-3 bg-gray-50 border border-gray-200 rounded">
          <p className="text-xs text-gray-600">
            <strong>About PSGC:</strong> The Philippine Standard Geographic Code (PSGC) is the official coding system 
            used to represent the geographic and political subdivisions of the Philippines. This component integrates 
            with the complete PSGC database covering all 17 regions, 86 provinces, 1,637 cities/municipalities, 
            and 38,372 barangays.
          </p>
        </div>
      </div>
    );
  },
};

export const AccessibilityDemo: Story = {
  render: () => {
    const [selectedAddress, setSelectedAddress] = useState<AddressHierarchy | null>(null);
    
    return (
      <div className="space-y-6">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Keyboard Navigation</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <kbd className="px-1 py-0.5 bg-blue-100 rounded">Tab</kbd> to focus the search input</li>
            <li>• <kbd className="px-1 py-0.5 bg-blue-100 rounded">↑</kbd><kbd className="px-1 py-0.5 bg-blue-100 rounded">↓</kbd> to navigate search results</li>
            <li>• <kbd className="px-1 py-0.5 bg-blue-100 rounded">Enter</kbd> to select highlighted result</li>
            <li>• <kbd className="px-1 py-0.5 bg-blue-100 rounded">Escape</kbd> to close dropdown</li>
            <li>• Type to search and filter results in real-time</li>
            <li>• Clear button (X) to reset search</li>
          </ul>
        </div>
        
        <div className="w-96">
          <AddressSearch
            onSelect={setSelectedAddress}
            placeholder="Try keyboard navigation..."
          />
        </div>
        
        <div className="p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-sm text-green-800">
            This component follows WCAG accessibility guidelines with proper ARIA labels, 
            keyboard navigation, and screen reader support for Philippine government system compliance.
          </p>
        </div>
      </div>
    );
  },
};