/**
 * Resident Detail Page Tests
 * Comprehensive test suite following development standards
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useParams, useRouter } from 'next/navigation';
import ResidentDetailPage from './page';
import { useAuth } from '@/contexts/AuthContext';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/components/organisms', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
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

jest.mock('@/components/organisms/ResidentDetailSections', () => ({
  PersonalInfoCard: jest.fn(() => <div data-testid="personal-info-card" />),
  ContactInfoCard: jest.fn(() => <div data-testid="contact-info-card" />),
  EducationEmploymentCard: jest.fn(() => <div data-testid="education-employment-card" />),
  HealthPhysicalCard: jest.fn(() => <div data-testid="health-physical-card" />),
  FamilyVoterCard: jest.fn(() => <div data-testid="family-voter-card" />),
  SectoralInfoCard: jest.fn(() => <div data-testid="sectoral-info-card" />),
  MigrationInfoCard: jest.fn(() => <div data-testid="migration-info-card" />),
  AdminInfoCard: jest.fn(() => <div data-testid="admin-info-card" />),
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('ResidentDetailPage', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
  };

  const mockSession = {
    access_token: 'mock-token',
    user: { id: '1' },
  };

  const mockResident = {
    id: 'test-resident-id',
    first_name: 'John',
    middle_name: 'M',
    last_name: 'Doe',
    sex: 'male' as const,
    birthdate: '1990-01-01',
    civil_status: 'Single',
    barangay_code: '123456789',
    city_municipality_code: '987654321',
    region_code: '12',
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useParams as jest.Mock).mockReturnValue({ id: 'test-resident-id' });
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue({ session: mockSession });

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          resident: mockResident,
        }),
    });
  });

  describe('Rendering', () => {
    it('should render loading state initially', () => {
      render(<ResidentDetailPage />);

      expect(screen.getByText('Loading resident details')).toBeInTheDocument();
      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
    });

    it('should render all detail cards after loading', async () => {
      render(<ResidentDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('John M Doe')).toBeInTheDocument();
      });

      expect(screen.getByTestId('personal-info-card')).toBeInTheDocument();
      expect(screen.getByTestId('contact-info-card')).toBeInTheDocument();
      expect(screen.getByTestId('education-employment-card')).toBeInTheDocument();
      expect(screen.getByTestId('health-physical-card')).toBeInTheDocument();
      expect(screen.getByTestId('family-voter-card')).toBeInTheDocument();
      expect(screen.getByTestId('admin-info-card')).toBeInTheDocument();
    });

    it('should render error state when fetch fails', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));

      render(<ResidentDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Error Loading Resident')).toBeInTheDocument();
      });

      expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
      expect(screen.getByText('🔄 Retry')).toBeInTheDocument();
    });

    it('should render not found state when resident is null', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(null),
      });

      render(<ResidentDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Resident Not Found')).toBeInTheDocument();
      });
    });
  });

  describe.skip('Data Loading', () => {
    it('should fetch resident data on mount', async () => {
      render(<ResidentDetailPage />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/residents/test-resident-id', {
          headers: {
            Authorization: 'Bearer mock-token',
            'Content-Type': 'application/json',
          },
        });
      });
    });

    it('should handle 404 error specifically', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      render(<ResidentDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Resident not found')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to edit page when edit button is clicked', async () => {
      const user = userEvent.setup();

      render(<ResidentDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('✏️ Edit')).toBeInTheDocument();
      });

      const editButton = screen.getByText('✏️ Edit');
      await user.click(editButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/residents/test-resident-id/edit');
    });

    it('should navigate back to residents list when back button is clicked', async () => {
      const user = userEvent.setup();

      render(<ResidentDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('← Back to List')).toBeInTheDocument();
      });

      const backButton = screen.getByText('← Back to List');
      await user.click(backButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/residents');
    });
  });

  describe('Conditional Rendering', () => {
    it('should conditionally render sectoral info card', async () => {
      const residentWithSectoral = {
        ...mockResident,
        sectoral_info: {
          is_labor_force: true,
          is_employed: true,
        },
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            resident: residentWithSectoral,
          }),
      });

      render(<ResidentDetailPage />);

      await waitFor(() => {
        expect(screen.getByTestId('sectoral-info-card')).toBeInTheDocument();
      });
    });

    it('should conditionally render migration info card', async () => {
      const residentWithMigration = {
        ...mockResident,
        migrant_info: {
          previous_region_code: '11',
          migration_type: 'internal',
        },
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            resident: residentWithMigration,
          }),
      });

      render(<ResidentDetailPage />);

      await waitFor(() => {
        expect(screen.getByTestId('migration-info-card')).toBeInTheDocument();
      });
    });
  });

  describe('Status Display', () => {
    it('should display active status correctly', async () => {
      render(<ResidentDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument();
      });
    });

    it('should display inactive status correctly', async () => {
      const inactiveResident = { ...mockResident, is_active: false };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            resident: inactiveResident,
          }),
      });

      render(<ResidentDetailPage />);

      await waitFor(() => {
        expect(screen.getAllByText('Inactive')).toHaveLength(1);
      });
    });
  });

  describe('Authentication', () => {
    it('should not fetch data without session', () => {
      (useAuth as jest.Mock).mockReturnValue({ session: null });

      render(<ResidentDetailPage />);

      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe.skip('Error Handling', () => {
    it('should retry data loading when retry button is clicked', async () => {
      const user = userEvent.setup();
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error')).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ resident: mockResident }),
      });

      render(<ResidentDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('🔄 Retry')).toBeInTheDocument();
      });

      const retryButton = screen.getByText('🔄 Retry');
      await user.click(retryButton);

      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });
});
