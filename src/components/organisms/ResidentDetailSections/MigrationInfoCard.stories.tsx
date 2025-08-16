import type { Meta, StoryObj } from '@storybook/react';
import MigrationInfoCard from './MigrationInfoCard';

const meta = {
  title: 'Organisms/ResidentDetailSections/MigrationInfoCard',
  component: MigrationInfoCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A card component that displays migration information for residents who have moved from other locations. Shows previous location, reasons for migration, duration of stay, and migration type.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    migrantInfo: {
      control: { type: 'object' },
      description: 'Migration information object containing previous location and migration details',
    },
    formatDate: {
      action: 'formatDate',
      description: 'Function to format date strings',
    },
  },
} satisfies Meta<typeof MigrationInfoCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock utility function
const mockFormatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Complete migration data
const completeMigrationData = {
  previous_barangay_code: 'Barangay San Jose',
  previous_city_municipality_code: 'Makati City',
  previous_province_code: 'Metro Manila',
  previous_region_code: 'NCR',
  reason_for_leaving: 'Job opportunity',
  date_of_transfer: '2023-06-15',
  reason_for_transferring: 'Better employment prospects',
  duration_of_stay_current_months: 18,
  is_intending_to_return: false,
  migration_type: 'Urban to Urban',
};

// Rural to urban migration
const ruralToUrbanMigration = {
  previous_barangay_code: 'Barangay Malasila',
  previous_city_municipality_code: 'San Pablo',
  previous_province_code: 'Laguna',
  previous_region_code: 'Region IV-A',
  reason_for_leaving: 'Education',
  date_of_transfer: '2022-08-01',
  reason_for_transferring: 'University studies',
  duration_of_stay_current_months: 30,
  is_intending_to_return: true,
  migration_type: 'Rural to Urban',
};

// International migration
const internationalMigration = {
  previous_barangay_code: '',
  previous_city_municipality_code: 'Dubai',
  previous_province_code: '',
  previous_region_code: 'United Arab Emirates',
  reason_for_leaving: 'End of work contract',
  date_of_transfer: '2024-01-10',
  reason_for_transferring: 'Return to Philippines',
  duration_of_stay_current_months: 11,
  is_intending_to_return: false,
  migration_type: 'International Return',
};

// Family migration
const familyMigration = {
  previous_barangay_code: 'Barangay Central',
  previous_city_municipality_code: 'Quezon City',
  previous_province_code: 'Metro Manila',
  previous_region_code: 'NCR',
  reason_for_leaving: 'Family relocation',
  date_of_transfer: '2023-12-01',
  reason_for_transferring: 'Following spouse job transfer',
  duration_of_stay_current_months: 12,
  is_intending_to_return: false,
  migration_type: 'Family Migration',
};

// Minimal migration data
const minimalMigrationData = {
  previous_barangay_code: 'Unknown',
  previous_city_municipality_code: '',
  previous_province_code: '',
  previous_region_code: '',
  reason_for_leaving: '',
  date_of_transfer: '',
  reason_for_transferring: '',
  duration_of_stay_current_months: undefined,
  is_intending_to_return: false,
  migration_type: '',
};

// Basic Examples
export const Default: Story = {
  args: {
    migrantInfo: completeMigrationData,
    formatDate: mockFormatDate,
  },
};

export const RuralToUrban: Story = {
  args: {
    migrantInfo: ruralToUrbanMigration,
    formatDate: mockFormatDate,
  },
  parameters: {
    docs: {
      description: {
        story: 'Migration from rural area to urban center for education.',
      },
    },
  },
};

export const InternationalReturn: Story = {
  args: {
    migrantInfo: internationalMigration,
    formatDate: mockFormatDate,
  },
  parameters: {
    docs: {
      description: {
        story: 'Overseas Filipino Worker returning from international employment.',
      },
    },
  },
};

export const FamilyRelocation: Story = {
  args: {
    migrantInfo: familyMigration,
    formatDate: mockFormatDate,
  },
  parameters: {
    docs: {
      description: {
        story: 'Family migration due to spouse\'s job transfer.',
      },
    },
  },
};

export const MinimalData: Story = {
  args: {
    migrantInfo: minimalMigrationData,
    formatDate: mockFormatDate,
  },
  parameters: {
    docs: {
      description: {
        story: 'Migration card with minimal information available.',
      },
    },
  },
};

export const NoMigrationInfo: Story = {
  args: {
    migrantInfo: null,
    formatDate: mockFormatDate,
  },
  parameters: {
    docs: {
      description: {
        story: 'No migration information available (card will not render).',
      },
    },
  },
};

