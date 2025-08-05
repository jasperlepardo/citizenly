import type { Meta, StoryObj } from '@storybook/react'
import DashboardLayout from './DashboardLayout'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { useState } from 'react'

const meta = {
  title: 'Templates/DashboardLayout',
  component: DashboardLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A comprehensive dashboard layout template for the RBI System. Includes sidebar navigation, search functionality, user profile management, and responsive design. Provides the main layout structure for all dashboard pages with consistent navigation and user interface elements.'
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
  tags: ['autodocs'],
  argTypes: {
    searchTerm: {
      control: 'text'
    }
  }
} satisfies Meta<typeof DashboardLayout>

export default meta
type Story = StoryObj<typeof meta>

// Sample dashboard content
const SampleDashboardContent = () => (
  <div className="p-6 space-y-6">
    <div className="mb-8">
      <h1 className="font-montserrat font-semibold text-2xl text-primary">
        Dashboard Overview
      </h1>
      <p className="mt-1 text-secondary font-montserrat">
        Welcome to the RBI System dashboard
      </p>
    </div>

    {/* Statistics Cards */}
    <div className="grid grid-cols-4 gap-6">
      <div className="bg-surface rounded-lg border border-default p-6">
        <div className="font-montserrat font-medium text-sm text-secondary mb-2">Residents</div>
        <div className="font-montserrat font-bold text-4xl text-primary">1,247</div>
        <div className="flex items-center text-sm mt-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 mr-2"></div>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">+12%</span>
        </div>
      </div>

      <div className="bg-surface rounded-lg border border-default p-6">
        <div className="font-montserrat font-medium text-sm text-secondary mb-2">Households</div>
        <div className="font-montserrat font-bold text-4xl text-primary">342</div>
        <div className="flex items-center text-sm mt-2">
          <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
          <span className="text-blue-600 dark:text-blue-400 font-medium">+8%</span>
        </div>
      </div>

      <div className="bg-surface rounded-lg border border-default p-6">
        <div className="font-montserrat font-medium text-sm text-secondary mb-2">Certifications</div>
        <div className="font-montserrat font-bold text-4xl text-primary">89</div>
        <div className="flex items-center text-sm mt-2">
          <div className="h-2 w-2 rounded-full bg-purple-500 mr-2"></div>
          <span className="text-purple-600 dark:text-purple-400 font-medium">+15%</span>
        </div>
      </div>

      <div className="bg-surface rounded-lg border border-default p-6">
        <div className="font-montserrat font-medium text-sm text-secondary mb-2">Reports</div>
        <div className="font-montserrat font-bold text-4xl text-primary">23</div>
        <div className="flex items-center text-sm mt-2">
          <div className="h-2 w-2 rounded-full bg-orange-500 mr-2"></div>
          <span className="text-orange-600 dark:text-orange-400 font-medium">+5%</span>
        </div>
      </div>
    </div>

    {/* Recent Activity */}
    <div className="bg-surface rounded-lg border border-default p-6">
      <h3 class="font-montserrat font-semibold text-lg text-primary mb-4">Recent Activity</h3>
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
          <span className="text-sm text-primary">Certificate issued: Barangay Clearance</span>
          <span className="text-xs text-secondary ml-auto">1 day ago</span>
        </div>
      </div>
    </div>
  </div>
)

