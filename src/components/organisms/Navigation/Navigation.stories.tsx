import type { Meta, StoryObj } from '@storybook/react';
import { action } from 'storybook/actions';
import Navigation, { NavigationItem } from './Navigation';

const meta: Meta<typeof Navigation> = {
  title: 'Organisms/Navigation',
  component: Navigation,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
A unified navigation component that consolidates navigation patterns from dashboard and app layouts. Features include:

- **Hierarchical Structure** - Main navigation with optional sub-items
- **Active State Management** - Automatic highlighting of current page
- **Icon Support** - FontAwesome 6 icons for visual navigation cues
- **Flexible Layout** - Supports both main and bottom navigation sections
- **Accessibility** - Proper ARIA attributes and keyboard navigation
- **Responsive Design** - Adapts to different screen sizes

The component uses Next.js routing and provides a consistent navigation experience across the application.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    items: {
      description: 'Main navigation items array',
    },
    bottomItems: {
      description: 'Bottom navigation items array',
    },
    showIcons: {
      control: 'boolean',
      description: 'Whether to show navigation icons',
    },
    showSubmenu: {
      control: 'boolean',
      description: 'Whether to show submenu items',
    },
    variant: {
      control: 'radio',
      options: ['default', 'compact', 'minimal'],
      description: 'Navigation variant style',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Navigation now uses FontAwesome 6 icons

// Mock navigation items
const defaultNavItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
    description: 'Main dashboard and overview',
  },
  {
    name: 'Residents',
    href: '/residents',
    icon: 'users',
    description: 'Manage resident records',
    children: [
      { name: 'All Residents', href: '/residents' },
      { name: 'Add Resident', href: '/residents/add' },
      { name: 'Import Data', href: '/residents/import' },
    ],
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: 'chart-bar',
    description: 'Analytics and reports',
    children: [
      { name: 'Demographics', href: '/reports/demographics' },
      { name: 'Sectoral', href: '/reports/sectoral' },
      { name: 'Household', href: '/reports/household' },
    ],
  },
];

const bottomNavItems: NavigationItem[] = [
  {
    name: 'Settings',
    href: '/settings',
    icon: 'settings',
    description: 'Application settings',
  },
];

export const Default: Story = {
  args: {
    items: defaultNavItems,
    bottomItems: bottomNavItems,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Default navigation with main items and bottom items. Shows icons and supports submenu expansion.',
      },
    },
  },
};

export const WithActiveItem: Story = {
  args: {
    items: defaultNavItems,
    bottomItems: bottomNavItems,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Navigation with an active item highlighted. The active state is automatically managed based on the current route.',
      },
    },
    nextjs: {
      router: {
        pathname: '/residents',
      },
    },
  },
};

export const WithSubmenus: Story = {
  args: {
    items: [
      ...defaultNavItems,
      {
        name: 'Administration',
        href: '/admin',
        icon: 'settings',
        children: [
          { name: 'User Management', href: '/admin/users' },
          { name: 'Role Management', href: '/admin/roles' },
          { name: 'System Logs', href: '/admin/logs' },
          { name: 'Backup & Restore', href: '/admin/backup' },
        ],
      },
    ],
    bottomItems: bottomNavItems,
    showSubmenu: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Navigation with expanded submenus showing hierarchical organization.',
      },
    },
    nextjs: {
      router: {
        pathname: '/admin/users',
      },
    },
  },
};

export const Minimal: Story = {
  args: {
    items: defaultNavItems.map(item => ({ ...item, icon: undefined })),
    bottomItems: bottomNavItems.map(item => ({ ...item, icon: undefined })),
    showIcons: false,
    variant: 'minimal',
  },
  parameters: {
    docs: {
      description: {
        story: 'Minimal navigation variant without icons for clean, text-only appearance.',
      },
    },
  },
};

export const CompactLayout: Story = {
  args: {
    items: defaultNavItems,
    bottomItems: [],
    variant: 'compact',
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact navigation layout with reduced spacing, suitable for sidebars.',
      },
    },
  },
  decorators: [
    Story => (
      <div className="h-96 w-64 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <Story />
      </div>
    ),
  ],
};

export const BarangayNavigation: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Barangay-specific navigation with local government modules and Filipino context.',
      },
    },
  },
  render: () => {
    const barangayNavItems: NavigationItem[] = [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: 'home',
        description: 'Barangay overview',
      },
      {
        name: 'Mga Residente',
        href: '/residents',
        icon: 'users',
        description: 'Resident management',
        children: [
          { name: 'Lahat ng Residente', href: '/residents' },
          { name: 'Dagdag Residente', href: '/residents/add' },
          { name: 'Pamilyang Records', href: '/residents/households' },
        ],
      },
      {
        name: 'Mga Ulat',
        href: '/reports',
        icon: 'chart-bar',
        description: 'Reports and analytics',
        children: [
          { name: 'Demographics', href: '/reports/demographics' },
          { name: 'Sectoral Groups', href: '/reports/sectoral' },
          { name: 'Barangay Profile', href: '/reports/profile' },
        ],
      },
    ];

    const barangayBottomItems: NavigationItem[] = [
      {
        name: 'Settings',
        href: '/settings',
        icon: 'settings',
      },
    ];

    return (
      <div className="h-96 w-72 rounded-lg border border-gray-200 bg-white shadow-xs">
        <div className="border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Barangay San Lorenzo</h2>
          <p className="text-sm text-gray-500 dark:text-gray-500">Makati City, Metro Manila</p>
        </div>
        <div className="p-4">
          <Navigation items={barangayNavItems} bottomItems={barangayBottomItems} />
        </div>
      </div>
    );
  },
};

export const MobileNavigation: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Mobile-optimized navigation layout with touch-friendly spacing.',
      },
    },
  },
  decorators: [
    Story => (
      <div className="h-screen w-80 border-r border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Citizenly</h1>
          <p className="text-sm text-gray-500 dark:text-gray-500">Barangay Management</p>
        </div>
        <div className="p-4">
          <Story />
        </div>
      </div>
    ),
  ],
  args: {
    items: defaultNavItems,
    bottomItems: bottomNavItems,
  },
};

export const WithNotifications: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Navigation with notification badges and status indicators.',
      },
    },
  },
  render: () => {
    const notificationNavItems: NavigationItem[] = [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: 'home',
      },
      {
        name: 'Residents',
        href: '/residents',
        icon: 'users',
        children: [
          { name: 'All Residents (1,234)', href: '/residents' },
          { name: 'Pending Approval (5)', href: '/residents/pending' },
          { name: 'New Registrations (12)', href: '/residents/new' },
        ],
      },
      {
        name: 'Reports',
        href: '/reports',
        icon: 'chart-bar',
        children: [
          { name: 'Demographics', href: '/reports/demographics' },
          { name: 'Monthly Report (Due)', href: '/reports/monthly' },
        ],
      },
    ];

    return (
      <div className="w-80 space-y-4">
        <Navigation items={notificationNavItems} bottomItems={bottomNavItems} showSubmenu={true} />
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
          <p className="text-sm text-yellow-800">
            <strong>5</strong> residents pending approval
          </p>
        </div>
      </div>
    );
  },
};

export const DarkTheme: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Navigation with dark theme styling.',
      },
    },
  },
  decorators: [
    Story => (
      <div className="dark">
        <div className="h-96 w-72 rounded-lg border border-gray-700 bg-gray-900 p-4">
          <Story />
        </div>
      </div>
    ),
  ],
  args: {
    items: defaultNavItems,
    bottomItems: bottomNavItems,
  },
};
