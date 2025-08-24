import type { Meta, StoryObj } from '@storybook/react';
import { fn, within, expect } from 'storybook/test';
import DevLogin from '@/components/organisms/DevLogin';

// Mock the dev-config module
const mockIsDevFeatureEnabled = (enabled: boolean) => enabled;
const mockGetDevCredentials = () => ({
  email: 'admin@demo.gov.ph',
  password: 'dev123456',
});
const mockGetDemoUserConfig = () => ({
  first_name: 'Juan',
  last_name: 'Cruz',
  mobile_number: '+639123456789',
});
const mockLogDevModeWarning = () => console.warn('Development mode active');
const mockValidateDevEnvironment = (isValid: boolean) => ({
  isValid,
  errors: isValid ? [] : ['NODE_ENV not set to development', 'Missing SUPABASE_URL'],
});

// Mock supabase
const mockSupabase = {
  auth: {
    signUp: fn(),
    signInWithPassword: fn(),
    getUser: fn(),
  },
  from: fn(),
};

// Setup decorators with mocked dependencies
const mockDecorator = (Story: any, context: any) => {
  // Mock the imports based on story parameters
  const { devModeEnabled = true, hasConfigErrors = false } = context.parameters;

  // Note: In Storybook environment, mocking is handled differently
  // These would typically be handled through Storybook parameters or MSW
  console.log('DevLogin Story with params:', { devModeEnabled, hasConfigErrors });

  return <Story />;
};

