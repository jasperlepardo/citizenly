import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ButtonGroup } from './ButtonGroup';
import { Button } from '../../atoms/Button/Button';

const meta = {
  title: 'Molecules/ButtonGroup',
  component: ButtonGroup,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A container component for grouping related buttons together. Supports horizontal/vertical orientation, spacing options, and attached styling.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
    },
    attached: {
      control: { type: 'boolean' },
    },
    spacing: {
      control: { type: 'select' },
      options: ['none', 'sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => (
    <ButtonGroup {...args}>
      <Button>First</Button>
      <Button>Second</Button>
      <Button>Third</Button>
    </ButtonGroup>
  ),
  args: {
    orientation: 'horizontal',
    attached: false,
    spacing: 'sm',
  },
};

export const Horizontal: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Horizontal with Spacing</h3>
        <ButtonGroup orientation="horizontal" spacing="md">
          <Button variant="primary">Save</Button>
          <Button variant="secondary">Cancel</Button>
          <Button variant="danger-outline">Delete</Button>
        </ButtonGroup>
      </div>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Vertical with Spacing</h3>
        <ButtonGroup orientation="vertical" spacing="sm">
          <Button variant="ghost">Profile</Button>
          <Button variant="ghost">Settings</Button>
          <Button variant="ghost">Sign Out</Button>
        </ButtonGroup>
      </div>
    </div>
  ),
};

export const Attached: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Attached Horizontal</h3>
        <ButtonGroup orientation="horizontal" attached>
          <Button variant="primary-outline">Left</Button>
          <Button variant="primary-outline">Center</Button>
          <Button variant="primary-outline">Right</Button>
        </ButtonGroup>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Attached Vertical</h3>
        <ButtonGroup orientation="vertical" attached>
          <Button variant="secondary-outline">Top</Button>
          <Button variant="secondary-outline">Middle</Button>
          <Button variant="secondary-outline">Bottom</Button>
        </ButtonGroup>
      </div>
    </div>
  ),
};

export const Spacing: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">No Spacing</h3>
        <ButtonGroup spacing="none">
          <Button variant="ghost">A</Button>
          <Button variant="ghost">B</Button>
          <Button variant="ghost">C</Button>
        </ButtonGroup>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Small Spacing</h3>
        <ButtonGroup spacing="sm">
          <Button variant="primary-subtle">Small</Button>
          <Button variant="primary-subtle">Gap</Button>
          <Button variant="primary-subtle">Here</Button>
        </ButtonGroup>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Medium Spacing</h3>
        <ButtonGroup spacing="md">
          <Button variant="success">Medium</Button>
          <Button variant="success">Gap</Button>
          <Button variant="success">Here</Button>
        </ButtonGroup>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Large Spacing</h3>
        <ButtonGroup spacing="lg">
          <Button variant="warning">Large</Button>
          <Button variant="warning">Gap</Button>
          <Button variant="warning">Here</Button>
        </ButtonGroup>
      </div>
    </div>
  ),
};

export const ActionGroups: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Form Actions</h3>
        <ButtonGroup>
          <Button variant="primary">Save</Button>
          <Button variant="secondary">Save Draft</Button>
          <Button variant="ghost">Cancel</Button>
        </ButtonGroup>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Destructive Actions</h3>
        <ButtonGroup>
          <Button variant="danger">Delete</Button>
          <Button variant="ghost">Cancel</Button>
        </ButtonGroup>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Navigation</h3>
        <ButtonGroup attached>
          <Button variant="primary-outline">← Previous</Button>
          <Button variant="primary-outline">Next →</Button>
        </ButtonGroup>
      </div>
    </div>
  ),
};

const ToggleComponent = () => {
  const [alignment, setAlignment] = useState('left');
  const [view, setView] = useState('grid');

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Text Alignment Toggle</h3>
        <ButtonGroup attached>
          <Button
            variant={alignment === 'left' ? 'primary' : 'primary-outline'}
            onClick={() => setAlignment('left')}
            iconOnly
            aria-label="Align left"
          >
            <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z" />
            </svg>
          </Button>
          <Button
            variant={alignment === 'center' ? 'primary' : 'primary-outline'}
            onClick={() => setAlignment('center')}
            iconOnly
            aria-label="Align center"
          >
            <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z" />
            </svg>
          </Button>
          <Button
            variant={alignment === 'right' ? 'primary' : 'primary-outline'}
            onClick={() => setAlignment('right')}
            iconOnly
            aria-label="Align right"
          >
            <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z" />
            </svg>
          </Button>
        </ButtonGroup>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Current: {alignment}</p>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">View Toggle</h3>
        <ButtonGroup attached>
          <Button
            variant={view === 'list' ? 'secondary' : 'secondary-outline'}
            onClick={() => setView('list')}
            iconOnly
            aria-label="List view"
          >
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
          </Button>
          <Button
            variant={view === 'grid' ? 'secondary' : 'secondary-outline'}
            onClick={() => setView('grid')}
            iconOnly
            aria-label="Grid view"
          >
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
              />
            </svg>
          </Button>
        </ButtonGroup>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Current view: {view}</p>
      </div>
    </div>
  );
};

export const Toggle: Story = {
  render: () => <ToggleComponent />,
};

export const WithIcons: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Social Actions</h3>
        <ButtonGroup>
          <Button
            variant="success-subtle"
            leftIcon={
              <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            }
          >
            Like
          </Button>
          <Button
            variant="primary-subtle"
            leftIcon={
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            }
          >
            Comment
          </Button>
          <Button
            variant="secondary-subtle"
            leftIcon={
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                />
              </svg>
            }
          >
            Share
          </Button>
        </ButtonGroup>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">File Actions</h3>
        <ButtonGroup attached>
          <Button
            variant="primary-outline"
            leftIcon={
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            }
          >
            Download
          </Button>
          <Button
            variant="primary-outline"
            leftIcon={
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            }
          >
            Edit
          </Button>
          <Button
            variant="danger-outline"
            leftIcon={
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            }
          >
            Delete
          </Button>
        </ButtonGroup>
      </div>
    </div>
  ),
};

export const Responsive: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Responsive Layout</h3>
        <div className="flex flex-col gap-4 sm:flex-row">
          <ButtonGroup className="flex-1">
            <Button variant="primary" className="flex-1">
              Save Changes
            </Button>
            <Button variant="secondary" className="flex-1">
              Save Draft
            </Button>
          </ButtonGroup>
          <Button variant="ghost">Cancel</Button>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Mobile-First Design</h3>
        <div className="w-full">
          <ButtonGroup orientation="vertical" className="w-full sm:w-auto sm:flex-row">
            <Button variant="primary-outline" className="w-full sm:w-auto">
              Mobile Stacked
            </Button>
            <Button variant="primary-outline" className="w-full sm:w-auto">
              Desktop Inline
            </Button>
            <Button variant="primary-outline" className="w-full sm:w-auto">
              Responsive
            </Button>
          </ButtonGroup>
        </div>
      </div>
    </div>
  ),
};
