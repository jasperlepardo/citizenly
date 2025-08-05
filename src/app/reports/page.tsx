'use client'

/**
 * Reports Page
 * Analytics, demographics, and reporting dashboard
 */

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/templates'
import { DropdownSelect } from '@/components/molecules'
import { Button } from '@/components/atoms'


export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly')
  const [, setSelectedReport] = useState('overview')

  // Report categories
  const reportCategories = [
    {
      id: 'demographics',
      name: 'Demographics Report',
      description: 'Population analysis by age, gender, and location',
      gradient: 'from-blue-500 to-indigo-600',
      status: 'ready'
    },
    {
      id: 'geographic',
      name: 'Geographic Distribution',
      description: 'Resident distribution across barangays and cities',
      gradient: 'from-emerald-500 to-green-600',
      status: 'ready'
    },
    {
      id: 'registration',
      name: 'Registration Trends',
      description: 'New registrations and system usage over time',
      gradient: 'from-purple-500 to-pink-600',
      status: 'ready'
    },
    {
      id: 'analytics',
      name: 'System Analytics',
      description: 'Database performance and usage statistics',
      gradient: 'from-orange-500 to-red-600',
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
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-background-muted to-surface rounded-3xl p-8 border border-default">
          <div className="md:flex md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold tracking-tight text-primary">
                Reports & Analytics
              </h1>
              <p className="mt-2 text-lg text-secondary">
                Comprehensive reporting and data analytics for your RBI System
              </p>
            </div>
            <div className="mt-6 flex gap-3 md:ml-4 md:mt-0">
              <DropdownSelect
                options={[
                  { value: 'weekly', label: 'This Week' },
                  { value: 'monthly', label: 'This Month' },
                  { value: 'quarterly', label: 'This Quarter' },
                  { value: 'yearly', label: 'This Year' }
                ]}
                value={selectedPeriod}
                onChange={(val) => setSelectedPeriod(val)}
              />
              <Button variant="primary">
                Export Data
              </Button>
            </div>
          </div>
        </div>

        {/* Report Categories */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {reportCategories.map((category) => (
            <div
              key={category.id}
              className="group relative bg-surface rounded-lg border border-default p-4 cursor-pointer hover:bg-surface-hover transition-colors"
              onClick={() => setSelectedReport(category.id)}
            >
              <div className="flex flex-col h-full">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                  <div className="w-5 h-5 bg-blue-600 rounded opacity-90"></div>
                </div>
                <h3 className="text-base font-semibold text-primary mb-2">{category.name}</h3>
                <p className="text-secondary text-sm flex-grow">{category.description}</p>
                <div className="mt-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    category.status === 'ready'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>
                    {category.status === 'ready' ? 'Ready' : 'Coming Soon'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Report Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Demographics Chart */}
          <div className="lg:col-span-2 bg-surface rounded-lg border border-default">
            <div className="p-6">
              <div className="border-b border-default pb-4 mb-6">
                <h3 className="text-lg font-bold text-primary">Demographics Overview</h3>
                <p className="mt-1 text-sm text-secondary">Population distribution by age groups and gender</p>
              </div>
              
              {/* Age Groups Chart */}
              <div>
                <h4 className="text-base font-semibold text-primary mb-4">Age Distribution</h4>
                <div className="space-y-3">
                  {mockChartData.demographics.ageGroups.map((group) => (
                    <div key={group.range} className="flex items-center p-3 bg-background rounded-lg border border-default">
                      <div className="w-16 text-sm font-medium text-primary">{group.range}</div>
                      <div className="flex-1 mx-4">
                        <div className="bg-background-muted rounded-full h-3">
                          <div 
                            className="bg-blue-600 h-3 rounded-full transition-all duration-1000 ease-out" 
                            style={{ width: `${group.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-16 text-sm font-medium text-secondary text-right">
                        {group.count} ({group.percentage}%)
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gender Distribution */}
              <div className="mt-8">
                <h4 className="text-base font-semibold text-primary mb-4">Gender Distribution</h4>
                <div className="grid grid-cols-2 gap-4">
                  {mockChartData.demographics.gender.map((item, index) => (
                    <div key={item.type} className="text-center p-4 bg-background rounded-lg border border-default">
                      <div className={`text-2xl font-bold ${
                        index === 0 ? 'text-blue-600' : 'text-pink-600'
                      }`}>{item.count}</div>
                      <div className="text-sm font-medium text-secondary mt-1">{item.type} ({item.percentage}%)</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="space-y-6">
            {/* Registration Trends */}
            <div className="bg-surface rounded-lg border border-default">
              <div className="p-4">
                <div className="border-b border-default pb-3 mb-4">
                  <h3 className="text-base font-bold text-primary">Registration Trends</h3>
                  <p className="mt-1 text-sm text-secondary">Monthly registration activity</p>
                </div>
                <div className="space-y-2">
                  {mockChartData.monthly.slice(-3).map((item) => (
                    <div key={item.month} className="flex items-center justify-between p-2 bg-background rounded border border-default">
                      <span className="text-sm font-medium text-primary">{item.month}</span>
                      <span className="text-sm font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">+{item.registrations}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-default">
                  <div className="text-center bg-background rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">134</div>
                    <div className="text-sm font-medium text-secondary mt-1">This month (+37%)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Geographic Summary */}
            <div className="bg-surface rounded-lg border border-default">
              <div className="p-4">
                <div className="border-b border-default pb-3 mb-4">
                  <h3 className="text-base font-bold text-primary">Geographic Distribution</h3>
                  <p className="mt-1 text-sm text-secondary">Residents by region</p>
                </div>
                <div className="space-y-2">
                  {mockChartData.geographic.map((region) => (
                    <div key={region.region} className="flex items-center justify-between p-2 bg-background rounded border border-default">
                      <span className="text-sm font-medium text-primary">{region.region}</span>
                      <div className="text-right">
                        <div className="text-sm font-bold text-primary">{region.residents}</div>
                        <div className="text-xs font-medium text-muted">{region.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-surface rounded-lg border border-default">
          <div className="p-6">
            <div className="border-b border-default pb-4 mb-6">
              <h3 className="text-lg font-bold text-primary">Report Actions</h3>
              <p className="mt-1 text-sm text-secondary">Generate and export detailed reports</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Button 
                variant="primary"
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
                fullWidth
              >
                Generate PDF Report
              </Button>
              <Button 
                variant="success"
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
                fullWidth
              >
                Export to Excel
              </Button>
              <Button 
                variant="secondary"
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                fullWidth
              >
                Schedule Report
              </Button>
            </div>
          </div>
        </div>

        {/* Insights Panel */}
        <div className="bg-surface rounded-lg border border-default">
          <div className="p-6">
            <div className="border-b border-default pb-4 mb-6">
              <h3 className="text-lg font-bold text-primary">Key Insights</h3>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-background rounded-lg p-4 border border-default">
                <div className="text-2xl font-bold text-green-600">+37%</div>
                <div className="text-sm font-medium text-secondary mt-1">Registration growth this month</div>
              </div>
              <div className="bg-background rounded-lg p-4 border border-default">
                <div className="text-2xl font-bold text-blue-600">91.3%</div>
                <div className="text-sm font-medium text-secondary mt-1">Nationwide address coverage</div>
              </div>
              <div className="bg-background rounded-lg p-4 border border-default">
                <div className="text-2xl font-bold text-purple-600">1,247</div>
                <div className="text-sm font-medium text-secondary mt-1">Total registered residents</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}