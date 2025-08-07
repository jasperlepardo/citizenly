import type { Meta, StoryObj } from '@storybook/react';
import GenericPieChart from './GenericPieChart';

const meta = {
  title: 'Dashboard/GenericPieChart',
  component: GenericPieChart,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A reusable pie chart component with interactive features, tooltips, and automatic color generation. Used as the foundation for all barangay demographic charts.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    data: {
      control: 'object',
      description: 'Array of chart data with label, value, percentage, and optional color',
    },
    title: {
      control: 'text',
      description: 'Chart title',
    },
    baseColor: {
      control: 'color',
      description: 'Base color for chart (not used with auto-generated colors)',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof GenericPieChart>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic chart with auto-generated colors
export const BasicChart: Story = {
  args: {
    title: 'Sample Distribution',
    data: [
      { label: 'Category A', value: 120, percentage: 30.0, color: '' },
      { label: 'Category B', value: 80, percentage: 20.0, color: '' },
      { label: 'Category C', value: 100, percentage: 25.0, color: '' },
      { label: 'Category D', value: 60, percentage: 15.0, color: '' },
      { label: 'Category E', value: 40, percentage: 10.0, color: '' },
    ],
  },
};

// Educational Attainment (Filipino barangay context)
export const EducationalAttainment: Story = {
  args: {
    title: 'Antas ng Edukasyon',
    data: [
      { label: 'Elementarya', value: 456, percentage: 32.1, color: '' },
      { label: 'High School', value: 387, percentage: 27.2, color: '' },
      { label: 'Kolehiyo', value: 298, percentage: 21.0, color: '' },
      { label: 'Vocational', value: 145, percentage: 10.2, color: '' },
      { label: 'Post Graduate', value: 89, percentage: 6.3, color: '' },
      { label: 'Walang Pag-aaral', value: 45, percentage: 3.2, color: '' },
    ],
  },
};

// Religion Distribution (Philippines context)
export const ReligionDistribution: Story = {
  args: {
    title: 'Distribusyon ng Relihiyon',
    data: [
      { label: 'Roman Catholic', value: 1847, percentage: 64.9, color: '' },
      { label: 'Protestant', value: 423, percentage: 14.9, color: '' },
      { label: 'Iglesia ni Cristo', value: 285, percentage: 10.0, color: '' },
      { label: 'Islam', value: 142, percentage: 5.0, color: '' },
      { label: 'Other Christian', value: 85, percentage: 3.0, color: '' },
      { label: 'Others', value: 65, percentage: 2.2, color: '' },
    ],
  },
};

// Housing Type Distribution
export const HousingTypes: Story = {
  args: {
    title: 'Uri ng Tahanan',
    data: [
      { label: 'Concrete', value: 234, percentage: 36.9, color: '' },
      { label: 'Semi-concrete', value: 189, percentage: 29.8, color: '' },
      { label: 'Wood', value: 98, percentage: 15.5, color: '' },
      { label: 'Bamboo/Nipa', value: 67, percentage: 10.6, color: '' },
      { label: 'Mixed Materials', value: 46, percentage: 7.2, color: '' },
    ],
  },
};

// With predefined colors
export const WithCustomColors: Story = {
  args: {
    title: 'Traffic Light Status',
    data: [
      { label: 'Safe', value: 85, percentage: 56.7, color: '#10B981' }, // Green
      { label: 'Caution', value: 42, percentage: 28.0, color: '#F59E0B' }, // Yellow
      { label: 'Alert', value: 23, percentage: 15.3, color: '#EF4444' }, // Red
    ],
  },
};

// Single category (100%)
export const SingleCategory: Story = {
  args: {
    title: 'Complete Coverage',
    data: [
      { label: 'Covered', value: 2847, percentage: 100.0, color: '' },
    ],
  },
};

// With zero values
export const WithZeroValues: Story = {
  args: {
    title: 'Health Program Participation',
    data: [
      { label: 'Fully Vaccinated', value: 1247, percentage: 73.2, color: '' },
      { label: 'Partially Vaccinated', value: 287, percentage: 16.8, color: '' },
      { label: 'Not Vaccinated', value: 170, percentage: 10.0, color: '' },
      { label: 'Unknown Status', value: 0, percentage: 0.0, color: '' },
      { label: 'Exempted', value: 0, percentage: 0.0, color: '' },
    ],
  },
};

// Empty data state
export const EmptyData: Story = {
  args: {
    title: 'No Data Available',
    data: [],
  },
};

// All zero values
export const AllZeroValues: Story = {
  args: {
    title: 'Inactive Programs',
    data: [
      { label: 'Program A', value: 0, percentage: 0, color: '' },
      { label: 'Program B', value: 0, percentage: 0, color: '' },
      { label: 'Program C', value: 0, percentage: 0, color: '' },
    ],
  },
};

// Many categories (testing color generation)
export const ManyCategories: Story = {
  args: {
    title: 'Livelihood Sources',
    data: [
      { label: 'Farming', value: 312, percentage: 22.1, color: '' },
      { label: 'Fishing', value: 287, percentage: 20.3, color: '' },
      { label: 'Small Business', value: 198, percentage: 14.0, color: '' },
      { label: 'Construction', value: 145, percentage: 10.3, color: '' },
      { label: 'Transportation', value: 123, percentage: 8.7, color: '' },
      { label: 'Government Service', value: 98, percentage: 6.9, color: '' },
      { label: 'Manufacturing', value: 87, percentage: 6.2, color: '' },
      { label: 'Domestic Work', value: 76, percentage: 5.4, color: '' },
      { label: 'Retail Trade', value: 54, percentage: 3.8, color: '' },
      { label: 'Teaching', value: 32, percentage: 2.3, color: '' },
    ],
  },
};

// Small values
export const SmallValues: Story = {
  args: {
    title: 'Special Programs',
    data: [
      { label: '4Ps Recipients', value: 12, percentage: 52.2, color: '' },
      { label: 'Solo Parents', value: 8, percentage: 34.8, color: '' },
      { label: 'PWD Recipients', value: 3, percentage: 13.0, color: '' },
    ],
  },
};

// Percentage-based display
export const PercentageDisplay: Story = {
  args: {
    title: 'Barangay Budget Allocation',
    data: [
      { label: 'Infrastructure', value: 45, percentage: 45.0, color: '' },
      { label: 'Health Programs', value: 25, percentage: 25.0, color: '' },
      { label: 'Education', value: 15, percentage: 15.0, color: '' },
      { label: 'Social Services', value: 10, percentage: 10.0, color: '' },
      { label: 'Others', value: 5, percentage: 5.0, color: '' },
    ],
  },
};

// Responsive showcase
export const ResponsiveDisplay: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="w-full max-w-lg">
        <GenericPieChart
          title="Desktop View"
          data={[
            { label: 'Male', value: 1445, percentage: 50.7, color: '' },
            { label: 'Female', value: 1402, percentage: 49.3, color: '' },
          ]}
        />
      </div>
      <div className="w-80">
        <GenericPieChart
          title="Tablet View"
          data={[
            { label: 'Employed', value: 1234, percentage: 67.2, color: '' },
            { label: 'Unemployed', value: 345, percentage: 18.8, color: '' },
            { label: 'Student', value: 256, percentage: 14.0, color: '' },
          ]}
        />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

// Multiple charts comparison
export const MultipleCharts: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
      <GenericPieChart
        title="Age Distribution"
        data={[
          { label: '0-17 years', value: 856, percentage: 30.1, color: '' },
          { label: '18-59 years', value: 1704, percentage: 59.8, color: '' },
          { label: '60+ years', value: 287, percentage: 10.1, color: '' },
        ]}
      />
      <GenericPieChart
        title="Civil Status"
        data={[
          { label: 'Single', value: 1456, percentage: 51.1, color: '' },
          { label: 'Married', value: 1189, percentage: 41.8, color: '' },
          { label: 'Widowed', value: 156, percentage: 5.5, color: '' },
          { label: 'Others', value: 46, percentage: 1.6, color: '' },
        ]}
      />
      <GenericPieChart
        title="Employment Status"
        data={[
          { label: 'Employed', value: 1234, percentage: 67.2, color: '' },
          { label: 'Unemployed', value: 345, percentage: 18.8, color: '' },
          { label: 'Student', value: 256, percentage: 14.0, color: '' },
        ]}
      />
      <GenericPieChart
        title="Water Source"
        data={[
          { label: 'Tap Water', value: 423, percentage: 66.7, color: '' },
          { label: 'Deep Well', value: 145, percentage: 22.9, color: '' },
          { label: 'Spring', value: 66, percentage: 10.4, color: '' },
        ]}
      />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};