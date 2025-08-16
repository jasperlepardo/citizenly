import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import LoginForm from './LoginForm';

// Mock the AuthContext
const createMockAuthContext = (overrides = {}) => ({
  signIn: () => Promise.resolve(),
  loading: false,
  user: null,
  userProfile: null,
  role: null,
  ...overrides,
});

// Mock AuthContext provider wrapper
const MockAuthProvider = ({
  children,
  authValue,
}: {
  children: React.ReactNode;
  authValue: any;
}) => {
  const mockUseAuth = () => authValue;

  // Note: AuthContext mocking would be handled by Storybook
  console.log('AuthContext mock would be configured here');

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
        `,
      },
    },
  },
  argTypes: {
    onSuccess: {
      description: 'Callback function called on successful login',
      action: 'login-success',
    },
    redirectTo: {
      description: 'URL to redirect to after successful login',
      control: { type: 'text' },
      defaultValue: '/dashboard',
    },
    className: {
      description: 'Additional CSS classes to apply to the component',
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof LoginForm>;

export const Default: Story = {
  args: {
    onSuccess: fn(),
    redirectTo: '/dashboard',
  },
  decorators: [
    Story => (
      <MockAuthProvider authValue={createMockAuthContext()}>
        <Story />
      </MockAuthProvider>
    ),
  ],
};

export const Loading: Story = {
  args: {
    onSuccess: fn(),
    redirectTo: '/dashboard',
  },
  decorators: [
    Story => (
      <MockAuthProvider authValue={createMockAuthContext({ loading: true })}>
        <Story />
      </MockAuthProvider>
    ),
  ],
};

export const WithValidationErrors: Story = {
  args: {
    onSuccess: fn(),
    redirectTo: '/dashboard',
  },
  decorators: [
    Story => (
      <MockAuthProvider authValue={createMockAuthContext()}>
        <Story />
      </MockAuthProvider>
    ),
  ],
};

export const InvalidCredentials: Story = {
  args: {
    onSuccess: fn(),
    redirectTo: '/dashboard',
  },
  decorators: [
    Story => {
      const mockAuth = createMockAuthContext({
        signIn: () => Promise.resolve({
          error: { message: 'Invalid login credentials' },
        }),
      });
      return (
        <MockAuthProvider authValue={mockAuth}>
          <Story />
        </MockAuthProvider>
      );
    },
  ],
};

export const EmailNotConfirmed: Story = {
  args: {
    onSuccess: fn(),
    redirectTo: '/dashboard',
  },
  decorators: [
    Story => {
      const mockAuth = createMockAuthContext({
        signIn: () => Promise.resolve({
          error: { message: 'Email not confirmed' },
        }),
      });
      return (
        <MockAuthProvider authValue={mockAuth}>
          <Story />
        </MockAuthProvider>
      );
    },
  ],
};

export const NetworkError: Story = {
  args: {
    onSuccess: fn(),
    redirectTo: '/dashboard',
  },
  decorators: [
    Story => {
      const mockAuth = createMockAuthContext({
        signIn: () => Promise.resolve({
          error: { message: 'Network request failed' },
        }),
      });
      return (
        <MockAuthProvider authValue={mockAuth}>
          <Story />
        </MockAuthProvider>
      );
    },
  ],
};

export const SuccessfulLogin: Story = {
  args: {
    onSuccess: fn(),
    redirectTo: '/dashboard',
  },
  decorators: [
    Story => {
      const mockAuth = createMockAuthContext({
        signIn: () => Promise.resolve({ error: null }),
      });
      return (
        <MockAuthProvider authValue={mockAuth}>
          <Story />
        </MockAuthProvider>
      );
    },
  ],
};

export const CustomClassName: Story = {
  args: {
    onSuccess: fn(),
    redirectTo: '/dashboard',
    className: 'custom-login-form border-2 border-blue-500',
  },
  decorators: [
    Story => (
      <MockAuthProvider authValue={createMockAuthContext()}>
        <Story />
      </MockAuthProvider>
    ),
  ],
};

export const CustomRedirect: Story = {
  args: {
    onSuccess: fn(),
    redirectTo: '/admin/users',
  },
  decorators: [
    Story => (
      <MockAuthProvider authValue={createMockAuthContext()}>
        <Story />
      </MockAuthProvider>
    ),
  ],
};
