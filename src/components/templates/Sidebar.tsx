'use client';

/**
 * Sidebar Navigation Component
 * Based on Tailwind UI sidebar application shell
 */

import React from 'react';
import { Button } from '@/components/atoms';
import { Navigation } from '@/components/organisms';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="relative z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/80 dark:bg-black/90"
            onClick={() => setSidebarOpen(false)}
          />

          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-xs flex-1">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  iconOnly
                  className="text-white hover:text-gray-300"
                >
                  <span className="sr-only">Close sidebar</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>

              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-surface px-6 pb-4">
                <div className="flex h-16 shrink-0 items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">RBI</span>
                    </div>
                    <span className="text-xl font-semibold text-primary">RBI System</span>
                  </div>
                </div>
                <Navigation />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-default bg-surface px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RBI</span>
              </div>
              <span className="text-xl font-semibold text-primary">RBI System</span>
            </div>
          </div>
          <Navigation />
        </div>
      </div>
    </>
  );
}
