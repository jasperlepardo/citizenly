import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Sidebar from './Sidebar';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

const meta = {
  title: 'Templates/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A responsive sidebar navigation template for the RBI System. Features mobile overlay with backdrop, desktop fixed positioning, unified navigation integration, and consistent branding. Designed to work seamlessly across all device sizes with proper accessibility support.',
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
  argTypes: {
    sidebarOpen: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DesktopClosed: Story = {
  args: {
    sidebarOpen: false,
    setSidebarOpen: () => console.log('Toggle sidebar'),
  },
};

export const MobileOpen: Story = {
  args: {
    sidebarOpen: true,
    setSidebarOpen: () => console.log('Toggle sidebar'),
  },
};

// Interactive sidebar demo
const InteractiveComponent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Demo control panel */}
      <div className="relative z-60 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 p-4">
        <div className="max-w-4xl mx-auto">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Interactive Sidebar Demo
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
            Toggle the sidebar to see both mobile overlay and desktop fixed positioning modes.
          </p>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 rounded-lg border border-yellow-300 dark:border-yellow-700 transition-colors text-sm font-medium"
          >
            {sidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
          </button>
        </div>
      </div>

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content area to show layout */}
      <div className="lg:pl-72">
        <div className="p-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-primary">Sidebar Template Demo</h1>
              <p className="mt-2 text-lg text-secondary">
                This demonstrates the sidebar navigation in action
              </p>
            </div>

            <div className="bg-surface rounded-lg border border-default p-6">
              <h3 className="font-semibold text-primary mb-4">Sidebar States</h3>
              <div className="space-y-3 text-sm text-secondary">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${sidebarOpen ? 'bg-green-500' : 'bg-gray-400'}`}
                  ></span>
                  <span>Mobile Overlay: {sidebarOpen ? 'Open' : 'Closed'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>Desktop Fixed: Always visible on lg+ screens</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface rounded-lg border border-default p-6">
                <h4 className="font-medium text-primary mb-2">Mobile Behavior</h4>
                <ul className="text-sm text-secondary space-y-1">
                  <li>• Overlay with backdrop on small screens</li>
                  <li>• Touch-friendly close button</li>
                  <li>• Swipe to close (via backdrop)</li>
                  <li>• Slides in from left side</li>
                </ul>
              </div>

              <div className="bg-surface rounded-lg border border-default p-6">
                <h4 className="font-medium text-primary mb-2">Desktop Behavior</h4>
                <ul className="text-sm text-secondary space-y-1">
                  <li>• Fixed positioning on large screens</li>
                  <li>• Always visible navigation</li>
                  <li>• Dedicated screen space</li>
                  <li>• Pushes content to the right</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Interactive: Story = {
  render: InteractiveComponent,
};

// Responsive behavior showcase
const ResponsiveShowcaseComponent = () => {
  const [currentView, setCurrentView] = useState<'mobile' | 'desktop'>('desktop');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-background rounded-lg border border-default p-6">
        <h3 className="font-semibold text-primary mb-4">Responsive Behavior</h3>
        <p className="text-secondary mb-4">
          The sidebar adapts its behavior based on screen size. Switch between views to see the
          differences.
        </p>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              setCurrentView('mobile');
              setSidebarOpen(true);
            }}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              currentView === 'mobile'
                ? 'bg-blue-600 text-white'
                : 'bg-surface text-primary hover:bg-surface-hover'
            }`}
          >
            Mobile View
          </button>
          <button
            onClick={() => {
              setCurrentView('desktop');
              setSidebarOpen(false);
            }}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              currentView === 'desktop'
                ? 'bg-blue-600 text-white'
                : 'bg-surface text-primary hover:bg-surface-hover'
            }`}
          >
            Desktop View
          </button>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
            Current View: {currentView.charAt(0).toUpperCase() + currentView.slice(1)}
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {currentView === 'mobile'
              ? 'Sidebar appears as an overlay with backdrop blur. Clicking outside or the close button dismisses it.'
              : 'Sidebar is fixed in position and always visible. Content area automatically adjusts with left padding.'}
          </p>
        </div>
      </div>

      <div
        className={`${currentView === 'mobile' ? 'max-w-sm' : 'w-full'} border-2 border-dashed border-gray-300 rounded-lg overflow-hidden`}
      >
        <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 text-xs text-gray-600 dark:text-gray-400 font-mono">
          {currentView === 'mobile' ? 'Mobile View (&lt; 1024px)' : 'Desktop View (&gt;= 1024px)'}
        </div>

        <div className="min-h-96 bg-background relative">
          <Sidebar
            sidebarOpen={currentView === 'mobile' ? sidebarOpen : false}
            setSidebarOpen={setSidebarOpen}
          />

          <div className={currentView === 'desktop' ? 'lg:pl-72' : ''}>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-primary mb-2">Main Content Area</h2>
              <p className="text-secondary">
                This area contains the main application content. Notice how it shifts when the
                sidebar is present.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ResponsiveShowcase: Story = {
  render: ResponsiveShowcaseComponent,
};

// Features demonstration
const FeaturesDemoComponent = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-background rounded-lg border border-default p-6">
        <h3 className="font-semibold text-primary mb-4">Sidebar Template Features</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-primary mb-2">Responsive Design</h4>
            <ul className="text-sm text-secondary space-y-1">
              <li>• Mobile overlay with backdrop</li>
              <li>• Desktop fixed positioning</li>
              <li>• Automatic breakpoint detection</li>
              <li>• Touch-friendly interactions</li>
              <li>• Smooth transitions</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-primary mb-2">Navigation Integration</h4>
            <ul className="text-sm text-secondary space-y-1">
              <li>• Unified Navigation component</li>
              <li>• Consistent menu structure</li>
              <li>• Active state management</li>
              <li>• Icon and text labels</li>
              <li>• Hierarchical organization</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-primary mb-2">Branding Elements</h4>
            <ul className="text-sm text-secondary space-y-1">
              <li>• RBI System logo and title</li>
              <li>• Consistent brand colors</li>
              <li>• Professional appearance</li>
              <li>• Scalable typography</li>
              <li>• Theme-aware styling</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-primary mb-2">Accessibility</h4>
            <ul className="text-sm text-secondary space-y-1">
              <li>• Screen reader support</li>
              <li>• Keyboard navigation</li>
              <li>• Focus management</li>
              <li>• ARIA labels and roles</li>
              <li>• Color contrast compliance</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Usage Pattern</h4>
          <p className="text-sm text-green-700 dark:text-green-300">
            This sidebar template is designed to be used within application shells and page layouts.
            It automatically handles responsive behavior and provides a consistent navigation
            experience across all pages of the RBI System.
          </p>
        </div>
      </div>

      <div className="bg-background rounded-lg border border-default p-6">
        <h3 className="font-semibold text-primary mb-4">Mobile Interaction Demo</h3>
        <p className="text-secondary mb-4">
          Click the button below to simulate mobile sidebar interaction:
        </p>

        <button
          onClick={() => setMobileOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Open Mobile Sidebar
        </button>
      </div>

      <div className="min-h-96 bg-background border border-default rounded-lg overflow-hidden relative">
        <Sidebar sidebarOpen={mobileOpen} setSidebarOpen={setMobileOpen} />

        <div className="lg:pl-72 p-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">Sample Page Content</h2>
            <p className="text-secondary">
              This demonstrates how the sidebar integrates with page content. The sidebar pushes
              content to the right on desktop and overlays on mobile.
            </p>

            <div className="bg-surface rounded-lg border border-default p-4">
              <h3 className="font-medium text-primary mb-2">Content Layout</h3>
              <p className="text-sm text-secondary">
                Content automatically adjusts to account for the sidebar width on desktop viewports.
                On mobile, content remains full-width with the sidebar appearing as an overlay when
                opened.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FeaturesDemo: Story = {
  render: FeaturesDemoComponent,
};

// State management demo
const StateManagementComponent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [interactions, setInteractions] = useState<string[]>([]);

  const logInteraction = (action: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setInteractions(prev => [...prev.slice(-4), `${timestamp}: ${action}`]);
  };

  const handleToggle = (open: boolean) => {
    setSidebarOpen(open);
    logInteraction(open ? 'Sidebar opened' : 'Sidebar closed');
  };

  return (
    <div className="space-y-6">
      <div className="bg-background rounded-lg border border-default p-6">
        <h3 className="font-semibold text-primary mb-4">State Management Demo</h3>
        <p className="text-secondary mb-4">
          This demonstrates how the sidebar state can be controlled programmatically and how
          interactions are tracked.
        </p>

        <div className="flex gap-3 mb-4">
          <button
            onClick={() => handleToggle(true)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Open Sidebar
          </button>
          <button
            onClick={() => handleToggle(false)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Close Sidebar
          </button>
          <button
            onClick={() => setInteractions([])}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Clear Log
          </button>
        </div>

        {interactions.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Interaction Log:</h4>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 font-mono">
              {interactions.map((interaction, index) => (
                <li key={index}>• {interaction}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="min-h-96 bg-background border border-default rounded-lg overflow-hidden relative">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={handleToggle} />

        <div className="lg:pl-72 p-6">
          <div className="bg-surface rounded-lg border border-default p-6">
            <h2 className="text-xl font-semibold text-primary mb-4">Current State</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${sidebarOpen ? 'bg-green-500' : 'bg-red-500'}`}
                ></span>
                <span className="text-secondary">
                  Sidebar is currently{' '}
                  <strong className="text-primary">{sidebarOpen ? 'open' : 'closed'}</strong>
                </span>
              </div>
              <div className="text-sm text-secondary">
                Total interactions logged:{' '}
                <strong className="text-primary">{interactions.length}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const StateManagement: Story = {
  render: StateManagementComponent,
};
