import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import MotherMaidenName, { MotherInformation } from './MotherMaidenName'

const meta: Meta<typeof MotherMaidenName> = {
  title: 'RBI Components/Organisms/MotherMaidenName',
  component: MotherMaidenName,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Component for capturing mother\'s maiden name and related genealogical information for RBI residents. Follows Filipino naming conventions and includes privacy protections and cultural considerations.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      description: 'Current mother information data',
      control: 'object'
    },
    onChange: {
      description: 'Callback fired when mother information changes',
      action: 'onChange'
    },
    disabled: {
      description: 'Whether the form is disabled',
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

// Default empty state
const defaultMotherInfo: MotherInformation = {
  is_unknown_mother: false,
  is_confidential: false
}

// Template component for interactive stories
const MotherMaidenNameTemplate = (args: any) => {
  const [value, setValue] = useState<MotherInformation>(args.value)
  
  return (
    <MotherMaidenName
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
  render: MotherMaidenNameTemplate,
  args: {
    value: defaultMotherInfo,
    disabled: false
  }
}

export const CompleteInformation: Story = {
  render: MotherMaidenNameTemplate,
  args: {
    value: {
      mother_first_name: 'Maria',
      mother_middle_name: 'Santos',
      mother_maiden_last_name: 'Reyes',
      mother_suffix: undefined,
      mother_is_deceased: false,
      mother_birth_year: 1965,
      mother_birthplace: 'Iloilo City, Iloilo',
      is_unknown_mother: false,
      is_confidential: false,
      notes: 'Mother is currently residing in the same barangay.'
    },
    disabled: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Example with complete mother information including advanced details like birth year and birthplace.'
      }
    }
  }
}

export const BasicInformation: Story = {
  render: MotherMaidenNameTemplate,
  args: {
    value: {
      mother_first_name: 'Rosa',
      mother_middle_name: 'Cruz',
      mother_maiden_last_name: 'Garcia',
      is_unknown_mother: false,
      is_confidential: false
    },
    disabled: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Example with basic required information - first name, middle name, and maiden last name.'
      }
    }
  }
}

export const WithSuffix: Story = {
  render: MotherMaidenNameTemplate,
  args: {
    value: {
      mother_first_name: 'Carmen',
      mother_middle_name: 'Dela',
      mother_maiden_last_name: 'Cruz',
      mother_suffix: 'Jr.',
      is_unknown_mother: false,
      is_confidential: false,
      notes: 'Named after grandmother Carmen Dela Cruz Sr.'
    },
    disabled: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Example showing mother with suffix (Jr.) - less common but possible in Filipino naming.'
      }
    }
  }
}

export const DeceasedMother: Story = {
  render: MotherMaidenNameTemplate,
  args: {
    value: {
      mother_first_name: 'Esperanza',
      mother_middle_name: 'Morales',
      mother_maiden_last_name: 'Villanueva',
      mother_is_deceased: true,
      mother_birth_year: 1958,
      mother_birthplace: 'Cebu City, Cebu',
      is_unknown_mother: false,
      is_confidential: false,
      notes: 'Passed away in 2018. Information from death certificate.'
    },
    disabled: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Example with deceased mother information showing how death status is indicated.'
      }
    }
  }
}

export const ConfidentialInformation: Story = {
  render: MotherMaidenNameTemplate,
  args: {
    value: {
      mother_first_name: 'Lourdes',
      mother_middle_name: 'Aquino',
      mother_maiden_last_name: 'Bautista',
      is_unknown_mother: false,
      is_confidential: true,
      notes: 'Information marked confidential due to family security concerns.'
    },
    disabled: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Example showing confidential information handling with privacy protection notice.'
      }
    }
  }
}

export const UnknownMother: Story = {
  render: MotherMaidenNameTemplate,
  args: {
    value: {
      is_unknown_mother: true,
      is_confidential: false,
      notes: 'Adopted child - biological mother information unavailable. Legal adoption papers on file.'
    },
    disabled: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Example for cases where mother information is unknown (adoption, abandonment, etc.).'
      }
    }
  }
}

export const MinimalInformation: Story = {
  render: MotherMaidenNameTemplate,
  args: {
    value: {
      mother_first_name: 'Ana',
      mother_maiden_last_name: 'Torres',
      is_unknown_mother: false,
      is_confidential: false
    },
    disabled: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Example with minimal required information - just first name and maiden name.'
      }
    }
  }
}

export const TraditionalFilipinoName: Story = {
  render: MotherMaidenNameTemplate,
  args: {
    value: {
      mother_first_name: 'Remedios',
      mother_middle_name: 'Delos',
      mother_maiden_last_name: 'Santos',
      mother_birth_year: 1952,
      mother_birthplace: 'Manila, Metro Manila',
      is_unknown_mother: false,
      is_confidential: false,
      notes: 'Traditional Filipino name. Known as "Medy" in the community.'
    },
    disabled: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Example with traditional Filipino name including compound middle name (Delos).'
      }
    }
  }
}

export const IncompleteInformation: Story = {
  render: MotherMaidenNameTemplate,
  args: {
    value: {
      mother_first_name: 'Gloria',
      mother_maiden_last_name: 'Mendoza',
      is_unknown_mother: false,
      is_confidential: false,
      notes: 'Middle name unknown. Mother left when resident was young. Limited information available.'
    },
    disabled: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Example with incomplete information showing how missing data is handled.'
      }
    }
  }
}

export const Disabled: Story = {
  render: MotherMaidenNameTemplate,
  args: {
    value: {
      mother_first_name: 'Patricia',
      mother_middle_name: 'Ramos',
      mother_maiden_last_name: 'Aguilar',
      mother_birth_year: 1970,
      is_unknown_mother: false,
      is_confidential: false
    },
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

export const WithSpecialCircumstances: Story = {
  render: MotherMaidenNameTemplate,
  args: {
    value: {
      mother_first_name: 'Isabella',
      mother_middle_name: 'Francisco',
      mother_maiden_last_name: 'Rodriguez',
      mother_birth_year: 1963,
      mother_birthplace: 'Zamboanga City, Zamboanga del Sur',
      is_unknown_mother: false,
      is_confidential: false,
      notes: 'Mother of mixed Filipino-Spanish heritage. Maiden name reflects Spanish ancestry. Family migrated from Spain in early 1900s.'
    },
    disabled: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Example showing special circumstances with cultural heritage notes.'
      }
    }
  }
}

// Interactive playground story
export const Playground: Story = {
  render: MotherMaidenNameTemplate,
  args: {
    value: defaultMotherInfo,
    disabled: false,
    className: ''
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to test different mother information scenarios and privacy settings.'
      }
    }
  }
}