'use client'

/**
 * Reports Page
 * Analytics, demographics, and reporting dashboard
 */

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/templates'


export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly')
  const [selectedReport, setSelectedReport] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')

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
    <DashboardLayout 
      currentPage="reports"
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-3xl p-8 border border-slate-200/60">
          <div className="md:flex md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Reports & Analytics
              </h1>
              <p className="mt-2 text-lg text-slate-600">
                Comprehensive reporting and data analytics for your RBI System
              </p>
            </div>
            <div className="mt-6 flex gap-4 md:ml-4 md:mt-0">
              <select
                className="rounded-2xl border-0 py-3 pl-4 pr-10 text-slate-900 bg-white shadow-inner ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
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
                className="inline-flex items-center rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-xl hover:shadow-2xl hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 transition-all duration-200"
              >
                Export Data
              </button>
            </div>
          </div>
        </div>

        {/* Report Categories */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reportCategories.map((category) => (
            <div
              key={category.id}
              className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl p-6 shadow-xl shadow-slate-900/5 border border-slate-200/60 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300"
              onClick={() => setSelectedReport(category.id)}
            >
              <div className="flex flex-col h-full">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <div className="w-6 h-6 bg-white rounded-lg opacity-90"></div>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{category.name}</h3>
                <p className="text-slate-600 text-sm flex-grow">{category.description}</p>
                <div className="mt-4">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    category.status === 'ready'
                      ? 'bg-emerald-100 text-emerald-800 ring-1 ring-inset ring-emerald-600/20'
                      : 'bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-600/20'
                  }`}>
                    {category.status === 'ready' ? 'Ready' : 'Coming Soon'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Report Content */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Demographics Chart */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl shadow-xl shadow-slate-900/5 border border-slate-200/60 rounded-2xl">
            <div className="p-8">
              <div className="border-b border-slate-200 pb-6 mb-8">
                <h3 className="text-2xl font-bold text-slate-900">Demographics Overview</h3>
                <p className="mt-2 text-slate-600">Population distribution by age groups and gender</p>
              </div>
              
              {/* Age Groups Chart */}
              <div>
                <h4 className="text-lg font-semibold text-slate-900 mb-6">Age Distribution</h4>
                <div className="space-y-4">
                  {mockChartData.demographics.ageGroups.map((group) => (
                    <div key={group.range} className="flex items-center p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                      <div className="w-20 text-sm font-medium text-slate-900">{group.range}</div>
                      <div className="flex-1 mx-6">
                        <div className="bg-slate-200 rounded-full h-4 shadow-inner">
                          <div 
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-4 rounded-full shadow-lg transition-all duration-1000 ease-out" 
                            style={{ width: `${group.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-20 text-sm font-semibold text-slate-700 text-right">
                        {group.count} ({group.percentage}%)
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gender Distribution */}
              <div className="mt-10">
                <h4 className="text-lg font-semibold text-slate-900 mb-6">Gender Distribution</h4>
                <div className="grid grid-cols-2 gap-6">
                  {mockChartData.demographics.gender.map((item, index) => (
                    <div key={item.type} className={`text-center p-6 rounded-2xl border border-slate-200 ${
                      index === 0 ? 'bg-gradient-to-br from-blue-50 to-indigo-100' : 'bg-gradient-to-br from-pink-50 to-purple-100'
                    }`}>
                      <div className={`text-3xl font-bold ${
                        index === 0 ? 'text-blue-600' : 'text-pink-600'
                      }`}>{item.count}</div>
                      <div className="text-sm font-medium text-slate-700 mt-2">{item.type} ({item.percentage}%)</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="space-y-8">
            {/* Registration Trends */}
            <div className="bg-white/80 backdrop-blur-xl shadow-xl shadow-slate-900/5 border border-slate-200/60 rounded-2xl">
              <div className="p-6">
                <div className="border-b border-slate-200 pb-4 mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Registration Trends</h3>
                  <p className="mt-1 text-slate-600">Monthly registration activity</p>
                </div>
                <div className="space-y-3">
                  {mockChartData.monthly.slice(-3).map((item) => (
                    <div key={item.month} className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                      <span className="text-sm font-medium text-slate-900">{item.month}</span>
                      <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">+{item.registrations}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="text-center bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6">
                    <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">134</div>
                    <div className="text-sm font-medium text-slate-600 mt-1">This month (+37%)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Geographic Summary */}
            <div className="bg-white/80 backdrop-blur-xl shadow-xl shadow-slate-900/5 border border-slate-200/60 rounded-2xl">
              <div className="p-6">
                <div className="border-b border-slate-200 pb-4 mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Geographic Distribution</h3>
                  <p className="mt-1 text-slate-600">Residents by region</p>
                </div>
                <div className="space-y-3">
                  {mockChartData.geographic.map((region) => (
                    <div key={region.region} className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                      <span className="text-sm font-medium text-slate-900">{region.region}</span>
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900">{region.residents}</div>
                        <div className="text-xs font-medium text-slate-500">{region.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-xl shadow-xl shadow-slate-900/5 border border-slate-200/60 rounded-2xl">
          <div className="p-8">
            <div className="border-b border-slate-200 pb-6 mb-8">
              <h3 className="text-2xl font-bold text-slate-900">Report Actions</h3>
              <p className="mt-2 text-slate-600">Generate and export detailed reports</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <button className="group inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 text-sm font-semibold text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200">
                <div className="mr-3 h-5 w-5 bg-white rounded-lg opacity-90 group-hover:scale-110 transition-transform duration-200"></div>
                Generate PDF Report
              </button>
              <button className="group inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-4 text-sm font-semibold text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200">
                <div className="mr-3 h-5 w-5 bg-white rounded-lg opacity-90 group-hover:scale-110 transition-transform duration-200"></div>
                Export to Excel
              </button>
              <button className="group inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4 text-sm font-semibold text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200">
                <div className="mr-3 h-5 w-5 bg-white rounded-lg opacity-90 group-hover:scale-110 transition-transform duration-200"></div>
                Schedule Report
              </button>
            </div>
          </div>
        </div>

        {/* Insights Panel */}
        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 shadow-xl shadow-slate-900/5 border border-slate-200/60 rounded-2xl">
          <div className="p-8">
            <div className="border-b border-slate-200/60 pb-6 mb-8">
              <h3 className="text-2xl font-bold text-slate-900">Key Insights</h3>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:scale-105 transition-transform duration-200">
                <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">+37%</div>
                <div className="text-sm font-medium text-slate-700 mt-2">Registration growth this month</div>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:scale-105 transition-transform duration-200">
                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">91.3%</div>
                <div className="text-sm font-medium text-slate-700 mt-2">Nationwide address coverage</div>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:scale-105 transition-transform duration-200">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">1,247</div>
                <div className="text-sm font-medium text-slate-700 mt-2">Total registered residents</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}