import type { Meta, StoryObj } from '@storybook/react';
import Sidebar from '@/components/organisms/Sidebar';
import { NavigationItem } from '@/components/Navigation/Navigation';

// Mock navigation items
const mockNavigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: ({ className }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
        />
      </svg>
    ),
  },
  {
    name: 'Residents',
    href: '/residents',
    icon: ({ className }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
        />
      </svg>
    ),
    children: [
      { name: 'All Residents', href: '/residents' },
      { name: 'Add Resident', href: '/residents/new' },
      { name: 'Import Residents', href: '/residents/import' },
    ],
  },
  {
    name: 'Households',
    href: '/households',
    icon: ({ className }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m1.5.5-1.5-.5M6.75 7.364V3h-3v18m3-13.636 10.5-3.819"
        />
      </svg>
    ),
  },
  {
    name: 'Businesses',
    href: '/businesses',
    icon: ({ className }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 21h19.5m-18-18v18m2.25-18v18m13.5-18v18m2.25-18v18M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
        />
      </svg>
    ),
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: ({ className }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
        />
      </svg>
    ),
    children: [
      { name: 'Population Report', href: '/reports/population' },
      { name: 'Demographics', href: '/reports/demographics' },
      { name: 'Business Registry', href: '/reports/business' },
    ],
  },
];

const mockBottomNavigation: NavigationItem[] = [
  {
    name: 'Settings',
    href: '/settings',
    icon: ({ className }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a6.759 6.759 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        />
      </svg>
    ),
  },
  {
    name: 'Help',
    href: '/help',
    icon: ({ className }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.879 7.519c0-1.628 1.32-2.948 2.948-2.948s2.948 1.32 2.948 2.948c0 1.628-1.32 2.948-2.948 2.948s-2.948-1.32-2.948-2.948zM12 16.5V14m0 0V9.75m0 4.25h.008v.008H12v-.008z"
        />
      </svg>
    ),
  },
];

// Mock logo component
const MockLogo = () => (
  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 dark:bg-blue-500">
    <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" />
    </svg>
  </div>
);

// Mock footer component
const MockFooter = () => (
  <div className="text-center">
    <div className="mb-2 flex items-center justify-center space-x-2">
      <div className="h-2 w-2 rounded-full bg-green-400"></div>
      <span className="text-xs text-gray-600 dark:text-gray-400">System Online</span>
    </div>
    <p className="text-xs text-gray-500 dark:text-gray-400">v2.1.0 | Barangay Anuling Cerca I</p>
  </div>
);

