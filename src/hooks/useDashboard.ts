/**
 * useDashboard Hook
 * 
 * Custom hook for fetching and caching dashboard statistics with React Query
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

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

interface DashboardResponse {
  stats: DashboardStats;
  demographics: {
    ageGroups: DependencyData;
    sexDistribution: SexData;
    civilStatus: {
      single: number;
      married: number;
      widowed: number;
      divorced: number;
    };
    employment: {
      employed: number;
      unemployed: number;
    };
  };
  residentsData: {
    birthdate: string;
    sex: string;
    civil_status: string;
    employment_status: string;
    is_labor_force_employed?: boolean;
  }[];
}

// API function to fetch dashboard data
async function fetchDashboardStats(): Promise<DashboardResponse> {
  // Get current session to pass auth token
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No valid session found');
  }

  const response = await fetch('/api/dashboard/stats', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// Helper functions for processing data
export const calculateAge = (birthdate: string): number => {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

export const getAgeGroup = (age: number): string => {
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

export const processPopulationData = (residents: { birthdate: string; sex: string }[]): AgeGroup[] => {
  const ageGroups = [
    '0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34', '35-39',
    '40-44', '45-49', '50-54', '55-59', '60-64', '65-69', '70-74', '75-79',
    '80-84', '85-89', '90-94', '95-99', '100+'
  ];

  const counts: Record<string, { male: number; female: number }> = {};

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

// Custom hook
export function useDashboard() {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['dashboard', { barangayCode: userProfile?.barangay_code }],
    queryFn: fetchDashboardStats,
    enabled: !!user && !!userProfile?.barangay_code,
    staleTime: 3 * 60 * 1000, // 3 minutes (dashboard data changes less frequently)
    gcTime: 10 * 60 * 1000, // 10 minutes
    // Show cached data immediately, then refetch in background
    refetchOnMount: 'always',
    placeholderData: (previousData) => previousData,
  });

  // Process the data when available
  const processedData = query.data ? {
    stats: query.data.stats,
    dependencyData: {
      youngDependents: query.data.demographics?.ageGroups?.youngDependents || 0,
      workingAge: query.data.demographics?.ageGroups?.workingAge || 0,
      oldDependents: query.data.demographics?.ageGroups?.oldDependents || 0,
    },
    sexData: {
      male: query.data.demographics?.sexDistribution?.male || 0,
      female: query.data.demographics?.sexDistribution?.female || 0,
    },
    civilStatusData: {
      single: query.data.demographics?.civilStatus?.single || 0,
      married: query.data.demographics?.civilStatus?.married || 0,
      widowed: query.data.demographics?.civilStatus?.widowed || 0,
      divorced: query.data.demographics?.civilStatus?.divorced || 0,
      separated: 0,
      annulled: 0,
      registeredPartnership: 0,
      liveIn: 0,
    },
    employmentData: {
      employed: query.data.demographics?.employment?.employed || 0,
      unemployed: query.data.demographics?.employment?.unemployed || 0,
      selfEmployed: 0,
      student: 0,
      retired: 0,
      homemaker: 0,
      disabled: 0,
      other: 0,
    },
    populationData: processPopulationData(query.data.residentsData || []),
  } : null;

  // Invalidate dashboard cache (use after mutations that affect stats)
  const invalidateDashboard = () => {
    queryClient.invalidateQueries({
      queryKey: ['dashboard'],
    });
  };

  return {
    ...query,
    ...processedData,
    invalidateDashboard,
  };
}

export type {
  DashboardStats,
  AgeGroup,
  DependencyData,
  SexData,
  CivilStatusData,
  EmploymentStatusData,
  DashboardResponse
};