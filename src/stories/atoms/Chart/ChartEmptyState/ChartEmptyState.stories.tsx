import type { Meta, StoryObj } from '@storybook/react';
import ChartEmptyState from '@/components/atoms/ChartEmptyState';

const meta: Meta<typeof ChartEmptyState> = {
  title: 'Atoms/Chart/ChartEmptyState',
  component: ChartEmptyState,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A component that displays when no chart data is available, providing user feedback with customizable messaging.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    message: {
      control: 'text',
      description: 'The message to display when no data is available',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply to the empty state',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const CustomMessage: Story = {
  args: {
    message: 'No residents found in this barangay',
  },
};

export const ShortMessage: Story = {
  args: {
    message: 'Empty',
  },
};

export const LongMessage: Story = {
  args: {
    message:
      'There are currently no statistics available for this time period. Please check back later or contact your administrator.',
  },
};

export const WithCustomStyling: Story = {
  args: {
    message: 'No data to display',
    className: 'text-red-500 dark:text-red-400 font-medium',
  },
};

export const InChartContainer: Story = {
  render: args => (
    <div className="w-80 rounded-lg border border-zinc-300 bg-white p-6 dark:border-zinc-600 dark:bg-zinc-800">
      <h3 className="font-display mb-4 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
        Employment Statistics
      </h3>
      <div className="flex h-48 w-full items-center justify-center">
        <ChartEmptyState {...args} />
      </div>
    </div>
  ),
  args: {
    message: 'No employment data available',
  },
  parameters: {
    layout: 'padded',
  },
};

export const WithIcon: Story = {
  render: args => (
    <div className="text-center">
      <div className="mb-3 flex justify-center">
        <svg
          className="h-12 w-12 text-zinc-300 dark:text-zinc-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </div>
      <ChartEmptyState {...args} />
    </div>
  ),
  args: {
    message: 'No chart data available',
  },
};
