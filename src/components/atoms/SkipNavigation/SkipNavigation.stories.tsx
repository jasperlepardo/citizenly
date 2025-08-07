import type { Meta, StoryObj } from '@storybook/react';
import { SkipNavigation, SkipLinks } from './SkipNavigation';

const meta = {
  title: 'Atoms/SkipNavigation',
  component: SkipNavigation,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Skip navigation components allow keyboard users to bypass repetitive content and jump directly to main sections. Essential for accessibility compliance.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    skipTo: {
      control: { type: 'text' },
      description: 'CSS selector or anchor link for the skip target',
    },
    children: {
      control: { type: 'text' },
      description: 'Text content for the skip link',
    },
  },
} satisfies Meta<typeof SkipNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="min-h-screen">
      <SkipNavigation />
      
      <header className="bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">My Website</h1>
          <nav className="flex gap-4">
            <a href="#" className="hover:underline">Home</a>
            <a href="#" className="hover:underline">About</a>
            <a href="#" className="hover:underline">Contact</a>
          </nav>
        </div>
      </header>

      <main id="main-content" className="p-8">
        <h2 className="text-2xl font-bold mb-4">Main Content</h2>
        <p className="mb-4">
          This is the main content area. When users press Tab and focus the skip link,
          they can press Enter to jump directly here, bypassing the header navigation.
        </p>
        <p className="text-sm text-gray-600">
          <strong>To test:</strong> Press Tab to focus the skip link (it will appear),
          then press Enter to jump to this content.
        </p>
      </main>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Basic skip navigation link that allows users to jump to main content. Press Tab to see the skip link appear.',
      },
    },
  },
};

export const CustomSkipTarget: Story = {
  render: () => (
    <div className="min-h-screen">
      <SkipNavigation skipTo="#custom-target" children="Skip to article content" />
      
      <header className="bg-gray-800 text-white p-4">
        <h1 className="text-xl font-bold">News Website</h1>
        <nav className="mt-4 flex gap-6">
          <a href="#" className="hover:underline">Politics</a>
          <a href="#" className="hover:underline">Sports</a>
          <a href="#" className="hover:underline">Technology</a>
          <a href="#" className="hover:underline">Business</a>
        </nav>
      </header>

      <aside className="bg-gray-100 p-4">
        <h2 className="font-bold mb-2">Sidebar Content</h2>
        <ul className="space-y-1 text-sm">
          <li><a href="#" className="text-blue-600 hover:underline">Recent Articles</a></li>
          <li><a href="#" className="text-blue-600 hover:underline">Popular Posts</a></li>
          <li><a href="#" className="text-blue-600 hover:underline">Categories</a></li>
        </ul>
      </aside>

      <article id="custom-target" className="p-8">
        <h1 className="text-3xl font-bold mb-4">Article Title</h1>
        <p className="mb-4">
          This article content can be accessed directly using the custom skip link.
          The skip link targets the #custom-target element.
        </p>
        <p className="text-sm text-gray-600">
          <strong>To test:</strong> Press Tab to see the "Skip to article content" link,
          then press Enter to jump here.
        </p>
      </article>
    </div>
  ),
};

export const MultipleSkipLinks: Story = {
  render: () => (
    <div className="min-h-screen">
      <SkipLinks
        links={[
          { href: '#main-content', label: 'Skip to main content' },
          { href: '#navigation', label: 'Skip to navigation' },
          { href: '#sidebar', label: 'Skip to sidebar' },
          { href: '#footer', label: 'Skip to footer' },
        ]}
      />
      
      <header className="bg-purple-600 text-white p-4">
        <h1 className="text-xl font-bold">Complex Layout Website</h1>
      </header>

      <div className="flex min-h-screen">
        <nav id="navigation" className="w-64 bg-gray-800 text-white p-4">
          <h2 className="font-bold mb-4">Navigation</h2>
          <ul className="space-y-2">
            <li><a href="#" className="block hover:text-gray-300">Home</a></li>
            <li><a href="#" className="block hover:text-gray-300">Products</a></li>
            <li><a href="#" className="block hover:text-gray-300">Services</a></li>
            <li><a href="#" className="block hover:text-gray-300">About</a></li>
            <li><a href="#" className="block hover:text-gray-300">Contact</a></li>
          </ul>
        </nav>

        <div className="flex-1 flex flex-col">
          <main id="main-content" className="flex-1 p-8">
            <h2 className="text-2xl font-bold mb-4">Main Content</h2>
            <p className="mb-4">
              This layout has multiple skip links allowing users to jump to different
              sections of the page quickly.
            </p>
            <p className="text-sm text-gray-600 mb-8">
              <strong>To test:</strong> Press Tab to see all available skip links appear.
            </p>
          </main>

          <aside id="sidebar" className="bg-blue-50 p-4 border-t">
            <h3 className="font-bold mb-2">Sidebar</h3>
            <p className="text-sm text-gray-600">
              Additional information and links would be displayed here.
            </p>
          </aside>
        </div>
      </div>

      <footer id="footer" className="bg-gray-800 text-white p-4">
        <p className="text-center">&copy; 2024 My Website. All rights reserved.</p>
      </footer>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple skip links for complex layouts with many sections. Users can quickly navigate to any major section.',
      },
    },
  },
};

