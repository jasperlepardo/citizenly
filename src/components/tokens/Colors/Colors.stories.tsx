import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import resolveConfig from 'tailwindcss/resolveConfig';
// @ts-ignore - JS config file
import tailwindConfig from '../../../../tailwind.config.js';

// Get resolved Tailwind config with all colors
const fullConfig = resolveConfig(tailwindConfig as any);
const { colors } = fullConfig.theme as any;

// Helper Components
const ColorSwatch: React.FC<{ name: string; value: string; className?: string }> = ({
  name,
  value,
  className = '',
}) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (err) {
      console.error('Failed to copy color:', err);
    }
  };

  // Auto-determine text color
  const getTextColor = (bgColor: string): string => {
    if (bgColor === 'transparent') return '#000000';
    const hex = bgColor.replace('#', '');
    if (hex.length !== 6) return '#000000';

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    return brightness > 128 ? '#000000' : '#ffffff';
  };

  const textColor = getTextColor(value);

  return (
    <div
      className={`cursor-pointer rounded-lg border border-gray-200 p-4 transition-all hover:shadow-md ${className}`}
      style={{ backgroundColor: value, color: textColor }}
      onClick={handleCopy}
      title={`Click to copy ${value}`}
    >
      <div className="text-sm font-semibold">{name}</div>
      <div className="mt-1 font-mono text-xs opacity-75">{value}</div>
    </div>
  );
};

