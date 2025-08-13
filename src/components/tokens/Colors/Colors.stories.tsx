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

      {/* Text Semantic Colors - Clean Structure */}
      <div className="mb-12">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">Clean Text Colors</h2>
        <p className="mb-4 text-sm text-gray-600">
          Now using clean class names:{' '}
          <code className="rounded bg-gray-100 px-1 py-0.5">text-default</code>,{' '}
          <code className="rounded bg-gray-100 px-1 py-0.5">text-primary</code>,{' '}
          <code className="rounded bg-gray-100 px-1 py-0.5">text-success</code> (no redundant
          prefixes!)
        </p>

        <div className="grid grid-cols-1 gap-6">
          {/* Content Hierarchy Section */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">📝 Content Hierarchy</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {colors.default && (
                <div className="rounded-lg border border-gray-100 p-4">
                  <div className="mb-2 flex items-center gap-3">
                    <div
                      className="h-6 w-6 flex-shrink-0 rounded border border-gray-200"
                      style={{ backgroundColor: colors.default.DEFAULT }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-gray-900">text-default</div>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="font-mono text-gray-600">Light: {colors.default.DEFAULT}</div>
                    <div className="font-mono text-gray-600">Dark: {colors.default.dark}</div>
                  </div>
                  <div className="mt-3">
                    <div
                      className="rounded px-2 py-1 text-sm"
                      style={{ color: colors.default.DEFAULT }}
                    >
                      Main headings
                    </div>
                  </div>
                </div>
              )}

              {colors.default_secondary && (
                <div className="rounded-lg border border-gray-100 p-4">
                  <div className="mb-2 flex items-center gap-3">
                    <div
                      className="h-6 w-6 flex-shrink-0 rounded border border-gray-200"
                      style={{ backgroundColor: colors.default_secondary.DEFAULT }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-gray-900">
                        text-default_secondary
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="font-mono text-gray-600">
                      Light: {colors.default_secondary.DEFAULT}
                    </div>
                    <div className="font-mono text-gray-600">
                      Dark: {colors.default_secondary.dark}
                    </div>
                  </div>
                  <div className="mt-3">
                    <div
                      className="rounded px-2 py-1 text-sm"
                      style={{ color: colors.default_secondary.DEFAULT }}
                    >
                      Body text
                    </div>
                  </div>
                </div>
              )}

              {colors.default_tertiary && (
                <div className="rounded-lg border border-gray-100 p-4">
                  <div className="mb-2 flex items-center gap-3">
                    <div
                      className="h-6 w-6 flex-shrink-0 rounded border border-gray-200"
                      style={{ backgroundColor: colors.default_tertiary.DEFAULT }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-gray-900">
                        text-default_tertiary
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="font-mono text-gray-600">
                      Light: {colors.default_tertiary.DEFAULT}
                    </div>
                    <div className="font-mono text-gray-600">
                      Dark: {colors.default_tertiary.dark}
                    </div>
                  </div>
                  <div className="mt-3">
                    <div
                      className="rounded px-2 py-1 text-sm"
                      style={{ color: colors.default_tertiary.DEFAULT }}
                    >
                      Supporting info
                    </div>
                  </div>
                </div>
              )}

              {colors.default_quaternary && (
                <div className="rounded-lg border border-gray-100 p-4">
                  <div className="mb-2 flex items-center gap-3">
                    <div
                      className="h-6 w-6 flex-shrink-0 rounded border border-gray-200"
                      style={{ backgroundColor: colors.default_quaternary.DEFAULT }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-gray-900">
                        text-default_quaternary
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="font-mono text-gray-600">
                      Light: {colors.default_quaternary.DEFAULT}
                    </div>
                    <div className="font-mono text-gray-600">
                      Dark: {colors.default_quaternary.dark}
                    </div>
                  </div>
                  <div className="mt-3">
                    <div
                      className="rounded px-2 py-1 text-sm"
                      style={{ color: colors.default_quaternary.DEFAULT }}
                    >
                      Metadata
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Brand Colors Section */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">🎨 Brand Colors</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {colors.primary && (
                <div className="rounded-lg border border-gray-100 p-4">
                  <div className="mb-2 flex items-center gap-3">
                    <div
                      className="h-6 w-6 flex-shrink-0 rounded border border-gray-200"
                      style={{ backgroundColor: colors.primary.DEFAULT }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-gray-900">text-primary</div>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="font-mono text-gray-600">Light: {colors.primary.DEFAULT}</div>
                    <div className="font-mono text-gray-600">Dark: {colors.primary.dark}</div>
                  </div>
                  <div className="mt-3">
                    <div
                      className="rounded px-2 py-1 text-sm"
                      style={{ color: colors.primary.DEFAULT }}
                    >
                      Government Blue
                    </div>
                  </div>
                </div>
              )}

              {colors.secondary && (
                <div className="rounded-lg border border-gray-100 p-4">
                  <div className="mb-2 flex items-center gap-3">
                    <div
                      className="h-6 w-6 flex-shrink-0 rounded border border-gray-200"
                      style={{ backgroundColor: colors.secondary.DEFAULT }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-gray-900">text-secondary</div>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="font-mono text-gray-600">Light: {colors.secondary.DEFAULT}</div>
                    <div className="font-mono text-gray-600">Dark: {colors.secondary.dark}</div>
                  </div>
                  <div className="mt-3">
                    <div
                      className="rounded px-2 py-1 text-sm"
                      style={{ color: colors.secondary.DEFAULT }}
                    >
                      Brand Purple
                    </div>
                  </div>
                </div>
              )}

              {colors.success && (
                <div className="rounded-lg border border-gray-100 p-4">
                  <div className="mb-2 flex items-center gap-3">
                    <div
                      className="h-6 w-6 flex-shrink-0 rounded border border-gray-200"
                      style={{ backgroundColor: colors.success.DEFAULT }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-gray-900">text-success</div>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="font-mono text-gray-600">Light: {colors.success.DEFAULT}</div>
                    <div className="font-mono text-gray-600">Dark: {colors.success.dark}</div>
                  </div>
                  <div className="mt-3">
                    <div
                      className="rounded px-2 py-1 text-sm"
                      style={{ color: colors.success.DEFAULT }}
                    >
                      Success Green
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Interactive States Section */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">⚡ Interactive States</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {colors.default_secondary_hover && (
                <div className="rounded-lg border border-gray-100 p-4">
                  <div className="mb-2 flex items-center gap-3">
                    <div
                      className="h-6 w-6 flex-shrink-0 rounded border border-gray-200"
                      style={{ backgroundColor: colors.default_secondary_hover.DEFAULT }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-gray-900">
                        hover:text-default_secondary_hover
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="font-mono text-gray-600">
                      Light: {colors.default_secondary_hover.DEFAULT}
                    </div>
                    <div className="font-mono text-gray-600">
                      Dark: {colors.default_secondary_hover.dark}
                    </div>
                  </div>
                  <div className="mt-3">
                    <div
                      className="rounded px-2 py-1 text-sm"
                      style={{ color: colors.default_secondary_hover.DEFAULT }}
                    >
                      Secondary hover
                    </div>
                  </div>
                </div>
              )}

              {colors.default_tertiary_hover && (
                <div className="rounded-lg border border-gray-100 p-4">
                  <div className="mb-2 flex items-center gap-3">
                    <div
                      className="h-6 w-6 flex-shrink-0 rounded border border-gray-200"
                      style={{ backgroundColor: colors.default_tertiary_hover.DEFAULT }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-gray-900">
                        hover:text-default_tertiary_hover
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="font-mono text-gray-600">
                      Light: {colors.default_tertiary_hover.DEFAULT}
                    </div>
                    <div className="font-mono text-gray-600">
                      Dark: {colors.default_tertiary_hover.dark}
                    </div>
                  </div>
                  <div className="mt-3">
                    <div
                      className="rounded px-2 py-1 text-sm"
                      style={{ color: colors.default_tertiary_hover.DEFAULT }}
                    >
                      Tertiary hover
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Background Semantic Colors - Clean Structure */}
      <div className="mb-12">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">Clean Background Colors</h2>
        <p className="mb-4 text-sm text-gray-600">
          Now using: <code className="rounded bg-gray-100 px-1 py-0.5">bg-default</code>,{' '}
          <code className="rounded bg-gray-100 px-1 py-0.5">bg-primary</code>,{' '}
          <code className="rounded bg-gray-100 px-1 py-0.5">bg-success</code>
        </p>

        <div className="space-y-4 text-sm text-blue-800">
          <p>
            <strong>Surface Hierarchy:</strong> bg-default (main), bg-default_secondary (cards),
            bg-default_tertiary (subtle)
          </p>
          <p>
            <strong>Brand Backgrounds:</strong> bg-primary (light), bg-primary_solid (buttons)
          </p>
          <p>
            <strong>Status Backgrounds:</strong> bg-success, bg-warning, bg-error
          </p>
        </div>
      </div>

      {/* Border Semantic Colors - Clean Structure */}
      <div className="mb-12">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">Clean Border Colors</h2>
        <p className="mb-4 text-sm text-gray-600">
          Now using: <code className="rounded bg-gray-100 px-1 py-0.5">border-default</code>,{' '}
          <code className="rounded bg-gray-100 px-1 py-0.5">border-primary</code>,{' '}
          <code className="rounded bg-gray-100 px-1 py-0.5">border-success</code>
        </p>

        <div className="space-y-4 text-sm text-purple-800">
          <p>
            <strong>Border Hierarchy:</strong> border-default (main), border-default_secondary
            (subtle), border-default_tertiary (very subtle)
          </p>
          <p>
            <strong>Brand Borders:</strong> border-primary (light brand), border-primary_solid
            (strong brand)
          </p>
          <p>
            <strong>Status Borders:</strong> border-success, border-warning, border-error
          </p>
        </div>
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

      {/* Usage Guidelines - Updated for Clean Structure */}
      <div className="rounded-lg border border-green-200 bg-green-50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-green-900">
          🎉 Clean Color System - No More Redundant Prefixes!
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <h4 className="mb-2 font-semibold text-green-800">✨ Text Colors:</h4>
            <ul className="space-y-1 text-sm text-green-700">
              <li>
                • <code>text-default</code> - Main content
              </li>
              <li>
                • <code>text-default_secondary</code> - Body text
              </li>
              <li>
                • <code>text-default_tertiary</code> - Supporting info
              </li>
              <li>
                • <code>text-primary</code> - Brand blue text
              </li>
              <li>
                • <code>text-success</code> - Success green text
              </li>
              <li>
                • <code>hover:text-default_secondary_hover</code> - Interactive
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 font-semibold text-green-800">🏠 Backgrounds:</h4>
            <ul className="space-y-1 text-sm text-green-700">
              <li>
                • <code>bg-default</code> - Main background
              </li>
              <li>
                • <code>bg-default_secondary</code> - Card backgrounds
              </li>
              <li>
                • <code>bg-primary</code> - Light brand background
              </li>
              <li>
                • <code>bg-primary_solid</code> - Solid brand buttons
              </li>
              <li>
                • <code>bg-success</code> - Success backgrounds
              </li>
              <li>
                • <code>hover:bg-primary_solid_hover</code> - Button hovers
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 font-semibold text-green-800">📐 Borders:</h4>
            <ul className="space-y-1 text-sm text-green-700">
              <li>
                • <code>border-default</code> - Main borders
              </li>
              <li>
                • <code>border-default_secondary</code> - Subtle borders
              </li>
              <li>
                • <code>border-primary</code> - Brand borders
              </li>
              <li>
                • <code>border-primary_solid</code> - Strong brand
              </li>
              <li>
                • <code>border-success</code> - Success borders
              </li>
              <li>
                • <code>border-disabled</code> - Inactive states
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-green-300 bg-green-100 p-4">
          <h4 className="mb-2 font-semibold text-green-900">🚀 Benefits of the New Structure:</h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ul className="space-y-1 text-sm text-green-800">
              <li>
                ✅ <strong>Cleaner:</strong> No more text-text-primary redundancy
              </li>
              <li>
                ✅ <strong>Shorter:</strong> Less typing, more readable code
              </li>
              <li>
                ✅ <strong>Standard:</strong> Follows Tailwind conventions
              </li>
            </ul>
            <ul className="space-y-1 text-sm text-green-800">
              <li>
                ✅ <strong>Intuitive:</strong> text-primary, bg-primary, border-primary
              </li>
              <li>
                ✅ <strong>Dark Mode:</strong> Still automatic with all colors
              </li>
              <li>
                ✅ <strong>Future-proof:</strong> Easier to maintain and extend
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
              <div className="text-text-primary text-xl">Main headings and important content</div>
              <code className="rounded bg-gray-100 px-2 py-1 text-xs">text-text-primary</code>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-gray-700">Secondary</div>
              <div className="text-text-secondary text-lg">Secondary headings and body text</div>
              <code className="rounded bg-gray-100 px-2 py-1 text-xs">text-text-secondary</code>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-gray-700">Tertiary</div>
              <div className="text-text-tertiary">Supporting information</div>
              <code className="rounded bg-gray-100 px-2 py-1 text-xs">text-text-tertiary</code>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-gray-700">Quaternary</div>
              <div className="text-text-quaternary text-sm">Subtle details and metadata</div>
              <code className="rounded bg-gray-100 px-2 py-1 text-xs">text-text-quaternary</code>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-gray-700">Disabled</div>
              <div className="text-text-disabled text-sm">Disabled or inactive text</div>
              <code className="rounded bg-gray-100 px-2 py-1 text-xs">text-text-disabled</code>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-gray-700">Placeholder</div>
              <div className="text-text-placeholder text-sm italic">Form placeholder text</div>
              <code className="rounded bg-gray-100 px-2 py-1 text-xs">text-text-placeholder</code>
            </div>
          </div>
        </div>

        {/* Brand Context Text */}
        <div className="rounded-xl border border-primary-700 bg-primary-600 p-6">
          <h3 className="text-text-primary_onBrand mb-6 text-lg font-semibold">
            Text on Brand Colors
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-text-secondary_onBrand w-32 text-sm font-medium">
                Primary on Brand
              </div>
              <div className="text-text-primary_onBrand text-xl">White text for high contrast</div>
              <code className="rounded bg-primary-800 px-2 py-1 text-xs text-primary-100">
                text-text-primary_onBrand
              </code>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-text-secondary_onBrand w-32 text-sm font-medium">
                Secondary on Brand
              </div>
              <div className="text-text-secondary_onBrand">Light blue text on brand</div>
              <code className="rounded bg-primary-800 px-2 py-1 text-xs text-primary-100">
                text-text-secondary_onBrand
              </code>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-text-secondary_onBrand w-32 text-sm font-medium">
                Tertiary on Brand
              </div>
              <div className="text-text-tertiary_onBrand text-sm">
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
          <div className="border-border-success bg-background-success_primary rounded-lg border p-4">
            <h4 className="text-text-success_primary mb-2 font-semibold">Success Text</h4>
            <p className="text-text-success_primary text-sm">
              Use for positive feedback, confirmations, and successful actions.
            </p>
            <code className="mt-2 inline-block rounded bg-success-100 px-2 py-1 text-xs text-success-800">
              text-text-success_primary
            </code>
          </div>
          <div className="border-border-warning bg-background-warning_primary rounded-lg border p-4">
            <h4 className="text-text-warning_primary mb-2 font-semibold">Warning Text</h4>
            <p className="text-text-warning_primary text-sm">
              Use for cautions, pending states, and important notices.
            </p>
            <code className="mt-2 inline-block rounded bg-orange-100 px-2 py-1 text-xs text-orange-800">
              text-text-warning_primary
            </code>
          </div>
          <div className="border-border-error bg-background-error_primary rounded-lg border p-4">
            <h4 className="text-text-error_primary mb-2 font-semibold">Error Text</h4>
            <p className="text-text-error_primary text-sm">
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
            <div className="border-border-success bg-background-success_primary rounded-lg border-l-4 p-4">
              <div className="flex items-center">
                <div className="bg-background-success_solid mr-3 h-2 w-2 rounded-full" />
                <span className="text-text-success_primary font-medium">
                  Application submitted successfully
                </span>
              </div>
              <p className="text-text-quaternary mt-2 text-sm">
                Classes:{' '}
                <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">
                  bg-background-success_primary text-text-success_primary
                </code>
              </p>
            </div>

            <div className="border-border-warning bg-background-warning_primary rounded-lg border-l-4 p-4">
              <div className="flex items-center">
                <div className="bg-background-warning_solid mr-3 h-2 w-2 rounded-full" />
                <span className="text-text-warning_primary font-medium">
                  Document verification required
                </span>
              </div>
              <p className="text-text-quaternary mt-2 text-sm">
                Classes:{' '}
                <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">
                  bg-background-warning_primary text-text-warning_primary
                </code>
              </p>
            </div>

            <div className="border-border-error bg-background-error_primary rounded-lg border-l-4 p-4">
              <div className="flex items-center">
                <div className="bg-background-error_solid mr-3 h-2 w-2 rounded-full" />
                <span className="text-text-error_primary font-medium">
                  Invalid government ID format
                </span>
              </div>
              <p className="text-text-quaternary mt-2 text-sm">
                Classes:{' '}
                <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">
                  bg-background-error_primary text-text-error_primary
                </code>
              </p>
            </div>

            <div className="border-border-primary bg-background-secondary rounded-lg border p-4">
              <h4 className="text-text-primary mb-2 font-semibold">Professional Content Card</h4>
              <p className="text-text-secondary mb-2">
                This is secondary text content using professional Figma-style hierarchy.
              </p>
              <p className="text-text-quaternary text-sm">
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
