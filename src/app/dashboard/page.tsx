'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/organisms';
import { DashboardLayout } from '@/components/templates';
import {
  StatsCard,
  DependencyRatioPieChart,
  SexDistributionPieChart,
  CivilStatusPieChart,
  EmploymentStatusPieChart,
} from '@/components/molecules';
import { PopulationPyramid } from '@/components/organisms';
import { logger, logError } from '@/lib/secure-logger';

interface DashboardStats {
  residents: number;
  households: number;
  businesses: number;
  certifications: number;
  seniorCitizens: number;
  employedResidents: number;
}

interface AgeGroup {
  ageRange: string;
  male: number;
  female: number;
  malePercentage: number;
  femalePercentage: number;
}

interface DependencyData {
  youngDependents: number; // 0-14
  workingAge: number; // 15-64
  oldDependents: number; // 65+
}

interface SexData {
  male: number;
  female: number;
}

interface CivilStatusData {
  single: number;
  married: number;
  widowed: number;
  divorced: number;
  separated: number;
  annulled: number;
  registeredPartnership: number;
  liveIn: number;
}

interface EmploymentStatusData {
  employed: number;
  unemployed: number;
  selfEmployed: number;
  student: number;
  retired: number;
  homemaker: number;
  disabled: number;
  other: number;
}

