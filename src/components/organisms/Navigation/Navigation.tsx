'use client';

/**
 * Unified Navigation Component
 * Consolidates navigation patterns from DashboardLayout and AppShell
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// Icon component removed - using inline SVG or icon library instead

// Navigation item interface
interface NavigationItem {
  name: string;
  href: string;
  icon?: string; // FontAwesome icon name
  description?: string;
  children?: NavigationItem[];
}


// Default navigation structure with FontAwesome icons
const defaultNavigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { name: 'Residents', href: '/residents', icon: 'users' },
  { name: 'Households', href: '/households', icon: 'household' },
  { name: 'Reports', href: '/reports', icon: 'chart-bar' },
];

const bottomNavigation: NavigationItem[] = [
  { name: 'Settings', href: '/settings', icon: 'settings' },
];

// Navigation styles
const navigationStyles = {
  // Base styles for navigation items
  base: 'group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors duration-200',

  // Active item styles
  active: 'bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-white',

  // Inactive item styles
  inactive: 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700',

  // Icon styles
  iconActive: 'text-blue-600 dark:text-white shrink-0',
  iconInactive: 'text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-white shrink-0',

  // Submenu styles
  submenu: 'mt-2 ml-4 space-y-1',
  submenuItem: 'rounded-sm p-2 bg-blue-50 dark:bg-slate-800',
  submenuLink: 'font-montserrat text-sm font-medium text-gray-600 dark:text-gray-300',
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
    <li className={className}>
      <Link
        href={item.href}
        className={`${navigationStyles.base} ${
          isActive ? navigationStyles.active : navigationStyles.inactive
        }`}
        aria-current={isActive ? 'page' : undefined}
      >
        {item.icon && (
          <span className={isActive ? navigationStyles.iconActive : navigationStyles.iconInactive}>
            {/* Icon placeholder - replace with actual icon library */}
          </span>
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
