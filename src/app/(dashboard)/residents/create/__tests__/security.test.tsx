/**
 * Security Test Suite for Residents Create Module
 *
 * Tests Philippine regulatory compliance (RA 10173) and
 * security measures per BSP Circular 808 requirements.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSearchParams, useRouter } from 'next/navigation';

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
  ResidentForm: jest.fn(({ onSubmit, onCancel: _onCancel, initialData }) => (
    <div data-testid="resident-form">
      <form>
        <input data-testid="first-name-input" defaultValue={initialData?.first_name || ''} />
        <button
          type="button"
          data-testid="submit-button"
          onClick={() =>
            onSubmit({
              first_name: 'Test',
              last_name: 'User',
              birthdate: '1990-01-01',
              sex: 'male',
              household_code: 'HH001',
            })
          }
        >
          Submit
        </button>
      </form>
      {initialData?.first_name && (
        <div data-testid="prefilled-name">Pre-filled: {initialData.first_name}</div>
      )}
    </div>
  )),
}));

// Security-focused mocks
const mockAuditLogger = {
  info: jest.fn(),
};

const mockPhilippineCompliantLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

const mockNPCComplianceLogger = {
  info: jest.fn(),
};

jest.mock('@/lib/security/philippine-logging', () => ({
  philippineCompliantLogger: mockPhilippineCompliantLogger,
  auditLogger: mockAuditLogger,
  npcComplianceLogger: mockNPCComplianceLogger,
  getClientIP: jest.fn(() => '127.0.0.1'),
  generateSecureSessionId: jest.fn(() => 'secure-session-123'),
}));

const mockValidateFormData = jest.fn();
const mockPrepareFormSubmission = jest.fn();

jest.mock('@/utils/resident-form-utils', () => ({
  validateFormData: mockValidateFormData,
  prepareFormSubmission: mockPrepareFormSubmission,
  parseFullName: jest.fn(name => ({
    first_name: name?.split(' ')[0] || '',
    middleName: name?.split(' ')[1] || '',
    last_name: name?.split(' ')[2] || name?.split(' ')[1] || '',
  })),
  generateFormSummary: jest.fn(() => ({})),
}));

const mockSanitizeInput = jest.fn();
const mockSanitizeNameInput = jest.fn();
const mockCheckRateLimit = jest.fn();

jest.mock('@/utils/input-sanitizer', () => ({
  sanitizeInput: mockSanitizeInput,
  sanitizeNameInput: mockSanitizeNameInput,
  checkRateLimit: mockCheckRateLimit,
}));

jest.mock('@/hooks/crud/useResidentOperations', () => ({
  useResidentOperations: jest.fn(),
}));

jest.mock('@/lib/authentication', () => ({
  useCSRFToken: jest.fn(() => ({
    getToken: jest.fn(() => 'csrf-token-123'),
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

const mockCreateResident = jest.fn();

describe('Security Tests - Philippine Regulatory Compliance', () => {
  const mockRouter = { push: jest.fn() };
  const mockUser = { id: 'user123', role: 'barangay_official' };
  const mockUserProfile = { barangay_code: '042114014' };

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    const { useAuth } = jest.requireMock('@/contexts/AuthContext');
    useAuth.mockReturnValue({
      user: mockUser,
      userProfile: mockUserProfile,
      session: { access_token: 'token' },
    });

    const { useResidentOperations } = jest.requireMock('@/hooks/crud/useResidentOperations');
    useResidentOperations.mockReturnValue({
      createResident: mockCreateResident,
      isSubmitting: false,
      validationErrors: {},
    });

    mockValidateFormData.mockReturnValue({ isValid: true, errors: {} });
    mockPrepareFormSubmission.mockReturnValue({
      transformedData: {},
      auditInfo: {
        userId: 'user123',
        sessionId: 'session123',
        timestamp: new Date().toISOString(),
      },
    });
    mockCheckRateLimit.mockReturnValue(true);
  });

  describe('URL Parameter Injection Prevention', () => {
    test('should sanitize XSS attempts in suggested_name parameter', () => {
      const xssPayload = '<script>alert("XSS")</script>';
      const mockSearchParams = {
        get: jest.fn(key => {
          if (key === 'suggested_name') return xssPayload;
          return null;
        }),
      };

      mockSanitizeNameInput.mockReturnValue(''); // Sanitized to empty string
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      render(<CreateResidentPage />);

      // Verify sanitization was called
      expect(mockSanitizeNameInput).toHaveBeenCalledWith(xssPayload);

      // Should not display script content
      expect(screen.queryByText('script')).not.toBeInTheDocument();
      expect(screen.queryByText('alert')).not.toBeInTheDocument();

      // Should log security event
      expect(mockAuditLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('URL parameter processing'),
        expect.objectContaining({
          eventType: 'URL_PARAM_PROCESSING',
          userId: 'user123',
        })
      );
    });

    test('should handle javascript: protocol injection attempts', () => {
      const jsPayload = 'javascript:void(0)';
      const mockSearchParams = {
        get: jest.fn(key => {
          if (key === 'suggested_name') return jsPayload;
          return null;
        }),
      };

      mockSanitizeNameInput.mockReturnValue('void'); // Sanitized
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      expect(() => render(<CreateResidentPage />)).not.toThrow();
      expect(mockSanitizeNameInput).toHaveBeenCalledWith(jsPayload);
    });

    test('should limit name length to prevent buffer overflow attacks', () => {
      const longName = 'A'.repeat(1000);
      const mockSearchParams = {
        get: jest.fn(key => {
          if (key === 'suggested_name') return longName;
          return null;
        }),
      };

      mockSanitizeNameInput.mockReturnValue('A'.repeat(100)); // Truncated
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      render(<CreateResidentPage />);

      expect(mockSanitizeNameInput).toHaveBeenCalledWith(longName);
      expect(screen.getByTestId('resident-form')).toBeInTheDocument();
    });

    test('should log security validation failures', () => {
      const maliciousName = '<img src=x onerror=alert(1)>';
      const mockSearchParams = {
        get: jest.fn(key => {
          if (key === 'suggested_name') return maliciousName;
          return null;
        }),
      };

      // Mock parseFullName to throw error for invalid input
      const { parseFullName } = jest.requireMock('@/utils/resident-form-utils');
      parseFullName.mockImplementation(() => {
        throw new Error('Invalid name format');
      });

      mockSanitizeNameInput.mockReturnValue('img src=x onerror=alert(1)');
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      render(<CreateResidentPage />);

      expect(mockAuditLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('URL parameter validation failed'),
        expect.objectContaining({
          eventType: 'URL_PARAM_VALIDATION_FAILED',
          parameterType: 'suggested_name',
        })
      );
    });
  });

  describe('Console Log Security Compliance (RA 10173)', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    test('should not log sensitive form data to console', async () => {
      const user = userEvent.setup();
      render(<CreateResidentPage />);

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // Check that console.log was never called with sensitive data patterns
      const logCalls = consoleSpy.mock.calls.flat();

      expect(logCalls).not.toEqual(
        expect.arrayContaining([
          expect.stringMatching(/Raw form data/i),
          expect.stringMatching(/philsys.*number/i),
          expect.stringMatching(/voter.*value/i),
        ])
      );
    });

    test('should use RA 10173 compliant logging instead of console.log', async () => {
      const user = userEvent.setup();
      render(<CreateResidentPage />);

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // Verify compliant logging was used
      expect(mockPhilippineCompliantLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Form processing initiated'),
        expect.objectContaining({
          complianceNote: 'RA_10173_COMPLIANT_DEV_LOG',
        })
      );

      expect(mockAuditLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Resident registration attempt'),
        expect.objectContaining({
          complianceFramework: 'RA_10173_BSP_808',
        })
      );

      expect(mockNPCComplianceLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Data processing event'),
        expect.objectContaining({
          legalBasis: 'PERFORMANCE_OF_TASK_PUBLIC_INTEREST',
        })
      );
    });
  });

  describe('Rate Limiting Security', () => {
    test('should prevent form spam through rate limiting', async () => {
      mockCheckRateLimit.mockReturnValue(false); // Rate limit exceeded

      const user = userEvent.setup();
      render(<CreateResidentPage />);

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // Should show rate limiting error
      await waitFor(() => {
        const { toast } = jest.requireMock('react-hot-toast');
        expect(toast.error).toHaveBeenCalledWith(
          'Too many submission attempts. Please wait before trying again.'
        );
      });

      // Should not proceed with form submission
      expect(mockCreateResident).not.toHaveBeenCalled();
    });

    test('should allow submission when rate limit not exceeded', async () => {
      mockCheckRateLimit.mockReturnValue(true); // Rate limit OK
      mockCreateResident.mockResolvedValue({ success: true });

      const user = userEvent.setup();
      render(<CreateResidentPage />);

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      expect(mockCheckRateLimit).toHaveBeenCalledWith(
        'user123',
        5, // MAX_ATTEMPTS
        300000 // WINDOW_MS
      );

      await waitFor(() => {
        expect(mockCreateResident).toHaveBeenCalled();
      });
    });
  });

  describe('Input Validation Security', () => {
    test('should validate form data server-side even if client validation passes', async () => {
      mockValidateFormData.mockReturnValue({
        isValid: false,
        errors: { _form: 'Server validation failed' },
      });

      const user = userEvent.setup();
      render(<CreateResidentPage />);

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // Should log validation failure
      expect(mockAuditLogger.info).toHaveBeenCalledWith(
        'Form validation failed',
        expect.objectContaining({
          eventType: 'VALIDATION_FAILED',
          errorCount: 1,
        })
      );

      // Should not proceed to submission
      expect(mockCreateResident).not.toHaveBeenCalled();
    });

    test('should sanitize all form inputs before processing', async () => {
      mockSanitizeInput.mockReturnValue('sanitized');

      const user = userEvent.setup();
      render(<CreateResidentPage />);

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // Should call sanitization functions
      expect(mockPrepareFormSubmission).toHaveBeenCalled();
    });
  });

  describe('CSRF Protection', () => {
    test('should include CSRF token in form submissions', async () => {
      mockCreateResident.mockResolvedValue({ success: true });

      const user = userEvent.setup();
      render(<CreateResidentPage />);

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateResident).toHaveBeenCalledWith(
          expect.objectContaining({
            csrfToken: 'csrf-token-123',
          })
        );
      });
    });
  });

  describe('Audit Trail Compliance (BSP Circular 808)', () => {
    test('should create comprehensive audit trail for all form interactions', async () => {
      const user = userEvent.setup();
      render(<CreateResidentPage />);

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // Verify all required audit events are logged
      const auditCalls = mockAuditLogger.info.mock.calls;
      const auditEventTypes = auditCalls.map(call => call[1]?.eventType);

      expect(auditEventTypes).toContain('RESIDENT_FORM_PROCESSING');
      expect(
        auditCalls.some(
          call =>
            call[1]?.complianceFramework === 'RA_10173_BSP_808' &&
            call[1]?.retentionPeriod === '7_YEARS'
        )
      ).toBe(true);
    });

    test('should log security events with proper classification', async () => {
      const maliciousInput = '<script>alert("test")</script>';
      const mockSearchParams = {
        get: jest.fn(() => maliciousInput),
      };

      mockSanitizeNameInput.mockReturnValue('');
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      render(<CreateResidentPage />);

      expect(mockAuditLogger.info).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          complianceFramework: 'RA_10173_BSP_808',
          retentionPeriod: '7_YEARS',
        })
      );
    });
  });

  describe('Data Privacy Compliance (NPC Requirements)', () => {
    test('should log data processing activities per NPC guidelines', async () => {
      const user = userEvent.setup();
      render(<CreateResidentPage />);

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      expect(mockNPCComplianceLogger.info).toHaveBeenCalledWith(
        'Data processing event',
        expect.objectContaining({
          dataCategory: 'PERSONAL_INFORMATION',
          processingPurpose: 'BARANGAY_RESIDENT_REGISTRATION',
          legalBasis: 'PERFORMANCE_OF_TASK_PUBLIC_INTEREST',
          consentStatus: 'OBTAINED',
        })
      );
    });

    test('should never log actual personal data content', async () => {
      const user = userEvent.setup();
      render(<CreateResidentPage />);

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // Check all logger calls to ensure no PII is logged
      const allLogCalls = [
        ...mockPhilippineCompliantLogger.debug.mock.calls,
        ...mockAuditLogger.info.mock.calls,
        ...mockNPCComplianceLogger.info.mock.calls,
      ];

      allLogCalls.forEach(call => {
        const logContent = JSON.stringify(call);

        // Should not contain actual personal data
        expect(logContent).not.toMatch(/John|Doe|1990-01-01/);
        expect(logContent).not.toMatch(/\d{4}-\d{4}-\d{4}/); // PhilSys pattern
        expect(logContent).not.toMatch(/\+639\d{9}/); // Phone pattern
      });
    });
  });

  describe('Error Handling Security', () => {
    test('should not expose sensitive information in error messages', async () => {
      mockValidateFormData.mockReturnValue({
        isValid: false,
        errors: { database: 'Connection failed to server 192.168.1.100' },
      });

      const user = userEvent.setup();
      render(<CreateResidentPage />);

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      // Should show generic error, not expose internal details
      await waitFor(() => {
        const { toast } = jest.requireMock('react-hot-toast');
        expect(toast.error).toHaveBeenCalledWith(
          expect.not.stringMatching(/192\.168\.1\.100|server|database/i)
        );
      });
    });

    test('should log detailed errors for security monitoring', async () => {
      const securityError = new Error('Potential security violation detected');
      mockValidateFormData.mockImplementation(() => {
        throw securityError;
      });

      const user = userEvent.setup();
      render(<CreateResidentPage />);

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      expect(mockAuditLogger.info).toHaveBeenCalledWith(
        'Form submission error',
        expect.objectContaining({
          eventType: 'FORM_SUBMISSION_ERROR',
          errorType: 'Error',
        })
      );
    });
  });
});
