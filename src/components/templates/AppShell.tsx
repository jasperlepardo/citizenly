'use client';

/**
 * Application Shell Component
 * Modern Tailwind UI application shell with advanced design patterns
 */

import React, { useState } from 'react';
import { Button } from '@/components/atoms';
import Navigation from '@/components/organisms/Navigation';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="relative z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />

          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-xs flex-1">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  onClick={() => setSidebarOpen(false)}
                  className="-m-2.5 p-2.5 text-white hover:text-gray-200"
                >
                  <span className="sr-only">Close sidebar</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>

              <div className="flex grow flex-col overflow-y-auto bg-surface/95 backdrop-blur-xl border-r border-default/60">
                <div className="px-6 py-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-xl">
                      <span className="text-white font-bold text-lg">R</span>
                    </div>
                    <div>
                      <h1 className="text-xl font-bold tracking-tight text-primary">RBI System</h1>
                      <p className="text-xs text-muted font-medium">Records Management</p>
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
        <div className="flex grow flex-col overflow-y-auto bg-surface/95 backdrop-blur-xl border-r border-default/60">
          <div className="px-6 py-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-xl">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-primary">RBI System</h1>
                <p className="text-xs text-muted font-medium">Records Management</p>
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
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-6 border-b border-default/40 bg-surface/90 backdrop-blur-2xl px-4 shadow-xl shadow-black/5 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={() => setSidebarOpen(true)}
            className="-m-2.5 p-2.5 text-secondary hover:text-primary hover:bg-surface-hover rounded-lg transition-all duration-200 lg:hidden"
          >
            <span className="sr-only">Open sidebar</span>
            <div className="h-5 w-5 flex flex-col justify-center space-y-1">
              <div className="h-0.5 w-5 bg-current rounded-full"></div>
              <div className="h-0.5 w-5 bg-current rounded-full"></div>
              <div className="h-0.5 w-5 bg-current rounded-full"></div>
            </div>
          </Button>

          <div className="h-6 w-px bg-slate-200 lg:hidden" />

          <div className="flex flex-1 gap-x-6 self-stretch">
            {/* Search */}
            <div className="relative flex flex-1 max-w-lg">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <div className="h-4 w-4 text-muted">
                  <div className="h-4 w-4 rounded-full border border-current"></div>
                  <div className="absolute top-3 left-3 h-2 w-0.5 bg-current rotate-45"></div>
                </div>
              </div>
              <input
                className="block h-full w-full rounded-2xl border-0 py-0 pl-11 pr-4 text-primary placeholder:text-muted focus:ring-2 focus:ring-inset focus:ring-indigo-500 bg-surface/80 hover:bg-surface-hover/80 focus:bg-surface transition-all duration-200 sm:text-sm shadow-inner"
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
                className="relative -m-2.5 p-2.5 text-muted hover:text-secondary hover:bg-surface-hover rounded-xl transition-all duration-200"
              >
                <span className="sr-only">View notifications</span>
                <div className="relative h-5 w-5">
                  <div className="absolute inset-0 rounded-lg border border-current"></div>
                  <div className="absolute top-1 left-1 right-1 h-0.5 bg-current rounded-full"></div>
                  <div className="absolute bottom-1 left-1 right-1 h-1 bg-current rounded-full"></div>
                </div>
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-xs font-bold text-white">3</span>
                </span>
              </Button>

              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-200" />

              {/* Profile */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-m-1.5 flex items-center p-2 hover:bg-surface-hover rounded-2xl transition-all duration-200 group h-auto"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl ring-2 ring-white group-hover:scale-105 transition-transform duration-200">
                    <span className="text-sm font-bold text-white">BO</span>
                  </div>
                  <span className="hidden lg:flex lg:items-center lg:ml-3">
                    <span className="text-sm font-semibold text-primary group-hover:text-indigo-600 transition-colors duration-200">
                      Barangay Official
                    </span>
                    <div className="ml-2 h-4 w-4 text-muted group-hover:text-secondary transition-colors duration-200">
                      <div className="h-1 w-1 bg-current rounded-full"></div>
                      <div className="h-1 w-1 bg-current rounded-full ml-1 -mt-0.5"></div>
                      <div className="h-1 w-1 bg-current rounded-full ml-2 -mt-0.5"></div>
                    </div>
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="py-8 lg:py-12 min-h-screen">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="space-y-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
