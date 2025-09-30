import type { Meta, StoryObj } from '@storybook/react';
import StatisticsChart from '@/components/molecules/StatisticsChart';
import type { DependencyRatioData, SexDistributionData, CivilStatusData, EmploymentStatusData } from '@/types/app/dashboard/dashboard';

const meta: Meta<typeof StatisticsChart> = {
  title: 'Molecules/StatisticsChart',
  component: StatisticsChart,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A semantic statistics chart component with type-specific styling and variants.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'compact', 'detailed'],
      description: 'Chart size variant',
    },
    intent: {
      control: { type: 'select' },
      options: [undefined, 'primary', 'secondary', 'embedded'],
      description: 'Chart intent modifier for contextual styling',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data for different chart types
const sampleDependencyData: DependencyRatioData = {
  youngDependents: 25,
  workingAge: 50,
  oldDependents: 15,
  dependencyRatio: 0.8,
  youngDependencyRatio: 0.5,
  oldDependencyRatio: 0.3,
};

const sampleSexData: SexDistributionData = {
  male: 45,
  female: 55,
  total: 100,
  malePercentage: 45,
  femalePercentage: 55,
};

const sampleCivilStatusData: CivilStatusData = {
  single: 40,
  married: 45,
  divorced: 10,
  widowed: 5,
};

const sampleEmploymentData: EmploymentStatusData = {
  employed: 60,
  unemployed: 15,
  student: 20,
  retired: 5,
};

// Default stories for each chart type
export const DependencyChart: Story = {
  args: {
    type: 'dependency',
    data: sampleDependencyData,
    title: 'Dependency Ratio Distribution',
  },
};

export const SexChart: Story = {
  args: {
    type: 'sex',
    data: sampleSexData,
    title: 'Sex Distribution',
  },
};

export const CivilStatusChart: Story = {
  args: {
    type: 'civilStatus',
    data: sampleCivilStatusData,
    title: 'Civil Status Distribution',
  },
};

export const EmploymentChart: Story = {
  args: {
    type: 'employment',
    data: sampleEmploymentData,
    title: 'Employment Status Distribution',
  },
};

// Variant demonstrations
export const CompactVariant: Story = {
  args: {
    type: 'sex',
    data: sampleSexData,
    variant: 'compact',
    title: 'Compact Chart',
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact variant with reduced padding and smaller chart size.',
      },
    },
  },
};

export const DetailedVariant: Story = {
  args: {
    type: 'dependency',
    data: sampleDependencyData,
    variant: 'detailed',
    title: 'Detailed Chart with Enhanced Spacing',
  },
  parameters: {
    docs: {
      description: {
        story: 'Detailed variant with increased padding and larger chart size.',
      },
    },
  },
};

// Intent modifiers
export const PrimaryIntent: Story = {
  args: {
    type: 'civilStatus',
    data: sampleCivilStatusData,
    intent: 'primary',
    title: 'Primary Chart with Emphasis Styling',
  },
  parameters: {
    docs: {
      description: {
        story: 'Primary intent with emphasized border and shadow for dashboard highlights.',
      },
    },
  },
};

export const SecondaryIntent: Story = {
  args: {
    type: 'employment',
    data: sampleEmploymentData,
    intent: 'secondary',
    title: 'Secondary Chart with Subtle Styling',
  },
  parameters: {
    docs: {
      description: {
        story: 'Secondary intent with subtle background for supporting information.',
      },
    },
  },
};

export const EmbeddedIntent: Story = {
  args: {
    type: 'sex',
    data: sampleSexData,
    intent: 'embedded',
    title: 'Embedded Chart for Inline Usage',
  },
  parameters: {
    docs: {
      description: {
        story: 'Embedded intent with no background, border, or shadow for inline usage.',
      },
    },
  },
};

// Combined variants
export const CompactPrimary: Story = {
  args: {
    type: 'dependency',
    data: sampleDependencyData,
    variant: 'compact',
    intent: 'primary',
    title: 'Compact Primary Chart',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Combining compact variant with primary intent for emphasized but space-efficient charts.',
      },
    },
  },
};

export const DetailedSecondary: Story = {
  args: {
    type: 'civilStatus',
    data: sampleCivilStatusData,
    variant: 'detailed',
    intent: 'secondary',
    title: 'Detailed Secondary Chart',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Combining detailed variant with secondary intent for comprehensive supporting charts.',
      },
    },
  },
};

// Showcase all chart types together
export const AllChartTypes: Story = {
  render: () => (
    <div className="statistics-chart-showcase">
      <StatisticsChart
        type="dependency"
        data={sampleDependencyData}
        title="Dependency Ratio"
        variant="compact"
      />
      <StatisticsChart type="sex" data={sampleSexData} title="Sex Distribution" variant="compact" />
      <StatisticsChart
        type="civilStatus"
        data={sampleCivilStatusData}
        title="Civil Status"
        variant="compact"
      />
      <StatisticsChart
        type="employment"
        data={sampleEmploymentData}
        title="Employment Status"
        variant="compact"
      />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          'Showcase of all chart types with semantic styling demonstrating consistent design patterns.',
      },
    },
  },
};
