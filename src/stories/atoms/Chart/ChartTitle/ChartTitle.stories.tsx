import type { Meta, StoryObj } from '@storybook/react';
import ChartTitle from '@/components/atoms/ChartTitle';

const meta: Meta<typeof ChartTitle> = {
  title: 'Atoms/Chart/ChartTitle',
  component: ChartTitle,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A title component for charts that provides consistent typography and dark mode support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'The title text to display',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply to the title',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Chart Title',
  },
};

export const LongTitle: Story = {
  args: {
    children: 'Age Distribution by Barangay Demographics',
  },
};

export const ShortTitle: Story = {
  args: {
    children: 'Data',
  },
};

export const WithCustomClass: Story = {
  args: {
    children: 'Custom Styled Title',
    className: 'text-blue-600 dark:text-blue-400 text-xl',
  },
};

export const WithSpecialCharacters: Story = {
  args: {
    children: 'Sex Distribution (M/F) - 2024',
  },
};

export const InContainer: Story = {
  render: args => (
    <div className="w-80 rounded-lg border border-zinc-300 bg-white p-6 dark:border-zinc-600 dark:bg-zinc-800">
      <ChartTitle {...args} />
      <div className="flex h-32 w-full items-center justify-center rounded bg-zinc-100 dark:bg-zinc-700">
        <span className="text-sm text-zinc-500">Chart content would go here</span>
      </div>
    </div>
  ),
  args: {
    children: 'Employment Status',
  },
  parameters: {
    layout: 'padded',
  },
};
