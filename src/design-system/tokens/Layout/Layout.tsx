'use client';

import React from 'react';

// =============================================================================
// LAYOUT TOKEN DEFINITIONS
// =============================================================================

export const layoutTokens = {
  // Container Widths
  containers: {
    xs: '320px', // Mobile small
    sm: '640px', // Mobile large / Tablet small
    md: '768px', // Tablet
    lg: '1024px', // Desktop small
    xl: '1280px', // Desktop
    '2xl': '1536px', // Desktop large
    full: '100%', // Full width
  },

  // Breakpoints (matches Tailwind defaults for consistency)
  breakpoints: {
    xs: '475px', // Extra small devices
    sm: '640px', // Small devices (phones)
    md: '768px', // Medium devices (tablets)
    lg: '1024px', // Large devices (laptops)
    xl: '1280px', // Extra large devices (desktops)
    '2xl': '1536px', // 2X large devices (large desktops)
  },

  // Grid Systems
  grid: {
    // 12-column grid
    columns: {
      1: '8.333333%',
      2: '16.666667%',
      3: '25%',
      4: '33.333333%',
      5: '41.666667%',
      6: '50%',
      7: '58.333333%',
      8: '66.666667%',
      9: '75%',
      10: '83.333333%',
      11: '91.666667%',
      12: '100%',
    },

    // Grid gaps
    gap: {
      none: '0px',
      xs: '8px',
      sm: '12px',
      md: '16px',
      lg: '20px',
      xl: '24px',
      '2xl': '32px',
    },
  },

  // Z-index layers
  zIndex: {
    hide: '-1',
    auto: 'auto',
    base: '0',
    docked: '10', // Docked elements
    dropdown: '1000', // Dropdowns and popovers
    sticky: '1100', // Sticky elements
    banner: '1200', // Banners and announcements
    overlay: '1300', // Modal overlays
    modal: '1400', // Modal content
    popover: '1500', // Popovers and tooltips
    skipLink: '1600', // Skip links
    toast: '1700', // Toast notifications
    tooltip: '1800', // Tooltips
  },

  // Common layout patterns
  patterns: {
    // Sidebar layouts
    sidebarWidths: {
      narrow: '240px',
      default: '280px',
      wide: '320px',
    },

    // Header heights
    headerHeights: {
      compact: '48px',
      default: '64px',
      large: '80px',
    },

    // Footer heights
    footerHeights: {
      minimal: '40px',
      default: '80px',
      extended: '120px',
    },
  },
} as const;

// =============================================================================
// SEMANTIC LAYOUT DEFINITIONS
// =============================================================================

export const semanticLayout = {
  // Page Layout
  page: {
    maxWidth: layoutTokens.containers['2xl'],
    padding: '24px',
    margin: '0 auto',
  },

  // Content Areas
  content: {
    maxWidth: layoutTokens.containers.lg,
    padding: '20px',
    gap: '32px',
  },

  // Navigation
  navigation: {
    height: layoutTokens.patterns.headerHeights.default,
    padding: '12px 24px',
    zIndex: layoutTokens.zIndex.sticky,
  },

  // Cards and Components
  card: {
    padding: '20px',
    gap: '16px',
    borderRadius: '8px',
  },

  // Forms
  form: {
    maxWidth: '600px',
    gap: '20px',
  },
} as const;

// =============================================================================
// LAYOUT VISUALIZATION COMPONENTS
// =============================================================================

interface LayoutSwatchProps {
  name: string;
  value: string;
  type?: 'width' | 'height' | 'percentage' | 'index';
}

