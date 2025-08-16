/**
 * Mock Supabase Context Decorator for Storybook
 * Option 4: Provides mock authentication context for stories
 */

import { createContext, useContext, ReactNode } from 'react';

// Mock Supabase types
interface MockUser {
  id: string;
  email: string;
  user_metadata: {
    name?: string;
    role?: string;
  };
}

interface MockSession {
  access_token: string;
  user: MockUser;
}

interface MockSupabaseClient {
  auth: {
    getSession: () => Promise<{ data: { session: MockSession | null } }>;
    getUser: () => Promise<{ data: { user: MockUser | null } }>;
  };
  from: (table: string) => any;
}

// Mock Supabase context
const MockSupabaseContext = createContext<MockSupabaseClient | null>(null);

// Mock data for different scenarios
const mockPSGCData = [
  {
    code: '013300000',
    name: 'Quezon City',
    level: 'city',
    type: 'HUC',
    province_name: 'Metro Manila',
    region_name: 'National Capital Region (NCR)',
    full_address: 'Quezon City, Metro Manila, National Capital Region (NCR)'
  },
  {
    code: '137400000',
    name: 'Manila City',
    level: 'city', 
    type: 'HUC',
    province_name: 'Metro Manila',
    region_name: 'National Capital Region (NCR)',
    full_address: 'Manila City, Metro Manila, National Capital Region (NCR)'
  },
  {
    code: '174000000',
    name: 'Makati City',
    level: 'city',
    type: 'HUC', 
    province_name: 'Metro Manila',
    region_name: 'National Capital Region (NCR)',
    full_address: 'Makati City, Metro Manila, National Capital Region (NCR)'
  }
];

const mockPSOCData = [
  {
    code: '1111',
    title: 'Chief Executives, Senior Officials and Legislators',
    level: 'major_group',
    hierarchy: 'Major Group 1 > Chief Executives, Senior Officials and Legislators'
  },
  {
    code: '2111', 
    title: 'Physicists and Astronomers',
    level: 'unit_group',
    hierarchy: 'Major Group 2 > Sub-major Group 21 > Minor Group 211 > Unit Group 2111'
  },
  {
    code: '3111',
    title: 'Chemical and Physical Science Technicians',
    level: 'unit_group', 
    hierarchy: 'Major Group 3 > Sub-major Group 31 > Minor Group 311 > Unit Group 3111'
  }
];

// Create mock client with search functionality
const createMockSupabaseClient = (scenario: 'authenticated' | 'unauthenticated' = 'authenticated'): MockSupabaseClient => {
  const mockUser: MockUser | null = scenario === 'authenticated' ? {
    id: 'mock-user-123',
    email: 'storybook@example.com',
    user_metadata: {
      name: 'Storybook User',
      role: 'admin'
    }
  } : null;

  const mockSession: MockSession | null = mockUser ? {
    access_token: 'mock-token-for-storybook',
    user: mockUser
  } : null;

  return {
    auth: {
      getSession: async () => ({ data: { session: mockSession } }),
      getUser: async () => ({ data: { user: mockUser } })
    },
    from: (table: string) => ({
      select: () => ({
        ilike: (column: string, value: string) => ({
          limit: (limitValue: number) => {
            // Mock search functionality
            const searchTerm = value.replace(/%/g, '').toLowerCase();
            
            let mockResults: any[] = [];
            
            if (table.includes('psgc')) {
              mockResults = mockPSGCData.filter(item => 
                item.name.toLowerCase().includes(searchTerm) ||
                item.full_address.toLowerCase().includes(searchTerm)
              ).slice(0, limitValue);
            } else if (table.includes('psoc')) {
              mockResults = mockPSOCData.filter(item =>
                item.title.toLowerCase().includes(searchTerm) ||
                item.hierarchy.toLowerCase().includes(searchTerm)
              ).slice(0, limitValue);
            }

            return Promise.resolve({
              data: mockResults,
              error: null
            });
          }
        })
      })
    })
  };
};

// Custom hook to use mock Supabase
export const useMockSupabase = () => {
  const client = useContext(MockSupabaseContext);
  if (!client) {
    throw new Error('useMockSupabase must be used within MockSupabaseProvider');
  }
  return client;
};

// Mock provider component
interface MockSupabaseProviderProps {
  children: ReactNode;
  scenario?: 'authenticated' | 'unauthenticated';
}

const MockSupabaseProvider = ({ 
  children, 
  scenario = 'authenticated' 
}: MockSupabaseProviderProps) => {
  const mockClient = createMockSupabaseClient(scenario);
  
  return (
    <MockSupabaseContext.Provider value={mockClient}>
      {children}
    </MockSupabaseContext.Provider>
  );
};

// Storybook decorators
export const withMockSupabase = (scenario: 'authenticated' | 'unauthenticated' = 'authenticated') => 
  (Story: any) => (
    <MockSupabaseProvider scenario={scenario}>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Story />
      </div>
    </MockSupabaseProvider>
  );

export const withAuthenticatedSupabase = withMockSupabase('authenticated');
export const withUnauthenticatedSupabase = withMockSupabase('unauthenticated');

// Export mock data for use in stories
export { mockPSGCData, mockPSOCData, createMockSupabaseClient };