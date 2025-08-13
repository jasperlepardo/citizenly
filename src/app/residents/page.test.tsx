/**
 * Residents Listing Page Tests
 * Comprehensive test suite following development standards
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import ResidentsPage from './page';
import { useAuth } from '@/contexts/AuthContext';
import { fetchResidents } from '@/utils/residentListingHelpers';

// Type the mocked functions
const mockFetchResidents = fetchResidents as jest.MockedFunction<typeof fetchResidents>;

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/utils/residentListingHelpers', () => ({
  fetchResidents: jest.fn(),
}));

jest.mock('@/components/organisms', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AdvancedSearchBar: ({ onSearch, placeholder }: any) => (
    <input
      data-testid="search-bar"
      placeholder={placeholder}
      onChange={(e) => onSearch(e.target.value)}
    />
  ),
  DataTable: ({ data, columns, actions, pagination }: any) => (
    <div data-testid="data-table">
      <div data-testid="table-data">{JSON.stringify(data)}</div>
      <div data-testid="pagination">Page: {pagination.current}</div>
    </div>
  ),
}));

jest.mock('@/components/templates', () => ({
  DashboardLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/atoms', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/utils/residentListingHelpers', () => ({
  formatFullName: jest.fn((resident) => `${resident.first_name} ${resident.last_name}`),
  formatDate: jest.fn((date) => new Date(date).toLocaleDateString()),
  fetchResidents: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('ResidentsPage', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockSession = {
    access_token: 'mock-token',
    user: { id: '1' },
  };

  const mockResidents = [
    {
      id: '1',
      first_name: 'John',
      last_name: 'Doe',
      sex: 'male',
      birthdate: '1990-01-01',
      civil_status: 'Single',
      created_at: '2023-01-01T00:00:00Z',
      barangay_code: '123456789',
    },
    {
      id: '2',
      first_name: 'Jane',
      last_name: 'Smith',
      sex: 'female',
      birthdate: '1985-05-15',
      civil_status: 'Married',
      created_at: '2023-01-02T00:00:00Z',
      barangay_code: '123456789',
    },
  ];

  const mockApiResponse = {
    data: mockResidents,
    pagination: {
      page: 1,
      limit: 10,
      total: 2,
      pages: 1,
      hasNext: false,
      hasPrev: false,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue({ session: mockSession });
    
    mockFetchResidents.mockResolvedValue(mockApiResponse);
  });

  describe('Rendering', () => {
    it('should render loading state initially', () => {
      render(<ResidentsPage />);
      
      expect(screen.getByText('Loading residents...')).toBeInTheDocument();
    });

    it('should render residents list after loading', async () => {
      render(<ResidentsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Residents Management')).toBeInTheDocument();
      });

      expect(screen.getByTestId('data-table')).toBeInTheDocument();
      expect(screen.getByTestId('search-bar')).toBeInTheDocument();
      expect(screen.getByText('+ Create Resident')).toBeInTheDocument();
    });

    it('should render error state when fetch fails', async () => {
        mockFetchResidents.mockRejectedValue(new Error('Failed to fetch'));
      
      render(<ResidentsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Error Loading Residents')).toBeInTheDocument();
      });

      expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should handle search input', async () => {
      const user = userEvent.setup();
        
      render(<ResidentsPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-bar')).toBeInTheDocument();
      });

      const searchBar = screen.getByTestId('search-bar');
      await user.type(searchBar, 'John');
      
      // Wait for debounced search to trigger
      await waitFor(() => {
        expect(fetchResidents).toHaveBeenCalledWith(mockSession, 'John', 1);
      });
    });

    it('should reset page to 1 when searching', async () => {
      const user = userEvent.setup();
        
      render(<ResidentsPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-bar')).toBeInTheDocument();
      });

      const searchBar = screen.getByTestId('search-bar');
      await user.type(searchBar, 'test query');
      
      await waitFor(() => {
        expect(fetchResidents).toHaveBeenCalledWith(mockSession, 'test query', 1);
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to create page when create button is clicked', async () => {
      const user = userEvent.setup();
      
      render(<ResidentsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('+ Create Resident')).toBeInTheDocument();
      });

      const createButton = screen.getByText('+ Create Resident');
      await user.click(createButton);
      
      expect(mockRouter.push).toHaveBeenCalledWith('/residents/create');
    });
  });

  describe('Data Display', () => {
    it('should display correct count information', async () => {
      render(<ResidentsPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Manage and view resident information \(2 of 2 total\)/)).toBeInTheDocument();
      });
    });

    it('should display pagination information', async () => {
      render(<ResidentsPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('pagination')).toBeInTheDocument();
        expect(screen.getByText('Page: 1')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should retry data loading when retry button is clicked', async () => {
      const user = userEvent.setup();
        
      mockFetchResidents
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockApiResponse);
      
      render(<ResidentsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });

      const retryButton = screen.getByText('Retry');
      await user.click(retryButton);
      
      expect(fetchResidents).toHaveBeenCalledTimes(2);
    });
  });

  describe('Authentication', () => {
    it('should not fetch data without session', () => {
        (useAuth as jest.Mock).mockReturnValue({ session: null });
      
      render(<ResidentsPage />);
      
      expect(fetchResidents).not.toHaveBeenCalled();
    });
  });

  describe('Pagination', () => {
    it('should handle page changes', async () => {
        const multiPageResponse = {
        ...mockApiResponse,
        pagination: {
          ...mockApiResponse.pagination,
          pages: 3,
          hasNext: true,
        },
      };
      
      mockFetchResidents.mockResolvedValue(multiPageResponse);
      
      render(<ResidentsPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('data-table')).toBeInTheDocument();
      });

      // Simulate page change
      await waitFor(() => {
        expect(fetchResidents).toHaveBeenCalledWith(mockSession, '', 1);
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading spinner with correct accessibility attributes', () => {
      render(<ResidentsPage />);
      
      const loadingSpinner = screen.getByRole('status', { hidden: true });
      expect(loadingSpinner).toHaveClass('animate-spin');
    });
  });

  describe('Responsive Design', () => {
    it('should render header with proper responsive layout', async () => {
      render(<ResidentsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Residents Management')).toBeInTheDocument();
      });

      const header = screen.getByText('Residents Management').closest('div');
      expect(header?.parentElement).toHaveClass('flex items-center justify-between');
    });
  });
});