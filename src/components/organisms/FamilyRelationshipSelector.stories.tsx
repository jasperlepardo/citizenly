import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import FamilyRelationshipSelector from './FamilyRelationshipSelector';

const meta: Meta<typeof FamilyRelationshipSelector> = {
  title: 'RBI Components/Organisms/FamilyRelationshipSelector',
  component: FamilyRelationshipSelector,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Component for selecting family relationship/position within a household in the RBI system. Follows Philippine family structure conventions and provides clear relationship definitions.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      description: 'Currently selected family relationship',
      control: 'select',
      options: [
        'head',
        'spouse',
        'child',
        'parent',
        'sibling',
        'grandparent',
        'grandchild',
        'in_law',
        'other_relative',
        'non_relative',
      ],
    },
    onChange: {
      description: 'Callback fired when family relationship changes',
      action: 'onChange',
    },
    disabled: {
      description: 'Whether the selector is disabled',
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

// Template component for interactive stories
const FamilyRelationshipSelectorTemplate = (args: { value: string; [key: string]: unknown }) => {
  const [value, setValue] = useState<string>(args.value);

  return (
    <FamilyRelationshipSelector
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
  render: FamilyRelationshipSelectorTemplate,
  args: {
    value: '',
    disabled: false,
  },
};

export const HouseholdHead: Story = {
  render: FamilyRelationshipSelectorTemplate,
  args: {
    value: 'head',
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Household head - the primary decision maker and provider of the household.',
      },
    },
  },
};

export const Spouse: Story = {
  render: FamilyRelationshipSelectorTemplate,
  args: {
    value: 'spouse',
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Spouse - husband or wife of the household head.',
      },
    },
  },
};

export const Child: Story = {
  render: FamilyRelationshipSelectorTemplate,
  args: {
    value: 'child',
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Child - son or daughter of the household head, including adopted children.',
      },
    },
  },
};

export const Parent: Story = {
  render: FamilyRelationshipSelectorTemplate,
  args: {
    value: 'parent',
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Parent - mother or father of the household head living in the same household.',
      },
    },
  },
};

export const Sibling: Story = {
  render: FamilyRelationshipSelectorTemplate,
  args: {
    value: 'sibling',
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Sibling - brother or sister of the household head.',
      },
    },
  },
};

export const Grandparent: Story = {
  render: FamilyRelationshipSelectorTemplate,
  args: {
    value: 'grandparent',
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Grandparent - grandmother or grandfather of the household head or spouse.',
      },
    },
  },
};

export const Grandchild: Story = {
  render: FamilyRelationshipSelectorTemplate,
  args: {
    value: 'grandchild',
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Grandchild - child of the household head's children.",
      },
    },
  },
};

export const InLaw: Story = {
  render: FamilyRelationshipSelectorTemplate,
  args: {
    value: 'in_law',
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'In-law - relatives by marriage (mother-in-law, brother-in-law, etc.).',
      },
    },
  },
};

export const OtherRelative: Story = {
  render: FamilyRelationshipSelectorTemplate,
  args: {
    value: 'other_relative',
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Other relative - cousin, nephew, niece, or other extended family member.',
      },
    },
  },
};

export const NonRelative: Story = {
  render: FamilyRelationshipSelectorTemplate,
  args: {
    value: 'non_relative',
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Non-relative - household helper, boarder, or other non-family member living in the household.',
      },
    },
  },
};

export const Disabled: Story = {
  render: FamilyRelationshipSelectorTemplate,
  args: {
    value: 'head',
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

// Interactive playground story
export const Playground: Story = {
  render: FamilyRelationshipSelectorTemplate,
  args: {
    value: '',
    disabled: false,
    className: '',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive playground to test different family relationship selections and their descriptions.',
      },
    },
  },
};
