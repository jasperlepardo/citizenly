/**
 * useHouseholds Hook
 *
 * Custom hook for fetching and caching households data with React Query
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/contexts/AuthContext';

// Legacy type - minimal stub
type HouseholdWithMembersResult = any;

interface HouseholdsParams {
  searchTerm?: string;
}

interface HouseholdsResponse {
  data: HouseholdWithMembersResult[];
  total: number;
}

// API function to fetch households  
async function fetchHouseholds(params: HouseholdsParams, authSession?: any): Promise<HouseholdsResponse> {
  const { searchTerm = '' } = params;

  // Use the session passed from the hook
  if (!authSession?.access_token) {
    throw new Error('Authentication required. Please sign in to access households.');
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
      Authorization: `Bearer ${authSession.access_token}`,
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
  const { userProfile, session } = useAuth();
  const queryClient = useQueryClient();

  const { searchTerm = '' } = params;

  const query = useQuery({
    queryKey: ['households', { searchTerm, barangayCode: userProfile?.barangay_code }],
    queryFn: () => fetchHouseholds(params, session),
    enabled: !!session?.access_token, // Only try when we have a valid session
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes  
    refetchOnMount: true, // Always refetch on mount
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    // Disable placeholder data to see actual loading states
    retry: 1, // Only retry once on failure
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
