import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import MainLayout from '@/components/templates/MainLayout';

// Mock Header component for the stories
const MockHeader = () => (
  <header className="border-b bg-white shadow-xs">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600">
            <span className="font-display text-sm font-bold text-white dark:text-black">RBI</span>
          </div>
          <span className="font-display text-xl font-semibold text-gray-900 dark:text-gray-100">RBI System</span>
        </div>
        <nav className="hidden space-x-1 md:flex">
          <a
            href="#"
            className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-100"
          >
            Dashboard
          </a>
          <a
            href="#"
            className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-100"
          >
            Residents
          </a>
          <a
            href="#"
            className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-100"
          >
            Households
          </a>
          <a
            href="#"
            className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-100"
          >
            Reports
          </a>
        </nav>
        <div className="flex items-center space-x-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-blue-100">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">JD</span>
          </div>
        </div>
      </div>
    </div>
  </header>
);

const meta = {
  title: 'Templates/MainLayout',
  component: MainLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Main Layout Component - A simple and clean wrapper layout with header and main content area. Provides consistent spacing, typography, and structure for basic page layouts. Features optional page titles and responsive design with maximum width constraints.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Optional page title displayed above the content',
    },
    children: {
      control: false,
      description: 'Content to be displayed within the layout',
    },
  },
} satisfies Meta<typeof MainLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock content components for demonstrations
const BasicContent = () => (
  <div className="space-y-6">
    <p className="text-gray-600 dark:text-gray-400">
      This is basic content within the MainLayout. The layout provides consistent spacing and
      typography while keeping the design clean and focused.
    </p>

    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-xs">
      <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">Sample Card</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Content cards and components work well within the MainLayout structure, maintaining proper
        spacing and alignment.
      </p>
    </div>

    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">Layout Benefits</h4>
        <ul className="space-y-1 text-sm text-gray-800 dark:text-gray-200">
          <li>• Consistent spacing</li>
          <li>• Responsive design</li>
          <li>• Clean typography</li>
          <li>• Maximum width constraints</li>
        </ul>
      </div>
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <h4 className="mb-2 font-medium text-green-900">Use Cases</h4>
        <ul className="space-y-1 text-sm text-green-800">
          <li>• Simple pages</li>
          <li>• Content-focused layouts</li>
          <li>• Form pages</li>
          <li>• Landing pages</li>
        </ul>
      </div>
    </div>
  </div>
);

const RichContent = () => (
  <div className="space-y-8">
    <div className="prose max-w-none">
      <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">
        The MainLayout component serves as a foundation for pages that need a simple, clean
        structure without complex navigation or specialized layouts.
      </p>
    </div>

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {[
        {
          icon: '📄',
          title: 'Content Pages',
          description: 'Perfect for static content, documentation, and informational pages.',
        },
        {
          icon: '📝',
          title: 'Form Layouts',
          description: 'Ideal for simple forms, settings pages, and data entry interfaces.',
        },
        {
          icon: '🚀',
          title: 'Landing Pages',
          description: 'Great for welcome screens, onboarding flows, and promotional content.',
        },
      ].map((feature, index) => (
        <div
          key={index}
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs transition-shadow hover:shadow-md"
        >
          <div className="mb-3 text-3xl">{feature.icon}</div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">{feature.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
        </div>
      ))}
    </div>

    <div className="rounded-xl border border-indigo-200 bg-linear-to-r from-indigo-50 to-blue-50 p-8">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
          <svg
            className="h-8 w-8 text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
            />
          </svg>
        </div>
        <h2 className="mb-3 text-2xl font-bold text-indigo-900">Simple & Effective</h2>
        <p className="mx-auto max-w-2xl text-indigo-800">
          MainLayout focuses on simplicity and effectiveness, providing just enough structure to
          create professional-looking pages without unnecessary complexity.
        </p>
      </div>
    </div>

    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Technical Specifications</h3>
      <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-2">
        <div>
          <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">Layout Features</h4>
          <ul className="space-y-1 text-gray-600 dark:text-gray-400">
            <li>• Full-height background (min-h-screen)</li>
            <li>• Light gray background (bg-gray-50)</li>
            <li>• Maximum width constraint (max-w-7xl)</li>
            <li>• Responsive padding (px-4 sm:px-6 lg:px-8)</li>
            <li>• Vertical spacing (py-6)</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">Typography</h4>
          <ul className="space-y-1 text-gray-600 dark:text-gray-400">
            <li>• Optional page titles</li>
            <li>• Consistent heading hierarchy</li>
            <li>• Proper text color contrast</li>
            <li>• Readable font sizing</li>
            <li>• Appropriate line spacing</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

const FormContent = () => (
  <div className="space-y-8">
    <div className="text-center">
      <p className="text-gray-600 dark:text-gray-400">
        MainLayout works excellently for form-based pages, providing clean structure and appropriate
        spacing for form elements.
      </p>
    </div>

    <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-xs">
      <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-gray-100">Sample Form</h2>

      <form className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter first name"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter last name"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
          <input
            type="email"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter email address"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
          <textarea
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter your message"
          />
        </div>

        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-6 py-2 text-white dark:text-black transition-colors hover:bg-indigo-700"
          >
            Submit Form
          </button>
        </div>
      </form>
    </div>

    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-start gap-3">
        <svg
          className="mt-0.5 h-5 w-5 text-gray-600 dark:text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Form Layout Benefits</h4>
          <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">
            The MainLayout provides proper spacing and width constraints that make forms more
            readable and user-friendly, especially on larger screens.
          </p>
        </div>
      </div>
    </div>
  </div>
);

// Default story without title
export const Default: Story = {
  args: {
    children: <BasicContent />,
  },
};

// With page title
export const WithTitle: Story = {
  args: {
    title: 'Page Title Example',
    children: <BasicContent />,
  },
  parameters: {
    docs: {
      description: {
        story: 'MainLayout with an optional page title displayed prominently above the content.',
      },
    },
  },
};

// With rich content
export const RichContentExample: Story = {
  args: {
    title: 'Feature Overview',
    children: <RichContent />,
  },
  parameters: {
    docs: {
      description: {
        story:
          'MainLayout showcasing rich content with multiple sections, cards, and interactive elements.',
      },
    },
  },
};

// Form layout example
export const FormLayout: Story = {
  args: {
    title: 'Contact Form',
    children: <FormContent />,
  },
  parameters: {
    docs: {
      description: {
        story:
          'MainLayout optimized for form-based pages with proper spacing and structure for form elements.',
      },
    },
  },
};

// Mobile view
export const MobileView: Story = {
  args: {
    title: 'Mobile Layout',
    children: <BasicContent />,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story: 'MainLayout optimized for mobile devices with responsive spacing and typography.',
      },
    },
  },
};

