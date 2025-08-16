import type { Meta, StoryObj } from '@storybook/react';
import SectoralInfoCard from './SectoralInfoCard';

const meta = {
  title: 'Organisms/ResidentDetailSections/SectoralInfoCard',
  component: SectoralInfoCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A card component that displays sectoral information for a resident including employment status, demographics, and special categories. Used for government programs and services targeting.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    sectoralInfo: {
      control: { type: 'object' },
      description: 'Sectoral information object containing various demographic and status indicators',
    },
  },
} satisfies Meta<typeof SectoralInfoCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Complete sectoral data - employed adult
const employedAdult = {
  is_labor_force: true,
  is_labor_force_employed: true,
  is_unemployed: false,
  is_overseas_filipino_worker: false,
  is_person_with_disability: false,
  is_out_of_school_children: false,
  is_out_of_school_youth: false,
  is_senior_citizen: false,
  is_registered_senior_citizen: false,
  is_solo_parent: false,
  is_indigenous_people: false,
  is_migrant: false,
};

// Unemployed adult
const unemployedAdult = {
  is_labor_force: true,
  is_labor_force_employed: false,
  is_unemployed: true,
  is_overseas_filipino_worker: false,
  is_person_with_disability: false,
  is_out_of_school_children: false,
  is_out_of_school_youth: false,
  is_senior_citizen: false,
  is_registered_senior_citizen: false,
  is_solo_parent: false,
  is_indigenous_people: false,
  is_migrant: false,
};

// OFW (Overseas Filipino Worker)
const ofwResident = {
  is_labor_force: true,
  is_labor_force_employed: true,
  is_unemployed: false,
  is_overseas_filipino_worker: true,
  is_person_with_disability: false,
  is_out_of_school_children: false,
  is_out_of_school_youth: false,
  is_senior_citizen: false,
  is_registered_senior_citizen: false,
  is_solo_parent: false,
  is_indigenous_people: false,
  is_migrant: true,
};

// Senior citizen
const seniorCitizen = {
  is_labor_force: false,
  is_labor_force_employed: false,
  is_unemployed: false,
  is_overseas_filipino_worker: false,
  is_person_with_disability: false,
  is_out_of_school_children: false,
  is_out_of_school_youth: false,
  is_senior_citizen: true,
  is_registered_senior_citizen: true,
  is_solo_parent: false,
  is_indigenous_people: false,
  is_migrant: false,
};

// Person with disability
const personWithDisability = {
  is_labor_force: false,
  is_labor_force_employed: false,
  is_unemployed: false,
  is_overseas_filipino_worker: false,
  is_person_with_disability: true,
  is_out_of_school_children: false,
  is_out_of_school_youth: false,
  is_senior_citizen: false,
  is_registered_senior_citizen: false,
  is_solo_parent: false,
  is_indigenous_people: false,
  is_migrant: false,
};

// Solo parent
const soloParent = {
  is_labor_force: true,
  is_labor_force_employed: true,
  is_unemployed: false,
  is_overseas_filipino_worker: false,
  is_person_with_disability: false,
  is_out_of_school_children: false,
  is_out_of_school_youth: false,
  is_senior_citizen: false,
  is_registered_senior_citizen: false,
  is_solo_parent: true,
  is_indigenous_people: false,
  is_migrant: false,
};

// Out of school youth
const outOfSchoolYouth = {
  is_labor_force: false,
  is_labor_force_employed: false,
  is_unemployed: false,
  is_overseas_filipino_worker: false,
  is_person_with_disability: false,
  is_out_of_school_children: false,
  is_out_of_school_youth: true,
  is_senior_citizen: false,
  is_registered_senior_citizen: false,
  is_solo_parent: false,
  is_indigenous_people: false,
  is_migrant: false,
};

// Indigenous person
const indigenousPerson = {
  is_labor_force: true,
  is_labor_force_employed: true,
  is_unemployed: false,
  is_overseas_filipino_worker: false,
  is_person_with_disability: false,
  is_out_of_school_children: false,
  is_out_of_school_youth: false,
  is_senior_citizen: false,
  is_registered_senior_citizen: false,
  is_solo_parent: false,
  is_indigenous_people: true,
  is_migrant: false,
};

