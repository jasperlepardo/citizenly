'use client'

import { useEffect, useState } from 'react'
import { testDatabaseConnection } from '@/lib/database'
import AppShell from '@/components/layout/AppShell'
import Link from 'next/link'

interface DatabaseStats {
  regions: number
  provinces: number
  cities: number
  barangays: number
}

export default function HomePage() {
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null)
  const [dbConnected, setDbConnected] = useState<boolean | null>(null)

  useEffect(() => {
    async function checkDatabase() {
      try {
        const result = await testDatabaseConnection()
        if (result.success && result.data) {
          setDbStats(result.data)
          setDbConnected(true)
        } else {
          setDbConnected(false)
        }
      } catch (error) {
        setDbConnected(false)
      }
    }

    checkDatabase()
  }, [])

  return (
    <AppShell>
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-indigo-100/20 via-transparent to-transparent">
        <div className="mx-auto max-w-7xl pb-24 pt-10 sm:pb-32 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-40">
          <div className="px-6 lg:px-0 lg:pt-4">
            <div className="mx-auto max-w-2xl">
              <div className="max-w-lg">
                <div className="mt-24 sm:mt-32 lg:mt-16">
                  <div className="inline-flex space-x-6">
                    <span className="rounded-full bg-indigo-600/10 px-3 py-1 text-sm font-semibold leading-6 text-indigo-600 ring-1 ring-inset ring-indigo-600/10">
                      Latest updates
                    </span>
                    <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-gray-600">
                      <span>Version 2.0</span>
                      <svg viewBox="0 0 6 6" aria-hidden="true" className="h-1.5 w-1.5 fill-gray-400">
                        <circle cx={3} cy={3} r={3} />
                      </svg>
                      <span>Now Live</span>
                    </span>
                  </div>
                </div>
                <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  Records of Barangay Inhabitant System
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Complete digital solution for Philippine barangay resident management with real-time data integration and comprehensive administrative tools.
                </p>
                <div className="mt-10 flex items-center gap-x-6">
                  <Link
                    href="/dashboard"
                    className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Get started
                  </Link>
                  {dbConnected && (
                    <Link href="/address-demo" className="text-sm font-semibold leading-6 text-gray-900">
                      Try Address Demo <span aria-hidden="true">→</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-20 sm:mt-24 md:mx-auto md:max-w-2xl lg:mx-0 lg:mt-0 lg:w-screen">
            <div className="absolute inset-y-0 right-1/2 -z-10 -mr-10 w-[200%] skew-x-[-30deg] bg-white shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 md:-mr-20 lg:-mr-36" />
            <div className="shadow-lg md:rounded-3xl">
              <div className="bg-indigo-500 [clip-path:inset(0)] md:[clip-path:inset(0_round_theme(borderRadius.3xl))]">
                <div className="absolute -inset-y-px left-1/2 -z-10 ml-10 w-[200%] skew-x-[-30deg] bg-indigo-100 opacity-20 ring-1 ring-inset ring-white md:ml-20 lg:ml-36" />
                <div className="relative px-6 pt-8 sm:pt-16 md:pl-16 md:pr-0">
                  <div className="mx-auto max-w-2xl md:mx-0 md:max-w-none">
                    <div className="w-screen overflow-hidden rounded-tl-xl bg-gray-50">
                      <div className="flex bg-gray-200/40 ring-1 ring-white/5">
                        <div className="-mb-px flex text-sm font-medium leading-6 text-gray-400">
                          <div className="border-b border-r border-b-white/20 border-r-white/10 bg-white/5 px-4 py-2 text-white">
                            RBI Dashboard
                          </div>
                        </div>
                      </div>
                      <div className="px-6 pb-14 pt-6">
                        {/* System Status Display */}
                        <div className="space-y-4">
                          {dbConnected === true && dbStats ? (
                            <>
                              <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                <span className="text-green-700 font-medium text-sm">Database Connected Successfully</span>
                              </div>
                              <div className="grid grid-cols-2 gap-3 text-center">
                                <div className="bg-blue-50 rounded-lg p-3">
                                  <div className="text-2xl font-bold text-blue-600">{dbStats.regions}</div>
                                  <div className="text-xs text-blue-700">Regions</div>
                                </div>
                                <div className="bg-green-50 rounded-lg p-3">
                                  <div className="text-2xl font-bold text-green-600">{dbStats.provinces}</div>
                                  <div className="text-xs text-green-700">Provinces</div>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-3">
                                  <div className="text-2xl font-bold text-purple-600">{dbStats.cities.toLocaleString()}</div>
                                  <div className="text-xs text-purple-700">Cities</div>
                                </div>
                                <div className="bg-orange-50 rounded-lg p-3">
                                  <div className="text-2xl font-bold text-orange-600">{dbStats.barangays.toLocaleString()}</div>
                                  <div className="text-xs text-orange-700">Barangays</div>
                                </div>
                              </div>
                              <div className="text-center bg-gray-50 rounded-lg p-3">
                                <div className="text-lg font-bold text-gray-900">
                                  {Math.round((dbStats.barangays/42028)*100)}% Coverage
                                </div>
                                <div className="text-xs text-gray-600">
                                  {dbStats.barangays.toLocaleString()}/42,028 barangays nationwide
                                </div>
                              </div>
                            </>
                          ) : dbConnected === false ? (
                            <div className="flex items-center space-x-3 justify-center py-8">
                              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                              <span className="text-red-600 font-medium">Database connection failed</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-3 justify-center py-8">
                              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                              <span className="text-yellow-600 font-medium">Checking database connection...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-white sm:h-32" />
      </div>

      {/* Feature section */}
      <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-40 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Deploy faster</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to manage barangay residents
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Comprehensive tools for resident registration, address management, reporting, and analytics - all integrated with Philippine administrative data.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-gray-900">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                  </svg>
                </div>
                Resident Management
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600">
                5-step registration process with validation, complete demographics, and PSOC integration for comprehensive resident records.
              </dd>
            </div>
            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-gray-900">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                </div>
                Address System
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600">
                Complete Philippine geographic hierarchy with cascading dropdowns, validation, and 91% nationwide coverage.
              </dd>
            </div>
            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-gray-900">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                  </svg>
                </div>
                Search & Analytics
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600">
                Global search capabilities, advanced filtering, and comprehensive analytics dashboard for data-driven insights.
              </dd>
            </div>
            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-gray-900">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                </div>
                Secure & Reliable
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600">
                Built with security best practices, reliable infrastructure, and 99.9% uptime for critical government operations.
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* CTA section */}
      <div className="mx-auto mt-32 max-w-7xl sm:mt-40 sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden bg-gray-900 px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to modernize your barangay administration?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
            Join the digital transformation of Philippine local government with our comprehensive RBI System.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/dashboard"
              className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Get started
            </Link>
            {dbConnected && (
              <Link href="/address-demo" className="text-sm font-semibold leading-6 text-white">
                Try demo <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>
          <svg
            viewBox="0 0 1024 1024"
            className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
            aria-hidden="true"
          >
            <circle cx={512} cy={512} r={512} fill="url(#827591b1-ce8c-4110-b064-7cb85a0b1217)" fillOpacity="0.7" />
            <defs>
              <radialGradient id="827591b1-ce8c-4110-b064-7cb85a0b1217">
                <stop stopColor="#7775D6" />
                <stop offset={1} stopColor="#E935C1" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>
    </AppShell>
  )
}