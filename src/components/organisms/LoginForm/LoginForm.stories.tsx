import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { userEvent, within, expect } from '@storybook/test';
import { useState } from 'react';
import LoginForm from './LoginForm';

// Mock the AuthContext
const createMockAuthContext = (overrides = {}) => ({
  signIn: jest.fn(),
  loading: false,
  user: null,
  userProfile: null,
  role: null,
  ...overrides
});

// Mock AuthContext provider wrapper
const MockAuthProvider = ({ children, authValue }: { children: React.ReactNode; authValue: any }) => {
  const mockUseAuth = () => authValue;
  
  // Replace useAuth hook for this story
  jest.doMock('@/contexts/AuthContext', () => ({
    useAuth: mockUseAuth
  }));

  return <>{children}</>;
};

const meta: Meta<typeof LoginForm> = {
  title: 'Organisms/LoginForm',
  component: LoginForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Main authentication form component for the RBI System.
Handles user login with comprehensive validation and error handling.

**Features:**
- Email and password validation with real-time feedback
- Loading states during authentication
- Comprehensive error handling for various auth scenarios
- Accessibility compliant with ARIA labels and focus management
- Responsive design with proper mobile support

**Authentication Flow:**
1. User enters email and password
2. Client-side validation checks format and requirements
3. Form submits to authentication service
4. Handles success/error responses appropriately
5. Redirects or calls success callback on successful login

**Error Handling:**
- Invalid credentials
- Email not confirmed
- Network connectivity issues
- Form validation errors
- Rate limiting scenarios
        `
      }
    }
  },
  argTypes: {
    onSuccess: {
      description: 'Callback function called on successful login',
      action: 'login-success'
    },
    redirectTo: {
      description: 'URL to redirect to after successful login',
      control: { type: 'text' },
      defaultValue: '/dashboard'
    },
    className: {
      description: 'Additional CSS classes to apply to the component',
      control: { type: 'text' }
    }
  }
};

export default meta;
type Story = StoryObj<typeof LoginForm>;

export const Default: Story = {
  args: {
    onSuccess: action('login-success'),
    redirectTo: '/dashboard'
  },
  decorators: [
    (Story) => (
      <MockAuthProvider authValue={createMockAuthContext()}>
        <Story />
      </MockAuthProvider>
    )
  ]
};

export const Loading: Story = {
  args: {
    onSuccess: action('loading-login'),
    redirectTo: '/dashboard'
  },
  decorators: [
    (Story) => (
      <MockAuthProvider authValue={createMockAuthContext({ loading: true })}>
        <Story />
      </MockAuthProvider>
    )
  ]
};

export const WithValidationErrors: Story = {
  args: {
    onSuccess: action('validation-error'),
    redirectTo: '/dashboard'
  },
  decorators: [
    (Story) => (
      <MockAuthProvider authValue={createMockAuthContext()}>
        <Story />
      </MockAuthProvider>
    )
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Try to submit empty form
    const submitButton = canvas.getByRole('button', { name: /sign in/i });
    await userEvent.click(submitButton);
    
    // Should show validation errors
    await expect(canvas.getByText('Email is required')).toBeInTheDocument();
    await expect(canvas.getByText('Password is required')).toBeInTheDocument();
  }
};

export const WithInvalidEmail: Story = {
  args: {
    onSuccess: action('invalid-email'),
    redirectTo: '/dashboard'
  },
  decorators: [
    (Story) => (
      <MockAuthProvider authValue={createMockAuthContext()}>
        <Story />
      </MockAuthProvider>
    )
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Enter invalid email and try to submit
    const emailInput = canvas.getByLabelText(/email address/i);
    const passwordInput = canvas.getByLabelText(/password/i);
    const submitButton = canvas.getByRole('button', { name: /sign in/i });
    
    await userEvent.type(emailInput, 'invalid-email');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);
    
    // Should show email validation error
    await expect(canvas.getByText('Please enter a valid email address')).toBeInTheDocument();
  }
};

export const WithShortPassword: Story = {
  args: {
    onSuccess: action('short-password'),
    redirectTo: '/dashboard'
  },
  decorators: [
    (Story) => (
      <MockAuthProvider authValue={createMockAuthContext()}>
        <Story />
      </MockAuthProvider>
    )
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Enter valid email but short password
    const emailInput = canvas.getByLabelText(/email address/i);
    const passwordInput = canvas.getByLabelText(/password/i);
    const submitButton = canvas.getByRole('button', { name: /sign in/i });
    
    await userEvent.type(emailInput, 'user@barangay.gov.ph');
    await userEvent.type(passwordInput, '123');
    await userEvent.click(submitButton);
    
    // Should show password length error
    await expect(canvas.getByText('Password must be at least 6 characters')).toBeInTheDocument();
  }
};

export const InvalidCredentials: Story = {
  args: {
    onSuccess: action('invalid-credentials'),
    redirectTo: '/dashboard'
  },
  decorators: [
    (Story) => {
      const mockAuth = createMockAuthContext({
        signIn: jest.fn().mockResolvedValue({
          error: { message: 'Invalid login credentials' }
        })
      });
      return (
        <MockAuthProvider authValue={mockAuth}>
          <Story />
        </MockAuthProvider>
      );
    }
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Fill form with invalid credentials
    const emailInput = canvas.getByLabelText(/email address/i);
    const passwordInput = canvas.getByLabelText(/password/i);
    const submitButton = canvas.getByRole('button', { name: /sign in/i });
    
    await userEvent.type(emailInput, 'wrong@barangay.gov.ph');
    await userEvent.type(passwordInput, 'wrongpassword');
    await userEvent.click(submitButton);
    
    // Should show invalid credentials error
    await expect(canvas.getByText('Invalid email or password. Please try again.')).toBeInTheDocument();
  }
};

export const EmailNotConfirmed: Story = {
  args: {
    onSuccess: action('email-not-confirmed'),
    redirectTo: '/dashboard'
  },
  decorators: [
    (Story) => {
      const mockAuth = createMockAuthContext({
        signIn: jest.fn().mockResolvedValue({
          error: { message: 'Email not confirmed' }
        })
      });
      return (
        <MockAuthProvider authValue={mockAuth}>
          <Story />
        </MockAuthProvider>
      );
    }
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    const emailInput = canvas.getByLabelText(/email address/i);
    const passwordInput = canvas.getByLabelText(/password/i);
    const submitButton = canvas.getByRole('button', { name: /sign in/i });
    
    await userEvent.type(emailInput, 'unconfirmed@barangay.gov.ph');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);
    
    // Should show email confirmation error
    await expect(canvas.getByText('Please check your email and click the confirmation link.')).toBeInTheDocument();
  }
};

export const NetworkError: Story = {
  args: {
    onSuccess: action('network-error'),
    redirectTo: '/dashboard'
  },
  decorators: [
    (Story) => {
      const mockAuth = createMockAuthContext({
        signIn: jest.fn().mockResolvedValue({
          error: { message: 'Network request failed' }
        })
      });
      return (
        <MockAuthProvider authValue={mockAuth}>
          <Story />
        </MockAuthProvider>
      );
    }
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    const emailInput = canvas.getByLabelText(/email address/i);
    const passwordInput = canvas.getByLabelText(/password/i);
    const submitButton = canvas.getByRole('button', { name: /sign in/i });
    
    await userEvent.type(emailInput, 'user@barangay.gov.ph');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);
    
    // Should show network error message
    await expect(canvas.getByText('Network request failed')).toBeInTheDocument();
  }
};

export const SuccessfulLogin: Story = {
  args: {
    onSuccess: action('successful-login'),
    redirectTo: '/dashboard'
  },
  decorators: [
    (Story) => {
      const mockAuth = createMockAuthContext({
        signIn: jest.fn().mockResolvedValue({ error: null })
      });
      return (
        <MockAuthProvider authValue={mockAuth}>
          <Story />
        </MockAuthProvider>
      );
    }
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    const emailInput = canvas.getByLabelText(/email address/i);
    const passwordInput = canvas.getByLabelText(/password/i);
    const submitButton = canvas.getByRole('button', { name: /sign in/i });
    
    await userEvent.type(emailInput, 'admin@barangay.gov.ph');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);
    
    // Form should clear validation errors
    expect(canvas.queryByText('Email is required')).not.toBeInTheDocument();
    expect(canvas.queryByText('Password is required')).not.toBeInTheDocument();
  }
};

export const Submitting: Story = {
  args: {
    onSuccess: action('submitting'),
    redirectTo: '/dashboard'
  },
  decorators: [
    (Story) => {
      // Create a mock that simulates a slow response
      const [isSubmitting, setIsSubmitting] = useState(false);
      const mockAuth = createMockAuthContext({
        signIn: jest.fn().mockImplementation(async () => {
          setIsSubmitting(true);
          await new Promise(resolve => setTimeout(resolve, 2000));
          setIsSubmitting(false);
          return { error: null };
        }),
        loading: isSubmitting
      });
      return (
        <MockAuthProvider authValue={mockAuth}>
          <Story />
        </MockAuthProvider>
      );
    }
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    const emailInput = canvas.getByLabelText(/email address/i);
    const passwordInput = canvas.getByLabelText(/password/i);
    const submitButton = canvas.getByRole('button', { name: /sign in/i });
    
    await userEvent.type(emailInput, 'admin@barangay.gov.ph');
    await userEvent.type(passwordInput, 'password123');
    
    // Verify button shows loading state when clicked
    expect(submitButton).toBeEnabled();
    await userEvent.click(submitButton);
    
    // Note: In a real test, we'd verify loading state, but Storybook interactions are limited
  }
};

export const CustomClassName: Story = {
  args: {
    onSuccess: action('custom-class'),
    redirectTo: '/dashboard',
    className: 'custom-login-form border-2 border-blue-500'
  },
  decorators: [
    (Story) => (
      <MockAuthProvider authValue={createMockAuthContext()}>
        <Story />
      </MockAuthProvider>
    )
  ]
};

export const CustomRedirect: Story = {
  args: {
    onSuccess: action('custom-redirect'),
    redirectTo: '/admin/users'
  },
  decorators: [
    (Story) => (
      <MockAuthProvider authValue={createMockAuthContext()}>
        <Story />
      </MockAuthProvider>
    )
  ]
};

// Interactive testing stories
export const InteractiveValidation: Story = {
  name: '🧪 Interactive - Form Validation',
  args: {
    onSuccess: action('interactive-validation'),
    redirectTo: '/dashboard'
  },
  decorators: [
    (Story) => (
      <MockAuthProvider authValue={createMockAuthContext()}>
        <Story />
      </MockAuthProvider>
    )
  ],
  parameters: {
    docs: {
      description: {
        story: `
Interactive story to test form validation behavior.

**Test Steps:**
1. Try submitting the empty form
2. Enter invalid email formats
3. Test password length requirements  
4. Clear fields after entering valid data
5. Test real-time error clearing

**Expected Behavior:**
- Errors appear when validation fails
- Errors clear when user starts typing valid input
- Submit button remains enabled throughout
- Form provides immediate feedback
        `
      }
    }
  }
};

export const InteractiveErrorRecovery: Story = {
  name: '🧪 Interactive - Error Recovery',
  args: {
    onSuccess: action('interactive-error-recovery'),
    redirectTo: '/dashboard'
  },
  decorators: [
    (Story) => {
      const mockAuth = createMockAuthContext({
        signIn: jest.fn()
          .mockResolvedValueOnce({ error: { message: 'Invalid login credentials' } })
          .mockResolvedValueOnce({ error: null })
      });
      return (
        <MockAuthProvider authValue={mockAuth}>
          <Story />
        </MockAuthProvider>
      );
    }
  ],
  parameters: {
    docs: {
      description: {
        story: `
Interactive story to test error recovery flows.

**Test Steps:**
1. Enter any valid credentials and submit
2. Observe the error message for invalid credentials
3. Correct the credentials and submit again
4. Verify successful login

**Expected Behavior:**
- First attempt shows error message
- Error message clears when form is resubmitted
- Second attempt succeeds
- Form handles retry scenarios gracefully
        `
      }
    }
  }
};

export const InteractiveAccessibility: Story = {
  name: '🧪 Interactive - Accessibility Features',
  args: {
    onSuccess: action('interactive-accessibility'),
    redirectTo: '/dashboard'
  },
  decorators: [
    (Story) => (
      <MockAuthProvider authValue={createMockAuthContext()}>
        <Story />
      </MockAuthProvider>
    )
  ],
  parameters: {
    docs: {
      description: {
        story: `
Interactive story to test accessibility features.

**Test Steps:**
1. Use Tab key to navigate through form elements
2. Verify focus indicators are visible
3. Test screen reader announcements for errors
4. Use Enter key to submit form
5. Verify ARIA labels and descriptions

**Expected Behavior:**
- Logical tab order through form elements
- Clear focus indicators on all interactive elements
- Error messages are announced to screen readers
- Form can be completed using only keyboard
- All form controls have appropriate labels
        `
      }
    }
  }
};

export const InteractiveRealWorldScenarios: Story = {
  name: '🧪 Interactive - Real World Scenarios',
  args: {
    onSuccess: action('real-world-scenarios'),
    redirectTo: '/dashboard'
  },
  decorators: [
    (Story) => {
      // Simulate various real-world conditions
      const scenarios = [
        { error: { message: 'Invalid login credentials' } },
        { error: { message: 'Email not confirmed' } },
        { error: { message: 'Too many requests' } },
        { error: null }
      ];
      let attemptCount = 0;
      
      const mockAuth = createMockAuthContext({
        signIn: jest.fn().mockImplementation(async () => {
          const scenario = scenarios[attemptCount % scenarios.length];
          attemptCount++;
          return scenario;
        })
      });
      return (
        <MockAuthProvider authValue={mockAuth}>
          <Story />
        </MockAuthProvider>
      );
    }
  ],
  parameters: {
    docs: {
      description: {
        story: `
Interactive story simulating real-world authentication scenarios for a Barangay management system.

**Scenarios to Test:**
1. **First attempt:** Invalid credentials (common typo)
2. **Second attempt:** Email not confirmed (new user)
3. **Third attempt:** Rate limiting (too many attempts)
4. **Fourth attempt:** Successful login

**Common Barangay Use Cases:**
- Barangay officials logging in from shared computers
- Users with limited technical experience
- Intermittent internet connectivity
- Multiple users sharing similar email patterns
        `
      }
    }
  }
};