// Multiple sectors
const multipleSectors = {
  is_labor_force: true,
  is_labor_force_employed: true,
  is_unemployed: false,
  is_overseas_filipino_worker: false,
  is_person_with_disability: true,
  is_out_of_school_children: false,
  is_out_of_school_youth: false,
  is_senior_citizen: true,
  is_registered_senior_citizen: true,
  is_solo_parent: false,
  is_indigenous_people: false,
  is_migrant: false,
};

// Basic Examples
export const Default: Story = {
  args: {
    sectoralInfo: employedAdult,
  },
};

export const UnemployedAdult: Story = {
  args: {
    sectoralInfo: unemployedAdult,
  },
  parameters: {
    docs: {
      description: {
        story: 'Sectoral information for an unemployed adult in the labor force.',
      },
    },
  },
};

export const OverseasFilipinoWorker: Story = {
  args: {
    sectoralInfo: ofwResident,
  },
  parameters: {
    docs: {
      description: {
        story: 'Sectoral information for an Overseas Filipino Worker (OFW).',
      },
    },
  },
};

export const SeniorCitizen: Story = {
  args: {
    sectoralInfo: seniorCitizen,
  },
  parameters: {
    docs: {
      description: {
        story: 'Sectoral information for a registered senior citizen.',
      },
    },
  },
};

export const PersonWithDisability: Story = {
  args: {
    sectoralInfo: personWithDisability,
  },
  parameters: {
    docs: {
      description: {
        story: 'Sectoral information for a person with disability (PWD).',
      },
    },
  },
};

export const SoloParent: Story = {
  args: {
    sectoralInfo: soloParent,
  },
  parameters: {
    docs: {
      description: {
        story: 'Sectoral information for a solo parent.',
      },
    },
  },
};

export const OutOfSchoolYouth: Story = {
  args: {
    sectoralInfo: outOfSchoolYouth,
  },
  parameters: {
    docs: {
      description: {
        story: 'Sectoral information for an out-of-school youth.',
      },
    },
  },
};

export const IndigenousPerson: Story = {
  args: {
    sectoralInfo: indigenousPerson,
  },
  parameters: {
    docs: {
      description: {
        story: 'Sectoral information for an indigenous person.',
      },
    },
  },
};

export const MultipleSectors: Story = {
  args: {
    sectoralInfo: multipleSectors,
  },
  parameters: {
    docs: {
      description: {
        story: 'Resident belonging to multiple sectors (senior citizen with disability).',
      },
    },
  },
};

export const NoSectoralInfo: Story = {
  args: {
    sectoralInfo: null,
  },
  parameters: {
    docs: {
      description: {
        story: 'No sectoral information available (card will not render).',
      },
    },
  },
};

