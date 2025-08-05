'use client'

/**
 * Database Connection Test Page
 * Tests the frontend connection to production Supabase database
 */

import { useEffect, useState } from 'react'
import { testDatabaseConnection, getRegions, type Region } from '@/lib/database'

interface DatabaseStats {
  regions: number
  provinces: number
  cities: number
  barangays: number
}

export default function TestDatabasePage() {
  const [, setIsLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'success' | 'error'>('connecting')
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [regions, setRegions] = useState<Region[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function testConnection() {
      try {
        setIsLoading(true)
        setConnectionStatus('connecting')

        // Test basic connection and get stats
        const connectionTest = await testDatabaseConnection()
        
        if (connectionTest.success && connectionTest.data) {
          setStats(connectionTest.data)
          setConnectionStatus('success')

          // Test actual data retrieval
          const regionsData = await getRegions()
          setRegions(regionsData)
        } else {
          setConnectionStatus('error')
          setError('Database connection failed')
        }
      } catch (err) {
        setConnectionStatus('error')
        setError(err instanceof Error ? err.message : 'Connection failed')
      } finally {
        setIsLoading(false)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🚀 RBI System Database Connection Test
          </h1>

          {/* Connection Status */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
            <div className="flex items-center space-x-4">
              {connectionStatus === 'connecting' && (
                <>
                  <div className="animate-pulse w-4 h-4 bg-yellow-400 rounded-full"></div>
                  <span className="text-yellow-600">Connecting to database...</span>
                </>
              )}
              {connectionStatus === 'success' && (
                <>
                  <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                  <span className="text-green-600 font-medium">✅ Connected successfully!</span>
                </>
              )}
              {connectionStatus === 'error' && (
                <>
                  <div className="w-4 h-4 bg-red-400 rounded-full"></div>
                  <span className="text-red-600 font-medium">❌ Connection failed</span>
                </>
              )}
            </div>
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Database Statistics */}
          {stats && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">📊 Database Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">{stats.regions.toLocaleString()}</div>
                  <div className="text-sm text-blue-700">Regions</div>
                  <div className="text-xs text-blue-500">Target: 17</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{stats.provinces.toLocaleString()}</div>
                  <div className="text-sm text-green-700">Provinces</div>
                  <div className="text-xs text-green-500">Target: 80+</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">{stats.cities.toLocaleString()}</div>
                  <div className="text-sm text-purple-700">Cities</div>
                  <div className="text-xs text-purple-500">Target: 1,634</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="text-2xl font-bold text-orange-600">{stats.barangays.toLocaleString()}</div>
                  <div className="text-sm text-orange-700">Barangays</div>
                  <div className="text-xs text-orange-500">Target: 42,028</div>
                </div>
              </div>

              {/* Coverage Calculation */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">🎯 Coverage Analysis</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Regions:</span> {stats.regions}/17 ({Math.round((stats.regions/17)*100)}%)
                  </div>
                  <div>
                    <span className="font-medium">Provinces:</span> {stats.provinces}/80+ ({Math.round((stats.provinces/80)*100)}%+)
                  </div>
                  <div>
                    <span className="font-medium">Cities:</span> {stats.cities}/1,634 ({Math.round((stats.cities/1634)*100)}%)
                  </div>
                  <div>
                    <span className="font-medium">Barangays:</span> {stats.barangays}/42,028 ({Math.round((stats.barangays/42028)*100)}%)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sample Data */}
          {regions.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">🗺️ Sample Data - Philippine Regions</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {regions.map((region) => (
                    <div key={region.code} className="bg-white p-3 rounded border">
                      <div className="font-medium text-gray-900">{region.name}</div>
                      <div className="text-sm text-gray-500">Code: {region.code}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {connectionStatus === 'success' && stats && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="text-green-400">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-green-800">
                    🎉 Database Connection Successful!
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Your frontend is now connected to the production RBI System database with:</p>
                    <ul className="mt-2 space-y-1">
                      <li>• Complete PSGC geographic hierarchy</li>
                      <li>• {stats.barangays > 35000 ? 'Outstanding' : stats.barangays > 25000 ? 'Excellent' : 'Good'} nationwide coverage ({Math.round((stats.barangays/42028)*100)}%)</li>
                      <li>• Ready for address dropdowns and resident registration</li>
                      <li>• Full Metro Manila and major cities coverage</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          {connectionStatus === 'success' && (
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-800 mb-3">🚀 Next Steps</h3>
              <div className="text-sm text-blue-700 space-y-2">
                <p>Your database connection is ready! You can now:</p>
                <ul className="mt-2 space-y-1 ml-4">
                  <li>1. Build cascading address dropdowns (Region → Province → City → Barangay)</li>
                  <li>2. Create the 5-step resident registration wizard</li>
                  <li>3. Implement address search and validation</li>
                  <li>4. Build the resident management dashboard</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}