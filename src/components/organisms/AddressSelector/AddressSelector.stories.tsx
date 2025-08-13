import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import AddressSelector, { type AddressSelection } from './AddressSelector';

const meta = {
  title: 'Organisms/AddressSelector',
  component: AddressSelector,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'AddressSelector provides hierarchical Philippine address selection with cascading dropdowns. Features complete Region → Province → City/Municipality → Barangay selection flow with PSGC (Philippine Standard Geographic Code) integration. Handles special cases like NCR independent cities and validates geographic relationships. Ideal for Philippine government systems requiring structured address input.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: { type: 'boolean' },
      description: 'Disable all address selection fields',
    },
    required: {
      control: { type: 'boolean' },
      description: 'Mark address selection as required',
    },
    showLabels: {
      control: { type: 'boolean' },
      description: 'Show labels for each selection field',
    },
    compact: {
      control: { type: 'boolean' },
      description: 'Use compact grid layout instead of vertical stacking',
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes to apply to the component',
    },
  },
} satisfies Meta<typeof AddressSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data for realistic Philippine geographic structure
const mockRegions = [
  { code: '01', name: 'Ilocos Region (Region I)' },
  { code: '02', name: 'Cagayan Valley (Region II)' },
  { code: '03', name: 'Central Luzon (Region III)' },
  { code: '04', name: 'CALABARZON (Region IV-A)' },
  { code: '05', name: 'Bicol Region (Region V)' },
  { code: '06', name: 'Western Visayas (Region VI)' },
  { code: '07', name: 'Central Visayas (Region VII)' },
  { code: '08', name: 'Eastern Visayas (Region VIII)' },
  { code: '09', name: 'Zamboanga Peninsula (Region IX)' },
  { code: '10', name: 'Northern Mindanao (Region X)' },
  { code: '11', name: 'Davao Region (Region XI)' },
  { code: '12', name: 'SOCCSKSARGEN (Region XII)' },
  { code: '13', name: 'National Capital Region (NCR)' },
  { code: 'CAR', name: 'Cordillera Administrative Region (CAR)' },
  { code: 'ARMM', name: 'Autonomous Region in Muslim Mindanao (ARMM)' },
  { code: 'CARAGA', name: 'Caraga Region (Region XIII)' },
  { code: 'BARMM', name: 'Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)' },
];

const mockProvincesByRegion: Record<string, Array<{ code: string; name: string }>> = {
  '13': [], // NCR has no provinces
  '03': [
    { code: '0308', name: 'Bataan' },
    { code: '0314', name: 'Bulacan' },
    { code: '0349', name: 'Nueva Ecija' },
    { code: '0354', name: 'Pampanga' },
    { code: '0369', name: 'Tarlac' },
    { code: '0371', name: 'Zambales' },
    { code: '0377', name: 'Aurora' },
  ],
  '04': [
    { code: '0410', name: 'Batangas' },
    { code: '0421', name: 'Cavite' },
    { code: '0434', name: 'Laguna' },
    { code: '0458', name: 'Quezon' },
    { code: '0471', name: 'Rizal' },
  ],
  '07': [
    { code: '0712', name: 'Bohol' },
    { code: '0722', name: 'Cebu' },
    { code: '0746', name: 'Negros Oriental' },
    { code: '0761', name: 'Siquijor' },
  ],
};

