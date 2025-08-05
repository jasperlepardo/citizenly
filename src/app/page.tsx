'use client'

import { useEffect, useState } from 'react'
import { testDatabaseConnection } from '@/lib/database'
import { DashboardLayout } from '@/components/templates'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { Button } from '@/components/atoms'
import Link from 'next/link'

interface DatabaseStats {
  regions: number
  provinces: number
  cities: number
  barangays: number
}

function HomeContent() {
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null)
  const [dbConnected, setDbConnected] = useState<boolean | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    async function checkDatabase() {
      try {
        const result = await testDatabaseConnection()
        if (result.success && result.data) {
          setDbStats(result.data)
          setDbConnected(true)
        } else {
          console.warn('Database connection failed:', result)
          setDbConnected(false)
        }
      } catch (error) {
        console.error('Database connection error:', error)
        setDbConnected(false)
      }
    }

    checkDatabase()
  }, [])

  return (
    <DashboardLayout 
      currentPage="dashboard"
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
    >
      <div className="p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to RBI System
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Records of Barangay Inhabitant System
        </p>
        <p className="text-lg text-gray-500">
          Complete digital solution for Philippine barangay resident management
        </p>
      </div>
      
      <div className="max-w-md mx-auto mb-12">
        {dbConnected === null && (
          <div className="flex items-center space-x-3 justify-center">
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
            <span className="text-yellow-600 font-medium">Checking database connection...</span>
          </div>
        )}
        
        {dbConnected === true && dbStats && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 justify-center">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-green-600 font-medium">Database connected successfully</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-lg shadow-sm">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{dbStats.regions}</div>
                <div className="text-xs text-blue-700">Regions</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">{dbStats.provinces}</div>
                <div className="text-xs text-green-700">Provinces</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">{dbStats.cities.toLocaleString()}</div>
                <div className="text-xs text-purple-700">Cities</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-lg font-bold text-orange-600">{dbStats.barangays.toLocaleString()}</div>
                <div className="text-xs text-orange-700">Barangays</div>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded text-center">
              <span className="font-medium">Coverage:</span> {Math.round((dbStats.barangays/42028)*100)}% nationwide 
              ({dbStats.barangays.toLocaleString()}/42,028 barangays)
            </div>
          </div>
        )}
        
        {dbConnected === false && (
          <div className="flex items-center space-x-3 justify-center">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span className="text-red-600 font-medium">Database connection failed</span>
          </div>
        )}
      </div>
      
      {/* Quick Access */}
      <div className="text-center mb-8">
        <Link href="/dashboard">
          <Button
            variant="primary"
            size="lg"
          >
            Go to Dashboard
          </Button>
        </Link>
      </div>
      
      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">Resident Management</h3>
            <p className="mt-2 text-sm text-gray-500">
              5-step registration with validation, complete demographics, and PSOC integration.
            </p>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">Address System</h3>
            <p className="mt-2 text-sm text-gray-500">
              Complete Philippine geographic hierarchy with cascading dropdowns and validation.
            </p>
            {dbConnected && (
              <div className="mt-4">
                <Link href="/address-demo">
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<span className="text-sm">📍</span>}
                  >
                    Try Address Demo
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">Search & Analytics</h3>
            <p className="mt-2 text-sm text-gray-500">
              Global search, advanced filtering, and comprehensive analytics dashboard.
            </p>
          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>
  )
}

export default function HomePage() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  )
}