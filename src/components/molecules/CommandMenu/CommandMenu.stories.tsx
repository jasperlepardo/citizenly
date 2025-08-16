import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { CommandMenu } from './CommandMenu';
import type { CommandMenuItem } from './types';

// Storybook wrapper to show the command menu in an open state
function StorybookCommandMenuWrapper({ 
  items, 
  ...props 
}: { 
  items: CommandMenuItem[];
  placeholder?: string;
  maxResults?: number;
  showShortcuts?: boolean;
  showRecentSection?: boolean;
  size?: 'sm' | 'md' | 'lg';
  emptyStateText?: string;
}) {
  return (
    <div className="relative">
      {/* Trigger button for demonstration */}
      <div className="flex flex-col items-center justify-center min-h-[300px] bg-gray-50 dark:bg-gray-900 rounded-lg p-8">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Command Menu Demo
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Press <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">⌘K</kbd> or{' '}
            <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Ctrl+K</kbd> to open the command menu
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Use arrow keys to navigate, Enter to select, Esc to close
          </p>
        </div>
      </div>
      
      {/* The actual CommandMenu component */}
      <CommandMenu items={items} {...props} />
    </div>
  );
}

// Icon components for demo
const Icons = {
  Home: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Users: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  ),
  Building: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Chart: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Plus: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  ),
  Settings: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Download: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
};

// Sample command menu items for barangay system
const sampleItems: CommandMenuItem[] = [
  // Navigation
  {
    id: 'nav-dashboard',
    label: 'Dashboard',
    description: 'View overview and statistics',
    icon: Icons.Home,
    group: 'Navigation',
    href: '/dashboard',
    keywords: ['home', 'overview', 'stats'],
    shortcut: ['⌘', '1'],
  },
  {
    id: 'nav-residents',
    label: 'Residents',
    description: 'Manage resident records',
    icon: Icons.Users,
    group: 'Navigation',
    href: '/residents',
    keywords: ['people', 'citizens', 'records'],
    shortcut: ['⌘', '2'],
  },
  {
    id: 'nav-households',
    label: 'Households',
    description: 'Manage household information',
    icon: Icons.Building,
    group: 'Navigation',
    href: '/households',
    keywords: ['families', 'homes', 'address'],
    shortcut: ['⌘', '3'],
  },
  {
    id: 'nav-reports',
    label: 'Reports',
    description: 'Generate and view reports',
    icon: Icons.Chart,
    group: 'Navigation',
    href: '/reports',
    keywords: ['analytics', 'statistics', 'data'],
    shortcut: ['⌘', '4'],
  },

  // Actions
  {
    id: 'action-add-resident',
    label: 'Add New Resident',
    description: 'Register a new resident',
    icon: Icons.Plus,
    group: 'Actions',
    href: '/residents/create',
    keywords: ['register', 'new', 'create'],
    shortcut: ['⌘', 'N'],
  },
  {
    id: 'action-create-household',
    label: 'Create Household',
    description: 'Add a new household record',
    icon: Icons.Plus,
    group: 'Actions',
    href: '/households/create',
    keywords: ['new', 'family', 'create'],
  },
  {
    id: 'action-export-residents',
    label: 'Export Resident Data',
    description: 'Download resident information',
    icon: Icons.Download,
    group: 'Actions',
    keywords: ['download', 'csv', 'export'],
    onClick: () => console.log('Exporting residents...'),
  },
  {
    id: 'action-settings',
    label: 'Settings',
    description: 'Configure system preferences',
    icon: Icons.Settings,
    group: 'Actions',
    href: '/settings',
    keywords: ['config', 'preferences', 'admin'],
    shortcut: ['⌘', ','],
  },

  // Recent items
  {
    id: 'recent-juan-dela-cruz',
    label: 'Juan Dela Cruz',
    description: 'Resident ID: 2024-001',
    avatar: {
      src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      alt: 'Juan Dela Cruz',
      fallback: 'JD',
    },
    group: 'Recent',
    href: '/residents/1',
    recent: true,
    keywords: ['juan', 'dela', 'cruz'],
  },
  {
    id: 'recent-maria-santos',
    label: 'Maria Santos',
    description: 'Resident ID: 2024-002',
    avatar: {
      src: 'https://images.unsplash.com/photo-1494790108755-2616b612b142?w=100&h=100&fit=crop&crop=face',
      alt: 'Maria Santos',
      fallback: 'MS',
    },
    group: 'Recent',
    href: '/residents/2',
    recent: true,
    keywords: ['maria', 'santos'],
  },
  {
    id: 'recent-household-123',
    label: 'Household #123',
    description: '123 Main Street, Barangay Centro',
    icon: Icons.Building,
    group: 'Recent',
    href: '/households/123',
    recent: true,
    keywords: ['household', '123', 'main', 'street'],
  },
];

const meta: Meta<typeof StorybookCommandMenuWrapper> = {
  title: 'Molecules/CommandMenu',
  component: StorybookCommandMenuWrapper,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A powerful command menu component for quick navigation and actions, inspired by modern applications like Raycast and Linear. Supports keyboard shortcuts, fuzzy search, and grouped menu items.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    items: {
      description: 'Array of command menu items',
      control: { type: 'object' },
    },
    placeholder: {
      description: 'Placeholder text for the search input',
      control: { type: 'text' },
    },
    maxResults: {
      description: 'Maximum number of results to show',
      control: { type: 'number' },
    },
    showShortcuts: {
      description: 'Whether to show keyboard shortcuts',
      control: { type: 'boolean' },
    },
    showRecentSection: {
      description: 'Whether to show a separate recent section',
      control: { type: 'boolean' },
    },
    size: {
      description: 'Size of the command menu dialog',
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: sampleItems,
    placeholder: 'Search for anything...',
    maxResults: 10,
    showShortcuts: true,
    showRecentSection: true,
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Default command menu with navigation, actions, and recent items. Press ⌘K (or Ctrl+K) to open.',
      },
    },
  },
};

export const NavigationOnly: Story = {
  args: {
    items: sampleItems.filter(item => item.group === 'Navigation'),
    placeholder: 'Navigate to...',
    showRecentSection: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Command menu with only navigation items.',
      },
    },
  },
};

export const ActionsOnly: Story = {
  args: {
    items: sampleItems.filter(item => item.group === 'Actions'),
    placeholder: 'Run command...',
    showShortcuts: true,
    showRecentSection: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Command menu focused on actions and commands.',
      },
    },
  },
};

export const WithRecents: Story = {
  args: {
    items: sampleItems.filter(item => item.recent || item.group === 'Navigation'),
    placeholder: 'Search recent items...',
    showRecentSection: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Command menu highlighting recent items separately.',
      },
    },
  },
};

export const Compact: Story = {
  args: {
    items: sampleItems,
    placeholder: 'Quick search...',
    size: 'sm',
    maxResults: 6,
    showShortcuts: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact version of the command menu with fewer results and no shortcuts.',
      },
    },
  },
};

export const Large: Story = {
  args: {
    items: sampleItems,
    placeholder: 'Search everything...',
    size: 'lg',
    maxResults: 15,
    showShortcuts: true,
    showRecentSection: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Large command menu with more results and full feature set.',
      },
    },
  },
};

export const Empty: Story = {
  args: {
    items: [],
    placeholder: 'Nothing to search...',
    emptyStateText: 'No commands available',
  },
  parameters: {
    docs: {
      description: {
        story: 'Command menu with no items to demonstrate empty state.',
      },
    },
  },
};