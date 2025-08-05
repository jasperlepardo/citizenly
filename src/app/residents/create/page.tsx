'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/templates'
import ResidentFormWizard from '@/components/templates/ResidentFormWizard'

export const dynamic = 'force-dynamic'

function CreateResidentForm() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <DashboardLayout 
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
    >
      <div className="p-6">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link 
            href="/residents"
            className="inline-flex items-center gap-2 rounded-lg border border-default bg-surface px-3 py-2 text-sm/6 font-medium text-primary shadow-sm hover:bg-surface-hover"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back
          </Link>
          <div>
            <h1 className="text-2xl/8 font-semibold text-primary">
              Add New Resident
            </h1>
            <p className="mt-2 text-sm/6 text-secondary">
              Complete the form to register a new resident in the system
            </p>
          </div>
        </div>

        {/* Form Wizard */}
        <ResidentFormWizard />
      </div>
    </DashboardLayout>
  )
}

export default function CreateResidentPage() {
  return (
    <ProtectedRoute requirePermission="residents_create">
      <CreateResidentForm />
    </ProtectedRoute>
  )
}