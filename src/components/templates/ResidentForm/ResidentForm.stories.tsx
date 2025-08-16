import type { Meta, StoryObj } from '@storybook/react';
import { ResidentForm } from './ResidentForm';

const mockAction = (name: string) => (data: unknown) => {
  console.log(`${name}:`, data);
};

const meta = {
  title: 'Templates/ResidentForm',
  component: ResidentForm,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A comprehensive resident registration form template that combines personal information and contact information sections. Features dynamic search for PSOC codes, PSGC locations, and households with real-time validation.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onSubmit: {
      description: 'Callback function called when form is successfully submitted',
    },
    onCancel: {
      description: 'Callback function called when user cancels form',
    },
    initialData: {
      control: { type: 'object' },
      description: 'Initial form data to pre-populate the form',
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof ResidentForm>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock API responses
const mockPsocSearch = (query: string) => {
  const psocData = [
    {
      code: '1112',
      title: 'Senior Government Officials',
      hierarchy: 'Managers > Chief Executives, Senior Officials and Legislators > Senior Government Officials',
      level: 'unit_group',
    },
    {
      code: '2142',
      title: 'Civil Engineers',
      hierarchy: 'Professionals > Science and Engineering Professionals > Engineering Professionals > Civil Engineers',
      level: 'occupation',
    },
    {
      code: '2221',
      title: 'Nurses and Midwives',
      hierarchy: 'Professionals > Health Professionals > Nursing and Midwifery Professionals > Nurses and Midwives',
      level: 'occupation',
    },
    {
      code: '2341',
      title: 'Primary School Teachers',
      hierarchy: 'Professionals > Education Professionals > Teaching Professionals > Primary School Teachers',
      level: 'occupation',
    },
    {
      code: '5223',
      title: 'Shop Salespersons',
      hierarchy: 'Service and Sales Workers > Sales Workers > Shop Salespersons',
      level: 'occupation',
    },
  ].filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) || 
    item.code.includes(query)
  );

  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: psocData }),
  });
};

const mockPsgcSearch = (query: string) => {
  const psgcData = [
    {
      code: '042108',
      name: 'Lipa City',
      full_address: 'Lipa City, Batangas, CALABARZON',
      level: 'city',
    },
    {
      code: '137604',
      name: 'Makati City',
      full_address: 'Makati City, Metro Manila, NCR',
      level: 'city',
    },
    {
      code: '072209',
      name: 'Cebu City',
      full_address: 'Cebu City, Cebu, Central Visayas',
      level: 'city',
    },
    {
      code: '112302',
      name: 'Davao City',
      full_address: 'Davao City, Davao del Sur, Davao Region',
      level: 'city',
    },
  ].filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase()) || 
    item.code.includes(query)
  );

  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: psgcData }),
  });
};

// Mock Supabase for household search
const mockSupabase = {
  from: (table: string) => ({
    select: (columns: string) => ({
      eq: (column: string, value: any) => ({
        or: (condition: string) => ({
          order: (column: string, options: any) => ({
            limit: (count: number) => ({
              then: (callback: any) => {
                // Mock household data
                const households = [
                  {
                    code: 'HH-2024-001',
                    name: 'Santos Family',
                    house_number: '123',
                    street_id: null,
                    subdivision_id: null,
                    barangay_code: '042108001',
                    household_head_id: 'R-001',
                    geo_streets: null,
                    geo_subdivisions: null,
                  },
                  {
                    code: 'HH-2024-002',
                    name: 'Cruz Household',
                    house_number: '456',
                    street_id: null,
                    subdivision_id: null,
                    barangay_code: '042108001',
                    household_head_id: 'R-002',
                    geo_streets: null,
                    geo_subdivisions: null,
                  },
                ];
                
                callback({ data: households, error: null });
                return Promise.resolve({ data: households, error: null });
              },
            }),
          }),
        }),
      }),
    }),
  }),
};

// Mock authentication context
const mockAuth = {
  userProfile: {
    barangay_code: '042108001',
    id: 'user-1',
    email: 'admin@barangay.gov.ph',
  },
};

// Mock successful form submission
const mockSuccessfulSubmission = mockAction('Form submitted successfully');

// Mock failed form submission
const mockFailedSubmission = () => {
  throw new Error('Submission failed');
};

// Default empty form
export const Default: Story = {
  args: {
    onSubmit: mockSuccessfulSubmission,
    onCancel: mockAction('Form cancelled'),
  },
  render: (args) => {
    // Mock API calls
    global.fetch = (url) => {
      if (url.includes('/api/psoc/search')) {
        const searchParams = new URLSearchParams(url.split('?')[1]);
        const query = searchParams.get('q') || '';
        return mockPsocSearch(query);
      }
      if (url.includes('/api/psgc/search')) {
        const searchParams = new URLSearchParams(url.split('?')[1]);
        const query = searchParams.get('q') || '';
        return mockPsgcSearch(query);
      }
      return Promise.resolve({ ok: false });
    };

    return <ResidentForm {...args} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Default resident form with empty fields ready for user input.',
      },
    },
  },
};

