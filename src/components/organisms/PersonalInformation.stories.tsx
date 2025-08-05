import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import PersonalInformation, { type PersonalInformationData } from './PersonalInformation';
import { useState } from 'react';

const meta = {
  title: 'Organisms/PersonalInformation',
  component: PersonalInformation,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A comprehensive personal information form component for the RBI System. Handles basic personal details including name, birth date, sex, civil status, and citizenship information with proper validation and error handling.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
    },
  },
} satisfies Meta<typeof PersonalInformation>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default data for stories
const defaultData: PersonalInformationData = {
  firstName: '',
  middleName: '',
  lastName: '',
  extensionName: '',
  birthdate: '',
  sex: '',
  civilStatus: '',
  citizenship: '',
};

// Sample completed data
const sampleData: PersonalInformationData = {
  firstName: 'Juan',
  middleName: 'Santos',
  lastName: 'Dela Cruz',
  extensionName: 'Jr.',
  birthdate: '1985-06-15',
  sex: 'male',
  civilStatus: 'married',
  citizenship: 'filipino',
};

// Sample data with errors
const sampleErrors = {
  firstName: 'First name is required',
  lastName: 'Last name is required',
  birthdate: 'Birth date is required',
  sex: 'Please select sex',
};

export const Default: Story = {
  args: {
    value: defaultData,
    onChange: value => console.log('Changed:', value),
  },
};

export const WithErrors: Story = {
  args: {
    value: {
      firstName: '',
      middleName: '',
      lastName: '',
      extensionName: '',
      birthdate: '',
      sex: '',
      civilStatus: '',
      citizenship: '',
    },
    errors: sampleErrors,
    onChange: value => console.log('Changed:', value),
  },
};

export const Prefilled: Story = {
  args: {
    value: sampleData,
    onChange: value => console.log('Changed:', value),
  },
};

export const PartiallyFilled: Story = {
  args: {
    value: {
      firstName: 'Maria',
      middleName: 'Elena',
      lastName: 'Santos',
      extensionName: '',
      birthdate: '1990-03-22',
      sex: 'female',
      civilStatus: '',
      citizenship: '',
    },
    onChange: value => console.log('Changed:', value),
  },
};

// Interactive story
const InteractiveComponent = () => {
  const [data, setData] = useState<PersonalInformationData>(defaultData);
  const [errors, setErrors] = useState<Partial<Record<keyof PersonalInformationData, string>>>({});

  const handleChange = (newData: PersonalInformationData) => {
    setData(newData);

    // Simple validation example
    const newErrors: Partial<Record<keyof PersonalInformationData, string>> = {};

    if (!newData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!newData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!newData.birthdate) {
      newErrors.birthdate = 'Birth date is required';
    }

    if (!newData.sex) {
      newErrors.sex = 'Please select sex';
    }

    setErrors(newErrors);
  };

  const isValid = Object.keys(errors).length === 0;
  const hasRequiredFields = data.firstName && data.lastName && data.birthdate && data.sex;

  return (
    <div className="space-y-6">
      <PersonalInformation value={data} onChange={handleChange} errors={errors} />

      {/* Real-time validation display */}
      <div className="bg-background rounded-lg border border-default p-4">
        <h3 className="font-semibold text-primary mb-3">Form Status</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${hasRequiredFields ? 'bg-green-500' : 'bg-red-500'}`}
            ></span>
            <span>Required Fields: {hasRequiredFields ? 'Complete' : 'Incomplete'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${isValid ? 'bg-green-500' : 'bg-yellow-500'}`}
            ></span>
            <span>Validation: {isValid ? 'Passed' : 'Has Errors'}</span>
          </div>
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
            <h4 className="font-medium text-red-800 dark:text-red-200 text-sm mb-2">
              Validation Errors:
            </h4>
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Current data display */}
      <div className="bg-background rounded-lg border border-default p-4">
        <h3 className="font-semibold text-primary mb-3">Current Data</h3>
        <pre className="text-xs text-secondary bg-background-muted p-3 rounded overflow-x-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export const Interactive: Story = {
  render: InteractiveComponent,
};

// Different data scenarios
export const ForeignNational: Story = {
  args: {
    value: {
      firstName: 'John',
      middleName: 'Michael',
      lastName: 'Smith',
      extensionName: '',
      birthdate: '1988-12-03',
      sex: 'male',
      civilStatus: 'single',
      citizenship: 'foreign_national',
    },
    onChange: value => console.log('Changed:', value),
  },
};

export const DualCitizen: Story = {
  args: {
    value: {
      firstName: 'Sarah',
      middleName: 'Grace',
      lastName: 'Johnson-Cruz',
      extensionName: '',
      birthdate: '1992-09-18',
      sex: 'female',
      civilStatus: 'married',
      citizenship: 'dual_citizen',
    },
    onChange: value => console.log('Changed:', value),
  },
};

export const WithExtensionName: Story = {
  args: {
    value: {
      firstName: 'Roberto',
      middleName: 'Miguel',
      lastName: 'Santos',
      extensionName: 'III',
      birthdate: '1975-04-12',
      sex: 'male',
      civilStatus: 'married',
      citizenship: 'filipino',
    },
    onChange: value => console.log('Changed:', value),
  },
};

// Validation scenarios
export const ValidationScenarios: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold text-primary mb-4">Missing Required Fields</h3>
        <PersonalInformation
          value={{
            firstName: '',
            middleName: 'Optional',
            lastName: '',
            extensionName: '',
            birthdate: '',
            sex: '',
            civilStatus: 'single',
            citizenship: 'filipino',
          }}
          errors={{
            firstName: 'First name is required',
            lastName: 'Last name is required',
            birthdate: 'Birth date is required',
            sex: 'Please select sex',
          }}
          onChange={() => {}}
        />
      </div>

      <div>
        <h3 className="font-semibold text-primary mb-4">Valid Complete Form</h3>
        <PersonalInformation value={sampleData} onChange={() => {}} />
      </div>
    </div>
  ),
};

// Form integration example
const FormIntegrationComponent = () => {
  const [data, setData] = useState<PersonalInformationData>(defaultData);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    setIsSubmitted(true);
    // Simulate API call
    setTimeout(() => {
      alert('Personal information saved successfully!');
      setIsSubmitted(false);
    }, 1500);
  };

  const isComplete = data.firstName && data.lastName && data.birthdate && data.sex;

  return (
    <div className="space-y-6">
      <PersonalInformation value={data} onChange={setData} />

      <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-default">
        <div className="text-sm text-secondary">
          {isComplete
            ? '✅ All required fields completed'
            : '⚠️  Please complete all required fields'}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setData(defaultData)}
            className="px-4 py-2 text-sm font-medium text-secondary hover:text-primary border border-default rounded-md hover:bg-surface-hover transition-colors"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isComplete || isSubmitted}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-secondary disabled:cursor-not-allowed rounded-md transition-colors"
          >
            {isSubmitted ? 'Saving...' : 'Save Information'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const FormIntegration: Story = {
  render: FormIntegrationComponent,
};
