import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import Header from './Header';

// Mock the authentication context for Storybook
const MockAuthProvider = ({
  children,
  user = null,
  loading = false,
}: {
  children: React.ReactNode;
  user?: any;
  loading?: boolean;
}) => {
  const mockAuthValue = {
    user,
    userProfile: user
      ? {
          id: 'profile-id',
          first_name: user.user_metadata?.first_name || 'John',
          last_name: user.user_metadata?.last_name || 'Doe',
          email: user.email,
          barangay_code: '137404001',
          role_id: 'admin-role',
        }
      : null,
    role: user
      ? {
          id: 'admin-role',
          name: 'Barangay Administrator',
          permissions: [],
        }
      : null,
    signOut: async () => {
      console.log('Mock sign out');
    },
    loading,
    initialized: true,
  };

  // Mock the useAuth hook
  React.useEffect(() => {
    const originalUseAuth = (window as any).useAuth;
    (window as any).useAuth = () => mockAuthValue;

    return () => {
      (window as any).useAuth = originalUseAuth;
    };
  }, []);

  return <>{children}</>;
};

const meta = {
  title: 'Templates/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Header Component - Main navigation header for RBI System. Features responsive design with desktop navigation menu, mobile hamburger menu, user authentication state management, and brand identity. Integrates with authentication context to show login/logout states.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock user data
const mockUser = {
  id: 'user-123',
  email: 'juan.delacruz@barangay.gov.ph',
  user_metadata: {
    first_name: 'Juan',
    last_name: 'Dela Cruz',
  },
};

const mockAdminUser = {
  id: 'admin-456',
  email: 'admin@barangay.gov.ph',
  user_metadata: {
    first_name: 'Maria',
    last_name: 'Santos',
  },
};

// Default authenticated state
export const Default: Story = {
  render: () => (
    <MockAuthProvider user={mockUser}>
      <div className="bg-background min-h-screen">
        <Header />
        <div className="p-8">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-6 text-3xl font-bold text-primary">Page Content</h1>
            <p className="mb-4 text-secondary">
              This demonstrates the Header component in its default authenticated state. The header
              shows the RBI System branding, navigation menu, and user profile.
            </p>
            <div className="bg-surface rounded-lg border border-default p-6">
              <h2 className="mb-3 font-semibold text-primary">Navigation Features</h2>
              <ul className="space-y-2 text-secondary">
                <li>• Dashboard - System overview and statistics</li>
                <li>• Residents - Individual resident management</li>
                <li>• Households - Family and household records</li>
                <li>• Addresses - Location and address management</li>
                <li>• Reports - Data analysis and reporting tools</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MockAuthProvider>
  ),
};

// Unauthenticated state
export const Unauthenticated: Story = {
  render: () => (
    <MockAuthProvider user={null}>
      <div className="bg-background min-h-screen">
        <Header />
        <div className="p-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-3xl font-bold text-primary">Welcome to RBI System</h1>
            <p className="mb-8 text-secondary">
              When no user is authenticated, the header displays a Sign In link instead of user
              profile information.
            </p>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
              <h2 className="mb-3 font-semibold text-blue-900">Sign In Required</h2>
              <p className="text-sm text-blue-800">
                Click the "Sign In" link in the header to access the RBI Records Management System.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MockAuthProvider>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Header component when no user is authenticated. Shows Sign In link instead of user profile.',
      },
    },
  },
};

// Loading state
export const LoadingState: Story = {
  render: () => (
    <MockAuthProvider user={null} loading={true}>
      <div className="bg-background min-h-screen">
        <Header />
        <div className="p-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-3xl font-bold text-primary">Authentication Loading</h1>
            <p className="mb-8 text-secondary">
              While authentication is loading, the header maintains its layout structure.
            </p>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
              <div className="animate-pulse">
                <div className="mx-auto mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                <div className="mx-auto h-4 w-1/2 rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MockAuthProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Header component during authentication loading state.',
      },
    },
  },
};

// Different user types
export const AdminUser: Story = {
  render: () => (
    <MockAuthProvider user={mockAdminUser}>
      <div className="bg-background min-h-screen">
        <Header />
        <div className="p-8">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-6 text-3xl font-bold text-primary">Admin Dashboard</h1>
            <p className="mb-4 text-secondary">
              Header showing admin user "Maria Santos" with full system access.
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-green-200 bg-green-50 p-6">
                <h3 className="mb-3 font-semibold text-green-900">Admin Privileges</h3>
                <ul className="space-y-1 text-sm text-green-800">
                  <li>• Full resident data access</li>
                  <li>• User management capabilities</li>
                  <li>• System configuration access</li>
                  <li>• Advanced reporting features</li>
                </ul>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
                <h3 className="mb-3 font-semibold text-blue-900">User Profile Features</h3>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>• Compact profile display</li>
                  <li>• Automatic name initialization</li>
                  <li>• One-click logout functionality</li>
                  <li>• Responsive user menu</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MockAuthProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Header component showing an admin user with different name and permissions.',
      },
    },
  },
};

