import type { Meta, StoryObj } from '@storybook/react';
import { IconButton } from './IconButton';

// Mock icons for stories
const HeartIcon = (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </svg>
);

const TrashIcon = (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const EditIcon = (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);

const SearchIcon = (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const PlusIcon = (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
    />
  </svg>
);

const XIcon = (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const meta = {
  title: 'Atoms/IconButton',
  component: IconButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'An icon-only button component that extends the base Button component. Requires an aria-label for accessibility.',
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
        'ghost',
        'link',
      ],
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    disabled: {
      control: { type: 'boolean' },
    },
    loading: {
      control: { type: 'boolean' },
    },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: EditIcon,
    'aria-label': 'Edit item',
  },
};

export const Primary: Story = {
  args: {
    variant: 'primary',
    icon: PlusIcon,
    'aria-label': 'Add new item',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    icon: TrashIcon,
    'aria-label': 'Delete item',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    icon: HeartIcon,
    'aria-label': 'Like item',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    icon: XIcon,
    'aria-label': 'Close dialog',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <IconButton size="xs" icon={SearchIcon} aria-label="Extra small search" />
      <IconButton size="sm" icon={SearchIcon} aria-label="Small search" />
      <IconButton size="md" icon={SearchIcon} aria-label="Medium search" />
      <IconButton size="lg" icon={SearchIcon} aria-label="Large search" />
      <IconButton size="xl" icon={SearchIcon} aria-label="Extra large search" />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="grid grid-cols-4 items-center gap-4">
      {/* Primary variants */}
      <IconButton variant="primary" icon={EditIcon} aria-label="Primary edit" />
      <IconButton variant="primary-subtle" icon={EditIcon} aria-label="Primary subtle edit" />
      <IconButton variant="primary-faded" icon={EditIcon} aria-label="Primary faded edit" />
      <IconButton variant="primary-outline" icon={EditIcon} aria-label="Primary outline-solid edit" />

      {/* Secondary variants */}
      <IconButton variant="secondary" icon={HeartIcon} aria-label="Secondary heart" />
      <IconButton variant="secondary-subtle" icon={HeartIcon} aria-label="Secondary subtle heart" />
      <IconButton variant="secondary-faded" icon={HeartIcon} aria-label="Secondary faded heart" />
      <IconButton
        variant="secondary-outline"
        icon={HeartIcon}
        aria-label="Secondary outline-solid heart"
      />

      {/* Success variants */}
      <IconButton variant="success" icon={PlusIcon} aria-label="Success add" />
      <IconButton variant="success-subtle" icon={PlusIcon} aria-label="Success subtle add" />
      <IconButton variant="success-faded" icon={PlusIcon} aria-label="Success faded add" />
      <IconButton variant="success-outline" icon={PlusIcon} aria-label="Success outline-solid add" />

      {/* Danger variants */}
      <IconButton variant="danger" icon={TrashIcon} aria-label="Danger delete" />
      <IconButton variant="danger-subtle" icon={TrashIcon} aria-label="Danger subtle delete" />
      <IconButton variant="danger-faded" icon={TrashIcon} aria-label="Danger faded delete" />
      <IconButton variant="danger-outline" icon={TrashIcon} aria-label="Danger outline-solid delete" />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <IconButton icon={EditIcon} aria-label="Normal state" />
      <IconButton icon={EditIcon} aria-label="Disabled state" disabled />
      <IconButton icon={EditIcon} aria-label="Loading state" loading />
    </div>
  ),
};

export const ToolbarExample: Story = {
  render: () => (
    <div className="flex items-center gap-1 rounded-lg bg-gray-50 p-2">
      <IconButton variant="ghost" size="sm" icon={EditIcon} aria-label="Edit" />
      <IconButton variant="ghost" size="sm" icon={TrashIcon} aria-label="Delete" />
      <div className="mx-1 h-6 w-px bg-gray-300" />
      <IconButton variant="ghost" size="sm" icon={PlusIcon} aria-label="Add" />
      <IconButton variant="ghost" size="sm" icon={SearchIcon} aria-label="Search" />
    </div>
  ),
};

export const ActionButtons: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border bg-white p-4">
        <div>
          <h3 className="font-semibold">Document Title</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Last modified 2 hours ago</p>
        </div>
        <div className="flex gap-2">
          <IconButton
            variant="primary-subtle"
            size="sm"
            icon={EditIcon}
            aria-label="Edit document"
          />
          <IconButton
            variant="danger-subtle"
            size="sm"
            icon={TrashIcon}
            aria-label="Delete document"
          />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border bg-white p-4">
        <div>
          <h3 className="font-semibold">Image File</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">800x600 • 2.5 MB</p>
        </div>
        <div className="flex gap-2">
          <IconButton variant="success-subtle" size="sm" icon={HeartIcon} aria-label="Like image" />
          <IconButton variant="primary-subtle" size="sm" icon={EditIcon} aria-label="Edit image" />
          <IconButton
            variant="danger-subtle"
            size="sm"
            icon={TrashIcon}
            aria-label="Delete image"
          />
        </div>
      </div>
    </div>
  ),
};

export const FloatingActionButton: Story = {
  render: () => (
    <div className="relative h-64 rounded-lg bg-gray-100 p-4">
      <p className="text-gray-600 dark:text-gray-400">Content area...</p>

      {/* Floating Action Button */}
      <div className="absolute bottom-4 right-4">
        <IconButton
          variant="primary"
          size="lg"
          icon={PlusIcon}
          aria-label="Add new item"
          className="shadow-lg hover:shadow-xl"
        />
      </div>
    </div>
  ),
};
