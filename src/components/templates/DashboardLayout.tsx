'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { SearchBar } from '@/components/molecules'
import Navigation from '@/components/organisms/Navigation'

// User dropdown component with details (from original dashboard)
function UserDropdown() {
  const { userProfile, role, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [barangayInfo, setBarangayInfo] = useState<string>('Loading...')
  
  // Load barangay information from database
  const loadBarangayInfo = async (barangayCode: string) => {
    try {
      console.log('Loading barangay info for code:', barangayCode)
      
      // Query the PSGC tables to get full address hierarchy
      const { data: barangayData, error } = await supabase
        .from('psgc_barangays')
        .select(`
          name,
          psgc_cities_municipalities!inner(
            name,
            type,
            psgc_provinces!inner(
              name,
              psgc_regions!inner(
                name
              )
            )
          )
        `)
        .eq('code', barangayCode)
        .single()

      if (error) {
        console.error('Error loading barangay info:', error)
        setBarangayInfo(`Barangay ${barangayCode}`)
        return
      }

      if (barangayData) {
        const cityMun = (barangayData as any).psgc_cities_municipalities
        const province = cityMun.psgc_provinces
        const region = province.psgc_regions
        
        const fullAddress = `${barangayData.name}, ${cityMun.name} (${cityMun.type}), ${province.name}`
        console.log('Loaded barangay info from database:', fullAddress)
        setBarangayInfo(fullAddress)
      } else {
        setBarangayInfo(`Barangay ${barangayCode}`)
      }
    } catch (error) {
      console.error('Exception loading barangay info:', error)
      setBarangayInfo(`Barangay ${barangayCode}`)
    }
  }

  // Load barangay info when userProfile changes
  useEffect(() => {
    if (userProfile?.barangay_code) {
      loadBarangayInfo(userProfile.barangay_code)
    }
  }, [userProfile?.barangay_code])
  
  const handleLogout = async () => {
    try {
      await signOut()
      window.location.href = '/login'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (!userProfile) return null

  return (
    <div className="relative">
      {/* Dropdown trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:bg-neutral-100 px-2 py-1 rounded transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-center bg-cover bg-no-repeat" 
             style={{backgroundImage: "url('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face')"}}></div>
        <div className="font-montserrat font-medium text-sm text-neutral-800">
          {`${userProfile.first_name} ${userProfile.last_name}`}
        </div>
        <div className="w-4 h-4 text-neutral-600">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d={isOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
          </svg>
        </div>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Dropdown content */}
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-neutral-200 z-20">
            {/* User info header */}
            <div className="p-4 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-center bg-cover bg-no-repeat" 
                     style={{backgroundImage: "url('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face')"}}></div>
                <div>
                  <div className="font-montserrat font-semibold text-neutral-900">
                    {`${userProfile.first_name} ${userProfile.last_name}`}
                  </div>
                  <div className="font-montserrat text-sm text-neutral-600">
                    {userProfile.email}
                  </div>
                  <div className="font-montserrat text-xs text-blue-600 mt-1">
                    {role?.name || 'User'}
                  </div>
                </div>
              </div>
            </div>

            {/* Barangay info */}
            <div className="p-4 border-b border-neutral-100">
              <div className="text-xs font-montserrat font-medium text-neutral-500 mb-2">
                BARANGAY ASSIGNMENT
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="font-montserrat text-sm text-neutral-800">
                  {barangayInfo}
                </div>
              </div>
              <div className="font-montserrat text-xs text-neutral-500 mt-1">
                Code: {userProfile.barangay_code}
              </div>
            </div>

            {/* Actions */}
            <div className="p-2">
              <button
                onClick={() => {
                  // Add profile editing functionality later
                  alert('Profile editing coming soon!')
                }}
                className="w-full text-left px-3 py-2 font-montserrat text-sm text-neutral-700 hover:bg-neutral-100 rounded transition-colors"
              >
                Edit Profile
              </button>
              <Link href="/settings">
                <button
                  className="w-full text-left px-3 py-2 font-montserrat text-sm text-neutral-700 hover:bg-neutral-100 rounded transition-colors"
                >
                  Settings
                </button>
              </Link>
              <hr className="my-2 border-neutral-200" />
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 font-montserrat text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

interface DashboardLayoutProps {
  children: React.ReactNode
  searchTerm?: string
  onSearchChange?: (value: string) => void
}

export default function DashboardLayout({ 
  children, 
  searchTerm = '',
  onSearchChange 
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-56 bg-background-secondary border-r border-default">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-default">
            <h1 className="font-montserrat font-semibold text-xl text-primary">Citizenly</h1>
            <div className="flex gap-1">
              <div className="bg-neutral-200 p-0.5 rounded">
                <div className="w-5 h-5 bg-neutral-400 rounded"></div>
              </div>
              <div className="bg-neutral-200 p-0.5 rounded">
                <div className="w-5 h-5 bg-neutral-400 rounded"></div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-2 py-4">
            <Navigation />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-56">
        {/* Top Header */}
        <div className="bg-background border-b border-default px-6 py-2">
          <div className="flex items-center justify-between">
            {/* Search */}
            <div className="w-[497px]">
              <SearchBar
                placeholder="Search Citizenly"
                value={searchTerm}
                onChange={(e) => onSearchChange?.(e.target.value)}
                onClear={() => onSearchChange?.('')}
                onSearch={(value) => {
                  // Handle search action (Enter key pressed)
                  console.log('Searching for:', value)
                  // Add your search logic here
                }}
                variant="default"
                size="md"
                showClearButton={true}
              />
            </div>

            {/* User Section */}
            <div className="flex items-center gap-2">
              <div className="bg-neutral-200 p-2 rounded-full">
                <div className="w-5 h-5 text-neutral-600">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </div>
              <div className="bg-neutral-200 p-2 rounded-full">
                <div className="w-5 h-5 text-neutral-600">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="w-6 h-0 border-l border-neutral-300"></div>
              <UserDropdown />
            </div>
          </div>
        </div>

        {/* Page Content */}
        {children}
      </div>
    </div>
  )
}