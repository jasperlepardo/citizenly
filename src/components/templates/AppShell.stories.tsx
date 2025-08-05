import type { Meta, StoryObj } from '@storybook/react'
import AppShell from './AppShell'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { useState } from 'react'

const meta = {
  title: 'Templates/AppShell',
  component: AppShell,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A comprehensive application shell template for the RBI System. Features responsive sidebar navigation, mobile-first design, advanced search functionality, notifications, and user profile management. Provides the foundational layout structure with modern UI patterns and accessibility features.'
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
} satisfies Meta<typeof AppShell>

export default meta
type Story = StoryObj<typeof meta>

// Sample dashboard content
const SampleDashboardContent = () => (
  <div className="space-y-8">
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-primary">
        RBI System Dashboard
      </h1>
      <p className="mt-2 text-lg text-secondary">
        Welcome to the Records and Barangay Information System
      </p>
    </div>

    {/* Quick stats */}
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <div className="overflow-hidden rounded-2xl bg-surface shadow-lg border border-default">
        <div className="p-6">
          <dt className="truncate text-sm font-medium text-secondary">Total Residents</dt>
          <dd className="mt-2 text-3xl font-bold text-primary">1,247</dd>
        </div>
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3">
          <div className="text-sm text-white">
            <span className="font-medium">+12%</span> from last month
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-surface shadow-lg border border-default">
        <div className="p-6">
          <dt className="truncate text-sm font-medium text-secondary">Households</dt>
          <dd className="mt-2 text-3xl font-bold text-primary">342</dd>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3">
          <div className="text-sm text-white">
            <span className="font-medium">+8%</span> from last month
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-surface shadow-lg border border-default">
        <div className="p-6">
          <dt className="truncate text-sm font-medium text-secondary">Certifications</dt>
          <dd className="mt-2 text-3xl font-bold text-primary">89</dd>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-orange-600 px-6 py-3">
          <div className="text-sm text-white">
            <span className="font-medium">+15%</span> from last month
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-surface shadow-lg border border-default">
        <div className="p-6">
          <dt className="truncate text-sm font-medium text-secondary">Active Users</dt>
          <dd className="mt-2 text-3xl font-bold text-primary">23</dd>
        </div>
        <div className="bg-gradient-to-r from-pink-500 to-rose-600 px-6 py-3">
          <div className="text-sm text-white">
            <span className="font-medium">+5%</span> from last month
          </div>
        </div>
      </div>
    </div>

    {/* Recent activity */}
    <div className="bg-surface rounded-2xl shadow-lg border border-default">
      <div className="px-6 py-5 border-b border-default">
        <h3 className="text-lg font-medium text-primary">Recent Activity</h3>
      </div>
      <div className="divide-y divide-default">
        {[
          { action: 'New resident registered', name: 'Maria Santos', time: '2 hours ago', type: 'user' },
          { action: 'Household updated', name: 'Cruz Family', time: '4 hours ago', type: 'home' },
          { action: 'Certificate issued', name: 'Barangay Clearance', time: '1 day ago', type: 'document' },
          { action: 'Report generated', name: 'Monthly Statistics', time: '2 days ago', type: 'chart' }
        ].map((item, index) => (
          <div key={index} className="px-6 py-4 flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {item.type === 'user' ? 'U' : item.type === 'home' ? 'H' : item.type === 'document' ? 'D' : 'C'}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary truncate">
                {item.action}: {item.name}
              </p>
              <p className="text-sm text-secondary">
                {item.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

const SampleResidentsContent = () => (
  <div className="space-y-8">
    <div className="sm:flex sm:items-center">
      <div className="sm:flex-auto">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Residents</h1>
        <p className="mt-2 text-lg text-secondary">
          Manage resident information and records
        </p>
      </div>
      <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
        <button
          type="button"
          className="block rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-center text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Add Resident
        </button>
      </div>
    </div>

    <div className="bg-surface shadow-lg rounded-2xl border border-default">
      <div className="px-6 py-5 border-b border-default">
        <h3 className="text-lg font-medium text-primary">All Residents</h3>
      </div>
      <div className="divide-y divide-default">
        {[
          { name: 'Juan Dela Cruz', email: 'juan@example.com', status: 'Active', address: 'Purok 1, Brgy. San Jose' },
          { name: 'Maria Santos', email: 'maria@example.com', status: 'Active', address: 'Purok 2, Brgy. San Jose' },
          { name: 'Jose Rizal', email: 'jose@example.com', status: 'Inactive', address: 'Purok 3, Brgy. San Jose' },
          { name: 'Ana Dela Cruz', email: 'ana@example.com', status: 'Active', address: 'Purok 1, Brgy. San Jose' }
        ].map((resident, index) => (
          <div key={index} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {resident.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-primary">{resident.name}</p>
                  <p className="text-sm text-secondary">{resident.email}</p>
                  <p className="text-xs text-muted">{resident.address}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                resident.status === 'Active' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                {resident.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

export const Default: Story = {
  args: {
    children: <SampleDashboardContent />
  }
}

export const ResidentsPage: Story = {
  args: {
    children: <SampleResidentsContent />
  }
}

// Interactive responsive demo
export const ResponsiveDemo: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState<'dashboard' | 'residents'>('dashboard')

    return (
      <div className="space-y-4">
        <div className="bg-background p-4 border-b border-default">
          <h3 className="font-semibold text-primary mb-2">Responsive Layout Demo</h3>
          <p className="text-sm text-secondary mb-3">
            This shell adapts to different screen sizes. Try resizing your browser window to see the mobile sidebar in action.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                currentPage === 'dashboard' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-surface text-primary hover:bg-surface-hover'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentPage('residents')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                currentPage === 'residents' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-surface text-primary hover:bg-surface-hover'
              }`}
            >
              Residents
            </button>
          </div>
        </div>
        
        <AppShell>
          {currentPage === 'dashboard' ? <SampleDashboardContent /> : <SampleResidentsContent />}
        </AppShell>
      </div>
    )
  }
}

// Features showcase
export const FeaturesShowcase: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="bg-background p-6 border border-default rounded-lg">
        <h3 className="font-semibold text-primary mb-4">AppShell Features</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-primary mb-2">Responsive Design</h4>
            <ul className="text-sm text-secondary space-y-1">
              <li>• Mobile-first approach with adaptive layouts</li>
              <li>• Collapsible sidebar for mobile devices</li>
              <li>• Touch-friendly interface elements</li>
              <li>• Optimized for all screen sizes</li>
              <li>• Progressive enhancement patterns</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-primary mb-2">Navigation System</h4>
            <ul className="text-sm text-secondary space-y-1">
              <li>• Unified navigation component integration</li>
              <li>• Persistent sidebar for desktop</li>
              <li>• Mobile overlay with backdrop</li>
              <li>• Keyboard navigation support</li>
              <li>• Accessibility compliant</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-primary mb-2">Advanced UI Elements</h4>
            <ul className="text-sm text-secondary space-y-1">
              <li>• Gradient branding and visual hierarchy</li>
              <li>• Backdrop blur effects for modern appeal</li>
              <li>• Shadow and depth layering</li>
              <li>• Smooth transitions and animations</li>
              <li>• Consistent spacing and typography</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-primary mb-2">Functionality</h4>
            <ul className="text-sm text-secondary space-y-1">
              <li>• Global search with placeholder text</li>
              <li>• Notification system with badge counts</li>
              <li>• User profile management</li>
              <li>• Theme-aware color schemes</li>
              <li>• Content area with proper spacing</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Design Philosophy</h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            The AppShell template follows modern design principles with emphasis on accessibility, 
            performance, and user experience. It provides a consistent foundation for all RBI System 
            pages while maintaining flexibility for diverse content types and layouts.
          </p>
        </div>
      </div>
      
      <AppShell>
        <SampleDashboardContent />
      </AppShell>
    </div>
  )
}

// Layout variations
export const LayoutVariations: Story = {
  render: () => {
    const [currentLayout, setCurrentLayout] = useState<'dashboard' | 'list' | 'form'>('dashboard')

    const renderContent = () => {
      switch (currentLayout) {
        case 'dashboard':
          return <SampleDashboardContent />
        case 'list':
          return <SampleResidentsContent />
        case 'form':
          return (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Add New Resident</h1>
                <p className="mt-2 text-lg text-secondary">
                  Enter resident information and details
                </p>
              </div>

              <div className="bg-surface rounded-2xl shadow-lg border border-default">
                <div className="px-6 py-5 border-b border-default">
                  <h3 className="text-lg font-medium text-primary">Personal Information</h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">First Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-default rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">Last Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-default rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">Email Address</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-default rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button className="px-6 py-3 border border-default rounded-lg text-secondary hover:text-primary hover:bg-surface-hover transition-colors">
                      Cancel
                    </button>
                    <button className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                      Save Resident
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        default:
          return <SampleDashboardContent />
      }
    }

    return (
      <div className="space-y-4">
        <div className="bg-background p-4 border-b border-default">
          <h3 className="font-semibold text-primary mb-2">Layout Content Variations</h3>
          <p className="text-sm text-secondary mb-3">
            The AppShell template adapts to different content types while maintaining consistent navigation and structure.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentLayout('dashboard')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                currentLayout === 'dashboard' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-surface text-primary hover:bg-surface-hover'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentLayout('list')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                currentLayout === 'list' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-surface text-primary hover:bg-surface-hover'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setCurrentLayout('form')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                currentLayout === 'form' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-surface text-primary hover:bg-surface-hover'
              }`}
            >
              Form View
            </button>
          </div>
        </div>
        
        <AppShell>
          {renderContent()}
        </AppShell>
      </div>
    )
  }
}

// Mobile interaction demo
export const MobileDemo: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Mobile Interaction Demo</h3>
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          To see the mobile sidebar in action, resize your browser window to mobile width (&lt; 1024px) 
          or use your browser's responsive design mode. The hamburger menu will appear in the top bar, 
          and clicking it will show the mobile sidebar overlay.
        </p>
      </div>
      
      <AppShell>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">
              Mobile-First Design
            </h1>
            <p className="mt-2 text-lg text-secondary">
              This layout is optimized for mobile devices and scales up beautifully to desktop
            </p>
          </div>

          <div className="bg-surface rounded-2xl shadow-lg border border-default p-6">
            <h3 className="text-lg font-medium text-primary mb-4">Mobile Features</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-primary">Touch-Friendly Navigation</h4>
                  <p className="text-sm text-secondary">Hamburger menu for small screens with slide-out sidebar</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-primary">Responsive Search</h4>
                  <p className="text-sm text-secondary">Search bar adapts to available space</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-primary">Backdrop Overlay</h4>
                  <p className="text-sm text-secondary">Modal overlay with blur effect for focus</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </div>
  )
}