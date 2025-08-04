import type { Meta, StoryObj } from '@storybook/react';
import { IconButton } from './IconButton';

const meta: Meta<typeof IconButton> = {
  title: 'UI/IconButton',
  component: IconButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'An icon-only button component with square aspect ratio and various variants.',
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
        'warning',
        'danger',
        'neutral',
        'ghost'
      ],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
    'aria-label': {
      control: 'text',
      description: 'Accessible label for screen readers (required)',
    },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Common icons for stories
const PlusIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const SettingsIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="m12 1 4 6 6-4-4 6 4 6-6-4-6 4 4-6-4-6 6 4z"></path>
  </svg>
);

const DeleteIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m18 6-12 12"></path>
    <path d="m6 6 12 12"></path>
  </svg>
);

const HeartIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

export const Primary: Story = {
  args: {
    variant: 'primary',
    icon: PlusIcon,
    'aria-label': 'Add item',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    icon: SettingsIcon,
    'aria-label': 'Settings',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    icon: DeleteIcon,
    'aria-label': 'Delete',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    icon: HeartIcon,
    'aria-label': 'Like',
  },
};

// Sizes
export const Small: Story = {
  args: {
    variant: 'primary',
    size: 'sm',
    icon: PlusIcon,
    'aria-label': 'Add item',
  },
};

export const Medium: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    icon: PlusIcon,
    'aria-label': 'Add item',
  },
};

export const Large: Story = {
  args: {
    variant: 'primary',
    size: 'lg',
    icon: PlusIcon,
    'aria-label': 'Add item',
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    icon: PlusIcon,
    'aria-label': 'Add item',
    disabled: true,
  },
};

// All Variants Showcase
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Primary Variants</h3>
        <div className="flex gap-2">
          <IconButton variant="primary" icon={PlusIcon} aria-label="Add" />
          <IconButton variant="primary-subtle" icon={PlusIcon} aria-label="Add" />
          <IconButton variant="primary-faded" icon={PlusIcon} aria-label="Add" />
          <IconButton variant="primary-outline" icon={PlusIcon} aria-label="Add" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Secondary Variants</h3>
        <div className="flex gap-2">
          <IconButton variant="secondary" icon={SettingsIcon} aria-label="Settings" />
          <IconButton variant="secondary-subtle" icon={SettingsIcon} aria-label="Settings" />
          <IconButton variant="secondary-faded" icon={SettingsIcon} aria-label="Settings" />
          <IconButton variant="secondary-outline" icon={SettingsIcon} aria-label="Settings" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Status Variants</h3>
        <div className="flex gap-2">
          <IconButton variant="success" icon={HeartIcon} aria-label="Like" />
          <IconButton variant="warning" icon={SettingsIcon} aria-label="Warning" />
          <IconButton variant="danger" icon={DeleteIcon} aria-label="Delete" />
          <IconButton variant="neutral" icon={SettingsIcon} aria-label="Neutral" />
          <IconButton variant="ghost" icon={HeartIcon} aria-label="Ghost" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Sizes</h3>
        <div className="flex items-center gap-2">
          <IconButton variant="primary" size="sm" icon={PlusIcon} aria-label="Small" />
          <IconButton variant="primary" size="md" icon={PlusIcon} aria-label="Medium" />
          <IconButton variant="primary" size="lg" icon={PlusIcon} aria-label="Large" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};