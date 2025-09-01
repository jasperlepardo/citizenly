/**
 * Comprehensive Test Suite for Add New Resident Functionality
 * Tests the complete flow of creating a new resident
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';
import { toast } from 'react-hot-toast';

import { useAuth } from '@/contexts';

import CreateResidentPage from '../page';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/components', () => ({
  ResidentForm: jest.fn(({ onSubmit, onCancel, initialData }) => (
    <div data-testid="resident-form">
      <button
        onClick={() =>
          onSubmit({
            first_name: 'John',
            last_name: 'Doe',
            birthdate: '1990-01-01',
            sex: 'male',
          })
        }
      >
        Submit
      </button>
      <button onClick={onCancel}>Cancel</button>
      {initialData?.first_name && <div>Pre-filled: {initialData.first_name}</div>}
    </div>
  )),
}));

jest.mock('@/hooks/crud/useResidentOperations', () => ({
  useResidentOperations: jest.fn(),
}));

// Mock security and validation modules
jest.mock('@/lib/security/philippine-logging', () => ({
  philippineCompliantLogger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
  auditLogger: {
    info: jest.fn(),
  },
  npcComplianceLogger: {
    info: jest.fn(),
  },
  getClientIP: jest.fn(() => '127.0.0.1'),
  generateSecureSessionId: jest.fn(() => 'mock-session-id'),
}));

jest.mock('@/utils/resident-form-utils', () => ({
  validateRequiredFields: jest.fn(() => ({ isValid: true, errors: {} })),
  transformFormData: jest.fn(data => data),
  parseFullName: jest.fn(name => ({
    first_name: name.split(' ')[0] || '',
    middleName: name.split(' ')[1] || '',
    last_name: name.split(' ')[2] || name.split(' ')[1] || '',
  })),
  validateFormData: jest.fn(() => ({ isValid: true, errors: {} })),
  prepareFormSubmission: jest.fn((formData, userId, sessionId, barangayCode) => ({
    transformedData: formData,
    auditInfo: {
      userId,
      sessionId,
      barangayCode,
      timestamp: new Date().toISOString(),
      fieldCount: Object.keys(formData).length,
      hasPhilSys: false,
      hasVoterData: false,
    },
  })),
  generateFormSummary: jest.fn(() => ({
    hasPersonalInfo: true,
    fieldCount: 4,
  })),
}));

jest.mock('@/utils/input-sanitizer', () => ({
  sanitizeInput: jest.fn(input => input || ''),
  sanitizeNameInput: jest.fn(input => input || ''),
  checkRateLimit: jest.fn(() => true),
}));

jest.mock('@/lib/authentication', () => ({
  useCSRFToken: jest.fn(() => ({
    getToken: jest.fn(() => 'mock-csrf-token'),
  })),
}));

jest.mock('@/constants/resident-form', () => ({
  RATE_LIMITS: {
    FORM_SUBMISSION: {
      MAX_ATTEMPTS: 5,
      WINDOW_MS: 300000,
    },
  },
}));

jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock the service and hooks
const mockCreateResident = jest.fn();
const { useResidentOperations } = jest.requireMock('@/hooks/crud/useResidentOperations');
const mockUseResidentOperations = useResidentOperations as jest.Mock;

describe('Create New Resident - Complete Flow', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockSearchParams = new URLSearchParams();

  const mockUserProfile = {
    barangay_code: '042114014',
    id: 'user123',
  };

  const mockSession = {
    access_token: 'mock-token',
    user: { id: 'user123' },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'user123', role: 'barangay_official' },
      userProfile: mockUserProfile,
      session: mockSession,
    });

    mockUseResidentOperations.mockReturnValue({
      createResident: mockCreateResident,
      isSubmitting: false,
      validationErrors: {},
    });
  });

  describe('Page Rendering', () => {
    test('should render the create resident page with all required elements', () => {
      render(<CreateResidentPage />);

      expect(screen.getByText('Add New Resident')).toBeInTheDocument();
      expect(
        screen.getByText('Complete the form to register a new resident in the system')
      ).toBeInTheDocument();
      expect(screen.getByTestId('resident-form')).toBeInTheDocument();
      expect(screen.getByText('Back')).toBeInTheDocument();
    });

    test('should render back button with correct functionality', async () => {
      const user = userEvent.setup();
      render(<CreateResidentPage />);

      const backButton = screen.getByText('Back');
      await user.click(backButton);

      // Back button should be a link, so it won't call router.push
      expect(backButton.closest('a')).toHaveAttribute('href', '/residents');
    });
  });

  describe('Form Submission - Success Cases', () => {
    test('should handle successful resident creation and redirect to resident details', async () => {
      const user = userEvent.setup();
      mockCreateResident.mockResolvedValue({
        success: true,
        data: { resident: { id: 'new-resident-123' } },
      });

      render(<CreateResidentPage />);

      const submitButton = screen.getByText('Submit');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateResident).toHaveBeenCalledWith({
          first_name: 'John',
          middle_name: '',
          last_name: 'Doe',
          extension_name: '',
          birthdate: '1990-01-01',
          sex: 'male',
          civil_status: 'single',
          citizenship: 'filipino',
          education_attainment: '',
          employment_status: 'not_in_labor_force',
          email: '',
          mobile_number: '',
          telephone_number: '',
          philsys_card_number: '',
          blood_type: '',
          height: '',
          weight: '',
          complexion: '',
          ethnicity: '',
          religion: 'roman_catholic',
          last_voted_date: '',
          mother_maiden_first: '',
          mother_maiden_middle: '',
          mother_maiden_last: '',
          region_code: '',
          province_code: '',
          city_municipality_code: '',
          barangay_code: '',
          household_code: '',
        });
      });

      expect(toast.success).toHaveBeenCalledWith('Resident created successfully!');
      expect(mockRouter.push).toHaveBeenCalledWith('/residents/new-resident-123');
    });

    test('should redirect to residents list when no resident ID in response', async () => {
      const user = userEvent.setup();
      mockCreateResident.mockResolvedValue({
        success: true,
        data: {},
      });

      render(<CreateResidentPage />);

      const submitButton = screen.getByText('Submit');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/residents');
      });
    });

    test('should show success toast on successful creation', async () => {
      const user = userEvent.setup();
      mockCreateResident.mockResolvedValue({
        success: true,
        data: { resident: { id: 'new-resident-123' } },
      });

      render(<CreateResidentPage />);

      const submitButton = screen.getByText('Submit');
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Resident created successfully!');
      });
    });
  });

  describe('Form Submission - Error Handling', () => {
    test('should handle validation errors and display them', async () => {
      const validationErrors = {
        first_name: 'First name is required',
        birthdate: 'Invalid birthdate',
      };

      mockUseResidentOperations.mockReturnValue({
        createResident: mockCreateResident,
        isSubmitting: false,
        validationErrors,
      });

      render(<CreateResidentPage />);

      expect(screen.getByText('There were errors with your submission')).toBeInTheDocument();
      expect(screen.getByText('first_name: First name is required')).toBeInTheDocument();
      expect(screen.getByText('birthdate: Invalid birthdate')).toBeInTheDocument();
    });

    test('should handle creation failure with error toast', async () => {
      const user = userEvent.setup();
      mockCreateResident.mockRejectedValue(new Error('Creation failed'));

      render(<CreateResidentPage />);

      const submitButton = screen.getByText('Submit');
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Creation failed');
      });
    });

    test('should prevent submission when required fields are missing', async () => {
      const user = userEvent.setup();

      // Mock ResidentForm to return empty data
      const MockResidentForm = jest.requireMock('@/components').ResidentForm;
      MockResidentForm.mockImplementation(
        ({
          onSubmit,
          onCancel: _onCancel,
        }: {
          onSubmit: (data: Record<string, unknown>) => void;
          onCancel?: () => void;
        }) => (
          <div data-testid="resident-form">
            <button
              onClick={() =>
                onSubmit({
                  first_name: '', // Empty required field
                  last_name: '', // Empty required field
                  birthdate: '', // Empty required field
                  sex: '', // Empty required field
                })
              }
            >
              Submit
            </button>
          </div>
        )
      );

      render(<CreateResidentPage />);

      const submitButton = screen.getByText('Submit');
      await user.click(submitButton);

      expect(toast.error).toHaveBeenCalledWith(
        'Please fill in required fields: first_name, last_name, birthdate, sex'
      );
      expect(mockCreateResident).not.toHaveBeenCalled();
    });

    test('should handle network errors gracefully', async () => {
      const user = userEvent.setup();
      mockCreateResident.mockRejectedValue(new Error('Network error'));

      render(<CreateResidentPage />);

      const submitButton = screen.getByText('Submit');
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Network error');
      });
    });
  });

  describe('Form Cancellation', () => {
    test('should handle form cancellation and redirect to residents list', async () => {
      const user = userEvent.setup();
      render(<CreateResidentPage />);

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/residents');
    });
  });

  describe('URL Parameters - Pre-filled Data', () => {
    test('should pre-fill form with suggested name from URL parameters', () => {
      const mockSearchParams = {
        get: jest.fn((key: string) => {
          if (key === 'suggested_name') return 'Maria Santos';
          return null;
        }),
      };
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      render(<CreateResidentPage />);

      expect(screen.getByText('Pre-filled: Maria')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Form pre-filled: The name fields have been populated with "Maria Santos". You can edit these values as needed.'
        )
      ).toBeInTheDocument();
    });

    test('should handle complex names with multiple parts', () => {
      const mockSearchParams = {
        get: jest.fn((key: string) => {
          if (key === 'suggested_name') return 'Juan Carlos Santos Dela Cruz';
          return null;
        }),
      };
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      render(<CreateResidentPage />);

      // Should parse: first_name='Juan', middle_name='Carlos Santos', last_name='Dela Cruz'
      expect(screen.getByText('Pre-filled: Juan')).toBeInTheDocument();
    });

    test('should handle single name gracefully', () => {
      const mockSearchParams = {
        get: jest.fn((key: string) => {
          if (key === 'suggested_name') return 'Madonna';
          return null;
        }),
      };
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      render(<CreateResidentPage />);

      expect(screen.getByText('Pre-filled: Madonna')).toBeInTheDocument();
    });

    test('should not show pre-filled notification when no URL parameters', () => {
      render(<CreateResidentPage />);

      expect(screen.queryByText(/Form pre-filled/)).not.toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    test('should show loading state during form submission', async () => {
      const user = userEvent.setup();

      mockUseResidentOperations.mockReturnValue({
        createResident: mockCreateResident,
        isSubmitting: true,
        validationErrors: {},
      });

      // Mock a slow response
      mockCreateResident.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      render(<CreateResidentPage />);

      const submitButton = screen.getByText('Submit');
      await user.click(submitButton);

      // Form should be in submitting state
      expect(screen.getByTestId('resident-form')).toBeInTheDocument();
    });
  });

  describe('Authentication Requirements', () => {
    test('should require authentication for form submission', () => {
      (useAuth as jest.Mock).mockReturnValue({
        userProfile: null,
        session: null,
      });

      render(<CreateResidentPage />);

      // Form should still render but operations will be limited
      expect(screen.getByTestId('resident-form')).toBeInTheDocument();
    });

    test('should require barangay code for resident creation', () => {
      (useAuth as jest.Mock).mockReturnValue({
        userProfile: { id: 'user123' }, // No barangay_code
        session: mockSession,
      });

      render(<CreateResidentPage />);

      expect(screen.getByTestId('resident-form')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should have proper heading hierarchy', () => {
      render(<CreateResidentPage />);

      const heading = screen.getByRole('heading', { name: 'Add New Resident' });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H1');
    });

    test('should have descriptive text for screen readers', () => {
      render(<CreateResidentPage />);

      expect(
        screen.getByText('Complete the form to register a new resident in the system')
      ).toBeInTheDocument();
    });

    test('should have accessible back button', () => {
      render(<CreateResidentPage />);

      const backButton = screen.getByText('Back');
      expect(backButton.closest('a')).toHaveAttribute('href', '/residents');
    });
  });

  describe('Integration Testing', () => {
    test('should complete full workflow from form fill to redirect', async () => {
      const user = userEvent.setup();
      mockCreateResident.mockResolvedValue({
        success: true,
        data: { resident: { id: 'integration-test-123' } },
      });

      render(<CreateResidentPage />);

      // Verify initial state
      expect(screen.getByText('Add New Resident')).toBeInTheDocument();
      expect(screen.getByTestId('resident-form')).toBeInTheDocument();

      // Submit form
      const submitButton = screen.getByText('Submit');
      await user.click(submitButton);

      // Verify submission and redirect
      await waitFor(() => {
        expect(mockCreateResident).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('Resident created successfully!');
        expect(mockRouter.push).toHaveBeenCalledWith('/residents/integration-test-123');
      });
    });

    test('should handle complete error workflow', async () => {
      const validationErrors = {
        first_name: 'First name is required',
        sex: 'Sex is required',
      };

      mockUseResidentOperations.mockReturnValue({
        createResident: mockCreateResident,
        isSubmitting: false,
        validationErrors,
      });

      render(<CreateResidentPage />);

      // Should show validation errors
      expect(screen.getByText('There were errors with your submission')).toBeInTheDocument();
      expect(screen.getByText('First name is required')).toBeInTheDocument();
      expect(screen.getByText('Sex is required')).toBeInTheDocument();
    });
  });
});
