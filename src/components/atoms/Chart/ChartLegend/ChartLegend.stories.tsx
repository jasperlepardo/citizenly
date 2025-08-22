import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import ChartLegend from './ChartLegend';

const meta: Meta<typeof ChartLegend> = {
  title: 'Atoms/Chart/ChartLegend',
  component: ChartLegend,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A legend component for charts that displays items with color indicators, labels, values, and percentages. Supports hover interactions and handles empty data gracefully.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    items: {
      control: 'object',
      description: 'Array of legend items with label, value, percentage, and color',
    },
    onItemHover: {
      action: 'itemHovered',
      description: 'Callback function when an item is hovered',
    },
    hoveredItem: {
      control: 'text',
      description: 'The label of the currently hovered item',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply to the legend',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleData = [
  { label: 'Male', value: 1245, percentage: 52.3, color: '#3B82F6' },
  { label: 'Female', value: 1134, percentage: 47.7, color: '#10B981' },
];

const ageData = [
  { label: 'Young (0-17)', value: 789, percentage: 35.6, color: '#3B82F6' },
  { label: 'Working Age (18-64)', value: 1234, percentage: 55.8, color: '#10B981' },
  { label: 'Senior (65+)', value: 189, percentage: 8.6, color: '#F59E0B' },
];

const employmentData = [
  { label: 'Employed', value: 890, percentage: 67.8, color: '#10B981' },
  { label: 'Unemployed', value: 234, percentage: 17.8, color: '#EF4444' },
  { label: 'Student', value: 156, percentage: 11.9, color: '#F59E0B' },
  { label: 'Retired', value: 32, percentage: 2.4, color: '#8B5CF6' },
];

const dataWithZeros = [
  { label: 'Active', value: 1456, percentage: 100.0, color: '#3B82F6' },
  { label: 'Inactive', value: 0, percentage: 0.0, color: '#10B981' },
  { label: 'Pending', value: 0, percentage: 0.0, color: '#F59E0B' },
];

export const Default: Story = {
  args: {
    items: sampleData,
  },
};

export const WithAgeDistribution: Story = {
  args: {
    items: ageData,
  },
};

export const WithEmploymentStatus: Story = {
  args: {
    items: employmentData,
  },
};

export const WithZeroValues: Story = {
  args: {
    items: dataWithZeros,
  },
};

export const WithHoveredItem: Story = {
  args: {
    items: sampleData,
    hoveredItem: 'Male',
  },
};

export const SingleItem: Story = {
  args: {
    items: [
      { label: 'Total Population', value: 2379, percentage: 100.0, color: '#3B82F6' },
    ],
  },
};

export const LargeNumbers: Story = {
  args: {
    items: [
      { label: 'Registered Voters', value: 15678, percentage: 78.4, color: '#3B82F6' },
      { label: 'Non-Voters', value: 4322, percentage: 21.6, color: '#10B981' },
    ],
  },
};

export const LongLabels: Story = {
  args: {
    items: [
      { label: 'Single/Never Married', value: 567, percentage: 34.5, color: '#3B82F6' },
      { label: 'Married/Living Together', value: 890, percentage: 54.2, color: '#10B981' },
      { label: 'Separated/Divorced/Widowed', value: 186, percentage: 11.3, color: '#F59E0B' },
    ],
  },
};

export const CustomStyling: Story = {
  args: {
    items: sampleData,
    className: 'bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border-zinc-200 dark:border-zinc-800 border',
  },
};

// Create a wrapper component for the interactive demo
const InteractiveDemoComponent = () => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleItemHover = (item: { label: string; value: number; color: string } | null, event?: React.MouseEvent) => {
    if (item && event) {
      setHoveredItem(item.label);
      setMousePosition({ x: event.clientX, y: event.clientY });
    } else {
      setHoveredItem(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-zinc-400 dark:text-zinc-500">
        Hover over legend items to see interactions
      </div>
      <ChartLegend
        items={ageData}
        onItemHover={handleItemHover}
        hoveredItem={hoveredItem}
      />
      {hoveredItem && (
        <div className="text-sm text-link">
          Currently hovering: {hoveredItem}
        </div>
      )}
    </div>
  );
};

export const InteractiveDemo: Story = {
  render: () => <InteractiveDemoComponent />,
  parameters: {
    layout: 'padded',
  },
};

export const InChartContainer: Story = {
  render: (args) => (
    <div className="bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 w-96">
      <h3 className="mb-4 font-display text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Population by Age Group
      </h3>
      <div className="grid grid-cols-2 gap-6">
        <div className="flex items-center justify-center">
          <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center">
            <span className="text-zinc-500 dark:text-zinc-400 text-xs">Pie Chart</span>
          </div>
        </div>
        <ChartLegend {...args} />
      </div>
    </div>
  ),
  args: {
    items: ageData,
  },
  parameters: {
    layout: 'padded',
  },
};