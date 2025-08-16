import type { Meta, StoryObj } from '@storybook/react';
import Layout, {
  LayoutSwatch,
  LayoutGroup,
  LayoutDemo,
  ResponsiveDemo,
  layoutTokens,
  semanticLayout,
} from './Layout';

const meta = {
  title: 'Design System/Layout',
  component: Layout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Layout Tokens

Comprehensive layout system for the Citizenly design system, providing consistent 
structure and organization across all Philippine government applications.

## Layout Philosophy

- **Container-First**: Predefined container widths for different content types
- **Responsive by Design**: Mobile-first approach with consistent breakpoints  
- **Grid-Based**: 12-column grid system with flexible gaps
- **Layered Organization**: Structured z-index system for proper stacking
- **Pattern-Driven**: Common layout patterns for government websites

## Layout Categories

### Container Widths
Predefined container sizes for different layout needs:
- **xs (320px)**: Mobile small screens
- **sm (640px)**: Mobile large / Tablet small
- **md (768px)**: Tablet screens
- **lg (1024px)**: Desktop small
- **xl (1280px)**: Standard desktop
- **2xl (1536px)**: Large desktop screens

### Responsive Breakpoints
Screen width breakpoints matching Tailwind CSS:
- **xs (475px)**: Extra small devices
- **sm (640px)**: Small devices (phones)
- **md (768px)**: Medium devices (tablets)
- **lg (1024px)**: Large devices (laptops)
- **xl (1280px)**: Extra large devices (desktops)
- **2xl (1536px)**: Large desktop displays

### Grid System
- **12-Column Grid**: Flexible percentage-based columns (8.33% to 100%)
- **Grid Gaps**: Consistent spacing from 0px to 32px
- **Responsive**: Works across all breakpoints

### Z-Index Layers
Organized stacking system:
- **base (0)**: Base elements
- **docked (10)**: Docked elements  
- **dropdown (1000)**: Dropdowns and popovers
- **sticky (1100)**: Sticky elements
- **overlay (1300)**: Modal overlays
- **modal (1400)**: Modal content
- **toast (1700)**: Toast notifications
- **tooltip (1800)**: Tooltips (highest)

### Layout Patterns
Common government website patterns:
- **Sidebar Widths**: 240px (narrow), 280px (default), 320px (wide)
- **Header Heights**: 48px (compact), 64px (default), 80px (large)
- **Footer Heights**: 40px (minimal), 80px (default), 120px (extended)

## Usage in Code

\`\`\`tsx
// Container widths
<div className="max-w-4xl mx-auto"> // lg container
<div style={{ maxWidth: layoutTokens.containers.xl }}>

// Responsive breakpoints
@media (min-width: ${layoutTokens.breakpoints.md}) {
  // Tablet styles
}

// Grid system
<div className="grid grid-cols-12 gap-4">
<div style={{ width: layoutTokens.grid.columns[6] }}> // 50% width

// Z-index layering
.modal {
  z-index: ${layoutTokens.zIndex.modal};
}

// Layout patterns
.sidebar {
  width: ${layoutTokens.patterns.sidebarWidths.default};
}
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Layout>;

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// MAIN STORIES
// =============================================================================

export const AllLayout: Story = {
  name: '🏗️ All Layout',
  render: () => <Layout />,
};

export const ContainerWidths: Story = {
  name: '📐 Container Widths',
  render: () => (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">Container Width System</h1>
      <p className="mb-8 text-gray-600 dark:text-gray-400">
        Predefined container widths that provide consistent content boundaries across different
        screen sizes.
      </p>

      <LayoutGroup
        title="Container Sizes"
        layouts={layoutTokens.containers}
        type="width"
        description="Standard container widths for different layout needs"
      />

      <LayoutDemo title="Container Comparison" description="Visual comparison of container sizes">
        <div className="space-y-6">
          {Object.entries(layoutTokens.containers)
            .filter(([name]) => !['full'].includes(name))
            .map(([name, width]) => (
              <div key={name} className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-8 font-mono text-gray-600 dark:text-gray-400">{name}:</span>
                  <span className="text-gray-500 dark:text-gray-500">{width}</span>
                </div>
                <div
                  className="mx-auto rounded-sm border border-blue-200 bg-blue-100 p-4 text-center text-gray-800 dark:text-gray-200"
                  style={{
                    maxWidth: width === 'full' ? '100%' : width,
                    width: '100%',
                  }}
                >
                  {width} container content area
                </div>
              </div>
            ))}
        </div>
      </LayoutDemo>

      <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">📱 Container Usage</h3>
        <ul className="space-y-1 text-sm text-gray-800 dark:text-gray-200">
          <li>
            • <strong>xs-sm</strong>: Mobile-optimized layouts and forms
          </li>
          <li>
            • <strong>md</strong>: Tablet interfaces and narrow content
          </li>
          <li>
            • <strong>lg</strong>: Standard desktop content and dashboards
          </li>
          <li>
            • <strong>xl-2xl</strong>: Wide desktop layouts and data tables
          </li>
          <li>
            • <strong>full</strong>: Hero sections and immersive experiences
          </li>
        </ul>
      </div>
    </div>
  ),
};

export const ResponsiveBreakpoints: Story = {
  name: '📱 Responsive Breakpoints',
  render: () => (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">Responsive Breakpoint System</h1>
      <p className="mb-8 text-gray-600 dark:text-gray-400">
        Screen width breakpoints for responsive design, ensuring consistent behavior across all
        government applications.
      </p>

      <LayoutGroup
        title="Breakpoint Values"
        layouts={layoutTokens.breakpoints}
        type="width"
        description="Responsive design breakpoints matching modern web standards"
      />

      <LayoutDemo
        title="Breakpoint Visualization"
        description="Relative scale of different screen sizes"
      >
        <ResponsiveDemo />
      </LayoutDemo>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <h3 className="mb-2 font-semibold text-green-900">📱 Device Mapping</h3>
          <ul className="space-y-1 text-sm text-green-800">
            <li>
              • <strong>xs (475px)</strong>: Small phones, feature phones
            </li>
            <li>
              • <strong>sm (640px)</strong>: Standard smartphones
            </li>
            <li>
              • <strong>md (768px)</strong>: Tablets, large phones landscape
            </li>
            <li>
              • <strong>lg (1024px)</strong>: Laptops, small desktops
            </li>
            <li>
              • <strong>xl (1280px)</strong>: Desktop monitors
            </li>
            <li>
              • <strong>2xl (1536px)</strong>: Large displays, ultrawide
            </li>
          </ul>
        </div>

        <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
          <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">🎯 Usage Guidelines</h3>
          <ul className="space-y-1 text-sm text-gray-800 dark:text-gray-200">
            <li>• Design mobile-first, enhance for larger screens</li>
            <li>• Test critical features at all breakpoints</li>
            <li>• Use consistent breakpoints across all components</li>
            <li>• Consider touch targets on smaller screens</li>
            <li>• Ensure accessibility at all screen sizes</li>
          </ul>
        </div>
      </div>
    </div>
  ),
};

export const GridSystem: Story = {
  name: '⚏ Grid System',
  render: () => (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">12-Column Grid System</h1>
      <p className="mb-8 text-gray-600 dark:text-gray-400">
        Flexible grid system for consistent layouts and responsive design across government
        applications.
      </p>

      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <LayoutGroup
          title="Grid Columns"
          layouts={layoutTokens.grid.columns}
          type="percentage"
          description="12-column grid percentage widths"
        />

        <LayoutGroup
          title="Grid Gaps"
          layouts={layoutTokens.grid.gap}
          type="width"
          description="Consistent spacing between grid items"
        />
      </div>

      <LayoutDemo
        title="Grid Column Examples"
        description="Visual demonstration of different column combinations"
      >
        <div className="space-y-6">
          {/* 12 columns */}
          <div>
            <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">12 Columns (1 each)</div>
            <div className="grid grid-cols-12 gap-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="rounded bg-blue-200 p-2 text-center text-xs text-gray-800 dark:text-gray-200">
                  1
                </div>
              ))}
            </div>
          </div>

          {/* 6 columns */}
          <div>
            <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">6 Columns (2 each)</div>
            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded bg-green-200 p-3 text-center text-xs text-green-800"
                >
                  2
                </div>
              ))}
            </div>
          </div>

          {/* 4 columns */}
          <div>
            <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">4 Columns (3 each)</div>
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded bg-purple-200 p-4 text-center text-xs text-gray-800 dark:text-gray-200"
                >
                  3
                </div>
              ))}
            </div>
          </div>

          {/* 3 columns */}
          <div>
            <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">3 Columns (4 each)</div>
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded bg-orange-200 p-5 text-center text-xs text-orange-800"
                >
                  4
                </div>
              ))}
            </div>
          </div>

          {/* Mixed columns */}
          <div>
            <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Mixed Layout (8 + 4)</div>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-8 rounded-sm bg-red-200 p-6 text-center text-sm text-red-800">
                Main Content (8 columns)
              </div>
              <div className="col-span-4 rounded-sm bg-yellow-200 p-6 text-center text-sm text-yellow-800">
                Sidebar (4 columns)
              </div>
            </div>
          </div>
        </div>
      </LayoutDemo>

      <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <h3 className="mb-2 font-semibold text-amber-900">⚏ Grid Best Practices</h3>
        <ul className="space-y-1 text-sm text-amber-800">
          <li>• Use grid gaps for consistent spacing between elements</li>
          <li>• Combine columns to create common layouts (8+4, 6+6, 9+3)</li>
          <li>• Consider content needs when choosing column spans</li>
          <li>• Test grid layouts on mobile devices</li>
          <li>• Use responsive grid classes for different breakpoints</li>
        </ul>
      </div>
    </div>
  ),
};

export const ZIndexLayers: Story = {
  name: '📚 Z-Index Layers',
  render: () => (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">Z-Index Layering System</h1>
      <p className="mb-8 text-gray-600 dark:text-gray-400">
        Organized layering system for managing stacking context and overlapping elements.
      </p>

      <LayoutGroup
        title="Z-Index Values"
        layouts={layoutTokens.zIndex}
        type="index"
        description="Hierarchical stacking order for UI elements"
      />

      <LayoutDemo
        title="Z-Index Demonstration"
        description="Interactive stacking layers showing proper hierarchy"
      >
        <div className="relative h-64 overflow-hidden rounded-sm bg-gray-100">
          {/* Base layer */}
          <div
            className="absolute inset-6 flex items-center justify-center rounded-sm border-2 border-blue-300 bg-blue-200 font-medium text-gray-800 dark:text-gray-200"
            style={{ zIndex: parseInt(layoutTokens.zIndex.base) }}
          >
            Base Layer (z: {layoutTokens.zIndex.base})
          </div>

          {/* Docked layer */}
          <div
            className="absolute left-10 right-10 top-10 flex h-20 items-center justify-center rounded-sm border-2 border-green-400 bg-green-300 font-medium text-green-800"
            style={{ zIndex: parseInt(layoutTokens.zIndex.docked) }}
          >
            Docked Element (z: {layoutTokens.zIndex.docked})
          </div>

          {/* Dropdown layer */}
          <div
            className="absolute left-16 top-16 flex h-16 w-40 items-center justify-center rounded-sm border-2 border-purple-500 bg-purple-400 text-sm font-medium text-gray-900 dark:text-gray-100"
            style={{ zIndex: parseInt(layoutTokens.zIndex.dropdown) }}
          >
            Dropdown (z: {layoutTokens.zIndex.dropdown})
          </div>

          {/* Overlay layer */}
          <div
            className="absolute left-20 top-20 flex h-12 w-32 items-center justify-center rounded-sm border-2 border-yellow-500 bg-yellow-400 text-sm font-medium text-yellow-900"
            style={{ zIndex: parseInt(layoutTokens.zIndex.overlay) }}
          >
            Overlay (z: {layoutTokens.zIndex.overlay})
          </div>

          {/* Modal layer */}
          <div
            className="absolute left-24 top-24 flex h-10 w-24 items-center justify-center rounded-sm border-2 border-red-600 bg-red-500 text-xs font-medium text-white dark:text-black"
            style={{ zIndex: parseInt(layoutTokens.zIndex.modal) }}
          >
            Modal (z: {layoutTokens.zIndex.modal})
          </div>

          {/* Tooltip layer */}
          <div
            className="absolute left-28 top-28 flex h-8 w-20 items-center justify-center rounded-sm bg-gray-800 text-xs font-medium text-white dark:text-black"
            style={{ zIndex: parseInt(layoutTokens.zIndex.tooltip) }}
          >
            Tooltip (z: {layoutTokens.zIndex.tooltip})
          </div>
        </div>
      </LayoutDemo>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
          <h3 className="mb-2 font-semibold text-indigo-900">📋 Layer Categories</h3>
          <ul className="space-y-1 text-sm text-indigo-800">
            <li>
              • <strong>0-100</strong>: Base content and layout elements
            </li>
            <li>
              • <strong>1000-1200</strong>: Floating UI (dropdowns, sticky)
            </li>
            <li>
              • <strong>1300-1500</strong>: Modal and overlay systems
            </li>
            <li>
              • <strong>1600-1800</strong>: Accessibility and notifications
            </li>
          </ul>
        </div>

        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
          <h3 className="mb-2 font-semibold text-rose-900">⚠️ Usage Rules</h3>
          <ul className="space-y-1 text-sm text-rose-800">
            <li>• Always use semantic z-index tokens</li>
            <li>• Test stacking with real content</li>
            <li>• Avoid z-index wars with arbitrary values</li>
            <li>• Consider accessibility when layering</li>
            <li>• Document custom stacking contexts</li>
          </ul>
        </div>
      </div>
    </div>
  ),
};

export const LayoutPatterns: Story = {
  name: '🏛️ Layout Patterns',
  render: () => (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">Common Layout Patterns</h1>
      <p className="mb-8 text-gray-600 dark:text-gray-400">
        Predefined dimensions for common government website layout elements and patterns.
      </p>

      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <LayoutGroup
          title="Sidebar Widths"
          layouts={layoutTokens.patterns.sidebarWidths}
          type="width"
          description="Navigation and auxiliary content areas"
        />

        <LayoutGroup
          title="Header Heights"
          layouts={layoutTokens.patterns.headerHeights}
          type="height"
          description="Top navigation and branding areas"
        />

        <LayoutGroup
          title="Footer Heights"
          layouts={layoutTokens.patterns.footerHeights}
          type="height"
          description="Page footer and supplementary info"
        />
      </div>

      <LayoutDemo
        title="Government Website Layout"
        description="Typical layout structure using standard patterns"
      >
        <div className="overflow-hidden rounded-sm border border-gray-300 bg-white shadow-xs">
          {/* Header */}
          <div
            className="flex items-center justify-between bg-blue-600 px-6 text-sm font-medium text-white dark:text-black"
            style={{ height: layoutTokens.patterns.headerHeights.default }}
          >
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-sm bg-white bg-opacity-20"></div>
              <span>Philippine Government Portal</span>
            </div>
            <div className="text-xs">Header: {layoutTokens.patterns.headerHeights.default}</div>
          </div>

          <div className="flex">
            {/* Sidebar */}
            <div
              className="border-r border-gray-200 bg-gray-50 p-4"
              style={{
                width: layoutTokens.patterns.sidebarWidths.default,
                minHeight: '240px',
              }}
            >
              <div className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Navigation</div>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="rounded bg-blue-100 p-2 text-gray-700 dark:text-gray-300">Services</div>
                <div className="rounded p-2 hover:bg-gray-100">About</div>
                <div className="rounded p-2 hover:bg-gray-100">Contact</div>
                <div className="rounded p-2 hover:bg-gray-100">Resources</div>
              </div>
              <div className="mt-4 text-xs text-gray-500 dark:text-gray-500">
                Width: {layoutTokens.patterns.sidebarWidths.default}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
              <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">
                Welcome to Government Services
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <p>
                  This main content area adapts to the available space after accounting for the
                  sidebar width of {layoutTokens.patterns.sidebarWidths.default}.
                </p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded border border-blue-200 bg-blue-50 p-4">
                    <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Online Services</h3>
                    <p className="text-sm text-gray-800 dark:text-gray-200">Access government services online</p>
                  </div>
                  <div className="rounded border border-green-200 bg-green-50 p-4">
                    <h3 className="mb-2 font-semibold text-green-900">Document Request</h3>
                    <p className="text-sm text-green-800">Request official documents</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between border-t border-gray-200 bg-gray-100 px-6 text-sm text-gray-600 dark:text-gray-400"
            style={{ height: layoutTokens.patterns.footerHeights.default }}
          >
            <div>© 2024 Republic of the Philippines</div>
            <div className="text-xs">Footer: {layoutTokens.patterns.footerHeights.default}</div>
          </div>
        </div>
      </LayoutDemo>

      {/* Pattern variations */}
      <div className="mt-8 space-y-6">
        <LayoutDemo
          title="Compact Layout Variation"
          description="Smaller dimensions for information-dense interfaces"
        >
          <div className="overflow-hidden rounded-sm border border-gray-300 bg-white">
            <div
              className="flex items-center bg-blue-500 px-4 text-sm text-white dark:text-black"
              style={{ height: layoutTokens.patterns.headerHeights.compact }}
            >
              Compact Header ({layoutTokens.patterns.headerHeights.compact})
            </div>
            <div className="flex">
              <div
                className="border-r border-gray-200 bg-gray-50 p-3 text-sm"
                style={{ width: layoutTokens.patterns.sidebarWidths.narrow }}
              >
                Narrow Sidebar
                <br />
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  ({layoutTokens.patterns.sidebarWidths.narrow})
                </span>
              </div>
              <div className="flex-1 p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Compact layout for dense information display
                </div>
              </div>
            </div>
          </div>
        </LayoutDemo>

        <LayoutDemo
          title="Spacious Layout Variation"
          description="Larger dimensions for content-focused interfaces"
        >
          <div className="overflow-hidden rounded-sm border border-gray-300 bg-white">
            <div
              className="flex items-center bg-blue-700 px-6 text-lg font-medium text-white dark:text-black"
              style={{ height: layoutTokens.patterns.headerHeights.large }}
            >
              Large Header ({layoutTokens.patterns.headerHeights.large})
            </div>
            <div className="flex">
              <div
                className="border-r border-gray-200 bg-gray-50 p-5"
                style={{ width: layoutTokens.patterns.sidebarWidths.wide }}
              >
                Wide Sidebar
                <br />
                <span className="text-sm text-gray-500 dark:text-gray-500">
                  ({layoutTokens.patterns.sidebarWidths.wide})
                </span>
                <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                  More space for navigation and auxiliary content
                </div>
              </div>
              <div className="flex-1 p-6">
                <div className="text-gray-600 dark:text-gray-400">
                  Spacious layout for content-focused applications
                </div>
              </div>
            </div>
          </div>
        </LayoutDemo>
      </div>

      <div className="mt-8 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="mb-2 font-semibold text-yellow-900">🏛️ Government Layout Guidelines</h3>
        <ul className="space-y-1 text-sm text-yellow-800">
          <li>• Use consistent header heights across related applications</li>
          <li>• Choose sidebar widths based on navigation complexity</li>
          <li>• Ensure footer contains required government information</li>
          <li>• Test layouts with real content and long text</li>
          <li>• Consider accessibility guidelines for layout patterns</li>
        </ul>
      </div>
    </div>
  ),
};

export const SemanticLayout: Story = {
  name: '🎯 Semantic Layout',
  render: () => (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">Semantic Layout Tokens</h1>
      <p className="mb-8 text-gray-600 dark:text-gray-400">
        Contextual layout tokens that provide meaning and consistency for specific use cases.
      </p>

      <div className="space-y-8">
        {Object.entries(semanticLayout).map(([category, tokens]) => (
          <div key={category} className="rounded-lg border border-gray-200 p-6">
            <h3 className="mb-4 text-lg font-semibold capitalize text-gray-900 dark:text-gray-100">
              {category} Layout
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(tokens as Record<string, string>).map(([name, value]) => (
                <div key={name} className="flex items-center gap-3 rounded-sm bg-gray-50 p-3">
                  <div className="w-20 font-mono text-sm text-gray-700 dark:text-gray-300">{name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{value}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <LayoutDemo
        title="Semantic Layout Usage Example"
        description="How semantic tokens create consistent layouts"
      >
        <div
          className="overflow-hidden rounded-sm border border-gray-200 bg-white"
          style={{
            maxWidth: semanticLayout.page.maxWidth,
            margin: semanticLayout.page.margin,
            padding: semanticLayout.page.padding,
          }}
        >
          <div
            className="flex items-center bg-blue-600 px-6 text-white dark:text-black"
            style={{
              height: semanticLayout.navigation.height,
              padding: semanticLayout.navigation.padding,
              zIndex: semanticLayout.navigation.zIndex,
            }}
          >
            Navigation using semantic tokens
          </div>

          <div
            className="p-6"
            style={{
              maxWidth: semanticLayout.content.maxWidth,
              padding: semanticLayout.content.padding,
              gap: semanticLayout.content.gap,
            }}
          >
            <div
              className="rounded border border-gray-200 bg-gray-50"
              style={{
                padding: semanticLayout.card.padding,
                borderRadius: semanticLayout.card.borderRadius,
              }}
            >
              Card using semantic padding and border radius
            </div>
          </div>
        </div>
      </LayoutDemo>

      <div className="mt-8 rounded-lg border border-teal-200 bg-teal-50 p-4">
        <h3 className="mb-2 font-semibold text-teal-900">🎯 Semantic Benefits</h3>
        <ul className="space-y-1 text-sm text-teal-800">
          <li>• Self-documenting code with meaningful token names</li>
          <li>• Consistent patterns across different components</li>
          <li>• Easy maintenance and global updates</li>
          <li>• Context-appropriate sizing and spacing</li>
        </ul>
      </div>
    </div>
  ),
};
