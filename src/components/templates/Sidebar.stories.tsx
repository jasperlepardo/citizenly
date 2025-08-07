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
      <div className="z-60 relative border-b border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
        <div className="mx-auto max-w-4xl">
          <h3 className="mb-2 font-semibold text-yellow-800 dark:text-yellow-200">
            Interactive Sidebar Demo
          </h3>
          <p className="mb-3 text-sm text-yellow-700 dark:text-yellow-300">
            Toggle the sidebar to see both mobile overlay and desktop fixed positioning modes.
          </p>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg border border-yellow-300 bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-800 transition-colors hover:bg-yellow-200 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200 dark:hover:bg-yellow-900/50"
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

            <div className="rounded-lg border p-6 bg-surface border-default">
              <h3 className="mb-4 font-semibold text-primary">Sidebar States</h3>
              <div className="space-y-3 text-sm text-secondary">
                <div className="flex items-center gap-2">
                  <span
                    className={`size-2 rounded-full ${sidebarOpen ? 'bg-green-500' : 'bg-gray-400'}`}
                  ></span>
                  <span>Mobile Overlay: {sidebarOpen ? 'Open' : 'Closed'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-blue-500"></span>
                  <span>Desktop Fixed: Always visible on lg+ screens</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-lg border p-6 bg-surface border-default">
                <h4 className="mb-2 font-medium text-primary">Mobile Behavior</h4>
                <ul className="space-y-1 text-sm text-secondary">
                  <li>• Overlay with backdrop on small screens</li>
                  <li>• Touch-friendly close button</li>
                  <li>• Swipe to close (via backdrop)</li>
                  <li>• Slides in from left side</li>
                </ul>
              </div>

              <div className="rounded-lg border p-6 bg-surface border-default">
                <h4 className="mb-2 font-medium text-primary">Desktop Behavior</h4>
                <ul className="space-y-1 text-sm text-secondary">
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
      <div className="rounded-lg border p-6 bg-background border-default">
        <h3 className="mb-4 font-semibold text-primary">Responsive Behavior</h3>
        <p className="mb-4 text-secondary">
          The sidebar adapts its behavior based on screen size. Switch between views to see the
          differences.
        </p>

        <div className="mb-6 flex gap-2">
          <button
            onClick={() => {
              setCurrentView('mobile');
              setSidebarOpen(true);
            }}
            className={`rounded px-3 py-1 text-sm transition-colors ${
              currentView === 'mobile'
                ? 'bg-blue-600 text-white'
                : 'text-primary bg-surface hover:bg-surface-hover'
            }`}
          >
            Mobile View
          </button>
          <button
            onClick={() => {
              setCurrentView('desktop');
              setSidebarOpen(false);
            }}
            className={`rounded px-3 py-1 text-sm transition-colors ${
              currentView === 'desktop'
                ? 'bg-blue-600 text-white'
                : 'text-primary bg-surface hover:bg-surface-hover'
            }`}
          >
            Desktop View
          </button>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <h4 className="mb-2 font-medium text-blue-800 dark:text-blue-200">
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
        className={`${currentView === 'mobile' ? 'max-w-sm' : 'w-full'} overflow-hidden rounded-lg border-2 border-dashed border-gray-300`}
      >
        <div className="bg-gray-100 px-3 py-2 font-mono text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
          {currentView === 'mobile' ? 'Mobile View (&lt; 1024px)' : 'Desktop View (&gt;= 1024px)'}
        </div>

        <div className="relative min-h-96 bg-background">
          <Sidebar
            sidebarOpen={currentView === 'mobile' ? sidebarOpen : false}
            setSidebarOpen={setSidebarOpen}
          />

          <div className={currentView === 'desktop' ? 'lg:pl-72' : ''}>
            <div className="p-6">
              <h2 className="mb-2 text-xl font-semibold text-primary">Main Content Area</h2>
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
      <div className="rounded-lg border p-6 bg-background border-default">
        <h3 className="mb-4 font-semibold text-primary">Sidebar Template Features</h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-2 font-medium text-primary">Responsive Design</h4>
            <ul className="space-y-1 text-sm text-secondary">
              <li>• Mobile overlay with backdrop</li>
              <li>• Desktop fixed positioning</li>
              <li>• Automatic breakpoint detection</li>
              <li>• Touch-friendly interactions</li>
              <li>• Smooth transitions</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-2 font-medium text-primary">Navigation Integration</h4>
            <ul className="space-y-1 text-sm text-secondary">
              <li>• Unified Navigation component</li>
              <li>• Consistent menu structure</li>
              <li>• Active state management</li>
              <li>• Icon and text labels</li>
              <li>• Hierarchical organization</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-2 font-medium text-primary">Branding Elements</h4>
            <ul className="space-y-1 text-sm text-secondary">
              <li>• RBI System logo and title</li>
              <li>• Consistent brand colors</li>
              <li>• Professional appearance</li>
              <li>• Scalable typography</li>
              <li>• Theme-aware styling</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-2 font-medium text-primary">Accessibility</h4>
            <ul className="space-y-1 text-sm text-secondary">
              <li>• Screen reader support</li>
              <li>• Keyboard navigation</li>
              <li>• Focus management</li>
              <li>• ARIA labels and roles</li>
              <li>• Color contrast compliance</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <h4 className="mb-2 font-medium text-green-800 dark:text-green-200">Usage Pattern</h4>
          <p className="text-sm text-green-700 dark:text-green-300">
            This sidebar template is designed to be used within application shells and page layouts.
            It automatically handles responsive behavior and provides a consistent navigation
            experience across all pages of the RBI System.
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-6 bg-background border-default">
        <h3 className="mb-4 font-semibold text-primary">Mobile Interaction Demo</h3>
        <p className="mb-4 text-secondary">
          Click the button below to simulate mobile sidebar interaction:
        </p>

        <button
          onClick={() => setMobileOpen(true)}
          className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          Open Mobile Sidebar
        </button>
      </div>

      <div className="relative min-h-96 overflow-hidden rounded-lg border bg-background border-default">
        <Sidebar sidebarOpen={mobileOpen} setSidebarOpen={setMobileOpen} />

        <div className="p-6 lg:pl-72">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">Sample Page Content</h2>
            <p className="text-secondary">
              This demonstrates how the sidebar integrates with page content. The sidebar pushes
              content to the right on desktop and overlays on mobile.
            </p>

            <div className="rounded-lg border p-4 bg-surface border-default">
              <h3 className="mb-2 font-medium text-primary">Content Layout</h3>
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
      <div className="rounded-lg border p-6 bg-background border-default">
        <h3 className="mb-4 font-semibold text-primary">State Management Demo</h3>
        <p className="mb-4 text-secondary">
          This demonstrates how the sidebar state can be controlled programmatically and how
          interactions are tracked.
        </p>

        <div className="mb-4 flex gap-3">
          <button
            onClick={() => handleToggle(true)}
            className="rounded bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
          >
            Open Sidebar
          </button>
          <button
            onClick={() => handleToggle(false)}
            className="rounded bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
          >
            Close Sidebar
          </button>
          <button
            onClick={() => setInteractions([])}
            className="rounded bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
          >
            Clear Log
          </button>
        </div>

        {interactions.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/20">
            <h4 className="mb-2 font-medium text-gray-800 dark:text-gray-200">Interaction Log:</h4>
            <ul className="space-y-1 font-mono text-sm text-gray-700 dark:text-gray-300">
              {interactions.map((interaction, index) => (
                <li key={index}>• {interaction}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="relative min-h-96 overflow-hidden rounded-lg border bg-background border-default">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={handleToggle} />

        <div className="p-6 lg:pl-72">
          <div className="rounded-lg border p-6 bg-surface border-default">
            <h2 className="mb-4 text-xl font-semibold text-primary">Current State</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span
                  className={`size-3 rounded-full ${sidebarOpen ? 'bg-green-500' : 'bg-red-500'}`}
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
