/**
 * useHouseholds Hook
 *
 * Custom hook for fetching and caching households data with React Query
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/contexts';
import { supabase } from '@/lib';
import { HouseholdWithMembersResult } from '@/types/households';

interface HouseholdsParams {
  searchTerm?: string;
}

interface HouseholdsResponse {
  data: HouseholdWithMembersResult[];
  total: number;
}

// API function to fetch households
async function fetchHouseholds(params: HouseholdsParams): Promise<HouseholdsResponse> {
  const { searchTerm = '' } = params;

  // Get current session to pass auth token
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No valid session found');
  }

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (searchTerm.trim()) {
    queryParams.append('search', searchTerm.trim());
  }

  const response = await fetch(`/api/households?${queryParams}`, {
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

  return response.json();
}

// Custom hook
export function useHouseholds(params: HouseholdsParams = {}) {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();

  const { searchTerm = '' } = params;

  const query = useQuery({
    queryKey: ['households', { searchTerm, barangayCode: userProfile?.barangay_code }],
    queryFn: () => fetchHouseholds(params),
    enabled: !!user && !!userProfile?.barangay_code,
    staleTime: 30 * 60 * 1000, // 30 minutes - longer stale time
    gcTime: 60 * 60 * 1000, // 1 hour - keep in cache longer
    // Show cached data immediately, refetch in background only if stale
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // Use cached data immediately while fetching fresh data
    placeholderData: previousData => previousData,
    // Network mode optimistic - use cache first
    networkMode: 'always',
  });

  // Invalidate households cache (use after mutations)
  const invalidateHouseholds = () => {
    queryClient.invalidateQueries({
      queryKey: ['households'],
    });
  };

  return {
    ...query,
    households: query.data?.data || [],
    total: query.data?.total || 0,
    invalidateHouseholds,
  };
}

export type { HouseholdsParams, HouseholdsResponse };
