import type { Meta, StoryObj } from '@storybook/react';
import DependencyRatioPieChart from './DependencyRatioPieChart';

const meta = {
  title: 'Molecules/DependencyRatioPieChart',
  component: DependencyRatioPieChart,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A specialized pie chart for displaying dependency ratios in Filipino barangays. Shows the distribution of young dependents (0-14), working age population (15-64), and elderly dependents (65+).',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    data: {
      control: 'object',
      description: 'Dependency ratio data with counts for each age group',
    },
    title: {
      control: 'text',
      description: 'Chart title',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof DependencyRatioPieChart>;

export default meta;
type Story = StoryObj<typeof meta>;

// Typical Filipino barangay age structure
export const TypicalBarangay: Story = {
  args: {
    title: 'Age Dependency Ratio',
    data: {
      youngDependents: 856, // 30.1% (0-14 years)
      workingAge: 1704, // 59.8% (15-64 years)
      oldDependents: 287, // 10.1% (65+ years)
    },
  },
};

// Young population barangay (high birth rate area)
export const YoungPopulation: Story = {
  args: {
    title: 'High Birth Rate Area',
    data: {
      youngDependents: 1234, // 43.4%
      workingAge: 1456, // 51.2%
      oldDependents: 153, // 5.4%
    },
  },
};

// Aging barangay (many elderly residents)
export const AgingBarangay: Story = {
  args: {
    title: 'Aging Community',
    data: {
      youngDependents: 423, // 19.8%
      workingAge: 1234, // 57.8%
      oldDependents: 478, // 22.4%
    },
  },
};

// Urban professional barangay (low dependency ratio)
export const UrbanProfessional: Story = {
  args: {
    title: 'Urban Professional Area',
    data: {
      youngDependents: 345, // 17.2%
      workingAge: 1567, // 78.4%
      oldDependents: 88, // 4.4%
    },
  },
};

// Rural agricultural barangay
export const RuralAgricultural: Story = {
  args: {
    title: 'Rural Agricultural Community',
    data: {
      youngDependents: 987, // 35.2%
      workingAge: 1567, // 55.9%
      oldDependents: 249, // 8.9%
    },
  },
};

// Balanced population structure
export const BalancedPopulation: Story = {
  args: {
    title: 'Balanced Age Structure',
    data: {
      youngDependents: 567, // 25.0%
      workingAge: 1456, // 64.2%
      oldDependents: 244, // 10.8%
    },
  },
};

// Retirement community (very high elderly dependency)
export const RetirementCommunity: Story = {
  args: {
    title: 'Retirement Community',
    data: {
      youngDependents: 123, // 8.7%
      workingAge: 678, // 47.8%
      oldDependents: 615, // 43.5%
    },
  },
};

// Student town/university area (mostly working age)
export const UniversityArea: Story = {
  args: {
    title: 'University Area',
    data: {
      youngDependents: 234, // 11.7%
      workingAge: 1678, // 83.9%
      oldDependents: 88, // 4.4%
    },
  },
};

// Small island barangay (out-migration of working age)
export const IslandBarangay: Story = {
  args: {
    title: 'Island Community (Out-migration)',
    data: {
      youngDependents: 345, // 38.3%
      workingAge: 423, // 47.0%
      oldDependents: 132, // 14.7%
    },
  },
};

// Mining community (high working age population)
export const MiningCommunity: Story = {
  args: {
    title: 'Mining Community',
    data: {
      youngDependents: 456, // 22.1%
      workingAge: 1456, // 70.5%
      oldDependents: 152, // 7.4%
    },
  },
};

// OFW-dependent barangay (many left-behind dependents)
export const OFWBarangay: Story = {
  args: {
    title: 'OFW-Dependent Community',
    data: {
      youngDependents: 678, // 42.4%
      workingAge: 756, // 47.3%
      oldDependents: 165, // 10.3%
    },
  },
};

// Disaster-affected area (demographic disruption)
export const DisasterAffected: Story = {
  args: {
    title: 'Post-Disaster Demographics',
    data: {
      youngDependents: 234, // 31.2%
      workingAge: 423, // 56.3%
      oldDependents: 94, // 12.5%
    },
  },
};

// High-fertility rate scenario
export const HighFertility: Story = {
  args: {
    title: 'High Fertility Rate Area',
    data: {
      youngDependents: 1456, // 48.2%
      workingAge: 1345, // 44.5%
      oldDependents: 221, // 7.3%
    },
  },
};

// Low-fertility urban scenario
export const LowFertilityUrban: Story = {
  args: {
    title: 'Low Fertility Urban Area',
    data: {
      youngDependents: 287, // 15.6%
      workingAge: 1345, // 73.1%
      oldDependents: 207, // 11.3%
    },
  },
};

// Edge case: Only working age population
export const OnlyWorkingAge: Story = {
  args: {
    title: 'Worker Dormitory Area',
    data: {
      youngDependents: 0,
      workingAge: 1500,
      oldDependents: 0,
    },
  },
};

// Empty data
export const EmptyData: Story = {
  args: {
    title: 'No Population Data',
    data: {
      youngDependents: 0,
      workingAge: 0,
      oldDependents: 0,
    },
  },
};

// Comparative analysis - Multiple charts
export const RegionalComparison: Story = {
  render: () => (
    <div className="grid min-h-screen grid-cols-1 gap-6 bg-gray-50 p-6 md:grid-cols-2 xl:grid-cols-3">
      <DependencyRatioPieChart
        title="Metro Manila"
        data={{
          youngDependents: 456,
          workingAge: 1678,
          oldDependents: 234,
        }}
      />
      <DependencyRatioPieChart
        title="Rural Luzon"
        data={{
          youngDependents: 987,
          workingAge: 1345,
          oldDependents: 289,
        }}
      />
      <DependencyRatioPieChart
        title="Visayas Province"
        data={{
          youngDependents: 756,
          workingAge: 1234,
          oldDependents: 198,
        }}
      />
      <DependencyRatioPieChart
        title="Mindanao Rural"
        data={{
          youngDependents: 1123,
          workingAge: 1456,
          oldDependents: 167,
        }}
      />
      <DependencyRatioPieChart
        title="Island Province"
        data={{
          youngDependents: 234,
          workingAge: 345,
          oldDependents: 98,
        }}
      />
      <DependencyRatioPieChart
        title="Mountain Province"
        data={{
          youngDependents: 456,
          workingAge: 567,
          oldDependents: 234,
        }}
      />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

// Time series comparison
export const TimeSeriesComparison: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
      <DependencyRatioPieChart
        title="2020 Census"
        data={{
          youngDependents: 1023,
          workingAge: 1456,
          oldDependents: 234,
        }}
      />
      <DependencyRatioPieChart
        title="2024 Current"
        data={{
          youngDependents: 856,
          workingAge: 1704,
          oldDependents: 287,
        }}
      />
      <DependencyRatioPieChart
        title="2030 Projection"
        data={{
          youngDependents: 678,
          workingAge: 1789,
          oldDependents: 380,
        }}
      />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

// Different dependency ratio scenarios
export const DependencyScenarios: Story = {
  render: () => (
    <div className="space-y-8 p-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <DependencyRatioPieChart
          title="High Dependency (70%)"
          data={{
            youngDependents: 567, // 35%
            workingAge: 489, // 30%
            oldDependents: 567, // 35%
          }}
        />
        <DependencyRatioPieChart
          title="Low Dependency (30%)"
          data={{
            youngDependents: 243, // 15%
            workingAge: 1134, // 70%
            oldDependents: 243, // 15%
          }}
        />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <DependencyRatioPieChart
          title="Youth Bulge"
          data={{
            youngDependents: 1215, // 50%
            workingAge: 1093, // 45%
            oldDependents: 122, // 5%
          }}
        />
        <DependencyRatioPieChart
          title="Population Aging"
          data={{
            youngDependents: 243, // 10%
            workingAge: 1215, // 50%
            oldDependents: 972, // 40%
          }}
        />
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
