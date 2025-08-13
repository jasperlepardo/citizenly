import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import DashboardLayout from './DashboardLayout';

// Mock the authentication context for Storybook
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Create a mock auth context value
  const mockAuthValue = {
    user: {
      id: 'mock-user-id',
      email: 'barangay.admin@example.com',
      user_metadata: {
        first_name: 'John',
        last_name: 'Doe',
      },
    },
    userProfile: {
      id: 'profile-id',
      first_name: 'John',
      last_name: 'Doe',
      email: 'barangay.admin@example.com',
      barangay_code: '137404001',
      role_id: 'admin-role',
    },
    role: {
      id: 'admin-role',
      name: 'Barangay Administrator',
      permissions: [],
    },
    signOut: async () => {
      console.log('Mock sign out');
    },
    loading: false,
    initialized: true,
  };

  // Mock the useAuth hook
  React.useEffect(() => {
    const originalUseAuth = (window as any).useAuth;
    (window as any).useAuth = () => mockAuthValue;

    return () => {
      (window as any).useAuth = originalUseAuth;
    };
  }, []);

  return <>{children}</>;
};

// Create a wrapper component that handles the auth context and search state
const DashboardLayoutWrapper = ({
  children,
  showSearch = true,
  initialSearchTerm = '',
}: {
  children: React.ReactNode;
  showSearch?: boolean;
  initialSearchTerm?: string;
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  return (
    <MockAuthProvider>
      <DashboardLayout
        searchTerm={showSearch ? searchTerm : undefined}
        onSearchChange={showSearch ? setSearchTerm : undefined}
      >
        {children}
      </DashboardLayout>
    </MockAuthProvider>
  );
};

const meta = {
  title: 'Templates/DashboardLayout',
  component: DashboardLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Dashboard Layout Component - A comprehensive dashboard layout with sidebar navigation, search functionality, user dropdown with barangay information, and environment indicators. Features authentication integration and responsive design.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <MockAuthProvider>
        <Story />
      </MockAuthProvider>
    ),
  ],
} satisfies Meta<typeof DashboardLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock content components
const MockDashboardContent = () => (
  <div className="space-y-8 p-6">
    <div>
      <h1 className="text-3xl font-bold text-primary">Dashboard Overview</h1>
      <p className="mt-2 text-secondary">Barangay Records Management System</p>
    </div>

    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {[
        { title: 'Total Residents', value: '2,847', trend: '+12.5%' },
        { title: 'Active Households', value: '1,205', trend: '+8.2%' },
        { title: 'Registered Voters', value: '1,876', trend: '+3.1%' },
        { title: 'Pending Applications', value: '47', trend: '-15.3%' },
      ].map((stat, index) => (
        <div key={index} className="bg-surface rounded-xl border border-default p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">{stat.title}</p>
              <p className="mt-1 text-2xl font-bold text-primary">{stat.value}</p>
            </div>
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${
                stat.trend.startsWith('+')
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {stat.trend}
            </span>
          </div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="bg-surface rounded-xl border border-default p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-primary">Recent Registrations</h3>
        <div className="space-y-4">
          {[
            { name: 'Maria Elena Santos', type: 'New Resident', time: '2 hours ago' },
            { name: 'Rodriguez Family', type: 'Household Update', time: '4 hours ago' },
            { name: 'Juan Carlos Mendoza', type: 'Address Change', time: '6 hours ago' },
            { name: 'Ana Beatriz Cruz', type: 'New Voter Registration', time: '1 day ago' },
          ].map((activity, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-100">
                <div className="h-3 w-3 rounded-full bg-primary"></div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-primary">{activity.name}</p>
                <p className="text-xs text-secondary">
                  {activity.type} • {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-default p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-primary">System Health</h3>
        <div className="space-y-4">
          {[
            { metric: 'Database Status', status: 'Online', color: 'green' },
            { metric: 'API Response Time', status: '142ms', color: 'green' },
            { metric: 'Active Sessions', status: '23 users', color: 'blue' },
            { metric: 'Last Backup', status: '2 hours ago', color: 'green' },
          ].map((health, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-secondary">{health.metric}</span>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full bg-${health.color}-500`}></div>
                <span className="text-sm font-medium text-primary">{health.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-100">
          <svg
            className="h-6 w-6 text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <h4 className="mb-2 font-semibold text-indigo-900">Welcome to Citizenly</h4>
          <p className="text-sm leading-relaxed text-indigo-700">
            This dashboard provides an overview of your barangay's resident data and system status.
            Use the navigation menu to access different modules for managing residents, households,
            and generating reports.
          </p>
        </div>
      </div>
    </div>
  </div>
);

const MockResidentsContent = () => (
  <div className="space-y-6 p-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-primary">Residents Directory</h1>
        <p className="mt-1 text-secondary">Manage resident records and profiles</p>
      </div>
      <div className="flex gap-3">
        <button className="hover:bg-surface-hover rounded-lg border border-default px-4 py-2 text-secondary transition-colors">
          Export Data
        </button>
        <button className="rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary-600">
          Add New Resident
        </button>
      </div>
    </div>

    <div className="bg-surface overflow-hidden rounded-xl border border-default">
      <div className="bg-background-muted border-b border-default p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-primary">Active Residents</h3>
          <div className="flex items-center gap-3">
            <select className="bg-surface rounded border border-default px-3 py-2 text-sm text-primary">
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <select className="bg-surface rounded border border-default px-3 py-2 text-sm text-primary">
              <option>All Ages</option>
              <option>Minors (0-17)</option>
              <option>Adults (18-59)</option>
              <option>Seniors (60+)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="divide-y divide-default">
        {[
          {
            name: 'Juan Antonio Dela Cruz',
            age: 34,
            address: 'Block 5 Lot 12, Sunrise Village',
            status: 'Active',
            voters: true,
          },
          {
            name: 'Maria Cristina Santos',
            age: 29,
            address: 'Unit 4B, Mabuhay Apartments',
            status: 'Active',
            voters: true,
          },
          {
            name: 'Pedro Miguel Rodriguez',
            age: 45,
            address: '123 Sampaguita Street',
            status: 'Active',
            voters: true,
          },
          {
            name: 'Ana Lucia Gonzales',
            age: 67,
            address: '456 Rose Garden Road',
            status: 'Active',
            voters: false,
          },
          {
            name: 'Carlos Eduardo Reyes',
            age: 22,
            address: 'Block 2 Lot 8, Green Valley',
            status: 'Inactive',
            voters: true,
          },
        ].map((resident, index) => (
          <div key={index} className="hover:bg-surface-hover p-4 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                  <span className="font-semibold text-primary">
                    {resident.name
                      .split(' ')
                      .slice(0, 2)
                      .map(n => n[0])
                      .join('')}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-primary">{resident.name}</h4>
                  <p className="text-sm text-secondary">
                    Age {resident.age} • {resident.address}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        resident.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {resident.status}
                    </span>
                    {resident.voters && (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                        Registered Voter
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="hover:bg-surface-hover rounded-lg p-2 text-secondary transition-colors hover:text-primary">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
                <button className="hover:bg-surface-hover rounded-lg p-2 text-secondary transition-colors hover:text-primary">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Default story with dashboard content
export const Default: Story = {
  render: () => (
    <DashboardLayoutWrapper>
      <MockDashboardContent />
    </DashboardLayoutWrapper>
  ),
};

// With search functionality
export const WithSearch: Story = {
  render: () => (
    <DashboardLayoutWrapper showSearch={true} initialSearchTerm="">
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Search Results</h1>
          <p className="mt-1 text-secondary">Search through residents, households, and records</p>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-medium text-blue-900">Search Functionality</h3>
              <p className="mt-1 text-sm text-blue-700">
                Use the search bar in the header to find residents, households, addresses, or any
                other records. The search supports partial matches and filters across all data
                types.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              title: 'Recent Searches',
              items: ['Santos family', 'Block 5 residents', '09171234567'],
            },
            {
              title: 'Popular Filters',
              items: ['Active voters', 'Senior citizens', 'New registrations'],
            },
            {
              title: 'Quick Actions',
              items: ['Add resident', 'Create household', 'Generate report'],
            },
          ].map((section, index) => (
            <div key={index} className="bg-surface rounded-lg border border-default p-4">
              <h3 className="mb-3 font-medium text-primary">{section.title}</h3>
              <ul className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <li
                    key={itemIndex}
                    className="cursor-pointer text-sm text-secondary hover:text-primary"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayoutWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'DashboardLayout with search functionality enabled. The search bar in the header allows users to search across all system data.',
      },
    },
  },
};

// Residents page layout
export const ResidentsPage: Story = {
  render: () => (
    <DashboardLayoutWrapper>
      <MockResidentsContent />
    </DashboardLayoutWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'DashboardLayout displaying the residents management page with detailed resident cards and filtering options.',
      },
    },
  },
};

// Mobile view
export const MobileView: Story = {
  render: () => (
    <DashboardLayoutWrapper>
      <MockDashboardContent />
    </DashboardLayoutWrapper>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story:
          'DashboardLayout optimized for mobile devices. Note: The sidebar is fixed and may need scrolling on very small screens.',
      },
    },
  },
};

// Tablet view
export const TabletView: Story = {
  render: () => (
    <DashboardLayoutWrapper>
      <MockDashboardContent />
    </DashboardLayoutWrapper>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story:
          'DashboardLayout on tablet-sized screens, showing how the layout adapts to medium screen sizes.',
      },
    },
  },
};

// User dropdown showcase
export const UserDropdownShowcase: Story = {
  render: () => (
    <DashboardLayoutWrapper>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">User Profile & Barangay Information</h1>
          <p className="mt-1 text-secondary">
            The user dropdown shows detailed profile and barangay assignment information
          </p>
        </div>

        <div className="rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-blue-50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-green-900">User Dropdown Features</h3>
              <ul className="space-y-1 text-sm text-green-800">
                <li>• User profile with name and email</li>
                <li>• Role-based access information</li>
                <li>• Barangay assignment details with full address hierarchy</li>
                <li>• PSGC code display for administrative reference</li>
                <li>• Quick access to settings and profile editing</li>
                <li>• Secure logout functionality</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h4 className="font-medium text-amber-900">Try the User Dropdown</h4>
              <p className="mt-1 text-sm text-amber-800">
                Click on the user profile section in the top-right corner of the header to see the
                detailed user dropdown with barangay information and profile controls.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayoutWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Focuses on the user dropdown functionality, showing profile information, barangay assignment, and administrative controls.',
      },
    },
  },
};

// Environment indicator showcase
export const EnvironmentIndicator: Story = {
  render: () => (
    <DashboardLayoutWrapper>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Environment Indicators</h1>
          <p className="mt-1 text-secondary">
            Visual indicators show the current environment (Development/Staging/Production)
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-green-200 bg-green-50 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="font-medium text-green-900">DEVELOPMENT</span>
            </div>
            <p className="text-sm text-green-800">
              Green indicator shown in development environment for easy identification during
              testing and development.
            </p>
          </div>

          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <span className="font-medium text-yellow-900">STAGING</span>
            </div>
            <p className="text-sm text-yellow-800">
              Yellow indicator shown in staging environment to distinguish from production during
              UAT and testing.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-gray-500"></div>
              <span className="font-medium text-gray-900">PRODUCTION</span>
            </div>
            <p className="text-sm text-gray-800">
              No environment indicator shown in production to maintain clean interface for end
              users.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h4 className="font-medium text-blue-900">Environment Detection</h4>
              <p className="mt-1 text-sm text-blue-800">
                The system automatically detects the environment and displays appropriate indicators
                in the sidebar footer. This helps developers and testers quickly identify which
                environment they're working in.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayoutWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the environment indicator feature that helps users identify development, staging, and production environments.',
      },
    },
  },
};

// Layout features overview
export const LayoutFeatures: Story = {
  render: () => (
    <DashboardLayoutWrapper>
      <div className="space-y-8 p-6">
        <div className="text-center">
          <h1 className="mb-4 text-3xl font-bold text-primary">DashboardLayout Features</h1>
          <p className="mx-auto max-w-2xl text-secondary">
            A comprehensive dashboard layout with authentication integration, search functionality,
            and responsive design optimized for barangay management systems.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-surface rounded-xl border border-default p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            </div>
            <h3 className="mb-2 font-semibold text-primary">Authentication Integration</h3>
            <p className="text-sm text-secondary">
              Seamless integration with authentication context, displaying user profile, role
              information, and barangay assignments.
            </p>
          </div>

          <div className="bg-surface rounded-xl border border-default p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="mb-2 font-semibold text-primary">Global Search</h3>
            <p className="text-sm text-secondary">
              Integrated search functionality with real-time filtering and comprehensive search
              across all data types.
            </p>
          </div>

          <div className="bg-surface rounded-xl border border-default p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
              <svg
                className="h-6 w-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="mb-2 font-semibold text-primary">Responsive Design</h3>
            <p className="text-sm text-secondary">
              Fixed sidebar layout that maintains navigation accessibility across all device sizes
              and orientations.
            </p>
          </div>

          <div className="bg-surface rounded-xl border border-default p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
              <svg
                className="h-6 w-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="mb-2 font-semibold text-primary">Location Context</h3>
            <p className="text-sm text-secondary">
              Automatic barangay information loading with full PSGC hierarchy display for
              administrative context.
            </p>
          </div>

          <div className="bg-surface rounded-xl border border-default p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="mb-2 font-semibold text-primary">Environment Indicators</h3>
            <p className="text-sm text-secondary">
              Visual environment indicators help distinguish between development, staging, and
              production environments.
            </p>
          </div>

          <div className="bg-surface rounded-xl border border-default p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
              <svg
                className="h-6 w-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                />
              </svg>
            </div>
            <h3 className="mb-2 font-semibold text-primary">Accessibility</h3>
            <p className="text-sm text-secondary">
              Built with skip navigation, ARIA labels, keyboard navigation, and screen reader
              support for inclusive access.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayoutWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comprehensive overview of all DashboardLayout features and capabilities.',
      },
    },
  },
};

// Dark theme preview
export const WithDarkBackground: Story = {
  render: () => (
    <DashboardLayoutWrapper>
      <MockDashboardContent />
    </DashboardLayoutWrapper>
  ),
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        story: 'DashboardLayout with dark background to demonstrate theme compatibility.',
      },
    },
  },
};
