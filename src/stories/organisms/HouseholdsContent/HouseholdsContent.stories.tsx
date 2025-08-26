import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import HouseholdsContent from '@/components/organisms/HouseholdsContent';

const meta = {
  title: 'Organisms/HouseholdsContent',
  component: HouseholdsContent,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A comprehensive household management component that displays household data in a searchable table format. Includes pagination, search functionality, and action buttons for viewing and editing household details.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div className="min-h-screen bg-gray-50 p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HouseholdsContent>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock households data for stories
const mockHouseholds = [
  {
    code: 'HH-2024-001',
    name: 'Santos Family',
    house_number: '123',
    street_name: 'Rizal Street',
    subdivision: 'Green Valley Subdivision',
    barangay_code: '042108001',
    region_code: '04',
    province_code: '0421',
    city_municipality_code: '042108',
    created_at: '2024-01-15T08:30:00Z',
    head_resident: {
      id: '1',
      first_name: 'Juan',
      middle_name: 'Cruz',
      last_name: 'Santos',
    },
    member_count: 5,
    region_info: { code: '04', name: 'CALABARZON' },
    province_info: { code: '0421', name: 'Batangas' },
    city_municipality_info: { code: '042108', name: 'Lipa City', type: 'City' },
    barangay_info: { code: '042108001', name: 'Barangay 1' },
  },
  {
    code: 'HH-2024-002',
    name: 'Reyes Family',
    house_number: '456',
    street_name: 'Bonifacio Avenue',
    barangay_code: '042108002',
    region_code: '04',
    province_code: '0421',
    city_municipality_code: '042108',
    created_at: '2024-01-20T14:15:00Z',
    head_resident: {
      id: '2',
      first_name: 'Maria',
      last_name: 'Reyes',
    },
    member_count: 3,
    region_info: { code: '04', name: 'CALABARZON' },
    province_info: { code: '0421', name: 'Batangas' },
    city_municipality_info: { code: '042108', name: 'Lipa City', type: 'City' },
    barangay_info: { code: '042108002', name: 'Barangay 2' },
  },
  {
    code: 'HH-2024-003',
    name: 'Garcia Household',
    house_number: '789',
    street_name: 'Del Pilar Street',
    subdivision: 'Palm Heights',
    barangay_code: '042108003',
    created_at: '2024-02-01T10:45:00Z',
    head_resident: {
      id: '3',
      first_name: 'Roberto',
      middle_name: 'Luna',
      last_name: 'Garcia',
    },
    member_count: 7,
    region_info: { code: '04', name: 'CALABARZON' },
    province_info: { code: '0421', name: 'Batangas' },
    city_municipality_info: { code: '042108', name: 'Lipa City', type: 'City' },
    barangay_info: { code: '042108003', name: 'Barangay 3' },
  },
  {
    code: 'HH-2024-004',
    house_number: '321',
    street_name: 'Mabini Street',
    barangay_code: '042108004',
    created_at: '2024-02-10T16:20:00Z',
    member_count: 2,
    region_info: { code: '04', name: 'CALABARZON' },
    province_info: { code: '0421', name: 'Batangas' },
    city_municipality_info: { code: '042108', name: 'Lipa City', type: 'City' },
    barangay_info: { code: '042108004', name: 'Barangay 4' },
  },
  {
    code: 'HH-2024-005',
    name: 'Cruz Family',
    house_number: '654',
    street_name: 'Luna Street',
    subdivision: 'Sunrise Village',
    barangay_code: '042108005',
    created_at: '2024-02-15T12:30:00Z',
    head_resident: {
      id: '5',
      first_name: 'Ana',
      middle_name: 'Santos',
      last_name: 'Cruz',
    },
    member_count: 4,
    region_info: { code: '04', name: 'CALABARZON' },
    province_info: { code: '0421', name: 'Batangas' },
    city_municipality_info: { code: '042108', name: 'Lipa City', type: 'City' },
    barangay_info: { code: '042108005', name: 'Barangay 5' },
  },
];

// Mock session for demonstration
const mockSession = {
  access_token: 'mock-token',
  user: {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
  },
};

// Mock fetch implementation
const mockFetch = (households: any[], delay = 500) => {
  return (url: string) => {
    const urlObj = new URL(url, 'http://localhost');
    const searchParams = urlObj.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // Filter households based on search
    let filteredHouseholds = households;
    if (search) {
      filteredHouseholds = households.filter(
        h =>
          h.code.toLowerCase().includes(search.toLowerCase()) ||
          (h.head_resident &&
            `${h.head_resident.first_name} ${h.head_resident.middle_name || ''} ${h.head_resident.last_name}`
              .toLowerCase()
              .includes(search.toLowerCase()))
      );
    }

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedHouseholds = filteredHouseholds.slice(startIndex, endIndex);

    return Promise.resolve({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          data: paginatedHouseholds,
          pagination: {
            page,
            limit,
            total: filteredHouseholds.length,
            pages: Math.ceil(filteredHouseholds.length / limit),
            hasNext: endIndex < filteredHouseholds.length,
            hasPrev: page > 1,
          },
        }),
    });
  };
};

