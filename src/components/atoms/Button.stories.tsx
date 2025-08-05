import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants, sizes, and states based on the Figma design system.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: [
        'primary',
        'primary-subtle',
        'primary-faded', 
        'primary-outline',
        'secondary',
        'secondary-subtle',
        'secondary-faded',
        'secondary-outline',
        'success',
        'success-subtle',
        'success-faded',
        'success-outline',
        'warning',
        'warning-subtle',
        'warning-faded',
        'warning-outline',
        'danger',
        'danger-subtle',
        'danger-faded',
        'danger-outline',
        'neutral',
        'neutral-subtle',
        'neutral-faded',
        'neutral-outline',
        'ghost'
      ],
      description: 'The visual variant of the button',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'regular'],
      description: 'The size of the button',
    },
    children: {
      control: 'text',
      description: 'The content of the button',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    loading: {
      control: 'boolean',
      description: 'Whether the button is in loading state',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Whether the button takes full width',
    },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Primary stories
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Success Button',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Warning Button',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Danger Button',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};

// States
export const Loading: Story = {
  args: {
    variant: 'primary',
    loading: true,
    children: 'Loading...',
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    disabled: true,
    children: 'Disabled Button',
  },
};

// Sizes
export const Small: Story = {
  args: {
    variant: 'primary',
    size: 'sm',
    children: 'Small Button',
  },
};

export const Medium: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Medium Button',
  },
};

export const Large: Story = {
  args: {
    variant: 'primary',
    size: 'lg',
    children: 'Large Button',
  },
};

// With Icons
export const WithLeftIcon: Story = {
  args: {
    variant: 'primary',
    children: 'Add Item',
    leftIcon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    ),
  },
};

export const WithRightIcon: Story = {
  args: {
    variant: 'primary',
    children: 'Next',
    rightIcon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="9,18 15,12 9,6"></polyline>
      </svg>
    ),
  },
};

// Full Width
export const FullWidth: Story = {
  args: {
    variant: 'primary',
    fullWidth: true,
    children: 'Full Width Button',
  },
  parameters: {
    layout: 'padded',
  },
};

// Regular Size (Figma Design System Default)
export const RegularSize: Story = {
  args: {
    variant: 'primary',
    size: 'regular',
    children: 'Regular Button',
  },
};