// Mobile view
export const MobileView: Story = {
  render: () => (
    <MockAuthProvider user={mockUser}>
      <div className="bg-background min-h-screen">
        <Header />
        <div className="p-4">
          <div className="mx-auto max-w-lg">
            <h1 className="mb-4 text-2xl font-bold text-primary">Mobile Navigation</h1>
            <p className="mb-6 text-sm text-secondary">
              On mobile devices, the navigation collapses into a hamburger menu. Tap the menu icon
              to see the mobile navigation drawer.
            </p>

            <div className="space-y-4">
              <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                <h3 className="mb-2 font-medium text-purple-900">Mobile Features</h3>
                <ul className="space-y-1 text-sm text-purple-800">
                  <li>• Hamburger menu toggle</li>
                  <li>• Collapsible navigation</li>
                  <li>• Touch-friendly user profile</li>
                  <li>• Optimized spacing</li>
                </ul>
              </div>

              <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                <h3 className="mb-2 font-medium text-orange-900">Navigation Menu</h3>
                <p className="text-sm text-orange-800">
                  The mobile menu includes all navigation links, user information, and logout
                  functionality in a vertical stack format.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MockAuthProvider>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story: 'Header component on mobile devices with hamburger menu and responsive navigation.',
      },
    },
  },
};

// Tablet view
export const TabletView: Story = {
  render: () => (
    <MockAuthProvider user={mockUser}>
      <div className="bg-background min-h-screen">
        <Header />
        <div className="p-6">
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-6 text-3xl font-bold text-primary">Tablet Layout</h1>
            <p className="mb-6 text-secondary">
              On tablet-sized screens, the header maintains desktop navigation while optimizing
              spacing and touch targets.
            </p>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-surface rounded-lg border border-default p-6">
                <h3 className="mb-4 font-semibold text-primary">Responsive Design</h3>
                <p className="mb-4 text-sm text-secondary">
                  The header automatically adapts to different screen sizes using responsive design
                  principles.
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-secondary">Tablet optimized</span>
                </div>
              </div>

              <div className="bg-surface rounded-lg border border-default p-6">
                <h3 className="mb-4 font-semibold text-primary">Navigation Access</h3>
                <p className="mb-4 text-sm text-secondary">
                  All navigation links remain easily accessible with appropriate touch targets for
                  tablet interaction.
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <span className="text-secondary">Touch friendly</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MockAuthProvider>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: 'Header component optimized for tablet-sized screens.',
      },
    },
  },
};

// Navigation showcase
export const NavigationShowcase: Story = {
  render: () => (
    <MockAuthProvider user={mockUser}>
      <div className="bg-background min-h-screen">
        <Header />
        <div className="p-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 text-center">
              <h1 className="mb-4 text-3xl font-bold text-primary">Navigation System</h1>
              <p className="mx-auto max-w-2xl text-secondary">
                The Header component provides comprehensive navigation throughout the RBI System
                with clear visual hierarchy and intuitive organization.
              </p>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: '📊',
                  title: 'Dashboard',
                  description: 'System overview, statistics, and key metrics for quick insights.',
                  features: [
                    'Population stats',
                    'Recent activity',
                    'Quick actions',
                    'System health',
                  ],
                },
                {
                  icon: '👥',
                  title: 'Residents',
                  description: 'Comprehensive resident management and profile administration.',
                  features: [
                    'Individual records',
                    'Personal information',
                    'Contact details',
                    'Status tracking',
                  ],
                },
                {
                  icon: '🏠',
                  title: 'Households',
                  description: 'Family and household composition management and tracking.',
                  features: [
                    'Family groups',
                    'Household heads',
                    'Member relationships',
                    'Address links',
                  ],
                },
                {
                  icon: '📍',
                  title: 'Addresses',
                  description: 'Location management with PSGC integration and mapping.',
                  features: [
                    'Street addresses',
                    'PSGC codes',
                    'Geographic data',
                    'Location hierarchy',
                  ],
                },
                {
                  icon: '📈',
                  title: 'Reports',
                  description: 'Data analysis, statistical reports, and administrative summaries.',
                  features: [
                    'Population reports',
                    'Demographics',
                    'Export functions',
                    'Custom queries',
                  ],
                },
                {
                  icon: '⚙️',
                  title: 'User Profile',
                  description: 'Account management, preferences, and authentication controls.',
                  features: [
                    'Profile editing',
                    'Security settings',
                    'Session management',
                    'Barangay info',
                  ],
                },
              ].map((section, index) => (
                <div
                  key={index}
                  className="bg-surface rounded-xl border border-default p-6 transition-shadow hover:shadow-md"
                >
                  <div className="mb-3 text-3xl">{section.icon}</div>
                  <h3 className="mb-2 font-semibold text-primary">{section.title}</h3>
                  <p className="mb-4 text-sm text-secondary">{section.description}</p>
                  <ul className="space-y-1">
                    {section.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-center gap-2 text-xs text-secondary"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 p-8 text-center">
              <h2 className="mb-4 text-xl font-bold text-indigo-900">
                Integrated Navigation Experience
              </h2>
              <p className="mx-auto max-w-3xl text-indigo-800">
                The navigation system is designed to provide quick access to all major system
                functions while maintaining a clean, professional interface that works seamlessly
                across all device types and screen sizes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MockAuthProvider>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Comprehensive overview of the navigation system and all available sections in the Header component.',
      },
    },
  },
};

