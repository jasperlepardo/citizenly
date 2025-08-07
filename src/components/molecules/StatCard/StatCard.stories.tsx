import type { Meta, StoryObj } from '@storybook/react';
import StatCard from './StatCard';

const meta = {
  title: 'Dashboard/StatCard',
  component: StatCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A single statistic display card used in barangay dashboard. Displays key metrics with optional trend indicators.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'The title/label of the statistic',
    },
    value: {
      control: 'text',
      description: 'The main statistic value to display',
    },
    trend: {
      control: 'object',
      description: 'Optional trend information with direction and percentage',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic examples with barangay demographic data
export const TotalPopulation: Story = {
  args: {
    title: 'Total Population',
    value: '2,847',
  },
};

export const TotalHouseholds: Story = {
  args: {
    title: 'Total Households',
    value: '634',
  },
};

export const RegisteredVoters: Story = {
  args: {
    title: 'Registered Voters',
    value: '1,923',
  },
};

export const SeniorCitizens: Story = {
  args: {
    title: 'Senior Citizens',
    value: '287',
  },
};

// Examples with trends
export const PopulationWithGrowth: Story = {
  args: {
    title: 'Total Population',
    value: '2,847',
    trend: {
      direction: 'up',
      percentage: 3.2,
    },
  },
};

export const UnemploymentRate: Story = {
  args: {
    title: 'Unemployment Rate',
    value: '12.4%',
    trend: {
      direction: 'down',
      percentage: 1.8,
    },
  },
};

export const LiteracyRate: Story = {
  args: {
    title: 'Literacy Rate',
    value: '94.2%',
    trend: {
      direction: 'up',
      percentage: 0.7,
    },
  },
};

export const PovertyIncidence: Story = {
  args: {
    title: 'Poverty Incidence',
    value: '18.3%',
    trend: {
      direction: 'neutral',
      percentage: 0.1,
    },
  },
};

// Different value formats
export const LargeNumber: Story = {
  args: {
    title: 'Annual Budget',
    value: '₱12.5M',
    trend: {
      direction: 'up',
      percentage: 15.3,
    },
  },
};

export const Percentage: Story = {
  args: {
    title: 'Vaccination Coverage',
    value: '87%',
    trend: {
      direction: 'up',
      percentage: 4.2,
    },
  },
};

export const Decimal: Story = {
  args: {
    title: 'Average Household Size',
    value: '4.2',
    trend: {
      direction: 'down',
      percentage: 0.3,
    },
  },
};

// Edge cases
export const ZeroValue: Story = {
  args: {
    title: 'COVID-19 Cases',
    value: '0',
    trend: {
      direction: 'down',
      percentage: 100,
    },
  },
};

export const NoTrend: Story = {
  args: {
    title: 'Established Year',
    value: '1952',
  },
};

export const VeryLongTitle: Story = {
  args: {
    title: 'Persons with Disabilities Receiving Government Assistance',
    value: '143',
    trend: {
      direction: 'up',
      percentage: 8.7,
    },
  },
};

// Multiple cards showcase
export const BarangayDashboard: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-gray-50">
      <StatCard
        title="Total Population"
        value="2,847"
        trend={{ direction: 'up', percentage: 3.2 }}
      />
      <StatCard
        title="Total Households"
        value="634"
        trend={{ direction: 'up', percentage: 2.1 }}
      />
      <StatCard
        title="Registered Voters"
        value="1,923"
        trend={{ direction: 'up', percentage: 1.8 }}
      />
      <StatCard
        title="Senior Citizens"
        value="287"
        trend={{ direction: 'up', percentage: 4.2 }}
      />
      <StatCard
        title="PWDs"
        value="45"
        trend={{ direction: 'neutral', percentage: 0.2 }}
      />
      <StatCard
        title="Out-of-School Youth"
        value="23"
        trend={{ direction: 'down', percentage: 12.5 }}
      />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

// Responsive showcase
export const ResponsiveLayout: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <StatCard
          title="Population Density"
          value="428/km²"
          trend={{ direction: 'up', percentage: 2.3 }}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title="Male"
          value="1,445"
          trend={{ direction: 'up', percentage: 3.1 }}
        />
        <StatCard
          title="Female"
          value="1,402"
          trend={{ direction: 'up', percentage: 3.3 }}
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          title="0-14 years"
          value="856"
        />
        <StatCard
          title="15-64 years"
          value="1,704"
        />
        <StatCard
          title="65+ years"
          value="287"
        />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};