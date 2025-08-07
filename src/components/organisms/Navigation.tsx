'use client';

/**
 * Unified Navigation Component
 * Consolidates navigation patterns from DashboardLayout and AppShell
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Navigation item interface
interface NavigationItem {
  name: string;
  href: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description?: string;
  children?: NavigationItem[];
}

// Navigation icons
function HomeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </svg>
  );
}

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
      />
    </svg>
  );
}

function HomeModernIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m1.5.5-1.5-.5M6.75 7.364V3h-3v18m3-13.636 10.5-3.819"
      />
    </svg>
  );
}

function MapIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"
      />
    </svg>
  );
}

function DocumentChartBarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25M9 16.5v.75m3-3v3M15 12v5.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
      />
    </svg>
  );
}

function CogIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a6.759 6.759 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function BusinessIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 21h19.5m-18-18v18m2.25-18v18m13.5-18v18m2.25-18v18M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
      />
    </svg>
  );
}

function ScaleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75L12 21l4.185-.75A17.8 17.8 0 0 0 12 20.25zm0 0L7.5 21l4.5.75 4.5-.75L12 20.25zm0-16.5L16.5 3l-4.5.75L7.5 3l4.5.75z"
      />
    </svg>
  );
}

function DocumentIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
      />
    </svg>
  );
}

function QuestionMarkCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.879 7.519c0-1.628 1.32-2.948 2.948-2.948s2.948 1.32 2.948 2.948c0 1.628-1.32 2.948-2.948 2.948s-2.948-1.32-2.948-2.948zM12 16.5V14m0 0V9.75m0 4.25h.008v.008H12v-.008z"
      />
    </svg>
  );
}

function BellIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
      />
    </svg>
  );
}

// Default navigation structure
const defaultNavigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Residents', href: '/residents', icon: UsersIcon },
  { name: 'Households', href: '/households', icon: HomeModernIcon },
  { name: 'Business', href: '/business', icon: BusinessIcon },
  { name: 'Judiciary', href: '/judiciary', icon: ScaleIcon },
  { name: 'Certification', href: '/certification', icon: DocumentIcon },
  { name: 'Addresses', href: '/addresses', icon: MapIcon },
  {
    name: 'Reports',
    href: '/reports',
    icon: DocumentChartBarIcon,
  },
];

const bottomNavigation: NavigationItem[] = [
  { name: 'Help', href: '/help', icon: QuestionMarkCircleIcon },
  { name: 'Notifications', href: '/notifications', icon: BellIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

// Navigation styles
const navigationStyles = {
  // Base styles for navigation items
  base: 'group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors duration-200',

  // Active item styles
  active: 'bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400',

  // Inactive item styles
  inactive: 'text-secondary hover:text-blue-600 hover:bg-surface-hover',

  // Icon styles
  iconActive: 'text-blue-600 dark:text-blue-400 h-6 w-6 shrink-0',
  iconInactive: 'text-muted group-hover:text-blue-600 h-6 w-6 shrink-0',

  // Submenu styles
  submenu: 'mt-2 ml-4 space-y-1',
  submenuItem: 'rounded p-2 bg-blue-50 dark:bg-slate-800',
  submenuLink: 'font-montserrat text-sm font-medium text-blue-600 dark:text-blue-400',
};

// Navigation item component
interface NavigationItemProps {
  item: NavigationItem;
  currentPath: string;
  showSubmenu?: boolean;
  className?: string;
}

function NavigationItemComponent({
  item,
  currentPath,
  showSubmenu = true,
  className = '',
}: NavigationItemProps) {
  const isActive = currentPath === item.href;
  const hasActiveChild = item.children?.some(child => currentPath === child.href);
  const shouldShowSubmenu = showSubmenu && (isActive || hasActiveChild) && item.children;

  return (
    <li key={item.name} className={className}>
      <Link
        href={item.href}
        className={`${navigationStyles.base} ${
          isActive ? navigationStyles.active : navigationStyles.inactive
        }`}
      >
        {item.icon && (
          <item.icon
            className={isActive ? navigationStyles.iconActive : navigationStyles.iconInactive}
          />
        )}
        {item.name}
      </Link>

      {shouldShowSubmenu && (
        <div className={navigationStyles.submenu}>
          {item.children?.map(child => (
            <div key={child.name} className={navigationStyles.submenuItem}>
              <Link href={child.href}>
                <div className={navigationStyles.submenuLink}>{child.name}</div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </li>
  );
}

// Main Navigation component props
interface NavigationProps {
  items?: NavigationItem[];
  bottomItems?: NavigationItem[];
  showIcons?: boolean;
  showSubmenu?: boolean;
  variant?: 'default' | 'compact' | 'minimal';
  className?: string;
}

export default function Navigation({
  items = defaultNavigation,
  bottomItems = bottomNavigation,
  showIcons: _showIcons = true,
  showSubmenu = true,
  variant: _variant = 'default',
  className = '',
}: NavigationProps) {
  const pathname = usePathname();

  return (
    <nav className={`flex flex-1 flex-col ${className}`}>
      <ul role="list" className="flex flex-1 flex-col gap-y-7">
        {/* Main navigation */}
        <li>
          <ul role="list" className="-mx-2 space-y-1">
            {items.map(item => (
              <NavigationItemComponent
                key={item.name}
                item={item}
                currentPath={pathname}
                showSubmenu={showSubmenu}
              />
            ))}
          </ul>
        </li>

        {/* Bottom navigation */}
        {bottomItems.length > 0 && (
          <li className="mt-auto">
            <ul role="list" className="-mx-2 space-y-1">
              {bottomItems.map(item => (
                <NavigationItemComponent
                  key={item.name}
                  item={item}
                  currentPath={pathname}
                  showSubmenu={showSubmenu}
                />
              ))}
            </ul>
          </li>
        )}
      </ul>
    </nav>
  );
}

// Export types for use in other components
export type { NavigationItem, NavigationProps };
