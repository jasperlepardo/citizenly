import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import UserProfile from './UserProfile';

// Mock AuthContext
const createMockAuthContext = (overrides = {}) => ({
  user: null,
  userProfile: null,
  role: null,
  loading: false,
  profileLoading: false,
  signOut: jest.fn(),
  ...overrides,
});

const MockAuthProvider = ({
  children,
  authValue,
}: {
  children: React.ReactNode;
  authValue: any;
}) => {
  jest.doMock('@/contexts/AuthContext', () => ({
    useAuth: () => authValue,
  }));

  return <>{children}</>;
};

// Sample user profiles for different roles
const sampleProfiles = {
  barangayAdmin: {
    user: {
      id: 'admin-123',
      email: 'captain.santos@barangay123.gov.ph',
    },
    userProfile: {
      id: 'admin-123',
      email: 'captain.santos@barangay123.gov.ph',
      first_name: 'Maria',
      last_name: 'Santos',
      barangay_code: '137404001',
      role_id: 'admin-role',
      is_active: true,
      created_at: '2024-01-15T08:00:00Z',
      updated_at: '2024-01-20T16:30:00Z',
    },
    role: {
      id: 'admin-role',
      name: 'Barangay Captain',
      permissions: { all: true },
    },
  },
  barangayClerk: {
    user: {
      id: 'clerk-456',
      email: 'j.rivera@barangay123.gov.ph',
    },
    userProfile: {
      id: 'clerk-456',
      email: 'j.rivera@barangay123.gov.ph',
      first_name: 'Juan',
      last_name: 'Rivera',
      barangay_code: '137404001',
      role_id: 'clerk-role',
      is_active: true,
      created_at: '2024-02-01T09:15:00Z',
      updated_at: '2024-02-10T14:20:00Z',
    },
    role: {
      id: 'clerk-role',
      name: 'Barangay Clerk',
      permissions: {
        residents_view: true,
        residents_create: true,
        households_view: true,
        reports_view: true,
      },
    },
  },
  dataEncoder: {
    user: {
      id: 'encoder-789',
      email: 'a.garcia@barangay123.gov.ph',
    },
    userProfile: {
      id: 'encoder-789',
      email: 'a.garcia@barangay123.gov.ph',
      first_name: 'Ana',
      last_name: 'Garcia',
      barangay_code: '137404001',
      role_id: 'encoder-role',
      is_active: true,
      created_at: '2024-03-01T10:00:00Z',
      updated_at: '2024-03-05T11:45:00Z',
    },
    role: {
      id: 'encoder-role',
      name: 'Data Encoder',
      permissions: {
        residents_view: true,
        residents_create: true,
      },
    },
  },
};

