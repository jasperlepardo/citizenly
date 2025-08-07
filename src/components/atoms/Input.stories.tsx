import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta = {
  title: 'Atoms/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A minimal, reusable input atom. This is the base HTML input element with consistent styling. For more complex inputs with labels, icons, and validation, use InputField from molecules.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    state: {
      control: 'select',
      options: ['default', 'disabled', 'readonly'],
    },
    placeholder: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
    readOnly: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
    size: 'md',
  },
};

export const SmallSize: Story = {
  args: {
    placeholder: 'Small input',
    size: 'sm',
  },
};

export const MediumSize: Story = {
  args: {
    placeholder: 'Medium input (default)',
    size: 'md',
  },
};

export const LargeSize: Story = {
  args: {
    placeholder: 'Large input',
    size: 'lg',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
};

export const ReadOnly: Story = {
  args: {
    placeholder: 'Read only input',
    readOnly: true,
    defaultValue: 'This is read-only',
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: 'Input with value',
    placeholder: 'Enter text...',
  },
};