// Migration Reasons Examples
export const MigrationReasons: Story = {
  render: () => {
    const migrationReasons = [
      {
        label: 'Employment',
        migrantInfo: {
          ...completeMigrationData,
          reason_for_leaving: 'Job opportunity',
          reason_for_transferring: 'Better salary and career growth',
        },
      },
      {
        label: 'Education',
        migrantInfo: {
          ...completeMigrationData,
          reason_for_leaving: 'Higher education',
          reason_for_transferring: 'University enrollment',
        },
      },
      {
        label: 'Family',
        migrantInfo: {
          ...completeMigrationData,
          reason_for_leaving: 'Family reasons',
          reason_for_transferring: 'Joining family members',
        },
      },
      {
        label: 'Natural Disaster',
        migrantInfo: {
          ...completeMigrationData,
          reason_for_leaving: 'Typhoon damage',
          reason_for_transferring: 'Home destroyed by natural disaster',
        },
      },
      {
        label: 'Health',
        migrantInfo: {
          ...completeMigrationData,
          reason_for_leaving: 'Medical treatment',
          reason_for_transferring: 'Access to better healthcare facilities',
        },
      },
      {
        label: 'Retirement',
        migrantInfo: {
          ...completeMigrationData,
          reason_for_leaving: 'Retirement',
          reason_for_transferring: 'Return to hometown after retirement',
        },
      },
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Common Migration Reasons</h3>
        <div className="grid gap-4">
          {migrationReasons.map((reason, index) => (
            <div key={index}>
              <h4 className="mb-2 text-sm font-medium text-gray-600">
                {reason.label}
              </h4>
              <MigrationInfoCard
                migrantInfo={reason.migrantInfo}
                formatDate={mockFormatDate}
              />
            </div>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Examples showing common reasons for migration in the Philippines.',
      },
    },
  },
};

// Migration Types
export const MigrationTypes: Story = {
  render: () => {
    const migrationTypes = [
      {
        type: 'Rural to Urban',
        description: 'From province to city',
        migrantInfo: {
          ...completeMigrationData,
          previous_province_code: 'Batangas',
          previous_city_municipality_code: 'Lipa',
          migration_type: 'Rural to Urban',
        },
      },
      {
        type: 'Urban to Rural',
        description: 'From city to province',
        migrantInfo: {
          ...completeMigrationData,
          previous_province_code: 'Metro Manila',
          previous_city_municipality_code: 'Manila',
          migration_type: 'Urban to Rural',
        },
      },
      {
        type: 'Urban to Urban',
        description: 'Between cities',
        migrantInfo: {
          ...completeMigrationData,
          previous_province_code: 'Metro Manila',
          previous_city_municipality_code: 'Makati',
          migration_type: 'Urban to Urban',
        },
      },
      {
        type: 'International',
        description: 'From abroad',
        migrantInfo: {
          ...completeMigrationData,
          previous_region_code: 'Singapore',
          previous_city_municipality_code: '',
          migration_type: 'International',
        },
      },
      {
        type: 'Inter-island',
        description: 'Between major islands',
        migrantInfo: {
          ...completeMigrationData,
          previous_province_code: 'Cebu',
          previous_region_code: 'Region VII',
          migration_type: 'Inter-island',
        },
      },
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Migration Type Classifications</h3>
        <div className="grid gap-4">
          {migrationTypes.map((type, index) => (
            <div key={index}>
              <h4 className="mb-2 text-sm font-medium text-gray-600">
                {type.type}
              </h4>
              <p className="mb-2 text-xs text-gray-500">{type.description}</p>
              <MigrationInfoCard
                migrantInfo={type.migrantInfo}
                formatDate={mockFormatDate}
              />
            </div>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Different types of migration patterns in the Philippines.',
      },
    },
  },
};

// Duration of Stay Examples
export const DurationOfStay: Story = {
  render: () => {
    const durationExamples = [
      {
        label: 'New Arrival (< 3 months)',
        migrantInfo: { ...completeMigrationData, duration_of_stay_current_months: 2 },
      },
      {
        label: 'Recent Migrant (3-6 months)',
        migrantInfo: { ...completeMigrationData, duration_of_stay_current_months: 5 },
      },
      {
        label: 'Settling In (6-12 months)',
        migrantInfo: { ...completeMigrationData, duration_of_stay_current_months: 10 },
      },
      {
        label: 'Established (1-2 years)',
        migrantInfo: { ...completeMigrationData, duration_of_stay_current_months: 18 },
      },
      {
        label: 'Long-term (2-5 years)',
        migrantInfo: { ...completeMigrationData, duration_of_stay_current_months: 36 },
      },
      {
        label: 'Permanent (5+ years)',
        migrantInfo: { ...completeMigrationData, duration_of_stay_current_months: 72 },
      },
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Duration of Stay Categories</h3>
        <div className="grid gap-4">
          {durationExamples.map((example, index) => (
            <div key={index}>
              <h4 className="mb-2 text-sm font-medium text-gray-600">
                {example.label}
              </h4>
              <MigrationInfoCard
                migrantInfo={example.migrantInfo}
                formatDate={mockFormatDate}
              />
            </div>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Different duration of stay categories for migrants.',
      },
    },
  },
};

// Return Intention Examples
export const ReturnIntention: Story = {
  render: () => {
    const returnIntentions = [
      {
        label: 'Permanent Move',
        description: 'No intention to return',
        migrantInfo: { ...completeMigrationData, is_intending_to_return: false },
      },
      {
        label: 'Temporary Stay',
        description: 'Planning to return',
        migrantInfo: { ...completeMigrationData, is_intending_to_return: true },
      },
      {
        label: 'Student Migration',
        description: 'Will return after studies',
        migrantInfo: {
          ...ruralToUrbanMigration,
          is_intending_to_return: true,
          reason_for_transferring: 'University education',
        },
      },
      {
        label: 'Work Contract',
        description: 'Will return after contract ends',
        migrantInfo: {
          ...completeMigrationData,
          is_intending_to_return: true,
          reason_for_transferring: 'Temporary work assignment',
        },
      },
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Return Intention Patterns</h3>
        <div className="grid gap-4">
          {returnIntentions.map((intention, index) => (
            <div key={index}>
              <h4 className="mb-2 text-sm font-medium text-gray-600">
                {intention.label}
              </h4>
              <p className="mb-2 text-xs text-gray-500">{intention.description}</p>
              <MigrationInfoCard
                migrantInfo={intention.migrantInfo}
                formatDate={mockFormatDate}
              />
            </div>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Different patterns of intention to return to previous location.',
      },
    },
  },
};

// OFW Migration Pattern
export const OFWMigrationPattern: Story = {
  render: () => {
    const ofwStages = [
      {
        label: 'Pre-Departure',
        migrantInfo: {
          previous_barangay_code: 'Barangay Central',
          previous_city_municipality_code: 'Manila',
          previous_province_code: 'Metro Manila',
          previous_region_code: 'NCR',
          reason_for_leaving: 'OFW deployment',
          date_of_transfer: '2020-01-15',
          reason_for_transferring: 'Work contract abroad',
          duration_of_stay_current_months: 48,
          is_intending_to_return: true,
          migration_type: 'International Labor Migration',
        },
      },
      {
        label: 'Return Migration',
        migrantInfo: {
          previous_barangay_code: '',
          previous_city_municipality_code: 'Riyadh',
          previous_province_code: '',
          previous_region_code: 'Saudi Arabia',
          reason_for_leaving: 'Contract completion',
          date_of_transfer: '2024-01-15',
          reason_for_transferring: 'End of overseas employment',
          duration_of_stay_current_months: 11,
          is_intending_to_return: false,
          migration_type: 'OFW Return',
        },
      },
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">OFW Migration Pattern</h3>
        <div className="grid gap-4">
          {ofwStages.map((stage, index) => (
            <div key={index}>
              <h4 className="mb-2 text-sm font-medium text-gray-600">
                {stage.label}
              </h4>
              <MigrationInfoCard
                migrantInfo={stage.migrantInfo}
                formatDate={mockFormatDate}
              />
            </div>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Overseas Filipino Worker migration and return patterns.',
      },
    },
  },
};

// Regional Migration
export const RegionalMigration: Story = {
  render: () => {
    const regions = [
      { code: 'NCR', name: 'National Capital Region (Metro Manila)' },
      { code: 'Region I', name: 'Ilocos Region' },
      { code: 'Region II', name: 'Cagayan Valley' },
      { code: 'Region III', name: 'Central Luzon' },
      { code: 'Region IV-A', name: 'CALABARZON' },
      { code: 'Region V', name: 'Bicol Region' },
      { code: 'Region VI', name: 'Western Visayas' },
      { code: 'Region VII', name: 'Central Visayas' },
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Inter-Regional Migration</h3>
        <div className="grid gap-4">
          {regions.slice(0, 4).map((region, index) => {
            const migrantInfo = {
              ...completeMigrationData,
              previous_region_code: region.code,
              migration_type: 'Inter-regional',
            };
            return (
              <div key={index}>
                <h4 className="mb-2 text-sm font-medium text-gray-600">
                  From: {region.name}
                </h4>
                <MigrationInfoCard
                  migrantInfo={migrantInfo}
                  formatDate={mockFormatDate}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Migration patterns between different regions of the Philippines.',
      },
    },
  },
};

// Dark Mode Example
export const DarkMode: Story = {
  args: {
    migrantInfo: completeMigrationData,
    formatDate: mockFormatDate,
  },
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#1f2937' }],
    },
    docs: {
      description: {
        story: 'Migration information card in dark mode theme.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
};