const mockCitiesByProvince: Record<string, Array<{ code: string; name: string; type: string }>> = {
  // NCR Independent Cities
  '13': [
    { code: '137401000', name: 'Manila', type: 'Highly Urbanized City' },
    { code: '137404000', name: 'Quezon City', type: 'Highly Urbanized City' },
    { code: '137402000', name: 'Makati', type: 'Highly Urbanized City' },
    { code: '137403000', name: 'Pasig', type: 'Highly Urbanized City' },
    { code: '137405000', name: 'Taguig', type: 'Highly Urbanized City' },
  ],
  '0354': [
    // Pampanga
    { code: '035415000', name: 'Angeles', type: 'Highly Urbanized City' },
    { code: '035417000', name: 'San Fernando', type: 'Component City' },
    { code: '035401000', name: 'Apalit', type: 'Municipality' },
    { code: '035402000', name: 'Arayat', type: 'Municipality' },
    { code: '035403000', name: 'Bacolor', type: 'Municipality' },
  ],
  '0434': [
    // Laguna
    { code: '043404000', name: 'Biñan', type: 'Component City' },
    { code: '043405000', name: 'Cabuyao', type: 'Component City' },
    { code: '043406000', name: 'Calamba', type: 'Component City' },
    { code: '043407000', name: 'San Pedro', type: 'Component City' },
    { code: '043408000', name: 'Santa Rosa', type: 'Component City' },
  ],
  '0722': [
    // Cebu
    { code: '072209000', name: 'Cebu City', type: 'Highly Urbanized City' },
    { code: '072210000', name: 'Mandaue', type: 'Highly Urbanized City' },
    { code: '072211000', name: 'Lapu-Lapu', type: 'Highly Urbanized City' },
    { code: '072201000', name: 'Alcantara', type: 'Municipality' },
    { code: '072202000', name: 'Alcoy', type: 'Municipality' },
  ],
};

const mockBarangaysByCity: Record<string, Array<{ code: string; name: string }>> = {
  '137404000': [
    // Quezon City
    { code: '137404001', name: 'Alicia' },
    { code: '137404002', name: 'Bagong Pag-asa' },
    { code: '137404003', name: 'Bahay Toro' },
    { code: '137404004', name: 'Barangay Holy Spirit' },
    { code: '137404005', name: 'Botocan' },
  ],
  '043404000': [
    // Biñan City
    { code: '043404001', name: 'Biñan' },
    { code: '043404002', name: 'Bungahan' },
    { code: '043404003', name: 'Canlalay' },
    { code: '043404004', name: 'Casile' },
    { code: '043404005', name: 'De La Paz' },
  ],
  '072209000': [
    // Cebu City
    { code: '072209001', name: 'Adlaon' },
    { code: '072209002', name: 'Agsungot' },
    { code: '072209003', name: 'Apas' },
    { code: '072209004', name: 'Bacayan' },
    { code: '072209005', name: 'Banilad' },
  ],
};

// Mock API functions with realistic delays and error simulation
const mockGetRegions = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockRegions;
};

const mockGetProvincesByRegion = async (regionCode: string) => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return mockProvincesByRegion[regionCode] || [];
};

const mockGetCitiesByProvince = async (provinceCode: string) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockCitiesByProvince[provinceCode] || [];
};

const mockGetMetroManilaCities = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockCitiesByProvince['13'] || [];
};

const mockGetBarangaysByCity = async (cityCode: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockBarangaysByCity[cityCode] || [];
};

