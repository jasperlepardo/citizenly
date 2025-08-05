'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/templates'
import { Button } from '@/components/atoms'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

function BusinessContent() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <DashboardLayout 
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
    >
      <div className="p-6">
        {/* Page Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-montserrat font-semibold text-xl text-primary mb-0.5">Business Registration</h1>
            <p className="font-montserrat font-normal text-sm text-secondary">
              Manage business permits, licenses, and registrations in your barangay
            </p>
          </div>
          <Button variant="primary" size="md">
            Register New Business
          </Button>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-surface rounded-lg border border-default p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0H3m6 0a2 2 0 100-4 2 2 0 000 4zm0 0a2 2 0 100-4 2 2 0 000 4zm8-4a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-primary mb-2">Business Management Coming Soon</h3>
          <p className="text-secondary mb-6 max-w-md mx-auto">
            We&apos;re working on bringing you comprehensive business registration and permit management tools. 
            This feature will allow you to track business licenses, permits, and compliance in your barangay.
          </p>
          
          {/* Feature Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-surface-hover rounded-lg p-4">
              <div className="w-8 h-8 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h4 className="font-medium text-sm text-primary mb-1">Business Permits</h4>
              <p className="text-xs text-secondary">Track and manage business permit applications and renewals</p>
            </div>
            
            <div className="bg-surface-hover rounded-lg p-4">
              <div className="w-8 h-8 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-medium text-sm text-primary mb-1">Tax Records</h4>
              <p className="text-xs text-secondary">Monitor business tax compliance and payment history</p>
            </div>
            
            <div className="bg-surface-hover rounded-lg p-4">
              <div className="w-8 h-8 mx-auto mb-2 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="font-medium text-sm text-primary mb-1">Analytics</h4>
              <p className="text-xs text-secondary">View business registration trends and statistics</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function BusinessPage() {
  return (
    <ProtectedRoute>
      <BusinessContent />
    </ProtectedRoute>
  )
}