export const LayoutSwatch: React.FC<LayoutSwatchProps> = ({ name, value, type = 'width' }) => {
  const getVisualization = () => {
    switch (type) {
      case 'width':
        return (
          <div className="w-full rounded-sm bg-blue-100">
            <div
              className="h-4 rounded-sm bg-blue-500 transition-all"
              style={{ width: value.includes('%') ? value : '100px', maxWidth: '200px' }}
            />
          </div>
        );
      case 'height':
        return (
          <div className="flex h-16 items-end">
            <div
              className="w-16 rounded-sm bg-green-500 transition-all"
              style={{
                height: value.includes('px') ? Math.min(parseInt(value), 64) + 'px' : '32px',
              }}
            />
          </div>
        );
      case 'percentage':
        const percentage = parseFloat(value);
        return (
          <div className="w-full rounded-sm bg-purple-100">
            <div
              className="h-4 rounded-sm bg-purple-500 transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
        );
      case 'index':
        return (
          <div className="relative h-16 w-16 rounded-sm bg-gray-100">
            <div
              className="absolute inset-2 flex items-center justify-center rounded-sm bg-red-500 font-mono text-xs text-white dark:text-black"
              style={{ zIndex: parseInt(value) || 0 }}
            >
              {value}
            </div>
          </div>
        );
      default:
        return <div className="h-4 w-16 rounded-sm bg-gray-300" />;
    }
  };

  return (
    <div className="flex items-center gap-4 rounded-lg border border-gray-200 p-3">
      <div className="w-24 shrink-0">
        <div className="font-mono text-sm text-gray-700 dark:text-gray-300">{name}</div>
        <div className="text-xs text-gray-500 dark:text-gray-500">{value}</div>
      </div>

      <div className="flex min-w-0 flex-1 items-center">{getVisualization()}</div>
    </div>
  );
};

interface LayoutGroupProps {
  title: string;
  layouts: Record<string, string>;
  type?: 'width' | 'height' | 'percentage' | 'index';
  description?: string;
}

export const LayoutGroup: React.FC<LayoutGroupProps> = ({
  title,
  layouts,
  type = 'width',
  description,
}) => (
  <div className="mb-8">
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      {description && <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>}
    </div>
    <div className="space-y-2">
      {Object.entries(layouts).map(([name, value]) => (
        <LayoutSwatch key={name} name={name} value={value} type={type} />
      ))}
    </div>
  </div>
);

interface LayoutDemoProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export const LayoutDemo: React.FC<LayoutDemoProps> = ({ title, description, children }) => (
  <div className="mb-8">
    <div className="mb-4">
      <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">{title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-4">
      {children}
    </div>
  </div>
);

// =============================================================================
// RESPONSIVE DEMO COMPONENT
// =============================================================================

export const ResponsiveDemo: React.FC = () => (
  <div className="space-y-4">
    {Object.entries(layoutTokens.breakpoints).map(([name, width]) => (
      <div key={name} className="flex items-center gap-4">
        <div className="w-12 font-mono text-sm text-gray-700 dark:text-gray-300">{name}</div>
        <div className="relative h-8 flex-1 overflow-hidden rounded-sm bg-gray-200">
          <div
            className="flex h-full items-center justify-center rounded-sm bg-blue-500 text-xs font-medium text-white dark:text-black dark:text-white transition-all"
            style={{
              width: `${Math.min((parseInt(width) / 1536) * 100, 100)}%`,
            }}
          >
            {width}
          </div>
        </div>
      </div>
    ))}
  </div>
);

// =============================================================================
// MAIN LAYOUT COMPONENT
// =============================================================================

