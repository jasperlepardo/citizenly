import type { Meta, StoryObj } from '@storybook/react';
import StatsCard from './StatsCard';

const meta = {
  title: 'Molecules/StatsCard',
  component: StatsCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'An enhanced statistics card with icon, trend indicators, and multiple color themes. Designed for comprehensive barangay dashboard displays.',
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
    icon: {
      description: 'React node for the icon display',
    },
    trend: {
      control: 'object',
      description: 'Optional trend information with value and direction',
    },
    description: {
      control: 'text',
      description: 'Optional description text below the value',
    },
    color: {
      control: { type: 'select' },
      options: ['primary', 'success', 'secondary', 'warning', 'danger'],
      description: 'Color theme for the card',
    },
  },
} satisfies Meta<typeof StatsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Icon components for stories
const PopulationIcon = () => (
  <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
  </svg>
);

const HouseIcon = () => (
  <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m3 12 2-2m0 0 7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const SchoolIcon = () => (
  <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
  </svg>
);

const HealthIcon = () => (
  <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const MoneyIcon = () => (
  <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
);

const JobIcon = () => (
  <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V8m8 0V6a2 2 0 00-2-2H10a2 2 0 00-2 2v2m0 0h8" />
  </svg>
);

const WarningIcon = () => (
  <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

// Basic examples with different colors and Filipino barangay data
export const TotalPopulation: Story = {
  args: {
    title: 'Kabuuang Populasyon',
    value: '2,847',
    icon: <PopulationIcon />,
    color: 'primary',
    description: 'Mga residente sa barangay',
  },
};

export const TotalHouseholds: Story = {
  args: {
    title: 'Kabuuang Pamilya',
    value: '634',
    icon: <HouseIcon />,
    color: 'secondary',
    description: 'Mga sambahayan',
  },
};

export const LiteracyRate: Story = {
  args: {
    title: 'Literacy Rate',
    value: '94.2%',
    icon: <SchoolIcon />,
    color: 'success',
    trend: {
      value: 2.1,
      isPositive: true,
    },
    description: 'Nakakabasa at nakakasulat',
  },
};

export const HealthFacilities: Story = {
  args: {
    title: 'Health Centers',
    value: '3',
    icon: <HealthIcon />,
    color: 'success',
    description: 'Mga pasilidad sa kalusugan',
  },
};

export const AverageFamilyIncome: Story = {
  args: {
    title: 'Average Family Income',
    value: '₱28,500',
    icon: <MoneyIcon />,
    color: 'primary',
    trend: {
      value: 5.3,
      isPositive: true,
    },
    description: 'Bawat buwan',
  },
};

// Examples with negative trends
export const UnemploymentRate: Story = {
  args: {
    title: 'Unemployment Rate',
    value: '12.4%',
    icon: <JobIcon />,
    color: 'warning',
    trend: {
      value: 1.8,
      isPositive: false,
    },
    description: 'Walang trabaho',
  },
};

export const PovertyIncidence: Story = {
  args: {
    title: 'Poverty Incidence',
    value: '18.3%',
    icon: <WarningIcon />,
    color: 'danger',
    trend: {
      value: 0.7,
      isPositive: false,
    },
    description: 'Mga pamilyang mahirap',
  },
};

// Without trends
export const EstablishedYear: Story = {
  args: {
    title: 'Naitatag Noong',
    value: '1952',
    icon: <HouseIcon />,
    color: 'secondary',
    description: 'Taon ng pagkakatayo',
  },
};

// Different color variations
export const PrimaryColor: Story = {
  args: {
    title: 'Registered Voters',
    value: '1,923',
    icon: <PopulationIcon />,
    color: 'primary',
    trend: {
      value: 3.2,
      isPositive: true,
    },
  },
};

export const SuccessColor: Story = {
  args: {
    title: 'Vaccination Coverage',
    value: '87%',
    icon: <HealthIcon />,
    color: 'success',
    trend: {
      value: 4.2,
      isPositive: true,
    },
  },
};

export const WarningColor: Story = {
  args: {
    title: 'Out-of-School Youth',
    value: '23',
    icon: <SchoolIcon />,
    color: 'warning',
    trend: {
      value: 2.1,
      isPositive: false,
    },
  },
};

export const DangerColor: Story = {
  args: {
    title: 'COVID-19 Active Cases',
    value: '0',
    icon: <WarningIcon />,
    color: 'danger',
    trend: {
      value: 100,
      isPositive: false,
    },
  },
};

export const SecondaryColor: Story = {
  args: {
    title: 'Barangay Officials',
    value: '15',
    icon: <PopulationIcon />,
    color: 'secondary',
    description: 'Mga opisyal ng barangay',
  },
};

// Comprehensive dashboard showcase
export const BarangayDashboard: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-gray-50 min-h-screen">
      <StatsCard
        title="Kabuuang Populasyon"
        value="2,847"
        icon={<PopulationIcon />}
        color="primary"
        trend={{ value: 3.2, isPositive: true }}
        description="Mga residente sa barangay"
      />
      <StatsCard
        title="Kabuuang Pamilya"
        value="634"
        icon={<HouseIcon />}
        color="secondary"
        trend={{ value: 2.1, isPositive: true }}
        description="Mga sambahayan"
      />
      <StatsCard
        title="Literacy Rate"
        value="94.2%"
        icon={<SchoolIcon />}
        color="success"
        trend={{ value: 1.8, isPositive: true }}
        description="Nakakabasa at nakakasulat"
      />
      <StatsCard
        title="Unemployment Rate"
        value="12.4%"
        icon={<JobIcon />}
        color="warning"
        trend={{ value: 1.5, isPositive: false }}
        description="Walang trabaho"
      />
      <StatsCard
        title="Poverty Incidence"
        value="18.3%"
        icon={<WarningIcon />}
        color="danger"
        trend={{ value: 0.7, isPositive: false }}
        description="Mga pamilyang mahirap"
      />
      <StatsCard
        title="Average Family Income"
        value="₱28,500"
        icon={<MoneyIcon />}
        color="success"
        trend={{ value: 5.3, isPositive: true }}
        description="Bawat buwan"
      />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

// Loading states (conceptual - would need loading prop in actual component)
export const LoadingState: Story = {
  args: {
    title: 'Loading Data...',
    value: '---',
    icon: <PopulationIcon />,
    color: 'primary',
    description: 'Kinukuha ang datos',
  },
};

// Error states (conceptual - would need error prop in actual component)  
export const ErrorState: Story = {
  args: {
    title: 'Data Unavailable',
    value: 'Error',
    icon: <WarningIcon />,
    color: 'danger',
    description: 'Hindi makuha ang datos',
  },
};