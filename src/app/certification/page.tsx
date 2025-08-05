'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/templates'
import { Button } from '@/components/atoms'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

function CertificationContent() {
  const [searchTerm, setSearchTerm] = useState('')

  const certificateTypes = [
    {
      name: 'Barangay Certificate',
      description: 'General barangay certification for residents',
      icon: '📄',
      status: 'Available'
    },
    {
      name: 'Certificate of Residency',
      description: 'Proof of residency within the barangay',
      icon: '🏠',
      status: 'Available'
    },
    {
      name: 'Barangay Clearance',
      description: 'Official clearance for various purposes',
      icon: '✅',
      status: 'Available'
    },
    {
      name: 'Certificate of Indigency',
      description: 'Certification for economically disadvantaged residents',
      icon: '🤝',
      status: 'Available'
    },
    {
      name: 'Business Permit Certificate',
      description: 'Certification for business operations',
      icon: '🏢',
      status: 'Coming Soon'
    },
    {
      name: 'Good Moral Certificate',
      description: 'Character certification for residents',
      icon: '⭐',
      status: 'Coming Soon'
    }
  ]

  return (
    <DashboardLayout 
      currentPage="certification"
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
    >
      <div className="p-6">
        {/* Page Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-montserrat font-semibold text-xl text-primary mb-0.5">Certification Services</h1>
            <p className="font-montserrat font-normal text-sm text-secondary">
              Generate and manage barangay certificates and official documents
            </p>
          </div>
          <Button variant="primary" size="md">
            Request Certificate
          </Button>
        </div>

        {/* Certificate Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {certificateTypes.map((cert, index) => (
            <div key={index} className={`bg-surface rounded-lg border p-6 hover:shadow-md transition-shadow ${
              cert.status === 'Available' ? 'border-default hover:border-blue-300' : 'border-default opacity-75'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="text-2xl">{cert.icon}</div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  cert.status === 'Available' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {cert.status}
                </span>
              </div>
              <h3 className="font-montserrat font-semibold text-base text-primary mb-2">
                {cert.name}
              </h3>
              <p className="font-montserrat text-sm text-secondary mb-4">
                {cert.description}
              </p>
              <Button 
                variant={cert.status === 'Available' ? 'primary' : 'ghost'}
                size="sm"
                fullWidth
                disabled={cert.status !== 'Available'}
              >
                {cert.status === 'Available' ? 'Request Now' : 'Coming Soon'}
              </Button>
            </div>
          ))}
        </div>

        {/* Recent Requests Section */}
        <div className="bg-surface rounded-lg border border-default p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-montserrat font-semibold text-lg text-primary">Recent Certificate Requests</h2>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>
          
          <div className="space-y-4">
            {/* Sample Request Items */}
            <div className="flex items-center justify-between p-4 bg-surface-hover rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-sm">#001</span>
                </div>
                <div>
                  <h4 className="font-montserrat font-medium text-sm text-primary">Barangay Certificate</h4>
                  <p className="font-montserrat text-xs text-secondary">Requested by: Juan Dela Cruz</p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Ready</span>
                <p className="font-montserrat text-xs text-muted mt-1">Dec 15, 2024</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-surface-hover rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-sm">#002</span>
                </div>
                <div>
                  <h4 className="font-montserrat font-medium text-sm text-primary">Certificate of Residency</h4>
                  <p className="font-montserrat text-xs text-secondary">Requested by: Maria Santos</p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">Processing</span>
                <p className="font-montserrat text-xs text-neutral-500 mt-1">Dec 14, 2024</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-surface-hover rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-sm">#003</span>
                </div>
                <div>
                  <h4 className="font-montserrat font-medium text-sm text-primary">Barangay Clearance</h4>
                  <p className="font-montserrat text-xs text-secondary">Requested by: Pedro Garcia</p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Pending</span>
                <p className="font-montserrat text-xs text-neutral-500 mt-1">Dec 13, 2024</p>
              </div>
            </div>
          </div>

          {/* Empty State (commented out for demo) */}
          {/* 
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-montserrat font-medium text-primary mb-2">No certificate requests yet</h3>
            <p className="font-montserrat text-sm text-secondary">
              Certificate requests will appear here once residents start requesting documents.
            </p>
          </div>
          */}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function CertificationPage() {
  return (
    <ProtectedRoute>
      <CertificationContent />
    </ProtectedRoute>
  )
}