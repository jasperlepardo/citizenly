import type { Meta, StoryObj } from '@storybook/react';
import CivilStatusPieChart from './CivilStatusPieChart';

const meta = {
  title: 'Molecules/CivilStatusPieChart',
  component: CivilStatusPieChart,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A specialized pie chart for displaying civil status distribution in Filipino barangays. Shows breakdown of single, married, widowed, divorced, separated, annulled, registered partnership, and live-in relationships.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    data: {
      control: 'object',
      description: 'Civil status data object with counts for each status',
    },
    title: {
      control: 'text',
      description: 'Chart title (defaults to "Civil Status Distribution")',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof CivilStatusPieChart>;

export default meta;
type Story = StoryObj<typeof meta>;

// Typical Filipino barangay civil status distribution
export const TypicalBarangay: Story = {
  args: {
    data: {
      single: 1456,
      married: 1189,
      widowed: 156,
      divorced: 12,
      separated: 23,
      annulled: 8,
      registeredPartnership: 3,
      liveIn: 98,
    },
  },
};

// Rural barangay pattern (more traditional marriage patterns)
export const RuralBarangay: Story = {
  args: {
    title: 'Civil Status - Rural Barangay',
    data: {
      single: 892,
      married: 1567,
      widowed: 234,
      divorced: 4,
      separated: 12,
      annulled: 2,
      registeredPartnership: 1,
      liveIn: 67,
    },
  },
};

// Urban barangay pattern (more diverse civil status)
export const UrbanBarangay: Story = {
  args: {
    title: 'Civil Status - Urban Barangay',
    data: {
      single: 1789,
      married: 1234,
      widowed: 98,
      divorced: 34,
      separated: 67,
      annulled: 23,
      registeredPartnership: 12,
      liveIn: 156,
    },
  },
};

// Young population barangay (more singles)
export const YoungPopulation: Story = {
  args: {
    title: 'Civil Status - Young Population',
    data: {
      single: 2134,
      married: 567,
      widowed: 23,
      divorced: 8,
      separated: 12,
      annulled: 3,
      registeredPartnership: 5,
      liveIn: 87,
    },
  },
};

// Elderly population barangay (more widowed)
export const ElderlyPopulation: Story = {
  args: {
    title: 'Civil Status - Elderly Population',
    data: {
      single: 234,
      married: 1456,
      widowed: 567,
      divorced: 23,
      separated: 45,
      annulled: 12,
      registeredPartnership: 2,
      liveIn: 34,
    },
  },
};

// Small barangay
export const SmallBarangay: Story = {
  args: {
    title: 'Civil Status - Small Barangay',
    data: {
      single: 234,
      married: 189,
      widowed: 45,
      divorced: 2,
      separated: 3,
      annulled: 1,
      registeredPartnership: 0,
      liveIn: 12,
    },
  },
};

// Progressive barangay (higher non-traditional arrangements)
export const ProgressiveBarangay: Story = {
  args: {
    title: 'Civil Status - Progressive Community',
    data: {
      single: 1123,
      married: 987,
      widowed: 87,
      divorced: 78,
      separated: 123,
      annulled: 45,
      registeredPartnership: 34,
      liveIn: 234,
    },
  },
};

// Traditional barangay (predominantly married)
export const TraditionalBarangay: Story = {
  args: {
    title: 'Civil Status - Traditional Community',
    data: {
      single: 567,
      married: 1987,
      widowed: 287,
      divorced: 3,
      separated: 8,
      annulled: 1,
      registeredPartnership: 0,
      liveIn: 23,
    },
  },
};

// With some zero values
export const WithZeroValues: Story = {
  args: {
    title: 'Civil Status - Conservative Area',
    data: {
      single: 987,
      married: 1456,
      widowed: 234,
      divorced: 0,
      separated: 12,
      annulled: 0,
      registeredPartnership: 0,
      liveIn: 45,
    },
  },
};

// Empty data state
export const EmptyData: Story = {
  args: {
    title: 'Civil Status - No Data',
    data: {
      single: 0,
      married: 0,
      widowed: 0,
      divorced: 0,
      separated: 0,
      annulled: 0,
      registeredPartnership: 0,
      liveIn: 0,
    },
  },
};

// Single category only (edge case)
export const SingleStatusOnly: Story = {
  args: {
    title: 'Civil Status - Student Dormitory Area',
    data: {
      single: 456,
      married: 0,
      widowed: 0,
      divorced: 0,
      separated: 0,
      annulled: 0,
      registeredPartnership: 0,
      liveIn: 0,
    },
  },
};

// Custom title with Filipino text
export const FilipinoTitle: Story = {
  args: {
    title: 'Estado Sibil ng mga Residente',
    data: {
      single: 1234,
      married: 1567,
      widowed: 234,
      divorced: 23,
      separated: 45,
      annulled: 12,
      registeredPartnership: 8,
      liveIn: 123,
    },
  },
};

// Comparative analysis - Two charts
export const ComparativeAnalysis: Story = {
  render: () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
      <CivilStatusPieChart
        title="2023 Data"
        data={{
          single: 1456,
          married: 1189,
          widowed: 156,
          divorced: 12,
          separated: 23,
          annulled: 8,
          registeredPartnership: 3,
          liveIn: 98,
        }}
      />
      <CivilStatusPieChart
        title="2024 Data"
        data={{
          single: 1523,
          married: 1267,
          widowed: 143,
          divorced: 18,
          separated: 29,
          annulled: 12,
          registeredPartnership: 7,
          liveIn: 112,
        }}
      />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

// Different barangay types comparison
export const BarangayComparison: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6 bg-gray-50 min-h-screen">
      <CivilStatusPieChart
        title="Rural Barangay"
        data={{
          single: 892,
          married: 1567,
          widowed: 234,
          divorced: 4,
          separated: 12,
          annulled: 2,
          registeredPartnership: 1,
          liveIn: 67,
        }}
      />
      <CivilStatusPieChart
        title="Urban Barangay"
        data={{
          single: 1789,
          married: 1234,
          widowed: 98,
          divorced: 34,
          separated: 67,
          annulled: 23,
          registeredPartnership: 12,
          liveIn: 156,
        }}
      />
      <CivilStatusPieChart
        title="Coastal Barangay"
        data={{
          single: 1123,
          married: 1456,
          widowed: 178,
          divorced: 23,
          separated: 34,
          annulled: 8,
          registeredPartnership: 4,
          liveIn: 89,
        }}
      />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

// Responsive showcase
export const ResponsiveDisplay: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="w-full max-w-2xl">
        <CivilStatusPieChart
          title="Desktop View - Full Width"
          data={{
            single: 1456,
            married: 1189,
            widowed: 156,
            divorced: 12,
            separated: 23,
            annulled: 8,
            registeredPartnership: 3,
            liveIn: 98,
          }}
        />
      </div>
      <div className="w-96">
        <CivilStatusPieChart
          title="Mobile View"
          data={{
            single: 1456,
            married: 1189,
            widowed: 156,
            divorced: 12,
            separated: 23,
            annulled: 8,
            registeredPartnership: 3,
            liveIn: 98,
          }}
        />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};