'use client'

import { useEffect, useState } from 'react'
import { testDatabaseConnection } from '@/lib/database'

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
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            RBI System
          </h1>
          <h2 className="mt-3 text-xl text-gray-600 sm:text-2xl">
            Records of Barangay Inhabitant System
          </h2>
          <p className="mt-5 text-lg text-gray-500 max-w-2xl mx-auto">
            Complete digital solution for Philippine barangay resident management.
            Built with modern web technologies and comprehensive nationwide geographic coverage.
          </p>
        </div>

        {/* Database Status */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔗 Database Connection Status</h3>
          
          {dbConnected === null && (
            <div className="flex items-center space-x-3">
              <div className="animate-pulse w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span className="text-yellow-600">Testing connection...</span>
            </div>
          )}
          
          {dbConnected === true && dbStats && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-green-600 font-medium">✅ Connected to production database</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                <span className="font-medium">Coverage:</span> {Math.round((dbStats.barangays/42028)*100)}% nationwide 
                ({dbStats.barangays.toLocaleString()}/42,028 barangays)
              </div>
            </div>
          )}
          
          {dbConnected === false && (
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span className="text-red-600 font-medium">❌ Database connection failed</span>
            </div>
          )}
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
                  <a 
                    href="/address-demo"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <span className="text-sm">📍</span> Try Address Demo
                  </a>
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
        
        <div className="mt-12 text-center">
          <div className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700">
            {dbConnected === true ? '🚀 Database Connected - Ready for Development' : '🚧 Frontend Development In Progress'}
          </div>
          <p className="mt-4 text-sm text-gray-500">
            {dbConnected === true 
              ? `Connected to production database with ${dbStats ? Math.round((dbStats.barangays/42028)*100) : 'N/A'}% coverage • Next.js 14 • Tailwind CSS • Supabase`
              : 'Following MVP architecture documentation • Next.js 14 • Tailwind CSS • Supabase'
            }
          </p>
        </div>
      </div>
    </main>
  )
}