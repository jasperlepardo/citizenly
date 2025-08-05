import type { Meta, StoryObj } from '@storybook/react'
import Header from './Header'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'

const meta = {
  title: 'Templates/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Main navigation header template for the RBI System. Provides responsive navigation, user authentication state, and mobile-friendly menu functionality. Includes branding, main navigation links, user profile integration, and theme-aware styling.'
      }
    }
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <AuthProvider>
          <Story />
        </AuthProvider>
      </ThemeProvider>
    )
  ],
  tags: ['autodocs']
} satisfies Meta<typeof Header>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithMockUser: Story = {
  decorators: [
    (Story) => {
      // Mock the useAuth hook for this story
      const mockUser = {
        id: '1',
        email: 'juan.delacruz@rbi.gov.ph',
        user_metadata: {
          first_name: 'Juan',
          last_name: 'Dela Cruz'
        }
      }
      
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
      )
    }
  ]
}

export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    }
  },
  decorators: [
    (Story) => (
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
    )
  ]
}

export const TabletView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet'
    }
  },
  decorators: [
    (Story) => (
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
    )
  ]
}

// Show header in different page contexts
export const InPageContext: Story = {
  render: () => (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <Header />
          
          {/* Sample page content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
                <p className="mt-2 text-secondary">Welcome to the RBI System dashboard</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface border border-default rounded-lg p-6">
                  <h3 className="font-semibold text-primary mb-2">Residents</h3>
                  <p className="text-2xl font-bold text-blue-600">1,247</p>
                  <p className="text-sm text-secondary">Total registered</p>
                </div>
                
                <div className="bg-surface border border-default rounded-lg p-6">
                  <h3 className="font-semibold text-primary mb-2">Households</h3>
                  <p className="text-2xl font-bold text-green-600">342</p>
                  <p className="text-sm text-secondary">Active households</p>
                </div>
                
                <div className="bg-surface border border-default rounded-lg p-6">
                  <h3 className="font-semibold text-primary mb-2">Reports</h3>
                  <p className="text-2xl font-bold text-purple-600">15</p>
                  <p className="text-sm text-secondary">Generated this month</p>
                </div>
              </div>
              
              <div className="bg-surface border border-default rounded-lg p-6">
                <h3 className="font-semibold text-primary mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-background rounded">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-primary">New resident registered: Maria Santos</span>
                    <span className="text-xs text-secondary ml-auto">2 hours ago</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-background rounded">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-primary">Household updated: Cruz Family</span>
                    <span className="text-xs text-secondary ml-auto">4 hours ago</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-background rounded">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-primary">Report generated: Monthly Demographics</span>
                    <span className="text-xs text-secondary ml-auto">1 day ago</span>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}

// Show both light and dark modes
export const ThemeComparison: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Light Theme</h3>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <ThemeProvider>
            <AuthProvider>
              <Header />
            </AuthProvider>
          </ThemeProvider>
        </div>
      </div>
      
      <div className="dark">
        <h3 className="text-lg font-semibold mb-4 text-white">Dark Theme</h3>
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <ThemeProvider>
            <AuthProvider>
              <Header />
            </AuthProvider>
          </ThemeProvider>
        </div>
      </div>
    </div>
  )
}

// Interactive states demonstration
export const InteractiveStates: Story = {
  render: () => (
    <ThemeProvider>
      <AuthProvider>
        <div className="space-y-4">
          <Header />
          
          <div className="max-w-4xl mx-auto p-6 bg-background">
            <h2 className="text-xl font-semibold text-primary mb-4">Header Interactive Elements</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-medium text-primary">Desktop Features:</h3>
                <ul className="text-sm text-secondary space-y-1">
                  <li>• Logo links to home page</li>
                  <li>• Navigation links with hover effects</li>
                  <li>• User profile dropdown (when authenticated)</li>
                  <li>• Logout button functionality</li>
                  <li>• Theme-aware styling</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-medium text-primary">Mobile Features:</h3>
                <ul className="text-sm text-secondary space-y-1">
                  <li>• Hamburger menu toggle</li>
                  <li>• Responsive navigation menu</li>
                  <li>• Mobile-optimized user profile</li>
                  <li>• Touch-friendly interactions</li>
                  <li>• Collapsible menu on navigation</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Usage Notes:</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                This header template is designed to be used across all pages in the RBI System. 
                It automatically adapts to authentication state and provides consistent navigation experience.
              </p>
            </div>
          </div>
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}