'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts';

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
        <div className="bg-gray-100 dark:bg-gray-700 size-8 animate-pulse rounded-full"></div>
        {!compact && <div className="bg-gray-100 dark:bg-gray-700 h-4 w-20 animate-pulse rounded-sm"></div>}
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
          className="hover:bg-gray-50 dark:bg-gray-700 flex items-center gap-2 rounded-md p-2 transition-colors focus:outline-hidden focus:ring-2 focus:ring-blue-500"
        >
          <div className="flex size-8 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white dark:text-black">
            {initials}
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{displayName}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">{role?.name}</div>
          </div>
          {/* Dropdown chevron icon */}
          <svg
            className="ml-1 size-4 text-gray-600 dark:text-gray-400"
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
            <div className="bg-white dark:bg-gray-800 absolute right-0 z-50 mt-2 w-64 rounded-md border border-gray-300 dark:border-gray-600 shadow-xl">
              <div className="border-b border-gray-300 dark:border-gray-600 p-4">
                <div className="font-medium text-gray-600 dark:text-gray-400">{displayName}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{userProfile.email}</div>
                <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">{role?.name}</div>
              </div>

              {showBarangay && address && (
                <div className="border-b border-gray-300 dark:border-gray-600 p-4">
                  <div className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">Assigned Barangay</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{userProfile?.barangay_code}</div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs">Barangay Assignment</div>
                </div>
              )}

              <div className="p-2">
                <button
                  onClick={handleSignOut}
                  className="hover:bg-gray-50 dark:bg-gray-700 w-full rounded-md p-2 text-left text-sm text-gray-600 dark:text-gray-400 dark:text-gray-600"
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
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6 shadow-xs ${className}`}>
      <div className="flex items-start gap-4">
        <div className="flex size-16 items-center justify-center rounded-full bg-blue-600 text-xl font-medium text-white dark:text-black">
          {initials}
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">{displayName}</h3>
          <p className="text-gray-600 dark:text-gray-400">{userProfile.email}</p>

          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Role:</span>
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-blue-900/30 dark:text-gray-400">
                {role?.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {showBarangay && (
        <div className="mt-6 border-t border-gray-300 dark:border-gray-600 pt-6">
          <h4 className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Barangay Assignment</h4>

          {barangayAccounts.length > 0 ? (
            <div className="space-y-2">
              {barangayAccounts.map(account => (
                <div
                  key={account.id}
                  className="flex items-center justify-between rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20"
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
                    <span className="inline-flex items-center rounded-full bg-green-200 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-800/30 dark:text-green-400">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
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

      <div className="mt-6 border-t border-gray-300 dark:border-gray-600 pt-6">
        <button
          onClick={handleSignOut}
          className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:bg-gray-700 flex w-full items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
