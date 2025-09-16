'use client';

/**
 * Sidebar Component
 * A comprehensive sidebar navigation component for the Citizenly application
 * Built following atomic design principles and Philippines government UI standards
 */

import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import Navigation, { type NavigationItem } from '@/components/organisms/Navigation/Navigation';
// Icon component removed - using inline SVG or icon library instead

// Sidebar variant styles using CVA
const sidebarVariants = cva(
  // Base styles - always applied
  'relative flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out',
  {
    variants: {
      // Width variants
      size: {
        sm: 'w-16', // Collapsed/icon-only
        md: 'w-64', // Standard width
        lg: 'w-80', // Wide sidebar
        xl: 'w-96', // Extra wide
      },
      // Position variants
      position: {
        fixed: 'fixed inset-y-0 left-0 z-50',
        sticky: 'sticky top-0 h-screen',
        relative: 'relative',
      },
      // Visibility on mobile
      mobile: {
        hidden: 'lg:flex hidden',
        overlay: 'fixed inset-0 z-50 lg:relative lg:inset-auto',
        push: 'relative',
      },
    },
    defaultVariants: {
      size: 'md',
      position: 'sticky',
      mobile: 'hidden',
    },
  }
);

// Header section component for the sidebar
interface SidebarHeaderProps {
  logo?: React.ReactNode;
  title?: string;
  subtitle?: string;
  isCollapsed?: boolean;
  className?: string;
}

function SidebarHeader({ logo, title, subtitle, isCollapsed, className }: SidebarHeaderProps) {
  return (
    <div
      className={clsx(
        'flex items-center border-b border-gray-200 px-6 py-4 dark:border-gray-700',
        className
      )}
    >
      {logo && <div className="flex-shrink-0">{logo}</div>}
      {!isCollapsed && (
        <div className="ml-3 min-w-0 flex-1">
          {title && (
            <h1 className="truncate text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="truncate text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
      )}
    </div>
  );
}

// Footer section component for the sidebar
interface SidebarFooterProps {
  children?: React.ReactNode;
  isCollapsed?: boolean;
  className?: string;
}

function SidebarFooter({ children, isCollapsed, className }: SidebarFooterProps) {
  if (!children) return null;

  return (
    <div
      className={clsx('mt-auto border-t border-gray-200 px-6 py-4 dark:border-gray-700', className)}
    >
      {!isCollapsed ? children : null}
    </div>
  );
}

// Toggle button component
interface ToggleButtonProps {
  isCollapsed: boolean;
  onToggle: () => void;
  className?: string;
}

function ToggleButton({ isCollapsed, onToggle, className }: ToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={clsx(
        'absolute top-6 -right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 transition-colors hover:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-500 dark:hover:text-gray-300 dark:focus:ring-offset-gray-900',
        className
      )}
      aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      <span
        className={clsx('transition-transform duration-200', {
          'rotate-180': isCollapsed,
        })}
      >
        {/* Icon placeholder - replace with actual icon library */}←
      </span>
    </button>
  );
}

// Mobile backdrop overlay
interface MobileBackdropProps {
  isOpen: boolean;
  onClose: () => void;
}

function MobileBackdrop({ isOpen, onClose }: MobileBackdropProps) {
  if (!isOpen) return null;

  return (
    <div
      className="bg-opacity-75 dark:bg-opacity-75 fixed inset-0 z-40 bg-gray-600 transition-opacity lg:hidden dark:bg-gray-900"
      onClick={onClose}
      aria-hidden="true"
    />
  );
}

// Main Sidebar component interface
export interface SidebarProps extends VariantProps<typeof sidebarVariants> {
  // Navigation items
  navigationItems?: NavigationItem[];
  bottomNavigationItems?: NavigationItem[];

  // Header configuration
  logo?: React.ReactNode;
  title?: string;
  subtitle?: string;

  // Footer content
  footer?: React.ReactNode;

  // Collapse functionality
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;

  // Mobile functionality
  mobileOpen?: boolean;
  onMobileToggle?: () => void;

  // Customization
  className?: string;
  children?: React.ReactNode;

  // Additional navigation props
  showSubmenu?: boolean;
  showIcons?: boolean;
}

export default function Sidebar({
  navigationItems,
  bottomNavigationItems,
  logo,
  title = 'Citizenly',
  subtitle = 'Barangay Management System',
  footer,
  collapsible = true,
  defaultCollapsed = false,
  onCollapsedChange,
  size = 'md',
  position = 'sticky',
  mobile = 'hidden',
  mobileOpen = false,
  onMobileToggle,
  className,
  children,
  showSubmenu = true,
  showIcons = true,
}: SidebarProps) {
  // Internal state for collapse
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  // Handle collapse toggle
  const handleToggle = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapsedChange?.(newCollapsed);
  };

  // Responsive collapse based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        // lg breakpoint
        setIsCollapsed(true);
      } else if (collapsible) {
        setIsCollapsed(defaultCollapsed);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [defaultCollapsed, collapsible]);

  // Determine effective size based on collapse state
  const effectiveSize = isCollapsed && collapsible ? 'sm' : size;

  return (
    <>
      {/* Mobile backdrop */}
      <MobileBackdrop isOpen={mobileOpen} onClose={() => onMobileToggle?.()} />

      {/* Sidebar container */}
      <aside
        className={clsx(
          sidebarVariants({ size: effectiveSize, position, mobile }),
          {
            'translate-x-0 transform': mobileOpen,
            '-translate-x-full transform lg:translate-x-0': !mobileOpen && mobile === 'overlay',
          },
          className
        )}
        aria-label="Sidebar navigation"
      >
        {/* Collapse toggle button */}
        {collapsible && position !== 'fixed' && (
          <ToggleButton isCollapsed={isCollapsed} onToggle={handleToggle} />
        )}

        {/* Sidebar header */}
        <SidebarHeader
          logo={logo}
          title={title}
          subtitle={subtitle}
          isCollapsed={isCollapsed && collapsible}
        />

        {/* Navigation content */}
        <div className="flex min-h-0 flex-1 flex-col py-4">
          {children ? (
            // Custom content
            <div className="flex-1 px-6">{children}</div>
          ) : (
            // Default navigation
            <div className="flex-1 px-6">
              <Navigation
                items={navigationItems}
                bottomItems={bottomNavigationItems}
                showSubmenu={showSubmenu && !(isCollapsed && collapsible)}
                showIcons={showIcons}
                className="h-full"
              />
            </div>
          )}
        </div>

        {/* Sidebar footer */}
        <SidebarFooter isCollapsed={isCollapsed && collapsible}>{footer}</SidebarFooter>
      </aside>
    </>
  );
}

// Export components
export { SidebarHeader, SidebarFooter, ToggleButton };
