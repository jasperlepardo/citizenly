/**
 * useResidents Hook
 * 
 * Custom hook for fetching and caching residents data with React Query
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib';
import { useAuth } from '@/contexts';
import { useResilientQuery } from './useResilientQuery';
import { clientLogger } from '@/lib/logging/client-logger';

// Import the properly typed ResidentRecord
import { ResidentRecord } from '@/types/database';

interface Resident extends Omit<ResidentRecord, 'sex'> {
  sex: 'male' | 'female' | ''; // Allow empty for forms
  households?: {
    code: string;
    name?: string;
    barangay_code: string;
    city_municipality_code?: string;
    province_code?: string;
    region_code?: string;
    house_number?: string;
    street_id?: string;
    subdivision_id?: string;
  };
}

interface ResidentsParams {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  filters?: Record<string, any>;
}

interface AdvancedFilters {
  sex?: string;
  civil_status?: string;
  ageRange?: { min?: number; max?: number };
  dateRange?: { from?: string; to?: string };
  employment_status?: string;
  education_attainment?: string[];
  sectoralCategories?: string[];
  occupation?: string;
  barangay?: string[];
  hasEmail?: boolean;
  isVoter?: boolean;
}

interface ResidentsResponse {
  data: Resident[];
  total: number;
  page: number;
  pageSize: number;
}

// Enhanced API function to fetch residents with better error handling
async function fetchResidents(params: ResidentsParams): Promise<ResidentsResponse> {
  const { page = 1, pageSize = 20, searchTerm = '', filters = {} } = params;

  clientLogger.debug('Fetching residents', {
    action: 'fetch_residents_start',
    data: { page, pageSize, searchTerm, filtersCount: Object.keys(filters).length }
  });

  // Get current session to pass auth token
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    const error = new Error('No valid session found - please log in again');
    clientLogger.error('Authentication error in fetchResidents', {
      action: 'fetch_residents_auth_error',
      error: error
    });
    throw error;
  }

  // Build query parameters
  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });

  if (searchTerm.trim()) {
    queryParams.append('search', searchTerm.trim());
  }

  // Add filter parameters with enhanced processing
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    
    // Handle array filters
    if (Array.isArray(value)) {
      if (value.length > 0) {
        queryParams.append(`filter_${key}`, value.join(','));
      }
    }
    // Handle object filters (like age range, date range)
    else if (typeof value === 'object') {
      const hasValues = Object.values(value).some(v => v !== undefined && v !== null && v !== '');
      if (hasValues) {
        queryParams.append(`filter_${key}`, JSON.stringify(value));
      }
    }
    // Handle primitive values
    else {
      queryParams.append(`filter_${key}`, String(value));
    }
  });

  const url = `/api/residents?${queryParams}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      let errorMessage: string;
      let errorCode: string | undefined;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        errorCode = errorData.code;
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }

      // Enhanced error logging
      clientLogger.error('Residents API error', {
        action: 'fetch_residents_api_error',
        data: {
          status: response.status,
          statusText: response.statusText,
          url,
          errorCode,
          errorMessage
        }
      });

      // Create a more informative error
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      (error as any).code = errorCode;
      throw error;
    }

    const data = await response.json();
    
    clientLogger.info('Residents fetched successfully', {
      action: 'fetch_residents_success',
      data: {
        count: data.data?.length || 0,
        total: data.pagination?.total || 0,
        page,
        pageSize
      }
    });

    return data;
  } catch (error) {
    // Network or parsing errors
    if (error instanceof Error && !('status' in error)) {
      clientLogger.error('Network error in fetchResidents', {
        action: 'fetch_residents_network_error',
        error: error
      });
    }
    throw error;
  }
}

// Enhanced custom hook with resilient querying
export function useResidents(params: ResidentsParams = {}) {
  const { user, userProfile, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  
  const { page = 1, pageSize = 20, searchTerm = '', filters = {} } = params;

  // Use a stable cache key that doesn't change during auth loading
  const cacheKey = ['residents', { page, pageSize, searchTerm, filters }];
  
  const isEnabled = !!user && !!userProfile?.barangay_code && !authLoading;

  const query = useResilientQuery<ResidentsResponse>({
    queryKey: cacheKey,
    queryFn: () => fetchResidents(params),
    enabled: isEnabled,
    staleTime: 0, // Force fresh data
    gcTime: 0, // Don't cache
    // Force refetch
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    // Don't use cached data
    placeholderData: undefined,
    // Network mode optimistic - use cache first
    networkMode: 'always',
    // Enhanced retry configuration
    retryConfig: {
      maxRetries: 3,
      retryDelay: (attempt: number) => Math.min(1000 * Math.pow(2, attempt), 10000),
      retryCondition: (error: any) => {
        // Don't retry on authentication errors
        if (error?.status === 401 || error?.status === 403) return false;
        // Don't retry on validation errors
        if (error?.status === 400) return false;
        // Retry on network errors and server errors
        return error?.status >= 500 || !error?.status;
      },
      onRetry: (error: any, attempt: number) => {
        clientLogger.warn(`Retrying residents query (attempt ${attempt})`, {
          action: 'residents_query_retry',
          error: error,
          data: { 
            attempt,
            params: { page, pageSize, searchTerm }
          }
        });
      }
    },
    // Performance tracking
    performanceTracking: {
      enabled: true,
      operationName: 'residents_query'
    },
    // Fallback data
    fallbackData: {
      data: [],
      total: 0,
      page: page,
      pageSize: pageSize
    },
    // Error notification
    errorNotification: {
      enabled: true,
      title: 'Failed to load residents',
      message: (error: any) => {
        if (error?.status === 401) return 'Please log in again to continue';
        if (error?.status === 403) return 'You don\'t have permission to view residents';
        if (error?.status >= 500) return 'Server error - please try again later';
        return error?.message || 'An unexpected error occurred';
      }
    }
  });

  // Prefetch next page
  const prefetchNextPage = () => {
    if (query.data && query.data.total > page * pageSize) {
      queryClient.prefetchQuery({
        queryKey: ['residents', { page: page + 1, pageSize, searchTerm, filters }],
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
    total: (query.data as any)?.pagination?.total || 0,
    prefetchNextPage,
    invalidateResidents,
    // Enhanced loading state management
    isLoading: query.isLoading || (authLoading && !query.data),
    // Expose additional resilient query features
    retryManually: query.retryManually,
    clearError: query.clearError,
    getMetrics: query.getMetrics,
    // Enhanced error information
    errorDetails: {
      hasError: !!query.error,
      error: query.error,
      canRetry: query.error ? (query.error as any).status >= 500 || !(query.error as any).status : false,
      isAuthError: query.error ? ((query.error as any).status === 401 || (query.error as any).status === 403) : false,
      isNetworkError: query.error ? !(query.error as any).status : false
    }
  };
}

/**
 * Hook for getting filter field definitions for advanced filters
 */