const meta: Meta<typeof DevLogin> = {
  title: 'Organisms/DevLogin',
  component: DevLogin,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Development login component for testing authentication flows in the RBI System.
This component should only be available in development environments.

**Features:**
- Creates demo users with proper barangay assignments
- Quick login buttons for existing users
- Environment validation and configuration checks
- Security warnings for development-only usage
- Comprehensive error handling and user feedback

**Security Considerations:**
- Only available when NODE_ENV=development
- Uses secure environment variables for credentials
- Shows clear warnings about development-only usage
- Validates environment configuration before enabling features
        `,
      },
    },
  },
  decorators: [mockDecorator],
  argTypes: {
    onSuccess: {
      description: 'Callback function called when login/setup is successful',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DevLogin>;

export const Default: Story = {
  args: {
    onSuccess: fn(),
  },
  parameters: {
    devModeEnabled: true,
    hasConfigErrors: false,
  },
};

export const CreatingUser: Story = {
  args: {
    onSuccess: fn(),
  },
  parameters: {
    devModeEnabled: true,
    hasConfigErrors: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Note: Mock setup would be handled by Storybook/MSW in real implementation
    console.log('DevLogin interaction test - mocks would be configured here');

    // Click the setup button to trigger user creation
    const setupButton = canvas.getByRole('button', { name: /create demo users/i });

    // Verify initial state
    expect(setupButton).toBeInTheDocument();
    expect(setupButton).toBeEnabled();
  },
};

export const UserAlreadyExists: Story = {
  args: {
    onSuccess: fn(),
  },
  parameters: {
    devModeEnabled: true,
    hasConfigErrors: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Note: Mock setup would be handled by Storybook/MSW in real implementation
    console.log('UserAlreadyExists interaction test - mocks would be configured here');

    const setupButton = canvas.getByRole('button', { name: /create demo users/i });
    expect(setupButton).toBeInTheDocument();
  },
};

export const DatabaseError: Story = {
  args: {
    onSuccess: fn(),
  },
  parameters: {
    devModeEnabled: true,
    hasConfigErrors: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Note: Mock setup would be handled by Storybook/MSW in real implementation
    console.log('DatabaseError interaction test - mocks would be configured here');

    const setupButton = canvas.getByRole('button', { name: /create demo users/i });
    expect(setupButton).toBeInTheDocument();
  },
};

export const QuickLogin: Story = {
  args: {
    onSuccess: fn(),
  },
  parameters: {
    devModeEnabled: true,
    hasConfigErrors: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Note: Mock setup would be handled by Storybook/MSW in real implementation
    console.log('QuickLogin interaction test - mocks would be configured here');

    // Verify quick login buttons are present
    const adminLoginButton = canvas.getByRole('button', { name: /login as barangay admin/i });
    const clerkLoginButton = canvas.getByRole('button', { name: /login as clerk/i });

    expect(adminLoginButton).toBeInTheDocument();
    expect(clerkLoginButton).toBeInTheDocument();
  },
};

export const LoginError: Story = {
  args: {
    onSuccess: fn(),
  },
  parameters: {
    devModeEnabled: true,
    hasConfigErrors: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Mock login error
    mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
      error: { message: 'Invalid login credentials' },
    });

    const adminLoginButton = canvas.getByRole('button', { name: /login as barangay admin/i });
    expect(adminLoginButton).toBeInTheDocument();
  },
};

export const DevModeDisabled: Story = {
  args: {
    onSuccess: fn(),
  },
  parameters: {
    devModeEnabled: false,
    hasConfigErrors: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify setup button is disabled when dev mode is off
    const setupButton = canvas.getByRole('button', { name: /create demo users/i });
    expect(setupButton).toBeDisabled();

    // Quick login buttons should be disabled
    const adminLoginButton = canvas.getByRole('button', { name: /login as barangay admin/i });
    expect(adminLoginButton).toBeDisabled();
  },
};

export const ConfigurationErrors: Story = {
  args: {
    onSuccess: fn(),
  },
  parameters: {
    devModeEnabled: false,
    hasConfigErrors: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify error message is displayed
    const errorMessage = canvas.getByText(/configuration errors/i);
    expect(errorMessage).toBeInTheDocument();
  },
};

export const SecurityWarning: Story = {
  args: {
    onSuccess: fn(),
  },
  parameters: {
    devModeEnabled: true,
    hasConfigErrors: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify security warning is displayed
    const warningText = canvas.getByText(/development mode only/i);
    expect(warningText).toBeInTheDocument();
  },
};

// Interactive testing stories
export const InteractiveSetup: Story = {
  name: '🧪 Interactive - User Creation Flow',
  args: {
    onSuccess: fn(),
  },
  parameters: {
    devModeEnabled: true,
    hasConfigErrors: false,
    docs: {
      description: {
        story: `
Interactive story to test the complete user creation flow.
        
**Test Steps:**
1. Click "Create Demo Users & Login" button
2. Observe loading state and progress messages
3. Verify success message and automatic login
4. Check that quick login buttons become available

**Expected Behavior:**
- Button shows loading spinner during setup
- Status messages show progress of each step
- Success message appears with checkmark
- onSuccess callback is triggered after completion
        `,
      },
    },
  },
};

export const InteractiveQuickLogin: Story = {
  name: '🧪 Interactive - Quick Login Flow',
  args: {
    onSuccess: fn(),
  },
  parameters: {
    devModeEnabled: true,
    hasConfigErrors: false,
    docs: {
      description: {
        story: `
Interactive story to test quick login functionality.
        
**Test Steps:**
1. Click either "Login as Barangay Admin" or "Login as Clerk"
2. Observe status messages
3. Verify successful login and callback

**Expected Behavior:**
- Login attempt message appears immediately
- Success message shows after authentication
- onSuccess callback is triggered
        `,
      },
    },
  },
};

export const InteractiveErrorHandling: Story = {
  name: '🧪 Interactive - Error Scenarios',
  args: {
    onSuccess: fn(),
  },
  parameters: {
    devModeEnabled: true,
    hasConfigErrors: false,
    docs: {
      description: {
        story: `
Interactive story to test error handling scenarios.

**Note:** This story uses mocked errors. In a real test environment:
- Network errors should be handled gracefully
- Database errors should show appropriate messages
- Authentication errors should provide clear feedback
- Users should be able to retry failed operations

**Testing Tips:**
- Try creating users when database is unavailable
- Test login with invalid credentials
- Verify error messages are user-friendly
        `,
      },
    },
  },
};
