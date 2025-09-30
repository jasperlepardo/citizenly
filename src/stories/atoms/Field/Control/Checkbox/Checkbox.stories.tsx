import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Checkbox } from '@/components/atoms/Checkbox';

const meta = {
  title: 'Atoms/Field/Control/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A customizable checkbox component with support for labels, descriptions, error states, and indeterminate state.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'primary', 'error', 'disabled'],
    },
    checked: {
      control: { type: 'boolean' },
    },
    indeterminate: {
      control: { type: 'boolean' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
    label: {
      control: { type: 'text' },
    },
    description: {
      control: { type: 'text' },
    },
    errorMessage: {
      control: { type: 'text' },
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Default checkbox',
    checked: false,
  },
};

export const Checked: Story = {
  args: {
    label: 'Checked checkbox',
    checked: true,
  },
};

export const Indeterminate: Story = {
  args: {
    label: 'Indeterminate checkbox',
    indeterminate: true,
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Checkbox with description',
    description: 'This is a helpful description that explains the checkbox option.',
    checked: false,
  },
};

export const Primary: Story = {
  args: {
    label: 'Primary checkbox',
    variant: 'primary',
    checked: true,
  },
};

export const Error: Story = {
  args: {
    label: 'Checkbox with error',
    errorMessage: 'This field is required',
    checked: false,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled checkbox',
    disabled: true,
    checked: false,
  },
};

export const DisabledChecked: Story = {
  args: {
    label: 'Disabled checked checkbox',
    disabled: true,
    checked: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Checkbox size="sm" label="Small checkbox" checked={true} />
      <Checkbox size="md" label="Medium checkbox" checked={true} />
      <Checkbox size="lg" label="Large checkbox" checked={true} />
    </div>
  ),
};

const InteractiveCheckbox = () => {
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <Checkbox
        label="Interactive checkbox"
        description="Click to toggle the state"
        checked={checked}
        indeterminate={indeterminate}
        onChange={e => {
          setChecked(e.target.checked);
          setIndeterminate(false);
        }}
      />
      <div className="flex gap-2">
        <button
          onClick={() => setIndeterminate(!indeterminate)}
          className="rounded bg-blue-500 px-3 py-1 text-sm text-white dark:text-black"
        >
          Toggle Indeterminate
        </button>
        <button
          onClick={() => {
            setChecked(false);
            setIndeterminate(false);
          }}
          className="rounded bg-gray-500 px-3 py-1 text-sm text-white dark:text-black"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveCheckbox />,
};
