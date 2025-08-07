import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { within, expect } from '@storybook/test';
import ProtectedRoute from './ProtectedRoute';

// Mock Next.js router
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn()
};

const MockNextRouter = ({ children }: { children: React.ReactNode }) => {
  jest.doMock('next/navigation', () => ({
    useRouter: () => mockRouter
  }));
  return <>{children}</>;
};

// Mock AuthContext
const createMockAuthContext = (overrides = {}) => ({
  user: null,
  userProfile: null,
  role: null,
  loading: false,
  profileLoading: false,
  hasPermission: jest.fn().mockReturnValue(false),
  isInRole: jest.fn().mockReturnValue(false),
  ...overrides
});

const MockAuthProvider = ({ children, authValue }: { children: React.ReactNode; authValue: any }) => {
  jest.doMock('@/contexts/AuthContext', () => ({
    useAuth: () => authValue
  }));

  return <>{children}</>;
};

// Sample protected content component
const ProtectedContent = () => (
  <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
    <h2 className="text-lg font-semibold text-green-800 mb-2">🔒 Protected Content Accessible</h2>
    <p className="text-green-700">This content is only visible to authorized users.</p>
    <div className="mt-4 space-y-2 text-sm text-green-600">
      <p>• Resident management features</p>
      <p>• Barangay administration tools</p>
      <p>• Confidential government data</p>
    </div>
  </div>
);

