'use client';

import React from 'react';

// =============================================================================
// SHADOW TOKEN DEFINITIONS
// =============================================================================

export const shadowTokens = {
  // Box Shadows - Following design system hierarchy
  boxShadows: {
    none: 'none',
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  },

  // Drop Shadows (for text and icons)
  dropShadows: {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
    md: '0 4px 3px rgba(0, 0, 0, 0.07), 0 2px 2px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 8px rgba(0, 0, 0, 0.04), 0 4px 3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 13px rgba(0, 0, 0, 0.03), 0 8px 5px rgba(0, 0, 0, 0.08)',
    '2xl': '0 25px 25px rgba(0, 0, 0, 0.15)',
  },
} as const;

// =============================================================================
// BORDER RADIUS TOKEN DEFINITIONS
// =============================================================================

export const radiusTokens = {
  none: '0px',
  sm: '2px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '24px',
  full: '9999px', // For circular elements
} as const;

// =============================================================================
// OPACITY TOKEN DEFINITIONS
// =============================================================================

export const opacityTokens = {
  0: '0',
  5: '0.05',
  10: '0.1',
  20: '0.2',
  25: '0.25',
  30: '0.3',
  40: '0.4',
  50: '0.5',
  60: '0.6',
  70: '0.7',
  75: '0.75',
  80: '0.8',
  90: '0.9',
  95: '0.95',
  100: '1',
} as const;

// =============================================================================
// BLUR TOKEN DEFINITIONS
// =============================================================================

export const blurTokens = {
  none: '0',
  sm: '4px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '40px',
  '3xl': '64px',
} as const;

// =============================================================================
// SEMANTIC SHADOW DEFINITIONS
// =============================================================================

export const semanticShadows = {
  // Component shadows
  component: {
    button: shadowTokens.boxShadows.sm,
    card: shadowTokens.boxShadows.md,
    header: shadowTokens.boxShadows.sm,
    sidebar: shadowTokens.boxShadows.lg,
    input: shadowTokens.boxShadows.xs,
    inputFocus: shadowTokens.boxShadows.md,
  },

  // Interactive states
  interactive: {
    hover: shadowTokens.boxShadows.lg,
    active: shadowTokens.boxShadows.xs,
    focus: '0 0 0 3px rgba(59, 130, 246, 0.1)', // Blue focus ring
    disabled: shadowTokens.boxShadows.none,
  },

  // Layout shadows
  layout: {
    navigation: shadowTokens.boxShadows.md,
    modal: shadowTokens.boxShadows['2xl'],
    dropdown: shadowTokens.boxShadows.xl,
    tooltip: shadowTokens.boxShadows.lg,
    overlay: shadowTokens.boxShadows.xl,
  },

  // Content shadows
  content: {
    image: shadowTokens.boxShadows.md,
    video: shadowTokens.boxShadows.lg,
    embed: shadowTokens.boxShadows.sm,
    quote: shadowTokens.boxShadows.inner,
  },
} as const;

// =============================================================================
// SEMANTIC EFFECTS DEFINITIONS
// =============================================================================

export const semanticEffects = {
  // Border radius by component type
  radius: {
    button: radiusTokens.md,
    card: radiusTokens.lg,
    input: radiusTokens.md,
    badge: radiusTokens.full,
    avatar: radiusTokens.full,
    modal: radiusTokens.xl,
    image: radiusTokens.lg,
    container: radiusTokens.xl,
  },

  // Opacity by state
  opacity: {
    disabled: opacityTokens[50],
    loading: opacityTokens[60],
    placeholder: opacityTokens[40],
    overlay: opacityTokens[80],
    backdrop: opacityTokens[60],
    hover: opacityTokens[90],
  },

  // Blur effects
  blur: {
    backdrop: blurTokens.sm,
    loading: blurTokens.md,
    disabled: blurTokens.sm,
    placeholder: blurTokens.none,
  },
} as const;

// =============================================================================
// SHADOW VISUALIZATION COMPONENTS
// =============================================================================

interface ShadowSwatchProps {
  name: string;
  value: string;
  type?: 'boxShadow' | 'dropShadow' | 'radius' | 'opacity' | 'blur-sm';
}

