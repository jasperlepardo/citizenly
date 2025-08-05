import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import PhysicalCharacteristics, {
  PhysicalCharacteristics as PhysicalCharacteristicsType,
} from './PhysicalCharacteristics';

const meta: Meta<typeof PhysicalCharacteristics> = {
  title: 'RBI Components/Organisms/PhysicalCharacteristics',
  component: PhysicalCharacteristics,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Component for capturing physical characteristics and health information for RBI residents. Includes body measurements, blood type, physical features, and medical conditions with automatic BMI calculation.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      description: 'Current physical characteristics data',
      control: 'object',
    },
    onChange: {
      description: 'Callback fired when physical characteristics change',
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
const defaultPhysicalCharacteristics: PhysicalCharacteristicsType = {};

// Template component for interactive stories
const PhysicalCharacteristicsTemplate = (args: any) => {
  const [value, setValue] = useState<PhysicalCharacteristicsType>(args.value);

  return (
    <PhysicalCharacteristics
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
  render: PhysicalCharacteristicsTemplate,
  args: {
    value: defaultPhysicalCharacteristics,
    disabled: false,
  },
};

export const CompleteProfile: Story = {
  render: PhysicalCharacteristicsTemplate,
  args: {
    value: {
      height_cm: 165,
      weight_kg: 62.5,
      blood_type: 'O+',
      eye_color: 'dark_brown',
      hair_color: 'black',
      complexion: 'medium',
      distinguishing_marks: 'Small scar on left forearm, birthmark on right shoulder',
      medical_conditions: 'Mild hypertension, controlled with medication',
      allergies: 'Shellfish, peanuts',
    },
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Example with complete physical profile showing all available fields filled out.',
      },
    },
  },
};

export const BasicMeasurements: Story = {
  render: PhysicalCharacteristicsTemplate,
  args: {
    value: {
      height_cm: 170,
      weight_kg: 68.0,
      blood_type: 'A+',
    },
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows basic measurements with BMI calculation. Height: 170cm, Weight: 68kg results in BMI of 23.5 (Normal weight).',
      },
    },
  },
};

export const UnderweightBMI: Story = {
  render: PhysicalCharacteristicsTemplate,
  args: {
    value: {
      height_cm: 175,
      weight_kg: 52.0,
      blood_type: 'B+',
      eye_color: 'brown',
      hair_color: 'dark_brown',
    },
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Example showing underweight BMI classification. Height: 175cm, Weight: 52kg results in BMI of 17.0 (Underweight).',
      },
    },
  },
};

export const OverweightBMI: Story = {
  render: PhysicalCharacteristicsTemplate,
  args: {
    value: {
      height_cm: 160,
      weight_kg: 72.0,
      blood_type: 'AB+',
      complexion: 'olive',
    },
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Example showing overweight BMI classification. Height: 160cm, Weight: 72kg results in BMI of 28.1 (Overweight).',
      },
    },
  },
};

export const FilipinoComplexions: Story = {
  render: PhysicalCharacteristicsTemplate,
  args: {
    value: {
      eye_color: 'black',
      hair_color: 'black',
      complexion: 'medium',
      height_cm: 158,
      weight_kg: 55.0,
    },
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates Filipino-appropriate complexion options like Kayumanggi (medium), Moreno/Morena (olive/brown), etc.',
      },
    },
  },
};

export const MedicalConditions: Story = {
  render: PhysicalCharacteristicsTemplate,
  args: {
    value: {
      height_cm: 162,
      weight_kg: 78.0,
      blood_type: 'O-',
      medical_conditions: 'Type 2 Diabetes (controlled), Asthma',
      allergies: 'Penicillin, dust mites, cat dander',
      distinguishing_marks: 'Surgical scar on abdomen from appendectomy',
    },
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Example focusing on medical conditions, allergies, and distinguishing marks for emergency and health tracking.',
      },
    },
  },
};

export const MinimalInformation: Story = {
  render: PhysicalCharacteristicsTemplate,
  args: {
    value: {
      height_cm: 168,
      blood_type: 'A-',
    },
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows component with minimal information - just height and blood type.',
      },
    },
  },
};

export const Disabled: Story = {
  render: PhysicalCharacteristicsTemplate,
  args: {
    value: {
      height_cm: 172,
      weight_kg: 65.5,
      blood_type: 'B-',
      eye_color: 'brown',
      hair_color: 'black',
      complexion: 'fair',
      distinguishing_marks: 'Tattoo on right arm',
      medical_conditions: 'None',
      allergies: 'None known',
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

export const PrivacySensitive: Story = {
  render: PhysicalCharacteristicsTemplate,
  args: {
    value: {
      medical_conditions: 'Confidential - see medical records',
      allergies: 'Multiple drug allergies - consult physician',
    },
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Example showing privacy-sensitive medical information that might need special handling.',
      },
    },
  },
};

// Interactive playground story
export const Playground: Story = {
  render: PhysicalCharacteristicsTemplate,
  args: {
    value: defaultPhysicalCharacteristics,
    disabled: false,
    className: '',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive playground to test different physical characteristics combinations and BMI calculations.',
      },
    },
  },
};
