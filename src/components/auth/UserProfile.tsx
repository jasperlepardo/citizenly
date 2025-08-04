'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface UserProfileProps {
  compact?: boolean
  showBarangay?: boolean
  className?: string
}

export default function UserProfile({ compact = false, showBarangay = true, className = '' }: UserProfileProps) {
  const { user, userProfile, role, signOut, loading, profileLoading } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  
  // For now, mock barangay accounts until the full implementation is available
  const barangayAccounts: any[] = []
  const address = null

  if (loading || profileLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        {!compact && <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>}
      </div>
    )
  }

  if (!user || !userProfile) {
    return null
  }

  const displayName = `${userProfile.first_name} ${userProfile.last_name}`
  const initials = `${userProfile.first_name[0]}${userProfile.last_name[0]}`.toUpperCase()

  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = '/login'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => {
            console.log('Avatar clicked, current dropdown state:', showDropdown)
            setShowDropdown(!showDropdown)
          }}
          className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
            {initials}
          </div>
          {!compact && (
            <div className="text-left">
              <div className="text-sm font-medium text-gray-900">{displayName}</div>
              <div className="text-xs text-gray-500">{role?.name}</div>
            </div>
          )}
        </button>

        {showDropdown && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => {
                console.log('Background clicked, closing dropdown')
                setShowDropdown(false)
              }}
            ></div>
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-xl border border-gray-200 z-50"
                 style={{ backgroundColor: 'white', border: '2px solid red' }} // Temporary styling to make it visible
            >
              <div className="p-4 border-b border-gray-100">
                <div className="font-medium text-gray-900">{displayName}</div>
                <div className="text-sm text-gray-500">{userProfile.email}</div>
                <div className="text-xs text-blue-600 mt-1">{role?.name}</div>
              </div>
              
              {showBarangay && address && (
                <div className="p-4 border-b border-gray-100">
                  <div className="text-xs font-medium text-gray-700 mb-1">Assigned Barangay</div>
                  <div className="text-sm text-gray-900">{userProfile?.barangay_code}</div>
                  <div className="text-xs text-gray-500">Barangay Assignment</div>
                </div>
              )}
              
              <div className="p-2">
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
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

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-medium">
          {initials}
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{displayName}</h3>
          <p className="text-gray-600">{userProfile.email}</p>
          
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">Role:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {role?.name}
              </span>
            </div>
            
            {userProfile.phone && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500">Phone:</span>
                <span className="text-sm text-gray-900">{userProfile.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {showBarangay && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Barangay Assignment</h4>
          
          {barangayAccounts.length > 0 ? (
            <div className="space-y-2">
              {barangayAccounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-3 bg-green-50 rounded-md border border-green-200">
                  <div>
                    <div className="text-sm font-medium text-green-800">
                      {account.barangay_code}
                    </div>
                    <div className="text-xs text-green-600">
                      Barangay Assignment
                    </div>
                  </div>
                  {account.is_primary && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-200 text-green-800">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-red-50 rounded-md border border-red-200">
              <div className="text-sm font-medium text-red-800">No Barangay Assignment</div>
              <div className="text-xs text-red-600">Contact your administrator to assign you to a barangay.</div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-100">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}