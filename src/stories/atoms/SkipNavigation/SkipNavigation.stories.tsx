import type { Meta, StoryObj } from '@storybook/react';
import { SkipNavigation, SkipLinks } from '@/components/atoms/SkipNavigation';

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

      <header className="bg-blue-600 p-4 text-white dark:text-black">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">My Website</h1>
          <nav className="flex gap-4">
            <a href="#" className="hover:underline">
              Home
            </a>
            <a href="#" className="hover:underline">
              About
            </a>
            <a href="#" className="hover:underline">
              Contact
            </a>
          </nav>
        </div>
      </header>

      <main id="main-content" className="p-8">
        <h2 className="mb-4 text-2xl font-bold">Main Content</h2>
        <p className="mb-4">
          This is the main content area. When users press Tab and focus the skip link, they can
          press Enter to jump directly here, bypassing the header navigation.
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong>To test:</strong> Press Tab to focus the skip link (it will appear), then press
          Enter to jump to this content.
        </p>
      </main>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Basic skip navigation link that allows users to jump to main content. Press Tab to see the skip link appear.',
      },
    },
  },
};

export const CustomSkipTarget: Story = {
  render: () => (
    <div className="min-h-screen">
      <SkipNavigation skipTo="#custom-target">Skip to article content</SkipNavigation>

      <header className="bg-gray-800 p-4 text-white dark:text-black">
        <h1 className="text-xl font-bold">News Website</h1>
        <nav className="mt-4 flex gap-6">
          <a href="#" className="hover:underline">
            Politics
          </a>
          <a href="#" className="hover:underline">
            Sports
          </a>
          <a href="#" className="hover:underline">
            Technology
          </a>
          <a href="#" className="hover:underline">
            Business
          </a>
        </nav>
      </header>

      <aside className="bg-gray-100 p-4">
        <h2 className="mb-2 font-bold">Sidebar Content</h2>
        <ul className="space-y-1 text-sm">
          <li>
            <a href="#" className="text-gray-600 hover:underline dark:text-gray-400">
              Recent Articles
            </a>
          </li>
          <li>
            <a href="#" className="text-gray-600 hover:underline dark:text-gray-400">
              Popular Posts
            </a>
          </li>
          <li>
            <a href="#" className="text-gray-600 hover:underline dark:text-gray-400">
              Categories
            </a>
          </li>
        </ul>
      </aside>

      <article id="custom-target" className="p-8">
        <h1 className="mb-4 text-3xl font-bold">Article Title</h1>
        <p className="mb-4">
          This article content can be accessed directly using the custom skip link. The skip link
          targets the #custom-target element.
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong>To test:</strong> Press Tab to see the &quot;Skip to article content&quot; link,
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

      <header className="bg-purple-600 p-4 text-white dark:text-black">
        <h1 className="text-xl font-bold">Complex Layout Website</h1>
      </header>

      <div className="flex min-h-screen">
        <nav id="navigation" className="w-64 bg-gray-800 p-4 text-white dark:text-black">
          <h2 className="mb-4 font-bold">Navigation</h2>
          <ul className="space-y-2">
            <li>
              <a href="#" className="block hover:text-gray-300 dark:text-gray-700">
                Home
              </a>
            </li>
            <li>
              <a href="#" className="block hover:text-gray-300 dark:text-gray-700">
                Products
              </a>
            </li>
            <li>
              <a href="#" className="block hover:text-gray-300 dark:text-gray-700">
                Services
              </a>
            </li>
            <li>
              <a href="#" className="block hover:text-gray-300 dark:text-gray-700">
                About
              </a>
            </li>
            <li>
              <a href="#" className="block hover:text-gray-300 dark:text-gray-700">
                Contact
              </a>
            </li>
          </ul>
        </nav>

        <div className="flex flex-1 flex-col">
          <main id="main-content" className="flex-1 p-8">
            <h2 className="mb-4 text-2xl font-bold">Main Content</h2>
            <p className="mb-4">
              This layout has multiple skip links allowing users to jump to different sections of
              the page quickly.
            </p>
            <p className="mb-8 text-sm text-gray-600 dark:text-gray-400">
              <strong>To test:</strong> Press Tab to see all available skip links appear.
            </p>
          </main>

          <aside id="sidebar" className="border-t bg-blue-50 p-4">
            <h3 className="mb-2 font-bold">Sidebar</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Additional information and links would be displayed here.
            </p>
          </aside>
        </div>
      </div>

      <footer id="footer" className="bg-gray-800 p-4 text-white dark:text-black">
        <p className="text-center">&copy; 2024 My Website. All rights reserved.</p>
      </footer>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Multiple skip links for complex layouts with many sections. Users can quickly navigate to any major section.',
      },
    },
  },
};

