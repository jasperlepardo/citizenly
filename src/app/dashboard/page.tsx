'use client'

/**
 * Dashboard Page
 * Main dashboard with statistics and overview
 */

import React, { useState, useEffect } from 'react'
import AppShell from '@/components/layout/AppShell'
import StatsCard from '@/components/dashboard/StatsCard'
import { testDatabaseConnection } from '@/lib/database'

interface DatabaseStats {
  regions: number
  provinces: number
  cities: number
  barangays: number
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

  return (
    <AppShell>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          Overview of your RBI System with real-time statistics and quick actions.
        </p>
      </div>

      {/* Connection Status */}
      <div className="mb-6">
        {dbConnected === true ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
              <span className="text-green-800 font-medium">Database Connected</span>
              <span className="text-green-600 ml-2">• 91% Nationwide Coverage</span>
            </div>
          </div>
        ) : dbConnected === false ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-400 rounded-full mr-3"></div>
              <span className="text-red-800 font-medium">Database Connection Failed</span>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-400 rounded-full mr-3 animate-pulse"></div>
              <span className="text-gray-800 font-medium">Checking connection...</span>
            </div>
          </div>
        )}
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Residents"
          value={isLoading ? "..." : "1,247"}
          description="Registered residents"
          color="blue"
          trend={{ value: 12, isPositive: true }}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
          }
        />

        <StatsCard
          title="Active Addresses"
          value={isLoading ? "..." : dbStats?.barangays?.toLocaleString() || "38,372"}
          description="Barangays covered"
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />

        <StatsCard
          title="Cities/Municipalities"
          value={isLoading ? "..." : dbStats?.cities?.toLocaleString() || "1,637"}
          description="Complete coverage"
          color="purple"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />

        <StatsCard
          title="Regions Covered"
          value={isLoading ? "..." : dbStats?.regions || "17"}
          description="Nationwide reach"
          color="orange"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition-colors">
              <div className="font-medium text-blue-900">Register New Resident</div>
              <div className="text-sm text-blue-600">Add a new resident to the system</div>
            </button>
            <button className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-md border border-green-200 transition-colors">
              <div className="font-medium text-green-900">Search Residents</div>
              <div className="text-sm text-green-600">Find and manage existing residents</div>
            </button>
            <button className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-md border border-purple-200 transition-colors">
              <div className="font-medium text-purple-900">Generate Reports</div>
              <div className="text-sm text-purple-600">Create demographic and statistical reports</div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
              <div>
                <div className="text-sm font-medium text-gray-900">Address component deployed</div>
                <div className="text-xs text-gray-500">2 minutes ago</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
              <div>
                <div className="text-sm font-medium text-gray-900">Database connection established</div>
                <div className="text-xs text-gray-500">5 minutes ago</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
              <div>
                <div className="text-sm font-medium text-gray-900">System initialized</div>
                <div className="text-xs text-gray-500">10 minutes ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-md">
            <div className="text-2xl font-bold text-green-600">
              {dbStats ? Math.round((dbStats.barangays / 42028) * 100) : 91}%
            </div>
            <div className="text-sm text-green-700">Coverage</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-md">
            <div className="text-2xl font-bold text-blue-600">99.9%</div>
            <div className="text-sm text-blue-700">Uptime</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-md">
            <div className="text-2xl font-bold text-purple-600">&lt;50ms</div>
            <div className="text-sm text-purple-700">Response Time</div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}