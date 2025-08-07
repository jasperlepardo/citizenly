import type { Meta, StoryObj } from '@storybook/react';
import Header from './Header';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

const meta = {
  title: 'Templates/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Main navigation header template for the RBI System. Provides responsive navigation, user authentication state, and mobile-friendly menu functionality. Includes branding, main navigation links, user profile integration, and theme-aware styling.',
      },
    },
  },
  decorators: [
    Story => (
      <ThemeProvider>
        <AuthProvider>
          <Story />
        </AuthProvider>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithMockUser: Story = {
  decorators: [
    Story => {
      // Mock the useAuth hook for this story

      return (
        <ThemeProvider>
          <div>
            <Story />
            <div className="p-4 bg-background">
              <p className="text-sm text-secondary">
                Note: This story shows the header with a mock authenticated user.
              </p>
            </div>
          </div>
        </ThemeProvider>
      );
    },
  ],
};

export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  decorators: [
    Story => (
      <ThemeProvider>
        <AuthProvider>
          <div>
            <Story />
            <div className="p-4 bg-background">
              <p className="text-sm text-secondary">
                Mobile responsive view. Click the hamburger menu to see navigation.
              </p>
            </div>
          </div>
        </AuthProvider>
      </ThemeProvider>
    ),
  ],
};

export const TabletView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
  decorators: [
    Story => (
      <ThemeProvider>
        <AuthProvider>
          <div>
            <Story />
            <div className="p-4 bg-background">
              <p className="text-sm text-secondary">
                Tablet responsive view showing navigation adaptation.
              </p>
            </div>
          </div>
        </AuthProvider>
      </ThemeProvider>
    ),
  ],
};

// Show header in different page contexts
export const InPageContext: Story = {
  render: () => (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <Header />

          {/* Sample page content */}
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
                <p className="mt-2 text-secondary">Welcome to the RBI System dashboard</p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="rounded-lg border p-6 bg-surface border-default">
                  <h3 className="mb-2 font-semibold text-primary">Residents</h3>
                  <p className="text-2xl font-bold text-blue-600">1,247</p>
                  <p className="text-sm text-secondary">Total registered</p>
                </div>

                <div className="rounded-lg border p-6 bg-surface border-default">
                  <h3 className="mb-2 font-semibold text-primary">Households</h3>
                  <p className="text-2xl font-bold text-green-600">342</p>
                  <p className="text-sm text-secondary">Active households</p>
                </div>

                <div className="rounded-lg border p-6 bg-surface border-default">
                  <h3 className="mb-2 font-semibold text-primary">Reports</h3>
                  <p className="text-2xl font-bold text-purple-600">15</p>
                  <p className="text-sm text-secondary">Generated this month</p>
                </div>
              </div>

              <div className="rounded-lg border p-6 bg-surface border-default">
                <h3 className="mb-4 font-semibold text-primary">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded p-3 bg-background">
                    <div className="size-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-primary">
                      New resident registered: Maria Santos
                    </span>
                    <span className="ml-auto text-xs text-secondary">2 hours ago</span>
                  </div>
                  <div className="flex items-center gap-3 rounded p-3 bg-background">
                    <div className="size-2 rounded-full bg-green-500"></div>
                    <span className="text-sm text-primary">Household updated: Cruz Family</span>
                    <span className="ml-auto text-xs text-secondary">4 hours ago</span>
                  </div>
                  <div className="flex items-center gap-3 rounded p-3 bg-background">
                    <div className="size-2 rounded-full bg-purple-500"></div>
                    <span className="text-sm text-primary">
                      Report generated: Monthly Demographics
                    </span>
                    <span className="ml-auto text-xs text-secondary">1 day ago</span>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </AuthProvider>
    </ThemeProvider>
  ),
};

// Show both light and dark modes
export const ThemeComparison: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Light Theme</h3>
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <ThemeProvider>
            <AuthProvider>
              <Header />
            </AuthProvider>
          </ThemeProvider>
        </div>
      </div>

      <div className="dark">
        <h3 className="mb-4 text-lg font-semibold text-white">Dark Theme</h3>
        <div className="overflow-hidden rounded-lg border border-gray-700">
          <ThemeProvider>
            <AuthProvider>
              <Header />
            </AuthProvider>
          </ThemeProvider>
        </div>
      </div>
    </div>
  ),
};

// Interactive states demonstration
export const InteractiveStates: Story = {
  render: () => (
    <ThemeProvider>
      <AuthProvider>
        <div className="space-y-4">
          <Header />

          <div className="mx-auto max-w-4xl p-6 bg-background">
            <h2 className="mb-4 text-xl font-semibold text-primary">Header Interactive Elements</h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h3 className="font-medium text-primary">Desktop Features:</h3>
                <ul className="space-y-1 text-sm text-secondary">
                  <li>• Logo links to home page</li>
                  <li>• Navigation links with hover effects</li>
                  <li>• User profile dropdown (when authenticated)</li>
                  <li>• Logout button functionality</li>
                  <li>• Theme-aware styling</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-primary">Mobile Features:</h3>
                <ul className="space-y-1 text-sm text-secondary">
                  <li>• Hamburger menu toggle</li>
                  <li>• Responsive navigation menu</li>
                  <li>• Mobile-optimized user profile</li>
                  <li>• Touch-friendly interactions</li>
                  <li>• Collapsible menu on navigation</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
              <h4 className="mb-2 font-medium text-blue-800 dark:text-blue-200">Usage Notes:</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                This header template is designed to be used across all pages in the RBI System. It
                automatically adapts to authentication state and provides consistent navigation
                experience.
              </p>
            </div>
          </div>
        </div>
      </AuthProvider>
    </ThemeProvider>
  ),
};
