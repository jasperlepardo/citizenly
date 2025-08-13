import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import ResidentStatusSelector, { ResidentStatus } from './ResidentStatusSelector';

const meta: Meta<typeof ResidentStatusSelector> = {
  title: 'Organisms/ResidentStatusSelector',
  component: ResidentStatusSelector,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Component for determining resident status classification based on Philippine legal framework. Handles voting eligibility, length of residency, legal status, and indigenous peoples identification.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      description: 'Current resident status data',
      control: 'object',
    },
    onChange: {
      description: 'Callback fired when resident status changes',
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
    residentAge: {
      description: 'Age of resident (for voting eligibility checks)',
      control: 'number',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default empty state
const defaultResidentStatus: ResidentStatus = {
  status_type: null,
  is_registered_voter: false,
  is_indigenous_member: false,
  legal_status: null,
  documentation_status: null,
};

// Template component for interactive stories
const ResidentStatusTemplate = (args: {
  value: ResidentStatus;
  onChange?: (value: ResidentStatus) => void;
  [key: string]: unknown;
}) => {
  const [value, setValue] = useState<ResidentStatus>(args.value);

  return (
    <ResidentStatusSelector
      {...args}
      value={value}
      onChange={newValue => {
        setValue(newValue);
        if (typeof args.onChange === 'function') {
          args.onChange(newValue);
        }
      }}
    />
  );
};

export const Default: Story = {
  render: ResidentStatusTemplate,
  args: {
    value: defaultResidentStatus,
    disabled: false,
    residentAge: 25,
  },
};

export const PermanentResident: Story = {
  render: ResidentStatusTemplate,
  args: {
    value: {
      status_type: 'permanent',
      length_of_residency_years: 15,
      length_of_residency_months: 6,
      is_registered_voter: true,
      voter_id_number: '1234567890123456',
      precinct_number: '0001A',
      is_indigenous_member: false,
      legal_status: 'citizen',
      documentation_status: 'complete',
    },
    disabled: false,
    residentAge: 35,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Example of a permanent resident with complete voter registration and long-term residency.',
      },
    },
  },
};

export const TemporaryResident: Story = {
  render: ResidentStatusTemplate,
  args: {
    value: {
      status_type: 'temporary',
      length_of_residency_years: 2,
      length_of_residency_months: 3,
      is_registered_voter: false,
      is_indigenous_member: false,
      legal_status: 'citizen',
      documentation_status: 'complete',
      special_circumstances:
        'Temporary assignment for work, planning to return to home province after contract ends.',
    },
    disabled: false,
    residentAge: 28,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Example of a temporary resident with specific circumstances and shorter residency period.',
      },
    },
  },
};

export const MinorResident: Story = {
  render: ResidentStatusTemplate,
  args: {
    value: {
      status_type: 'permanent',
      length_of_residency_years: 16,
      length_of_residency_months: 0,
      is_registered_voter: false,
      is_indigenous_member: false,
      legal_status: 'citizen',
      documentation_status: 'not_required',
    },
    disabled: false,
    residentAge: 16,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Example of a minor resident who is not eligible to vote (under 18). Shows voting eligibility warning.',
      },
    },
  },
};

export const IndigenousMember: Story = {
  render: ResidentStatusTemplate,
  args: {
    value: {
      status_type: 'permanent',
      length_of_residency_years: 25,
      is_registered_voter: true,
      voter_id_number: '9876543210987654',
      precinct_number: '0005C',
      is_indigenous_member: true,
      tribal_affiliation: 'Igorot',
      indigenous_community: 'Bontoc',
      legal_status: 'citizen',
      documentation_status: 'not_required',
    },
    disabled: false,
    residentAge: 42,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Example of an Indigenous Peoples member with tribal affiliation and community details.',
      },
    },
  },
};

export const ForeignResident: Story = {
  render: ResidentStatusTemplate,
  args: {
    value: {
      status_type: 'permanent',
      length_of_residency_years: 8,
      length_of_residency_months: 2,
      is_registered_voter: false,
      is_indigenous_member: false,
      legal_status: 'permanent_resident',
      documentation_status: 'complete',
      special_circumstances:
        'US citizen with permanent residence visa. Married to Filipino citizen.',
    },
    disabled: false,
    residentAge: 38,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Example of a foreign national with permanent residence status. Cannot register to vote but has complete documentation.',
      },
    },
  },
};

export const DualCitizen: Story = {
  render: ResidentStatusTemplate,
  args: {
    value: {
      status_type: 'permanent',
      length_of_residency_years: 12,
      is_registered_voter: true,
      voter_id_number: '5555666677778888',
      precinct_number: '0003B',
      is_indigenous_member: false,
      legal_status: 'dual_citizen',
      documentation_status: 'complete',
      special_circumstances:
        'Filipino-American dual citizen. Maintains both Philippine and US citizenship.',
    },
    disabled: false,
    residentAge: 45,
  },
  parameters: {
    docs: {
      description: {
        story: 'Example of a dual citizen who can vote and has complete legal documentation.',
      },
    },
  },
};

export const VisitorStatus: Story = {
  render: ResidentStatusTemplate,
  args: {
    value: {
      status_type: 'visitor',
      is_registered_voter: false,
      is_indigenous_member: false,
      legal_status: 'visitor',
      documentation_status: 'complete',
      special_circumstances: 'Tourist visiting family. Staying for 3 months on visitor visa.',
    },
    disabled: false,
    residentAge: 30,
  },
  parameters: {
    docs: {
      description: {
        story: 'Example of a visitor/tourist with temporary status. Cannot register to vote.',
      },
    },
  },
};

export const TransientResident: Story = {
  render: ResidentStatusTemplate,
  args: {
    value: {
      status_type: 'transient',
      is_registered_voter: false,
      is_indigenous_member: false,
      legal_status: 'citizen',
      documentation_status: 'incomplete',
      special_circumstances: 'Seasonal worker, stays during harvest season only. No fixed address.',
    },
    disabled: false,
    residentAge: 24,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Example of a transient resident with incomplete documentation and seasonal presence.',
      },
    },
  },
};

export const IncompleteDocumentation: Story = {
  render: ResidentStatusTemplate,
  args: {
    value: {
      status_type: 'temporary',
      length_of_residency_years: 1,
      length_of_residency_months: 8,
      is_registered_voter: false,
      is_indigenous_member: false,
      legal_status: 'temporary_resident',
      documentation_status: 'pending',
      special_circumstances:
        'Work visa renewal in process. Temporary resident permit expired, awaiting new documentation.',
    },
    disabled: false,
    residentAge: 29,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Example showing pending documentation status with special circumstances explanation.',
      },
    },
  },
};

export const Disabled: Story = {
  render: ResidentStatusTemplate,
  args: {
    value: {
      status_type: 'permanent',
      length_of_residency_years: 20,
      is_registered_voter: true,
      voter_id_number: '1111222233334444',
      precinct_number: '0007A',
      is_indigenous_member: false,
      legal_status: 'citizen',
      documentation_status: 'complete',
    },
    disabled: true,
    residentAge: 40,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the component in disabled state for read-only viewing.',
      },
    },
  },
};

// Interactive playground story
export const Playground: Story = {
  render: ResidentStatusTemplate,
  args: {
    value: defaultResidentStatus,
    disabled: false,
    residentAge: 25,
    className: '',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive playground to test different resident status combinations and voting eligibility scenarios.',
      },
    },
  },
};
