import type { Meta, StoryObj } from '@storybook/react';
import ChartContainer from './ChartContainer';

const meta: Meta<typeof ChartContainer> = {
  title: 'Atoms/Chart/ChartContainer',
  component: ChartContainer,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A container component for chart components that provides consistent styling, padding, and dark mode support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: false,
      description: 'The content to be displayed inside the container',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply to the container',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Chart Title</h3>
        <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
          <span className="text-zinc-500 dark:text-zinc-400">Chart Content</span>
        </div>
      </div>
    ),
  },
};

export const WithCustomClass: Story = {
  args: {
    children: (
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Chart with Custom Styling</h3>
        <div className="w-48 h-48 bg-blue-50 dark:bg-blue-950 rounded-lg flex items-center justify-center">
          <span className="text-link">Custom Chart</span>
        </div>
      </div>
    ),
    className: 'shadow-lg border-2 border-zinc-100 dark:border-zinc-900',
  },
};

export const Empty: Story = {
  args: {
    children: (
      <div className="text-center text-zinc-400 dark:text-zinc-500">
        <div className="w-48 h-48 flex items-center justify-center">
          <span>No chart data available</span>
        </div>
      </div>
    ),
  },
};

export const WithPieChart: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-lg font-semibold mb-4 text-center">Age Distribution</h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="flex items-center justify-center">
            <svg width="200" height="200" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="#3B82F6" />
              <path
                d="M 50 50 L 50 5 A 45 45 0 0 1 85.36 71.18 Z"
                fill="#10B981"
              />
              <path
                d="M 50 50 L 85.36 71.18 A 45 45 0 0 1 14.64 71.18 Z"
                fill="#F59E0B"
              />
            </svg>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-brand-default rounded"></div>
              <span className="text-sm">Young (60%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-success-default rounded"></div>
              <span className="text-sm">Adult (25%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-warning-default rounded"></div>
              <span className="text-sm">Senior (15%)</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  parameters: {
    layout: 'padded',
  },
};