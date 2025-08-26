import type { Meta, StoryObj } from '@storybook/react';
import Shadows, {
  ShadowSwatch,
  ShadowGroup,
  ShadowDemo,
  InteractiveShadowDemo,
  shadowTokens,
  radiusTokens,
  opacityTokens,
  blurTokens,
  semanticShadows,
  semanticEffects,
} from './Shadows';

const meta = {
  title: 'Design System/Shadows & Effects',
  component: Shadows,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Shadows & Effects Tokens

Comprehensive shadow, border radius, opacity, and blur system for the Citizenly design system,
adding depth, hierarchy, and visual interest to Philippine government applications.

## Effects Philosophy

- **Layered Depth**: Progressive shadow system from subtle to prominent
- **Modern Aesthetics**: Contemporary border radius and blur effects  
- **Semantic Context**: Meaningful tokens for different component types
- **Accessibility First**: Effects that enhance rather than hinder usability
- **Performance Aware**: Optimized values for smooth animations

## Shadow Categories

### Box Shadows
Progressive depth system for UI elevation:
- **xs**: Subtle lift for small elements (1px blur)
- **sm**: Small cards and buttons (3px blur) 
- **md**: Standard cards and containers (6px blur)
- **lg**: Prominent elements and sidebars (15px blur)
- **xl**: Large modals and overlays (25px blur)
- **2xl**: Hero elements and major sections (50px blur)
- **inner**: Inset shadow for pressed states

### Drop Shadows  
Text and icon shadows for improved readability:
- **sm-2xl**: Progressive filter shadows for typography
- Optimized for text contrast and legibility
- Subtle enough for government accessibility standards

### Border Radius
Modern corner rounding for approachable interfaces:
- **sm (2px)**: Minimal rounding for professional look
- **md (6px)**: Standard component rounding
- **lg (8px)**: Cards and containers
- **xl-3xl**: Large containers and special elements
- **full**: Circular elements (badges, avatars)

### Opacity Values
Transparency for overlays and states:
- **0-100**: Full range from transparent to opaque
- **Common values**: 10%, 25%, 50%, 75% for standard use cases
- Semantic mappings for disabled, loading, overlay states

### Blur Effects
Modern backdrop and focus effects:
- **sm (4px)**: Subtle backdrop blur for glassmorphism
- **md (12px)**: Loading states and disabled content
- **lg-3xl**: Dramatic effects for special cases

## Semantic Usage

### Component Shadows
- **button**: sm - Subtle lift for clickable elements
- **card**: md - Standard container depth
- **input**: xs - Minimal depth for form elements
- **modal**: 2xl - Strong separation from background

### Interactive States
- **hover**: lg - Enhanced depth on interaction
- **focus**: Custom blue ring - Accessibility focus indicator
- **active**: xs - Pressed/clicked appearance
- **disabled**: none - Flattened disabled state

### Layout Shadows
- **navigation**: md - Header/nav separation
- **dropdown**: xl - Floating menu separation
- **tooltip**: lg - Helper text prominence

## Usage in Code

\`\`\`tsx
// Box shadows
.button {
  box-shadow: \${shadowTokens.boxShadows.sm};
}

// Semantic shadows
.card {
  box-shadow: \${semanticShadows.component.card};
}

// Border radius
.container {
  border-radius: \${radiusTokens.lg};
}

// Interactive states
.button:hover {
  box-shadow: \${semanticShadows.interactive.hover};
}

// Opacity states
.disabled {
  opacity: \${semanticEffects.opacity.disabled};
}

// Blur effects
.backdrop {
  backdrop-filter: blur(\${blurTokens.sm});
}
\`\`\`

## Accessibility Considerations

- Shadows provide visual hierarchy without relying solely on color
- Focus shadows meet WCAG 2.1 contrast requirements
- Blur effects don't interfere with screen readers
- Effects enhance but don't replace semantic HTML structure
        `,
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Shadows>;

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// MAIN STORIES
// =============================================================================

export const AllShadowsEffects: Story = {
  name: '✨ All Shadows & Effects',
  render: () => <Shadows />,
};

export const BoxShadows: Story = {
  name: '📦 Box Shadows',
  render: () => (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
        Box Shadow System
      </h1>
      <p className="mb-8 text-gray-600 dark:text-gray-400">
        Progressive shadow system that creates depth and visual hierarchy in government
        applications.
      </p>

      <ShadowGroup
        title="Shadow Scale"
        shadows={shadowTokens.boxShadows}
        type="boxShadow"
        description="From subtle elevation to dramatic separation"
      />

      <ShadowDemo
        title="Interactive Shadow Explorer"
        description="Click different shadow-sm values to preview them on a card element"
      >
        <InteractiveShadowDemo />
      </ShadowDemo>

      <ShadowDemo
        title="Shadow Comparison"
        description="Side-by-side comparison of different shadow-sm depths"
      >
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {Object.entries(shadowTokens.boxShadows)
            .filter(([name]) => !['none', 'inner'].includes(name))
            .slice(0, 4)
            .map(([name, shadow]) => (
              <div key={name} className="text-center">
                <div
                  className="mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-lg border border-gray-200 bg-white font-medium text-gray-700 dark:text-gray-300"
                  style={{ boxShadow: shadow }}
                >
                  {name}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{name} shadow</div>
              </div>
            ))}
        </div>
      </ShadowDemo>

      <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
          📦 Box Shadow Guidelines
        </h3>
        <ul className="space-y-1 text-sm text-gray-800 dark:text-gray-200">
          <li>
            • <strong>xs-sm</strong>: Subtle elevation for buttons, inputs, small cards
          </li>
          <li>
            • <strong>md</strong>: Standard depth for cards, containers, navigation
          </li>
          <li>
            • <strong>lg-xl</strong>: Prominent elements, large cards, sidebars
          </li>
          <li>
            • <strong>2xl</strong>: Modals, overlays, hero sections
          </li>
          <li>
            • <strong>inner</strong>: Pressed states, inset form elements
          </li>
        </ul>
      </div>
    </div>
  ),
};

export const BorderRadius: Story = {
  name: '🔄 Border Radius',
  render: () => (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
        Border Radius System
      </h1>
      <p className="mb-8 text-gray-600 dark:text-gray-400">
        Modern corner rounding that creates approachable, contemporary government interfaces.
      </p>

      <ShadowGroup
        title="Radius Scale"
        shadows={radiusTokens}
        type="radius"
        description="From sharp corners to fully rounded-sm elements"
      />

      <ShadowDemo
        title="Component Radius Examples"
        description="How different radius values affect common UI components"
      >
        <div className="space-y-8">
          {/* Buttons */}
          <div>
            <h4 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">Buttons</h4>
            <div className="flex flex-wrap gap-4">
              {Object.entries(radiusTokens)
                .filter(([name]) => !['full'].includes(name))
                .slice(0, 5)
                .map(([name, radius]) => (
                  <button
                    key={name}
                    className="bg-blue-600 px-6 py-3 font-medium text-white shadow-xs transition-colors hover:bg-blue-700 dark:text-black"
                    style={{ borderRadius: radius }}
                  >
                    {name} radius
                  </button>
                ))}
            </div>
          </div>

          {/* Cards */}
          <div>
            <h4 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">Cards</h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[radiusTokens.sm, radiusTokens.lg, radiusTokens['2xl']].map((radius, index) => {
                const names = ['sm', 'lg', '2xl'];
                return (
                  <div
                    key={radius}
                    className="border border-gray-200 bg-white p-6 shadow-md"
                    style={{ borderRadius: radius }}
                  >
                    <h5 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                      Card Component
                    </h5>
                    <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                      This card uses {names[index]} border radius ({radius}).
                    </p>
                    <button className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Learn more →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Badges and Avatars */}
          <div>
            <h4 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">
              Badges & Avatars
            </h4>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center bg-linear-to-r from-blue-500 to-purple-600 font-bold text-white dark:text-black"
                  style={{ borderRadius: radiusTokens.full }}
                >
                  JD
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Avatar (full radius)
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className="bg-green-100 px-3 py-1 text-sm font-medium text-green-800"
                  style={{ borderRadius: radiusTokens.full }}
                >
                  Online
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Badge (full radius)
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className="bg-red-100 px-2 py-1 text-xs font-medium text-red-800"
                  style={{ borderRadius: radiusTokens.sm }}
                >
                  New
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">Tag (sm radius)</span>
              </div>
            </div>
          </div>
        </div>
      </ShadowDemo>

      <div className="mt-8 rounded-lg border border-green-200 bg-green-50 p-4">
        <h3 className="mb-2 font-semibold text-green-900">🔄 Radius Usage Guidelines</h3>
        <ul className="space-y-1 text-sm text-green-800">
          <li>
            • <strong>none-sm</strong>: Professional, government look for forms and inputs
          </li>
          <li>
            • <strong>md-lg</strong>: Modern feel for cards, buttons, and containers
          </li>
          <li>
            • <strong>xl-3xl</strong>: Prominent sections, hero areas, special components
          </li>
          <li>
            • <strong>full</strong>: Circular elements like avatars, badges, and pills
          </li>
        </ul>
      </div>
    </div>
  ),
};

export const OpacityBlur: Story = {
  name: '👻 Opacity & Blur',
  render: () => (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
        Opacity & Blur Effects
      </h1>
      <p className="mb-8 text-gray-600 dark:text-gray-400">
        Transparency and blur effects for modern UI patterns and state management.
      </p>

      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ShadowGroup
          title="Opacity Scale"
          shadows={opacityTokens}
          type="opacity"
          description="Transparency values for overlays and states"
        />

        <ShadowGroup
          title="Blur Scale"
          shadows={blurTokens}
          type="blur"
          description="Blur effects for modern UI patterns"
        />
      </div>

      <ShadowDemo
        title="Opacity Applications"
        description="Common uses of opacity in government interface design"
      >
        <div className="space-y-8">
          {/* Loading States */}
          <div>
            <h4 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">
              Loading & Disabled States
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <h5 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                  Normal State
                </h5>
                <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                  This content is fully visible and interactive.
                </p>
                <button className="rounded-md bg-blue-600 px-4 py-2 text-white dark:text-black">
                  Action
                </button>
              </div>

              <div
                className="rounded-lg border border-gray-200 bg-white p-4"
                style={{ opacity: opacityTokens[60] }}
              >
                <h5 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                  Loading State
                </h5>
                <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                  Content is loading, reduced opacity indicates wait.
                </p>
                <button
                  className="rounded-md bg-blue-600 px-4 py-2 text-white dark:text-black"
                  disabled
                >
                  Loading...
                </button>
              </div>

              <div
                className="rounded-lg border border-gray-200 bg-white p-4"
                style={{ opacity: opacityTokens[40] }}
              >
                <h5 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                  Disabled State
                </h5>
                <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                  Content is disabled, low opacity shows unavailability.
                </p>
                <button
                  className="rounded-md bg-blue-600 px-4 py-2 text-white dark:text-black"
                  disabled
                >
                  Disabled
                </button>
              </div>
            </div>
          </div>

          {/* Overlay Examples */}
          <div>
            <h4 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">
              Overlay Patterns
            </h4>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Modal overlay */}
              <div className="relative h-40 overflow-hidden rounded-lg bg-linear-to-br from-blue-400 to-purple-500">
                <div className="absolute inset-0 p-4">
                  <h5 className="mb-2 font-bold text-white dark:text-black">Background Content</h5>
                  <p className="text-sm text-white dark:text-black">
                    This is the main page content that gets overlaid.
                  </p>
                </div>
                <div
                  className="absolute inset-0 flex items-center justify-center font-medium text-white dark:text-black dark:text-white"
                  style={{ backgroundColor: `rgba(0, 0, 0, ${opacityTokens[60]})` }}
                >
                  Modal Overlay
                  <br />
                  <span className="text-sm opacity-75">opacity: {opacityTokens[60]}</span>
                </div>
              </div>

              {/* Image overlay */}
              <div className="relative h-40 overflow-hidden rounded-lg bg-linear-to-br from-green-400 to-teal-500">
                <div className="absolute inset-0 p-4">
                  <h5 className="mb-2 font-bold text-white dark:text-black">Image Background</h5>
                  <p className="text-sm text-white dark:text-black">
                    Background image or video content.
                  </p>
                </div>
                <div
                  className="absolute inset-0 flex items-center justify-center font-medium text-white dark:text-black dark:text-white"
                  style={{
                    background: `linear-gradient(rgba(0, 0, 0, ${opacityTokens[30]}), rgba(0, 0, 0, ${opacityTokens[70]}))`,
                  }}
                >
                  Text Overlay
                  <br />
                  <span className="text-sm opacity-75">gradient overlay</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ShadowDemo>

      <ShadowDemo
        title="Blur Effect Showcase"
        description="Modern blur-sm effects for contemporary government interfaces"
      >
        <div className="space-y-8">
          {/* Glassmorphism */}
          <div>
            <h4 className="mb-4 font-semibold text-gray-900 dark:text-gray-100 dark:text-gray-900">
              Glassmorphism Cards
            </h4>
            <div className="relative h-64 overflow-hidden rounded-xl bg-linear-to-br from-blue-400 via-purple-500 to-pink-500 p-6">
              <div className="grid h-full grid-cols-1 gap-6 md:grid-cols-2">
                {/* Light glass */}
                <div
                  className="border-opacity-30 bg-opacity-20 rounded-xl border border-white bg-white p-6 backdrop-blur-xs"
                  style={{ backdropFilter: `blur(${blurTokens.sm})` }}
                >
                  <h5 className="mb-3 font-bold text-white dark:text-black">
                    Government Service Card
                  </h5>
                  <p className="mb-4 text-sm text-white dark:text-black">
                    Modern glassmorphism effect using backdrop blur for contemporary government
                    interfaces.
                  </p>
                  <button className="border-opacity-30 bg-opacity-20 hover:bg-opacity-30 rounded-lg border border-white bg-white px-4 py-2 text-white transition-all dark:text-black dark:text-white">
                    Learn More
                  </button>
                </div>

                {/* Dark glass */}
                <div
                  className="border-opacity-20 bg-opacity-20 rounded-xl border border-white bg-black p-6 backdrop-blur-md"
                  style={{ backdropFilter: `blur(${blurTokens.md})` }}
                >
                  <h5 className="mb-3 font-bold text-white dark:text-black">Document Portal</h5>
                  <p className="mb-4 text-sm text-white dark:text-black">
                    Enhanced blur effect for more pronounced glass appearance in key interface
                    areas.
                  </p>
                  <button className="border-opacity-20 bg-opacity-20 hover:bg-opacity-30 rounded-lg border border-white bg-white px-4 py-2 text-white transition-all dark:text-black">
                    Access Portal
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Loading blur */}
          <div>
            <h4 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">
              Loading State Blur
            </h4>
            <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-white">
              <div className="p-6">
                <h5 className="mb-3 font-semibold text-gray-900 dark:text-gray-100">
                  Document Processing System
                </h5>
                <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded border bg-gray-50 p-4">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Applications
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">1,234</div>
                  </div>
                  <div className="rounded border bg-gray-50 p-4">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Processed
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">856</div>
                  </div>
                  <div className="rounded border bg-gray-50 p-4">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Pending
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">378</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-600">
                  This interface shows document processing statistics and status information.
                </p>
              </div>

              {/* Loading overlay */}
              <div
                className="bg-opacity-80 absolute inset-0 flex items-center justify-center bg-white"
                style={{ backdropFilter: `blur(${blurTokens.md})` }}
              >
                <div className="text-center">
                  <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    Processing Request...
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    blur: {blurTokens.md}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ShadowDemo>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
          <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
            👻 Opacity Guidelines
          </h3>
          <ul className="space-y-1 text-sm text-gray-800 dark:text-gray-200">
            <li>
              • <strong>10-25%</strong>: Subtle overlays, hover effects
            </li>
            <li>
              • <strong>40-60%</strong>: Disabled states, loading indicators
            </li>
            <li>
              • <strong>75-90%</strong>: Modal overlays, backdrop dimming
            </li>
            <li>• Test opacity values for accessibility contrast</li>
          </ul>
        </div>

        <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-4">
          <h3 className="mb-2 font-semibold text-cyan-900">🌫️ Blur Guidelines</h3>
          <ul className="space-y-1 text-sm text-cyan-800">
            <li>
              • <strong>sm (4px)</strong>: Subtle glassmorphism effects
            </li>
            <li>
              • <strong>md (12px)</strong>: Loading states, disabled content
            </li>
            <li>
              • <strong>lg+ (16px+)</strong>: Dramatic effects, privacy screens
            </li>
            <li>• Consider performance impact on mobile devices</li>
          </ul>
        </div>
      </div>
    </div>
  ),
};