export const Default: Story = {
  render: args => {
    const [address, setAddress] = useState<AddressSelection>({
      region: '',
      province: '',
      city: '',
      barangay: '',
    });

    return (
      <div className="w-full max-w-4xl space-y-4">
        <AddressSelector {...args} value={address} onChange={setAddress} />

        {/* Address Summary */}
        {(address.region || address.province || address.city || address.barangay) && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <h4 className="mb-2 text-sm font-medium text-green-800">Current Selection:</h4>
            <div className="space-y-1 text-sm text-green-700">
              <div>
                <strong>Region:</strong> {address.region || 'Not selected'}
              </div>
              <div>
                <strong>Province:</strong> {address.province || 'Not selected'}
              </div>
              <div>
                <strong>City/Municipality:</strong> {address.city || 'Not selected'}
              </div>
              <div>
                <strong>Barangay:</strong> {address.barangay || 'Not selected'}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
  args: {
    showLabels: true,
    disabled: false,
    required: false,
    compact: false,
  },
};

export const BasicSelection: Story = {
  render: () => {
    const [address, setAddress] = useState<AddressSelection>({
      region: '',
      province: '',
      city: '',
      barangay: '',
    });

    return (
      <div className="w-full max-w-4xl space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">Select Your Address</h3>
          <p className="text-sm text-gray-600">
            Choose your location following the Philippine administrative hierarchy
          </p>
        </div>

        <AddressSelector value={address} onChange={setAddress} showLabels={true} />
      </div>
    );
  },
};

export const CompactLayout: Story = {
  render: () => {
    const [address, setAddress] = useState<AddressSelection>({
      region: '',
      province: '',
      city: '',
      barangay: '',
    });

    return (
      <div className="w-full max-w-4xl space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">Compact Address Selection</h3>
          <p className="text-sm text-gray-600">Grid layout for space-efficient address input</p>
        </div>

        <AddressSelector value={address} onChange={setAddress} showLabels={true} compact={true} />
      </div>
    );
  },
};

export const NCRDemo: Story = {
  render: () => {
    const [address, setAddress] = useState<AddressSelection>({
      region: '13', // Pre-select NCR
      province: '',
      city: '',
      barangay: '',
    });

    return (
      <div className="w-full max-w-4xl space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">National Capital Region (NCR) Demo</h3>
          <p className="text-sm text-gray-600">
            NCR has independent cities without provinces. Notice how the province field is handled.
          </p>
        </div>

        <AddressSelector value={address} onChange={setAddress} showLabels={true} />

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h4 className="mb-2 text-sm font-medium text-blue-800">NCR Special Handling:</h4>
          <ul className="space-y-1 text-sm text-blue-700">
            <li>• Independent cities (Manila, Quezon City, Makati, etc.)</li>
            <li>• No provincial-level government structure</li>
            <li>• Direct Region → City → Barangay hierarchy</li>
            <li>• Component automatically detects and adapts to NCR structure</li>
          </ul>
        </div>
      </div>
    );
  },
};

export const WithPreselectedValues: Story = {
  render: () => {
    const [address, setAddress] = useState<AddressSelection>({
      region: '04', // CALABARZON
      province: '0434', // Laguna
      city: '',
      barangay: '',
    });

    return (
      <div className="w-full max-w-4xl space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">Pre-selected Address</h3>
          <p className="text-sm text-gray-600">
            Demonstrates loading with pre-selected region and province (CALABARZON → Laguna)
          </p>
        </div>

        <AddressSelector value={address} onChange={setAddress} showLabels={true} />

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> When region and province are pre-selected, the component
            automatically loads the available cities. Select a city to load barangays.
          </p>
        </div>
      </div>
    );
  },
};

export const ErrorHandling: Story = {
  render: () => {
    const [address, setAddress] = useState<AddressSelection>({
      region: '',
      province: '',
      city: '',
      barangay: '',
    });

    // Mock error simulation
    const [simulateError, setSimulateError] = useState(false);

    return (
      <div className="w-full max-w-4xl space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">Error Handling Demo</h3>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={simulateError}
                onChange={e => setSimulateError(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-600">Simulate network errors</span>
            </label>
          </div>
        </div>

        <AddressSelector value={address} onChange={setAddress} showLabels={true} />

        {simulateError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <h4 className="mb-2 text-sm font-medium text-red-800">Error Simulation Active</h4>
            <p className="text-sm text-red-700">
              API calls will fail to demonstrate error handling. Try selecting different regions to
              see how the component handles network failures gracefully.
            </p>
          </div>
        )}
      </div>
    );
  },
};

export const LoadingStates: Story = {
  render: () => {
    const [address, setAddress] = useState<AddressSelection>({
      region: '',
      province: '',
      city: '',
      barangay: '',
    });

    const [slowMode, setSlowMode] = useState(true);

    return (
      <div className="w-full max-w-4xl space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">Loading States Demo</h3>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={slowMode}
                onChange={e => setSlowMode(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-600">Slow network simulation (2s delay)</span>
            </label>
          </div>
          <p className="text-sm text-gray-600">
            Watch the loading indicators appear as you make selections
          </p>
        </div>

        <AddressSelector value={address} onChange={setAddress} showLabels={true} />

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h4 className="mb-2 text-sm font-medium text-blue-800">Loading Behavior:</h4>
          <ul className="space-y-1 text-sm text-blue-700">
            <li>• Each dropdown shows loading spinner during API calls</li>
            <li>• Dependent dropdowns are disabled until parent selection loads</li>
            <li>• Cascade resets clear child selections appropriately</li>
            <li>• Error states preserve user selections when possible</li>
          </ul>
        </div>
      </div>
    );
  },
};

export const DisabledState: Story = {
  render: () => {
    const [address, setAddress] = useState<AddressSelection>({
      region: '07', // Central Visayas
      province: '0722', // Cebu
      city: '072209000', // Cebu City
      barangay: '072209001', // Adlaon
    });

    return (
      <div className="w-full max-w-4xl space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">Disabled State</h3>
          <p className="text-sm text-gray-600">
            All address fields are disabled but still display current values
          </p>
        </div>

        <AddressSelector value={address} onChange={setAddress} showLabels={true} disabled={true} />

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm text-gray-600">
            <strong>Use case:</strong> Display address information in read-only mode, such as when
            viewing submitted forms or during form processing.
          </p>
        </div>
      </div>
    );
  },
};

export const FormIntegration: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      businessName: '',
      address: {
        region: '',
        province: '',
        city: '',
        barangay: '',
      } as AddressSelection,
      businessType: '',
      contactNumber: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateAddress = (address: AddressSelection) => {
      const addressErrors: string[] = [];
      if (!address.region) addressErrors.push('Region is required');
      if (!address.city) addressErrors.push('City/Municipality is required');
      if (!address.barangay) addressErrors.push('Barangay is required');
      // Province is optional for NCR
      if (address.region && address.region !== '13' && !address.province) {
        addressErrors.push('Province is required');
      }
      return addressErrors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      const newErrors: Record<string, string> = {};

      // Validate fields
      if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
      if (!formData.businessType) newErrors.businessType = 'Business type is required';
      if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';

      // Validate address
      const addressErrors = validateAddress(formData.address);
      if (addressErrors.length > 0) {
        newErrors.address = addressErrors.join(', ');
      }

      setErrors(newErrors);

      if (Object.keys(newErrors).length === 0) {
        setIsSubmitting(true);
        // Simulate API submission
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsSubmitting(false);
        alert(
          `Business Registration Submitted!\n\nBusiness: ${formData.businessName}\nAddress: Complete Philippine address selected\nType: ${formData.businessType}\nContact: ${formData.contactNumber}`
        );
      }
    };

    return (
      <form onSubmit={handleSubmit} className="w-full max-w-4xl space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">Business Registration Form</h2>
          <p className="text-sm text-gray-600">
            Register your business with complete Philippine address details
          </p>
        </div>

        {/* Business Name */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Business Name *</label>
          <input
            type="text"
            value={formData.businessName}
            onChange={e => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
            className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.businessName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your business name"
          />
          {errors.businessName && (
            <p className="mt-1 text-xs text-red-600">{errors.businessName}</p>
          )}
        </div>

        {/* Address Selection */}
        <div>
          <label className="mb-3 block text-sm font-medium text-gray-700">Business Address *</label>
          <AddressSelector
            value={formData.address}
            onChange={address => {
              setFormData(prev => ({ ...prev, address }));
              if (errors.address) {
                setErrors(prev => ({ ...prev, address: '' }));
              }
            }}
            showLabels={true}
          />
          {errors.address && <p className="mt-2 text-xs text-red-600">{errors.address}</p>}
        </div>

        {/* Business Type */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Business Type *</label>
          <select
            value={formData.businessType}
            onChange={e => setFormData(prev => ({ ...prev, businessType: e.target.value }))}
            className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.businessType ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select business type</option>
            <option value="retail">Retail Store</option>
            <option value="restaurant">Restaurant/Food Service</option>
            <option value="service">Service Business</option>
            <option value="manufacturing">Manufacturing</option>
            <option value="technology">Technology/IT</option>
            <option value="other">Other</option>
          </select>
          {errors.businessType && (
            <p className="mt-1 text-xs text-red-600">{errors.businessType}</p>
          )}
        </div>

        {/* Contact Number */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Contact Number *</label>
          <input
            type="tel"
            value={formData.contactNumber}
            onChange={e => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
            className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.contactNumber ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="+63 912 345 6789"
          />
          {errors.contactNumber && (
            <p className="mt-1 text-xs text-red-600">{errors.contactNumber}</p>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex flex-1 items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Submitting Registration...
              </>
            ) : (
              'Submit Business Registration'
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData({
                businessName: '',
                address: { region: '', province: '', city: '', barangay: '' },
                businessType: '',
                contactNumber: '',
              });
              setErrors({});
            }}
            className="rounded-md border border-gray-300 px-6 py-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Reset Form
          </button>
        </div>
      </form>
    );
  },
};

export const ValidationDemo: Story = {
  render: () => {
    const [address, setAddress] = useState<AddressSelection>({
      region: '',
      province: '',
      city: '',
      barangay: '',
    });

    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    const validateSelection = (selection: AddressSelection) => {
      const errors: string[] = [];

      if (!selection.region) {
        errors.push('Region must be selected');
      }

      if (selection.region && selection.region !== '13' && !selection.province) {
        errors.push('Province is required for non-NCR regions');
      }

      if (!selection.city) {
        errors.push('City/Municipality must be selected');
      }

      if (!selection.barangay) {
        errors.push('Barangay must be selected for complete address');
      }

      setValidationErrors(errors);
    };

    const handleAddressChange = (newAddress: AddressSelection) => {
      setAddress(newAddress);
      validateSelection(newAddress);
    };

    return (
      <div className="w-full max-w-4xl space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">Address Validation Demo</h3>
          <p className="text-sm text-gray-600">
            Real-time validation shows requirements for complete Philippine address
          </p>
        </div>

        <AddressSelector
          value={address}
          onChange={handleAddressChange}
          showLabels={true}
          required={true}
        />

        {/* Validation Results */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Errors */}
          {validationErrors.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <h4 className="mb-2 text-sm font-medium text-red-800">Validation Errors</h4>
              <ul className="space-y-1 text-sm text-red-700">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Success */}
          {validationErrors.length === 0 && address.barangay && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h4 className="mb-2 text-sm font-medium text-green-800">✓ Complete Address</h4>
              <p className="text-sm text-green-700">
                All required address components have been selected according to Philippine
                administrative structure.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h4 className="mb-2 text-sm font-medium text-blue-800">Validation Rules:</h4>
          <ul className="space-y-1 text-sm text-blue-700">
            <li>• Region is always required</li>
            <li>• Province is required except for NCR (independent cities)</li>
            <li>• City/Municipality is required for all locations</li>
            <li>• Barangay is required for complete address validation</li>
            <li>• Selection hierarchy must follow Region → Province → City → Barangay</li>
          </ul>
        </div>
      </div>
    );
  },
};

export const AccessibilityDemo: Story = {
  render: () => {
    const [address, setAddress] = useState<AddressSelection>({
      region: '',
      province: '',
      city: '',
      barangay: '',
    });

    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="mb-2 text-lg font-semibold text-blue-800">Accessibility Features</h3>
          <div className="grid grid-cols-1 gap-4 text-sm text-blue-700 md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-medium">Keyboard Navigation:</h4>
              <ul className="space-y-1">
                <li>
                  • <kbd className="rounded bg-blue-100 px-1 py-0.5">Tab</kbd> to navigate between
                  dropdowns
                </li>
                <li>
                  • <kbd className="rounded bg-blue-100 px-1 py-0.5">Space</kbd>/
                  <kbd className="rounded bg-blue-100 px-1 py-0.5">Enter</kbd> to open dropdowns
                </li>
                <li>
                  • <kbd className="rounded bg-blue-100 px-1 py-0.5">↑</kbd>
                  <kbd className="rounded bg-blue-100 px-1 py-0.5">↓</kbd> to navigate options
                </li>
                <li>
                  • <kbd className="rounded bg-blue-100 px-1 py-0.5">Enter</kbd> to select options
                </li>
                <li>
                  • <kbd className="rounded bg-blue-100 px-1 py-0.5">Esc</kbd> to close dropdowns
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-medium">Screen Reader Support:</h4>
              <ul className="space-y-1">
                <li>• Proper ARIA labels and roles</li>
                <li>• Loading state announcements</li>
                <li>• Error message association</li>
                <li>• Required field indicators</li>
                <li>• Selection change announcements</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="w-full max-w-4xl">
          <AddressSelector
            value={address}
            onChange={setAddress}
            showLabels={true}
            required={true}
          />
        </div>

        <div className="rounded border border-green-200 bg-green-50 p-3">
          <p className="text-sm text-green-800">
            <strong>WCAG Compliance:</strong> This component follows Web Content Accessibility
            Guidelines (WCAG) 2.1 AA standards, making it suitable for Philippine government systems
            that require accessibility compliance.
          </p>
        </div>
      </div>
    );
  },
};
