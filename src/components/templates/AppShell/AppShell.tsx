'use client';

/**
 * Application Shell Component
 * Modern Tailwind UI application shell with advanced design patterns
 */

import React, { useState } from 'react';

import { Button } from '@/components/atoms/Button/Button';
import Navigation from '@/components/organisms/Navigation/Navigation';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="relative z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />

          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-xs flex-1">
              <div className="absolute top-0 left-full flex w-16 justify-center pt-5">
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  onClick={() => setSidebarOpen(false)}
                  className="-m-2.5 p-2.5 text-white hover:text-gray-200 dark:text-gray-800"
                >
                  <span className="sr-only">Close sidebar</span>
                  <svg
                    className="size-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>

              <div className="95 flex grow flex-col overflow-y-auto border-r border-gray-300 bg-white backdrop-blur-xl dark:border-gray-600/60 dark:bg-gray-800">
                <div className="px-6 py-8">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-xl">
                      <span className="text-lg font-bold text-white dark:text-black">R</span>
                    </div>
                    <div>
                      <h1 className="text-xl font-bold tracking-tight text-gray-600 dark:text-gray-400">
                        RBI System
                      </h1>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Records Management
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 px-6 pb-6">
                  <Navigation />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="95 flex grow flex-col overflow-y-auto border-r border-gray-300 bg-white backdrop-blur-xl dark:border-gray-600/60 dark:bg-gray-800">
          <div className="px-6 py-8">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-xl">
                <span className="text-lg font-bold text-white dark:text-black">R</span>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-gray-600 dark:text-gray-400">
                  RBI System
                </h1>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Records Management
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 px-6 pb-6">
            <Navigation />
          </div>
        </div>
      </div>

      <div className="lg:pl-64">
        {/* Top navigation bar */}
        <div className="90 sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-6 border-b border-gray-300 bg-white px-4 shadow-xl shadow-black/5 backdrop-blur-2xl sm:px-6 lg:px-8 dark:border-gray-600/40 dark:bg-gray-800">
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={() => setSidebarOpen(true)}
            className="-m-2.5 rounded-lg p-2.5 text-gray-600 transition-all duration-200 hover:bg-gray-50 hover:text-gray-600 lg:hidden dark:bg-gray-700 dark:text-gray-400"
          >
            <span className="sr-only">Open sidebar</span>
            <div className="flex size-5 flex-col justify-center space-y-1">
              <div className="h-0.5 w-5 rounded-full bg-current"></div>
              <div className="h-0.5 w-5 rounded-full bg-current"></div>
              <div className="h-0.5 w-5 rounded-full bg-current"></div>
            </div>
          </Button>

          <div className="h-6 w-px bg-slate-200 lg:hidden" />

          <div className="flex flex-1 gap-x-6 self-stretch">
            {/* Search */}
            <div className="relative flex max-w-lg flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <div className="size-4 text-gray-500 dark:text-gray-400">
                  <div className="size-4 rounded-full border border-current"></div>
                  <div className="absolute top-3 left-3 h-2 w-0.5 rotate-45 bg-current"></div>
                </div>
              </div>
              <input
                className="80 block size-full rounded-2xl border-0 bg-white py-0 pr-4 pl-11 text-gray-600 shadow-inner transition-all duration-200 placeholder:text-gray-500 hover:bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:ring-inset sm:text-sm dark:bg-gray-700/80 dark:bg-gray-800 dark:text-gray-400"
                placeholder="Search residents, addresses..."
                type="search"
              />
            </div>

            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notifications */}
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                className="relative -m-2.5 rounded-xl p-2.5 text-gray-500 transition-all duration-200 hover:bg-gray-50 hover:text-gray-600 dark:bg-gray-700 dark:text-gray-400"
              >
                <span className="sr-only">View notifications</span>
                <div className="relative size-5">
                  <div className="absolute inset-0 rounded-lg border border-current"></div>
                  <div className="absolute inset-x-1 top-1 h-0.5 rounded-full bg-current"></div>
                  <div className="absolute inset-x-1 bottom-1 h-1 rounded-full bg-current"></div>
                </div>
                <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-linear-to-br from-red-500 to-pink-600 shadow-lg">
                  <span className="text-xs font-bold text-white dark:text-black">3</span>
                </span>
              </Button>

              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-200" />

              {/* Profile */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="group -m-1.5 flex h-auto items-center rounded-2xl p-2 transition-all duration-200 hover:bg-gray-50 dark:bg-gray-700"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="flex size-8 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-xl ring-2 ring-white transition-transform duration-200 group-hover:scale-105">
                    <span className="text-sm font-bold text-white dark:text-black">BO</span>
                  </div>
                  <span className="hidden lg:ml-3 lg:flex lg:items-center">
                    <span className="text-sm font-semibold text-gray-600 transition-colors duration-200 group-hover:text-indigo-600 dark:text-gray-400">
                      Barangay Official
                    </span>
                    <div className="ml-2 size-4 text-gray-500 transition-colors duration-200 group-hover:text-gray-600 dark:text-gray-400">
                      <div className="size-1 rounded-full bg-current"></div>
                      <div className="-mt-0.5 ml-1 size-1 rounded-full bg-current"></div>
                      <div className="-mt-0.5 ml-2 size-1 rounded-full bg-current"></div>
                    </div>
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="min-h-screen py-8 lg:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