export const SemanticShadows: Story = {
  name: '🎯 Semantic Usage',
  render: () => (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
        Semantic Shadow & Effect Usage
      </h1>
      <p className="mb-8 text-gray-600 dark:text-gray-400">
        Contextual shadow and effect tokens for consistent patterns across government applications.
      </p>

      <ShadowDemo
        title="Component Shadows"
        description="Semantic shadows applied to different UI component types"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Button */}
          <div className="text-center">
            <button
              className="rounded-md bg-blue-600 px-6 py-3 font-medium text-white transition-all hover:shadow-lg active:shadow-xs dark:text-black"
              style={{
                boxShadow: semanticShadows.component.button,
                borderRadius: semanticEffects.radius.button,
              }}
            >
              Primary Button
            </button>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              button shadow + radius
            </div>
          </div>

          {/* Card */}
          <div className="text-center">
            <div
              className="mx-auto max-w-48 border border-gray-200 bg-white p-4"
              style={{
                boxShadow: semanticShadows.component.card,
                borderRadius: semanticEffects.radius.card,
              }}
            >
              <h4 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Service Card</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Government service information
              </p>
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              card shadow + radius
            </div>
          </div>

          {/* Input */}
          <div className="text-center">
            <input
              type="text"
              placeholder="Government ID"
              className="w-full max-w-48 border border-gray-300 px-4 py-2 transition-all focus:border-blue-500 focus:outline-hidden"
              style={{
                boxShadow: semanticShadows.component.input,
                borderRadius: semanticEffects.radius.input,
              }}
              onFocus={e => {
                e.currentTarget.style.boxShadow = semanticShadows.component.inputFocus;
              }}
              onBlur={e => {
                e.currentTarget.style.boxShadow = semanticShadows.component.input;
              }}
            />
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              input shadow + radius
            </div>
          </div>
        </div>
      </ShadowDemo>

      <ShadowDemo
        title="Interactive State Demonstration"
        description="How shadows change with user interaction"
      >
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Hover effects */}
          <div className="space-y-6">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">Hover Effects</h4>
            <div className="space-y-4">
              {['Normal', 'Hover Me!', 'Click Me!'].map((text, index) => {
                const shadows = [
                  semanticShadows.component.card,
                  semanticShadows.interactive.hover,
                  semanticShadows.interactive.active,
                ];
                return (
                  <div
                    key={text}
                    className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-all duration-200 select-none"
                    style={{ boxShadow: shadows[index] }}
                    onMouseEnter={e => {
                      if (index === 1)
                        e.currentTarget.style.boxShadow = semanticShadows.interactive.hover;
                    }}
                    onMouseLeave={e => {
                      if (index === 1)
                        e.currentTarget.style.boxShadow = semanticShadows.component.card;
                    }}
                    onMouseDown={e => {
                      if (index === 2)
                        e.currentTarget.style.boxShadow = semanticShadows.interactive.active;
                    }}
                    onMouseUp={e => {
                      if (index === 2)
                        e.currentTarget.style.boxShadow = semanticShadows.component.card;
                    }}
                  >
                    <div className="text-center font-medium text-gray-700 dark:text-gray-300">
                      {text}
                    </div>
                    {index === 0 && (
                      <div className="mt-1 text-center text-xs text-gray-500 dark:text-gray-500">
                        Default card shadow
                      </div>
                    )}
                    {index === 1 && (
                      <div className="mt-1 text-center text-xs text-gray-500 dark:text-gray-500">
                        Hover to see elevation
                      </div>
                    )}
                    {index === 2 && (
                      <div className="mt-1 text-center text-xs text-gray-500 dark:text-gray-500">
                        Click and hold for active state
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Focus states */}
          <div className="space-y-6">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">Focus States</h4>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Click to focus"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:outline-hidden"
                onFocus={e => {
                  e.currentTarget.style.boxShadow = semanticShadows.interactive.focus;
                  e.currentTarget.style.borderColor = '#3b82f6';
                }}
                onBlur={e => {
                  e.currentTarget.style.boxShadow = semanticShadows.component.input;
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
              />

              <textarea
                placeholder="Text area with focus shadow-sm"
                rows={3}
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 transition-all focus:outline-hidden"
                onFocus={e => {
                  e.currentTarget.style.boxShadow = semanticShadows.interactive.focus;
                  e.currentTarget.style.borderColor = '#3b82f6';
                }}
                onBlur={e => {
                  e.currentTarget.style.boxShadow = semanticShadows.component.input;
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
              />

              <button
                className="w-full rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition-all focus:outline-hidden dark:text-black"
                onFocus={e => {
                  e.currentTarget.style.boxShadow = semanticShadows.interactive.focus;
                }}
                onBlur={e => {
                  e.currentTarget.style.boxShadow = semanticShadows.component.button;
                }}
              >
                Button with focus ring
              </button>

              <div className="text-center text-xs text-gray-500 dark:text-gray-500">
                Focus elements above to see accessibility focus indicators
              </div>
            </div>
          </div>
        </div>
      </ShadowDemo>

      <ShadowDemo
        title="Layout Shadow Examples"
        description="Semantic shadows for major layout elements"
      >
        <div className="space-y-8">
          {/* Navigation */}
          <div>
            <h4 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">
              Navigation Shadow
            </h4>
            <div
              className="rounded-lg bg-blue-600 p-4 text-white dark:text-black"
              style={{ boxShadow: semanticShadows.layout.navigation }}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">Philippine Government Portal</div>
                <div className="text-sm opacity-75">navigation shadow</div>
              </div>
            </div>
          </div>

          {/* Modal */}
          <div>
            <h4 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">Modal Shadow</h4>
            <div className="relative">
              <div className="bg-opacity-50 rounded-xl bg-gray-900 p-8">
                <div
                  className="mx-auto max-w-md rounded-xl bg-white p-6"
                  style={{ boxShadow: semanticShadows.layout.modal }}
                >
                  <h5 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Document Confirmation
                  </h5>
                  <p className="mb-4 text-gray-600 dark:text-gray-400">
                    Are you sure you want to submit this application?
                  </p>
                  <div className="flex justify-end gap-3">
                    <button className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-200 dark:text-gray-400">
                      Cancel
                    </button>
                    <button className="rounded-md bg-blue-600 px-4 py-2 text-white dark:text-black">
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                modal shadow (2xl depth)
              </div>
            </div>
          </div>

          {/* Dropdown */}
          <div>
            <h4 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">Dropdown Shadow</h4>
            <div className="relative inline-block">
              <button className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 dark:text-gray-300">
                Select Service ▼
              </button>
              <div
                className="absolute top-full left-0 z-10 mt-2 w-56 rounded-md border border-gray-200 bg-white py-2"
                style={{ boxShadow: semanticShadows.layout.dropdown }}
              >
                <div className="cursor-pointer px-4 py-2 hover:bg-gray-50">
                  Birth Certificate Request
                </div>
                <div className="cursor-pointer px-4 py-2 hover:bg-gray-50">
                  Marriage Certificate
                </div>
                <div className="cursor-pointer px-4 py-2 hover:bg-gray-50">
                  Business Permit Application
                </div>
                <div className="cursor-pointer px-4 py-2 hover:bg-gray-50">Tax Clearance</div>
              </div>
              <div className="mt-16 text-sm text-gray-600 dark:text-gray-400">
                dropdown shadow (xl depth)
              </div>
            </div>
          </div>
        </div>
      </ShadowDemo>

      <div className="mt-8 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <h3 className="mb-2 font-semibold text-emerald-900">🎯 Semantic Benefits</h3>
        <ul className="space-y-1 text-sm text-emerald-800">
          <li>
            • <strong>Consistency</strong>: Same shadow patterns across similar components
          </li>
          <li>
            • <strong>Maintainability</strong>: Easy to update shadow system-wide
          </li>
          <li>
            • <strong>Accessibility</strong>: Focus shadows meet WCAG contrast requirements
          </li>
          <li>
            • <strong>Hierarchy</strong>: Clear visual layering of interface elements
          </li>
        </ul>
      </div>
    </div>
  ),
};
