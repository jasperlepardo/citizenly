'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/templates'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

function JudiciaryContent() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <DashboardLayout 
      currentPage="judiciary"
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
    >
      <div className="p-6">
        {/* Page Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-montserrat font-semibold text-xl text-neutral-900 mb-0.5">Judiciary Services</h1>
            <p className="font-montserrat font-normal text-sm text-neutral-600">
              Barangay justice system, mediation, and dispute resolution services
            </p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded font-montserrat font-medium text-base hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            File New Case
          </button>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Barangay Justice System Coming Soon</h3>
          <p className="text-neutral-600 mb-6 max-w-md mx-auto">
            We're developing a comprehensive digital platform for barangay justice administration. 
            This will streamline case management, mediation processes, and legal documentation.
          </p>
          
          {/* Feature Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-neutral-50 rounded-lg p-4">
              <div className="w-8 h-8 mx-auto mb-2 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="font-medium text-sm text-neutral-900 mb-1">Case Management</h4>
              <p className="text-xs text-neutral-600">Track cases, hearings, and legal proceedings digitally</p>
            </div>
            
            <div className="bg-neutral-50 rounded-lg p-4">
              <div className="w-8 h-8 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="font-medium text-sm text-neutral-900 mb-1">Mediation Services</h4>
              <p className="text-xs text-neutral-600">Facilitate dispute resolution and community mediation</p>
            </div>
            
            <div className="bg-neutral-50 rounded-lg p-4">
              <div className="w-8 h-8 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h4 className="font-medium text-sm text-neutral-900 mb-1">Legal Records</h4>
              <p className="text-xs text-neutral-600">Maintain comprehensive legal documentation and archives</p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 bg-amber-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-sm text-amber-800">Important Note</span>
            </div>
            <p className="text-xs text-amber-700">
              This system will comply with Barangay Justice System guidelines and ensure proper legal procedures are followed.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function JudiciaryPage() {
  return (
    <ProtectedRoute>
      <JudiciaryContent />
    </ProtectedRoute>
  )
}