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
import { logError } from '@/lib/secure-logger';

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
    <header className="border-b shadow-sm bg-surface border-default">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary-600">
                <span className="font-display text-sm font-bold text-white">RBI</span>
              </div>
              <span className="font-display text-xl font-semibold text-primary">RBI System</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden space-x-1 md:flex">
            <Link
              href="/dashboard"
              className="rounded-md px-3 py-2 text-sm font-medium transition-colors font-body text-secondary hover:text-primary hover:bg-surface-hover"
            >
              Dashboard
            </Link>
            <Link
              href="/residents"
              className="rounded-md px-3 py-2 text-sm font-medium transition-colors font-body text-secondary hover:text-primary hover:bg-surface-hover"
            >
              Residents
            </Link>
            <Link
              href="/households"
              className="rounded-md px-3 py-2 text-sm font-medium transition-colors font-body text-secondary hover:text-primary hover:bg-surface-hover"
            >
              Households
            </Link>
            <Link
              href="/addresses"
              className="rounded-md px-3 py-2 text-sm font-medium transition-colors font-body text-secondary hover:text-primary hover:bg-surface-hover"
            >
              Addresses
            </Link>
            <Link
              href="/reports"
              className="rounded-md px-3 py-2 text-sm font-medium transition-colors font-body text-secondary hover:text-primary hover:bg-surface-hover"
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
                className="rounded-md px-3 py-2 text-sm font-medium font-body text-secondary hover:text-primary"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 transition-colors text-secondary hover:text-primary hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
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
        <div className="border-t border-default md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2 bg-surface sm:px-3">
            <Link
              href="/dashboard"
              className="block rounded-md px-3 py-2 text-base font-medium transition-colors font-body text-secondary hover:text-primary hover:bg-surface-hover"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/residents"
              className="block rounded-md px-3 py-2 text-base font-medium transition-colors font-body text-secondary hover:text-primary hover:bg-surface-hover"
              onClick={() => setIsMenuOpen(false)}
            >
              Residents
            </Link>
            <Link
              href="/households"
              className="block rounded-md px-3 py-2 text-base font-medium transition-colors font-body text-secondary hover:text-primary hover:bg-surface-hover"
              onClick={() => setIsMenuOpen(false)}
            >
              Households
            </Link>
            <Link
              href="/addresses"
              className="block rounded-md px-3 py-2 text-base font-medium transition-colors font-body text-secondary hover:text-primary hover:bg-surface-hover"
              onClick={() => setIsMenuOpen(false)}
            >
              Addresses
            </Link>
            <Link
              href="/reports"
              className="block rounded-md px-3 py-2 text-base font-medium transition-colors font-body text-secondary hover:text-primary hover:bg-surface-hover"
              onClick={() => setIsMenuOpen(false)}
            >
              Reports
            </Link>

            {/* Mobile User Menu */}
            {user ? (
              <div className="mt-2 border-t pt-2 border-default">
                <div className="px-3 py-2">
                  <div className="flex items-center gap-3 p-2">
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary-600 text-sm font-medium text-white">
                      {`${user.user_metadata?.first_name?.[0] || ''}${user.user_metadata?.last_name?.[0] || ''}`.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium font-body text-primary">
                        {user.user_metadata?.first_name} {user.user_metadata?.last_name}
                      </div>
                      <div className="text-xs font-body text-secondary">{user.email}</div>
                    </div>
                  </div>
                </div>
                <div className="px-3 py-2">
                  <LogoutButton />
                </div>
              </div>
            ) : (
              <div className="mt-2 border-t pt-2 border-default">
                <Link
                  href="/login"
                  className="block rounded-md px-3 py-2 text-base font-medium transition-colors font-body text-secondary hover:text-primary hover:bg-surface-hover"
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
