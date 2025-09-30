'use client';

import React from 'react';

// =============================================================================
// SPACING TOKEN DEFINITIONS
// =============================================================================

export const spacingTokens = {
  // Base spacing scale (4px increments)
  0: '0px',
  px: '1px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  36: '144px',
  40: '160px',
  44: '176px',
  48: '192px',
  52: '208px',
  56: '224px',
  60: '240px',
  64: '256px',
  72: '288px',
  80: '320px',
  96: '384px',
} as const;

// =============================================================================
// SEMANTIC SPACING DEFINITIONS
// =============================================================================

export const semanticSpacing = {
  // Component Internal Spacing
  component: {
    xs: spacingTokens[1], // 4px - Tight internal spacing
    sm: spacingTokens[2], // 8px - Small internal spacing
    md: spacingTokens[3], // 12px - Medium internal spacing
    lg: spacingTokens[4], // 16px - Large internal spacing
    xl: spacingTokens[6], // 24px - Extra large internal spacing
  },

  // Layout Spacing
  layout: {
    xs: spacingTokens[4], // 16px - Tight layout spacing
    sm: spacingTokens[6], // 24px - Small layout spacing
    md: spacingTokens[8], // 32px - Medium layout spacing
    lg: spacingTokens[12], // 48px - Large layout spacing
    xl: spacingTokens[16], // 64px - Extra large layout spacing
    '2xl': spacingTokens[24], // 96px - Section spacing
    '3xl': spacingTokens[32], // 128px - Page section spacing
  },

  // Content Spacing
  content: {
    paragraph: spacingTokens[4], // 16px - Between paragraphs
    heading: spacingTokens[6], // 24px - Below headings
    section: spacingTokens[12], // 48px - Between sections
    subsection: spacingTokens[8], // 32px - Between subsections
  },

  // Form Spacing
  form: {
    fieldGap: spacingTokens[4], // 16px - Between form fields
    groupGap: spacingTokens[8], // 32px - Between form groups
    labelGap: spacingTokens[1], // 4px - Between label and input
    helpGap: spacingTokens[1], // 4px - Between input and help text
    buttonGap: spacingTokens[3], // 12px - Between buttons
  },

  // Container Padding
  container: {
    xs: spacingTokens[4], // 16px - Mobile padding
    sm: spacingTokens[6], // 24px - Tablet padding
    md: spacingTokens[8], // 32px - Desktop padding
    lg: spacingTokens[12], // 48px - Large desktop padding
    xl: spacingTokens[16], // 64px - Extra large padding
  },
} as const;

// =============================================================================
// SPACING VISUALIZATION COMPONENTS
// =============================================================================

interface SpacingSwatchProps {
  name: string;
  value: string;
  showValue?: boolean;
}

export const SpacingSwatch: React.FC<SpacingSwatchProps> = ({ name, value, showValue = true }) => {
  const pixelValue = parseInt(value);
  const isLarge = pixelValue > 48;

  return (
    <div className="flex items-center gap-4 rounded-lg border border-gray-200 p-3">
      <div className="shrink-0">
        <div className="w-12 font-mono text-sm text-gray-700 dark:text-gray-300">{name}</div>
        {showValue && <div className="text-xs text-gray-500 dark:text-gray-500">{value}</div>}
      </div>

      <div className="flex flex-1 items-center">
        <div
          className="shrink-0 bg-blue-500 transition-all"
          style={{
            width: isLarge ? '48px' : value,
            height: '16px',
            maxWidth: '200px',
          }}
        />
        {isLarge && (
          <div className="ml-2 text-xs text-gray-400 dark:text-gray-600">
            (scaled down for display)
          </div>
        )}
      </div>
    </div>
  );
};

interface SpacingGroupProps {
  title: string;
  spacings: Record<string, string>;
  description?: string;
}

export const SpacingGroup: React.FC<SpacingGroupProps> = ({ title, spacings, description }) => (
  <div className="mb-8">
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
      )}
    </div>
    <div className="space-y-2">
      {Object.entries(spacings).map(([name, value]) => (
        <SpacingSwatch key={name} name={name} value={value} />
      ))}
    </div>
  </div>
);

interface SpacingDemoProps {
  title: string;
  spacing: string;
  children: React.ReactNode;
}

export const SpacingDemo: React.FC<SpacingDemoProps> = ({ title, spacing, children }) => (
  <div className="mb-6">
    <h4 className="text-md mb-2 font-medium text-gray-900 dark:text-gray-100">
      {title}{' '}
      <span className="font-mono text-sm text-gray-500 dark:text-gray-500">({spacing})</span>
    </h4>
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">{children}</div>
  </div>
);

// =============================================================================
// MAIN SPACING COMPONENT
// =============================================================================

