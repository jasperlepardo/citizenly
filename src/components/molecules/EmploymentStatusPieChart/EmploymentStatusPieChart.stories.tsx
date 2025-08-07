import type { Meta, StoryObj } from '@storybook/react';
import EmploymentStatusPieChart from './EmploymentStatusPieChart';

const meta = {
  title: 'Dashboard/EmploymentStatusPieChart',
  component: EmploymentStatusPieChart,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A specialized pie chart for displaying employment status distribution in Filipino barangays. Shows breakdown of employed, unemployed, self-employed, students, retirees, homemakers, disabled, and other employment categories.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    data: {
      control: 'object',
      description: 'Employment status data with counts for each category',
    },
    title: {
      control: 'text',
      description: 'Chart title (defaults to "Employment Status")',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof EmploymentStatusPieChart>;

export default meta;
type Story = StoryObj<typeof meta>;

// Typical Filipino barangay employment distribution
export const TypicalBarangay: Story = {
  args: {
    data: {
      employed: 1234,      // 42.1%
      unemployed: 234,     // 8.0%
      selfEmployed: 456,   // 15.6%
      student: 567,        // 19.4%
      retired: 187,        // 6.4%
      homemaker: 156,      // 5.3%
      disabled: 45,        // 1.5%
      other: 50,          // 1.7%
    },
  },
};

// Urban barangay (high formal employment)
export const UrbanBarangay: Story = {
  args: {
    title: 'Employment Status - Urban Area',
    data: {
      employed: 1567,      // 52.3%
      unemployed: 178,     // 5.9%
      selfEmployed: 234,   // 7.8%
      student: 456,        // 15.2%
      retired: 234,        // 7.8%
      homemaker: 267,      // 8.9%
      disabled: 34,        // 1.1%
      other: 30,          // 1.0%
    },
  },
};

// Rural agricultural barangay (high self-employment)
export const RuralAgricultural: Story = {
  args: {
    title: 'Employment Status - Rural Agricultural',
    data: {
      employed: 567,       // 23.6%
      unemployed: 123,     // 5.1%
      selfEmployed: 987,   // 41.1% (farmers, fishermen)
      student: 456,        // 19.0%
      retired: 145,        // 6.0%
      homemaker: 98,       // 4.1%
      disabled: 23,        // 1.0%
      other: 2,           // 0.1%
    },
  },
};

// Fishing community
export const FishingCommunity: Story = {
  args: {
    title: 'Employment Status - Fishing Community',
    data: {
      employed: 234,       // 15.6%
      unemployed: 67,      // 4.5%
      selfEmployed: 789,   // 52.6% (fishermen, boat operators)
      student: 289,        // 19.3%
      retired: 87,         // 5.8%
      homemaker: 23,       // 1.5%
      disabled: 11,        // 0.7%
      other: 0,           // 0%
    },
  },
};

// Tourist destination barangay (service-oriented)
export const TouristDestination: Story = {
  args: {
    title: 'Employment Status - Tourist Area',
    data: {
      employed: 987,       // 35.2% (hotels, restaurants)
      unemployed: 178,     // 6.4%
      selfEmployed: 678,   // 24.2% (tour guides, vendors)
      student: 456,        // 16.3%
      retired: 234,        // 8.4%
      homemaker: 189,      // 6.8%
      disabled: 45,        // 1.6%
      other: 33,          // 1.1%
    },
  },
};

// Industrial barangay (factory workers)
export const IndustrialBarangay: Story = {
  args: {
    title: 'Employment Status - Industrial Zone',
    data: {
      employed: 1789,      // 58.7% (factory workers)
      unemployed: 156,     // 5.1%
      selfEmployed: 123,   // 4.0%
      student: 432,        // 14.2%
      retired: 267,        // 8.8%
      homemaker: 234,      // 7.7%
      disabled: 34,        // 1.1%
      other: 12,          // 0.4%
    },
  },
};

// High unemployment area (economic hardship)
export const HighUnemployment: Story = {
  args: {
    title: 'Employment Status - Economic Hardship Area',
    data: {
      employed: 456,       // 23.8%
      unemployed: 567,     // 29.5% (high unemployment)
      selfEmployed: 234,   // 12.2%
      student: 345,        // 18.0%
      retired: 123,        // 6.4%
      homemaker: 156,      // 8.1%
      disabled: 23,        // 1.2%
      other: 15,          // 0.8%
    },
  },
};

// University town (high student population)
export const UniversityTown: Story = {
  args: {
    title: 'Employment Status - University Town',
    data: {
      employed: 567,       // 22.1%
      unemployed: 89,      // 3.5%
      selfEmployed: 234,   // 9.1%
      student: 1345,       // 52.4% (high student population)
      retired: 156,        // 6.1%
      homemaker: 134,      // 5.2%
      disabled: 23,        // 0.9%
      other: 18,          // 0.7%
    },
  },
};

// Retirement community
export const RetirementCommunity: Story = {
  args: {
    title: 'Employment Status - Retirement Community',
    data: {
      employed: 234,       // 18.1%
      unemployed: 34,      // 2.6%
      selfEmployed: 89,    // 6.9%
      student: 67,         // 5.2%
      retired: 678,        // 52.4% (high retiree population)
      homemaker: 156,      // 12.1%
      disabled: 23,        // 1.8%
      other: 12,          // 0.9%
    },
  },
};

// OFW-dependent community (many unemployed spouses)
export const OFWDependent: Story = {
  args: {
    title: 'Employment Status - OFW-Dependent Area',
    data: {
      employed: 345,       // 19.1%
      unemployed: 123,     // 6.8%
      selfEmployed: 234,   // 13.0%
      student: 456,        // 25.3%
      retired: 89,         // 4.9%
      homemaker: 456,      // 25.3% (OFW spouses)
      disabled: 34,        // 1.9%
      other: 67,          // 3.7% (remittance-dependent)
    },
  },
};

// Mining community (male-dominated employment)
export const MiningCommunity: Story = {
  args: {
    title: 'Employment Status - Mining Community',
    data: {
      employed: 1234,      // 54.2% (miners, support staff)
      unemployed: 89,      // 3.9%
      selfEmployed: 156,   // 6.9%
      student: 345,        // 15.2%
      retired: 178,        // 7.8%
      homemaker: 234,      // 10.3%
      disabled: 23,        // 1.0%
      other: 17,          // 0.7%
    },
  },
};

// Indigenous community
export const IndigenousCommunity: Story = {
  args: {
    title: 'Employment Status - Indigenous Community',
    data: {
      employed: 123,       // 12.3%
      unemployed: 67,      // 6.7%
      selfEmployed: 456,   // 45.6% (traditional livelihoods)
      student: 234,        // 23.4%
      retired: 45,         // 4.5%
      homemaker: 67,       // 6.7%
      disabled: 8,         // 0.8%
      other: 0,           // 0%
    },
  },
};

// Post-disaster area (disrupted employment)
export const PostDisaster: Story = {
  args: {
    title: 'Employment Status - Post-Disaster Recovery',
    data: {
      employed: 234,       // 25.9%
      unemployed: 234,     // 25.9% (jobs lost)
      selfEmployed: 123,   // 13.6%
      student: 156,        // 17.3%
      retired: 67,         // 7.4%
      homemaker: 78,       // 8.6%
      disabled: 12,        // 1.3%
      other: 0,           // 0%
    },
  },
};

// High PWD population area
export const HighPWDPopulation: Story = {
  args: {
    title: 'Employment Status - Inclusive Community',
    data: {
      employed: 789,       // 35.5%
      unemployed: 134,     // 6.0%
      selfEmployed: 345,   // 15.5%
      student: 456,        // 20.5%
      retired: 234,        // 10.5%
      homemaker: 189,      // 8.5%
      disabled: 78,        // 3.5% (higher PWD representation)
      other: 0,           // 0%
    },
  },
};

// Balanced employment
export const BalancedEmployment: Story = {
  args: {
    title: 'Employment Status - Balanced Economy',
    data: {
      employed: 1000,      // 40.0%
      unemployed: 125,     // 5.0%
      selfEmployed: 375,   // 15.0%
      student: 500,        // 20.0%
      retired: 250,        // 10.0%
      homemaker: 200,      // 8.0%
      disabled: 37,        // 1.5%
      other: 13,          // 0.5%
    },
  },
};

// Edge case: Empty data
export const EmptyData: Story = {
  args: {
    title: 'Employment Status - No Data',
    data: {
      employed: 0,
      unemployed: 0,
      selfEmployed: 0,
      student: 0,
      retired: 0,
      homemaker: 0,
      disabled: 0,
      other: 0,
    },
  },
};

// Regional comparison showcase
export const RegionalComparison: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6 bg-gray-50 min-h-screen">
      <EmploymentStatusPieChart
        title="Metro Manila"
        data={{
          employed: 1567,
          unemployed: 178,
          selfEmployed: 234,
          student: 456,
          retired: 234,
          homemaker: 267,
          disabled: 34,
          other: 30,
        }}
      />
      <EmploymentStatusPieChart
        title="Rural Luzon"
        data={{
          employed: 567,
          unemployed: 123,
          selfEmployed: 987,
          student: 456,
          retired: 145,
          homemaker: 98,
          disabled: 23,
          other: 2,
        }}
      />
      <EmploymentStatusPieChart
        title="Visayas Coastal"
        data={{
          employed: 234,
          unemployed: 67,
          selfEmployed: 789,
          student: 289,
          retired: 87,
          homemaker: 23,
          disabled: 11,
          other: 0,
        }}
      />
      <EmploymentStatusPieChart
        title="Mindanao Mining"
        data={{
          employed: 1234,
          unemployed: 89,
          selfEmployed: 156,
          student: 345,
          retired: 178,
          homemaker: 234,
          disabled: 23,
          other: 17,
        }}
      />
      <EmploymentStatusPieChart
        title="Mountain Province"
        data={{
          employed: 123,
          unemployed: 67,
          selfEmployed: 456,
          student: 234,
          retired: 45,
          homemaker: 67,
          disabled: 8,
          other: 0,
        }}
      />
      <EmploymentStatusPieChart
        title="Tourist Island"
        data={{
          employed: 987,
          unemployed: 178,
          selfEmployed: 678,
          student: 456,
          retired: 234,
          homemaker: 189,
          disabled: 45,
          other: 33,
        }}
      />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

// Economic sectors comparison
export const EconomicSectors: Story = {
  render: () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
      <EmploymentStatusPieChart
        title="Service Sector Dominant"
        data={{
          employed: 1456,
          unemployed: 123,
          selfEmployed: 345,
          student: 567,
          retired: 234,
          homemaker: 189,
          disabled: 45,
          other: 23,
        }}
      />
      <EmploymentStatusPieChart
        title="Agriculture Dominant"
        data={{
          employed: 456,
          unemployed: 89,
          selfEmployed: 1234,
          student: 345,
          retired: 123,
          homemaker: 67,
          disabled: 23,
          other: 8,
        }}
      />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};