const Layout: React.FC = () => {
  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100">Design Tokens: Layout</h1>
        <p className="max-w-2xl text-gray-600 dark:text-gray-400">
          Layout tokens for the Citizenly design system. These tokens provide consistent structure
          and organization across all government applications.
        </p>
      </div>

      {/* Container Widths */}
      <div className="mb-12">
        <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">Container Widths</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Predefined container widths that work across different screen sizes and content types.
        </p>

        <LayoutGroup
          title="Container Sizes"
          layouts={layoutTokens.containers}
          type="width"
          description="Standard container widths for different layouts"
        />

        <LayoutDemo
          title="Container Width Example"
          description="How containers behave at different sizes"
        >
          <div className="space-y-4">
            {Object.entries(layoutTokens.containers)
              .filter(([name]) => !['full'].includes(name))
              .slice(0, 4)
              .map(([name, width]) => (
                <div key={name} className="flex items-center gap-4">
                  <div className="w-12 font-mono text-xs text-gray-600 dark:text-gray-400">{name}</div>
                  <div
                    className="rounded border border-blue-200 bg-blue-100 p-3 text-center text-gray-800 dark:text-gray-200"
                    style={{ maxWidth: width, width: '100%' }}
                  >
                    {width} container
                  </div>
                </div>
              ))}
          </div>
        </LayoutDemo>
      </div>

      {/* Breakpoints */}
      <div className="mb-12">
        <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">Responsive Breakpoints</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Breakpoint system for responsive design, matching Tailwind CSS for consistency.
        </p>

        <LayoutGroup
          title="Breakpoint Values"
          layouts={layoutTokens.breakpoints}
          type="width"
          description="Screen width breakpoints for responsive design"
        />

        <LayoutDemo
          title="Responsive Visualization"
          description="Visual representation of breakpoint sizes"
        >
          <ResponsiveDemo />
        </LayoutDemo>
      </div>

      {/* Grid System */}
      <div className="mb-12">
        <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">Grid System</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          12-column grid system with flexible gaps for consistent layouts.
        </p>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <LayoutGroup
            title="Grid Columns"
            layouts={layoutTokens.grid.columns}
            type="percentage"
            description="12-column grid percentages"
          />

          <LayoutGroup
            title="Grid Gaps"
            layouts={layoutTokens.grid.gap}
            type="width"
            description="Spacing between grid items"
          />
        </div>

        <LayoutDemo
          title="12-Column Grid Example"
          description="Visual demonstration of the grid system"
        >
          <div className="space-y-4">
            {[12, 6, 4, 3, 2, 1].map(columns => (
              <div key={columns} className="flex gap-2">
                <div className="flex w-16 items-center text-xs text-gray-600 dark:text-gray-400 dark:text-gray-600">
                  {12 / columns} col{12 / columns !== 1 ? 's' : ''}
                </div>
                <div
                  className="grid flex-1 gap-2"
                  style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
                >
                  {Array.from({ length: columns }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded border border-green-200 bg-green-100 p-2 text-center text-xs text-green-800"
                    >
                      {Math.round((100 / columns) * 100) / 100}%
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </LayoutDemo>
      </div>

      {/* Z-Index Layers */}
      <div className="mb-12">
        <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">Z-Index Layers</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Organized layering system for overlapping elements and proper stacking context.
        </p>

        <LayoutGroup
          title="Z-Index Values"
          layouts={layoutTokens.zIndex}
          type="index"
          description="Stacking order for UI elements"
        />

        <LayoutDemo
          title="Z-Index Stacking Example"
          description="Visual demonstration of z-index layering"
        >
          <div className="relative h-40 overflow-hidden rounded-sm bg-gray-100">
            {/* Base layer */}
            <div
              className="absolute inset-4 flex items-center justify-center rounded-sm bg-blue-200 text-sm font-medium text-gray-800 dark:text-gray-200"
              style={{ zIndex: layoutTokens.zIndex.base }}
            >
              Base (z: {layoutTokens.zIndex.base})
            </div>

            {/* Docked layer */}
            <div
              className="absolute left-8 right-8 top-8 flex h-16 items-center justify-center rounded-sm bg-green-300 text-sm font-medium text-green-800"
              style={{ zIndex: layoutTokens.zIndex.docked }}
            >
              Docked (z: {layoutTokens.zIndex.docked})
            </div>

            {/* Dropdown layer */}
            <div
              className="absolute left-12 top-12 flex h-12 w-32 items-center justify-center rounded-sm bg-purple-400 text-xs font-medium text-gray-900 dark:text-gray-100"
              style={{ zIndex: layoutTokens.zIndex.dropdown }}
            >
              Dropdown (z: {layoutTokens.zIndex.dropdown})
            </div>

            {/* Modal layer */}
            <div
              className="absolute left-16 top-16 flex h-8 w-24 items-center justify-center rounded-sm bg-red-500 text-xs font-medium text-white dark:text-black"
              style={{ zIndex: layoutTokens.zIndex.modal }}
            >
              Modal (z: {layoutTokens.zIndex.modal})
            </div>
          </div>
        </LayoutDemo>
      </div>

      {/* Layout Patterns */}
      <div className="mb-12">
        <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">Common Layout Patterns</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Predefined dimensions for common layout elements like sidebars, headers, and footers.
        </p>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <LayoutGroup
            title="Sidebar Widths"
            layouts={layoutTokens.patterns.sidebarWidths}
            type="width"
            description="Standard sidebar dimensions"
          />

          <LayoutGroup
            title="Header Heights"
            layouts={layoutTokens.patterns.headerHeights}
            type="height"
            description="Navigation header heights"
          />

          <LayoutGroup
            title="Footer Heights"
            layouts={layoutTokens.patterns.footerHeights}
            type="height"
            description="Page footer heights"
          />
        </div>

        <LayoutDemo
          title="Layout Pattern Example"
          description="Typical government website layout structure"
        >
          <div className="overflow-hidden rounded-sm border border-gray-300 bg-white">
            {/* Header */}
            <div
              className="flex items-center bg-blue-600 px-4 text-sm font-medium text-white dark:text-black"
              style={{ height: layoutTokens.patterns.headerHeights.default }}
            >
              Header ({layoutTokens.patterns.headerHeights.default})
            </div>

            <div className="flex">
              {/* Sidebar */}
              <div
                className="flex items-center justify-center border-r border-gray-300 bg-gray-100 p-4 text-sm text-gray-700 dark:text-gray-300"
                style={{ width: layoutTokens.patterns.sidebarWidths.default, height: '200px' }}
              >
                Sidebar
                <br />({layoutTokens.patterns.sidebarWidths.default})
              </div>

              {/* Main Content */}
              <div className="flex-1 p-6">
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">Main Content Area</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This area uses the remaining space after accounting for the sidebar width. Content
                  flows naturally within the available space.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div
              className="flex items-center border-t border-gray-300 bg-gray-200 px-4 text-sm text-gray-700 dark:text-gray-300"
              style={{ height: layoutTokens.patterns.footerHeights.default }}
            >
              Footer ({layoutTokens.patterns.footerHeights.default})
            </div>
          </div>
        </LayoutDemo>
      </div>

      {/* Usage Guidelines */}
      <div className="rounded-lg border border-green-200 bg-green-50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-green-900">🏗️ Layout Guidelines</h3>
        <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-2">
          <div>
            <h4 className="mb-2 font-semibold text-green-900">Container Usage</h4>
            <ul className="space-y-1 text-green-800">
              <li>• Use standard container widths for consistency</li>
              <li>• Apply appropriate max-widths for content readability</li>
              <li>• Center containers with margin: 0 auto</li>
              <li>• Use full width sparingly for special layouts</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 font-semibold text-green-900">Responsive Design</h4>
            <ul className="space-y-1 text-green-800">
              <li>• Start with mobile-first approach</li>
              <li>• Use breakpoints consistently across components</li>
              <li>• Test layouts at all major breakpoints</li>
              <li>• Consider touch targets on smaller screens</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-green-300 bg-green-100 p-4">
          <h4 className="mb-2 font-semibold text-green-900">💡 Pro Tips</h4>
          <ul className="space-y-1 text-sm text-green-800">
            <li>• Use semantic layout tokens over hardcoded values</li>
            <li>• Maintain consistent z-index organization</li>
            <li>• Test grid systems with real content</li>
            <li>• Consider accessibility at all breakpoints</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Layout;
