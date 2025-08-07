import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import DashboardLayout from './DashboardLayout';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

const meta = {
  title: 'Templates/DashboardLayout',
  component: DashboardLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A comprehensive dashboard layout template for the RBI System. Includes sidebar navigation, search functionality, user profile management, and responsive design. Provides the main layout structure for all dashboard pages with consistent navigation and user interface elements.',
      },
    },
  },
  decorators: [
    Story => (
      <ThemeProvider>
        <AuthProvider>
          <Story />
        </AuthProvider>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    searchTerm: {
      control: 'text',
    },
  },
} satisfies Meta<typeof DashboardLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample dashboard content
const SampleDashboardContent = () => (
  <div className="space-y-6 p-6">
    <div className="mb-8">
      <h1 className="font-montserrat text-2xl font-semibold text-primary">Dashboard Overview</h1>
      <p className="font-montserrat mt-1 text-secondary">Welcome to the RBI System dashboard</p>
    </div>

    {/* Statistics Cards */}
    <div className="grid grid-cols-4 gap-6">
      <div className="rounded-lg border p-6 bg-surface border-default">
        <div className="font-montserrat mb-2 text-sm font-medium text-secondary">Residents</div>
        <div className="font-montserrat text-4xl font-bold text-primary">1,247</div>
        <div className="mt-2 flex items-center text-sm">
          <div className="mr-2 size-2 rounded-full bg-emerald-500"></div>
          <span className="font-medium text-emerald-600 dark:text-emerald-400">+12%</span>
        </div>
      </div>

      <div className="rounded-lg border p-6 bg-surface border-default">
        <div className="font-montserrat mb-2 text-sm font-medium text-secondary">Households</div>
        <div className="font-montserrat text-4xl font-bold text-primary">342</div>
        <div className="mt-2 flex items-center text-sm">
          <div className="mr-2 size-2 rounded-full bg-blue-500"></div>
          <span className="font-medium text-blue-600 dark:text-blue-400">+8%</span>
        </div>
      </div>

      <div className="rounded-lg border p-6 bg-surface border-default">
        <div className="font-montserrat mb-2 text-sm font-medium text-secondary">
          Certifications
        </div>
        <div className="font-montserrat text-4xl font-bold text-primary">89</div>
        <div className="mt-2 flex items-center text-sm">
          <div className="mr-2 size-2 rounded-full bg-purple-500"></div>
          <span className="font-medium text-purple-600 dark:text-purple-400">+15%</span>
        </div>
      </div>

      <div className="rounded-lg border p-6 bg-surface border-default">
        <div className="font-montserrat mb-2 text-sm font-medium text-secondary">Reports</div>
        <div className="font-montserrat text-4xl font-bold text-primary">23</div>
        <div className="mt-2 flex items-center text-sm">
          <div className="mr-2 size-2 rounded-full bg-orange-500"></div>
          <span className="font-medium text-orange-600 dark:text-orange-400">+5%</span>
        </div>
      </div>
    </div>

    {/* Recent Activity */}
    <div className="rounded-lg border p-6 bg-surface border-default">
      <h3 class="font-montserrat mb-4 text-lg font-semibold text-primary">Recent Activity</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded p-3 bg-background">
          <div className="size-2 rounded-full bg-blue-500"></div>
          <span className="text-sm text-primary">New resident registered: Maria Santos</span>
          <span className="ml-auto text-xs text-secondary">2 hours ago</span>
        </div>
        <div className="flex items-center gap-3 rounded p-3 bg-background">
          <div className="size-2 rounded-full bg-green-500"></div>
          <span className="text-sm text-primary">Household updated: Cruz Family</span>
          <span className="ml-auto text-xs text-secondary">4 hours ago</span>
        </div>
        <div className="flex items-center gap-3 rounded p-3 bg-background">
          <div className="size-2 rounded-full bg-purple-500"></div>
          <span className="text-sm text-primary">Certificate issued: Barangay Clearance</span>
          <span className="ml-auto text-xs text-secondary">1 day ago</span>
        </div>
      </div>
    </div>
  </div>
);