// Pre-filled form with sample data
export const PreFilledForm: Story = {
  args: {
    onSubmit: mockSuccessfulSubmission,
    onCancel: mockAction('Pre-filled form cancelled'),
    initialData: {
      firstName: 'Juan',
      middleName: 'Cruz',
      lastName: 'Santos',
      sex: 'male',
      civilStatus: 'married',
      citizenship: 'Filipino',
      birthdate: '1985-06-15',
      birthPlaceName: 'Lipa City, Batangas',
      birthPlaceCode: '042108',
      educationAttainment: 'college_graduate',
      isGraduate: true,
      employmentStatus: 'employed',
      psocCode: '2142',
      occupationTitle: 'Civil Engineer',
      email: 'juan.santos@email.com',
      phoneNumber: '043-123-4567',
      mobileNumber: '+63 917 123 4567',
      householdCode: 'HH-2024-001',
    },
  },
  render: (args) => {
    global.fetch = (url) => {
      if (url.includes('/api/psoc/search')) {
        const searchParams = new URLSearchParams(url.split('?')[1]);
        const query = searchParams.get('q') || '';
        return mockPsocSearch(query);
      }
      if (url.includes('/api/psgc/search')) {
        const searchParams = new URLSearchParams(url.split('?')[1]);
        const query = searchParams.get('q') || '';
        return mockPsgcSearch(query);
      }
      return Promise.resolve({ ok: false });
    };

    return <ResidentForm {...args} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Resident form pre-filled with sample data for demonstration.',
      },
    },
  },
};

// Female resident example
export const FemaleResident: Story = {
  args: {
    onSubmit: mockSuccessfulSubmission,
    onCancel: mockAction('Female resident form cancelled'),
    initialData: {
      firstName: 'Maria',
      middleName: 'Reyes',
      lastName: 'Cruz',
      sex: 'female',
      civilStatus: 'single',
      citizenship: 'Filipino',
      birthdate: '1992-03-22',
      birthPlaceName: 'Cebu City, Cebu',
      birthPlaceCode: '072209',
      educationAttainment: 'college_graduate',
      isGraduate: true,
      employmentStatus: 'employed',
      psocCode: '2221',
      occupationTitle: 'Registered Nurse',
      email: 'maria.cruz@hospital.com',
      mobileNumber: '+63 928 987 6543',
      householdCode: 'HH-2024-002',
    },
  },
  render: (args) => {
    global.fetch = (url) => {
      if (url.includes('/api/psoc/search')) {
        return mockPsocSearch('nurse');
      }
      if (url.includes('/api/psgc/search')) {
        return mockPsgcSearch('cebu');
      }
      return Promise.resolve({ ok: false });
    };

    return <ResidentForm {...args} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Female resident registration with healthcare professional data.',
      },
    },
  },
};

// Senior citizen example
export const SeniorCitizen: Story = {
  args: {
    onSubmit: mockSuccessfulSubmission,
    onCancel: mockAction('Senior citizen form cancelled'),
    initialData: {
      firstName: 'Roberto',
      middleName: 'Luna',
      lastName: 'Garcia',
      sex: 'male',
      civilStatus: 'married',
      citizenship: 'Filipino',
      birthdate: '1955-12-10',
      birthPlaceName: 'Manila City, Metro Manila',
      birthPlaceCode: '137604',
      educationAttainment: 'college_graduate',
      isGraduate: true,
      employmentStatus: 'retired',
      psocCode: '1112',
      occupationTitle: 'Former Government Official',
      email: 'roberto.garcia@retired.gov.ph',
      phoneNumber: '02-123-4567',
      mobileNumber: '+63 919 123 4567',
      householdCode: 'HH-2024-003',
    },
  },
  render: (args) => {
    global.fetch = (url) => {
      if (url.includes('/api/psoc/search')) {
        return mockPsocSearch('government');
      }
      if (url.includes('/api/psgc/search')) {
        return mockPsgcSearch('manila');
      }
      return Promise.resolve({ ok: false });
    };

    return <ResidentForm {...args} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Senior citizen resident with retired status and government background.',
      },
    },
  },
};

// Young professional example
export const YoungProfessional: Story = {
  args: {
    onSubmit: mockSuccessfulSubmission,
    onCancel: mockAction('Young professional form cancelled'),
    initialData: {
      firstName: 'Alexandra',
      middleName: 'Marie',
      lastName: 'Torres',
      sex: 'female',
      civilStatus: 'single',
      citizenship: 'Filipino',
      birthdate: '1998-08-14',
      birthPlaceName: 'Davao City, Davao del Sur',
      birthPlaceCode: '112302',
      educationAttainment: 'college_graduate',
      isGraduate: true,
      employmentStatus: 'employed',
      psocCode: '2341',
      occupationTitle: 'Elementary School Teacher',
      email: 'alexandra.torres@school.edu.ph',
      mobileNumber: '+63 945 678 9012',
      householdCode: 'HH-2024-004',
    },
  },
  render: (args) => {
    global.fetch = (url) => {
      if (url.includes('/api/psoc/search')) {
        return mockPsocSearch('teacher');
      }
      if (url.includes('/api/psgc/search')) {
        return mockPsgcSearch('davao');
      }
      return Promise.resolve({ ok: false });
    };

    return <ResidentForm {...args} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Young professional teacher with education sector employment.',
      },
    },
  },
};

