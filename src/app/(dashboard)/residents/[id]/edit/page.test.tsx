/**
 * Resident Edit Page Tests
 * Comprehensive test suite following development standards
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useParams, useRouter } from 'next/navigation';
import ResidentEditPage from './page';
import { useAuth } from '@/contexts/AuthContext';
import { useResidentEditForm } from '@/hooks/useResidentEditForm';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/hooks/useResidentEditForm', () => ({
  useResidentEditForm: jest.fn(),
}));

jest.mock('@/components/organisms', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/templates', () => ({
  DashboardLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/atoms', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/organisms/ResidentFormSections', () => ({
  PersonalInfoSection: jest.fn(({ formData, updateField }) => (
    <div data-testid="personal-info-section">
      <input
        data-testid="first-name"
        value={formData.first_name || ''}
        onChange={e => updateField('first_name', e.target.value)}
      />
    </div>
  )),
  ContactInfoSection: jest.fn(() => <div data-testid="contact-info-section" />),
  BirthPlaceSection: jest.fn(() => <div data-testid="birth-place-section" />),
  SectoralInfoSection: jest.fn(() => <div data-testid="education-employment-section" />),
  PhysicalInfoSection: jest.fn(() => <div data-testid="physical-info-section" />),
  CulturalInfoSection: jest.fn(() => <div data-testid="cultural-info-section" />),
  VotingInfoSection: jest.fn(() => <div data-testid="voting-info-section" />),
  MotherMaidenNameSection: jest.fn(() => <div data-testid="mother-maiden-name-section" />),
  AddressInfoSection: jest.fn(() => <div data-testid="address-info-section" />),
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('ResidentEditPage', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
  };

  const mockSession = {
    access_token: 'mock-token',
    user: { id: '1' },
  };

  const mockFormHook = {
    formData: {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
    },
    errors: {},
    updateField: jest.fn(),
    submitForm: jest.fn(),
    isSubmitting: false,
    isDirty: false,
    resetForm: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useParams as jest.Mock).mockReturnValue({ id: 'test-resident-id' });
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue({ session: mockSession });
    (useResidentEditForm as jest.Mock).mockReturnValue(mockFormHook);

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          resident: {
            id: 'test-resident-id',
            first_name: 'John',
            last_name: 'Doe',
            birthdate: '1990-01-01',
          },
        }),
    });
  });

  describe('Rendering', () => {
    it('should render loading state initially', () => {
      render(<ResidentEditPage />);

      expect(screen.getByText('Loading resident data...')).toBeInTheDocument();
      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
    });

    it('should render all form sections after loading', async () => {
      render(<ResidentEditPage />);

      await waitFor(() => {
        expect(screen.getByText('Edit Resident')).toBeInTheDocument();
      });

      expect(screen.getByTestId('personal-info-section')).toBeInTheDocument();
      expect(screen.getByTestId('contact-info-section')).toBeInTheDocument();
      expect(screen.getByTestId('birth-place-section')).toBeInTheDocument();
      expect(screen.getByTestId('education-employment-section')).toBeInTheDocument();
      expect(screen.getByTestId('physical-info-section')).toBeInTheDocument();
      expect(screen.getByTestId('cultural-info-section')).toBeInTheDocument();
      expect(screen.getByTestId('voting-info-section')).toBeInTheDocument();
      expect(screen.getByTestId('mother-maiden-name-section')).toBeInTheDocument();
      expect(screen.getByTestId('address-info-section')).toBeInTheDocument();
    });

    it('should render error state when fetch fails', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));

      render(<ResidentEditPage />);

      await waitFor(() => {
        expect(screen.getByText('Error Loading Resident')).toBeInTheDocument();
      });

      expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  describe('Data Loading', () => {
    it('should fetch resident data on mount', async () => {
      render(<ResidentEditPage />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/residents/test-resident-id', {
          headers: {
            Authorization: 'Bearer mock-token',
            'Content-Type': 'application/json',
          },
        });
      });
    });

    it('should format date fields correctly', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            resident: {
              birthdate: '1990-01-01T00:00:00Z',
              last_voted_date: '2023-05-09T00:00:00Z',
            },
          }),
      });

      render(<ResidentEditPage />);

      await waitFor(() => {
        expect(useResidentEditForm).toHaveBeenCalledWith(
          expect.objectContaining({
            initialData: expect.objectContaining({
              birthdate: '1990-01-01',
              last_voted_date: '2023-05-09',
            }),
          })
        );
      });
    });
  });

  describe('Form Interactions', () => {
    it('should update field when user types', async () => {
      const user = userEvent.setup();

      render(<ResidentEditPage />);

      await waitFor(() => {
        expect(screen.getByTestId('first-name')).toBeInTheDocument();
      });

      const firstNameInput = screen.getByTestId('first-name');
      await user.type(firstNameInput, 'Jane');

      expect(mockFormHook.updateField).toHaveBeenCalledWith(
        'first_name',
        expect.stringContaining('Jane')
      );
    });

    it('should submit form when save button is clicked', async () => {
      const user = userEvent.setup();

      render(<ResidentEditPage />);

      await waitFor(() => {
        expect(screen.getByText('Save Changes')).toBeInTheDocument();
      });

      const saveButton = screen.getByText('Save Changes');
      await user.click(saveButton);

      expect(mockFormHook.submitForm).toHaveBeenCalled();
    });

    it('should show unsaved changes indicator when form is dirty', async () => {
      (useResidentEditForm as jest.Mock).mockReturnValue({
        ...mockFormHook,
        isDirty: true,
      });

      render(<ResidentEditPage />);

      await waitFor(() => {
        expect(screen.getByText('• Unsaved changes')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate back to resident detail on cancel', async () => {
      const user = userEvent.setup();

      render(<ResidentEditPage />);

      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument();
      });

      const cancelButton = screen.getAllByText('Cancel')[0];
      await user.click(cancelButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/residents/test-resident-id');
    });

    it('should show confirmation dialog when canceling with unsaved changes', async () => {
      const user = userEvent.setup();
      window.confirm = jest.fn().mockReturnValue(true);

      (useResidentEditForm as jest.Mock).mockReturnValue({
        ...mockFormHook,
        isDirty: true,
      });

      render(<ResidentEditPage />);

      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument();
      });

      const cancelButton = screen.getAllByText('Cancel')[0];
      await user.click(cancelButton);

      expect(window.confirm).toHaveBeenCalledWith(
        'You have unsaved changes. Are you sure you want to leave?'
      );
      expect(mockRouter.push).toHaveBeenCalledWith('/residents/test-resident-id');
    });

    it('should not navigate when user cancels confirmation dialog', async () => {
      const user = userEvent.setup();
      window.confirm = jest.fn().mockReturnValue(false);

      (useResidentEditForm as jest.Mock).mockReturnValue({
        ...mockFormHook,
        isDirty: true,
      });

      render(<ResidentEditPage />);

      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument();
      });

      const cancelButton = screen.getAllByText('Cancel')[0];
      await user.click(cancelButton);

      expect(window.confirm).toHaveBeenCalled();
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('should handle successful form submission', async () => {
      const mockSubmit = jest.fn().mockResolvedValue(undefined);

      (useResidentEditForm as jest.Mock).mockReturnValue({
        ...mockFormHook,
        submitForm: mockSubmit,
      });

      render(<ResidentEditPage />);

      await waitFor(() => {
        expect(screen.getByText('Save Changes')).toBeInTheDocument();
      });

      const form = screen.getByRole('form');
      fireEvent.submit(form);

      expect(mockSubmit).toHaveBeenCalled();
    });

    it('should disable form during submission', async () => {
      (useResidentEditForm as jest.Mock).mockReturnValue({
        ...mockFormHook,
        isSubmitting: true,
      });

      render(<ResidentEditPage />);

      await waitFor(() => {
        expect(screen.getByText('Saving...')).toBeInTheDocument();
      });

      const cancelButton = screen.getAllByText('Cancel')[0];
      expect(cancelButton).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should retry data loading when retry button is clicked', async () => {
      const user = userEvent.setup();
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error')).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ resident: {} }),
      });

      render(<ResidentEditPage />);

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });

      const retryButton = screen.getByText('Retry');
      await user.click(retryButton);

      // Should attempt to reload
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Authentication', () => {
    it('should not render form without session', () => {
      (useAuth as jest.Mock).mockReturnValue({ session: null });

      render(<ResidentEditPage />);

      expect(screen.getByText('Loading resident data...')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form structure', async () => {
      render(<ResidentEditPage />);

      await waitFor(() => {
        expect(screen.getByRole('form')).toBeInTheDocument();
      });

      expect(screen.getByRole('heading', { name: 'Edit Resident' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
    });

    it('should have proper loading indicators', () => {
      render(<ResidentEditPage />);

      const loadingSpinner = screen.getByRole('status', { hidden: true });
      expect(loadingSpinner).toHaveClass('animate-spin');
    });
  });
});

/**
 * Integration Tests
 */
describe('ResidentEditPage Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should complete full edit workflow', async () => {
    const user = userEvent.setup();

    // Mock successful API calls
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            resident: { first_name: 'John', last_name: 'Doe' },
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

    const mockRouter = { push: jest.fn() };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useParams as jest.Mock).mockReturnValue({ id: 'test-id' });
    (useAuth as jest.Mock).mockReturnValue({ session: { access_token: 'token' } });

    // Use real form hook for integration test
    jest.unmock('@/hooks/useResidentEditForm');

    render(<ResidentEditPage />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Edit Resident')).toBeInTheDocument();
    });

    // Simulate user interaction
    const firstNameInput = screen.getByTestId('first-name');
    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'Jane');

    // Submit form
    const saveButton = screen.getByText('Save Changes');
    await user.click(saveButton);

    // Verify API call and navigation
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/residents/test-id');
    });
  });
});
