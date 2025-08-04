'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'

interface DashboardStats {
  residents: number
  households: number
  businesses: number
  certifications: number
}

function DashboardContent() {
  const { userProfile, profileLoading } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({ residents: 0, households: 0, businesses: 0, certifications: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!profileLoading && userProfile?.barangay_code) {
      loadDashboardStats()
    }
  }, [userProfile, profileLoading])

  const loadDashboardStats = async () => {
    try {
      setLoading(true)
      
      // Load residents count
      const { count: residentsCount } = await supabase
        .from('residents')
        .select('*', { count: 'exact', head: true })
        .eq('barangay_code', userProfile?.barangay_code)
      
      // Load households count
      const { count: householdsCount } = await supabase
        .from('households')
        .select('*', { count: 'exact', head: true })
        .eq('barangay_code', userProfile?.barangay_code)
      
      setStats({
        residents: residentsCount || 0,
        households: householdsCount || 0,
        businesses: 0, // Placeholder - add when businesses table exists
        certifications: 0 // Placeholder - add when certifications table exists
      })
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (profileLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <DashboardLayout 
      currentPage="dashboard"
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
    >
      <div className="p-6">
        {/* Welcome Message */}
        <div className="mb-8">
          <h1 className="font-['Montserrat'] font-semibold text-2xl text-neutral-900">
            Welcome back, {userProfile ? userProfile.first_name : 'User'}!
          </h1>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-4 gap-6">
          {/* Residents Card */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <div className="font-['Montserrat'] font-medium text-sm text-neutral-700 mb-2">Residents</div>
            <div className="font-['Montserrat'] font-bold text-4xl text-neutral-900">
              {loading ? '...' : stats.residents.toLocaleString()}
            </div>
          </div>

          {/* Households Card */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <div className="font-['Montserrat'] font-medium text-sm text-neutral-700 mb-2">Households</div>
            <div className="font-['Montserrat'] font-bold text-4xl text-neutral-900">
              {loading ? '...' : stats.households.toLocaleString()}
            </div>
          </div>

          {/* Businesses Card */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <div className="font-['Montserrat'] font-medium text-sm text-neutral-700 mb-2">Businesses</div>
            <div className="font-['Montserrat'] font-bold text-4xl text-neutral-900">
              {loading ? '...' : stats.businesses.toLocaleString()}
            </div>
          </div>

          {/* Certifications Card */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <div className="font-['Montserrat'] font-medium text-sm text-neutral-700 mb-2">Certifications</div>
            <div className="font-['Montserrat'] font-bold text-4xl text-neutral-900">
              {loading ? '...' : stats.certifications.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}