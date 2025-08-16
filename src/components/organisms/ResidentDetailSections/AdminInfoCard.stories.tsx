import type { Meta, StoryObj } from '@storybook/react';
import AdminInfoCard from './AdminInfoCard';

const meta = {
  title: 'Organisms/ResidentDetailSections/AdminInfoCard',
  component: AdminInfoCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A card component that displays administrative information for a resident including barangay code, status, and creation timestamp. Used for system metadata in resident detail views.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    resident: {
      control: { type: 'object' },
      description: 'Resident data object containing administrative information',
    },
    formatDate: {
      action: 'formatDate',
      description: 'Function to format date strings',
    },
  },
} satisfies Meta<typeof AdminInfoCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock utility function
const mockFormatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Sample active resident
const activeResident = {
  barangay_code: 'BGY-001',
  is_active: true,
  created_at: '2024-01-15T08:30:00Z',
};

// Inactive resident
const inactiveResident = {
  barangay_code: 'BGY-002',
  is_active: false,
  created_at: '2023-06-22T14:45:00Z',
};

// Recently created resident
const recentResident = {
  barangay_code: 'BGY-003',
  is_active: true,
  created_at: new Date().toISOString(),
};

// Old resident record
const oldResident = {
  barangay_code: 'BGY-LEGACY-001',
  is_active: true,
  created_at: '2020-01-01T00:00:00Z',
};

// Basic Examples
export const Default: Story = {
  args: {
    resident: activeResident,
    formatDate: mockFormatDate,
  },
};

export const InactiveResident: Story = {
  args: {
    resident: inactiveResident,
    formatDate: mockFormatDate,
  },
  parameters: {
    docs: {
      description: {
        story: 'Administrative card for an inactive resident.',
      },
    },
  },
};

export const RecentlyCreated: Story = {
  args: {
    resident: recentResident,
    formatDate: mockFormatDate,
  },
  parameters: {
    docs: {
      description: {
        story: 'Administrative card for a recently created resident record.',
      },
    },
  },
};

export const OldRecord: Story = {
  args: {
    resident: oldResident,
    formatDate: mockFormatDate,
  },
  parameters: {
    docs: {
      description: {
        story: 'Administrative card for an old resident record.',
      },
    },
  },
};