const Spacing: React.FC = () => {
  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
          Design Tokens: Spacing
        </h1>
        <p className="max-w-2xl text-gray-600 dark:text-gray-400">
          Spacing tokens for the Citizenly design system. These tokens ensure consistent rhythm and
          alignment across all government applications using a 4px base grid.
        </p>
      </div>

      {/* Base Spacing Scale */}
      <div className="mb-12">
        <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Base Spacing Scale
        </h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Built on a 4px base grid system for pixel-perfect alignment across all screen sizes.
        </p>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Small Values */}
          <div>
            <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
              Small Values (0-24px)
            </h3>
            <div className="space-y-2">
              {Object.entries(spacingTokens)
                .filter(([_, value]) => parseInt(value) <= 24)
                .map(([name, value]) => (
                  <SpacingSwatch key={name} name={name} value={value} />
                ))}
            </div>
          </div>

          {/* Medium Values */}
          <div>
            <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
              Medium Values (28-96px)
            </h3>
            <div className="space-y-2">
              {Object.entries(spacingTokens)
                .filter(([_, value]) => {
                  const px = parseInt(value);
                  return px >= 28 && px <= 96;
                })
                .map(([name, value]) => (
                  <SpacingSwatch key={name} name={name} value={value} />
                ))}
            </div>
          </div>
        </div>

        {/* Large Values */}
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
            Large Values (112px+)
          </h3>
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
            {Object.entries(spacingTokens)
              .filter(([_, value]) => parseInt(value) > 96)
              .map(([name, value]) => (
                <SpacingSwatch key={name} name={name} value={value} />
              ))}
          </div>
        </div>
      </div>

      {/* Semantic Spacing */}
      <div className="mb-12">
        <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Semantic Spacing
        </h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Contextual spacing tokens that provide meaning and consistency across different use cases.
        </p>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <SpacingGroup
            title="Component Spacing"
            spacings={semanticSpacing.component}
            description="Internal spacing within components"
          />

          <SpacingGroup
            title="Layout Spacing"
            spacings={semanticSpacing.layout}
            description="Spacing between major layout elements"
          />

          <SpacingGroup
            title="Content Spacing"
            spacings={semanticSpacing.content}
            description="Spacing for text and content elements"
          />

          <SpacingGroup
            title="Form Spacing"
            spacings={semanticSpacing.form}
            description="Spacing specific to form elements"
          />
        </div>
      </div>

      {/* Visual Examples */}
      <div className="mb-12">
        <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Spacing in Action
        </h2>

        {/* Component Spacing Example */}
        <SpacingDemo title="Component Internal Spacing" spacing="12px">
          <div
            className="rounded-lg border border-blue-200 bg-blue-100"
            style={{ padding: semanticSpacing.component.md }}
          >
            <h4 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Card Component</h4>
            <p className="text-sm text-gray-800 dark:text-gray-200">
              This card uses medium component spacing (12px) for internal padding.
            </p>
          </div>
        </SpacingDemo>

        {/* Layout Spacing Example */}
        <SpacingDemo title="Layout Element Spacing" spacing="32px">
          <div className="space-y-8">
            <div className="rounded-lg border border-green-200 bg-green-100 p-4">
              <h4 className="font-semibold text-green-900">Section One</h4>
              <p className="text-sm text-green-800">First content section</p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-100 p-4">
              <h4 className="font-semibold text-green-900">Section Two</h4>
              <p className="text-sm text-green-800">Second content section with layout spacing</p>
            </div>
          </div>
        </SpacingDemo>

        {/* Form Spacing Example */}
        <SpacingDemo title="Form Element Spacing" spacing="16px field gap">
          <div className="max-w-md">
            <div style={{ marginBottom: semanticSpacing.form.fieldGap }}>
              <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-100">
                First Name
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Enter first name"
              />
            </div>

            <div style={{ marginBottom: semanticSpacing.form.fieldGap }}>
              <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-100">
                Last Name
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Enter last name"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button className="rounded-md bg-blue-600 px-4 py-2 text-white dark:text-black">
                Submit
              </button>
              <button className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 dark:text-gray-300">
                Cancel
              </button>
            </div>
          </div>
        </SpacingDemo>
      </div>

      {/* Grid System */}
      <div className="mb-12">
        <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">
          4px Grid System
        </h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          All spacing values are multiples of 4px to ensure consistent alignment and rhythm.
        </p>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">
            Grid Visualization
          </h3>
          <div className="relative">
            {/* Grid Background */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #3b82f6 1px, transparent 1px),
                  linear-gradient(to bottom, #3b82f6 1px, transparent 1px)
                `,
                backgroundSize: '4px 4px',
              }}
            />

            {/* Content */}
            <div className="relative z-10 p-4">
              <div className="mb-4 inline-block rounded-sm bg-blue-500 p-4 text-white dark:text-black">
                16px padding (4 × 4px)
              </div>
              <div className="mb-6 ml-8 inline-block rounded-sm bg-green-500 p-6 text-white dark:text-black">
                24px padding (6 × 4px)
              </div>
              <div className="inline-block rounded-sm bg-purple-500 p-8 text-white dark:text-black">
                32px padding (8 × 4px)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Guidelines */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          📏 Spacing Guidelines
        </h3>
        <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-2">
          <div>
            <h4 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
              Component Spacing
            </h4>
            <ul className="space-y-1 text-gray-800 dark:text-gray-200">
              <li>• Use xs (4px) for tight internal spacing</li>
              <li>• Use sm-md (8-12px) for comfortable internal spacing</li>
              <li>• Use lg-xl (16-24px) for generous internal spacing</li>
              <li>• Maintain consistent spacing within component families</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Layout Spacing</h4>
            <ul className="space-y-1 text-gray-800 dark:text-gray-200">
              <li>• Use sm (24px) for related content grouping</li>
              <li>• Use md (32px) for general section spacing</li>
              <li>• Use lg-xl (48-64px) for major page sections</li>
              <li>• Use 2xl-3xl (96-128px) for page-level separation</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-blue-300 bg-blue-100 p-4">
          <h4 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">💡 Pro Tips</h4>
          <ul className="space-y-1 text-sm text-gray-800 dark:text-gray-200">
            <li>• Always use semantic spacing tokens over raw values</li>
            <li>• Test spacing on different screen sizes</li>
            <li>• Maintain consistent spacing patterns within page sections</li>
            <li>• Use larger spacing for visual hierarchy</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Spacing;
