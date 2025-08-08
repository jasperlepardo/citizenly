import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import MainLayout from './MainLayout';

// Mock Header component for the stories
const MockHeader = () => (
  <header className="border-b shadow-sm bg-white">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary-600">
            <span className="font-display text-sm font-bold text-white">RBI</span>
          </div>
          <span className="font-display text-xl font-semibold text-gray-900">RBI System</span>
        </div>
        <nav className="hidden space-x-1 md:flex">
          <a href="#" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Dashboard</a>
          <a href="#" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Residents</a>
          <a href="#" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Households</a>
          <a href="#" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Reports</a>
        </nav>
        <div className="flex items-center space-x-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary-100">
            <span className="text-sm font-medium text-primary-600">JD</span>
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
        component: 'Main Layout Component - A simple and clean wrapper layout with header and main content area. Provides consistent spacing, typography, and structure for basic page layouts. Features optional page titles and responsive design with maximum width constraints.',
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
    <p className="text-gray-600">
      This is basic content within the MainLayout. The layout provides consistent spacing 
      and typography while keeping the design clean and focused.
    </p>
    
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Sample Card</h3>
      <p className="text-gray-600 text-sm">
        Content cards and components work well within the MainLayout structure, 
        maintaining proper spacing and alignment.
      </p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Layout Benefits</h4>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• Consistent spacing</li>
          <li>• Responsive design</li>
          <li>• Clean typography</li>
          <li>• Maximum width constraints</li>
        </ul>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-2">Use Cases</h4>
        <ul className="text-green-800 text-sm space-y-1">
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
      <p className="text-lg text-gray-600 leading-relaxed">
        The MainLayout component serves as a foundation for pages that need a simple, 
        clean structure without complex navigation or specialized layouts.
      </p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {[
        {
          icon: '📄',
          title: 'Content Pages',
          description: 'Perfect for static content, documentation, and informational pages.'
        },
        {
          icon: '📝',
          title: 'Form Layouts',
          description: 'Ideal for simple forms, settings pages, and data entry interfaces.'
        },
        {
          icon: '🚀',
          title: 'Landing Pages',
          description: 'Great for welcome screens, onboarding flows, and promotional content.'
        }
      ].map((feature, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-3xl mb-3">{feature.icon}</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
          <p className="text-gray-600 text-sm">{feature.description}</p>
        </div>
      ))}
    </div>

    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-indigo-900 mb-3">Simple & Effective</h2>
        <p className="text-indigo-800 max-w-2xl mx-auto">
          MainLayout focuses on simplicity and effectiveness, providing just enough structure 
          to create professional-looking pages without unnecessary complexity.
        </p>
      </div>
    </div>

    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Specifications</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Layout Features</h4>
          <ul className="space-y-1 text-gray-600">
            <li>• Full-height background (min-h-screen)</li>
            <li>• Light gray background (bg-gray-50)</li>
            <li>• Maximum width constraint (max-w-7xl)</li>
            <li>• Responsive padding (px-4 sm:px-6 lg:px-8)</li>
            <li>• Vertical spacing (py-6)</li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Typography</h4>
          <ul className="space-y-1 text-gray-600">
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
      <p className="text-gray-600">
        MainLayout works excellently for form-based pages, providing clean structure 
        and appropriate spacing for form elements.
      </p>
    </div>

    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Sample Form</h2>
      
      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter first name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter last name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter email address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message
          </label>
          <textarea
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter your message"
          />
        </div>

        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Submit Form
          </button>
        </div>
      </form>
    </div>

    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h4 className="font-medium text-blue-900 text-sm">Form Layout Benefits</h4>
          <p className="text-blue-800 text-sm mt-1">
            The MainLayout provides proper spacing and width constraints that make forms more readable 
            and user-friendly, especially on larger screens.
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
        story: 'MainLayout showcasing rich content with multiple sections, cards, and interactive elements.',
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
        story: 'MainLayout optimized for form-based pages with proper spacing and structure for form elements.',
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
        story: 'MainLayout on tablet-sized screens showing how content adapts to medium screen sizes.',
      },
    },
  },
};

// Content variations
export const MinimalContent: Story = {
  args: {
    title: 'Minimal Page',
    children: (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Simple Content</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          This demonstrates how MainLayout handles minimal content while maintaining proper spacing and visual hierarchy.
        </p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'MainLayout with minimal content, showing how the layout handles sparse content gracefully.',
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
          <p className="text-lg text-gray-600 leading-relaxed">
            This example demonstrates how MainLayout handles longer content with multiple sections 
            and maintains readability throughout the page.
          </p>
        </div>

        {/* Generate multiple content sections */}
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Section {index + 1}: Content Block
            </h3>
            <p className="text-gray-600 mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis 
              nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <span>Content section {index + 1} of 8</span>
            </div>
          </div>
        ))}

        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-green-900 mb-2">End of Content</h3>
          <p className="text-green-800 text-sm">
            The MainLayout maintains consistent spacing and readability even with extended content.
          </p>
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'MainLayout with extended content demonstrating how the layout handles longer pages with multiple sections.',
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
        <div className="bg-blue-100 border-2 border-dashed border-blue-300 rounded-xl p-8 text-center">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Header Area</h3>
          <p className="text-blue-800 text-sm">
            Contains the RBI System branding and navigation (imported via Header component)
          </p>
        </div>

        <div className="bg-green-100 border-2 border-dashed border-green-300 rounded-xl p-8 text-center">
          <h3 className="text-lg font-semibold text-green-900 mb-2">Title Section (Optional)</h3>
          <p className="text-green-800 text-sm">
            Displays page title when provided via props
          </p>
        </div>

        <div className="bg-purple-100 border-2 border-dashed border-purple-300 rounded-xl p-12 text-center">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">Main Content Area</h3>
          <p className="text-purple-800 text-sm mb-4">
            This is where the children prop content is rendered
          </p>
          <div className="bg-white border border-purple-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-purple-900 text-sm">Your content goes here</p>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Layout Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
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
        story: 'Visual breakdown of the MainLayout structure showing header, optional title, and content areas.',
      },
    },
  },
};

// Without title (explicit)
export const WithoutTitle: Story = {
  args: {
    children: (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Custom Content Title</h2>
        <p className="text-gray-600 mb-6">
          When no title prop is provided, you can include your own custom headings 
          and structure within the content area.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-yellow-800 text-sm">
            This provides maximum flexibility for custom layouts and designs.
          </p>
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'MainLayout without the title prop, showing how to include custom headings within the content area.',
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
        story: 'MainLayout with dark background to test theme compatibility. The layout uses light colors that may need adjustment for full dark mode support.',
      },
    },
  },
};