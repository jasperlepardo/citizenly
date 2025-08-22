import type { Meta, StoryObj } from '@storybook/react';
import ChartTooltip from './ChartTooltip';

const meta: Meta<typeof ChartTooltip> = {
  title: 'Atoms/Chart/ChartTooltip',
  component: ChartTooltip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A tooltip component that displays detailed information when hovering over chart elements, including label, count, percentage, and color indicator.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    visible: {
      control: 'boolean',
      description: 'Whether the tooltip is visible',
    },
    position: {
      control: 'object',
      description: 'The x and y coordinates for tooltip positioning',
    },
    data: {
      control: 'object',
      description: 'The data to display in the tooltip',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply to the tooltip',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    visible: true,
    position: { x: 200, y: 200 },
    data: {
      label: 'Male',
      count: 1245,
      percentage: 52.3,
      color: '#3B82F6',
    },
  },
};

export const WithoutColor: Story = {
  args: {
    visible: true,
    position: { x: 200, y: 200 },
    data: {
      label: 'Employed',
      count: 890,
      percentage: 67.8,
    },
  },
};

export const LargeNumbers: Story = {
  args: {
    visible: true,
    position: { x: 200, y: 200 },
    data: {
      label: 'Working Age (18-64)',
      count: 15678,
      percentage: 78.9,
      color: '#10B981',
    },
  },
};

export const SmallNumbers: Story = {
  args: {
    visible: true,
    position: { x: 200, y: 200 },
    data: {
      label: 'Senior Citizens',
      count: 23,
      percentage: 2.1,
      color: '#F59E0B',
    },
  },
};

export const LongLabel: Story = {
  args: {
    visible: true,
    position: { x: 200, y: 200 },
    data: {
      label: 'Single/Never Married',
      count: 567,
      percentage: 34.5,
      color: '#F59E0B',
    },
  },
};

export const Hidden: Story = {
  args: {
    visible: false,
    position: { x: 200, y: 200 },
    data: {
      label: 'Female',
      count: 1134,
      percentage: 47.7,
      color: '#10B981',
    },
  },
};

export const CustomStyling: Story = {
  args: {
    visible: true,
    position: { x: 200, y: 200 },
    data: {
      label: 'Unemployed',
      count: 234,
      percentage: 17.8,
      color: '#EF4444',
    },
    className: 'border-danger',
  },
};

export const InteractiveDemo: Story = {
  render: () => {
    const [position, setPosition] = React.useState({ x: 300, y: 200 });
    const [hoveredData, setHoveredData] = React.useState<any>(null);

    const chartData = [
      { label: 'Male', count: 1245, percentage: 52.3, color: '#3B82F6' },
      { label: 'Female', count: 1134, percentage: 47.7, color: '#10B981' },
    ];

    return (
      <div className="relative w-96 h-64 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
        <h3 className="text-center mb-4 font-semibold">Hover over the items below</h3>
        <div className="space-y-2">
          {chartData.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted"
              onMouseEnter={(e) => {
                setPosition({ x: e.clientX, y: e.clientY });
                setHoveredData(item);
              }}
              onMouseLeave={() => setHoveredData(null)}
              onMouseMove={(e) => {
                setPosition({ x: e.clientX, y: e.clientY });
              }}
            >
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.label}: {item.count} ({item.percentage}%)</span>
            </div>
          ))}
        </div>
        <ChartTooltip
          visible={!!hoveredData}
          position={position}
          data={hoveredData}
        />
      </div>
    );
  },
  parameters: {
    layout: 'padded',
  },
};