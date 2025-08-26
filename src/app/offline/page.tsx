'use client';

import Link from 'next/link';
import React from 'react';

import { Button } from '@/components';

export default function OfflinePage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleRetry = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration: any) => {
        if (registration.sync) {
          registration.sync.register('background-sync');
        }
      });
    }
    window.history.back();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-white p-8 text-center shadow-lg dark:bg-gray-800">
          {/* Offline Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
            <svg
              className="h-10 w-10 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636L5.636 18.364m12.728 0L5.636 5.636m12.728 12.728L5.636 5.636"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">You're Offline</h1>

          {/* Description */}
          <p className="mb-8 text-gray-600 dark:text-gray-400">
            It looks like you've lost your internet connection. Don't worry, you can still browse
            previously loaded pages or try again when your connection is restored.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button onClick={handleRefresh} variant="primary" size="lg" className="w-full">
              Try Again
            </Button>

            <Button onClick={handleRetry} variant="secondary" size="lg" className="w-full">
              Go Back
            </Button>

            <Link href="/" className="block">
              <Button variant="neutral-outline" size="lg" className="w-full">
                Go to Homepage
              </Button>
            </Link>
          </div>

          {/* Cached Pages Info */}
          <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
            <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">Available offline:</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/">
                <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Dashboard
                </span>
              </Link>
              <Link href="/residents">
                <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs text-green-800 dark:bg-green-900 dark:text-green-200">
                  Residents
                </span>
              </Link>
              <Link href="/households">
                <span className="inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  Households
                </span>
              </Link>
            </div>
          </div>

          {/* Connection Status */}
          <div className="mt-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-red-500"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Connection Status: Offline
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
