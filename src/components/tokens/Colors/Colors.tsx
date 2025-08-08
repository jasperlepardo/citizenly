'use client';

import React from 'react';
import colors from 'tailwindcss/colors';

// =============================================================================
// RAW TAILWIND COLOR IMPORTS
// =============================================================================

// Import raw Tailwind colors for consistency
export const rawColors = {
  // Core Tailwind colors
  slate: colors.slate,
  gray: colors.gray,
  zinc: colors.zinc,
  neutral: colors.neutral,
  stone: colors.stone,
  red: colors.red,
  orange: colors.orange,
  amber: colors.amber,
  yellow: colors.yellow,
  lime: colors.lime,
  green: colors.green,
  emerald: colors.emerald,
  teal: colors.teal,
  cyan: colors.cyan,
  sky: colors.sky,
  blue: colors.blue,
  indigo: colors.indigo,
  violet: colors.violet,
  purple: colors.purple,
  fuchsia: colors.fuchsia,
  pink: colors.pink,
  rose: colors.rose,

  // Special colors
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
  current: 'currentColor',
} as const;

// =============================================================================
// PHILIPPINE GOVERNMENT COLOR PALETTE (Using Tailwind colors)
// =============================================================================

export const colorTokens = {
  // Primary Colors (Government Blue - using Tailwind blue)
  primary: rawColors.blue,

  // Secondary Colors (Philippine Flag Red - using Tailwind red)
  secondary: rawColors.red,

  // Success (Filipino Green - using Tailwind green)
  success: rawColors.green,

  // Warning (Golden Yellow - using Tailwind amber)
  warning: rawColors.amber,

  // Danger/Error (using Tailwind red, same as secondary for consistency)
  danger: rawColors.red,

  // Neutral/Gray Scale (using Tailwind neutral)
  neutral: rawColors.neutral,

  // Additional utility colors
  white: rawColors.white,
  black: rawColors.black,
  transparent: rawColors.transparent,
  current: rawColors.current,
} as const;

// =============================================================================
// SEMANTIC COLOR DEFINITIONS
// =============================================================================

export const semanticColors = {
  // Text Colors
  text: {
    primary: colorTokens.neutral[900], // Dark text for primary content
    secondary: colorTokens.neutral[600], // Lighter text for secondary content
    tertiary: colorTokens.neutral[500], // Even lighter for tertiary content
    inverse: colorTokens.white, // White text for dark backgrounds
    disabled: colorTokens.neutral[400], // Disabled text state
    link: colorTokens.primary[600], // Link text color
    linkHover: colorTokens.primary[700], // Link hover state
    success: colorTokens.success[700], // Success message text
    warning: colorTokens.warning[700], // Warning message text
    error: colorTokens.danger[700], // Error message text
  },

  // Background Colors
  background: {
    primary: colorTokens.white, // Main background
    secondary: colorTokens.neutral[50], // Secondary background
    tertiary: colorTokens.neutral[100], // Tertiary background (cards, etc.)
    inverse: colorTokens.neutral[900], // Dark background
    disabled: colorTokens.neutral[100], // Disabled state background
    overlay: 'rgba(0, 0, 0, 0.5)', // Modal/overlay background
    success: colorTokens.success[50], // Success state background
    warning: colorTokens.warning[50], // Warning state background
    error: colorTokens.danger[50], // Error state background
  },

  // Border Colors
  border: {
    primary: colorTokens.neutral[300], // Default border
    secondary: colorTokens.neutral[200], // Lighter border
    tertiary: colorTokens.neutral[100], // Very light border
    inverse: colorTokens.neutral[600], // Dark border
    focus: colorTokens.primary[500], // Focus state border
    success: colorTokens.success[300], // Success border
    warning: colorTokens.warning[300], // Warning border
    error: colorTokens.danger[300], // Error border
  },

  // Interactive Element Colors
  interactive: {
    primary: colorTokens.primary[600], // Primary buttons, links
    primaryHover: colorTokens.primary[700], // Primary hover state
    primaryActive: colorTokens.primary[800], // Primary active state
    primaryDisabled: colorTokens.neutral[300], // Primary disabled state

    secondary: colorTokens.neutral[200], // Secondary buttons
    secondaryHover: colorTokens.neutral[300], // Secondary hover state
    secondaryActive: colorTokens.neutral[400], // Secondary active state

    destructive: colorTokens.danger[600], // Destructive actions
    destructiveHover: colorTokens.danger[700], // Destructive hover

    ghost: colorTokens.transparent, // Ghost button background
    ghostHover: colorTokens.neutral[100], // Ghost button hover
  },

  // Status Colors
  status: {
    success: colorTokens.success[500], // Success indicators
    successLight: colorTokens.success[100], // Light success background
    successBorder: colorTokens.success[300], // Success border

    warning: colorTokens.warning[500], // Warning indicators
    warningLight: colorTokens.warning[100], // Light warning background
    warningBorder: colorTokens.warning[300], // Warning border

    error: colorTokens.danger[500], // Error indicators
    errorLight: colorTokens.danger[100], // Light error background
    errorBorder: colorTokens.danger[300], // Error border

    info: colorTokens.primary[500], // Info indicators
    infoLight: colorTokens.primary[100], // Light info background
    infoBorder: colorTokens.primary[300], // Info border
  },
} as const;

