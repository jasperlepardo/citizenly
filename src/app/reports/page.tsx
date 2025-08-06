'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/templates';
import { Button } from '@/components/atoms';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function ReportsContent() {
  const [searchTerm, setSearchTerm] = useState('');

  const reportTypes = [
    {
      name: 'RBI Registration Data',
      description: 'Records of Barangay Inhabitant form submissions and analytics',
      icon: '📋',
      status: 'Available',
      link: '/rbi-form',
    },
  ];

  return (
    <DashboardLayout searchTerm={searchTerm} onSearchChange={setSearchTerm}>
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-6">
          <div>
            <h1 className="font-montserrat font-semibold text-xl text-primary mb-0.5">
              Reports & Analytics
            </h1>
            <p className="font-montserrat font-normal text-sm text-secondary">
              Generate and manage comprehensive reports and data analytics for your barangay
            </p>
          </div>
        </div>

        {/* Report Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {reportTypes.map((report, index) => (
            <div
              key={index}
              className={`bg-surface rounded-lg border p-6 hover:shadow-md transition-shadow ${
                report.status === 'Available'
                  ? 'border-default hover:border-blue-300'
                  : 'border-default opacity-75'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-2xl">{report.icon}</div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    report.status === 'Available'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {report.status}
                </span>
              </div>
              <h3 className="font-montserrat font-semibold text-base text-primary mb-2">
                {report.name}
              </h3>
              <p className="font-montserrat text-sm text-secondary mb-4">{report.description}</p>
              {report.link ? (
                <Link href={report.link}>
                  <Button
                    variant={report.status === 'Available' ? 'primary' : 'ghost'}
                    size="sm"
                    fullWidth
                    disabled={report.status !== 'Available'}
                  >
                    {report.status === 'Available' ? 'Access Now' : 'Coming Soon'}
                  </Button>
                </Link>
              ) : (
                <Button
                  variant={report.status === 'Available' ? 'primary' : 'ghost'}
                  size="sm"
                  fullWidth
                  disabled={report.status !== 'Available'}
                >
                  {report.status === 'Available' ? 'Generate Report' : 'Coming Soon'}
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <ReportsContent />
    </ProtectedRoute>
  );
}
