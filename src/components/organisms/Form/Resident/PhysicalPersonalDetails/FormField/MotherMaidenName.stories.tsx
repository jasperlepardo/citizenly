import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { MotherMaidenName, MotherMaidenNameData } from './MotherMaidenName';

const meta = {
  title: 'Organisms/Form/Resident/PhysicalPersonalDetails/FormField/MotherMaidenName',
  component: MotherMaidenName,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A form section for collecting mother\'s maiden name information. Used for identification and verification purposes in Filipino government forms and documents.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'object' },
      description: 'Current form values for mother\'s maiden name',
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
} satisfies Meta<typeof MotherMaidenName>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default empty state
const emptyData: MotherMaidenNameData = {
  motherMaidenFirstName: '',
  motherMaidenMiddleName: '',
  motherMaidenLastName: '',
};

// Sample complete data
const sampleData: MotherMaidenNameData = {
  motherMaidenFirstName: 'Maria',
  motherMaidenMiddleName: 'Santos',
  motherMaidenLastName: 'Reyes',
};

// Different name variations
const shortNameData: MotherMaidenNameData = {
  motherMaidenFirstName: 'Ana',
  motherMaidenMiddleName: '',
  motherMaidenLastName: 'Cruz',
};

const longNameData: MotherMaidenNameData = {
  motherMaidenFirstName: 'Maria Esperanza',
  motherMaidenMiddleName: 'De Los Santos',
  motherMaidenLastName: 'Villanueva-Garcia',
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
        story: 'Form filled with sample mother\'s maiden name information.',
      },
    },
  },
};

export const ShortNames: Story = {
  args: {
    value: shortNameData,
    onChange: () => {},
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Form with shorter names and no middle name.',
      },
    },
  },
};

export const LongNames: Story = {
  args: {
    value: longNameData,
    onChange: () => {},
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Form with longer names including compound names and multiple parts.',
      },
    },
  },
};

// Validation Examples
export const WithValidationErrors: Story = {
  args: {
    value: {
      motherMaidenFirstName: '',
      motherMaidenMiddleName: 'Santos',
      motherMaidenLastName: '',
    },
    onChange: () => {},
    errors: {
      motherMaidenFirstName: 'Mother\'s first name is required',
      motherMaidenLastName: 'Mother\'s last name is required',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Form showing validation errors for required name fields.',
      },
    },
  },
};

export const PartiallyFilled: Story = {
  args: {
    value: {
      motherMaidenFirstName: 'Carmen',
      motherMaidenMiddleName: '',
      motherMaidenLastName: 'Mendoza',
    },
    onChange: () => {},
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Form with first and last names filled, middle name optional.',
      },
    },
  },
};