const meta: Meta<typeof ProtectedRoute> = {
  title: 'Auth/ProtectedRoute',
  component: ProtectedRoute,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Route protection wrapper component that controls access to protected content based on authentication state, user roles, and permissions.

**Features:**
- Authentication state checking
- Role-based access control (RBAC)
- Permission-based access control
- Custom loading states
- Fallback content for unauthorized access
- Automatic redirection to login
- Profile loading management
- Error boundary functionality

**Security Considerations:**
- Never render protected content for unauthorized users
- Show appropriate loading states during auth checks
- Provide clear error messages for access denied scenarios
- Handle edge cases like expired sessions gracefully
- Implement proper role hierarchy enforcement

**Common Usage Patterns:**
- Protect entire page routes
- Wrap sensitive UI components
- Control access to admin functionality
- Manage role-specific feature visibility
        `
      }
    }
  },
  decorators: [
    (Story) => (
      <div style={{ width: '600px', minHeight: '400px' }}>
        <MockNextRouter>
          <Story />
        </MockNextRouter>
      </div>
    )
  ],
  argTypes: {
    requireRole: {
      description: 'Required user role to access the protected content',
      control: { type: 'select' },
      options: ['barangay_admin', 'barangay_clerk', 'system_admin', 'super_admin']
    },
    requirePermission: {
      description: 'Required permission to access the protected content',
      control: { type: 'select' },
      options: ['residents_view', 'residents_create', 'residents_update', 'residents_delete', 'users_manage', 'reports_view']
    },
    fallback: {
      description: 'Custom content to show when access is denied (instead of redirect)',
      control: false
    },
    loadingComponent: {
      description: 'Custom loading component to show during authentication check',
      control: false
    }
  }
};

export default meta;
type Story = StoryObj<typeof ProtectedRoute>;

export const AuthenticationLoading: Story = {
  args: {
    children: <ProtectedContent />
  },
  decorators: [
    (Story) => (
      <MockAuthProvider authValue={createMockAuthContext({ loading: true })}>
        <Story />
      </MockAuthProvider>
    )
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Should show loading spinner
    const loadingSpinner = canvas.getByText('Loading...');
    expect(loadingSpinner).toBeInTheDocument();
  }
};

export const ProfileLoading: Story = {
  args: {
    children: <ProtectedContent />
  },
  decorators: [
    (Story) => (
      <MockAuthProvider authValue={createMockAuthContext({
        user: { id: 'user-123' },
        profileLoading: true
      })}>
        <Story />
      </MockAuthProvider>
    )
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Should show profile loading message
    const loadingMessage = canvas.getByText('Loading profile...');
    expect(loadingMessage).toBeInTheDocument();
  }
};

export const NotAuthenticated: Story = {
  args: {
    children: <ProtectedContent />
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
    
    // Should show redirecting message
    const redirectMessage = canvas.getByText('Redirecting to login...');
    expect(redirectMessage).toBeInTheDocument();
    
    // Should have triggered router push to login
    setTimeout(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    }, 150);
  }
};

export const AuthenticatedUserAccess: Story = {
  args: {
    children: <ProtectedContent />
  },
  decorators: [
    (Story) => (
      <MockAuthProvider authValue={createMockAuthContext({
        user: { id: 'user-123', email: 'user@barangay.gov.ph' },
        userProfile: {
          id: 'user-123',
          email: 'user@barangay.gov.ph',
          first_name: 'Juan',
          last_name: 'Cruz',
          barangay_code: '123456789',
          role_id: 'clerk-role',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        role: {
          id: 'clerk-role',
          name: 'barangay_clerk',
          permissions: { residents_view: true }
        }
      })}>
        <Story />
      </MockAuthProvider>
    )
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Should show protected content
    const protectedContent = canvas.getByText('🔒 Protected Content Accessible');
    expect(protectedContent).toBeInTheDocument();
  }
};

export const RoleBasedAccessGranted: Story = {
  args: {
    children: <ProtectedContent />,
    requireRole: 'barangay_admin'
  },
  decorators: [
    (Story) => (
      <MockAuthProvider authValue={createMockAuthContext({
        user: { id: 'admin-123', email: 'admin@barangay.gov.ph' },
        userProfile: {
          id: 'admin-123',
          email: 'admin@barangay.gov.ph',
          first_name: 'Maria',
          last_name: 'Santos',
          barangay_code: '123456789',
          role_id: 'admin-role',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        role: {
          id: 'admin-role',
          name: 'barangay_admin',
          permissions: { all: true }
        },
        isInRole: jest.fn().mockReturnValue(true)
      })}>
        <Story />
      </MockAuthProvider>
    )
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Should show protected content
    const protectedContent = canvas.getByText('🔒 Protected Content Accessible');
    expect(protectedContent).toBeInTheDocument();
  }
};

export const RoleBasedAccessDenied: Story = {
  args: {
    children: <ProtectedContent />,
    requireRole: 'barangay_admin'
  },
  decorators: [
    (Story) => (
      <MockAuthProvider authValue={createMockAuthContext({
        user: { id: 'clerk-123', email: 'clerk@barangay.gov.ph' },
        userProfile: {
          id: 'clerk-123',
          email: 'clerk@barangay.gov.ph',
          first_name: 'Pedro',
          last_name: 'Rivera',
          barangay_code: '123456789',
          role_id: 'clerk-role',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        role: {
          id: 'clerk-role',
          name: 'barangay_clerk',
          permissions: { residents_view: true }
        },
        isInRole: jest.fn().mockReturnValue(false)
      })}>
        <Story />
      </MockAuthProvider>
    )
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Should show access denied message
    const accessDeniedTitle = canvas.getByText('Access Denied');
    expect(accessDeniedTitle).toBeInTheDocument();
    
    const roleRequirement = canvas.getByText(/you need the.*barangay_admin.*role/i);
    expect(roleRequirement).toBeInTheDocument();
    
    const currentRole = canvas.getByText(/your current role:.*barangay_clerk/i);
    expect(currentRole).toBeInTheDocument();
  }
};

export const PermissionBasedAccessGranted: Story = {
  args: {
    children: <ProtectedContent />,
    requirePermission: 'residents_view'
  },
  decorators: [
    (Story) => (
      <MockAuthProvider authValue={createMockAuthContext({
        user: { id: 'user-123', email: 'user@barangay.gov.ph' },
        userProfile: {
          id: 'user-123',
          email: 'user@barangay.gov.ph',
          first_name: 'Ana',
          last_name: 'Garcia',
          barangay_code: '123456789',
          role_id: 'clerk-role',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        role: {
          id: 'clerk-role',
          name: 'barangay_clerk',
          permissions: { residents_view: true }
        },
        hasPermission: jest.fn().mockReturnValue(true)
      })}>
        <Story />
      </MockAuthProvider>
    )
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Should show protected content
    const protectedContent = canvas.getByText('🔒 Protected Content Accessible');
    expect(protectedContent).toBeInTheDocument();
  }
};

export const PermissionBasedAccessDenied: Story = {
  args: {
    children: <ProtectedContent />,
    requirePermission: 'users_manage'
  },
  decorators: [
    (Story) => (
      <MockAuthProvider authValue={createMockAuthContext({
        user: { id: 'user-123', email: 'user@barangay.gov.ph' },
        userProfile: {
          id: 'user-123',
          email: 'user@barangay.gov.ph',
          first_name: 'Carlos',
          last_name: 'Mendoza',
          barangay_code: '123456789',
          role_id: 'clerk-role',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        role: {
          id: 'clerk-role',
          name: 'barangay_clerk',
          permissions: { residents_view: true }
        },
        hasPermission: jest.fn().mockReturnValue(false)
      })}>
        <Story />
      </MockAuthProvider>
    )
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Should show insufficient permissions message
    const insufficientPermissions = canvas.getByText('Insufficient Permissions');
    expect(insufficientPermissions).toBeInTheDocument();
    
    const permissionRequirement = canvas.getByText(/required permission:.*users_manage/i);
    expect(permissionRequirement).toBeInTheDocument();
  }
};

export const ProfileLoadingError: Story = {
  args: {
    children: <ProtectedContent />,
    requireRole: 'barangay_admin'
  },
  decorators: [
    (Story) => (
      <MockAuthProvider authValue={createMockAuthContext({
        user: { id: 'user-123', email: 'user@barangay.gov.ph' },
        userProfile: null,
        profileLoading: false
      })}>
        <Story />
      </MockAuthProvider>
    )
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Should show profile loading error
    const errorTitle = canvas.getByText('Profile Loading Error');
    expect(errorTitle).toBeInTheDocument();
    
    const errorMessage = canvas.getByText(/unable to load your profile/i);
    expect(errorMessage).toBeInTheDocument();
    
    const refreshButton = canvas.getByRole('button', { name: /refresh page/i });
    expect(refreshButton).toBeInTheDocument();
  }
};

export const CustomFallback: Story = {
  args: {
    children: <ProtectedContent />,
    requireRole: 'barangay_admin',
    fallback: (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
        <div className="text-yellow-600 mb-2">🔐</div>
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Custom Access Restricted</h3>
        <p className="text-yellow-700 mb-4">
          This area requires administrator privileges to access barangay management features.
        </p>
        <button className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">
          Request Access
        </button>
      </div>
    )
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
    
    // Should show custom fallback content
    const customFallback = canvas.getByText('Custom Access Restricted');
    expect(customFallback).toBeInTheDocument();
    
    const requestAccessButton = canvas.getByRole('button', { name: /request access/i });
    expect(requestAccessButton).toBeInTheDocument();
  }
};

export const CustomLoadingComponent: Story = {
  args: {
    children: <ProtectedContent />,
    loadingComponent: (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-blue-600 font-medium">Verifying your credentials...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we check your access level</p>
        </div>
      </div>
    )
  },
  decorators: [
    (Story) => (
      <MockAuthProvider authValue={createMockAuthContext({ loading: true })}>
        <Story />
      </MockAuthProvider>
    )
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Should show custom loading component
    const customLoadingMessage = canvas.getByText('Verifying your credentials...');
    expect(customLoadingMessage).toBeInTheDocument();
    
    const loadingDescription = canvas.getByText('Please wait while we check your access level');
    expect(loadingDescription).toBeInTheDocument();
  }
};

// Interactive testing stories
export const InteractiveRoleHierarchy: Story = {
  name: '🧪 Interactive - Role Hierarchy Testing',
  args: {
    children: <ProtectedContent />,
    requireRole: 'barangay_admin'
  },
  decorators: [
    (Story) => (
      <MockAuthProvider authValue={createMockAuthContext({
        user: { id: 'user-123', email: 'test@barangay.gov.ph' },
        userProfile: {
          id: 'user-123',
          email: 'test@barangay.gov.ph',
          first_name: 'Test',
          last_name: 'User',
          barangay_code: '123456789',
          role_id: 'test-role',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        role: {
          id: 'test-role',
          name: 'barangay_clerk',
          permissions: { residents_view: true }
        },
        isInRole: jest.fn().mockReturnValue(false)
      })}>
        <Story />
      </MockAuthProvider>
    )
  ],
  parameters: {
    docs: {
      description: {
        story: `
Interactive story to test role-based access control in a barangay management context.

**Role Hierarchy in RBI System:**
1. **super_admin** - System-wide administration
2. **system_admin** - Multi-barangay management  
3. **barangay_admin** - Full barangay administration
4. **barangay_clerk** - Limited barangay operations

**Test Scenarios:**
- Clerk trying to access admin functions
- Admin accessing all areas successfully
- Cross-barangay access restrictions
- Role elevation requirements
        `
      }
    }
  }
};

export const InteractivePermissionMatrix: Story = {
  name: '🧪 Interactive - Permission Matrix',
  args: {
    children: <ProtectedContent />,
    requirePermission: 'residents_create'
  },
  decorators: [
    (Story) => (
      <MockAuthProvider authValue={createMockAuthContext({
        user: { id: 'user-123', email: 'test@barangay.gov.ph' },
        userProfile: {
          id: 'user-123',
          email: 'test@barangay.gov.ph',
          first_name: 'Test',
          last_name: 'User',
          barangay_code: '123456789',
          role_id: 'test-role',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        role: {
          id: 'test-role',
          name: 'barangay_clerk',
          permissions: { residents_view: true, residents_create: false }
        },
        hasPermission: jest.fn().mockReturnValue(false)
      })}>
        <Story />
      </MockAuthProvider>
    )
  ],
  parameters: {
    docs: {
      description: {
        story: `
Interactive story to test granular permission-based access control.

**Common RBI Permissions:**
- \`residents_view\` - View resident records
- \`residents_create\` - Add new residents
- \`residents_update\` - Modify resident information
- \`residents_delete\` - Remove resident records
- \`households_manage\` - Manage household data
- \`reports_view\` - Access reports and analytics
- \`users_manage\` - Manage system users

**Real-world Scenarios:**
- Data entry clerks with limited permissions
- Senior clerks with additional update rights
- Administrators with full management access
        `
      }
    }
  }
};