const SampleResidentsContent = () => (
  <div className="space-y-6 p-6">
    <div className="mb-8">
      <h1 className="font-montserrat text-2xl font-semibold text-primary">Residents Management</h1>
      <p className="font-montserrat mt-1 text-secondary">Manage resident information and records</p>
    </div>

    <div className="rounded-lg border bg-surface border-default">
      <div className="border-b p-6 border-default">
        <div className="flex items-center justify-between">
          <h3 className="font-montserrat text-lg font-semibold text-primary">All Residents</h3>
          <button className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
            Add New Resident
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {[
            { name: 'Juan Dela Cruz', email: 'juan@example.com', status: 'Active' },
            { name: 'Maria Santos', email: 'maria@example.com', status: 'Active' },
            { name: 'Jose Rizal', email: 'jose@example.com', status: 'Inactive' },
          ].map((resident, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded border p-4 bg-background border-default"
            >
              <div>
                <div className="font-medium text-primary">{resident.name}</div>
                <div className="text-sm text-secondary">{resident.email}</div>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs ${
                  resident.status === 'Active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}
              >
                {resident.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const Default: Story = {
  args: {
    children: <SampleDashboardContent />,
  },
};

export const WithSearchTerm: Story = {
  args: {
    children: <SampleDashboardContent />,
    searchTerm: 'residents',
    onSearchChange: value => console.log('Search changed:', value),
  },
};

export const ResidentsPage: Story = {
  args: {
    children: <SampleResidentsContent />,
  },
};

// Interactive example with search
const InteractiveComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <DashboardLayout searchTerm={searchTerm} onSearchChange={setSearchTerm}>
      <div className="space-y-6 p-6">
        <div className="mb-8">
          <h1 className="font-montserrat text-2xl font-semibold text-primary">
            Interactive Dashboard
          </h1>
          <p className="font-montserrat mt-1 text-secondary">
            Try using the search functionality and navigation
          </p>
        </div>

        {searchTerm && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <h3 className="mb-2 font-semibold text-blue-800 dark:text-blue-200">Search Results</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Showing results for: &quot;<strong>{searchTerm}</strong>&quot;
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border p-6 bg-surface border-default">
            <h3 className="mb-2 font-semibold text-primary">Navigation</h3>
            <p className="text-sm text-secondary">
              Use the sidebar to navigate between different sections of the RBI System.
            </p>
          </div>

          <div className="rounded-lg border p-6 bg-surface border-default">
            <h3 className="mb-2 font-semibold text-primary">Search</h3>
            <p className="text-sm text-secondary">
              The global search bar allows you to quickly find residents, households, and other
              data.
            </p>
          </div>

          <div className="rounded-lg border p-6 bg-surface border-default">
            <h3 className="mb-2 font-semibold text-primary">User Profile</h3>
            <p className="text-sm text-secondary">
              Click on your profile in the top right to access settings and account information.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export const Interactive: Story = {
  render: InteractiveComponent,
};

// Different page content examples
const DifferentPagesComponent = () => {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'residents' | 'reports'>(
    'dashboard'
  );

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <SampleDashboardContent />;
      case 'residents':
        return <SampleResidentsContent />;
      case 'reports':
        return (
          <div className="space-y-6 p-6">
            <div className="mb-8">
              <h1 className="font-montserrat text-2xl font-semibold text-primary">
                Reports & Analytics
              </h1>
              <p className="font-montserrat mt-1 text-secondary">
                Generate and view system reports
              </p>
            </div>
            <div className="rounded-lg border p-6 bg-surface border-default">
              <h3 className="mb-4 font-semibold text-primary">Available Reports</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded border p-4 border-default">
                  <h4 className="font-medium text-primary">Demographics Report</h4>
                  <p className="mt-1 text-sm text-secondary">
                    Population statistics and demographics
                  </p>
                </div>
                <div className="rounded border p-4 border-default">
                  <h4 className="font-medium text-primary">Monthly Activity</h4>
                  <p className="mt-1 text-sm text-secondary">Monthly system activity summary</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <SampleDashboardContent />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-b p-4 bg-background border-default">
        <h3 className="mb-2 font-semibold text-primary">Page Content Demo</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={`rounded px-3 py-1 text-sm ${
              currentPage === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'text-primary bg-surface hover:bg-surface-hover'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentPage('residents')}
            className={`rounded px-3 py-1 text-sm ${
              currentPage === 'residents'
                ? 'bg-blue-600 text-white'
                : 'text-primary bg-surface hover:bg-surface-hover'
            }`}
          >
            Residents
          </button>
          <button
            onClick={() => setCurrentPage('reports')}
            className={`rounded px-3 py-1 text-sm ${
              currentPage === 'reports'
                ? 'bg-blue-600 text-white'
                : 'text-primary bg-surface hover:bg-surface-hover'
            }`}
          >
            Reports
          </button>
        </div>
      </div>

      <DashboardLayout>{renderContent()}</DashboardLayout>
    </div>
  );
};

export const DifferentPages: Story = {
  render: DifferentPagesComponent,
};

// Features showcase
export const FeaturesShowcase: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="rounded-lg border p-6 bg-background border-default">
        <h3 className="mb-4 font-semibold text-primary">DashboardLayout Features</h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-2 font-medium text-primary">Navigation</h4>
            <ul className="space-y-1 text-sm text-secondary">
              <li>• Fixed sidebar with unified navigation</li>
              <li>• Active state management</li>
              <li>• Responsive navigation menu</li>
              <li>• Consistent navigation across all pages</li>
              <li>• Icon and text-based menu items</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-2 font-medium text-primary">Search Functionality</h4>
            <ul className="space-y-1 text-sm text-secondary">
              <li>• Global search bar integration</li>
              <li>• Real-time search input handling</li>
              <li>• Search term state management</li>
              <li>• Clear button functionality</li>
              <li>• Search action triggers</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-2 font-medium text-primary">User Management</h4>
            <ul className="space-y-1 text-sm text-secondary">
              <li>• User profile dropdown</li>
              <li>• Barangay assignment display</li>
              <li>• Role-based information</li>
              <li>• Quick logout functionality</li>
              <li>• Settings access</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-2 font-medium text-primary">Layout Structure</h4>
            <ul className="space-y-1 text-sm text-secondary">
              <li>• Fixed sidebar layout</li>
              <li>• Responsive main content area</li>
              <li>• Consistent header across pages</li>
              <li>• Theme-aware styling</li>
              <li>• Proper content spacing</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <h4 className="mb-2 font-medium text-blue-800 dark:text-blue-200">Usage Notes</h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            This layout template provides the foundation for all dashboard pages in the RBI System.
            It includes authentication context, navigation state management, and consistent UI
            patterns that ensure a unified user experience across the application.
          </p>
        </div>
      </div>

      <DashboardLayout>
        <SampleDashboardContent />
      </DashboardLayout>
    </div>
  ),
};
