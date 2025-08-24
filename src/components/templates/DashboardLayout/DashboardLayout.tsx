'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts';
import { supabase } from '@/lib/supabase/supabase';
import { InlineCommandMenu } from '@/components/molecules/CommandMenu/InlineCommandMenu';
import { Navigation } from '@/components/organisms';
import { Toaster } from 'react-hot-toast';
import { logger, logError } from '@/lib/logging/secure-logger';
import SkipNavigation from '@/components/atoms/SkipNavigation';

// User dropdown component with details (from original dashboard)
function UserDropdown() {
  const { userProfile, role, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [barangayInfo, setBarangayInfo] = useState<string>('Loading...');
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  // Load barangay information from database
  const loadBarangayInfo = async (barangayCode: string) => {
    try {
      // Check if user is authenticated first
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        logger.debug('Cannot load barangay info - user not authenticated', { barangayCode });
        setBarangayInfo(`Barangay ${barangayCode}`);
        return;
      }

      logger.debug('Loading barangay info', { barangayCode });

      // Use API endpoint to get full address hierarchy (avoids complex nested query issues)
      const response = await fetch(`/api/psgc/lookup?code=${encodeURIComponent(barangayCode)}`);
      
      let barangayData = null;
      let error = null;
      
      if (!response.ok) {
        error = { message: `API request failed: ${response.status}` };
      } else {
        const result = await response.json();
        barangayData = result.data;
        error = result.error;
      }

      if (error) {
        // Don't log error if it's just an authentication issue
        if (
          error.code === 'PGRST001' ||
          error.message?.includes('permission') ||
          error.message?.includes('JWT') ||
          error.message?.includes('unauthorized') ||
          error.code === '401'
        ) {
          logger.debug('Cannot load barangay info - user not authenticated', { barangayCode });
        } else {
          // Only log non-authentication related errors, and use debug level for less critical errors
          logger.debug('Error loading barangay info', {
            error: error.message,
            code: error.code,
            barangayCode,
          });
        }
        setBarangayInfo(`Barangay ${barangayCode}`);
        return;
      }

      if (barangayData) {
        // API returns flattened structure
        const barangayName = barangayData.name || barangayData.barangay_name;
        const cityName = barangayData.city_name;
        const cityType = barangayData.city_type;
        const provinceName = barangayData.province_name;

        const fullAddress = `${barangayName}, ${cityName} (${cityType}), ${provinceName}`;
        logger.debug('Loaded barangay info from API', { address: fullAddress });
        setBarangayInfo(fullAddress);
      } else {
        setBarangayInfo(`Barangay ${barangayCode}`);
      }
    } catch (error) {
      // Don't log critical errors for authentication-related issues in dashboard
      logger.debug('Error loading barangay info (caught in catch)', {
        error: error instanceof Error ? error.message : String(error),
        barangayCode,
      });
      setBarangayInfo(`Barangay ${barangayCode}`);
    }
  };

  // Load barangay info when userProfile changes
  useEffect(() => {
    if (userProfile?.barangay_code) {
      loadBarangayInfo(userProfile.barangay_code);
    }
  }, [userProfile?.barangay_code]);

  // Handle click outside and Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/login';
    } catch (error) {
      logError(error as Error, 'SIGN_OUT_ERROR');
    }
  };

  if (!userProfile) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown trigger */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-sm px-2 py-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        <div
          className="size-8 rounded-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              'url(\'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"%3E%3Ccircle cx="16" cy="16" r="16" fill="%23e5e7eb"%2F%3E%3Ctext x="16" y="20" text-anchor="middle" fill="%236b7280" font-size="14"%3EU%3C%2Ftext%3E%3C%2Fsvg%3E\')',
          }}
        ></div>
        <div className="font-montserrat text-sm font-medium text-gray-800 dark:text-gray-200 dark:text-gray-800">
          {`${userProfile.first_name} ${userProfile.last_name}`}
        </div>
        <div className="size-4 text-gray-600 dark:text-gray-400">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isOpen ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
            />
          </svg>
        </div>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          {/* Dropdown content - no backdrop needed with proper event handling */}
          <div
            className="absolute right-0 z-20 mt-2 w-72 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-menu-button"
          >
            {/* User info header */}
            <div className="border-b border-gray-100 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div
                  className="size-12 rounded-full bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage:
                      'url(\'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"%3E%3Ccircle cx="24" cy="24" r="24" fill="%23e5e7eb"%2F%3E%3Ctext x="24" y="30" text-anchor="middle" fill="%236b7280" font-size="20"%3EU%3C%2Ftext%3E%3C%2Fsvg%3E\')',
                  }}
                ></div>
                <div>
                  <div className="font-montserrat font-semibold text-gray-900 dark:text-gray-100 dark:text-gray-900">
                    {`${userProfile.first_name} ${userProfile.last_name}`}
                  </div>
                  <div className="font-montserrat text-sm text-gray-600 dark:text-gray-400">
                    {userProfile.email}
                  </div>
                  <div className="font-montserrat mt-1 text-xs text-gray-600 dark:text-gray-400">
                    {role?.name || 'User'}
                  </div>
                </div>
              </div>
            </div>

            {/* Barangay info */}
            <div className="border-b border-gray-100 dark:border-gray-700 p-4">
              <div className="font-montserrat mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                BARANGAY ASSIGNMENT
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-green-500 dark:bg-green-400"></div>
                <div className="font-montserrat text-sm text-gray-800 dark:text-gray-200">{barangayInfo}</div>
              </div>
              <div className="font-montserrat mt-1 text-xs text-gray-500 dark:text-gray-400">
                Code: {userProfile.barangay_code}
              </div>
            </div>

            {/* Actions */}
            <div className="p-2">
              <button
                onClick={() => {
                  // Add profile editing functionality later
                  alert('Profile editing coming soon!');
                }}
                className="font-montserrat w-full rounded-sm px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Edit Profile
              </button>
              <Link href="/settings">
                <button className="font-montserrat w-full rounded-sm px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
                  Settings
                </button>
              </Link>
              <hr className="my-2 border-gray-200 dark:border-gray-700" />
              <button
                onClick={handleLogout}
                className="font-montserrat w-full rounded-sm px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="bg-white dark:bg-gray-800 min-h-screen dark:bg-gray-900">
      {/* Skip Navigation */}
      <SkipNavigation skipTo="#main-content" />

      {/* Sidebar */}
      <aside
        id="navigation"
        className="fixed left-0 top-0 h-full w-56 border-r border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        aria-label="Main navigation"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-300 dark:border-gray-600 border-gray-200 dark:border-gray-700 px-4 py-3">
            <h1 className="font-montserrat text-xl font-semibold text-gray-600 dark:text-gray-300">Citizenly</h1>
            <div className="flex gap-1">
              <div className="rounded bg-gray-200 dark:bg-gray-600 p-0.5">
                <div className="size-5 rounded-sm bg-gray-400 dark:bg-gray-500"></div>
              </div>
              <div className="rounded bg-gray-200 dark:bg-gray-600 p-0.5">
                <div className="size-5 rounded-sm bg-gray-400 dark:bg-gray-500"></div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-2 py-4">
            <Navigation />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-56">
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 dark:bg-gray-900 border-gray-200 dark:border-gray-700 px-6 py-2">
          <div className="flex items-center justify-between">
            {/* Inline Command Menu */}
            <div className="w-[497px]">
              <InlineCommandMenu 
                placeholder="Search for anything..."
                maxResults={10}
                showShortcuts={true}
                showRecentSection={true}
                size="md"
                items={[]}
              />
            </div>

            {/* User Section */}
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-gray-200 dark:bg-gray-700 p-2">
                <div className="size-5 text-gray-600 dark:text-gray-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
              </div>
              <div className="rounded-full bg-gray-200 dark:bg-gray-700 p-2">
                <div className="size-5 text-gray-600 dark:text-gray-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>
              <div className="h-0 w-6 border-l border-gray-300 dark:border-gray-600"></div>
              <UserDropdown />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div id="main-content" role="main" tabIndex={-1}>
          {children}
        </div>
      </main>

      {/* Note: Command menu is now inline in the header */}
      
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--background)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
          },
        }}
      />
    </div>
  );
}
