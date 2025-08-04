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
      options: ['sm', 'md', 'lg'],
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

// All Variants Showcase
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Primary Variants</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary">Primary</Button>
          <Button variant="primary-subtle">Primary Subtle</Button>
          <Button variant="primary-faded">Primary Faded</Button>
          <Button variant="primary-outline">Primary Outline</Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Secondary Variants</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary">Secondary</Button>
          <Button variant="secondary-subtle">Secondary Subtle</Button>
          <Button variant="secondary-faded">Secondary Faded</Button>
          <Button variant="secondary-outline">Secondary Outline</Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Status Variants</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="success">Success</Button>
          <Button variant="warning">Warning</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="neutral">Neutral</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};