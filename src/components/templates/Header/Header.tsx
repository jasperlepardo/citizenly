'use client';

/**
 * Header Component
 * Main navigation header for RBI System
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from '@/components/organisms';
import { Button } from '@/components/atoms';
import { logError } from '@/lib/logging/secure-logger';

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
    <header className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 shadow-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600">
                <span className="font-display text-sm font-bold text-white dark:text-black">RBI</span>
              </div>
              <span className="font-display text-xl font-semibold text-gray-600 dark:text-gray-400">RBI System</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden space-x-1 md:flex">
            <Link
              href="/dashboard"
              className="hover:bg-gray-50 dark:bg-gray-700 rounded-md px-3 py-2 font-body text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors hover:text-gray-600"
            >
              Dashboard
            </Link>
            <Link
              href="/residents"
              className="hover:bg-gray-50 dark:bg-gray-700 rounded-md px-3 py-2 font-body text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors hover:text-gray-600"
            >
              Residents
            </Link>
            <Link
              href="/households"
              className="hover:bg-gray-50 dark:bg-gray-700 rounded-md px-3 py-2 font-body text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors hover:text-gray-600"
            >
              Households
            </Link>
            <Link
              href="/addresses"
              className="hover:bg-gray-50 dark:bg-gray-700 rounded-md px-3 py-2 font-body text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors hover:text-gray-600"
            >
              Addresses
            </Link>
            <Link
              href="/reports"
              className="hover:bg-gray-50 dark:bg-gray-700 rounded-md px-3 py-2 font-body text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors hover:text-gray-600"
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
                className="rounded-md px-3 py-2 font-body text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-600"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="hover:bg-gray-50 dark:bg-gray-700 inline-flex items-center justify-center rounded-md p-2 text-gray-600 dark:text-gray-400 transition-colors hover:text-gray-600 focus:outline-hidden focus:ring-2 focus:ring-inset focus:ring-primary-500"
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
        <div className="border-t border-gray-300 dark:border-gray-600 md:hidden">
          <div className="bg-white dark:bg-gray-800 space-y-1 px-2 pb-3 pt-2 sm:px-3">
            <Link
              href="/dashboard"
              className="hover:bg-gray-50 dark:bg-gray-700 block rounded-md px-3 py-2 font-body text-base font-medium text-gray-600 dark:text-gray-400 transition-colors hover:text-gray-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/residents"
              className="hover:bg-gray-50 dark:bg-gray-700 block rounded-md px-3 py-2 font-body text-base font-medium text-gray-600 dark:text-gray-400 transition-colors hover:text-gray-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Residents
            </Link>
            <Link
              href="/households"
              className="hover:bg-gray-50 dark:bg-gray-700 block rounded-md px-3 py-2 font-body text-base font-medium text-gray-600 dark:text-gray-400 transition-colors hover:text-gray-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Households
            </Link>
            <Link
              href="/addresses"
              className="hover:bg-gray-50 dark:bg-gray-700 block rounded-md px-3 py-2 font-body text-base font-medium text-gray-600 dark:text-gray-400 transition-colors hover:text-gray-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Addresses
            </Link>
            <Link
              href="/reports"
              className="hover:bg-gray-50 dark:bg-gray-700 block rounded-md px-3 py-2 font-body text-base font-medium text-gray-600 dark:text-gray-400 transition-colors hover:text-gray-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Reports
            </Link>

            {/* Mobile User Menu */}
            {user ? (
              <div className="mt-2 border-t border-gray-300 dark:border-gray-600 pt-2">
                <div className="px-3 py-2">
                  <div className="flex items-center gap-3 p-2">
                    <div className="flex size-8 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white dark:text-black">
                      {`${user.user_metadata?.first_name?.[0] || ''}${user.user_metadata?.last_name?.[0] || ''}`.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-body text-sm font-medium text-gray-600 dark:text-gray-400">
                        {user.user_metadata?.first_name} {user.user_metadata?.last_name}
                      </div>
                      <div className="font-body text-xs text-gray-600 dark:text-gray-400">{user.email}</div>
                    </div>
                  </div>
                </div>
                <div className="px-3 py-2">
                  <LogoutButton />
                </div>
              </div>
            ) : (
              <div className="mt-2 border-t border-gray-300 dark:border-gray-600 pt-2">
                <Link
                  href="/login"
                  className="hover:bg-gray-50 dark:bg-gray-700 block rounded-md px-3 py-2 font-body text-base font-medium text-gray-600 dark:text-gray-400 transition-colors hover:text-gray-600"
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