// Default story with normal household data
export const Default: Story = {
  render: () => {
    global.fetch = mockFetch(mockHouseholds);

    // Mock useAuth hook
    const mockUseAuth = () => ({ session: mockSession });
    const mockUseRouter = () => ({
      push: (path: string) => console.log('Navigating to:', path),
    });

    return (
      <div>
        {/* Mock the auth context */}
        <HouseholdsContent />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Default household management view with sample household data.',
      },
    },
  },
};

// Large dataset story
export const LargeDataset: Story = {
  render: () => {
    // Generate more households for large dataset simulation
    const largeHouseholdData = Array.from({ length: 50 }, (_, index) => ({
      code: `HH-2024-${String(index + 1).padStart(3, '0')}`,
      name: `Household ${index + 1}`,
      house_number: String(100 + index),
      street_name: [
        'Rizal Street',
        'Bonifacio Avenue',
        'Del Pilar Street',
        'Mabini Street',
        'Luna Street',
      ][index % 5],
      subdivision:
        index % 3 === 0
          ? ['Green Valley', 'Palm Heights', 'Sunrise Village'][index % 3]
          : undefined,
      barangay_code: `04210800${(index % 10) + 1}`,
      created_at: new Date(2024, 0, index + 1).toISOString(),
      head_resident: {
        id: String(index + 1),
        first_name: ['Juan', 'Maria', 'Roberto', 'Ana', 'Carlos'][index % 5],
        middle_name: index % 2 === 0 ? ['Cruz', 'Luna', 'Santos'][index % 3] : undefined,
        last_name: ['Santos', 'Reyes', 'Garcia', 'Cruz', 'Martinez'][index % 5],
      },
      member_count: Math.floor(Math.random() * 8) + 1,
      region_info: { code: '04', name: 'CALABARZON' },
      province_info: { code: '0421', name: 'Batangas' },
      city_municipality_info: { code: '042108', name: 'Lipa City', type: 'City' },
      barangay_info: { code: `04210800${(index % 10) + 1}`, name: `Barangay ${(index % 10) + 1}` },
    }));

    global.fetch = mockFetch(largeHouseholdData);

    return <HouseholdsContent />;
  },
  parameters: {
    docs: {
      description: {
        story:
          'Household management with a large dataset (50 households) to test pagination and performance.',
      },
    },
  },
};

// Empty state story
export const EmptyState: Story = {
  render: () => {
    global.fetch = mockFetch([]);

    return <HouseholdsContent />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Household management view when no households are found.',
      },
    },
  },
};

// Loading state story
export const LoadingState: Story = {
  render: () => {
    global.fetch = () => new Promise(resolve => setTimeout(resolve, 10000)); // Never resolves to show loading

    return <HouseholdsContent />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Loading state while fetching household data.',
      },
    },
  },
};

// Error state story
export const ErrorState: Story = {
  render: () => {
    global.fetch = () =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Internal server error' }),
      });

    return <HouseholdsContent />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Error state when household data fails to load.',
      },
    },
  },
};

// Households without heads
export const HouseholdsWithoutHeads: Story = {
  render: () => {
    const householdsWithoutHeads = mockHouseholds.map(h => ({
      ...h,
      head_resident: undefined,
    }));

    global.fetch = mockFetch(householdsWithoutHeads);

    return <HouseholdsContent />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Households that do not have assigned household heads.',
      },
    },
  },
};

// Minimal address information
export const MinimalAddressInfo: Story = {
  render: () => {
    const minimalAddressHouseholds = mockHouseholds.map(h => ({
      ...h,
      house_number: undefined,
      street_name: undefined,
      subdivision: undefined,
    }));

    global.fetch = mockFetch(minimalAddressHouseholds);

    return <HouseholdsContent />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Households with minimal address information (only barangay-level data).',
      },
    },
  },
};

