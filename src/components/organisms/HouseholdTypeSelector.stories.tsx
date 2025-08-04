import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import HouseholdTypeSelector from './HouseholdTypeSelector'

const meta: Meta<typeof HouseholdTypeSelector> = {
  title: 'RBI Components/Organisms/HouseholdTypeSelector',
  component: HouseholdTypeSelector,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Component for selecting household type classification in the RBI system. Provides visual household type selection with icons and descriptions following Philippine household classification standards.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      description: 'Currently selected household type',
      control: 'select',
      options: ['nuclear', 'extended', 'single_parent', 'composite', 'single_person']
    },
    onChange: {
      description: 'Callback fired when household type changes',
      action: 'onChange'
    },
    disabled: {
      description: 'Whether the selector is disabled',
      control: 'boolean'
    },
    className: {
      description: 'Additional CSS classes',
      control: 'text'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

// Template component for interactive stories
const HouseholdTypeSelectorTemplate = (args: any) => {
  const [value, setValue] = useState<string>(args.value)
  
  return (
    <HouseholdTypeSelector
      {...args}
      value={value}
      onChange={(newValue) => {
        setValue(newValue)
        args.onChange?.(newValue)
      }}
    />
  )
}

export const Default: Story = {
  render: HouseholdTypeSelectorTemplate,
  args: {
    value: '',
    disabled: false
  }
}

export const NuclearFamily: Story = {
  render: HouseholdTypeSelectorTemplate,
  args: {
    value: 'nuclear',
    disabled: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Nuclear family household - parents and their unmarried children living together.'
      }
    }
  }
}

export const ExtendedFamily: Story = {
  render: HouseholdTypeSelectorTemplate,
  args: {
    value: 'extended',
    disabled: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Extended family household - includes grandparents, aunts, uncles, or other relatives.'
      }
    }
  }
}

export const SingleParent: Story = {
  render: HouseholdTypeSelectorTemplate,
  args: {
    value: 'single_parent',
    disabled: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Single parent household - one parent with children, no spouse present.'
      }
    }
  }
}

export const CompositeFamily: Story = {
  render: HouseholdTypeSelectorTemplate,
  args: {
    value: 'composite',
    disabled: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Composite household - mix of related and unrelated individuals living together.'
      }
    }
  }
}

export const SinglePerson: Story = {
  render: HouseholdTypeSelectorTemplate,
  args: {
    value: 'single_person',
    disabled: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Single person household - individual living alone.'
      }
    }
  }
}

export const Disabled: Story = {
  render: HouseholdTypeSelectorTemplate,
  args: {
    value: 'nuclear',
    disabled: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the component in disabled state for read-only viewing.'
      }
    }
  }
}

// Interactive playground story
export const Playground: Story = {
  render: HouseholdTypeSelectorTemplate,
  args: {
    value: '',
    disabled: false,
    className: ''
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to test different household type selections and visual feedback.'
      }
    }
  }
}