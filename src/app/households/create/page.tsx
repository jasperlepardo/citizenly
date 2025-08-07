'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/organisms';
import { DashboardLayout } from '@/components/templates';
import { HouseholdFormWizard } from '@/components/templates';

export const dynamic = 'force-dynamic';

function CreateHouseholdForm() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <DashboardLayout searchTerm={searchTerm} onSearchChange={setSearchTerm}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/households"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-950/10 bg-white px-3 py-2 text-sm/6 font-medium text-zinc-950 shadow-sm hover:bg-zinc-50 dark:border-white/15 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
          >
            <svg
              className="size-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back
          </Link>
          <div>
            <h1 className="text-2xl/8 font-semibold text-zinc-950 dark:text-white">
              Create New Household
            </h1>
            <p className="mt-2 text-sm/6 text-zinc-500 dark:text-zinc-400">
              Complete the form to register a new household in the system
            </p>
          </div>
        </div>

        {/* Form Wizard */}
        <HouseholdFormWizard />
      </div>
    </DashboardLayout>
  );
}

export default function CreateHouseholdPage() {
  return (
    <ProtectedRoute requirePermission="residents_create">
      <CreateHouseholdForm />
    </ProtectedRoute>
  );
}
