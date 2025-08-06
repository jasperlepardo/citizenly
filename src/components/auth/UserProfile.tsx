'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfileProps {
  compact?: boolean;
  showBarangay?: boolean;
  className?: string;
}

export default function UserProfile({
  compact = false,
  showBarangay = true,
  className = '',
}: UserProfileProps) {
  const { user, userProfile, role, signOut, loading, profileLoading } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  // For now, mock barangay accounts until the full implementation is available
  const barangayAccounts: {
    id: string;
    barangay_code: string;
    role: string;
    status: string;
    is_primary: boolean;
  }[] = [];
  const address = null;

  if (loading || profileLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-8 h-8 bg-background-muted rounded-full animate-pulse"></div>
        {!compact && <div className="w-20 h-4 bg-background-muted rounded animate-pulse"></div>}
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  const displayName = `${userProfile.first_name} ${userProfile.last_name}`;
  const initials = `${userProfile.first_name[0]}${userProfile.last_name[0]}`.toUpperCase();

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 p-2 rounded-md hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
            {initials}
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-primary">{displayName}</div>
            <div className="text-xs text-secondary">{role?.name}</div>
          </div>
          {/* Dropdown chevron icon */}
          <svg
            className="w-4 h-4 text-secondary ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showDropdown && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)}></div>
            <div className="absolute right-0 mt-2 w-64 bg-surface rounded-md shadow-xl border border-default z-50">
              <div className="p-4 border-b border-default">
                <div className="font-medium text-primary">{displayName}</div>
                <div className="text-sm text-secondary">{userProfile.email}</div>
                <div className="text-xs text-blue-600 mt-1">{role?.name}</div>
              </div>

              {showBarangay && address && (
                <div className="p-4 border-b border-default">
                  <div className="text-xs font-medium text-secondary mb-1">Assigned Barangay</div>
                  <div className="text-sm text-primary">{userProfile?.barangay_code}</div>
                  <div className="text-xs text-muted">Barangay Assignment</div>
                </div>
              )}

              <div className="p-2">
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-2 py-2 text-sm text-secondary hover:bg-surface-hover rounded-md"
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

  return (
    <div className={`bg-surface rounded-lg shadow-sm border border-default p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-medium">
          {initials}
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-primary">{displayName}</h3>
          <p className="text-secondary">{userProfile.email}</p>

          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-secondary">Role:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                {role?.name}
              </span>
            </div>

            {userProfile.phone && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-secondary">Phone:</span>
                <span className="text-sm text-primary">{userProfile.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {showBarangay && (
        <div className="mt-6 pt-6 border-t border-default">
          <h4 className="text-sm font-medium text-secondary mb-3">Barangay Assignment</h4>

          {barangayAccounts.length > 0 ? (
            <div className="space-y-2">
              {barangayAccounts.map(account => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800"
                >
                  <div>
                    <div className="text-sm font-medium text-green-800 dark:text-green-400">
                      {account.barangay_code}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-500">
                      Barangay Assignment
                    </div>
                  </div>
                  {account.is_primary && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-200 dark:bg-green-800/30 text-green-800 dark:text-green-400">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
              <div className="text-sm font-medium text-red-800 dark:text-red-400">
                No Barangay Assignment
              </div>
              <div className="text-xs text-red-600 dark:text-red-500">
                Contact your administrator to assign you to a barangay.
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-default">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center px-4 py-2 border border-default rounded-md text-sm font-medium text-secondary bg-surface hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