// All Variants Showcase - Complete Figma Design System
export const FigmaDesignSystem: Story = {
  render: () => (
    <div className="space-y-6 p-4">
      <div className="space-y-3">
        <h2 className="text-xl font-bold">JSPR Design System - Button Component</h2>
        <p className="text-gray-600">Complete button variants matching Figma specifications</p>
      </div>

      {/* Primary Color Family */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-blue-700">Primary Variants</h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="space-y-2">
            <Button variant="primary" size="regular">+ Primary</Button>
            <Button variant="primary" size="regular" disabled>+ Primary</Button>
          </div>
          <div className="space-y-2">
            <Button variant="primary-subtle" size="regular">+ Primary</Button>
            <Button variant="primary-subtle" size="regular" disabled>+ Primary</Button>
          </div>
          <div className="space-y-2">
            <Button variant="primary-faded" size="regular">+ Primary</Button>
            <Button variant="primary-faded" size="regular" disabled>+ Primary</Button>
          </div>
          <div className="space-y-2">
            <Button variant="primary-outline" size="regular">+ Primary</Button>
            <Button variant="primary-outline" size="regular" disabled>+ Primary</Button>
          </div>
        </div>
      </div>

      {/* Secondary Color Family */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-purple-700">Secondary Variants</h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="space-y-2">
            <Button variant="secondary" size="regular">+ Secondary</Button>
            <Button variant="secondary" size="regular" disabled>+ Secondary</Button>
          </div>
          <div className="space-y-2">
            <Button variant="secondary-subtle" size="regular">+ Secondary</Button>
            <Button variant="secondary-subtle" size="regular" disabled>+ Secondary</Button>
          </div>
          <div className="space-y-2">
            <Button variant="secondary-faded" size="regular">+ Secondary</Button>
            <Button variant="secondary-faded" size="regular" disabled>+ Secondary</Button>
          </div>
          <div className="space-y-2">
            <Button variant="secondary-outline" size="regular">+ Secondary</Button>
            <Button variant="secondary-outline" size="regular" disabled>+ Secondary</Button>
          </div>
        </div>
      </div>

      {/* Success Color Family */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-green-700">Success Variants</h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="space-y-2">
            <Button variant="success" size="regular">+ Success</Button>
            <Button variant="success" size="regular" disabled>+ Success</Button>
          </div>
          <div className="space-y-2">
            <Button variant="success-subtle" size="regular">+ Success</Button>
            <Button variant="success-subtle" size="regular" disabled>+ Success</Button>
          </div>
          <div className="space-y-2">
            <Button variant="success-faded" size="regular">+ Success</Button>
            <Button variant="success-faded" size="regular" disabled>+ Success</Button>
          </div>
          <div className="space-y-2">
            <Button variant="success-outline" size="regular">+ Success</Button>
            <Button variant="success-outline" size="regular" disabled>+ Success</Button>
          </div>
        </div>
      </div>

      {/* Warning Color Family */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-orange-700">Warning Variants</h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="space-y-2">
            <Button variant="warning" size="regular">+ Warning</Button>
            <Button variant="warning" size="regular" disabled>+ Warning</Button>
          </div>
          <div className="space-y-2">
            <Button variant="warning-subtle" size="regular">+ Warning</Button>
            <Button variant="warning-subtle" size="regular" disabled>+ Warning</Button>
          </div>
          <div className="space-y-2">
            <Button variant="warning-faded" size="regular">+ Warning</Button>
            <Button variant="warning-faded" size="regular" disabled>+ Warning</Button>
          </div>
          <div className="space-y-2">
            <Button variant="warning-outline" size="regular">+ Warning</Button>
            <Button variant="warning-outline" size="regular" disabled>+ Warning</Button>
          </div>
        </div>
      </div>

      {/* Danger Color Family */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-red-700">Danger Variants</h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="space-y-2">
            <Button variant="danger" size="regular">+ Danger</Button>
            <Button variant="danger" size="regular" disabled>+ Danger</Button>
          </div>
          <div className="space-y-2">
            <Button variant="danger-subtle" size="regular">+ Danger</Button>
            <Button variant="danger-subtle" size="regular" disabled>+ Danger</Button>
          </div>
          <div className="space-y-2">
            <Button variant="danger-faded" size="regular">+ Danger</Button>
            <Button variant="danger-faded" size="regular" disabled>+ Danger</Button>
          </div>
          <div className="space-y-2">
            <Button variant="danger-outline" size="regular">+ Danger</Button>
            <Button variant="danger-outline" size="regular" disabled>+ Danger</Button>
          </div>
        </div>
      </div>

      {/* Neutral & Ghost */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-700">Neutral & Ghost Variants</h3>
        <div className="grid grid-cols-5 gap-3">
          <div className="space-y-2">
            <Button variant="neutral" size="regular">+ Neutral</Button>
            <Button variant="neutral" size="regular" disabled>+ Neutral</Button>
          </div>
          <div className="space-y-2">
            <Button variant="neutral-subtle" size="regular">+ Neutral</Button>
            <Button variant="neutral-subtle" size="regular" disabled>+ Neutral</Button>
          </div>
          <div className="space-y-2">
            <Button variant="neutral-faded" size="regular">+ Neutral</Button>
            <Button variant="neutral-faded" size="regular" disabled>+ Neutral</Button>
          </div>
          <div className="space-y-2">
            <Button variant="neutral-outline" size="regular">+ Neutral</Button>
            <Button variant="neutral-outline" size="regular" disabled>+ Neutral</Button>
          </div>
          <div className="space-y-2">
            <Button variant="ghost" size="regular">+ Ghost</Button>
            <Button variant="ghost" size="regular" disabled>+ Ghost</Button>
          </div>
        </div>
      </div>

      {/* Icon Only Variants */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Icon Only Buttons</h3>
        <div className="flex gap-3">
          <Button variant="primary" iconOnly size="regular">+</Button>
          <Button variant="secondary" iconOnly size="regular">+</Button>
          <Button variant="success" iconOnly size="regular">+</Button>
          <Button variant="warning" iconOnly size="regular">+</Button>
          <Button variant="danger" iconOnly size="regular">+</Button>
          <Button variant="ghost" iconOnly size="regular">+</Button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Design System Notes:</strong> All variants match the Figma design specifications including exact colors, spacing (p=8 for regular), 
          Montserrat font, hover states, disabled states, and border radius. The "regular" size follows the Figma button component specifications.
        </p>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};