const meta: Meta<typeof Sidebar> = {
  title: 'Organisms/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A comprehensive sidebar navigation component for Philippine barangay management systems. Features collapsible design, mobile responsiveness, and government-compliant styling.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Controls the width of the sidebar',
    },
    position: {
      control: 'select',
      options: ['fixed', 'sticky', 'relative'],
      description: 'Positioning behavior of the sidebar',
    },
    mobile: {
      control: 'select',
      options: ['hidden', 'overlay', 'push'],
      description: 'Mobile display behavior',
    },
    collapsible: {
      control: 'boolean',
      description: 'Enable collapse/expand functionality',
    },
    defaultCollapsed: {
      control: 'boolean',
      description: 'Initial collapsed state',
    },
    showSubmenu: {
      control: 'boolean',
      description: 'Show navigation submenus',
    },
    showIcons: {
      control: 'boolean',
      description: 'Show navigation icons',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

// Default sidebar with Philippine government styling
export const Default: Story = {
  args: {
    navigationItems: mockNavigation,
    bottomNavigationItems: mockBottomNavigation,
    logo: <MockLogo />,
    title: 'Citizenly',
    subtitle: 'Barangay Management System',
    footer: <MockFooter />,
    size: 'md',
    position: 'relative',
    collapsible: true,
    defaultCollapsed: false,
    showSubmenu: true,
    showIcons: true,
  },
  decorators: [
    Story => (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Story />
        <div className="flex-1 p-6">
          <div className="h-full rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
              Main Content Area
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              This is the main content area. The sidebar provides navigation for the Philippine
              barangay management system.
            </p>
          </div>
        </div>
      </div>
    ),
  ],
};

// Collapsed sidebar
export const Collapsed: Story = {
  args: {
    ...Default.args,
    defaultCollapsed: true,
  },
  decorators: Default.decorators,
};

// Small width sidebar (icon-only mode)
export const IconOnly: Story = {
  args: {
    ...Default.args,
    size: 'sm',
    collapsible: false,
  },
  decorators: Default.decorators,
};

// Large width sidebar
export const Wide: Story = {
  args: {
    ...Default.args,
    size: 'lg',
  },
  decorators: Default.decorators,
};

// Fixed position sidebar
export const Fixed: Story = {
  args: {
    ...Default.args,
    position: 'fixed',
  },
  decorators: [
    Story => (
      <div className="h-screen bg-gray-50 dark:bg-gray-900">
        <Story />
        <div className="ml-64 p-6">
          <div className="h-full rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
              Fixed Sidebar Layout
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Content adjusts with fixed sidebar positioning.
            </p>
          </div>
        </div>
      </div>
    ),
  ],
};

// Minimal sidebar without icons
export const NoIcons: Story = {
  args: {
    ...Default.args,
    showIcons: false,
  },
  decorators: Default.decorators,
};

// Sidebar without submenus
export const NoSubmenus: Story = {
  args: {
    ...Default.args,
    showSubmenu: false,
  },
  decorators: Default.decorators,
};

// Sidebar with custom content
export const CustomContent: Story = {
  args: {
    logo: <MockLogo />,
    title: 'Custom Sidebar',
    subtitle: 'With Custom Content',
    footer: <MockFooter />,
    size: 'md',
    position: 'relative',
    collapsible: true,
    children: (
      <div className="space-y-6">
        <div>
          <h3 className="mb-3 text-sm font-medium text-gray-900 dark:text-gray-100">Quick Stats</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
              <span className="text-sm text-gray-600 dark:text-gray-300">Total Residents</span>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">2,847</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
              <span className="text-sm text-gray-600 dark:text-gray-300">Households</span>
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">892</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
              <span className="text-sm text-gray-600 dark:text-gray-300">Businesses</span>
              <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                156
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium text-gray-900 dark:text-gray-100">
            Recent Activity
          </h3>
          <div className="space-y-2">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              New resident registered - Maria Santos
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Business permit issued - Sari-Sari Store
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Household updated - Family Cruz
            </div>
          </div>
        </div>
      </div>
    ),
  },
  decorators: Default.decorators,
};

// Mobile overlay behavior (simulated)
export const MobileOverlay: Story = {
  args: {
    ...Default.args,
    mobile: 'overlay',
    mobileOpen: true,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  decorators: [
    Story => (
      <div className="h-screen bg-gray-50 lg:flex dark:bg-gray-900">
        <Story />
        <div className="flex-1 p-4 lg:p-6">
          <div className="h-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:p-6 dark:border-gray-700 dark:bg-gray-800">
            <h1 className="mb-4 text-xl font-bold text-gray-900 lg:text-2xl dark:text-gray-100">
              Mobile View
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              On mobile devices, the sidebar displays as an overlay. Toggle to see the effect.
            </p>
          </div>
        </div>
      </div>
    ),
  ],
};

// Philippine Government themed sidebar
export const GovernmentTheme: Story = {
  args: {
    navigationItems: [
      {
        name: 'Tablero',
        href: '/dashboard',
        icon: ({ className }) => (
          <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
            />
          </svg>
        ),
      },
      {
        name: 'Mga Residente',
        href: '/residents',
        icon: ({ className }) => (
          <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
            />
          </svg>
        ),
      },
      {
        name: 'Mga Sambahayan',
        href: '/households',
        icon: ({ className }) => (
          <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m1.5.5-1.5-.5M6.75 7.364V3h-3v18m3-13.636 10.5-3.819"
            />
          </svg>
        ),
      },
      {
        name: 'Mga Sertipiko',
        href: '/certifications',
        icon: ({ className }) => (
          <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
            />
          </svg>
        ),
      },
    ],
    bottomNavigationItems: [
      {
        name: 'Mga Setting',
        href: '/settings',
        icon: ({ className }) => (
          <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a6.759 6.759 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
        ),
      },
    ],
    logo: (
      <div className="flex h-8 w-8 items-center justify-center">
        <div className="flex space-x-0.5">
          <div className="h-6 w-2 bg-blue-600 dark:bg-blue-500"></div>
          <div className="h-6 w-2 bg-red-600 dark:bg-red-500"></div>
          <div className="h-6 w-2 bg-yellow-500 dark:bg-yellow-400"></div>
        </div>
      </div>
    ),
    title: 'Sistema ng Barangay',
    subtitle: 'Anuling Cerca I, Mendez, Cavite',
    footer: (
      <div className="text-center">
        <div className="mb-2 flex items-center justify-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-green-400"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Online</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">Bersyon 2.1.0 | DILG Approved</p>
      </div>
    ),
    size: 'md',
    position: 'relative',
    collapsible: true,
    defaultCollapsed: false,
    showSubmenu: true,
    showIcons: true,
  },
  decorators: Default.decorators,
  parameters: {
    docs: {
      description: {
        story:
          'Philippine government themed sidebar with Filipino language navigation items and flag-inspired logo design.',
      },
    },
  },
};

// Dark mode demonstration
export const DarkMode: Story = {
  args: {
    ...Default.args,
  },
  decorators: [
    Story => (
      <div className="dark">
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
          <Story />
          <div className="flex-1 p-6">
            <div className="h-full rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
                Dark Mode
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                The sidebar supports dark mode with proper contrast and Philippine government
                accessibility standards.
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Sidebar in dark mode with proper contrast ratios and accessibility compliance.',
      },
    },
  },
};