// Mixed household data
export const MixedHouseholdData: Story = {
  render: () => {
    const mixedData = [
      // Complete household
      mockHouseholds[0],
      // Household without head
      { ...mockHouseholds[1], head_resident: undefined },
      // Household with minimal address
      { ...mockHouseholds[2], house_number: undefined, subdivision: undefined },
      // Household with single member
      { ...mockHouseholds[3], member_count: 1 },
      // Large household
      { ...mockHouseholds[4], member_count: 15 },
    ];

    global.fetch = mockFetch(mixedData);

    return <HouseholdsContent />;
  },
  parameters: {
    docs: {
      description: {
        story:
          'Mix of different household data scenarios including complete, incomplete, and edge cases.',
      },
    },
  },
};

// Search functionality demonstration
export const SearchFunctionality: Story = {
  render: () => {
    global.fetch = mockFetch(mockHouseholds);

    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-blue-50 p-4">
          <h3 className="font-medium text-blue-900">Search Functionality Demo</h3>
          <p className="mt-1 text-sm text-blue-700">
            Try searching for: "Santos", "HH-2024-001", "Maria", "Green Valley", etc.
          </p>
        </div>
        <HouseholdsContent />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates search functionality across household codes and head resident names.',
      },
    },
  },
};

// Pagination demonstration
export const PaginationDemo: Story = {
  render: () => {
    // Create exactly 25 households to show pagination (3 pages with 10 per page)
    const paginationData = Array.from({ length: 25 }, (_, index) => ({
      ...mockHouseholds[index % mockHouseholds.length],
      code: `HH-2024-${String(index + 1).padStart(3, '0')}`,
      head_resident: {
        id: String(index + 1),
        first_name: ['Juan', 'Maria', 'Roberto', 'Ana', 'Carlos'][index % 5],
        last_name: ['Santos', 'Reyes', 'Garcia', 'Cruz', 'Martinez'][index % 5],
      },
    }));

    global.fetch = mockFetch(paginationData);

    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-green-50 p-4">
          <h3 className="font-medium text-green-900">Pagination Demo</h3>
          <p className="mt-1 text-sm text-green-700">
            25 households across 3 pages (10 per page). Use pagination controls to navigate.
          </p>
        </div>
        <HouseholdsContent />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates pagination functionality with multiple pages of household data.',
      },
    },
  },
};

// Regional diversity
export const RegionalDiversity: Story = {
  render: () => {
    const regionalData = [
      {
        ...mockHouseholds[0],
        region_info: { code: '01', name: 'Ilocos Region' },
        province_info: { code: '0128', name: 'Ilocos Sur' },
        city_municipality_info: { code: '012801', name: 'Vigan City', type: 'City' },
      },
      {
        ...mockHouseholds[1],
        region_info: { code: '05', name: 'Bicol Region' },
        province_info: { code: '0554', name: 'Albay' },
        city_municipality_info: { code: '055403', name: 'Legazpi City', type: 'City' },
      },
      {
        ...mockHouseholds[2],
        region_info: { code: '07', name: 'Central Visayas' },
        province_info: { code: '0722', name: 'Cebu' },
        city_municipality_info: { code: '072209', name: 'Cebu City', type: 'City' },
      },
      {
        ...mockHouseholds[3],
        region_info: { code: '11', name: 'Davao Region' },
        province_info: { code: '1123', name: 'Davao del Sur' },
        city_municipality_info: { code: '112302', name: 'Davao City', type: 'City' },
      },
      {
        ...mockHouseholds[4],
        region_info: { code: '13', name: 'Caraga' },
        province_info: { code: '1301', name: 'Agusan del Norte' },
        city_municipality_info: { code: '130101', name: 'Butuan City', type: 'City' },
      },
    ];

    global.fetch = mockFetch(regionalData);

    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-purple-50 p-4">
          <h3 className="font-medium text-purple-900">Regional Diversity</h3>
          <p className="mt-1 text-sm text-purple-700">
            Households from different regions across the Philippines.
          </p>
        </div>
        <HouseholdsContent />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Households from different regions showcasing geographic diversity across the Philippines.',
      },
    },
  },
};

// Dark mode
export const DarkMode: Story = {
  render: () => {
    global.fetch = mockFetch(mockHouseholds);

    return (
      <div className="dark min-h-screen bg-gray-900">
        <HouseholdsContent />
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
        story: 'Household management interface in dark mode.',
      },
    },
  },
};