const meta: Meta<typeof UserProfile> = {
  title: 'Organisms/UserProfile',
  component: UserProfile,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
User profile component that displays authenticated user information and provides access to profile management features.

**Features:**
- Display user personal information (name, email, role)
- Show barangay assignment and status
- Compact and full-size display modes
- Dropdown menu with user actions
- Role-based information display
- Sign out functionality
- Loading states during profile fetching

**Display Modes:**
- **Compact Mode:** Minimal profile info with dropdown menu (ideal for navigation bars)
- **Full Mode:** Complete profile information with detailed barangay assignments

**Security Considerations:**
- Only displays information for authenticated users
- Shows appropriate loading states
- Handles missing profile data gracefully
- Secure sign-out functionality
- Role-based information visibility

**Common Usage:**
- Navigation bar user menu
- Profile management pages
- User account settings
- Administrative user listings
        `,
      },
    },
  },
  argTypes: {
    compact: {
      description: 'Whether to show compact profile view (suitable for navigation)',
      control: { type: 'boolean' },
      defaultValue: false,
    },
    showBarangay: {
      description: 'Whether to display barangay assignment information',
      control: { type: 'boolean' },
      defaultValue: true,
    },
    className: {
      description: 'Additional CSS classes to apply to the component',
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof UserProfile>;

export const LoadingState: Story = {
  args: {
    compact: false,
    showBarangay: true,
  },
  decorators: [
    Story => (
      <MockAuthProvider authValue={createMockAuthContext({ loading: true })}>
        <Story />
      </MockAuthProvider>
    ),
  ],
};

export const ProfileLoadingState: Story = {
  args: {
    compact: false,
    showBarangay: true,
  },
  decorators: [
    Story => (
      <MockAuthProvider
        authValue={createMockAuthContext({
          user: { id: 'user-123' },
          profileLoading: true,
        })}
      >
        <Story />
      </MockAuthProvider>
    ),
  ],
};

export const NoUserAuthenticated: Story = {
  args: {
    compact: false,
    showBarangay: true,
  },
  decorators: [
    Story => (
      <MockAuthProvider authValue={createMockAuthContext()}>
        <Story />
      </MockAuthProvider>
    ),
  ],
};

export const BarangayCaptainProfile: Story = {
  args: {
    compact: false,
    showBarangay: true,
  },
  decorators: [
    Story => (
      <MockAuthProvider authValue={createMockAuthContext(sampleProfiles.barangayAdmin)}>
        <Story />
      </MockAuthProvider>
    ),
  ],
};

export const BarangayClerkProfile: Story = {
  args: {
    compact: false,
    showBarangay: true,
  },
  decorators: [
    Story => (
      <MockAuthProvider authValue={createMockAuthContext(sampleProfiles.barangayClerk)}>
        <Story />
      </MockAuthProvider>
    ),
  ],
};

export const DataEncoderProfile: Story = {
  args: {
    compact: false,
    showBarangay: true,
  },
  decorators: [
    Story => (
      <MockAuthProvider authValue={createMockAuthContext(sampleProfiles.dataEncoder)}>
        <Story />
      </MockAuthProvider>
    ),
  ],
};

export const CompactProfileView: Story = {
  args: {
    compact: true,
    showBarangay: true,
  },
  decorators: [
    Story => (
      <MockAuthProvider authValue={createMockAuthContext(sampleProfiles.barangayAdmin)}>
        <Story />
      </MockAuthProvider>
    ),
  ],
};

export const CompactWithDropdown: Story = {
  args: {
    compact: true,
    showBarangay: true,
  },
  decorators: [
    Story => (
      <MockAuthProvider authValue={createMockAuthContext(sampleProfiles.barangayClerk)}>
        <Story />
      </MockAuthProvider>
    ),
  ],
};

export const WithoutBarangayAssignment: Story = {
  args: {
    compact: false,
    showBarangay: true,
  },
  decorators: [
    Story => (
      <MockAuthProvider
        authValue={createMockAuthContext({
          ...sampleProfiles.barangayClerk,
          userProfile: {
            ...sampleProfiles.barangayClerk.userProfile,
            barangay_code: '',
          },
        })}
      >
        <Story />
      </MockAuthProvider>
    ),
  ],
};

export const HideBarangayInfo: Story = {
  args: {
    compact: false,
    showBarangay: false,
  },
  decorators: [
    Story => (
      <MockAuthProvider authValue={createMockAuthContext(sampleProfiles.barangayAdmin)}>
        <Story />
      </MockAuthProvider>
    ),
  ],
};

export const CustomClassName: Story = {
  args: {
    compact: false,
    showBarangay: true,
    className: 'border-2 border-blue-500 bg-blue-50',
  },
  decorators: [
    Story => (
      <MockAuthProvider authValue={createMockAuthContext(sampleProfiles.barangayClerk)}>
        <Story />
      </MockAuthProvider>
    ),
  ],
};

export const SignOutAction: Story = {
  args: {
    compact: false,
    showBarangay: true,
  },
  decorators: [
    Story => {
      const mockSignOut = jest.fn().mockResolvedValue(undefined);
      const authValue = {
        ...createMockAuthContext(sampleProfiles.barangayAdmin),
        signOut: mockSignOut,
      };

      return (
        <MockAuthProvider authValue={authValue}>
          <Story />
        </MockAuthProvider>
      );
    },
  ],
};

// Interactive testing stories
export const InteractiveDropdownNavigation: Story = {
  name: '🧪 Interactive - Dropdown Navigation',
  args: {
    compact: true,
    showBarangay: true,
  },
  decorators: [
    Story => (
      <MockAuthProvider authValue={createMockAuthContext(sampleProfiles.barangayAdmin)}>
        <Story />
      </MockAuthProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: `
Interactive story to test dropdown functionality and navigation.

**Test Steps:**
1. Click on the profile button to open dropdown
2. Verify all profile information is displayed correctly
3. Test keyboard navigation through dropdown items
4. Click outside to close dropdown
5. Test sign out functionality

**Expected Behavior:**
- Dropdown opens and closes smoothly
- All user information is correctly displayed
- Keyboard navigation works properly
- Click outside closes dropdown
- Sign out triggers proper authentication cleanup
        `,
      },
    },
  },
};

export const InteractiveRoleComparison: Story = {
  name: '🧪 Interactive - Role-Based Display',
  args: {
    compact: false,
    showBarangay: true,
  },
  decorators: [
    Story => {
      // Cycle through different user roles
      const roles = [
        sampleProfiles.barangayAdmin,
        sampleProfiles.barangayClerk,
        sampleProfiles.dataEncoder,
      ];
      let currentRoleIndex = 0;

      const cycleRole = () => {
        currentRoleIndex = (currentRoleIndex + 1) % roles.length;
        // In a real implementation, this would trigger a re-render with new role
      };

      return (
        <div>
          <MockAuthProvider authValue={createMockAuthContext(roles[0])}>
            <Story />
          </MockAuthProvider>
          <button
            onClick={cycleRole}
            className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Switch User Role
          </button>
        </div>
      );
    },
  ],
  parameters: {
    docs: {
      description: {
        story: `
Interactive story to compare how different user roles are displayed.

**User Roles to Test:**
1. **Barangay Captain** - Highest authority, full system access
2. **Barangay Clerk** - Administrative functions, moderate access
3. **Data Encoder** - Limited to data entry tasks

**Role-Specific Features:**
- Different permission badges
- Varying access levels indicated
- Role-appropriate information display
- Customized user interface elements

**Testing Points:**
- Role name accuracy
- Permission indicators
- Visual hierarchy and emphasis
- Appropriate action availability
        `,
      },
    },
  },
};

export const InteractiveBarangayManagement: Story = {
  name: '🧪 Interactive - Barangay Assignment',
  args: {
    compact: false,
    showBarangay: true,
  },
  decorators: [
    Story => (
      <MockAuthProvider
        authValue={createMockAuthContext({
          ...sampleProfiles.barangayAdmin,
          // Mock multiple barangay accounts for testing
          barangayAccounts: [
            {
              id: 'account-1',
              barangay_code: '137404001',
              role: 'admin',
              status: 'active',
              is_primary: true,
            },
            {
              id: 'account-2',
              barangay_code: '137404002',
              role: 'clerk',
              status: 'pending',
              is_primary: false,
            },
          ],
        })}
      >
        <Story />
      </MockAuthProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: `
Interactive story to test barangay assignment features.

**Barangay Assignment Scenarios:**
1. **Single Barangay Assignment** - Most common case
2. **Multiple Barangay Access** - For regional administrators
3. **No Assignment** - New users awaiting assignment
4. **Pending Assignments** - Awaiting approval

**Real-world Use Cases:**
- Barangay officials assigned to specific communities
- Regional coordinators managing multiple barangays
- New employees awaiting barangay assignment
- Temporary assignments for special projects

**Testing Focus:**
- Assignment status indicators
- Primary vs secondary assignments
- Access level implications
- Visual hierarchy of assignments
        `,
      },
    },
  },
};

export const InteractiveAccessibilityTesting: Story = {
  name: '🧪 Interactive - Accessibility Features',
  args: {
    compact: true,
    showBarangay: true,
  },
  decorators: [
    Story => (
      <MockAuthProvider authValue={createMockAuthContext(sampleProfiles.barangayClerk)}>
        <Story />
      </MockAuthProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: `
Interactive story to test accessibility features of the UserProfile component.

**Accessibility Test Cases:**
1. **Keyboard Navigation**
   - Tab through all interactive elements
   - Use Enter/Space to activate buttons
   - Escape key closes dropdown menus

2. **Screen Reader Support**
   - Proper ARIA labels on all elements
   - Role announcements for interactive areas
   - Status updates announced appropriately

3. **Visual Accessibility**
   - High contrast colors for text and backgrounds
   - Focus indicators visible and distinct
   - Text sizing respects user preferences

4. **Motor Accessibility**
   - Click targets meet minimum size requirements
   - Hover states don't interfere with functionality
   - Alternative input methods supported

**Government Accessibility Standards:**
- Compliant with WCAG 2.1 Level AA
- Section 508 compliance for government systems
- Local accessibility requirements for public services
        `,
      },
    },
  },
};

export const InteractiveSecurityScenarios: Story = {
  name: '🧪 Interactive - Security Testing',
  args: {
    compact: false,
    showBarangay: true,
  },
  decorators: [
    Story => (
      <MockAuthProvider authValue={createMockAuthContext(sampleProfiles.barangayAdmin)}>
        <Story />
      </MockAuthProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: `
Interactive story to test security-related scenarios.

**Security Test Scenarios:**

1. **Session Management**
   - Test session timeout handling
   - Verify secure sign-out process
   - Check token refresh behavior

2. **Information Disclosure**
   - Ensure sensitive data is properly protected
   - Verify role-based information hiding
   - Test barangay code confidentiality

3. **Cross-User Information Leakage**
   - Profile data isolation between users
   - Proper cleanup on user switching
   - Memory management for sensitive data

4. **Authentication State Edge Cases**
   - Expired authentication tokens
   - Corrupted profile data
   - Network interruption during profile load

**Barangay-Specific Security:**
- Resident information protection
- Government data confidentiality
- Administrative function access control
        `,
      },
    },
  },
};