function DashboardContent() {
  const { userProfile, profileLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    residents: 0,
    households: 0,
    businesses: 0,
    certifications: 0,
    seniorCitizens: 0,
    employedResidents: 0,
  });
  const [populationData, setPopulationData] = useState<AgeGroup[]>([]);
  const [dependencyData, setDependencyData] = useState<DependencyData>({
    youngDependents: 0,
    workingAge: 0,
    oldDependents: 0,
  });
  const [sexData, setSexData] = useState<SexData>({
    male: 0,
    female: 0,
  });
  const [civilStatusData, setCivilStatusData] = useState<CivilStatusData>({
    single: 0,
    married: 0,
    widowed: 0,
    divorced: 0,
    separated: 0,
    annulled: 0,
    registeredPartnership: 0,
    liveIn: 0,
  });
  const [employmentData, setEmploymentData] = useState<EmploymentStatusData>({
    employed: 0,
    unemployed: 0,
    selfEmployed: 0,
    student: 0,
    retired: 0,
    homemaker: 0,
    disabled: 0,
    other: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!profileLoading && userProfile?.barangay_code) {
      loadDashboardStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile, profileLoading]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);

      const barangayCode = userProfile?.barangay_code;
      if (!barangayCode) return;

      // Get current session to pass auth token
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        // User not authenticated - this is expected, don't log as error
        return;
      }

      // Use server-side API to fetch dashboard data (bypasses RLS issues)
      const response = await fetch('/api/dashboard/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const { stats, demographics, residentsData } = data;
      
      console.log('Dashboard API response:', data);
      console.log('Demographics data:', demographics);

      // Use pre-computed demographics data if available, fallback to client-side processing
      if (demographics) {
        // Use server-computed demographics
        const newDependencyData = {
          youngDependents: demographics.ageGroups?.youngDependents || 0,
          workingAge: demographics.ageGroups?.workingAge || 0,
          oldDependents: demographics.ageGroups?.oldDependents || 0,
        };
        console.log('Setting dependency data:', newDependencyData);
        setDependencyData(newDependencyData);

        setSexData({
          male: demographics.sexDistribution?.male || 0,
          female: demographics.sexDistribution?.female || 0,
        });

        setCivilStatusData({
          single: demographics.civilStatus?.single || 0,
          married: demographics.civilStatus?.married || 0,
          widowed: demographics.civilStatus?.widowed || 0,
          divorced: demographics.civilStatus?.divorced || 0,
          separated: 0, // Not in view yet
          annulled: 0, // Not in view yet
          registeredPartnership: 0, // Not in view yet
          liveIn: 0, // Not in view yet
        });

        setEmploymentData({
          employed: demographics.employment?.employed || 0,
          unemployed: demographics.employment?.unemployed || 0,
          selfEmployed: 0, // Not separated in view
          student: 0, // Not separated in view
          retired: 0, // Not separated in view
          homemaker: 0, // Not separated in view
          disabled: 0, // Not separated in view
          other: 0, // Not separated in view
        });
      } else {
        // Fallback to client-side processing
        const residentData = residentsData || [];
        processSexData(residentData);
        processCivilStatusData(residentData);
        processEmploymentData(residentData);
      }

      // Process population data for pyramid (still use client-side for detailed age groups)
      const ageGroupData = processPopulationData(residentsData || []);
      setPopulationData(ageGroupData);

      setStats({
        residents: Number(stats.residents) || 0,
        households: Number(stats.households) || 0,
        businesses: Number(stats.businesses) || 0,
        certifications: Number(stats.certifications) || 0,
        seniorCitizens: Number(stats.seniorCitizens) || 0,
        employedResidents: Number(stats.employedResidents) || 0,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      // Only log actual errors, not authentication issues
      if (err.message !== 'No valid session found') {
        logError(err, 'DASHBOARD_STATS_ERROR');
        logger.error('Dashboard stats load failed', {
          barangayCode: userProfile?.barangay_code,
          error: err.message,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const processSexData = (residents: { sex: string }[]) => {
    let maleCount = 0;
    let femaleCount = 0;

    residents.forEach(resident => {
      const gender = resident.sex?.toLowerCase();
      if (gender === 'male') {
        maleCount++;
      } else if (gender === 'female') {
        femaleCount++;
      }
    });

    setSexData({
      male: maleCount,
      female: femaleCount,
    });
  };

  const processCivilStatusData = (residents: { civil_status: string }[]) => {
    const statusCounts = {
      single: 0,
      married: 0,
      widowed: 0,
      divorced: 0,
      separated: 0,
      annulled: 0,
      registeredPartnership: 0,
      liveIn: 0,
    };

    residents.forEach(resident => {
      const status = resident.civil_status?.toLowerCase()?.replace(/[^a-z]/g, '') || '';

      switch (status) {
        case 'single':
          statusCounts.single++;
          break;
        case 'married':
          statusCounts.married++;
          break;
        case 'widowed':
          statusCounts.widowed++;
          break;
        case 'divorced':
          statusCounts.divorced++;
          break;
        case 'separated':
          statusCounts.separated++;
          break;
        case 'annulled':
          statusCounts.annulled++;
          break;
        case 'registeredpartnership':
          statusCounts.registeredPartnership++;
          break;
        case 'livein':
          statusCounts.liveIn++;
          break;
        default:
          // Handle other cases or leave uncategorized
          break;
      }
    });

    setCivilStatusData(statusCounts);
  };

  const processEmploymentData = (
    residents: { employment_status: string; is_labor_force_employed?: boolean }[]
  ): number => {
    const employmentCounts = {
      employed: 0,
      unemployed: 0,
      selfEmployed: 0,
      student: 0,
      retired: 0,
      homemaker: 0,
      disabled: 0,
      other: 0,
    };

    let totalEmployed = 0;

    residents.forEach(resident => {
      const status = resident.employment_status?.toLowerCase()?.replace(/[^a-z]/g, '') || '';

      // Count employed residents using the computed is_labor_force_employed field if available
      if (resident.is_labor_force_employed === true) {
        totalEmployed++;
      }

      switch (status) {
        case 'employed':
          employmentCounts.employed++;
          break;
        case 'unemployed':
          employmentCounts.unemployed++;
          break;
        case 'selfemployed':
          employmentCounts.selfEmployed++;
          break;
        case 'student':
          employmentCounts.student++;
          break;
        case 'retired':
          employmentCounts.retired++;
          break;
        case 'homemaker':
          employmentCounts.homemaker++;
          break;
        case 'disabled':
          employmentCounts.disabled++;
          break;
        default:
          employmentCounts.other++;
          break;
      }
    });

    setEmploymentData(employmentCounts);
    return totalEmployed;
  };

  const processPopulationData = (residents: { birthdate: string; sex: string }[]): AgeGroup[] => {
    const ageGroups = [
      '0-4',
      '5-9',
      '10-14',
      '15-19',
      '20-24',
      '25-29',
      '30-34',
      '35-39',
      '40-44',
      '45-49',
      '50-54',
      '55-59',
      '60-64',
      '65-69',
      '70-74',
      '75-79',
      '80-84',
      '85-89',
      '90-94',
      '95-99',
      '100+',
    ];

    const counts: Record<string, { male: number; female: number }> = {};
    let youngDependents = 0; // 0-14
    let workingAge = 0; // 15-64
    let oldDependents = 0; // 65+

    // Initialize age groups
    ageGroups.forEach(group => {
      counts[group] = { male: 0, female: 0 };
    });

    // Calculate ages and categorize
    residents.forEach(resident => {
      const age = calculateAge(resident.birthdate);
      const ageGroup = getAgeGroup(age);
      const gender = resident.sex?.toLowerCase() === 'male' ? 'male' : 'female';

      if (counts[ageGroup]) {
        counts[ageGroup][gender]++;
      }

      // Categorize for dependency ratios
      if (age <= 14) {
        youngDependents++;
      } else if (age <= 64) {
        workingAge++;
      } else {
        oldDependents++;
      }
    });

    // Update dependency data

    setDependencyData({
      youngDependents,
      workingAge,
      oldDependents,
    });

    const totalPopulation = residents.length;

    return ageGroups.map(ageRange => {
      const male = counts[ageRange].male;
      const female = counts[ageRange].female;

      return {
        ageRange,
        male,
        female,
        malePercentage: totalPopulation > 0 ? (male / totalPopulation) * 100 : 0,
        femalePercentage: totalPopulation > 0 ? (female / totalPopulation) * 100 : 0,
      };
    });
  };

  const calculateAge = (birthdate: string): number => {
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  const getAgeGroup = (age: number): string => {
    if (age < 5) return '0-4';
    if (age < 10) return '5-9';
    if (age < 15) return '10-14';
    if (age < 20) return '15-19';
    if (age < 25) return '20-24';
    if (age < 30) return '25-29';
    if (age < 35) return '30-34';
    if (age < 40) return '35-39';
    if (age < 45) return '40-44';
    if (age < 50) return '45-49';
    if (age < 55) return '50-54';
    if (age < 60) return '55-59';
    if (age < 65) return '60-64';
    if (age < 70) return '65-69';
    if (age < 75) return '70-74';
    if (age < 80) return '75-79';
    if (age < 85) return '80-84';
    if (age < 90) return '85-89';
    if (age < 95) return '90-94';
    if (age < 100) return '95-99';
    return '100+';
  };

  if (profileLoading) {
    return <div className="flex h-screen items-center justify-center text-primary">Loading...</div>;
  }

  return (
    <DashboardLayout searchTerm={searchTerm} onSearchChange={setSearchTerm}>
      <div className="p-6">
        {/* Welcome Message */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-primary">
            Welcome back, {userProfile ? userProfile.first_name : 'User'}!
          </h1>
        </div>

        {/* Statistics Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Residents"
            value={loading ? '...' : stats.residents.toLocaleString()}
            icon={
              <svg className="size-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
            }
            color="primary"
          />

          <StatsCard
            title="Households"
            value={loading ? '...' : stats.households.toLocaleString()}
            icon={
              <svg className="size-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            }
            color="success"
          />

          <StatsCard
            title="Senior Citizens"
            value={loading ? '...' : stats.seniorCitizens.toLocaleString()}
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
            value={loading ? '...' : stats.employedResidents.toLocaleString()}
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
            <DependencyRatioPieChart title="Age Distribution" data={dependencyData} />
          </div>
          <div>
            <SexDistributionPieChart data={sexData} />
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <CivilStatusPieChart data={civilStatusData} />
          </div>
          <div>
            <EmploymentStatusPieChart data={employmentData} />
          </div>
        </div>

        {/* Population Pyramid */}
        <div className="mb-8">
          <PopulationPyramid
            data={populationData}
            onAgeGroupClick={ageGroup => {
              logger.info('Age group selected', { ageGroup: ageGroup.ageRange });
            }}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