// =============================================================================
// COLOR VISUALIZATION COMPONENTS
// =============================================================================

interface ColorPaletteProps {
  children: React.ReactNode;
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({ children }) => (
  <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    {children}
  </div>
);

interface ColorSwatchProps {
  name: string;
  value: string;
  textColor?: string;
}

export const ColorSwatch: React.FC<ColorSwatchProps> = ({ name, value, textColor = 'auto' }) => {
  // Auto-determine text color based on background lightness
  const getTextColor = (bgColor: string): string => {
    if (textColor !== 'auto') return textColor;

    // Simple lightness check - in a real app, you'd use a proper contrast calculation
    const hex = bgColor.replace('#', '');
    if (hex.length !== 6) return '#000000';

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    return brightness > 128 ? '#000000' : '#ffffff';
  };

  const displayTextColor = getTextColor(value);

  return (
    <div
      className="flex items-center justify-between rounded-lg border p-4 transition-all hover:shadow-md"
      style={{ backgroundColor: value, color: displayTextColor }}
    >
      <div>
        <div className="text-sm font-semibold">{name}</div>
        <div className="font-mono text-xs opacity-75">{value}</div>
      </div>
      <div
        className="h-8 w-8 rounded-full border-2 border-current opacity-20"
        style={{ backgroundColor: 'currentColor' }}
      />
    </div>
  );
};

interface ColorGroupProps {
  title: string;
  colors: Record<string, string>;
  description?: string;
}

export const ColorGroup: React.FC<ColorGroupProps> = ({ title, colors, description }) => (
  <div className="mb-8">
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
      {description && <p className="mt-1 text-sm text-neutral-600">{description}</p>}
    </div>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Object.entries(colors).map(([name, value]) => (
        <ColorSwatch key={name} name={name} value={value} />
      ))}
    </div>
  </div>
);

interface ColorScaleProps {
  title: string;
  scale: Record<string, string>;
  description?: string;
}

