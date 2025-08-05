import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import MigrantInformation, { MigrationInformation } from './MigrantInformation';

const meta: Meta<typeof MigrantInformation> = {
  title: 'RBI Components/Organisms/MigrantInformation',
  component: MigrantInformation,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Component for capturing detailed migration status and history information for RBI residents. Supports both domestic and international migration tracking with comprehensive data collection.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      description: 'Current migration information data',
      control: 'object',
    },
    onChange: {
      description: 'Callback fired when migration information changes',
      action: 'onChange',
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

// Default empty state
const defaultMigrationInfo: MigrationInformation = {
  is_migrant: true,
  migration_type: null,
  previous_address: '',
  migration_reason: null,
  registration_status: 'not_applicable',
};

// Template component for interactive stories
const MigrantInformationTemplate = (args: any) => {
  const [value, setValue] = useState<MigrationInformation>(args.value);

  return (
    <MigrantInformation
      {...args}
      value={value}
      onChange={newValue => {
        setValue(newValue);
        args.onChange?.(newValue);
      }}
    />
  );
};

export const Default: Story = {
  render: MigrantInformationTemplate,
  args: {
    value: defaultMigrationInfo,
    disabled: false,
  },
};

export const NonMigrant: Story = {
  render: MigrantInformationTemplate,
  args: {
    value: {
      ...defaultMigrationInfo,
      is_migrant: false,
    },
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows the component when resident is not classified as migrant. Displays informational message.',
      },
    },
  },
};

export const DomesticMigrant: Story = {
  render: MigrantInformationTemplate,
  args: {
    value: {
      is_migrant: true,
      migration_type: 'domestic',
      previous_address: 'Barangay San Antonio, Makati City, Metro Manila',
      migration_reason: 'economic',
      year_of_migration: 2020,
      length_of_stay_months: 48,
      registration_status: 'not_applicable',
    },
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Example of a domestic migrant from within the Philippines with complete information.',
      },
    },
  },
};

export const InternationalMigrant: Story = {
  render: MigrantInformationTemplate,
  args: {
    value: {
      is_migrant: true,
      migration_type: 'international',
      previous_address: '123 Main Street, Los Angeles, California',
      previous_country: 'United States',
      migration_reason: 'family_reunification',
      year_of_migration: 2019,
      length_of_stay_months: 60,
      registration_status: 'documented',
    },
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Example of an international migrant with complete documentation status.',
      },
    },
  },
};

export const DisplacementMigrant: Story = {
  render: MigrantInformationTemplate,
  args: {
    value: {
      is_migrant: true,
      migration_type: 'domestic',
      previous_address: 'Barangay Poblacion, Marawi City, Lanao del Sur',
      migration_reason: 'displacement',
      migration_reason_details:
        'Displaced due to Marawi siege in 2017. Seeking temporary refuge while rebuilding.',
      year_of_migration: 2017,
      length_of_stay_months: 84,
      registration_status: 'not_applicable',
    },
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Example of a displaced migrant with detailed circumstances. Shows the additional details field when "Other" reason is selected.',
      },
    },
  },
};

export const UndocumentedMigrant: Story = {
  render: MigrantInformationTemplate,
  args: {
    value: {
      is_migrant: true,
      migration_type: 'international',
      previous_address: 'Dhaka, Bangladesh',
      previous_country: 'Bangladesh',
      migration_reason: 'economic',
      year_of_migration: 2022,
      length_of_stay_months: 24,
      registration_status: 'undocumented',
    },
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Example of an undocumented international migrant. Shows documentation status tracking.',
      },
    },
  },
};

export const Disabled: Story = {
  render: MigrantInformationTemplate,
  args: {
    value: {
      is_migrant: true,
      migration_type: 'domestic',
      previous_address: 'Cebu City, Cebu',
      migration_reason: 'education',
      year_of_migration: 2021,
      registration_status: 'not_applicable',
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

export const MinimalInformation: Story = {
  render: MigrantInformationTemplate,
  args: {
    value: {
      is_migrant: true,
      migration_type: 'domestic',
      previous_address: 'Davao City',
      migration_reason: null,
      registration_status: 'not_applicable',
    },
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows component with minimal required information filled.',
      },
    },
  },
};

// Interactive playground story
export const Playground: Story = {
  render: MigrantInformationTemplate,
  args: {
    value: defaultMigrationInfo,
    disabled: false,
    className: '',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive playground to test different migration scenarios and field combinations.',
      },
    },
  },
};
