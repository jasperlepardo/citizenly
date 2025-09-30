'use client';

/**
 * Header Component
 * Main navigation header for RBI System
 */

import Link from 'next/link';
import React, { useState } from 'react';

import UserProfile from '@/components/organisms/UserProfile/UserProfile';
import { Button } from '@/components/atoms/Button/Button';
import { useAuth } from '@/contexts/AuthContext';
import { logError } from '@/lib/logging/client-logger';

// Simple logout button component
function LogoutButton() {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/login';
    } catch (error) {
      logError(error as Error, 'SIGN_OUT_ERROR');
    }
  };

  return (
    <Button onClick={handleLogout} variant="neutral-subtle" size="sm">
      Logout
    </Button>
  );
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="border-b border-gray-300 bg-white shadow-xs dark:border-gray-600 dark:bg-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600 dark:bg-blue-500">
                <span className="font-display text-sm font-bold text-white">
                  RBI
                </span>
              </div>
              <span className="font-display text-xl font-semibold text-gray-600 dark:text-gray-400">
                RBI System
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden space-x-1 md:flex">
            <Link
              href="/dashboard"
              className="font-body rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-600 dark:bg-gray-700 dark:text-gray-400"
            >
              Dashboard
            </Link>
            <Link
              href="/residents"
              className="font-body rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-600 dark:bg-gray-700 dark:text-gray-400"
            >
              Residents
            </Link>
            <Link
              href="/households"
              className="font-body rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-600 dark:bg-gray-700 dark:text-gray-400"
            >
              Households
            </Link>
            <Link
              href="/addresses"
              className="font-body rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-600 dark:bg-gray-700 dark:text-gray-400"
            >
              Addresses
            </Link>
            <Link
              href="/reports"
              className="font-body rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-600 dark:bg-gray-700 dark:text-gray-400"
            >
              Reports
            </Link>
          </nav>

          {/* User Menu */}
          <div className="hidden items-center space-x-4 md:flex">
            {user ? (
              <div className="flex items-center space-x-3">
                <UserProfile compact={true} showBarangay={false} />
                <LogoutButton />
              </div>
            ) : (
              <Link
                href="/login"
                className="font-body rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-600 dark:text-gray-400"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="focus:ring-primary-500 inline-flex items-center justify-center rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-600 focus:ring-2 focus:outline-hidden focus:ring-inset dark:bg-gray-700 dark:text-gray-400"
            >
              <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="border-t border-gray-300 md:hidden dark:border-gray-600">
          <div className="space-y-1 bg-white px-2 pt-2 pb-3 sm:px-3 dark:bg-gray-800">
            <Link
              href="/dashboard"
              className="font-body block rounded-md px-3 py-2 text-base font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-600 dark:bg-gray-700 dark:text-gray-400"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/residents"
              className="font-body block rounded-md px-3 py-2 text-base font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-600 dark:bg-gray-700 dark:text-gray-400"
              onClick={() => setIsMenuOpen(false)}
            >
              Residents
            </Link>
            <Link
              href="/households"
              className="font-body block rounded-md px-3 py-2 text-base font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-600 dark:bg-gray-700 dark:text-gray-400"
              onClick={() => setIsMenuOpen(false)}
            >
              Households
            </Link>
            <Link
              href="/addresses"
              className="font-body block rounded-md px-3 py-2 text-base font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-600 dark:bg-gray-700 dark:text-gray-400"
              onClick={() => setIsMenuOpen(false)}
            >
              Addresses
            </Link>
            <Link
              href="/reports"
              className="font-body block rounded-md px-3 py-2 text-base font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-600 dark:bg-gray-700 dark:text-gray-400"
              onClick={() => setIsMenuOpen(false)}
            >
              Reports
            </Link>

            {/* Mobile User Menu */}
            {user ? (
              <div className="mt-2 border-t border-gray-300 pt-2 dark:border-gray-600">
                <div className="px-3 py-2">
                  <div className="flex items-center gap-3 p-2">
                    <div className="flex size-8 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white dark:text-black">
                      {`${user.user_metadata?.first_name?.[0] || ''}${user.user_metadata?.last_name?.[0] || ''}`.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-body text-sm font-medium text-gray-600 dark:text-gray-400">
                        {user.user_metadata?.first_name} {user.user_metadata?.last_name}
                      </div>
                      <div className="font-body text-xs text-gray-600 dark:text-gray-400">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-3 py-2">
                  <LogoutButton />
                </div>
              </div>
            ) : (
              <div className="mt-2 border-t border-gray-300 pt-2 dark:border-gray-600">
                <Link
                  href="/login"
                  className="font-body block rounded-md px-3 py-2 text-base font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
