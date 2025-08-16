import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { BasicInformation, BasicInformationData } from './BasicInformation';

const meta = {
  title: 'Organisms/Form/Resident/PersonalInformation/FormField/BasicInformation',
  component: BasicInformation,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A comprehensive form section for collecting basic personal information including name fields, sex, civil status, and citizenship. Features responsive grid layout and complete validation support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'object' },
      description: 'Current form values for all basic information fields',
    },
    onChange: {
      action: 'changed',
      description: 'Callback when any field value changes',
    },
    errors: {
      control: { type: 'object' },
      description: 'Error messages for each field',
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof BasicInformation>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default empty state
const emptyData: BasicInformationData = {
  firstName: '',
  middleName: '',
  lastName: '',
  extensionName: '',
  sex: '',
  civilStatus: '',
  citizenship: '',
};

// Sample complete data
const sampleData: BasicInformationData = {
  firstName: 'Juan',
  middleName: 'Santos',
  lastName: 'Dela Cruz',
  extensionName: 'Jr.',
  sex: 'male',
  civilStatus: 'married',
  citizenship: 'filipino',
};

// Basic Examples
export const Default: Story = {
  args: {
    value: emptyData,
    onChange: () => {},
    errors: {},
  },
};

export const WithSampleData: Story = {
  args: {
    value: sampleData,
    onChange: () => {},
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Form filled with sample personal information data.',
      },
    },
  },
};

// Validation Examples
export const WithValidationErrors: Story = {
  args: {
    value: {
      firstName: '',
      middleName: 'Maria',
      lastName: '',
      extensionName: '',
      sex: '',
      civilStatus: 'invalid_status',
      citizenship: 'dual_citizen',
    },
    onChange: () => {},
    errors: {
      firstName: 'First name is required',
      lastName: 'Last name is required',
      sex: 'Please select a sex',
      civilStatus: 'Please select a valid civil status',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Form showing validation errors for required and invalid fields.',
      },
    },
  },
};

export const PartiallyFilled: Story = {
  args: {
    value: {
      firstName: 'Maria',
      middleName: '',
      lastName: 'Santos',
      extensionName: '',
      sex: 'female',
      civilStatus: '',
      citizenship: '',
    },
    onChange: () => {},
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Form with some fields filled, demonstrating progressive data entry.',
      },
    },
  },
};

// Specific Field Scenarios
export const OnlyRequiredFields: Story = {
  args: {
    value: {
      firstName: 'Pedro',
      middleName: '',
      lastName: 'Garcia',
      extensionName: '',
      sex: 'male',
      civilStatus: '',
      citizenship: '',
    },
    onChange: () => {},
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Form with only required fields filled (First Name, Last Name, Sex).',
      },
    },
  },
};

export const WithExtensionName: Story = {
  args: {
    value: {
      firstName: 'Jose',
      middleName: 'Rizal',
      lastName: 'Mercado',
      extensionName: 'III',
      sex: 'male',
      civilStatus: 'single',
      citizenship: 'filipino',
    },
    onChange: () => {},
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Form showing usage of extension name field (Jr., Sr., III, etc.).',
      },
    },
  },
};

// Different Civil Status Examples
export const MarriedResident: Story = {
  args: {
    value: {
      firstName: 'Ana',
      middleName: 'Luz',
      lastName: 'Reyes',
      extensionName: '',
      sex: 'female',
      civilStatus: 'married',
      citizenship: 'filipino',
    },
    onChange: () => {},
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Form for a married resident.',
      },
    },
  },
};

export const SingleResident: Story = {
  args: {
    value: {
      firstName: 'Carlos',
      middleName: 'Antonio',
      lastName: 'Mendoza',
      extensionName: '',
      sex: 'male',
      civilStatus: 'single',
      citizenship: 'filipino',
    },
    onChange: () => {},
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Form for a single resident.',
      },
    },
  },
};

export const DualCitizen: Story = {
  args: {
    value: {
      firstName: 'Isabella',
      middleName: 'Rose',
      lastName: 'Thompson',
      extensionName: '',
      sex: 'female',
      civilStatus: 'married',
      citizenship: 'dual_citizen',
    },
    onChange: () => {},
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Form for a dual citizen resident.',
      },
    },
  },
};

export const ForeignNational: Story = {
  args: {
    value: {
      firstName: 'John',
      middleName: 'William',
      lastName: 'Smith',
      extensionName: '',
      sex: 'male',
      civilStatus: 'single',
      citizenship: 'foreign_national',
    },
    onChange: () => {},
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Form for a foreign national resident.',
      },
    },
  },
};

