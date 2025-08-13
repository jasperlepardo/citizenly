'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { SearchBar } from '@/components/molecules';
import { Navigation } from '@/components/organisms';
import { logger, logError } from '@/lib/secure-logger';
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

      // Query the PSGC tables to get full address hierarchy
      const { data: barangayData, error } = await supabase
        .from('psgc_barangays')
        .select(
          `
          name,
          psgc_cities_municipalities!inner(
            name,
            type,
            psgc_provinces!inner(
              name,
              psgc_regions!inner(
                name
              )
            )
          )
        `
        )
        .eq('code', barangayCode)
        .single();

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
        const cityMun = (barangayData as any).psgc_cities_municipalities;
        const province = cityMun.psgc_provinces;

        const fullAddress = `${barangayData.name}, ${cityMun.name} (${cityMun.type}), ${province.name}`;
        logger.debug('Loaded barangay info from database', { address: fullAddress });
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
        className="flex items-center gap-2 rounded px-2 py-1 transition-colors hover:bg-neutral-100"
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
        <div className="font-montserrat text-sm font-medium text-neutral-800">
          {`${userProfile.first_name} ${userProfile.last_name}`}
        </div>
        <div className="size-4 text-neutral-600">
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
            className="absolute right-0 z-20 mt-2 w-72 rounded-lg border border-neutral-200 bg-white shadow-xl"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-menu-button"
          >
            {/* User info header */}
            <div className="border-b border-neutral-100 p-4">
              <div className="flex items-center gap-3">
                <div
                  className="size-12 rounded-full bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage:
                      'url(\'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"%3E%3Ccircle cx="24" cy="24" r="24" fill="%23e5e7eb"%2F%3E%3Ctext x="24" y="30" text-anchor="middle" fill="%236b7280" font-size="20"%3EU%3C%2Ftext%3E%3C%2Fsvg%3E\')',
                  }}
                ></div>
                <div>
                  <div className="font-montserrat font-semibold text-neutral-900">
                    {`${userProfile.first_name} ${userProfile.last_name}`}
                  </div>
                  <div className="font-montserrat text-sm text-neutral-600">
                    {userProfile.email}
                  </div>
                  <div className="font-montserrat mt-1 text-xs text-blue-600">
                    {role?.name || 'User'}
                  </div>
                </div>
              </div>
            </div>

            {/* Barangay info */}
            <div className="border-b border-neutral-100 p-4">
              <div className="font-montserrat mb-2 text-xs font-medium text-neutral-500">
                BARANGAY ASSIGNMENT
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-green-500"></div>
                <div className="font-montserrat text-sm text-neutral-800">{barangayInfo}</div>
              </div>
              <div className="font-montserrat mt-1 text-xs text-neutral-500">
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
                className="font-montserrat w-full rounded px-3 py-2 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-100"
              >
                Edit Profile
              </button>
              <Link href="/settings">
                <button className="font-montserrat w-full rounded px-3 py-2 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-100">
                  Settings
                </button>
              </Link>
              <hr className="my-2 border-neutral-200" />
              <button
                onClick={handleLogout}
                className="font-montserrat w-full rounded px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
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
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
}

export default function DashboardLayout({
  children,
  searchTerm = '',
  onSearchChange,
}: DashboardLayoutProps) {
  return (
    <div className="bg-background min-h-screen">
      {/* Skip Navigation */}
      <SkipNavigation skipTo="#main-content" />

      {/* Sidebar */}
      <aside
        id="navigation"
        className="bg-background-secondary fixed left-0 top-0 h-full w-56 border-r border-default"
        aria-label="Main navigation"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-default px-4 py-3">
            <h1 className="font-montserrat text-xl font-semibold text-primary">Citizenly</h1>
            <div className="flex gap-1">
              <div className="rounded bg-neutral-200 p-0.5">
                <div className="size-5 rounded bg-neutral-400"></div>
              </div>
              <div className="rounded bg-neutral-200 p-0.5">
                <div className="size-5 rounded bg-neutral-400"></div>
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
        <header className="bg-background border-b border-default px-6 py-2">
          <div className="flex items-center justify-between">
            {/* Search */}
            <div className="w-[497px]">
              <SearchBar
                placeholder="Search Citizenly"
                value={searchTerm}
                onChange={e => onSearchChange?.(e.target.value)}
                onClear={() => onSearchChange?.('')}
                onSearch={value => {
                  // Handle search action (Enter key pressed)
                  logger.debug('Search initiated', { searchValue: value });
                  // Add your search logic here
                }}
                variant="default"
                size="md"
                showClearButton={true}
              />
            </div>

            {/* User Section */}
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-neutral-200 p-2">
                <div className="size-5 text-neutral-600">
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
              <div className="rounded-full bg-neutral-200 p-2">
                <div className="size-5 text-neutral-600">
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
              <div className="h-0 w-6 border-l border-neutral-300"></div>
              <UserDropdown />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div id="main-content" role="main" tabIndex={-1}>
          {children}
        </div>
      </main>
    </div>
  );
}