export function useResidentFilterFields() {
  // This could be extended to fetch dynamic filter options from the API
  return [
    {
      key: 'sex',
      label: 'Sex',
      type: 'select' as const,
      options: [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' }
      ]
    },
    {
      key: 'civil_status',
      label: 'Civil Status',
      type: 'select' as const,
      options: [
        { value: 'single', label: 'Single' },
        { value: 'married', label: 'Married' },
        { value: 'widowed', label: 'Widowed' },
        { value: 'divorced', label: 'Divorced' },
        { value: 'separated', label: 'Separated' }
      ]
    },
    {
      key: 'ageRange',
      label: 'Age Range',
      type: 'range' as const,
      min: 0,
      max: 120
    },
    {
      key: 'employment_status',
      label: 'Employment Status',
      type: 'select' as const,
      options: [
        { value: 'employed', label: 'Employed' },
        { value: 'unemployed', label: 'Unemployed' },
        { value: 'student', label: 'Student' },
        { value: 'retired', label: 'Retired' },
        { value: 'homemaker', label: 'Homemaker' }
      ]
    },
    {
      key: 'education_attainment',
      label: 'Education Level',
      type: 'multiselect' as const,
      options: [
        { value: 'no_formal_education', label: 'No Formal Education' },
        { value: 'elementary', label: 'Elementary' },
        { value: 'high_school', label: 'High School' },
        { value: 'vocational', label: 'Vocational/Technical' },
        { value: 'college', label: 'College' },
        { value: 'graduate', label: 'Graduate Studies' }
      ]
    },
    {
      key: 'sectoralCategories',
      label: 'Sectoral Categories',
      type: 'multiselect' as const,
      options: [
        { value: 'senior_citizen', label: 'Senior Citizen' },
        { value: 'person_with_disability', label: 'Person with Disability' },
        { value: 'solo_parent', label: 'Solo Parent' },
        { value: 'overseas_filipino_worker', label: 'OFW' },
        { value: 'indigenous_people', label: 'Indigenous People' },
        { value: 'out_of_school_youth', label: 'Out of School Youth' }
      ]
    },
    {
      key: 'occupation',
      label: 'Occupation',
      type: 'text' as const,
      placeholder: 'Enter occupation...'
    },
    {
      key: 'hasEmail',
      label: 'Has Email',
      type: 'boolean' as const
    },
    {
      key: 'isVoter',
      label: 'Registered Voter',
      type: 'boolean' as const
    },
    {
      key: 'dateRange',
      label: 'Registration Date',
      type: 'date' as const
    }
  ];
}

export type { Resident, ResidentsParams, ResidentsResponse, AdvancedFilters };