export const ShadowSwatch: React.FC<ShadowSwatchProps> = ({ name, value, type = 'boxShadow' }) => {
  const getVisualization = () => {
    switch (type) {
      case 'boxShadow':
        return (
          <div
            className="h-16 w-16 rounded-lg bg-white transition-all"
            style={{ boxShadow: value === 'none' ? 'none' : value }}
          />
        );
      case 'dropShadow':
        return (
          <div
            className="flex h-16 w-16 items-center justify-center rounded-lg bg-blue-500 text-xl font-bold text-white transition-all dark:text-black"
            style={{ filter: value === 'none' ? 'none' : `drop-shadow(${value})` }}
          >
            A
          </div>
        );
      case 'radius':
        return (
          <div className="h-16 w-16 bg-green-500 transition-all" style={{ borderRadius: value }} />
        );
      case 'opacity':
        return (
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-sm bg-linear-to-r from-blue-500 to-purple-500" />
            <div
              className="absolute inset-0 rounded-sm bg-red-500 transition-all"
              style={{ opacity: value }}
            />
          </div>
        );
      case 'blur-sm':
        return (
          <div className="relative h-16 w-16 overflow-hidden rounded-sm">
            <div
              className="absolute inset-0 bg-linear-to-br from-blue-400 to-purple-500 transition-all"
              style={{ filter: value === '0' ? 'none' : `blur(${value})` }}
            />
            <div className="absolute inset-0 flex items-center justify-center font-bold text-white dark:text-black">
              {value === '0' ? 'SHARP' : 'BLUR'}
            </div>
          </div>
        );
      default:
        return <div className="h-16 w-16 rounded-sm bg-gray-300" />;
    }
  };

  return (
    <div className="flex items-center gap-4 rounded-lg border border-gray-200 p-4">
      <div className="w-24 shrink-0">
        <div className="font-mono text-sm text-gray-700 dark:text-gray-300">{name}</div>
        <div className="text-xs text-gray-500 dark:text-gray-500">{value}</div>
      </div>

      <div className="flex flex-1 items-center justify-center rounded-sm bg-gray-50 p-4">
        {getVisualization()}
      </div>
    </div>
  );
};

interface ShadowGroupProps {
  title: string;
  shadows: Record<string, string>;
  type?: 'boxShadow' | 'dropShadow' | 'radius' | 'opacity' | 'blur-sm';
  description?: string;
}

export const ShadowGroup: React.FC<ShadowGroupProps> = ({
  title,
  shadows,
  type = 'boxShadow',
  description,
}) => (
  <div className="mb-8">
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
      )}
    </div>
    <div className="space-y-3">
      {Object.entries(shadows).map(([name, value]) => (
        <ShadowSwatch key={name} name={name} value={value} type={type} />
      ))}
    </div>
  </div>
);

interface ShadowDemoProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export const ShadowDemo: React.FC<ShadowDemoProps> = ({ title, description, children }) => (
  <div className="mb-8">
    <div className="mb-4">
      <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">{title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-600">{description}</p>
    </div>
    <div className="rounded-lg border border-gray-200 bg-linear-to-br from-neutral-50 to-neutral-100 p-6">
      {children}
    </div>
  </div>
);

// =============================================================================
// INTERACTIVE DEMO COMPONENT
// =============================================================================