export const InteractiveSecurityTesting: Story = {
  name: '🧪 Interactive - Security Edge Cases',
  args: {
    children: <ProtectedContent />,
    requireRole: 'barangay_admin'
  },
  decorators: [
    (Story) => {
      // Simulate various edge case scenarios
      const scenarios = [
        { user: null, loading: false }, // Not authenticated
        { user: { id: 'user' }, userProfile: null, profileLoading: false }, // Profile missing
        { user: { id: 'user' }, userProfile: { is_active: false }, loading: false }, // Inactive user
        { user: { id: 'user' }, userProfile: { barangay_code: 'different' }, loading: false } // Wrong barangay
      ];
      
      return (
        <MockAuthProvider authValue={createMockAuthContext(scenarios[0])}>
          <Story />
        </MockAuthProvider>
      );
    }
  ],
  parameters: {
    docs: {
      description: {
        story: `
Interactive story to test security edge cases and boundary conditions.

**Security Test Cases:**
1. **Session Expiration** - User authenticated but session expires
2. **Profile Corruption** - User exists but profile data is invalid
3. **Inactive Users** - Authenticated but account is deactivated
4. **Cross-Barangay Access** - User trying to access different barangay data
5. **Permission Revocation** - Real-time permission changes
6. **Network Interruption** - Connection lost during auth check

**Expected Security Behavior:**
- Always fail-safe (deny access when uncertain)
- Clear error messages without exposing system internals
- Proper cleanup of sensitive data on errors
- Graceful handling of edge cases
        `
      }
    }
  }
};