// Common Filipino Names Examples
export const CommonFilipinoNames: Story = {
  render: () => {
    const [currentExample, setCurrentExample] = useState(0);
    
    const nameExamples = [
      {
        label: 'Maria Santos',
        data: { motherMaidenFirstName: 'Maria', motherMaidenMiddleName: '', motherMaidenLastName: 'Santos' },
      },
      {
        label: 'Rosa Garcia',
        data: { motherMaidenFirstName: 'Rosa', motherMaidenMiddleName: 'Cruz', motherMaidenLastName: 'Garcia' },
      },
      {
        label: 'Carmen Reyes',
        data: { motherMaidenFirstName: 'Carmen', motherMaidenMiddleName: 'Luz', motherMaidenLastName: 'Reyes' },
      },
      {
        label: 'Esperanza Dela Cruz',
        data: { motherMaidenFirstName: 'Esperanza', motherMaidenMiddleName: 'Angeles', motherMaidenLastName: 'Dela Cruz' },
      },
      {
        label: 'Teresita Villanueva',
        data: { motherMaidenFirstName: 'Teresita', motherMaidenMiddleName: 'Isabel', motherMaidenLastName: 'Villanueva' },
      },
      {
        label: 'Remedios Fernandez',
        data: { motherMaidenFirstName: 'Remedios', motherMaidenMiddleName: 'Corazon', motherMaidenLastName: 'Fernandez' },
      },
    ];

    const currentData = nameExamples[currentExample];

    return (
      <div className="space-y-6">
        <MotherMaidenName
          value={currentData.data}
          onChange={() => {}}
          errors={{}}
        />
        
        <div className="space-y-4">
          <h4 className="font-medium">Common Filipino Mother Names:</h4>
          <div className="flex flex-wrap gap-2">
            {nameExamples.map((example, index) => (
              <button
                key={example.label}
                onClick={() => setCurrentExample(index)}
                className={`rounded px-3 py-1 text-sm ${
                  currentExample === index
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {example.label}
              </button>
            ))}
          </div>
          
          <div className="rounded bg-pink-50 p-4">
            <h5 className="font-medium">Current Example: {currentData.label}</h5>
            <div className="mt-2 space-y-1 text-sm">
              <p><strong>First Name:</strong> {currentData.data.motherMaidenFirstName}</p>
              <p><strong>Middle Name:</strong> {currentData.data.motherMaidenMiddleName || 'None'}</p>
              <p><strong>Last Name:</strong> {currentData.data.motherMaidenLastName}</p>
            </div>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Examples of common Filipino mother maiden names.',
      },
    },
  },
};

// Interactive Example
export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState<MotherMaidenNameData>(emptyData);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (newValue: MotherMaidenNameData) => {
      setValue(newValue);
      
      // Clear errors for fields that now have values
      const newErrors = { ...errors };
      Object.keys(newValue).forEach(key => {
        const field = key as keyof MotherMaidenNameData;
        if (newValue[field].trim() && errors[field]) {
          delete newErrors[field];
        }
      });
      setErrors(newErrors);
    };

    const validate = () => {
      const newErrors: Record<string, string> = {};
      
      if (!value.motherMaidenFirstName.trim()) {
        newErrors.motherMaidenFirstName = 'Mother\'s first name is required';
      }
      
      if (!value.motherMaidenLastName.trim()) {
        newErrors.motherMaidenLastName = 'Mother\'s last name is required';
      }
      
      // Check for valid characters (letters, spaces, hyphens, apostrophes)
      const namePattern = /^[a-zA-Z\s\-'\.]*$/;
      
      if (value.motherMaidenFirstName && !namePattern.test(value.motherMaidenFirstName)) {
        newErrors.motherMaidenFirstName = 'First name contains invalid characters';
      }
      
      if (value.motherMaidenMiddleName && !namePattern.test(value.motherMaidenMiddleName)) {
        newErrors.motherMaidenMiddleName = 'Middle name contains invalid characters';
      }
      
      if (value.motherMaidenLastName && !namePattern.test(value.motherMaidenLastName)) {
        newErrors.motherMaidenLastName = 'Last name contains invalid characters';
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const fillSampleData = () => {
      setValue(sampleData);
      setErrors({});
    };

    const reset = () => {
      setValue(emptyData);
      setErrors({});
    };

    const generateFullName = () => {
      const { motherMaidenFirstName, motherMaidenMiddleName, motherMaidenLastName } = value;
      const parts = [motherMaidenFirstName, motherMaidenMiddleName, motherMaidenLastName].filter(part => part.trim());
      return parts.join(' ') || 'Not specified';
    };

    return (
      <div className="space-y-6">
        <MotherMaidenName
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
            onClick={fillSampleData}
            className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            Fill Sample
          </button>
          <button
            onClick={reset}
            className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
          >
            Reset
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="rounded bg-gray-100 p-4">
            <h4 className="font-medium">Full Mother's Maiden Name:</h4>
            <p className="mt-1 text-lg">{generateFullName()}</p>
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
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive form with validation and full name generation.',
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
      { ...emptyData, motherMaidenFirstName: 'Maria' },
      { ...emptyData, motherMaidenFirstName: 'Maria', motherMaidenMiddleName: 'Santos' },
      { ...emptyData, motherMaidenFirstName: 'Maria', motherMaidenMiddleName: 'Santos', motherMaidenLastName: 'Reyes' },
    ];

    const stepLabels = [
      'Empty Form',
      'Add First Name',
      'Add Middle Name',
      'Complete Name',
    ];

    return (
      <div className="space-y-6">
        <MotherMaidenName
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
        story: 'Progressive filling demonstration of mother\'s maiden name fields.',
      },
    },
  },
};

// Cultural Context Example
export const CulturalContext: Story = {
  render: () => {
    return (
      <div className="space-y-6">
        <MotherMaidenName
          value={sampleData}
          onChange={() => {}}
          errors={{}}
        />
        
        <div className="rounded bg-blue-50 p-4">
          <h4 className="font-medium">Cultural Context - Philippine Naming Conventions</h4>
          <div className="mt-2 space-y-2 text-sm">
            <p><strong>Purpose:</strong> Mother's maiden name is commonly used for identification and verification in Philippine government documents.</p>
            <p><strong>Usage:</strong> Required in birth certificates, passports, and other official documents for security purposes.</p>
            <p><strong>Format:</strong> Typically includes first name, middle name (optional), and last name before marriage.</p>
            <p><strong>Examples:</strong> Maria Santos Cruz, Carmen Luz Reyes, Esperanza Angeles Dela Cruz</p>
            <p><strong>Importance:</strong> Helps establish family lineage and prevents identity fraud in official transactions.</p>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Form with cultural context explaining the importance of mother\'s maiden name in Philippine documents.',
      },
    },
  },
};

// Different Name Patterns
export const NamePatterns: Story = {
  render: () => {
    const [currentPattern, setCurrentPattern] = useState(0);
    
    const patterns = [
      {
        label: 'Standard Format',
        data: { motherMaidenFirstName: 'Maria', motherMaidenMiddleName: 'Santos', motherMaidenLastName: 'Reyes' },
        description: 'First + Middle + Last name (most common)',
      },
      {
        label: 'No Middle Name',
        data: { motherMaidenFirstName: 'Carmen', motherMaidenMiddleName: '', motherMaidenLastName: 'Garcia' },
        description: 'First + Last name only',
      },
      {
        label: 'Compound First Name',
        data: { motherMaidenFirstName: 'Maria Carmen', motherMaidenMiddleName: 'Santos', motherMaidenLastName: 'Cruz' },
        description: 'Two-part first name',
      },
      {
        label: 'Compound Last Name',
        data: { motherMaidenFirstName: 'Rosa', motherMaidenMiddleName: 'Luz', motherMaidenLastName: 'Dela Cruz' },
        description: 'Two-part last name',
      },
      {
        label: 'Hyphenated Last Name',
        data: { motherMaidenFirstName: 'Ana', motherMaidenMiddleName: 'Isabel', motherMaidenLastName: 'Santos-Reyes' },
        description: 'Hyphenated last name',
      },
      {
        label: 'Spanish Influence',
        data: { motherMaidenFirstName: 'María Esperanza', motherMaidenMiddleName: 'De Los Santos', motherMaidenLastName: 'Villanueva' },
        description: 'Spanish-influenced naming pattern',
      },
    ];

    const currentData = patterns[currentPattern];

    return (
      <div className="space-y-6">
        <MotherMaidenName
          value={currentData.data}
          onChange={() => {}}
          errors={{}}
        />
        
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {patterns.map((pattern, index) => (
              <button
                key={pattern.label}
                onClick={() => setCurrentPattern(index)}
                className={`rounded px-3 py-1 text-sm ${
                  currentPattern === index
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {pattern.label}
              </button>
            ))}
          </div>
          
          <div className="rounded bg-purple-50 p-4">
            <h5 className="font-medium">{currentData.label}</h5>
            <p className="text-sm text-gray-600 mt-1">{currentData.description}</p>
            <div className="mt-2 space-y-1 text-sm">
              <p><strong>First:</strong> {currentData.data.motherMaidenFirstName}</p>
              <p><strong>Middle:</strong> {currentData.data.motherMaidenMiddleName || 'None'}</p>
              <p><strong>Last:</strong> {currentData.data.motherMaidenLastName}</p>
            </div>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Different naming patterns common in Philippine culture.',
      },
    },
  },
};