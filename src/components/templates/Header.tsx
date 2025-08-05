'use client';

/**
 * Header Component
 * Main navigation header for RBI System
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import UserProfile from '@/components/auth/UserProfile';
import { Button } from '@/components/atoms';

// Simple logout button component
function LogoutButton() {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
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
    <header className="bg-surface shadow-sm border-b border-default">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RBI</span>
              </div>
              <span className="text-xl font-semibold text-primary">RBI System</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            <Link
              href="/dashboard"
              className="text-secondary hover:text-primary hover:bg-surface-hover px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/residents"
              className="text-secondary hover:text-primary hover:bg-surface-hover px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Residents
            </Link>
            <Link
              href="/households"
              className="text-secondary hover:text-primary hover:bg-surface-hover px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Households
            </Link>
            <Link
              href="/addresses"
              className="text-secondary hover:text-primary hover:bg-surface-hover px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Addresses
            </Link>
            <Link
              href="/reports"
              className="text-secondary hover:text-primary hover:bg-surface-hover px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Reports
            </Link>
          </nav>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <UserProfile compact={true} showBarangay={false} />
                <LogoutButton />
              </div>
            ) : (
              <Link
                href="/login"
                className="text-secondary hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-secondary hover:text-primary hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <div className="md:hidden border-t border-default">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-surface">
            <Link
              href="/dashboard"
              className="block px-3 py-2 rounded-md text-base font-medium text-secondary hover:text-primary hover:bg-surface-hover transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/residents"
              className="block px-3 py-2 rounded-md text-base font-medium text-secondary hover:text-primary hover:bg-surface-hover transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Residents
            </Link>
            <Link
              href="/households"
              className="block px-3 py-2 rounded-md text-base font-medium text-secondary hover:text-primary hover:bg-surface-hover transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Households
            </Link>
            <Link
              href="/addresses"
              className="block px-3 py-2 rounded-md text-base font-medium text-secondary hover:text-primary hover:bg-surface-hover transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Addresses
            </Link>
            <Link
              href="/reports"
              className="block px-3 py-2 rounded-md text-base font-medium text-secondary hover:text-primary hover:bg-surface-hover transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Reports
            </Link>

            {/* Mobile User Menu */}
            {user ? (
              <div className="border-t border-default mt-2 pt-2">
                <div className="px-3 py-2">
                  <div className="flex items-center gap-3 p-2">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {`${user.user_metadata?.first_name?.[0] || ''}${user.user_metadata?.last_name?.[0] || ''}`.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-primary">
                        {user.user_metadata?.first_name} {user.user_metadata?.last_name}
                      </div>
                      <div className="text-xs text-secondary">{user.email}</div>
                    </div>
                  </div>
                </div>
                <div className="px-3 py-2">
                  <LogoutButton />
                </div>
              </div>
            ) : (
              <div className="border-t border-default mt-2 pt-2">
                <Link
                  href="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-secondary hover:text-primary hover:bg-surface-hover transition-colors"
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
