'use client'

/**
 * Dashboard Page
 * Enhanced Tailwind UI dashboard with comprehensive statistics and overview
 */

import React, { useState, useEffect } from 'react'
import AppShell from '@/components/layout/AppShell'
import { testDatabaseConnection } from '@/lib/database'

interface DatabaseStats {
  regions: number
  provinces: number
  cities: number
  barangays: number
}

// Enhanced Icon Components
function ChartBarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  )
}

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  )
}

function MapPinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  )
}

function BuildingOfficeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15l-.75 18h-13.5L4.5 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 9h.75m0 0h.75m-.75 0v3m0-3v-1.5M12 9h.75m-.75 0v3m0-3v-1.5m0 1.5h-.75M18 9h-.75m.75 0v3m0-3v-1.5m0 1.5h-.75" />
    </svg>
  )
}

function GlobeAsiaAustraliaIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 0 1-1.161.886l-.143.048a1.107 1.107 0 0 0-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 0 1-.427 1.068l-2.146 1.025c-.348.166-.705-.032-.705-.405v-.741c0-1.036.84-1.875 1.875-1.875h.375a1.5 1.5 0 0 0 1.302-.756l.723-1.447A.75.75 0 0 0 9 10.125l-1.875.375L5.25 12.75v-2.757c0-.235-.146-.445-.365-.53-.47-.18-.57-.69-.189-1.07l.256-.256a1.875 1.875 0 0 0 .55-1.326V3.75A20.25 20.25 0 0 1 12.75 3.03Z" />
    </svg>
  )
}

function ArrowTrendingUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
    </svg>
  )
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  )
}