export const AccessibilityDemo: Story = {
  render: () => (
    <div className="min-h-screen">
      <SkipNavigation />

      <div className="m-4 rounded-sm border border-yellow-200 bg-yellow-50 p-4">
        <h2 className="mb-2 text-lg font-semibold text-yellow-800">
          Accessibility Testing Instructions
        </h2>
        <div className="space-y-1 text-sm text-yellow-700">
          <p>
            <strong>Keyboard Testing:</strong>
          </p>
          <ul className="ml-4 list-inside list-disc space-y-1">
            <li>
              Press <kbd className="rounded bg-yellow-100 px-1 py-0.5">Tab</kbd> to see the skip
              link appear
            </li>
            <li>
              Press <kbd className="rounded bg-yellow-100 px-1 py-0.5">Enter</kbd> or{' '}
              <kbd className="rounded bg-yellow-100 px-1 py-0.5">Space</kbd> to activate the skip
              link
            </li>
            <li>Focus should jump directly to the main content area</li>
          </ul>
          <p>
            <strong>Screen Reader Testing:</strong>
          </p>
          <ul className="ml-4 list-inside list-disc space-y-1">
            <li>The skip link should be announced when focused</li>
            <li>Activating it should move focus to the target element</li>
            <li>The target element should be properly announced</li>
          </ul>
        </div>
      </div>

      <header className="bg-indigo-600 p-6 text-white dark:text-black">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-4 text-2xl font-bold">Accessibility-First Website</h1>
          <nav>
            <ul className="flex flex-wrap gap-6">
              <li>
                <a href="#" className="hover:text-indigo-200">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-200">
                  Accessibility
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-200">
                  WCAG Guidelines
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-200">
                  Testing Tools
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-200">
                  Resources
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-4xl p-6">
        <h2 className="mb-6 text-3xl font-bold">Main Content Area</h2>

        <div className="prose max-w-none">
          <p className="mb-6 text-lg text-gray-600 dark:text-gray-400">
            You&apos;ve successfully used the skip link to bypass the navigation and jump directly
            to the main content. This is essential for users who navigate with keyboards or screen
            readers.
          </p>

          <h3 className="mb-4 text-xl font-semibold">Why Skip Links Matter</h3>
          <ul className="mb-6 list-inside list-disc space-y-2">
            <li>
              Saves time for keyboard users who would otherwise have to tab through all navigation
              links
            </li>
            <li>Improves efficiency for screen reader users</li>
            <li>Required by WCAG 2.1 AA compliance standards</li>
            <li>
              Benefits users with motor disabilities who may have difficulty with repetitive
              navigation
            </li>
          </ul>

          <h3 className="mb-4 text-xl font-semibold">Implementation Best Practices</h3>
          <ul className="mb-6 list-inside list-disc space-y-2">
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
        story:
          'Comprehensive example showing proper skip link implementation with accessibility testing instructions.',
      },
    },
  },
};

export const StylingSamples: Story = {
  render: () => (
    <div className="space-y-8 p-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Default Styling</h3>
        <div className="relative rounded-sm border-2 border-dashed border-gray-300 p-4">
          <SkipNavigation />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Tab here to see the default skip link styling
          </p>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Custom Styling</h3>
        <div className="relative rounded-sm border-2 border-dashed border-gray-300 p-4">
          <a
            href="#main-content"
            className="focus:ring-opacity-50 sr-only transition-all duration-200 focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:scale-105 focus:rounded-lg focus:bg-green-600 focus:px-6 focus:py-3 focus:font-semibold focus:text-white focus:shadow-xl focus:ring-4 focus:ring-green-600 focus:outline-hidden dark:text-black"
          >
            🚀 Jump to Main Content
          </a>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Custom styled skip link with emoji and animations
          </p>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Brand Colors</h3>
        <div className="relative rounded-sm border-2 border-dashed border-gray-300 p-4">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-sm focus:bg-purple-600 focus:px-4 focus:py-2 focus:text-white focus:shadow-lg focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 focus:outline-hidden dark:text-black"
          >
            Skip to Main Content
          </a>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Skip link using brand purple colors
          </p>
        </div>
      </div>

      <div id="main-content" className="rounded bg-gray-50 p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This is the main content area where skip links would navigate to.
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Examples of different styling approaches for skip navigation links while maintaining accessibility.',
      },
    },
  },
};
