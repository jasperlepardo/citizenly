import type { Meta, StoryObj } from '@storybook/react';
import { ButtonGroup } from './ButtonGroup';
import { Button } from '../atoms/Button';

const meta: Meta<typeof ButtonGroup> = {
  title: 'UI/ButtonGroup',
  component: ButtonGroup,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Groups buttons together with consistent spacing and optional attached styling.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
      description: 'Layout orientation of the button group',
    },
    attached: {
      control: 'boolean',
      description: 'Whether buttons should be visually attached',
    },
    spacing: {
      control: { type: 'select' },
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Spacing between buttons when not attached',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    orientation: 'horizontal',
    attached: false,
    spacing: 'sm',
  },
  render: args => (
    <ButtonGroup {...args}>
      <Button variant="primary">Save</Button>
      <Button variant="neutral-outline">Cancel</Button>
    </ButtonGroup>
  ),
};

export const AttachedHorizontal: Story = {
  args: {
    orientation: 'horizontal',
    attached: true,
  },
  render: args => (
    <ButtonGroup {...args}>
      <Button variant="neutral-outline" size="sm">
        First
      </Button>
      <Button variant="neutral-outline" size="sm">
        Second
      </Button>
      <Button variant="neutral-outline" size="sm">
        Third
      </Button>
    </ButtonGroup>
  ),
};

export const AttachedVertical: Story = {
  args: {
    orientation: 'vertical',
    attached: true,
  },
  render: args => (
    <ButtonGroup {...args}>
      <Button variant="neutral-outline" size="sm">
        Top
      </Button>
      <Button variant="neutral-outline" size="sm">
        Middle
      </Button>
      <Button variant="neutral-outline" size="sm">
        Bottom
      </Button>
    </ButtonGroup>
  ),
};

export const SpacedHorizontal: Story = {
  args: {
    orientation: 'horizontal',
    attached: false,
    spacing: 'md',
  },
  render: args => (
    <ButtonGroup {...args}>
      <Button variant="primary">Confirm</Button>
      <Button variant="warning">Reset</Button>
      <Button variant="neutral-outline">Cancel</Button>
    </ButtonGroup>
  ),
};

export const SpacedVertical: Story = {
  args: {
    orientation: 'vertical',
    attached: false,
    spacing: 'md',
  },
  render: args => (
    <ButtonGroup {...args}>
      <Button variant="primary" fullWidth>
        Primary Action
      </Button>
      <Button variant="secondary" fullWidth>
        Secondary Action
      </Button>
      <Button variant="neutral-outline" fullWidth>
        Cancel
      </Button>
    </ButtonGroup>
  ),
};

export const FormActions: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Common Form Action Patterns</h3>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Save/Cancel</h4>
          <ButtonGroup spacing="sm">
            <Button variant="primary">Save Changes</Button>
            <Button variant="neutral-outline">Cancel</Button>
          </ButtonGroup>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Previous/Next</h4>
          <ButtonGroup spacing="sm">
            <Button variant="neutral-outline">Previous</Button>
            <Button variant="primary">Next</Button>
          </ButtonGroup>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Attached Tabs</h4>
          <ButtonGroup attached>
            <Button variant="primary" size="sm">
              Active Tab
            </Button>
            <Button variant="neutral-outline" size="sm">
              Tab 2
            </Button>
            <Button variant="neutral-outline" size="sm">
              Tab 3
            </Button>
          </ButtonGroup>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Dangerous Actions</h4>
          <ButtonGroup spacing="md">
            <Button variant="danger">Delete Forever</Button>
            <Button variant="neutral-outline">Keep Safe</Button>
          </ButtonGroup>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

export const ResponsiveGroup: Story = {
  render: () => (
    <div className="w-full max-w-md space-y-4">
      <h3 className="text-lg font-semibold">Responsive Button Group</h3>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Mobile: Vertical Stack</h4>
        <ButtonGroup orientation="vertical" spacing="sm">
          <Button variant="primary" fullWidth>
            Primary Action
          </Button>
          <Button variant="secondary" fullWidth>
            Secondary Action
          </Button>
          <Button variant="neutral-outline" fullWidth>
            Cancel
          </Button>
        </ButtonGroup>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Desktop: Horizontal</h4>
        <ButtonGroup orientation="horizontal" spacing="sm">
          <Button variant="primary">Save</Button>
          <Button variant="secondary">Save Draft</Button>
          <Button variant="neutral-outline">Cancel</Button>
        </ButtonGroup>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};
