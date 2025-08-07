import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import SectoralInfo, { SectoralInformation } from './SectoralInfo';

const meta: Meta<typeof SectoralInfo> = {
  title: 'RBI Components/Organisms/SectoralInfo',
  component: SectoralInfo,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Component for managing sectoral group classifications in the RBI system. Handles both auto-calculated flags (based on age, employment, education) and manual flags with comprehensive sectoral classification logic.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      description: 'Current sectoral information data',
      control: 'object',
    },
    onChange: {
      description: 'Callback fired when sectoral information changes',
      action: 'onChange',
    },
    context: {
      description: 'Context data used for auto-calculations (age, employment, education)',
      control: 'object',
    },
    disabled: {
      description: 'Whether the form is disabled',
      control: 'boolean',
    },
    className: {
      description: 'Additional CSS classes',
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default sectoral information
const defaultSectoralInfo: SectoralInformation = {
  is_labor_force: false,
  is_employed: false,
  is_unemployed: false,
  is_ofw: false,
  is_pwd: false,
  is_out_of_school_children: false,
  is_out_of_school_youth: false,
  is_senior_citizen: false,
  is_registered_senior_citizen: false,
  is_solo_parent: false,
  is_indigenous_people: false,
  is_migrant: false,
};

// Template component for interactive stories
const SectoralInfoTemplate = (
  args: Record<string, unknown> & {
    value: SectoralInformation;
    onChange?: (newValue: SectoralInformation) => void;
  }
) => {
  const [value, setValue] = useState<SectoralInformation>(args.value);

  return (
    <SectoralInfo
      {...args}
      value={value}
      onChange={newValue => {
        setValue(newValue);
        (args.onChange as ((newValue: SectoralInformation) => void) | undefined)?.(newValue);
      }}
    />
  );
};

export const Default: Story = {
  render: SectoralInfoTemplate,
  args: {
    value: defaultSectoralInfo,
    context: {
      age: 25,
      employment_status: 'unemployed_not_looking',
      highest_educational_attainment: 'high_school_graduate',
    },
    disabled: false,
  },
};

export const EmployedAdult: Story = {
  render: SectoralInfoTemplate,
  args: {
    value: defaultSectoralInfo,
    context: {
      age: 32,
      employment_status: 'employed_full_time',
      highest_educational_attainment: 'college_graduate',
    },
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Example of an employed adult showing auto-calculated labor force and employment status.',
      },
    },
  },
};

export const SeniorCitizen: Story = {
  render: SectoralInfoTemplate,
  args: {
    value: {
      ...defaultSectoralInfo,
      is_registered_senior_citizen: true,
    },
    context: {
      age: 68,
      employment_status: 'retired',
      highest_educational_attainment: 'elementary_graduate',
    },
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Example of a senior citizen (60+) with registered senior citizen status.',
      },
    },
  },
};

export const OutOfSchoolChildren: Story = {
  render: SectoralInfoTemplate,
  args: {
    value: defaultSectoralInfo,
    context: {
      age: 12,
      employment_status: undefined,
      highest_educational_attainment: undefined,
    },
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Example of out-of-school children (age 5-17, not in school) showing auto-calculation.',
      },
    },
  },
};

export const OutOfSchoolYouth: Story = {
  render: SectoralInfoTemplate,
  args: {
    value: defaultSectoralInfo,
    context: {
      age: 22,
      employment_status: 'unemployed_not_looking',
      highest_educational_attainment: 'high_school_graduate',
    },
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Example of out-of-school youth (age 18-30, not employed, not in tertiary education).',
      },
    },
  },
};

export const UnemployedActive: Story = {
  render: SectoralInfoTemplate,
  args: {
    value: defaultSectoralInfo,
    context: {
      age: 28,
      employment_status: 'unemployed_looking',
      highest_educational_attainment: 'college_graduate',
    },
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Example of unemployed person actively looking for work (labor force but unemployed).',
      },
    },
  },
};

export const MultipleSectoralGroups: Story = {
  render: SectoralInfoTemplate,
  args: {
    value: {
      ...defaultSectoralInfo,
      is_ofw: true,
      is_solo_parent: true,
      is_pwd: true,
    },
    context: {
      age: 35,
      employment_status: 'employed_full_time',
      highest_educational_attainment: 'college_graduate',
    },
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Example showing multiple manual sectoral classifications (OFW, Solo Parent, PWD) combined with auto-calculated employment status.',
      },
    },
  },
};

export const IndigenousPeoples: Story = {
  render: SectoralInfoTemplate,
  args: {
    value: {
      ...defaultSectoralInfo,
      is_indigenous_people: true,
      is_migrant: true,
    },
    context: {
      age: 45,
      employment_status: 'self_employed',
      highest_educational_attainment: 'elementary_graduate',
    },
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Example of Indigenous Peoples member who is also a migrant and self-employed.',
      },
    },
  },
};

export const SelfEmployed: Story = {
  render: SectoralInfoTemplate,
  args: {
    value: defaultSectoralInfo,
    context: {
      age: 40,
      employment_status: 'self_employed',
      highest_educational_attainment: 'vocational_graduate',
    },
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Example of self-employed resident showing labor force participation.',
      },
    },
  },
};

export const ComplexCase: Story = {
  render: SectoralInfoTemplate,
  args: {
    value: {
      ...defaultSectoralInfo,
      is_ofw: true,
      is_solo_parent: true,
      is_registered_senior_citizen: true,
    },
    context: {
      age: 62,
      employment_status: 'employed_part_time',
      highest_educational_attainment: 'high_school_graduate',
    },
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Complex case: Senior citizen OFW who is a solo parent and still working part-time.',
      },
    },
  },
};

export const ContextFromBirthdate: Story = {
  render: SectoralInfoTemplate,
  args: {
    value: defaultSectoralInfo,
    context: {
      birthdate: '1950-03-15', // Should calculate to ~74 years old
      employment_status: 'retired',
      highest_educational_attainment: 'college_graduate',
    },
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Example showing age calculation from birthdate for senior citizen classification.',
      },
    },
  },
};

export const Disabled: Story = {
  render: SectoralInfoTemplate,
  args: {
    value: {
      ...defaultSectoralInfo,
      is_employed: true,
      is_labor_force: true,
      is_ofw: true,
      is_senior_citizen: true,
      is_registered_senior_citizen: true,
    },
    context: {
      age: 65,
      employment_status: 'employed_part_time',
      highest_educational_attainment: 'college_graduate',
    },
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the component in disabled state for read-only viewing.',
      },
    },
  },
};

export const EmptyContext: Story = {
  render: SectoralInfoTemplate,
  args: {
    value: defaultSectoralInfo,
    context: {},
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Example with empty context showing how component handles missing data gracefully.',
      },
    },
  },
};

// Interactive playground story
export const Playground: Story = {
  render: SectoralInfoTemplate,
  args: {
    value: defaultSectoralInfo,
    context: {
      age: 30,
      employment_status: 'employed_full_time',
      highest_educational_attainment: 'college_graduate',
    },
    disabled: false,
    className: '',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive playground to test different sectoral classification scenarios and auto-calculation logic.',
      },
    },
  },
};
