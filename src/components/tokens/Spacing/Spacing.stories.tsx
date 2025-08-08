import type { Meta, StoryObj } from '@storybook/react';
import Spacing, {
  SpacingSwatch,
  SpacingGroup,
  SpacingDemo,
  spacingTokens,
  semanticSpacing,
} from './Spacing';

const meta = {
  title: 'Design Tokens/Spacing',
  component: Spacing,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Spacing Tokens

Spacing system for the Citizenly design system, built on a 4px base grid to ensure 
consistent rhythm and alignment across all government applications.

## Spacing Philosophy

- **4px Base Grid**: All spacing values are multiples of 4px for pixel-perfect alignment
- **Semantic Naming**: Contextual tokens (component, layout, form) for meaningful usage
- **Progressive Scale**: Smaller increments at small sizes, larger jumps at large sizes
- **Responsive Friendly**: Values work well across all screen sizes

## Spacing Categories

### Base Scale (0-384px)
Raw spacing values from 0px to 384px in 4px increments. Use these for custom spacing needs.

### Component Spacing
Internal spacing within components:
- **xs (4px)**: Tight spacing for compact elements
- **sm (8px)**: Small internal spacing
- **md (12px)**: Medium internal spacing (most common)
- **lg (16px)**: Large internal spacing
- **xl (24px)**: Extra large internal spacing

### Layout Spacing  
Spacing between major layout elements:
- **xs (16px)**: Tight layout spacing
- **sm (24px)**: Small layout spacing
- **md (32px)**: Medium layout spacing
- **lg (48px)**: Large layout spacing
- **xl (64px)**: Extra large layout spacing
- **2xl (96px)**: Section spacing
- **3xl (128px)**: Page section spacing

### Form Spacing
Specialized spacing for forms:
- **fieldGap (16px)**: Between form fields
- **groupGap (32px)**: Between form groups
- **labelGap (4px)**: Between label and input
- **helpGap (4px)**: Between input and help text
- **buttonGap (12px)**: Between buttons

## Usage in Code

\`\`\`tsx
// Tailwind CSS classes
<div className="p-4 mb-6 space-y-3">

// Custom CSS with tokens
<div style={{ padding: spacingTokens[4], marginBottom: spacingTokens[6] }}>

// Semantic spacing
<div style={{ gap: semanticSpacing.form.fieldGap }}>
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Spacing>;

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// MAIN STORIES
// =============================================================================

export const AllSpacing: Story = {
  name: '📏 All Spacing',
  render: () => <Spacing />,
};

export const BaseSpacingScale: Story = {
  name: '📐 Base Spacing Scale',
  render: () => (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold text-neutral-900">Base Spacing Scale</h1>
      <p className="mb-8 text-neutral-600">
        Built on a 4px base grid system. All values are multiples of 4px for consistent alignment.
      </p>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Extra Small (0-12px) */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-neutral-900">Extra Small (0-12px)</h3>
          <div className="space-y-2">
            {Object.entries(spacingTokens)
              .filter(([_, value]) => parseInt(value) <= 12)
              .map(([name, value]) => (
                <SpacingSwatch key={name} name={name} value={value} />
              ))}
          </div>
        </div>

        {/* Small (14-32px) */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-neutral-900">Small (14-32px)</h3>
          <div className="space-y-2">
            {Object.entries(spacingTokens)
              .filter(([_, value]) => {
                const px = parseInt(value);
                return px >= 14 && px <= 32;
              })
              .map(([name, value]) => (
                <SpacingSwatch key={name} name={name} value={value} />
              ))}
          </div>
        </div>

        {/* Medium (36-96px) */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-neutral-900">Medium (36-96px)</h3>
          <div className="space-y-2">
            {Object.entries(spacingTokens)
              .filter(([_, value]) => {
                const px = parseInt(value);
                return px >= 36 && px <= 96;
              })
              .map(([name, value]) => (
                <SpacingSwatch key={name} name={name} value={value} />
              ))}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="mb-2 font-semibold text-blue-900">🔢 4px Grid System</h3>
        <p className="text-sm text-blue-800">
          All spacing values are multiples of 4px. This creates a consistent rhythm and ensures
          pixel-perfect alignment across all screen densities and zoom levels.
        </p>
      </div>
    </div>
  ),
};

export const SemanticSpacing: Story = {
  name: '💭 Semantic Spacing',
  render: () => (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold text-neutral-900">Semantic Spacing Tokens</h1>
      <p className="mb-8 text-neutral-600">
        Contextual spacing tokens that provide meaning and consistency across different use cases.
      </p>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <SpacingGroup
          title="Component Spacing"
          spacings={semanticSpacing.component}
          description="Internal spacing within components like buttons, cards, and form elements"
        />

        <SpacingGroup
          title="Layout Spacing"
          spacings={semanticSpacing.layout}
          description="Spacing between major layout elements and page sections"
        />

        <SpacingGroup
          title="Content Spacing"
          spacings={semanticSpacing.content}
          description="Spacing for text content, paragraphs, and editorial layouts"
        />

        <SpacingGroup
          title="Form Spacing"
          spacings={semanticSpacing.form}
          description="Specialized spacing for form fields, labels, and form groups"
        />
      </div>

      <div className="mt-8 rounded-lg border border-green-200 bg-green-50 p-4">
        <h3 className="mb-2 font-semibold text-green-900">✨ Benefits of Semantic Spacing</h3>
        <ul className="space-y-1 text-sm text-green-800">
          <li>
            • <strong>Consistency</strong>: Same spacing patterns across similar components
          </li>
          <li>
            • <strong>Maintainability</strong>: Easy to update spacing system-wide
          </li>
          <li>
            • <strong>Clarity</strong>: Self-documenting code with meaningful names
          </li>
          <li>
            • <strong>Flexibility</strong>: Easy to adjust for different contexts
          </li>
        </ul>
      </div>
    </div>
  ),
};

export const ComponentSpacing: Story = {
  name: '🧩 Component Spacing',
  render: () => (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold text-neutral-900">Component Internal Spacing</h1>
      <p className="mb-8 text-neutral-600">
        Examples of how spacing tokens are used within components for consistent internal rhythm.
      </p>

      <div className="space-y-8">
        {/* Extra Small Spacing */}
        <SpacingDemo title="Extra Small (xs)" spacing="4px">
          <div
            className="inline-block rounded border border-red-200 bg-red-100 text-red-900"
            style={{ padding: semanticSpacing.component.xs }}
          >
            <span className="text-sm font-medium">Tight Badge</span>
          </div>
        </SpacingDemo>

        {/* Small Spacing */}
        <SpacingDemo title="Small (sm)" spacing="8px">
          <button
            className="rounded bg-blue-500 text-white transition-colors hover:bg-blue-600"
            style={{ padding: semanticSpacing.component.sm }}
          >
            Small Button
          </button>
        </SpacingDemo>

        {/* Medium Spacing */}
        <SpacingDemo title="Medium (md)" spacing="12px">
          <div
            className="rounded-lg border border-neutral-200 bg-white shadow-sm"
            style={{ padding: semanticSpacing.component.md }}
          >
            <h4 className="mb-2 font-semibold text-neutral-900">Card Title</h4>
            <p className="text-sm text-neutral-600">
              This card uses medium component spacing for comfortable internal padding.
            </p>
          </div>
        </SpacingDemo>

        {/* Large Spacing */}
        <SpacingDemo title="Large (lg)" spacing="16px">
          <div
            className="rounded-lg border border-green-200 bg-green-50"
            style={{ padding: semanticSpacing.component.lg }}
          >
            <h4 className="mb-2 font-semibold text-green-900">Success Alert</h4>
            <p className="text-sm text-green-800">
              Alert components use large spacing for better readability and emphasis.
            </p>
          </div>
        </SpacingDemo>

        {/* Extra Large Spacing */}
        <SpacingDemo title="Extra Large (xl)" spacing="24px">
          <div
            className="rounded-lg border border-blue-200 bg-blue-50 text-center"
            style={{ padding: semanticSpacing.component.xl }}
          >
            <h4 className="mb-2 font-semibold text-blue-900">Hero Section</h4>
            <p className="text-blue-800">
              Hero sections and prominent content areas use extra large spacing.
            </p>
          </div>
        </SpacingDemo>
      </div>
    </div>
  ),
};

export const LayoutSpacing: Story = {
  name: '🏗️ Layout Spacing',
  render: () => (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold text-neutral-900">Layout Element Spacing</h1>
      <p className="mb-8 text-neutral-600">
        Spacing between major layout elements to create visual hierarchy and organization.
      </p>

      {/* Small Layout Spacing */}
      <SpacingDemo title="Small Layout (sm)" spacing="24px">
        <div className="space-y-6">
          <div className="rounded-lg border border-purple-200 bg-purple-100 p-4">
            <h4 className="font-semibold text-purple-900">Related Content Block 1</h4>
            <p className="text-sm text-purple-800">Content that is closely related</p>
          </div>
          <div className="rounded-lg border border-purple-200 bg-purple-100 p-4">
            <h4 className="font-semibold text-purple-900">Related Content Block 2</h4>
            <p className="text-sm text-purple-800">Uses small layout spacing for grouping</p>
          </div>
        </div>
      </SpacingDemo>

      {/* Medium Layout Spacing */}
      <SpacingDemo title="Medium Layout (md)" spacing="32px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: semanticSpacing.layout.md }}>
          <div className="rounded-lg border border-orange-200 bg-orange-100 p-4">
            <h4 className="font-semibold text-orange-900">Section A</h4>
            <p className="text-sm text-orange-800">Standard section spacing</p>
          </div>
          <div className="rounded-lg border border-orange-200 bg-orange-100 p-4">
            <h4 className="font-semibold text-orange-900">Section B</h4>
            <p className="text-sm text-orange-800">
              Medium layout spacing creates clear separation
            </p>
          </div>
        </div>
      </SpacingDemo>

      {/* Large Layout Spacing */}
      <SpacingDemo title="Large Layout (lg)" spacing="48px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: semanticSpacing.layout.lg }}>
          <div className="rounded-lg border border-teal-200 bg-teal-100 p-6">
            <h4 className="font-semibold text-teal-900">Major Section 1</h4>
            <p className="text-sm text-teal-800">
              Important content areas with prominent separation
            </p>
          </div>
          <div className="rounded-lg border border-teal-200 bg-teal-100 p-6">
            <h4 className="font-semibold text-teal-900">Major Section 2</h4>
            <p className="text-sm text-teal-800">Large layout spacing for visual hierarchy</p>
          </div>
        </div>
      </SpacingDemo>
    </div>
  ),
};

export const FormSpacing: Story = {
  name: '📋 Form Spacing',
  render: () => (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold text-neutral-900">Form Element Spacing</h1>
      <p className="mb-8 text-neutral-600">
        Specialized spacing tokens for form layouts, ensuring optimal usability and visual flow.
      </p>

      <SpacingDemo title="Form Spacing Example" spacing="Various form tokens">
        <div className="max-w-md">
          {/* Form Group 1 */}
          <div style={{ marginBottom: semanticSpacing.form.groupGap }}>
            <h3 className="mb-4 text-lg font-semibold text-neutral-900">Personal Information</h3>

            <div style={{ marginBottom: semanticSpacing.form.fieldGap }}>
              <label
                className="block text-sm font-medium text-neutral-900"
                style={{ marginBottom: semanticSpacing.form.labelGap }}
              >
                First Name *
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-neutral-300 px-3 py-2"
                placeholder="Enter first name"
              />
              <p
                className="text-xs text-neutral-500"
                style={{ marginTop: semanticSpacing.form.helpGap }}
              >
                As written on your birth certificate
              </p>
            </div>

            <div style={{ marginBottom: semanticSpacing.form.fieldGap }}>
              <label
                className="block text-sm font-medium text-neutral-900"
                style={{ marginBottom: semanticSpacing.form.labelGap }}
              >
                Last Name *
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-neutral-300 px-3 py-2"
                placeholder="Enter last name"
              />
            </div>
          </div>

          {/* Form Group 2 */}
          <div style={{ marginBottom: semanticSpacing.form.groupGap }}>
            <h3 className="mb-4 text-lg font-semibold text-neutral-900">Contact Information</h3>

            <div style={{ marginBottom: semanticSpacing.form.fieldGap }}>
              <label
                className="block text-sm font-medium text-neutral-900"
                style={{ marginBottom: semanticSpacing.form.labelGap }}
              >
                Email Address
              </label>
              <input
                type="email"
                className="w-full rounded-md border border-neutral-300 px-3 py-2"
                placeholder="your.email@example.com"
              />
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: semanticSpacing.form.buttonGap }}>
            <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Submit
            </button>
            <button className="rounded-md border border-neutral-300 px-4 py-2 text-neutral-700 hover:bg-neutral-50">
              Cancel
            </button>
          </div>
        </div>
      </SpacingDemo>

      <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="mb-2 font-semibold text-yellow-900">📋 Form Spacing Breakdown</h3>
        <ul className="space-y-1 text-sm text-yellow-800">
          <li>
            • <strong>fieldGap (16px)</strong>: Space between form fields for clear separation
          </li>
          <li>
            • <strong>groupGap (32px)</strong>: Space between form sections/groups
          </li>
          <li>
            • <strong>labelGap (4px)</strong>: Tight space between label and input
          </li>
          <li>
            • <strong>helpGap (4px)</strong>: Tight space between input and help text
          </li>
          <li>
            • <strong>buttonGap (12px)</strong>: Comfortable space between action buttons
          </li>
        </ul>
      </div>
    </div>
  ),
};

export const GridSystem: Story = {
  name: '🏃 4px Grid System',
  render: () => (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold text-neutral-900">4px Base Grid System</h1>
      <p className="mb-8 text-neutral-600">
        All spacing values are built on a 4px base grid, ensuring consistent alignment and
        pixel-perfect layouts across all screen densities.
      </p>

      <div className="space-y-8">
        {/* Grid Visualization */}
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <h3 className="mb-4 font-semibold text-neutral-900">Grid Visualization</h3>
          <div className="relative h-48 rounded border border-neutral-300">
            {/* 4px Grid Background */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #3b82f6 1px, transparent 1px),
                  linear-gradient(to bottom, #3b82f6 1px, transparent 1px)
                `,
                backgroundSize: '4px 4px',
              }}
            />

            {/* Example Elements */}
            <div className="relative z-10 flex h-full items-center gap-8 p-4">
              <div className="rounded bg-blue-500 px-4 py-2 text-sm text-white">
                16px padding
                <br />
                <span className="text-xs opacity-75">(4 × 4px)</span>
              </div>

              <div className="rounded bg-green-500 px-6 py-3 text-sm text-white">
                24px padding
                <br />
                <span className="text-xs opacity-75">(6 × 4px)</span>
              </div>

              <div className="rounded bg-purple-500 px-8 py-4 text-sm text-white">
                32px padding
                <br />
                <span className="text-xs opacity-75">(8 × 4px)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h4 className="mb-2 font-semibold text-blue-900">🎯 Benefits</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Pixel-perfect alignment on all screen densities</li>
              <li>• Consistent rhythm across all components</li>
              <li>• Easy mental math for designers and developers</li>
              <li>• Scales well with responsive design</li>
            </ul>
          </div>

          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <h4 className="mb-2 font-semibold text-green-900">📐 Implementation</h4>
            <ul className="space-y-1 text-sm text-green-800">
              <li>• All spacing tokens are multiples of 4px</li>
              <li>• Works with 1x, 2x, and 3x pixel densities</li>
              <li>• Compatible with 8px and 12px grid systems</li>
              <li>• Supported by modern design tools</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  ),
};
