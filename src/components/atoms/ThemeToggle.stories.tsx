import type { Meta, StoryObj } from '@storybook/react';
import { ThemeToggle } from './ThemeToggle';
import { ThemeProvider } from '@/contexts/ThemeContext';

const meta = {
  title: 'Atoms/ThemeToggle',
  component: ThemeToggle,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A theme toggle button that cycles between light, dark, and system themes. Includes visual indicators for each theme state.',
      },
    },
  },
  decorators: [
    Story => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'ghost', 'outline'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    showLabel: {
      control: 'boolean',
    },
    labelPosition: {
      control: 'select',
      options: ['left', 'right'],
    },
  },
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'ghost',
    size: 'md',
    showLabel: false,
  },
};

export const WithLabel: Story = {
  args: {
    variant: 'ghost',
    size: 'md',
    showLabel: true,
    labelPosition: 'right',
  },
};

export const LabelLeft: Story = {
  args: {
    variant: 'ghost',
    size: 'md',
    showLabel: true,
    labelPosition: 'left',
  },
};

export const SmallSize: Story = {
  args: {
    variant: 'ghost',
    size: 'sm',
    showLabel: false,
  },
};

export const LargeSize: Story = {
  args: {
    variant: 'ghost',
    size: 'lg',
    showLabel: false,
  },
};

export const DefaultVariant: Story = {
  args: {
    variant: 'default',
    size: 'md',
    showLabel: false,
  },
};

export const OutlineVariant: Story = {
  args: {
    variant: 'outline',
    size: 'md',
    showLabel: false,
  },
};

export const OutlineWithLabel: Story = {
  args: {
    variant: 'outline',
    size: 'md',
    showLabel: true,
    labelPosition: 'right',
  },
};

export const DefaultWithLabel: Story = {
  args: {
    variant: 'default',
    size: 'md',
    showLabel: true,
    labelPosition: 'right',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <ThemeToggle size="sm" />
      <ThemeToggle size="md" />
      <ThemeToggle size="lg" />
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <ThemeToggle variant="ghost" />
      <ThemeToggle variant="default" />
      <ThemeToggle variant="outline" />
    </div>
  ),
};

export const WithLabelsComparison: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <ThemeToggle showLabel={true} labelPosition="left" />
        <ThemeToggle showLabel={true} labelPosition="right" />
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle variant="outline" showLabel={true} labelPosition="left" />
        <ThemeToggle variant="outline" showLabel={true} labelPosition="right" />
      </div>
    </div>
  ),
};
