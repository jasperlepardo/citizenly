import * as React from 'react';

import type { CommandMenuSearchResult } from '../../types/hooks';

// Icon helper function - creates React components for SVG icons
const createIcon =
  (path: string) =>
  ({ className }: { className?: string }) =>
    React.createElement(
      'svg',
      {
        className,
        fill: 'none',
        stroke: 'currentColor',
        viewBox: '0 0 24 24',
      },
      React.createElement('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: 2,
        d: path,
      })
    );

// Icons for command menu items
export const Icons = {
  Home: createIcon(
    'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
  ),
  Users: createIcon(
    'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
  ),
  Building: createIcon(
    'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
  ),
  Chart: createIcon(
    'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
  ),
  Plus: createIcon('M12 6v6m0 0v6m0-6h6m-6 0H6'),
  Settings: createIcon(
    'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z'
  ),
  Download: createIcon('M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'),
  Upload: createIcon(
    'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
  ),
  Certificate: createIcon('M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'),
  Search: createIcon('M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'),
  FileText: createIcon(
    'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
  ),
  UserGroup: createIcon(
    'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
  ),
  ClipboardList: createIcon(
    'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
  ),
  Filter: createIcon(
    'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z'
  ),
  Heart: createIcon(
    'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
  ),
  Shield: createIcon(
    'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
  ),
  Calendar: createIcon(
    'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
  ),
  Bell: createIcon(
    'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
  ),
  Globe: createIcon(
    'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  ),
};

// Base command menu items for the barangay system
export const getCommandMenuItems = (): CommandMenuSearchResult[] => [
  // Navigation Group
  {
    id: 'nav-dashboard',
    title: 'Dashboard',
    subtitle: 'View overview and statistics',
    icon: Icons.Home,
    group: 'Navigation',
    href: '/dashboard',
    keywords: ['home', 'overview', 'stats', 'main'],
    shortcut: ['⌘', '1'],
    data: { href: '/dashboard' },
    score: 1.0,
    type: 'navigation',
  },
  {
    id: 'nav-residents',
    title: 'Residents',
    subtitle: 'Manage resident records',
    icon: Icons.Users,
    group: 'Navigation',
    href: '/residents',
    keywords: ['people', 'citizens', 'records', 'population'],
    shortcut: ['⌘', '2'],
    data: { href: '/residents' },
    score: 1.0,
    type: 'navigation',
  },
  {
    id: 'nav-households',
    title: 'Households',
    subtitle: 'Manage household information',
    icon: Icons.Building,
    group: 'Navigation',
    href: '/households',
    keywords: ['families', 'homes', 'address', 'dwelling'],
    shortcut: ['⌘', '3'],
    data: { href: '/households' },
    score: 1.0,
    type: 'navigation',
  },
  {
    id: 'nav-reports',
    title: 'Reports',
    subtitle: 'Generate and view reports',
    icon: Icons.Chart,
    group: 'Navigation',
    href: '/reports',
    keywords: ['analytics', 'statistics', 'data', 'charts'],
    shortcut: ['⌘', '4'],
    data: { href: '/reports' },
    score: 1.0,
    type: 'navigation',
  },
  {
    id: 'nav-certifications',
    title: 'Certifications',
    subtitle: 'Manage certificates and clearances',
    icon: Icons.Certificate,
    group: 'Navigation',
    href: '/certification',
    keywords: ['certificates', 'clearance', 'documents', 'barangay clearance'],
    shortcut: ['⌘', '5'],
    data: { href: '/certification' },
    score: 1.0,
    type: 'navigation',
  },
  {
    id: 'nav-settings',
    title: 'Settings',
    subtitle: 'Configure system preferences',
    icon: Icons.Settings,
    group: 'Navigation',
    href: '/settings',
    keywords: ['config', 'preferences', 'admin', 'configuration'],
    shortcut: ['⌘', ','],
    data: { href: '/settings' },
    score: 1.0,
    type: 'navigation',
  },

  // Quick Actions Group
  {
    id: 'action-add-resident',
    title: 'Add New Resident',
    subtitle: 'Register a new resident',
    icon: Icons.Plus,
    group: 'Quick Actions',
    href: '/residents/create',
    keywords: ['register', 'new', 'create', 'add resident'],
    shortcut: ['⌘', 'N'],
    data: { href: '/residents/create' },
    score: 1.0,
    type: 'action',
  },
  {
    id: 'action-create-household',
    title: 'Create Household',
    subtitle: 'Add a new household record',
    icon: Icons.Building,
    group: 'Quick Actions',
    href: '/households/create',
    keywords: ['new', 'family', 'create', 'household'],
    shortcut: ['⌘', 'Shift', 'H'],
    data: { href: '/households/create' },
    score: 1.0,
    type: 'action',
  },
  {
    id: 'action-rbi-form',
    title: 'RBI Registration Form',
    subtitle: 'Fill out resident basic information form',
    icon: Icons.ClipboardList,
    group: 'Quick Actions',
    href: '/reports/records-of-barangay-inhabitants-by-household',
    keywords: ['rbi', 'form', 'registration', 'basic information'],
    shortcut: ['⌘', 'R'],
    data: { href: '/reports/records-of-barangay-inhabitants-by-household' },
    score: 1.0,
    type: 'action',
  },

  // Search Group
  {
    id: 'search-residents',
    title: 'Search Residents',
    subtitle: 'Find residents by name or ID',
    icon: Icons.Search,
    group: 'Search',
    href: '/residents?focus=search',
    keywords: ['find', 'lookup', 'resident search'],
    data: { href: '/residents?focus=search' },
    score: 1.0,
    type: 'action',
  },
  {
    id: 'search-households',
    title: 'Search Households',
    subtitle: 'Find households by address or code',
    icon: Icons.Search,
    group: 'Search',
    href: '/households?focus=search',
    keywords: ['find', 'lookup', 'household search', 'address'],
    data: { href: '/households?focus=search' },
    score: 1.0,
    type: 'action',
  },
  {
    id: 'search-seniors',
    title: 'Find Senior Citizens',
    subtitle: 'Show all senior citizens (60+)',
    icon: Icons.UserGroup,
    group: 'Search',
    href: '/residents?filter=seniors',
    keywords: ['elderly', 'senior', '60+', 'seniors'],
    data: { href: '/residents?filter=seniors' },
    score: 1.0,
    type: 'action',
  },
  {
    id: 'search-pwd',
    title: 'Find PWDs',
    subtitle: 'Show persons with disabilities',
    icon: Icons.Heart,
    group: 'Search',
    href: '/residents?filter=pwd',
    keywords: ['disabled', 'pwd', 'persons with disabilities'],
    data: { href: '/residents?filter=pwd' },
    score: 1.0,
    type: 'action',
  },
  {
    id: 'search-solo-parents',
    title: 'Find Solo Parents',
    subtitle: 'Show registered solo parents',
    icon: Icons.Users,
    group: 'Search',
    href: '/residents?filter=solo-parents',
    keywords: ['single', 'solo', 'parent', 'single parent'],
    data: { href: '/residents?filter=solo-parents' },
    score: 1.0,
    type: 'action',
  },

  // Reports & Data Group
  {
    id: 'report-population',
    title: 'Population Report',
    subtitle: 'Generate demographic statistics',
    icon: Icons.Chart,
    group: 'Reports',
    href: '/reports/population',
    keywords: ['demographics', 'population', 'statistics'],
    data: { href: '/reports/population' },
    score: 1.0,
    type: 'action',
  },
  {
    id: 'report-households-summary',
    title: 'Household Summary',
    subtitle: 'Overview of all households',
    icon: Icons.Building,
    group: 'Reports',
    href: '/reports/households',
    keywords: ['household', 'summary', 'families'],
    data: { href: '/reports/households' },
    score: 1.0,
    type: 'action',
  },
  {
    id: 'export-residents',
    title: 'Export Resident Data',
    subtitle: 'Download resident information as CSV',
    icon: Icons.Download,
    group: 'Reports',
    keywords: ['download', 'csv', 'export', 'residents'],
    onClick: () => {
      // This would trigger the export functionality
      console.log('Exporting resident data...');
    },
    data: { action: 'export-residents' },
    score: 1.0,
    type: 'action',
  },
  {
    id: 'export-households',
    title: 'Export Household Data',
    subtitle: 'Download household information as CSV',
    icon: Icons.Download,
    group: 'Reports',
    keywords: ['download', 'csv', 'export', 'households'],
    onClick: () => {
      console.log('Exporting household data...');
    },
    data: { action: 'export-households' },
    score: 1.0,
    type: 'action',
  },

  // Certificates Group
  {
    id: 'cert-barangay-clearance',
    title: 'Barangay Clearance',
    subtitle: 'Issue barangay clearance certificate',
    icon: Icons.Certificate,
    group: 'Certificates',
    href: '/certification?type=clearance',
    keywords: ['clearance', 'certificate', 'barangay clearance'],
    data: { href: '/certification?type=clearance' },
    score: 1.0,
    type: 'action',
  },
  {
    id: 'cert-residency',
    title: 'Certificate of Residency',
    subtitle: 'Issue residency certificate',
    icon: Icons.FileText,
    group: 'Certificates',
    href: '/certification?type=residency',
    keywords: ['residency', 'certificate', 'proof of residence'],
    data: { href: '/certification?type=residency' },
    score: 1.0,
    type: 'action',
  },
  {
    id: 'cert-indigency',
    title: 'Certificate of Indigency',
    subtitle: 'Issue indigency certificate',
    icon: Icons.Shield,
    group: 'Certificates',
    href: '/certification?type=indigency',
    keywords: ['indigency', 'certificate', 'low income'],
    data: { href: '/certification?type=indigency' },
    score: 1.0,
    type: 'action',
  },

  // Admin Functions Group
  {
    id: 'admin-user-management',
    title: 'User Management',
    subtitle: 'Manage system users and permissions',
    icon: Icons.UserGroup,
    group: 'Administration',
    href: '/admin/users',
    keywords: ['users', 'admin', 'permissions', 'access'],
    data: { href: '/admin/users' },
    score: 1.0,
    type: 'action',
  },
  {
    id: 'admin-backup',
    title: 'Backup Data',
    subtitle: 'Create system backup',
    icon: Icons.Upload,
    group: 'Administration',
    keywords: ['backup', 'export', 'save', 'archive'],
    onClick: () => {
      console.log('Initiating backup...');
    },
    data: { action: 'backup' },
    score: 1.0,
    type: 'action',
  },
  {
    id: 'admin-notifications',
    title: 'System Notifications',
    subtitle: 'View system alerts and notifications',
    icon: Icons.Bell,
    group: 'Administration',
    href: '/notifications',
    keywords: ['alerts', 'notifications', 'messages', 'system'],
    data: { href: '/notifications' },
    score: 1.0,
    type: 'action',
  },

  // Help & Information Group
  {
    id: 'help-guide',
    title: 'User Guide',
    subtitle: 'Learn how to use the system',
    icon: Icons.FileText,
    group: 'Help',
    href: '/help',
    keywords: ['help', 'guide', 'tutorial', 'documentation'],
    shortcut: ['⌘', '?'],
    data: { href: '/help' },
    score: 1.0,
    type: 'action',
  },
  {
    id: 'help-barangay-info',
    title: 'Barangay Information',
    subtitle: 'View barangay details and officials',
    icon: Icons.Globe,
    group: 'Help',
    href: '/help?section=barangay',
    keywords: ['barangay', 'information', 'officials', 'contact'],
    data: { href: '/help?section=barangay' },
    score: 1.0,
    type: 'action',
  },
];

// Function to get recent items (this would typically come from localStorage or an API)
export const getRecentItems = (): CommandMenuSearchResult[] => {
  // This is mock data - in a real app, you'd load this from storage
  return [
    {
      id: 'recent-juan-dela-cruz',
      title: 'Juan Dela Cruz',
      subtitle: 'Resident ID: 2024-001',
      avatar: {
        src: '/api/placeholder/100/100',
        alt: 'Juan Dela Cruz',
        fallback: 'JD',
      },
      group: 'Recent',
      href: '/residents/1',
      recent: true,
      keywords: ['juan', 'dela', 'cruz'],
      data: { href: '/residents/1', residentId: '2024-001' },
      score: 1.0,
      type: 'resident',
    },
    {
      id: 'recent-maria-santos',
      title: 'Maria Santos',
      subtitle: 'Resident ID: 2024-002',
      avatar: {
        src: '/api/placeholder/100/100',
        alt: 'Maria Santos',
        fallback: 'MS',
      },
      group: 'Recent',
      href: '/residents/2',
      recent: true,
      keywords: ['maria', 'santos'],
      data: { href: '/residents/2', residentId: '2024-002' },
      score: 1.0,
      type: 'resident',
    },
    {
      id: 'recent-household-123',
      title: 'Household #123',
      subtitle: '123 Main Street, Barangay Centro',
      icon: Icons.Building,
      group: 'Recent',
      href: '/households/123',
      recent: true,
      keywords: ['household', '123', 'main', 'street'],
      data: { href: '/households/123', householdId: '123' },
      score: 1.0,
      type: 'household',
    },
  ];
};

// Combine all items
export const getAllCommandMenuItems = (): CommandMenuSearchResult[] => {
  return [...getRecentItems(), ...getCommandMenuItems()];
};
