import type { Meta, StoryObj } from '@storybook/react';
import Colors, {
  ColorSwatch,
  ColorScale,
  ColorPalette,
  colorTokens,
  semanticColors,
  rawColors,
} from './Colors';

const meta = {
  title: 'Design Tokens/Colors',
  component: Colors,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Color Tokens

The color system for the Citizenly design system, inspired by Philippine government branding 
and optimized for accessibility in local government applications.

## Color Philosophy

- **Primary Blue**: Represents trust, authority, and government stability
- **Secondary Red**: References the Philippine flag and draws attention  
- **Success Green**: Positive actions and successful operations
- **Warning Yellow**: Cautions and important notifications
- **Danger Red**: Errors and destructive actions
- **Neutral Gray**: Text, borders, and subtle interface elements

## Accessibility

All color combinations meet WCAG 2.1 AA standards for contrast ratios:
- Normal text: 4.5:1 minimum contrast ratio
- Large text: 3:1 minimum contrast ratio  
- UI components: 3:1 minimum contrast ratio

## Usage in Code

\`\`\`tsx
// Using CSS classes
<div className="bg-primary-500 text-white">Primary background</div>
<div className="text-neutral-700 border-neutral-200">Neutral text with border</div>

// Using design tokens directly
import { colorTokens } from './Colors';
style={{ color: colorTokens.primary[500] }}
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Colors>;

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// MAIN STORIES
// =============================================================================

export const AllColors: Story = {
  name: '🎨 All Colors',
  render: () => <Colors />,
};

export const PrimaryPalette: Story = {
  name: '🔵 Primary Colors',
  render: () => (
    <div className="p-6">
      <ColorScale title="Primary Colors (Government Blue)" scale={colorTokens.primary} />
      <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="mb-2 font-semibold text-blue-900">When to use Primary Colors</h3>
        <p className="text-sm text-blue-800">
          Primary blue should be used for main actions, primary buttons, links, and elements that
          represent official government authority and trust.
        </p>
      </div>
    </div>
  ),
};

export const SecondaryPalette: Story = {
  name: '🔴 Secondary Colors',
  render: () => (
    <div className="p-6">
      <ColorScale title="Secondary Colors (Philippine Red)" scale={colorTokens.secondary} />
      <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
        <h3 className="mb-2 font-semibold text-red-900">When to use Secondary Colors</h3>
        <p className="text-sm text-red-800">
          Secondary red should be used sparingly for emphasis, Philippine flag references, and
          drawing attention to important elements.
        </p>
      </div>
    </div>
  ),
};

export const StatusColors: Story = {
  name: '🚦 Status Colors',
  render: () => (
    <div className="p-6">
      <div className="mb-8 space-y-8">
        <ColorScale title="Success Colors" scale={colorTokens.success} />
        <ColorScale title="Warning Colors" scale={colorTokens.warning} />
        <ColorScale title="Danger Colors" scale={colorTokens.danger} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <h3 className="mb-2 font-semibold text-green-900">✅ Success</h3>
          <p className="text-sm text-green-800">
            Confirmations, completed actions, successful form submissions
          </p>
        </div>
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <h3 className="mb-2 font-semibold text-yellow-900">⚠️ Warning</h3>
          <p className="text-sm text-yellow-800">
            Cautions, pending states, important notices requiring attention
          </p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h3 className="mb-2 font-semibold text-red-900">❌ Danger</h3>
          <p className="text-sm text-red-800">
            Errors, destructive actions, critical alerts requiring immediate action
          </p>
        </div>
      </div>
    </div>
  ),
};

export const NeutralPalette: Story = {
  name: '⚫ Neutral Colors',
  render: () => (
    <div className="p-6">
      <ColorScale title="Neutral Colors (Grayscale)" scale={colorTokens.neutral} />
      <div className="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
        <h3 className="mb-2 font-semibold text-neutral-900">When to use Neutral Colors</h3>
        <p className="text-sm text-neutral-700">
          Neutral colors form the backbone of the interface. Use them for text, borders,
          backgrounds, and subtle elements that support content without competing for attention.
        </p>
      </div>
    </div>
  ),
};

export const SemanticColors: Story = {
  name: '💭 Semantic Colors',
  render: () => (
    <div className="p-6">
      <h2 className="mb-6 text-2xl font-bold text-neutral-900">Semantic Color Usage</h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(semanticColors).map(([category, colors]) => (
          <div key={category} className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <h4 className="mb-3 font-semibold capitalize text-neutral-900">{category}</h4>
            <div className="space-y-3">
              {Object.entries(colors).map(([name, value]) => (
                <div key={name} className="flex items-center gap-3">
                  <div
                    className="h-8 w-8 flex-shrink-0 rounded border border-neutral-200"
                    style={{ backgroundColor: value }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-neutral-900">{name}</div>
                    <div className="truncate font-mono text-xs text-neutral-500">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="mb-2 font-semibold text-blue-900">💡 Pro Tip: Using Semantic Colors</h3>
        <p className="text-sm text-blue-800">
          Semantic colors provide meaning and context. Instead of using raw color values, use
          semantic names like <code className="rounded bg-blue-100 px-1">text.primary</code> or{' '}
          <code className="rounded bg-blue-100 px-1">background.secondary</code>
          to make your code more maintainable and meaningful.
        </p>
      </div>
    </div>
  ),
};

// =============================================================================
// COMPONENT EXAMPLES
// =============================================================================

export const ColorSwatchExample: Story = {
  name: '🎨 Color Swatch Component',
  render: () => (
    <div className="p-6">
      <h2 className="mb-6 text-2xl font-bold text-neutral-900">ColorSwatch Component</h2>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <ColorSwatch name="primary-500" value={colorTokens.primary[500]} textColor="white" />
        <ColorSwatch name="success-500" value={colorTokens.success[500]} textColor="white" />
        <ColorSwatch name="warning-500" value={colorTokens.warning[500]} textColor="black" />
        <ColorSwatch name="danger-500" value={colorTokens.danger[500]} textColor="white" />
      </div>

      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
        <h3 className="mb-2 font-semibold text-neutral-900">Usage</h3>
        <pre className="overflow-x-auto rounded border bg-white p-3 text-sm text-neutral-700">
          {`<ColorSwatch 
  name="primary-500" 
  value="#3b82f6" 
  textColor="white" 
/>`}
        </pre>
      </div>
    </div>
  ),
};

// =============================================================================
// ACCESSIBILITY EXAMPLES
// =============================================================================

export const RawTailwindColors: Story = {
  name: '🌈 All Tailwind Colors',
  parameters: {
    docs: {
      source: {
        code: null,
      },
    },
  },
  render: () => (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Complete Tailwind CSS Color Palette
        </h1>
        <p className="text-gray-600">
          All Tailwind CSS colors arranged by hue. Each color scale includes shades from 50
          (lightest) to 950 (darkest). Click any color to copy its hex value.
        </p>
      </div>

      <ColorPalette>
        <ColorScale title="Red" scale={rawColors.red} description="From light pink to deep red" />
        <ColorScale title="Orange" scale={rawColors.orange} description="Vibrant orange spectrum" />
        <ColorScale title="Amber" scale={rawColors.amber} description="Warm golden yellows" />
        <ColorScale title="Yellow" scale={rawColors.yellow} description="Bright sunny yellows" />
        <ColorScale title="Lime" scale={rawColors.lime} description="Yellow-green citrus tones" />
        <ColorScale title="Green" scale={rawColors.green} description="Classic green palette" />
        <ColorScale title="Emerald" scale={rawColors.emerald} description="Jewel-toned greens" />
        <ColorScale title="Teal" scale={rawColors.teal} description="Blue-green ocean colors" />
        <ColorScale title="Cyan" scale={rawColors.cyan} description="Light blue-green aqua tones" />
        <ColorScale title="Sky" scale={rawColors.sky} description="Light airy blues" />
        <ColorScale title="Blue" scale={rawColors.blue} description="Classic blue palette" />
        <ColorScale title="Indigo" scale={rawColors.indigo} description="Deep blue-purple tones" />
        <ColorScale title="Violet" scale={rawColors.violet} description="Blue-purple spectrum" />
        <ColorScale title="Purple" scale={rawColors.purple} description="Classic purple palette" />
        <ColorScale title="Fuchsia" scale={rawColors.fuchsia} description="Vibrant pink-purple" />
        <ColorScale title="Pink" scale={rawColors.pink} description="Soft to hot pinks" />
        <ColorScale title="Rose" scale={rawColors.rose} description="Red-pink romantic tones" />
        <ColorScale
          title="Slate"
          scale={rawColors.slate}
          description="Cool gray with blue undertone"
        />
        <ColorScale title="Gray" scale={rawColors.gray} description="True neutral gray" />
        <ColorScale
          title="Zinc"
          scale={rawColors.zinc}
          description="Cool gray with blue undertone"
        />
        <ColorScale
          title="Neutral"
          scale={rawColors.neutral}
          description="True neutral without undertones"
        />
        <ColorScale
          title="Stone"
          scale={rawColors.stone}
          description="Warm gray with brown undertone"
        />
      </ColorPalette>

      {/* Special Colors */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Special Values</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <ColorSwatch name="White" value={rawColors.white} />
          <ColorSwatch name="Black" value={rawColors.black} />
          <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-4">
            <span className="text-sm text-gray-500">Transparent</span>
          </div>
          <div className="flex items-center justify-center rounded-lg border-2 border-current p-4 text-blue-500">
            <span className="text-sm">Current Color</span>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const AccessibilityExamples: Story = {
  name: '♿ Accessibility Examples',
  render: () => (
    <div className="p-6">
      <h2 className="mb-6 text-2xl font-bold text-neutral-900">Color Accessibility</h2>

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Good Examples */}
        <div className="overflow-hidden rounded-lg border border-green-200">
          <div className="border-b border-green-200 bg-green-100 px-4 py-2">
            <h3 className="font-semibold text-green-900">✅ Good Contrast</h3>
          </div>
          <div className="space-y-4 p-4">
            <div className="rounded bg-primary-500 p-3 text-white">
              White text on Primary Blue (4.5:1 ratio)
            </div>
            <div className="rounded bg-neutral-100 p-3 text-neutral-900">
              Dark text on Light Gray (12.6:1 ratio)
            </div>
            <div className="rounded bg-success-500 p-3 text-white">
              White text on Success Green (4.1:1 ratio)
            </div>
          </div>
        </div>

        {/* Bad Examples */}
        <div className="overflow-hidden rounded-lg border border-red-200">
          <div className="border-b border-red-200 bg-red-100 px-4 py-2">
            <h3 className="font-semibold text-red-900">❌ Poor Contrast</h3>
          </div>
          <div className="space-y-4 p-4">
            <div className="rounded bg-yellow-200 p-3 text-yellow-300">
              Light text on Light Yellow (Low contrast)
            </div>
            <div className="rounded bg-neutral-300 p-3 text-neutral-400">
              Gray text on Light Gray (Low contrast)
            </div>
            <div className="rounded bg-blue-100 p-3 text-blue-200">
              Light blue on Light blue (Low contrast)
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="mb-2 font-semibold text-blue-900">🔍 Accessibility Guidelines</h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Normal text requires 4.5:1 contrast ratio minimum</li>
          <li>• Large text (18pt+) requires 3:1 contrast ratio minimum</li>
          <li>• Interactive elements require 3:1 contrast ratio minimum</li>
          <li>• Color should not be the only way to convey information</li>
          <li>• Test with colorblind users and accessibility tools</li>
        </ul>
      </div>
    </div>
  ),
};
