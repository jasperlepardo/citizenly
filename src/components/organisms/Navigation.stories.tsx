import type { Meta, StoryObj } from '@storybook/react';
import Navigation, { type NavigationItem } from './Navigation';

const meta = {
  title: 'Organisms/Navigation',
  component: Navigation,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A unified navigation component that provides consistent navigation patterns across the RBI System. Supports icons, submenus, active states, and different variants for various use cases.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'compact', 'minimal'],
    },
    showIcons: {
      control: 'boolean',
    },
    showSubmenu: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Navigation>;

export default meta;
type Story = StoryObj<typeof meta>;

// Custom navigation items for stories
const sampleMainNavigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    description: 'Main dashboard overview',
  },
  {
    name: 'Residents',
    href: '/residents',
    description: 'Manage resident information',
  },
  {
    name: 'Households',
    href: '/households',
    description: 'Household management',
  },
  {
    name: 'Reports',
    href: '/reports',
    description: 'Generate and view reports',
    children: [
      { name: 'RBI Form A', href: '/rbi-form' },
      { name: 'Monthly Report', href: '/reports/monthly' },
      { name: 'Annual Report', href: '/reports/annual' },
    ],
  },
];

const sampleBottomNavigation: NavigationItem[] = [
  { name: 'Help', href: '/help' },
  { name: 'Settings', href: '/settings' },
];

export const Default: Story = {
  args: {},
};

export const WithoutIcons: Story = {
  args: {
    showIcons: false,
  },
};

export const WithoutSubmenus: Story = {
  args: {
    showSubmenu: false,
  },
};

export const CustomItems: Story = {
  args: {
    items: sampleMainNavigation,
    bottomItems: sampleBottomNavigation,
  },
};

export const MinimalVariant: Story = {
  args: {
    variant: 'minimal',
    items: sampleMainNavigation.slice(0, 3), // Show fewer items
    bottomItems: [],
  },
};

export const CompactVariant: Story = {
  args: {
    variant: 'compact',
    showIcons: true,
    showSubmenu: false,
  },
};

export const OnlyMainNavigation: Story = {
  args: {
    bottomItems: [],
  },
};

export const OnlyBottomNavigation: Story = {
  args: {
    items: [],
    bottomItems: sampleBottomNavigation,
  },
};

// Navigation with active states simulation
export const WithActiveStates: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold text-primary mb-4">Dashboard Active</h3>
        <div className="bg-surface border border-default rounded-lg p-4">
          <Navigation />
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-primary mb-4">Reports with Submenu Active</h3>
        <div className="bg-surface border border-default rounded-lg p-4">
          <Navigation />
        </div>
      </div>
    </div>
  ),
};

// Different layout containers
export const InSidebar: Story = {
  render: () => (
    <div className="flex h-96">
      <div className="w-64 bg-surface border-r border-default p-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-primary">RBI System</h2>
        </div>
        <Navigation />
      </div>
      <div className="flex-1 p-6 bg-background">
        <p className="text-secondary">Main content area</p>
      </div>
    </div>
  ),
};

export const InMobileMenu: Story = {
  render: () => (
    <div className="max-w-sm">
      <div className="bg-surface border border-default rounded-lg p-4">
        <div className="mb-4 pb-4 border-b border-default">
          <h2 className="text-lg font-semibold text-primary">Menu</h2>
        </div>
        <Navigation showSubmenu={false} />
      </div>
    </div>
  ),
};

// Custom navigation structure
export const CustomStructure: Story = {
  args: {
    items: [
      {
        name: 'Administration',
        href: '/admin',
        children: [
          { name: 'Users', href: '/admin/users' },
          { name: 'Roles', href: '/admin/roles' },
          { name: 'Permissions', href: '/admin/permissions' },
        ],
      },
      {
        name: 'Records',
        href: '/records',
        children: [
          { name: 'Birth Certificates', href: '/records/birth' },
          { name: 'Death Certificates', href: '/records/death' },
          { name: 'Marriage Certificates', href: '/records/marriage' },
        ],
      },
      {
        name: 'Services',
        href: '/services',
        children: [
          { name: 'Barangay Clearance', href: '/services/clearance' },
          { name: 'Business Permit', href: '/services/business' },
          { name: 'Residency Certificate', href: '/services/residency' },
        ],
      },
    ],
    bottomItems: [{ name: 'Logout', href: '/logout' }],
  },
};

// Navigation states showcase
export const NavigationStates: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="font-semibold text-primary mb-4">With Icons</h3>
        <div className="bg-surface border border-default rounded-lg p-4">
          <Navigation items={sampleMainNavigation.slice(0, 3)} bottomItems={[]} showIcons={true} />
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-primary mb-4">Without Icons</h3>
        <div className="bg-surface border border-default rounded-lg p-4">
          <Navigation items={sampleMainNavigation.slice(0, 3)} bottomItems={[]} showIcons={false} />
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-primary mb-4">With Submenus</h3>
        <div className="bg-surface border border-default rounded-lg p-4">
          <Navigation
            items={[sampleMainNavigation[3]]} // Reports item with children
            bottomItems={[]}
            showSubmenu={true}
          />
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-primary mb-4">Without Submenus</h3>
        <div className="bg-surface border border-default rounded-lg p-4">
          <Navigation
            items={[sampleMainNavigation[3]]} // Reports item with children
            bottomItems={[]}
            showSubmenu={false}
          />
        </div>
      </div>
    </div>
  ),
};

// Full-height navigation example
export const FullHeight: Story = {
  render: () => (
    <div className="h-96 w-64 bg-surface border border-default rounded-lg overflow-hidden">
      <div className="p-4 border-b border-default">
        <h2 className="text-lg font-semibold text-primary">RBI System</h2>
        <p className="text-sm text-secondary">Barangay Management</p>
      </div>
      <div className="p-4 h-full">
        <Navigation />
      </div>
    </div>
  ),
};
