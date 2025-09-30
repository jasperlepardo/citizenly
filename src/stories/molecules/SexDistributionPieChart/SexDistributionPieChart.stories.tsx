import type { Meta, StoryObj } from '@storybook/react';
import SexDistributionPieChart from '@/components/molecules/SexDistributionPieChart';

const meta = {
  title: 'Molecules/SexDistributionPieChart',
  component: SexDistributionPieChart,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A specialized pie chart for displaying gender distribution in Filipino barangays. Shows the breakdown between male and female population using consistent colors that match the population pyramid.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    data: {
      control: 'object',
      description: 'Gender distribution data with male and female counts',
    },
    title: {
      control: 'text',
      description: 'Chart title (defaults to "Sex Distribution")',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof SexDistributionPieChart>;

export default meta;
type Story = StoryObj<typeof meta>;

// Balanced gender distribution (typical)
export const BalancedDistribution: Story = {
  args: {
    data: {
      male: 1445, // 50.7%
      female: 1402, // 49.3%
    },
  },
};

// Slightly male-dominated (common in some Filipino communities)
export const MaleDominated: Story = {
  args: {
    title: 'Gender Distribution - Male Majority',
    data: {
      male: 1567, // 52.1%
      female: 1443, // 47.9%
    },
  },
};

// Slightly female-dominated (common in urban areas)
export const FemaleDominated: Story = {
  args: {
    title: 'Gender Distribution - Female Majority',
    data: {
      male: 1389, // 48.2%
      female: 1493, // 51.8%
    },
  },
};

// Small barangay distribution
export const SmallBarangay: Story = {
  args: {
    title: 'Small Barangay Gender Distribution',
    data: {
      male: 287, // 49.8%
      female: 289, // 50.2%
    },
  },
};

// Large barangay distribution
export const LargeBarangay: Story = {
  args: {
    title: 'Large Barangay Gender Distribution',
    data: {
      male: 4523, // 50.3%
      female: 4456, // 49.7%
    },
  },
};

// Rural agricultural barangay (traditionally more male)
export const RuralAgricultural: Story = {
  args: {
    title: 'Rural Agricultural Area',
    data: {
      male: 1623, // 53.4%
      female: 1418, // 46.6%
    },
  },
};

// Urban residential (often more female due to domestic work)
export const UrbanResidential: Story = {
  args: {
    title: 'Urban Residential Area',
    data: {
      male: 1234, // 47.8%
      female: 1345, // 52.2%
    },
  },
};

// Fishing community (traditionally male-dominated)
export const FishingCommunity: Story = {
  args: {
    title: 'Fishing Community',
    data: {
      male: 789, // 54.2%
      female: 667, // 45.8%
    },
  },
};

// Mining community (heavily male-dominated)
export const MiningCommunity: Story = {
  args: {
    title: 'Mining Community',
    data: {
      male: 1789, // 58.7%
      female: 1256, // 41.3%
    },
  },
};

// Textile/garment industry area (female-dominated)
export const TextileIndustry: Story = {
  args: {
    title: 'Textile Industry Area',
    data: {
      male: 567, // 39.2%
      female: 879, // 60.8%
    },
  },
};

// University town (balanced but slight female majority due to education trends)
export const UniversityTown: Story = {
  args: {
    title: 'University Town',
    data: {
      male: 1234, // 48.9%
      female: 1289, // 51.1%
    },
  },
};

// Retirement community (more females due to longevity)
export const RetirementCommunity: Story = {
  args: {
    title: 'Retirement Community',
    data: {
      male: 456, // 44.7%
      female: 564, // 55.3%
    },
  },
};

// OFW-sending community (more females left behind)
export const OFWSending: Story = {
  args: {
    title: 'OFW-Sending Community',
    data: {
      male: 678, // 43.2%
      female: 892, // 56.8%
    },
  },
};

// Military/police residential area (more males)
export const MilitaryResidential: Story = {
  args: {
    title: 'Military Residential Area',
    data: {
      male: 1345, // 55.8%
      female: 1067, // 44.2%
    },
  },
};

// Hospital/healthcare worker area (more females in healthcare)
export const HealthcareArea: Story = {
  args: {
    title: 'Healthcare Worker Area',
    data: {
      male: 423, // 41.5%
      female: 596, // 58.5%
    },
  },
};

// Construction worker dormitory area (heavily male)
export const ConstructionDormitory: Story = {
  args: {
    title: 'Construction Worker Area',
    data: {
      male: 987, // 78.9%
      female: 264, // 21.1%
    },
  },
};

// Call center/BPO area (slight female majority)
export const BPOArea: Story = {
  args: {
    title: 'BPO District',
    data: {
      male: 756, // 47.3%
      female: 842, // 52.7%
    },
  },
};

// Indigenous community (typically balanced)
export const IndigenousCommunity: Story = {
  args: {
    title: 'Indigenous Community',
    data: {
      male: 234, // 50.1%
      female: 233, // 49.9%
    },
  },
};

// Tourist destination (service industry - more female)
export const TouristDestination: Story = {
  args: {
    title: 'Tourist Destination',
    data: {
      male: 892, // 46.8%
      female: 1015, // 53.2%
    },
  },
};

// Factory town (depends on industry type)
export const FactoryTown: Story = {
  args: {
    title: 'Factory Town',
    data: {
      male: 1456, // 51.3%
      female: 1382, // 48.7%
    },
  },
};

// Edge case: Only males (worker dormitory)
export const OnlyMales: Story = {
  args: {
    title: 'Male Worker Dormitory',
    data: {
      male: 500,
      female: 0,
    },
  },
};

// Edge case: Only females (rare but possible)
export const OnlyFemales: Story = {
  args: {
    title: 'Female-Only Facility',
    data: {
      male: 0,
      female: 300,
    },
  },
};

// Empty data
export const EmptyData: Story = {
  args: {
    title: 'No Population Data',
    data: {
      male: 0,
      female: 0,
    },
  },
};

// Perfect 50-50 split
export const PerfectBalance: Story = {
  args: {
    title: 'Perfect Gender Balance',
    data: {
      male: 1000, // 50.0%
      female: 1000, // 50.0%
    },
  },
};

// Regional comparison showcase
export const RegionalComparison: Story = {
  render: () => (
    <div className="grid min-h-screen grid-cols-1 gap-6 bg-gray-50 p-6 md:grid-cols-2 xl:grid-cols-4">
      <SexDistributionPieChart
        title="Metro Manila"
        data={{
          male: 1234,
          female: 1345,
        }}
      />
      <SexDistributionPieChart
        title="Rural Luzon"
        data={{
          male: 1623,
          female: 1418,
        }}
      />
      <SexDistributionPieChart
        title="Visayas Coastal"
        data={{
          male: 789,
          female: 667,
        }}
      />
      <SexDistributionPieChart
        title="Mindanao Mining"
        data={{
          male: 1789,
          female: 1256,
        }}
      />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

// Economic type comparison
export const EconomicTypeComparison: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
      <SexDistributionPieChart
        title="Agricultural"
        data={{
          male: 1623,
          female: 1418,
        }}
      />
      <SexDistributionPieChart
        title="Industrial"
        data={{
          male: 1456,
          female: 1382,
        }}
      />
      <SexDistributionPieChart
        title="Service Sector"
        data={{
          male: 892,
          female: 1015,
        }}
      />
      <SexDistributionPieChart
        title="Mining"
        data={{
          male: 1789,
          female: 1256,
        }}
      />
      <SexDistributionPieChart
        title="Tourism"
        data={{
          male: 756,
          female: 842,
        }}
      />
      <SexDistributionPieChart
        title="Mixed Economy"
        data={{
          male: 1445,
          female: 1402,
        }}
      />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

// Age-related gender patterns
export const AgeRelatedPatterns: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-3">
      <SexDistributionPieChart
        title="Young Community"
        data={{
          male: 1567,
          female: 1443,
        }}
      />
      <SexDistributionPieChart
        title="Mixed Ages"
        data={{
          male: 1445,
          female: 1402,
        }}
      />
      <SexDistributionPieChart
        title="Elderly Community"
        data={{
          male: 456,
          female: 564,
        }}
      />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

// Different population sizes
export const PopulationSizes: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-4">
      <SexDistributionPieChart
        title="Very Small (500)"
        data={{
          male: 247,
          female: 253,
        }}
      />
      <SexDistributionPieChart
        title="Small (1,500)"
        data={{
          male: 756,
          female: 744,
        }}
      />
      <SexDistributionPieChart
        title="Medium (5,000)"
        data={{
          male: 2456,
          female: 2544,
        }}
      />
      <SexDistributionPieChart
        title="Large (15,000)"
        data={{
          male: 7345,
          female: 7655,
        }}
      />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