const ColorScale: React.FC<{
  title: string;
  colorObject: Record<string, string>;
  description?: string;
}> = ({ title, colorObject, description }) => {
  return (
    <div className="mb-8">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
      </div>
      <div className="flex overflow-hidden rounded-lg border border-gray-200 shadow-sm">
        {Object.entries(colorObject).map(([shade, color]) => (
          <div
            key={shade}
            className="flex min-h-[80px] flex-1 cursor-pointer flex-col justify-between p-3 transition-transform hover:scale-105"
            style={{
              backgroundColor: color,
              color: shade === '50' || shade === '100' || shade === '200' ? '#000000' : '#ffffff',
            }}
            onClick={() => navigator.clipboard.writeText(color)}
            title={`Click to copy ${color}`}
          >
            <div className="text-xs font-bold">{shade}</div>
            <div className="mt-1 font-mono text-xs">{color}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const meta: Meta = {
  title: 'Design Tokens/Colors',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Figma-Style Color System

This is your **living color documentation** using professional Figma design system patterns. 
All colors read directly from your Tailwind config with built-in dark mode support.

## What You Have

- **Brand Colors**: Your government blue, purple, green, orange, red palette
- **Text Hierarchy**: \`text-text-primary\`, \`text-text-secondary\`, \`text-text-tertiary\`, \`text-text-quaternary\`
- **Background Hierarchy**: \`bg-background-primary\`, \`bg-background-secondary\`, etc.
- **Context-Aware**: \`_onBrand\`, \`_hover\`, \`_solid\` variants
- **Built-in Dark Mode**: Every semantic color automatically switches

## Professional Usage Patterns

\`\`\`tsx
// Text hierarchy (professional Figma pattern)
<h1 className="text-text-primary">Main heading</h1>
<p className="text-text-secondary">Secondary content</p>
<p className="text-text-tertiary">Less important content</p>
<span className="text-text-quaternary">Subtle text</span>

// Context-aware text
<span className="text-text-primary_onBrand">White text on brand colors</span>
<span className="text-text-secondary_onBrand">Light text on brand</span>

// Background hierarchy  
<div className="bg-background-primary">Main background</div>
<div className="bg-background-secondary">Card background</div>
<div className="bg-background-tertiary">Subtle background</div>

// Status colors with hierarchy
<div className="text-text-success_primary bg-background-success_primary border border-border-success">
  Professional success message
</div>

// Brand colors (your government theme)
<button className="bg-background-brand_solid hover:bg-background-brand_solid_hover text-text-primary_onBrand">
  Government Action Button
</button>

// Still use standard Tailwind when needed
<div className="bg-blue-500 text-white">Standard Tailwind</div>
\`\`\`

## Dark Mode

All semantic colors automatically switch in dark mode. Just add \`dark\` class to your HTML:

\`\`\`html
<html className="dark">
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Brand Colors from Config
export const BrandColors: Story = {
  name: '🎨 Brand Colors',
  render: () => (
    <div className="mx-auto max-w-6xl p-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Brand Color System</h1>
        <p className="text-gray-600">
          Your brand color palette from{' '}
          <code className="rounded bg-gray-100 px-2 py-1">tailwind.config.js</code>. Use classes
          like <code className="rounded bg-gray-100 px-2 py-1">bg-primary-600</code>,{' '}
          <code className="rounded bg-gray-100 px-2 py-1">text-secondary-500</code>, etc.
        </p>
      </div>

      <div className="space-y-8">
        {colors.primary && (
          <ColorScale
            title="Primary (Blue)"
            colorObject={colors.primary}
            description="Government blue - your main brand color"
          />
        )}
        {colors.secondary && (
          <ColorScale
            title="Secondary (Purple)"
            colorObject={colors.secondary}
            description="Brand secondary color"
          />
        )}
        {colors.success && (
          <ColorScale
            title="Success (Green)"
            colorObject={colors.success}
            description="Success states and positive actions"
          />
        )}
        {colors.warning && (
          <ColorScale
            title="Warning (Orange)"
            colorObject={colors.warning}
            description="Warning states and caution indicators"
          />
        )}
        {colors.danger && (
          <ColorScale
            title="Danger (Red)"
            colorObject={colors.danger}
            description="Error states and destructive actions"
          />
        )}
        {colors.neutral && (
          <ColorScale
            title="Neutral (Gray)"
            colorObject={colors.neutral}
            description="Text, borders, and neutral backgrounds"
          />
        )}
      </div>
    </div>
  ),
};

// Semantic Colors from Config
export const SemanticColors: Story = {
  name: '💭 Complete Semantic System',
  render: () => (
    <div className="mx-auto max-w-6xl p-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Professional Semantic Color System
        </h1>
        <p className="text-gray-600">
          Your complete semantic color system with text hierarchy, backgrounds, borders, and dark
          mode support.
        </p>
      </div>

      {/* Text Semantic Colors - Comprehensive */}
      <div className="mb-12">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">Text Semantic Colors</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {colors.text &&
            Object.entries(colors.text).map(([name, colorObj]) => {
              const colorValue = typeof colorObj === 'object' ? colorObj.DEFAULT : colorObj;
              const darkValue = typeof colorObj === 'object' ? colorObj.dark : null;

              return (
                <div key={name} className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="mb-2 flex items-center gap-3">
                    <div
                      className="h-6 w-6 flex-shrink-0 rounded border border-gray-200"
                      style={{ backgroundColor: colorValue }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-gray-900">text-{name}</div>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="font-mono text-gray-600">Light: {colorValue}</div>
                    {darkValue && <div className="font-mono text-gray-600">Dark: {darkValue}</div>}
                  </div>
                  <div className="mt-3">
                    <div className="rounded px-2 py-1 text-sm" style={{ color: colorValue }}>
                      Sample text
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Background Semantic Colors - Comprehensive */}
      <div className="mb-12">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">Background Semantic Colors</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {colors.background &&
            Object.entries(colors.background).map(([name, colorObj]) => {
              const colorValue = typeof colorObj === 'object' ? colorObj.DEFAULT : colorObj;
              const darkValue = typeof colorObj === 'object' ? colorObj.dark : null;

              return (
                <div key={name} className="overflow-hidden rounded-lg border border-gray-200">
                  <div className="p-4" style={{ backgroundColor: colorValue }}>
                    <div
                      className="mb-1 text-sm font-semibold"
                      style={{
                        color:
                          colorValue === '#FFFFFF' || colorValue === '#ffffff'
                            ? '#000000'
                            : '#ffffff',
                      }}
                    >
                      bg-background-{name}
                    </div>
                    <div
                      className="text-xs"
                      style={{
                        color:
                          colorValue === '#FFFFFF' || colorValue === '#ffffff'
                            ? '#666666'
                            : '#cccccc',
                      }}
                    >
                      Background sample
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3">
                    <div className="space-y-1 text-xs">
                      <div className="font-mono text-gray-600">Light: {colorValue}</div>
                      {darkValue && (
                        <div className="font-mono text-gray-600">Dark: {darkValue}</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Border Semantic Colors - Comprehensive */}
      <div className="mb-12">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">Border Semantic Colors</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {colors.border &&
            Object.entries(colors.border).map(([name, colorObj]) => {
              const colorValue = typeof colorObj === 'object' ? colorObj.DEFAULT : colorObj;
              const darkValue = typeof colorObj === 'object' ? colorObj.dark : null;

              return (
                <div key={name} className="overflow-hidden rounded-lg bg-white">
                  <div className="border-2 p-4" style={{ borderColor: colorValue }}>
                    <div className="mb-1 text-sm font-semibold text-gray-900">border-{name}</div>
                    <div className="text-xs text-gray-600">Border sample</div>
                  </div>
                  <div className="bg-gray-50 p-3">
                    <div className="space-y-1 text-xs">
                      <div className="font-mono text-gray-600">Light: {colorValue}</div>
                      {darkValue && (
                        <div className="font-mono text-gray-600">Dark: {darkValue}</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Usage Guidelines */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-blue-900">
          💡 Professional Usage Guidelines
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <h4 className="mb-2 font-semibold text-blue-800">Text Hierarchy:</h4>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>
                • <code>text-primary</code> - Main content
              </li>
              <li>
                • <code>text-secondary</code> - Supporting text
              </li>
              <li>
                • <code>text-tertiary</code> - Less important
              </li>
              <li>
                • <code>text-quaternary</code> - Metadata
              </li>
              <li>
                • <code>text-*_onBrand</code> - On colored backgrounds
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 font-semibold text-blue-800">Background Layers:</h4>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>
                • <code>bg-primary</code> - Main surfaces
              </li>
              <li>
                • <code>bg-secondary</code> - Card backgrounds
              </li>
              <li>
                • <code>bg-tertiary</code> - Subtle surfaces
              </li>
              <li>
                • <code>bg-*_solid</code> - Solid colored backgrounds
              </li>
              <li>
                • <code>bg-*_hover</code> - Interactive states
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 font-semibold text-blue-800">Border Hierarchy:</h4>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>
                • <code>border-primary</code> - Main borders
              </li>
              <li>
                • <code>border-secondary</code> - Subtle borders
              </li>
              <li>
                • <code>border-tertiary</code> - Very subtle
              </li>
              <li>
                • <code>border-*_solid</code> - Colored borders
              </li>
              <li>
                • <code>border-disabled</code> - Inactive states
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Text Hierarchy Story
export const TextHierarchy: Story = {
  name: '📝 Text Hierarchy (Figma Style)',
  render: () => (
    <div className="mx-auto max-w-6xl p-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Professional Text Hierarchy</h1>
        <p className="text-gray-600">
          Figma-style text hierarchy with semantic naming. Each level has specific usage contexts.
        </p>
      </div>

      <div className="space-y-8">
        {/* Text Hierarchy Examples */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-6 text-lg font-semibold text-gray-900">Text Hierarchy in Light Mode</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-gray-700">Primary</div>
              <div className="text-xl text-text-primary">Main headings and important content</div>
              <code className="rounded bg-gray-100 px-2 py-1 text-xs">text-text-primary</code>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-gray-700">Secondary</div>
              <div className="text-lg text-text-secondary">Secondary headings and body text</div>
              <code className="rounded bg-gray-100 px-2 py-1 text-xs">text-text-secondary</code>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-gray-700">Tertiary</div>
              <div className="text-text-tertiary">Supporting information</div>
              <code className="rounded bg-gray-100 px-2 py-1 text-xs">text-text-tertiary</code>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-gray-700">Quaternary</div>
              <div className="text-sm text-text-quaternary">Subtle details and metadata</div>
              <code className="rounded bg-gray-100 px-2 py-1 text-xs">text-text-quaternary</code>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-gray-700">Disabled</div>
              <div className="text-sm text-text-disabled">Disabled or inactive text</div>
              <code className="rounded bg-gray-100 px-2 py-1 text-xs">text-text-disabled</code>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-gray-700">Placeholder</div>
              <div className="text-sm italic text-text-placeholder">Form placeholder text</div>
              <code className="rounded bg-gray-100 px-2 py-1 text-xs">text-text-placeholder</code>
            </div>
          </div>
        </div>

        {/* Brand Context Text */}
        <div className="rounded-xl border border-primary-700 bg-primary-600 p-6">
          <h3 className="mb-6 text-lg font-semibold text-text-primary_onBrand">
            Text on Brand Colors
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-text-secondary_onBrand">
                Primary on Brand
              </div>
              <div className="text-xl text-text-primary_onBrand">White text for high contrast</div>
              <code className="rounded bg-primary-800 px-2 py-1 text-xs text-primary-100">
                text-text-primary_onBrand
              </code>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-text-secondary_onBrand">
                Secondary on Brand
              </div>
              <div className="text-text-secondary_onBrand">Light blue text on brand</div>
              <code className="rounded bg-primary-800 px-2 py-1 text-xs text-primary-100">
                text-text-secondary_onBrand
              </code>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-text-secondary_onBrand">
                Tertiary on Brand
              </div>
              <div className="text-sm text-text-tertiary_onBrand">
                Subtle text on brand backgrounds
              </div>
              <code className="rounded bg-primary-800 px-2 py-1 text-xs text-primary-100">
                text-text-tertiary_onBrand
              </code>
            </div>
          </div>
        </div>

        {/* Status Text Colors */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border-success bg-background-success_primary p-4">
            <h4 className="mb-2 font-semibold text-text-success_primary">Success Text</h4>
            <p className="text-sm text-text-success_primary">
              Use for positive feedback, confirmations, and successful actions.
            </p>
            <code className="mt-2 inline-block rounded bg-success-100 px-2 py-1 text-xs text-success-800">
              text-text-success_primary
            </code>
          </div>
          <div className="rounded-lg border border-border-warning bg-background-warning_primary p-4">
            <h4 className="mb-2 font-semibold text-text-warning_primary">Warning Text</h4>
            <p className="text-sm text-text-warning_primary">
              Use for cautions, pending states, and important notices.
            </p>
            <code className="mt-2 inline-block rounded bg-orange-100 px-2 py-1 text-xs text-orange-800">
              text-text-warning_primary
            </code>
          </div>
          <div className="rounded-lg border border-border-error bg-background-error_primary p-4">
            <h4 className="mb-2 font-semibold text-text-error_primary">Error Text</h4>
            <p className="text-sm text-text-error_primary">
              Use for errors, validation messages, and critical alerts.
            </p>
            <code className="mt-2 inline-block rounded bg-red-100 px-2 py-1 text-xs text-red-800">
              text-text-error_primary
            </code>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
        <h3 className="mb-2 text-lg font-semibold text-blue-900">💡 Usage Guidelines</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>
            <strong>Primary:</strong> Main headings, key information, primary actions
          </p>
          <p>
            <strong>Secondary:</strong> Subheadings, body text, secondary content
          </p>
          <p>
            <strong>Tertiary:</strong> Supporting details, less important information
          </p>
          <p>
            <strong>Quaternary:</strong> Metadata, timestamps, subtle details
          </p>
          <p>
            <strong>On Brand:</strong> Text that appears on colored backgrounds
          </p>
        </div>
      </div>
    </div>
  ),
};

// Live Examples
// Utility Colors Documentation
export const UtilityColors: Story = {
  name: '🎨 Utility Color Scales',
  render: () => (
    <div className="mx-auto max-w-6xl p-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Complete Utility Color System</h1>
        <p className="text-gray-600">
          Full Tailwind color palette with dark mode support. Each color includes comprehensive
          50-950 scale.
        </p>
      </div>

      {colors.utility && (
        <div className="space-y-8">
          {Object.entries(colors.utility).map(([colorName, colorScale]) => (
            <div
              key={colorName}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <h2 className="mb-4 text-lg font-semibold capitalize text-gray-900">
                {colorName.replace('-', ' ')} Utilities
              </h2>
              <div className="flex overflow-hidden rounded-lg border border-gray-200">
                {typeof colorScale === 'object' &&
                  Object.entries(colorScale as Record<string, any>).map(([shade, colorObj]) => {
                    const colorValue = typeof colorObj === 'object' ? colorObj.DEFAULT : colorObj;
                    const darkValue = typeof colorObj === 'object' ? colorObj.dark : null;

                    return (
                      <div
                        key={shade}
                        className="flex min-h-[100px] flex-1 cursor-pointer flex-col justify-between p-3 transition-transform hover:scale-105"
                        style={{
                          backgroundColor: colorValue,
                          color: ['50', '100', '200', '300'].includes(shade)
                            ? '#000000'
                            : '#ffffff',
                        }}
                        onClick={() => navigator.clipboard.writeText(colorValue)}
                        title={`Click to copy ${colorValue}`}
                      >
                        <div className="text-xs font-bold">{shade}</div>
                        <div className="space-y-1">
                          <div className="font-mono text-xs">{colorValue}</div>
                          {darkValue && (
                            <div className="font-mono text-xs opacity-75">Dark: {darkValue}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div className="mt-4 rounded-lg bg-gray-50 p-4">
                <h3 className="mb-2 text-sm font-semibold text-gray-700">Usage Examples:</h3>
                <div className="flex flex-wrap gap-2 text-xs">
                  <code className="rounded border bg-white px-2 py-1">
                    text-utility-{colorName}-600
                  </code>
                  <code className="rounded border bg-white px-2 py-1">
                    bg-utility-{colorName}-50
                  </code>
                  <code className="rounded border bg-white px-2 py-1">
                    border-utility-{colorName}-300
                  </code>
                  <code className="rounded border bg-white px-2 py-1">
                    hover:bg-utility-{colorName}-100
                  </code>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Usage Guidelines for Utility Colors */}
      <div className="mt-12 rounded-lg border border-green-200 bg-green-50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-green-900">🌈 Utility Color Guidelines</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-3 font-semibold text-green-800">When to Use Utility Colors:</h4>
            <ul className="space-y-2 text-sm text-green-700">
              <li>
                • <strong>Illustrations & Graphics:</strong> Colorful icons, charts, illustrations
              </li>
              <li>
                • <strong>Status Indicators:</strong> Success (green), warning (amber), error (red)
              </li>
              <li>
                • <strong>Categories & Tags:</strong> Different colored badges or labels
              </li>
              <li>
                • <strong>Data Visualization:</strong> Charts, graphs, progress bars
              </li>
              <li>
                • <strong>Accent Colors:</strong> Highlighting specific content
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-green-800">Color Scale Guidelines:</h4>
            <ul className="space-y-2 text-sm text-green-700">
              <li>
                • <strong>50-200:</strong> Very light, backgrounds, subtle accents
              </li>
              <li>
                • <strong>300-400:</strong> Light, borders, muted content
              </li>
              <li>
                • <strong>500:</strong> Base color, primary use case
              </li>
              <li>
                • <strong>600-700:</strong> Darker, hover states, emphasis
              </li>
              <li>
                • <strong>800-950:</strong> Very dark, high contrast text
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const LiveExamples: Story = {
  name: '🚀 Live Examples',
  render: () => (
    <div className="mx-auto max-w-6xl p-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Your Colors in Action</h1>
        <p className="text-gray-600">
          See your semantic color system in real components. All colors come directly from your
          config.
        </p>
      </div>

      <div className="space-y-8">
        {/* Brand Buttons */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Brand Color Buttons</h3>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-lg bg-primary-600 px-6 py-3 text-white transition-colors hover:bg-primary-700">
              Primary Button
              <span className="block text-xs opacity-75">bg-primary-600</span>
            </button>
            <button className="rounded-lg bg-secondary-600 px-6 py-3 text-white transition-colors hover:bg-secondary-700">
              Secondary Button
              <span className="block text-xs opacity-75">bg-secondary-600</span>
            </button>
            <button className="rounded-lg bg-success-600 px-6 py-3 text-white transition-colors hover:bg-success-700">
              Success Button
              <span className="block text-xs opacity-75">bg-success-600</span>
            </button>
            <button className="rounded-lg bg-danger-600 px-6 py-3 text-white transition-colors hover:bg-danger-700">
              Danger Button
              <span className="block text-xs opacity-75">bg-danger-600</span>
            </button>
          </div>
        </div>

        {/* Professional Semantic Notifications */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Professional Semantic Notifications
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border-l-4 border-border-success bg-background-success_primary p-4">
              <div className="flex items-center">
                <div className="mr-3 h-2 w-2 rounded-full bg-background-success_solid" />
                <span className="font-medium text-text-success_primary">
                  Application submitted successfully
                </span>
              </div>
              <p className="mt-2 text-sm text-text-quaternary">
                Classes:{' '}
                <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">
                  bg-background-success_primary text-text-success_primary
                </code>
              </p>
            </div>

            <div className="rounded-lg border-l-4 border-border-warning bg-background-warning_primary p-4">
              <div className="flex items-center">
                <div className="mr-3 h-2 w-2 rounded-full bg-background-warning_solid" />
                <span className="font-medium text-text-warning_primary">
                  Document verification required
                </span>
              </div>
              <p className="mt-2 text-sm text-text-quaternary">
                Classes:{' '}
                <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">
                  bg-background-warning_primary text-text-warning_primary
                </code>
              </p>
            </div>

            <div className="rounded-lg border-l-4 border-border-error bg-background-error_primary p-4">
              <div className="flex items-center">
                <div className="mr-3 h-2 w-2 rounded-full bg-background-error_solid" />
                <span className="font-medium text-text-error_primary">
                  Invalid government ID format
                </span>
              </div>
              <p className="mt-2 text-sm text-text-quaternary">
                Classes:{' '}
                <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">
                  bg-background-error_primary text-text-error_primary
                </code>
              </p>
            </div>

            <div className="rounded-lg border border-border-primary bg-background-secondary p-4">
              <h4 className="mb-2 font-semibold text-text-primary">Professional Content Card</h4>
              <p className="mb-2 text-text-secondary">
                This is secondary text content using professional Figma-style hierarchy.
              </p>
              <p className="text-sm text-text-quaternary">
                Classes:{' '}
                <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">
                  bg-background-secondary text-text-primary text-text-secondary
                </code>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
        <h3 className="mb-2 text-lg font-semibold text-blue-900">🎯 Single Source of Truth</h3>
        <p className="text-sm text-blue-800">
          All colors shown here come directly from your{' '}
          <code className="rounded bg-blue-100 px-1 py-0.5">tailwind.config.js</code>. When you
          update your config, this documentation automatically updates too!
        </p>
      </div>
    </div>
  ),
};