export const AccessibilityDemo: Story = {
  render: () => (
    <div className="min-h-screen">
      <SkipNavigation />
      
      <div className="bg-yellow-50 border border-yellow-200 p-4 m-4 rounded">
        <h2 className="text-lg font-semibold text-yellow-800 mb-2">
          Accessibility Testing Instructions
        </h2>
        <div className="text-sm text-yellow-700 space-y-1">
          <p><strong>Keyboard Testing:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Press <kbd className="px-1 py-0.5 bg-yellow-100 rounded">Tab</kbd> to see the skip link appear</li>
            <li>Press <kbd className="px-1 py-0.5 bg-yellow-100 rounded">Enter</kbd> or <kbd className="px-1 py-0.5 bg-yellow-100 rounded">Space</kbd> to activate the skip link</li>
            <li>Focus should jump directly to the main content area</li>
          </ul>
          <p><strong>Screen Reader Testing:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>The skip link should be announced when focused</li>
            <li>Activating it should move focus to the target element</li>
            <li>The target element should be properly announced</li>
          </ul>
        </div>
      </div>

      <header className="bg-indigo-600 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Accessibility-First Website</h1>
          <nav>
            <ul className="flex flex-wrap gap-6">
              <li><a href="#" className="hover:text-indigo-200">Home</a></li>
              <li><a href="#" className="hover:text-indigo-200">Accessibility</a></li>
              <li><a href="#" className="hover:text-indigo-200">WCAG Guidelines</a></li>
              <li><a href="#" className="hover:text-indigo-200">Testing Tools</a></li>
              <li><a href="#" className="hover:text-indigo-200">Resources</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main id="main-content" className="max-w-4xl mx-auto p-6">
        <h2 className="text-3xl font-bold mb-6">Main Content Area</h2>
        
        <div className="prose max-w-none">
          <p className="text-lg text-gray-600 mb-6">
            You've successfully used the skip link to bypass the navigation and jump
            directly to the main content. This is essential for users who navigate
            with keyboards or screen readers.
          </p>

          <h3 className="text-xl font-semibold mb-4">Why Skip Links Matter</h3>
          <ul className="list-disc list-inside mb-6 space-y-2">
            <li>Saves time for keyboard users who would otherwise have to tab through all navigation links</li>
            <li>Improves efficiency for screen reader users</li>
            <li>Required by WCAG 2.1 AA compliance standards</li>
            <li>Benefits users with motor disabilities who may have difficulty with repetitive navigation</li>
          </ul>

          <h3 className="text-xl font-semibold mb-4">Implementation Best Practices</h3>
          <ul className="list-disc list-inside mb-6 space-y-2">
            <li>Place skip links at the very beginning of the page</li>
            <li>Make them visible when focused</li>
            <li>Ensure they have sufficient color contrast</li>
            <li>Target meaningful landmarks with descriptive anchor text</li>
            <li>Test with actual keyboard navigation and screen readers</li>
          </ul>
        </div>
      </main>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comprehensive example showing proper skip link implementation with accessibility testing instructions.',
      },
    },
  },
};

export const StylingSamples: Story = {
  render: () => (
    <div className="space-y-8 p-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Default Styling</h3>
        <div className="relative border-2 border-dashed border-gray-300 p-4 rounded">
          <SkipNavigation />
          <p className="text-sm text-gray-600">Tab here to see the default skip link styling</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Custom Styling</h3>
        <div className="relative border-2 border-dashed border-gray-300 p-4 rounded">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-green-600 focus:px-6 focus:py-3 focus:text-white focus:font-semibold focus:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-600 focus:ring-opacity-50 focus:transform focus:scale-105 transition-all duration-200"
          >
            🚀 Jump to Main Content
          </a>
          <p className="text-sm text-gray-600">Custom styled skip link with emoji and animations</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Brand Colors</h3>
        <div className="relative border-2 border-dashed border-gray-300 p-4 rounded">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-purple-600 focus:px-4 focus:py-2 focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"
          >
            Skip to Main Content
          </a>
          <p className="text-sm text-gray-600">Skip link using brand purple colors</p>
        </div>
      </div>

      <div id="main-content" className="p-4 bg-gray-50 rounded">
        <p className="text-sm text-gray-600">
          This is the main content area where skip links would navigate to.
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Examples of different styling approaches for skip navigation links while maintaining accessibility.',
      },
    },
  },
};