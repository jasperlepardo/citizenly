'use client';

import React, { useState, useEffect } from 'react';

import { supabase } from '@/lib';

export default function AuthDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const updateDebugInfo = async () => {
      try {
        // Check localStorage for auth tokens
        const authToken = localStorage.getItem('rbi-auth-token');
        const supabaseAuth = localStorage.getItem('sb-cdtcbelaimyftpxmzkjf-auth-token');

        // Also check for any Supabase-related storage keys
        const allStorageKeys = Object.keys(localStorage);
        const supabaseKeys = allStorageKeys.filter(
          key => key.includes('supabase') || key.includes('sb-')
        );
        const authKeys = allStorageKeys.filter(key => key.includes('auth'));

        // Get current session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        setDebugInfo({
          localStorage: {
            hasRbiToken: !!authToken,
            hasSupabaseToken: !!supabaseAuth,
            rbiTokenLength: authToken?.length || 0,
            supabaseTokenLength: supabaseAuth?.length || 0,
            allSupabaseKeys: supabaseKeys,
            allAuthKeys: authKeys,
            totalStorageKeys: allStorageKeys.length,
          },
          session: {
            hasSession: !!session,
            hasUser: !!session?.user,
            userId: session?.user?.id,
            expiresAt: session?.expires_at,
            expiresIn: session?.expires_in,
            sessionError: error?.message,
          },
          user: {
            hasUser: !!user,
            userId: user?.id,
            email: user?.email,
            userError: userError?.message,
          },
          browser: {
            isLocalStorageSupported: typeof Storage !== 'undefined',
            userAgent: navigator.userAgent,
            cookieEnabled: navigator.cookieEnabled,
          },
        });
      } catch (error) {
        setDebugInfo({
          error: (error as any)?.message || 'Debug info error',
        });
      }
    };

    if (showDebug) {
      updateDebugInfo();
      const interval = setInterval(updateDebugInfo, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }
  }, [showDebug]);

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 left-4 z-40 rounded-full bg-orange-600 p-2 text-xs text-white shadow-lg transition-colors hover:bg-orange-700"
        title="Auth Debug"
      >
        🔐
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-40 max-h-96 max-w-md overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Auth Debug Info</h3>
        <button
          onClick={() => setShowDebug(false)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-3 text-xs">
        {/* localStorage Status */}
        <div>
          <h4 className="mb-1 font-medium text-gray-700 dark:text-gray-300">Local Storage:</h4>
          <div className="space-y-1 pl-2">
            <div
              className={`flex justify-between ${debugInfo.localStorage?.hasRbiToken ? 'text-green-600' : 'text-red-600'}`}
            >
              <span>RBI Token:</span>
              <span>
                {debugInfo.localStorage?.hasRbiToken ? '✓' : '✗'} (
                {debugInfo.localStorage?.rbiTokenLength})
              </span>
            </div>
            <div
              className={`flex justify-between ${debugInfo.localStorage?.hasSupabaseToken ? 'text-green-600' : 'text-red-600'}`}
            >
              <span>Supabase Token:</span>
              <span>
                {debugInfo.localStorage?.hasSupabaseToken ? '✓' : '✗'} (
                {debugInfo.localStorage?.supabaseTokenLength})
              </span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <div>Total Keys: {debugInfo.localStorage?.totalStorageKeys}</div>
              {debugInfo.localStorage?.allSupabaseKeys?.length > 0 && (
                <div>Supabase Keys: {debugInfo.localStorage.allSupabaseKeys.join(', ')}</div>
              )}
              {debugInfo.localStorage?.allAuthKeys?.length > 0 && (
                <div>Auth Keys: {debugInfo.localStorage.allAuthKeys.join(', ')}</div>
              )}
            </div>
          </div>
        </div>

        {/* Session Status */}
        <div>
          <h4 className="mb-1 font-medium text-gray-700 dark:text-gray-300">Session:</h4>
          <div className="space-y-1 pl-2">
            <div
              className={`flex justify-between ${debugInfo.session?.hasSession ? 'text-green-600' : 'text-red-600'}`}
            >
              <span>Has Session:</span>
              <span>{debugInfo.session?.hasSession ? '✓' : '✗'}</span>
            </div>
            <div
              className={`flex justify-between ${debugInfo.session?.hasUser ? 'text-green-600' : 'text-red-600'}`}
            >
              <span>Has User:</span>
              <span>{debugInfo.session?.hasUser ? '✓' : '✗'}</span>
            </div>
            {debugInfo.session?.userId && (
              <div className="text-gray-600 dark:text-gray-400">
                <span>User ID:</span>{' '}
                <span className="font-mono text-xs">{debugInfo.session.userId.slice(0, 8)}...</span>
              </div>
            )}
            {debugInfo.session?.sessionError && (
              <div className="text-xs text-red-600">Error: {debugInfo.session.sessionError}</div>
            )}
          </div>
        </div>

        {/* Browser Support */}
        <div>
          <h4 className="mb-1 font-medium text-gray-700 dark:text-gray-300">Browser:</h4>
          <div className="space-y-1 pl-2">
            <div
              className={`flex justify-between ${debugInfo.browser?.isLocalStorageSupported ? 'text-green-600' : 'text-red-600'}`}
            >
              <span>LocalStorage:</span>
              <span>{debugInfo.browser?.isLocalStorageSupported ? '✓' : '✗'}</span>
            </div>
            <div
              className={`flex justify-between ${debugInfo.browser?.cookieEnabled ? 'text-green-600' : 'text-red-600'}`}
            >
              <span>Cookies:</span>
              <span>{debugInfo.browser?.cookieEnabled ? '✓' : '✗'}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-100 pt-2 dark:border-gray-700">
          <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-300">Actions:</h4>
          <div className="space-y-2">
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="w-full rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600"
            >
              Clear All Storage & Reload
            </button>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.reload();
              }}
              className="w-full rounded bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600"
            >
              Sign Out & Reload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
