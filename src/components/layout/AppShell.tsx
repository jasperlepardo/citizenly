'use client'

/**
 * Application Shell Component
 * Modern Tailwind UI application shell with advanced design patterns
 */

import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Residents', href: '/residents' },
  { name: 'Addresses', href: '/addresses' },
  { name: 'Reports', href: '/reports' },
  { name: 'Settings', href: '/settings' },
]

interface AppShellProps {
  children: React.ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="relative z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          
          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-xs flex-1">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                  <span className="sr-only">Close sidebar</span>
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="flex grow flex-col overflow-y-auto bg-white/95 backdrop-blur-xl border-r border-slate-200/60">
                <div className="px-6 py-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-xl">
                      <span className="text-white font-bold text-lg">R</span>
                    </div>
                    <div>
                      <h1 className="text-xl font-bold tracking-tight text-slate-900">RBI System</h1>
                      <p className="text-xs text-slate-500 font-medium">Records Management</p>
                    </div>
                  </div>
                </div>
                
                <nav className="flex-1 px-6 pb-6">
                  <ul className="space-y-2">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={`${
                            pathname === item.href
                              ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-500 font-semibold'
                              : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50 font-medium'
                          } group flex items-center px-4 py-3 text-sm rounded-l-lg border-r-2 border-transparent transition-all duration-200`}
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-12 pt-6 border-t border-slate-200">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Tools</h3>
                    <ul className="space-y-2">
                      <li>
                        <Link
                          href="/address-demo"
                          className="text-slate-600 hover:text-indigo-600 hover:bg-slate-50 group flex items-center px-4 py-2 text-sm font-medium rounded-l-lg transition-all duration-200"
                        >
                          Address Demo
                        </Link>
                      </li>
                    </ul>
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col overflow-y-auto bg-white/95 backdrop-blur-xl border-r border-slate-200/60">
          <div className="px-6 py-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-xl">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">RBI System</h1>
                <p className="text-xs text-slate-500 font-medium">Records Management</p>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 px-6 pb-6">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`${
                      pathname === item.href
                        ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-500 font-semibold'
                        : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50 font-medium'
                    } group flex items-center px-4 py-3 text-sm rounded-l-lg border-r-2 border-transparent transition-all duration-200`}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
            
            <div className="mt-12 pt-6 border-t border-slate-200">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Tools</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/address-demo"
                    className="text-slate-600 hover:text-indigo-600 hover:bg-slate-50 group flex items-center px-4 py-2 text-sm font-medium rounded-l-lg transition-all duration-200"
                  >
                    Address Demo
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </div>

      <div className="lg:pl-64">
        {/* Top navigation bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-6 border-b border-slate-200/40 bg-white/90 backdrop-blur-2xl px-4 shadow-xl shadow-slate-900/5 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <div className="h-5 w-5 flex flex-col justify-center space-y-1">
              <div className="h-0.5 w-5 bg-current rounded-full"></div>
              <div className="h-0.5 w-5 bg-current rounded-full"></div>
              <div className="h-0.5 w-5 bg-current rounded-full"></div>
            </div>
          </button>

          <div className="h-6 w-px bg-slate-200 lg:hidden" />

          <div className="flex flex-1 gap-x-6 self-stretch">
            {/* Search */}
            <div className="relative flex flex-1 max-w-lg">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <div className="h-4 w-4 text-slate-400">
                  <div className="h-4 w-4 rounded-full border border-current"></div>
                  <div className="absolute top-3 left-3 h-2 w-0.5 bg-current rotate-45"></div>
                </div>
              </div>
              <input
                className="block h-full w-full rounded-2xl border-0 py-0 pl-11 pr-4 text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 bg-slate-100/80 hover:bg-slate-200/80 focus:bg-white transition-all duration-200 sm:text-sm shadow-inner"
                placeholder="Search residents, addresses..."
                type="search"
              />
            </div>
            
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notifications */}
              <button type="button" className="relative -m-2.5 p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-200">
                <span className="sr-only">View notifications</span>
                <div className="relative h-5 w-5">
                  <div className="absolute inset-0 rounded-lg border border-current"></div>
                  <div className="absolute top-1 left-1 right-1 h-0.5 bg-current rounded-full"></div>
                  <div className="absolute bottom-1 left-1 right-1 h-1 bg-current rounded-full"></div>
                </div>
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-xs font-bold text-white">3</span>
                </span>
              </button>

              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-200" />

              {/* Profile */}
              <div className="relative">
                <button type="button" className="-m-1.5 flex items-center p-2 hover:bg-slate-100 rounded-2xl transition-all duration-200 group">
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl ring-2 ring-white group-hover:scale-105 transition-transform duration-200">
                    <span className="text-sm font-bold text-white">BO</span>
                  </div>
                  <span className="hidden lg:flex lg:items-center lg:ml-3">
                    <span className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors duration-200">Barangay Official</span>
                    <div className="ml-2 h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors duration-200">
                      <div className="h-1 w-1 bg-current rounded-full"></div>
                      <div className="h-1 w-1 bg-current rounded-full ml-1 -mt-0.5"></div>
                      <div className="h-1 w-1 bg-current rounded-full ml-2 -mt-0.5"></div>
                    </div>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="py-8 lg:py-12 min-h-screen">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="space-y-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}