// Validation errors demonstration
export const ValidationErrors: Story = {
  args: {
    onSubmit: mockSuccessfulSubmission,
    onCancel: mockAction('Validation form cancelled'),
  },
  render: (args) => {
    global.fetch = () => Promise.resolve({ ok: false });

    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-red-50 p-4">
          <h3 className="font-medium text-red-900">Validation Demo</h3>
          <p className="mt-1 text-sm text-red-700">
            Try submitting the form without filling required fields to see validation errors.
          </p>
        </div>
        <ResidentForm {...args} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Form validation demonstration - submit without required fields to see error messages.',
      },
    },
  },
};

// Loading states demonstration
export const SearchLoadingStates: Story = {
  args: {
    onSubmit: mockSuccessfulSubmission,
    onCancel: mockAction('Search demo cancelled'),
  },
  render: (args) => {
    // Mock slow API responses to show loading states
    global.fetch = (url) => {
      if (url.includes('/api/psoc/search')) {
        return new Promise(resolve =>
          setTimeout(() => resolve(mockPsocSearch('engineer')), 2000)
        );
      }
      if (url.includes('/api/psgc/search')) {
        return new Promise(resolve =>
          setTimeout(() => resolve(mockPsgcSearch('lipa')), 2000)
        );
      }
      return Promise.resolve({ ok: false });
    };

    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-blue-50 p-4">
          <h3 className="font-medium text-blue-900">Search Loading Demo</h3>
          <p className="mt-1 text-sm text-blue-700">
            Try searching in the occupation and birth place fields to see loading states.
          </p>
        </div>
        <ResidentForm {...args} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstration of loading states during search operations.',
      },
    },
  },
};

// API error handling
export const APIErrors: Story = {
  args: {
    onSubmit: mockSuccessfulSubmission,
    onCancel: mockAction('API error form cancelled'),
  },
  render: (args) => {
    // Mock API errors
    global.fetch = () =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-yellow-50 p-4">
          <h3 className="font-medium text-yellow-900">API Error Demo</h3>
          <p className="mt-1 text-sm text-yellow-700">
            Search operations will fail to demonstrate error handling.
          </p>
        </div>
        <ResidentForm {...args} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstration of error handling when API calls fail.',
      },
    },
  },
};

// Submission loading state
export const SubmissionLoading: Story = {
  args: {
    onSubmit: async (data) => {
      mockAction('Form submission started')(data);
      return new Promise(resolve => setTimeout(resolve, 3000));
    },
    onCancel: mockAction('Loading form cancelled'),
    initialData: {
      firstName: 'Test',
      lastName: 'User',
      sex: 'male',
      birthdate: '1990-01-01',
    },
  },
  render: (args) => {
    global.fetch = () => Promise.resolve({ ok: true });

    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-green-50 p-4">
          <h3 className="font-medium text-green-900">Submission Loading Demo</h3>
          <p className="mt-1 text-sm text-green-700">
            Submit the form to see the loading state during submission.
          </p>
        </div>
        <ResidentForm {...args} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstration of loading state during form submission.',
      },
    },
  },
};

// Without cancel button
export const WithoutCancelButton: Story = {
  args: {
    onSubmit: mockSuccessfulSubmission,
    // No onCancel prop - cancel button won't show
  },
  render: (args) => {
    global.fetch = () => Promise.resolve({ ok: true });
    return <ResidentForm {...args} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Resident form without cancel button (when onCancel prop is not provided).',
      },
    },
  },
};

// Mobile responsive view
export const MobileView: Story = {
  args: {
    onSubmit: mockSuccessfulSubmission,
    onCancel: mockAction('Mobile form cancelled'),
    initialData: {
      firstName: 'Mobile',
      lastName: 'User',
      sex: 'female',
      birthdate: '1995-05-15',
    },
  },
  render: (args) => {
    global.fetch = () => Promise.resolve({ ok: true });
    return <ResidentForm {...args} />;
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Resident form optimized for mobile devices.',
      },
    },
  },
};

// Dark mode
export const DarkMode: Story = {
  args: {
    onSubmit: mockSuccessfulSubmission,
    onCancel: mockAction('Dark mode form cancelled'),
    initialData: {
      firstName: 'Dark',
      middleName: 'Mode',
      lastName: 'User',
      sex: 'male',
      civilStatus: 'single',
      birthdate: '1988-07-20',
    },
  },
  render: (args) => {
    global.fetch = () => Promise.resolve({ ok: true });

    return (
      <div className="dark min-h-screen bg-gray-900">
        <ResidentForm {...args} />
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
        story: 'Resident form in dark mode.',
      },
    },
  },
};