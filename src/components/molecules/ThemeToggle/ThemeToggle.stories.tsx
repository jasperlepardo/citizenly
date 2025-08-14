import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';

// Mock ThemeContext for Storybook
const MockThemeProvider = ({
  children,
  initialTheme = 'system',
}: {
  children: React.ReactNode;
  initialTheme?: 'light' | 'dark' | 'system';
}) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(initialTheme);
  const [systemTheme] = useState<'light' | 'dark'>('light');

  const actualTheme = theme === 'system' ? systemTheme : theme;

  const toggleTheme = () => {
    setTheme(current => {
      if (current === 'light') return 'dark';
      if (current === 'dark') return 'system';
      return 'light';
    });
  };

  // Mock context value
  const contextValue = {
    theme,
    actualTheme,
    toggleTheme,
    setTheme,
  };

  return (
    <div className={actualTheme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-white p-4 text-gray-900 dark:bg-gray-900 dark:text-white">
        {/* Provide mock context via global variable for component to use */}
        {React.Children.map(children, child =>
          React.isValidElement(child) && child.type === ThemeToggle
            ? React.cloneElement(child as React.ReactElement<any>, {
                onClick: () => {
                  child.props.onClick?.();
                  toggleTheme();
                },
              })
            : child
        )}
      </div>
    </div>
  );
};

// Note: This story requires the ThemeContext implementation
const meta = {
  title: 'Molecules/ThemeToggle',
  component: ThemeToggle,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A theme toggle button that cycles through light, dark, and system themes. Displays appropriate icons and labels based on current theme state. Note: Requires ThemeContext implementation.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'ghost', 'outline'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    showLabel: {
      control: { type: 'boolean' },
    },
    labelPosition: {
      control: { type: 'select' },
      options: ['left', 'right'],
    },
  },
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock story since we can't easily mock the context in Storybook
export const Default: Story = {
  render: args => (
    <div className="space-y-4">
      <div className="rounded-lg border bg-gray-50 p-4">
        <p className="mb-2 text-sm text-gray-600">
          <strong>Note:</strong> This component requires ThemeContext implementation. The following
          is a visual representation of how it would appear.
        </p>

        <div className="flex items-center gap-4">
          <button
            className="inline-flex items-center justify-center rounded-md p-2 font-medium transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2"
            title="Current theme: Light. Click to toggle."
            aria-label="Toggle theme. Current: Light"
            {...args}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            {args.showLabel && <span className="ml-2 text-sm font-medium">Light</span>}
          </button>
        </div>
      </div>
    </div>
  ),
  args: {
    showLabel: false,
  },
};

export const WithLabels: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Theme Toggle Variants</h3>
        <div className="grid grid-cols-1 gap-4">
          <div className="rounded-lg border p-4">
            <h4 className="mb-2 font-medium">Light Theme State</h4>
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center justify-center rounded-md p-2 font-medium transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <span className="ml-2 text-sm font-medium">Light</span>
              </button>
            </div>
          </div>

          <div className="rounded-lg border bg-gray-800 p-4 text-white">
            <h4 className="mb-2 font-medium">Dark Theme State</h4>
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center justify-center rounded-md p-2 font-medium text-white transition-colors hover:bg-gray-700 focus:outline-none focus:ring-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
                <span className="ml-2 text-sm font-medium">Dark</span>
              </button>
            </div>
          </div>

          <div className="rounded-lg border bg-gray-100 p-4">
            <h4 className="mb-2 font-medium">System Theme State</h4>
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center justify-center rounded-md p-2 font-medium transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="ml-2 text-sm font-medium">System</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Button Variants</h3>
        <div className="flex gap-4">
          <div className="text-center">
            <p className="mb-2 text-sm text-gray-600">Default</p>
            <button className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white p-2 font-medium text-gray-900 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </button>
          </div>

          <div className="text-center">
            <p className="mb-2 text-sm text-gray-600">Ghost</p>
            <button className="inline-flex items-center justify-center rounded-md p-2 font-medium text-gray-900 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </button>
          </div>

          <div className="text-center">
            <p className="mb-2 text-sm text-gray-600">Outline</p>
            <button className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-transparent p-2 font-medium text-gray-900 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Size Variants</h3>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="mb-2 text-sm text-gray-600">Small</p>
            <button className="inline-flex h-8 w-8 items-center justify-center rounded-md p-1 font-medium text-gray-900 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </button>
          </div>

          <div className="text-center">
            <p className="mb-2 text-sm text-gray-600">Medium</p>
            <button className="inline-flex h-9 w-9 items-center justify-center rounded-md p-2 font-medium text-gray-900 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </button>
          </div>

          <div className="text-center">
            <p className="mb-2 text-sm text-gray-600">Large</p>
            <button className="inline-flex h-10 w-10 items-center justify-center rounded-md p-2.5 font-medium text-gray-900 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const LabelPositions: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Label Positions</h3>
        <div className="flex gap-6">
          <div className="text-center">
            <p className="mb-2 text-sm text-gray-600">Label Left</p>
            <button className="inline-flex items-center justify-center rounded-md p-2 font-medium text-gray-900 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2">
              <span className="mr-2 text-sm font-medium">Light</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </button>
          </div>

          <div className="text-center">
            <p className="mb-2 text-sm text-gray-600">Label Right</p>
            <button className="inline-flex items-center justify-center rounded-md p-2 font-medium text-gray-900 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <span className="ml-2 text-sm font-medium">Light</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const InNavigation: Story = {
  render: () => (
    <div className="w-full">
      <nav className="border-b border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold">My App</h1>
            <div className="hidden gap-4 md:flex">
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Home
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                About
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Contact
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="inline-flex items-center justify-center rounded-md p-2 font-medium text-gray-900 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <main className="p-8">
        <h2 className="mb-4 text-2xl font-bold">Content Area</h2>
        <p className="text-gray-600">
          The theme toggle is typically placed in the navigation bar for easy access. Users can
          quickly switch between light, dark, and system themes.
        </p>
      </main>
    </div>
  ),
};

export const AccessibilityDemo: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="mb-2 text-lg font-semibold text-gray-800">Accessibility Features</h3>
        <ul className="space-y-1 text-sm text-gray-700">
          <li>
            • <strong>aria-label</strong>: Describes current theme state and action
          </li>
          <li>
            • <strong>title attribute</strong>: Provides tooltip with current state
          </li>
          <li>
            • <strong>Keyboard navigation</strong>: Fully accessible via keyboard
          </li>
          <li>
            • <strong>Focus indicators</strong>: Clear visual focus states
          </li>
          <li>
            • <strong>Icon semantics</strong>: Icons clearly represent theme states
          </li>
        </ul>
      </div>

      <div className="flex gap-4">
        <button
          className="inline-flex items-center justify-center rounded-md p-2 font-medium text-gray-900 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Current theme: Light. Click to toggle."
          aria-label="Toggle theme. Current: Light"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        </button>

        <p className="self-center text-sm text-gray-600">
          Hover to see tooltip, focus to see keyboard indicators
        </p>
      </div>
    </div>
  ),
};