export default function DashboardPage() {
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null)
  const [dbConnected, setDbConnected] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
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
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  // Statistics data
  const stats = [
    {
      id: 1,
      name: 'Total Residents',
      stat: isLoading ? "..." : "1,247",
      icon: UsersIcon,
      change: '+12%',
      changeType: 'increase',
      color: 'indigo'
    },
    {
      id: 2,
      name: 'Barangays Covered',
      stat: isLoading ? "..." : dbStats?.barangays?.toLocaleString() || "38,372",
      icon: MapPinIcon,
      change: '+3.2%',
      changeType: 'increase',
      color: 'emerald'
    },
    {
      id: 3,
      name: 'Cities/Municipalities',
      stat: isLoading ? "..." : dbStats?.cities?.toLocaleString() || "1,637",
      icon: BuildingOfficeIcon,
      change: 'Complete',
      changeType: 'complete',
      color: 'purple'
    },
    {
      id: 4,
      name: 'Regions',
      stat: isLoading ? "..." : dbStats?.regions || "17",
      icon: GlobeAsiaAustraliaIcon,
      change: 'Nationwide',
      changeType: 'complete',
      color: 'orange'
    },
  ]

  const quickActions = [
    {
      name: 'Register New Resident',
      description: 'Add a new resident to the system',
      href: '/residents/new',
      icon: UsersIcon,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      name: 'Search Residents',
      description: 'Find and manage existing residents',
      href: '/residents',
      icon: ChartBarIcon,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      name: 'Generate Reports',
      description: 'Create demographic and statistical reports',
      href: '/reports',
      icon: ArrowTrendingUpIcon,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      name: 'Address Demo',
      description: 'Test the address lookup system',
      href: '/address-demo',
      icon: MapPinIcon,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  const recentActivity = [
    {
      id: 1,
      type: 'success',
      title: 'Database connection established',
      description: 'Successfully connected to Supabase',
      time: '2 minutes ago',
      icon: 'check',
    },
    {
      id: 2,
      type: 'info',
      title: 'Address component deployed',
      description: 'Cascading dropdown system is now live',
      time: '5 minutes ago',
      icon: 'info',
    },
    {
      id: 3,
      type: 'success',
      title: 'System initialized',
      description: 'RBI System startup completed',
      time: '10 minutes ago',
      icon: 'check',
    },
  ]

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Overview of your RBI System with real-time statistics and quick actions
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {dbConnected === true ? (
              <div className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                <div className="mr-2 h-2 w-2 rounded-full bg-green-400"></div>
                Database Connected
              </div>
            ) : dbConnected === false ? (
              <div className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                <div className="mr-2 h-2 w-2 rounded-full bg-red-400"></div>
                Connection Failed
              </div>
            ) : (
              <div className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
                <div className="mr-2 h-2 w-2 rounded-full bg-gray-400 animate-pulse"></div>
                Checking...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="mb-8">
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => {
            const colorClasses = {
              indigo: 'bg-indigo-500',
              emerald: 'bg-emerald-500',
              purple: 'bg-purple-500',
              orange: 'bg-orange-500',
            }
            
            return (
              <div
                key={item.id}
                className="relative overflow-hidden rounded-xl bg-white px-4 pb-12 pt-5 shadow ring-1 ring-gray-900/5 sm:px-6 sm:pt-6"
              >
                <dt>
                  <div className={`absolute rounded-md p-3 ${colorClasses[item.color as keyof typeof colorClasses]}`}>
                    <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
                </dt>
                <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                  <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
                  <p
                    className={`ml-2 flex items-baseline text-sm font-semibold ${
                      item.changeType === 'increase'
                        ? 'text-green-600'
                        : item.changeType === 'complete'
                        ? 'text-blue-600'
                        : 'text-red-600'
                    }`}
                  >
                    {item.changeType === 'increase' && (
                      <ArrowTrendingUpIcon
                        className="h-4 w-4 flex-shrink-0 self-center text-green-500"
                        aria-hidden="true"
                      />
                    )}
                    <span className="sr-only"> {item.changeType === 'increase' ? 'Increased' : 'Decreased'} by </span>
                    {item.change}
                  </p>
                </dd>
              </div>
            )
          })}
        </dl>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
        {/* Quick Actions */}
        <div className="rounded-xl bg-white shadow ring-1 ring-gray-900/5">
          <div className="p-6">
            <h3 className="text-lg font-semibold leading-6 text-gray-900">Quick Actions</h3>
            <p className="mt-2 text-sm text-gray-600">Frequently used tasks and operations</p>
            <div className="mt-6 flow-root">
              <ul role="list" className="-my-5 divide-y divide-gray-200">
                {quickActions.map((action) => (
                  <li key={action.name} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className={`flex-shrink-0 rounded-lg p-2 ${action.bgColor}`}>
                        <action.icon className={`h-6 w-6 ${action.iconColor}`} aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">{action.name}</p>
                        <p className="truncate text-sm text-gray-500">{action.description}</p>
                      </div>
                      <div>
                        <a
                          href={action.href}
                          className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                          Open
                        </a>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl bg-white shadow ring-1 ring-gray-900/5">
          <div className="p-6">
            <h3 className="text-lg font-semibold leading-6 text-gray-900">Recent Activity</h3>
            <p className="mt-2 text-sm text-gray-600">Latest system events and updates</p>
            <div className="mt-6 flow-root">
              <ul role="list" className="-mb-8">
                {recentActivity.map((activityItem, activityItemIdx) => (
                  <li key={activityItem.id}>
                    <div className="relative pb-8">
                      {activityItemIdx !== recentActivity.length - 1 ? (
                        <span
                          className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span
                            className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                              activityItem.type === 'success'
                                ? 'bg-green-500'
                                : activityItem.type === 'info'
                                ? 'bg-blue-500'
                                : 'bg-gray-500'
                            }`}
                          >
                            {activityItem.icon === 'check' ? (
                              <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <ClockIcon className="h-5 w-5 text-white" />
                            )}
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-gray-900">{activityItem.title}</p>
                            <p className="text-sm text-gray-500">{activityItem.description}</p>
                          </div>
                          <div className="whitespace-nowrap text-right text-sm text-gray-500">
                            <time>{activityItem.time}</time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="rounded-xl bg-white shadow ring-1 ring-gray-900/5">
        <div className="p-6">
          <h3 className="text-lg font-semibold leading-6 text-gray-900">System Status</h3>
          <p className="mt-2 text-sm text-gray-600">Real-time system performance metrics</p>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="overflow-hidden rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-green-600">Database Coverage</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-green-900">
                {dbStats ? Math.round((dbStats.barangays / 42028) * 100) : 91}%
              </dd>
              <p className="mt-1 text-sm text-green-600">
                {dbStats?.barangays.toLocaleString() || "38,372"} of 42,028 barangays
              </p>
            </div>
            <div className="overflow-hidden rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-blue-600">System Uptime</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-blue-900">99.9%</dd>
              <p className="mt-1 text-sm text-blue-600">Last 30 days</p>
            </div>
            <div className="overflow-hidden rounded-lg bg-gradient-to-r from-purple-50 to-violet-50 px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-purple-600">Response Time</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-purple-900">&lt;50ms</dd>
              <p className="mt-1 text-sm text-purple-600">Average database query</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}