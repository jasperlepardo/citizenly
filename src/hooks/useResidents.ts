/**
 * useResidents Hook
 * 
 * Custom hook for fetching and caching residents data with React Query
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Resident {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  extension_name?: string;
  email?: string;
  mobile_number?: string;
  sex: 'male' | 'female' | '';
  birthdate: string;
  civil_status?: string;
  occupation?: string;
  job_title?: string;
  profession?: string;
  education_level?: string;
  household_code?: string;
  barangay_code: string;
  status?: string;
  created_at: string;
  household?: {
    code: string;
    street_name?: string;
    house_number?: string;
    subdivision?: string;
  };
}

interface ResidentsParams {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
}

interface ResidentsResponse {
  data: Resident[];
  total: number;
  page: number;
  pageSize: number;
}

// API function to fetch residents
async function fetchResidents(params: ResidentsParams): Promise<ResidentsResponse> {
  const { page = 1, pageSize = 20, searchTerm = '' } = params;

  // Get current session to pass auth token
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No valid session found');
  }

  // Build query parameters
  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });

  if (searchTerm.trim()) {
    queryParams.append('search', searchTerm.trim());
  }

  const response = await fetch(`/api/residents?${queryParams}`, {
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

// Custom hook
export function useResidents(params: ResidentsParams = {}) {
  const { user, userProfile, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  
  const { page = 1, pageSize = 20, searchTerm = '' } = params;

  // Use a stable cache key that doesn't change during auth loading
  const cacheKey = ['residents', { page, pageSize, searchTerm }];
  
  const query = useQuery({
    queryKey: cacheKey,
    queryFn: () => fetchResidents(params),
    enabled: !!user && !!userProfile?.barangay_code,
    staleTime: 30 * 60 * 1000, // 30 minutes - longer stale time
    gcTime: 60 * 60 * 1000, // 1 hour - keep in cache longer
    // Show cached data immediately, refetch in background only if stale
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // Use cached data immediately while fetching fresh data
    placeholderData: (previousData) => previousData,
    // Network mode optimistic - use cache first
    networkMode: 'always',
  });

  // Prefetch next page
  const prefetchNextPage = () => {
    if (query.data && query.data.total > page * pageSize) {
      queryClient.prefetchQuery({
        queryKey: ['residents', { page: page + 1, pageSize, searchTerm, barangayCode: userProfile?.barangay_code }],
        queryFn: () => fetchResidents({ ...params, page: page + 1 }),
        staleTime: 5 * 60 * 1000,
      });
    }
  };

  // Invalidate residents cache (use after mutations)
  const invalidateResidents = () => {
    queryClient.invalidateQueries({
      queryKey: ['residents'],
    });
  };

  return {
    ...query,
    residents: query.data?.data || [],
    total: query.data?.total || 0,
    prefetchNextPage,
    invalidateResidents,
    // Show loading only when actually fetching or when auth is still loading AND no cached data
    isLoading: query.isLoading || (authLoading && !query.data),
  };
}

export type { Resident, ResidentsParams, ResidentsResponse };