export const ColorScale: React.FC<ColorScaleProps> = ({ title, scale, description }) => {
  const [showCode, setShowCode] = React.useState(false);

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const generateCodeObject = () => {
    const codeObject = Object.entries(scale).reduce(
      (acc, [shade, value]) => {
        acc[shade] = value;
        return acc;
      },
      {} as Record<string, string>
    );

    return JSON.stringify({ [title.toLowerCase()]: codeObject }, null, 2);
  };

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
          {description && <p className="mt-1 text-sm text-neutral-600">{description}</p>}
        </div>
        <button
          onClick={() => setShowCode(!showCode)}
          className="rounded-md bg-neutral-100 px-3 py-1 text-xs text-neutral-700 transition-colors hover:bg-neutral-200"
        >
          {showCode ? 'Hide Code' : 'Show Code'}
        </button>
      </div>

      <div className="flex overflow-hidden rounded-lg border border-neutral-200 shadow-sm">
        {Object.entries(scale).map(([shade, value]) => (
          <div
            key={shade}
            className="flex min-h-[80px] flex-1 cursor-pointer flex-col justify-between p-4 transition-transform hover:scale-105"
            style={{ backgroundColor: value }}
            onClick={() => handleCopyToClipboard(value)}
            title={`Click to copy ${value}`}
          >
            <div
              className="text-xs font-bold"
              style={{
                color: parseInt(shade) > 500 || shade === 'black' ? '#ffffff' : '#000000',
              }}
            >
              {shade}
            </div>
            <div
              className="mt-2 font-mono text-xs"
              style={{
                color: parseInt(shade) > 500 || shade === 'black' ? '#ffffff' : '#000000',
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      {showCode && (
        <div className="relative mt-4">
          <div className="overflow-x-auto rounded-lg bg-neutral-900 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-neutral-400">Raw Object</span>
              <button
                onClick={() => handleCopyToClipboard(generateCodeObject())}
                className="text-xs text-neutral-400 transition-colors hover:text-white"
              >
                Copy
              </button>
            </div>
            <pre className="font-mono text-sm text-green-400">
              <code>{generateCodeObject()}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// INTERACTIVE COLOR PICKER COMPONENT
// =============================================================================

export const ColorPicker: React.FC = () => {
  const [selectedColor, setSelectedColor] = React.useState<string>(colorTokens.primary[500]);
  const [copiedColor, setCopiedColor] = React.useState<string | null>(null);

  const handleColorCopy = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(color);
      setTimeout(() => setCopiedColor(null), 2000);
    } catch (err) {
      console.error('Failed to copy color:', err);
    }
  };

  const colorOptions = [
    { name: 'Primary Blue', colors: colorTokens.primary },
    { name: 'Success Green', colors: colorTokens.success },
    { name: 'Warning Amber', colors: colorTokens.warning },
    { name: 'Danger Red', colors: colorTokens.danger },
    { name: 'Neutral Gray', colors: colorTokens.neutral },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <button
          className="mx-auto mb-4 h-32 w-32 cursor-pointer rounded-2xl shadow-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          style={{ backgroundColor: selectedColor }}
          onClick={() => handleColorCopy(selectedColor)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleColorCopy(selectedColor);
            }
          }}
          aria-label={`Copy color ${selectedColor} to clipboard`}
          title={`Click to copy ${selectedColor}`}
        />
        <div className="mb-2 font-mono text-sm text-neutral-600">{selectedColor}</div>
        {copiedColor && (
          <div className="text-xs font-medium text-green-600">Copied to clipboard! ✓</div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {colorOptions.map(({ name, colors: colorScale }) => (
          <div key={name} className="space-y-2">
            <h4 className="text-sm font-medium text-neutral-700">{name}</h4>
            <div className="grid grid-cols-5 gap-1">
              {Object.entries(colorScale)
                .filter(([shade]) => ['100', '300', '500', '700', '900'].includes(shade))
                .map(([shade, color]) => (
                  <button
                    key={shade}
                    className="h-8 w-8 rounded border border-neutral-200 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                    title={`${name} ${shade}: ${color}`}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// =============================================================================
// MAIN COLORS COMPONENT
// =============================================================================

const Colors: React.FC = () => {
  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-neutral-900">Design Tokens: Colors</h1>
        <p className="max-w-2xl text-neutral-600">
          Color palette for the Citizenly design system, built on Tailwind CSS colors and optimized
          for Philippine government applications with accessibility in mind.
        </p>
      </div>

      {/* Raw Tailwind Colors */}
      <div className="mb-12">
        <h2 className="mb-6 text-2xl font-semibold text-neutral-900">Raw Tailwind Colors</h2>
        <p className="mb-6 text-neutral-600">
          Complete Tailwind CSS color palette available for use throughout the application.
        </p>

        <div className="space-y-8">
          <ColorScale
            title="Blue (Primary)"
            scale={rawColors.blue}
            description="Government blue - official primary color"
          />
          <ColorScale
            title="Red (Secondary/Danger)"
            scale={rawColors.red}
            description="Philippine flag red - secondary and error states"
          />
          <ColorScale
            title="Green (Success)"
            scale={rawColors.green}
            description="Success states and positive actions"
          />
          <ColorScale
            title="Amber (Warning)"
            scale={rawColors.amber}
            description="Warning states and caution indicators"
          />
          <ColorScale
            title="Neutral (Gray)"
            scale={rawColors.neutral}
            description="Text, borders, and neutral backgrounds"
          />
        </div>
      </div>

      {/* Interactive Color Picker */}
      <div className="mb-12">
        <h2 className="mb-6 text-2xl font-semibold text-neutral-900">Interactive Color Picker</h2>
        <p className="mb-6 text-neutral-600">
          Click on any color to preview it and copy the hex value to your clipboard.
        </p>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <ColorPicker />
        </div>
      </div>

      {/* Semantic Colors */}
      <div className="mb-12">
        <h2 className="mb-6 text-2xl font-semibold text-neutral-900">Semantic Color Tokens</h2>
        <p className="mb-6 text-neutral-600">
          Contextual color tokens that provide meaning and ensure consistency across components.
        </p>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <ColorGroup
            title="Text Colors"
            colors={semanticColors.text}
            description="Typography and content colors"
          />

          <ColorGroup
            title="Background Colors"
            colors={semanticColors.background}
            description="Surface and container colors"
          />

          <ColorGroup
            title="Border Colors"
            colors={semanticColors.border}
            description="Border and outline colors"
          />

          <ColorGroup
            title="Interactive Colors"
            colors={semanticColors.interactive}
            description="Button and interaction states"
          />
        </div>
      </div>

      {/* Status Colors */}
      <div className="mb-12">
        <h2 className="mb-6 text-2xl font-semibold text-neutral-900">Status & Feedback Colors</h2>
        <p className="mb-6 text-neutral-600">
          Colors for communicating status, feedback, and system states to users.
        </p>

        <ColorGroup
          title="Status Indicators"
          colors={semanticColors.status}
          description="Success, warning, error, and info states"
        />

        {/* Status Examples */}
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold text-neutral-900">Status Usage Examples</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Success example */}
            <div
              className="rounded-lg border-l-4 p-4"
              style={{
                backgroundColor: semanticColors.status.successLight,
                borderLeftColor: semanticColors.status.success,
              }}
            >
              <div className="flex items-center">
                <div
                  className="mr-2 h-2 w-2 rounded-full"
                  style={{ backgroundColor: semanticColors.status.success }}
                />
                <span style={{ color: semanticColors.text.success }}>
                  Application submitted successfully
                </span>
              </div>
            </div>

            {/* Warning example */}
            <div
              className="rounded-lg border-l-4 p-4"
              style={{
                backgroundColor: semanticColors.status.warningLight,
                borderLeftColor: semanticColors.status.warning,
              }}
            >
              <div className="flex items-center">
                <div
                  className="mr-2 h-2 w-2 rounded-full"
                  style={{ backgroundColor: semanticColors.status.warning }}
                />
                <span style={{ color: semanticColors.text.warning }}>
                  Document verification required
                </span>
              </div>
            </div>

            {/* Error example */}
            <div
              className="rounded-lg border-l-4 p-4"
              style={{
                backgroundColor: semanticColors.status.errorLight,
                borderLeftColor: semanticColors.status.error,
              }}
            >
              <div className="flex items-center">
                <div
                  className="mr-2 h-2 w-2 rounded-full"
                  style={{ backgroundColor: semanticColors.status.error }}
                />
                <span style={{ color: semanticColors.text.error }}>
                  Invalid government ID format
                </span>
              </div>
            </div>

            {/* Info example */}
            <div
              className="rounded-lg border-l-4 p-4"
              style={{
                backgroundColor: semanticColors.status.infoLight,
                borderLeftColor: semanticColors.status.info,
              }}
            >
              <div className="flex items-center">
                <div
                  className="mr-2 h-2 w-2 rounded-full"
                  style={{ backgroundColor: semanticColors.status.info }}
                />
                <span style={{ color: colorTokens.primary[700] }}>
                  Processing time: 3-5 business days
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Color Guidelines */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-blue-900">🎨 Color Usage Guidelines</h3>
        <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-2">
          <div>
            <h4 className="mb-2 font-semibold text-blue-900">Accessibility</h4>
            <ul className="space-y-1 text-blue-800">
              <li>• All color combinations meet WCAG 2.1 AA contrast standards</li>
              <li>• Never rely solely on color to convey information</li>
              <li>• Test colors with color blindness simulators</li>
              <li>• Use semantic tokens for consistent meaning</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 font-semibold text-blue-900">Best Practices</h4>
            <ul className="space-y-1 text-blue-800">
              <li>• Use raw Tailwind colors as the foundation</li>
              <li>• Apply semantic tokens for component styling</li>
              <li>• Maintain consistent color patterns across features</li>
              <li>• Consider cultural significance of colors in PH context</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-blue-300 bg-blue-100 p-4">
          <h4 className="mb-2 font-semibold text-blue-900">💡 Pro Tips</h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Use the interactive color picker to preview colors</li>
            <li>• Copy color values directly to your clipboard</li>
            <li>• Reference semantic tokens in your components</li>
            <li>• Test color combinations in different lighting conditions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Colors;