export const InteractiveShadowDemo: React.FC = () => {
  const [selectedShadow, setSelectedShadow] =
    React.useState<keyof typeof shadowTokens.boxShadows>('md');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {Object.keys(shadowTokens.boxShadows).map(shadowName => (
          <button
            key={shadowName}
            onClick={() => setSelectedShadow(shadowName as keyof typeof shadowTokens.boxShadows)}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-all ${
              selectedShadow === shadowName
                ? 'bg-blue-600 text-white shadow-md dark:text-black'
                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:text-gray-300'
            }`}
          >
            {shadowName}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center p-12">
        <div
          className="flex h-32 w-48 items-center justify-center rounded-xl border border-gray-200 bg-white font-medium text-gray-700 transition-all duration-300 dark:text-gray-300"
          style={{ boxShadow: shadowTokens.boxShadows[selectedShadow] }}
        >
          Shadow: {selectedShadow}
          <br />
          <span className="font-mono text-sm text-gray-500 dark:text-gray-500">
            {shadowTokens.boxShadows[selectedShadow]}
          </span>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// MAIN SHADOWS COMPONENT
// =============================================================================

const Shadows: React.FC = () => {
  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
          Design Tokens: Shadows & Effects
        </h1>
        <p className="max-w-2xl text-gray-600 dark:text-gray-400">
          Shadow, border radius, opacity, and blur tokens for the Citizenly design system. These
          tokens add depth, hierarchy, and visual interest to government applications.
        </p>
      </div>

      {/* Box Shadows */}
      <div className="mb-12">
        <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Box Shadows
        </h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Layered shadows that create depth and hierarchy in the interface.
        </p>

        <ShadowGroup
          title="Shadow Scale"
          shadows={shadowTokens.boxShadows}
          type="boxShadow"
          description="Progressive shadow-sm depth from subtle to prominent"
        />

        <ShadowDemo
          title="Interactive Shadow Selector"
          description="Click different shadow-sm values to see them in action"
        >
          <InteractiveShadowDemo />
        </ShadowDemo>
      </div>

      {/* Drop Shadows */}
      <div className="mb-12">
        <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Drop Shadows
        </h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Text and icon shadows for improved readability and visual emphasis.
        </p>

        <ShadowGroup
          title="Drop Shadow Scale"
          shadows={shadowTokens.dropShadows}
          type="dropShadow"
          description="CSS filter drop-shadow-sm values for text and icons"
        />

        <ShadowDemo
          title="Drop Shadow Usage"
          description="Examples of drop shadows applied to text and icons"
        >
          <div className="grid grid-cols-2 items-center gap-6 md:grid-cols-3">
            {Object.entries(shadowTokens.dropShadows)
              .filter(([name]) => name !== 'none')
              .map(([name, value]) => (
                <div key={name} className="text-center">
                  <div
                    className="mb-2 text-2xl font-bold text-gray-600 dark:text-gray-400 dark:text-gray-600"
                    style={{ filter: `drop-shadow(${value})` }}
                  >
                    Government
                  </div>
                  <div className="font-mono text-sm text-gray-600 dark:text-gray-400">{name}</div>
                </div>
              ))}
          </div>
        </ShadowDemo>
      </div>

      {/* Border Radius */}
      <div className="mb-12">
        <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Border Radius
        </h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Corner rounding values for modern, approachable interface elements.
        </p>

        <ShadowGroup
          title="Radius Scale"
          shadows={radiusTokens}
          type="radius"
          description="Border radius values from sharp to fully rounded-sm"
        />

        <ShadowDemo
          title="Border Radius Examples"
          description="Different radius values applied to UI components"
        >
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Object.entries(radiusTokens).map(([name, value]) => (
              <div key={name} className="text-center">
                <div
                  className="mx-auto mb-2 flex h-20 w-20 items-center justify-center bg-linear-to-br from-blue-400 to-purple-500 font-bold text-white dark:text-black"
                  style={{ borderRadius: value }}
                >
                  {name === 'full' ? '●' : name.toUpperCase()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{name}</div>
                <div className="font-mono text-xs text-gray-500 dark:text-gray-500">{value}</div>
              </div>
            ))}
          </div>
        </ShadowDemo>
      </div>

      {/* Opacity */}
      <div className="mb-12">
        <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">Opacity</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Transparency values for overlays, disabled states, and visual hierarchy.
        </p>

        <ShadowGroup
          title="Opacity Scale"
          shadows={opacityTokens}
          type="opacity"
          description="Opacity values from fully transparent to fully opaque"
        />

        <ShadowDemo
          title="Opacity Usage Examples"
          description="Common opacity applications in UI design"
        >
          <div className="space-y-4">
            {/* Overlay example */}
            <div className="relative h-24 overflow-hidden rounded-lg bg-linear-to-r from-blue-500 to-purple-600">
              <div
                className="absolute inset-0 flex items-center justify-center bg-black font-medium text-white dark:text-black"
                style={{ opacity: opacityTokens[60] }}
              >
                Modal Overlay (opacity: {opacityTokens[60]})
              </div>
            </div>

            {/* Disabled states */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <button className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white dark:text-black">
                Normal Button
              </button>
              <button
                className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white dark:text-black"
                style={{ opacity: opacityTokens[50] }}
                disabled
              >
                Disabled (opacity: {opacityTokens[50]})
              </button>
              <button
                className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white dark:text-black"
                style={{ opacity: opacityTokens[75] }}
              >
                Loading (opacity: {opacityTokens[75]})
              </button>
            </div>
          </div>
        </ShadowDemo>
      </div>

      {/* Blur Effects */}
      <div className="mb-12">
        <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Blur Effects
        </h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Blur values for backdrop filters, focus states, and loading indicators.
        </p>

        <ShadowGroup
          title="Blur Scale"
          shadows={blurTokens}
          type="blur-sm"
          description="CSS blur-sm filter values from sharp to heavily blurred"
        />

        <ShadowDemo
          title="Blur Applications"
          description="Different blur-sm effects in modern UI patterns"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Backdrop blur */}
            <div className="relative h-32 overflow-hidden rounded-lg bg-linear-to-br from-green-400 to-blue-500">
              <div
                className="border-opacity-20 bg-opacity-20 absolute inset-4 flex items-center justify-center rounded-lg border border-white bg-white font-medium text-white backdrop-blur-xs dark:text-black dark:text-white"
                style={{ backdropFilter: `blur(${blurTokens.sm})` }}
              >
                Glassmorphism Card
                <br />
                <span className="text-sm opacity-75">backdrop-blur-sm: {blurTokens.sm}</span>
              </div>
            </div>

            {/* Loading blur */}
            <div className="relative h-32 overflow-hidden rounded-lg bg-linear-to-br from-purple-400 to-pink-500">
              <div className="absolute inset-0 p-4">
                <h3 className="mb-2 font-bold text-white dark:text-black">Content Area</h3>
                <p className="text-sm text-white dark:text-black">
                  This content is behind a loading state
                </p>
              </div>
              <div
                className="bg-opacity-10 absolute inset-0 flex items-center justify-center bg-white font-medium text-white dark:text-black dark:text-white"
                style={{ backdropFilter: `blur(${blurTokens.md})` }}
              >
                Loading...
                <br />
                <span className="text-sm opacity-75">blur: {blurTokens.md}</span>
              </div>
            </div>
          </div>
        </ShadowDemo>
      </div>

      {/* Semantic Usage */}
      <div className="mb-12">
        <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Semantic Usage
        </h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Contextual tokens for consistent shadow and effect patterns across components.
        </p>

        <ShadowDemo
          title="Component Shadow Examples"
          description="How semantic shadows are applied to different UI components"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Button */}
            <div className="text-center">
              <button
                className="rounded-md bg-blue-600 px-6 py-3 font-medium text-white transition-all hover:shadow-lg dark:text-black"
                style={{ boxShadow: semanticShadows.component.button }}
              >
                Button Component
              </button>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">button shadow</div>
            </div>

            {/* Card */}
            <div className="text-center">
              <div
                className="rounded-lg border border-gray-200 bg-white p-4"
                style={{ boxShadow: semanticShadows.component.card }}
              >
                <h4 className="mb-1 font-semibold text-gray-900 dark:text-gray-100">
                  Card Component
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Card content area</p>
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">card shadow</div>
            </div>

            {/* Input */}
            <div className="text-center">
              <input
                type="text"
                placeholder="Input component"
                className="w-full rounded-md border border-gray-300 px-4 py-2"
                style={{ boxShadow: semanticShadows.component.input }}
              />
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">input shadow</div>
            </div>
          </div>
        </ShadowDemo>

        <ShadowDemo
          title="Interactive State Examples"
          description="Shadow changes for hover, active, and focus states"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Hover states */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Hover Effects</h4>
              <div className="space-y-3">
                <div
                  className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-lg"
                  style={{ boxShadow: semanticShadows.component.card }}
                >
                  Hover me for elevated shadow
                </div>
                <button
                  className="w-full rounded-md bg-green-600 px-4 py-3 font-medium text-white transition-all dark:text-black"
                  style={{ boxShadow: semanticShadows.component.button }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = semanticShadows.interactive.hover;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = semanticShadows.component.button;
                  }}
                >
                  Hover Button
                </button>
              </div>
            </div>

            {/* Focus states */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Focus Effects</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Focus to see shadow-sm change"
                  className="w-full rounded-md border border-gray-300 px-4 py-2 transition-all focus:outline-hidden"
                  style={{ boxShadow: semanticShadows.component.input }}
                  onFocus={e => {
                    e.currentTarget.style.boxShadow = semanticShadows.interactive.focus;
                  }}
                  onBlur={e => {
                    e.currentTarget.style.boxShadow = semanticShadows.component.input;
                  }}
                />
                <button
                  className="w-full rounded-md bg-purple-600 px-4 py-3 font-medium text-white transition-all focus:outline-hidden dark:text-black"
                  onFocus={e => {
                    e.currentTarget.style.boxShadow = semanticShadows.interactive.focus;
                  }}
                  onBlur={e => {
                    e.currentTarget.style.boxShadow = semanticShadows.component.button;
                  }}
                >
                  Focus Button
                </button>
              </div>
            </div>
          </div>
        </ShadowDemo>
      </div>

      {/* Usage Guidelines */}
      <div className="rounded-lg border border-violet-200 bg-violet-50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-violet-900">
          ✨ Shadow & Effects Guidelines
        </h3>
        <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-2">
          <div>
            <h4 className="mb-2 font-semibold text-violet-900">Shadow Usage</h4>
            <ul className="space-y-1 text-violet-800">
              <li>• Use subtle shadows for most UI elements</li>
              <li>• Reserve larger shadows for modals and overlays</li>
              <li>• Apply consistent shadow patterns within component families</li>
              <li>• Consider accessibility when using shadows for emphasis</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 font-semibold text-violet-900">Effects Best Practices</h4>
            <ul className="space-y-1 text-violet-800">
              <li>• Use border radius consistently across similar elements</li>
              <li>• Apply opacity thoughtfully for hierarchy</li>
              <li>• Use blur effects sparingly for special states</li>
              <li>• Test effects across different devices and contexts</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-violet-300 bg-violet-100 p-4">
          <h4 className="mb-2 font-semibold text-violet-900">💡 Pro Tips</h4>
          <ul className="space-y-1 text-sm text-violet-800">
            <li>• Layer multiple subtle shadows for depth instead of one strong shadow</li>
            <li>• Use semantic tokens over raw values for maintainability</li>
            <li>• Test shadow visibility on different backgrounds</li>
            <li>• Consider performance impact of complex shadow effects</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Shadows;