// Tablet view
export const TabletView: Story = {
  args: {
    title: 'Tablet Layout',
    children: <RichContent />,
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story:
          'MainLayout on tablet-sized screens showing how content adapts to medium screen sizes.',
      },
    },
  },
};

// Content variations
export const MinimalContent: Story = {
  args: {
    title: 'Minimal Page',
    children: (
      <div className="py-12 text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
          <svg
            className="h-12 w-12 text-gray-400 dark:text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-gray-100">Simple Content</h2>
        <p className="mx-auto max-w-md text-gray-600 dark:text-gray-400">
          This demonstrates how MainLayout handles minimal content while maintaining proper spacing
          and visual hierarchy.
        </p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'MainLayout with minimal content, showing how the layout handles sparse content gracefully.',
      },
    },
  },
};

// Long content example
export const LongContent: Story = {
  args: {
    title: 'Extended Content Example',
    children: (
      <div className="space-y-8">
        <div className="prose max-w-none">
          <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            This example demonstrates how MainLayout handles longer content with multiple sections
            and maintains readability throughout the page.
          </p>
        </div>

        {/* Generate multiple content sections */}
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="rounded-lg border border-gray-200 bg-white p-6 shadow-xs">
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Section {index + 1}: Content Block
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
              <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
              <span>Content section {index + 1} of 8</span>
            </div>
          </div>
        ))}

        <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
          <h3 className="mb-2 text-lg font-semibold text-green-900">End of Content</h3>
          <p className="text-sm text-green-800">
            The MainLayout maintains consistent spacing and readability even with extended content.
          </p>
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'MainLayout with extended content demonstrating how the layout handles longer pages with multiple sections.',
      },
    },
  },
};

// Layout structure visualization
export const LayoutStructure: Story = {
  args: {
    title: 'Layout Structure',
    children: (
      <div className="space-y-6">
        <div className="rounded-xl border-2 border-dashed border-blue-300 bg-blue-100 p-8 text-center">
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">Header Area</h3>
          <p className="text-sm text-gray-800 dark:text-gray-200">
            Contains the RBI System branding and navigation (imported via Header component)
          </p>
        </div>

        <div className="rounded-xl border-2 border-dashed border-green-300 bg-green-100 p-8 text-center">
          <h3 className="mb-2 text-lg font-semibold text-green-900">Title Section (Optional)</h3>
          <p className="text-sm text-green-800">Displays page title when provided via props</p>
        </div>

        <div className="rounded-xl border-2 border-dashed border-purple-300 bg-purple-100 p-12 text-center">
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">Main Content Area</h3>
          <p className="mb-4 text-sm text-gray-800 dark:text-gray-200">
            This is where the children prop content is rendered
          </p>
          <div className="mx-auto max-w-md rounded-lg border border-purple-200 bg-white p-4">
            <p className="text-sm text-gray-900 dark:text-gray-100">Your content goes here</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">Layout Specifications</h3>
          <div className="grid grid-cols-1 gap-4 text-sm text-gray-600 dark:text-gray-400 md:grid-cols-2">
            <div>
              <span className="font-medium">Container:</span> max-w-7xl mx-auto
            </div>
            <div>
              <span className="font-medium">Padding:</span> px-4 sm:px-6 lg:px-8
            </div>
            <div>
              <span className="font-medium">Vertical Spacing:</span> py-6
            </div>
            <div>
              <span className="font-medium">Background:</span> bg-gray-50
            </div>
          </div>
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Visual breakdown of the MainLayout structure showing header, optional title, and content areas.',
      },
    },
  },
};

// Without title (explicit)
export const WithoutTitle: Story = {
  args: {
    children: (
      <div className="py-8 text-center">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">Custom Content Title</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          When no title prop is provided, you can include your own custom headings and structure
          within the content area.
        </p>
        <div className="mx-auto max-w-md rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">
            This provides maximum flexibility for custom layouts and designs.
          </p>
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'MainLayout without the title prop, showing how to include custom headings within the content area.',
      },
    },
  },
};

// Dark theme compatibility
export const WithDarkBackground: Story = {
  args: {
    title: 'Dark Theme Compatibility',
    children: <BasicContent />,
  },
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        story:
          'MainLayout with dark background to test theme compatibility. The layout uses light colors that may need adjustment for full dark mode support.',
      },
    },
  },
};