// Interactive Examples
export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState<BasicInformationData>(emptyData);
    const [errors, setErrors] = useState<Partial<Record<keyof BasicInformationData, string>>>({});

    const handleChange = (newValue: BasicInformationData) => {
      setValue(newValue);
      
      // Clear errors for fields that now have values
      const newErrors = { ...errors };
      Object.keys(newValue).forEach(key => {
        const field = key as keyof BasicInformationData;
        if (newValue[field] && errors[field]) {
          delete newErrors[field];
        }
      });
      setErrors(newErrors);
    };

    const validate = () => {
      const newErrors: Partial<Record<keyof BasicInformationData, string>> = {};
      
      if (!value.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }
      
      if (!value.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      }
      
      if (!value.sex) {
        newErrors.sex = 'Please select a sex';
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const reset = () => {
      setValue(emptyData);
      setErrors({});
    };

    return (
      <div className="space-y-6">
        <BasicInformation
          value={value}
          onChange={handleChange}
          errors={errors}
        />
        
        <div className="flex space-x-4">
          <button
            onClick={validate}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Validate
          </button>
          <button
            onClick={reset}
            className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
          >
            Reset
          </button>
        </div>
        
        <div className="rounded bg-gray-100 p-4">
          <h4 className="font-medium">Current Values:</h4>
          <pre className="mt-2 text-sm">{JSON.stringify(value, null, 2)}</pre>
        </div>
        
        {Object.keys(errors).length > 0 && (
          <div className="rounded bg-red-100 p-4">
            <h4 className="font-medium text-red-800">Validation Errors:</h4>
            <pre className="mt-2 text-sm text-red-700">{JSON.stringify(errors, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive form with real-time validation and data display.',
      },
    },
  },
};

// Progressive Filling Example
export const ProgressiveFilling: Story = {
  render: () => {
    const [step, setStep] = useState(0);
    
    const steps = [
      { ...emptyData },
      { ...emptyData, firstName: 'Maria' },
      { ...emptyData, firstName: 'Maria', lastName: 'Santos' },
      { ...emptyData, firstName: 'Maria', lastName: 'Santos', sex: 'female' },
      { ...emptyData, firstName: 'Maria', middleName: 'Isabel', lastName: 'Santos', sex: 'female' },
      { ...emptyData, firstName: 'Maria', middleName: 'Isabel', lastName: 'Santos', sex: 'female', civilStatus: 'single' },
      { ...emptyData, firstName: 'Maria', middleName: 'Isabel', lastName: 'Santos', sex: 'female', civilStatus: 'single', citizenship: 'filipino' },
    ];

    const stepLabels = [
      'Empty Form',
      'First Name',
      'First + Last Name',
      'Add Sex',
      'Add Middle Name',
      'Add Civil Status',
      'Complete Form',
    ];

    return (
      <div className="space-y-6">
        <BasicInformation
          value={steps[step]}
          onChange={() => {}}
          errors={{}}
        />
        
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {stepLabels.map((label, index) => (
              <button
                key={index}
                onClick={() => setStep(index)}
                className={`rounded px-3 py-1 text-sm ${
                  step === index
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {index}: {label}
              </button>
            ))}
          </div>
          
          <div className="text-sm text-gray-600">
            Step {step + 1} of {steps.length}: {stepLabels[step]}
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstration of progressive form filling, step by step.',
      },
    },
  },
};

// Form Variations
export const CompactView: Story = {
  args: {
    value: sampleData,
    onChange: () => {},
    errors: {},
    className: 'max-w-2xl',
  },
  parameters: {
    docs: {
      description: {
        story: 'Form in a more compact container to show responsive behavior.',
      },
    },
  },
};

export const MobileView: Story = {
  args: {
    value: sampleData,
    onChange: () => {},
    errors: {},
    className: 'max-w-sm',
  },
  parameters: {
    docs: {
      description: {
        story: 'Form optimized for mobile viewing (single column layout).',
      },
    },
  },
};

// Field-Specific Examples
export const LongNames: Story = {
  args: {
    value: {
      firstName: 'Maria Antonia',
      middleName: 'De Los Santos',
      lastName: 'Esperanza-Gonzalez',
      extensionName: 'Sr.',
      sex: 'female',
      civilStatus: 'registered_partnership',
      citizenship: 'dual_citizen',
    },
    onChange: () => {},
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Form with longer names to test field sizing and layout.',
      },
    },
  },
};

export const MinimalData: Story = {
  args: {
    value: {
      firstName: 'Jose',
      middleName: '',
      lastName: 'Cruz',
      extensionName: '',
      sex: 'male',
      civilStatus: '',
      citizenship: '',
    },
    onChange: () => {},
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Form with minimal required data only.',
      },
    },
  },
};