// Employment Status Categories
export const EmploymentCategories: Story = {
  render: () => {
    const employmentStatuses = [
      {
        label: 'Employed',
        description: 'Currently working',
        sectoralInfo: {
          ...employedAdult,
          is_labor_force: true,
          is_labor_force_employed: true,
          is_unemployed: false,
        },
      },
      {
        label: 'Unemployed',
        description: 'Looking for work',
        sectoralInfo: {
          ...employedAdult,
          is_labor_force: true,
          is_labor_force_employed: false,
          is_unemployed: true,
        },
      },
      {
        label: 'Not in Labor Force',
        description: 'Student, retired, or unable to work',
        sectoralInfo: {
          ...employedAdult,
          is_labor_force: false,
          is_labor_force_employed: false,
          is_unemployed: false,
        },
      },
      {
        label: 'OFW',
        description: 'Working abroad',
        sectoralInfo: {
          ...employedAdult,
          is_labor_force: true,
          is_labor_force_employed: true,
          is_overseas_filipino_worker: true,
        },
      },
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Employment Status Categories</h3>
        <div className="grid gap-4">
          {employmentStatuses.map((status, index) => (
            <div key={index}>
              <h4 className="mb-2 text-sm font-medium text-gray-600">
                {status.label}
              </h4>
              <p className="mb-2 text-xs text-gray-500">{status.description}</p>
              <SectoralInfoCard sectoralInfo={status.sectoralInfo} />
            </div>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Different employment status categories and their classifications.',
      },
    },
  },
};

// Vulnerable Sectors
export const VulnerableSectors: Story = {
  render: () => {
    const vulnerableSectors = [
      {
        label: 'Senior Citizens',
        description: '60 years old and above',
        sectoralInfo: { ...employedAdult, is_senior_citizen: true, is_registered_senior_citizen: true },
      },
      {
        label: 'Persons with Disability',
        description: 'Physical or mental disabilities',
        sectoralInfo: { ...employedAdult, is_person_with_disability: true },
      },
      {
        label: 'Solo Parents',
        description: 'Single parents raising children alone',
        sectoralInfo: { ...employedAdult, is_solo_parent: true },
      },
      {
        label: 'Indigenous People',
        description: 'Members of indigenous communities',
        sectoralInfo: { ...employedAdult, is_indigenous_people: true },
      },
      {
        label: 'Out-of-School Youth',
        description: 'Youth not enrolled in school',
        sectoralInfo: { ...employedAdult, is_out_of_school_youth: true },
      },
      {
        label: 'Out-of-School Children',
        description: 'Children not enrolled in school',
        sectoralInfo: { ...employedAdult, is_out_of_school_children: true },
      },
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Vulnerable Sectors</h3>
        <div className="grid gap-4">
          {vulnerableSectors.map((sector, index) => (
            <div key={index}>
              <h4 className="mb-2 text-sm font-medium text-gray-600">
                {sector.label}
              </h4>
              <p className="mb-2 text-xs text-gray-500">{sector.description}</p>
              <SectoralInfoCard sectoralInfo={sector.sectoralInfo} />
            </div>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Different vulnerable sectors identified for government assistance programs.',
      },
    },
  },
};

// Age-Based Sectors
export const AgeBasedSectors: Story = {
  render: () => {
    const ageGroups = [
      {
        label: 'Child (0-14)',
        description: 'Dependent children',
        sectoralInfo: {
          ...employedAdult,
          is_labor_force: false,
          is_labor_force_employed: false,
          is_out_of_school_children: false,
        },
      },
      {
        label: 'Youth (15-24)',
        description: 'Young adults',
        sectoralInfo: {
          ...employedAdult,
          is_labor_force: true,
          is_labor_force_employed: false,
          is_out_of_school_youth: false,
        },
      },
      {
        label: 'Working Age (25-59)',
        description: 'Primary workforce',
        sectoralInfo: {
          ...employedAdult,
          is_labor_force: true,
          is_labor_force_employed: true,
        },
      },
      {
        label: 'Senior (60+)',
        description: 'Senior citizens',
        sectoralInfo: {
          ...employedAdult,
          is_labor_force: false,
          is_senior_citizen: true,
          is_registered_senior_citizen: true,
        },
      },
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Age-Based Sectoral Categories</h3>
        <div className="grid gap-4">
          {ageGroups.map((group, index) => (
            <div key={index}>
              <h4 className="mb-2 text-sm font-medium text-gray-600">
                {group.label}
              </h4>
              <p className="mb-2 text-xs text-gray-500">{group.description}</p>
              <SectoralInfoCard sectoralInfo={group.sectoralInfo} />
            </div>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Sectoral categories based on age groups and life stages.',
      },
    },
  },
};

// Government Program Eligibility
export const ProgramEligibility: Story = {
  render: () => {
    const programs = [
      {
        label: '4Ps Eligible',
        description: 'Pantawid Pamilyang Pilipino Program',
        sectoralInfo: {
          ...employedAdult,
          is_labor_force_employed: false,
          is_unemployed: true,
          is_solo_parent: true,
        },
      },
      {
        label: 'Senior Citizen Benefits',
        description: 'Discounts and pension eligible',
        sectoralInfo: {
          ...employedAdult,
          is_senior_citizen: true,
          is_registered_senior_citizen: true,
        },
      },
      {
        label: 'PWD Benefits',
        description: 'Person with Disability assistance',
        sectoralInfo: {
          ...employedAdult,
          is_person_with_disability: true,
        },
      },
      {
        label: 'Solo Parent Benefits',
        description: 'Solo Parent Welfare Act benefits',
        sectoralInfo: {
          ...employedAdult,
          is_solo_parent: true,
        },
      },
      {
        label: 'IP Programs',
        description: 'Indigenous People programs',
        sectoralInfo: {
          ...employedAdult,
          is_indigenous_people: true,
        },
      },
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Government Program Eligibility</h3>
        <div className="grid gap-4">
          {programs.map((program, index) => (
            <div key={index}>
              <h4 className="mb-2 text-sm font-medium text-gray-600">
                {program.label}
              </h4>
              <p className="mb-2 text-xs text-gray-500">{program.description}</p>
              <SectoralInfoCard sectoralInfo={program.sectoralInfo} />
            </div>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Examples showing eligibility for various government assistance programs.',
      },
    },
  },
};

// Complex Cases
export const ComplexCases: Story = {
  render: () => {
    const complexCases = [
      {
        label: 'Senior PWD',
        description: 'Senior citizen with disability',
        sectoralInfo: {
          ...employedAdult,
          is_senior_citizen: true,
          is_registered_senior_citizen: true,
          is_person_with_disability: true,
        },
      },
      {
        label: 'Solo Parent OFW',
        description: 'Solo parent working abroad',
        sectoralInfo: {
          ...employedAdult,
          is_solo_parent: true,
          is_overseas_filipino_worker: true,
          is_migrant: true,
        },
      },
      {
        label: 'Indigenous PWD',
        description: 'Indigenous person with disability',
        sectoralInfo: {
          ...employedAdult,
          is_indigenous_people: true,
          is_person_with_disability: true,
        },
      },
      {
        label: 'Unemployed Youth',
        description: 'Out-of-school unemployed youth',
        sectoralInfo: {
          ...employedAdult,
          is_unemployed: true,
          is_out_of_school_youth: true,
        },
      },
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Complex Multi-Sector Cases</h3>
        <div className="grid gap-4">
          {complexCases.map((case_, index) => (
            <div key={index}>
              <h4 className="mb-2 text-sm font-medium text-gray-600">
                {case_.label}
              </h4>
              <p className="mb-2 text-xs text-gray-500">{case_.description}</p>
              <SectoralInfoCard sectoralInfo={case_.sectoralInfo} />
            </div>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Complex cases where residents belong to multiple sectors.',
      },
    },
  },
};

// Statistical Overview
export const StatisticalOverview: Story = {
  render: () => {
    const allFalseSectors = {
      is_labor_force: false,
      is_labor_force_employed: false,
      is_unemployed: false,
      is_overseas_filipino_worker: false,
      is_person_with_disability: false,
      is_out_of_school_children: false,
      is_out_of_school_youth: false,
      is_senior_citizen: false,
      is_registered_senior_citizen: false,
      is_solo_parent: false,
      is_indigenous_people: false,
      is_migrant: false,
    };

    const allTrueSectors = {
      is_labor_force: true,
      is_labor_force_employed: true,
      is_unemployed: true,
      is_overseas_filipino_worker: true,
      is_person_with_disability: true,
      is_out_of_school_children: true,
      is_out_of_school_youth: true,
      is_senior_citizen: true,
      is_registered_senior_citizen: true,
      is_solo_parent: true,
      is_indigenous_people: true,
      is_migrant: true,
    };

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Edge Cases</h3>
        <div className="grid gap-4">
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-600">
              No Sectors (Typical Working Adult)
            </h4>
            <SectoralInfoCard sectoralInfo={allFalseSectors} />
          </div>
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-600">
              All Sectors (Testing/Demo Only)
            </h4>
            <SectoralInfoCard sectoralInfo={allTrueSectors} />
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Edge cases showing minimum and maximum sector selections.',
      },
    },
  },
};

// Dark Mode Example
export const DarkMode: Story = {
  args: {
    sectoralInfo: employedAdult,
  },
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#1f2937' }],
    },
    docs: {
      description: {
        story: 'Sectoral information card in dark mode theme.',
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