// Brand identity showcase
export const BrandIdentity: Story = {
  render: () => (
    <MockAuthProvider user={mockUser}>
      <div className="bg-background min-h-screen">
        <Header />
        <div className="p-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 text-center">
              <h1 className="mb-4 text-3xl font-bold text-primary">Brand Identity</h1>
              <p className="text-secondary">
                The Header component showcases the RBI System brand identity with consistent visual
                design and professional appearance.
              </p>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="bg-surface rounded-xl border border-default p-6">
                <div className="mb-4 flex items-center space-x-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary-600">
                    <span className="font-display text-sm font-bold text-white">RBI</span>
                  </div>
                  <span className="font-display text-xl font-semibold text-primary">
                    RBI System
                  </span>
                </div>
                <h3 className="mb-3 font-semibold text-primary">Logo Design</h3>
                <ul className="space-y-2 text-sm text-secondary">
                  <li>• Clean, modern design approach</li>
                  <li>• Professional color scheme</li>
                  <li>• Consistent typography</li>
                  <li>• Scalable vector elements</li>
                </ul>
              </div>

              <div className="bg-surface rounded-xl border border-default p-6">
                <h3 className="mb-4 font-semibold text-primary">Brand Values</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-2 h-2 w-2 rounded-full bg-blue-500"></div>
                    <div>
                      <p className="text-sm font-medium text-primary">Professionalism</p>
                      <p className="text-xs text-secondary">Clean, reliable interface design</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-2 h-2 w-2 rounded-full bg-green-500"></div>
                    <div>
                      <p className="text-sm font-medium text-primary">Accessibility</p>
                      <p className="text-xs text-secondary">Inclusive design for all users</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-2 h-2 w-2 rounded-full bg-purple-500"></div>
                    <div>
                      <p className="text-sm font-medium text-primary">Efficiency</p>
                      <p className="text-xs text-secondary">Streamlined user experience</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 p-6">
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                  <svg
                    className="h-6 w-6 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-primary">Government Standard Compliance</h3>
                  <p className="text-sm text-secondary">
                    Designed to meet government accessibility standards and professional
                    requirements for public administration systems.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MockAuthProvider>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Showcase of the brand identity elements and design principles used in the Header component.',
      },
    },
  },
};

// Header only view (isolated)
export const HeaderOnly: Story = {
  render: () => (
    <MockAuthProvider user={mockUser}>
      <Header />
    </MockAuthProvider>
  ),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Header component in isolation, showing just the header bar without page content.',
      },
    },
  },
};

// Dark theme compatibility
export const WithDarkBackground: Story = {
  render: () => (
    <MockAuthProvider user={mockUser}>
      <div className="min-h-screen bg-gray-900">
        <Header />
        <div className="p-8">
          <div className="mx-auto max-w-4xl text-white">
            <h1 className="mb-6 text-3xl font-bold">Dark Theme Compatibility</h1>
            <p className="mb-6 text-gray-300">
              The Header component works well with dark backgrounds and maintains good contrast and
              readability.
            </p>
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
              <h3 className="mb-3 font-semibold text-white">Theme Considerations</h3>
              <p className="text-sm text-gray-300">
                While the header uses design tokens that adapt to theme changes, the current
                implementation uses specific light theme styling. Future versions could include full
                dark mode support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MockAuthProvider>
  ),
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        story: 'Header component with dark background to test theme compatibility.',
      },
    },
  },
};
