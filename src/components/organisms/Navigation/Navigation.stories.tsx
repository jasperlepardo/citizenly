import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
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
- **Icon Support** - SVG icons for visual navigation cues
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

// Custom icons for stories
const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
    />
  </svg>
);

const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
    />
  </svg>
);

const ChartBarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
    />
  </svg>
);

const CogIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a6.759 6.759 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

// Mock navigation items
const defaultNavItems: NavigationItem[] = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: HomeIcon,
    description: 'Main dashboard and overview' 
  },
  { 
    name: 'Residents', 
    href: '/residents', 
    icon: UsersIcon,
    description: 'Manage resident records',
    children: [
      { name: 'All Residents', href: '/residents' },
      { name: 'Add Resident', href: '/residents/add' },
      { name: 'Import Data', href: '/residents/import' },
    ]
  },
  { 
    name: 'Reports', 
    href: '/reports', 
    icon: ChartBarIcon,
    description: 'Analytics and reports',
    children: [
      { name: 'Demographics', href: '/reports/demographics' },
      { name: 'Sectoral', href: '/reports/sectoral' },
      { name: 'Household', href: '/reports/household' },
    ]
  },
];

const bottomNavItems: NavigationItem[] = [
  { 
    name: 'Settings', 
    href: '/settings', 
    icon: CogIcon,
    description: 'Application settings' 
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
        story: 'Default navigation with main items and bottom items. Shows icons and supports submenu expansion.',
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
        story: 'Navigation with an active item highlighted. The active state is automatically managed based on the current route.',
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
        icon: CogIcon,
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
    (Story) => (
      <div className="w-64 h-96 bg-gray-50 border border-gray-200 rounded-lg p-4">
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
        icon: HomeIcon,
        description: 'Barangay overview' 
      },
      { 
        name: 'Mga Residente', 
        href: '/residents', 
        icon: UsersIcon,
        description: 'Resident management',
        children: [
          { name: 'Lahat ng Residente', href: '/residents' },
          { name: 'Dagdag Residente', href: '/residents/add' },
          { name: 'Pamilyang Records', href: '/residents/households' },
        ]
      },
      { 
        name: 'Mga Ulat', 
        href: '/reports', 
        icon: ChartBarIcon,
        description: 'Reports and analytics',
        children: [
          { name: 'Demographics', href: '/reports/demographics' },
          { name: 'Sectoral Groups', href: '/reports/sectoral' },
          { name: 'Barangay Profile', href: '/reports/profile' },
        ]
      },
    ];

    const barangayBottomItems: NavigationItem[] = [
      { 
        name: 'Settings', 
        href: '/settings', 
        icon: CogIcon 
      },
    ];

    return (
      <div className="w-72 h-96 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Barangay San Lorenzo</h2>
          <p className="text-sm text-gray-500">Makati City, Metro Manila</p>
        </div>
        <div className="p-4">
          <Navigation 
            items={barangayNavItems}
            bottomItems={barangayBottomItems}
          />
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
    (Story) => (
      <div className="w-80 h-screen bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Citizenly</h1>
          <p className="text-sm text-gray-500">Barangay Management</p>
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
        icon: HomeIcon 
      },
      { 
        name: 'Residents', 
        href: '/residents', 
        icon: UsersIcon,
        children: [
          { name: 'All Residents (1,234)', href: '/residents' },
          { name: 'Pending Approval (5)', href: '/residents/pending' },
          { name: 'New Registrations (12)', href: '/residents/new' },
        ]
      },
      { 
        name: 'Reports', 
        href: '/reports', 
        icon: ChartBarIcon,
        children: [
          { name: 'Demographics', href: '/reports/demographics' },
          { name: 'Monthly Report (Due)', href: '/reports/monthly' },
        ]
      },
    ];

    return (
      <div className="w-80 space-y-4">
        <Navigation 
          items={notificationNavItems}
          bottomItems={bottomNavItems}
          showSubmenu={true}
        />
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
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
    (Story) => (
      <div className="dark">
        <div className="w-72 h-96 bg-gray-900 border border-gray-700 rounded-lg p-4">
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