const SampleResidentsContent = () => (
  <div className="p-6 space-y-6">
    <div className="mb-8">
      <h1 className="font-montserrat font-semibold text-2xl text-primary">
        Residents Management
      </h1>
      <p className="mt-1 text-secondary font-montserrat">
        Manage resident information and records
      </p>
    </div>

    <div className="bg-surface rounded-lg border border-default">
      <div className="p-6 border-b border-default">
        <div className="flex items-center justify-between">
          <h3 className="font-montserrat font-semibold text-lg text-primary">All Residents</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Add New Resident
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {[
            { name: 'Juan Dela Cruz', email: 'juan@example.com', status: 'Active' },
            { name: 'Maria Santos', email: 'maria@example.com', status: 'Active' },
            { name: 'Jose Rizal', email: 'jose@example.com', status: 'Inactive' }
          ].map((resident, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-background rounded border border-default">
              <div>
                <div className="font-medium text-primary">{resident.name}</div>
                <div className="text-sm text-secondary">{resident.email}</div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                resident.status === 'Active' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                {resident.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

export const Default: Story = {
  args: {
    children: <SampleDashboardContent />
  }
}

export const WithSearchTerm: Story = {
  args: {
    children: <SampleDashboardContent />,
    searchTerm: 'residents',
    onSearchChange: (value) => console.log('Search changed:', value)
  }
}

export const ResidentsPage: Story = {
  args: {
    children: <SampleResidentsContent />
  }
}

// Interactive example with search
export const Interactive: Story = {
  render: () => {
    const [searchTerm, setSearchTerm] = useState('')

    return (
      <DashboardLayout
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      >
        <div className="p-6 space-y-6">
          <div className="mb-8">
            <h1 className="font-montserrat font-semibold text-2xl text-primary">
              Interactive Dashboard
            </h1>
            <p className="mt-1 text-secondary font-montserrat">
              Try using the search functionality and navigation
            </p>
          </div>

          {searchTerm && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Search Results</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Showing results for: "<strong>{searchTerm}</strong>"
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-surface rounded-lg border border-default p-6">
              <h3 className="font-semibold text-primary mb-2">Navigation</h3>
              <p className="text-sm text-secondary">
                Use the sidebar to navigate between different sections of the RBI System.
              </p>
            </div>
            
            <div className="bg-surface rounded-lg border border-default p-6">
              <h3 className="font-semibold text-primary mb-2">Search</h3>
              <p className="text-sm text-secondary">
                The global search bar allows you to quickly find residents, households, and other data.
              </p>
            </div>
            
            <div className="bg-surface rounded-lg border border-default p-6">
              <h3 className="font-semibold text-primary mb-2">User Profile</h3>
              <p className="text-sm text-secondary">
                Click on your profile in the top right to access settings and account information.
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }
}

// Different page content examples
export const DifferentPages: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState<'dashboard' | 'residents' | 'reports'>('dashboard')

    const renderContent = () => {
      switch (currentPage) {
        case 'dashboard':
          return <SampleDashboardContent />
        case 'residents':
          return <SampleResidentsContent />
        case 'reports':
          return (
            <div className="p-6 space-y-6">
              <div className="mb-8">
                <h1 className="font-montserrat font-semibold text-2xl text-primary">
                  Reports & Analytics
                </h1>
                <p className="mt-1 text-secondary font-montserrat">
                  Generate and view system reports
                </p>
              </div>
              <div className="bg-surface rounded-lg border border-default p-6">
                <h3 className="font-semibold text-primary mb-4">Available Reports</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-default rounded">
                    <h4 className="font-medium text-primary">Demographics Report</h4>
                    <p className="text-sm text-secondary mt-1">Population statistics and demographics</p>
                  </div>
                  <div className="p-4 border border-default rounded">
                    <h4 className="font-medium text-primary">Monthly Activity</h4>
                    <p className="text-sm text-secondary mt-1">Monthly system activity summary</p>
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
          <h3 className="font-semibold text-primary mb-2">Page Content Demo</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`px-3 py-1 text-sm rounded ${
                currentPage === 'dashboard' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-surface text-primary hover:bg-surface-hover'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentPage('residents')}
              className={`px-3 py-1 text-sm rounded ${
                currentPage === 'residents' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-surface text-primary hover:bg-surface-hover'
              }`}
            >
              Residents
            </button>
            <button
              onClick={() => setCurrentPage('reports')}
              className={`px-3 py-1 text-sm rounded ${
                currentPage === 'reports' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-surface text-primary hover:bg-surface-hover'
              }`}
            >
              Reports
            </button>
          </div>
        </div>
        
        <DashboardLayout>
          {renderContent()}
        </DashboardLayout>
      </div>
    )
  }
}

// Features showcase
export const FeaturesShowcase: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="bg-background p-6 border border-default rounded-lg">
        <h3 className="font-semibold text-primary mb-4">DashboardLayout Features</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-primary mb-2">Navigation</h4>
            <ul className="text-sm text-secondary space-y-1">
              <li>• Fixed sidebar with unified navigation</li>
              <li>• Active state management</li>
              <li>• Responsive navigation menu</li>
              <li>• Consistent navigation across all pages</li>
              <li>• Icon and text-based menu items</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-primary mb-2">Search Functionality</h4>
            <ul className="text-sm text-secondary space-y-1">
              <li>• Global search bar integration</li>
              <li>• Real-time search input handling</li>
              <li>• Search term state management</li>
              <li>• Clear button functionality</li>
              <li>• Search action triggers</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-primary mb-2">User Management</h4>
            <ul className="text-sm text-secondary space-y-1">
              <li>• User profile dropdown</li>
              <li>• Barangay assignment display</li>
              <li>• Role-based information</li>
              <li>• Quick logout functionality</li>
              <li>• Settings access</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-primary mb-2">Layout Structure</h4>
            <ul className="text-sm text-secondary space-y-1">
              <li>• Fixed sidebar layout</li>
              <li>• Responsive main content area</li>
              <li>• Consistent header across pages</li>
              <li>• Theme-aware styling</li>
              <li>• Proper content spacing</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Usage Notes</h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            This layout template provides the foundation for all dashboard pages in the RBI System. 
            It includes authentication context, navigation state management, and consistent UI patterns 
            that ensure a unified user experience across the application.
          </p>
        </div>
      </div>
      
      <DashboardLayout>
        <SampleDashboardContent />
      </DashboardLayout>
    </div>
  )
}