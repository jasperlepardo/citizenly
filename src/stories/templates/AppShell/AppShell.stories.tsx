import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import AppShell from '@/components/templates/AppShell';

const meta = {
  title: 'Templates/AppShell',
  component: AppShell,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Application Shell Component - Modern Tailwind UI application shell with advanced design patterns. Features a responsive sidebar navigation, mobile menu, search functionality, and user profile controls.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock content components for demonstrations
const MockDashboardContent = () => (
  <div className="space-y-8">
    <div>
      <h1 className="text-3xl font-bold text-gray-600 dark:text-gray-400">Dashboard Overview</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">Welcome to the RBI Records Management System</p>
    </div>

    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {[
        { title: 'Total Residents', value: '1,234', change: '+12%' },
        { title: 'Total Households', value: '456', change: '+5%' },
        { title: 'Active Voters', value: '987', change: '+8%' },
        { title: 'Pending Records', value: '23', change: '-3%' },
      ].map((stat, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-600 p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stat.value}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-medium text-green-600">{stat.change}</span>
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-600 p-6 shadow-xs">
        <h3 className="mb-4 text-lg font-semibold text-gray-600 dark:text-gray-400">Recent Activity</h3>
        <div className="space-y-4">
          {[
            'New resident registered: Maria Santos',
            'Household updated: HH-001-2024',
            'User login: barangay.admin',
            'Report generated: Population Summary',
          ].map((activity, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="mt-2 h-2 w-2 rounded-full bg-blue-600"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{activity}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-600 p-6 shadow-xs">
        <h3 className="mb-4 text-lg font-semibold text-gray-600 dark:text-gray-400">Quick Actions</h3>
        <div className="space-y-3">
          {['Add New Resident', 'Create Household', 'Generate Report', 'Manage Users'].map(
            (action, index) => (
              <button
                key={index}
                className="bg-gray-50 dark:bg-gray-700 w-full rounded-lg px-4 py-3 text-left text-gray-600 dark:text-gray-400 transition-colors hover:bg-blue-50 hover:text-gray-600"
              >
                {action}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  </div>
);

const MockResidentsContent = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-600 dark:text-gray-400">Residents Management</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Manage resident records and information</p>
      </div>
      <div className="flex gap-3">
        <button className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-600 dark:text-gray-400 transition-colors hover:text-gray-600">
          Export
        </button>
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-white dark:text-black transition-colors hover:bg-blue-600">
          Add Resident
        </button>
      </div>
    </div>

    <div className="bg-white dark:bg-gray-800 overflow-hidden rounded-xl border border-gray-300 dark:border-gray-600">
      <div className="border-b border-gray-300 dark:border-gray-600 p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-600 dark:text-gray-400">Resident List</h3>
          <div className="flex gap-2">
            <input
              type="search"
              placeholder="Search residents..."
              className="bg-white dark:bg-gray-800 placeholder-secondary rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-600 dark:text-gray-400"
            />
            <button className="hover:bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-600">
              Filter
            </button>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="space-y-3">
          {[
            { name: 'Juan Dela Cruz', age: 35, status: 'Active', household: 'HH-001' },
            { name: 'Maria Santos', age: 28, status: 'Active', household: 'HH-002' },
            { name: 'Pedro Rodriguez', age: 42, status: 'Inactive', household: 'HH-003' },
            { name: 'Ana Garcia', age: 31, status: 'Active', household: 'HH-004' },
          ].map((resident, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-gray-300 dark:border-gray-600 p-3"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {resident.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-600 dark:text-gray-400">{resident.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Age {resident.age} • {resident.household}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    resident.status === 'Active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  {resident.status}
                </span>
                <button className="text-gray-600 dark:text-gray-400 hover:text-gray-600">
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
          ))}
        </div>
      </div>
    </div>
  </div>
);

const MockReportsContent = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-gray-600 dark:text-gray-400">Reports & Analytics</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">Generate and view system reports</p>
    </div>

    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {[
        {
          title: 'Population Report',
          description: 'Demographic analysis and statistics',
          icon: '👥',
        },
        { title: 'Household Summary', description: 'Household composition and data', icon: '🏠' },
        { title: 'Activity Log', description: 'System usage and audit trails', icon: '📊' },
      ].map((report, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 cursor-pointer rounded-xl border border-gray-300 dark:border-gray-600 p-6 transition-shadow hover:shadow-md"
        >
          <div className="mb-3 text-3xl">{report.icon}</div>
          <h3 className="mb-2 font-semibold text-gray-600 dark:text-gray-400">{report.title}</h3>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">{report.description}</p>
          <button className="w-full rounded-lg bg-blue-50 px-4 py-2 text-gray-600 dark:text-gray-400 transition-colors hover:bg-blue-100">
            Generate Report
          </button>
        </div>
      ))}
    </div>

    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-600 p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-600 dark:text-gray-400">Recent Reports</h3>
      <div className="space-y-3">
        {[
          { name: 'Population Summary Q4 2024', date: '2024-12-01', size: '2.4 MB' },
          { name: 'Household Registration Report', date: '2024-11-28', size: '1.8 MB' },
          { name: 'User Activity Log November', date: '2024-11-25', size: '856 KB' },
        ].map((report, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-lg border border-gray-300 dark:border-gray-600 p-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-blue-100">
                <svg
                  className="h-4 w-4 text-gray-600 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-600 dark:text-gray-400">{report.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {report.date} • {report.size}
                </p>
              </div>
            </div>
            <button className="rounded bg-blue-50 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 transition-colors hover:bg-blue-100">
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Default story with dashboard content
export const Default: Story = {
  args: {
    children: <MockDashboardContent />,
  },
};

// Desktop view focused story
export const DesktopView: Story = {
  args: {
    children: <MockDashboardContent />,
  },
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
};

// Tablet view to show responsive behavior
export const TabletView: Story = {
  args: {
    children: <MockDashboardContent />,
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};

// Mobile view to demonstrate mobile menu
export const MobileView: Story = {
  args: {
    children: <MockDashboardContent />,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story:
          'On mobile devices, the sidebar is hidden and accessible via a hamburger menu button in the top navigation.',
      },
    },
  },
};

// With different content - Residents page
export const ResidentsPage: Story = {
  args: {
    children: <MockResidentsContent />,
  },
  parameters: {
    docs: {
      description: {
        story:
          'AppShell with residents management content, showing how the layout adapts to different page content while maintaining consistent navigation.',
      },
    },
  },
};

// With different content - Reports page
export const ReportsPage: Story = {
  args: {
    children: <MockReportsContent />,
  },
  parameters: {
    docs: {
      description: {
        story:
          'AppShell with reports and analytics content, demonstrating the layout flexibility for different types of data visualization.',
      },
    },
  },
};

// Showcase all layout features
export const LayoutFeatures: Story = {
  render: () => (
    <AppShell>
      <div className="space-y-8">
        <div className="rounded-xl border border-indigo-200 bg-linear-to-r from-indigo-50 to-purple-50 p-8">
          <h1 className="mb-4 text-3xl font-bold text-indigo-900">AppShell Layout Features</h1>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-3 font-semibold text-indigo-800">Navigation Features</h3>
              <ul className="space-y-2 text-indigo-700">
                <li>• Responsive sidebar with auto-collapse</li>
                <li>• Mobile-friendly hamburger menu</li>
                <li>• Gradient logo and branding</li>
                <li>• Organized navigation hierarchy</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 font-semibold text-indigo-800">Layout Features</h3>
              <ul className="space-y-2 text-indigo-700">
                <li>• Sticky top navigation bar</li>
                <li>• Global search functionality</li>
                <li>• Notification system</li>
                <li>• User profile controls</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-600 p-6">
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
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </div>
            <h3 className="mb-2 font-semibold text-gray-600 dark:text-gray-400">Responsive Design</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Automatically adapts to different screen sizes with mobile-first approach
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-600 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
              <svg
                className="h-6 w-6 text-gray-600 dark:text-gray-400"
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
            <h3 className="mb-2 font-semibold text-gray-600 dark:text-gray-400">Global Search</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Integrated search functionality accessible from anywhere in the application
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-600 p-6">
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
                  d="M15 17h5l-5 5-5-5h5v-12h-5l5-5 5 5h-5v12z"
                />
              </svg>
            </div>
            <h3 className="mb-2 font-semibold text-gray-600 dark:text-gray-400">Accessibility</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Built with WCAG guidelines and keyboard navigation support
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comprehensive overview of all AppShell layout features and capabilities.',
      },
    },
  },
};

// Dark mode preview
export const WithDarkBackground: Story = {
  args: {
    children: <MockDashboardContent />,
  },
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        story: 'AppShell with dark background to demonstrate theme compatibility.',
      },
    },
  },
};

// Minimal content to show layout structure
export const LayoutStructure: Story = {
  args: {
    children: (
      <div className="space-y-6">
        <div className="flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-blue-300 bg-linear-to-r from-blue-100 to-indigo-100">
          <p className="font-medium text-gray-800 dark:text-gray-200">Main Content Area</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-green-300 bg-linear-to-r from-green-100 to-emerald-100">
            <p className="font-medium text-green-800">Content Block 1</p>
          </div>
          <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-purple-300 bg-linear-to-r from-purple-100 to-pink-100">
            <p className="font-medium text-gray-800 dark:text-gray-200">Content Block 2</p>
          </div>
        </div>
        <div className="flex h-48 items-center justify-center rounded-xl border-2 border-dashed border-yellow-300 bg-linear-to-r from-yellow-100 to-orange-100">
          <p className="font-medium text-orange-800">Large Content Section</p>
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Visual representation of the AppShell layout structure with colored content blocks.',
      },
    },
  },
};
