'use client';

import React from 'react';

import {
  StatsCard,
  DependencyRatioPieChart,
  SexDistributionPieChart,
  CivilStatusPieChart,
  EmploymentStatusPieChart,
  StatsSkeleton,
 PopulationPyramid } from '@/components';
import { useAuth } from '@/contexts';
import { useDashboard } from '@/hooks/dashboard/useDashboard';
import { logger } from '@/lib';

function DashboardContent() {
  const { userProfile, profileLoading } = useAuth();
  
  // Use React Query for dashboard data
  const { 
    stats, 
    calculations,
    isLoading, 
    error 
  } = useDashboard();

  const {
    sexDistribution,
    civilStatusData,
    employmentData,
    populationData
  } = calculations;

  if (profileLoading || isLoading) {
    return <StatsSkeleton />;
  }
  
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Unable to load dashboard data
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {error.message || 'An unexpected error occurred while loading the dashboard.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
        {/* Welcome Message */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-gray-600 dark:text-gray-300">
            Welcome back, {userProfile ? userProfile.first_name : 'User'}!
          </h1>
        </div>

        {/* Statistics Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Residents"
            value={stats?.residents?.toLocaleString() || '0'}
            icon={
              <svg className="size-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
            }
            color="primary"
          />

          <StatsCard
            title="Households"
            value={stats?.households?.toLocaleString() || '0'}
            icon={
              <svg className="size-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            }
            color="success"
          />

          <StatsCard
            title="Senior Citizens"
            value={stats?.seniorCitizens?.toLocaleString() || '0'}
            icon={
              <svg className="size-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                  clipRule="evenodd"
                />
              </svg>
            }
            color="secondary"
          />

          <StatsCard
            title="Employed"
            value={stats?.employedResidents?.toLocaleString() || '0'}
            icon={
              <svg className="size-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
                <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
              </svg>
            }
            color="warning"
          />
        </div>

        {/* Charts */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <DependencyRatioPieChart title="Age Distribution" data={calculations.dependencyData || { youngDependents: 0, workingAge: 0, oldDependents: 0 }} />
          </div>
          <div>
            <SexDistributionPieChart data={sexDistribution || { male: 0, female: 0 }} />
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <CivilStatusPieChart data={civilStatusData || { single: 0, married: 0, widowed: 0, divorced: 0, separated: 0, annulled: 0, registeredPartnership: 0, liveIn: 0 }} />
          </div>
          <div>
            <EmploymentStatusPieChart data={employmentData || { employed: 0, unemployed: 0, selfEmployed: 0, student: 0, retired: 0, homemaker: 0, disabled: 0, other: 0 }} />
          </div>
        </div>

        {/* Population Pyramid */}
        <div className="mb-8">
          <PopulationPyramid
            data={populationData || []}
            onAgeGroupClick={ageGroup => {
              logger.info('Age group selected', { ageGroup: ageGroup.ageRange });
            }}
          />
        </div>
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}
