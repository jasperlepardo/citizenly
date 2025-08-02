'use client'

/**
 * Reports Page
 * Analytics, demographics, and reporting dashboard
 */

import React, { useState } from 'react'
import AppShell from '@/components/layout/AppShell'

// Icons
function ChartBarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  )
}

function DocumentChartBarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25M9 16.5v.75m3-3v3M15 12v5.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
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

function ArrowDownTrayIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  )
}

function CalendarDaysIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5" />
    </svg>
  )
}

function PresentationChartLineIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0-1-3m1 3h-9m9 0h-9M21 21v-2.25" />
    </svg>
  )
}

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly')
  const [selectedReport, setSelectedReport] = useState('overview')

  // Report categories
  const reportCategories = [
    {
      id: 'demographics',
      name: 'Demographics Report',
      description: 'Population analysis by age, gender, and location',
      icon: UsersIcon,
      color: 'bg-blue-500',
      status: 'ready'
    },
    {
      id: 'geographic',
      name: 'Geographic Distribution',
      description: 'Resident distribution across barangays and cities',
      icon: ChartBarIcon,
      color: 'bg-green-500',
      status: 'ready'
    },
    {
      id: 'registration',
      name: 'Registration Trends',
      description: 'New registrations and system usage over time',
      icon: PresentationChartLineIcon,
      color: 'bg-purple-500',
      status: 'ready'
    },
    {
      id: 'analytics',
      name: 'System Analytics',
      description: 'Database performance and usage statistics',
      icon: DocumentChartBarIcon,
      color: 'bg-orange-500',
      status: 'pending'
    }
  ]

  // Mock chart data
  const mockChartData = {
    demographics: {
      ageGroups: [
        { range: '0-17', count: 324, percentage: 26 },
        { range: '18-35', count: 412, percentage: 33 },
        { range: '36-55', count: 398, percentage: 32 },
        { range: '56+', count: 113, percentage: 9 }
      ],
      gender: [
        { type: 'Male', count: 623, percentage: 50 },
        { type: 'Female', count: 624, percentage: 50 }
      ]
    },
    geographic: [
      { region: 'NCR', residents: 456, percentage: 37 },
      { region: 'CALABARZON', residents: 298, percentage: 24 },
      { region: 'Central Luzon', residents: 234, percentage: 19 },
      { region: 'Others', residents: 259, percentage: 20 }
    ],
    monthly: [
      { month: 'Jan', registrations: 45 },
      { month: 'Feb', registrations: 67 },
      { month: 'Mar', registrations: 89 },
      { month: 'Apr', registrations: 123 },
      { month: 'May', registrations: 98 },
      { month: 'Jun', registrations: 134 }
    ]
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Reports & Analytics
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Comprehensive reporting and data analytics for your RBI System
            </p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <select
              className="rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 mr-3"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
              <option value="quarterly">This Quarter</option>
              <option value="yearly">This Year</option>
            </select>
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <ArrowDownTrayIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
              Export Data
            </button>
          </div>
        </div>

        {/* Report Categories */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {reportCategories.map((category) => (
            <div
              key={category.id}
              className="relative overflow-hidden rounded-xl bg-white px-4 pb-12 pt-5 shadow ring-1 ring-gray-900/5 sm:px-6 sm:pt-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedReport(category.id)}
            >
              <dt>
                <div className={`absolute rounded-md p-3 ${category.color}`}>
                  <category.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-900">{category.name}</p>
              </dt>
              <dd className="ml-16 pb-6 sm:pb-7">
                <p className="text-sm text-gray-500">{category.description}</p>
                <div className="mt-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    category.status === 'ready'
                      ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                      : 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20'
                  }`}>
                    {category.status === 'ready' ? 'Ready' : 'Coming Soon'}
                  </span>
                </div>
              </dd>
            </div>
          ))}
        </div>

        {/* Main Report Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Demographics Chart */}
          <div className="lg:col-span-2 bg-white shadow ring-1 ring-gray-900/5 sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-base font-semibold leading-6 text-gray-900">Demographics Overview</h3>
              <p className="mt-2 text-sm text-gray-500">Population distribution by age groups and gender</p>
              
              {/* Age Groups Chart */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Age Distribution</h4>
                <div className="space-y-3">
                  {mockChartData.demographics.ageGroups.map((group) => (
                    <div key={group.range} className="flex items-center">
                      <div className="w-20 text-sm text-gray-900">{group.range}</div>
                      <div className="flex-1 mx-4">
                        <div className="bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-indigo-600 h-3 rounded-full" 
                            style={{ width: `${group.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-16 text-sm text-gray-500 text-right">
                        {group.count} ({group.percentage}%)
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gender Distribution */}
              <div className="mt-8">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Gender Distribution</h4>
                <div className="grid grid-cols-2 gap-4">
                  {mockChartData.demographics.gender.map((item) => (
                    <div key={item.type} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{item.count}</div>
                      <div className="text-sm text-gray-500">{item.type} ({item.percentage}%)</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="space-y-6">
            {/* Registration Trends */}
            <div className="bg-white shadow ring-1 ring-gray-900/5 sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-base font-semibold leading-6 text-gray-900">Registration Trends</h3>
                <p className="mt-2 text-sm text-gray-500">Monthly registration activity</p>
                <div className="mt-6 space-y-2">
                  {mockChartData.monthly.slice(-3).map((item) => (
                    <div key={item.month} className="flex items-center justify-between">
                      <span className="text-sm text-gray-900">{item.month}</span>
                      <span className="text-sm font-medium text-indigo-600">+{item.registrations}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">134</div>
                    <div className="text-sm text-gray-500">This month (+37%)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Geographic Summary */}
            <div className="bg-white shadow ring-1 ring-gray-900/5 sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-base font-semibold leading-6 text-gray-900">Geographic Distribution</h3>
                <p className="mt-2 text-sm text-gray-500">Residents by region</p>
                <div className="mt-6 space-y-3">
                  {mockChartData.geographic.map((region) => (
                    <div key={region.region} className="flex items-center justify-between">
                      <span className="text-sm text-gray-900">{region.region}</span>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{region.residents}</div>
                        <div className="text-xs text-gray-500">{region.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow ring-1 ring-gray-900/5 sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Report Actions</h3>
            <p className="mt-2 text-sm text-gray-500">Generate and export detailed reports</p>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <button className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                <DocumentChartBarIcon className="mr-2 h-4 w-4" />
                Generate PDF Report
              </button>
              <button className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500">
                <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
                Export to Excel
              </button>
              <button className="inline-flex items-center justify-center rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500">
                <CalendarDaysIcon className="mr-2 h-4 w-4" />
                Schedule Report
              </button>
            </div>
          </div>
        </div>

        {/* Insights Panel */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 shadow ring-1 ring-gray-900/5 sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Key Insights</h3>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-indigo-600">+37%</div>
                <div className="text-sm text-gray-700">Registration growth this month</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-emerald-600">91.3%</div>
                <div className="text-sm text-gray-700">Nationwide address coverage</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-purple-600">1,247</div>
                <div className="text-sm text-gray-700">Total registered residents</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}