// Different Barangay Codes
export const BarangayCodeFormats: Story = {
  render: () => {
    const barangayFormats = [
      {
        label: 'Standard Format',
        resident: { barangay_code: 'BGY-001', is_active: true, created_at: '2024-01-15T08:30:00Z' },
      },
      {
        label: 'Numeric Code',
        resident: { barangay_code: '032701001', is_active: true, created_at: '2024-01-15T08:30:00Z' },
      },
      {
        label: 'Named Barangay',
        resident: { barangay_code: 'CENTRAL', is_active: true, created_at: '2024-01-15T08:30:00Z' },
      },
      {
        label: 'PSGC Code',
        resident: { barangay_code: '137602001', is_active: true, created_at: '2024-01-15T08:30:00Z' },
      },
      {
        label: 'Long Name',
        resident: { barangay_code: 'SAN-JOSE-NORTE', is_active: true, created_at: '2024-01-15T08:30:00Z' },
      },
      {
        label: 'Legacy Code',
        resident: { barangay_code: 'OLD-BGY-LEGACY-001', is_active: true, created_at: '2024-01-15T08:30:00Z' },
      },
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Different Barangay Code Formats</h3>
        <div className="grid gap-4">
          {barangayFormats.map((format, index) => (
            <div key={index}>
              <h4 className="mb-2 text-sm font-medium text-gray-600">
                {format.label}: {format.resident.barangay_code}
              </h4>
              <AdminInfoCard
                resident={format.resident}
                formatDate={mockFormatDate}
              />
            </div>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Examples showing different barangay code formats used in the Philippines.',
      },
    },
  },
};

// Status Variations
export const StatusVariations: Story = {
  render: () => {
    const statusExamples = [
      {
        label: 'Active Resident',
        description: 'Currently active in the barangay',
        resident: { barangay_code: 'BGY-001', is_active: true, created_at: '2024-01-15T08:30:00Z' },
      },
      {
        label: 'Inactive Resident',
        description: 'Moved out or deceased',
        resident: { barangay_code: 'BGY-001', is_active: false, created_at: '2023-01-15T08:30:00Z' },
      },
      {
        label: 'Undefined Status',
        description: 'Status not specified',
        resident: { barangay_code: 'BGY-001', is_active: undefined, created_at: '2024-01-15T08:30:00Z' },
      },
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Status Variations</h3>
        <div className="grid gap-4">
          {statusExamples.map((example, index) => (
            <div key={index}>
              <h4 className="mb-2 text-sm font-medium text-gray-600">
                {example.label}
              </h4>
              <p className="mb-2 text-xs text-gray-500">{example.description}</p>
              <AdminInfoCard
                resident={example.resident}
                formatDate={mockFormatDate}
              />
            </div>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Different resident status variations and their meanings.',
      },
    },
  },
};

// Creation Time Examples
export const CreationTimeExamples: Story = {
  render: () => {
    const now = new Date();
    const timeExamples = [
      {
        label: 'Today',
        resident: { 
          barangay_code: 'BGY-001', 
          is_active: true, 
          created_at: now.toISOString() 
        },
      },
      {
        label: 'Yesterday',
        resident: { 
          barangay_code: 'BGY-001', 
          is_active: true, 
          created_at: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString() 
        },
      },
      {
        label: 'Last Week',
        resident: { 
          barangay_code: 'BGY-001', 
          is_active: true, 
          created_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString() 
        },
      },
      {
        label: 'Last Month',
        resident: { 
          barangay_code: 'BGY-001', 
          is_active: true, 
          created_at: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString() 
        },
      },
      {
        label: 'Last Year',
        resident: { 
          barangay_code: 'BGY-001', 
          is_active: true, 
          created_at: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString() 
        },
      },
      {
        label: 'Five Years Ago',
        resident: { 
          barangay_code: 'BGY-001', 
          is_active: false, 
          created_at: new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000).toISOString() 
        },
      },
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Creation Time Examples</h3>
        <div className="grid gap-4">
          {timeExamples.map((example, index) => (
            <div key={index}>
              <h4 className="mb-2 text-sm font-medium text-gray-600">
                {example.label}
              </h4>
              <AdminInfoCard
                resident={example.resident}
                formatDate={mockFormatDate}
              />
            </div>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Examples showing different creation dates relative to current time.',
      },
    },
  },
};

// Barangay Migration Example
export const BarangayMigration: Story = {
  render: () => {
    const migrationExamples = [
      {
        label: 'Original Barangay',
        description: 'First registered in this barangay',
        resident: { barangay_code: 'BGY-001', is_active: false, created_at: '2020-01-15T08:30:00Z' },
      },
      {
        label: 'Transferred Out',
        description: 'Moved to different barangay',
        resident: { barangay_code: 'BGY-002', is_active: false, created_at: '2021-06-15T08:30:00Z' },
      },
      {
        label: 'Current Barangay',
        description: 'Currently registered here',
        resident: { barangay_code: 'BGY-003', is_active: true, created_at: '2023-01-15T08:30:00Z' },
      },
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Barangay Migration History</h3>
        <div className="grid gap-4">
          {migrationExamples.map((example, index) => (
            <div key={index}>
              <h4 className="mb-2 text-sm font-medium text-gray-600">
                {example.label}
              </h4>
              <p className="mb-2 text-xs text-gray-500">{example.description}</p>
              <AdminInfoCard
                resident={example.resident}
                formatDate={mockFormatDate}
              />
            </div>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Example showing a resident\'s migration between different barangays.',
      },
    },
  },
};

// Data Quality Examples
export const DataQualityExamples: Story = {
  render: () => {
    const dataQualityExamples = [
      {
        label: 'Complete Data',
        description: 'All fields properly filled',
        resident: { barangay_code: 'BGY-001', is_active: true, created_at: '2024-01-15T08:30:00Z' },
      },
      {
        label: 'Missing Status',
        description: 'Status field not specified',
        resident: { barangay_code: 'BGY-002', is_active: undefined, created_at: '2024-01-15T08:30:00Z' },
      },
      {
        label: 'Invalid Date',
        description: 'Malformed timestamp',
        resident: { barangay_code: 'BGY-003', is_active: true, created_at: 'invalid-date' },
      },
      {
        label: 'Empty Barangay Code',
        description: 'Missing barangay identifier',
        resident: { barangay_code: '', is_active: true, created_at: '2024-01-15T08:30:00Z' },
      },
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Data Quality Examples</h3>
        <div className="grid gap-4">
          {dataQualityExamples.map((example, index) => (
            <div key={index}>
              <h4 className="mb-2 text-sm font-medium text-gray-600">
                {example.label}
              </h4>
              <p className="mb-2 text-xs text-gray-500">{example.description}</p>
              <AdminInfoCard
                resident={example.resident}
                formatDate={mockFormatDate}
              />
            </div>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Examples showing different data quality scenarios and edge cases.',
      },
    },
  },
};

// System Context Example
export const SystemContext: Story = {
  args: {
    resident: activeResident,
    formatDate: mockFormatDate,
  },
  render: (args) => (
    <div className="space-y-6">
      <AdminInfoCard {...args} />
      
      <div className="rounded bg-blue-50 p-4">
        <h4 className="font-medium">System Context - Administrative Information</h4>
        <div className="mt-2 space-y-2 text-sm">
          <p><strong>Barangay Code:</strong> Unique identifier for the barangay in the Philippine Standard Geographic Code (PSGC) system.</p>
          <p><strong>Status:</strong> Indicates if the resident is currently active in the barangay registry. Inactive may mean moved out, deceased, or archived.</p>
          <p><strong>Created Date:</strong> Timestamp when the resident record was first created in the system. Used for audit and historical tracking.</p>
          <p><strong>Usage:</strong> This information is crucial for system administration, data integrity, and government reporting requirements.</p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Administrative card with system context explaining the fields.',
      },
    },
  },
};

// Responsive Layout
export const ResponsiveLayout: Story = {
  args: {
    resident: activeResident,
    formatDate: mockFormatDate,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Administrative card on mobile device showing responsive grid layout.',
      },
    },
  },
};

// Dark Mode Example
export const DarkMode: Story = {
  args: {
    resident: activeResident,
    formatDate: mockFormatDate,
  },
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#1f2937' }],
    },
    docs: {
      description: {
        story: 'Administrative card in dark mode theme.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
};